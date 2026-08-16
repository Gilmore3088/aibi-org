import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'node:crypto';
import {
  DIMENSION_LABELS,
  type Dimension,
} from '@content/assessments/v3/types';
import { questions as v3Questions } from '@content/assessments/v3/questions';

// Helpers for driving the free 12-question v3 assessment from e2e tests.
//
// Why these exist (and why the selectors are safe):
//   - The take page renders four `.mk-take-q-option` buttons in ASCENDING
//     points order — verified in content/assessments/v3/questions.ts (option
//     index 0 == 1 point,
//     index 3 == 4 points). So clicking radios.nth(i) reliably scores
//     (i + 1) points regardless of WHICH questions the random rotation
//     picked. This is the load-bearing fact behind every score-band test.
//   - The hook auto-advances on click (no Continue button) and transitions
//     to the score/email-gate phase once 12 answers are recorded.
//   - The question eyebrow surfaces the human dimension label, which we map
//     back to its key for weakest-dimension / starter-artifact tests.

export const QUESTION_COUNT = 12;

/** All twelve v3 dimension keys, in the order getDimensionScores fills them. */
export const DIMENSION_KEYS = Object.keys(DIMENSION_LABELS) as Dimension[];

/**
 * Read the dimension key the current question card is tagged with.
 */
export async function currentDimension(page: Page): Promise<Dimension> {
  const options = page.locator('.mk-take-q-option');
  await options.first().waitFor({ state: 'visible', timeout: 5_000 });
  const label = (await page.locator('.mk-take-q-prompt .mk-k').innerText()).trim();
  const match = DIMENSION_KEYS.find(
    (key) => DIMENSION_LABELS[key].toLocaleLowerCase() === label.toLocaleLowerCase(),
  );
  if (!match) {
    throw new Error(
      `Could not map question dimension label: ${label}`,
    );
  }
  return match;
}

/**
 * Answer the current question by clicking the option at `optionIndex`
 * (0-based; 0 = 1 point … 3 = 4 points), then wait for the next card to
 * mount.
 */
export async function answerCurrent(page: Page, optionIndex: number): Promise<void> {
  const options = page.locator('.mk-take-q-option');
  await options.first().waitFor({ state: 'visible', timeout: 5_000 });
  await options.nth(optionIndex).click();
  // The next question remounts; give React a beat (matches the cadence
  // the existing suite uses for auto-advance).
  await page.waitForTimeout(150);
}

/**
 * Answer all 12 questions with the same option index. Returns the resulting
 * total score so callers can assert the band they intended to land in.
 *   index 0 → 12 (all 1s)   · index 1 → 24 (all 2s)
 *   index 2 → 36 (all 3s)   · index 3 → 48 (all 4s)
 */
export async function answerAllUniform(page: Page, optionIndex: number): Promise<number> {
  for (let i = 0; i < QUESTION_COUNT; i++) {
    await answerCurrent(page, optionIndex);
  }
  return QUESTION_COUNT * (optionIndex + 1);
}

/**
 * Answer all 12 questions strong (4 points) EXCEPT every question whose
 * dimension matches the first question's dimension, which gets the weakest
 * answer (1 point). This guarantees a single, predictable lowest-scoring
 * dimension for the weakest-dimension / starter-artifact assertions.
 *
 * Returns the dimension key that was driven to the floor.
 */
export async function answerWithOneWeakDimension(page: Page): Promise<Dimension> {
  const weakDimension = await currentDimension(page);
  for (let i = 0; i < QUESTION_COUNT; i++) {
    const dim = await currentDimension(page);
    await answerCurrent(page, dim === weakDimension ? 0 : 3);
  }
  return weakDimension;
}

/**
 * Fill and submit the post-Q12 email gate with a NON-free-email work address
 * (so the institution-name soft-gate does not block submit), then wait for
 * the inline report to render.
 */
export async function submitEmailGate(
  page: Page,
  email = 'e2e@examplebank.test',
): Promise<void> {
  // These tests assert the client-side gate and inline report transition, not
  // live lead capture. Intercept the request so a normal E2E run cannot create
  // Supabase users/leads or contact MailerLite/Resend through a locally loaded
  // production configuration.
  await page.route('**/api/capture-email', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        profileId: null,
        mailerliteTagAdded: false,
        magicLinkUrl: null,
      }),
    });
  });

  const field = page.getByRole('textbox', { name: /email/i }).first();
  await expect(field).toBeVisible({ timeout: 10_000 });
  await field.fill(email);
  await page.getByRole('button', { name: /send my report/i }).click();
  await expect(page.getByTestId('readiness-result-hero')).toBeVisible({ timeout: 15_000 });
}

/**
 * Install a recorder for Vercel Web Analytics events BEFORE any app script
 * runs. `track()` from @vercel/analytics calls `window.va('event', { name,
 * data })`; `initQueue()` only assigns `window.va` if it's falsy, so a
 * pre-installed stub wins. Events land on `window.__vaEvents`.
 *
 * Mirrors the deferred-queue analytics pattern documented in CLAUDE.md
 * (described there for Plausible; the live code uses @vercel/analytics, so
 * we intercept the actual dispatch surface rather than window.plausible).
 */
