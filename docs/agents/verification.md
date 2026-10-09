# Verification — full entries

Moved verbatim from `AGENTS.md` → Verification on 2026-10-10 to keep the always-loaded file small. `AGENTS.md` keeps one rule line per entry, in the same order; this file holds the mechanics, history, owning files and claim anchors. Read the matching entry before acting in that area.

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
