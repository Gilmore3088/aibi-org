#!/usr/bin/env bash
# Render page 1 of selected free PDFs to JPG covers for the homepage
# "Take the paperwork" section (src/components/home/ResourceCovers.tsx).
#
# Re-run whenever one of these PDFs is regenerated so the cover image
# stays in sync with the real download. Requires poppler (pdftoppm) and
# ImageMagick (convert).
#
#   bash scripts/render-pdf-covers.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/downloads/covers"
TMP="$(mktemp -d)"
trap 'rm -rf -- "$TMP"' EXIT
mkdir -p "$OUT"

COVERS=(
  banker-prompt-formula-card
  artifact-data-handling-reference-card
  compliance-playbook
  prompt-output-review-checklist
  prompting-foundation-guide
  in-depth-playbook
)

for name in "${COVERS[@]}"; do
  pdftoppm -f 1 -l 1 -png -r 110 -singlefile "$ROOT/public/downloads/$name.pdf" "$TMP/$name" 2>/dev/null
  convert "$TMP/$name.png" -resize 640x -strip -quality 84 "$OUT/$name.jpg"
  echo "wrote public/downloads/covers/$name.jpg"
done
