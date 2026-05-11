# Assessment Briefing — On-Screen Reshape Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reshape the on-screen assessment briefing into a focused 5-minute first-read by cutting four sections (§3 / §8 / §9 trio / §10) and the print-related affordances, replacing the cut Next-Steps trio with a single tier-keyed closing CTA card.

**Architecture:** Pure UI refactor. No new routes, no DB changes, no API changes. Two files do real work (`ResultsViewV2.tsx` + `personalization.ts`); a third file (`ResultsView.tsx` V1) is left untouched even though it imports `PrintButton.tsx` — that V1 codepath is unrouted dead code today, but deleting `PrintButton.tsx` would break its compile. We narrow the scope to V2 only and keep both legacy files alive.

**Tech Stack:** Next.js 14 App Router · TypeScript strict · Tailwind CSS · Plausible Analytics (deferred-queue pattern per CLAUDE.md).

**Source spec:** `docs/superpowers/specs/2026-05-04-assessment-results-four-surfaces.md` (umbrella + Spec 1 detail).

**Out of scope (Specs 2–4):** PDF generation, email follow-up sequence, return-to URL. Each is a sibling stub spec awaiting its own brainstorm.

---

## Spec Deviations Flagged

The plan deviates from the spec's "File Changes Summary" in one place — the spec calls for **deleting** `src/app/assessment/_components/PrintButton.tsx`. Verification via `grep -rn "PrintButton" src` shows it is also imported by `src/app/assessment/_components/ResultsView.tsx` (V1, unrouted but type-checked dead code). Deleting `PrintButton.tsx` would break V1's compile. The plan therefore **keeps** `PrintButton.tsx` alive and only removes the V2 import + usage. Acceptance Criterion #1's "PrintButton invocation removed" still applies. A separate follow-up may delete the file once V1 itself is removed.

---

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `src/app/assessment/_components/ResultsViewV2.tsx` | The on-screen briefing render | Remove §3, §8, §9 trio, §10, PrintButton block, print-footer block. Add new tier-keyed closing CTA section. Update orient-line copy. Remove unused imports. Add Plausible click event. |
| `content/assessments/v2/personalization.ts` | Tier/dimension/persona content | Add `TIER_CLOSING_CTA`. Remove `TIER_INSIGHTS`, `FUTURE_VISION`, `RECOMMENDED_PATH_INTRO`, `FOOTER_CLOSE`. |
| `src/app/assessment/_components/PrintButton.tsx` | Browser-print trigger button | **Untouched** (V1 still imports it; V1 itself is dead but type-checked). |
| `src/app/assessment/_components/ResultsView.tsx` (V1) | Legacy results view | **Untouched** (out of scope). |
| `src/app/assessment/_components/StarterPrompt.tsx` | Starter prompt copy + Try in ChatGPT | **Untouched** (kept §6 still uses it). |
| `src/app/assessment/_components/StarterArtifactCard.tsx` | Printable artifact card inside §6 collapsed details | **Untouched**. |
| `src/app/assessment/_components/NewsletterCTA.tsx` | Bottom-of-page newsletter signup | **Untouched**. |
| `src/app/assessment/_components/ScoreRing.tsx` | Score ring SVG + animation | **Untouched**. |
| `src/app/globals.css` | Global styles incl. `@media print` (recently scope-fixed) | **Untouched**. |
| `src/app/assessment/page.tsx` | Assessment flow + email gate | **Untouched**. |

---

## Pre-Flight: Branch Setup

The repo uses git worktrees per `CLAUDE.md`. Create a feature worktree before starting any task.

- [ ] **Step 0.1: Create the feature worktree**

Run:
```bash
cd ~/Projects/TheAiBankingInstitute
git worktree add ../aibi-briefing-reshape -b feature/assessment-briefing-reshape main
ln -s ~/Projects/TheAiBankingInstitute/.env.local ../aibi-briefing-reshape/.env.local
cd ../aibi-briefing-reshape
npm install
```

Expected: worktree created, branch `feature/assessment-briefing-reshape` checked out, `npm install` completes without errors. All subsequent steps run from `~/Projects/aibi-briefing-reshape`.

- [ ] **Step 0.2: Confirm starting state is clean**

Run: `git status && git log -1 --oneline`
Expected: working tree clean, HEAD points at the latest `main` commit.

---

## Task 1: Add `TIER_CLOSING_CTA` to personalization.ts

**Why first:** The new section in Task 2 imports this constant. Adding the data first means Task 2 doesn't reference an undefined symbol mid-edit.

**Files:**
- Modify: `content/assessments/v2/personalization.ts` (append after the existing `FOOTER_CLOSE` export, around line 597)

