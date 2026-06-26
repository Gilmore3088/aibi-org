// Robust functional check for the Module 1 artifact save loop.
// Selector-agnostic: fills every textarea in the active Build panel, picks a
// readiness option, clicks the save button, and detects confirmation.
// Writes docs/course-persona-audit-100/capture/save-check.json.

import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const OUT = resolve(process.cwd(), 'docs/course-persona-audit-100/capture/save-check.json');

async function clickPhase(page, label) {
  const tab = page.getByRole('tab', { name: label, exact: true });
  await tab.first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
  if ((await tab.count()) === 0) return false;
  await tab.first().click();
  await page.waitForTimeout(400);
  return true;
}

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newContext({ viewport: { width: 1440, height: 1200 } }).then((c) => c.newPage());
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });

  const result = { module: 1, base: BASE_URL };
  try {
    await page.goto(`${BASE_URL}/courses/foundation/program/1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await clickPhase(page, 'Build');
    await page.waitForTimeout(400);

    const panel = page.locator('[role="tabpanel"]');
    const textareas = panel.locator('textarea');
    const n = await textareas.count();
    result.textareasFound = n;
    const filler = 'AI drafts and organizes this low-risk work; the banker verifies the facts, the policy fit, and owns the final decision.';
    for (let i = 0; i < n; i += 1) {
      await textareas.nth(i).fill(filler).catch(() => {});
    }

    // Readiness selector: prefer READY/REUSABLE if present.
    for (const name of [/REUSABLE/i, /READY/i]) {
      const btn = panel.getByRole('button', { name });
      if ((await btn.count()) > 0) { await btn.first().click().catch(() => {}); break; }
    }

    const saveBtn = panel.getByRole('button', { name: /save artifact step/i });
    result.saveButtonFound = (await saveBtn.count()) > 0;
    if (result.saveButtonFound) {
      const disabledBefore = await saveBtn.first().isDisabled().catch(() => null);
      result.saveDisabledBeforeFill = disabledBefore;
      await saveBtn.first().click().catch(() => {});
      await page.waitForTimeout(1200);
      const body = (await page.evaluate(() => document.body.innerText)).toLowerCase();
      result.confirmationMarkers = {
        packetSaved: body.includes('packet saved'),
        savedToToolbox: body.includes('saved to toolbox') || body.includes('toolbox asset'),
        debrief: body.includes('module debrief'),
        submitted: body.includes('submitted'),
        savedGeneric: body.includes('saved'),
      };
      result.saved = Object.values(result.confirmationMarkers).some(Boolean);
    }
  } catch (err) {
    result.error = String(err).slice(0, 300);
  }
  result.errors = [...new Set(errors)];
  await browser.close();
  await writeFile(OUT, JSON.stringify(result, null, 2), 'utf8');
  console.log(JSON.stringify(result, null, 2));
}

run().catch((e) => { console.error(e); process.exit(1); });
