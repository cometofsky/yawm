---
status: proposed        # proposed | accepted | superseded by ADR-NNNN — only a human sets accepted
type: product
area: ui, layout, hero
date: 2026-09-02
decided-by:
---
# 0001. The local clock is primary; the waqt card is secondary but wider

The two hero cards were built identical — same surface, padding, shadow, accent bar and numeral
scale in a 50/50 grid — so nothing told the eye which to read first, and the waqt card actually
read louder because its heading was saturated amber. The user asked for hierarchy three times
across two sessions ("the top right's local time clock should be the main focus… the top left's
prayer time should also be visible but should have lesser focus"; "give more importance to the
local time… keep the larger width for the prayer time"; "in portrait mode, make the local time
more bigger").

**Decision:** the local clock is the primary element, separated from the waqt card on four
reinforcing channels — numeral scale, luminance, surface elevation and accent chroma — while the
waqt card keeps the wider column (`md:col-span-5` vs `md:col-span-3`) because its countdown is a
longer string. Width therefore runs counter to emphasis on purpose.

**Consequences:** a change that equalises the two, or that tunes only one channel, re-creates the
tie this decision exists to break. It has already been inverted once by a concurrent agent, which
is why the rule is recorded here rather than left implicit in the Tailwind classes.
