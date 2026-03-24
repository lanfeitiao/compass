# Isotype UI Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle Compass with an Isotype-inspired visual language — warm humanist color palette, thick-outline geometric pictograms, sharp rectangles, all-uppercase labels, tight grid, no decoration.

**Architecture:** This is a visual reskin. All changes are CSS/theme, component markup, and SVG icon replacements. The existing component structure (pages, layouts, UI primitives) stays intact. One minor server-side addition: the home page needs additional Supabase queries for goal count and entry count to populate stat blocks.

**Tech Stack:** Next.js (app router), Tailwind CSS v4 with OKLCH colors, shadcn/ui on @base-ui/react primitives, Supabase, TipTap editor.

**Spec:** `docs/superpowers/specs/2026-03-24-isotype-ui-redesign.md`

---

## File Structure

### Files to Modify (no new files created)

**Theme / Global:**
- `app/globals.css` — full palette replacement, reset border-radius, remove shadows, delete `.dark` block, add semantic color tokens
- `app/layout.tsx` — update `themeColor` to `#2c2420`
- `public/manifest.json` — update colors

**Layouts:**
- `app/(app)/layout.tsx` — add header, update styling
- `app/(auth)/layout.tsx` — update background

**Navigation:**
- `components/nav/app-nav.tsx` — replace lucide icons with SVG pictograms, update colors/typography

**Pages:**
- `app/(app)/page.tsx` — add stat block queries, restructure layout
- `app/(app)/journal/page.tsx` — update heading typography
- `app/(app)/journal/new/page.tsx` — update heading typography
- `app/(app)/journal/[id]/page.tsx` — update heading typography
- `app/(app)/goals/page.tsx` — update heading and empty state
- `app/(app)/chapters/page.tsx` — update heading and empty state
- `app/(auth)/login/page.tsx` — restyle card

**Components:**
- `components/home/daily-prompt-card.tsx` — gold block, remove gradient
- `components/home/today-tasks-card.tsx` — square checkboxes, remove Card wrapper
- `components/home/latest-entry-card.tsx` — flat row style
- `components/journal/entry-card.tsx` — row with typed badges
- `components/journal/entry-editor.tsx` — update editor chrome, goal badges
- `components/journal/journal-tabs.tsx` — bottom-border tab style
- `components/journal/prompts-list.tsx` — flat rows, gold accent
- `components/journal/whatif-list.tsx` — flat rows, terracotta accent
- `components/goals/goal-card.tsx` — left border, pictogram progress dots
- `components/goals/goal-form.tsx` — update select/dialog styling
- `components/goals/task-item.tsx` — square checkbox
- `components/chapters/chapter-timeline.tsx` — square dots, stat blocks
- `components/chapters/chapter-form.tsx` — update dialog styling

**UI Primitives:**
- `components/ui/button.tsx` — remove radius, update default colors
- `components/ui/badge.tsx` — remove rounded-full, use square
- `components/ui/card.tsx` — remove rounded-xl, use solid border
- `components/ui/tabs.tsx` — bottom-border style as default
- `components/ui/input.tsx` — remove radius
- `components/ui/dialog.tsx` — remove radius, fix footer
- `components/ui/textarea.tsx` — remove radius
- `components/ui/sheet.tsx` — remove radius and shadows
- `components/ui/scroll-area.tsx` — remove rounded-[inherit]

---

### Task 1: Theme — globals.css palette replacement + dark mode removal

**Files:**
- Modify: `app/globals.css`

This task replaces the entire CSS theme with the Isotype palette, removes dark mode, resets border-radius to 0, and adds semantic color tokens.

- [ ] **Step 1: Replace globals.css with Isotype theme**

Replace the full contents of `app/globals.css` with:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-sans);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
  --color-terracotta: var(--terracotta);
  --color-navy: var(--navy);
  --color-gold: var(--gold);
  --color-olive: var(--olive);
  --color-cream: var(--cream);
  --color-brown: var(--brown);
}

:root {
  --cream: oklch(0.975 0.008 80);
  --brown: oklch(0.22 0.02 50);
  --terracotta: oklch(0.56 0.14 35);
  --navy: oklch(0.32 0.07 250);
  --gold: oklch(0.76 0.12 85);
  --olive: oklch(0.52 0.08 140);

  --background: oklch(0.975 0.008 80);
  --foreground: oklch(0.22 0.02 50);
  --card: oklch(0.975 0.008 80);
  --card-foreground: oklch(0.22 0.02 50);
  --popover: oklch(0.975 0.008 80);
  --popover-foreground: oklch(0.22 0.02 50);
  --primary: oklch(0.22 0.02 50);
  --primary-foreground: oklch(0.975 0.008 80);
  --secondary: oklch(0.95 0.005 80);
  --secondary-foreground: oklch(0.22 0.02 50);
  --muted: oklch(0.93 0.005 80);
  --muted-foreground: oklch(0.65 0.01 60);
  --accent: oklch(0.93 0.005 80);
  --accent-foreground: oklch(0.22 0.02 50);
  --destructive: oklch(0.56 0.14 35);
  --border: oklch(0.85 0.01 70);
  --input: oklch(0.85 0.01 70);
  --ring: oklch(0.76 0.12 85);
  --chart-1: oklch(0.56 0.14 35);
  --chart-2: oklch(0.32 0.07 250);
  --chart-3: oklch(0.76 0.12 85);
  --chart-4: oklch(0.52 0.08 140);
  --chart-5: oklch(0.65 0.01 60);
  --radius: 0px;
  --sidebar: oklch(0.22 0.02 50);
  --sidebar-foreground: oklch(0.975 0.008 80);
  --sidebar-primary: oklch(0.76 0.12 85);
  --sidebar-primary-foreground: oklch(0.22 0.02 50);
  --sidebar-accent: oklch(0.30 0.02 50);
  --sidebar-accent-foreground: oklch(0.975 0.008 80);
  --sidebar-border: oklch(0.30 0.02 50);
  --sidebar-ring: oklch(0.76 0.12 85);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}
