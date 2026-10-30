import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { VoiceInput } from '@/components/journal/voice-input'
import { useState } from 'react'

const stopTrack = vi.fn()
const getUserMedia = vi.fn()
const mockFetch = vi.fn()
const stream = { getTracks: () => [{ stop: stopTrack }] }

class MockMediaRecorder {
  static instances: MockMediaRecorder[] = []
  static isTypeSupported = vi.fn((type: string) => type.startsWith('audio/webm'))
  state: RecordingState = 'inactive'
  mimeType: string
  ondataavailable: ((event: { data: Blob }) => void) | null = null
  onstop: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor(_stream: unknown, options: { mimeType: string }) {
    this.mimeType = options.mimeType
    MockMediaRecorder.instances.push(this)
  }
  start() { this.state = 'recording' }
  stop() {
    this.state = 'inactive'
    this.ondataavailable?.({ data: new Blob(['recorded speech'], { type: this.mimeType }) })
    this.onstop?.()
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  MockMediaRecorder.instances = []
  MockMediaRecorder.isTypeSupported.mockImplementation((type) => type.startsWith('audio/webm'))
  vi.stubGlobal('MediaRecorder', MockMediaRecorder)
  vi.stubGlobal('fetch', mockFetch)
  Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia }, configurable: true })
  getUserMedia.mockResolvedValue(stream)
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({ text: '我想记下来。' }) })
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

async function begin() {
  fireEvent.click(screen.getByRole('button', { name: 'Start voice input' }))
  await screen.findByRole('button', { name: 'Stop recording' })
}

