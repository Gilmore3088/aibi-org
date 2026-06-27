#!/usr/bin/env bash
# Capture the real course UI from the in-repo LMS prototype
# (public/lms-prototype) into video-studio/public/screens/ for use as
# "product-as-hero" footage. The prototype is a React+Babel app that loads its
# deps from a CDN; this vendors them locally, serves over HTTP, and screenshots
# each screen with headless Chrome.
#
# Requires: node/npm, and a Chrome/Chromium. Set CHROME to your binary.
#   bash video-studio/scripts/capture-screens.sh
set -euo pipefail

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
PROTO="$REPO/public/lms-prototype"
DEST="$REPO/video-studio/public/screens"
CHROME="${CHROME:-$(command -v google-chrome || command -v chromium || echo /opt/pw-browsers/chromium-1194/chrome-linux/chrome)}"
PORT="${PORT:-8099}"
mkdir -p "$DEST"

# 1) vendor React / ReactDOM / Babel (npm registry, no CDN)
echo "==> vendoring react/babel"
TMP="$(mktemp -d)"
( cd "$TMP" && npm install react@18.3.1 react-dom@18.3.1 @babel/standalone@7.29.0 --no-save --silent )
mkdir -p "$PROTO/vendor"
cp "$TMP/node_modules/react/umd/react.development.js" "$PROTO/vendor/"
cp "$TMP/node_modules/react-dom/umd/react-dom.development.js" "$PROTO/vendor/"
cp "$TMP/node_modules/@babel/standalone/babel.min.js" "$PROTO/vendor/"
rm -rf "$TMP"

# 2) capture harness: local vendor scripts + hash-driven single-screen mount
python3 - "$PROTO" <<'PY'
import sys
p = sys.argv[1]
src = open(f"{p}/index.html").read()
def repl(l):
    if 'unpkg.com/react-dom' in l: return '<script src="vendor/react-dom.development.js"></script>'
    if 'unpkg.com/react@'    in l: return '<script src="vendor/react.development.js"></script>'
    if '@babel/standalone'   in l: return '<script src="vendor/babel.min.js"></script>'
    return l
out = "\n".join(repl(l) for l in src.split("\n")).replace('lms/app.jsx','lms/cap-mount.jsx')
open(f"{p}/capture.html","w").write(out)
PY
cat > "$PROTO/lms/cap-mount.jsx" <<'JSX'
/* global React, ReactDOM */
const h = (location.hash || '#overview').replace('#','');
let route = { name: 'overview' };
if (h.startsWith('module')) route = { name: 'module', num: parseInt(h.split('-')[1] || '7', 10) };
else if (h === 'toolbox') route = { name: 'toolbox' };
else if (h === 'complete') route = { name: 'complete' };
document.body.dataset.density = 'roomy';
document.body.dataset.progress = 'quiet';
document.body.dataset.layout = 'split';
const noop = () => {};
function Cap(){
  return (
    <div className="app">
      <Sidebar route={route} navigate={noop} density="roomy" />
      <main style={{ minWidth:0 }}>
        {route.name==='overview' && <OverviewScreen navigate={noop} progress="quiet" />}
        {route.name==='module'   && <ModuleScreen num={route.num} navigate={noop} layout="split" setLayout={noop} progress="quiet" defaultLayout="split" hasOverride={false} clearOverride={noop} />}
        {route.name==='toolbox'  && <ToolboxScreen navigate={noop} />}
        {route.name==='complete' && <CompleteScreen navigate={noop} />}
      </main>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<Cap />);
JSX

# 3) serve + screenshot each screen
echo "==> capturing screens"
( cd "$PROTO" && python3 -m http.server "$PORT" >/dev/null 2>&1 ) &
SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
for i in $(seq 1 60); do curl -s -o /dev/null "http://localhost:$PORT/capture.html" && break; done
for s in "overview:course-overview" "module-7:course-module" "toolbox:course-toolbox" "complete:course-complete"; do
  hash="${s%%:*}"; name="${s##*:}"
  "$CHROME" --headless=new --no-sandbox --hide-scrollbars --force-device-scale-factor=2 \
    --virtual-time-budget=14000 --screenshot="$DEST/$name.png" --window-size=1440,950 \
    "http://localhost:$PORT/capture.html#$hash" >/dev/null 2>&1
  echo "   $name.png"
done
echo "✓ screens in video-studio/public/screens/"
