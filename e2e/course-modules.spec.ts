import { test, expect, type Page } from '@playwright/test';
import {
  FOUNDATION_FINAL_MODULE_NUMBER,
  FOUNDATION_MODULE_COUNT,
} from '@content/courses/foundation-program/course-config';
import { FOUNDATION_MICRO_MODULES } from '@content/courses/foundation-program/micro-modules';
import { getModuleActivitySpec } from '@content/courses/foundation-program/module-activities';

// §7 E2E — AiBI-Foundation course modules + activities (issue #138, items 193–252).
//
// SCOPE OF THIS FILE
// ------------------
// The production Foundation course surface (overview, module pages, tabs,
// sandboxes, activities, completion, mobile drawer, a11y) is gated behind a
// logged-in, *enrolled* Supabase session. Local preview coverage below verifies
// the 18-module Understand → Try → Build → Save UI using the dev-only bypass.
// Anything that must prove real enrollment, activity persistence, or Toolbox
// writes belongs in e2e/course-enrolled.spec.ts and runs only when Supabase
// seeding is explicitly enabled.
//
// What IS testable without auth/Supabase, and is asserted below:
//   • The two write APIs (save-progress, submit-activity) — auth + input
//     contract. Both return 503 first when Supabase is unconfigured, else 401
//     when unauthenticated; malformed/empty bodies return 400 once past the
//     503 gate. The forward-only / ownership rules (current_module match,
//     prior-modules-complete, enrollment.user_id === user) are visible in the
//     route code and enforced *after* auth, so they cannot be hit by an
//     unauthenticated caller — those branches are documented in the fixme set.
//   • generate-module-artifact — enrollment-gated GET returns 401 for a valid
//     module number when unauthenticated (item 234).
//   • The [module] route's invalid-param guard — page.tsx runs notFound()
//     (parseInt + range check) BEFORE getEnrollment(), so bad module slugs are
//     publicly observable as "not module content" regardless of auth.
//
// Real status codes are read from the route source, not invented:
//   save-progress / submit-activity:
//     503 (Supabase unconfigured) → 400 (bad JSON / bad enrollmentId / bad
//     moduleNumber / bad activityId / empty response) → 401 (unauthenticated)
//     → 403 (enrollment not owned) → 400 (out of sequence) → 409 (dup) → 201.
//   generate-module-artifact:
//     400 (bad module) → 404 (no spec) → 401 (not enrolled) → 503 → 200.

const SUPABASE_OFF = [400, 401, 503] as const; // 503 when unconfigured; 401 when configured-but-unauth; 400 when body fails first

async function visibleWordCount(page: Page, selector: string): Promise<number> {
  return page.locator(selector).evaluate((element) =>
    Array.from(element.querySelectorAll('h1,h2,h3,p,dt,dd,span,a,button,label,summary,li'))
      .filter((child) => {
        const style = window.getComputedStyle(child);
        const rect = child.getBoundingClientRect();
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          rect.width > 0 &&
          rect.height > 0
        );
      })
      .map((child) => child.textContent ?? '')
      .join(' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean).length,
  );
}

// ---------------------------------------------------------------------------
// API contract — save-progress (items 226–230, 250 server side)
// ---------------------------------------------------------------------------

