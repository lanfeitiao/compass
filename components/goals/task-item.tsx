'use client'

import type { Task } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

export function TaskItem({
  task,
  onUpdate,
}: {
  task: Task
  onUpdate: (t: Task) => void
}) {
  async function toggleStatus() {
    const newStatus = task.status === 'done' ? 'todo' : 'done'

    // Optimistic update
    onUpdate({ ...task, status: newStatus })

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
    } catch {
      // Revert on failure
      onUpdate(task)
    }
  }

  return (
    <li className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleStatus}
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
            task.status === 'done'
              ? 'border-green-500 bg-green-500'
              : 'border-muted-foreground/40'
          )}
          aria-label={`Mark "${task.title}" as ${task.status === 'done' ? 'todo' : 'done'}`}
        >
          {task.status === 'done' && (
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>
        <span
          className={cn(
            'text-sm truncate',
            task.status === 'done' && 'text-muted-foreground line-through'
          )}
        >
          {task.title}
        </span>
      </div>
      {task.due_date && (
        <span className="shrink-0 text-xs text-muted-foreground">
          {task.due_date}
        </span>
      )}
    </li>
  )
}
