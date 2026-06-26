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
