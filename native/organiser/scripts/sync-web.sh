#!/usr/bin/env bash
# Copies the live web app into ./www and injects the native-only shim into the COPY of index.html.
# The source folder (passport-app) is only ever read, never modified.
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${PASSPORT_SRC:-$HERE/../../passport-app}"
WWW="$HERE/www"

[ -f "$SRC/index.html" ] || { echo "Cannot find $SRC/index.html (set PASSPORT_SRC)"; exit 1; }
rm -rf "$WWW"; mkdir -p "$WWW"

# Web assets the app needs. Deliberately NOT copied: sw.js (no service worker in the native app) and netlify.toml.
cp "$SRC/manifest.webmanifest" "$WWW/"
cp "$SRC/index.html" "$SRC/privacy.html" "$SRC/visit.js" "$SRC/logo-passport.svg" "$WWW/"
cp "$SRC"/icon-*.png "$SRC"/app-*.png "$WWW/"
cp -R "$SRC/vendor" "$WWW/vendor"
cp "$HERE/native/native-shim.js" "$WWW/native-shim.js"

# Inject the shim as the first script in <head> of the copied pages only.
for f in index.html privacy.html; do
  python3 - "$WWW/$f" <<'PY'
import sys, re
p = sys.argv[1]
t = open(p, encoding="utf-8").read()
tag = '<script src="native-shim.js"></script>'
if tag not in t:
    t, n = re.subn(r'(<head[^>]*>)', r'\1\n' + tag, t, count=1, flags=re.I)
    if n != 1:
        sys.exit("no <head> in " + p)
open(p, "w", encoding="utf-8").write(t)
PY
done

# Safety check: the source must be untouched by us.
if grep -q native-shim "$SRC/index.html"; then echo "ERROR: shim found in source index.html"; exit 1; fi
echo "www ready: $(ls "$WWW" | wc -l) entries, shim injected into index.html and privacy.html"
