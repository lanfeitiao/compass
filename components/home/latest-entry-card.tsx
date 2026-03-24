import Link from 'next/link'
import type { JournalEntry, Goal } from '@/lib/supabase/types'

type EntryWithGoals = JournalEntry & { goals: Pick<Goal, 'id' | 'title'>[] }

export function LatestEntryCard({ entry }: { entry: EntryWithGoals | null }) {
  if (!entry) {
    return (
      <div className="border-2 border-brown p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          No journal entries yet.{' '}
          <Link href="/journal/new" className="text-navy underline">
            Write your first entry
          </Link>
        </p>
      </div>
    )
  }

  const date = new Date(entry.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div>
      <div className="text-[9px] font-extrabold uppercase tracking-[2px] text-foreground mb-3">
        Latest Entry
      </div>
      <Link
        href={`/journal/${entry.id}`}
        className="block border-b border-border py-2.5 transition-colors hover:bg-[#f0ebe0]"
      >
        <p className="text-sm font-bold uppercase tracking-[0.5px]">{entry.title ?? 'Untitled'}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">{date}</p>
        {entry.goals.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {entry.goals.map((goal) => (
              <span
                key={goal.id}
                className="inline-flex items-center bg-navy px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-cream"
              >
                {goal.title}
              </span>
            ))}
          </div>
        )}
      </Link>
    </div>
  )
}
