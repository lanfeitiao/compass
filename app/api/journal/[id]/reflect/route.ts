import { createClient } from '@/lib/supabase/server'
import { getOpenAIClient } from '@/lib/openai'
import { REFLECTION_SYSTEM_PROMPT } from '@/lib/reflection'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch the journal entry
  const { data: entry, error: entryError } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (entryError || !entry) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
  }

  // Parse and validate request body
  let conversation: { role: 'assistant' | 'user'; content: string }[]
  try {
    const body = await request.json()
    if (!Array.isArray(body.conversation)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    // Validate each message and enforce round limit (max 6 messages = 3 rounds)
    conversation = body.conversation.filter(
      (msg: unknown): msg is { role: 'assistant' | 'user'; content: string } =>
        typeof msg === 'object' && msg !== null &&
        ('role' in msg) && (msg.role === 'assistant' || msg.role === 'user') &&
        ('content' in msg) && typeof msg.content === 'string'
    )
    if (conversation.length > 6) {
      return NextResponse.json({ error: 'Maximum reflection rounds exceeded' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Extract plain text from Tiptap JSON for the AI context
  let entryText = ''
  try {
    const doc = JSON.parse(entry.content)
    entryText = extractText(doc)
  } catch {
    entryText = entry.content
  }

  // Build OpenAI messages
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: REFLECTION_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Here is my journal entry:\n\n${entryText}`,
    },
    ...conversation.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
  ]

  // Call OpenAI
  try {
    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 150,
      temperature: 0.8,
    })

    const question = completion.choices[0]?.message?.content?.trim()
    if (!question) {
      return NextResponse.json(
        { error: 'Failed to generate question' },
        { status: 500 }
      )
    }

    return NextResponse.json({ question })
  } catch (err) {
    console.error('OpenAI error:', err)
    return NextResponse.json(
      { error: 'Failed to generate reflection question' },
      { status: 500 }
    )
  }
}

function extractText(node: Record<string, unknown>): string {
  if (node.type === 'text') return (node.text as string) || ''
  if (!Array.isArray(node.content)) return ''
  const separator = node.type === 'doc' || node.type === 'paragraph' || node.type === 'heading'
    ? '\n' : ''
  return (node.content as Record<string, unknown>[])
    .map(extractText)
    .join(separator)
}
