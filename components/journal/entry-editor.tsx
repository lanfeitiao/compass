'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { Goal } from '@/lib/supabase/types'

interface EntryEditorProps {
  goals: Goal[]
  initialTitle?: string
  initialContent?: string
  initialGoalIds?: string[]
  entryId?: string
  entryType?: 'journal' | 'prompt' | 'whatif'
  prompt?: string
}

export function EntryEditor({
  goals,
  initialTitle = '',
  initialContent,
  initialGoalIds = [],
  entryId,
  entryType = 'journal',
  prompt,
}: EntryEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>(initialGoalIds)
  const [saving, setSaving] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
    ],
    content: initialContent ? JSON.parse(initialContent) : undefined,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert min-h-[200px] max-w-none rounded-lg border bg-background px-4 py-3 focus:outline-none',
      },
    },
  })

  function toggleGoal(goalId: string) {
    setSelectedGoalIds((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    )
  }

  async function handleSave() {
    if (!editor) return
    setSaving(true)

    const payload = {
      title: title || null,
      content: JSON.stringify(editor.getJSON()),
      entry_type: entryType,
      prompt: prompt || null,
      goal_ids: selectedGoalIds,
    }

    try {
      const url = entryId ? `/api/journal/${entryId}` : '/api/journal'
      const method = entryId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save')
      }

      router.push('/journal')
      router.refresh()
    } catch (err) {
      console.error('Save failed:', err)
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {prompt && (
        <div
          className={`rounded-xl p-4 ${
            entryType === 'whatif'
              ? 'bg-orange-50 text-orange-900 dark:bg-orange-950 dark:text-orange-100'
              : 'bg-violet-50 text-violet-900 dark:bg-violet-950 dark:text-violet-100'
          }`}
        >
          <p className="text-sm font-medium opacity-75">
            {entryType === 'whatif' ? 'What if...' : 'Prompt'}
          </p>
          <p className="mt-1 font-semibold">{prompt}</p>
        </div>
      )}

      <Input
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-lg font-semibold"
      />

      <EditorContent editor={editor} />

      {goals.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Link to goals</p>
          <div className="flex flex-wrap gap-2">
            {goals.map((goal) => (
              <button key={goal.id} type="button" onClick={() => toggleGoal(goal.id)}>
                <Badge
                  variant={selectedGoalIds.includes(goal.id) ? 'default' : 'outline'}
                >
                  {goal.title}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Saving...' : entryId ? 'Update Entry' : 'Save Entry'}
      </Button>
    </div>
  )
}
