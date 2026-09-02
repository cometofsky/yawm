#!/usr/bin/env node
// Regression and accuracy check for app/lib/prayer.ts
// Run: node scripts/verify-prayer.js (exits non-zero on mismatch)

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ts = require('typescript');

const prayerSrc = fs.readFileSync(path.join(__dirname, '..', 'app', 'lib', 'prayer.ts'), 'utf8');
const transpiled = ts.transpileModule(prayerSrc, { compilerOptions: { module: ts.ModuleKind.CommonJS } });

const prayerModule = {};
const moduleFunction = new Function('exports', 'require', 'module', transpiled.outputText);
moduleFunction(prayerModule, require, { exports: prayerModule });

const { calculateDayPrayers, resolveCurrentWaqt, civilDayKey } = prayerModule;

let failed = 0;

function check(ok, message) {
  if (!ok) {
    console.error('FAIL: ' + message);
    failed++;
  }
}

// --- Child-process leg: the cross-timezone case, run under a deliberately foreign device TZ ---
// Reading the civil day off the DEVICE instead of the selected city is invisible when both
// agree, so this leg has to run with the device in Asia/Dhaka while the city is London.
if (process.env.IYYAM_FOREIGN_TZ_CASE === '1') {
  // 2026-09-02T20:00:00Z = 21:00 Sept 2 in London, but 02:00 Sept 3 in Dhaka (the device).
  const instant = new Date('2026-09-02T20:00:00.000Z');
  const london = resolveCurrentWaqt(instant, 51.5074, -0.1278, { timeZone: 'Europe/London' });
  check(london != null, 'London waqt should resolve with coordinates');
  if (london) {
    check(
      london.currentWaqt === 'Maghrib',
      "device in Asia/Dhaka, city London at 21:00 local: expected 'Maghrib', got '" + london.currentWaqt + "'"
    );
  }
  process.exit(failed === 0 ? 0 : 1);
}

const TEST_CITIES = [
  {
    name: 'Dhaka',
    lat: 23.8103,
    lon: 90.4125,
    tz: 'Asia/Dhaka',
    date: new Date(2026, 8, 2), // Sept 2, 2026
    expected: {
      fajrHour: 4, fajrMinRange: [20, 28],
      sunriseHour: 5, sunriseMinRange: [38, 44],
      dhuhrHour: 12, dhuhrMinRange: [0, 3],
      asrHour: 15, asrMinRange: [24, 30],
      maghribHour: 18, maghribMinRange: [14, 20],
      ishaHour: 19, ishaMinRange: [30, 38],
    }
  },
  {
    name: 'Makkah',
    lat: 21.4225,
    lon: 39.8262,
    tz: 'Asia/Riyadh',
    date: new Date(2026, 8, 2),
    expected: {
      fajrHour: 4, fajrMinRange: [35, 52],
      sunriseHour: 6, sunriseMinRange: [0, 10],
      dhuhrHour: 12, dhuhrMinRange: [15, 25],
      asrHour: 15, asrMinRange: [40, 50],
      maghribHour: 18, maghribMinRange: [30, 42],
      ishaHour: 19, ishaMinRange: [45, 60],
    }
  },
  {
    name: 'London',
    lat: 51.5074,
    lon: -0.1278,
    tz: 'Europe/London',
    date: new Date(2026, 8, 2),
    expected: {
      sunriseHour: 6, sunriseMinRange: [10, 25],
      dhuhrHour: 13, dhuhrMinRange: [0, 10],
      maghribHour: 19, maghribMinRange: [40, 55],
    }
  },
  {
    // High latitude, midsummer: the sun never reaches the -18 deg twilight altitude here, so
    // the Fajr/Isha hour angle has NO solution. Without a high-latitude rule both collapse
    // onto solar noon (13:03) and the ordering assertion below goes red.
    name: 'London (midsummer, no astronomical twilight)',
    lat: 51.5074,
    lon: -0.1278,
    tz: 'Europe/London',
    date: new Date(2026, 5, 21), // June 21, 2026
    expected: {
      sunriseHour: 4, sunriseMinRange: [35, 50],
      dhuhrHour: 13, dhuhrMinRange: [0, 10],
      maghribHour: 21, maghribMinRange: [15, 30],
    }
  },
  {
    // Above the Arctic Circle in midsummer: polar day, so sunrise and sunset have no solution
    // either. Every prayer falls back to the nearest-latitude reference.
    name: 'Tromso (polar day)',
    lat: 69.6492,
    lon: 18.9553,
    tz: 'Europe/Oslo',
    date: new Date(2026, 5, 21),
    expected: {}
  }
];

