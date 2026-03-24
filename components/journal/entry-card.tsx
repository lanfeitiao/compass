import Link from 'next/link'
import type { JournalEntry, Goal, Chapter } from '@/lib/supabase/types'

export type EntryWithRelations = JournalEntry & {
  goals: Pick<Goal, 'id' | 'title'>[]
  chapter: Pick<Chapter, 'name' | 'emoji'> | null
}

const typeBadgeColor: Record<string, string> = {
  journal: 'bg-olive',
  prompt: 'bg-gold',
  whatif: 'bg-terracotta',
}

export function EntryCard({ entry }: { entry: EntryWithRelations }) {
  const date = new Date(entry.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Link
      href={`/journal/${entry.id}`}
      className="block border-b border-border py-3 transition-colors hover:bg-[#f0ebe0]"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold uppercase tracking-[0.5px]">
          {entry.title ?? 'Untitled'}
        </p>
        <p className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {date}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        <span
          className={`inline-flex items-center px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-cream ${typeBadgeColor[entry.entry_type] ?? 'bg-olive'}`}
        >
          {entry.entry_type === 'whatif' ? 'What If' : entry.entry_type}
        </span>
        {entry.goals.map((goal) => (
          <span
            key={goal.id}
            className="inline-flex items-center bg-navy px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-cream"
          >
            {goal.title}
          </span>
        ))}
        {entry.chapter && (
          <span className="inline-flex items-center border-2 border-brown px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-brown">
            {entry.chapter.emoji ? `${entry.chapter.emoji} ` : ''}
            {entry.chapter.name}
          </span>
        )}
      </div>
    </Link>
  )
}
