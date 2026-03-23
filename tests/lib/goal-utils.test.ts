import { describe, it, expect } from 'vitest'
import { calculateGoalProgress } from '@/lib/goal-utils'
import type { Task } from '@/lib/supabase/types'

const makeTask = (status: Task['status']): Task => ({
  id: crypto.randomUUID(), user_id: 'u1', goal_id: 'g1',
  title: 'task', status, due_date: null, created_at: '',
})

describe('calculateGoalProgress', () => {
  it('returns 0/0 when no tasks', () => {
    expect(calculateGoalProgress([])).toEqual({ done: 0, total: 0 })
  })
  it('counts done tasks correctly', () => {
    const tasks = [makeTask('done'), makeTask('done'), makeTask('todo')]
    expect(calculateGoalProgress(tasks)).toEqual({ done: 2, total: 3 })
  })
  it('treats in_progress as not done', () => {
    const tasks = [makeTask('in_progress'), makeTask('done')]
    expect(calculateGoalProgress(tasks)).toEqual({ done: 1, total: 2 })
  })
})