for (const city of TEST_CITIES) {
  const prayers = calculateDayPrayers(city.lat, city.lon, city.date);

  const fmt = (ms) => {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: city.tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date(ms));
  };

  const getLocalHourMin = (ms) => {
    const str = fmt(ms);
    const [h, m] = str.split(':').map(Number);
    return { h, m, str };
  };

  const fajr = getLocalHourMin(prayers.fajr);
  const sunrise = getLocalHourMin(prayers.sunrise);
  const dhuhr = getLocalHourMin(prayers.dhuhr);
  const asr = getLocalHourMin(prayers.asr);
  const maghrib = getLocalHourMin(prayers.maghrib);
  const isha = getLocalHourMin(prayers.isha);

  console.log(`\n--- ${city.name} (${city.date.toDateString()}) ---`);
  console.log(`Fajr:    ${fajr.str}`);
  console.log(`Sunrise: ${sunrise.str}`);
  console.log(`Dhuhr:   ${dhuhr.str}`);
  console.log(`Asr:     ${asr.str}`);
  console.log(`Maghrib: ${maghrib.str}`);
  console.log(`Isha:    ${isha.str}`);

  // Ordering must hold everywhere, including where the hour-angle equation has no solution.
  check(prayers.fajr < prayers.sunrise, `${city.name}: Fajr ${fajr.str} must precede Sunrise ${sunrise.str}`);
  check(prayers.sunrise < prayers.dhuhr, `${city.name}: Sunrise ${sunrise.str} must precede Dhuhr ${dhuhr.str}`);
  check(prayers.dhuhr < prayers.asr, `${city.name}: Dhuhr ${dhuhr.str} must precede Asr ${asr.str}`);
  check(prayers.asr < prayers.maghrib, `${city.name}: Asr ${asr.str} must precede Maghrib ${maghrib.str}`);
  check(prayers.maghrib < prayers.isha, `${city.name}: Maghrib ${maghrib.str} must precede Isha ${isha.str}`);

  if (city.expected.fajrHour != null) {
    check(
      fajr.h === city.expected.fajrHour && fajr.m >= city.expected.fajrMinRange[0] && fajr.m <= city.expected.fajrMinRange[1],
      `Fajr ${fajr.str} out of expected range for ${city.name}`
    );
  }

  if (city.expected.sunriseHour != null) {
    check(
      sunrise.h === city.expected.sunriseHour && sunrise.m >= city.expected.sunriseMinRange[0] && sunrise.m <= city.expected.sunriseMinRange[1],
      `Sunrise ${sunrise.str} out of expected range for ${city.name}`
    );
  }

  if (city.expected.maghribHour != null) {
    check(
      maghrib.h === city.expected.maghribHour && maghrib.m >= city.expected.maghribMinRange[0] && maghrib.m <= city.expected.maghribMinRange[1],
      `Maghrib ${maghrib.str} out of expected range for ${city.name}`
    );
  }
}

// --- Islamic midnight / last third must bisect Maghrib -> the NEXT day's real Fajr ---
const dhakaToday = calculateDayPrayers(23.8103, 90.4125, new Date(2026, 8, 2));
const dhakaTomorrow = calculateDayPrayers(23.8103, 90.4125, new Date(2026, 8, 3));
const trueNight = dhakaTomorrow.fajr - dhakaToday.maghrib;
const expectedMidnight = dhakaToday.maghrib + trueNight / 2;
const expectedLastThird = dhakaToday.maghrib + (2 * trueNight) / 3;
console.log(`\nDhaka night: midnight drift ${Math.abs(dhakaToday.midnight - expectedMidnight)} ms, lastThird drift ${Math.abs(dhakaToday.lastThird - expectedLastThird)} ms`);
check(Math.abs(dhakaToday.midnight - expectedMidnight) < 1000, 'Islamic midnight must use the next day\'s actual Fajr, not today\'s Fajr + 24h');
check(Math.abs(dhakaToday.lastThird - expectedLastThird) < 1000, 'Last third must use the next day\'s actual Fajr, not today\'s Fajr + 24h');

// --- Without coordinates there is no answer; a default city would be silently wrong ---
check(
  resolveCurrentWaqt(new Date('2026-09-02T10:55:00.000Z'), null, null) === null,
  'resolveCurrentWaqt must return null when latitude/longitude are unknown'
);
check(
  resolveCurrentWaqt(new Date('2026-09-02T10:55:00.000Z'), 23.8103, null) === null,
  'resolveCurrentWaqt must return null when only latitude is known'
);

// --- The civil day belongs to the selected zone, not the device ---
const crossover = new Date('2026-09-02T20:00:00.000Z');
check(civilDayKey(crossover, 'Europe/London') === 20260902, 'civilDayKey(20:00Z, Europe/London) should be 2026-09-02');
check(civilDayKey(crossover, 'Asia/Dhaka') === 20260903, 'civilDayKey(20:00Z, Asia/Dhaka) should be 2026-09-03');

// Test current waqt resolution at specific moment (16:55 in Dhaka)
const dhakaNow = new Date('2026-09-02T10:55:00.000Z');
const waqtAt1655 = resolveCurrentWaqt(dhakaNow, 23.8103, 90.4125, { timeZone: 'Asia/Dhaka' });
console.log(`\nDhaka at 16:55: currentWaqt=${waqtAt1655.currentWaqt}, remaining=${waqtAt1655.remainingFormatted}`);
check(waqtAt1655.currentWaqt === 'Asr', `Expected current waqt 'Asr' at 16:55 Dhaka, got ${waqtAt1655.currentWaqt}`);

// --- Re-run the cross-timezone leg with the device clock in a foreign zone ---
try {
  execFileSync(process.execPath, [__filename], {
    env: Object.assign({}, process.env, { TZ: 'Asia/Dhaka', IYYAM_FOREIGN_TZ_CASE: '1' }),
    stdio: 'pipe',
  });
  console.log('\nForeign-device-timezone case (device Asia/Dhaka, city London): OK');
} catch (e) {
  console.error('\n' + String(e.stdout || '') + String(e.stderr || ''));
  console.error('FAIL: foreign-device-timezone case');
  failed++;
}

if (failed === 0) {
  console.log('\n[PASS] All prayer calculation tests passed successfully.');
  process.exit(0);
} else {
  console.error(`\n[FAIL] ${failed} prayer calculation test(s) failed.`);
  process.exit(1);
}
