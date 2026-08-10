// Screen-record the real loan calculator running (type terms → live result →
// scroll the amortization schedule) for the ad's payoff beat.
import { chromium } from "@playwright/test";
import { readdir, rename, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const FILE = "file://" + join(root, "public", "artifacts", "loan-calculator.html");
const DIR = join(root, "public", "artifacts", "_calc");
await mkdir(DIR, { recursive: true });

let b;
try { b = await chromium.launch(); }
catch { b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" }); }
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, recordVideo: { dir: DIR, size: { width: 1440, height: 900 } } });
await ctx.addInitScript(() => {
  const add = () => { const c = document.createElement("div"); c.style.cssText = "position:fixed;z-index:99999;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:rgba(200,162,74,.95);box-shadow:0 0 0 2px #fff,0 3px 10px rgba(0,0,0,.45);pointer-events:none;left:-50px;top:-50px;transition:transform .06s"; document.body.appendChild(c);
    addEventListener("mousemove", e => { c.style.left = e.clientX + "px"; c.style.top = e.clientY + "px"; });
    addEventListener("mousedown", () => c.style.transform = "scale(.6)"); addEventListener("mouseup", () => c.style.transform = "scale(1)"); };
  if (document.body) add(); else addEventListener("DOMContentLoaded", add);
});
const page = await ctx.newPage();
const wait = ms => page.waitForTimeout(ms);
const moveTo = async sel => { const box = await page.locator(sel).boundingBox(); if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 18 }); };
const typeInto = async (sel, val) => { await moveTo(sel); await page.click(sel); await page.fill(sel, ""); await wait(150); await page.locator(sel).pressSequentially(val, { delay: 70 }); await wait(500); };

await page.goto(FILE);
await wait(1000);
await typeInto("#amount", "250000");
await typeInto("#rate", "7.25");
await typeInto("#term", "30");
await wait(900);
await moveTo("#monthly"); await wait(1100);
// prove it's live: change the rate on camera, payment updates
await typeInto("#rate", "6.75");
await moveTo("#monthly"); await wait(1400);
// scroll the amortization schedule slowly and hold
await page.locator(".sched").hover();
for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, 90); await wait(360); }
await wait(1800);

await ctx.close();
await b.close();
const f = (await readdir(DIR)).find(x => x.endsWith(".webm"));
if (f) await rename(join(DIR, f), join(DIR, "calculator.webm"));
console.log("calculator webm recorded");
