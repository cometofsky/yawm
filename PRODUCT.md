# Product rules — iyyam

Current product rules only: what is true **now**. When a rule changes, edit it here in the same
commit as the ADR that changed it, and link the rule to that decision, e.g. `(→ ADR-0003)`.
A rule without an ADR is still valid; write one when the rule is questioned or changed.

## Users and roles

One user, no accounts, no roles: whoever is looking at the screen. Everything is client-side and
stateless apart from the location/offset choice the browser remembers.

## Core flows

The product is one page. The user glances from a distance and reads local time → current waqt and countdown → Hijri date. At arm’s length they can pick a city, correct the Hijri prediction, browse month/day details and customize the visible sections, color theme and reading comfort.

## Must / must not

- **The local clock is primary; the waqt band is secondary and wider.** Nocturne, selected by the owner on 2026-10-24, centers the largest and brightest local numerals above a quieter horizontal waqt band. The old side-by-side cards are replaced; the hierarchy recorded in ADR-0001 remains. The clock expands naturally when prayer information is hidden.
- **A waqt name and its countdown are one compact reading group.** Keep them close at every width and label the countdown “Time left”; do not distribute them across opposite sides of the band. Iftar and Asr controls remain supporting information.
- **The date below the main clock is distance-readable information.** Display it much larger and brighter than a caption, with heavy type and wrapping when needed.
- **Distance-first typography:** the owner uses a repurposed 2014 iPad as a desk/wall clock. Use the heaviest available offline font weights, bold sans-serif dates and prayer names, and strong readable labels. The clock may strengthen its stroke slightly; fine print and delicate serif styling must not carry essential information.
- **Portrait keeps local time prominent.** Surrounding content reflows before the clock becomes too small to read. Increased text size may require scrolling; it must not clip controls or dates.
- **The computed Hijri date is a prediction, never an announcement.** A real Hijri date comes from
  a moon-sighting committee. The manual ± offset is the user's final authority over the app's
  arithmetic and must never be removed, hidden behind a setting, or auto-applied from any source.
- **The target device is a 2014-era iPad (iOS 10.3.4 Safari).** A layout or feature that only
  works on a modern browser is not done. Responsiveness there is a product requirement, not a
  nice-to-have — it is what the app is for.
- **Fully offline after load.** No runtime network call in any flow, including the date path. A
  feature that needs a request does not belong on this screen.

## Appearance and accessibility

Owner selected Nocturne on 2026-10-24; its implementation scope is [the product spec](specs/NOCTURNE/product.md). [The comparison](docs/design-proposals.md) preserves the other proposals. These controls are implemented locally; target-device acceptance remains recorded in TASKS.md.

- A persistent header provides an easy-to-find, persistent Accessibility icon/button with an accessible name and at least a 44px touch target. On touch screens, a visible label makes its purpose explicit.
- The Accessibility panel offers text size, high contrast, reduced motion, larger controls and screen luminance choices. Keyboard navigation, screen-reader semantics, visible focus, zoom/reflow and non-color state cues are baseline behavior regardless of options. Respect device accessibility preferences by default.
- Appearance offers four color themes: Nocturne’s Original palette, Slate, Forest and Warm. These are variations of the selected visual system. Every theme must retain readable contrast and distinguishable states.
- Appearance/accessibility choices are remembered locally; their reset is scoped without changing the chosen city or Hijri correction. No network calls.
