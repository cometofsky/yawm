# Three redesign proposals for iyyam

Owner selected **Nocturne** on 2026-10-24. Its implementation scope is recorded in [the product spec](../specs/NOCTURNE/product.md) and [technical plan](../specs/NOCTURNE/tech.md). The following preserves the three proposals prepared for selection. The application and its current design system have not been replaced. Previews use illustrative data, not calculated prayer times or verified calendar conversions. Preview controls are static; motion below is proposed, not demonstrated.

## Purpose and success

Iyyam is an always-on household Islamic desk clock, designed to be read across a room from an older iPad. The primary task is to read local time, then the current waqt and remaining time, then the Hijri date. At arm’s length, the user can select a city, adjust the predicted Hijri date, browse the three calendars and customize the display.

The implementation also supports Standard/Hanafi Asr, Iftar, the daily prayer timetable, London/Sydney clocks, month navigation, calendar highlighting and day details. Those functions must survive a redesign, including settings that hide optional sections. PRODUCT.md is intentionally concise; the additional supported interactions were verified in the components and useSettings.ts.

The incumbent uses near-identical rounded dark cards and separate color accents for each calendar. The proposals replace that visual organization while preserving product truth: local clock primary, wider but quieter waqt area, visible manual Hijri correction, offline operation and old-iPad usability. Light animation means restrained movement, not a mandatory light color theme.

## Daylight

[Open the Daylight sketch](../.impeccable/mocks/decision/daylight.html).

A cool porcelain household object: blue-white ground, ink-blue numerals, softly raised white clock surface and recessed controls. The largest local digits occupy the narrower field; the wider waqt field carries smaller, quieter countdown figures. Three-calendar information is composed as a clear lower area, followed by the month grid.

- Palette: porcelain #edf2f6, ink #16334b, white #ffffff, muted teal #377b78.
- Typography: steady fixed-width ticking figures; plain, highly legible system labels. Final font sourcing follows selection and must work offline.
- Touch and motion: a shallow 1px press response; 160–200ms release; month changes crossfade; panels enter once in 200ms.
- Reach: porcelain date-detail sheet, recessed location search, clearly seated selected segments in settings.
- Main trade-off: a pale always-on surface may be too bright at night. No automatic theme switching is assumed; resolve night behavior before implementation.

## Nocturne

[Open the Nocturne sketch](../.impeccable/mocks/decision/nocturne.html).

An evening clock with deep plum surfaces, pearl digits and warm amber prayer cues. A centered clock occupies the upper field; a wider horizontal waqt band below remains dimmer, and compact date and world-clock rails reduce the current card stack. Rich color replaces generic black-and-gray chrome.

- Palette: aubergine #221c29, pearl #f2e9e0, bronze #bb9a71, plum #38303f.
- Typography: large fixed-width numerals, calm system labels, fewer uppercase headings.
- Touch and motion: inset toggles and steppers depress on contact; 180–220ms sheet transitions; clock digits update directly without blinking or flipping.
- Reach: plum settings surface, high-contrast location results, quiet bronze calendar selection and date details.
- Main trade-off: secondary prayer/date text must remain legible across the room and cannot be dimmed just to suggest atmosphere.

## Meridian

[Open the Meridian sketch](../.impeccable/mocks/decision/meridian.html).

A mineral-teal field with strong local numerals and a single continuous prayer timeline. The clock and wider waqt region share an intentional baseline, while the timetable explains the day as a sequence. Gregorian, Hijri and Bengali dates remain clearly labeled; the timeline supplements exact times rather than replacing them.

- Palette: mineral teal #123f43, milk #f0f5ec, pale green #a5c9bf, sand #e2b77c.
- Typography: bold fixed-width time and straightforward readable labels; spacing carries the hierarchy.
- Touch and motion: a selected prayer marker settles briefly; month selection uses one short horizontal transition with a fade fallback; control feedback is 160–200ms.
- Reach: solid teal settings rails, a clear city-search surface and a three-calendar month grid using the same selection vocabulary.
- Main trade-off: the prayer timeline must not compete with the clock, or shrink its labels into illegibility on the iPad.

## Shared interaction and responsive contract

These are proposed implementation requirements, not features completed by these sketches:

