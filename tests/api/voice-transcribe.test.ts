// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/voice/transcribe/route'
import { MAX_VOICE_BYTES } from '@/lib/voice-input'

const { getUser, transcribe } = vi.hoisted(() => ({
  getUser: vi.fn(), transcribe: vi.fn(),
}))
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser } }),
}))
vi.mock('@/lib/openai', () => ({
  getOpenAIClient: () => ({ audio: { transcriptions: { create: transcribe } } }),
}))

function upload(type = 'audio/webm;codecs=opus', content: BlobPart = 'audio') {
  const form = new FormData()
  form.append('audio', new File([content], 'untrusted-name.webm', { type }))
  return new Request('https://compass.example/api/voice/transcribe', { method: 'POST', body: form })
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.stubEnv('OPENAI_API_KEY', 'test-key')
  getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  transcribe.mockResolvedValue({ text: '  今天我想记录一下。 Today felt good.  ' })
})

describe('voice transcription endpoint', () => {
  it('requires a signed-in user before parsing audio or calling OpenAI', async () => {
    getUser.mockResolvedValue({ data: { user: null } })
    const response = await POST(upload())
    expect(response.status).toBe(401)
    expect(transcribe).not.toHaveBeenCalled()
  })

  it.each(['audio/webm;codecs=opus', 'audio/mp4;codecs=mp4a.40.2', 'audio/x-m4a'])(
    'transcribes %s using a server-selected model and normalized file', async (type) => {
      const response = await POST(upload(type))
      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({ text: '今天我想记录一下。 Today felt good.' })
      expect(response.headers.get('Cache-Control')).toBe('no-store')
      const [params, options] = transcribe.mock.calls[0]
      expect(params.model).toBe('gpt-transcribe')
      expect(params.file.name).toBe(type.startsWith('audio/webm') ? 'recording.webm' : 'recording.mp4')
      expect(options).toMatchObject({ timeout: 20_000, maxRetries: 0 })
      expect(params).not.toHaveProperty('language')
    },
  )

  it('rejects cross-origin requests', async () => {
    const request = upload()
    request.headers.set('Origin', 'https://other.example')
    expect((await POST(request)).status).toBe(403)
    expect(transcribe).not.toHaveBeenCalled()
  })

  it.each([
    ['audio/webm', '', 400],
    ['text/plain', 'not audio', 415],
    ['audio/webm', new Uint8Array(MAX_VOICE_BYTES + 1), 413],
  ] as const)('rejects invalid audio (%s, status %i)', async (type, content, status) => {
    expect((await POST(upload(type, content))).status).toBe(status)
    expect(transcribe).not.toHaveBeenCalled()
  })

  it('rejects malformed and missing uploads', async () => {
    const malformed = new Request('https://compass.example/api/voice/transcribe', { method: 'POST', body: 'bad' })
    expect((await POST(malformed)).status).toBe(400)
    const empty = new Request('https://compass.example/api/voice/transcribe', { method: 'POST', body: new FormData() })
    expect((await POST(empty)).status).toBe(400)
    expect(transcribe).not.toHaveBeenCalled()
  })

  it('fails gracefully when transcription is not configured', async () => {
    vi.stubEnv('OPENAI_API_KEY', '')
    expect((await POST(upload())).status).toBe(503)
    expect(transcribe).not.toHaveBeenCalled()
  })

  it('reports silence and upstream failures without exposing provider details', async () => {
    transcribe.mockResolvedValueOnce({ text: '  ' })
    expect((await POST(upload())).status).toBe(422)
    transcribe.mockRejectedValueOnce(new Error('private provider details'))
    const response = await POST(upload())
    expect(response.status).toBe(502)
    expect(await response.text()).not.toContain('private provider details')
  })

  it('falls back when the primary transcription model is unavailable', async () => {
    transcribe.mockRejectedValueOnce(Object.assign(new Error('model unavailable'), {
      status: 404, code: 'model_not_found',
    }))
    const response = await POST(upload('audio/mp4'))
    expect(response.status).toBe(200)
    expect(transcribe).toHaveBeenCalledTimes(2)
    expect(transcribe.mock.calls[1][0].model).toBe('gpt-4o-mini-transcribe')
    expect(transcribe.mock.calls[1][0].file).toBe(transcribe.mock.calls[0][0].file)
  })

  it.each([
    [401, 'invalid_api_key', 503, /unavailable/i],
    [429, 'insufficient_quota', 503, /unavailable/i],
    [400, 'invalid_audio', 422, /recording could not be read/i],
  ])('classifies provider error %s without blind retry or exposing details', async (status, code, expected, message) => {
    transcribe.mockRejectedValueOnce(Object.assign(new Error('secret provider detail'), { status, code }))
    const response = await POST(upload())
    expect(response.status).toBe(expected)
    const body = await response.json()
    expect(body.error).toMatch(message)
    expect(body.error).not.toContain('secret provider detail')
    expect(transcribe).toHaveBeenCalledOnce()
  })
})
