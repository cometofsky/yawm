# Lessons Learned

## 2026-06-27 — Hijri date "always wrong, even when location granted"

Root cause was a chain, not one bug:
- On the HTTPS (certbot) deploy, the IP fallback `fetch('http://ip-api.com')` is mixed-content-blocked (free tier is HTTP-only — no URL tweak rescues it).
- `getCurrentPosition({ timeout: 5000, maximumAge: 0 })` demands a fresh fix in 5s; a Wi-Fi iPad 4 (no GPS, iOS 10) fires the error callback even when permission is granted → lands in the same broken fallback.
- The `Intl` fallback used `'en-US-u-ca-islamic'`, which on Safari 10 **silently renders Gregorian** (not a throw) — so the card showed a Gregorian date mislabeled as Hijri. That's why it was "always wrong", not merely approximate.
- Headline (aladhan) and grid (`Intl`) used different sources and diverged ±1 day (e.g. Eid 27 May 2026).

Fix: dropped the network/`Intl` date path entirely. Added `app/lib/umalqura.ts` — an embedded Umm al-Qura month-length table (1440–1475 AH) + pure-ES5 converter, generated from and verified against Node's `islamic-umalqura` (0/12645 mismatches, `scripts/verify-umalqura.js`). Card + grid now share one offline source; the manual ± knob absorbs local moon-sighting differences. Geolocation kept only as a non-blocking timezone-label flag.

Takeaways:
- A naive tabular/Kuwaiti Hijri algorithm is off Umm al-Qura by 1–2 days on ~279/365 days — not acceptable; embed a verified table instead.
- Old-Safari `Intl` non-Gregorian calendars fail *silently* (wrong output), not loudly — never trust them on legacy targets.
- For an offline wall-clock display, location-dependence is fragility with no accuracy payoff; the calibration knob covers the real (sighting) variance.

## 2026-06-27 — npm deprecation warnings (inflight, glob@7)

Both warnings traced to a single dev dep: `@babel/cli@7` → `glob@7` → `inflight` (the Safari-10 `postbuild` transpiler). Couldn't fix via npm `overrides`: no non-deprecated `glob` keeps the v7 `.sync` API that `@babel/cli@7` calls, and `glob@8` still pulls `inflight`. Upgrading to `@babel/cli@8` forces a whole Babel-8 migration (`@babel/core@8` + Node ≥22.18) — too much risk for a dev-only warning.

Fix: replaced `@babel/cli` with a ~25-line `scripts/transpile-legacy.js` that walks the build output with stdlib `fs` and transpiles each file via `@babel/core` (already installed) + `preset-env`. Verified byte-identical output to the old CLI on the same input, then removed `@babel/cli` (33 packages gone, including glob/inflight).

Takeaway: when a deprecated transitive dep comes from a CLI wrapper you invoke in one fixed way, the wrapper is often replaceable by a few lines against the underlying library you already depend on — smaller and warning-free.

## 2026-06-27 — Location-aware Hijri (region offset + Maghrib rollover + city picker)

User (Bangladesh) reported the Hijri date wrong (showed 12, expected 10) and the GPS label wrong. Research finding: BD's official date is a moon-sighting *committee* announcement — no formula/GPS/API reproduces it (all AlAdhan methods returned 12 = Umm al-Qura). Three different "correct" numbers existed (12 Saudi / 11 calculated-norm / 10 third-party). Confirmed with the user: default to **−1 (→11)**, Maghrib rollover **on** for the headline, knob is final authority.

