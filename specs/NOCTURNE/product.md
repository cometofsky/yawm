# Nocturne redesign

## Approved scope

Owner selected Nocturne on 2026-10-24 after reviewing three directions and adding accessibility and color-theme requirements. Replace the visual identity across the clock, prayer band/timetable, three calendars, month grid, date details, location search and settings. Preserve current date/prayer calculations, location choice, manual Hijri correction and display options.

## Acceptance

- Local time is the largest, brightest centered element; its field is narrower than the quieter horizontal waqt band below. Portrait retains readable time and clear reading order.
- Owner refinement: the heaviest available offline typography, bold sans-serif dates/prayer names and larger supporting labels prioritize reading across a room on the 2014 desk/wall iPad.
- Plum, pearl and bronze express the approved visual world; restrained 180–220ms interactions stop under reduced motion. No continuous decoration or flipping digits.
- Persistent labeled Accessibility button opens text size (100/125/150/200%), high contrast, reduced motion, larger controls and normal/dim luminance settings. Respect system motion reduction. Browser zoom, keyboard navigation, focus visibility and screen-reader semantics work without opening this panel.
- Appearance offers Original, Slate, Forest and Warm themes. Settings persist locally, validate saved values and degrade gracefully when storage is unavailable. Reset accessibility or appearance independently without changing city, Hijri correction or Asr method.
- All existing section switches, current/next vs full prayer display, Asr method, Iftar, world clocks, city search, recent cities, month navigation/highlighting and day details remain operable. Hijri prediction is labeled and manual correction remains next to it.
- Dialogs support Escape, contained focus, focus restoration and accessible names. Changes in countdown do not announce every second. State has text/shape cues as well as color.
- Reflow at 320px and 200% app text, at least 44px targets (56px with larger controls), readable contrast across themes; loading and unavailable states retain their recovery paths.
- Offline static export and ES5 postbuild remain intact. Real iOS 10.3.4 operation remains a separate hardware acceptance requirement if unavailable locally.

## Out of scope

No deployment, publication, account/backend work or changes to religious/date-calculation policy.
