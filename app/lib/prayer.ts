// Islamic prayer times (Waqt) calculation engine.
//
// Solar math is pure ES5 arithmetic (Math.* + Date.UTC/new Date(ms) only) -> works on
// Safari 10 / iPad 4 and fully offline. NO external network calls.
// The ONE exception is `civilDateIn`, which uses Intl.DateTimeFormat.formatToParts to read
// the wall-clock day in the selected city's timezone; it is feature-detected and falls back
// to the device's own local day (the pre-existing behaviour) where Intl is absent.
// Standard Meeus / NOAA astronomical equations.

export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
export type AsrJuristicMethod = 'standard' | 'hanafi';
export type CalculationMethod = 'karachi' | 'mwl' | 'makkah' | 'egypt' | 'isna';

export interface PrayerCalculationOptions {
  asrMethod?: AsrJuristicMethod; // 'standard' (Shafi'i/Maliki/Hanbali, shadow 1x) or 'hanafi' (shadow 2x)
  calcMethod?: CalculationMethod; // default 'karachi'
  dhuhrOffsetMinutes?: number; // default +1 min safety margin past solar noon
  timeZone?: string | null; // IANA zone the civil day is read in; falls back to the device's zone
}

export interface DayPrayerTimes {
  date: Date;
  fajr: number; // UTC ms
  sunrise: number; // UTC ms
  dhuhr: number; // UTC ms
  asr: number; // UTC ms
  maghrib: number; // UTC ms
  isha: number; // UTC ms
  midnight: number; // UTC ms (Islamic midnight: halfway between Maghrib and next day's actual Fajr)
  lastThird: number; // UTC ms (Last third of night: 2/3 between Maghrib and next day's actual Fajr)
}

export interface PrayerTimeItem {
  name: PrayerName;
  label: string;
  timeMs: number;
  isCurrent: boolean;
  isNext: boolean;
}

export interface WaqtStatus {
  currentWaqt: PrayerName | 'Sunrise';
  currentWaqtLabel: string;
  isPrayerTime: boolean; // true during Fajr, Dhuhr, Asr, Maghrib, Isha; false during Sunrise/Duha
  currentWaqtStartMs: number;
  currentWaqtEndMs: number;
  nextWaqt: PrayerName;
  nextWaqtStartMs: number;
  remainingMs: number;
  remainingFormatted: string; // e.g. "01:22:40"
  todayPrayers: PrayerTimeItem[];
  suhoorEndMs: number; // Fajr start
  iftarMs: number; // Maghrib start
}

const DEG = Math.PI / 180;
const J2000 = 2451545.0;
const UNIX_EPOCH_JD = 2440587.5;
const MS_PER_DAY = 86400000;
const OBLIQUITY = 23.4397; // Mean obliquity of ecliptic (degrees)
const SUNRISE_ALTITUDE = -0.833; // Atmospheric refraction + solar radius (degrees)

// "Nearest latitude" (aqrab al-bilad) high-latitude rule. Above roughly 48.5 degrees the sun
// stops reaching the twilight altitudes for weeks at a time and the hour-angle equation has no
// solution; past the polar circles sunrise/sunset disappear too. Rather than collapsing those
// prayers onto solar noon, recompute the missing leg at this latitude on the same hemisphere.
// 45 keeps every shipped method (Fajr angles down to -19.5) inside acos range at max declination.
// ceiling: one global reference latitude for all methods; if a user needs a specific
// convention (1/7-night, middle-of-night, or a local committee's table), make it a
// per-location setting alongside the existing manual Hijri offset.
const HIGH_LAT_REFERENCE = 45;

