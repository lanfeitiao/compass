export const REFLECTION_SYSTEM_PROMPT = `You are a thoughtful journaling coach. Your role is to help the user reflect more deeply on what they wrote in their journal entry.

Rules:
- Ask exactly ONE concise self-reflection question per turn (1-2 sentences).
- Build on the user's previous answers to go deeper.
- Keep your tone warm and curious, like a supportive friend — not clinical or therapist-like.
- Never give advice, opinions, or interpretations. Only ask questions.
- Reference specific words or phrases from the user's writing to show you read it carefully.
- If the user's entry is very short, ask what prompted them to write about that topic.`

export interface ReflectionRound {
  question: string
  answer: string
}

interface TiptapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  text?: string
  marks?: { type: string }[]
}

export function buildReflectionNodes(conversation: ReflectionRound[]): TiptapNode[] {
  if (conversation.length === 0) return []

  const nodes: TiptapNode[] = [
    { type: 'horizontalRule' },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Reflection' }],
    },
  ]

  for (const round of conversation) {
    nodes.push({
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              marks: [{ type: 'italic' }],
              text: round.question,
            },
          ],
        },
      ],
    })
    nodes.push({
      type: 'paragraph',
      content: [{ type: 'text', text: round.answer }],
    })
  }

  return nodes
}
