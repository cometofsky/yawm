# Agent Directives

**Scope** These instructions apply to the entire repository unless a deeper `AGENTS.md` overrides them.

**How this file works:** below the managed block, each bullet is the rule. Its full entry — mechanics,
history, owning files and claim anchors — is in the `docs/agents/` file named in the section heading,
in the same order. **Read that entry before acting in its area.**

## Project context
<!-- project-context:begin — managed by ~/.agents/skills/project-context (scaffold.sh refreshes it).
     Edit the skill's templates/agents-section.md, not this block. Repo-specific rules go below the end marker. -->
The same documentation layout is used in every repo, so any AI tool or person knows where to look.

| Doc | Owns | Read when |
| :--- | :--- | :--- |
| `CONTEXT.md` | Domain glossary — terms to use, synonyms to avoid | Before any change; whenever naming something |
| `docs/product.md` | Current product rules: users, flows, must / must not | Changing anything a user sees or does |
| `docs/business.md` | Current business rules (repo-safe) | Touching plans, limits, billing, commitments, audience |
| `docs/architecture.md` | Technical contracts: building blocks, data, runtime, deployment, cross-cutting (incl. AI layer) | Changing structure, data, integrations, deploy, security |
| `docs/adr/INDEX.md` | Decision log; open every ADR whose `area` matches your change | Before any change; before "fixing" something that looks odd |
| `specs/<ID>/product.md` + `tech.md` | One feature: testable behaviour rules + implementation plan | Building or changing that feature |
| `docs/development-plan.md` | Sequencing, scope and acceptance of planned work | Starting planned work; asked "what's next" |
| `TASKS.md` | Live task status and completion evidence — the only status record | Starting or finishing any task |
| `lessons_learned.md` | What broke before and the fix | Before debugging; before repeating a risky operation |
| `docs/wiki/` | Verified per-subsystem pages (repowiki), each stamped with the commit it was checked at | Orienting in an unfamiliar subsystem — narrative, never normative |
| Repo-specific docs (table below) | Everything else this repo keeps | When its "Read when" trigger matches |

**Before any change** read `CONTEXT.md` → `docs/adr/INDEX.md` (matching `area`) → the product /
business / architecture sections you touch → the feature's spec → repo-specific docs whose trigger
matches. When the user says "there is a rule / a decision", look here first.

**Keep docs current in the same change, never later:** new or renamed term → `CONTEXT.md`;
user-visible behaviour → `docs/product.md`; commercial rule → `docs/business.md`; stack, data,
integration, deploy or security contract → `docs/architecture.md`; hard-to-reverse or trade-off
choice → ADR (`status: proposed`) + `INDEX.md` row; feature bigger than a fix → `specs/<ID>/product.md`
+ `tech.md` **before** code (copy `specs/_template/`); planned work → `docs/development-plan.md` task +
`TASKS.md` row, updated on start (owner, date, files) and finish (changed paths, checks, limits); procedure → its runbook; error or correction →
`lessons_learned.md`; stale doc seen in passing → fix it or add a `TASKS.md` row; new doc → a
Repo-specific docs row; a standing rule the user states → `docs/product.md` / `docs/business.md`,
never only tool memory.

**Rules:** an uncovered product/business gap → ask. A conflict with an accepted ADR → name it first;
only a human sets `accepted`, and a change of mind supersedes, never edits. Precedence: the user's
current message > accepted ADR > product / business / architecture docs > anything else.
`docs/business.md` stays repo-safe. Run `node scripts/check-docs.mjs` once per task, after the last
doc edit; it must pass before reporting done.
<!-- project-context:end -->

## Repo-specific rules → [docs/agents/codebase-map.md](docs/agents/codebase-map.md)
- **Stack:** Next.js 16 (App Router, `app/` at repo root), React 19, TypeScript 5 (`strict: true`),
  Tailwind CSS 4 via PostCSS. Static export served from `out/` by nginx; deployed via `scripts/deploy.sh`.
  No backend, no database.
- **Must run on iOS 10.3.4 Safari:** do not introduce runtime JS features or dependencies that Babel
  preset-env cannot downlevel, and never remove/bypass the `postbuild` step (`scripts/transpile-legacy.js`).
- **Static export only:** no server components needing a runtime, no API routes, no `next/image` optimization,
  no dynamic server features. Everything must work from the static `out/` directory (fully offline after load — no external API calls).
- **Untranspiled deps** (`lucide-react`, `bangla-calendar`) are in `transpilePackages` in `next.config.ts`;
  add any new untranspiled dependency there too.
- **City/timezone data is generated** by `scripts/build-cities.js` — edit the script/source data, not generated output.

### Repo-specific docs
| Doc | Read when |
| :--- | :--- |
| `DESIGN.md` | Changing anything a user sees — the visual system (tokens, themes, components); `app/globals.css` + the Tailwind classes in `app/page.tsx` and `app/components/*.tsx` are the source of truth, this file describes it |
| `docs/agents/codebase-map.md` | Changing the stack, static-export config, transpile/postbuild path or generated city data; locating where code lives; using graphify |
| `docs/agents/verification.md` | Choosing which check to run, or before running `npm run build` |
| `docs/agents/running-system.md` | Deploying, editing `scripts/deploy.sh` or `iyyam.rafi.ninja.conf`, adding a static asset, or any host-level action |
| `docs/agents/do-not-guess.md` | Touching `app/lib/` date/Hijri/prayer logic, geolocation, Tailwind config, the `package.json` name, or the Node/Babel toolchain |

