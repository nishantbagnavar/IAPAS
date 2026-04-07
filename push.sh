#!/bin/bash
# ─────────────────────────────────────────────
#  IAPAS — Easy GitHub Update Script (Mac/Linux)
#  Run with:  ./push.sh
# ─────────────────────────────────────────────

COMMIT_MSG="Update $(date '+%d-%m-%Y %H:%M')"

echo ""
echo " IAPAS GitHub Updater"
echo " ─────────────────────────────────"
echo " Commit message: $COMMIT_MSG"
echo " ─────────────────────────────────"
echo ""

echo "[1/3] Staging all changes..."
git add .

echo "[2/3] Committing..."
git commit -m "$COMMIT_MSG"

echo "[3/3] Pushing to GitHub..."
git push origin main

echo ""
echo " ─────────────────────────────────"
echo " Done! Your changes are on GitHub."
echo " ─────────────────────────────────"
echo ""
