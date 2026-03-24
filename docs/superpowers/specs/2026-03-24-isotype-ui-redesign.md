# Isotype UI Redesign — Design Spec

## Goal

Restyle Compass with an Isotype-inspired visual language (Otto Neurath): warm humanist color palette, thick-outline geometric pictograms, pictogram-based data display, and a full Isotype layout with sharp rectangles, all-uppercase labels, tight grid, and no decoration.

## Architecture

This is a visual reskin. All changes are CSS/theme, component markup, and SVG icon replacements. The existing component structure (pages, layouts, UI primitives) stays intact. One minor server-side addition: the home page will need additional Supabase queries for goal count and entry count to populate the stat blocks.

## Color Palette

| Token | Hex | OKLCH (approx) | Role |
|-------|-----|-----------------|------|
| `cream` | `#faf6f0` | `oklch(0.975 0.008 80)` | Page background, text on dark |
| `brown` | `#2c2420` | `oklch(0.22 0.02 50)` | Primary text, borders, header bg |
| `terracotta` | `#c45d3e` | `oklch(0.56 0.14 35)` | Tasks, active nav, destructive, CTA |
| `navy` | `#1e3a5f` | `oklch(0.32 0.07 250)` | Goals, links |
| `gold` | `#d4a843` | `oklch(0.76 0.12 85)` | Prompts, chapters, brand accent |
| `olive` | `#5a7a52` | `oklch(0.52 0.08 140)` | Completed/success, journal entries |
| `muted` | `#9a9590` | `oklch(0.65 0.01 60)` | Secondary text, disabled |
| `border` | `#d4cfc6` | `oklch(0.85 0.01 70)` | Dividers, subtle borders |

### Color Assignments

- **Tasks category:** terracotta
- **Goals category:** navy
- **Journal entries:** olive
- **Prompts / chapters / highlights:** gold
- **Completed states:** olive fill
- **Active nav item by page:**
  - Home = terracotta
  - Journal = olive
  - Goals = navy
  - Chapters = gold
- **Inactive nav / secondary text:** muted
- **All borders:** brown (heavy, 2-2.5px) or border (subtle, 1px dividers)

## Typography

- **Font:** Inter (already in use, clean sans-serif — fits Isotype spirit)
- **Labels and headings:** `text-transform: uppercase`, `letter-spacing: 1.5-2px`, `font-weight: 700-800`
- **Body text (task names, entry titles):** `text-transform: uppercase`, `letter-spacing: 0.5px`, `font-weight: 600`
- **No italic, no light weights.** Everything bold and clear.
- **Section labels:** 9-10px, weight 800, uppercase, 2px letter-spacing
- **Page titles:** 22px, weight 800, uppercase, 1px letter-spacing

## Layout Principles

- **No rounded corners** — all rectangles are sharp (`border-radius: 0`)
- **No shadows** — use color blocks and whitespace to create hierarchy
- **No gradients** — flat fills only
- **Heavy borders** — 2-2.5px solid brown for structural borders (nav, header)
- **Tight grid** — stat blocks flush against each other (no gaps)
- **Color blocks** — use filled rectangles with white text for stats and badges

## Navigation

### Mobile (Bottom Bar)
- Fixed bottom, full width
- Top border: 2.5px solid brown
- Background: cream
- 4 items: Home, Journal, Goals, Chapters
- Icons: thick-outline geometric SVGs (stroke-width 3, no fill)
- Labels: 7-8px, weight 800, uppercase, 1px letter-spacing
- Active state: icon stroke + label color switches to category color
- Inactive: brown stroke + brown label

### Desktop (Sidebar)
- Fixed left, width 56 (224px)
- Background: brown
- Brand: gold uppercase, letter-spacing 3px
- Same icons rendered in cream, active item gets category color
- Nav items stacked vertically

### Icon Set (SVG, stroke-only, viewBox 0 0 32 32, stroke-width 3)
- **Home:** House silhouette path
- **Journal:** Rectangle with horizontal lines (book)
- **Goals:** Concentric circles (target)
- **Chapters:** Pole + pennant flag

## Component Changes

