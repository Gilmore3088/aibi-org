"""Build a one-screen canvas of every Foundation Course lesson.

Visits all 24 lessons + the gate, screenshots each at a fixed viewport,
then composes a single grid HTML and screenshots that as one mega-image.
"""
import os
from playwright.sync_api import sync_playwright

LESSONS = [
    ("m0", "Orientation", ["m0.1", "m0.2"]),
    ("m1", "What generative AI is", ["m1.1", "m1.2", "m1.3", "m1.4"]),
    ("m2", "Access & workflow", ["m2.1", "m2.2", "m2.3", "m2.4"]),
    ("m3", "Talking to the machine — prompting", ["m3.1", "m3.2", "m3.3", "m3.4", "m3.5"]),
    ("m4", "Automating the repetitive — skills (paid)", ["m4.1", "m4.2", "m4.3", "m4.4"]),
    ("m5", "From idea to prototype (paid)", ["m5.1", "m5.2", "m5.3", "m5.4", "m5.5"]),
]
GATE_URL = "http://localhost:3000/foundation/gate"

OUT_DIR = "/tmp/aibi_canvas"
os.makedirs(OUT_DIR, exist_ok=True)

# Per-lesson viewport. Wide enough to show the desktop layout but short
# enough to keep the canvas mosaic manageable.
LESSON_W, LESSON_H = 1280, 900

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": LESSON_W, "height": LESSON_H})
    page = context.new_page()

    captured = []

    def shoot(url, label, badge):
        out = f"{OUT_DIR}/{label}.png"
        try:
            page.goto(url, wait_until="domcontentloaded", timeout=30000)
            page.wait_for_load_state("networkidle", timeout=15000)
            page.wait_for_timeout(800)
            page.screenshot(path=out, full_page=False, clip={"x": 0, "y": 0, "width": LESSON_W, "height": LESSON_H})
            captured.append((label, badge, out))
            print(f"[{label}] {url}")
        except Exception as e:
            print(f"[{label}] FAIL: {e}")

    for mid, mtitle, lesson_ids in LESSONS:
        for lid in lesson_ids:
            badge = lid
            shoot(f"http://localhost:3000/foundation/{mid}/{lid}", lid, badge)

    shoot(GATE_URL, "gate", "/foundation/gate")

    browser.close()

# --- Compose the canvas HTML ---
# 3-column grid grouped by module, each tile a small thumbnail with caption.

THUMB_W = 480
THUMB_H = int(LESSON_H * (THUMB_W / LESSON_W))
COLS = 4
PADDING = 24
HEADER_H = 80
MODULE_HEADER_H = 70

# Compute total grid height
total_modules = len(LESSONS) + 1  # +1 for gate
rows_per_module = []
for mid, mtitle, lesson_ids in LESSONS:
    n = len(lesson_ids)
    rows = (n + COLS - 1) // COLS
    rows_per_module.append(rows)
rows_per_module.append(1)  # gate
total_rows = sum(rows_per_module)
canvas_h = HEADER_H + (total_modules * MODULE_HEADER_H) + (total_rows * (THUMB_H + 80)) + (total_modules * 20) + PADDING * 2

