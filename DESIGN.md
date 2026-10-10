---
name: iyyam
description: An always-on Islamic desk clock for an old iPad — white numerals on near-black cards, one hue per calendar, read from across a room.
colors:
  page-black: "#000"
  numeral-white: "#fff"
  body-background: "#050505"
  body-foreground: "#ededed"
  surface-lit: "#121212"
  surface-panel: "#111"
  surface-recessed: "#0c0c0c"
  surface-sheet: "#0a0a0a"
typography:
  display:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace"
    fontSize: "4.5rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    letterSpacing: "-0.025em"
  date:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.375
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
  label:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.05em"
rounded:
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  3xl: "24px"
  full: "9999px"
spacing:
  unit: "0.25rem"
components:
  clock-hero:
    backgroundColor: "{colors.surface-lit}"
    textColor: "{colors.numeral-white}"
    typography: "{typography.display}"
    rounded: "{rounded.3xl}"
    padding: "20px"
  waqt-card:
    backgroundColor: "{colors.surface-recessed}"
    typography: "{typography.headline}"
    rounded: "{rounded.3xl}"
    padding: "20px"
  calendar-card:
    backgroundColor: "{colors.surface-lit}"
    typography: "{typography.date}"
    rounded: "{rounded.3xl}"
    padding: "20px"
  world-clock-pill:
    backgroundColor: "{colors.surface-recessed}"
    textColor: "{colors.numeral-white}"
    rounded: "{rounded.2xl}"
    padding: "10px 16px"
  prayer-ribbon:
    backgroundColor: "{colors.surface-recessed}"
    rounded: "{rounded.2xl}"
    padding: "8px"
  modal-settings:
    backgroundColor: "{colors.surface-lit}"
    rounded: "{rounded.3xl}"
    padding: "20px"
  modal-panel:
    backgroundColor: "{colors.surface-panel}"
    rounded: "{rounded.3xl}"
  button-primary:
    backgroundColor: "{colors.numeral-white}"
    textColor: "{colors.page-black}"
    rounded: "{rounded.xl}"
    padding: "8px 16px"
  switch:
    rounded: "{rounded.full}"
    height: "24px"
    width: "44px"
---

# Design System: iyyam

