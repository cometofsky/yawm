---
name: iyyam
description: "Nocturne: a bold, quiet household timepiece in plum, pearl and bronze."
colors:
  nocturne-bg: "#211b27"
  nocturne-surface: "#2a212e"
  nocturne-surface-raised: "#372b3b"
  nocturne-text: "#f7ecee"
  nocturne-muted: "#c7b4c4"
  nocturne-accent: "#dfc09a"
  nocturne-line: "#665267"
  nocturne-selected-text: "#241b28"
  nocturne-calendar-gregorian: "#e5d7e4"
  nocturne-calendar-hijri: "#c9d8bb"
  nocturne-calendar-bengali: "#e7b99c"
  slate-bg: "#19232c"
  slate-surface: "#202f3b"
  slate-surface-raised: "#2d4050"
  slate-text: "#edf3f8"
  slate-muted: "#b7cad7"
  slate-accent: "#c8d6e7"
  slate-line: "#526d81"
  slate-selected-text: "#182631"
  slate-calendar-gregorian: "#e5edf5"
  slate-calendar-hijri: "#bfdbd1"
  slate-calendar-bengali: "#e5c8ad"
  forest-bg: "#182a24"
  forest-surface: "#21382f"
  forest-surface-raised: "#2d483c"
  forest-text: "#edf3e8"
  forest-muted: "#b9cebf"
  forest-accent: "#d7d6a6"
  forest-line: "#526f5d"
  forest-selected-text: "#1c3024"
  forest-calendar-gregorian: "#e3e8d5"
  forest-calendar-hijri: "#c4deba"
  forest-calendar-bengali: "#e8c3a7"
  warm-bg: "#2c241e"
  warm-surface: "#372d25"
  warm-surface-raised: "#493c31"
  warm-text: "#fbf0df"
  warm-muted: "#d0beaa"
  warm-accent: "#e8c39e"
  warm-line: "#78604b"
  warm-selected-text: "#302319"
  warm-calendar-gregorian: "#f0e1cd"
  warm-calendar-hijri: "#d1d9b6"
  warm-calendar-bengali: "#edbca0"
  dim-text: "#dacdd3"
  dim-muted: "#c7b6c4"
  dim-accent: "#c4a681"
  high-bg: "#141016"
  high-surface: "#1b171e"
  high-surface-raised: "#2d2432"
  high-text: "#fff"
  high-muted: "#eee3ed"
  high-accent: "#ffe1a8"
  high-line: "#bca8bb"
  high-selected-text: "#141016"
  high-calendar-gregorian: "#fff"
  high-calendar-hijri: "#e3f8cc"
  high-calendar-bengali: "#ffdbbb"
typography:
  display:
    fontFamily: "Menlo, Monaco, Consolas, Courier New, monospace"
    fontSize: "11rem"
    fontWeight: 900
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  countdown:
    fontFamily: "Menlo, Consolas, Courier New, monospace"
    fontSize: "3rem"
    fontWeight: 900
    lineHeight: 1.2
  waqt:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "2.2rem"
    fontWeight: 800
    lineHeight: 1.25
  date:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 900
    lineHeight: 1.5
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontWeight: 800
  label:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 800
rounded:
  day: "8px"
  control: "9px"
  empty: "12px"
  panel: "14px"
  switch: "24px"
spacing:
  compact: "0.5rem"
  control: "0.75rem"
  standard: "1rem"
  panel: "1.25rem"
  section: "1.5rem"
  page: "2.5rem"
components:
  button:
    backgroundColor: "transparent"
    textColor: "{colors.nocturne-text}"
    rounded: "{rounded.control}"
    padding: "0.6rem 0.85rem"
  button-primary:
    backgroundColor: "{colors.nocturne-accent}"
    textColor: "{colors.nocturne-selected-text}"
    rounded: "{rounded.control}"
    padding: "0.6rem 0.85rem"
  waqt-band:
    backgroundColor: "{colors.nocturne-surface}"
    textColor: "{colors.nocturne-muted}"
    rounded: "{rounded.panel}"
    padding: "1.25rem 1.75rem"
  clock:
    textColor: "{colors.nocturne-text}"
    typography: "{typography.display}"
  offset-stepper:
    textColor: "{colors.nocturne-text}"
    rounded: "{rounded.control}"
  switch:
    backgroundColor: "{colors.nocturne-bg}"
    textColor: "{colors.nocturne-muted}"
    height: "44px"
    width: "64px"
    padding: "6px"
  search:
    textColor: "{colors.nocturne-text}"
    rounded: "{rounded.control}"
    padding: "0 0.7rem"
---

# Design System: iyyam

## Overview

**Creative North Star: "Nocturne"**

