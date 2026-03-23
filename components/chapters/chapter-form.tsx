'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ChapterForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [startedAt, setStartedAt] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !startedAt) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          emoji: emoji.trim() || null,
          started_at: startedAt,
        }),
      })
      if (!res.ok) throw new Error()

      setName('')
      setEmoji('')
      setStartedAt('')
      setOpen(false)
      router.refresh()
    } catch {
      // Could add error handling UI here
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>+ Chapter</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Chapter</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="chapter-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="chapter-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. The Exploration Year"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="chapter-emoji" className="text-sm font-medium">
              Emoji (optional)
            </label>
            <Input
              id="chapter-emoji"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="e.g. \u{1F331}"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="chapter-start" className="text-sm font-medium">
              Start Date
            </label>
            <Input
              id="chapter-start"
              type="date"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting || !name.trim() || !startedAt}>
              {submitting ? 'Creating...' : 'Create Chapter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