with open(f"{OUT_DIR}/canvas.html", "w") as f:
    f.write(f"""<!doctype html>
<html><head><meta charset="utf-8"><title>Foundation Course canvas</title>
<style>
  :root {{
    --ink: #0E1B2D;
    --ink-2: #1F2A3F;
    --bg: #ECE9DF;
    --paper: #F4F1E7;
    --parch: #E4E0D2;
    --accent: #7C5814;
    --weak: #8E3B2A;
    --muted: #4F5C6E;
    --rule: #D5D1C2;
    --rule-strong: #A8AEBE;
  }}
  body {{
    margin: 0; padding: {PADDING}px; background: var(--bg); color: var(--ink);
    font-family: 'Geist', system-ui, sans-serif;
  }}
  h1 {{
    font-family: 'Newsreader', Georgia, serif;
    font-size: 36px; margin: 0 0 6px 0; font-weight: 600;
  }}
  .sub {{
    font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
    letter-spacing: 0.18em; font-size: 11px; color: var(--muted); margin-bottom: 28px;
  }}
  .module {{ margin-top: 32px; }}
  .module-head {{
    display: flex; align-items: baseline; gap: 12px;
    padding: 14px 4px 10px; border-bottom: 1px solid var(--rule);
    margin-bottom: 18px;
  }}
  .module-head .id {{
    font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
    letter-spacing: 0.2em; font-size: 11px; color: var(--accent); font-weight: 600;
  }}
  .module-head .title {{
    font-family: 'Newsreader', serif; font-size: 22px; color: var(--ink);
  }}
  .module-head .count {{
    margin-left: auto; font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
    letter-spacing: 0.16em; font-size: 10px; color: var(--muted);
  }}
  .grid {{
    display: grid; grid-template-columns: repeat({COLS}, 1fr);
    gap: 20px;
  }}
  .tile {{
    background: var(--paper); border: 1px solid var(--rule); border-radius: 4px;
    overflow: hidden; display: flex; flex-direction: column;
    box-shadow: 0 1px 0 rgba(14,27,45,0.04);
  }}
  .tile .img-wrap {{
    width: 100%; aspect-ratio: {LESSON_W} / {LESSON_H}; overflow: hidden;
    background: #fff; border-bottom: 1px solid var(--rule);
  }}
  .tile img {{ width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }}
  .tile .meta {{
    padding: 10px 14px; display: flex; align-items: baseline; justify-content: space-between;
  }}
  .tile .badge {{
    font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
    letter-spacing: 0.16em; font-size: 10px; color: var(--accent); font-weight: 600;
  }}
  .tile .label {{
    font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
    letter-spacing: 0.14em; font-size: 9px; color: var(--muted);
  }}
  .gate {{ border-color: var(--accent); }}
  .gate .badge {{ color: var(--accent); }}
</style></head>
<body>
  <h1>Foundation Course — full canvas</h1>
  <div class="sub">Every lesson · v1 + v2 lesson shells · captured at 1280 × 900</div>
""")
    # Index captured by label
    cap = {label: (label, badge, out) for (label, badge, out) in captured}

    for (mid, mtitle, lesson_ids) in LESSONS:
        f.write(f'<section class="module">\n')
        f.write(f'  <header class="module-head"><span class="id">{mid.upper()}</span><span class="title">{mtitle}</span><span class="count">{len(lesson_ids)} lessons</span></header>\n')
        f.write(f'  <div class="grid">\n')
        for lid in lesson_ids:
            if lid not in cap:
                continue
            _, badge, out = cap[lid]
            # Use file:// URL so the HTML can load the screenshots from disk
            f.write(f'    <div class="tile"><div class="img-wrap"><img src="file://{out}"/></div><div class="meta"><span class="badge">{badge}</span><span class="label">view</span></div></div>\n')
        f.write(f'  </div>\n')
        f.write(f'</section>\n')

    # Gate
    if "gate" in cap:
        f.write('<section class="module">\n')
        f.write('  <header class="module-head"><span class="id">GATE</span><span class="title">Three-way fork after Module 3</span><span class="count">post-M3</span></header>\n')
        f.write('  <div class="grid">\n')
        _, badge, out = cap["gate"]
        f.write(f'    <div class="tile gate"><div class="img-wrap"><img src="file://{out}"/></div><div class="meta"><span class="badge">GATE</span><span class="label">three-door</span></div></div>\n')
        f.write('  </div>\n')
        f.write('</section>\n')

    f.write('</body></html>\n')

print(f"\nCanvas HTML: {OUT_DIR}/canvas.html")
print(f"Open in browser or screenshot via Playwright.")

# --- Render the canvas HTML and screenshot ---
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    # Wide viewport for the canvas page
    canvas_w = COLS * (THUMB_W) + (COLS - 1) * 20 + PADDING * 2 + 40
    context = browser.new_context(viewport={"width": canvas_w, "height": 900})
    page = context.new_page()
    page.goto(f"file://{OUT_DIR}/canvas.html", wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle", timeout=10000)
    page.wait_for_timeout(1000)
    page.screenshot(path=f"{OUT_DIR}/canvas_full.png", full_page=True)
    print(f"Canvas mega-image: {OUT_DIR}/canvas_full.png")
    browser.close()
