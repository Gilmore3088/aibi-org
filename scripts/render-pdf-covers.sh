#!/usr/bin/env bash
# Render page 1 of selected free PDFs to JPG covers for the homepage
# free-tools section ("Tools your team can use today") (src/components/home/HomeSections.tsx), plus
# three inner pages of the In-Depth playbook for /assessment/in-depth.
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

# Page 2 of the sample readiness report (score, tier, top gap — labelled
# illustrative data) for the Snapshot plan on /pricing.
pdftoppm -f 2 -l 2 -png -r 110 -singlefile "$ROOT/public/downloads/sample-readiness-report.pdf" "$TMP/srr-p2" 2>/dev/null
convert "$TMP/srr-p2.png" -resize 640x -strip -quality 84 "$OUT/sample-readiness-report-p2.jpg"
echo "wrote public/downloads/covers/sample-readiness-report-p2.jpg"

# Inner pages of the In-Depth playbook shown on /assessment/in-depth.
# Pages 2, 5 and 9 only: the operating principle, path picker, and pilot path.
for page in 2 5 9; do
  pdftoppm -f "$page" -l "$page" -png -r 110 -singlefile "$ROOT/public/downloads/in-depth-playbook.pdf" "$TMP/in-depth-p$page" 2>/dev/null
  convert "$TMP/in-depth-p$page.png" -resize 700x -strip -quality 84 "$OUT/in-depth-playbook-p$page.jpg"
  echo "wrote public/downloads/covers/in-depth-playbook-p$page.jpg"
done
