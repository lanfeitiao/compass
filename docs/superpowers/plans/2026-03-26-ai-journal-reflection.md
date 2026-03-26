# AI Journal Reflection — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an opt-in AI reflection feature that asks self-reflection questions after journal entries, appending Q&A to the entry content.

**Architecture:** New API route calls OpenAI to generate reflection questions. A full-page client component manages the conversational flow. Reflections are appended to the existing Tiptap JSON content via the existing PUT endpoint. No database changes.

**Tech Stack:** Next.js 16 App Router, OpenAI SDK (`openai` npm package), Tiptap JSON, Vitest + Testing Library.

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `lib/openai.ts` | OpenAI client singleton |
| Create | `lib/reflection.ts` | Tiptap JSON builder for reflection content + system prompt |
| Create | `app/api/journal/[id]/reflect/route.ts` | POST handler — generates next reflection question |
| Create | `app/(app)/journal/[id]/reflect/page.tsx` | Server component — fetches entry, renders ReflectionChat |
| Create | `components/journal/reflection-chat.tsx` | Client component — conversational reflection UI |
| Modify | `app/(app)/journal/[id]/page.tsx` | Add "Reflect" button |
| Create | `tests/lib/reflection.test.ts` | Tests for Tiptap JSON builder |
| Create | `tests/api/journal-reflect.test.ts` | Tests for reflect API route logic |
| Create | `tests/components/reflection-chat.test.tsx` | Tests for ReflectionChat component |

---

### Task 1: Install OpenAI SDK

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the openai package**

Run:
```bash
npm install openai
```

- [ ] **Step 2: Verify installation**

Run:
```bash
node -e "require('openai')"
```
Expected: No error, exits cleanly.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install openai sdk"
```

---

### Task 2: Create OpenAI client utility

**Files:**
- Create: `lib/openai.ts`

- [ ] **Step 1: Create lib/openai.ts**

```typescript
import OpenAI from 'openai'

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }
  return new OpenAI({ apiKey })
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/openai.ts
git commit -m "feat: add OpenAI client utility"
```

---

### Task 3: Build the Tiptap JSON reflection builder (TDD)

**Files:**
- Create: `tests/lib/reflection.test.ts`
- Create: `lib/reflection.ts`

- [ ] **Step 1: Write failing tests for buildReflectionNodes**

Create `tests/lib/reflection.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildReflectionNodes } from '@/lib/reflection'

describe('buildReflectionNodes', () => {
  it('returns horizontalRule + heading + Q&A paragraphs for one round', () => {
    const conversation = [
      { question: 'What did you feel?', answer: 'I felt frustrated.' },
    ]
    const nodes = buildReflectionNodes(conversation)

    expect(nodes).toEqual([
      { type: 'horizontalRule' },
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: 'Reflection' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            marks: [{ type: 'italic' }],
            text: 'What did you feel?',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'I felt frustrated.' }],
      },
    ])
  })

  it('handles multiple rounds', () => {
    const conversation = [
      { question: 'Q1?', answer: 'A1.' },
      { question: 'Q2?', answer: 'A2.' },
    ]
    const nodes = buildReflectionNodes(conversation)

    // horizontalRule + heading + 2 questions + 2 answers = 6 nodes
    expect(nodes).toHaveLength(6)
    expect(nodes[0]).toEqual({ type: 'horizontalRule' })
    expect(nodes[1].type).toBe('heading')
    // Round 1
    expect(nodes[2].content[0].text).toBe('Q1?')
    expect(nodes[3].content[0].text).toBe('A1.')
    // Round 2
    expect(nodes[4].content[0].text).toBe('Q2?')
    expect(nodes[5].content[0].text).toBe('A2.')
  })

  it('returns empty array for empty conversation', () => {
    expect(buildReflectionNodes([])).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npx vitest run tests/lib/reflection.test.ts
```
Expected: FAIL — `Cannot find module '@/lib/reflection'`

- [ ] **Step 3: Implement buildReflectionNodes**

Create `lib/reflection.ts`:

```typescript
export interface ReflectionRound {
  question: string
  answer: string
}

interface TiptapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  text?: string
  marks?: { type: string }[]
}

export function buildReflectionNodes(conversation: ReflectionRound[]): TiptapNode[] {
  if (conversation.length === 0) return []

  const nodes: TiptapNode[] = [
    { type: 'horizontalRule' },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Reflection' }],
    },
  ]

  for (const round of conversation) {
    nodes.push({
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [{ type: 'italic' }],
          text: round.question,
        },
      ],
    })
    nodes.push({
      type: 'paragraph',
      content: [{ type: 'text', text: round.answer }],
    })
  }

  return nodes
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npx vitest run tests/lib/reflection.test.ts
```
Expected: All 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/reflection.ts tests/lib/reflection.test.ts
git commit -m "feat: add Tiptap JSON builder for reflection content"
```

