import { describe, it, expect } from 'vitest'
import { assignChapterToDate } from '@/lib/chapter-utils'
import type { Chapter } from '@/lib/supabase/types'

const chapters: Chapter[] = [
  {
    id: 'ch1', user_id: 'u1', name: 'Building Years',
    emoji: '🔨', started_at: '2021-01-01', ended_at: '2023-12-31', created_at: '',
  },
  {
    id: 'ch2', user_id: 'u1', name: 'Clarity Years',
    emoji: '✦', started_at: '2024-01-01', ended_at: null, created_at: '',
  },
]

describe('assignChapterToDate', () => {
  it('returns matching chapter id for a date within a closed range', () => {
    expect(assignChapterToDate('2022-06-15', chapters)).toBe('ch1')
  })
  it('returns matching chapter id for a date in the open-ended current chapter', () => {
    expect(assignChapterToDate('2025-03-01', chapters)).toBe('ch2')
  })
  it('returns null when no chapter covers the date', () => {
    expect(assignChapterToDate('2019-01-01', chapters)).toBeNull()
  })
  it('returns null when chapters array is empty', () => {
    expect(assignChapterToDate('2025-01-01', [])).toBeNull()
  })
})
