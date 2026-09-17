# Agent Directives

**Scope** These instructions apply to the entire repository unless a deeper `AGENTS.md` overrides them.

## Project context — read BEFORE investigating or changing anything
Recorded product, business and technical decisions for this repo: `CONTEXT.md` (glossary) →
`docs/adr/INDEX.md` → every ADR whose `area` matches what you touch → the matching sections of
`docs/product.md` / `docs/business.md`.
- A product or business choice the request leaves open and no document covers → **ask, don't
  assume**; then draft a `status: proposed` ADR. Only a human sets `accepted`.
- A standing product rule the user states goes into `docs/product.md` in the same change.
- A request that conflicts with an accepted ADR → name the ADR first. Superseded ADRs are history.
- Precedence: the user's current message > accepted ADR > product/business docs > anything else.
- `docs/business.md` stays repo-safe: no prices, contract terms, client names or revenue.

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
- Build: `npm run build` (runs `next build` + the legacy-transpile postbuild; confirm it completes without postbuild errors).
  **Start this one unsandboxed.** Turbopack's PostCSS worker binds a local port, so a sandboxed
  shell fails it with `Operation not permitted` before any code is compiled — a guaranteed wasted
  run, seen twice on 2026-09-02.
- Pick the lowest step that could go RED for your defect: a type-level or copy edit is typecheck
  only; anything touching `app/lib/` runs `npm test`; only a change to the build/transpile path or
  a claim about the shipped bundle needs `npm run build`.
- **None of the above can see a rendered page**, which is where this app's bugs live. `npm run dev`
  for the React surface; serve `out/` after a build to check the ES5/iOS-10 output. Say in one line
  what you saw, or mark the change UNVERIFIED.

A change is DONE only when the relevant commands pass and their output is shown. If a command can't be run, say so and mark the change UNVERIFIED.

## Running system
Deploy is **manual and the user's call** — a human runs `scripts/deploy.sh` on the host. There is no
CI. Pushing to `main` deploys nothing; never deploy unasked.
- **`main` is the deploy source.** `deploy.sh` does `git pull --ff-only origin main`, then `npm ci`
  and `npm run build`. It uses whatever `origin` the host is configured with — it prints the remote
  and never rewrites it (the only `git remote set-url` left is a comment naming the manual command
  for a box that needs HTTPS). Nothing is reloaded or restarted: nginx serves `out/` straight off
  disk, so the build *is* the deploy.
  <!-- claim: cmd=`grep -c 'git pull --ff-only origin main' scripts/deploy.sh` expect=`1` -->
  <!-- claim: cmd=`grep -c '^git remote set-url' scripts/deploy.sh` expect=`0` -->
- **Commits go straight to `main`** — no other branch has ever existed here and there are no merge
  commits. Don't open a branch for a one-repo change; commit on `main` and push only when asked.
- **`iyyam.rafi.ninja.conf` is a TEMPLATE, not the live file** — it says so at the top, and its
  `root` is the placeholder `/ABSOLUTE/PATH/TO/yawm/web/out`. **nginx does not expand `~`**, and
  `deploy.sh` builds in place, so the real docroot is whichever checkout the host deploys from:
  the last thing `deploy.sh` prints is the exact `root ...;` line to paste. Do not copy this file
  onto the host unedited, and do not read the checkout path off it.
  <!-- claim: cmd=`grep -c 'root /ABSOLUTE/PATH/TO/yawm/web/out' iyyam.rafi.ninja.conf` expect=`1` -->
  <!-- claim: cmd=`grep -c 'root ~' iyyam.rafi.ninja.conf` expect=`0` -->
- **Static assets are served `immutable, max-age=15552000`** (6 months). Safe for `_next/static`,
  whose filenames are content-hashed — but any top-level asset you add under a stable name is
  pinned in every visitor's browser for half a year. Version the filename instead.
  <!-- claim: cmd=`grep -c 'immutable' iyyam.rafi.ninja.conf` expect=`1` -->
- Server names `iyyam.rafi.ninja` / `yawm.rafi.ninja`; the route to load after a deploy is
  `https://iyyam.rafi.ninja/`.
- **Not measured:** the host, the runtime uid that serves `out/`, and who else is on that box. Ask
  or measure before any host-level action — don't infer them from this file.

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
- **Date/calendar logic (the core):** `app/lib/` — `prayer.ts` (offline prayer times & active Waqt engine), `hijri.ts` (single shared resolver `resolveHijri`), `umalqura.ts` (verified Hijri table + `HIJRI_MONTHS`), `sunset.ts` (NOAA sunset instant for Maghrib rollover), `locations.ts` (generated `CITIES` + `regionOffsetFor`), `useLocationState.ts` (shared location & offset hook).
- **UI:** `app/page.tsx` (desk-clock layout), `app/layout.tsx` (root + Safari-10 shim ordering note), `app/components/` — `PrayerDisplay.tsx` (Waqt card + timetable ribbon), `Clock.tsx`, `CalendarDisplay.tsx` (card), `MonthlyCalendar.tsx` (grid), `LocationPicker.tsx`.
- **Types/schemas:** interfaces are colocated in the `app/lib/*.ts` that owns them (`PrayerTimeItem`/`WaqtStatus` in `prayer.ts`, `ResolvedLocation`/`HijriResult` in `hijri.ts`, `City` in `locations.ts`, `HijriDate` in `umalqura.ts`). No central types module.
- **Build/data generation:** `scripts/build-cities.js` (regenerates `locations.ts` from GeoNames), `scripts/verify-umalqura.js` and `scripts/verify-prayer.js` (the domain tests), `scripts/transpile-legacy.js` (ES5 postbuild), `scripts/deploy.sh`. Config: `next.config.ts` (static export + `transpilePackages`), `postcss.config.mjs` (Tailwind v4), `browserslist` in `package.json`.
- **Deploy target:** nginx vhost `iyyam.rafi.ninja.conf` serving `out/`. `lessons_learned.md` at repo root records prior gotchas — read it before touching the date path or legacy pipeline.

## AI layer
None built. If one is ever added, the forward design (use-cases + 4-pillar plan) is
`docs/ai-layer-plan.md`; the standard it must follow is `~/.agents/ai-engineering.md`.

## Knowledge graph (graphify)

A whole-repo knowledge graph lives at `graphify-out/` — gitignored, local-only and regenerable
(`graphify update .` rebuilds it from the AST in seconds, no model call). It is built by the
Graphify Labs CLI (`graphify`, pipx package `graphifyy`); the matching agent skill is `/graphify`.
Never set or ask for an API key for it: code is extracted structurally, and the optional semantic
pass runs in the host session on its own login.
<!-- claim: cmd=`grep -c 'graphify-out' .gitignore` expect=`1` -->

- For a codebase question, run `graphify query "<question>"` first when `graphify-out/graph.json`
  exists; `graphify path "<A>" "<B>"` for a relationship, `graphify explain "<concept>"` for one
  concept. Each returns a scoped subgraph, far smaller than `GRAPH_REPORT.md` or raw grep output.
- Read `graphify-out/GRAPH_REPORT.md` only for a broad architecture review.
- After editing code, run `graphify update .` so the graph stays current.
- If `graphify-out/` is missing, `graphify update .` builds the code graph; the `/graphify` skill
  adds docs and images on top.

<!-- repowiki: audited-at e36c136a9263e7a48af9632397ce7e1f968f1aa2 on 2026-09-02 -->
