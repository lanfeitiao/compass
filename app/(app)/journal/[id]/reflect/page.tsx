import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReflectionChat } from '@/components/journal/reflection-chat'
import type { JournalEntry } from '@/lib/supabase/types'

export default async function ReflectPage({
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

  return (
    <ReflectionChat
      entryId={typedEntry.id}
      entryContent={typedEntry.content}
      entryTitle={typedEntry.title ?? 'Untitled'}
    />
  )
}