Nocturne is a matte household timepiece: warm plum grounds, pearl numerals and a restrained bronze accent. Readability from a shelf or wall decides the visual hierarchy. The owner’s distance-reading refinement makes text deliberately heavy, including dates, prayer names and supporting labels.

The interface stays quiet at rest. Tonal recesses, shallow pressed controls and sparse rules provide structure; motion appears only in deliberate interactions. Original, Slate, Forest and Warm are palette variations of the same system.

Source of truth: [the stylesheet](app/globals.css), [page composition](app/page.tsx), and the components under `app/components/`. This reference replaces the pre-redesign black-card system. The selected preview establishes the direction; the finished code, including the owner’s later heavier-type instruction, establishes the actual system. Product behavior lives in [PRODUCT.md](PRODUCT.md); route-specific composition and acceptance live in [the Nocturne spec](specs/NOCTURNE/tech.md).

**Key Characteristics:**

- Largest, brightest fixed-width local numerals; quieter, wider waqt band.
- Heavy offline system type, with bold sans-serif dates and prayer names.
- Visible Hijri sighting adjustment and persistent Accessibility and Appearance entry points.
- Semantic palette variations and reading-comfort settings, with no external assets.

## Colors

### Primary

Bronze is the Original palette’s restrained accent: current waqt, Iftar emphasis, selected switches and primary actions. Pearl carries the local clock and primary content. Values are recorded in frontmatter directly from the semantic CSS variables.

### Secondary

The month grid uses three related content tones: Gregorian pearl, Hijri pale botanical and Bengali muted peach. These support labels and positions; selected states also use weight, underlines, borders or filled surfaces.

### Neutral

The Original palette uses plum ground, a recessed surface and a raised plum surface. Muted text remains intentionally readable. The final shared control border uses the muted-text variable, while separators use the line variable.

Slate replaces the ground with blue slate; Forest uses pine; Warm uses umber. Each includes its own ground, surfaces, text, accent, separators and calendar tones. Dim replaces text, muted and accent values across the selected theme. High contrast overrides the theme and dim settings with a dark ground, white text and stronger separators. System increased-contrast and forced-color preferences have additional CSS accommodations.

Text selection currently uses the Original bronze/plum pair across all themes. It is an observed fixed treatment, not an instruction to add new hard-coded theme colors.

## Typography

Body and controls use Arial/Helvetica/sans-serif at the heaviest available weight requested by the owner. Ticking values use locally available monospace faces. No font files are fetched or shipped. Platform font availability determines whether numeric weights are synthesized; `900` is a CSS request, not proof of a distinct installed face.

- **Local clock:** weight 900, line height 1.05, tracking −0.035em, with a subtle same-color WebKit stroke (0.008em). The desktop size is 11rem from 1200px; compact desktop/tablet uses 17vw; phones through 600px use 24vw. These later viewport rules supersede earlier fallback sizes.
- **Countdown:** weight 900, 3rem desktop, 2.7rem tablet, 10.5vw phone. It remains smaller and quieter than the local clock.
- **Waqt:** bold sans-serif at weight 800, 2.2rem desktop and 1.9rem phone. The earlier preview’s Georgia styling is replaced.
- **Dates:** weight 900; ordinary dates start at 1.25rem, Hijri at 1.6rem, with narrower-layout adjustments. World numerals, calendar day numerals and ribbon times also request 900.
- **Labels and controls:** mostly 0.875–0.9375rem, weight 800. Help text is readable content, not fine print. The clock date is a separate distance-reading line: 3rem on desktop/tablets and 1.5rem on phones, in primary text at weight 900.

Root text size supports 100%, 125%, 150% and 200%. Rem-based text and spacing grow; viewport-sized clock/countdown numerals continue to fit the physical display. Page and dialogs may scroll vertically.

**The Distance First Rule.** Keep local time largest and brightest; make essential labels heavy and readable before adding decorative detail.

## Layout

The one-page composition centers a dominant clock above a wider, quieter horizontal waqt band. The shared container is capped at 78rem. The clock stage is 85% wide, capped at 60rem; the waqt stage is full width, capped at 65rem. On phones the clock stage expands to full width. The prayer ribbon, Hijri-first dateline, month calendar and world clocks continue below.

Page padding changes from 1.5rem × 2.5rem to 1.25rem × 1.5rem at 800px, then 1rem horizontally at 600px. Controls wrap before content clips. Waqt utilities move below the countdown on tablets; phones stack the band and date sections. The smallest header becomes a vertical flow at 360px. The prayer ribbon wraps through a 6.5rem flex basis rather than forcing six columns.

The calendar retains seven aligned columns. Its inner surface is at least 21rem wide, or 24.5rem with larger controls. Its own horizontal scroll container absorbs the extra width; the page does not need to expand. These rem minimums grow with reading size.

**The Seven Columns Rule.** Keep calendar weekdays and days aligned in seven columns; use scoped calendar scrolling when text or touch targets need more room.

