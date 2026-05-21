import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import {
  DIMENSION_LABELS,
  type Dimension,
} from '@content/assessments/v2/types';

// Helpers for driving the free 12-question v2 assessment from e2e tests.
//
// Why these exist (and why the selectors are safe):
//   - Each QuestionCard renders its 4 options as role="radio" buttons in
//     ASCENDING points order — verified across all 48 questions in
//     content/assessments/v2/questions.ts (option index 0 == 1 point,
//     index 3 == 4 points). So clicking radios.nth(i) reliably scores
//     (i + 1) points regardless of WHICH questions the random rotation
//     picked. This is the load-bearing fact behind every score-band test.
//   - The hook auto-advances on click (no Continue button) and transitions
//     to the score/email-gate phase once 12 answers are recorded.
//   - The QuestionCard header surfaces the raw dimension key (e.g.
//     "current-ai-usage"), which we read to target a specific dimension's
//     score for the weakest-dimension / starter-artifact tests.

export const QUESTION_COUNT = 12;

/** All eight v2 dimension keys, in the order getDimensionScores fills them. */
export const DIMENSION_KEYS = Object.keys(DIMENSION_LABELS) as Dimension[];

/**
 * Read the dimension key the current question card is tagged with. The card
 * renders the raw key (e.g. "leadership-buy-in") in its editorial header.
 */
export async function currentDimension(page: Page): Promise<Dimension> {
  const radios = page.getByRole('radio');
  await radios.first().waitFor({ state: 'visible', timeout: 5_000 });
  const text = await page.locator('main').innerText();
  const match = DIMENSION_KEYS.find((k) => text.includes(k));
  if (!match) {
    throw new Error(
      `Could not read a known v2 dimension key from the question card. Saw:\n${text.slice(0, 400)}`,
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
  const radios = page.getByRole('radio');
  await radios.first().waitFor({ state: 'visible', timeout: 5_000 });
  await radios.nth(optionIndex).click();
  // The next radiogroup remounts; give React a beat (matches the cadence
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
  const field = page.getByRole('textbox', { name: /email/i }).first();
  await expect(field).toBeVisible({ timeout: 10_000 });
  await field.fill(email);
  await page.getByRole('button', { name: /show my full results/i }).click();
  // The report (ScoreRing) only mounts in the results phase, after the
  // capture-email round-trip resolves.
  await expect(
    page.getByRole('img', { name: /Your AI readiness score is \d+ out of \d+/i }),
  ).toBeVisible({ timeout: 15_000 });
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
    w.va = (...args: unknown[]) => {
      const [kind, payload] = args as [
        string,
        { name?: string; data?: Record<string, unknown> } | undefined,
      ];
      if (kind === 'event' && payload?.name) {
        w.__vaEvents!.push({ name: payload.name, data: payload.data });
      }
    };
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
