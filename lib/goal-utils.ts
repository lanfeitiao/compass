import type { Task } from './supabase/types'

export function calculateGoalProgress(tasks: Task[]): { done: number; total: number } {
  return {
    done: tasks.filter(t => t.status === 'done').length,
    total: tasks.length,
  }
}
