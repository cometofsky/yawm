// Single source of truth for "what Hijri date is it here, now".
// All region/sighting/sunset corrections are integer day-shifts applied on top of the
// verified Umm al-Qura table (umalqura.ts), so there is exactly ONE calendar conversion.
// ES5-safe: no Intl, no Date string parsing — only getTime / setDate / new Date(date).

import { gregorianToHijri, HIJRI_MONTHS } from './umalqura';
import { sunsetUtcMs } from './sunset';
import { regionOffsetFor } from './locations';

export type LocationSource = 'gps' | 'city' | 'timezone' | 'none';

export interface ResolvedLocation {
  name: string;
  country: string;
  lat: number | null;
  lon: number | null;
  tz: string | null;
  source: LocationSource;
}

export interface HijriResult {
  hijri: { y: number; m: number; d: number } | null;
  text: string;
  sunsetUtcMs: number | null;
  rolledOver: boolean;
  parts: { sunsetRollover: number; regionOffset: number; manualOffset: number };
}

export function resolveHijri(opts: {
  now: Date;
  location: ResolvedLocation;
  manualOffset: number;
  applyRollover: boolean;
}): HijriResult {
  const { now, location, manualOffset, applyRollover } = opts;

  const regionOffset = location.country ? regionOffsetFor(location.country) : 0;

  let sunsetRollover = 0;
  let sunsetMs: number | null = null;
  if (applyRollover && location.lat != null && location.lon != null) {
    sunsetMs = sunsetUtcMs(location.lat, location.lon, now);
    if (sunsetMs != null && now.getTime() >= sunsetMs) sunsetRollover = 1;
  }

  const totalShift = regionOffset + sunsetRollover + manualOffset;
  const shifted = new Date(now);
  shifted.setDate(shifted.getDate() + totalShift);

  const hijri = gregorianToHijri(shifted);
  const text = hijri
    ? hijri.d + ' ' + HIJRI_MONTHS[hijri.m - 1] + ' ' + hijri.y + ' AH'
    : 'Out of range';

  return {
    hijri,
    text,
    sunsetUtcMs: sunsetMs,
    rolledOver: sunsetRollover === 1,
    parts: { sunsetRollover, regionOffset, manualOffset },
  };
}

// Dev-only self-check: Bangladesh region offset (-1) + Maghrib rollover, around sunset.
if (process.env.NODE_ENV === 'development') {
  const dhaka: ResolvedLocation = {
    name: 'Dhaka', country: 'BD', lat: 23.81, lon: 90.41, tz: 'Asia/Dhaka', source: 'gps',
  };
  const before = resolveHijri({ now: new Date(2026, 5, 27, 10, 0), location: dhaka, manualOffset: 0, applyRollover: true });
  console.assert(!!before.hijri && before.hijri.d === 11, 'hijri BD daytime expected d=11', before);
  const after = resolveHijri({ now: new Date(2026, 5, 27, 20, 0), location: dhaka, manualOffset: 0, applyRollover: true });
  console.assert(!!after.hijri && after.hijri.d === 12, 'hijri BD after-Maghrib expected d=12', after);
}
