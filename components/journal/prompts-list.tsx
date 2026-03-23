'use client'

import { useRouter } from 'next/navigation'
import { PROMPTS } from '@/lib/prompts'
import { Card, CardContent } from '@/components/ui/card'

export function PromptsList() {
  const router = useRouter()

  return (
    <div className="space-y-3">
      {PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          className="w-full text-left"
          onClick={() =>
            router.push(
              `/journal/new?prompt=${encodeURIComponent(prompt)}&type=prompt`
            )
          }
        >
          <Card className="transition-colors hover:bg-muted/50">
            <CardContent>
              <p className="text-sm font-medium">{prompt}</p>
            </CardContent>
          </Card>
        </button>
      ))}
    </div>
  )
}
