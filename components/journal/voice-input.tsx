'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { LoaderCircle, Mic, Square } from 'lucide-react'
import { MAX_VOICE_BYTES, MAX_VOICE_SECONDS, voiceFileExtension } from '@/lib/voice-input'

type Status = 'idle' | 'requesting' | 'recording' | 'transcribing' | 'failed'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  onBusyChange: (busy: boolean) => void
  disabled?: boolean
}

export function VoiceInput({ onTranscript, onBusyChange, disabled = false }: VoiceInputProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const statusRef = useRef<Status>('idle')
  const callbacks = useRef({ onTranscript, onBusyChange })
  const generation = useRef(0)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const requestRef = useRef<AbortController | null>(null)
  const audioRef = useRef<File | null>(null)

  useEffect(() => {
    callbacks.current = { onTranscript, onBusyChange }
  }, [onTranscript, onBusyChange])

  const changeStatus = useCallback((next: Status) => {
    statusRef.current = next
    setStatus(next)
    callbacks.current.onBusyChange(next !== 'idle' && next !== 'failed')
  }, [])

  const releaseMicrophone = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  const dispose = useCallback(() => {
    generation.current += 1
    requestRef.current?.abort()
    requestRef.current = null
    const recorder = recorderRef.current
    recorderRef.current = null
    if (recorder) {
      recorder.onstop = null
      recorder.ondataavailable = null
      recorder.onerror = null
      if (recorder.state !== 'inactive') recorder.stop()
    }
    releaseMicrophone()
    audioRef.current = null
  }, [releaseMicrophone])

  useEffect(() => () => dispose(), [dispose])

  function cancel() {
    dispose()
    setError(null)
    changeStatus('idle')
  }

  async function transcribe(audio: File, session: number) {
    if (session !== generation.current || requestRef.current) return
    changeStatus('transcribing')
    setError(null)
    audioRef.current = audio
    const controller = new AbortController()
    requestRef.current = controller
    const timeout = setTimeout(() => controller.abort(), 55_000)

    try {
      const form = new FormData()
      form.append('audio', audio)
      const response = await fetch('/api/voice/transcribe', {
        method: 'POST', body: form, signal: controller.signal,
      })
      if (session !== generation.current) return
      if (response.redirected || response.status === 401) {
        throw new Error('Please sign in again, then retry your recording.')
      }
      // A proxy or hosting error may return HTML rather than JSON.
      const result = await response.json().catch(() => null)
      if (session !== generation.current) return
      if (!response.ok || typeof result?.text !== 'string' || !result.text.trim()) {
        throw new Error(result?.error || 'Could not transcribe the recording. Please retry.')
      }
      callbacks.current.onTranscript(result.text.trim())
      audioRef.current = null
      changeStatus('idle')
    } catch (err) {
      if (session !== generation.current) return
      setError(controller.signal.aborted
        ? 'Transcription took too long. Please retry.'
        : err instanceof Error ? err.message : 'Could not transcribe the recording. Please retry.')
      changeStatus('failed')
    } finally {
      clearTimeout(timeout)
      if (requestRef.current === controller) requestRef.current = null
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') return
    changeStatus('transcribing')
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    recorder.stop()
  }

  async function startRecording() {
    // The ref also protects against two clicks before React has rendered.
    if (statusRef.current !== 'idle' || disabled) return
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Voice input needs a browser with microphone access on HTTPS. You can still type here.')
      return
    }
    const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm']
      .find((type) => MediaRecorder.isTypeSupported(type))
    if (!mimeType) {
      setError('Voice input is not supported in this browser. You can still type here.')
      return
    }

    const session = ++generation.current
    setError(null)
    setSeconds(0)
    changeStatus('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Permission may be granted after Cancel or after leaving the page.
      if (session !== generation.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      streamRef.current = stream
      const recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 64_000 })
      recorderRef.current = recorder
      const chunks: Blob[] = []
      let bytes = 0
      recorder.ondataavailable = (event) => {
        if (session !== generation.current || !event.data.size) return
        chunks.push(event.data)
        bytes += event.data.size
        if (bytes > MAX_VOICE_BYTES) stopRecording()
      }
      recorder.onerror = () => {
        if (session !== generation.current) return
        dispose()
        setError('Recording was interrupted. Your text is safe. Please try again.')
        changeStatus('idle')
      }
      recorder.onstop = () => {
        if (session !== generation.current) return
        recorderRef.current = null
        releaseMicrophone()
        const type = recorder.mimeType || mimeType
        const extension = voiceFileExtension(type)
        const audio = new File(chunks, `recording.${extension}`, { type })
        if (!extension || !audio.size || audio.size > MAX_VOICE_BYTES) {
          setError(audio.size > MAX_VOICE_BYTES
            ? 'Recording is too large. Please try a shorter recording.'
            : 'No usable audio recorded. Please try again.')
          changeStatus('idle')
          return
        }
        void transcribe(audio, session)
      }
      recorder.start(1000)
      changeStatus('recording')
      const startedAt = Date.now()
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAt) / 1000)
        setSeconds(Math.min(elapsed, MAX_VOICE_SECONDS))
        if (elapsed >= MAX_VOICE_SECONDS) stopRecording()
      }, 1000)
    } catch (err) {
      if (session !== generation.current) return
      dispose()
      setError((err instanceof Error || err instanceof DOMException) && err.name === 'NotAllowedError'
        ? 'Microphone access was denied. Allow it in your browser settings, or keep typing.'
        : 'Could not start the microphone. Please try again, or keep typing.')
      changeStatus('idle')
    }
  }

  const waiting = status === 'requesting' || status === 'transcribing'
  const buttonClass = 'inline-flex min-h-11 items-center justify-center gap-2 border-2 border-brown px-3 py-2 text-[11px] font-bold uppercase tracking-wide disabled:opacity-50'

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {status !== 'failed' && (
          <button
            type="button"
            aria-label={status === 'recording' ? 'Stop recording' : 'Start voice input'}
            disabled={disabled || waiting}
            onClick={status === 'recording' ? stopRecording : startRecording}
            className={`${buttonClass} ${status === 'recording' ? 'bg-terracotta text-white' : 'bg-white text-brown'}`}
          >
            {waiting ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              : status === 'recording' ? <Square aria-hidden="true" className="size-4" />
                : <Mic aria-hidden="true" className="size-4" />}
            {status === 'recording' ? 'Stop' : status === 'requesting' ? 'Microphone...' : status === 'transcribing' ? 'Transcribing...' : 'Voice input'}
          </button>
        )}
        {status === 'failed' && (
          <button type="button" disabled={disabled} className={buttonClass}
            onClick={() => { if (audioRef.current) void transcribe(audioRef.current, generation.current) }}>
            Retry transcription
          </button>
        )}
        {status !== 'idle' && (
          <button type="button" onClick={cancel} className="min-h-11 px-2 text-[11px] font-bold uppercase text-brown">
            {status === 'failed' ? 'Discard recording' : 'Cancel'}
          </button>
        )}
        <span role="status" className="text-[11px] text-muted-foreground">
          {status === 'recording'
            ? `Recording · ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')} / 2:00`
            : status === 'requesting' ? 'Allow microphone access to start.'
              : status === 'transcribing' ? 'Turning your speech into text...'
                : status === 'idle' ? 'Speak, then review the text.' : ''}
        </span>
      </div>
      {error && <p role="alert" className="text-[12px] text-terracotta">
        {error} {status === 'failed' && 'The recording has not been added to your text. You can retry it or keep editing and save your text.'}
      </p>}
    </div>
  )
}
