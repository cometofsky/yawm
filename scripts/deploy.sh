#!/bin/bash
set -e

echo "Starting lightweight deployment process for Iyyam Clock..."

# Ensure we are in the correct directory (project root)
cd "$(dirname "$0")/.." || exit 1

echo "1/3 Pulling latest changes from Git..."
# The host's configured remote is respected — this script never rewrites it.
# If this box needs HTTPS instead of SSH, set it once, by hand:
#   git remote set-url origin https://github.com/cometofsky/yawm.git
echo "    remote: $(git remote get-url origin)"
git pull --ff-only origin main

echo "2/3 Installing dependencies..."

# If npm is not in PATH (e.g. running under sudo), attempt to load nvm or common node paths
if ! command -v npm >/dev/null 2>&1; then
  if [ -s "$HOME/.nvm/nvm.sh" ]; then
    export NVM_DIR="$HOME/.nvm"
    # shellcheck source=/dev/null
    . "$NVM_DIR/nvm.sh"
  elif [ -n "$SUDO_USER" ] && [ -s "/home/$SUDO_USER/.nvm/nvm.sh" ]; then
    export NVM_DIR="/home/$SUDO_USER/.nvm"
    # shellcheck source=/dev/null
    . "$NVM_DIR/nvm.sh"
  fi
fi

if ! command -v npm >/dev/null 2>&1; then
  export PATH="/usr/local/bin:/usr/bin:$PATH"
fi

npm ci

echo "3/3 Building static HTML export..."
rm -rf .next
npm run build

OUT_DIR="$(pwd)/out"
echo "Deployment completed successfully!"
echo "Nginx serves the static export straight off disk, using zero additional RAM."
echo "The vhost's \`root\` must be exactly this absolute path (nginx does NOT expand ~):"
echo "    root $OUT_DIR;"
