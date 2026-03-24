import { createClient } from '@/lib/supabase/server'
import { GoalCard } from '@/components/goals/goal-card'
import { GoalForm } from '@/components/goals/goal-form'
import type { GoalWithData } from '@/components/goals/goal-card'
import type { Goal, Task, Chapter } from '@/lib/supabase/types'

export default async function GoalsPage() {
  const supabase = await createClient()

  // Fetch all goals with tasks and journal_entry_goals
  const { data: goalsData } = await supabase
    .from('goals')
    .select('*, tasks(*), journal_entry_goals(journal_entry_id)')
    .order('created_at', { ascending: true })

  const goals = (goalsData as (Goal & { tasks: Task[]; journal_entry_goals: { journal_entry_id: string }[] })[] | null) ?? []

  // Fetch chapters
  const { data: chaptersData } = await supabase
    .from('chapters')
    .select('*')
    .order('started_at', { ascending: false })

  const chapters = (chaptersData as Chapter[] | null) ?? []

  // Find current chapter (no ended_at)
  const currentChapter = chapters.find((ch) => !ch.ended_at)

  // Build goal tree
  const goalMap = new Map<string, GoalWithData>()
  for (const g of goals) {
    goalMap.set(g.id, { ...g, subGoals: [] })
  }

  const topLevel: GoalWithData[] = []

  for (const g of goals) {
    const node = goalMap.get(g.id)!
    if (g.parent_goal_id && goalMap.has(g.parent_goal_id)) {
      goalMap.get(g.parent_goal_id)!.subGoals!.push(node)
    } else {
      topLevel.push(node)
    }
  }

  // Extract flat goals list for the form (without relations)
  const flatGoals: Goal[] = goals.map(({ tasks: _t, journal_entry_goals: _j, ...rest }) => rest)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold uppercase tracking-[1px]">Goals &amp; Tasks</h1>
        <GoalForm
          chapters={chapters}
          goals={flatGoals}
          currentChapterId={currentChapter?.id}
        />
      </div>

      {topLevel.length === 0 ? (
        <div className="border-2 border-brown p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            No goals yet. Create your first goal to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {topLevel.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  )
}
