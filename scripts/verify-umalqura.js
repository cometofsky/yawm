#!/usr/bin/env node
// Regression check for app/lib/umalqura.ts: re-reads the embedded table from source and verifies
// the conversion matches Node's 'islamic-umalqura' calendar on every day in the covered range.
// Run: node scripts/verify-umalqura.js   (exits non-zero on any mismatch)

const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '..', 'app', 'lib', 'umalqura.ts'), 'utf8');
const EPOCH_JDN = parseInt(src.match(/EPOCH_JDN\s*=\s*(\d+)/)[1], 10);
const HY_START = parseInt(src.match(/HY_START\s*=\s*(\d+)/)[1], 10);
const MAPS = src.match(/const MAPS\s*=\s*\[([\s\S]*?)\]/)[1]
  .split(',').map((s) => s.trim()).filter(Boolean).map((s) => parseInt(s, 16));

function gregorianToJDN(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy
    + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}
function popcount(x) { let c = 0; while (x) { c += x & 1; x >>= 1; } return c; }
function gregorianToHijri(y, m, d) {
  let off = gregorianToJDN(y, m, d) - EPOCH_JDN;
  if (off < 0) return null;
  let i = 0, hy = HY_START;
  while (i < MAPS.length) {
    const yd = 348 + popcount(MAPS[i]);
    if (off < yd) break;
    off -= yd; i++; hy++;
  }
  if (i >= MAPS.length) return null;
  let hm = 1; const bm = MAPS[i];
  while (hm <= 12) {
    const md = 29 + ((bm >> (hm - 1)) & 1);
    if (off < md) break;
    off -= md; hm++;
  }
  return { y: hy, m: hm, d: off + 1 };
}
function umalqura(y, m, d) {
  const parts = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura',
    { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC' })
    .formatToParts(new Date(Date.UTC(y, m - 1, d, 12)));
  const o = {};
  parts.forEach((p) => { o[p.type] = p.value; });
  return { y: +o.year, m: +o.month, d: +o.day };
}

const HY_END = HY_START + MAPS.length - 1;
let checks = 0, mismatches = 0;
const cur = new Date(Date.UTC(2019, 0, 1, 12));
const end = new Date(Date.UTC(2055, 11, 31, 12));
while (cur <= end) {
  const y = cur.getUTCFullYear(), m = cur.getUTCMonth() + 1, d = cur.getUTCDate();
  const exp = umalqura(y, m, d);
  if (exp.y >= HY_START && exp.y <= HY_END) {
    checks++;
    const got = gregorianToHijri(y, m, d);
    if (!got || got.y !== exp.y || got.m !== exp.m || got.d !== exp.d) {
      mismatches++;
      if (mismatches <= 5) console.error('MISMATCH', `${y}-${m}-${d}`, 'got', got, 'expected', exp);
    }
  }
  cur.setUTCDate(cur.getUTCDate() + 1);
}
console.log(`covered Hijri ${HY_START}..${HY_END} | checks: ${checks} | mismatches: ${mismatches}`);
if (mismatches > 0) process.exit(1);
console.log('OK: embedded Umm al-Qura table matches Intl islamic-umalqura.');
