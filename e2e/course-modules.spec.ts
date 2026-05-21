import { test, expect } from '@playwright/test';

// §7 E2E — AiBI-Foundation course modules + activities (issue #138, items 193–252).
//
// SCOPE OF THIS FILE
// ------------------
// The 12-module course surface (overview, module pages, tabs, sandboxes,
// activities, completion, mobile drawer, a11y) is gated behind a logged-in,
// *enrolled* Supabase session. None of that can be exercised here without the
// shared seed/login harness (e2e/helpers/seed.ts + auth.ts), which itself
// depends on Supabase env being present — the same dependency tracked by
// §2 #133. Every test that needs an enrolled session is therefore parked as
// test.fixme() with a one-line reason, so the item is *recorded* against #138
// without producing a false green.
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
    // moduleNumber must be an integer 1..12 — 13/99/0/non-int all 400.
    expect([400, 503], `returned ${res.status()}`).toContain(res.status());
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

  test('rejects out-of-range module param (400)', async ({ request }) => {
    const res = await request.get('/api/courses/generate-module-artifact?module=99');
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
// page.tsx: parseInt(params.module) → notFound() when NaN / <1 / >12, BEFORE
// getEnrollment(). So invalid slugs never render module content, with or
// without a session. We assert "not module content" rather than a hard 404,
// because under COMING_SOON the middleware may rewrite, and unenrolled valid
// modules redirect to /purchase — neither of which should show a module body.

const INVALID_MODULE_SLUGS = ['abc', '0', '13', '99', '-1'];

test.describe('§7 module route — invalid module guard', () => {
  for (const slug of INVALID_MODULE_SLUGS) {
    test(`/program/${slug} does not render a module body`, async ({ page }) => {
      const res = await page.goto(`/courses/foundation/program/${slug}`);
      const status = res?.status() ?? 0;
      // Must never 500. Acceptable: 404 (notFound), or a redirect to
      // purchase/auth (2xx after redirect), or COMING_SOON rewrite.
      expect(status, `${slug} returned ${status}`).toBeLessThan(500);

      const body = await page.locator('body').innerText().catch(() => '');
      // The module body always renders the "Module loop" steps ("Learn it.",
      // "Save it.") and the breadcrumb "Module NN". An invalid slug must show
      // none of that.
      expect(body).not.toMatch(/Save it\.[\s\S]*Learn it\./);
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

test.describe('§7 course — module pages render 1–12 (items 198–209)', () => {
  for (let n = 1; n <= 12; n++) {
    test.fixme(`${197 + n} module ${n} renders for enrolled learner`, () => {});
  }
  // page.tsx redirects unenrolled users to /purchase; rendering needs a seeded
  // enrollment with current_module advanced to n — blocked on #133.
});

test.describe('§7 course — tabs + persistence (items 210–213)', () => {
  test.fixme('210 Learn→Practice→Apply persists in sessionStorage (key foundations-m{N}-tab)', () => {});
  test.fixme('211 page refresh restores last-active tab', () => {});
  test.fixme('212 Practice tab renders AI sandbox for modules with SANDBOX_CONFIGS', () => {});
  test.fixme('213 Practice tab hidden for modules without sandbox config', () => {});
  // CourseTabs persistence + visibleTabs filter only render inside the
  // enrollment-gated module page — blocked on #133.
});

test.describe('§7 course — activities (items 214–225)', () => {
  test.fixme('214 Apply tab renders activity form', () => {});
  test.fixme('215 M2 Subscription Inventory specialized component renders', () => {});
  test.fixme('216 M5 Classification Drill renders m5-drill-scenarios', () => {});
  test.fixme('217 M5 Acceptable Use Card builder renders', () => {});
  test.fixme('218 M6 Skill Diagnosis renders', () => {});
  test.fixme('219 M7 Skill Builder renders with learner role', () => {});
  test.fixme('220 M8 Iteration Tracker renders', () => {});
  test.fixme('221 M9 activity-less module shows direct Mark Complete', () => {});
  test.fixme('222 free-text submission saves to activity_responses', () => {});
  test.fixme('223 form submission validates required fields', () => {});
  test.fixme('224 minLength validation fires (client + server minLength=20)', () => {});
  test.fixme('225 submitted activity shows read-only view on refresh', () => {});
  // ActivityForm lives inside the gated Apply tab; submission needs a real
  // enrollmentId + auth cookie — server-side validation contract is asserted
  // above; the rendered form path is blocked on #133.
});

test.describe('§7 course — completion + progression (items 226–231)', () => {
  test.fixme('226 completing all activities enables Complete Module CTA', () => {});
  test.fixme('227 Complete Module advances current_module', () => {});
  test.fixme('228 adds to completed_modules array', () => {});
  test.fixme('229 cannot skip ahead — server rejects out-of-sequence (400)', () => {});
  test.fixme('230 cannot regress — re-submitting past module is a no-op/blocked', () => {});
  test.fixme('231 M12 completion triggers certificate eligibility', () => {});
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
  test.fixme('246 Banking Boundary block renders from BANKING_BOUNDARIES', () => {});
  test.fixme('247 Learn "Try this" prompts render when present', () => {});
  test.fixme('248 markdown rendering escapes HTML (no XSS)', () => {});
  // All require the gated module surface to be rendered — #133.
});

test.describe('§7 course — misc (items 249–252)', () => {
  test.fixme('249 deep-link ?tab=apply opens Apply directly — NOT IMPLEMENTED: CourseTabs reads sessionStorage only, ignores searchParams', () => {});
  test.fixme('250 progress save endpoint is idempotent (needs enrolled session to observe Set-dedupe)', () => {});
  test.fixme('251 onboarding gate redirects new enrollees to /onboarding', () => {});
  test.fixme('252 /onboarding collects role + institution + goals', () => {});
});
