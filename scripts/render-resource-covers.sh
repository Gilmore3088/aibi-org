#!/usr/bin/env bash
# Render page 1 of every free PDF in the resources manifest to a JPG cover
# for the /resources library cards, and write the list of rendered slugs to
# src/app/resources/covers.generated.json (cards without a cover fall back to
# an icon).
#
# Skips any PDF whose first page mentions SR 11-7, so a cover never shows the
# superseded guidance (see CLAUDE.md sourcing rules). Re-run whenever a PDF is
# regenerated. Requires poppler (pdftoppm, pdftotext) and ImageMagick.
#
#   bash scripts/render-resource-covers.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/downloads/covers/library"
TMP="$(mktemp -d)"
trap 'rm -rf -- "$TMP"' EXIT
mkdir -p "$OUT"

PAIRS="$(node -e '
const m = require(process.argv[1]);
for (const r of m.resources) {
  const f = r.download && r.download.filePath;
  if (r.status === "public" && f && f.endsWith(".pdf")) console.log(r.slug + " " + f);
}' "$ROOT/src/lib/resources/freeResources.manifest.json")"

rendered=()
while read -r slug file; do
  pdf="$ROOT/public/downloads/$file"
  [ -f "$pdf" ] || { echo "missing $file" >&2; continue; }
  if pdftotext -f 1 -l 1 "$pdf" - 2>/dev/null | grep -q "11-7"; then
    echo "skip $slug (page 1 cites SR 11-7)"
    rm -f -- "$OUT/$slug.jpg"
    continue
  fi
  pdftoppm -f 1 -l 1 -png -r 90 -singlefile "$pdf" "$TMP/$slug" 2>/dev/null
  convert "$TMP/$slug.png" -resize 480x -strip -quality 78 "$OUT/$slug.jpg"
  rendered+=("$slug")
done <<< "$PAIRS"

printf '%s\n' "${rendered[@]}" | node -e '
const slugs = require("fs").readFileSync(0, "utf8").trim().split("\n").filter(Boolean).sort();
process.stdout.write(JSON.stringify(slugs, null, 2) + "\n");
' > "$ROOT/src/app/resources/covers.generated.json"
echo "wrote ${#rendered[@]} covers to public/downloads/covers/library/"