export async function installAnalyticsRecorder(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as {
      va?: (...args: unknown[]) => void;
      __vaEvents?: Array<{ name: string; data?: Record<string, unknown> }>;
    };
    w.__vaEvents = [];
    const recorder = (...args: unknown[]) => {
      const [kind, payload] = args as [
        string,
        { name?: string; data?: Record<string, unknown> } | undefined,
      ];
      if (kind === 'event' && payload?.name) {
        w.__vaEvents!.push({ name: payload.name, data: payload.data });
      }
    };
    // Vercel Analytics may assign its own queue function after hydration.
    // Keep the recorder installed for the duration of the test instead of
    // allowing that assignment to replace the observation point.
    Object.defineProperty(window, 'va', {
      configurable: true,
      get: () => recorder,
      set: () => undefined,
    });
  });
}

/** Read the analytics events recorded by installAnalyticsRecorder. */
export async function readAnalyticsEvents(
  page: Page,
): Promise<Array<{ name: string; data?: Record<string, unknown> }>> {
  return page.evaluate(() => {
    const w = window as unknown as {
      __vaEvents?: Array<{ name: string; data?: Record<string, unknown> }>;
    };
    return w.__vaEvents ?? [];
  });
}

/** Human-readable label for a dimension key, as the report renders it. */
export function dimensionLabel(dim: Dimension): string {
  return DIMENSION_LABELS[dim];
}

// ---------------------------------------------------------------------------
// Cross-device resume round-trip helpers.
//
// These exercise the REAL assessment_drafts table (migrations 00054/00058)
// via the service-role client, so an e2e test can write a draft, learn its
// resume token, and reopen it on a "second device" (a fresh browser context).
// They mirror src/lib/assessment/drafts.ts token derivation exactly so the
// committed GET /api/assessment/drafts/[token] route resolves the same hash.
// ---------------------------------------------------------------------------

/** True when a real Supabase project is wired in and writes are acknowledged. */
export function isSupabaseConfiguredForE2E(): boolean {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(
    url &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.E2E_ALLOW_PRODUCTION_SUPABASE === 'true',
  );
}

function draftServiceRoleClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error(
      'Assessment draft helpers require SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY. ' +
        'Set them in .env.local before running the resume round-trip test.',
    );
  }
  if (process.env.E2E_ALLOW_PRODUCTION_SUPABASE !== 'true') {
    throw new Error(
      'Assessment draft seeding requires E2E_ALLOW_PRODUCTION_SUPABASE=true. ' +
        'This acknowledges that the test writes temporary rows to the real Supabase project.',
    );
  }
  return createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** The first 12 v3 question ids — a valid, deterministic resume question set. */
export function sampleResumeQuestionIds(): string[] {
  return v3Questions.slice(0, 12).map((question) => question.id);
}

/** Mirror of createAssessmentResumeToken in src/lib/assessment/drafts.ts. */
function createResumeToken(): string {
  return randomBytes(32).toString('base64url');
}

/** Mirror of hashAssessmentResumeToken in src/lib/assessment/drafts.ts. */
function hashResumeToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export interface SeededAssessmentDraft {
  readonly id: string;
  readonly token: string;
  readonly email: string;
  readonly answers: readonly number[];
  readonly currentQuestion: number;
  readonly selectedQuestionIds: readonly string[];
}

/**
 * Insert an assessment_drafts row directly and return the plaintext resume
 * token (only its sha256 hash is persisted, so the test must capture it here).
 * Defaults model an abandon mid-flow: 5 answered, currently on question 6.
 */
export async function seedAssessmentDraft(
  overrides: {
    email?: string;
    answers?: readonly number[];
    currentQuestion?: number;
    selectedQuestionIds?: readonly string[];
    lastSentAt?: string | null;
  } = {},
): Promise<SeededAssessmentDraft> {
  const supabase = draftServiceRoleClient();
  const token = createResumeToken();
  const email = overrides.email ?? `e2e+${randomBytes(4).toString('hex')}@aibankinginstitute.test`;
  const selectedQuestionIds = overrides.selectedQuestionIds ?? sampleResumeQuestionIds();
  const answers = overrides.answers ?? [2, 3, 1, 4, 2];
  const currentQuestion = overrides.currentQuestion ?? answers.length;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('assessment_drafts')
    .insert({
      email,
      token_hash: hashResumeToken(token),
      selected_question_ids: [...selectedQuestionIds],
      answers: [...answers],
      current_question: currentQuestion,
      phase: 'questions',
      last_sent_at: overrides.lastSentAt ?? null,
      expires_at: expiresAt,
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`seedAssessmentDraft failed: ${error?.message ?? 'no row returned'}`);
  }

  return {
    id: (data as { id: string }).id,
    token,
    email,
    answers,
    currentQuestion,
    selectedQuestionIds,
  };
}

/** Delete a seeded draft row by id. Call from afterEach/afterAll cleanup. */
export async function cleanupAssessmentDraft(id: string): Promise<void> {
  const supabase = draftServiceRoleClient();
  await supabase.from('assessment_drafts').delete().eq('id', id);
}