Design: kept the verified `umalqura.ts` base; added `sunset.ts` (offline NOAA, returns absolute UTC-ms so rollover compares to `Date.now()` with zero timezone math), `locations.ts` (900 curated GeoNames cities + `nearestCity`/`cityByTimezone`/per-country `REGION_OFFSET`), `hijri.ts` (single `resolveHijri` resolver — region offset + sunset rollover + manual knob collapse into ONE day-shift and ONE conversion; card and grid share it so they can't diverge), and `LocationPicker.tsx` (custom WAI-ARIA combobox — `<datalist>` renders nothing on iOS 10).

Built with fix agents + reviewed by separate adversarial agents. Review caught: GPS label showed a Dhaka *thana* ("Bhatara") not "Dhaka" → snap `nearestCity` to most-populous within ~30km; always-on display never advanced date/rollover → per-minute tick; NaN-offset from corrupt localStorage bricked the date → guard; picker type-then-Enter no-op → fall back to top match.

Takeaways:
- For moon-sighting calendars, be honest: a calc is a *prediction*, not the committee's announcement. Surface it in UI copy and keep a manual override.
- Region offset (which authority) and Maghrib rollover are independent axes pointing opposite directions — don't conflate "show 10" with "after sunset".
- GeoNames `cities15000` includes sub-city thanas; "nearest point" labels a neighbourhood, not the metro — population-snap fixes it.
- Separately found (NOT yet fixed — pre-existing, out of scope): Safari-10 boot is fragile — Next chunks reference `globalThis`/`Promise.allSettled`/`.flat` before a remote (offline-failing) core-js loads. Needs self-hosted core-js ordered ahead of the chunks.

## 2026-09-02 — Muslim prayer times (Waqt) engine & split desktop-clock layout

Added offline Meeus/NOAA prayer times calculator (`app/lib/prayer.ts`), Waqt active period resolution, live countdown (`app/components/PrayerDisplay.tsx`), and balanced iPad desktop-clock hero layout (`app/page.tsx` with Waqt on left, Local Clock & World Clocks on right). Verified pure ES5 downleveling for iOS 10.3.4 Safari and test suite (`scripts/verify-prayer.js`).

2026-09-02 · Prayer-time engine review fixes · `getHourAngleMs(...) || 0` turned "sun never
reaches this altitude" into a zero hour angle, so every location above ~48.5° got Fajr = Isha =
solar noon for weeks each summer (London 21 Jun: both 13:03). Replaced with a nearest-latitude
(aqrab al-bilad, 45°) retry; a green fixture set dated 2 Sep hid it, so `verify-prayer.js` now
carries a June-London and a polar Tromsø case and is wired into `npm test`.

2026-09-02 · A default is not a fallback when the output is authoritative · `resolveCurrentWaqt`
silently substituted Makkah's coordinates when lat/lon were null and rendered the result under
the user's own timezone label. `cityByTimezone` is an exact IANA match, so any unlisted zone hit
this. Now returns null and the UI shows an explicit "no coordinates" state instead.

2026-09-02 · Verify a perf fix by measuring the work, not the output · The prayer card looked
identical before and after moving the solar math off the 1 Hz tick. Patching `Math.acos` (called
only by the hour-angle functions) in the live page gave the real number: 24/sec before, 0/sec
after while the countdown still advanced, and exactly 24 once when crossing a waqt boundary.

2026-09-02 · Hero hierarchy rebalance · Both hero cards shared one surface (`bg-[#111]`, same
padding, `shadow-2xl`, same accent bar, same `text-5xl→7xl` numerals), so there was no hierarchy
to adjust, only two co-equal cards. Fixed on four reinforcing channels at once — track width
(6/6 → 5/7), scale (clock to `text-9xl`, waqt countdown down to `text-5xl`), elevation (waqt card
off `#111` onto `bg-white/[0.02]`, no shadow, hairline accent) and chroma (`amber-400` →
`amber-200/80`). Shrinking one card exposed two latent inversions: the tertiary world clocks then
outranked the secondary waqt card, and their `justify-center` (invisible while they were wide)
left them floating.

2026-09-02 · Measuring contrast in Tailwind v4 needs a canvas, not a regex · v4 emits
`oklab()`/`color-mix()`, so parsing `getComputedStyle().color` with `/[\d.]+/g` pulls the wrong
channels — it reported 1.02:1 for text that is plainly legible. Painting the colour to a 1x1
canvas over black and white recovers real sRGB + alpha. Always include a known-failing control
in the check; without it a broken contrast script reads as a clean pass.

2026-09-02 · Hero tie-break, second pass (waqt vs local clock) · The iPad-responsiveness rewrite
reset both hero cards to one shared treatment (`md:grid-cols-2`, `#121212`, `shadow-2xl`, matching
accent bars, identical `text-4xl→6xl` numerals), so neither read as the entry point. Separated them
on four channels: track width (5/3 of an 8-col grid), numeral scale (1.5x), surface elevation
(`#121212`+shadow vs `#0c0c0c` flat) and luminance (`#fff` vs `white/70`, measured 255 vs 179 via
canvas). Final direction per the user: local clock is PRIMARY while the waqt keeps the WIDER
column — width deliberately runs counter to emphasis, because the countdown is 8 characters wide
and the clock is 5. Comments in `page.tsx`/`Clock.tsx` say so, since it looks like a mistake.

2026-09-02 · `font-mono` is a no-op in this app · `globals.css` maps `--font-mono` to
`var(--font-geist-mono)`, which is never defined, and `body` sets Arial — so every `font-mono`
numeral renders proportional. Harmless today only because the countdown is left-aligned, so the
per-second digits sit at the end of the string and nothing shifts; a centred or right-aligned
countdown would visibly jitter (~12px spread at 72px, measured on canvas).

2026-09-02 · `gap-*` on flex is dropped on the iOS 10 target; `space-x-*` is not · Tailwind v4
emits bare `gap:` with no fallback (flex `gap` needs Safari 14.1), but `space-x-3` emits physical
`margin-left`/`margin-right`. Colour utilities are fine either way — v4 ships an `#ffffff1a` hex
fallback ahead of the `color-mix()` line. Verified by grepping the built `out/_next/static/*.css`,
which is the only place these questions can be answered.
