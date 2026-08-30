#!/bin/bash
# .agents/tools/run_strict_checks.sh
# Runs Strict Verification Gate for iyyam (world-clock)

echo "Running Strict Verification Gate for iyyam..."

echo "1. Typechecking (tsc)..."
npm run typecheck || { echo "Typecheck failed."; exit 1; }

echo "2. Domain Testing (verify-umalqura)..."
npm test || { echo "Umm al-Qura verification failed."; exit 1; }

echo "3. Production Build & ES5 Transpile..."
npm run build || { echo "Build or postbuild transpile failed."; exit 1; }

echo "Verification Passed. Safe to commit."