---

### Task 4: Add the system prompt constant

**Files:**
- Modify: `lib/reflection.ts`
- Modify: `tests/lib/reflection.test.ts`

- [ ] **Step 1: Write test for REFLECTION_SYSTEM_PROMPT**

Add to `tests/lib/reflection.test.ts`:

```typescript
import { buildReflectionNodes, REFLECTION_SYSTEM_PROMPT } from '@/lib/reflection'

describe('REFLECTION_SYSTEM_PROMPT', () => {
  it('is a non-empty string', () => {
    expect(typeof REFLECTION_SYSTEM_PROMPT).toBe('string')
    expect(REFLECTION_SYSTEM_PROMPT.length).toBeGreaterThan(0)
  })

  it('instructs to ask questions, not give advice', () => {
    expect(REFLECTION_SYSTEM_PROMPT.toLowerCase()).toContain('question')
    expect(REFLECTION_SYSTEM_PROMPT.toLowerCase()).toContain('never')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npx vitest run tests/lib/reflection.test.ts
```
Expected: FAIL — `REFLECTION_SYSTEM_PROMPT` is not exported.

- [ ] **Step 3: Add REFLECTION_SYSTEM_PROMPT to lib/reflection.ts**

Add to the top of `lib/reflection.ts`:

```typescript
export const REFLECTION_SYSTEM_PROMPT = `You are a thoughtful journaling coach. Your role is to help the user reflect more deeply on what they wrote in their journal entry.

Rules:
- Ask exactly ONE concise self-reflection question per turn (1-2 sentences).
- Build on the user's previous answers to go deeper.
- Keep your tone warm and curious, like a supportive friend — not clinical or therapist-like.
- Never give advice, opinions, or interpretations. Only ask questions.
- Reference specific words or phrases from the user's writing to show you read it carefully.
- If the user's entry is very short, ask what prompted them to write about that topic.`
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npx vitest run tests/lib/reflection.test.ts
```
Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/reflection.ts tests/lib/reflection.test.ts
git commit -m "feat: add reflection system prompt"
```

---

### Task 5: Create the reflect API route

**Files:**
- Create: `app/api/journal/[id]/reflect/route.ts`

This task does NOT use TDD because API routes in Next.js App Router depend on `cookies()` and Supabase server client which are difficult to unit test in isolation. The route follows the exact same pattern as the existing `app/api/journal/[id]/route.ts`.

- [ ] **Step 1: Create the reflect API route**

