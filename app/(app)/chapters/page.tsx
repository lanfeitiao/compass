import { createClient } from '@/lib/supabase/server'
import { ChapterForm } from '@/components/chapters/chapter-form'
import { ChapterTimeline } from '@/components/chapters/chapter-timeline'
import type { ChapterWithCounts } from '@/components/chapters/chapter-timeline'
import type { Chapter } from '@/lib/supabase/types'

export default async function ChaptersPage() {
  const supabase = await createClient()

  const { data: chaptersData } = await supabase
    .from('chapters')
    .select('*')
    .order('started_at', { ascending: false })

  const chapters = (chaptersData as Chapter[] | null) ?? []

  // Fetch counts for each chapter
  const chaptersWithCounts: ChapterWithCounts[] = await Promise.all(
    chapters.map(async (chapter) => {
      const [goalResult, entryResult, whatifResult] = await Promise.all([
        supabase
          .from('goals')
          .select('id', { count: 'exact', head: true })
          .eq('chapter_id', chapter.id),
        supabase
          .from('journal_entries')
          .select('id', { count: 'exact', head: true })
          .eq('chapter_id', chapter.id)
          .eq('entry_type', 'journal'),
        supabase
          .from('journal_entries')
          .select('id', { count: 'exact', head: true })
          .eq('chapter_id', chapter.id)
          .eq('entry_type', 'whatif'),
      ])

      return {
        ...chapter,
        goalCount: goalResult.count ?? 0,
        entryCount: entryResult.count ?? 0,
        whatifCount: whatifResult.count ?? 0,
      }
    })
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Life Chapters</h1>
        <ChapterForm />
      </div>

      {chaptersWithCounts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No chapters yet. Create your first chapter to begin mapping your life story.
          </p>
        </div>
      ) : (
        <ChapterTimeline chapters={chaptersWithCounts} />
      )}
    </div>
  )
}
