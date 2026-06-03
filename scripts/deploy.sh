#!/bin/bash
set -e

echo "Starting lightweight deployment process for Iyyam Clock..."

# Ensure we are in the correct directory
cd "$(dirname "$0")" || exit 1

echo "1/3 Pulling latest changes from Git..."
# Ensure we use HTTPS to avoid SSH permission issues on the server
git remote set-url origin https://github.com/cometofsky/yawm.git
git pull origin main

echo "2/3 Installing dependencies..."
npm ci

echo "3/3 Building static HTML export..."
rm -rf .next
npm run build

echo "Deployment completed successfully!"
echo "The static files are now located in the /out directory."
echo "Nginx will serve them automatically using zero additional RAM."
