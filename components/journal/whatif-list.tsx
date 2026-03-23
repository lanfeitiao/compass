'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
        <p className="text-sm text-muted-foreground">
          No What If entries yet. Type a question above to get started.
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const date = new Date(entry.created_at).toLocaleDateString(
              'en-US',
              { month: 'short', day: 'numeric', year: 'numeric' }
            )

            return (
              <button
                key={entry.id}
                type="button"
                className="w-full text-left"
                onClick={() => router.push(`/journal/${entry.id}`)}
              >
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="space-y-1">
                    <p className="text-sm font-medium">
                      {entry.prompt ?? 'Untitled'}
                    </p>
                    <p className="text-xs text-muted-foreground">{date}</p>
                  </CardContent>
                </Card>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
