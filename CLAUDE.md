# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

When you read this file, start with a random compass/navigation pun (under 6 words).

@AGENTS.md

## Commands

```bash
npm run dev          # Start dev server (Next.js on localhost:3000)
npm run build        # Production build
npm run lint         # ESLint (flat config, core-web-vitals + typescript)
npm run test         # Vitest in watch mode
npm run test:run     # Vitest single run
npx vitest run tests/lib/goal-utils.test.ts  # Run a single test file
```

## Architecture

Compass is a personal life-tracking PWA built with **Next.js 16 App Router**, **Supabase** (Postgres + Auth), and **Tailwind CSS v4**. The visual design follows Otto Neurath's Isotype style: flat colors, heavy borders, uppercase typography, no rounded corners (`--radius: 0px`).

### Route Groups

- `app/(app)/` — authenticated routes (home dashboard, journal, goals, chapters) wrapped in `AppNav` layout
- `app/(auth)/` — login page (Google OAuth via Supabase)
- `app/api/` — REST API routes for CRUD on chapters, goals, tasks, journal entries

### Data Flow

Server Components fetch data directly via Supabase server client (`lib/supabase/server.ts`). Client Components use the browser client (`lib/supabase/client.ts`). API routes handle mutations. There is no middleware — auth checks happen inside API routes and server components.

### Database Schema (5 tables)

- `chapters` — life phases with start/end dates
- `goals` — hierarchical (self-referencing `parent_goal_id`), linked to chapters, status: active/completed/archived
- `tasks` — belong to goals, status: todo/in_progress/done
- `journal_entries` — three types: journal, prompt, whatif; rich text content via Tiptap
- `journal_entry_goals` — many-to-many join between entries and goals

Types are manually defined in `lib/supabase/types.ts` (not auto-generated).

### Key Libraries

- **Tiptap** for rich text editing in journal entries
- **shadcn/ui + Base UI** for UI primitives (components in `components/ui/`)
- **Lucide** for icons

### Testing

Vitest with jsdom environment and `@testing-library/react`. Test files live in `tests/` mirroring `lib/` structure. Setup file at `tests/setup.ts` imports jest-dom matchers. The `@` path alias resolves to project root.

### Styling

Tailwind v4 with CSS-first config in `globals.css`. Custom color tokens (`terracotta`, `navy`, `gold`, `olive`, `cream`, `brown`) are defined as CSS custom properties and mapped via `@theme inline`. All colors use oklch.

### Environment Variables

Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
Optional: `OPENAI_API_KEY` (enables AI reflection feature for journal entries).
