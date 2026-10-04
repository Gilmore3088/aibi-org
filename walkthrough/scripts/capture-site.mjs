// Capture full-page screenshots of the REAL site into walkthrough/public/site/.
// These are the "footage" for the walkthrough — actual pages, not recreations.
//
//   1) start the app:   npm run dev          (repo root)
//   2) run this:         node scripts/capture-site.mjs   (from walkthrough/)
//
// Public marketing pages capture without login. For auth-gated pages (course,
// toolbox, in-depth) run with HEADED=1 and log in when the window opens.
// Override base URL with CAPTURE_BASE (default http://localhost:3000).
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import readline from "node:readline";

const BASE = process.env.CAPTURE_BASE || "http://localhost:3000";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "site");
const HEADED = process.env.HEADED === "1";

// path → filename. Add auth-gated routes here once you can log in (HEADED=1).
const ROUTES = [
  ["/", "home"],
  ["/assessment", "assessment"],
  ["/resources", "resources"],
  ["/security", "security"],
  ["/certifications", "certifications"],
  ["/about", "about"],
  ["/for-institutions", "institutions"],
  ["/pricing", "pricing"],
  // ["/courses/foundation/program", "course-overview"],  // needs login (HEADED=1)
];

const ask = (q) =>
  new Promise((r) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(q, (a) => { rl.close(); r(a); });
  });

await mkdir(OUT, { recursive: true });
let b;
try { b = await chromium.launch({ headless: !HEADED }); }
catch { b = await chromium.launch({ headless: !HEADED, executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" }); }
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

if (HEADED) {
  await page.goto(BASE + ROUTES[0][0]).catch(() => {});
  await ask("\n→ Log in if needed, then press Enter to capture...\n");
}

for (const [path, name] of ROUTES) {
  try {
    const r = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });
    const h = await page.evaluate(() => document.body.scrollHeight);
    const landed = page.url().replace(BASE, "");
    console.log(`  ${name}.png  ${r.status()}  h=${h}px  ${landed === path ? "" : `(→ ${landed})`}`);
  } catch (e) { console.log(`  ${name}  ERROR ${e.message.slice(0, 70)}`); }
}
await b.close();
console.log("\n✓ pages in public/site/ — update cssHeight in src/Walkthrough.tsx if they changed, then: npm run render");
