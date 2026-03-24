'use client'

import { useState } from 'react'
import type { Task } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

export function TodayTasksCard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks)

  async function toggleTask(task: Task) {
    const newStatus = task.status === 'done' ? 'todo' : 'done'

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
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      )
    }
  }

  return (
    <div>
      <div className="text-[9px] font-extrabold uppercase tracking-[2px] text-foreground mb-3">
        Today&apos;s Tasks
      </div>
      {tasks.length === 0 ? (
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">No tasks due today.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0 transition-colors hover:bg-[#f0ebe0]"
            >
              <button
                onClick={() => toggleTask(task)}
                className={cn(
                  'flex h-[15px] w-[15px] shrink-0 items-center justify-center border-[2.5px] transition-colors',
                  task.status === 'done'
                    ? 'border-olive bg-olive'
                    : 'border-brown'
                )}
                aria-label={`Mark "${task.title}" as ${task.status === 'done' ? 'todo' : 'done'}`}
              >
                {task.status === 'done' && (
                  <svg className="h-2.5 w-2.5 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span
                className={cn(
                  'text-[13px] font-semibold uppercase tracking-[0.5px]',
                  task.status === 'done' && 'text-muted-foreground line-through'
                )}
              >
                {task.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