```

Key changes:
- Deleted `@custom-variant dark` directive
- Deleted entire `.dark {}` block
- All colors now use Isotype palette OKLCH values
- `--radius: 0px` zeros out all computed radius variables
- Added semantic tokens: `--terracotta`, `--navy`, `--gold`, `--olive`, `--cream`, `--brown`
- Added Tailwind theme mappings: `--color-terracotta`, `--color-navy`, `--color-gold`, `--color-olive`, `--color-cream`, `--color-brown`
- Sidebar colors set to brown bg / cream text
- `--ring` set to gold for focus states
- `--destructive` set to terracotta

- [ ] **Step 2: Verify the app builds**

Run: `npx next build 2>&1 | head -30`
Expected: Build succeeds (or only pre-existing errors)

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "theme: replace palette with Isotype colors, remove dark mode, zero border-radius"
```

---

### Task 2: Meta — layout.tsx themeColor + manifest.json

**Files:**
- Modify: `app/layout.tsx:10-12`
- Modify: `public/manifest.json:7-8`

- [ ] **Step 1: Update app/layout.tsx themeColor**

In `app/layout.tsx`, change:
```typescript
export const viewport: Viewport = {
  themeColor: "#6366f1",
};
```
to:
```typescript
export const viewport: Viewport = {
  themeColor: "#2c2420",
};
```

- [ ] **Step 2: Update manifest.json**

In `public/manifest.json`, change:
```json
  "background_color": "#ffffff",
  "theme_color": "#6366f1",
```
to:
```json
  "background_color": "#faf6f0",
  "theme_color": "#2c2420",
```

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx public/manifest.json
git commit -m "theme: update themeColor and manifest colors to Isotype palette"
```

---

### Task 3: UI Primitives — button, badge, card, input, textarea, dialog, sheet, scroll-area, tabs

**Files:**
- Modify: `components/ui/button.tsx`
- Modify: `components/ui/badge.tsx`
- Modify: `components/ui/card.tsx`
- Modify: `components/ui/input.tsx`
- Modify: `components/ui/textarea.tsx`
- Modify: `components/ui/dialog.tsx`
- Modify: `components/ui/sheet.tsx`
- Modify: `components/ui/scroll-area.tsx`
- Modify: `components/ui/tabs.tsx`

All changes are CSS class updates — removing border-radius, shadows, dark: prefixes, and updating to Isotype styling.

- [ ] **Step 1: Update button.tsx**

In `components/ui/button.tsx`, the `buttonVariants` base classes (line 9):

Change:
```typescript
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
```
to:
```typescript
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
```

Changes: removed `rounded-lg`, removed `active:translate-y-px`, removed `dark:` prefixes, added `uppercase tracking-wide`, changed `font-medium` to `font-bold`, changed `transition-all` to `transition-colors`.

In the `variant` object, update `outline` and `destructive`:

Change the `outline` variant from:
```typescript
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
```
to:
```typescript
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
```

Change the `ghost` variant from:
```typescript
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
```
to:
```typescript
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
```

Change the `destructive` variant from:
```typescript
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
```
to:
```typescript
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
```

In the `size` variants, remove all `rounded-[min(var(--radius-md),Xpx)]` references and `in-data-[slot=button-group]:rounded-lg`:

Change the `xs` size from:
```typescript
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
```
to:
```typescript
        xs: "h-6 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
```

Change the `sm` size from:
```typescript
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
```
to:
```typescript
        sm: "h-7 gap-1 px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
```

Change the `"icon-xs"` size from:
```typescript
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
```
to:
```typescript
        "icon-xs":
          "size-6 [&_svg:not([class*='size-'])]:size-3",
```

Change the `"icon-sm"` size from:
```typescript
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
```
to:
```typescript
        "icon-sm": "size-7",
```

- [ ] **Step 2: Update badge.tsx**

In `components/ui/badge.tsx`, the `badgeVariants` base classes (line 8):

Change:
```typescript
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
```
to:
```typescript
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border border-transparent px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3!",
```

Changes: removed `rounded-4xl`, changed `text-xs` to `text-[9px]`, `font-medium` to `font-extrabold`, added `uppercase tracking-wider`, `transition-all` to `transition-colors`, removed `dark:` prefix.

In the variant `destructive`, change:
```typescript
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
```
to:
```typescript
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 [a]:hover:bg-destructive/20",
```

In the variant `ghost`, change:
```typescript
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
```
to:
```typescript
          "hover:bg-muted hover:text-muted-foreground",
```

- [ ] **Step 3: Update card.tsx**

In `components/ui/card.tsx`, change the Card className (line 14-15):

From:
```typescript
        "group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
```
to:
```typescript
        "group/card flex flex-col gap-4 overflow-hidden bg-card py-4 text-sm text-card-foreground border-2 border-brown has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0",
```

Changes: removed `rounded-xl`, replaced `ring-1 ring-foreground/10` with `border-2 border-brown`, removed `*:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl`.

In CardHeader, change the className (line 27-28):

From:
```typescript
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
```
to:
```typescript
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
```

Change: removed `rounded-t-xl`.

In CardFooter, change the className (line 86-87):

From:
```typescript
        "flex items-center rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3",
```
to:
```typescript
        "flex items-center border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3",
```

Change: removed `rounded-b-xl`.

- [ ] **Step 4: Update input.tsx**

In `components/ui/input.tsx`, change the className (line 11-12):

From:
```typescript
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
```
to:
```typescript
        "h-8 w-full min-w-0 border-b-2 border-border bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-brown focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive md:text-sm",
```

Changes: removed `rounded-lg`, changed `border border-input` to `border-b-2 border-border` (bottom-border only), focus uses `border-brown` with no ring, removed all `dark:` prefixes.

- [ ] **Step 5: Update textarea.tsx**

In `components/ui/textarea.tsx`, change the className (line 9-10):

From:
```typescript
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
```
to:
```typescript
        "flex field-sizing-content min-h-16 w-full border-2 border-border bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-brown focus-visible:ring-0 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive md:text-sm",
