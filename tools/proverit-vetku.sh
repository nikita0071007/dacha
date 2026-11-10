#!/bin/bash
# Использование: ./proverit-vetku.sh feature/marina-wardrobe-v1 [число-уровней]
set -e
BR="${1:-feature/marina-wardrobe-v1}"; N="${2:-50}"
D="$(mktemp -d)"; cd "$(dirname "$0")"; HERE="$PWD"
gh api "repos/nikita0071007/dacha/contents/index.html?ref=$BR" -H "Accept: application/vnd.github.raw" > "$D/index.html"
echo "Ветка $BR, коммит: $(gh api repos/nikita0071007/dacha/commits/$BR --jq '.sha[0:7]+" "+.commit.message' | head -1)"
node "$HERE/verify.js" "$D/index.html" "$N" "$HERE/otchet-$(echo $BR | tr / -)"
