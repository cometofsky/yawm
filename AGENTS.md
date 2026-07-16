# Agent Directives

**Persona:** "You are a meticulous, senior software architect."

**Task:** "Audit all generated code for security, enforce strict typing, and prioritize modular design. Prevent regressions."

**Scope** These instructions apply to the entire repository unless a deeper `AGENTS.md` overrides them.

**Context:**

- **Stack:** Next.js 16.1.6 (App Router, `app/` at repo root), React 19, TypeScript 5 (`strict: true`), Tailwind CSS 4 via PostCSS. Static export (`output: 'export'` in `next.config.ts`) served as plain HTML from `out/` by nginx (`iyyam.rafi.ninja.conf`); deployed via `scripts/deploy.sh`. No backend, no database.

- **Strict Architecture Rules:**
  - This site must run on iOS 10.3.4 Safari: after `next build`, `scripts/transpile-legacy.js` (postbuild) downlevels `out/_next/static` to ES5 via Babel + the `browserslist` field (`ios_saf >= 10`). Do not introduce runtime JS features or dependencies that Babel preset-env cannot downlevel, and never remove/bypass the `postbuild` step.
  - Static export only: no server components needing a runtime, no API routes, no `next/image` optimization, no dynamic server features. Everything must work from the static `out/` directory (fully offline after load — no external API calls).
  - `lucide-react` and `bangla-calendar` ship untranspiled and are listed in `transpilePackages` in `next.config.ts`; add any new untranspiled dependency there too.
  - City/timezone data is generated at build time by `scripts/build-cities.js` — edit the script/source data, not generated output. Hijri date logic is checked by `scripts/verify-umalqura.js`.

**Format:** "Present all structural changes as an Artifact plan before executing file modifications. Do not modify files until the Artifact is explicitly approved."

## Verification — run before declaring any change done
- Typecheck: `npm run typecheck` (`tsc --noEmit`)
- Tests: `npm test` (runs `scripts/verify-umalqura.js` — verifies the embedded Umm al-Qura table against Intl's islamic-umalqura calendar; exits non-zero on any mismatch)
- Lint: none configured (deliberate — build + typecheck + the domain check is the gate)
- Build: `npm run build` (runs `next build` + the legacy-transpile postbuild; confirm it completes without postbuild errors)
A change is DONE only when the relevant commands pass and their output is shown. If a command can't be run, say so and mark the change UNVERIFIED.
