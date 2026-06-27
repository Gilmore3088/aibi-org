#!/usr/bin/env bash
# Generate narration and render a voiced video.
# Usage (from anywhere):
#   bash video-studio/scripts/make-voiced-video.sh [script]
# where [script] is one of: blank-cursor (default) | whats-ai-ready | safe-ai-use
#
# Needs a TTS key:  export ELEVENLABS_API_KEY=sk_...   (or OPENAI_API_KEY)
set -euo pipefail
cd "$(dirname "$0")/.."

SCRIPT="${1:-blank-cursor}"
case "$SCRIPT" in
  blank-cursor)   COMP=BlankCursor;       OUT=blank-cursor.mp4 ;;
  whats-ai-ready) COMP=AiReadyExplainer;  OUT=whats-ai-ready.mp4 ;;
  safe-ai-use)    COMP=ScriptedExplainer; OUT=safe-ai-use.mp4 ;;
  *) echo "✗ unknown script '$SCRIPT' (blank-cursor | whats-ai-ready | safe-ai-use)" >&2; exit 1 ;;
esac

if [ -z "${ELEVENLABS_API_KEY:-}" ] && [ -z "${OPENAI_API_KEY:-}" ]; then
  echo "✗ Set ELEVENLABS_API_KEY (recommended) or OPENAI_API_KEY first." >&2
  exit 1
fi

[ -d node_modules ] || { echo "==> installing deps"; npm install; }

echo "==> generating narration for '$SCRIPT'"
SCRIPT="$SCRIPT" npm run voiceover

echo "==> rendering '$COMP'"
npx remotion render src/index.ts "$COMP" "out/$OUT"

echo ""
echo "✓ Done → video-studio/out/$OUT"
