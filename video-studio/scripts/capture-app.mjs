// Capture REAL screens from your running app (logged in) into
// video-studio/public/screens/. Auth-gated routes need your session, so this
// opens a headed browser, lets you log in, then screenshots each route.
//
//   1) start your app:           npm run dev         (in the repo root)
//   2) run this from video-studio: node scripts/capture-app.mjs
//   3) log in / navigate in the window that opens, then press Enter
//
// Edit ROUTES below to match your real paths (the [module] slug especially).
// Override the base URL with CAPTURE_BASE (default http://localhost:3000).
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import readline from "node:readline";

let chromium;
try { ({ chromium } = await import("playwright")); }
catch { ({ chromium } = await import("@playwright/test")); } // repo already has this

const BASE = process.env.CAPTURE_BASE || "http://localhost:3000";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "screens");

// path → output filename. Adjust to your real routes.
const ROUTES = [
  { path: "/courses/foundation/program", name: "course-overview" },
  { path: "/courses/foundation/program/07", name: "course-module" }, // <- fix the [module] slug
  { path: "/courses/foundation/program/toolkit", name: "course-toolbox" },
  { path: "/dashboard", name: "dashboard" },
  { path: "/dashboard/assessments", name: "assessment" },
];

const ask = (q) =>
  new Promise((r) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(q, (a) => { rl.close(); r(a); });
  });

const browser = await chromium.launch({ headless: false });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

await page.goto(BASE + ROUTES[0].path).catch(() => {});
await ask("\n→ Log in / navigate so you're authenticated, then press Enter to capture...\n");

await mkdir(OUT, { recursive: true });
for (const r of ROUTES) {
  await page.goto(BASE + r.path, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(OUT, `${r.name}.png`) });
  const landed = page.url().replace(BASE, "");
  console.log(`  ${r.name}.png  ←  ${landed}${landed === r.path ? "" : "  (redirected!)"}`);
}
await browser.close();
console.log("\n✓ real screens in video-studio/public/screens/ — commit them and I'll rebuild.");
