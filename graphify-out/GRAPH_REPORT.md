# Graph Report & Architecture Wiki — iyyam (2026-09-02)

## Corpus Summary
- **Files**: 58 files
- **Symbols (Nodes)**: 676 nodes
- **Relationships (Edges)**: 647 edges
- **Verification Status**: 100% EXTRACTED from TypeScript/JavaScript AST
- **Target Platform**: Desktop Clock / iOS 10.3.4 Safari legacy export (100% offline)

---

## Core System Architecture & Modules

### 1. Date & Astronomical Calculation Engines (`app/lib/`)
- [`app/lib/prayer.ts`](file:///Users/FaozulRafi/Projects/iyyam/app/lib/prayer.ts)
  - Core astronomical solar calculation engine (Meeus / NOAA equations in pure ES5).
  - Calculates daily prayer times: `Fajr`, `Sunrise`, `Dhuhr`, `Asr` (Standard & Hanafi), `Maghrib`, `Isha`, `Islamic Midnight`, `Last Third of Night`.
  - Determines current active period (`resolveCurrentWaqt`), time remaining countdown (`formatCountdown`), and active waqt end time.
- [`app/lib/hijri.ts`](file:///Users/FaozulRafi/Projects/iyyam/app/lib/hijri.ts)
  - Unified Hijri date resolver (`resolveHijri`) combining region offset, Maghrib sunset rollover, and manual calibration adjustment.
- [`app/lib/umalqura.ts`](file:///Users/FaozulRafi/Projects/iyyam/app/lib/umalqura.ts)
  - Embedded Umm al-Qura calendar table (1440–1475 AH) and pure-ES5 converter (verified against Node `islamic-umalqura` with 0 mismatches).
- [`app/lib/sunset.ts`](file:///Users/FaozulRafi/Projects/iyyam/app/lib/sunset.ts)
  - NOAA sunset instant calculator returning absolute UTC milliseconds for Maghrib date rollover.
- [`app/lib/locations.ts`](file:///Users/FaozulRafi/Projects/iyyam/app/lib/locations.ts)
  - Curated database of ~900 global cities with coordinates, timezones, and regional moon-sighting offset mappings.
- [`app/lib/useLocationState.ts`](file:///Users/FaozulRafi/Projects/iyyam/app/lib/useLocationState.ts)
  - Centralized hook managing detected/chosen location, localStorage persistence, and live calendar/prayer state synchronization.

---

### 2. User Interface Components (`app/components/` & `app/page.tsx`)
- [`app/page.tsx`](file:///Users/FaozulRafi/Projects/iyyam/app/page.tsx)
  - Hero layout for iPad/desktop desk clock: Side-by-side display with **WaqtCountdownCard** on top-left and **Main Local Clock & World Clocks** on top-right, followed by full-width **TodayPrayerRibbon**.
- [`app/components/PrayerDisplay.tsx`](file:///Users/FaozulRafi/Projects/iyyam/app/components/PrayerDisplay.tsx)
  - Exports `WaqtCountdownCard` (live seconds countdown, active waqt header, Iftar pill, Asr juristic toggle) and `TodayPrayerRibbon` (full-width 6-column timetable ribbon with active waqt highlight).
- [`app/components/Clock.tsx`](file:///Users/FaozulRafi/Projects/iyyam/app/components/Clock.tsx)
  - Digital clock supporting main hero mode with location badge & date, plus compact secondary world clock modes (London, Sydney).
- [`app/components/CalendarDisplay.tsx`](file:///Users/FaozulRafi/Projects/iyyam/app/components/CalendarDisplay.tsx)
  - Three-card responsive layout for Gregorian, Hijri, and Bengali calendars with manual sighting adjustments.
- [`app/components/MonthlyCalendar.tsx`](file:///Users/FaozulRafi/Projects/iyyam/app/components/MonthlyCalendar.tsx)
  - Unified multi-calendar monthly grid with interactive day details and triple calendar day labels.
- [`app/components/LocationPicker.tsx`](file:///Users/FaozulRafi/Projects/iyyam/app/components/LocationPicker.tsx)
  - WAI-ARIA accessible searchable modal combobox for choosing and filtering global cities.

---

### 3. Build, Transpilation & Verification Pipeline (`scripts/`)
- [`scripts/verify-prayer.js`](file:///Users/FaozulRafi/Projects/iyyam/scripts/verify-prayer.js)
  - Regression and accuracy test suite verifying prayer calculations for global test cities (Dhaka, Makkah, London, Tromso polar day).
- [`scripts/verify-umalqura.js`](file:///Users/FaozulRafi/Projects/iyyam/scripts/verify-umalqura.js)
  - Mathematical integrity test verifying all 12,645 days in Umm al-Qura table against Intl.
- [`scripts/transpile-legacy.js`](file:///Users/FaozulRafi/Projects/iyyam/scripts/transpile-legacy.js)
  - Postbuild script downleveling static bundles to ES5 via Babel for iOS 10.3.4 Safari compatibility.
- [`scripts/build-cities.js`](file:///Users/FaozulRafi/Projects/iyyam/scripts/build-cities.js)
  - Data generation script compiling GeoNames dataset into static TypeScript tables.

---

## Key Dependency Graph & Cross-Module Calls
```
[app/page.tsx]
   ├──> useLocationState() (app/lib/useLocationState.ts)
   │        ├──> nearestCity(), cityByTimezone() (app/lib/locations.ts)
   │        └──> ResolvedLocation (app/lib/hijri.ts)
   ├──> WaqtCountdownCard, TodayPrayerRibbon (app/components/PrayerDisplay.tsx)
   │        └──> resolveCurrentWaqt(), calculateDayPrayers() (app/lib/prayer.ts)
   ├──> Clock (app/components/Clock.tsx)
   └──> CalendarDisplay (app/components/CalendarDisplay.tsx)
            ├──> resolveHijri() (app/lib/hijri.ts)
            │        ├──> gregorianToHijri() (app/lib/umalqura.ts)
            │        ├──> sunsetUtcMs() (app/lib/sunset.ts)
            │        └──> regionOffsetFor() (app/lib/locations.ts)
            ├──> MonthlyCalendar (app/components/MonthlyCalendar.tsx)
            └──> LocationPicker (app/components/LocationPicker.tsx)
```