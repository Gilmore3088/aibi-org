#!/usr/bin/env bash
# One command to add narration and render the voiced explainer.
# Run from anywhere; needs a TTS key in your environment:
#   export ELEVENLABS_API_KEY=sk_...    # recommended
#   # or: export OPENAI_API_KEY=sk-...
#
#   bash video-studio/scripts/make-voiced-video.sh
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -z "${ELEVENLABS_API_KEY:-}" ] && [ -z "${OPENAI_API_KEY:-}" ]; then
  echo "✗ Set ELEVENLABS_API_KEY (recommended) or OPENAI_API_KEY first." >&2
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "==> installing deps"
  npm install
fi

echo "==> generating narration (TTS)"
npm run voiceover

echo "==> rendering voiced video"
npm run render-explainer

echo ""
echo "✓ Done → video-studio/out/whats-ai-ready.mp4"
