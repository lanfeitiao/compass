'use client'

import { useRouter } from 'next/navigation'
import { PROMPTS } from '@/lib/prompts'

export function PromptsList() {
  const router = useRouter()

  return (
    <div>
      {PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          className="w-full text-left border-b border-border py-3 transition-colors hover:bg-[#f0ebe0]"
          onClick={() =>
            router.push(
              `/journal/new?prompt=${encodeURIComponent(prompt)}&type=prompt`
            )
          }
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center bg-gold px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-brown">
              Prompt
            </span>
            <p className="text-sm font-semibold">{prompt}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
