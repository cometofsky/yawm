# Running system — full entries

Moved verbatim from `AGENTS.md` → Running system on 2026-10-10 to keep the always-loaded file small. `AGENTS.md` keeps one rule line per entry, in the same order; this file holds the mechanics, history, owning files and claim anchors. Read the matching entry before acting in that area.

## Running system
Deploy is **manual and the user's call** — a human runs `scripts/deploy.sh` on the host. There is no
CI. Pushing to `main` deploys nothing; never deploy unasked.
- **`main` is the deploy source.** `deploy.sh` does `git pull --ff-only origin main`, then `npm ci`
  and `npm run build`. It uses whatever `origin` the host is configured with — it prints the remote
  and never rewrites it (the only `git remote set-url` left is a comment naming the manual command
  for a box that needs HTTPS). Nothing is reloaded or restarted: nginx serves `out/` straight off
  disk, so the build *is* the deploy.
  <!-- claim: cmd=`grep -c 'git pull --ff-only origin main' scripts/deploy.sh` expect=`1` -->
  <!-- claim: cmd=`grep -c '^git remote set-url' scripts/deploy.sh` expect=`0` -->
- **Commits go straight to `main`** — no other branch has ever existed here and there are no merge
  commits. Don't open a branch for a one-repo change; commit on `main` and push only when asked.
- **`iyyam.rafi.ninja.conf` is a TEMPLATE, not the live file** — it says so at the top, and its
  `root` is the placeholder `/ABSOLUTE/PATH/TO/yawm/web/out`. **nginx does not expand `~`**, and
  `deploy.sh` builds in place, so the real docroot is whichever checkout the host deploys from:
  the last thing `deploy.sh` prints is the exact `root ...;` line to paste. Do not copy this file
  onto the host unedited, and do not read the checkout path off it.
  <!-- claim: cmd=`grep -c 'root /ABSOLUTE/PATH/TO/yawm/web/out' iyyam.rafi.ninja.conf` expect=`1` -->
  <!-- claim: cmd=`grep -c 'root ~' iyyam.rafi.ninja.conf` expect=`0` -->
- **Static assets are served `immutable, max-age=15552000`** (6 months). Safe for `_next/static`,
  whose filenames are content-hashed — but any top-level asset you add under a stable name is
  pinned in every visitor's browser for half a year. Version the filename instead.
  <!-- claim: cmd=`grep -c 'immutable' iyyam.rafi.ninja.conf` expect=`1` -->
- Server names `iyyam.rafi.ninja` / `yawm.rafi.ninja`; the route to load after a deploy is
  `https://iyyam.rafi.ninja/`.
- **Not measured:** the host, the runtime uid that serves `out/`, and who else is on that box. Ask
  or measure before any host-level action — don't infer them from this file.
