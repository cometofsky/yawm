# Agent Directives

**Scope** These instructions apply to the entire repository unless a deeper `AGENTS.md` overrides them.

**Context:**

- **Stack:**
  - Next.js 16.1.6 <!-- claim: cmd=`grep '"next":' package.json` expect=`"next": "16.1.6",` --> (App Router, `app/` at repo root)
  - React 19 <!-- claim: cmd=`grep '"react":' package.json` expect=`"react": "19.2.3",` -->
  - TypeScript 5 (`strict: true`) <!-- claim: cmd=`grep '"strict":' tsconfig.json` expect=`"strict": true,` -->
  - Tailwind CSS 4 via PostCSS <!-- claim: cmd=`grep '"tailwindcss":' package.json` expect=`"tailwindcss": "^4",` -->
  - Static export (`output: 'export'` in `next.config.ts` <!-- claim: cmd=`grep "output:" next.config.ts` expect=`output: 'export',` -->) served as plain HTML from `out/` by nginx (`iyyam.rafi.ninja.conf`); deployed via `scripts/deploy.sh`. No backend, no database.

- **Strict Architecture Rules:**
  - This site must run on iOS 10.3.4 Safari: after `next build`, `scripts/transpile-legacy.js` (postbuild) <!-- claim: cmd=`grep '"postbuild":' package.json` expect=`"postbuild": "node scripts/transpile-legacy.js",` --> downlevels `out/_next/static` to ES5 via Babel + the `browserslist` field (`ios_saf >= 10` <!-- claim: cmd=`grep "ios_saf" package.json` expect=`"ios_saf >= 10"` -->). Do not introduce runtime JS features or dependencies that Babel preset-env cannot downlevel, and never remove/bypass the `postbuild` step.
  - Static export only: no server components needing a runtime, no API routes, no `next/image` optimization, no dynamic server features. Everything must work from the static `out/` directory (fully offline after load — no external API calls).
  - `lucide-react` and `bangla-calendar` ship untranspiled and are listed in `transpilePackages` in `next.config.ts` <!-- claim: cmd=`grep "transpilePackages" next.config.ts` expect=`transpilePackages: ['lucide-react', 'bangla-calendar'],` -->; add any new untranspiled dependency there too.
  - City/timezone data is generated at build time by `scripts/build-cities.js` — edit the script/source data, not generated output. Hijri date logic is checked by `scripts/verify-umalqura.js`; prayer-time logic by `scripts/verify-prayer.js`.