- [ ] **Step 1.1: Append the `TIER_CLOSING_CTA` export**

Open `content/assessments/v2/personalization.ts`. After the existing `FOOTER_CLOSE` export (currently the last export in the file, ending around line 597), append:

```typescript

// ---------------------------------------------------------------------------
// Closing CTA — tier-keyed single-card replacement for the cut Next-Steps trio.
// One card renders at the bottom of the on-screen brief, varying content by
// tier. Drives /courses/aibi-p (Starting Point + Early Stage) or
// /for-institutions/advisory (Building Momentum + Ready to Scale).
// ---------------------------------------------------------------------------

export interface TierClosingCta {
  readonly eyebrow: string;
  readonly headline: string;
  readonly body: string;
  readonly ctaLabel: string;
  readonly ctaHref: string;
}

export const TIER_CLOSING_CTA: Record<Tier['id'], TierClosingCta> = {
  'starting-point': {
    eyebrow: 'Your next move',
    headline: 'Get your team trained on AI fundamentals.',
    body:
      'Skills come first. AiBI Foundations teaches working AI use to bankers in 12 short modules — your team can start this week.',
    ctaLabel: 'Enroll your team in AiBI Foundations',
    ctaHref: '/courses/aibi-p',
  },
  'early-stage': {
    eyebrow: 'Your next move',
    headline: 'Get your team trained on AI fundamentals.',
    body:
      'You have momentum. Lock it in with AiBI Foundations — your bankers learn the same patterns repeatable across the institution.',
    ctaLabel: 'Enroll your team in AiBI Foundations',
    ctaHref: '/courses/aibi-p',
  },
  'building-momentum': {
    eyebrow: 'Your next move',
    headline: 'Walk through these results with us.',
    body:
      "You're ready for a roadmap conversation, not a course. An Executive Briefing translates this report into a phased plan with leadership at the table.",
    ctaLabel: 'Request an Executive Briefing',
    ctaHref: '/for-institutions/advisory',
  },
  'ready-to-scale': {
    eyebrow: 'Your next move',
    headline: 'Talk to us about Leadership Advisory.',
    body:
      "You don't need foundations — you need ongoing AI judgment at the leadership level. Leadership Advisory is fractional CAIO work for institutions with internal momentum.",
    ctaLabel: 'Request a conversation',
    ctaHref: '/for-institutions/advisory',
  },
};
```

- [ ] **Step 1.2: Verify the new export typechecks against existing imports**

Run: `npx tsc --noEmit`
Expected: no errors. (The new constant references `Tier` which is already imported at the top of the file.)

- [ ] **Step 1.3: Commit**

```bash
git add content/assessments/v2/personalization.ts
git commit -m "feat(assessment): add TIER_CLOSING_CTA tier-keyed closing card content

Adds the four-tier mapping for Spec 1's single-card replacement of the
Next-Steps trio. Used by ResultsViewV2 in the next task.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-four-surfaces.md"
```

---

## Task 2: Replace §9 Next-Steps trio with new tier-keyed closing CTA card

**Why now:** Replaces the trio in a single edit (no flicker state where both render together or neither renders).

**Files:**
- Modify: `src/app/assessment/_components/ResultsViewV2.tsx` (the `<section>` block currently containing the `01 · Training`, `02 · Strategic planning`, `03 · Governance` `<article>` elements — appears under the `{/* SECTION 9 — Next Steps ... */}` comment)

- [ ] **Step 2.1: Add `TIER_CLOSING_CTA` to the import block**

Open `src/app/assessment/_components/ResultsViewV2.tsx`. In the multi-line import from `@content/assessments/v2/personalization` near the top of the file, add `TIER_CLOSING_CTA` to the named imports list:

Find:
```typescript
import {
  PERSONAS,
  BIG_INSIGHT,
  TIER_INSIGHTS,
  GAP_CONTENT,
  RECOMMENDATIONS,
  STARTER_PROMPTS,
  SEVEN_DAY_PLAN,
  FUTURE_VISION,
  RECOMMENDED_PATH_INTRO,
  FOOTER_CLOSE,
  FINANCIAL_IMPLICATIONS,
} from '@content/assessments/v2/personalization';
```

Replace with (only `TIER_CLOSING_CTA` is added in this step; the unused removals come in Task 8):
```typescript
import {
  PERSONAS,
  BIG_INSIGHT,
  TIER_INSIGHTS,
  GAP_CONTENT,
  RECOMMENDATIONS,
  STARTER_PROMPTS,
  SEVEN_DAY_PLAN,
  FUTURE_VISION,
  RECOMMENDED_PATH_INTRO,
  FOOTER_CLOSE,
  FINANCIAL_IMPLICATIONS,
  TIER_CLOSING_CTA,
} from '@content/assessments/v2/personalization';
```