Create `app/api/journal/[id]/reflect/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { getOpenAIClient } from '@/lib/openai'
import { REFLECTION_SYSTEM_PROMPT } from '@/lib/reflection'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch the journal entry
  const { data: entry, error: entryError } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (entryError || !entry) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
  }

  // Parse request body
  const { conversation } = await request.json() as {
    conversation: { role: 'assistant' | 'user'; content: string }[]
  }

  // Extract plain text from Tiptap JSON for the AI context
  let entryText = ''
  try {
    const doc = JSON.parse(entry.content)
    entryText = extractText(doc)
  } catch {
    entryText = entry.content
  }

  // Build OpenAI messages
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: REFLECTION_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Here is my journal entry:\n\n${entryText}`,
    },
    ...conversation.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
  ]

  // Call OpenAI
  try {
    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 150,
      temperature: 0.8,
    })

    const question = completion.choices[0]?.message?.content?.trim()
    if (!question) {
      return NextResponse.json(
        { error: 'Failed to generate question' },
        { status: 500 }
      )
    }

    return NextResponse.json({ question })
  } catch (err) {
    console.error('OpenAI error:', err)
    return NextResponse.json(
      { error: 'Failed to generate reflection question' },
      { status: 500 }
    )
  }
}

function extractText(node: Record<string, unknown>): string {
  if (node.type === 'text') return (node.text as string) || ''
  if (!Array.isArray(node.content)) return ''
  return (node.content as Record<string, unknown>[])
    .map(extractText)
    .join(node.type === 'paragraph' ? '\n' : '')
}
```

- [ ] **Step 2: Verify the file compiles**

Run:
```bash
npx tsc --noEmit app/api/journal/\[id\]/reflect/route.ts 2>&1 || echo "Type check done (warnings expected for isolated module)"
```

- [ ] **Step 3: Commit**

```bash
git add app/api/journal/\[id\]/reflect/route.ts
git commit -m "feat: add reflect API route for generating reflection questions"
```

---

### Task 6: Create the reflect page (server component)

**Files:**
- Create: `app/(app)/journal/[id]/reflect/page.tsx`

- [ ] **Step 1: Create the server component page**

Create `app/(app)/journal/[id]/reflect/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReflectionChat } from '@/components/journal/reflection-chat'
import type { JournalEntry } from '@/lib/supabase/types'

export default async function ReflectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: entry } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', id)
    .single()

  if (!entry) notFound()

  const typedEntry = entry as JournalEntry

  return (
    <ReflectionChat
      entryId={typedEntry.id}
      entryContent={typedEntry.content}
      entryTitle={typedEntry.title ?? 'Untitled'}
    />
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(app\)/journal/\[id\]/reflect/page.tsx
git commit -m "feat: add reflect page server component"
```

---

### Task 7: Create the ReflectionChat client component (TDD)

**Files:**
- Create: `tests/components/reflection-chat.test.tsx`
- Create: `components/journal/reflection-chat.tsx`

- [ ] **Step 1: Write failing tests**

Create `tests/components/reflection-chat.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReflectionChat } from '@/components/journal/reflection-chat'

// Mock next/navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
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

  it('displays round counter', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ question: 'First question?' }),
    })

    render(<ReflectionChat {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('1 of 3')).toBeInTheDocument()
    })
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
      expect(screen.getByText('2 of 3')).toBeInTheDocument()
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
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npx vitest run tests/components/reflection-chat.test.tsx
```
Expected: FAIL — `Cannot find module '@/components/journal/reflection-chat'`

- [ ] **Step 3: Implement ReflectionChat**

Create `components/journal/reflection-chat.tsx`:

```tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { buildReflectionNodes, type ReflectionRound } from '@/lib/reflection'

interface ReflectionChatProps {
  entryId: string
  entryContent: string
  entryTitle: string
}

