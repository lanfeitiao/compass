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
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetchNextQuestion([])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (chatEndRef.current && typeof chatEndRef.current.scrollIntoView === 'function') {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
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
    <div className="flex h-[calc(100dvh-80px)] flex-col bg-[#f5f0e8] md:h-[calc(100dvh)]">
      {/* Header */}
      <div className="flex items-center border-b-[3px] border-brown px-5 py-4">
        <span className="text-[13px] font-extrabold uppercase tracking-[1px] text-brown">
          ✦ Reflect
        </span>
        <span className="ml-3 text-[11px] uppercase text-muted-foreground">
          {entryTitle}
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
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={currentAnswer}
              onChange={(e) => {
                setCurrentAnswer(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type your reflection..."
              disabled={loading || saving}
              rows={1}
              className="flex-1 resize-none border-2 border-brown bg-white px-3 py-2.5 text-[13px] leading-relaxed outline-none disabled:opacity-50"
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