- [ ] **Step 2.2: Replace the §9 trio markup with the new tier-keyed card**

In the same file, locate the section starting with the comment `{/* SECTION 9 — Next Steps (Training · Strategic Planning · Governance) */}` and ending with the matching `</section>` (this includes the `<SectionAnchor id="section-9" />`, the `<section aria-labelledby="section-9-heading">` opener, the eyebrow, the H2 referencing `RECOMMENDED_PATH_INTRO[tierId]`, the `<div className="grid gap-5 md:grid-cols-3">` containing three `<article>` elements, and the closing `</section>`).

Replace the entire block with:
```tsx
      {/* SECTION 9 — Closing CTA (tier-keyed, single card) */}
      <SectionAnchor id="section-9" />
      <section aria-labelledby="section-9-heading" className="space-y-6">
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
          {TIER_CLOSING_CTA[tierId].eyebrow}
        </p>
        <h2
          id="section-9-heading"
          className="font-serif text-3xl md:text-4xl leading-tight text-[color:var(--color-ink)]"
        >
          {TIER_CLOSING_CTA[tierId].headline}
        </h2>
        <article className="border-2 border-[color:var(--color-terra)] rounded-[3px] p-6 md:p-8 bg-[color:var(--color-linen)]">
          <p className="text-[15px] leading-[1.6] text-[color:var(--color-ink)]/85">
            {TIER_CLOSING_CTA[tierId].body}
          </p>
          <a
            href={TIER_CLOSING_CTA[tierId].ctaHref}
            data-print-hide="true"
            className="mt-6 inline-block px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
          >
            {TIER_CLOSING_CTA[tierId].ctaLabel}
          </a>
        </article>
      </section>
```

Note: the Plausible click event wires up in Task 9. This step ships the visual change first.

- [ ] **Step 2.3: Verify visually in dev**

Kill any zombie dev server and start a fresh one (per memory: zombie dev servers cause stale-cache CSS bugs that look like real bugs):
```bash
lsof -ti:3000 | xargs -r kill -9 ; rm -rf .next
npm run dev
```

Open `http://localhost:3000/assessment` in a browser. Complete the assessment with answers that produce a `building-momentum` tier (mid-range scores). Submit email. On the results page, scroll to the bottom — you should see a single card with eyebrow "Your next move", headline "Walk through these results with us.", and CTA "Request an Executive Briefing" (linking to `/for-institutions/advisory`). The Training/Strategic Planning/Governance trio should be gone.

- [ ] **Step 2.4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 2.5: Commit**

```bash
git add src/app/assessment/_components/ResultsViewV2.tsx
git commit -m "feat(assessment): replace Next-Steps trio with tier-keyed closing CTA

Section 9 was three competing cards (Training/Strategic Planning/
Governance). Per Spec 1, drops to a single card whose content varies by
tier — Starting Point + Early Stage push AiBI Foundations; Building Momentum and
Ready to Scale push the Briefing/Advisory route.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-four-surfaces.md"
```

---

## Task 3: Cut Section 10 (Footer Close)

**Files:**
- Modify: `src/app/assessment/_components/ResultsViewV2.tsx`

- [ ] **Step 3.1: Delete the §10 footer-close section**

Locate the comment `{/* SECTION 10 — Footer Close */}` and delete it together with its `<SectionAnchor id="section-10" />` and the entire following `<section className="border-t border-[color:var(--color-ink)]/15 pt-12 text-center print-avoid-break">` block (the `FOOTER_CLOSE.headline` + `FOOTER_CLOSE.body` paragraphs and the closing `</section>`).

After this delete, the file should flow directly from the closing `</section>` of Task 2's new closing CTA into the `{/* APPENDIX — full diagnostic + newsletter + PDF */}` comment.

- [ ] **Step 3.2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. (`FOOTER_CLOSE` is still imported and unused — that import is removed in Task 8.)

- [ ] **Step 3.3: Visual check**

Refresh the dev server tab. The "AI adoption is not a technology problem" close should be gone. The page now ends on the new closing CTA card → appendix → newsletter → print button (the print button comes off in Task 6).

- [ ] **Step 3.4: Commit**

```bash
git add src/app/assessment/_components/ResultsViewV2.tsx
git commit -m "refactor(assessment): remove Section 10 Footer Close from on-screen brief

Generic brand close was carrying advocacy duty that belongs on the PDF
(Spec 2). Cut from on-screen artifact.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-four-surfaces.md"
```

