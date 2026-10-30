// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/voice/transcribe/route'

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: 'user-1' } } }) } }),
}))

beforeEach(() => {
  vi.stubEnv('OPENAI_API_KEY', 'test-key-not-real')
  vi.stubEnv('OPENAI_TRANSCRIPTION_MODEL', 'gpt-transcribe')
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.restoreAllMocks() })

function phoneUpload() {
  const body = new FormData()
  body.append('audio', new File(['phone audio bytes'], 'recording.mp4', {
    type: 'audio/mp4;codecs=mp4a.40.2',
  }))
  return new Request('https://compass.example/api/voice/transcribe', { method: 'POST', body })
}

describe('voice route through the real OpenAI SDK (HTTP transport mocked)', () => {
  it('uploads multipart MP4 bytes and handles a real SDK model-not-found error', async () => {
    const requests: FormData[] = []
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = new Request(input, init)
      expect(request.url).toBe('https://api.openai.com/v1/audio/transcriptions')
      requests.push(await request.formData())
      if (requests.length === 1) return Response.json({
        error: { message: 'model not available', type: 'invalid_request_error', code: 'model_not_found' },
      }, { status: 404 })
      return Response.json({ text: '今天我想做一点改变。' })
    }))
    const response = await POST(phoneUpload())
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ text: '今天我想做一点改变。' })
    expect(requests.map((form) => form.get('model'))).toEqual(['gpt-transcribe', 'gpt-4o-mini-transcribe'])
    for (const form of requests) {
      const file = form.get('file') as File
      expect(file.name).toBe('recording.mp4')
      expect(file.type).toBe('audio/mp4')
      expect(await file.text()).toBe('phone audio bytes')
      expect(form.get('response_format')).toBe('json')
    }
  })

  it('does not retry actual SDK quota errors or expose their raw message', async () => {
    const fetch = vi.fn(async () => Response.json({
      error: { message: 'private account details', type: 'insufficient_quota', code: 'insufficient_quota' },
    }, { status: 429 }))
    vi.stubGlobal('fetch', fetch)
    const response = await POST(phoneUpload())
    expect(response.status).toBe(503)
    expect(await response.text()).not.toContain('private account details')
    expect(fetch).toHaveBeenCalledOnce()
    expect(console.error).toHaveBeenCalledWith('Voice transcription failed', expect.objectContaining({
      status: 429, code: 'insufficient_quota',
    }))
  })
})
