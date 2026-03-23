import { createClient } from '@/lib/supabase/server'
import { DailyPromptCard } from '@/components/home/daily-prompt-card'
import { TodayTasksCard } from '@/components/home/today-tasks-card'
import { LatestEntryCard } from '@/components/home/latest-entry-card'
import type { JournalEntry } from '@/lib/supabase/types'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? ''

  const today = new Date().toISOString().split('T')[0]

  // Fetch today's tasks (due today or earlier, not done)
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .lte('due_date', today)
    .neq('status', 'done')
    .order('created_at', { ascending: true })

  // Fetch latest journal entry with linked goals
  const { data: entries } = await supabase
    .from('journal_entries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)

  const latestEntry = (entries as JournalEntry[] | null)?.[0] ?? null

  let entryWithGoals = null

  if (latestEntry) {
    const entryId = latestEntry.id

    const { data: linkedGoals } = await supabase
      .from('journal_entry_goals')
      .select('goal_id')
      .eq('journal_entry_id', entryId)

    const goalIds = (linkedGoals as { goal_id: string }[] | null)?.map((lg) => lg.goal_id) ?? []

    let goals: { id: string; title: string }[] = []
    if (goalIds.length > 0) {
      const { data: goalsData } = await supabase
        .from('goals')
        .select('id, title')
        .in('id', goalIds)

      goals = (goalsData as { id: string; title: string }[] | null) ?? []
    }

    entryWithGoals = { ...latestEntry, goals }
  }

  // Fetch current chapter
  const { data: chapters } = await supabase
    .from('chapters')
    .select('name, emoji')
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)

  const currentChapter = (chapters as { name: string; emoji: string | null }[] | null)?.[0] ?? null

  const greeting = getGreeting()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting}
          {firstName ? `, ${firstName}` : ''}
        </h1>
        {currentChapter && (
          <p className="mt-1 text-sm text-muted-foreground">
            {currentChapter.emoji ? `${currentChapter.emoji} ` : ''}
            {currentChapter.name}
          </p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <DailyPromptCard />
      <TodayTasksCard initialTasks={tasks ?? []} />
      <LatestEntryCard entry={entryWithGoals} />
    </div>
  )
}
