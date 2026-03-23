import Link from 'next/link'
import type { Chapter } from '@/lib/supabase/types'
import { Badge } from '@/components/ui/badge'

export type ChapterWithCounts = Chapter & {
  goalCount: number
  entryCount: number
  whatifCount: number
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

export function ChapterTimeline({ chapters }: { chapters: ChapterWithCounts[] }) {
  return (
    <div className="relative pl-8">
      {/* Gradient timeline line */}
      <div className="absolute top-0 bottom-0 left-3 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-muted" />

      <div className="space-y-6">
        {chapters.map((chapter) => {
          const isCurrent = !chapter.ended_at

          return (
            <div key={chapter.id} className="relative">
              {/* Timeline dot */}
              <div
                className={`absolute -left-5 top-1.5 h-3 w-3 rounded-full border-2 border-background ${
                  isCurrent ? 'bg-primary' : 'bg-muted-foreground'
                }`}
              />

              <div
                className={`rounded-lg border p-4 ${
                  isCurrent
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-background'
                }`}
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold">
                    {chapter.emoji ? `${chapter.emoji} ` : ''}
                    {chapter.name}
                  </h3>
                  {isCurrent && (
                    <Badge variant="default" className="text-[10px]">
                      Current
                    </Badge>
                  )}
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(chapter.started_at)}
                  {' \u2014 '}
                  {chapter.ended_at ? formatDate(chapter.ended_at) : 'present'}
                </p>

                <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                  <Link
                    href={`/goals?chapter=${chapter.id}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {chapter.goalCount} {chapter.goalCount === 1 ? 'goal' : 'goals'}
                  </Link>
                  <Link
                    href={`/journal?chapter=${chapter.id}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {chapter.entryCount} {chapter.entryCount === 1 ? 'entry' : 'entries'}
                  </Link>
                  <Link
                    href={`/journal?chapter=${chapter.id}&type=whatif`}
                    className="hover:text-foreground transition-colors"
                  >
                    {chapter.whatifCount} {chapter.whatifCount === 1 ? 'what-if' : 'what-ifs'}
                  </Link>
                </div>
              </div>
            </div>
          )
        })}

        {/* Next chapter placeholder */}
        <div className="relative">
          <div className="absolute -left-5 top-1.5 h-3 w-3 rounded-full border-2 border-dashed border-muted-foreground/50" />
          <div className="rounded-lg border border-dashed p-4 text-center">
            <p className="text-sm italic text-muted-foreground">
              What comes next? Name your next chapter when you&apos;re ready...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
