import { chromium } from '@playwright/test';
const BASE = 'http://localhost:3000';
const DIR = '/tmp/claude-0/-home-user-aibi-org/ee58ab2d-3fe1-5328-8845-ecd9c0fe9788/scratchpad/rec';

let b;
try { b = await chromium.launch(); }
catch { b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }); }
const ctx = await b.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  recordVideo: { dir: DIR, size: { width: 1440, height: 900 } },
});
// inject a visible cursor + click ripple so the recording reads as a real user
await ctx.addInitScript(() => {
  const add = () => {
    const c = document.createElement('div');
    c.id = '__cur';
    c.style.cssText = 'position:fixed;z-index:99999;width:24px;height:24px;margin:-12px 0 0 -12px;border-radius:50%;background:rgba(200,162,74,.95);box-shadow:0 0 0 2px #fff,0 3px 10px rgba(0,0,0,.45);pointer-events:none;left:-50px;top:-50px;transition:transform .06s ease';
    document.body.appendChild(c);
    addEventListener('mousemove', e => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; });
    addEventListener('mousedown', () => c.style.transform = 'scale(.6)');
    addEventListener('mouseup', () => c.style.transform = 'scale(1)');
  };
  if (document.body) add(); else addEventListener('DOMContentLoaded', add);
});
const page = await ctx.newPage();
const wait = (ms) => page.waitForTimeout(ms);

await page.goto(BASE + '/assessment/take', { waitUntil: 'networkidle' });
await page.mouse.move(720, 450, { steps: 10 });
await wait(1400);

for (let i = 0; i < 14; i++) {
  const opts = page.locator('.mk-take-q-option');
  const n = await opts.count();
  if (n === 0) break; // reached the result
  const pick = opts.nth((i % 2 === 0) ? 1 : 0); // vary answers → mid score
  const box = await pick.boundingBox();
  if (!box) break;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 22 });
  await wait(420);
  await pick.click();
  await wait(780);
}

// rest on the result/score
await wait(3500);
await page.mouse.wheel(0, 500);
await wait(2500);
await ctx.close();
await b.close();
console.log('recorded → ' + DIR);
