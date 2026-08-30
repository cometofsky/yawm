---
name: modify_legacy_nextjs
description: Enforces ES5 Babel transpile rules and Tailwind v4 config standards for this static export site.
---

# Modify Legacy Next.js Skill

When modifying the Next.js application in `iyyam`, strictly follow these constraints:

1. **Plan First**: You MUST propose the changes in an Artifact first. Wait for user approval before touching files.
2. **ES5 Transpile Rules**: This app MUST run on iOS 10.3.4 Safari. The `scripts/transpile-legacy.js` postbuild step <!-- claim: cmd=`grep '"postbuild":' package.json` expect=`"postbuild": "node scripts/transpile-legacy.js",` --> will downlevel `out/_next/static` to ES5 using Babel. Do NOT introduce runtime JS features or dependencies that Babel preset-env cannot downlevel.
3. **Static Export Rules**: This is a static export app (`output: 'export'` <!-- claim: cmd=`grep "output:" next.config.ts` expect=`output: 'export',` -->). No server components, no API routes, no dynamic server features, and no `next/image` optimization.
4. **Untranspiled Dependencies**: If you add a dependency that ships untranspiled (like `lucide-react` or `bangla-calendar`), you MUST add it to `transpilePackages` in `next.config.ts` <!-- claim: cmd=`grep "transpilePackages" next.config.ts` expect=`transpilePackages: ['lucide-react', 'bangla-calendar'],` -->.
5. **Tailwind v4**: There is NO `tailwind.config` <!-- claim: cmd=`git ls-files '*tailwind.config*' | wc -l` expect=`0` -->. Do not invent a JS/TS Tailwind config. Configuration is CSS-first via `@tailwindcss/postcss`.
6. **Verification**: After making changes, run `.agents/tools/run_strict_checks.sh` to ensure the ES5 transpile step completes successfully.

<!-- repowiki: audited-at ab11e4ea57c4ac25d2bb1a3cbd3b5bde7f6f450b on 2026-08-30 -->
