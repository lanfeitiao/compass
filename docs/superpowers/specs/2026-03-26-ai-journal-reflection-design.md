# AI Journal Reflection — Design Spec

## Overview

An opt-in AI-powered reflection feature for journal entries. After saving an entry, the user can tap a "Reflect" button to enter a full-page conversational experience where an AI reads their entry and asks self-reflection questions one at a time. The conversation builds over up to 3 rounds, and the Q&A is appended to the original entry when done.

## User Flow

1. User writes and saves a journal entry (existing flow, unchanged).
2. On the entry view page (`/journal/[id]`), a "Reflect" button appears in the action bar (terracotta, Isotype style).
3. User taps "Reflect" — navigates to `/journal/[id]/reflect`.
4. Full-page reflection UI loads with warm `#f5f0e8` background. The AI's first question appears in a white bubble.
5. User types an answer in the text input and hits "Send". Their answer appears in a navy bubble.
6. The AI reads the original entry + conversation so far and generates a follow-up question.
7. Repeat up to 3 rounds. User can stop anytime via "Done — save reflections".
8. On finish, the Q&A is appended to the original entry content as Tiptap JSON nodes.
9. User is redirected back to `/journal/[id]`, where the reflection is visible below the original writing.

## API Design

### `POST /api/journal/[id]/reflect`

Generates the next reflection question. Stateless — the client sends the full conversation each time.

**Request body:**
```json
{
  "conversation": [
    { "role": "assistant", "content": "What would speaking up look like?" },
    { "role": "user", "content": "Scheduling a 1:1 with my manager..." }
  ]
}
```

- First call: `conversation` is an empty array. The API fetches the entry content from the database and generates the first question.
- Subsequent calls: `conversation` contains the Q&A so far. The API sends entry content + conversation to OpenAI and returns the next follow-up question.

**Response body:**
```json
{
  "question": "That fear of being seen as 'not a team player' — has that held you back before?"
}
```

**Auth:** Requires authenticated user. Verifies the entry belongs to the requesting user.

### Saving Reflections

No new endpoint. The client calls `PUT /api/journal/[id]` (existing endpoint) with the updated Tiptap JSON content that includes the appended Q&A section.

## OpenAI Integration

### `lib/openai.ts`

New server-side utility that creates and exports an OpenAI client instance.

**Environment variable:** `OPENAI_API_KEY` (added to `.env.local`, documented in CLAUDE.md).

**Model:** `gpt-4o-mini` — fast, inexpensive, sufficient for generating short reflection questions.

### System Prompt

The system prompt instructs the model to:
- Act as a thoughtful journaling coach focused on self-reflection
- Read the journal entry and ask one concise question per turn
- Build on the user's previous answers to go deeper
- Keep the tone warm and curious, not clinical or therapist-like
- Never give advice, opinions, or interpretations — only ask questions
- Keep questions to 1-2 sentences

### Round Limit

Max 3 rounds. Enforced client-side (the API itself is stateless and does not track rounds).

## Component Architecture

### New Files

1. **`app/(app)/journal/[id]/reflect/page.tsx`** — Server component
   - Fetches the journal entry from the database via Supabase server client
   - Passes entry `id` and `content` to the client component
   - Redirects to `/journal/[id]` if the entry is not found or does not belong to the user

2. **`components/journal/reflection-chat.tsx`** — Client component
   - Props: `entryId: string`, `entryContent: string`
   - State: `conversation: {question: string, answer: string}[]`, `currentQuestion: string`, `currentAnswer: string`, `round: number`, `loading: boolean`
   - On mount: calls `POST /api/journal/[id]/reflect` with empty conversation to get the first question
   - On send: appends the current Q&A to conversation, calls API to get the next question (or finishes if round 3)
   - On "Done" or after round 3: builds Tiptap JSON nodes for the reflection section, appends to original content, calls `PUT /api/journal/[id]` to save, redirects to `/journal/[id]`

3. **`app/api/journal/[id]/reflect/route.ts`** — API route
   - `POST` handler: validates auth, fetches entry, builds OpenAI messages, returns next question

4. **`lib/openai.ts`** — OpenAI client utility

### Modified Files

5. **`app/(app)/journal/[id]/page.tsx`** — Add "Reflect" button (terracotta, links to `/journal/[id]/reflect`)

No other existing files are modified.

## Reflection UI

Full-page layout matching the Isotype design language:

- **Background:** `#f5f0e8` (warm cream)
- **Header:** "✦ Reflect" label (uppercase, bold) + round counter ("1 of 3")
- **AI question bubbles:** White background, 2px brown border
- **User answer bubbles:** Navy (`#1a2744`) background, white text, 2px brown border
- **Input area:** Text input + navy "Send" button, "Done — save reflections" link below
- **No rounded corners** (consistent with Isotype style, `--radius: 0px`)

## Content Appending Format

When the user finishes reflecting, the Q&A is appended to the entry's Tiptap JSON content as additional nodes:

1. A `horizontalRule` node (visual divider)
2. A `heading` node (level 3): "Reflection"
3. For each Q&A round:
   - A `paragraph` node with the question text in italic (using an `italic` mark)
   - A `paragraph` node with the user's answer text

The reflection becomes part of the entry content. It renders naturally via Tiptap's prose output on the entry view page and is editable if the user opens the editor. No special rendering logic needed.

## Database Changes

None. No new tables, columns, or migrations. The reflection data lives inside the existing `content` JSON column of `journal_entries`.

## Environment Variables

One new variable:
- `OPENAI_API_KEY` — required for the reflection feature. The reflect API route should return a clear error if this is not configured.

## Error Handling

- **OpenAI API failure:** Show an error message in the reflection UI ("Something went wrong. Your entry is safe.") with a "Back to entry" link.
- **Missing API key:** The reflect API route returns a 500 with a message indicating the feature is not configured.
- **Entry not found / unauthorized:** The reflect page redirects to `/journal/[id]` or shows a 404.
- **Network error during save:** Show error in the UI. The original entry is never modified until the final "Done" save, so no data is lost on failure.

## Testing

- **`lib/openai.ts`:** Unit test that the client is created with the correct config
- **`/api/journal/[id]/reflect`:** Test request validation (empty conversation, conversation with history), auth checks, error handling for missing API key
- **`reflection-chat.tsx`:** Component tests for the conversation flow — mounting triggers first question fetch, sending an answer triggers next question, "Done" triggers save and redirect
- **Content appending:** Unit test that the Tiptap JSON building logic produces correct node structure