// Integer Julian Day Number for a Gregorian date at noon UTC (same as umalqura.ts & sunset.ts)
function gregorianToJDN(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy
    + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

// One-entry formatter cache: resolveCurrentWaqt and the UI ticker both hit this per update,
// and constructing an Intl.DateTimeFormat is far more expensive than formatting with one.
let tzFormatter: { tz: string; fmt: Intl.DateTimeFormat | null } | null = null;

/**
 * The civil (wall-clock) date at `instant` in `timeZone`, as a Date whose LOCAL fields carry
 * that date. Falls back to the device's own local date when the zone is unknown or Intl is
 * unavailable (Safari 10), which is exactly the behaviour this replaced.
 */
export function civilDateIn(instant: Date, timeZone?: string | null): Date {
  const deviceLocal = () => new Date(instant.getFullYear(), instant.getMonth(), instant.getDate());
  if (!timeZone) return deviceLocal();

  if (!tzFormatter || tzFormatter.tz !== timeZone) {
    let fmt: Intl.DateTimeFormat | null = null;
    try {
      const candidate = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      if (typeof candidate.formatToParts === 'function') fmt = candidate;
    } catch (e) {
      fmt = null; // unknown IANA zone, or no Intl timezone support
    }
    tzFormatter = { tz: timeZone, fmt: fmt };
  }

  const fmt = tzFormatter.fmt;
  if (!fmt) return deviceLocal();

  let y = 0;
  let m = 0;
  let d = 0;
  const parts = fmt.formatToParts(instant);
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p.type === 'year') y = parseInt(p.value, 10);
    else if (p.type === 'month') m = parseInt(p.value, 10);
    else if (p.type === 'day') d = parseInt(p.value, 10);
  }
  if (!y || !m || !d) return deviceLocal();
  return new Date(y, m - 1, d);
}

