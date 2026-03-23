import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { JournalEntry, Goal, Chapter } from '@/lib/supabase/types'

export type EntryWithRelations = JournalEntry & {
  goals: Pick<Goal, 'id' | 'title'>[]
  chapter: Pick<Chapter, 'name' | 'emoji'> | null
}

export function EntryCard({ entry }: { entry: EntryWithRelations }) {
  const date = new Date(entry.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Link href={`/journal/${entry.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium">{entry.title ?? 'Untitled'}</p>
            <p className="shrink-0 text-xs text-muted-foreground">{date}</p>
          </div>
          {(entry.goals.length > 0 || entry.chapter) && (
            <div className="flex flex-wrap gap-1.5">
              {entry.chapter && (
                <Badge variant="outline">
                  {entry.chapter.emoji ? `${entry.chapter.emoji} ` : ''}
                  {entry.chapter.name}
                </Badge>
              )}
              {entry.goals.map((goal) => (
                <Badge key={goal.id} variant="secondary">
                  {goal.title}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
