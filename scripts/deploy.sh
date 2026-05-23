#!/bin/bash
set -e

echo "Starting deployment process for Iyyam Clock..."

# Ensure we are in the correct directory (the script is in the root, the app is in world-clock)
cd "$(dirname "$0")/world-clock" || exit 1

echo "1/4 Pulling latest changes from Git..."
# If on VPS, this assumes git tracking is set up. We pull main branch.
# git checkout main
git pull origin main

echo "2/4 Building new Docker image and starting container..."
# --build ensures it rebuilds the image. -d runs it in the background.
docker-compose up -d --build

echo "3/4 Cleaning up dangling Docker images to save disk space..."
docker image prune -f

echo "4/4 Deployment completed successfully!"
echo "The app is now running on http://localhost:3055"