```

Changes: removed `rounded-lg`, `border border-input` → `border-2 border-border`, removed ring on focus, removed `dark:` prefixes.

- [ ] **Step 6: Update dialog.tsx**

In `components/ui/dialog.tsx`, change DialogContent className (line 55-56):

From:
```typescript
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-background p-4 text-sm ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
```
to:
```typescript
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 bg-background p-4 text-sm border-2 border-brown duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
```

Changes: removed `rounded-xl`, replaced `ring-1 ring-foreground/10` with `border-2 border-brown`.

Change DialogFooter className (line 104-105):

From:
```typescript
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
```
to:
```typescript
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
```

Change: removed `rounded-b-xl`.

- [ ] **Step 7: Update sheet.tsx**

In `components/ui/sheet.tsx`, change SheetContent className (line 55-56):

From:
```typescript
          "fixed z-50 flex flex-col gap-4 bg-background bg-clip-padding text-sm shadow-lg transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
```
to:
```typescript
          "fixed z-50 flex flex-col gap-4 bg-background bg-clip-padding text-sm border-2 border-brown transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
```

Changes: removed `shadow-lg`, replaced with `border-2 border-brown`.

- [ ] **Step 8: Update scroll-area.tsx**

In `components/ui/scroll-area.tsx`, change ScrollAreaPrimitive.Viewport className (line 21):

From:
```typescript
        className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
```
to:
```typescript
        className="size-full transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
```

Change: removed `rounded-[inherit]`.

- [ ] **Step 9: Update tabs.tsx**

In `components/ui/tabs.tsx`, change the TabsList base classes (line 27):

From:
```typescript
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
```
to:
```typescript
  "group/tabs-list inline-flex w-fit items-center justify-center p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
```

Changes: removed `rounded-lg` and `data-[variant=line]:rounded-none`.

Change both variants:

Default variant from:
```typescript
        default: "bg-muted",
```
to:
```typescript
        default: "border-b-[2.5px] border-brown bg-transparent gap-1",
```

Line variant from:
```typescript
        line: "gap-1 bg-transparent",
```
to:
```typescript
        line: "border-b-[2.5px] border-brown bg-transparent gap-1",
```

Change the TabsTrigger className (lines 60-64). Replace the full className string:

From:
```typescript
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
```
to:
```typescript
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 border border-transparent px-1.5 py-0.5 text-sm font-bold uppercase tracking-wide whitespace-nowrap text-muted-foreground transition-colors group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "data-active:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-[3px] group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 data-active:after:opacity-100",
```

Changes: removed `rounded-md`, removed all `dark:` prefixes, removed shadow classes, removed bg changes on active, added `uppercase tracking-wide font-bold`, `after:h-0.5` → `after:h-[3px]`, simplified active state to text-only + underline via `::after`, active underline always shows (not just for line variant).

- [ ] **Step 10: Verify build**

Run: `npx next build 2>&1 | head -30`
Expected: Build succeeds

- [ ] **Step 11: Commit**

```bash
git add components/ui/button.tsx components/ui/badge.tsx components/ui/card.tsx components/ui/input.tsx components/ui/textarea.tsx components/ui/dialog.tsx components/ui/sheet.tsx components/ui/scroll-area.tsx components/ui/tabs.tsx
git commit -m "ui: update all primitives for Isotype style — no radius, no shadows, uppercase, heavy borders"
```

---

### Task 4: Navigation — app-nav.tsx with SVG pictograms + Isotype styling

**Files:**
- Modify: `components/nav/app-nav.tsx`

- [ ] **Step 1: Rewrite app-nav.tsx**

Replace the full contents of `components/nav/app-nav.tsx` with:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', color: 'text-terracotta', strokeColor: 'stroke-terracotta' },
  { href: '/journal', label: 'Journal', color: 'text-olive', strokeColor: 'stroke-olive' },
  { href: '/goals', label: 'Goals', color: 'text-navy', strokeColor: 'stroke-navy' },
  { href: '/chapters', label: 'Chapters', color: 'text-gold', strokeColor: 'stroke-gold' },
] as const

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M4 16L16 5L28 16" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
      <path d="M7 14V27H13V20H19V27H25V14" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
    </svg>
  )
}

function JournalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="6" y="4" width="20" height="24" stroke="currentColor" strokeWidth="3" />
      <line x1="11" y1="11" x2="21" y2="11" stroke="currentColor" strokeWidth="2.5" />
      <line x1="11" y1="16" x2="21" y2="16" stroke="currentColor" strokeWidth="2.5" />
      <line x1="11" y1="21" x2="17" y2="21" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  )
}

function GoalsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="3" />
      <circle cx="16" cy="16" r="7" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="16" cy="16" r="2.5" fill="currentColor" />
    </svg>
  )
}

function ChaptersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <line x1="8" y1="4" x2="8" y2="28" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
      <path d="M8 5H24L19 11L24 17H8" stroke="currentColor" strokeWidth="3" strokeLinejoin="miter" fill="none" />
    </svg>
  )
}

const icons = { '/': HomeIcon, '/journal': JournalIcon, '/goals': GoalsIcon, '/chapters': ChaptersIcon } as const

export function AppNav() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-[2.5px] border-brown bg-cream md:hidden">
        <ul className="flex items-center justify-around">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const Icon = icons[item.href as keyof typeof icons]
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-2 transition-colors',
                    active ? item.color : 'text-brown hover:text-brown/70'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[7px] font-extrabold uppercase tracking-[1px]">
                    {item.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-56 border-r-[2.5px] border-brown bg-brown md:block">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center px-6">
            <span className="text-[10px] font-extrabold uppercase tracking-[3px] text-gold">
              Compass
            </span>
          </div>
          <nav className="flex-1 px-3 py-2">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href)
                const Icon = icons[item.href as keyof typeof icons]
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 text-[11px] font-bold uppercase tracking-[1.5px] transition-colors',
                        active
                          ? item.color
                          : 'text-cream hover:text-cream/70'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}
```

