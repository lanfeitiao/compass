import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { JournalTabs } from '@/components/journal/journal-tabs'
import type { JournalEntry, Goal, Chapter } from '@/lib/supabase/types'
import type { EntryWithRelations } from '@/components/journal/entry-card'

export default async function JournalPage() {
  const supabase = await createClient()

  // Fetch journal + prompt entries
  const { data: allEntries } = await supabase
    .from('journal_entries')
    .select('*')
    .in('entry_type', ['journal', 'prompt'])
    .order('created_at', { ascending: false })

  const entries = (allEntries as JournalEntry[] | null) ?? []

  // Fetch whatif entries separately
  const { data: whatifData } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('entry_type', 'whatif')
    .order('created_at', { ascending: false })

  const whatifEntries = (whatifData as JournalEntry[] | null) ?? []

  // Fetch linked goals for all entries
  const entryIds = entries.map((e) => e.id)
  let goalsByEntry: Record<string, Pick<Goal, 'id' | 'title'>[]> = {}

  if (entryIds.length > 0) {
    const { data: links } = await supabase
      .from('journal_entry_goals')
      .select('journal_entry_id, goal_id')
      .in('journal_entry_id', entryIds)

    const linkRows = (links as { journal_entry_id: string; goal_id: string }[] | null) ?? []
    const goalIds = [...new Set(linkRows.map((l) => l.goal_id))]

    if (goalIds.length > 0) {
      const { data: goalsData } = await supabase
        .from('goals')
        .select('id, title')
        .in('id', goalIds)

      const goalsMap = new Map(
        ((goalsData as Pick<Goal, 'id' | 'title'>[] | null) ?? []).map((g) => [g.id, g])
      )

      for (const link of linkRows) {
        const goal = goalsMap.get(link.goal_id)
        if (goal) {
          if (!goalsByEntry[link.journal_entry_id]) {
            goalsByEntry[link.journal_entry_id] = []
          }
          goalsByEntry[link.journal_entry_id].push(goal)
        }
      }
    }
  }

  // Fetch chapters for entries that have chapter_id
  const chapterIds = [
    ...new Set(entries.filter((e) => e.chapter_id).map((e) => e.chapter_id!)),
  ]
  let chaptersMap = new Map<string, Pick<Chapter, 'name' | 'emoji'>>()

  if (chapterIds.length > 0) {
    const { data: chaptersData } = await supabase
      .from('chapters')
      .select('id, name, emoji')
      .in('id', chapterIds)

    const rows = (chaptersData as (Pick<Chapter, 'name' | 'emoji'> & { id: string })[] | null) ?? []
    chaptersMap = new Map(rows.map((c) => [c.id, { name: c.name, emoji: c.emoji }]))
  }

  // Assemble entries with relations
  const entriesWithRelations: EntryWithRelations[] = entries.map((entry) => ({
    ...entry,
    goals: goalsByEntry[entry.id] ?? [],
    chapter: entry.chapter_id ? chaptersMap.get(entry.chapter_id) ?? null : null,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold uppercase tracking-[1px]">Journal</h1>
        <Button render={<Link href="/journal/new" />} size="sm">
          + New
        </Button>
      </div>

      <JournalTabs
        entries={entriesWithRelations}
        whatifEntries={whatifEntries}
      />
    </div>
  )
}
