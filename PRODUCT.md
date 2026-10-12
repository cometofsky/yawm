# Product rules — iyyam

Current product rules only: what is true **now**. When a rule changes, edit it here in the same
commit as the ADR that changed it, and link the rule to that decision, e.g. `(→ ADR-0003)`.
A rule without an ADR is still valid; write one when the rule is questioned or changed.

## Users and roles

One user, no accounts, no roles: whoever is looking at the screen. Everything is client-side and
stateless apart from the location/offset choice the browser remembers.

## Core flows

The whole product is one screen. The user glances at it from a distance and reads, in this order:
the local time → the current waqt and its countdown → the Hijri date. Picking a city and nudging
the manual ± offset are the only interactions.

## Must / must not

- **The local clock is the primary element; the waqt card is secondary** (→ ADR-0001). It must
  stay clearly visible, just quieter — smaller numerals and lower luminance, never hidden. The
  waqt card keeps the *wider* column because its countdown is a longer string; width runs counter
  to emphasis here deliberately. Do not equalise the two, and do not invert them: they were
  identical once and the user had to ask for hierarchy three times across two sessions.
- **Portrait must preserve that ratio too.** "in portrait mode, make the local time more bigger"
  — the clock is sized to the largest step that fits its column, not to a copy of the landscape
  value.
- **The computed Hijri date is a prediction, never an announcement.** A real Hijri date comes from
  a moon-sighting committee. The manual ± offset is the user's final authority over the app's
  arithmetic and must never be removed, hidden behind a setting, or auto-applied from any source.
- **The target device is a 2014-era iPad (iOS 10.3.4 Safari).** A layout or feature that only
  works on a modern browser is not done. Responsiveness there is a product requirement, not a
  nice-to-have — it is what the app is for.
- **Fully offline after load.** No runtime network call in any flow, including the date path. A
  feature that needs a request does not belong on this screen.
