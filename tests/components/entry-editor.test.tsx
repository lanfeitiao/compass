import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EntryEditor } from '@/components/journal/entry-editor'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))
vi.mock('@/components/journal/voice-input', () => ({
  VoiceInput: ({ onTranscript, onBusyChange }: {
    onTranscript: (text: string) => void; onBusyChange: (busy: boolean) => void
  }) => (
    <>
      <button onClick={() => onBusyChange(true)}>Begin dictation</button>
      <button onClick={() => { onTranscript('今天的记录。\n<b>literal words</b>'); onBusyChange(false) }}>Insert transcript</button>
    </>
  ),
}))

const mockFetch = vi.fn()
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', mockFetch)
  mockFetch.mockResolvedValue({ ok: true })
  // jsdom has no layout measurements; ProseMirror scrolls the caret after focus.
  Range.prototype.getClientRects = () => [] as unknown as DOMRectList
  Range.prototype.getBoundingClientRect = () => new DOMRect()
})

describe('EntryEditor voice integration', () => {
  it('appends plain-text paragraphs to the real Tiptap document without replacing existing content', async () => {
    const { container } = render(<EntryEditor goals={[]} initialContent={JSON.stringify({
      type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Typed note.' }] }],
    })} />)
    const save = await screen.findByRole('button', { name: 'Save Entry' })
    await waitFor(() => expect(save).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Begin dictation' }))
    expect(save).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Insert transcript' }))
    expect(container.querySelector('.tiptap')).toHaveTextContent('Typed note.')
    expect(container.querySelector('.tiptap')).toHaveTextContent('今天的记录。')
    expect(container.querySelector('.tiptap')).toHaveTextContent('<b>literal words</b>')
    expect(container.querySelector('.tiptap b')).toBeNull()
    expect(mockFetch).not.toHaveBeenCalled()
    fireEvent.click(save)
    await waitFor(() => expect(mockFetch).toHaveBeenCalledOnce())
    const payload = JSON.parse(mockFetch.mock.calls[0][1].body)
    const doc = JSON.parse(payload.content)
    const text = doc.content.flatMap((node: { content?: { text: string }[] }) => node.content?.map((child) => child.text) ?? [])
    expect(text).toEqual(['Typed note.', '今天的记录。', '<b>literal words</b>'])
  })

  it('adds the first spoken paragraph to an empty entry without an extra leading blank paragraph', async () => {
    render(<EntryEditor goals={[]} />)
    const save = await screen.findByRole('button', { name: 'Save Entry' })
    await waitFor(() => expect(save).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Insert transcript' }))
    fireEvent.click(save)
    await waitFor(() => expect(mockFetch).toHaveBeenCalledOnce())
    const doc = JSON.parse(JSON.parse(mockFetch.mock.calls[0][1].body).content)
    expect(doc.content[0].content[0].text).toBe('今天的记录。')
  })
})