---

## Task 4: Cut Section 8 (Future Vision)

**Files:**
- Modify: `src/app/assessment/_components/ResultsViewV2.tsx`

- [ ] **Step 4.1: Delete the §8 Future Vision section**

Locate the comment `{/* SECTION 8 — Future Vision */}`. Delete it with its `<SectionAnchor id="section-8" />` and the entire `<section className="space-y-6 mb-20" aria-labelledby="section-8-heading">` block (the eyebrow "What good looks like", the H2 "A Practitioner-Ready institution.", and the `<ul>` rendering `FUTURE_VISION.map(...)`).

After this delete, the file should flow from the closing `</section>` of Section 7 (7-day plan) directly into the `{/* SECTION 9 — Closing CTA ... */}` comment from Task 2.

- [ ] **Step 4.2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. (`FUTURE_VISION` import becomes unused; cleaned in Task 8.)

- [ ] **Step 4.3: Visual check**

Refresh the dev server tab. The "A Practitioner-Ready institution" parch panel should be gone. The 7-day plan now flows directly into the new closing CTA card.

- [ ] **Step 4.4: Commit**

```bash
git add src/app/assessment/_components/ResultsViewV2.tsx
git commit -m "refactor(assessment): remove Section 8 Future Vision from on-screen brief

Aspirational bullets were not actionable this week. Move to PDF (Spec 2)
where advocacy framing earns the space.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-four-surfaces.md"
```

---

## Task 5: Cut Section 3 (What this means / In practice)

**Files:**
- Modify: `src/app/assessment/_components/ResultsViewV2.tsx`

- [ ] **Step 5.1: Delete the §3 What-this-means section**

Locate the comment `{/* SECTION 3 — What this means */}`. Delete it together with its `<SectionAnchor id="section-3" />` and the entire `<section className="space-y-8 mb-20" aria-labelledby="section-3-heading">` block (the eyebrow "What this means", the H2 "In practice:", and the `<ul>` rendering `insightBullets.map(...)`).

After this delete, the file should flow from §2b's closing `</section>` (the lensed-implications `dl`) directly into the `{/* SECTION 4 — Strengths vs Gaps */}` comment.

- [ ] **Step 5.2: Update §2b's ContinueLink target**

§2b currently ends with:
```tsx
        <ContinueLink to="section-3" label="What this means in practice" />
```

Change it to point at section-4 with appropriate label:
```tsx
        <ContinueLink to="section-4" label="Where you're strong vs exposed" />
```

- [ ] **Step 5.3: Remove the now-orphaned `insightBullets` local variable**

Find this line in the component body (near the top of `ResultsViewV2`):
```typescript
  const insightBullets = TIER_INSIGHTS[tierId];
```

Delete it. (`TIER_INSIGHTS` is still imported; cleaned in Task 8.)

- [ ] **Step 5.4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5.5: Visual check**

Refresh the dev server tab. After the lensed-implications operations/risk/cost rows, the next visible section is now Strengths and gaps. The "In practice:" section is gone. The Continue button under the implications now reads "Where you're strong vs exposed" and jumps to section-4.

- [ ] **Step 5.6: Commit**

```bash
git add src/app/assessment/_components/ResultsViewV2.tsx
git commit -m "refactor(assessment): collapse Section 3 into Section 2b

Section 3's tier-keyed behavioral bullets duplicated the lensed
implications dl rows in Section 2b for a 5-minute first read. Per Spec 1,
keep the dl rows (board-ready framing) and drop the bullets. Continue
link from 2b now jumps to Strengths/Gaps.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-four-surfaces.md"
```

---

## Task 6: Remove PrintButton block + print-footer block + import

**Note:** Per the deviation flag at the top, `PrintButton.tsx` itself stays alive — V1's `ResultsView.tsx` still imports it. This task removes only the V2 invocation and the print-footer block.

**Files:**
- Modify: `src/app/assessment/_components/ResultsViewV2.tsx`

- [ ] **Step 6.1: Remove the PrintButton wrapper div + caption**

Locate this block near the bottom of the JSX:
```tsx
      <div className="mt-12 text-center" data-print-hide="true">
        <PrintButton />
        <p className="font-mono text-[10px] text-[color:var(--color-slate)] mt-3">
          Save your results as a PDF using your browser&rsquo;s print dialog.
        </p>
      </div>
```

