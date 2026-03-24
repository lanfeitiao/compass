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
import { Textarea } from '@/components/ui/textarea'
import type { Chapter, Goal } from '@/lib/supabase/types'

export function GoalForm({
  chapters,
  goals,
  currentChapterId,
}: {
  chapters: Chapter[]
  goals: Goal[]
  currentChapterId?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [chapterId, setChapterId] = useState(currentChapterId ?? '')
  const [parentGoalId, setParentGoalId] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          chapter_id: chapterId || null,
          parent_goal_id: parentGoalId || null,
          status: 'active',
        }),
      })
      if (!res.ok) throw new Error()

      setTitle('')
      setDescription('')
      setChapterId(currentChapterId ?? '')
      setParentGoalId('')
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
      <DialogTrigger render={<Button size="sm" />}>+ Goal</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="goal-title" className="text-sm font-bold">
              Title
            </label>
            <Input
              id="goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to achieve?"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="goal-description" className="text-sm font-bold">
              Description
            </label>
            <Textarea
              id="goal-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details..."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="goal-chapter" className="text-sm font-bold">
              Chapter
            </label>
            <select
              id="goal-chapter"
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
              className="flex h-8 w-full border-2 border-brown bg-transparent px-2.5 py-1 text-sm font-bold uppercase tracking-wide transition-colors outline-none focus-visible:border-brown"
            >
              <option value="">No chapter</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.emoji ? `${ch.emoji} ` : ''}
                  {ch.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="goal-parent" className="text-sm font-bold">
              Parent Goal
            </label>
            <select
              id="goal-parent"
              value={parentGoalId}
              onChange={(e) => setParentGoalId(e.target.value)}
              className="flex h-8 w-full border-2 border-brown bg-transparent px-2.5 py-1 text-sm font-bold uppercase tracking-wide transition-colors outline-none focus-visible:border-brown"
            >
              <option value="">None (top-level)</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting || !title.trim()}>
              {submitting ? 'Creating...' : 'Create Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
