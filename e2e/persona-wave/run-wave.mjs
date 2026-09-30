#!/usr/bin/env node
// Persona wave: 100 synthetic buyers/learners walk the site on random,
// goal-weighted paths while Playwright records errors, dead ends,
// click-to-value, and value actually delivered (especially in the course).
//
//   node e2e/persona-wave/run-wave.mjs                 # all 100 personas
//   WAVE_ONLY=P001,P014 node e2e/persona-wave/run-wave.mjs
//   WAVE_LIMIT=10 WAVE_CONCURRENCY=2 node e2e/persona-wave/run-wave.mjs
//
// Env: WAVE_BASE_URL (default http://localhost:3000), WAVE_SEED, WAVE_OUT,
// WAVE_CONCURRENCY (default 4), WAVE_ONLY, WAVE_LIMIT, WAVE_CHROMIUM_PATH.
// See e2e/persona-wave/README.md for what the numbers mean.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright';
import { generatePersonas, makeRng, personaLabel } from './personas.mjs';
import { FEATURE_JOURNEYS } from './features.mjs';
import { COVERAGE_JOURNEYS } from './coverage.mjs';
import { writeReport } from './report.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.WAVE_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const SET = process.env.WAVE_SET ?? 'core';
const SEED = Number(process.env.WAVE_SEED ?? { features: 20261001, coverage: 20261002 }[SET] ?? 20260930);
const CONCURRENCY = Number(process.env.WAVE_CONCURRENCY ?? 4);
const STAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const OUT = process.env.WAVE_OUT ?? path.join(HERE, 'out', STAMP);
const SHOTS = path.join(OUT, 'shots');
const PERSONA_TIMEOUT_MS = Number(process.env.WAVE_PERSONA_TIMEOUT_MS ?? 30 * 60_000);
const SLOW_MS = Number(process.env.WAVE_SLOW_MS ?? 5_000);
const MAX_SHOTS_PER_PERSONA = 6;

// Value moments and how much each one is worth to the buyer. Weights drive
// the "value delivered" index; first occurrence drives click-to-value.
export const VALUE_WEIGHTS = {
  assessment_score: 3,
  email_captured: 1,
  report_download: 2,
  next_step_opened: 1,
  resource_download: 3,
  practice_output: 3,
  practice_sample_output: 1,
  inquiry_submitted: 3,
  checkout_reached: 2,
  roi_estimate: 1,
  pricing_understood: 1,
  verify_answer: 2,
  course_home: 0,
  module_content: 1,
  try_completed: 1,
  artifact_saved: 2,
  certificate_reached: 5,
};

// Wave-2 value ids default to 2 (a delivered outcome); pure reading counts 1.
export function valueWeight(id) {
  if (id in VALUE_WEIGHTS) return VALUE_WEIGHTS[id];
  return /_read$/.test(id) ? 1 : 2;
}

const ENV_HINTS = /not configured|temporarily unavailable|supabase|stripe is not|missing (api )?key|service unavailable|ERR_TUNNEL|ENOTFOUND|fetch failed/i;
const ERROR_PAGE = /(this page could not be found|page not found|^404$|application error|something went wrong|unhandled runtime error|internal server error)/i;
// Many marketing pages have no <main>; LayoutChrome wraps content in #main-content.
const ROOT = ':is(main, #main-content)';
const TAB_RE = /^0\d\s*(Understand|Try|Build|Save)/i;

class Abandon extends Error {
  constructor(reason, kind = 'behavior') {
    super(reason);
    this.kind = kind; // behavior | frustration | patience | crash
  }
}

function chromiumPath() {
  if (process.env.WAVE_CHROMIUM_PATH) return process.env.WAVE_CHROMIUM_PATH;
  return fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
}

function normPath(url) {
  try {
    const u = new URL(url, BASE);
    return u.pathname.replace(/\/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, '/:id');
  } catch {
    return url;
  }
}

function sameOrigin(url) {
  return url.startsWith(BASE);
}

// ─── Session: one persona's visit ────────────────────────────────────────────

class Session {
  constructor(persona, browser) {
    this.p = persona;
    this.rng = makeRng(persona.seed);
    this.browser = browser;
    this.t0 = Date.now();
    this.clicks = 0;
    this.directNavs = 0;
    this.timeline = [];
    this.errors = [];
    this.friction = [];
    this.values = [];
    this.pages = [];
    this.frustration = 0;
    this.shots = 0;
    this.outcome = null;
    this.course = {
      targetDepth: persona.courseDepth,
      modules: [],
      wordsRead: 0,
      artifactsBuilt: 0,
      artifactsSaved: 0,
      tryCompleted: 0,
      saveApiStatuses: {},
    };
    this.seenErrorKeys = new Set();
  }

  elapsed() {
    return Date.now() - this.t0;
  }

  log(action, note = '') {
    this.timeline.push({ ms: this.elapsed(), clicks: this.clicks, url: this.page ? normPath(this.page.url()) : '', action, note });
  }

  async open() {
    const device = this.p.device === 'mobile' ? devices['Pixel 7'] : devices['Desktop Chrome'];
    this.context = await this.browser.newContext({ ...device, acceptDownloads: true, baseURL: BASE });
    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(8_000);

    // External hosts are unreachable from the test sandbox. Stub Stripe so a
    // checkout redirect is observable; abort everything else quietly.
    await this.context.route(
      (url) => !url.href.startsWith(BASE),
      async (route) => {
        const url = route.request().url();
        if (/checkout\.stripe\.com|buy\.stripe\.com/.test(url)) {
          this.value('checkout_reached', 'redirected to Stripe');
          return route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body><main><h1>Stripe checkout (stub)</h1></main></body></html>' });
        }
        if (/calendly\.com/.test(url)) this.value('inquiry_submitted', 'opened Calendly');
        return route.abort();
      },
    );

    this.page.on('pageerror', (e) => this.recordError('js_exception', e.message.split('\n')[0], this.page.url()));
    this.page.on('console', (m) => {
      if (m.type() !== 'error') return;
      const text = m.text();
      if (/Failed to load resource|ERR_FAILED|net::/.test(text)) return; // duplicated by network capture
      this.recordError('console_error', text.slice(0, 240), this.page.url());
    });
    this.page.on('response', async (r) => {
      const url = r.url();
      if (!sameOrigin(url) || r.status() < 400) return;
      let body = '';
      try {
        body = (await r.text()).slice(0, 400);
      } catch {}
      const isDoc = r.request().resourceType() === 'document';
      this.recordError(isDoc ? 'page_http_error' : 'api_http_error', `${r.status()} ${r.request().method()} ${normPath(url)}`, url, body);
    });
  }

  recordError(type, message, url, body = '') {
    // No backend keys exist in the harness env, so any 5xx from an API route is
    // presumed environmental until reproduced on a configured preview.
    // 401/403 from the AiBI Lab: the dev enrollment bypass has no auth session.
    const env =
      ENV_HINTS.test(message) ||
      ENV_HINTS.test(body) ||
      (type === 'api_http_error' && /^5\d\d /.test(message)) ||
      (type === 'api_http_error' && /^40[13] POST \/api\/sandbox\/chat/.test(message));
    const key = `${type}|${message}`;
    const first = !this.seenErrorKeys.has(key);
    this.seenErrorKeys.add(key);
    this.errors.push({ type, message, path: normPath(url), env, body: body.slice(0, 200), ms: this.elapsed(), first });
  }

  value(id, detail = '') {
    this.values.push({ id, detail, clicks: this.clicks, ms: this.elapsed(), path: this.page ? normPath(this.page.url()) : '' });
    this.log('VALUE', `${id}${detail ? `: ${detail}` : ''}`);
  }

  hasValue(id) {
    return this.values.some((v) => v.id === id);
  }

  async screenshot(tag) {
    if (this.shots >= MAX_SHOTS_PER_PERSONA) return null;
    this.shots += 1;
    const file = `${this.p.id}-${String(this.shots).padStart(2, '0')}-${tag.replace(/[^a-z0-9]+/gi, '-').slice(0, 40)}.png`;
    try {
      await this.page.screenshot({ path: path.join(SHOTS, file), fullPage: false });
      return `shots/${file}`;
    } catch {
      return null;
    }
  }

  // severity: 1 = real dead end, 0.5 = friction, 0 = note only.
  async addFriction(kind, detail, severity = 1, { env = false } = {}) {
    const shot = severity > 0 ? await this.screenshot(kind) : null;
    this.friction.push({ kind, detail, severity, env, path: normPath(this.page.url()), ms: this.elapsed(), clicks: this.clicks, shot });
    this.log('FRICTION', `${kind}: ${detail}`);
    if (!env) this.frustration += severity;
    if (this.frustration > this.p.frustrationTolerance) {
      throw new Abandon(`frustrated after ${kind} (${detail})`, 'frustration');
    }
  }

  budget() {
    if (this.clicks > this.p.clickBudget) throw new Abandon('click budget exhausted', 'patience');
  }

