import { createClient } from '@/lib/supabase/server'
import { assignChapterToDate } from '@/lib/chapter-utils'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const entryType = searchParams.get('entry_type')
  const chapterId = searchParams.get('chapter_id')

  let query = supabase
    .from('journal_entries')
    .select('*, journal_entry_goals(goal_id, goals(id, title))')
    .order('created_at', { ascending: false })

  if (entryType) query = query.eq('entry_type', entryType)
  if (chapterId) query = query.eq('chapter_id', chapterId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { goal_ids, ...entryData } = body

  // Auto-assign chapter based on today's date
  const { data: chapters } = await supabase
    .from('chapters').select('*').order('started_at')
  const chapter_id = assignChapterToDate(
    new Date().toISOString().split('T')[0],
    chapters ?? []
  )

  const { data: entry, error } = await supabase
    .from('journal_entries')
    .insert({ ...entryData, user_id: user.id, chapter_id })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Link to goals if provided
  if (goal_ids?.length) {
    await supabase.from('journal_entry_goals').insert(
      goal_ids.map((gid: string) => ({ journal_entry_id: entry.id, goal_id: gid }))
    )
  }

  return NextResponse.json(entry, { status: 201 })
}
