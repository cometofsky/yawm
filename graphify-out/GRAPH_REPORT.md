# Graph Report - iyyam  (2026-08-30)

## Corpus Check
- 27 files · ~12,064 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 186 nodes · 200 edges · 23 communities (14 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ab11e4ea`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `scripts` - 7 edges
3. `World Clock & Calendar` - 7 edges
4. `gregorianToHijri()` - 5 edges
5. `resolveHijri()` - 5 edges
6. `main()` - 5 edges
7. `Agent Directives` - 5 edges
8. `sunsetUtcMs()` - 4 edges
9. `Lessons Learned` - 4 edges
10. `City` - 3 edges

## Surprising Connections (you probably didn't know these)
- `resolveHijri()` --calls--> `regionOffsetFor()`  [EXTRACTED]
  app/lib/hijri.ts → app/lib/locations.ts
- `resolveHijri()` --calls--> `sunsetUtcMs()`  [EXTRACTED]
  app/lib/hijri.ts → app/lib/sunset.ts

## Communities (23 total, 9 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (17): banglaCalendar, bnDigits, CalendarType, MonthlyCalendarProps, WEEKDAYS, after, before, dhaka (+9 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (19): browserslist, dependencies, bangla-calendar, @csstools/postcss-cascade-layers, lucide-react, next, postcss-preset-env, react (+11 more)

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.17
Nodes (13): banglaCalendar, CalendarDisplay(), locationLabel(), NONE_LOCATION, LocationPickerProps, angularDist(), CITIES, City (+5 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (15): cur, d, end, EPOCH_JDN, exp, fs, got, gregorianToHijri() (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.21
Nodes (13): COL, download(), emit(), { execFileSync }, fs, main(), os, OUT (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.18
Nodes (8): babel, coreJsDest, coreJsSrc, EXTENSIONS, files, fs, path, result

### Community 7 - "Community 7"
Cohesion: 0.20
Nodes (10): devDependencies, @babel/core, @babel/preset-env, core-js-bundle, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.20
Nodes (9): Build, code:bash (npm install), code:bash (npm run build), Compatibility, Deploy on Vercel, Features, Getting Started, Manual Hosting (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.27
Nodes (9): anchor, eid, formatHijri(), gregorianToHijri(), gregorianToJDN(), HIJRI_MONTHS, HijriDate, MAPS (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (5): Agent Directives, AI layer (planned), Do not guess — verify before use, Verification — run before declaring any change done, Where truth lives

### Community 12 - "Community 12"
Cohesion: 0.40
Nodes (4): 2026-06-27 — Hijri date "always wrong, even when location granted", 2026-06-27 — Location-aware Hijri (region offset + Maghrib rollover + city picker), 2026-06-27 — npm deprecation warnings (inflight, glob@7), Lessons Learned

## Knowledge Gaps
- **112 isolated node(s):** `config`, `name`, `version`, `private`, `dev` (+107 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Community 7` to `Community 1`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `config`, `name`, `version` to the rest of the system?**
  _112 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.12380952380952381 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.1323529411764706 - nodes in this community are weakly interconnected._