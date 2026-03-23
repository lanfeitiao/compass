import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  const { goal_ids, ...body } = await request.json()

  const { data, error } = await supabase
    .from('journal_entries').update(body).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (goal_ids !== undefined) {
    await supabase.from('journal_entry_goals').delete().eq('journal_entry_id', id)
    if (goal_ids.length > 0) {
      await supabase.from('journal_entry_goals').insert(
        goal_ids.map((gid: string) => ({ journal_entry_id: id, goal_id: gid }))
      )
    }
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  const { error } = await supabase.from('journal_entries').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
