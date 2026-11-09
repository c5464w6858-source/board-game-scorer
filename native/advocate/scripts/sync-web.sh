#!/usr/bin/env bash
# Copy the web app from the website repo into ./www and add the native shim to the COPY of index.html.
# The website repo is never modified. Override the source with ADVOCATE_WEB=/path/to/echp.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="${ADVOCATE_WEB:-/home/user/echp}"
OUT="$HERE/www"

[ -f "$SRC/index.html" ] || { echo "sync-web: $SRC/index.html not found (set ADVOCATE_WEB)"; exit 1; }
rm -rf "$OUT"
mkdir -p "$OUT"

# Only public web assets. Left out: tests, admin pages, server code, git data, package files, config, readme,
# and sw.js (the service worker is not used in the app; the shim skips registration).
tar -C "$SRC" --anchored \
  --exclude='./.git' --exclude='./.netlify' --exclude='./.gitignore' \
  --exclude='./test' --exclude='./admin' --exclude='./netlify' --exclude='./netlify.toml' \
  --exclude='./node_modules' --exclude='./package.json' --exclude='./package-lock.json' \
  --exclude='./README.md' --exclude='./sw.js' \
  -cf - . | tar -C "$OUT" -xf -

cp "$HERE/shim/native-shim.js" "$OUT/native-shim.js"
node "$HERE/scripts/inject-shim.mjs" "$OUT/index.html"
echo "sync-web: copied $(find "$OUT" -type f | wc -l) files, $(du -sh "$OUT" | cut -f1) into $OUT"