<!-- Source of truth: app/globals.css (the only CSS file: body colours/font and the @theme
     block) and the Tailwind classes in app/page.tsx and app/components/*.tsx — there is no
     tailwind.config and no shared primitive file, so the components ARE the system. This file
     describes them; when the two disagree, the code wins and this file is the bug. There is one
     theme (dark). The anchors below fail when this file drifts. -->
<!-- claim: cmd=`grep -cF -e '--background: #050505' -e '--foreground: #ededed' -e '--font-mono: ui-monospace, SFMono-Regular, Menlo' -e 'font-family: Arial, Helvetica, sans-serif' app/globals.css` expect=`4` -->
<!-- claim: cmd=`grep -cF -e 'bg-[#121212] border border-white/10 shadow-2xl' -e 'bg-[#0c0c0c] px-4 py-2.5 rounded-2xl' app/components/Clock.tsx` expect=`2` -->
<!-- claim: cmd=`grep -cF -e 'rounded-3xl bg-[#0c0c0c] border border-white/10 p-5 sm:p-6 md:p-7' -e 'font-bold font-mono text-white/70' app/components/PrayerDisplay.tsx` expect=`2` -->
<!-- claim: cmd=`grep -cF -e 'md:grid-cols-8' -e 'md:col-span-5' -e 'md:col-span-3' app/page.tsx` expect=`3` -->

## 1. Overview

**Creative North Star: "The Desk Clock"** — the code's own name for its layout
(`app/page.tsx`: "Desk-clock layout optimized for iPad 4 / desktop clock"; `CONTEXT.md`: "read
from across a room"). One static screen on a 2014-era iPad propped on a shelf: big white
numerals on near-black rounded cards, everything else small and dimmed. The user glances and
reads, in order, the local time, then the current waqt and its countdown, then the Hijri date
(`docs/product.md`).

The page is always dark. There is no light theme, no `dark:` variant and no
`prefers-color-scheme` branch (0 `dark:` uses). Depth comes from three near-black surface steps
(`#121212` lit, `#111` panel, `#0c0c0c` recessed) on a `bg-black` page, with `white/NN`
opacity steps for all text and hairlines. Hue is used as a **label per calendar or feature**:
blue for Gregorian, emerald for Hijri, orange for Bengali, amber for prayer.

The hero hierarchy is a recorded product decision, not taste (→ ADR-0001): the local clock is
primary, the waqt card is secondary, and the waqt card still gets the **wider** column.

**Key Characteristics:**
- Single dark theme; page `bg-black text-white` (`app/page.tsx`).
- No design-token layer: values are Tailwind v4 defaults plus four arbitrary hex surfaces
  written inline (`bg-[#121212]` ×5, `bg-[#0c0c0c]` ×6, `bg-[#111]` ×2, `bg-[#0a0a0a]` ×1).
- Text and borders are white at fixed opacities: `border-white/10` (25 uses) is the hairline;
  `text-white/90` (21), `/80` (13), `/60` (9), `/50` (14) and `/40` (13) are the text steps.
- Large rounding: `rounded-3xl` (24px) on every card and modal, `rounded-2xl` (16px) on
  pills and inner wells, `rounded-xl` (12px) on buttons and cells.
- Dense small type around very large numerals: `text-xs` (32 uses) and `text-sm` (20) carry
  the UI; the clock goes to `text-9xl`.
- Arial everywhere except the numerals: `font-mono` (7 uses) is the system monospace stack
  (see Typography).
- Built for iOS 10.3.4 Safari: `postcss.config.mjs` targets `ios_saf >= 10` and flattens
  `oklab()`; flex `gap` is avoided in favour of `space-x-*` / `space-y-*` (33 / 16 uses).
- Motion is colour fades only: `transition-colors` (27), `duration-200` (7) / `-300` (4),
  `animate-pulse` on loading placeholders, and a 200ms opacity fade-in on the three modal
  overlays (`animate-in fade-in`, plain CSS keyframes in `app/globals.css`). A
  `prefers-reduced-motion: reduce` rule in `app/globals.css` cuts every animation and
  transition to 0.01ms.

## 2. Colors

Near-black greys and white opacity steps, plus one Tailwind palette hue per calendar.

### Primary
There is no single brand accent. Hue is a per-domain label, always a Tailwind v4 palette step
(defined in OKLCH by Tailwind; no hex is copied here):
- **Gregorian Blue** (`blue-400` text and icons, `blue-500` fills): Gregorian card icon and
  top bar (`from-blue-400 to-indigo-500`), the "today" cell in the month grid
  (`bg-blue-500/10 border-blue-400/50` plus a blue glow), the World Clocks and Gregorian
  switches, and the text-selection colour (`selection:bg-blue-500/30` in `app/layout.tsx`).
- **Hijri Emerald** (`emerald-400` / `emerald-500`): Hijri card icon and top bar
  (`from-emerald-400 to-teal-500`), Hijri day numbers in the month grid, the "· after
  Maghrib" note, the location picker's active row (`bg-emerald-500/20`) and focus border
  (`focus-within:border-emerald-400/60`), and the dot on the current prayer.
- **Bengali Orange** (`orange-400` / `orange-500`): Bengali card icon and top bar
  (`from-orange-400 to-amber-500`), Bengali day numbers, the Bengali switch.
- **Prayer Amber** (`amber-300` / `amber-400`): the waqt name (`text-amber-300/80`), the
  progress bar (`bg-amber-300/60`), the current prayer cell in the ribbon (solid `bg-amber-300`
  with black text), the Iftar label, the Prayer Times switch and the active display-mode
  segment (`bg-amber-400 text-black`). The local clock's map pin is `amber-400/80`.
- Waqt icons each take their own hue (`PrayerDisplay.tsx` `getWaqtIcon`): Fajr `amber-300`,
  Sunrise `amber-400`, Dhuhr `yellow-400`, Asr `orange-400`, Maghrib `rose-400`, Isha
  `indigo-300`. The monthly-grid switch is `indigo-500`.

Measured usage: emerald 19, blue 18, amber 15, orange 13, indigo 3, rose 2, yellow 1, teal 1.

### Neutral
- **Page Black** (#000, Tailwind `black`): the `<main>` background. Also the text colour on
  amber and white fills.
- **Numeral White** (#fff, Tailwind `white`): the local clock and world-clock numerals, the
  primary button fill, every `white/NN` text and border step.
- **Lit Surface** (#121212): the primary local clock card, the three calendar cards and the
  settings modal. The brightest surface, always with a shadow (`shadow-2xl` or `shadow-xl`).
- **Panel Surface** (#111): the monthly calendar container and the location picker.
- **Recessed Surface** (#0c0c0c): the waqt card, world-clock pills, the prayer ribbon and the
  prayer loading/empty states. Sits below the lit surface on purpose (`Clock.tsx` comment).
- **Sheet Surface** (#0a0a0a): the "Detailed View" day modal only.
- **Body Background / Foreground** (#050505 / #ededed): `--background` / `--foreground` on
  `body` in `app/globals.css`. Both are painted over by `<main>`'s `bg-black text-white`, so
  neither is what a user sees on the main screen.
- **Hairline** (`border-white/10`): the default 1px border on every card, modal and pill;
  `border-white/5` for inner wells and dividers.
- Overlays: `bg-black/80` + `backdrop-blur-sm` behind settings; `bg-black/90` behind the
  location picker and day modal.

### Named Rules
**The One-Hue-Per-Calendar Rule.** Gregorian is blue, Hijri is emerald, Bengali is orange,
everywhere they appear: card, grid, legend, detail modal and settings switch. This is a
measured pattern across `CalendarDisplay.tsx`, `MonthlyCalendar.tsx` and `SettingsModal.tsx`,
not a written rule.

**The Dim-Amber Rule.** The waqt card's amber is deliberately desaturated (`amber-300/80`) so
it cannot out-shout the white local clock. ADR-0001 records that a saturated amber heading once
made the secondary card read louder.

## 3. Typography

**Text Font:** Arial (Helvetica, sans-serif fallback), set on `body` in `app/globals.css` — all
headings, labels and body copy
**Numeral Font:** the Mono Font below — the Display and Headline numerals
**Mono Font:** the system monospace stack (`ui-monospace, SFMono-Regular, Menlo, …,
monospace`), set as `--font-mono` in `@theme` in `app/globals.css`. No font file is loaded (the
app is offline-only); Menlo / Courier ship with iOS 10. Used by every ticking or tabular numeral:
the local clock, world clocks, waqt countdown, ribbon times, Iftar time and the Hijri offset
value. (`--font-sans` still points at an undefined `var(--font-geist-sans)`; `body` sets Arial,
so it has no visible effect.)

**Character:** plain system faces used at two extremes: tight, bold, very large monospace
numerals and small uppercase sans labels with wide tracking.

### Hierarchy
- **Display** (700, `text-5xl` → `sm:text-6xl` → `md:text-7xl`, i.e. 3rem → 4.5rem, line
  height 1, `tracking-tight`): the local clock in the split hero. Pure white. When prayer
  times are switched off it becomes the full-width hero at `text-6xl` → `text-8xl` →
  `md:text-9xl` (8rem), centred.
- **Headline** (700, `text-3xl` → `lg:text-5xl`, line height 1, `tracking-tight`): the waqt
  countdown at `text-white/70`, sized to about 1/1.6 of the clock numeral.
- **Title** (800, `text-xl` → `md:text-3xl`, `tracking-tight`): the page heading "Universal
  Time" at `text-white/90`; the waqt name (`text-2xl` → `sm:text-3xl`, uppercase, amber).
  The monthly calendar uses 700 at `text-2xl` / `md:text-3xl`.
- **Date** (600, `text-xl` → `sm:text-2xl`, `leading-snug` 1.375): the date line on each
  calendar card, `text-white/90`, `break-words`.
- **Body** (500, `text-sm`; captions `text-xs`): settings row titles at `text-white/90`,
  descriptions at `text-white/50`. The location list uses `text-[15px]`, the search input
  `text-base`.
- **Label** (600, `text-xs` or `text-[10px]` / `text-[11px]`, uppercase, `tracking-wider`
  0.05em; `tracking-widest` 0.1em on the two hero labels): "Current Waqt", the clock's city,
  card headings ("Gregorian", "Hijri"), weekday headers and section titles in settings.

### Named Rules
**The Fixed-Width-Digits Rule.** Every ticking numeral carries `font-mono`, which now resolves
to a real monospace face, so its digits do not shift width as they change. Don't drop
`font-mono` from a ticking string: in proportional Arial a centred or right-aligned countdown
visibly jitters (about 12px spread at 72px, measured on canvas, `lessons_learned.md`).

## 4. Elevation

A hybrid of tonal steps and Tailwind's default black shadows. On a black page the shadows are
faint; the surface step (`#121212` against `#0c0c0c`) does most of the work. ADR-0001 names
"surface elevation" as one of the four channels that separate the local clock from the waqt
card: the clock is lit `#121212` with `shadow-2xl`, the waqt card is recessed `#0c0c0c` with
no shadow.

### Shadow Vocabulary
- **Hero / modal** (`shadow-2xl`: `0 25px 50px -12px #00000040`): the primary local clock,
  settings modal, monthly calendar, location picker and day modal (5 uses).
- **Calendar card** (`shadow-xl`: `0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a`): the
  three calendar cards (3 uses).
- **Current prayer** (`shadow-lg`): the solid amber cell in the prayer ribbon (1 use).
- **Day cell** (`shadow-sm`): every month-grid cell (1 class, applied per cell).
- **Glows** (coloured, grid only): today's cell `shadow-[0_0_15px_rgba(59,130,246,0.3)]`; on
  legend hover or keyboard focus, `drop-shadow-[0_0_8px_…]` in blue, emerald, orange or white on the matching
  day numbers.
- Recessed surfaces (`#0c0c0c`) carry no shadow, by design.

### Named Rules
**The Recessed-Stays-Flat Rule.** A `#0c0c0c` surface never gets a shadow. The lit surface plus
shadow belongs to the primary local clock; giving it to the waqt card or a world clock re-creates
the tie ADR-0001 exists to break (`Clock.tsx` comments).

## 5. Components

There is no primitive library: each component in `app/components/` writes its own classes, so
the same pattern is repeated rather than shared (the switch is copied six times in
`SettingsModal.tsx`). Icons are `lucide-react`, mostly `w-3.5`–`w-5` (14–20px), up to
`w-6`–`w-8` in headers and the day modal.

### Buttons
- **Primary** ("Done" in settings): `bg-white text-black`, `font-semibold text-xs`,
  `px-4 py-2`, `rounded-xl` (12px); hover `bg-white/90`. The only filled button.
- **Icon buttons** (settings cog, modal close, clear search): no fill, `text-white/40`–`/50`,
  `p-1.5`–`p-2`, `rounded-xl`; hover to `text-white` and `bg-white/5`–`/10`. Exception: the
  day modal's close button is `rounded-full bg-white/5 text-white/60`. Month navigation
  uses a filled variant: `p-3 bg-white/5 border border-white/10 rounded-xl`, `active:scale-95`.
- **Text button** ("Reset to defaults"): `text-xs text-white/50`, hover `text-white/80` and
  `bg-white/5`, `rounded-lg`.
- **Segmented toggles:** a `rounded-xl` track (`bg-black/40`–`/50`, `border-white/10`, `p-0.5`
  or `p-1`) holding `rounded-lg` segments. Active Asr segment `bg-white/20 text-white` with
  `aria-pressed`; active display-mode segment `bg-amber-400 text-black`.
- **Focus:** elements that set `focus:outline-none` replace it with a ring: the settings cog
  `focus-visible:ring-2 focus-visible:ring-white/20`, the six switches
  `focus-visible:ring-2 focus-visible:ring-white/80` (about 11:1 against the settings well,
  computed). Other buttons keep the browser's default outline.

### Chips / Pills
- **Iftar pill:** `rounded-xl bg-white/5 border border-white/10 px-2.5 py-1`, an amber
  uppercase `text-[10px]` label then the time.
- **Switch:** `role="switch"` with `aria-checked`, `h-6 w-11 rounded-full` (24×44px), off
  `bg-white/20`, on in the section's hue (blue, amber, emerald, orange, indigo); a 16px knob
  slides `translate-x-1` → `translate-x-6`.
- **Hijri offset stepper:** `bg-white/10 rounded-lg p-0.5 border-white/10` with `−` / `+`
  icon buttons (`p-1`, 14px icon) around a `text-xs` value. Each button has a `title` and an
  `aria-label` ("Shift Hijri date back / forward one day"). `docs/product.md` forbids removing or hiding this control.

### Cards / Containers
- **Corner Style:** `rounded-3xl` (24px) on every card and modal (13 uses).
- **Background:** lit `#121212` (local clock, calendar cards), recessed `#0c0c0c` (waqt card),
  panel `#111` (monthly calendar). See Colors.
- **Border:** `border border-white/10`.
- **Shadow Strategy:** see Elevation.
- **Top bar:** calendar cards and the waqt card carry a 4px (`h-1`) gradient strip across the top
  in their hue, at 70% opacity on calendar cards and 40% on the waqt card.
- **Internal Padding:** `p-5 sm:p-6` (20 → 24px); the waqt card adds `md:p-7`; the full-width
  clock hero uses `p-6 sm:p-10 md:p-12`; the monthly calendar `p-4 sm:p-6 md:p-8`.
- **Inner wells:** settings groups `bg-white/5 rounded-2xl p-4 border-white/5`; icon wells on
  card headers `p-2 rounded-xl bg-<hue>-500/15`.

### Inputs / Fields
- **Location search** (`LocationPicker.tsx`, a WAI-ARIA combobox because `<datalist>` renders
  nothing on iOS 10): `bg-white/5 border border-white/10 rounded-2xl px-3`, input `text-base
  py-3`, placeholder `white/30`.
- **Focus:** the wrapper border turns emerald (`focus-within:border-emerald-400/60`), 200ms.
- **Options:** `min-h-[48px] rounded-xl px-3 py-3`; active `bg-emerald-500/20 text-white`;
  selected shows an emerald check. "Recent" header is a `text-[11px]` uppercase label.

### Navigation
There is no navigation bar. The header is the centred page title plus the absolute-positioned
settings cog on the right. Everything else is one scrolling column (`max-w-6xl`, centred).

### Signature: the Desk-Clock Hero
`app/page.tsx` lays the hero out as an 8-column grid from `md:` up: the waqt card takes
`md:col-span-5`, the local clock `md:col-span-3`. Below `md:` both stack full width. The clock
is primary through scale (about 1.5× the countdown), luminance (`#fff` against `white/70`),
surface (`#121212` + shadow against flat `#0c0c0c`) and chroma (white against dim amber). When
prayer times are off, the clock alone fills the hero, centred at up to `text-9xl`.

### Monthly Calendar
A 7-column grid of `rounded-xl` cells (`h-16` → `xl:h-32`), each showing three numbers: the
Gregorian day centred, the Hijri day top-right (emerald, bold) and the Bengali day bottom-left
(orange). Hovering or keyboard-focusing a legend entry dims the other two systems to `opacity-20`.
Cells and legend entries are `<button>`s (each cell's `aria-label` is its full Gregorian date;
the legend buttons wrap their content in an inner flex `<span>`, because iOS 10 Safari cannot
make a `<button>` a flex container). Clicking or pressing a cell opens the `#0a0a0a` "Detailed View" modal, one tinted
row per calendar (`bg-<hue>-500/10 border-<hue>-500/20 rounded-2xl`).

## 6. Do's and Don'ts

### Do:
- **Do** keep the local clock primary and the waqt card secondary on all four channels at once:
  numeral scale, luminance, surface elevation and accent chroma (ADR-0001, `docs/product.md`).
- **Do** keep the waqt card in the wider column (`md:col-span-5` against `md:col-span-3`). Width
  runs counter to emphasis on purpose, because the countdown is the longer string.
- **Do** size the clock in portrait to the largest step that fits its column, not to a copy of
  the landscape value ("in portrait mode, make the local time more bigger", `docs/product.md`).
- **Do** check every layout on the target, a 2014-era iPad on iOS 10.3.4 Safari. A layout that
  only works on a modern browser is not done (`docs/product.md`).
- **Do** use `space-x-*` / `space-y-*` between flex children. Tailwind v4 emits bare `gap:` with
  no fallback, and flex `gap` is dropped on iOS 10 (`lessons_learned.md`). No flex row uses
  `gap-*`; the remaining `gap-*` classes are on grids.
- **Do** answer CSS-support questions against the built `out/_next/static/**/*.css`, which is
  the only place they can be answered (`lessons_learned.md`).
- **Do** measure contrast by painting the colour to a canvas, with a known-failing control.
  Tailwind v4 emits `oklab()` / `color-mix()`, and regex-parsing `getComputedStyle()` reports
  nonsense such as 1.02:1 (`lessons_learned.md`).
- **Do** keep a calendar's hue consistent everywhere it appears: blue Gregorian, emerald Hijri,
  orange Bengali.

### Don't:
- **Don't** equalise or invert the two hero cards, and don't tune only one channel. They were
  identical once and the user had to ask for hierarchy three times (ADR-0001).
- **Don't** give a recessed `#0c0c0c` surface a shadow, or move the waqt card onto `#121212`.
- **Don't** drop `font-mono` from a ticking numeral, or point `--font-mono` back at a font that
  is not available offline: the digits would fall back to proportional Arial and jitter.
- **Don't** create a `tailwind.config`. Tailwind v4 is configured CSS-first in `app/globals.css`
  (`docs/agents/do-not-guess.md`).
- **Don't** load a web font, icon font or any other asset from the network. The app must be fully
  offline after load (`docs/product.md`); this is also why no Geist font is loaded.
- **Don't** expect other `tailwindcss-animate` classes to work. No animation plugin is installed;
  `animate-in fade-in` works only because `app/globals.css` defines that exact pair (200ms
  opacity fade, cut by the reduced-motion rule).
- **Don't** remove, hide or auto-apply the Hijri manual ± offset control. It is the user's final
  authority over the computed date (`docs/product.md`).
