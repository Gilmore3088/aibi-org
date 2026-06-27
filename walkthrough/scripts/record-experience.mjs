// Record a real run of the free assessment, shaped for an ad:
//   - lingers on the first 3 questions (the rest are answered fast and cut out)
//   - fills name + email + institution
//   - submits and reveals the ACTUAL report (inline fallback render)
// Writes the video + a cuts.json (q3End / formStart / reportStart / end, seconds)
// so the editor can drop the middle 9 questions cleanly.
//
//   node walkthrough/scripts/record-experience.mjs   (app running on :3000)
import { chromium } from "@playwright/test";
import { writeFile, mkdir, readdir, rename } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BASE = process.env.CAPTURE_BASE || "http://localhost:3000";
const FOOT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "footage");
const VIDDIR = join(FOOT, "_rec");
await mkdir(VIDDIR, { recursive: true });

let b;
try { b = await chromium.launch(); }
catch { b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" }); }

const t0 = Date.now();
const el = () => Number(((Date.now() - t0) / 1000).toFixed(2));

const ctx = await b.newContext({
  viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
  recordVideo: { dir: VIDDIR, size: { width: 1440, height: 900 } },
});
await ctx.addInitScript(() => {
  const add = () => {
    const c = document.createElement("div"); c.id = "__cur";
    c.style.cssText = "position:fixed;z-index:99999;width:24px;height:24px;margin:-12px 0 0 -12px;border-radius:50%;background:rgba(200,162,74,.95);box-shadow:0 0 0 2px #fff,0 3px 10px rgba(0,0,0,.45);pointer-events:none;left:-50px;top:-50px;transition:transform .06s ease";
    document.body.appendChild(c);
    addEventListener("mousemove", e => { c.style.left = e.clientX + "px"; c.style.top = e.clientY + "px"; });
    addEventListener("mousedown", () => c.style.transform = "scale(.6)");
    addEventListener("mouseup", () => c.style.transform = "scale(1)");
  };
  if (document.body) add(); else addEventListener("DOMContentLoaded", add);
});
const page = await ctx.newPage();
const wait = (ms) => page.waitForTimeout(ms);
const moveTo = async (loc) => { const box = await loc.boundingBox(); if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 20 }); };

await page.goto(BASE + "/assessment/take", { waitUntil: "networkidle" });
await page.mouse.move(720, 460, { steps: 8 });
await wait(1200);

let q3End = 0;
for (let i = 0; i < 14; i++) {
  const opts = page.locator(".mk-take-q-option");
  if (await opts.count() === 0) break;
  const pick = opts.nth(i % 2 === 0 ? 1 : 2);
  if (i < 3) { await moveTo(pick); await wait(520); await pick.click(); await wait(820); }
  else { await pick.click(); await wait(190); }       // breeze through 4–12
  if (i === 2) q3End = el();
}

// the email gate
const email = page.getByPlaceholder("name@yourbank.com").first();
await email.waitFor({ timeout: 8000 });
await wait(500);
const formStart = el();

const inst = page.getByPlaceholder("First Federal Credit Union").first();
const first = page.getByPlaceholder("Sarah").first();
await moveTo(inst); await inst.click(); await inst.pressSequentially("First Federal Credit Union", { delay: 45 }); await wait(300);
await moveTo(first); await first.click(); await first.pressSequentially("Sarah", { delay: 55 }); await wait(300);
await moveTo(email); await email.click(); await email.pressSequentially("sarah@firstfederal.com", { delay: 45 }); await wait(500);

const send = page.getByRole("button", { name: /send my report/i }).first();
await moveTo(send); await wait(300); await send.click();

// reveal the report — fall back to "view summary" if submit didn't render it
let reportStart = 0;
try {
  await email.waitFor({ state: "detached", timeout: 4500 });
  reportStart = el();
} catch {
  const skip = page.getByRole("button", { name: /view summary without email/i }).first();
  await skip.click().catch(() => {});
  await wait(1200);
  reportStart = el();
}
await wait(2500);
await page.mouse.wheel(0, 700); await wait(1800);
await page.mouse.wheel(0, 700); await wait(1800);
const end = el();

await ctx.close();
await b.close();

// name the video deterministically + write cut points
const files = (await readdir(VIDDIR)).filter(f => f.endsWith(".webm"));
if (files[0]) await rename(join(VIDDIR, files[0]), join(VIDDIR, "assessment.webm"));
await writeFile(join(FOOT, "assessment.cuts.json"), JSON.stringify({ q3End, formStart, reportStart, end }, null, 2) + "\n");
console.log(JSON.stringify({ q3End, formStart, reportStart, end }));
console.log("webm → public/footage/_rec/assessment.webm  (convert to mp4 next)");
