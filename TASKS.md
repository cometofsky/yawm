# Task ledger — iyyam

The only live record of task status. Scope, dependencies and acceptance for planned tasks live in
[docs/development-plan.md](docs/development-plan.md); this file records who is doing what and the
evidence that it is done.

## How to use this ledger

- Add every task of an accepted plan before executing it; add unplanned work before starting it.
  IDs are stable and never reused: `P<phase>-<nn>` for plan tasks, `DOC-<nnn>` / `OPS-<nnn>` etc.
  for the rest.
- Statuses: Planned, In progress, Blocked, In review, Done. Anything past Planned has an owner.
- Before starting: owner, start date, intended files and the verification approach.
- Blocked: the concrete blocker and the next action. In review: what verification is pending.
- Done: completion date, changed paths, outcome, the exact checks run and their results, and
  remaining limitations. A prose claim without evidence is not Done.
- A withdrawn task keeps its ID and records the decision and any superseding task.
- `node scripts/check-docs.mjs` validates statuses, owners, dated Done evidence and plan parity.

## Tasks

| ID | Task | Status | Owner | Dependencies | Acceptance | Result / evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UX-001 | Understand iyyam and propose three replacement visual directions for owner selection | Done | Codex | None | Three distinct visual previews grounded in the desk-clock workflow; selection precedes app implementation | 2026-10-24: three static visual proposals and motion/interaction plans in docs/design-proposals.md and .impeccable/mocks/decision/; final desktop captures in .impeccable/review/. Inspected desktop/iPad landscape and phone views; source assertions PASS; node scripts/check-docs.mjs PASS. AGENTS.md discovery row and lessons updated. Proposal self-review and separate source/claims audit completed locally. Added owner scope for a persistent Accessibility button/panel and Original/Slate/Forest/Warm themes to PRODUCT.md, proposals and static sketches. Owner selected Nocturne; implementation and device acceptance are tracked under P1-01. Proposal-stage evidence makes no runtime claim. |
| P1-01 | Implement selected Nocturne redesign with accessibility and color themes | In review | Codex + UI designer | UX-001 | specs/NOCTURNE/product.md and tech.md; full UI preserved; validated preferences; keyboard/reflow/theme checks; build + legacy postbuild | 2026-10-24 engineering implemented across app/page.tsx, app/components/, app/globals.css, app/layout.tsx and app/lib/useSettings.ts; specs/NOCTURNE and owning docs updated. Typecheck, node scripts/verify-settings.js, npm test (12,645 Hijri checks; prayer cases), npm run build and legacy postbuild PASS. Static-export browser checks cover offline interactions, four themes, persistence, scoped resets, focus/keyboard, 320px at 200% with 56px controls, city search, manual offset, month/day details and Asr synchronization including blocked-storage remount. Owner’s heavy type request implemented with 800/900 local weights, larger labels and bold sans dates/prayer names. Finish reviewer disposition ship; material fixes resolved; DESIGN.md and .impeccable/design.json reconciled. node scripts/check-docs.mjs PASS. Engineering and local verification complete; task remains In review for actual iOS 10.3.4 iPad/distance-readability acceptance. No deployment. |
| DATE-001 | Investigate existing Bengali headline/day-detail date mismatch | Planned | — | None | Reproduce library time-of-day behavior, decide correct civil-day contract, fix once without changing Hijri/prayer policy | Observed during Nocturne verification 2026-10-24: TZ=Asia/Dhaka bangla-calendar.getDate(new Date(2026,9,24,0)) gives 7 Kartik; hour13 gives 8 Kartik. Existing headline uses now and grid uses midnight; preserved calculations in UI redesign. |
| UX-002 | Improve prayer/countdown grouping and enlarge the clock date | Done | Codex | P1-01 | Name/countdown form one compact group; explicit Time left label; clock date much larger for distance reading; no calculation changes | 2026-10-24: PrayerDisplay.tsx groups the name/countdown with a Time left label; globals.css keeps a 24px gap at 100% text and short vertical phone stack. Clock date increased from 14px to 48px on tablets/wide screens, weight900 and primary color (24px on phones). PRODUCT.md, DESIGN.md and design sidecar reconciled. Typecheck, build/legacy postbuild and six static-export viewport/text-size checks PASS; no page/date overflow. Fresh reviewer disposition ship after documentation correction. node scripts/check-docs.mjs PASS. Calculation logic unchanged; actual iOS10 hardware remains under P1-01 acceptance. |