describe('VoiceInput', () => {
  it('records only on click, releases the mic, and returns editable text only after Stop', async () => {
    const onTranscript = vi.fn()
    const onBusyChange = vi.fn()
    render(<VoiceInput onTranscript={onTranscript} onBusyChange={onBusyChange} />)
    expect(getUserMedia).not.toHaveBeenCalled()
    await begin()
    expect(mockFetch).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Stop recording' }))
    await waitFor(() => expect(onTranscript).toHaveBeenCalledExactlyOnceWith('我想记下来。'))
    expect(stopTrack).toHaveBeenCalled()
    expect(mockFetch.mock.calls[0][1].body.get('audio').name).toBe('recording.webm')
    expect(onBusyChange).toHaveBeenLastCalledWith(false)
  })

  it('chooses MP4 when Safari does not support WebM', async () => {
    MockMediaRecorder.isTypeSupported.mockImplementation((type) => type === 'audio/mp4')
    render(<VoiceInput onTranscript={vi.fn()} onBusyChange={vi.fn()} />)
    await begin()
    fireEvent.click(screen.getByRole('button', { name: 'Stop recording' }))
    await waitFor(() => expect(mockFetch).toHaveBeenCalled())
    expect(mockFetch.mock.calls[0][1].body.get('audio').type).toBe('audio/mp4')
    expect(mockFetch.mock.calls[0][1].body.get('audio').name).toBe('recording.mp4')
  })

  it('cancels without uploading or changing the draft', async () => {
    const onTranscript = vi.fn()
    render(<VoiceInput onTranscript={onTranscript} onBusyChange={vi.fn()} />)
    await begin()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(stopTrack).toHaveBeenCalled()
    expect(mockFetch).not.toHaveBeenCalled()
    expect(onTranscript).not.toHaveBeenCalled()
  })

  it('stops a late microphone grant after cancellation', async () => {
    let grant!: (value: typeof stream) => void
    getUserMedia.mockReturnValue(new Promise((resolve) => { grant = resolve }))
    render(<VoiceInput onTranscript={vi.fn()} onBusyChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Start voice input' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await act(async () => grant(stream))
    expect(stopTrack).toHaveBeenCalled()
    expect(MockMediaRecorder.instances).toHaveLength(0)
  })

  it('ignores an old transcript after canceling and starting a new recording', async () => {
    let finishOld!: (value: unknown) => void
    mockFetch.mockReturnValueOnce(new Promise((resolve) => { finishOld = resolve }))
    const onTranscript = vi.fn()
    render(<VoiceInput onTranscript={onTranscript} onBusyChange={vi.fn()} />)
    await begin()
    fireEvent.click(screen.getByRole('button', { name: 'Stop recording' }))
    const oldSignal = mockFetch.mock.calls[0][1].signal
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(oldSignal.aborted).toBe(true)
    await begin()
    await act(async () => finishOld({ ok: true, json: async () => ({ text: 'old result' }) }))
    expect(onTranscript).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Stop recording' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Stop recording' }))
    await waitFor(() => expect(onTranscript).toHaveBeenCalledExactlyOnceWith('我想记下来。'))
  })

  it('retains failed audio for retry and does not request the microphone again', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Network unavailable'))
    const onTranscript = vi.fn()
    render(<VoiceInput onTranscript={onTranscript} onBusyChange={vi.fn()} />)
    await begin()
    fireEvent.click(screen.getByRole('button', { name: 'Stop recording' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Retry transcription' }))
    await waitFor(() => expect(onTranscript).toHaveBeenCalledOnce())
    expect(getUserMedia).toHaveBeenCalledOnce()
    expect(mockFetch.mock.calls[1][1].body.get('audio')).toBe(mockFetch.mock.calls[0][1].body.get('audio'))
  })

  it('unblocks the text draft after failure while retaining the recording for retry', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503,
      json: async () => ({ error: 'Voice input is unavailable right now.' }) })
    const onBusyChange = vi.fn()
    render(<VoiceInput onTranscript={vi.fn()} onBusyChange={onBusyChange} />)
    await begin()
    fireEvent.click(screen.getByRole('button', { name: 'Stop recording' }))
    await screen.findByRole('button', { name: 'Retry transcription' })
    expect(onBusyChange).toHaveBeenLastCalledWith(false)
    expect(screen.getByRole('alert')).toHaveTextContent('has not been added')
    expect(stopTrack).toHaveBeenCalled()
  })

  it('allows a typed draft to be saved after failure and blocks saving again during retry', async () => {
    const save = vi.fn()
    function Draft() {
      const [busy, setBusy] = useState(false)
      const [text, setText] = useState('My existing draft')
      return <>
        <textarea aria-label="Draft" value={text} onChange={(e) => setText(e.target.value)} />
        <VoiceInput onBusyChange={setBusy} onTranscript={(value) => setText((old) => `${old}\n${value}`)} />
        <button disabled={busy} onClick={() => save(text)}>Save draft</button>
      </>
    }
    mockFetch.mockRejectedValueOnce(new TypeError('Network failure'))
    render(<Draft />)
    await begin()
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Stop recording' }))
    await screen.findByRole('button', { name: 'Retry transcription' })
    const input = screen.getByLabelText('Draft')
    expect(input).toHaveValue('My existing draft')
    fireEvent.change(input, { target: { value: 'My existing draft, edited' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }))
    expect(save).toHaveBeenCalledWith('My existing draft, edited')
    mockFetch.mockReturnValueOnce(new Promise(() => {}))
    fireEvent.click(screen.getByRole('button', { name: 'Retry transcription' }))
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeEnabled()
    expect(input).toHaveValue('My existing draft, edited')
  })

  it('handles denied permission and unsupported browsers while keeping typing available', async () => {
    const onBusyChange = vi.fn()
    getUserMedia.mockRejectedValueOnce(new DOMException('Denied', 'NotAllowedError'))
    render(<VoiceInput onTranscript={vi.fn()} onBusyChange={onBusyChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Start voice input' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Microphone access was denied')
    expect(onBusyChange).toHaveBeenLastCalledWith(false)
    MockMediaRecorder.isTypeSupported.mockReturnValue(false)
    fireEvent.click(screen.getByRole('button', { name: 'Start voice input' }))
    expect(screen.getByRole('alert')).toHaveTextContent('not supported')
  })

  it('stops automatically after two minutes and transcribes', async () => {
    const onTranscript = vi.fn()
    render(<VoiceInput onTranscript={onTranscript} onBusyChange={vi.fn()} />)
    await begin()
    vi.useFakeTimers()
    // Restart so the recording timer uses the fake clock.
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    fireEvent.click(screen.getByRole('button', { name: 'Start voice input' }))
    await act(async () => {})
    await act(async () => vi.advanceTimersByTime(120_000))
    expect(onTranscript).toHaveBeenCalledOnce()
    expect(stopTrack).toHaveBeenCalled()
  })

  it('releases microphone resources on unmount and does not upload', async () => {
    const { unmount } = render(<VoiceInput onTranscript={vi.fn()} onBusyChange={vi.fn()} />)
    await begin()
    unmount()
    expect(stopTrack).toHaveBeenCalled()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('aborts an in-flight upload and ignores its result after unmount', async () => {
    let finish!: (value: unknown) => void
    mockFetch.mockReturnValueOnce(new Promise((resolve) => { finish = resolve }))
    const onTranscript = vi.fn()
    const { unmount } = render(<VoiceInput onTranscript={onTranscript} onBusyChange={vi.fn()} />)
    await begin()
    fireEvent.click(screen.getByRole('button', { name: 'Stop recording' }))
    const signal = mockFetch.mock.calls[0][1].signal
    unmount()
    expect(signal.aborted).toBe(true)
    await act(async () => finish({ ok: true, json: async () => ({ text: 'too late' }) }))
    expect(onTranscript).not.toHaveBeenCalled()
  })

  it('releases the microphone after a recording error and permits another attempt', async () => {
    render(<VoiceInput onTranscript={vi.fn()} onBusyChange={vi.fn()} />)
    await begin()
    act(() => MockMediaRecorder.instances[0].onerror?.())
    expect(stopTrack).toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Recording was interrupted')
    await begin()
    expect(MockMediaRecorder.instances).toHaveLength(2)
  })
})