Key changes:
- Replaced lucide icons with custom thick-outline geometric SVG pictograms
- Each nav item has a category color (terracotta/olive/navy/gold)
- Mobile: cream bg, 2.5px brown top border, 7px uppercase labels
- Desktop: brown bg, cream text, gold brand label
- Active state uses category color for both icon and label

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | head -30`

- [ ] **Step 3: Commit**

```bash
git add components/nav/app-nav.tsx
git commit -m "nav: replace lucide icons with Isotype pictograms, add category colors"
```

---

### Task 5: App Layout — header + auth layout

**Files:**
- Modify: `app/(app)/layout.tsx`
- Modify: `app/(auth)/layout.tsx`

- [ ] **Step 1: Update app layout with header**

Replace the full contents of `app/(app)/layout.tsx` with:

```tsx
import { AppNav } from '@/components/nav/app-nav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      {/* Mobile header */}
      <header className="sticky top-0 z-40 border-b-[2.5px] border-brown bg-brown px-4 py-3 md:hidden">
        <span className="text-[10px] font-extrabold uppercase tracking-[3px] text-gold">
          Compass
        </span>
      </header>
      <main className="pb-20 md:pb-0 md:pl-56">
        <div className="mx-auto max-w-2xl px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
```

Changes: Added mobile header (brown bg, gold "COMPASS" label), same layout structure.

- [ ] **Step 2: Update auth layout**

In `app/(auth)/layout.tsx`, change:
```tsx
    <div className="min-h-screen flex items-center justify-center bg-background">
```
to:
```tsx
    <div className="min-h-screen flex items-center justify-center bg-cream">
```

- [ ] **Step 3: Commit**

```bash
git add app/(app)/layout.tsx app/(auth)/layout.tsx
git commit -m "layout: add Isotype header with brown bg + gold brand, cream auth background"
```

---

### Task 6: Login Page

**Files:**
- Modify: `app/(auth)/login/page.tsx`

- [ ] **Step 1: Restyle login page**

In `app/(auth)/login/page.tsx`, change the outer container div:

From:
```tsx
    <div className="w-full max-w-sm mx-4 rounded-xl bg-card p-6 text-card-foreground ring-1 ring-foreground/10">
```
to:
```tsx
    <div className="w-full max-w-sm mx-4 bg-card p-6 text-card-foreground border-2 border-brown">
```

Change the title:
From:
```tsx
        <h1 className="text-2xl font-semibold">Compass</h1>
        <p className="text-sm text-muted-foreground mt-1">Your life purpose & goal tracker</p>
```
to:
```tsx
        <h1 className="text-2xl font-extrabold uppercase tracking-[1px]">Compass</h1>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">Your life purpose & goal tracker</p>
```

Change the button:
From:
```tsx
        className="w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
```
to:
```tsx
        className="w-full flex items-center justify-center gap-3 border-2 border-brown bg-brown px-4 py-3 text-sm font-bold uppercase tracking-wide text-cream transition-colors hover:bg-brown/80 disabled:opacity-50"
```

- [ ] **Step 2: Commit**

```bash
git add app/(auth)/login/page.tsx
git commit -m "login: restyle with Isotype typography and brown button"
```

---

### Task 7: Home Page — stat blocks + Isotype styling

**Files:**
- Modify: `app/(app)/page.tsx`
- Modify: `components/home/daily-prompt-card.tsx`
- Modify: `components/home/today-tasks-card.tsx`
- Modify: `components/home/latest-entry-card.tsx`

- [ ] **Step 1: Update home page with stat blocks**

Replace `app/(app)/page.tsx` with:

```tsx
import { createClient } from '@/lib/supabase/server'
import { DailyPromptCard } from '@/components/home/daily-prompt-card'
import { TodayTasksCard } from '@/components/home/today-tasks-card'
import { LatestEntryCard } from '@/components/home/latest-entry-card'
import type { JournalEntry } from '@/lib/supabase/types'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? ''

  const today = new Date().toISOString().split('T')[0]

  // Fetch today's tasks (due today or earlier, not done)
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .lte('due_date', today)
    .neq('status', 'done')
    .order('created_at', { ascending: true })

  // Fetch latest journal entry with linked goals
  const { data: entries } = await supabase
    .from('journal_entries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)

  const latestEntry = (entries as JournalEntry[] | null)?.[0] ?? null

  let entryWithGoals = null

  if (latestEntry) {
    const entryId = latestEntry.id

    const { data: linkedGoals } = await supabase
      .from('journal_entry_goals')
      .select('goal_id')
      .eq('journal_entry_id', entryId)

    const goalIds = (linkedGoals as { goal_id: string }[] | null)?.map((lg) => lg.goal_id) ?? []

    let goals: { id: string; title: string }[] = []
    if (goalIds.length > 0) {
      const { data: goalsData } = await supabase
        .from('goals')
        .select('id, title')
        .in('id', goalIds)

      goals = (goalsData as { id: string; title: string }[] | null) ?? []
    }

    entryWithGoals = { ...latestEntry, goals }
  }

  // Fetch current chapter
  const { data: chapters } = await supabase
    .from('chapters')
    .select('name, emoji')
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)

  const currentChapter = (chapters as { name: string; emoji: string | null }[] | null)?.[0] ?? null

  // Stat block counts
  const { count: goalCount } = await supabase
    .from('goals')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: entryCount } = await supabase
    .from('journal_entries')
    .select('id', { count: 'exact', head: true })

  const greeting = getGreeting()
  const taskCount = tasks?.length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-extrabold uppercase tracking-[1px]">
          {greeting}
          {firstName ? `, ${firstName}` : ''}
        </h1>
        {currentChapter && (
          <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {currentChapter.emoji ? `${currentChapter.emoji} ` : ''}
            {currentChapter.name}
          </p>
        )}
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[2px] text-muted-foreground">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Stat blocks */}
      <div className="flex">
        <div className="flex-1 bg-terracotta p-4 text-center">
          <div className="text-[26px] font-black text-cream">{taskCount}</div>
          <div className="text-[8px] font-extrabold uppercase tracking-[2px] text-cream">Tasks</div>
        </div>
        <div className="flex-1 bg-navy p-4 text-center">
          <div className="text-[26px] font-black text-cream">{goalCount ?? 0}</div>
          <div className="text-[8px] font-extrabold uppercase tracking-[2px] text-cream">Goals</div>
        </div>
        <div className="flex-1 bg-olive p-4 text-center">
          <div className="text-[26px] font-black text-cream">{entryCount ?? 0}</div>
          <div className="text-[8px] font-extrabold uppercase tracking-[2px] text-cream">Entries</div>
        </div>
      </div>

      <DailyPromptCard />
      <TodayTasksCard initialTasks={tasks ?? []} />
      <LatestEntryCard entry={entryWithGoals} />
    </div>
  )
}
```

Changes: Added stat block queries (goalCount, entryCount), stat block UI with flush color blocks, uppercase typography throughout.

- [ ] **Step 2: Update daily-prompt-card.tsx**

Replace `components/home/daily-prompt-card.tsx` with:

```tsx
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
```

Changes: removed gradient, rounded-xl, shadow, active:scale. Gold flat block, brown text, uppercase label.

- [ ] **Step 3: Update today-tasks-card.tsx**

Replace `components/home/today-tasks-card.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import type { Task } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

