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
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [{ type: 'italic' }],
          text: round.question,
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