### globals.css
- Replace all CSS custom properties with the Isotype palette
- Set `--radius: 0` (zeros out all computed radius variables)
- Remove all shadow utilities from theme
- Background: cream, foreground: brown
- **Delete the `.dark {}` block** and remove the `@custom-variant dark` directive
- Add semantic color tokens: `--terracotta`, `--navy`, `--gold`, `--olive` so they can be used as Tailwind classes (e.g., `bg-terracotta`)

### Dark Mode Removal
- Delete `.dark {}` block from `globals.css`
- Grep and remove all `dark:` class prefixes from component files. Key files: `components/ui/button.tsx`, `components/ui/dialog.tsx`, `components/ui/tabs.tsx`, `components/ui/sheet.tsx`, `components/journal/entry-editor.tsx`

### App Header (new — add to `app/(app)/layout.tsx` as `<header>` above `<main>`)
- Dark brown background, full width
- Left: "COMPASS" in gold, 10px, weight 800, letter-spacing 3px
- Right: context info (current chapter, or action button like "+ New")

### Home Page (`app/(app)/page.tsx`)
- Greeting: 22-24px, weight 800, uppercase
- Date: 11px, weight 700, uppercase, muted color
- **Stat blocks:** 3 flush color blocks (terracotta=tasks, navy=goals, olive=entries), each showing count + label
- **Prompt card:** Gold background, brown text, uppercase label, body text normal case
- **Task list:** Section label + rows with square checkboxes (15px, 2.5px border, no radius). Done = olive fill. Text: uppercase, 13px, 600 weight
- **Latest entry:** Title + meta, same row style

### Journal Page (`app/(app)/journal/page.tsx`)
- **Tabs:** Bottom border 2.5px brown. Active tab: brown text + 3px brown underline. Inactive: muted text
- **Entry rows:** Title (14px, 700, uppercase), meta (10px, 700, uppercase, muted), type badge (colored block: olive=journal, terracotta=what-if, gold=prompt), goal badges (navy blocks)
- **Badges:** No border-radius, solid color background, white text, 9px, weight 800, uppercase

