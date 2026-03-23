'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  active: 'border-l-primary',
  completed: 'border-l-green-500',
  archived: 'border-l-muted',
}

const statusBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  completed: 'secondary',
  archived: 'outline',
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
  const progressPercent = progress.total > 0 ? (progress.done / progress.total) * 100 : 0

  function handleTaskUpdate(updatedTask: Task) {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    )
  }

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <Card
        className={cn(
          'border-l-4',
          statusBorderColor[goal.status] ?? 'border-l-muted'
        )}
      >
        <CardContent className="p-4">
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
                <h3 className="text-sm font-medium">{goal.title}</h3>
                <Badge variant={statusBadgeVariant[goal.status] ?? 'outline'}>
                  {goal.status}
                </Badge>
                {goal.journal_entry_goals.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {goal.journal_entry_goals.length} journal{' '}
                    {goal.journal_entry_goals.length === 1 ? 'entry' : 'entries'}
                  </span>
                )}
              </div>

              {progress.total > 0 && (
                <div className="mt-2">
                  <Progress value={progressPercent}>
                    <span className="text-xs text-muted-foreground">
                      {progress.done}/{progress.total} tasks
                    </span>
                  </Progress>
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
        </CardContent>
      </Card>
    </div>
  )
}
