import type { Chapter } from './supabase/types'

export function assignChapterToDate(dateStr: string, chapters: Chapter[]): string | null {
  const date = new Date(dateStr)
  for (const chapter of chapters) {
    const start = new Date(chapter.started_at)
    const end = chapter.ended_at ? new Date(chapter.ended_at) : null
    if (date >= start && (end === null || date <= end)) {
      return chapter.id
    }
  }
  return null
}