### Goals Page (`app/(app)/goals/page.tsx`)
- **Goal cards:** Left border 4px (terracotta=active, olive=completed, muted=archived), cream-tinted background (#f5f0e8)
- **Pictogram progress:** Row of 10x10px squares. Filled (olive) = done, outlined (brown border) = remaining. Label: "3/5 TASKS" next to dots
- **Task items:** Same square checkbox pattern as home
- **Status badges:** Colored blocks (terracotta=active, olive=done)

### Chapters Page (`app/(app)/chapters/page.tsx`)
- **Timeline:** Vertical line 3px, brown color (or border color)
- **Dots:** Squares (not circles). Current: 18px gold fill. Past: 14px brown fill
- **Chapter card:** Name 16px weight 800 uppercase, date 10px muted, "CURRENT" badge in gold
- **Chapter emojis:** Keep user-provided emojis as-is (user content exception)
- **Stat blocks:** 3 flush blocks per chapter (navy=goals, olive=entries, terracotta=what-ifs), same style as home stats but smaller
- **Empty states:** Replace dashed borders with solid 2px brown border, remove italic text, use muted uppercase text instead

### Login Page (`app/(auth)/login/page.tsx`)
- Cream background, centered
- Card: no border-radius, ring replaced with 2px solid brown border
- "COMPASS" title: 24px, weight 800, uppercase
- Subtitle: muted, uppercase
- Button: brown background, cream text, uppercase, no border-radius, full width

### Journal Editor (`app/(app)/journal/new/page.tsx`, `[id]/page.tsx`)
- Title input: no border-radius, heavy bottom border instead of full border
- Prompt display: gold background (journal prompt) or terracotta background (what-if), no border-radius
- Rich text editor: no border-radius, 2px brown border. Override Tailwind `prose` defaults to use brown text, navy links, no italic blockquotes
- Goal selection: navy square badges (toggle between filled/outlined)
- Save button: brown background, cream text, uppercase

### UI Primitives to Update
- **Button:** Remove all border-radius, update default variant to brown bg / cream text
- **Badge:** Remove border-radius (currently rounded-full), use square blocks
- **Card:** Remove rounded-xl, remove ring shadow, use 2px solid border
- **Tabs:** Replace bg-muted style with bottom-border style
- **Input:** Remove border-radius, use bottom-border style
- **Progress:** Remove entirely — replaced by pictogram dots in goal components
- **Checkbox pattern:** Replace circular checkboxes with 15px square, 2.5px border
- **Select elements:** Remove border-radius, apply brown border styling (used in `goal-form.tsx` and `chapter-form.tsx`)
- **Sheet:** Remove rounded corners and shadows from `components/ui/sheet.tsx`
- **Dialog footer:** Remove `rounded-b-xl` from `components/ui/dialog.tsx`

## Files to Modify

### Theme / Global
- `app/globals.css` — full palette replacement, reset border-radius, remove shadows, delete `.dark` block
- `app/layout.tsx` — update `themeColor` to `#2c2420`
- `public/manifest.json` — update `theme_color` to `#2c2420`, `background_color` to `#faf6f0`

### Layouts
- `app/(app)/layout.tsx` — update sidebar styling (brown bg, cream text)
- `app/(auth)/layout.tsx` — update background to cream

### Navigation
- `components/nav/app-nav.tsx` — replace lucide icons with custom SVG pictograms, update colors and typography

### Pages
- `app/(app)/page.tsx` — restructure to stat blocks + prompt block + task list
- `app/(app)/journal/page.tsx` — update heading style
- `app/(app)/journal/new/page.tsx` — update editor chrome
- `app/(app)/journal/[id]/page.tsx` — same as new
- `app/(app)/goals/page.tsx` — update heading style
- `app/(app)/chapters/page.tsx` — update heading style
- `app/(auth)/login/page.tsx` — restyle card and button

### Components
- `components/home/daily-prompt-card.tsx` — gold block, remove gradient
- `components/home/today-tasks-card.tsx` — square checkboxes, remove card wrapper
- `components/home/latest-entry-card.tsx` — flat row style
- `components/journal/entry-card.tsx` — row with type badge, goal badges
- `components/journal/entry-editor.tsx` — update editor chrome, goal badges
- `components/journal/journal-tabs.tsx` — bottom-border tab style
- `components/journal/prompts-list.tsx` — flat rows, gold accent
- `components/journal/whatif-list.tsx` — flat rows, terracotta accent
- `components/goals/goal-card.tsx` — left border, pictogram progress dots
- `components/goals/goal-form.tsx` — update dialog styling
- `components/goals/task-item.tsx` — square checkbox
- `components/chapters/chapter-timeline.tsx` — square dots, stat blocks
- `components/chapters/chapter-form.tsx` — update dialog styling

### UI Primitives
- `components/ui/button.tsx` — remove radius, update default colors
- `components/ui/badge.tsx` — remove rounded-full, use square
- `components/ui/card.tsx` — remove rounded-xl, use solid border
- `components/ui/tabs.tsx` — bottom-border variant as default
- `components/ui/input.tsx` — remove radius
- `components/ui/dialog.tsx` — remove radius, fix footer rounded-b-xl
- `components/ui/textarea.tsx` — remove radius
- `components/ui/sheet.tsx` — remove radius and shadows
- `components/ui/scroll-area.tsx` — remove rounded-[inherit]

## Testing

- Visual only — no logic changes, so no new unit tests needed
- Verify all pages render correctly after theme changes
- Check mobile (bottom nav) and desktop (sidebar) layouts
- Verify dark mode is removed or adapted (spec uses light-only palette)

## Hover & Focus States

- **Buttons:** On hover, lighten background slightly (e.g., brown -> brown/80). Focus: 2px gold outline offset.
- **Task rows / entry rows:** On hover, background shifts to `#f0ebe0` (slightly darker cream).
- **Nav items:** On hover, text/icon color shifts to category color.
- **Inputs:** On focus, border changes from border color to brown 2px.
- **Keep existing `transition-colors` on interactive elements** — remove `transition-transform` and `active:scale` effects.

## Out of Scope

- Dark mode (Isotype aesthetic is light-on-cream; can be added later)
- New pages or features
- Animation or transitions (except subtle color transitions on interactive elements)
