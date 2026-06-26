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
