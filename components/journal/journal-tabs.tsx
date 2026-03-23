'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { EntryCard, type EntryWithRelations } from '@/components/journal/entry-card'
import { PromptsList } from '@/components/journal/prompts-list'
import { WhatIfList } from '@/components/journal/whatif-list'
import type { JournalEntry } from '@/lib/supabase/types'

interface JournalTabsProps {
  entries: EntryWithRelations[]
  whatifEntries: JournalEntry[]
}

export function JournalTabs({ entries, whatifEntries }: JournalTabsProps) {
  return (
    <Tabs defaultValue="all">
      <TabsList className="w-full">
        <TabsTrigger value="all">All entries</TabsTrigger>
        <TabsTrigger value="prompts">Prompts</TabsTrigger>
        <TabsTrigger value="whatif">What If</TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        {entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No journal entries yet. Tap &ldquo;+ New&rdquo; to write your first one.
          </p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="prompts">
        <PromptsList />
      </TabsContent>

      <TabsContent value="whatif">
        <WhatIfList entries={whatifEntries} />
      </TabsContent>
    </Tabs>
  )
}
