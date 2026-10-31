#!/bin/sh
# The server functions that are live on includeme.uk exist here only in built form
# (deployed-functions/*.zip, copied from the last working deploy). The readable
# sources that used to sit in netlify/functions were an OLDER copy: deploying them
# removed CORS handling and one function. So every build unpacks the built
# versions into netlify/functions instead.
set -e
cd "$(dirname "$0")/.."
rm -rf netlify/functions && mkdir -p netlify/functions
for z in deployed-functions/*.zip; do
  n=$(basename "$z" .zip)
  unzip -o -q "$z" "netlify/functions/$n.js" -d .
done
echo "prepared $(ls netlify/functions | wc -l) functions"
