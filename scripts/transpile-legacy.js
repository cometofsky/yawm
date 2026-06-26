#!/usr/bin/env node
// Downlevel Next's static JS output for legacy browsers (Safari 10 / old iPad 4).
//
// Drop-in replacement for the old `babel out/_next/static -d out/_next/static --presets
// @babel/preset-env` postbuild. @babel/cli pulled deprecated glob@7 + inflight; this walks
// the build output with stdlib fs and transpiles each file with @babel/core directly.
// Same preset-env + browserslist behaviour (browserslist resolves from cwd = project root).

const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const target = process.argv[2] || path.join('out', '_next', 'static');
const EXTENSIONS = new Set(['.js', '.mjs', '.cjs']);

function collectFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectFiles(full, out);
    else if (EXTENSIONS.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

if (!fs.existsSync(target)) {
  console.error(`transpile-legacy: target not found: ${target}`);
  process.exit(1);
}

const files = collectFiles(target);
let count = 0;
for (const file of files) {
  const result = babel.transformFileSync(file, { presets: ['@babel/preset-env'] });
  if (result && result.code != null) {
    fs.writeFileSync(file, result.code);
    count += 1;
  }
}
console.log(`Successfully compiled ${count} files with @babel/core (${target}).`);

// --- Safari-10 boot bootstrap -------------------------------------------------
// Next's chunks reference globalThis / Promise.allSettled / Array.prototype.flat at the
// top level. babel above only downlevels SYNTAX, not these runtime features, and React/Next
// can't guarantee head-script ordering. So self-host core-js and inject a globalThis shim +
// core-js as the FIRST children of <head> (parser-blocking, before any chunk) in every HTML
// page. Self-hosted (not a CDN) so an offline iPad 4 still boots.
const outRoot = 'out';
const coreJsSrc = path.join('node_modules', 'core-js-bundle', 'minified.js');
const coreJsDest = path.join(outRoot, '_next', 'static', 'core-js.js');
if (fs.existsSync(coreJsSrc)) {
  fs.copyFileSync(coreJsSrc, coreJsDest);
} else {
  console.error('transpile-legacy: core-js-bundle not found — Safari 10 will lack polyfills.');
}
const BOOT =
  '<script>if(typeof window!=="undefined"&&typeof window.globalThis==="undefined"){window.globalThis=window;}</script>'
  + '<script src="/_next/static/core-js.js"></script>';

let htmlPatched = 0;
function patchHtml(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) patchHtml(full);
    else if (full.endsWith('.html')) {
      let html = fs.readFileSync(full, 'utf8');
      if (html.indexOf('/_next/static/core-js.js') !== -1) continue; // idempotent
      const headMatch = html.match(/<head[^>]*>/i);
      if (headMatch) {
        html = html.replace(headMatch[0], headMatch[0] + BOOT);
        fs.writeFileSync(full, html);
        htmlPatched += 1;
      }
    }
  }
}
if (fs.existsSync(outRoot)) patchHtml(outRoot);
console.log(`Injected Safari-10 boot scripts into ${htmlPatched} HTML file(s).`);
