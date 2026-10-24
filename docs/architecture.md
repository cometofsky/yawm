# Architecture — iyyam

Technical contracts: what the system is made of and the rules its code must keep. Structure
follows arc42 (trimmed); diagrams use the C4 model (Context → Containers → Components) as Mermaid
or text so they diff in review. Current truth only — a significant or hard-to-reverse choice gets
an ADR in `docs/adr/` and is linked here, e.g. `(→ ADR-0002)`. Label anything designed but not yet
built as **planned**; never describe a design as a running system.

## Context and scope
<!-- C4 level 1: users, this system, and every external system it talks to. What is out of scope. -->

## Solution strategy
<!-- The few decisions that shape everything else (stack, data store, deployment model), each → ADR. -->

## Building blocks
<!-- C4 level 2: containers/modules, what each owns, and the boundaries between them. -->

## Runtime behaviour
<!-- The important flows end to end: request paths, background jobs, failure and retry handling. -->

## Data
<!-- Stores, ownership, tenancy, retention, migrations. Money, time zones and PII rules. -->

## Deployment and operations
<!-- Where it runs, how it is deployed and rolled back, backups, monitoring, secrets. -->

## Cross-cutting concepts
<!-- Security and authorisation, error handling, logging, AI/LLM boundaries, accessibility, i18n. -->

### Display preferences and dialogs

The Nocturne interface keeps calculations in the existing offline date/prayer modules. `useSettings.ts` validates an allowlist of settings from `iyyam.settings`, merges legacy display switches with defaults and ignores malformed values. Color theme, text size, contrast, motion, target size and luminance update the page immediately; root attributes also theme the document background. Storage failures preserve in-memory operation.

Appearance and accessibility resets update only their own fields; display reset preserves those preferences. City choice, Hijri adjustment and Asr method retain their separate keys. Themes never change date/prayer arithmetic. No new network service, dependency or raster asset is introduced.

`DisplayDialog.tsx` supplies a shared accessible name, Escape handling, contained focus, background hiding and focus restoration for settings, accessibility, city search and date detail. Opening focus is captured in a layout effect before the city input’s autofocus effect. Time/countdown updates remain quiet for screen readers; user-driven sighting corrections and search results have polite feedback.

CSS uses inherited palette variables, rem reading text and bounded viewport-based clock numerals. Motion is brief and interaction-driven; either the device preference or the explicit Reduce motion setting stops it. The calendar preserves seven columns through a scoped horizontal scroll at small widths/large targets. Build/postbuild stays the legacy compatibility boundary; a successful ES5 build is not evidence of operated iOS 10 Safari behavior.

### AI layer — forward design (nothing built) <a id="ai-layer"></a>

No AI/LLM code exists in this repo today. This page is the design to pick up *if* one is ever
built; it is not a rule, which is why it does not sit in `AGENTS.md` loading into every session.
Follow the global 4-pillar standard (`~/.agents/ai-engineering.md`) when implementing — do not
restate it here.

**Candidate use-cases:**
- **Natural-language calendar Q&A** — "when is the next Eid / first of Ramadan / Laylat al-Qadr this year?" answered from the verified Umm al-Qura table. Value: turns a passive clock into a queryable Islamic-calendar helper without shipping a fragile client-side parser.
- **Moon-sighting offset assistant** — read regional moon-sighting announcements (free text / news) and *propose* the correct per-region manual ± day-offset, instead of the user guessing the knob. Value: makes today's manual correction informed rather than blind — while the knob stays the human authority.
- **Free-text location resolution** — "the town near Sylhet" / "wherever my in-laws are" mapped to a concrete `City` row (name/country/tz/lat/lon). Value: friendlier than scrolling the curated `CITIES` list, and disambiguates ambiguous input.

**Pillar plan (when built):**
- **Prompt** — bind every output to a schema the existing code already speaks: date Q&A → `{ hijri: {y,m,d}, gregorian: ISO, event: <enum of known events>, confidence }`; offset suggestion → an integer in a fixed range (e.g. −2..+2) plus a region enum; location resolution → an existing `City` shape or an explicit "no match". Untrusted input enters at the user query and at any scraped moon-sighting text — validate/clamp before use, never interpolate into anything.
- **Context** — ground strictly on this app's own small, static data: the `umalqura.ts` table + `HIJRI_MONTHS`, the `CITIES` rows and `regionOffsetFor` map, and `sunset.ts` math. This corpus is tiny and rarely changes, so cache the grounding blob / system prompt rather than building any RAG or vector store — token budget is a non-issue and freshness comes from rebuilds, not retrieval.
- **Harness** — the provider seam must NOT live in `app/` (the shipped bundle is offline-only and ES5-transpiled for Safari 10 — no runtime LLM calls there). Put it either in `scripts/` as a build-time generator (mirroring `build-cities.js` — precompute answers/enrichments into static data) or in a separate small service the modern clients call; the static export stays untouched. Wrap the provider so it never raises into the date flow: on any failure fall back to the deterministic table, and validate LLM output with a `verify-umalqura.js`-style check before it can ship.
- **Loop** — single-shot is sufficient for date Q&A and location resolution (no tools/agents needed against a fixed table). The moon-sighting offset suggestion is religiously high-stakes and MUST stay human-in-the-loop: the AI only proposes an offset with its evidence; the manual ± knob remains the final authority, exactly as the current design intends (a wrong auto-applied Hijri date is the bug this app was built to fix).

## Quality goals and risks
<!-- The quality attributes that win trade-offs (in order), known risks and technical debt. -->

## Deliberately deferred
<!-- What we chose not to build yet, and the signal that would change that. -->