## Verification — run before declaring any change done
- Typecheck: `npm run typecheck` (`tsc --noEmit` <!-- claim: cmd=`grep '"typecheck":' package.json` expect=`"typecheck": "tsc --noEmit",` -->)
- Tests: `npm test` (runs `scripts/verify-umalqura.js` then `scripts/verify-prayer.js` <!-- claim: cmd=`grep '"test":' package.json` expect=`"test": "node scripts/verify-umalqura.js && node scripts/verify-prayer.js"` --> — the first verifies the embedded Umm al-Qura table against Intl's islamic-umalqura calendar; the second checks prayer times against known city fixtures, prayer ordering under the high-latitude rule (London midsummer, Tromso polar day), and the civil day resolving in the selected city's zone rather than the device's. Either exits non-zero on any mismatch.)
- Lint: none configured (deliberate — build + typecheck + the domain check is the gate)
- Build: `npm run build` (runs `next build` + the legacy-transpile postbuild; confirm it completes without postbuild errors)
A change is DONE only when the relevant commands pass and their output is shown. If a command can't be run, say so and mark the change UNVERIFIED.

## Do not guess — verify before use
Read the real source before relying on any of these; do not invent shapes or re-add removed paths.
- **`resolveHijri` signature** (`app/lib/hijri.ts` <!-- claim: cmd=`grep "export function resolveHijri" app/lib/hijri.ts` expect=`export function resolveHijri(opts: {` -->): `resolveHijri(opts: { now: Date; location: ResolvedLocation; manualOffset: number; applyRollover: boolean }): HijriResult`. `ResolvedLocation` = `{ name: string; country: string; lat: number | null; lon: number | null; tz: string | null; source: LocationSource }`; `LocationSource = 'gps' | 'city' | 'timezone' | 'none'`. Do not invent city fields or Hijri month names — `HIJRI_MONTHS` lives in `app/lib/umalqura.ts` (table covers ~1440–1475 AH <!-- claim: cmd=`grep "HY_START =" app/lib/umalqura.ts` expect=`const HY_START = 1440;` -->; outside that `resolveHijri` returns text `'Out of range'`).
- **`resolveHijri` is the single shared date resolver.** Card (`app/components/CalendarDisplay.tsx`) and grid (`app/components/MonthlyCalendar.tsx`) both call it; region offset + Maghrib sunset rollover + manual knob collapse into ONE day-shift and ONE conversion so the two views cannot diverge. Fix any Hijri bug once here, never per-component.
- **Never use `Intl` non-Gregorian / timezone calendars.** On the iOS 10.3.4 Safari target, `'…-u-ca-islamic'` renders **Gregorian silently** (no throw), so wrong output looks valid — this is why the calendar was "always wrong" before. `hijri.ts` is deliberately Intl-free / ES5-safe (`getTime`/`setDate`/`new Date(date)` only); do not reintroduce Intl date math or `Date` string parsing.
- **The date path is offline-only.** No network calls and no blocking geolocation in the date flow — a prior `fetch('http://ip-api.com')` was mixed-content-blocked and `getCurrentPosition({timeout:5000})` errors on GPS-less iPads. Geolocation is kept only as a non-blocking timezone-label hint. Treat the computed Hijri date as a *prediction*, not a moon-sighting committee announcement — the manual ± offset is the final authority; do not remove it. Region offset (which authority) and Maghrib rollover are independent axes — do not conflate them.
- **Tailwind v4: there is NO `tailwind.config`.** <!-- claim: cmd=`git ls-files '*tailwind.config*' | wc -l` expect=`0` --> Config is CSS-first via `@tailwindcss/postcss` (see `postcss.config.mjs` / `app/globals.css`); do not create a JS/TS Tailwind config.
- **`package.json` `name` is `world-clock`, but the project is iyyam.** <!-- claim: cmd=`grep '"name":' package.json` expect=`"name": "world-clock",` --> The name is historical — do not "correct" it or assume a separate world-clock project exists.
- **Node is not pinned** (no `.nvmrc`, no `engines`). Stay on the current `@babel/core` 7 + `core-js-bundle` 3 transpile toolchain <!-- claim: cmd=`grep '"core-js-bundle":' package.json` expect=`"core-js-bundle": "^3.49.0",` -->; do not upgrade to `@babel/cli` / Babel 8 (it forces Node ≥22.18 and a full Babel-8 migration for a dev-only warning).

## Where truth lives
- **Date/calendar logic (the core):** `app/lib/` — `hijri.ts` (single shared resolver `resolveHijri`), `umalqura.ts` (verified Hijri table + `HIJRI_MONTHS`), `sunset.ts` (NOAA sunset instant for Maghrib rollover), `locations.ts` (generated `CITIES` + `regionOffsetFor`).
- **UI:** `app/page.tsx` (desk-clock layout), `app/layout.tsx` (root + Safari-10 shim ordering note), `app/components/` — `Clock.tsx`, `CalendarDisplay.tsx` (card), `MonthlyCalendar.tsx` (grid), `LocationPicker.tsx`.
- **Types/schemas:** interfaces are colocated in the `app/lib/*.ts` that owns them (`ResolvedLocation`/`HijriResult` in `hijri.ts`, `City` in `locations.ts`, `HijriDate` in `umalqura.ts`). No central types module.
- **Build/data generation:** `scripts/build-cities.js` (regenerates `locations.ts` from GeoNames), `scripts/verify-umalqura.js` and `scripts/verify-prayer.js` (the domain tests), `scripts/transpile-legacy.js` (ES5 postbuild), `scripts/deploy.sh`. Config: `next.config.ts` (static export + `transpilePackages`), `postcss.config.mjs` (Tailwind v4), `browserslist` in `package.json`.
- **Deploy target:** nginx vhost `iyyam.rafi.ninja.conf` serving `out/`. `lessons_learned.md` at repo root records prior gotchas — read it before touching the date path or legacy pipeline.

## AI layer (planned)
No AI/LLM code in this repo today. This is a forward design; follow the global 4-pillar standard (`~/.agents/ai-engineering.md`) when implementing — do not restate it here.

**Candidate use-cases:**
- **Natural-language calendar Q&A** — "when is the next Eid / first of Ramadan / Laylat al-Qadr this year?" answered from the verified Umm al-Qura table. Value: turns a passive clock into a queryable Islamic-calendar helper without shipping a fragile client-side parser.
- **Moon-sighting offset assistant** — read regional moon-sighting announcements (free text / news) and *propose* the correct per-region manual ± day-offset, instead of the user guessing the knob. Value: makes today's manual correction informed rather than blind — while the knob stays the human authority.
- **Free-text location resolution** — "the town near Sylhet" / "wherever my in-laws are" mapped to a concrete `City` row (name/country/tz/lat/lon). Value: friendlier than scrolling the curated `CITIES` list, and disambiguates ambiguous input.

**Pillar plan (when built):**
- **Prompt** — bind every output to a schema the existing code already speaks: date Q&A → `{ hijri: {y,m,d}, gregorian: ISO, event: <enum of known events>, confidence }`; offset suggestion → an integer in a fixed range (e.g. −2..+2) plus a region enum; location resolution → an existing `City` shape or an explicit "no match". Untrusted input enters at the user query and at any scraped moon-sighting text — validate/clamp before use, never interpolate into anything.
- **Context** — ground strictly on this app's own small, static data: the `umalqura.ts` table + `HIJRI_MONTHS`, the `CITIES` rows and `regionOffsetFor` map, and `sunset.ts` math. This corpus is tiny and rarely changes, so cache the grounding blob / system prompt rather than building any RAG or vector store — token budget is a non-issue and freshness comes from rebuilds, not retrieval.
- **Harness** — the provider seam must NOT live in `app/` (the shipped bundle is offline-only and ES5-transpiled for Safari 10 — no runtime LLM calls there). Put it either in `scripts/` as a build-time generator (mirroring `build-cities.js` — precompute answers/enrichments into static data) or in a separate small service the modern clients call; the static export stays untouched. Wrap the provider so it never raises into the date flow: on any failure fall back to the deterministic table, and validate LLM output with a `verify-umalqura.js`-style check before it can ship.
- **Loop** — single-shot is sufficient for date Q&A and location resolution (no tools/agents needed against a fixed table). The moon-sighting offset suggestion is religiously high-stakes and MUST stay human-in-the-loop: the AI only proposes an offset with its evidence; the manual ± knob remains the final authority, exactly as the current design intends (a wrong auto-applied Hijri date is the bug this app was built to fix).

<!-- repowiki: audited-at ab11e4ea57c4ac25d2bb1a3cbd3b5bde7f6f450b on 2026-08-30 -->
