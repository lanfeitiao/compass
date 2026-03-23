import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { JournalEntry, Goal } from '@/lib/supabase/types'

type EntryWithGoals = JournalEntry & { goals: Pick<Goal, 'id' | 'title'>[] }

export function LatestEntryCard({ entry }: { entry: EntryWithGoals | null }) {
  if (!entry) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground">
            No journal entries yet.{' '}
            <Link href="/journal/new" className="text-primary underline">
              Write your first entry &rarr;
            </Link>
          </p>
        </CardContent>
      </Card>
    )
  }

  const date = new Date(entry.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest journal entry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="font-medium">{entry.title ?? 'Untitled'}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
        {entry.goals.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {entry.goals.map((goal) => (
              <Badge key={goal.id} variant="secondary">
                {goal.title}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