- Landscape preserves a wider waqt area and a more prominent clock. Portrait places the clock first and increases its readable scale; phones stack clock, waqt and the Hijri correction before supporting content.
- The manual ± correction stays beside the predicted Hijri date, with explicit labels. Maghrib rollover, region offset and manual correction remain independent.
- All current display toggles survive. When prayers are disabled, the clock expands. Hidden optional sections reclaim space without leaving holes.
- City search remains an accessible combobox with keyboard and touch support; missing coordinates invite city selection while the clock stays visible. No geolocation permission blocks reading.
- Loading reserves numeral geometry. No valid prediction shows an explicit unavailable state. Date details show all enabled calendar information and return focus on close.
- Visible focus, at least 44px touch targets, readable contrast and reduced-motion alternatives are required. Nothing continuously animates except existing time/progress updates.
- The selected design will cover the home screen, month grid, date detail, location picker, settings and loading/unavailable states as one system.
- Modern browser appearance is only one gate. Actual iOS 10.3.4 Safari operation, both iPad orientations, offline use and the transpiled static export need evidence during implementation.

## Accessibility and color themes — added owner scope

Every proposal now shows a persistent person-in-circle Accessibility button with a visible label and a 44px minimum touch target. Appearance opens the selected design’s color-theme choices. The sidebar swatches visualize Original, Slate, Forest and Warm; these are illustrative choices, not functioning theme switching in the sketches.

The implementation will provide a clearly labeled accessibility panel with text sizing (100%, 125%, 150%, 200%), high contrast, reduced motion, larger controls and display luminance choices. It will respect operating-system motion preferences, permit browser zoom and reflow, and supply keyboard access, visible focus, semantic labels, non-color state cues and controlled screen-reader announcements by default. A ticking timer must not announce every second. In-app luminance changes affect the page, not device hardware brightness.

Theme previews must reflect the complete interface and maintain contrast; color cannot be the only way to distinguish calendars or current prayer. Store these preferences locally, and reset them independently of city, Asr method and Hijri correction. Each theme remains part of the chosen visual world. Working controls and their behavior remain implementation scope after direction selection.

## Selection and implementation

The owner selected Nocturne, then requested the thickest practical offline typography for a repurposed 2014 iPad used as a desk/wall clock. This instruction replaces the preview’s fine serif styling with heavy sans-serif dates, prayer names and labels. The three original sketches remain historical comparison artifacts.

The implementation is recorded in [the product spec](../specs/NOCTURNE/product.md) and [technical plan](../specs/NOCTURNE/tech.md). Current engineering checks, device acceptance and deployment limits belong to TASKS.md. Deployment/publication remain outside the authorized scope.

## Proposal-stage verification

The following records the earlier proposal stage, before application implementation.

Rendered all three sketches at 1440×900, 1024×768, 768×1024 and 390×844 in Chromium. Inspected desktop/iPad-landscape and phone captures; after the correction batch, recaptured all three at desktop size, including Nocturne’s centered composition. The final visual references, recaptured at 1440×1000 after adding accessibility/theme controls, are [Daylight](../.impeccable/review/daylight-final.png), [Nocturne](../.impeccable/review/nocturne-final.png) and [Meridian](../.impeccable/review/meridian-final.png). After the accessibility/theme additions, all three were also recaptured and inspected at 390×844. The labeled Accessibility and Appearance buttons fit the phone header. Portrait iPad was captured before those additions, not visually accepted. A static source check confirmed the calendar cell sequence, illustrative-data disclaimer, utility content and absence of JavaScript/external resources in each sketch.

Documentation gate: `node scripts/check-docs.mjs` (result recorded in TASKS.md). Application files are unchanged, so application build/domain gates were not run for this proposal task. These sketches do not verify live calculations, animated behavior, full interaction flows, contrast ratios or legacy Safari compatibility. The browser plugin’s prescribed runtime was unavailable in this session; the available Playwright browser tool supplied captures. Two batch capture calls wrote their images but did not return completion and were terminated; subsequent direct navigation/screenshot calls returned successfully for the final Nocturne capture. No runtime correctness claim depends on the incomplete batch responses.

Impeccable also reported that PRODUCT.md predates its current context schema. This does not invalidate the project’s product rules; an optional `impeccable init` can refresh that format separately.
