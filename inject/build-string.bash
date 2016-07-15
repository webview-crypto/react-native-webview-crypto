#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset

printf "export default \`" > dist/string.ts
sed  "s/\`/\\\\\`/g" dist/index.js >> dist/string.ts
echo \` >> dist/string.ts