  async settle() {
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30_000 }).catch(() => {});
    await this.page.waitForLoadState('networkidle', { timeout: 6_000 }).catch(() => {});
    // Client components hydrate after load; wait (bounded) for real content.
    await this.page
      .waitForFunction(() => {
        const el = document.querySelector('main, #main-content') || document.body;
        return (el.innerText || '').split(/\s+/).length > 20;
      }, null, { timeout: 8_000 })
      .catch(() => {});
  }

  async goto(p, why, { fallback = false } = {}) {
    const start = Date.now();
    let status = 0;
    try {
      const res = await this.page.goto(p, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      status = res?.status() ?? 0;
    } catch (e) {
      await this.addFriction('navigation_failed', `${p}: ${e.message.split('\n')[0]}`);
    }
    await this.settle();
    if (fallback) {
      this.directNavs += 1;
      await this.addFriction('no_click_path', `had to type URL ${p} (${why})`, 0.5);
    }
    this.log('GOTO', `${p} (${why})`);
    await this.inspect(Date.now() - start, status);
  }

  async clickQuiet(locator) {
    return locator.click({ trial: true, timeout: 2_500 }).then(() => true, () => false);
  }

  async click(locator, label) {
    this.budget();
    const before = this.page.url();
    const start = Date.now();
    await locator.scrollIntoViewIfNeeded({ timeout: 4_000 }).catch(() => {});
    const href = await locator.getAttribute('href', { timeout: 2_000 }).catch(() => null);
    try {
      await locator.click({ timeout: 6_000 });
      if (href && href.startsWith('/') && !href.startsWith('/#')) {
        const target = href.split('#')[0].split('?')[0];
        if (target && target !== new URL(before).pathname) {
          await this.page.waitForURL((u) => u.pathname === target, { timeout: 20_000 }).catch(() => {});
        }
      }
    } catch (e) {
      await this.page.keyboard.press('Escape').catch(() => {});
      await this.addFriction('unclickable', `${label}: ${e.message.split('\n')[0].slice(0, 120)}`, 0.5);
      return false;
    }
    this.clicks += 1;
    await this.page.waitForTimeout(250);
    await this.settle();
    this.log('CLICK', label);
    if (this.page.url() !== before) await this.inspect(Date.now() - start, 0);
    return true;
  }

  // Dead-end detection on the current page.
  async inspect(loadMs, status) {
    const facts = await this.page
      .evaluate(() => {
        const vis = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
        const main = document.querySelector('main, #main-content') || document.body;
        const hasMain = !!document.querySelector('main, [role="main"]');
        const heads = [...document.querySelectorAll('h1,h2')].filter(vis).map((h) => h.textContent.trim()).slice(0, 4);
        const here = location.pathname;
        const forward = [...main.querySelectorAll('a[href],button')]
          .filter(vis)
          .filter((el) => !el.closest('header, nav, footer'))
          .filter((el) => {
            if (el.tagName === 'BUTTON') return !el.disabled;
            const href = el.getAttribute('href') || '';
            return !href.startsWith('#') && !href.startsWith('mailto:') && href !== here;
          }).length;
        return {
          title: document.title,
          heads,
          words: (main.innerText || '').split(/\s+/).filter(Boolean).length,
          forward,
          overlay: !!document.querySelector('nextjs-portal'),
          hasMain,
          text: (main.innerText || '').slice(0, 3000),
        };
      })
      .catch(() => null);
    if (!facts) return;
    const p = normPath(this.page.url());
    this.pages.push({ path: p, title: facts.title, words: facts.words, forward: facts.forward, loadMs, status });
    if (!facts.hasMain && !this.noMainSeen?.has(p)) {
      (this.noMainSeen ??= new Set()).add(p);
      await this.addFriction('a11y_no_main_landmark', `${p} has no <main> landmark (skip link targets a div)`, 0);
    }
    if (loadMs > SLOW_MS) await this.addFriction('slow_page', `${p} took ${(loadMs / 1000).toFixed(1)}s`, 0.25);
    if (status >= 400 || facts.heads.some((h) => ERROR_PAGE.test(h))) {
      await this.addFriction('error_page', `${p} → ${status || ''} ${facts.heads[0] ?? ''}`.trim(), 1);
    } else if (/temporarily unavailable|not configured|service unavailable/i.test(facts.text)) {
      await this.addFriction('feature_unavailable', `${p} shows "temporarily unavailable"`, 0.5, { env: true });
    } else if (facts.words < 25) {
      await this.addFriction('near_empty_page', `${p} has ${facts.words} words`, 1);
    } else if (facts.forward === 0) {
      await this.addFriction('no_forward_path', `${p} has no link or button forward`, 1);
    }
  }

  // ── Locator helpers ──

  cta(re, scope = ROOT) {
    const chrome = scope === ROOT ? ':not(header *, nav *, footer *)' : '';
    return this.page
      .locator(`:is(${scope}) :is(a, button, [role=button], summary):visible${chrome}`)
      .filter({ hasText: re });
  }

  async clickCta(re, label, { scope = ROOT, required = true, severity = 1 } = {}) {
    const loc = this.cta(re, scope);
    if ((await loc.count()) === 0) {
      if (required) await this.addFriction('missing_cta', `${label} not found on ${normPath(this.page.url())}`, severity);
      return false;
    }
    // Duplicate CTAs are common (sticky bars, mobile copies); try the next one
    // if the first is covered.
    const n = Math.min(await loc.count(), 3);
    for (let i = 0; i < n; i += 1) {
      if (await this.clickQuiet(loc.nth(i))) return this.click(loc.nth(i), label);
    }
    return this.click(loc.first(), label);
  }

  // Navigate the way a visitor would: a visible link to the page, opening the
  // mobile menu if needed; typing the URL counts as friction.
  async navTo(href, label) {
    if (new URL(this.page.url()).pathname === href) return true;
    const link = () => this.page.locator(`:is(header, nav, ${ROOT}, footer) a[href="${href}"]:visible`);
    if (!(await link().count())) {
      const menu = this.page.locator('header :is(button, [role=button]):visible').filter({ hasText: /menu/i });
      if (await menu.count()) await this.click(menu.first(), 'open menu');
    }
    if (await link().count()) {
      await this.click(link().first(), label);
      if (new URL(this.page.url()).pathname === href) return true;
    }
    await this.goto(href, label, { fallback: true });
    return false;
  }

  async maybeWander() {
    if (!this.rng.chance(this.p.curiosity)) return;
    const links = this.page.locator('header a[href^="/"]:visible, ' + ROOT + ' a[href^="/"]:visible, footer a[href^="/"]:visible');
    const n = await links.count();
    if (!n) return;
    const pick = links.nth(this.rng.int(0, n - 1));
    const href = await pick.getAttribute('href').catch(() => '');
    if (!href || /logout|sign-?out|\/api\//.test(href)) return;
    const back = this.page.url();
    this.log('WANDER', href);
    await this.click(pick, `wander → ${href}`);
    if (this.rng.chance(0.6)) {
      await this.page.goBack({ timeout: 15_000 }).catch(() => {});
      await this.settle();
      if (this.page.url() !== back) await this.goto(normPath(back), 'return after wander');
    }
  }

  personaText(kind) {
    const r = this.p.role;
    const fi = this.p.fiType;
    const lines = {
      artifact: `Draft for ${r} at a ${fi}: use AI only for first drafts of internal notes; no customer data, human owner signs off.`,
      review: `Checked for customer PII, confirmed the human owner (${r}), and verified the decision boundary before saving.`,
      use: `I will use this next week in the ${this.p.track} team huddle before anyone opens an AI tool on real work.`,
      generic: `As a ${r} at a ${fi}, I would apply this to a routine internal task and have a peer review the output first.`,
    };
    return lines[kind] ?? lines.generic;
  }

  async close() {
    await this.context?.close().catch(() => {});
  }
}

// ─── Journeys ────────────────────────────────────────────────────────────────

async function freeAssessment(s, { thenInDepth = false } = {}) {
  if (!s.page.url().includes('/assessment/take')) {
    const ok = await s.clickCta(/get my readiness score|start free|start the free assessment|take the assessment|readiness score/i, 'start free assessment', { scope: `header, ${ROOT}`, required: false });
    if (!ok) await s.goto('/assessment/take', 'start assessment', { fallback: true });
  }
  let answered = 0;
  for (let i = 0; i < 16; i += 1) {
    const opts = s.page.locator(ROOT + ' button:visible').filter({ hasText: '→' });
    const n = await opts.count();
    if (!n) break;
    if (s.p.temperament === 'time-starved' && s.p.device === 'mobile' && i === 6 && s.rng.chance(0.35)) {
      throw new Abandon('bailed mid-assessment (persona behavior)', 'behavior');
    }
    const bias = Math.round(s.p.maturity * (n - 1) + (s.rng.next() - 0.5) * 1.6);
    const idx = Math.max(0, Math.min(n - 1, bias));
    if (!(await s.click(opts.nth(idx), `answer q${i + 1}`))) break;
    answered += 1;
    await s.page.waitForTimeout(300);
  }
  await s.page.waitForTimeout(800);
  const text = await s.page.locator(ROOT).first().innerText().catch(() => '');
  const score = text.match(/(\d{1,2})\s*\/\s*48/);
  if (score) s.value('assessment_score', `${score[1]}/48 after ${answered} answers`);
  else {
    await s.addFriction('no_result_after_assessment', `answered ${answered} questions, no score shown`, 1);
    return;
  }

  // Optional email capture for the full breakdown. Visitors who won't share
  // an email take the gate's "View your summary without email" exit.
  const email = s.page.locator(ROOT + ' input[type=email]:visible');
  if ((await email.count()) && !s.p.emailsForReport) {
    await s.clickCta(/view (your )?summary without email/i, 'skip email gate', { required: false });
  }
  if ((await email.count()) && s.p.emailsForReport) {
    await email.first().fill(`wave+${s.p.id.toLowerCase()}@aibankinginstitute.test`);
    const resp = s.page.waitForResponse((r) => /\/api\/(capture-email|assessment)/.test(r.url()), { timeout: 10_000 }).catch(() => null);
    const submit = email.first().locator('xpath=ancestor::form[1]').locator('button[type=submit], button:not([type])');
    if (await submit.count()) await s.click(submit.first(), 'submit email for report');
    else {
      await email.first().press('Enter').catch(() => {});
      s.clicks += 1;
    }
    const r = await resp;
    if (r && r.status() < 400) s.value('email_captured', `${r.status()}`);
    else if (r) await s.addFriction('email_capture_failed', `${r.status()} ${normPath(r.url())}`, 0.5, { env: r.status() >= 500 });
  }

  if (s.rng.chance(0.5)) {
    const dl = s.page.waitForEvent('download', { timeout: 15_000 }).catch(() => null);
    if (await s.clickCta(/download report|print report/i, 'download report', { scope: `header, ${ROOT}`, required: false })) {
      const d = await dl;
      if (d) s.value('report_download', d.suggestedFilename());
    }
  }

  await s.maybeWander();

  if (thenInDepth) {
    const ok = await s.clickCta(/90-day playbook|in-depth|get in-depth|full diagnostic/i, 'upgrade to In-Depth', { required: false });
    if (!ok) await s.goto('/assessment/in-depth', 'upgrade to In-Depth', { fallback: true });
    await buyCta(s, /buy|purchase|get (the )?in-depth|get my report|\$99|start in-depth|checkout/i, 'buy In-Depth $99', /\/api\/checkout\/in-depth|create-checkout/);
  } else if (await s.clickCta(/open role playbook|role playbook|get 90-day playbook|start here/i, 'open next step', { required: false })) {
    s.value('next_step_opened');
  }
}

// With SKIP_ENROLLMENT_GATE / preview bypass every visitor is "enrolled", so
// the purchase page forwards to the course. That is a test-env artifact.
async function bypassRedirected(s) {
  if (/\/courses\/foundation\/program\/\d+$/.test(new URL(s.page.url()).pathname)) {
    await s.addFriction('bypass_enrolled_redirect', 'purchase page forwarded to course (dev enrollment bypass) — Foundation checkout untestable here', 0.5, { env: true });
    return true;
  }
  return false;
}

async function buyCta(s, re, label, apiRe) {
  const resp = s.page.waitForResponse((r) => apiRe.test(r.url()), { timeout: 12_000 }).catch(() => null);
  if (!(await s.clickCta(re, label))) return;
  const r = await resp;
  await s.page.waitForTimeout(800);
  const url = s.page.url();
  if (s.hasValue('checkout_reached')) return;
  if (/\/auth\/|login|sign-?in/.test(url)) {
    await s.addFriction('checkout_requires_login', `${label} sent buyer to ${normPath(url)}`, 0.5);
  } else if (r && r.status() >= 400) {
    let body = '';
    try { body = (await r.text()).slice(0, 200); } catch {}
    await s.addFriction('checkout_failed', `${label}: ${r.status()} ${normPath(r.url())} ${body}`, 1, { env: r.status() >= 500 || ENV_HINTS.test(body) });
  } else if (await bypassRedirected(s)) {
    return;
  } else if (/checkout|purchase|buy/.test(url)) {
    // Intermediate page (institution picker, seat count, etc.) — try once more.
    if (await s.clickCta(/continue|checkout|pay|buy|purchase/i, `${label} (step 2)`, { required: false })) {
      await s.page.waitForTimeout(1_000);
    }
    if (await bypassRedirected(s)) return;
    if (!s.hasValue('checkout_reached')) await s.addFriction('checkout_not_reached', `${label}: stopped at ${normPath(s.page.url())}`, 0.5);
  } else if (!r) {
    await s.addFriction('checkout_no_response', `${label}: click did nothing observable`, 1);
  }
}

async function resourceHunter(s) {
  if (!s.page.url().includes('/resources')) await s.navTo('/resources', 'Resources nav');
  for (let round = 0; round < (s.rng.chance(0.4) ? 2 : 1); round += 1) {
    const cards = s.page.locator(ROOT + ' a[href^="/resources/"]:visible, ' + ROOT + ' a[href^="/playbooks/"]:visible, ' + ROOT + ' a[href^="/prompt-cards"]:visible');
    const n = await cards.count();
    if (!n) {
      await s.addFriction('no_resources_listed', 'resources page has no resource links', 1);
      return;
    }
    await s.click(cards.nth(s.rng.int(0, Math.min(n, 30) - 1)), 'open resource');
    const dl = s.page.waitForEvent('download', { timeout: 15_000 }).catch(() => null);
    const pdfResp = s.page.waitForResponse((r) => /\/api\/resources\/.+\/download|\.pdf($|\?)/.test(r.url()), { timeout: 15_000 }).catch(() => null);
    const clicked = await s.clickCta(/download|get (the )?(pdf|template|worksheet|word doc|checklist)|word doc|get it free|send it to me|email me/i, 'download resource', { required: false });
    if (!clicked) {
      // A readable on-page template is still value.
      const words = (await s.page.locator(ROOT).first().innerText().catch(() => '')).split(/\s+/).length;
      if (words > 300) s.value('resource_download', `read on page (${words} words)`);
      else await s.addFriction('no_download_path', 'resource page has no download CTA and little content', 1);
    } else {
      const email = s.page.locator(ROOT + ' input[type=email]:visible');
      if (await email.count()) {
        await email.first().fill(`wave+${s.p.id.toLowerCase()}@aibankinginstitute.test`);
        await email.first().press('Enter').catch(() => {});
        s.clicks += 1;
      }
      const [d, r] = await Promise.all([dl, pdfResp]);
      if (d) s.value('resource_download', d.suggestedFilename());
      else if (r && r.status() < 400) s.value('resource_download', normPath(r.url()));
      else if (r) await s.addFriction('download_failed', `${r.status()} ${normPath(r.url())}`, 1, { env: r.status() === 503 });
      else if (!s.hasValue('resource_download')) await s.addFriction('download_no_file', 'clicked download, no file or confirmation', 0.5);
    }
    await s.maybeWander();
    if (round === 0) await s.goto('/resources', 'back to library');
  }
}

async function practiceTinkerer(s) {
  await s.navTo('/practice', 'Practice nav');
  const choices = s.page.locator(`${ROOT} :is(button, [role=tab]):visible`).filter({ hasText: /scenario|example|sample|member|loan|complaint|policy|email/i });
  const n = await choices.count();
  if (n && s.rng.chance(0.6)) await s.click(choices.nth(s.rng.int(0, Math.min(n, 8) - 1)), 'pick scenario');
  const resp = s.page.waitForResponse((r) => /\/api\/(playground\/run|sandbox\/chat)/.test(r.url()), { timeout: 30_000 }).catch(() => null);
  if (!(await s.clickCta(/^run|run (it|prompt|scenario)|try it|compare/i, 'run practice prompt'))) return;
  const r = await resp;
  await s.page.waitForTimeout(1_500);
  const text = await s.page.locator(ROOT).first().innerText().catch(() => '');
  if (r && r.status() < 400) s.value('practice_output', `${r.status()}`);
  else if (/sample output|example output|sample response/i.test(text)) {
    s.value('practice_sample_output', r ? `${r.status()} → sample fallback` : 'sample');
  } else {
    await s.addFriction('practice_no_output', r ? `${r.status()} ${normPath(r.url())}` : 'no response to Run', 1, { env: !!r && r.status() >= 500 });
  }
}

async function fillForm(s, scope) {
  const fields = s.page.locator(`${scope} input:visible, ${scope} textarea:visible, ${scope} select:visible`);
  const n = await fields.count();
  for (let i = 0; i < n; i += 1) {
    const f = fields.nth(i);
    const tag = await f.evaluate((el) => el.tagName).catch(() => '');
    const type = (await f.getAttribute('type').catch(() => '')) || '';
    const name = `${(await f.getAttribute('name').catch(() => '')) || ''} ${(await f.getAttribute('placeholder').catch(() => '')) || ''}`.toLowerCase();
    try {
      if (tag === 'SELECT') {
        const opts = await f.locator('option').count();
        if (opts > 1) await f.selectOption({ index: 1 + s.rng.int(0, opts - 2) });
      } else if (type === 'file' || type === 'hidden') {
        continue;
      } else if (type === 'password') {
        await f.fill('WaveTest!2026-pass');
      } else if (type === 'checkbox' || type === 'radio') {
        // Consent boxes (terms, privacy) are always ticked; others sometimes.
        if (/terms|agree|consent|privacy/.test(name) || s.rng.chance(0.7)) await f.check();
      } else if (type === 'email' || name.includes('email')) {
        await f.fill(`wave+${s.p.id.toLowerCase()}@aibankinginstitute.test`);
      } else if (type === 'number' || name.includes('seat') || name.includes('size')) {
        await f.fill(String(s.rng.int(10, 60)));
      } else if (type === 'tel' || name.includes('phone')) {
        await f.fill('555-010-0199');
      } else if (tag === 'TEXTAREA') {
        await f.fill(s.personaText('generic'));
      } else if (['text', '', 'search'].includes(type)) {
        await f.fill(name.includes('name') && !name.includes('institution') ? `Wave ${s.p.id}` : `${s.p.fiType} (wave test)`);
      }
    } catch {}
  }
  return n;
}

async function institutionBuyer(s) {
  await s.navTo('/for-institutions', 'For Institutions nav');
  await s.maybeWander();
  let form = s.page.locator(ROOT + ' form:visible').filter({ has: s.page.locator('textarea, input[type=email]') });
  if (!(await form.count())) {
    if (!(await s.clickCta(/talk to us|contact|request|book|get a proposal|start a pilot|schedule/i, 'institution CTA', { required: false }))) {
      await s.addFriction('missing_cta', 'no contact/pilot CTA on institutions page', 1);
    }
    if (s.hasValue('inquiry_submitted')) return;
    form = s.page.locator(ROOT + ' form:visible');
  }
  if (!(await form.count())) {
    const text = await s.page.locator(ROOT).first().innerText().catch(() => '');
    if (/hello@|mailto|calendly/i.test(text)) s.value('inquiry_submitted', 'contact route shown (email/calendar)');
    else await s.addFriction('no_inquiry_form', `no form after institution CTA (${normPath(s.page.url())})`, 1);
    return;
  }
  await fillForm(s, `${ROOT} form:has(textarea, input[type=email])`);
  const resp = s.page.waitForResponse((r) => /\/api\/(inquiry|support|capture-email|checkout\/team)/.test(r.url()), { timeout: 12_000 }).catch(() => null);
  await s.clickCta(/send|submit|request|talk|book|continue/i, 'submit inquiry', { scope: `${ROOT} form:has(textarea, input[type=email])` });
  const r = await resp;
  if (r && r.status() < 400) s.value('inquiry_submitted', `${r.status()} ${normPath(r.url())}`);
  else if (r) await s.addFriction('inquiry_failed', `${r.status()} ${normPath(r.url())}`, 1, { env: r.status() >= 500 });
  else await s.addFriction('inquiry_no_response', 'form submit produced no request', 1);
}

async function pricingSkeptic(s) {
  await s.navTo('/pricing', 'Pricing nav');
  const text = await s.page.locator(ROOT).first().innerText().catch(() => '');
  if (/\$99/.test(text) && /\$295/.test(text)) s.value('pricing_understood', '$99 and $295 visible');
  else await s.addFriction('pricing_unclear', 'pricing page missing $99 or $295', 1);
  await s.goto('/', 'check ROI calculator');
  const range = s.page.locator(ROOT + ' input[type=range]:visible');
  if (await range.count()) {
    await range.first().focus().catch(() => {});
    for (let i = 0; i < 5; i += 1) await s.page.keyboard.press('ArrowRight').catch(() => {});
    s.clicks += 1;
    const t = await s.page.locator(ROOT).first().innerText().catch(() => '');
    if (/estimated annual value/i.test(t)) s.value('roi_estimate', (t.match(/\$[\d,]{5,}/) ?? [''])[0]);
  } else {
    await s.addFriction('roi_calculator_missing', 'no ROI sliders on home', 0.5);
  }
  await s.maybeWander();
  if (s.rng.chance(0.5)) {
    await s.goto('/pricing', 'decide');
    await buyCta(s, /foundation|\$295|buy|enroll|get started/i, 'pick Foundation from pricing', /create-checkout|checkout/);
  }
}

async function certVerifier(s) {
  if (!s.page.url().includes('/verify')) await s.navTo('/verify', 'Verify nav');
  const input = s.page.locator(ROOT + ' input:visible').first();
  if (!(await input.count())) {
    await s.addFriction('verify_no_input', 'verify page has no input', 1);
    return;
  }
  await input.fill(s.rng.chance(0.5) ? 'AIBIP-2026-0000' : 'not-a-real-id');
  s.clicks += 1;
  const before = await s.page.locator(ROOT).first().innerText().catch(() => '');
  if (!(await s.clickCta(/verify|check|look ?up|search/i, 'verify submit', { required: false }))) await s.page.keyboard.press('Enter');
  // The lookup page's own help text says "not found", so wait for the result
  // route rather than matching text.
  await s.page.waitForURL(/\/verify\/.+/, { timeout: 20_000 }).catch(() => {});
  await s.settle();
  const after = await s.page.locator(ROOT).first().innerText().catch(() => '');
  if (after !== before && /\/verify\/.+/.test(s.page.url()) && /not found|no certificate|invalid|valid|verified|could not find|unable/i.test(after)) s.value('verify_answer', 'clear result shown');
  else await s.addFriction('verify_no_answer', 'no clear verify result', 1);
}

async function explorer(s) {
  const steps = s.rng.int(8, 20);
  for (let i = 0; i < steps; i += 1) {
    const links = s.page.locator('a[href^="/"]:visible');
    const n = await links.count();
    if (!n) {
      await s.addFriction('no_forward_path', 'explorer found no links', 1);
      return;
    }
    const pick = links.nth(s.rng.int(0, n - 1));
    const href = await pick.getAttribute('href').catch(() => '');
    if (!href || /logout|sign-?out|\/api\//.test(href)) continue;
    await s.click(pick, `explore → ${href}`);
  }
}

async function courseShopper(s) {
  await s.navTo('/courses', 'Training nav');
  await s.maybeWander();
  const ok = await s.clickCta(/explore course|foundation|view course|see the course|enroll|buy|\$295/i, 'open Foundation offer', { required: false });
  if (!ok) await s.addFriction('missing_cta', 'no Foundation CTA on /courses', 1);
  if (!/purchase/.test(s.page.url())) {
    const went = await s.clickCta(/enroll|buy|purchase|get foundation|\$295|start (the )?course/i, 'go to purchase', { required: false });
    if (!went) await s.goto('/courses/foundation/program/purchase', 'find purchase page', { fallback: true });
  }
  if (await bypassRedirected(s)) return;
  await buyCta(s, /buy|purchase|enroll|checkout|\$295|get (started|foundation)|continue/i, 'buy Foundation $295', /create-checkout|checkout/);
}

// ── Course ──

async function tabClick(s, name) {
  const tab = s.page.locator(ROOT + ' button:visible, ' + ROOT + ' [role=tab]:visible').filter({ hasText: new RegExp(`^0\\d\\s*${name}`, 'i') });
  if (!(await tab.count())) {
    await s.addFriction('module_step_missing', `${name} step tab not found`, 0.5);
    return false;
  }
  return s.click(tab.first(), `${name} tab`);
}

async function mainWords(s) {
  return (await s.page.locator(ROOT).first().innerText().catch(() => '')).split(/\s+/).filter(Boolean).length;
}

async function progressOf(s) {
  const t = await s.page.locator(ROOT).first().innerText().catch(() => '');
  const m = t.match(/(\d+)\s*\/\s*(\d+)\s*(moves?|items?|sorted|checks?|steps?|tasks?|flags?|claims?|fields?|done|complete)/i);
  if (m) return { done: Number(m[1]), total: Number(m[2]), raw: m[0] };
  // "Task 3 of 8" counts the current task, so done = n - 1 until a summary shows.
  const t2 = t.match(/task\s+(\d+)\s+of\s+(\d+)/i);
  return t2 ? { done: Number(t2[1]) - 1, total: Number(t2[2]), raw: t2[0] } : null;
}

// Plays whatever interactive widget the step shows (sorters, drills, toggles,
// builders) the way a cooperative learner would, until its progress counter
// is full, nothing new is clickable, or the step budget runs out.
const FINISH_RE = /^(submit|reveal|finish|done|next|continue|check (my )?answers?|see results?|save to )\b|next task|next question/i;

async function interact(s, label, maxIter, { until } = {}) {
  const clicked = new Set();
  let failures = 0;
  let lastSig = '';
  for (let i = 0; i < maxIter; i += 1) {
    const prog = await progressOf(s);
    if (prog && prog.total > 0 && prog.done >= prog.total) break;
    if (until && (await until())) break;
    // New task/question on screen → the same labels are fair game again.
    const sig = `${prog?.raw ?? ''}|${(await s.page.locator(`${ROOT} h3:visible, ${ROOT} h4:visible`).first().innerText().catch(() => ''))}`;
    if (sig !== lastSig) clicked.clear();
    lastSig = sig;
    const ta = s.page.locator(ROOT + ' textarea:visible');
    const tn = await ta.count();
    let filledOne = false;
    for (let j = 0; j < tn; j += 1) {
      const el = ta.nth(j);
      if (!(await el.inputValue().catch(() => 'x'))) {
        await el.fill(s.personaText('generic')).catch(() => {});
        filledOne = true;
      }
    }
    const sel = s.page.locator(ROOT + ' select:visible');
    for (let j = 0; j < (await sel.count()); j += 1) {
      const opts = await sel.nth(j).locator('option').count();
      if (opts > 1) await sel.nth(j).selectOption({ index: s.rng.int(1, opts - 1) }).catch(() => {});
    }
    const buttons = s.page.locator(ROOT + ' button:visible:enabled');
    const n = await buttons.count();
    const candidates = [];
    for (let j = 0; j < n; j += 1) {
      const txt = ((await buttons.nth(j).innerText().catch(() => '')) || '').trim();
      if ((await buttons.nth(j).getAttribute('aria-pressed').catch(() => null)) === 'true') continue;
      if (!txt || TAB_RE.test(txt) || /menu|course overview|revise|ready|reusable|open lab|save artifact|save evidence|sign ?out|log ?out/i.test(txt)) continue;
      // Key by normalized label: many widgets are toggles whose label gains a
      // number/check mark when selected; a second click undoes progress.
      const key = txt.replace(/^[\s\d✓✔•.]+/, '').replace(/\s+/g, ' ').toLowerCase();
      if (clicked.has(key) && !FINISH_RE.test(txt)) continue;
      const toggle = (await buttons.nth(j).getAttribute('aria-pressed').catch(() => null)) === 'false';
      candidates.push({ j, txt, key, toggle });
    }
    if (!candidates.length) {
      if (!filledOne) break;
      continue;
    }
    const fresh = candidates.filter((c) => !clicked.has(c.key));
    const finisher = candidates.find((c) => FINISH_RE.test(c.txt));
    // Unselected toggles (e.g. the "four moves") are the widget's real task.
    const toggles = fresh.filter((c) => c.toggle);
    const pool = toggles.length ? toggles : fresh.length ? fresh : candidates;
    const c = finisher && !toggles.length && (!fresh.length || s.rng.chance(0.4)) ? finisher : pool[s.rng.int(0, pool.length - 1)];
    clicked.add(c.key);
    if (!(await s.click(buttons.nth(c.j), `${label}: ${c.txt.replace(/\s+/g, ' ').slice(0, 40)}`))) {
      failures += 1;
      if (failures >= 2) break;
    }
  }
  return progressOf(s);
}

// AiBI Lab (AIPracticeSandbox): predict → prompt → send → review. The model
// call needs provider keys, so a 5xx here is environmental.
async function doLab(s, mod) {
  const input = s.page.locator('textarea[aria-label="Message input"]:visible');
  if (!(await input.count())) return;
  mod.labAttempted = true;
  const chip = s.page.locator('[aria-label="Suggested prediction checks"] button:visible');
  if (await chip.count()) await s.click(chip.nth(s.rng.int(0, (await chip.count()) - 1)), 'lab: pick prediction');
  const predText = s.page.locator('textarea[placeholder^="Example: The output may"]:visible');
  if (await predText.count()) {
    if (!(await predText.first().inputValue().catch(() => ''))) await predText.first().fill('The output may add a fact not in the source.').catch(() => {});
    const savePred = s.cta(/^save prediction$/i);
    if (await savePred.count()) await s.click(savePred.first(), 'lab: save prediction');
  }
  if (!(await input.first().inputValue().catch(() => ''))) {
    await input.first().fill(`Using the sample data, draft a short internal note for a ${s.p.role}. Keep facts unchanged and put the action first.`).catch(() => {});
    s.clicks += 1;
  }
  const send = s.page.locator('button[aria-label="Send message"]:visible');
  if (!(await send.count()) || !(await send.first().isEnabled().catch(() => false))) {
    const why = (await s.page.locator('button[aria-label="Save a prediction before sending"]:visible').count()) ? 'send blocked: prediction not accepted' : 'send button unavailable';
    mod.labRun = 'blocked';
    await s.addFriction('lab_blocked', `module ${mod.number}: ${why}`, 0.5);
    return;
  }
  const resp = s.page.waitForResponse((r) => /\/api\/sandbox\/chat/.test(r.url()), { timeout: 45_000 }).catch(() => null);
  await s.click(send.first(), 'lab: send');
  const r = await resp;
  mod.labRun = r ? r.status() : 'none';
  if (r && r.status() < 400) {
    await s.page.waitForTimeout(2_000);
    s.value('practice_output', `module ${mod.number} lab`);
  } else {
    let body = '';
    if (r) try { body = (await r.text()).slice(0, 160); } catch {}
    const ui = (await s.page.locator(ROOT).first().innerText().catch(() => '')).match(/[^\n]*(unavailable|try again|error|limit|could not)[^\n]*/i)?.[0]?.slice(0, 120) ?? '';
    await s.addFriction('lab_run_failed', `module ${mod.number}: ${r ? r.status() : 'no response'} ${body}${ui ? ` — UI: "${ui}"` : ''}`, 0.5, {
      // 401/403: the dev enrollment bypass has no Supabase session to authenticate the lab call.
      env: !r || r.status() >= 500 || [401, 403].includes(r.status()) || ENV_HINTS.test(body),
    });
  }
}

async function doTry(s, mod) {
  if (!(await tabClick(s, 'Try'))) return;
  mod.tryWords = await mainWords(s);
  mod.tryWidget = (await progressOf(s))?.raw ?? 'no progress counter';
  // The micro-takeaway builder: select each move, then save the takeaway.
  const moves = s.page.locator('[aria-label="Takeaway moves"] button[aria-pressed="false"]:visible');
  for (let i = 0; i < 6 && (await moves.count()); i += 1) {
    if (!(await s.click(moves.first(), 'try: select move'))) break;
  }
  const saveTakeaway = s.page.locator(`${ROOT} button:visible:enabled`).filter({ hasText: /^save to /i });
  if (await saveTakeaway.count()) await s.click(saveTakeaway.first(), 'try: save takeaway');
  // Most learners also try the AiBI Lab at least some of the time.
  if (s.rng.chance(0.6)) await doLab(s, mod);
  let prog = await progressOf(s);
  if (!(prog && prog.total > 0 && prog.done >= prog.total)) prog = await interact(s, 'try', 30);
  const text = await s.page.locator(ROOT).first().innerText().catch(() => '');
  mod.tryProgress = prog ? `${prog.done}/${prog.total}` : null;
  mod.tryDone = prog ? prog.done >= prog.total : /great|correct|nice|well done|complete|you sorted|all set/i.test(text);
  if (mod.tryDone) {
    s.course.tryCompleted += 1;
    s.value('try_completed', `module ${mod.number}`);
  } else {
    await s.addFriction('try_not_completed', `module ${mod.number}: ${mod.tryWidget} ended at ${mod.tryProgress ?? 'unknown'}`, 0.25);
  }
}

async function doBuild(s, mod) {
  if (!(await tabClick(s, 'Build'))) return;
  const saveBtn = () => s.cta(/save artifact|save evidence|save (&|and) continue|save my prompt|save to (toolbox|packet)|^save$/i);
  if (!(await saveBtn().count())) {
    // Some Build steps open with a drill/builder before the evidence form.
    mod.buildWidget = (await progressOf(s))?.raw ?? 'pre-form widget';
    await interact(s, 'build', 60, { until: async () => (await saveBtn().count()) > 0 });
  }
  // Scored prompt workshop (module 3): a struggling learner takes the worked
  // starter and keeps running until solved or out of attempts, then saves.
  const runPrompt = s.cta(/^run the prompt$/i);
  for (let i = 0; i < 7 && (await runPrompt.count()) && !(await s.cta(/save my prompt/i).count()); i += 1) {
    const starter = s.cta(/use starter prompt/i);
    if (i === 0 && (await starter.count())) await s.click(starter.first(), 'use starter prompt');
    if (await runPrompt.first().isDisabled().catch(() => true)) break;
    await s.click(runPrompt.first(), 'run workshop prompt');
  }
  const savePrompt = s.cta(/save my prompt/i);
  if (await savePrompt.count()) {
    const r = s.page.waitForResponse((x) => /submit-activity/.test(x.url()), { timeout: 25_000 }).catch(() => null);
    await s.click(savePrompt.first(), 'save workshop prompt');
    const res = await r;
    mod.workshopSaved = res ? res.status() : 'none';
  }
  const fields = s.page.locator(ROOT + ' textarea:visible');
  const n = await fields.count();
  mod.buildFields = n;
  const kinds = ['artifact', 'review', 'use', 'generic', 'generic'];
  for (let i = 0; i < n; i += 1) {
    await fields.nth(i).fill(s.personaText(kinds[i] ?? 'generic')).catch(() => {});
    s.clicks += 1;
  }
  const readiness = s.page.locator(ROOT + ' button:visible').filter({ hasText: /^(revise|ready|reusable)$/i });
  if (await readiness.count()) await s.click(readiness.nth(s.rng.int(0, (await readiness.count()) - 1)), 'readiness call');
  // Prompt labs: write a prompt and run it against sample data.
  const run = s.cta(/^run the prompt|^run prompt|^run$/i);
  if (await run.count()) {
    const r2 = s.page.waitForResponse((r) => /\/api\/(sandbox|playground|courses|practice)/.test(r.url()) && r.request().method() === 'POST', { timeout: 30_000 }).catch(() => null);
    if (await s.click(run.first(), 'run lab prompt')) {
      const rr = await r2;
      mod.labRun = rr ? rr.status() : 'none';
      if (rr && rr.status() < 400) s.value('practice_output', `module ${mod.number} lab`);
      else if (rr) await s.addFriction('lab_run_failed', `module ${mod.number}: ${rr.status()} ${normPath(rr.url())}`, 0.5, { env: rr.status() >= 500 });
    }
  }
  const resp = s.page
    .waitForResponse((r) => /\/api\/(toolbox\/save|courses\/(save-progress|submit-activity|submit-work-product))/.test(r.url()) && r.request().method() !== 'GET', { timeout: 25_000 })
    .catch(() => null);
  const saved = await s.clickCta(/save artifact|save evidence|save (&|and) continue|save my prompt|save to (toolbox|packet)|^save$/i, 'save artifact', { required: false });
  if (!saved) {
    await s.addFriction('no_save_button', `module ${mod.number}: no save button in Build`, 1);
    return;
  }
  s.course.artifactsBuilt += 1;
  const r = await resp;
  await s.page.waitForTimeout(600);
  const text = await s.page.locator(ROOT).first().innerText().catch(() => '');
  const status = r ? r.status() : 'none';
  s.course.saveApiStatuses[status] = (s.course.saveApiStatuses[status] ?? 0) + 1;
  mod.saveStatus = status;
  // A visible "Artifact saved" also counts: under dev-server load the API
  // response can outlast the wait while the UI has already confirmed.
  if ((r && r.status() < 400) || (!r && /artifact saved/i.test(text))) {
    s.course.artifactsSaved += 1;
    mod.artifactSaved = true;
    s.value('artifact_saved', `module ${mod.number}`);
  } else {
    let body = '';
    if (r) try { body = (await r.text()).slice(0, 200); } catch {}
    const uiMsg = (text.match(/[^\n]*(could not|couldn't|failed|error|try again|sign in|not saved)[^\n]*/i) ?? [''])[0].slice(0, 120);
    mod.saveError = `${status} ${body} ${uiMsg}`.trim();
    const env = r ? r.status() >= 500 || r.status() === 401 || ENV_HINTS.test(body) : false;
    await s.addFriction('artifact_not_saved', `module ${mod.number}: ${status}${uiMsg ? ` — UI: "${uiMsg}"` : ' — no UI feedback'}`, r ? 0.5 : 1, { env });
  }
}

async function doSave(s, mod) {
  if (s.rng.chance(s.p.curiosity)) {
    await s.clickCta(/open lab/i, 'open lab', { required: false });
    if (!/\/courses\/foundation\/program\/\d+$/.test(new URL(s.page.url()).pathname)) {
      await s.page.goBack().catch(() => {});
      await s.settle();
    }
  }
  if (!(await tabClick(s, 'Save'))) return;
  const text = await s.page.locator(ROOT).first().innerText().catch(() => '');
  const item = text.match(/ITEM\s+(\d+)\s+OF\s+(\d+)/i);
  mod.packetItem = item ? `${item[1]}/${item[2]}` : null;
  mod.saveShowsSaved = /\bsaved\b/i.test(text);
}

async function goToModule(s, n) {
  const target = `/courses/foundation/program/${n}`;
  if (normPath(s.page.url()) === target) return;
  // Prefer an in-page "next module" link, the way a real learner moves on.
  const next = s.page.locator(`${ROOT} a[href="${target}"]:visible, a[href="${target}"]:visible`);
  if (await next.count()) {
    await s.click(next.first(), `go to module ${n}`);
    if (normPath(s.page.url()) === target) return;
  }
  const byText = s.page.locator(ROOT + ' a:visible, ' + ROOT + ' button:visible').filter({ hasText: /next module|continue to module|start module|next:/i });
  if (await byText.count()) {
    await s.click(byText.first(), `next-module CTA → ${n}`);
    if (normPath(s.page.url()) === target) return;
  }
  // No visible way forward. Count it once per learner (they learn the
  // workaround), then use the course menu drawer like a person would.
  if (n > 1) {
    await s.addFriction('no_next_module_link', `module ${n - 1} has no visible link to module ${n} (${s.p.device})`, s.learnedMenu ? 0 : 0.5);
    s.learnedMenu = true;
  }
  const menu = s.page.locator(':is(button, [role=button]):visible').filter({ hasText: /course menu|modules|^menu$/i });
  if (await menu.count()) {
    await s.click(menu.first(), 'open course menu');
    const inMenu = s.page.locator(`a[href="${target}"]:visible`);
    if (await inMenu.count()) {
      await s.click(inMenu.first(), `open module ${n} from course menu`);
      if (normPath(s.page.url()) === target) return;
    }
    await s.page.keyboard.press('Escape').catch(() => {});
  }
  const home = s.page.locator(ROOT + ' a:visible').filter({ hasText: /course overview/i });
  if (await home.count()) await s.click(home.first(), 'course overview');
  else await s.goto('/courses/foundation/program', 'back to course home');
  const fromHome = s.page.locator(`${ROOT} a[href="${target}"]:visible`);
  if (await fromHome.count()) await s.click(fromHome.first(), `open module ${n} from course home`);
  if (normPath(s.page.url()) !== target) await s.goto(target, `open module ${n}`, { fallback: true });
}

async function courseLearner(s) {
  if (!s.page.url().includes('/courses/foundation/program')) await s.goto('/courses/foundation/program', 'enrollment email link');
  const homeText = await s.page.locator(ROOT).first().innerText().catch(() => '');
  if (/module/i.test(homeText)) s.value('course_home');
  for (let n = 1; n <= s.p.courseDepth; n += 1) {
    await goToModule(s, n);
    const title = await s.page.title().catch(() => '');
    const mod = { number: n, title: title.split('|')[0].trim(), startMs: s.elapsed(), startClicks: s.clicks };
    s.course.modules.push(mod);
    mod.understandWords = await mainWords(s);
    s.course.wordsRead += mod.understandWords;
    if (mod.understandWords > 60) s.value('module_content', `module ${n}`);
    await doTry(s, mod);
    s.course.wordsRead += mod.tryWords ?? 0;
    await doBuild(s, mod);
    await doSave(s, mod);
    mod.ms = s.elapsed() - mod.startMs;
    mod.clicks = s.clicks - mod.startClicks;
    mod.completed = Boolean(mod.artifactSaved || (mod.tryDone && mod.buildFields));
    if (n === 1 || s.rng.chance(0.15)) await s.maybeWander();
  }
  if (s.p.courseDepth >= 18) {
    await s.goto('/courses/foundation/program', 'course home after module 18');
    // Completers should find the credential path from the course home.
    const ok = await s.clickCta(/submit final packet|view certificate|certificate|final packet|claim/i, 'certificate CTA', { required: false });
    if (!ok) await s.goto('/courses/foundation/program/certificate', 'find certificate', { fallback: true });
    const where = normPath(s.page.url());
    const t = await s.page.locator(ROOT).first().innerText().catch(() => '');
    if (/\/program\/(submit|certificate)$/.test(where) && /certificate|credential|packet|submit/i.test(t)) s.value('certificate_reached', where);
    else await s.addFriction('certificate_unreachable', `${where} says: ${t.slice(0, 120).replace(/\s+/g, ' ')}`, 1);
  }
  throw new Abandon(`stopped after module ${s.p.courseDepth} (planned depth)`, 'behavior');
}

// ── Wave 2: data-driven feature journeys (see features.mjs) ──

async function runSteps(s, steps) {
  for (const st of steps) {
    s.budget();
    if (st.enter) {
      if (normPath(s.page.url()) !== st.enter) await s.goto(st.enter, 'arrived from outside');
    } else if (st.go) {
      await s.navTo(st.go, `go ${st.go}`);
    } else if (st.read) {
      const words = (await s.page.locator(ROOT).first().innerText().catch(() => '')).split(/\s+/).filter(Boolean).length;
      if (words >= (st.min ?? 200)) s.value(st.read, `${words} words`);
      else await s.addFriction('thin_content', `${normPath(s.page.url())} has ${words} words (expected ${st.min ?? 200}+)`, 0.5);
    } else if (st.assess) {
      await assessPage(s);
    } else if (st.click && st.primary) {
      // The page's own first call to action, whatever it is called.
      const cta = s.page.locator(`${ROOT} :is(a[href]:not([href^="#"]):not([href^="mailto:"]), button):visible:not(header *, nav *, footer *)`);
      if (await cta.count()) {
        const ok = await s.click(cta.first(), st.label);
        if (ok) s.value('next_step_opened', normPath(s.page.url()));
      }
    } else if (st.click) {
      const ok = await s.clickCta(st.click, st.label, { required: !st.optional, severity: st.value ? 1 : 0.5 });
      if (ok && st.value) s.value(st.value, st.label);
    } else if (st.fill) {
      const scope = await firstVisible(s, st.fill);
      if (!scope) {
        await s.addFriction('form_missing', `no form for "${st.fill}" on ${normPath(s.page.url())}`, 1);
        continue;
      }
      const n = await fillForm(s, scope);
      s.clicks += Math.min(n, 6);
      s.log('FILL', `${n} fields`);
    } else if (st.submit) {
      await submitStep(s, st);
    } else if (st.download) {
      await downloadStep(s, st);
    } else if (st.answer) {
      await answerStep(s, st);
    } else if (st.chips) {
      const loc = s.page.locator(`${ROOT} ${st.chips}`).filter({ visible: true });
      const n = await loc.count();
      for (let i = 0; i < Math.min(st.n ?? 1, n); i += 1) {
        const el = loc.nth(s.rng.int(0, n - 1));
        const tag = await el.evaluate((e) => e.tagName).catch(() => '');
        if (tag === 'SELECT') {
          const opts = await el.locator('option').count();
          if (opts > 1) await el.selectOption({ index: s.rng.int(1, opts - 1) }).catch(() => {});
          s.clicks += 1;
        } else await s.click(el, 'toggle filter/option');
      }
    } else if (st.sliders) {
      const r = s.page.locator(`${ROOT} input[type=range]:visible`);
      const n = await r.count();
      if (!n) {
        await s.addFriction('control_missing', `no sliders on ${normPath(s.page.url())}`, 1);
        continue;
      }
      for (let i = 0; i < Math.min(st.sliders, n); i += 1) {
        await r.nth(i).focus().catch(() => {});
        for (let k = 0; k < s.rng.int(2, 6); k += 1) await s.page.keyboard.press(s.rng.chance(0.7) ? 'ArrowRight' : 'ArrowLeft').catch(() => {});
        s.clicks += 1;
      }
      const t = await s.page.locator(ROOT).first().innerText().catch(() => '');
      if (/\$[\d,]{4,}/.test(t)) s.value(st.value, (t.match(/\$[\d,]{4,}/) ?? [''])[0]);
      else await s.addFriction('no_estimate', 'sliders moved but no dollar estimate shown', 1);
    } else if (st.expectText) {
      await s.page.waitForTimeout(800);
      const t = await s.page.locator(ROOT).first().innerText().catch(() => '');
      if (st.expectText.test(t)) s.value(st.value, st.label);
      else await s.addFriction('no_feedback', `${st.label}: expected confirmation not shown`, 1);
    }
  }
}

// Wave 3: does this page give the visitor something? Real content, or a
// clear message (not found, sign in, unavailable, needs purchase) plus a way
// forward, both count. A message with nowhere to go, or a near-empty page,
// is a dead end.
const MESSAGE_RE = /not found|could not find|couldn.t find|unavailable|sign in|log in|expired|invalid|no longer|not available|check your (email|inbox)|purchase|enroll|access|link/i;
async function assessPage(s) {
  const facts = await s.page.evaluate(() => {
    const vis = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    const root = document.querySelector('main, [role="main"], #main-content') || document.body;
    const text = (root.innerText || '').trim();
    const forward = [...root.querySelectorAll('a[href], button')]
      .filter(vis)
      .filter((el) => !el.closest('header, nav, footer'))
      .filter((el) => el.tagName === 'BUTTON' ? !el.disabled : !/^(#|mailto:|tel:)/.test(el.getAttribute('href') || '')).length;
    return { words: text.split(/\s+/).filter(Boolean).length, text: text.slice(0, 1500), forward };
  });
  const where = normPath(s.page.url());
  const message = (facts.text.match(new RegExp(`[^\\n]*(${MESSAGE_RE.source})[^\\n]*`, 'i')) ?? [''])[0].slice(0, 120);
  if (facts.words >= 120 && facts.forward > 0) s.value('page_delivered', `${where} · ${facts.words} words`);
  else if (message && facts.forward > 0) s.value('graceful_message', `${where} · "${message}"`);
  else if (message) await s.addFriction('message_no_way_forward', `${where}: "${message}" with no link or button forward`, 1);
  else await s.addFriction('thin_page', `${where}: ${facts.words} words, ${facts.forward} ways forward`, 1);
}

async function firstVisible(s, selector) {
  for (const sel of selector.split(/,\s*(?![^()]*\))/)) {
    const loc = s.page.locator(`${ROOT} ${sel}`.replace(`${ROOT} main`, ROOT)).filter({ visible: true });
    if (await loc.count().catch(() => 0)) return `${ROOT} ${sel}`.replace(`${ROOT} main`, ROOT);
  }
  return null;
}

async function submitStep(s, st) {
  const scope = (st.scope && (await firstVisible(s, st.scope))) || ROOT;
  const btn = s.page.locator(`${scope} :is(button, [role=button], input[type=submit]):visible`).filter({ hasText: st.submit });
  if (!(await btn.count())) {
    await s.addFriction('missing_cta', `${st.label}: no "${st.submit.source}" button`, 1);
    return;
  }
  if (await btn.first().isDisabled().catch(() => false)) {
    await s.addFriction('submit_disabled', `${st.label}: button stayed disabled after filling the form`, 1);
    return;
  }
  const before = await s.page.locator(ROOT).first().innerText().catch(() => '');
  const resp = s.page.waitForResponse((r) => st.api.test(r.url()) && r.request().method() !== 'GET', { timeout: 15_000 }).catch(() => null);
  await s.click(btn.first(), st.label);
  const r = await resp;
  await s.page.waitForTimeout(900);
  const after = await s.page.locator(ROOT).first().innerText().catch(() => '');
  const newText = after.replace(before, '').slice(0, 400);
  const uiMsg = (after.match(/[^\n]*(sent|thank|check your|on its way|received|saved|logged|error|could not|couldn.t|try again|unavailable|not configured|invalid|required|please)[^\n]*/i) ?? [''])[0].slice(0, 140);
  if (r && r.status() < 400) {
    s.value(st.value, `${r.status()} ${normPath(r.url())}${uiMsg ? ` — "${uiMsg}"` : ''}`);
    if (!uiMsg && after === before) await s.addFriction('silent_success', `${st.label}: request succeeded but the page showed no confirmation`, 0.5);
  } else if (r) {
    let body = '';
    try { body = (await r.text()).slice(0, 160); } catch {}
    const env = r.status() >= 500 || r.status() === 401 || ENV_HINTS.test(body);
    if (st.uiOk && st.uiOk.test(after)) s.value(st.value, `handled: "${uiMsg}"`);
    await s.addFriction(`${st.value}_failed`, `${st.label}: ${r.status()} ${normPath(r.url())}${uiMsg ? ` — UI: "${uiMsg}"` : ' — no message shown'}`, uiMsg ? 0.5 : 1, { env });
  } else if (st.uiOk && st.uiOk.test(after)) {
    s.value(st.value, `UI: "${uiMsg}"`);
  } else if (after !== before && /required|please|invalid|enter a/i.test(newText + uiMsg)) {
    await s.addFriction('validation_blocked', `${st.label}: form rejected the input — "${uiMsg}"`, 0.5);
  } else {
    await s.addFriction('submit_no_response', `${st.label}: nothing happened${uiMsg ? ` ("${uiMsg}")` : ''}`, 1);
  }
}

async function downloadStep(s, st) {
  const dl = s.page.waitForEvent('download', { timeout: 15_000 }).catch(() => null);
  const fileResp = s.page.waitForResponse((r) => /\/download|\.pdf($|\?)|\.zip($|\?)|\.docx?($|\?)/.test(r.url()), { timeout: 15_000 }).catch(() => null);
  const popup = s.context.waitForEvent('page', { timeout: 6_000 }).catch(() => null);
  if (!(await s.clickCta(st.download, st.label, { required: true, severity: 1 }))) return;
  const email = s.page.locator(`${ROOT} input[type=email]:visible`);
  if (await email.count()) {
    await email.first().fill(`wave+${s.p.id.toLowerCase()}@aibankinginstitute.test`);
    await email.first().press('Enter').catch(() => {});
    s.clicks += 1;
    s.log('INFO', 'download behind email gate');
  }
  const [d, r, pop] = await Promise.all([dl, fileResp, popup]);
  // A failed download that navigates the tab leaves the visitor on raw JSON.
  if (normPath(s.page.url()).startsWith('/api/')) {
    const raw = (await s.page.locator('body').innerText().catch(() => '')).slice(0, 120);
    await s.addFriction('raw_error_page', `${st.label}: visitor left on ${normPath(s.page.url())} showing ${raw}`, 0.5);
    await s.page.goBack().catch(() => {});
    await s.settle();
  }
  if (d) s.value(st.value, d.suggestedFilename());
  else if (r && r.status() < 400) s.value(st.value, normPath(r.url()));
  else if (pop) {
    s.value(st.value, `opened ${normPath(pop.url())}`);
    await pop.close().catch(() => {});
  } else if (r) {
    await s.addFriction('download_failed', `${st.label}: ${r.status()} ${normPath(r.url())}`, 1, { env: r.status() >= 500 });
  } else {
    const t = await s.page.locator(ROOT).first().innerText().catch(() => '');
    if (/sent|check your|on its way|emailed/i.test(t)) s.value(st.value, 'emailed');
    else await s.addFriction('download_no_file', `${st.label}: no file, no email confirmation`, 1);
  }
}

async function answerStep(s, st) {
  let answered = 0;
  const skip = /menu|course overview|back|previous|^←|sign ?out|enroll|\$|^\d{2}/i;
  for (let i = 0; i < (st.max ?? 12); i += 1) {
    const next = st.next ? s.page.locator(`${ROOT} button:visible:enabled`).filter({ hasText: st.next }) : null;
    const opts = s.page.locator(`${ROOT} ${st.answer}:visible`).filter({ hasNotText: st.next ?? /^$/ });
    const n = await opts.count();
    const choices = [];
    for (let j = 0; j < Math.min(n, 30); j += 1) {
      const t = ((await opts.nth(j).innerText().catch(() => '')) || '').trim();
      if (t && !skip.test(t) && !(await opts.nth(j).isDisabled().catch(() => true))) choices.push(j);
    }
    if (!choices.length) break;
    if (!(await s.click(opts.nth(choices[s.rng.int(0, choices.length - 1)]), `answer ${i + 1}`))) break;
    answered += 1;
    if (st.stopEarly && answered >= (st.max ?? 3)) break;
    if (next && (await next.count())) await s.click(next.first(), 'next');
    // Stop once a result is on screen; otherwise we'd click "Retake".
    const now = await s.page.locator(ROOT).first().innerText().catch(() => '');
    if (/you scored|your score|\bscore\b[\s\S]{0,40}\d+%|results?\s*\n/i.test(now) && /retake|score/i.test(now)) break;
  }
  if (!st.value) return;
  const t = await s.page.locator(ROOT).first().innerText().catch(() => '');
  if (answered > 0 && /score|result|passed|complete|you scored|growth|\d+\s*\/\s*\d+|%/i.test(t)) s.value(st.value, `${answered} answers`);
  else await s.addFriction('quiz_no_result', `answered ${answered}, no result shown on ${normPath(s.page.url())}`, 1);
}

const JOURNEYS = {
  'free-assessment': (s) => freeAssessment(s),
  'assessment-to-indepth': (s) => freeAssessment(s, { thenInDepth: true }),
  'resource-hunter': resourceHunter,
  'practice-tinkerer': practiceTinkerer,
  'institution-buyer': institutionBuyer,
  'pricing-skeptic': pricingSkeptic,
  'cert-verifier': certVerifier,
  explorer,
  'course-shopper': courseShopper,
  'course-sampler': courseLearner,
  'course-quitter': courseLearner,
  'course-steady': courseLearner,
  'course-completer': courseLearner,
};

async function runPersona(persona, browser) {
  const s = new Session(persona, browser);
  try {
    await s.open();
    await s.goto(persona.entry, `landed from ${persona.source}`);
    await s.maybeWander();
    const journey = JOURNEYS[persona.journey] ?? ((sess) => runSteps(sess, (FEATURE_JOURNEYS[persona.journey] ?? COVERAGE_JOURNEYS[persona.journey])[persona.variant ?? 0]));
    let timer;
    await Promise.race([
      journey(s),
      new Promise((_, rej) => {
        timer = setTimeout(() => rej(new Abandon('persona timeout', 'crash')), PERSONA_TIMEOUT_MS);
      }),
    ]).finally(() => clearTimeout(timer));
    s.outcome = { kind: 'goal-finished', reason: 'journey completed' };
  } catch (e) {
    if (e instanceof Abandon) s.outcome = { kind: e.kind, reason: e.message };
    else {
      s.outcome = { kind: 'crash', reason: `harness: ${e.message.split('\n')[0].slice(0, 200)}` };
      await s.screenshot('harness-crash');
    }
  } finally {
    await s.close();
  }
  return summarize(s);
}

function summarize(s) {
  const first = s.values.find((v) => valueWeight(v.id) > 0);
  const valueIndex = s.values.reduce((sum, v) => sum + valueWeight(v.id), 0);
  const productFriction = s.friction.filter((f) => !f.env && f.severity > 0);
  const jsUnique = new Set(s.errors.filter((e) => e.type === 'js_exception').map((e) => e.message)).size;
  const apiProduct = new Set(s.errors.filter((e) => /http_error/.test(e.type) && !e.env).map((e) => e.message)).size;
  const deadEnds = productFriction.filter((f) => f.severity >= 1).length;
  const slow = s.friction.filter((f) => f.kind === 'slow_page').length;
  const experience = Math.max(0, Math.min(100, Math.round(100 - 18 * deadEnds - 6 * jsUnique - 3 * apiProduct - 3 * slow - 4 * s.directNavs - 2 * productFriction.filter((f) => f.severity < 1 && f.kind !== 'slow_page').length)));
  return {
    persona: s.p,
    label: personaLabel(s.p),
    outcome: s.outcome,
    durationMs: s.elapsed(),
    clicks: s.clicks,
    directNavs: s.directNavs,
    pagesVisited: s.pages.length,
    reachedValue: !!first,
    firstValue: first ?? null,
    valueIndex,
    values: s.values,
    experience,
    deadEnds,
    errors: s.errors,
    friction: s.friction,
    pages: s.pages,
    course: s.p.courseDepth ? s.course : null,
    timeline: s.timeline,
  };
}

async function main() {
  fs.mkdirSync(SHOTS, { recursive: true });
  let personas = generatePersonas(SEED, 100, SET);
  if (process.env.WAVE_ONLY) {
    const ids = new Set(process.env.WAVE_ONLY.split(',').map((x) => x.trim()));
    personas = personas.filter((p) => ids.has(p.id));
  }
  if (process.env.WAVE_LIMIT) personas = personas.slice(0, Number(process.env.WAVE_LIMIT));

  const health = await fetch(BASE).catch(() => null);
  if (!health) {
    console.error(`[wave] ${BASE} is not reachable. Start the app first (see README).`);
    process.exit(2);
  }

  // Warm every route once so dev-server compile time isn't billed to personas.
  if (process.env.WAVE_PREWARM !== 'false') {
    const warm = ['/', '/assessment', '/assessment/take', '/assessment/in-depth', '/resources', '/practice', '/pricing',
      '/for-institutions', '/courses', '/courses/foundation/program', '/courses/foundation/program/purchase',
      '/courses/foundation/program/certificate', '/verify', '/verify/AIBIP-2026-0000', '/about', '/security', '/faq', '/playbooks', '/prompt-cards',
      ...Array.from({ length: 18 }, (_, i) => `/courses/foundation/program/${i + 1}`)];
    for (const w of warm) await fetch(BASE + w).catch(() => null);
    console.log(`[wave] prewarmed ${warm.length} routes`);
  }

  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const results = [];
  let cursor = 0;
  const t0 = Date.now();
  async function worker() {
    while (cursor < personas.length) {
      const p = personas[cursor++];
      const r = await runPersona(p, browser);
      results.push(r);
      const fv = r.firstValue ? `value@${r.firstValue.clicks}c/${(r.firstValue.ms / 1000).toFixed(0)}s` : 'NO VALUE';
      console.log(`[wave] ${String(results.length).padStart(3)}/${personas.length} ${r.label} | ${p.journey} | ${fv} | exp ${r.experience} | ${r.outcome.kind}: ${r.outcome.reason}`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, personas.length) }, worker));
  await browser.close();

  results.sort((a, b) => a.persona.id.localeCompare(b.persona.id));
  const meta = { set: SET, base: BASE, seed: SEED, startedAt: new Date(t0).toISOString(), durationMs: Date.now() - t0, personas: results.length, concurrency: CONCURRENCY };
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify({ meta, results }, null, 1));
  const reportPath = writeReport(OUT, meta, results);
  console.log(`[wave] done in ${((Date.now() - t0) / 60000).toFixed(1)} min → ${reportPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