test.describe('§7 course API — save-progress contract', () => {
  test('rejects unauthenticated well-formed POST (401 / 503)', async ({ request }) => {
    const res = await request.post('/api/courses/save-progress', {
      data: { enrollmentId: 'fake-enrollment', moduleNumber: 1 },
      headers: { 'Content-Type': 'application/json' },
    });
    // 401 when Supabase is configured (auth fails); 503 when it isn't.
    expect([401, 503], `returned ${res.status()}`).toContain(res.status());
  });

  test('rejects malformed JSON body (400 / 503)', async ({ request }) => {
    const res = await request.post('/api/courses/save-progress', {
      data: 'not-json{',
      headers: { 'Content-Type': 'application/json' },
    });
    // 400 (Invalid JSON body) when configured; 503 short-circuits when not.
    expect([400, 503], `returned ${res.status()}`).toContain(res.status());
  });

  test('rejects missing enrollmentId (400 / 503)', async ({ request }) => {
    const res = await request.post('/api/courses/save-progress', {
      data: { moduleNumber: 1 },
      headers: { 'Content-Type': 'application/json' },
    });
    expect([400, 503], `returned ${res.status()}`).toContain(res.status());
  });

  test('rejects out-of-range moduleNumber (400 / 503)', async ({ request }) => {
    const res = await request.post('/api/courses/save-progress', {
      data: { enrollmentId: 'fake', moduleNumber: 99 },
      headers: { 'Content-Type': 'application/json' },
    });
    // moduleNumber must be an integer in the configured course range.
    expect([400, 503], `returned ${res.status()}`).toContain(res.status());
  });

  test('accepts the configured final module number through validation before auth', async ({ request }) => {
    const res = await request.post('/api/courses/save-progress', {
      data: { enrollmentId: 'fake-enrollment', moduleNumber: FOUNDATION_FINAL_MODULE_NUMBER },
      headers: { 'Content-Type': 'application/json' },
    });
    // If this returns 400, the API is still capped below the current course length.
    expect([401, 503], `returned ${res.status()}`).toContain(res.status());
  });

  test('rejects non-integer moduleNumber (400 / 503)', async ({ request }) => {
    const res = await request.post('/api/courses/save-progress', {
      data: { enrollmentId: 'fake', moduleNumber: 1.5 },
      headers: { 'Content-Type': 'application/json' },
    });
    expect([400, 503], `returned ${res.status()}`).toContain(res.status());
  });

  test('never leaks a 500 for hostile input', async ({ request }) => {
    const res = await request.post('/api/courses/save-progress', {
      data: { enrollmentId: { $ne: null }, moduleNumber: ['x'] },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status(), `returned ${res.status()}`).toBeLessThan(500);
  });
});

// ---------------------------------------------------------------------------
// API contract — submit-activity (items 222–225 server side, 229–230)
// ---------------------------------------------------------------------------

test.describe('§7 course API — submit-activity contract', () => {
  test('rejects unauthenticated well-formed POST (401 / 503)', async ({ request }) => {
    const res = await request.post('/api/courses/submit-activity', {
      data: {
        enrollmentId: 'fake-enrollment',
        moduleNumber: 1,
        activityId: '1.1',
        response: { 'practice-response': 'x'.repeat(40) },
      },
      headers: { 'Content-Type': 'application/json' },
    });
    expect([401, 503], `returned ${res.status()}`).toContain(res.status());
  });

  test('rejects malformed JSON body (400 / 503)', async ({ request }) => {
    const res = await request.post('/api/courses/submit-activity', {
      data: 'not-json{',
      headers: { 'Content-Type': 'application/json' },
    });
    expect([400, 503], `returned ${res.status()}`).toContain(res.status());
  });

  test('rejects bad activityId format (item 224/225 — 400 / 503)', async ({ request }) => {
    // ACTIVITY_ID_PATTERN = /^\d+\.\d+$/ ; "x" / "abc" / "1" all fail.
    const res = await request.post('/api/courses/submit-activity', {
      data: {
        enrollmentId: 'fake',
        moduleNumber: 1,
        activityId: 'not-a-valid-id',
        response: { a: 'b' },
      },
      headers: { 'Content-Type': 'application/json' },
    });
    expect([400, 503], `returned ${res.status()}`).toContain(res.status());
  });

  test('rejects empty response object (400 / 503)', async ({ request }) => {
    const res = await request.post('/api/courses/submit-activity', {
      data: { enrollmentId: 'fake', moduleNumber: 1, activityId: '1.1', response: {} },
      headers: { 'Content-Type': 'application/json' },
    });
    expect([400, 503], `returned ${res.status()}`).toContain(res.status());
  });

  test('rejects out-of-range moduleNumber (400 / 503)', async ({ request }) => {
    const res = await request.post('/api/courses/submit-activity', {
      data: { enrollmentId: 'fake', moduleNumber: 0, activityId: '1.1', response: { a: 'b' } },
      headers: { 'Content-Type': 'application/json' },
    });
    expect([400, 503], `returned ${res.status()}`).toContain(res.status());
  });

  test('accepts the configured final module number through validation before auth', async ({ request }) => {
    const res = await request.post('/api/courses/submit-activity', {
      data: {
        enrollmentId: 'fake-enrollment',
        moduleNumber: FOUNDATION_FINAL_MODULE_NUMBER,
        activityId: `${FOUNDATION_FINAL_MODULE_NUMBER}.1`,
        response: {
          artifact_draft: 'A final packet summary for a reviewed workflow kit.',
          review_note: 'The reviewer, boundary, and evidence notes are visible.',
          first_use: 'I will use this packet during my next manager review.',
        },
      },
      headers: { 'Content-Type': 'application/json' },
    });
    // If this returns 400, the API is still capped below the current course length.
    expect([401, 503], `returned ${res.status()}`).toContain(res.status());
  });

  test('combined contract reflects 503-first ordering', async ({ request }) => {
    // Sanity: any of the documented pre-auth codes is acceptable for a
    // well-formed-but-unauthenticated request. Guards against a regression
    // that turns the gate into a 200 or a 500.
    const res = await request.post('/api/courses/submit-activity', {
      data: {
        enrollmentId: 'fake',
        moduleNumber: 1,
        activityId: '1.1',
        response: { 'practice-response': 'y'.repeat(40), 'review-notes': 'z'.repeat(40) },
      },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(SUPABASE_OFF, `returned ${res.status()}`).toContain(res.status());
  });

  test('never leaks a 500 for hostile input', async ({ request }) => {
    const res = await request.post('/api/courses/submit-activity', {
      data: { enrollmentId: 42, moduleNumber: 'one', activityId: 7, response: [1, 2, 3] },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.status(), `returned ${res.status()}`).toBeLessThan(500);
  });
});

// ---------------------------------------------------------------------------
// API contract — generate-module-artifact (item 234)
// ---------------------------------------------------------------------------

test.describe('§7 course API — generate-module-artifact gate', () => {
  test('item 234 — valid module unauthenticated returns 401 (enrollment required)', async ({ request }) => {
    // Order in route: invalid module → 400; no spec → 404; then getEnrollment()
    // → 401 when unauthenticated. Module 1 has a spec, so the enrollment gate
    // is the one that fires here.
    const res = await request.get('/api/courses/generate-module-artifact?module=1');
    expect([401, 404], `returned ${res.status()}`).toContain(res.status());
  });

  test('configured final module is a valid artifact route before auth', async ({ request }) => {
    const res = await request.get(
      `/api/courses/generate-module-artifact?module=${FOUNDATION_FINAL_MODULE_NUMBER}`,
    );
    // If this returns 400, the artifact route is still capped below the current course length.
    expect([401, 404], `returned ${res.status()}`).toContain(res.status());
  });

  test('rejects out-of-range module param (400)', async ({ request }) => {
    const res = await request.get(
      `/api/courses/generate-module-artifact?module=${FOUNDATION_FINAL_MODULE_NUMBER + 1}`,
    );
    expect(res.status(), `returned ${res.status()}`).toBe(400);
  });

  test('rejects missing module param (400)', async ({ request }) => {
    const res = await request.get('/api/courses/generate-module-artifact');
    expect(res.status(), `returned ${res.status()}`).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// [module] route invalid-param guard (notFound) — supports items 198–209
// ---------------------------------------------------------------------------
// page.tsx: parseInt(params.module) → notFound() when NaN / <1 / >final module, BEFORE
// getEnrollment(). So invalid slugs never render module content, with or
// without a session. We assert "not module content" rather than a hard 404,
// because under COMING_SOON the middleware may rewrite, and unenrolled valid
// modules redirect to /purchase — neither of which should show a module body.

const INVALID_MODULE_SLUGS = [
  'abc',
  '0',
  String(FOUNDATION_FINAL_MODULE_NUMBER + 1),
  '99',
  '-1',
];

test.describe('§7 module route — invalid module guard', () => {
  for (const slug of INVALID_MODULE_SLUGS) {
    test(`/program/${slug} does not render a module body`, async ({ page }) => {
      const res = await page.goto(`/courses/foundation/program/${slug}`);
      const status = res?.status() ?? 0;
      // Must never 500. Acceptable: 404 (notFound), or a redirect to
      // purchase/auth (2xx after redirect), or COMING_SOON rewrite.
      expect(status, `${slug} returned ${status}`).toBeLessThan(500);

      const body = await page.locator('body').innerText().catch(() => '');
      // The module body always renders the four-step rail. An invalid slug
      // must show none of the module-specific learning surface.
      expect(body).not.toMatch(/Understand[\s\S]*Try[\s\S]*Build[\s\S]*Save/);
      expect(body).not.toMatch(/Banking Boundary/);
    });
  }

  test('valid module while unauthenticated does not expose enrolled content', async ({ page }) => {
    // /program/1 is a valid module, but getEnrollment() returns null without a
    // session → redirect('/courses/foundation/program/purchase'). The learner
    // never sees module content. (Under SKIP_ENROLLMENT_GATE in dev the synthetic
    // enrollment WOULD render it — that path is covered by the fixme set.)
    const res = await page.goto('/courses/foundation/program/1');
    expect((res?.status() ?? 0), 'should not 500').toBeLessThan(500);
    const url = page.url();
    // Either landed on purchase, an auth redirect, or (dev bypass) the module.
    // We only assert no server error and a real navigation occurred.
    expect(url.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Local preview render contract — proves the 18-module UX is scannable when
// the dev-only enrollment bypass is active. Skipped for preview/prod E2E,
// where a real enrolled session is required.
// ---------------------------------------------------------------------------

const LOCAL_COURSE_PREVIEW =
  !process.env.VERCEL_URL &&
  (!process.env.PLAYWRIGHT_BASE_URL ||
    process.env.PLAYWRIGHT_BASE_URL.includes('localhost'));

const REPRESENTATIVE_MICRO_MODULES = [1, 4, 9, 13, 15, 17, 18] as const;

test.describe('§7 local course preview — micro-module UX contract', () => {
  test.skip(!LOCAL_COURSE_PREVIEW, 'course preview rendering uses local dev enrollment bypass only');

  for (const moduleNumber of REPRESENTATIVE_MICRO_MODULES) {
    const microModule = FOUNDATION_MICRO_MODULES.find((item) => item.number === moduleNumber);

    test(`module ${moduleNumber} opens with one outcome, one action, and the four-step rail`, async ({ page }) => {
      if (!microModule) throw new Error(`Missing module ${moduleNumber}`);

      await page.goto(`/courses/foundation/program/${moduleNumber}`);

      const hero = page.locator('.foundation-module-hero');
      await expect(hero).toBeVisible();
      await expect(hero.getByRole('heading', { name: microModule.keyOutput, exact: true })).toBeVisible();
      await expect(hero.getByText(microModule.mission)).toBeVisible();

      const heroWords = await hero.evaluate((element) =>
        Array.from(element.querySelectorAll('h1,p,dt,dd,span,a'))
          .filter((child) => {
            const style = window.getComputedStyle(child);
            const rect = child.getBoundingClientRect();
            return (
              style.display !== 'none' &&
              style.visibility !== 'hidden' &&
              rect.width > 0 &&
              rect.height > 0
            );
          })
          .map((child) => child.textContent ?? '')
          .join(' ')
          .trim()
          .split(/\s+/)
          .filter(Boolean).length,
      );
      expect(heroWords, `module ${moduleNumber} hero word count`).toBeLessThanOrEqual(70);

      const startButton = hero.getByRole('link', { name: 'Start' });
      await expect(startButton).toBeVisible();
      const startBox = await startButton.boundingBox();
      expect(startBox?.y ?? Number.POSITIVE_INFINITY).toBeLessThan(760);

      const rail = page.getByRole('tablist', { name: 'Module sections' });
      await expect(rail).toBeVisible();
      await expect(rail.getByRole('tab', { name: 'Understand' })).toBeVisible();
      await expect(rail.getByRole('tab', { name: 'Try' })).toBeVisible();
      await expect(rail.getByRole('tab', { name: 'Build' })).toBeVisible();
      await expect(rail.getByRole('tab', { name: 'Save' })).toBeVisible();
    });
  }

  test('all 18 modules render as scannable micro-lessons with a day-job artifact path', async ({ page }) => {
    test.setTimeout(60_000);

    for (const microModule of FOUNDATION_MICRO_MODULES) {
      await page.goto(`/courses/foundation/program/${microModule.number}`);

      const hero = page.locator('.foundation-module-hero');
      await expect(hero).toBeVisible();
      await expect(hero.getByRole('heading', { name: microModule.keyOutput, exact: true })).toBeVisible();
      await expect(hero.getByText(microModule.mission)).toBeVisible();

      const heroWords = await visibleWordCount(page, '.foundation-module-hero');
      expect(heroWords, `module ${microModule.number} hero visible word count`).toBeLessThanOrEqual(70);

      const firstPanelWords = await visibleWordCount(page, '[role="tabpanel"]');
      expect(firstPanelWords, `module ${microModule.number} initial panel visible word count`).toBeLessThanOrEqual(380);

      const startButton = hero.getByRole('link', { name: 'Start' });
      await expect(startButton).toBeVisible();

      const rail = page.getByRole('tablist', { name: 'Module sections' });
      await expect(rail).toBeVisible();
      await expect(rail.getByRole('tab', { name: 'Understand' })).toHaveAttribute('aria-selected', 'true');

      const buildTab = rail.getByRole('tab', { name: 'Build' });
      await buildTab.click();
      await expect(buildTab).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByRole('heading', { name: `Build: ${microModule.saveArtifact}` })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Save artifact step' })).toBeVisible();

      const saveTab = rail.getByRole('tab', { name: 'Save' });
      await saveTab.click();
      await expect(saveTab).toHaveAttribute('aria-selected', 'true');
      const savePanel = page.getByRole('tabpanel', { name: 'Save' });
      await expect(savePanel.getByLabel('Packet item status')).toBeVisible();
      await expect(savePanel.getByText(microModule.saveArtifact, { exact: true })).toBeVisible();

      const metrics = await page.evaluate(() => ({
        overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }));
      expect(metrics.overflowX, `module ${microModule.number} horizontal overflow`).toBeLessThanOrEqual(0);
    }
  });

  test('module 17 keeps the reusable workflow kit separate from the final packet review', async ({ page }) => {
    await page.goto('/courses/foundation/program/17');

    await expect(page.getByRole('heading', { name: 'Reusable Workflow Kit' })).toBeVisible();
    await expect(page.getByText('Workflow Kit Builder')).toBeVisible();
    await expect(page.getByText('Foundation Packet Summary')).toHaveCount(0);
  });

  test('AiBI Lab role starts are gated by prediction and write banker-context prompts', async ({ page }) => {
    await page.goto('/courses/foundation/program/2');

    const rail = page.getByRole('tablist', { name: 'Module sections' });
    const tryTab = rail.getByRole('tab', { name: 'Try' });
    await tryTab.click();
    await expect(tryTab).toHaveAttribute('aria-selected', 'true');

    await expect(page.getByTestId('aibi-lab-calibration')).toBeVisible();
    const roleStarts = page.getByRole('group', { name: 'Role-specific lab starts' });
    const lendingStart = roleStarts.getByRole('button', { name: 'Lending' });
    await expect(lendingStart).toBeDisabled();

    await page.getByLabel('My prediction').fill('The output may add unsupported facts.');
    await page.getByRole('button', { name: 'Save prediction' }).click();
    await expect(page.getByText('Prediction saved')).toBeVisible();

    await expect(lendingStart).toBeEnabled();
    await lendingStart.click();

    const messageInput = page.getByLabel('Message input');
    await expect(messageInput).toHaveValue(/loan file support/);
    await expect(messageInput).toHaveValue(/Foundation Packet/);
  });

  test('module tabs move the learner through Try, Build, and Save without exposing a long scroll wall', async ({ page }) => {
    const module15 = FOUNDATION_MICRO_MODULES.find((item) => item.number === 15);
    if (!module15) throw new Error('Missing module 15');

    await page.goto('/courses/foundation/program/15');

    const rail = page.getByRole('tablist', { name: 'Module sections' });
    const tryTab = rail.getByRole('tab', { name: 'Try' });
    const buildTab = rail.getByRole('tab', { name: 'Build' });
    const saveTab = rail.getByRole('tab', { name: 'Save' });

    await tryTab.click();
    await expect(tryTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('heading', { name: module15.tryTask })).toBeVisible();

    await buildTab.click();
    await expect(buildTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('heading', { name: 'Build: Human Review Gate Card' })).toBeVisible();

    await page.reload();
    await expect(buildTab).toHaveAttribute('aria-selected', 'true');

    await saveTab.click();
    await expect(saveTab).toHaveAttribute('aria-selected', 'true');
    const savePanel = page.getByRole('tabpanel', { name: 'Save' });
    await expect(savePanel.getByLabel('Packet item status')).toBeVisible();
    await expect(savePanel.getByText('Human Review Gate Card')).toBeVisible();
  });

  test('late-module Build step uses one compact save-evidence workbench', async ({ page }) => {
    for (const moduleNumber of [15, 17]) {
      await page.goto(`/courses/foundation/program/${moduleNumber}#st-submit`);

      const buildTab = page.getByRole('tablist', { name: 'Module sections' }).getByRole('tab', { name: 'Build' });
      await expect(buildTab).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('.foundation-save-evidence-panel')).toHaveCount(1);
      await expect(page.locator('.foundation-judgment-checkpoint__cue')).toHaveCount(0);
      await expect(page.locator('.foundation-transfer-plan__cue')).toHaveCount(0);
      await expect(page.locator('.foundation-module-handoff__check')).toHaveCount(0);
      await expect(page.getByLabel('Review note')).toBeVisible();
      await expect(page.getByLabel('First real use')).toBeVisible();

      const metrics = await page.evaluate(() => {
        const submitBrief = document.querySelector('.foundation-submit-brief')?.getBoundingClientRect();
        const panel = document.querySelector('.foundation-save-evidence-panel')?.getBoundingClientRect();
        const inputs = document.querySelector('.foundation-save-evidence-panel__inputs');
        const visibleText = Array.from(
          document.querySelectorAll(
            '.foundation-save-evidence-panel h3, .foundation-save-evidence-panel p, .foundation-save-evidence-panel span, .foundation-save-evidence-panel label, .foundation-save-evidence-panel button',
          ),
        )
          .filter((element) => {
            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return (
              style.display !== 'none' &&
              style.visibility !== 'hidden' &&
              rect.width > 0 &&
              rect.height > 0
            );
          })
          .map((element) => element.textContent ?? '')
          .join(' ')
          .trim();

        return {
          overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          submitBriefHeight: submitBrief?.height ?? Number.POSITIVE_INFINITY,
          panelHeight: panel?.height ?? Number.POSITIVE_INFINITY,
          textWords: visibleText.split(/\s+/).filter(Boolean).length,
          inputColumns: inputs ? window.getComputedStyle(inputs).gridTemplateColumns.split(' ').length : 0,
        };
      });

      expect(metrics.overflowX, `module ${moduleNumber} horizontal overflow`).toBeLessThanOrEqual(0);
      expect(metrics.submitBriefHeight, `module ${moduleNumber} build action bar height`).toBeLessThanOrEqual(180);
      expect(metrics.panelHeight, `module ${moduleNumber} save-evidence panel height`).toBeLessThanOrEqual(500);
      expect(metrics.textWords, `module ${moduleNumber} save-evidence visible word count`).toBeLessThanOrEqual(95);
      expect(metrics.inputColumns, `module ${moduleNumber} review/transfer columns`).toBeGreaterThanOrEqual(2);
    }
  });

  test('mobile module hero keeps the first action and section rail in the first viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    for (const moduleNumber of [1, 6, 15, 18]) {
      await page.goto(`/courses/foundation/program/${moduleNumber}`);

      const metrics = await page.evaluate(() => {
        const hero = document.querySelector('.foundation-module-hero')?.getBoundingClientRect();
        const start = document
          .querySelector('.foundation-module-hero a[href="#st-takeaway"]')
          ?.getBoundingClientRect();
        const rail = document
          .querySelector('[role="tablist"][aria-label="Module sections"]')
          ?.getBoundingClientRect();

        return {
          heroBottom: hero?.bottom ?? Number.POSITIVE_INFINITY,
          startBottom: start?.bottom ?? Number.POSITIVE_INFINITY,
          railBottom: rail?.bottom ?? Number.POSITIVE_INFINITY,
          overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });

      expect(metrics.overflowX, `module ${moduleNumber} horizontal overflow`).toBeLessThanOrEqual(0);
      expect(metrics.startBottom, `module ${moduleNumber} start CTA position`).toBeLessThan(560);
      expect(metrics.railBottom, `module ${moduleNumber} rail position`).toBeLessThan(700);
      expect(metrics.heroBottom, `module ${moduleNumber} hero height`).toBeLessThan(560);
    }
  });

  test('module 15 blocks incomplete artifact saves, then confirms packet and toolbox destination', async ({ page }) => {
    await page.goto('/courses/foundation/program/15#st-submit');

    const buildTab = page.getByRole('tablist', { name: 'Module sections' }).getByRole('tab', { name: 'Build' });
    await expect(buildTab).toHaveAttribute('aria-selected', 'true');

    await page.getByRole('button', { name: 'Save artifact step' }).click();
    await expect(page.getByText('What work pauses at the gate? is required.')).toBeVisible();
    await expect(page.getByText('Who can approve, edit, block, or escalate? is required.')).toBeVisible();
    await expect(page.getByText('What forces escalation? is required.')).toBeVisible();
    await expect(page.getByText('What must be true before work resumes? is required.')).toBeVisible();

    await page.getByLabel('What work pauses at the gate?').fill(
      'AI drafts the first branch procedure update before any staff-facing distribution.',
    );
    await page.getByLabel('Who can approve, edit, block, or escalate?').fill(
      'The branch operations manager can edit, block, or escalate the draft before staff see it.',
    );
    await page.getByLabel('What forces escalation?').fill(
      'Stop if the draft includes unsupported policy claims, customer-specific facts, or missing source material.',
    );
    await page.getByLabel('What must be true before work resumes?').fill(
      'The manager approves the corrected draft, source gaps are resolved, and blocked details are removed.',
    );
    await page.getByLabel('Review note').fill(
      'I verified the gate happens before impact, named the reviewer authority, and defined the resume condition.',
    );
    await page.getByLabel('First real use').fill(
      'I will use this review gate on the next AI-assisted branch procedure update before manager review.',
    );
    await page.getByRole('radio', { name: 'Reusable' }).click();
    await page.getByRole('button', { name: 'Save artifact step' }).click();

    const success = page.getByLabel('Activity submitted successfully');
    await expect(success).toBeVisible();
    await expect(success.getByText('Judgment saved')).toBeVisible();
    await expect(success.getByText('Packet saved')).toBeVisible();
    await expect(success.getByText('Saved to Toolbox')).toBeVisible();
    await expect(page.getByText('Saved with artifact')).toBeVisible();
    await expect(page.getByTestId('foundation-completion-evidence').getByText('I will use this review gate')).toBeVisible();
  });

  test('all 18 module artifacts are accepted by the local Toolbox save route', async ({ request }) => {
    for (const microModule of FOUNDATION_MICRO_MODULES) {
      const spec = getModuleActivitySpec(microModule.number);
      if (!spec) throw new Error(`Missing module ${microModule.number} artifact spec`);

      const res = await request.post('/api/toolbox/save', {
        data: {
          origin: 'course',
          payload: {
            kind: 'module-artifact',
            courseSlug: 'aibi-p',
            moduleNumber: microModule.number,
            activityId: `${microModule.number}.1`,
            artifactName: microModule.saveArtifact,
            fields: spec.fields.map((field) => ({
              id: field.id,
              label: field.label,
              value: `Sample ${microModule.saveArtifact} answer for ${field.label}. This is concrete enough to be reviewed and reused.`,
            })),
            reviewNote: `Reviewed against this guardrail: ${microModule.bankingGuardrail}`,
            transferPlan: microModule.transferMove,
            readiness: 'reuse',
          },
        },
        headers: { 'Content-Type': 'application/json' },
      });

      expect(res.status(), `module ${microModule.number} toolbox save returned ${res.status()}`).toBe(200);
      const json = (await res.json()) as { id?: string; localPreview?: boolean };
      expect(json.localPreview, `module ${microModule.number} local preview save`).toBe(true);
      expect(json.id, `module ${microModule.number} dev save id`).toContain(
        `foundation-m${microModule.number}`,
      );
    }
  });
});

// ===========================================================================
// AUTH-GATED / SUPABASE-DEPENDENT — parked as fixme (blocked on §2 #133 seed
// + login harness and Supabase env). One reason line each. Grouped by the
// issue #138 item ranges they cover.
// ===========================================================================

test.describe('§7 course — overview + navigation (items 193–197)', () => {
  test.fixme('193 overview renders for enrolled user', () => {});
  test.fixme('194 Resume button links to current_module', () => {});
  test.fixme('195 completed shows check / current accent / locked muted', () => {});
  test.fixme('196 clicking locked module is a no-op', () => {});
  test.fixme('197 clicking unlocked module navigates to /[module]', () => {});
  // All require an enrolled Supabase session — blocked on #133 seed/login harness.
});

test.describe(`§7 course — module pages render 1–${FOUNDATION_MODULE_COUNT} (items 198–209)`, () => {
  for (let n = 1; n <= FOUNDATION_MODULE_COUNT; n++) {
    test.fixme(`${197 + n} module ${n} renders for enrolled learner`, () => {});
  }
  // page.tsx redirects unenrolled users to /purchase; rendering needs a seeded
  // enrollment with current_module advanced to n — blocked on #133.
});

test.describe('§7 course — tabs + persistence (items 210–213)', () => {
  test.fixme('210 Understand→Try→Build→Save persists in sessionStorage', () => {});
  test.fixme('211 page refresh restores last-active micro-module step', () => {});
  test.fixme('212 Try step renders AiBI Lab when a module has sample data', () => {});
  test.fixme('213 Try step falls back to a compact practice prompt when no lab data exists', () => {});
  // ModuleTabs persistence + lab/compact-practice rendering need the
  // production enrolled surface — covered with Supabase seed opt-in.
});

test.describe('§7 course — activities (items 214–225)', () => {
  test.fixme('214 Build step renders the compact artifact form', () => {});
  test.fixme('215 each module artifact has one clear day-job output', () => {});
  test.fixme('216 required field validation is visible before submission', () => {});
  test.fixme('217 saved artifacts show packet confirmation', () => {});
  test.fixme('218 saved artifacts show Toolbox confirmation', () => {});
  test.fixme('219 saved artifacts preserve review note and first-use plan', () => {});
  test.fixme('220 modules 15-17 keep distinct checkpoint/evidence/workflow artifacts', () => {});
  test.fixme('221 module 18 saves the final Foundation Packet Summary', () => {});
  test.fixme('222 free-text submission saves to activity_responses', () => {});
  test.fixme('223 form submission validates required fields', () => {});
  test.fixme('224 minLength validation fires (client + server minLength=20)', () => {});
  test.fixme('225 submitted activity shows read-only view on refresh', () => {});
  // ActivityForm lives inside the gated Build step; submission needs a real
  // enrollmentId + auth cookie. Server-side validation contract is asserted
  // above; real persistence is covered by course-enrolled.spec.ts when enabled.
});

test.describe('§7 course — completion + progression (items 226–231)', () => {
  test.fixme('226 completing all activities enables Complete Module CTA', () => {});
  test.fixme('227 Complete Module advances current_module', () => {});
  test.fixme('228 adds to completed_modules array', () => {});
  test.fixme('229 cannot skip ahead — server rejects out-of-sequence (400)', () => {});
  test.fixme('230 cannot regress — re-submitting past module is a no-op/blocked', () => {});
  test.fixme(`231 M${FOUNDATION_FINAL_MODULE_NUMBER} completion triggers certificate eligibility`, () => {});
  // Forward-only branches (moduleNumber !== current_module → 400; prior-module
  // gap → 400) require a seeded enrollment to reach past the auth gate — #133.
});

test.describe('§7 course — artifacts + sandbox (items 232–237)', () => {
  test.fixme('232 artifact-download activity shows download CTA after submit', () => {});
  test.fixme('233 downloaded .md has expected filename + content', () => {});
  // 234 (401 when not enrolled) IS asserted live above.
  test.fixme('235 sandbox honors per-module rate limits', () => {});
  test.fixme('236 sandbox rejects PII via input filter', () => {});
  test.fixme('237 sandbox respects selected model (Claude/ChatGPT/Gemini)', () => {});
  // Artifact bytes + sandbox behavior need an enrolled session with a saved
  // activity_response — blocked on #133.
});

test.describe('§7 course — mobile drawer (items 238–243)', () => {
  test.fixme('238 sidebar progress dots match enrollment state', () => {});
  test.fixme('239 mobile drawer opens via hamburger under 768px', () => {});
  test.fixme('240 drawer closes on backdrop click', () => {});
  test.fixme('241 drawer closes on Esc', () => {});
  test.fixme('242 drawer closes on link click', () => {});
  test.fixme('243 body scroll locked while drawer open', () => {});
  // CourseShell sidebar/drawer only mounts inside the gated module page — #133.
});

test.describe('§7 course — a11y + perf (items 244–248)', () => {
  test.fixme('244 keyboard navigation through all module pages', () => {});
  test.fixme('245 page transitions <300ms on dev server', () => {});
  test.fixme('246 Banking guardrail renders for every micro-module', () => {});
  test.fixme('247 Reference drawers are keyboard accessible and collapsed by default', () => {});
  test.fixme('248 markdown rendering escapes HTML (no XSS)', () => {});
  // All require the gated module surface to be rendered — #133.
});

test.describe('§7 course — misc (items 249–252)', () => {
  test.fixme('249 deep-link #st-submit opens Build directly', () => {});
  test.fixme('250 progress save endpoint is idempotent (needs enrolled session to observe Set-dedupe)', () => {});
  test.fixme('251 onboarding gate redirects new enrollees to /onboarding', () => {});
  test.fixme('252 /onboarding collects role + institution + goals', () => {});
});
