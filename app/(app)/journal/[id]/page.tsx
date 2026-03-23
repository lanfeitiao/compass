import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EntryEditor } from '@/components/journal/entry-editor'
import type { Goal, JournalEntry } from '@/lib/supabase/types'

export default async function EditJournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: entry } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', id)
    .single()

  if (!entry) notFound()

  const typedEntry = entry as JournalEntry

  const { data: linkedGoals } = await supabase
    .from('journal_entry_goals')
    .select('goal_id')
    .eq('journal_entry_id', id)

  const goalIds =
    (linkedGoals as { goal_id: string }[] | null)?.map((lg) => lg.goal_id) ?? []

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight">Edit Entry</h1>
      <EntryEditor
        goals={(goals as Goal[] | null) ?? []}
        entryId={typedEntry.id}
        entryType={typedEntry.entry_type}
        prompt={typedEntry.prompt ?? undefined}
        initialTitle={typedEntry.title ?? ''}
        initialContent={typedEntry.content}
        initialGoalIds={goalIds}
      />
    </div>
  )
}
