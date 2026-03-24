import { createClient } from '@/lib/supabase/server'
import { EntryEditor } from '@/components/journal/entry-editor'
import type { Goal } from '@/lib/supabase/types'

export default async function NewJournalEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { prompt, type } = await searchParams

  const entryType =
    type === 'prompt' || type === 'whatif' ? type : 'journal'

  const supabase = await createClient()
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-4">
      <h1 className="text-[22px] font-extrabold uppercase tracking-[1px]">New Entry</h1>
      <EntryEditor
        goals={(goals as Goal[] | null) ?? []}
        entryType={entryType}
        prompt={typeof prompt === 'string' ? prompt : undefined}
      />
    </div>
  )
}
