'use client'

import { useRouter } from 'next/navigation'
import { getDailyPrompt } from '@/lib/prompts'

export function DailyPromptCard() {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const prompt = getDailyPrompt(today)

  return (
    <button
      onClick={() =>
        router.push(`/journal/new?prompt=${encodeURIComponent(prompt)}&type=prompt`)
      }
      className="w-full rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 p-5 text-left text-white shadow-md transition-transform active:scale-[0.98]"
    >
      <p className="text-sm font-medium opacity-90">Today&apos;s reflection</p>
      <p className="mt-2 text-lg font-semibold leading-snug">{prompt}</p>
      <p className="mt-3 text-sm opacity-75">Tap to write &rarr;</p>
    </button>
  )
}
