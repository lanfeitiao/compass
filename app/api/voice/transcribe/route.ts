import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOpenAIClient } from '@/lib/openai'
import { MAX_VOICE_BYTES, voiceFileExtension } from '@/lib/voice-input'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Please sign in to use voice input.' }, { status: 401 })
  }

  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  if (Number(request.headers.get('content-length')) > MAX_VOICE_BYTES + 64_000) {
    return NextResponse.json({ error: 'Recording is too large. Please try a shorter recording.' }, { status: 413 })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid audio upload.' }, { status: 400 })
  }

  const audio = form.get('audio')
  if (!(audio instanceof File) || audio.size === 0) {
    return NextResponse.json({ error: 'No audio recorded. Please try again.' }, { status: 400 })
  }
  if (audio.size > MAX_VOICE_BYTES) {
    return NextResponse.json({ error: 'Recording is too large. Please try a shorter recording.' }, { status: 413 })
  }
  const extension = voiceFileExtension(audio.type)
  if (!extension) {
    return NextResponse.json({ error: 'Unsupported recording format. Please try another browser.' }, { status: 415 })
  }
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'Voice input is unavailable right now. You can keep typing.' }, { status: 503 })
  }

  try {
    // Normalize the filename and type; never trust the uploaded filename.
    const file = new File([audio], `recording.${extension}`, { type: `audio/${extension}` })
    const transcript = await getOpenAIClient().audio.transcriptions.create(
      { file, model: 'gpt-transcribe', response_format: 'json' },
      { timeout: 45_000, maxRetries: 0, signal: request.signal },
    )
    const text = transcript.text.trim()
    if (!text) {
      return NextResponse.json({ error: 'No speech was recognized. Please try again.' }, { status: 422 })
    }
    // Audio is used only for transcription, never saved to the journal or database.
    return NextResponse.json({ text }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Could not transcribe the recording. Please retry.' }, { status: 502 })
  }
}
