'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Task } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

export function TodayTasksCard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks)

  async function toggleTask(task: Task) {
    const newStatus = task.status === 'done' ? 'todo' : 'done'

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    )

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
    } catch {
      // Revert on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks due today.</p>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-3">
                <button
                  onClick={() => toggleTask(task)}
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    task.status === 'done'
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/40'
                  )}
                  aria-label={`Mark "${task.title}" as ${task.status === 'done' ? 'todo' : 'done'}`}
                >
                  {task.status === 'done' && (
                    <svg
                      className="h-3 w-3 text-primary-foreground"
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
                    'text-sm',
                    task.status === 'done' && 'text-muted-foreground line-through'
                  )}
                >
                  {task.title}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
