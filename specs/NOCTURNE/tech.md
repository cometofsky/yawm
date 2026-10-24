# Nocturne implementation

## Direction contract

THESIS: an evening household timepiece, with centered local time above a quieter wider waqt band, replacing the equal-card dashboard.

OWN-WORLD: matte plum #211b27, pearl #fff1e9, bronze #d8ba8c, shallow inset controls and sparse horizontal separators. Heavy system monospace time and bold sans-serif date/waqt labels remain available offline. The owner’s later distance-reading instruction supersedes the preview’s serif styling.

STORY: read time, current waqt and Hijri prediction; approach the device to select a city, correct the date or customize reading comfort.

FIRST VIEWPORT: compact iyyam header with persistent Accessibility and Appearance buttons, oversized centered time, horizontal prayer information and timetable, then a three-calendar dateline with visible Hijri stepper. Supporting month/world clocks follow.

FORM: owner selected Nocturne from the 2026-10-24 three-direction round; comparison seed 254db35e. The selected static preview is composition guidance, not a correctness oracle.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implementation sequence

1. Extend useSettings with validated appearance/accessibility preferences and scoped resets; keep the existing storage key and display switches compatible.
2. Add shared accessible dialog behavior, an accessibility panel and appearance/display controls. Use the existing React/lucide stack; no dependencies or external assets.
3. Replace page/component styling using semantic CSS classes and palette variables, conventional responsive fallbacks and the existing CSS/ES5 legacy pipeline. Keep calculation functions unchanged.
4. Verify stored-data validation, keyboard flows, reduced motion, theme changes, scaling/reflow, section toggles, location/manual offset and static export. Run typecheck, domain tests, build/postbuild, rendered checks and docs checker.

## Responsibilities and risks

Coordinator owns settings, dialogs, settings UI, specs/docs, integration and verification. UI designer owns page, styles, clock/prayer/calendar/location components.

- Saved preferences may be malformed or stale: normalize only supported keys and enums, preserve explicit false/100 values, and catch storage failures.
- Large text or controls can obscure the clock and dialogs: use rem typography, wrapping, scrollable dialog bodies and narrow-screen layouts, then exercise all features at 200%.
- New styling/motion may fail on old Safari: avoid new dependencies and flex gap, respect media preferences, build through postbuild and distinguish Chromium evidence from hardware acceptance.

## Evidence

Live status and final verification results belong to TASKS.md. [Structured local measurements](../../.impeccable/review/verification.json) preserve the browser/static-export evidence. Final [desktop](../../.impeccable/review/desktop.png), [iPad landscape](../../.impeccable/review/ipad-landscape.png) and [phone](../../.impeccable/review/mobile.png) captures show the implemented heavy typography.