Delete the entire block (including the surrounding blank lines so we don't leave a vertical gap).

- [ ] **Step 6.2: Remove the `.print-footer` block**

Locate this block immediately after the deleted PrintButton block:
```tsx
      {/* Print-only footer */}
      <div className="print-footer">
        <p>
          <strong>The AI Banking Institute</strong> &middot; Turning Bankers
          into Builders
        </p>
        <p>
          Results generated for {email} &middot; Score: {score}/48 &middot;
          Tier: {tier.label}
        </p>
        <p>
          aibankinginstitute.com &middot; Request an Executive Briefing to
          discuss your results.
        </p>
      </div>
```

Delete the comment and the entire `<div className="print-footer">` block.

- [ ] **Step 6.3: Remove the PrintButton import**

At the top of the file, find:
```typescript
import { PrintButton } from './PrintButton';
```

Delete this line.

- [ ] **Step 6.4: Verify PrintButton.tsx still has its V1 consumer**

Run: `grep -rn "from './PrintButton'\|from '@/.*PrintButton'" src 2>/dev/null`
Expected output: exactly one match — `src/app/assessment/_components/ResultsView.tsx`. (If zero matches, file is now orphaned and could be deleted in a follow-up; if more than one match outside V1, investigate.)

- [ ] **Step 6.5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6.6: Visual check**

Refresh the dev server tab. The "Save your results as a PDF using your browser's print dialog" caption + the Print button are gone. The page now ends with: closing CTA card → full-diagnostic appendix → NewsletterCTA.

- [ ] **Step 6.7: Commit**

```bash
git add src/app/assessment/_components/ResultsViewV2.tsx
git commit -m "refactor(assessment): remove PrintButton + print-only footer from V2

Spec 1 stops treating the on-screen page as the printable artifact —
PDF generation lands in Spec 2. PrintButton.tsx is preserved (V1 still
imports it); only the V2 invocation and the print-only footer block
are removed here.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-four-surfaces.md"
```

---

## Task 7: Update header orient line copy

**Files:**
- Modify: `src/app/assessment/_components/ResultsViewV2.tsx`

- [ ] **Step 7.1: Trim the orient-line clause**

Locate this paragraph in the briefing `<header>`:
```tsx
        <p
          className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55"
          data-print-hide="true"
        >
          A 5-minute read · Save or print at the bottom
        </p>
```

Change the inner text to drop the second clause:
```tsx
        <p
          className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55"
          data-print-hide="true"
        >
          A 5-minute read
        </p>
```

- [ ] **Step 7.2: Visual check**

Refresh the dev server tab. The orient line under the headline now reads only "A 5-minute read" — the "Save or print at the bottom" clause is gone (consistent with the print affordance being removed in Task 6).

- [ ] **Step 7.3: Commit**

```bash
git add src/app/assessment/_components/ResultsViewV2.tsx
git commit -m "copy(assessment): trim orient-line clause now that print is gone

\"A 5-minute read · Save or print at the bottom\" promised an affordance
that no longer exists. Drop the second clause.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-four-surfaces.md"
```

---

## Task 8: Clean unused imports in ResultsViewV2.tsx

**Files:**
- Modify: `src/app/assessment/_components/ResultsViewV2.tsx`

- [ ] **Step 8.1: Remove `TIER_INSIGHTS`, `FUTURE_VISION`, `RECOMMENDED_PATH_INTRO`, `FOOTER_CLOSE` from the personalization import**

In the multi-line import block at the top, find:
```typescript
import {
  PERSONAS,
  BIG_INSIGHT,
  TIER_INSIGHTS,
  GAP_CONTENT,
  RECOMMENDATIONS,
  STARTER_PROMPTS,
  SEVEN_DAY_PLAN,
  FUTURE_VISION,
  RECOMMENDED_PATH_INTRO,
  FOOTER_CLOSE,
  FINANCIAL_IMPLICATIONS,
  TIER_CLOSING_CTA,
} from '@content/assessments/v2/personalization';
```

Replace with the cleaned-up form:
```typescript
import {
  PERSONAS,
  BIG_INSIGHT,
  GAP_CONTENT,
  RECOMMENDATIONS,
  STARTER_PROMPTS,
  SEVEN_DAY_PLAN,
  FINANCIAL_IMPLICATIONS,
  TIER_CLOSING_CTA,
} from '@content/assessments/v2/personalization';
```

- [ ] **Step 8.2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. If errors mention any of the removed names, that means there's still a usage somewhere — search the file (`grep -n`) for the named import and remove the orphaned reference. (There should be none after Tasks 3–5.)

- [ ] **Step 8.3: Build check (catch any leftover dead-code paths)**

Run: `npm run build`
Expected: build succeeds with no warnings about unused imports or undefined identifiers in `ResultsViewV2.tsx`. If the build fails because of an unrelated route, note it but do not block on it — the V2 component itself must compile.

- [ ] **Step 8.4: Commit**

```bash
git add src/app/assessment/_components/ResultsViewV2.tsx
git commit -m "chore(assessment): drop unused imports after section cuts

TIER_INSIGHTS, FUTURE_VISION, RECOMMENDED_PATH_INTRO, FOOTER_CLOSE were
all referenced only by sections cut in Tasks 3–5. Remove from import
block. Constants themselves get deleted from personalization.ts in the
next task.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-four-surfaces.md"
```

---

## Task 9: Wire Plausible click analytics on the closing CTA

**Why:** Spec 1 risk-mitigation: tracks `closing_cta_click` with `{ tier, destination }` so we can flip the tier→href mapping after 30 days of data without guessing.

**Files:**
- Modify: `src/app/assessment/_components/ResultsViewV2.tsx`

- [ ] **Step 9.1: Add the click handler on the CTA anchor**

Locate the closing-CTA `<a>` from Task 2 and add an `onClick` handler that fires the Plausible event. The handler must use the deferred-queue pattern per `CLAUDE.md` (treat `window.plausible` as a queue function — never assume it's loaded).

Find:
```tsx
          <a
            href={TIER_CLOSING_CTA[tierId].ctaHref}
            data-print-hide="true"
            className="mt-6 inline-block px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
          >
            {TIER_CLOSING_CTA[tierId].ctaLabel}
          </a>
```

Replace with:
```tsx
          <a
            href={TIER_CLOSING_CTA[tierId].ctaHref}
            data-print-hide="true"
            onClick={() => {
              if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
                window.plausible('closing_cta_click', {
                  props: {
                    tier: tierId,
                    destination: TIER_CLOSING_CTA[tierId].ctaHref,
                  },
                });
              }
            }}
            className="mt-6 inline-block px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
          >
            {TIER_CLOSING_CTA[tierId].ctaLabel}
          </a>
```

(The `typeof window` and `typeof window.plausible === 'function'` guards are belt-and-braces. The deferred-queue init in `layout.tsx` makes `window.plausible` always be a function in browser, but the guards keep this safe under SSR or if init order changes.)

- [ ] **Step 9.2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. If TypeScript complains about `window.plausible` being unknown, the file already has access to a global type — check if `src/types/global.d.ts` (or similar) declares it; if not, the existing assessment code in this codebase already assumes `window.plausible` exists, so a `// @ts-expect-error — Plausible deferred queue, see CLAUDE.md` comment above the `window.plausible(...)` line is acceptable. (Use the comment only if the typecheck actually fails.)

- [ ] **Step 9.3: Manual analytics verification**

In dev mode, Plausible is not loaded (the script only loads in production per `CLAUDE.md`). Open DevTools console, click the CTA, and confirm: no console errors, navigation to the href happens normally. The `onClick` is a no-op in dev — production firing is verified separately after deploy.

- [ ] **Step 9.4: Commit**

```bash
git add src/app/assessment/_components/ResultsViewV2.tsx
git commit -m "feat(assessment): track closing_cta_click for tier-keyed CTA

Fires Plausible event with { tier, destination } props on click. Lets us
flip the tier→href mapping in a 5-line PR after 30 days of data instead
of guessing the AiBI Foundations vs Briefing/Advisory split. Uses the deferred
queue pattern documented in CLAUDE.md.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-four-surfaces.md"
```

---

## Task 10: Delete unused exports from personalization.ts

**Why last:** Once the imports in `ResultsViewV2.tsx` no longer reference these constants (Task 8), nothing in the codebase uses them. Deleting them removes dead content data.

**Files:**
- Modify: `content/assessments/v2/personalization.ts`

- [ ] **Step 10.1: Pre-delete grep — confirm zero remaining references**

Run from the worktree root:
```bash
for sym in TIER_INSIGHTS FUTURE_VISION RECOMMENDED_PATH_INTRO FOOTER_CLOSE; do
  echo "=== $sym ==="
  grep -rn "$sym" src content 2>/dev/null | grep -v "personalization.ts"
done
```
Expected: each `=== <sym> ===` header is followed by **no output lines**. If any output appears outside `personalization.ts`, stop and investigate before deleting.

- [ ] **Step 10.2: Delete `TIER_INSIGHTS`**

In `content/assessments/v2/personalization.ts`, delete the comment block + export starting at the `// SECTION 3 — "What This Means" — concrete operational signals per tier.` divider through the closing `};` of `TIER_INSIGHTS` (currently lines ~62–95).

- [ ] **Step 10.3: Delete `FUTURE_VISION`**

In the same file, delete the export `export const FUTURE_VISION: ReadonlyArray<string> = [ ... ];` and any preceding comment divider that introduces it specifically (currently lines ~516–525). Be careful **not** to touch the adjacent `FINANCIAL_IMPLICATIONS` block — keep the divider that introduces `FINANCIAL_IMPLICATIONS`.

- [ ] **Step 10.4: Delete `RECOMMENDED_PATH_INTRO`**

Delete the comment divider `// SECTION 9 — Recommended Path mistake intro per tier.` and the entire `export const RECOMMENDED_PATH_INTRO` block through its closing `};` (currently lines ~574–587).

- [ ] **Step 10.5: Delete `FOOTER_CLOSE`**

Delete the comment divider `// SECTION 10 — Footer Close (generic).` and the entire `export const FOOTER_CLOSE` block through its closing `};` (currently lines ~589–597). Stop at the divider that introduces the new `TIER_CLOSING_CTA` block from Task 1 — keep that one.

- [ ] **Step 10.6: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. If errors appear, the pre-delete grep missed a consumer — restore the deleted symbol from git stash or `git checkout HEAD -- content/assessments/v2/personalization.ts`, then track down the missed reference.

- [ ] **Step 10.7: Build check**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 10.8: Commit**

```bash
git add content/assessments/v2/personalization.ts
git commit -m "chore(assessment): delete unused tier content constants

After Spec 1's section cuts, TIER_INSIGHTS, FUTURE_VISION,
RECOMMENDED_PATH_INTRO, and FOOTER_CLOSE have zero consumers. Delete
rather than leave dangling — they're recoverable from git if needed
when Spec 2 (PDF) wants the FUTURE_VISION + FOOTER_CLOSE content.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-four-surfaces.md"
```

---

## Task 11: Final verification against acceptance criteria

**Why:** Spec 1 has 10 numbered acceptance criteria. This task is a checklist run, one criterion per step. Catches any drift before opening the PR.

- [ ] **Step 11.1: AC #1 — cuts applied verbatim**

Run:
```bash
grep -n "FUTURE_VISION\|FOOTER_CLOSE\|TIER_INSIGHTS\|RECOMMENDED_PATH_INTRO\|insightBullets\|PrintButton\|print-footer\|01 · Training\|02 · Strategic\|03 · Governance" src/app/assessment/_components/ResultsViewV2.tsx
```
Expected: zero output lines. (Each of those strings should be gone from V2.)

- [ ] **Step 11.2: AC #2 — imports cleaned**

Run:
```bash
grep -n "from '@content/assessments/v2/personalization'" src/app/assessment/_components/ResultsViewV2.tsx
```
Confirm the imported names are exactly: `PERSONAS, BIG_INSIGHT, GAP_CONTENT, RECOMMENDATIONS, STARTER_PROMPTS, SEVEN_DAY_PLAN, FINANCIAL_IMPLICATIONS, TIER_CLOSING_CTA` — and no others from that module.

Run:
```bash
grep -n "from './PrintButton'" src/app/assessment/_components/ResultsViewV2.tsx
```
Expected: zero output lines. (PrintButton import removed from V2.)

- [ ] **Step 11.3: AC #3 — new tier-keyed CTA exists in code and content**

Run:
```bash
grep -n "TIER_CLOSING_CTA" content/assessments/v2/personalization.ts src/app/assessment/_components/ResultsViewV2.tsx
```
Expected: at least one declaration line in `personalization.ts` and at least one usage line in `ResultsViewV2.tsx`. The CTA `<a>` carries `data-print-hide="true"` (verify by inspecting the matched lines).

- [ ] **Step 11.4: AC #4 — header orient-line copy updated**

Run:
```bash
grep -n "5-minute read" src/app/assessment/_components/ResultsViewV2.tsx
```
Expected: exactly one match. The matched line should read `A 5-minute read` (no `· Save or print at the bottom` clause).

- [ ] **Step 11.5: AC #5 — no forward-mentions of Specs 2/3/4**

Run:
```bash
grep -niE "we'll email|email you|save this link|bookmark this|board-ready pdf|coming soon" src/app/assessment/_components/ResultsViewV2.tsx
```
Expected: zero output lines.

- [ ] **Step 11.6: AC #6 — typecheck + build clean**

Run: `npx tsc --noEmit && npm run build`
Expected: both succeed without errors.

- [ ] **Step 11.7: AC #7 — brand discipline (no new sage/cobalt; only one border-2)**

Run:
```bash
grep -n "color-sage\|color-cobalt" src/app/assessment/_components/ResultsViewV2.tsx
```
Expected: zero output lines.

Run:
```bash
grep -n "border-2" src/app/assessment/_components/ResultsViewV2.tsx
```
Expected: exactly one match — the `border-2 border-[color:var(--color-terra)]` on the closing CTA `<article>` from Task 2.

- [ ] **Step 11.8: AC #8 — print stylesheet correctness preserved**

Run:
```bash
grep -n "body > header\|body > footer" src/app/globals.css
```
Expected: at least one match showing the scoped print rule. (`globals.css` was untouched in this plan; this is a regression check.)

- [ ] **Step 11.9: AC #9 — deleted constants gone from personalization.ts**

Run:
```bash
grep -n "export const FUTURE_VISION\|export const FOOTER_CLOSE\|export const RECOMMENDED_PATH_INTRO\|export const TIER_INSIGHTS" content/assessments/v2/personalization.ts
```
Expected: zero output lines.

- [ ] **Step 11.10: AC #10 — mobile parity check (visual)**

In Chrome DevTools, set the device emulator to **iPhone SE (375 × 667)**. Reload `/assessment` results page. Scroll through the entire brief end-to-end and confirm:
- No horizontal scroll at any section.
- The closing CTA card's button is at least 44 px tall and tappable without zoom.
- The lensed-implications dl rows stack to single column.
- The starter prompt code block stays inside the viewport (existing component behavior).

If any breaks: file a follow-up task before opening the PR; do not patch silently.

- [ ] **Step 11.11: Open the PR**

```bash
git push -u origin feature/assessment-briefing-reshape
gh pr create --title "Assessment briefing reshape (Spec 1 of 4)" --body "$(cat <<'EOF'
## Summary

- Spec 1 of the four-surface assessment results program. Reshapes the on-screen briefing into a focused 5-minute first-read.
- Cuts: Section 3 (What this means), Section 8 (Future Vision), Section 9 trio (Next Steps), Section 10 (Footer Close), PrintButton block, print-only footer block.
- Adds: tier-keyed closing CTA card replacing the cut Section 9 trio.
- Tracks: Plausible \`closing_cta_click\` event with \`{ tier, destination }\` props.

## Spec

\`docs/superpowers/specs/2026-05-04-assessment-results-four-surfaces.md\`

## Test plan

- [ ] Complete assessment with Starting Point answers — closing CTA reads "Enroll your team in AiBI Foundations" → \`/courses/aibi-p\`
- [ ] Complete assessment with Building Momentum answers — closing CTA reads "Request an Executive Briefing" → \`/for-institutions/advisory\`
- [ ] Complete assessment with Ready to Scale answers — closing CTA reads "Request a conversation" → \`/for-institutions/advisory\`
- [ ] iPhone SE (375 px) — no horizontal scroll, CTA tappable
- [ ] Print preview (\`⌘P\`) — print stylesheet still hides site chrome but shows the briefing header

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Note: per `CLAUDE.md`, the `git push` step **requires explicit user approval before execution**. Pause here and wait for the user to confirm before pushing.

---

## Self-Review

**1. Spec coverage:**

| Spec section / AC | Plan task |
|---|---|
| Cuts §3 + §8 + §9 trio + §10 + PrintButton block + print-footer | Tasks 5, 4, 2, 3, 6 |
| Imports cleaned | Task 8 |
| New `TIER_CLOSING_CTA` constant + section render | Tasks 1, 2 |
| Header orient-line copy updated | Task 7 |
| `PrintButton.tsx` file handling (deviation: kept alive due to V1) | Flagged at top + Task 6 deviation note |
| Plausible `closing_cta_click` event | Task 9 |
| Deleted constants removed from personalization.ts | Task 10 |
| Acceptance Criteria #1–#10 | Task 11 (one step per AC) |

No spec gaps detected. The PrintButton deletion deviation is flagged explicitly at the top of the plan and again in Task 6.

**2. Placeholder scan:** No "TBD", "TODO", "implement later", or "fill in details" in any task. Each step shows the exact code to add or remove. Task 9's TypeScript guard fallback ("Use the comment only if the typecheck actually fails") is conditional, not a placeholder.

**3. Type consistency:** `TIER_CLOSING_CTA` defined in Task 1 with shape `Record<Tier['id'], TierClosingCta>`. Used in Task 2 as `TIER_CLOSING_CTA[tierId].eyebrow / .headline / .body / .ctaLabel / .ctaHref` — all five fields match the interface. `tierId` is already in `ResultsViewV2`'s props (`tierId: Tier['id']`) and matches the index type.

---

## Plan complete

Saved to `docs/superpowers/plans/2026-05-04-assessment-briefing-onscreen-reshape.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints.

Which approach?
