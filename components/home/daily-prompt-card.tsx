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
      className="w-full bg-gold p-4 text-left transition-colors hover:bg-gold/90"
    >
      <p className="text-[9px] font-extrabold uppercase tracking-[2px] text-brown">Today&apos;s Prompt</p>
      <p className="mt-1.5 text-sm font-semibold leading-snug text-brown">{prompt}</p>
    </button>
  )
}
