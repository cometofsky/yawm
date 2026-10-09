# Codebase map — full entries

Moved verbatim from `AGENTS.md` → Repo-specific rules (Stack, Strict Architecture Rules), Where truth lives, Knowledge graph (graphify) on 2026-10-10 to keep the always-loaded file small. `AGENTS.md` keeps one rule line per entry, in the same order; this file holds the mechanics, history, owning files and claim anchors. Read the matching entry before acting in that area.

Repo-specific rules:
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

## Where truth lives
- **Date/calendar logic (the core):** `app/lib/` — `prayer.ts` (offline prayer times & active Waqt engine), `hijri.ts` (single shared resolver `resolveHijri`), `umalqura.ts` (verified Hijri table + `HIJRI_MONTHS`), `sunset.ts` (NOAA sunset instant for Maghrib rollover), `locations.ts` (generated `CITIES` + `regionOffsetFor`), `useLocationState.ts` (shared location & offset hook).
- **UI:** `app/page.tsx` (desk-clock layout), `app/layout.tsx` (root + Safari-10 shim ordering note), `app/components/` — `PrayerDisplay.tsx` (Waqt card + timetable ribbon), `Clock.tsx`, `CalendarDisplay.tsx` (card), `MonthlyCalendar.tsx` (grid), `LocationPicker.tsx`.
- **Types/schemas:** interfaces are colocated in the `app/lib/*.ts` that owns them (`PrayerTimeItem`/`WaqtStatus` in `prayer.ts`, `ResolvedLocation`/`HijriResult` in `hijri.ts`, `City` in `locations.ts`, `HijriDate` in `umalqura.ts`). No central types module.
- **Build/data generation:** `scripts/build-cities.js` (regenerates `locations.ts` from GeoNames), `scripts/verify-umalqura.js` and `scripts/verify-prayer.js` (the domain tests), `scripts/transpile-legacy.js` (ES5 postbuild), `scripts/deploy.sh`. Config: `next.config.ts` (static export + `transpilePackages`), `postcss.config.mjs` (Tailwind v4), `browserslist` in `package.json`.
- **Deploy target:** nginx vhost `iyyam.rafi.ninja.conf` serving `out/`. `lessons_learned.md` at repo root records prior gotchas — read it before touching the date path or legacy pipeline.

## Knowledge graph (graphify)

A whole-repo knowledge graph lives at `graphify-out/` — gitignored, local-only and regenerable
(`graphify update .` rebuilds it from the AST in seconds, no model call). It is built by the
Graphify Labs CLI (`graphify`, pipx package `graphifyy`); the matching agent skill is `/graphify`.
Never set or ask for an API key for it: code is extracted structurally, and the optional semantic
pass runs in the host session on its own login.
<!-- claim: cmd=`grep -c 'graphify-out' .gitignore` expect=`1` -->

- For a codebase question, prefer `graphify query "<question>"` over grep when `graphify-out/graph.json`
  exists; `graphify path "<A>" "<B>"` for a relationship, `graphify explain "<concept>"` for one
  concept. Each returns a scoped subgraph, far smaller than `GRAPH_REPORT.md` or raw grep output.
- Read `graphify-out/GRAPH_REPORT.md` only for a broad architecture review.
- The post-commit hook rebuilds the graph after every commit; do not run `graphify update .` after each edit.
- If `graphify-out/` is missing, `graphify update .` builds the code graph; the `/graphify` skill
  adds docs and images on top.
