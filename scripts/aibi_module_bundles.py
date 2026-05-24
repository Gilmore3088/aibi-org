"""Per-module bundle generator.

For each module:
  - Visits every lesson at viewport 1280×900
  - Captures the FULL page (entire scroll height) as a PNG
  - Stitches all lessons vertically into one tall PNG per module
  - Also generates one PDF per module via Chromium's page.pdf()

Output:
  public/canvas/modules/m{N}.png  — one continuous image per module
  public/canvas/modules/m{N}.pdf  — print-ready PDF per module
"""
import os
from PIL import Image
from playwright.sync_api import sync_playwright

LESSONS = [
    ("m0", "Orientation", ["m0.1", "m0.2"]),
    ("m1", "What generative AI is", ["m1.1", "m1.2", "m1.3", "m1.4"]),
    ("m2", "Access & workflow", ["m2.1", "m2.2", "m2.3", "m2.4"]),
    ("m3", "Talking to the machine — prompting", ["m3.1", "m3.2", "m3.3", "m3.4", "m3.5"]),
    ("m4", "Automating the repetitive — skills (paid)", ["m4.1", "m4.2", "m4.3", "m4.4"]),
    ("m5", "From idea to prototype (paid)", ["m5.1", "m5.2", "m5.3", "m5.4", "m5.5"]),
]

OUT = "public/canvas/modules"
TMP = "/tmp/aibi_bundles"
os.makedirs(OUT, exist_ok=True)
os.makedirs(TMP, exist_ok=True)

W = 1280
# Cap per-lesson full-page height to keep stitched module image manageable.
MAX_LESSON_H = 4500

# Lesson-separator bar (between stitched lessons in the module PNG)
SEPARATOR_H = 90
SEPARATOR_BG = (236, 233, 223)   # --ledger-bg
SEPARATOR_RULE = (213, 209, 194) # --ledger-rule

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": W, "height": 900})
    page = context.new_page()

    for mid, mtitle, lesson_ids in LESSONS:
        print(f"\n=== {mid} · {mtitle} ===")
        lesson_imgs = []

        for lid in lesson_ids:
            url = f"http://localhost:3000/foundation/{mid}/{lid}"
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=30000)
                page.wait_for_load_state("networkidle", timeout=20000)
                page.wait_for_timeout(1500)
                # Full-page screenshot
                shot_path = f"{TMP}/{lid}_full.png"
                page.screenshot(path=shot_path, full_page=True)
                img = Image.open(shot_path).convert("RGB")
                # Cap height per lesson
                if img.height > MAX_LESSON_H:
                    img = img.crop((0, 0, img.width, MAX_LESSON_H))
                lesson_imgs.append((lid, img))
                print(f"  [{lid}] {img.width}x{img.height}")
            except Exception as e:
                print(f"  [{lid}] FAIL: {e}")

        if not lesson_imgs:
            continue

        # Stitch vertically with a small separator + lesson label between each
        total_h = sum(img.height for _, img in lesson_imgs) + SEPARATOR_H * (len(lesson_imgs) - 1)
        canvas = Image.new("RGB", (W, total_h), SEPARATOR_BG)
        y = 0
        for i, (lid, img) in enumerate(lesson_imgs):
            canvas.paste(img, (0, y))
            y += img.height
            if i < len(lesson_imgs) - 1:
                # Draw separator: bg fill + horizontal rule + label
                from PIL import ImageDraw, ImageFont
                draw = ImageDraw.Draw(canvas)
                rule_y = y + SEPARATOR_H // 2
                draw.line([(60, rule_y), (W - 60, rule_y)], fill=SEPARATOR_RULE, width=1)
                # Try to render the next lesson's label
                try:
                    font = ImageFont.truetype("/System/Library/Fonts/SFNSMono.ttf", 14)
                except Exception:
                    font = ImageFont.load_default()
                next_label = lesson_imgs[i + 1][0].upper()
                draw.text((60, rule_y + 14), f"NEXT LESSON · {next_label}", fill=(79, 92, 110), font=font)
                y += SEPARATOR_H

        out_png = f"{OUT}/{mid}.png"
        canvas.save(out_png, "PNG", optimize=True)
        print(f"  -> {out_png}  ({canvas.width}x{canvas.height})")

    # --- Now generate per-module PDFs via Chromium's page.pdf() ---
    # Build a temporary HTML for each module that loads each lesson via
    # iframe at full size, then PDF-print the whole thing.
    # We use the actual route content via direct fetch + concat would be
    # cleaner; for MVP use a long iframe page.

    print("\n=== Generating PDFs ===")
    for mid, mtitle, lesson_ids in LESSONS:
        # Single-module HTML wrapping each lesson URL in a full-bleed iframe
        html_path = f"{TMP}/{mid}_bundle.html"
        # Each iframe height = MAX_LESSON_H to ensure full lesson visible
        with open(html_path, "w") as f:
            f.write("<!doctype html><html><head><meta charset='utf-8'><title>")
            f.write(f"{mid.upper()} · {mtitle}")
            f.write("</title>")
            f.write("""<style>
              body{margin:0;padding:0;background:#ECE9DF;font-family:system-ui;}
              .cover{padding:48px;background:#0E1B2D;color:#F4F1E7;}
              .cover .kicker{font-family:monospace;text-transform:uppercase;letter-spacing:0.2em;font-size:11px;color:#7C5814;margin-bottom:8px;}
              .cover h1{font-family:Georgia,serif;font-size:36px;margin:0;}
              .cover .sub{font-family:monospace;text-transform:uppercase;letter-spacing:0.16em;font-size:10px;color:#A8AEBE;margin-top:8px;}
              .lesson-cover{padding:18px 32px;background:#E4E0D2;border-top:1px solid #D5D1C2;border-bottom:1px solid #D5D1C2;font-family:monospace;text-transform:uppercase;letter-spacing:0.18em;font-size:11px;color:#7C5814;page-break-before:always;}
              iframe{width:1280px;height:""" + str(MAX_LESSON_H) + """px;border:0;display:block;}
            </style></head><body>""")
            f.write(f"<div class='cover'><div class='kicker'>Module bundle · {mid.upper()}</div><h1>{mtitle}</h1><div class='sub'>{len(lesson_ids)} lessons captured at 1280px wide</div></div>")
            for lid in lesson_ids:
                f.write(f"<div class='lesson-cover'>Lesson {lid}</div>")
                f.write(f"<iframe src='http://localhost:3000/foundation/{mid}/{lid}'></iframe>")
            f.write("</body></html>")

        try:
            page.goto(f"file://{html_path}", wait_until="domcontentloaded", timeout=30000)
            page.wait_for_load_state("networkidle", timeout=30000)
            page.wait_for_timeout(3000)
            pdf_path = f"{OUT}/{mid}.pdf"
            page.pdf(
                path=pdf_path,
                width="1280px",
                height=f"{MAX_LESSON_H}px",
                print_background=True,
                margin={"top": "0", "bottom": "0", "left": "0", "right": "0"},
            )
            print(f"  -> {pdf_path}")
        except Exception as e:
            print(f"  PDF for {mid} FAIL: {e}")

    browser.close()

print("\nAll module bundles generated.")
