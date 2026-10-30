import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReflectionChat } from '@/components/journal/reflection-chat'
import { useState } from 'react'

// Mock next/navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

vi.mock('@/components/journal/voice-input', () => ({
  VoiceInput: ({ onTranscript, onBusyChange }: {
    onTranscript: (text: string) => void; onBusyChange: (busy: boolean) => void
  }) => {
    const [failed, setFailed] = useState(false)
    return (
    <>
      <button onClick={() => onBusyChange(true)}>Begin dictation</button>
      <button onClick={() => { onTranscript('我还想补充一点。'); onBusyChange(false) }}>Insert transcript</button>
      <button onClick={() => { setFailed(true); onBusyChange(false) }}>Fail dictation</button>
      {failed && <button onClick={() => onTranscript('Previous round audio')}>Retry previous recording</button>}
    </>
    )
  },
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ReflectionChat', () => {
  const defaultProps = {
    entryId: 'entry-123',
    entryContent: '{"type":"doc","content":[]}',
    entryTitle: 'Test Entry',
  }

  it('fetches and displays the first question on mount', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ question: 'How did that make you feel?' }),
    })

    render(<ReflectionChat {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('How did that make you feel?')).toBeInTheDocument()
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/journal/entry-123/reflect',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ conversation: [] }),
      })
    )
  })

  it('shows loading state while fetching', () => {
    mockFetch.mockReturnValueOnce(new Promise(() => {})) // never resolves

    render(<ReflectionChat {...defaultProps} />)

    expect(screen.getByText(/thinking/i)).toBeInTheDocument()
  })

  it('displays the reflect header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ question: 'First question?' }),
    })

    render(<ReflectionChat {...defaultProps} />)

    expect(screen.getByText('✦ Reflect')).toBeInTheDocument()
  })

  it('sends answer and receives next question', async () => {
    const user = userEvent.setup()

    // First question
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ question: 'First question?' }),
    })

    render(<ReflectionChat {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('First question?')).toBeInTheDocument()
    })

    // Second question after answer
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ question: 'Second question?' }),
    })

    const input = screen.getByPlaceholderText('Type your reflection...')
    await user.type(input, 'My answer here')
    await user.click(screen.getByRole('button', { name: /send/i }))

    await waitFor(() => {
      expect(screen.getByText('Second question?')).toBeInTheDocument()
      expect(screen.getByText('My answer here')).toBeInTheDocument()
      expect(screen.getByText('My answer here')).toBeInTheDocument()
    })
  })

  it('saves reflections and redirects on Done', async () => {
    const user = userEvent.setup()

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ question: 'A question?' }),
    })

    render(<ReflectionChat {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('A question?')).toBeInTheDocument()
    })

    // Type an answer
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ question: 'Next question?' }),
    })

    const input = screen.getByPlaceholderText('Type your reflection...')
    await user.type(input, 'My reflection')
    await user.click(screen.getByRole('button', { name: /send/i }))

    await waitFor(() => {
      expect(screen.getByText('Next question?')).toBeInTheDocument()
    })

    // Click Done — should save via PUT and redirect
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    })

    await user.click(screen.getByRole('button', { name: /done/i }))

    await waitFor(() => {
      // Verify PUT was called to save the entry
      const putCall = mockFetch.mock.calls.find(
        (call) => call[1]?.method === 'PUT'
      )
      expect(putCall).toBeDefined()
      expect(putCall![0]).toBe('/api/journal/entry-123')

      expect(mockPush).toHaveBeenCalledWith('/journal/entry-123')
    })
  })

  it('shows error state when API fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Something went wrong' }),
    })

    render(<ReflectionChat {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })
  })

  it('displays the entry title in the header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ question: 'Q?' }),
    })

    render(<ReflectionChat {...defaultProps} />)

    expect(screen.getByText('Test Entry')).toBeInTheDocument()
  })

  it('discards failed recordings when a typed answer advances the reflection round', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ question: 'First question?' }) })
    render(<ReflectionChat {...defaultProps} />)
    await screen.findByText('First question?')
    fireEvent.click(screen.getByRole('button', { name: 'Fail dictation' }))
    expect(screen.getByRole('button', { name: 'Retry previous recording' })).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText('Type your reflection...'), { target: { value: 'Typed first answer' } })
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ question: 'Second question?' }) })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    await screen.findByText('Second question?')
    expect(screen.queryByRole('button', { name: 'Retry previous recording' })).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type your reflection...')).toHaveValue('')
  })

  it('keeps typed text, appends dictated text, and sends only after explicit confirmation', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ question: 'What happened?' }) })
    render(<ReflectionChat {...defaultProps} />)
    await screen.findByText('What happened?')
    const input = screen.getByPlaceholderText('Type your reflection...')
    fireEvent.change(input, { target: { value: 'Already typed.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Begin dictation' }))
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
    expect(screen.getByRole('button', { name: /done/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /back to entry/i })).toBeDisabled()
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(mockFetch).toHaveBeenCalledTimes(1)
    // Edits made while transcription is pending are retained too.
    fireEvent.change(input, { target: { value: 'Already typed. More detail.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Insert transcript' }))
    expect(input).toHaveValue('Already typed. More detail.\n我还想补充一点。')
    expect(mockFetch).toHaveBeenCalledTimes(1)
    fireEvent.change(input, { target: { value: 'My reviewed answer.' } })
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ question: 'Next question?' }) })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    await screen.findByText('Next question?')
    const payload = JSON.parse(mockFetch.mock.calls[1][1].body)
    expect(payload.conversation[1].content).toBe('My reviewed answer.')
  })
})
