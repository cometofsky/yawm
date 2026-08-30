---
name: modify_hijri_logic
description: Enforces rules around the custom Hijri resolver and forbids Intl non-Gregorian math.
---

# Modify Hijri Logic Skill

When modifying date logic in `iyyam`, strictly follow these constraints:

1. **No Intl Calendars**: NEVER use `Intl` non-Gregorian / timezone calendars. On iOS 10.3.4 Safari, `'…-u-ca-islamic'` silently renders Gregorian.
2. **Single Resolver**: All date logic MUST go through `resolveHijri` in `app/lib/hijri.ts` <!-- claim: cmd=`grep "export function resolveHijri" app/lib/hijri.ts` expect=`export function resolveHijri(opts: {` -->. Both the Card (`app/components/CalendarDisplay.tsx`) and grid (`app/components/MonthlyCalendar.tsx`) use this. Do not fix date bugs per-component.
3. **No Network Geolocation**: The date path is offline-only. Do not add `fetch()` calls or blocking GPS geolocation logic to the date math.
4. **Umm al-Qura Table**: Do not invent Hijri month names or table logic. `HIJRI_MONTHS` lives in `app/lib/umalqura.ts` <!-- claim: cmd=`grep "export const HIJRI_MONTHS" app/lib/umalqura.ts` expect=`export const HIJRI_MONTHS = [` -->.
5. **Verification**: After modifying date logic, run `.agents/tools/run_strict_checks.sh` to ensure `npm test` (which runs `verify-umalqura.js` <!-- claim: cmd=`grep '"test":' package.json` expect=`"test": "node scripts/verify-umalqura.js"` -->) passes.

<!-- repowiki: audited-at ab11e4ea57c4ac25d2bb1a3cbd3b5bde7f6f450b on 2026-08-30 -->