export function TodayTasksCard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks)

  async function toggleTask(task: Task) {
    const newStatus = task.status === 'done' ? 'todo' : 'done'

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    )

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      )
    }
  }

  return (
    <div>
      <div className="text-[9px] font-extrabold uppercase tracking-[2px] text-foreground mb-3">
        Today&apos;s Tasks
      </div>
      {tasks.length === 0 ? (
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">No tasks due today.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0 transition-colors hover:bg-[#f0ebe0]"
            >
              <button
                onClick={() => toggleTask(task)}
                className={cn(
                  'flex h-[15px] w-[15px] shrink-0 items-center justify-center border-[2.5px] transition-colors',
                  task.status === 'done'
                    ? 'border-olive bg-olive'
                    : 'border-brown'
                )}
                aria-label={`Mark "${task.title}" as ${task.status === 'done' ? 'todo' : 'done'}`}
              >
                {task.status === 'done' && (
                  <svg className="h-2.5 w-2.5 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span
                className={cn(
                  'text-[13px] font-semibold uppercase tracking-[0.5px]',
                  task.status === 'done' && 'text-muted-foreground line-through'
                )}
              >
                {task.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

Changes: removed Card wrapper. Square checkboxes (15px, 2.5px border, no radius). Done = olive fill. Uppercase text. Hover row bg.

- [ ] **Step 4: Update latest-entry-card.tsx**

Replace `components/home/latest-entry-card.tsx` with:

```tsx
import Link from 'next/link'
import type { JournalEntry, Goal } from '@/lib/supabase/types'

type EntryWithGoals = JournalEntry & { goals: Pick<Goal, 'id' | 'title'>[] }

export function LatestEntryCard({ entry }: { entry: EntryWithGoals | null }) {
  if (!entry) {
    return (
      <div className="border-2 border-brown p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          No journal entries yet.{' '}
          <Link href="/journal/new" className="text-navy underline">
            Write your first entry
          </Link>
        </p>
      </div>
    )
  }

  const date = new Date(entry.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div>
      <div className="text-[9px] font-extrabold uppercase tracking-[2px] text-foreground mb-3">
        Latest Entry
      </div>
      <Link
        href={`/journal/${entry.id}`}
        className="block border-b border-border py-2.5 transition-colors hover:bg-[#f0ebe0]"
      >
        <p className="text-sm font-bold uppercase tracking-[0.5px]">{entry.title ?? 'Untitled'}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">{date}</p>
        {entry.goals.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {entry.goals.map((goal) => (
              <span
                key={goal.id}
                className="inline-flex items-center bg-navy px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-cream"
              >
                {goal.title}
              </span>
            ))}
          </div>
        )}
      </Link>
    </div>
  )
}
```

Changes: removed Card/Badge wrappers. Flat row style. Inline navy badges for goals. Uppercase throughout.

- [ ] **Step 5: Verify build**

Run: `npx next build 2>&1 | head -30`

- [ ] **Step 6: Commit**

```bash
git add app/(app)/page.tsx components/home/daily-prompt-card.tsx components/home/today-tasks-card.tsx components/home/latest-entry-card.tsx
git commit -m "home: add stat blocks, gold prompt card, square checkboxes, flat entry row"
```

---

### Task 8: Journal Page — entry card, tabs, prompts-list, whatif-list, editor

**Files:**
- Modify: `app/(app)/journal/page.tsx:89-94` — heading typography
- Modify: `app/(app)/journal/new/page.tsx:24` — heading typography
- Modify: `app/(app)/journal/[id]/page.tsx:40` — heading typography
- Modify: `components/journal/entry-card.tsx`
- Modify: `components/journal/journal-tabs.tsx`
- Modify: `components/journal/prompts-list.tsx`
- Modify: `components/journal/whatif-list.tsx`
- Modify: `components/journal/entry-editor.tsx`

- [ ] **Step 1: Update journal page heading**

In `app/(app)/journal/page.tsx`, change line 90:
```tsx
        <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
```
to:
```tsx
        <h1 className="text-[22px] font-extrabold uppercase tracking-[1px]">Journal</h1>
```

- [ ] **Step 2: Update new entry page heading**

In `app/(app)/journal/new/page.tsx`, change:
```tsx
      <h1 className="text-xl font-bold tracking-tight">New Entry</h1>
```
to:
```tsx
      <h1 className="text-[22px] font-extrabold uppercase tracking-[1px]">New Entry</h1>
```

- [ ] **Step 3: Update edit entry page heading**

In `app/(app)/journal/[id]/page.tsx`, change:
```tsx
      <h1 className="text-xl font-bold tracking-tight">Edit Entry</h1>
```
to:
```tsx
      <h1 className="text-[22px] font-extrabold uppercase tracking-[1px]">Edit Entry</h1>
```

- [ ] **Step 4: Update entry-card.tsx**

Replace `components/journal/entry-card.tsx` with:

```tsx
import Link from 'next/link'
import type { JournalEntry, Goal, Chapter } from '@/lib/supabase/types'

export type EntryWithRelations = JournalEntry & {
  goals: Pick<Goal, 'id' | 'title'>[]
  chapter: Pick<Chapter, 'name' | 'emoji'> | null
}

const typeBadgeColor: Record<string, string> = {
  journal: 'bg-olive',
  prompt: 'bg-gold',
  whatif: 'bg-terracotta',
}

export function EntryCard({ entry }: { entry: EntryWithRelations }) {
  const date = new Date(entry.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Link
      href={`/journal/${entry.id}`}
      className="block border-b border-border py-3 transition-colors hover:bg-[#f0ebe0]"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold uppercase tracking-[0.5px]">
          {entry.title ?? 'Untitled'}
        </p>
        <p className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {date}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        <span
          className={`inline-flex items-center px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-cream ${typeBadgeColor[entry.entry_type] ?? 'bg-olive'}`}
        >
          {entry.entry_type === 'whatif' ? 'What If' : entry.entry_type}
        </span>
        {entry.goals.map((goal) => (
          <span
            key={goal.id}
            className="inline-flex items-center bg-navy px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-cream"
          >
            {goal.title}
          </span>
        ))}
        {entry.chapter && (
          <span className="inline-flex items-center border-2 border-brown px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-brown">
            {entry.chapter.emoji ? `${entry.chapter.emoji} ` : ''}
            {entry.chapter.name}
          </span>
        )}
      </div>
    </Link>
  )
}
```

Changes: removed Card wrapper. Flat row with type badge (olive/gold/terracotta), goal badges (navy), chapter badge (outlined). Uppercase throughout.

- [ ] **Step 5: Update journal-tabs.tsx**

In `components/journal/journal-tabs.tsx`, change:
```tsx
      <TabsList className="w-full">
```
to:
```tsx
      <TabsList className="w-full" variant="line">
```

This will use the line variant which we've already updated with bottom-border style.

- [ ] **Step 6: Update prompts-list.tsx**

Replace `components/journal/prompts-list.tsx` with:

```tsx
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
```

Changes: removed Card wrapper. Flat rows with gold "PROMPT" badge.

- [ ] **Step 7: Update whatif-list.tsx**

Replace `components/journal/whatif-list.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { JournalEntry } from '@/lib/supabase/types'

export function WhatIfList({ entries }: { entries: JournalEntry[] }) {
  const router = useRouter()
  const [question, setQuestion] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = question.trim()
    if (!trimmed) return
    router.push(
      `/journal/new?prompt=${encodeURIComponent(trimmed)}&type=whatif`
    )
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="What would you do if..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={!question.trim()}>
          Go
        </Button>
      </form>

      {entries.length === 0 ? (
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          No What If entries yet. Type a question above to get started.
        </p>
      ) : (
        <div>
          {entries.map((entry) => {
            const date = new Date(entry.created_at).toLocaleDateString(
              'en-US',
              { month: 'short', day: 'numeric', year: 'numeric' }
            )

            return (
              <button
                key={entry.id}
                type="button"
                className="w-full text-left border-b border-border py-3 transition-colors hover:bg-[#f0ebe0]"
                onClick={() => router.push(`/journal/${entry.id}`)}
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center bg-terracotta px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-cream">
                    What If
                  </span>
                  <p className="text-sm font-semibold">
                    {entry.prompt ?? 'Untitled'}
                  </p>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5 ml-[calc(2px+theme(spacing.2)*2+theme(spacing.2))]">{date}</p>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

Changes: removed Card wrapper. Flat rows with terracotta "WHAT IF" badge.

- [ ] **Step 8: Update entry-editor.tsx**

In `components/journal/entry-editor.tsx`, update the prompt display (lines 97-108):

From:
```tsx
        <div
          className={`rounded-xl p-4 ${
            entryType === 'whatif'
              ? 'bg-orange-50 text-orange-900 dark:bg-orange-950 dark:text-orange-100'
              : 'bg-violet-50 text-violet-900 dark:bg-violet-950 dark:text-violet-100'
          }`}
        >
          <p className="text-sm font-medium opacity-75">
            {entryType === 'whatif' ? 'What if...' : 'Prompt'}
          </p>
          <p className="mt-1 font-semibold">{prompt}</p>
        </div>
```
to:
```tsx
        <div
          className={`p-4 ${
            entryType === 'whatif'
              ? 'bg-terracotta text-cream'
              : 'bg-gold text-brown'
          }`}
        >
          <p className="text-[9px] font-extrabold uppercase tracking-[2px]">
            {entryType === 'whatif' ? 'What If' : 'Prompt'}
          </p>
          <p className="mt-1 font-semibold">{prompt}</p>
        </div>
```

Update the editor prose attributes (line 48):
From:
```tsx
          'prose prose-sm dark:prose-invert min-h-[200px] max-w-none rounded-lg border bg-background px-4 py-3 focus:outline-none',
```
to:
```tsx
          'prose prose-sm min-h-[200px] max-w-none border-2 border-brown bg-background px-4 py-3 focus:outline-none',
```

Update goal badges (lines 124-132):
From:
```tsx
              <button key={goal.id} type="button" onClick={() => toggleGoal(goal.id)}>
                <Badge
                  variant={selectedGoalIds.includes(goal.id) ? 'default' : 'outline'}
                >
                  {goal.title}
                </Badge>
              </button>
```
to:
```tsx
              <button
                key={goal.id}
                type="button"
                onClick={() => toggleGoal(goal.id)}
                className={`inline-flex items-center px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider transition-colors ${
                  selectedGoalIds.includes(goal.id)
                    ? 'bg-navy text-cream'
                    : 'border-2 border-navy text-navy'
                }`}
              >
                {goal.title}
              </button>
```

Remove the `Badge` import from line 10 (since it's no longer used in this file).

- [ ] **Step 9: Verify build**

Run: `npx next build 2>&1 | head -30`

- [ ] **Step 10: Commit**

```bash
git add app/(app)/journal/page.tsx app/(app)/journal/new/page.tsx app/(app)/journal/\[id\]/page.tsx components/journal/entry-card.tsx components/journal/journal-tabs.tsx components/journal/prompts-list.tsx components/journal/whatif-list.tsx components/journal/entry-editor.tsx
git commit -m "journal: Isotype entry cards, tabs, editor with color-coded badges"
```

---

### Task 9: Goals Page — pictogram progress, square checkboxes

**Files:**
- Modify: `app/(app)/goals/page.tsx`
- Modify: `components/goals/goal-card.tsx`
- Modify: `components/goals/task-item.tsx`
- Modify: `components/goals/goal-form.tsx`

- [ ] **Step 1: Update goals page heading + empty state**

In `app/(app)/goals/page.tsx`, change line 52:
```tsx
        <h1 className="text-2xl font-bold tracking-tight">Goals &amp; Tasks</h1>
```
to:
```tsx
        <h1 className="text-[22px] font-extrabold uppercase tracking-[1px]">Goals &amp; Tasks</h1>
```

Change the empty state (lines 61-65):
```tsx
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No goals yet. Create your first goal to get started.
          </p>
        </div>
```
to:
```tsx
        <div className="border-2 border-brown p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            No goals yet. Create your first goal to get started.
          </p>
        </div>
```

- [ ] **Step 2: Update goal-card.tsx with pictogram progress**

Replace `components/goals/goal-card.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { TaskItem } from './task-item'
import { calculateGoalProgress } from '@/lib/goal-utils'
import type { Goal, Task } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

export type GoalWithData = Goal & {
  tasks: Task[]
  journal_entry_goals: { journal_entry_id: string }[]
  subGoals?: GoalWithData[]
}

const statusBorderColor: Record<string, string> = {
  active: 'border-l-terracotta',
  completed: 'border-l-olive',
  archived: 'border-l-muted-foreground',
}

const statusBadgeBg: Record<string, string> = {
  active: 'bg-terracotta text-cream',
  completed: 'bg-olive text-cream',
  archived: 'bg-muted-foreground text-cream',
}

export function GoalCard({
  goal,
  depth = 0,
}: {
  goal: GoalWithData
  depth?: number
}) {
  const hasTasks = goal.tasks.length > 0
  const hasSubGoals = (goal.subGoals?.length ?? 0) > 0
  const hasChildren = hasTasks || hasSubGoals

  const [expanded, setExpanded] = useState(depth === 0 && hasChildren)
  const [tasks, setTasks] = useState<Task[]>(goal.tasks)

  const progress = calculateGoalProgress(tasks)

  function handleTaskUpdate(updatedTask: Task) {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    )
  }

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div
        className={cn(
          'border-l-4 border-2 border-brown bg-[#f5f0e8] p-4',
          statusBorderColor[goal.status] ?? 'border-l-muted-foreground'
        )}
      >
        <div className="flex items-start gap-2">
          {hasChildren && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4 shrink-0" />}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold uppercase tracking-[0.5px]">{goal.title}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${statusBadgeBg[goal.status] ?? 'bg-muted-foreground text-cream'}`}>
                {goal.status}
              </span>
              {goal.journal_entry_goals.length > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {goal.journal_entry_goals.length} {goal.journal_entry_goals.length === 1 ? 'entry' : 'entries'}
                </span>
              )}
            </div>

            {/* Pictogram progress dots */}
            {progress.total > 0 && (
              <div className="mt-2 flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {tasks.map((t) => (
                    <div
                      key={t.id}
                      className={cn(
                        'h-2.5 w-2.5',
                        t.status === 'done'
                          ? 'bg-olive'
                          : 'border-[1.5px] border-brown'
                      )}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {progress.done}/{progress.total} Tasks
                </span>
              </div>
            )}
          </div>
        </div>

        {expanded && (
          <div className="mt-3 pl-6 space-y-3">
            {tasks.length > 0 && (
              <ul className="space-y-2">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onUpdate={handleTaskUpdate}
                  />
                ))}
              </ul>
            )}

            {goal.subGoals?.map((subGoal) => (
              <GoalCard
                key={subGoal.id}
                goal={subGoal}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

Changes: removed Card/Badge/Progress imports. Replaced progress bar with pictogram dots (10x10px squares — olive filled for done, brown outlined for remaining). Left border uses terracotta/olive/muted. Status badges are inline spans. Cream-tinted background.

- [ ] **Step 3: Update task-item.tsx**

In `components/goals/task-item.tsx`, update the checkbox button classes (lines 36-42):

From:
```tsx
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
            task.status === 'done'
              ? 'border-green-500 bg-green-500'
              : 'border-muted-foreground/40'
          )}
```
to:
```tsx
          className={cn(
            'flex h-[15px] w-[15px] shrink-0 items-center justify-center border-[2.5px] transition-colors',
            task.status === 'done'
              ? 'border-olive bg-olive'
              : 'border-brown'
          )}
```

Update the checkmark SVG color (line 47):
From: `className="h-3 w-3 text-white"`
To: `className="h-3 w-3 text-cream"`

Update the text classes (lines 62-65):
From:
```tsx
          className={cn(
            'text-sm truncate',
            task.status === 'done' && 'text-muted-foreground line-through'
          )}
```
to:
```tsx
          className={cn(
            'text-[13px] font-semibold uppercase tracking-[0.5px] truncate',
            task.status === 'done' && 'text-muted-foreground line-through'
          )}
```

- [ ] **Step 4: Update goal-form.tsx select elements**

In `components/goals/goal-form.tsx`, update both `<select>` elements' className:

From (lines 109 and 129):
```tsx
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
```
to:
```tsx
              className="flex h-8 w-full border-2 border-border bg-transparent px-2.5 py-1 text-sm font-bold uppercase tracking-wide transition-colors outline-none focus-visible:border-brown"
```

- [ ] **Step 5: Delete unused progress component**

If `components/ui/progress.tsx` exists, delete it — it is now dead code since goal-card no longer imports it.

Run: `rm -f components/ui/progress.tsx`

- [ ] **Step 6: Verify build**

Run: `npx next build 2>&1 | head -30`

- [ ] **Step 7: Commit**

```bash
git add app/(app)/goals/page.tsx components/goals/goal-card.tsx components/goals/task-item.tsx components/goals/goal-form.tsx
git commit -m "goals: pictogram progress dots, square checkboxes, Isotype styling"
```

---

### Task 10: Chapters Page — square timeline, stat blocks

**Files:**
- Modify: `app/(app)/chapters/page.tsx`
- Modify: `components/chapters/chapter-timeline.tsx`
- Modify: `components/chapters/chapter-form.tsx`

- [ ] **Step 1: Update chapters page heading + empty state**

In `app/(app)/chapters/page.tsx`, change line 49:
```tsx
        <h1 className="text-2xl font-bold tracking-tight">Life Chapters</h1>
```
to:
```tsx
        <h1 className="text-[22px] font-extrabold uppercase tracking-[1px]">Life Chapters</h1>
```

Change the empty state (lines 53-58):
```tsx
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No chapters yet. Create your first chapter to begin mapping your life story.
          </p>
        </div>
```
to:
```tsx
        <div className="border-2 border-brown p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            No chapters yet. Create your first chapter to begin mapping your life story.
          </p>
        </div>
```

- [ ] **Step 2: Update chapter-timeline.tsx**

Replace `components/chapters/chapter-timeline.tsx` with:

```tsx
import Link from 'next/link'
import type { Chapter } from '@/lib/supabase/types'

export type ChapterWithCounts = Chapter & {
  goalCount: number
  entryCount: number
  whatifCount: number
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

export function ChapterTimeline({ chapters }: { chapters: ChapterWithCounts[] }) {
  return (
    <div className="relative pl-8">
      {/* Timeline line */}
      <div className="absolute top-0 bottom-0 left-3 w-[3px] bg-brown" />

      <div className="space-y-6">
        {chapters.map((chapter) => {
          const isCurrent = !chapter.ended_at

          return (
            <div key={chapter.id} className="relative">
              {/* Timeline dot — square */}
              <div
                className={`absolute -left-5 top-1.5 ${
                  isCurrent ? 'h-[18px] w-[18px] bg-gold' : 'h-[14px] w-[14px] bg-brown'
                }`}
                style={{ marginTop: isCurrent ? '-2px' : '0' }}
              />

              <div className="border-2 border-brown p-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold uppercase tracking-[0.5px]">
                    {chapter.emoji ? `${chapter.emoji} ` : ''}
                    {chapter.name}
                  </h3>
                  {isCurrent && (
                    <span className="inline-flex items-center bg-gold px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-brown">
                      Current
                    </span>
                  )}
                </div>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {formatDate(chapter.started_at)}
                  {' \u2014 '}
                  {chapter.ended_at ? formatDate(chapter.ended_at) : 'present'}
                </p>

                {/* Stat blocks */}
                <div className="flex mt-3">
                  <Link
                    href={`/goals?chapter=${chapter.id}`}
                    className="flex-1 bg-navy py-2 text-center transition-colors hover:bg-navy/80"
                  >
                    <div className="text-base font-black text-cream">{chapter.goalCount}</div>
                    <div className="text-[7px] font-extrabold uppercase tracking-[1.5px] text-cream">Goals</div>
                  </Link>
                  <Link
                    href={`/journal?chapter=${chapter.id}`}
                    className="flex-1 bg-olive py-2 text-center transition-colors hover:bg-olive/80"
                  >
                    <div className="text-base font-black text-cream">{chapter.entryCount}</div>
                    <div className="text-[7px] font-extrabold uppercase tracking-[1.5px] text-cream">Entries</div>
                  </Link>
                  <Link
                    href={`/journal?chapter=${chapter.id}&type=whatif`}
                    className="flex-1 bg-terracotta py-2 text-center transition-colors hover:bg-terracotta/80"
                  >
                    <div className="text-base font-black text-cream">{chapter.whatifCount}</div>
                    <div className="text-[7px] font-extrabold uppercase tracking-[1.5px] text-cream">What-Ifs</div>
                  </Link>
                </div>
              </div>
            </div>
          )
        })}

        {/* Next chapter placeholder */}
        <div className="relative">
          <div className="absolute -left-5 top-1.5 h-[14px] w-[14px] border-2 border-brown" />
          <div className="border-2 border-brown p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              What comes next? Name your next chapter when you&apos;re ready...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

Changes: removed Badge, rounded corners, gradient line, circles. Square timeline dots (gold=current, brown=past). 3px solid brown timeline line. Flush stat blocks (navy/olive/terracotta). Solid 2px borders on cards. Uppercase throughout. Placeholder uses muted uppercase text instead of italic dashed.

- [ ] **Step 3: Update chapter-form.tsx select styling**

No `<select>` elements in chapter-form.tsx — it only uses Input and Button, which are already updated. No changes needed.

- [ ] **Step 4: Verify build**

Run: `npx next build 2>&1 | head -30`

- [ ] **Step 5: Commit**

```bash
git add app/(app)/chapters/page.tsx components/chapters/chapter-timeline.tsx
git commit -m "chapters: square timeline dots, flush stat blocks, Isotype styling"
```

---

### Task 11: Dark mode class removal

**Files:**
- Multiple component files (grep for `dark:` prefixes)

The `dark:` prefixes in globals.css are already removed (Task 1). This task removes remaining `dark:` class prefixes from component files.

- [ ] **Step 1: Find all files with dark: prefixes**

Run: `grep -r "dark:" --include="*.tsx" --include="*.ts" -l components/ app/`

The UI primitives were already cleaned in Task 3. Scan for remaining instances in page/component files.

- [ ] **Step 2: Remove dark: prefixes from remaining files**

For each file found, remove all `dark:` prefixed classes. Most were already handled in Tasks 3 and 8 (entry-editor.tsx). Check for any remaining and remove them.

Common pattern: delete substrings like `dark:prose-invert`, `dark:bg-orange-950 dark:text-orange-100`, etc.

- [ ] **Step 3: Verify build**

Run: `npx next build 2>&1 | head -30`

- [ ] **Step 4: Commit**

```bash
git add components/ app/
git commit -m "cleanup: remove remaining dark: class prefixes"
```

---

### Task 12: Visual verification

This is a manual verification task — no code changes.

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

- [ ] **Step 2: Verify all pages**

Open in browser and check:
- Home page: stat blocks, gold prompt, square checkboxes, flat entry row
- Journal page: bottom-border tabs, entry rows with colored badges
- Goals page: left-bordered cards, pictogram dots, square checkboxes
- Chapters page: square timeline, flush stat blocks
- Login page: brown card, uppercase title, brown button
- Mobile bottom nav: cream bg, 2.5px brown top border, category colors
- Desktop sidebar: brown bg, cream text, gold brand

- [ ] **Step 3: Check for visual issues**

Verify:
- No rounded corners anywhere
- No shadows
- No dark mode classes remaining
- All text uppercase where specified
- Correct colors on all elements
- Hover states work (slightly darker cream on rows, category colors on nav)

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: visual polish from manual review"
```
