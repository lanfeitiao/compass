import Link from 'next/link'
import type { Chapter } from '@/lib/supabase/types'

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
      {/* Timeline line */}
      <div className="absolute top-0 bottom-0 left-3 w-[3px] bg-brown" />

      <div className="space-y-6">
        {chapters.map((chapter) => {
          const isCurrent = !chapter.ended_at

          return (
            <div key={chapter.id} className="relative">
              {/* Timeline dot — square */}
              <div
                className={`absolute -left-5 top-1.5 ${
                  isCurrent ? 'h-[18px] w-[18px] bg-gold' : 'h-[14px] w-[14px] bg-brown'
                }`}
                style={{ marginTop: isCurrent ? '-2px' : '0' }}
              />

              <div className="border-2 border-brown p-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold uppercase tracking-[0.5px]">
                    {chapter.emoji ? `${chapter.emoji} ` : ''}
                    {chapter.name}
                  </h3>
                  {isCurrent && (
                    <span className="inline-flex items-center bg-gold px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-brown">
                      Current
                    </span>
                  )}
                </div>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {formatDate(chapter.started_at)}
                  {' \u2014 '}
                  {chapter.ended_at ? formatDate(chapter.ended_at) : 'present'}
                </p>

                {/* Stat blocks */}
                <div className="flex mt-3">
                  <Link
                    href={`/goals?chapter=${chapter.id}`}
                    className="flex-1 bg-navy py-2 text-center transition-colors hover:bg-navy/80"
                  >
                    <div className="text-base font-black text-cream">{chapter.goalCount}</div>
                    <div className="text-[7px] font-extrabold uppercase tracking-[1.5px] text-cream">Goals</div>
                  </Link>
                  <Link
                    href={`/journal?chapter=${chapter.id}`}
                    className="flex-1 bg-olive py-2 text-center transition-colors hover:bg-olive/80"
                  >
                    <div className="text-base font-black text-cream">{chapter.entryCount}</div>
                    <div className="text-[7px] font-extrabold uppercase tracking-[1.5px] text-cream">Entries</div>
                  </Link>
                  <Link
                    href={`/journal?chapter=${chapter.id}&type=whatif`}
                    className="flex-1 bg-terracotta py-2 text-center transition-colors hover:bg-terracotta/80"
                  >
                    <div className="text-base font-black text-cream">{chapter.whatifCount}</div>
                    <div className="text-[7px] font-extrabold uppercase tracking-[1.5px] text-cream">What-Ifs</div>
                  </Link>
                </div>
              </div>
            </div>
          )
        })}

        {/* Next chapter placeholder */}
        <div className="relative">
          <div className="absolute -left-5 top-1.5 h-[14px] w-[14px] border-2 border-brown" />
          <div className="border-2 border-brown p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              What comes next? Name your next chapter when you&apos;re ready...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
