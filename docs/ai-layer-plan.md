# AI layer — forward design (nothing built)

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
