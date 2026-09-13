#!/usr/bin/env bash
#
# update.sh — pull the latest code from OneDrive into your working copy,
# and tell you exactly what changed.
#
# Run this from ~/dev/smartervote:
#     ./update.sh
#
# Why this exists: the working copy on your Mac is a COPY of the OneDrive
# folder. When Claude changes a file, your copy doesn't change until you
# sync it — and the symptom of forgetting is a confusing "page not found"
# rather than anything that says "you're out of date". This script makes
# the sync one command and prints a changelog, so silent staleness stops
# being possible.
#
# Your .env.local and node_modules are never touched.

set -euo pipefail

SRC="$HOME/Library/CloudStorage/OneDrive-Personal/SmartVote.ca/smartervote"
DEST="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

bold=$'\033[1m'; green=$'\033[32m'; yellow=$'\033[33m'; red=$'\033[31m'; off=$'\033[0m'

if [ ! -d "$SRC" ]; then
  echo "${red}Can't find the OneDrive folder at:${off}"
  echo "  $SRC"
  echo
  echo "If your OneDrive folder is named differently, edit the SRC line at the"
  echo "top of this script to match."
  exit 1
fi

if [ ! -f "$DEST/package.json" ]; then
  echo "${red}This doesn't look like the project folder.${off}"
  echo "Run it from ~/dev/smartervote:  cd ~/dev/smartervote && ./update.sh"
  exit 1
fi

echo "${bold}Checking for changes...${off}"
echo

# -c compares CHECKSUMS, not size+timestamp. Slower, but this project is
# under 200 KB and correctness matters more: without it, an edit that
# happens to preserve a file's size can be silently skipped — which is
# the exact failure this script exists to eliminate.
#
# Dry run first so we can show a changelog before touching anything.
CHANGES=$(rsync -rinc --delete \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude '.next/' \
  --exclude '.env.local' \
  --exclude '.env' \
  --exclude '.DS_Store' \
  --exclude 'update.sh' \
  "$SRC/" "$DEST/" | grep -v '^\.d\.\.t' || true)

if [ -z "$CHANGES" ]; then
  echo "${green}Already up to date.${off} Nothing changed."
  echo
  echo "If a page still isn't working, the problem isn't a stale copy —"
  echo "check http://localhost:3000/status and tell Claude what it says."
  exit 0
fi

echo "$CHANGES" | while read -r flags file; do
  case "$flags" in
    \>f+++++++*) echo "  ${green}NEW${off}      $file" ;;
    \>f*)        echo "  ${yellow}UPDATED${off}  $file" ;;
    \*deleting*) echo "  ${red}REMOVED${off}  $file" ;;
    cd+++++++*)  echo "  ${green}NEW DIR${off}  $file" ;;
    *)           echo "  changed  $file" ;;
  esac
done

echo
rsync -ric --delete \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude '.next/' \
  --exclude '.env.local' \
  --exclude '.env' \
  --exclude '.DS_Store' \
  --exclude 'update.sh' \
  "$SRC/" "$DEST/" >/dev/null

echo "${green}${bold}Updated.${off}"
echo

# package.json changing means new dependencies may be needed.
if echo "$CHANGES" | grep -q 'package.json'; then
  echo "${yellow}package.json changed — run 'npm install' before starting.${off}"
  echo
fi

# New SQL means there's something to run in Supabase.
NEW_SQL=$(echo "$CHANGES" | grep 'supabase/.*\.sql' || true)
if [ -n "$NEW_SQL" ]; then
  echo "${yellow}Database files changed:${off}"
  echo "$NEW_SQL" | awk '{print "  " $2}'
  echo "  Run these in the Supabase SQL editor if you haven't already."
  echo
fi

echo "Now restart the server:  ${bold}npm run dev${off}"
echo "(Stop the old one first with Ctrl+C.)"
