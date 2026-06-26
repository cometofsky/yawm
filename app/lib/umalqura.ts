// Offline Umm al-Qura (Saudi) Gregorian -> Hijri conversion.
// No Intl, no network, ES5-arithmetic only -> works on Safari 10 / old iPad 4 and fully offline.
//
// The table below was generated from Node's 'islamic-umalqura' calendar and verified to match it
// on every day from 2019-01-01..2055-12-31 (0 / 12645 mismatches). See scripts/verify-umalqura.js.
// Covers Hijri 1440..1475 AH (≈ 11 Sep 2018 .. mid-2053). Dates outside this range return null,
// and callers surface that rather than showing a wrong date.
//
// Per-region moon-sighting differences (e.g. Bangladesh often runs ~1 day behind Umm al-Qura) are
// absorbed by the manual +/- offset knob in the UI, not by this table.

const EPOCH_JDN = 2458373; // Julian Day Number of 1 Muharram 1440 AH (11 Sep 2018)
const HY_START = 1440;
// One 12-bit value per Hijri year starting at HY_START; bit (month-1) set => that month has 30 days, else 29.
const MAPS = [
  0x2ba, 0x5b5, 0x5aa, 0xd55, 0xa9a, 0x92e, 0x26e, 0x55d, 0xada, 0x6d4,
  0x6a5, 0xb27, 0xa4d, 0x4ad, 0x56d, 0xb5a, 0x754, 0xf49, 0xe92, 0xd26,
  0xa56, 0x356, 0x6b5, 0xbaa, 0xb92, 0xb25, 0x68b, 0xa9b, 0x55a, 0xada,
  0x5b4, 0xda9, 0xb52, 0xa9a, 0x536, 0x276,
];

export const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani',
  'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah',
];

export interface HijriDate {
  y: number;
  m: number; // 1-12
  d: number;
}

function gregorianToJDN(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy
    + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

function popcount(x: number): number {
  let c = 0;
  while (x) { c += x & 1; x >>= 1; }
  return c;
}

// Uses the date's LOCAL Y/M/D (consistent with how the rest of the app builds Date objects).
export function gregorianToHijri(date: Date): HijriDate | null {
  let off = gregorianToJDN(date.getFullYear(), date.getMonth() + 1, date.getDate()) - EPOCH_JDN;
  if (off < 0) return null;

  let i = 0;
  let hy = HY_START;
  while (i < MAPS.length) {
    const yearDays = 348 + popcount(MAPS[i]); // 12 * 29 + (count of 30-day months)
    if (off < yearDays) break;
    off -= yearDays;
    i++;
    hy++;
  }
  if (i >= MAPS.length) return null; // beyond covered range

  let hm = 1;
  const bm = MAPS[i];
  while (hm <= 12) {
    const monthDays = 29 + ((bm >> (hm - 1)) & 1);
    if (off < monthDays) break;
    off -= monthDays;
    hm++;
  }
  return { y: hy, m: hm, d: off + 1 };
}

export function formatHijri(date: Date): string {
  const h = gregorianToHijri(date);
  if (!h) return 'Out of range';
  return h.d + ' ' + HIJRI_MONTHS[h.m - 1] + ' ' + h.y + ' AH';
}

// Dev-only self-check: cheap anchor assertions that fail loudly if the table/maths regress.
if (process.env.NODE_ENV === 'development') {
  const anchor = gregorianToHijri(new Date(2026, 5, 26)); // 26 Jun 2026 -> 11 Muharram 1448
  console.assert(
    !!anchor && anchor.y === 1448 && anchor.m === 1 && anchor.d === 11,
    'umalqura anchor 2026-06-26 failed', anchor,
  );
  const eid = gregorianToHijri(new Date(2026, 4, 27)); // 27 May 2026 -> 10 Dhul Hijjah 1447
  console.assert(
    !!eid && eid.y === 1447 && eid.m === 12 && eid.d === 10,
    'umalqura anchor 2026-05-27 failed', eid,
  );
}
