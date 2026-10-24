# iyyam

An always-on Islamic desk clock: a single static page showing the local time, the current and
next prayer (waqt), and the Hijri date, built to run on an old iPad propped on a shelf. No
backend, no database, no network at runtime.

## Language

**Waqt**:
One of the five daily prayer windows. The app names the window that is *currently* open and
counts down to the next one — it is a live interval, not a single timestamp.
_Avoid_: "prayer time" for the window itself (that is the boundary instant)

**Region offset**:
Which regional authority's convention is applied to the Hijri conversion, chosen per location.
_Avoid_: confusing it with the manual offset or with Maghrib rollover — three independent axes

**Manual offset**:
The user's own ±N-day correction on top of the computed Hijri date. It is the final authority in
this app, because a real Hijri date is announced by a moon-sighting committee, not computed.

**Maghrib rollover**:
The rule that the Hijri day advances at sunset rather than at midnight. Independent of the region
offset and of the manual offset.

**Umm al-Qura**:
The Saudi civil Hijri calendar. Its month-length table is embedded in `app/lib/umalqura.ts` and
is the deterministic source for every Hijri conversion here.

**Desk-clock layout**:
The single hero row: the waqt card and the local clock side by side, read from across a room.
Their relative prominence is a product rule — see `PRODUCT.md`.

**Nocturne**:
The owner-selected visual system: a centered pearl local clock on plum, with a quieter wider waqt band. Original, Slate, Forest and Warm are color themes within this system, not separate layouts.

**Display luminance**:
Normal/Dim changes page colors for reading comfort. It does not change device hardware brightness.
