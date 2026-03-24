'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { TaskItem } from './task-item'
import { calculateGoalProgress } from '@/lib/goal-utils'
import type { Goal, Task } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

export type GoalWithData = Goal & {
  tasks: Task[]
  journal_entry_goals: { journal_entry_id: string }[]
  subGoals?: GoalWithData[]
}

const statusBorderColor: Record<string, string> = {
  active: 'border-l-terracotta',
  completed: 'border-l-olive',
  archived: 'border-l-muted-foreground',
}

const statusBadgeBg: Record<string, string> = {
  active: 'bg-terracotta text-cream',
  completed: 'bg-olive text-cream',
  archived: 'bg-muted-foreground text-cream',
}

export function GoalCard({
  goal,
  depth = 0,
}: {
  goal: GoalWithData
  depth?: number
}) {
  const hasTasks = goal.tasks.length > 0
  const hasSubGoals = (goal.subGoals?.length ?? 0) > 0
  const hasChildren = hasTasks || hasSubGoals

  const [expanded, setExpanded] = useState(depth === 0 && hasChildren)
  const [tasks, setTasks] = useState<Task[]>(goal.tasks)

  const progress = calculateGoalProgress(tasks)

  function handleTaskUpdate(updatedTask: Task) {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    )
  }

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div
        className={cn(
          'border-l-4 border-2 border-brown bg-[#f5f0e8] p-4',
          statusBorderColor[goal.status] ?? 'border-l-muted-foreground'
        )}
      >
        <div className="flex items-start gap-2">
          {hasChildren && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4 shrink-0" />}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold uppercase tracking-[0.5px]">{goal.title}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${statusBadgeBg[goal.status] ?? 'bg-muted-foreground text-cream'}`}>
                {goal.status}
              </span>
              {goal.journal_entry_goals.length > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {goal.journal_entry_goals.length} {goal.journal_entry_goals.length === 1 ? 'entry' : 'entries'}
                </span>
              )}
            </div>

            {/* Pictogram progress dots */}
            {progress.total > 0 && (
              <div className="mt-2 flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {tasks.map((t) => (
                    <div
                      key={t.id}
                      className={cn(
                        'h-2.5 w-2.5',
                        t.status === 'done'
                          ? 'bg-olive'
                          : 'border-[1.5px] border-brown'
                      )}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {progress.done}/{progress.total} Tasks
                </span>
              </div>
            )}
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pl-6 space-y-3">
            {tasks.length > 0 && (
              <ul className="space-y-2">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onUpdate={handleTaskUpdate}
                  />
                ))}
              </ul>
            )}

            {goal.subGoals?.map((subGoal) => (
              <GoalCard
                key={subGoal.id}
                goal={subGoal}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