## Elevation & Depth

Tonal layering carries the resting screen. The clock is unboxed; the secondary waqt rests on a recessed surface. Buttons gain a raised tonal fill on hover and depress by one pixel on activation. Dialogs alone carry a broad soft shadow (`0 18px 50px rgba(8,4,12,.35)`) over a dark overlay (`rgba(12,8,15,.86)`).

Dialog entry lasts 200ms with ease-out, opacity 0.65→1 and an 8px vertical movement. Controls use 200ms background feedback and 180ms press feedback; calendar hover uses 180ms. Both the explicit reduced-motion setting and system reduced-motion preference disable transitions and animation. No perpetual loading animation remains.

**The Quiet at Rest Rule.** Use short interaction feedback and dialog entry only; do not animate the clock background or continuously pulse loading content.

## Shapes

Controls use gently rounded 9px corners; selected day and option surfaces use 8px. Waqt bands and dialogs use 14px; unavailable/loading surfaces use 12px. Textual On/Off switches use a compact pill outline (24px radius), not a sliding knob. Most calendar cells remain square, separated by fine horizontal rules.

## Components

### Clock and waqt

The local clock uses the brightest text and strongest scale without a surrounding card. Its date is a prominent 3rem, weight-900 line in primary text, reduced to 1.5rem on phones, with centered wrapping for enlarged reading sizes. The waqt name and smaller muted countdown form one compact reading group with a fixed 1.5rem separation on wide screens and a short vertical stack on phones. An explicit “Time left” label links the countdown to the current period. The elapsed line stays with that pair; Iftar and the Standard/Hanafi selector sit separately as supporting controls. The prayer ribbon marks the current period with accent and underline. Asr state is shared by the band and ribbon.

Loading retains meaningful placeholders without animation. Missing coordinates keep available content visible and offer city selection; an unavailable calculation offers another-city recovery. These are real partial-data states, not decorative blank cards.

### Buttons and selectors

Buttons have at least 44px targets; larger-controls mode raises buttons, location options and the city input to at least 56px. Primary buttons use accent with selected-text ink; secondary controls remain transparent until hover. Focus uses a 2px accent outline with 4px offset; calendar focus moves the outline inside the cell. Selected segments combine a filled surface, underline and heavier weight. Disabled buttons use reduced opacity and a default cursor.

Theme choices use miniature clock-face previews with a thicker selected border and checkmark. Their responsive flex basis is 10rem. On/Off switches expose their state in text as well as color.

### Dates and calendar

The Hijri date leads, explicitly marked predicted, with the sighting stepper directly visible. If the Hijri headline is hidden, an adjustment strip remains. The stepper’s current offset uses an output element. Day cells place Gregorian centrally, Hijri above-right and Bengali below-left; calendar highlight reduces other values only to 0.85 opacity. Selecting a day opens all three dates in the shared dialog.

### Search and dialogs

The city input uses a bordered rounded field with an inline search icon, clear action and matching placeholder contrast. Results wrap long names, show the selected city, and provide keyboard combobox navigation. Empty results offer a clear next step.

Location, day details, Appearance and Accessibility use the shared dialog: header and close control, scrollable content and appropriate footer actions. It traps focus, captures/restores the opener, supports Escape, hides the background from assistive technology and locks background scrolling. Icons are existing Lucide SVGs; there are no shipping raster assets.

### Appearance and accessibility

Appearance controls the four palettes and visible sections. Accessibility controls reading size, high contrast, reduced motion, larger controls and luminance. Preferences persist locally; resets are scoped. Visible labels accompany the persistent header actions. Forced-color and system contrast preferences retain usable outlines and state cues.

## Do's and Don'ts

### Do:

- Do use the current palette variables for surfaces, text, accents and borders.
- Do preserve fixed-width ticking numerals and the clock’s primary hierarchy in every palette and orientation.
- Do use the heaviest available offline weights and keep essential labels legible from the device’s intended viewing distance.
- Do keep the Hijri manual adjustment visible even when its headline date is switched off.
- Do preserve visible focus, non-color selected cues and reduced-motion behavior.
- Do use margins and wrapping flex layouts compatible with the legacy CSS pipeline.

### Don't:

- Don't restore the old equal-card hero, calendar gradients or decorative glows.
- Don't replace the selected heavy sans-serif dates and prayer names with the earlier preview’s delicate serif styling.
- Don't load fonts, icons, images or data from remote services at runtime.
- Don't shrink the seven-column calendar to make enlarged controls appear to fit.
- Don't treat desktop Chromium captures or design documentation as acceptance on iOS 10.3.4 hardware.

The documented system describes the final source and the locally reviewed static export. Actual iOS 10.3.4 hardware has not been operated in this verification; device acceptance remains a separate task record.