/** Comparable YYYYMMDD key for the civil day at `instant` in `timeZone`. */
export function civilDayKey(instant: Date, timeZone?: string | null): number {
  const d = civilDateIn(instant, timeZone);
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

interface SolarCoords {
  solarNoonMs: number;
  sinDec: number;
  cosDec: number;
  decRad: number;
}

function calculateSolar(lat: number, lon: number, date: Date): SolarCoords {
  const n = gregorianToJDN(date.getFullYear(), date.getMonth() + 1, date.getDate()) - 2451545;
  const jStar = n + 0.0008 - lon / 360;
  const m = (357.5291 + 0.98560028 * jStar) % 360;
  const mRad = m * DEG;
  const c = 1.9148 * Math.sin(mRad) + 0.0200 * Math.sin(2 * mRad) + 0.0003 * Math.sin(3 * mRad);
  const lambdaRad = (m + c + 180 + 102.9372) * DEG;
  const jTransit = J2000 + jStar + 0.0053 * Math.sin(mRad) - 0.0069 * Math.sin(2 * lambdaRad);
  const sinDec = Math.sin(lambdaRad) * Math.sin(OBLIQUITY * DEG);
  const cosDec = Math.cos(Math.asin(sinDec));
  const decRad = Math.asin(sinDec);
  const solarNoonMs = Math.round((jTransit - UNIX_EPOCH_JD) * MS_PER_DAY);
  return { solarNoonMs, sinDec, cosDec, decRad };
}

function getHourAngleMs(lat: number, solar: SolarCoords, altitudeDeg: number): number | null {
  const latRad = lat * DEG;
  const cosOmega = (Math.sin(altitudeDeg * DEG) - Math.sin(latRad) * solar.sinDec) / (Math.cos(latRad) * solar.cosDec);
  if (cosOmega < -1 || cosOmega > 1) return null;
  const omegaDeg = Math.acos(cosOmega) / DEG;
  return (omegaDeg / 360) * MS_PER_DAY;
}

function getAsrHourAngleMs(lat: number, solar: SolarCoords, shadowFactor: number): number | null {
  const latRad = lat * DEG;
  const phiMinusDelta = Math.abs(latRad - solar.decRad);
  const altitudeRad = Math.atan(1 / (shadowFactor + Math.tan(phiMinusDelta)));
  const cosOmega = (Math.sin(altitudeRad) - Math.sin(latRad) * solar.sinDec) / (Math.cos(latRad) * solar.cosDec);
  if (cosOmega < -1 || cosOmega > 1) return null;
  const omegaDeg = Math.acos(cosOmega) / DEG;
  return (omegaDeg / 360) * MS_PER_DAY;
}

// Declination is latitude-independent, so the nearest-latitude retry reuses the same SolarCoords.
function referenceLatFor(lat: number): number {
  return lat < 0 ? -HIGH_LAT_REFERENCE : HIGH_LAT_REFERENCE;
}

function hourAngleMs(lat: number, solar: SolarCoords, altitudeDeg: number): number {
  const direct = getHourAngleMs(lat, solar, altitudeDeg);
  if (direct != null) return direct;
  const nearest = getHourAngleMs(referenceLatFor(lat), solar, altitudeDeg);
  return nearest != null ? nearest : MS_PER_DAY / 4; // unreachable at 45 deg; keeps the type total
}

function asrHourAngleMs(lat: number, solar: SolarCoords, shadowFactor: number): number {
  const direct = getAsrHourAngleMs(lat, solar, shadowFactor);
  if (direct != null) return direct;
  const nearest = getAsrHourAngleMs(referenceLatFor(lat), solar, shadowFactor);
  return nearest != null ? nearest : MS_PER_DAY / 8;
}

// Discriminated so a method either has an Isha angle or a fixed minutes-after-Maghrib rule,
// never a placeholder value for the branch it does not use.
type MethodAngles =
  | { fajrAngle: number; ishaAngle: number; ishaFixedMin?: undefined }
  | { fajrAngle: number; ishaAngle?: undefined; ishaFixedMin: number };

function getMethodAngles(method: CalculationMethod): MethodAngles {
  switch (method) {
    case 'mwl':
      return { fajrAngle: -18, ishaAngle: -17 };
    case 'makkah':
      return { fajrAngle: -18.5, ishaFixedMin: 90 };
    case 'egypt':
      return { fajrAngle: -19.5, ishaAngle: -17.5 };
    case 'isna':
      return { fajrAngle: -15, ishaAngle: -15 };
    case 'karachi':
    default:
      return { fajrAngle: -18, ishaAngle: -18 };
  }
}

interface CoreTimes {
  fajr: number;
  sunrise: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

function computeCore(
  lat: number,
  lon: number,
  date: Date,
  asrMethod: AsrJuristicMethod,
  angles: MethodAngles,
  dhuhrOffset: number
): CoreTimes {
  const solar = calculateSolar(lat, lon, date);
  const noon = solar.solarNoonMs;

  const fajrOffset = hourAngleMs(lat, solar, angles.fajrAngle);
  const sunriseOffset = hourAngleMs(lat, solar, SUNRISE_ALTITUDE);
  const asrOffset = asrHourAngleMs(lat, solar, asrMethod === 'hanafi' ? 2 : 1);
  const sunsetOffset = sunriseOffset; // same altitude, mirrored about solar noon

  const maghrib = noon + sunsetOffset;
  const isha = angles.ishaFixedMin != null
    ? maghrib + angles.ishaFixedMin * 60 * 1000
    : noon + hourAngleMs(lat, solar, angles.ishaAngle);

  return {
    fajr: noon - fajrOffset,
    sunrise: noon - sunriseOffset,
    dhuhr: noon + dhuhrOffset,
    asr: noon + asrOffset,
    maghrib: maghrib,
    isha: isha,
  };
}

/**
 * Calculates raw prayer timestamps (UTC ms) for a specific civil date at (lat, lon).
 */
export function calculateDayPrayers(
  lat: number,
  lon: number,
  date: Date,
  options?: PrayerCalculationOptions
): DayPrayerTimes {
  const asrMethod = options?.asrMethod || 'standard';
  const calcMethod = options?.calcMethod || 'karachi';
  const dhuhrOffset = (options?.dhuhrOffsetMinutes ?? 1) * 60 * 1000;
  const angles = getMethodAngles(calcMethod);

  const core = computeCore(lat, lon, date, asrMethod, angles, dhuhrOffset);

  // Night runs from this evening's Maghrib to the NEXT day's actual Fajr, not to today's Fajr
  // shifted 24h - the two differ by the day-over-day change in Fajr.
  const nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  const nextFajr = computeCore(lat, lon, nextDate, asrMethod, angles, dhuhrOffset).fajr;
  const nightDuration = nextFajr - core.maghrib;

  return {
    date,
    fajr: core.fajr,
    sunrise: core.sunrise,
    dhuhr: core.dhuhr,
    asr: core.asr,
    maghrib: core.maghrib,
    isha: core.isha,
    midnight: core.maghrib + Math.round(nightDuration / 2),
    lastThird: core.maghrib + Math.round((2 * nightDuration) / 3),
  };
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = hours < 10 ? '0' + hours : '' + hours;
  const mm = minutes < 10 ? '0' + minutes : '' + minutes;
  const ss = seconds < 10 ? '0' + seconds : '' + seconds;
  return hh + ':' + mm + ':' + ss;
}

/**
 * Resolves the currently active Waqt period, time remaining, and formatted prayer timetable.
 * Returns null when there are no coordinates: prayer times are location-specific, and showing
 * some other city's timetable under the user's own timezone label would be silently wrong.
 */
export function resolveCurrentWaqt(
  now: Date,
  lat: number | null,
  lon: number | null,
  options?: PrayerCalculationOptions
): WaqtStatus | null {
  if (lat == null || lon == null) return null;

  const nowMs = now.getTime();

  // The civil day belongs to the SELECTED location, not to the device - otherwise a user in
  // Dhaka viewing London gets tomorrow's London timetable for six hours every evening.
  const today = civilDateIn(now, options?.timeZone);
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const tPrev = calculateDayPrayers(lat, lon, yesterday, options);
  const tToday = calculateDayPrayers(lat, lon, today, options);
  const tNext = calculateDayPrayers(lat, lon, tomorrow, options);

  let currentWaqt: PrayerName | 'Sunrise';
  let currentWaqtLabel: string;
  let isPrayerTime: boolean;
  let currentWaqtStartMs: number;
  let currentWaqtEndMs: number;
  let nextWaqt: PrayerName;
  let nextWaqtStartMs: number;

  if (nowMs < tToday.fajr) {
    // Early morning before Fajr: active waqt is Isha from yesterday night
    currentWaqt = 'Isha';
    currentWaqtLabel = 'Isha';
    isPrayerTime = true;
    currentWaqtStartMs = tPrev.isha;
    currentWaqtEndMs = tToday.fajr;
    nextWaqt = 'Fajr';
    nextWaqtStartMs = tToday.fajr;
  } else if (nowMs < tToday.sunrise) {
    // Fajr period until Sunrise
    currentWaqt = 'Fajr';
    currentWaqtLabel = 'Fajr';
    isPrayerTime = true;
    currentWaqtStartMs = tToday.fajr;
    currentWaqtEndMs = tToday.sunrise;
    nextWaqt = 'Sunrise';
    nextWaqtStartMs = tToday.sunrise;
  } else if (nowMs < tToday.dhuhr) {
    // Sunrise / Duha / Ishraq period until Dhuhr
    currentWaqt = 'Sunrise';
    currentWaqtLabel = 'Duha / Ishraq';
    isPrayerTime = false;
    currentWaqtStartMs = tToday.sunrise;
    currentWaqtEndMs = tToday.dhuhr;
    nextWaqt = 'Dhuhr';
    nextWaqtStartMs = tToday.dhuhr;
  } else if (nowMs < tToday.asr) {
    // Dhuhr period until Asr
    currentWaqt = 'Dhuhr';
    currentWaqtLabel = 'Dhuhr';
    isPrayerTime = true;
    currentWaqtStartMs = tToday.dhuhr;
    currentWaqtEndMs = tToday.asr;
    nextWaqt = 'Asr';
    nextWaqtStartMs = tToday.asr;
  } else if (nowMs < tToday.maghrib) {
    // Asr period until Maghrib (Sunset)
    currentWaqt = 'Asr';
    currentWaqtLabel = 'Asr';
    isPrayerTime = true;
    currentWaqtStartMs = tToday.asr;
    currentWaqtEndMs = tToday.maghrib;
    nextWaqt = 'Maghrib';
    nextWaqtStartMs = tToday.maghrib;
  } else if (nowMs < tToday.isha) {
    // Maghrib period until Isha
    currentWaqt = 'Maghrib';
    currentWaqtLabel = 'Maghrib';
    isPrayerTime = true;
    currentWaqtStartMs = tToday.maghrib;
    currentWaqtEndMs = tToday.isha;
    nextWaqt = 'Isha';
    nextWaqtStartMs = tToday.isha;
  } else {
    // Isha period until tomorrow's Fajr
    currentWaqt = 'Isha';
    currentWaqtLabel = 'Isha';
    isPrayerTime = true;
    currentWaqtStartMs = tToday.isha;
    currentWaqtEndMs = tNext.fajr;
    nextWaqt = 'Fajr';
    nextWaqtStartMs = tNext.fajr;
  }

  const remainingMs = Math.max(0, currentWaqtEndMs - nowMs);
  const remainingFormatted = formatCountdown(remainingMs);

  const todayPrayers: PrayerTimeItem[] = [
    { name: 'Fajr', label: 'Fajr', timeMs: tToday.fajr, isCurrent: currentWaqt === 'Fajr', isNext: nextWaqt === 'Fajr' },
    { name: 'Sunrise', label: 'Sunrise', timeMs: tToday.sunrise, isCurrent: currentWaqt === 'Sunrise', isNext: nextWaqt === 'Sunrise' },
    { name: 'Dhuhr', label: 'Dhuhr', timeMs: tToday.dhuhr, isCurrent: currentWaqt === 'Dhuhr', isNext: nextWaqt === 'Dhuhr' },
    { name: 'Asr', label: 'Asr', timeMs: tToday.asr, isCurrent: currentWaqt === 'Asr', isNext: nextWaqt === 'Asr' },
    { name: 'Maghrib', label: 'Maghrib', timeMs: tToday.maghrib, isCurrent: currentWaqt === 'Maghrib', isNext: nextWaqt === 'Maghrib' },
    { name: 'Isha', label: 'Isha', timeMs: tToday.isha, isCurrent: currentWaqt === 'Isha', isNext: nextWaqt === 'Isha' },
  ];

  return {
    currentWaqt,
    currentWaqtLabel,
    isPrayerTime,
    currentWaqtStartMs,
    currentWaqtEndMs,
    nextWaqt,
    nextWaqtStartMs,
    remainingMs,
    remainingFormatted,
    todayPrayers,
    suhoorEndMs: tToday.fajr,
    iftarMs: tToday.maghrib,
  };
}

// Dev-only self-check: Dhaka 2026-09-02 verification, plus the high-latitude rule that a
// mid-latitude fixture cannot reach (London in June has no -18 deg twilight at all).
if (process.env.NODE_ENV === 'development') {
  const dhakaPrayers = calculateDayPrayers(23.81, 90.41, new Date(2026, 8, 2), { asrMethod: 'standard', calcMethod: 'karachi' });
  const fajrDate = new Date(dhakaPrayers.fajr);
  // Fajr should be ~04:24 local (UTC 22:24 on Sept 1)
  console.assert(fajrDate.getUTCHours() === 22 && fajrDate.getUTCMinutes() >= 20 && fajrDate.getUTCMinutes() <= 28, 'Fajr self-check', fajrDate.toISOString());
  const maghribDate = new Date(dhakaPrayers.maghrib);
  // Maghrib should be ~18:17 local (UTC 12:17 on Sept 2)
  console.assert(maghribDate.getUTCHours() === 12 && maghribDate.getUTCMinutes() >= 15 && maghribDate.getUTCMinutes() <= 20, 'Maghrib self-check', maghribDate.toISOString());

  const londonJune = calculateDayPrayers(51.5074, -0.1278, new Date(2026, 5, 21));
  console.assert(
    londonJune.fajr < londonJune.sunrise && londonJune.sunrise < londonJune.dhuhr
      && londonJune.dhuhr < londonJune.asr && londonJune.asr < londonJune.maghrib
      && londonJune.maghrib < londonJune.isha,
    'high-latitude ordering self-check (London, 21 Jun)', londonJune
  );
}
