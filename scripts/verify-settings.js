#!/usr/bin/env node
// Offline regression check: old/invalid stored settings must not break reading preferences.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../app/lib/useSettings.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exportsObject = {};
new Function('exports', 'require', compiled)(exportsObject, require);
const { normalizeSettings, DEFAULT_SETTINGS } = exportsObject;
for (const input of [null, false, 'bad', 9, [], { textScale: 0, colorTheme: 'unknown', showPrayerTimes: 'false' }]) {
  assert.deepEqual(normalizeSettings(input), DEFAULT_SETTINGS);
}
const legacy = normalizeSettings({ showPrayerTimes: false, showWorldClocks: false, prayerDisplayMode: 'current_next' });
assert.equal(legacy.showPrayerTimes, false);
assert.equal(legacy.showWorldClocks, false);
assert.equal(legacy.colorTheme, 'original');
assert.equal(legacy.textScale, 100);
for (const colorTheme of ['original', 'slate', 'forest', 'warm']) {
  for (const textScale of [100, 125, 150, 200]) {
    const stored = { ...DEFAULT_SETTINGS, colorTheme, textScale, highContrast: true, reducedMotion: true, largerControls: true, luminance: 'dim' };
    assert.deepEqual(normalizeSettings(JSON.parse(JSON.stringify(stored))), stored);
  }
}
assert.equal(Object.hasOwn(normalizeSettings(JSON.parse('{"__proto__":{"polluted":true},"unknown":1}')), 'unknown'), false);
assert.equal(normalizeSettings({ colorTheme: 'slate', textScale: 200, highContrast: false }).highContrast, false);
assert.notEqual(normalizeSettings({}), DEFAULT_SETTINGS);
console.log('PASS: settings migration, invalid-value fallback, all themes/scales, explicit false and unknown-key rejection');
