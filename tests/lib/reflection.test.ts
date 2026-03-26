import { describe, it, expect } from 'vitest'
import { buildReflectionNodes } from '@/lib/reflection'

describe('buildReflectionNodes', () => {
  it('returns horizontalRule + heading + Q&A paragraphs for one round', () => {
    const conversation = [
      { question: 'What did you feel?', answer: 'I felt frustrated.' },
    ]
    const nodes = buildReflectionNodes(conversation)

    expect(nodes).toEqual([
      { type: 'horizontalRule' },
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: 'Reflection' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            marks: [{ type: 'italic' }],
            text: 'What did you feel?',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'I felt frustrated.' }],
      },
    ])
  })

  it('handles multiple rounds', () => {
    const conversation = [
      { question: 'Q1?', answer: 'A1.' },
      { question: 'Q2?', answer: 'A2.' },
    ]
    const nodes = buildReflectionNodes(conversation)

    // horizontalRule + heading + 2 questions + 2 answers = 6 nodes
    expect(nodes).toHaveLength(6)
    expect(nodes[0]).toEqual({ type: 'horizontalRule' })
    expect(nodes[1].type).toBe('heading')
    // Round 1
    expect(nodes[2].content[0].text).toBe('Q1?')
    expect(nodes[3].content[0].text).toBe('A1.')
    // Round 2
    expect(nodes[4].content[0].text).toBe('Q2?')
    expect(nodes[5].content[0].text).toBe('A2.')
  })

  it('returns empty array for empty conversation', () => {
    expect(buildReflectionNodes([])).toEqual([])
  })
})