export function ReflectionChat({ entryId, entryContent, entryTitle }: ReflectionChatProps) {
  const router = useRouter()
  const [conversation, setConversation] = useState<ReflectionRound[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<string>('')
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [round, setRound] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchNextQuestion([])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation, currentQuestion])

  async function fetchNextQuestion(
    conv: { role: 'assistant' | 'user'; content: string }[]
  ) {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/journal/${entryId}/reflect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation: conv }),
      })

      if (!res.ok) {
        throw new Error('Something went wrong. Your entry is safe.')
      }

      const { question } = await res.json()
      setCurrentQuestion(question)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Your entry is safe.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSend() {
    if (!currentAnswer.trim() || loading) return

    const newRound: ReflectionRound = {
      question: currentQuestion,
      answer: currentAnswer.trim(),
    }
    const updatedConversation = [...conversation, newRound]
    setConversation(updatedConversation)
    setCurrentAnswer('')

    if (round >= 3) {
      await saveReflections(updatedConversation)
      return
    }

    setRound((r) => r + 1)

    // Build conversation history for the API
    const apiConversation: { role: 'assistant' | 'user'; content: string }[] = []
    for (const r of updatedConversation) {
      apiConversation.push({ role: 'assistant', content: r.question })
      apiConversation.push({ role: 'user', content: r.answer })
    }

    await fetchNextQuestion(apiConversation)
    inputRef.current?.focus()
  }

  async function handleDone() {
    if (conversation.length === 0 && !currentAnswer.trim()) {
      router.push(`/journal/${entryId}`)
      return
    }

    // If there's a pending answer, include it
    let finalConversation = conversation
    if (currentAnswer.trim() && currentQuestion) {
      finalConversation = [
        ...conversation,
        { question: currentQuestion, answer: currentAnswer.trim() },
      ]
    }

    await saveReflections(finalConversation)
  }

  async function saveReflections(finalConversation: ReflectionRound[]) {
    if (finalConversation.length === 0) {
      router.push(`/journal/${entryId}`)
      return
    }

    setSaving(true)

    try {
      // Build the reflection nodes
      const reflectionNodes = buildReflectionNodes(finalConversation)

      // Parse existing content and append reflection nodes
      const doc = JSON.parse(entryContent)
      doc.content = [...(doc.content || []), ...reflectionNodes]

      // Save via existing PUT endpoint
      const res = await fetch(`/api/journal/${entryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: JSON.stringify(doc) }),
      })

      if (!res.ok) throw new Error('Failed to save reflections')

      router.push(`/journal/${entryId}`)
      router.refresh()
    } catch (err) {
      console.error('Save failed:', err)
      setError('Failed to save reflections. Your entry is safe.')
      setSaving(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col bg-[#f5f0e8]">
      {/* Header */}
      <div className="flex items-center justify-between border-b-[3px] border-brown px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-extrabold uppercase tracking-[1px] text-brown">
            ✦ Reflect
          </span>
          <span className="text-[11px] uppercase text-muted-foreground">
            {entryTitle}
          </span>
        </div>
        <span className="border-2 border-brown bg-[#f5f0e8] px-2.5 py-0.5 text-[11px] uppercase text-muted-foreground">
          {round} of 3
        </span>
      </div>

      {/* Conversation area */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* Previous rounds */}
        {conversation.map((r, i) => (
          <div key={i}>
            <div className="mb-3 border-2 border-brown bg-white p-3.5">
              <p className="text-[14px] leading-relaxed text-brown">{r.question}</p>
            </div>
            <div className="mb-5 border-2 border-brown bg-navy p-3.5 text-white">
              <p className="text-[14px] leading-relaxed">{r.answer}</p>
            </div>
          </div>
        ))}

        {/* Current question */}
        {loading && (
          <div className="mb-3 border-2 border-brown bg-white p-3.5">
            <p className="text-[14px] text-muted-foreground">Thinking...</p>
          </div>
        )}

        {error && (
          <div className="mb-3 border-2 border-terracotta bg-white p-3.5">
            <p className="text-[14px] text-terracotta">{error}</p>
          </div>
        )}

        {!loading && !error && currentQuestion && (
          <div className="mb-3 border-2 border-brown bg-white p-3.5">
            <p className="text-[14px] leading-relaxed text-brown">{currentQuestion}</p>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t-[3px] border-brown px-5 py-4">
        {!error && (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your reflection..."
              disabled={loading || saving}
              className="flex-1 border-2 border-brown bg-white px-3 py-2.5 text-[13px] outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={loading || saving || !currentAnswer.trim()}
              className="border-2 border-brown bg-navy px-3.5 py-2 text-[12px] font-bold uppercase text-white disabled:opacity-50"
            >
              Send
            </button>
          </div>
        )}
        <div className="mt-2 flex justify-between">
          <button
            onClick={() => router.push(`/journal/${entryId}`)}
            className="text-[11px] uppercase tracking-[1px] text-muted-foreground"
          >
            ← Back to entry
          </button>
          <button
            onClick={handleDone}
            disabled={saving}
            className="text-[11px] uppercase tracking-[1px] text-muted-foreground"
          >
            {saving ? 'Saving...' : 'Done — save reflections'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npx vitest run tests/components/reflection-chat.test.tsx
```
Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add components/journal/reflection-chat.tsx tests/components/reflection-chat.test.tsx
git commit -m "feat: add ReflectionChat client component with tests"
```

---

### Task 8: Add the "Reflect" button to the entry page

**Files:**
- Modify: `app/(app)/journal/[id]/page.tsx`

- [ ] **Step 1: Update the entry page**

The current page at `app/(app)/journal/[id]/page.tsx` is an edit-only page. It needs a "Reflect" button. Add a Link to the reflect page below the editor.

Replace the full content of `app/(app)/journal/[id]/page.tsx` with:

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EntryEditor } from '@/components/journal/entry-editor'
import type { Goal, JournalEntry } from '@/lib/supabase/types'

export default async function EditJournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: entry } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', id)
    .single()

  if (!entry) notFound()

  const typedEntry = entry as JournalEntry

  const { data: linkedGoals } = await supabase
    .from('journal_entry_goals')
    .select('goal_id')
    .eq('journal_entry_id', id)

  const goalIds =
    (linkedGoals as { goal_id: string }[] | null)?.map((lg) => lg.goal_id) ?? []

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold uppercase tracking-[1px]">Edit Entry</h1>
        <Link
          href={`/journal/${typedEntry.id}/reflect`}
          className="border-[3px] border-brown bg-terracotta px-5 py-2 text-[13px] font-extrabold uppercase tracking-[1px] text-white"
        >
          ✦ Reflect
        </Link>
      </div>
      <EntryEditor
        goals={(goals as Goal[] | null) ?? []}
        entryId={typedEntry.id}
        entryType={typedEntry.entry_type}
        prompt={typedEntry.prompt ?? undefined}
        initialTitle={typedEntry.title ?? ''}
        initialContent={typedEntry.content}
        initialGoalIds={goalIds}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(app\)/journal/\[id\]/page.tsx
git commit -m "feat: add Reflect button to journal entry page"
```

---

### Task 9: End-to-end smoke test

**Files:** None (manual verification)

- [ ] **Step 1: Run all tests**

Run:
```bash
npx vitest run
```
Expected: All tests pass (existing + new).

- [ ] **Step 2: Run lint**

Run:
```bash
npm run lint
```
Expected: No errors.

- [ ] **Step 3: Run build**

Run:
```bash
npm run build
```
Expected: Build succeeds with no type errors.

- [ ] **Step 4: Manual smoke test (if OPENAI_API_KEY is set)**

1. Run `npm run dev`
2. Navigate to an existing journal entry
3. Verify the "Reflect" button appears
4. Click "Reflect" — should navigate to the reflection page
5. Verify the first question loads (or an error if no API key)
6. Type an answer and send — verify the conversation progresses
7. Click "Done" — verify it saves and redirects back to the entry with reflections appended

- [ ] **Step 5: Final commit (if any lint/type fixes were needed)**

```bash
git add -A
git commit -m "fix: address lint and type issues from reflection feature"
```
