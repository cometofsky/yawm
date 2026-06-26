// Sunset instant for a civil date at (lat, lon), as an absolute UTC millisecond instant.
//
// Pure ES5 arithmetic (Math.* + Date.UTC/new Date(ms) only) -> works on Safari 10 / old iPad 4
// and fully offline. NO Intl, NO Date string parsing. The returned value is an absolute instant,
// so callers compare it to Date.now() with ZERO timezone math.
//
// Standard NOAA / Meeus "sunrise equation" (https://en.wikipedia.org/wiki/Sunrise_equation):
// the device-local civil Y/M/D of `date` picks WHICH day's sunset; lat/lon place it.
// Sunset zenith is 90.833 deg (solar altitude -0.833 deg = atmospheric refraction + solar radius).
// Returns null when the sun does not set that day (polar guard) instead of NaN.

const J2000 = 2451545.0; // Julian date of 2000-01-01 12:00 UTC
const UNIX_EPOCH_JD = 2440587.5; // Julian date of 1970-01-01 00:00 UTC
const MS_PER_DAY = 86400000;
const OBLIQUITY = 23.4397; // mean obliquity of the ecliptic, degrees
const ALTITUDE = -0.833; // solar altitude at sunset, degrees (refraction + radius)
const DEG = Math.PI / 180;

// Integer Julian Day Number for a Gregorian date at noon UTC (same formula as umalqura.ts).
function gregorianToJDN(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy
    + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

export function sunsetUtcMs(lat: number, lon: number, date: Date): number | null {
  const n = gregorianToJDN(date.getFullYear(), date.getMonth() + 1, date.getDate()) - 2451545;

  // Mean solar time (lon east-positive: J* = n - lon/360).
  const jStar = n + 0.0008 - lon / 360;

  // Solar mean anomaly (deg) -> equation of center (deg) -> ecliptic longitude (deg).
  const m = (357.5291 + 0.98560028 * jStar) % 360;
  const mRad = m * DEG;
  const c = 1.9148 * Math.sin(mRad) + 0.0200 * Math.sin(2 * mRad) + 0.0003 * Math.sin(3 * mRad);
  const lambdaRad = (m + c + 180 + 102.9372) * DEG;

  // Solar transit (Julian date of solar noon for this place/day).
  const jTransit = J2000 + jStar + 0.0053 * Math.sin(mRad) - 0.0069 * Math.sin(2 * lambdaRad);

  // Sun declination.
  const sinDec = Math.sin(lambdaRad) * Math.sin(OBLIQUITY * DEG);
  const cosDec = Math.cos(Math.asin(sinDec));

  // Hour angle at sunset. Polar guard: no real sunset that day.
  const latRad = lat * DEG;
  const cosOmega = (Math.sin(ALTITUDE * DEG) - Math.sin(latRad) * sinDec) / (Math.cos(latRad) * cosDec);
  if (cosOmega < -1 || cosOmega > 1) return null;

  const omegaDeg = Math.acos(cosOmega) / DEG;
  const jSet = jTransit + omegaDeg / 360;
  return Math.round((jSet - UNIX_EPOCH_JD) * MS_PER_DAY);
}

// Dev-only self-check: fails loudly if the maths regress.
if (process.env.NODE_ENV === 'development') {
  // Dhaka 23.81, 90.41 on 2026-06-27 -> sunset ~18:49 local (UTC+6) = ~12:49 UTC.
  const ms = sunsetUtcMs(23.81, 90.41, new Date(2026, 5, 27));
  const refUtcMs = Date.UTC(2026, 5, 27, 12, 49); // 12:49 UTC reference
  console.assert(
    ms != null && Math.abs(ms - refUtcMs) < 3 * 60 * 1000,
    'sunset Dhaka 2026-06-27 off by >3min', ms, refUtcMs,
  );
  // Polar guard: Longyearbyen 78.22, 15.65 in midsummer never sets -> null.
  console.assert(
    sunsetUtcMs(78.22, 15.65, new Date(2026, 5, 21)) === null,
    'sunset polar guard failed for Longyearbyen midsummer',
  );
}
