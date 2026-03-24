'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { JournalEntry } from '@/lib/supabase/types'

export function WhatIfList({ entries }: { entries: JournalEntry[] }) {
  const router = useRouter()
  const [question, setQuestion] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = question.trim()
    if (!trimmed) return
    router.push(
      `/journal/new?prompt=${encodeURIComponent(trimmed)}&type=whatif`
    )
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="What would you do if..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={!question.trim()}>
          Go
        </Button>
      </form>

      {entries.length === 0 ? (
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          No What If entries yet. Type a question above to get started.
        </p>
      ) : (
        <div>
          {entries.map((entry) => {
            const date = new Date(entry.created_at).toLocaleDateString(
              'en-US',
              { month: 'short', day: 'numeric', year: 'numeric' }
            )

            return (
              <button
                key={entry.id}
                type="button"
                className="w-full text-left border-b border-border py-3 transition-colors hover:bg-[#f0ebe0]"
                onClick={() => router.push(`/journal/${entry.id}`)}
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center bg-terracotta px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-cream">
                    What If
                  </span>
                  <p className="text-sm font-semibold">
                    {entry.prompt ?? 'Untitled'}
                  </p>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5 ml-[calc(2px+theme(spacing.2)*2+theme(spacing.2))]">{date}</p>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