## Verification → [docs/agents/verification.md](docs/agents/verification.md)
- Typecheck: `npm run typecheck` (`tsc --noEmit`)
- Tests: `npm test` (runs `scripts/verify-umalqura.js` then `scripts/verify-prayer.js`; either exits non-zero on any mismatch)
- Lint: none configured (deliberate — build + typecheck + the domain check is the gate)
- Build: `npm run build` (runs `next build` + the legacy-transpile postbuild; confirm it completes without postbuild errors).
  **Start this one unsandboxed** — a sandboxed shell fails Turbopack's PostCSS port bind with `Operation not permitted`.
- Pick the lowest step that could go RED for your defect: a type-level or copy edit is typecheck
  only; anything touching `app/lib/` runs `npm test`; only a change to the build/transpile path or
  a claim about the shipped bundle needs `npm run build`.
- **None of the above can see a rendered page**, which is where this app's bugs live. `npm run dev`
  for the React surface; serve `out/` after a build to check the ES5/iOS-10 output. Say in one line
  what you saw, or mark the change UNVERIFIED.

A change is DONE only when the relevant commands pass and their output is shown. If a command can't be run, say so and mark the change UNVERIFIED.

## Running system → [docs/agents/running-system.md](docs/agents/running-system.md)
Deploy is **manual and the user's call** — a human runs `scripts/deploy.sh` on the host. There is no
CI. Pushing to `main` deploys nothing; never deploy unasked.
- **`main` is the deploy source** — `deploy.sh` runs `git pull --ff-only origin main`, `npm ci`, `npm run build`
  against the host's own `origin` (never rewritten); nothing is reloaded — the build *is* the deploy.
- **Commits go straight to `main`** — don't open a branch for a one-repo change; commit on `main` and push only when asked.
- **`iyyam.rafi.ninja.conf` is a TEMPLATE, not the live file** — do not copy it onto the host unedited or
  read the checkout path off it; nginx does not expand `~`; the real `root ...;` line is what `deploy.sh` prints last.
- **Static assets are served `immutable, max-age=15552000`** (6 months) — version the filename of any top-level asset you add.
- Server names `iyyam.rafi.ninja` / `yawm.rafi.ninja`; the route to load after a deploy is
  `https://iyyam.rafi.ninja/`.
- **Not measured:** the host, the runtime uid that serves `out/`, and who else is on that box. Ask
  or measure before any host-level action — don't infer them from this file.

## Do not guess → [docs/agents/do-not-guess.md](docs/agents/do-not-guess.md)
Read the real source before relying on any of these; do not invent shapes or re-add removed paths.
- **`resolveHijri` signature** is in `app/lib/hijri.ts`; do not invent city fields or Hijri month names
  (`HIJRI_MONTHS` is in `app/lib/umalqura.ts`; the table covers ~1440–1475 AH, else `'Out of range'`).
- **`resolveHijri` is the single shared date resolver** for card and grid — fix any Hijri bug once there, never per-component.
- **Never use `Intl` non-Gregorian / timezone calendars** (iOS 10.3.4 renders them Gregorian silently). Keep
  `hijri.ts` Intl-free / ES5-safe (`getTime`/`setDate`/`new Date(date)` only); do not reintroduce Intl date math or `Date` string parsing.
- **The date path is offline-only** — no network calls, no blocking geolocation. The Hijri date is a *prediction*;
  never remove the manual ± offset (the final authority); region offset and Maghrib rollover are independent axes — do not conflate them.
- **Tailwind v4: there is NO `tailwind.config`** — do not create a JS/TS Tailwind config (config is CSS-first).
- **`package.json` `name` is `world-clock`, but the project is iyyam** — do not "correct" it or assume a separate world-clock project exists.
- **Node is not pinned** — stay on `@babel/core` 7 + `core-js-bundle` 3; do not upgrade to `@babel/cli` / Babel 8.

## Where truth lives → [docs/agents/codebase-map.md](docs/agents/codebase-map.md)
- **Date/calendar logic (the core):** `app/lib/` (`prayer.ts`, `hijri.ts`, `umalqura.ts`, `sunset.ts`, `locations.ts`, `useLocationState.ts`).
- **UI:** `app/page.tsx`, `app/layout.tsx`, `app/components/`.
- **Types:** colocated in the `app/lib/*.ts` that owns them; no central types module.
- **Build/data generation:** `scripts/`; config `next.config.ts`, `postcss.config.mjs`, `browserslist` in `package.json`.
- **Deploy target:** nginx vhost `iyyam.rafi.ninja.conf` serving `out/`. Read `lessons_learned.md` before touching the date path or legacy pipeline.

## AI layer
None built. If one is ever added, the forward design (use-cases + 4-pillar plan) is
[docs/architecture.md → AI layer](docs/architecture.md#ai-layer) (scheduling:
[docs/development-plan.md → AI layer](docs/development-plan.md#ai-layer-not-scheduled)); the standard it
must follow is `~/.agents/ai-engineering.md`.

## Knowledge graph (graphify) → [docs/agents/codebase-map.md](docs/agents/codebase-map.md)
- `graphify-out/` is gitignored and local-only. Never set or ask for an API key for it.
- For a codebase question, prefer `graphify query "<question>"` over grep when `graphify-out/graph.json`
  exists (`graphify path` / `graphify explain` for a relationship / concept).
- Read `graphify-out/GRAPH_REPORT.md` only for a broad architecture review.
- The post-commit hook rebuilds the graph after every commit; do not run `graphify update .` after each edit.
- If `graphify-out/` is missing, `graphify update .` builds the code graph.

<!-- repowiki: audited-at e36c136a9263e7a48af9632397ce7e1f968f1aa2 on 2026-09-02 -->
