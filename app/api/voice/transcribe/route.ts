import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOpenAIClient } from '@/lib/openai'
import { MAX_VOICE_BYTES, voiceFileExtension } from '@/lib/voice-input'

export const runtime = 'nodejs'
export const maxDuration = 60

function providerError(error: unknown) {
  if (typeof error !== 'object' || !error) return {}
  return {
    status: 'status' in error ? error.status : undefined,
    code: 'code' in error ? error.code : undefined,
    requestId: 'request_id' in error ? error.request_id : undefined,
  }
}

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
    const client = getOpenAIClient()
    const model = process.env.OPENAI_TRANSCRIPTION_MODEL || 'gpt-transcribe'
    const options = { timeout: 20_000, maxRetries: 0, signal: request.signal }
    let transcript
    try {
      transcript = await client.audio.transcriptions.create(
        { file, model, response_format: 'json' }, options,
      )
    } catch (error) {
      const failure = providerError(error)
      // Some projects cannot access the newer model. Retry only that failure,
      // using the same recording; never retry quota, key, or audio errors.
      if ((failure.status !== 404 && failure.code !== 'model_not_found') ||
          model === 'gpt-4o-mini-transcribe' || request.signal.aborted) throw error
      transcript = await client.audio.transcriptions.create(
        { file, model: 'gpt-4o-mini-transcribe', response_format: 'json' }, options,
      )
    }
    const text = transcript.text.trim()
    if (!text) {
      return NextResponse.json({ error: 'No speech was recognized. Please try again.' }, { status: 422 })
    }
    // Audio is used only for transcription, never saved to the journal or database.
    return NextResponse.json({ text }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const failure = providerError(error)
    // Log only diagnostic metadata, never audio, transcripts, keys, or raw messages.
    console.error('Voice transcription failed', failure)
    if ([401, 403, 404, 429].includes(Number(failure.status))) {
      return NextResponse.json({ error: 'Voice input is unavailable right now. Your text is safe; you can keep typing.' }, { status: 503 })
    }
    if (failure.status === 400) {
      return NextResponse.json({ error: 'This recording could not be read. Please discard it and record again.' }, { status: 422 })
    }
    return NextResponse.json({ error: 'Could not transcribe the recording. Please retry.' }, { status: 502 })
  }
}
