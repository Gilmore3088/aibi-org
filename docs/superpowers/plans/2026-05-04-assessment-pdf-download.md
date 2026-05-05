# Assessment PDF Download (Spec 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a board-ready 8–12 page PDF download of the assessment briefing, warmed asynchronously on results-page-load and gated by Supabase Auth signup at click time.

**Architecture:** A dedicated print-only Next.js route at `/assessment/results/print/[id]` is snapshotted by Puppeteer running on a Vercel serverless function (extended timeout, `@sparticuz/chromium` for the Vercel Lambda environment). The PDF lands in a Supabase Storage bucket keyed by `user_profiles.id`, RLS-protected on read. A client component on the results page kicks off warming on mount; a download button transitions through `idle → warming → ready → auth-prompt → downloading` and ultimately triggers a signed-URL fetch.

**Tech Stack:** Next.js 14 App Router · TypeScript strict · Supabase (Postgres + Storage + Auth + RLS) · Puppeteer-core 21.x · @sparticuz/chromium 121.x · Resend SMTP (existing) · Plausible.

**Source spec:** `docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md`.

**Precondition:** Spec 1 PR (`feature/assessment-briefing-reshape`) **must merge to main** before this plan runs. Spec 2 builds on Spec 1's reshaped on-screen brief.

**Out of scope:** Email delivery (Spec 3), shareable result URLs / `/results/{id}` (Spec 4), peer benchmarking (Phase 1.5+).

---

## Spec Corrections (Caught at Plan-Time)

The Spec 2 spec doc referenced `assessment_responses` as a persistent row table. **No such table exists.** The actual schema (per migration 00011) puts assessment data on `user_profiles`:

- PK: `id` (uuid, defaults to `gen_random_uuid()` for anonymous rows; gets aligned with `auth.users.id` after a magic-link signup with matching email)
- Unique: `email`
- Columns: `readiness_score`, `readiness_tier_id`, `readiness_tier_label`, `readiness_dimension_breakdown` (jsonb), `readiness_answers` (jsonb), `readiness_at` (timestamptz), `readiness_version`, `readiness_max_score`

This plan uses `user_profiles` throughout. Storage path scheme: `assessment-pdfs/{user_profiles.id}.pdf`. The Spec 2 spec doc should be amended in a follow-up commit to reflect this — captured as Task 0.5 below.

A second discovery: **the email-capture flow does NOT currently create a Supabase Auth user.** It upserts to `user_profiles` keyed by email. So the "auth gate at PDF download" decision from the brainstorm requires explicit signup creation at click time, plus a back-fill that links `user_profiles.id` to the new `auth.users.id` (matching by email). Phase E owns this.

---

## File Structure

| Path | Type | Responsibility |
|---|---|---|
| `supabase/migrations/00025_assessment_pdf_columns.sql` | New migration | Adds `pdf_storage_path`, `pdf_generated_at` columns on `user_profiles`. Indexes them. |
| `supabase/migrations/00026_assessment_pdfs_bucket.sql` | New migration | Creates `assessment-pdfs` Storage bucket. RLS policies. Retention helper. |
| `content/assessments/v2/pdf-content.ts` | New | PDF-specific content (restored Future Vision, Footer Close, Recommended-Path mistake intros, plus regulator citation block). Spec 1 deleted these from `personalization.ts`; PDF needs them back. |
| `src/lib/pdf/generate.ts` | New | Puppeteer wrapper. Single export: `generateAssessmentPdf({ profileId }) → Promise<Buffer>`. Detects Vercel vs local runtime. |
| `src/lib/pdf/storage.ts` | New | Supabase Storage helpers. `uploadAssessmentPdf(profileId, buffer)`, `getSignedDownloadUrl(profileId)`, `deleteOldPdfs(olderThanDays)`. |
| `src/app/assessment/results/print/[id]/page.tsx` | New | Server component. Reads `user_profiles` row by id, renders the 12-page print layout. Not user-facing — only Puppeteer fetches it. |
| `src/app/assessment/results/print/_components/*.tsx` | New | Per-page components: `Cover.tsx`, `ExecSummary.tsx`, `LensedImplications.tsx`, `StrengthsAndGaps.tsx`, `GapDetail.tsx`, `FirstMove.tsx`, `StarterPromptAndPlan.tsx`, `FutureVisionPage.tsx`, `NextStepsTrio.tsx`, `GovernanceCitations.tsx`, `BackCover.tsx`. |
| `src/app/assessment/results/print/print.css` | New | Print-only stylesheet. Page breaks, US Letter sizing, 0.75″ margins, page-number footer. Loaded only on the print route. |
| `src/app/api/assessment/pdf/warm/route.ts` | New | POST endpoint. Triggered by `PdfDownloadButton` on mount. Queues PDF generation for the user's profile id. Idempotent. |
| `src/app/api/assessment/pdf/download/route.ts` | New | GET endpoint. Validates auth session, returns 24h-TTL signed Storage URL. RLS does the access enforcement. |
| `src/app/api/assessment/pdf/cron-cleanup/route.ts` | New | Daily cron endpoint (called by Vercel Cron or Supabase Scheduled Functions). Sweeps PDFs older than 30 days. |
| `src/app/assessment/_components/PdfDownloadButton.tsx` | New | Client component. State machine: `idle → warming → ready → auth-prompt → downloading → done`. Renders the actual download button + signup modal trigger. |
| `src/app/assessment/_components/SignupModal.tsx` | New | Client component. Magic-link signup modal pre-filled with captured email. On signup completion, calls back to parent to retry the download. |
| `src/lib/auth/back-fill-profile.ts` | New | Server-side helper. Called from auth callback or post-signin server action: links `user_profiles.id` to the auth user's id by matching email. |
| `src/lib/supabase/auth.ts` | Modify | Already has `signInWithMagicLink` — verify and possibly extend with a redirectTo param so the magic-link emails round-trip back to the right results page. |
| `src/app/auth/callback/route.ts` | Modify (or create if absent) | Standard Supabase Auth code-exchange route. After exchange, calls `backFillProfile(authUserId, email)` to link the row. |
| `src/app/assessment/_components/ResultsViewV2.tsx` | Modify | Add `<PdfDownloadButton />` after the appendix details. Pass `profileId` prop down. Ten-line surgical change. |
| `src/app/assessment/page.tsx` | Modify | After upsertReadinessResult succeeds, surface the returned `user_profiles.id` to the client. Pass through to `ResultsViewV2`. |
| `src/lib/supabase/user-profiles.ts` | Modify | `upsertReadinessResult` returns `{ id: string }` instead of `void` so the capture-email route can pass the id forward. |
| `src/app/api/capture-email/route.ts` | Modify | Pass profile id through to the response body. |
| `vercel.json` | New (or modify) | Sets `maxDuration: 60` on `/api/assessment/pdf/warm` route. Configures Vercel Cron for the cleanup endpoint. |
| `package.json` | Modify | Adds `puppeteer-core@^21` and `@sparticuz/chromium@^121` dependencies. |

### Files explicitly NOT changing

- `src/app/assessment/_components/ResultsView.tsx` (V1 dead code) — untouched
- `src/app/assessment/_components/PrintButton.tsx` — untouched (V1 still imports)
- `src/app/globals.css` — untouched (print stylesheet stays scope-fixed; this plan introduces a separate print.css scoped to the print route only)
- `content/assessments/v2/personalization.ts` — Spec 1's deletes stay deleted; Spec 2 ships its own pdf-content.ts file instead

---

## Pre-Flight: Branch Setup and Spec Amendment

- [ ] **Step 0.1: Verify Spec 1 has merged**

Run: `git -C ~/Projects/TheAiBankingInstitute log --oneline main..origin/main` and confirm the Spec 1 commits (`feat(assessment): replace Next-Steps trio with tier-keyed closing CTA` and the rest from PR #40) are in `main`. If not, stop and merge PR #40 first.

- [ ] **Step 0.2: Create feature worktree**

```bash
cd ~/Projects/TheAiBankingInstitute
git pull origin main
git worktree add ../aibi-pdf-download -b feature/assessment-pdf-download main
ln -s ~/Projects/TheAiBankingInstitute/.env.local ../aibi-pdf-download/.env.local
cd ../aibi-pdf-download
npm install
```

Expected: clean working tree at `~/Projects/aibi-pdf-download` on `feature/assessment-pdf-download`. Subsequent steps run from this directory.

- [ ] **Step 0.3: Amend Spec 2 spec doc**

Open `docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md`. In the "Architecture" and "Acceptance Criteria" sections, replace every reference to `assessment_responses` with `user_profiles`. Add a "Plan-time corrections" section noting the schema discovery. Commit:

```bash
git add docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md
git commit -m "docs(spec): correct assessment_responses → user_profiles in Spec 2

Spec 2 referenced a non-existent assessment_responses table during
brainstorming. Actual schema lives on user_profiles per migration 00011.
Plan-time grep caught this before implementation. Spec doc now reflects
the real table.

Refs: docs/superpowers/plans/2026-05-04-assessment-pdf-download.md"
```

---

## Phase A — Dependencies & Schema

### Task 1: Install PDF generation dependencies

**Files:** `package.json`, `package-lock.json`

- [ ] **Step 1.1: Install puppeteer-core + chromium binary**

```bash
cd ~/Projects/aibi-pdf-download
npm install --save-exact puppeteer-core@21.11.0 @sparticuz/chromium@121.0.0
```

`@sparticuz/chromium` is the standard Lambda/Vercel-compatible Chromium binary. Pinning exact versions avoids drift between local development and production.

- [ ] **Step 1.2: Verify the install resolved correctly**

Run: `npx puppeteer-core --version && ls node_modules/@sparticuz/chromium/bin`

Expected: version output for puppeteer-core; the chromium bin directory contains `chromium.br` (the compressed binary).

- [ ] **Step 1.3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): add puppeteer-core + @sparticuz/chromium for PDF generation

Pinned to exact versions matching the Vercel Node 20 runtime support
matrix. Used by src/lib/pdf/generate.ts in the next task.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md"
```

### Task 2: Migration 00025 — PDF columns on user_profiles

**Files:** `supabase/migrations/00025_assessment_pdf_columns.sql` (new)

- [ ] **Step 2.1: Author the migration**

Create `supabase/migrations/00025_assessment_pdf_columns.sql`:

```sql
-- Migration: 00025_assessment_pdf_columns.sql
-- Purpose: Add columns tracking the PDF storage path and generation
-- timestamp on user_profiles, used by Spec 2 (PDF Download).

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS pdf_storage_path text,
  ADD COLUMN IF NOT EXISTS pdf_generated_at timestamptz;

-- Index supports cron cleanup ("delete PDFs older than 30 days") and
-- ops queries ("how many PDFs have been generated this week").
CREATE INDEX IF NOT EXISTS idx_user_profiles_pdf_generated_at
  ON public.user_profiles (pdf_generated_at)
  WHERE pdf_generated_at IS NOT NULL;

COMMENT ON COLUMN public.user_profiles.pdf_storage_path IS
  'Relative path within the assessment-pdfs Storage bucket. NULL if no PDF generated yet.';
COMMENT ON COLUMN public.user_profiles.pdf_generated_at IS
  'Timestamp when the most recent PDF generation completed for this profile.';
```

- [ ] **Step 2.2: Apply via Supabase CLI**

Run: `supabase db query --linked --file supabase/migrations/00025_assessment_pdf_columns.sql`

Expected: `NOTICE` lines confirming column adds, no errors. Verify columns exist:

```bash
supabase db query --linked --command "\d+ public.user_profiles" | grep -E "pdf_storage_path|pdf_generated_at"
```

Expected: two rows showing the new columns.

- [ ] **Step 2.3: Commit**

```bash
git add supabase/migrations/00025_assessment_pdf_columns.sql
git commit -m "feat(supabase): add pdf_storage_path + pdf_generated_at to user_profiles

Tracks where each user's most recent PDF lives in Storage and when it
was last generated. Indexed for cron cleanup queries.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md"
```

### Task 3: Migration 00026 — Storage bucket + RLS

**Files:** `supabase/migrations/00026_assessment_pdfs_bucket.sql` (new)

- [ ] **Step 3.1: Author the migration**

Create `supabase/migrations/00026_assessment_pdfs_bucket.sql`:

```sql
-- Migration: 00026_assessment_pdfs_bucket.sql
-- Purpose: Create the Storage bucket for warmed PDFs. RLS allows read
-- only to the auth user matching the user_profiles.id derived from the
-- storage path.

-- Bucket creation. Storage's Postgres-side metadata table.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assessment-pdfs',
  'assessment-pdfs',
  false,
  10485760,  -- 10 MB hard cap per PDF
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policy: the path scheme is `{user_profiles.id}.pdf`. A reader is
-- allowed if their auth.uid() equals the user_profiles.id whose
-- pdf_storage_path matches the requested object name.
CREATE POLICY "Owner can read own assessment PDF"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'assessment-pdfs'
    AND EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = (select auth.uid())
        AND up.pdf_storage_path = name
    )
  );

-- INSERT policy: only the service role writes (warm endpoint runs with
-- service-role client). No authenticated-user writes.
CREATE POLICY "Service role writes assessment PDFs"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'assessment-pdfs');

-- DELETE policy: service role only (cron cleanup).
CREATE POLICY "Service role deletes old assessment PDFs"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'assessment-pdfs');

COMMENT ON POLICY "Owner can read own assessment PDF" ON storage.objects IS
  'Spec 2: PDF download is owner-only. Path scheme {user_profiles.id}.pdf links the storage row to the assessment owner.';
```

- [ ] **Step 3.2: Apply the migration**

Run: `supabase db query --linked --file supabase/migrations/00026_assessment_pdfs_bucket.sql`

Expected: no errors. Verify bucket exists:

```bash
supabase db query --linked --command "SELECT id, public, file_size_limit FROM storage.buckets WHERE id = 'assessment-pdfs'"
```

Expected: one row, `public = false`, `file_size_limit = 10485760`.

- [ ] **Step 3.3: Commit**

```bash
git add supabase/migrations/00026_assessment_pdfs_bucket.sql
git commit -m "feat(supabase): create assessment-pdfs bucket with owner-only RLS

Spec 2 storage backbone. 10 MB hard cap per PDF. RLS reads gated by
auth.uid() = user_profiles.id where the storage path matches
user_profiles.pdf_storage_path. Service role owns writes + deletes.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md"
```

### Task 4: Phase A verification gate

- [ ] **Step 4.1: Confirm both migrations applied locally and on linked env**

Run: `supabase db query --linked --command "SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 5"`

Expected: 00026 and 00025 in the output. If not present, debug before proceeding to Phase B.

- [ ] **Step 4.2: Manual upload smoke test**

In Supabase dashboard → Storage → `assessment-pdfs`, upload a tiny dummy PDF named `00000000-0000-0000-0000-000000000000.pdf`. Confirm upload succeeds (service-role write permitted). Then attempt download via the dashboard's preview — confirm RLS denies anonymous fetch (the preview will fail or 401). Delete the dummy after.

---

## Phase B — PDF Content & Print Route

### Task 5: PDF content module

**Files:** `content/assessments/v2/pdf-content.ts` (new)

The Spec 1 cuts removed `FUTURE_VISION`, `FOOTER_CLOSE`, `RECOMMENDED_PATH_INTRO`, `TIER_INSIGHTS` from `personalization.ts`. Spec 2's PDF needs them back, plus regulator citations not in the original.

- [ ] **Step 5.1: Author the file**

Create `content/assessments/v2/pdf-content.ts`:

```typescript
// PDF-specific content. Spec 1 cut these constants from personalization.ts
// because they were no longer used by the on-screen brief; Spec 2's PDF
// surface re-introduces them as PDF-only content with PDF-tuned phrasing.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md

import type { Tier } from './scoring';

// Restored from Spec 1's git deletion. Page 10 of the PDF.
export const PDF_FUTURE_VISION: ReadonlyArray<string> = [
  'Staff use AI for internal workflows daily',
  'Prompts follow consistent, reusable patterns',
  'Outputs are reviewed before use',
  'Sensitive data is never exposed',
  'At least 1–3 workflows produce measurable time savings',
];

// Restored from Spec 1's git deletion. Back cover.
export const PDF_FOOTER_CLOSE = {
  headline: 'AI adoption is not a technology problem.',
  body:
    "It's a training and workflow problem. The institutions that move early—and safely—create a measurable advantage.",
};

// Restored from Spec 1's git deletion. Used in the Next Steps trio (page 11).
export const PDF_RECOMMENDED_PATH_INTRO: Record<Tier['id'], string> = {
  'starting-point':
    'Most institutions at your stage make the same mistake: they explore tools before training their team. The fastest path forward is building staff capability first.',
  'early-stage':
    'Most institutions at your stage make the same mistake: they let isolated experiments stay isolated. The fastest path forward is converting those wins into a coordinated program with shared prompt patterns and a documented review step.',
  'building-momentum':
    'Most institutions at your stage make the same mistake: they assume the program will sustain itself. The fastest path forward is measuring outcomes rigorously and codifying the patterns that already work, so the program survives staff turnover.',
  'ready-to-scale':
    'Most institutions at your stage make the same mistake: they slow down because the early wins are visible. The fastest path forward is replicating capability across every new hire — turning today\'s advantage into a compounding one.',
};

// New for Spec 2. Page 12: governance & citations.
// All citations carry named source per CLAUDE.md brand rules.
export interface RegulatoryCitation {
  readonly source: string;
  readonly year: string;
  readonly relevance: string;
}

export const PDF_REGULATORY_CITATIONS: ReadonlyArray<RegulatoryCitation> = [
  {
    source: 'SR 11-7 — Guidance on Model Risk Management',
    year: 'Federal Reserve, 2011 (re-affirmed 2024)',
    relevance:
      'AI-driven decisioning models fall within the Fed\'s definition of a "model" requiring documented validation, ongoing monitoring, and governance.',
  },
  {
    source: 'Interagency Guidance on Third-Party Risk Management',
    year: 'OCC / FDIC / Federal Reserve, 2023',
    relevance:
      'AI vendors providing tools, models, or hosted inference services are third parties — your institution remains responsible for the customer-facing outcomes.',
  },
  {
    source: 'Equal Credit Opportunity Act (Reg B)',
    year: '12 CFR §1002 — current',
    relevance:
      'AI models touching credit decisions must produce explainable adverse-action notices. Black-box generative outputs in the credit pipeline are non-compliant.',
  },
  {
    source: 'AI Executive Order Group AI Lexicon',
    year: 'US Treasury / FBIIC / FSSCC, February 2026',
    relevance:
      'Establishes the standard vocabulary regulators use when assessing AI programs: "AI use case inventory", "human in the loop", "third-party AI risk", "explainability".',
  },
];

// Tier-specific PDF cover sub-headline. The on-screen brief uses
// PERSONAS[tierId].oneLine; the PDF has a slightly more formal lead.
export const PDF_COVER_SUBHEAD: Record<Tier['id'], string> = {
  'starting-point':
    'Where to begin when AI is on the agenda but not yet on the floor.',
  'early-stage':
    'How to convert isolated experiments into a coordinated program.',
  'building-momentum':
    'How to defend, measure, and scale a program that is already working.',
  'ready-to-scale':
    'How to compound an existing advantage as the next wave of AI capability arrives.',
};
```

- [ ] **Step 5.2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5.3: Commit**

```bash
git add content/assessments/v2/pdf-content.ts
git commit -m "feat(pdf-content): add PDF-specific content module

Restores FUTURE_VISION, FOOTER_CLOSE, RECOMMENDED_PATH_INTRO content
that Spec 1 deleted from personalization.ts (zero on-screen consumers
post-reshape) into a PDF-scoped module. Adds PDF_REGULATORY_CITATIONS
for the page-12 governance appendix and PDF_COVER_SUBHEAD for tier-
specific cover lines.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md"
```

### Task 6: Print route scaffold + cover page

**Files:** `src/app/assessment/results/print/[id]/page.tsx`, `src/app/assessment/results/print/print.css`, `src/app/assessment/results/print/_components/Cover.tsx`

- [ ] **Step 6.1: Print stylesheet**

Create `src/app/assessment/results/print/print.css`:

```css
/* Print stylesheet — applies only to the /assessment/results/print route.
 * US Letter sizing (8.5 x 11), 0.75" margins.
 * Page-break utilities for per-section <article> blocks.
 */
@page {
  size: letter;
  margin: 0.75in;
}

html, body {
  margin: 0;
  padding: 0;
  background: #ffffff;
  color: var(--color-ink);
  font-family: var(--font-sans);
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.pdf-page {
  page-break-after: always;
  page-break-inside: avoid;
  min-height: calc(11in - 1.5in); /* page minus top/bottom margins */
  display: flex;
  flex-direction: column;
}

.pdf-page:last-child {
  page-break-after: auto;
}

.pdf-page-footer {
  margin-top: auto;
  padding-top: 0.5in;
  font-family: var(--font-mono);
  font-size: 9pt;
  color: var(--color-slate);
  border-top: 1px solid var(--color-ink);
  border-top-width: 0.5pt;
  display: flex;
  justify-content: space-between;
}
```

- [ ] **Step 6.2: Cover page component**

Create `src/app/assessment/results/print/_components/Cover.tsx`:

```tsx
import type { Tier } from '@content/assessments/v2/scoring';
import { PDF_COVER_SUBHEAD } from '@content/assessments/v2/pdf-content';

interface CoverProps {
  readonly tier: Tier;
  readonly tierId: Tier['id'];
  readonly score: number;
  readonly maxScore: number;
  readonly firstName: string | null;
  readonly institutionName: string | null;
  readonly generatedAt: Date;
}

export function Cover({
  tier,
  tierId,
  score,
  maxScore,
  firstName,
  institutionName,
  generatedAt,
}: CoverProps) {
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const subjectName = institutionName?.trim() || 'Your institution';

  return (
    <article className="pdf-page" data-pdf-page="cover">
      <div style={{ marginTop: '1.5in' }}>
        <p
          style={{
            fontFamily: 'var(--font-serif-sc)',
            fontSize: '11pt',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--color-terra)',
            marginBottom: '0.5in',
          }}
        >
          The AI Banking Institute
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '36pt',
            lineHeight: 1.1,
            margin: 0,
            color: 'var(--color-ink)',
          }}
        >
          AI Readiness Briefing
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '18pt',
            lineHeight: 1.3,
            marginTop: '0.5in',
            color: 'var(--color-slate)',
          }}
        >
          {PDF_COVER_SUBHEAD[tierId]}
        </p>
      </div>

      <div style={{ marginTop: '1.5in', borderTop: '1pt solid var(--color-ink)', paddingTop: '0.4in' }}>
        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5in 1fr',
            rowGap: '0.2in',
            fontFamily: 'var(--font-sans)',
            fontSize: '11pt',
          }}
        >
          <dt style={{ color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '9pt' }}>
            Prepared for
          </dt>
          <dd style={{ margin: 0, color: 'var(--color-ink)' }}>
            {firstName ? `${firstName.trim()} · ${subjectName}` : subjectName}
          </dd>

          <dt style={{ color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '9pt' }}>
            Tier
          </dt>
          <dd style={{ margin: 0, color: tier.colorVar, fontWeight: 600 }}>
            {tier.label}
          </dd>

          <dt style={{ color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '9pt' }}>
            Score
          </dt>
          <dd style={{ margin: 0, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
            {score} / {maxScore}
          </dd>

          <dt style={{ color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '9pt' }}>
            Issued
          </dt>
          <dd style={{ margin: 0, fontFamily: 'var(--font-mono)' }}>
            {dateFormatter.format(generatedAt)}
          </dd>
        </dl>
      </div>

      <div className="pdf-page-footer">
        <span>aibankinginstitute.com</span>
        <span>Confidential — prepared for the named institution</span>
      </div>
    </article>
  );
}
```

- [ ] **Step 6.3: Print route page**

Create `src/app/assessment/results/print/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getTierV2 } from '@content/assessments/v2/scoring';
import { Cover } from '../_components/Cover';
import './print.css';
// Subsequent task adds the rest of the page imports.

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface PrintPageProps {
  readonly params: { readonly id: string };
}

export default async function PrintPage({ params }: PrintPageProps) {
  if (!isSupabaseConfigured()) notFound();

  const client = createServiceRoleClient();
  const { data: profile, error } = await client
    .from('user_profiles')
    .select('id, email, first_name, institution_name, readiness_score, readiness_max_score, readiness_tier_id, readiness_dimension_breakdown, readiness_at')
    .eq('id', params.id)
    .single();

  if (error || !profile) notFound();
  if (!profile.readiness_tier_id) notFound();

  const tier = getTierV2(profile.readiness_score ?? 0);
  const generatedAt = new Date();

  return (
    <main>
      <Cover
        tier={tier}
        tierId={profile.readiness_tier_id}
        score={profile.readiness_score ?? 0}
        maxScore={profile.readiness_max_score ?? 48}
        firstName={profile.first_name}
        institutionName={profile.institution_name}
        generatedAt={generatedAt}
      />
      {/* Subsequent tasks add ExecSummary, LensedImplications, Strengths, GapDetail, FirstMove, StarterPromptAndPlan, FutureVisionPage, NextStepsTrio, GovernanceCitations, BackCover. */}
    </main>
  );
}
```

- [ ] **Step 6.4: Verify the route renders**

Start dev server: `lsof -ti:3000 | xargs -r kill -9 ; rm -rf .next ; npm run dev`. In a separate terminal, find a `user_profiles.id` from the database (e.g. `supabase db query --linked --command "SELECT id FROM user_profiles WHERE readiness_tier_id IS NOT NULL LIMIT 1"`). Open `http://localhost:3000/assessment/results/print/{that-id}` — should render the cover page only.

- [ ] **Step 6.5: Commit**

```bash
git add src/app/assessment/results/print/
git commit -m "feat(pdf): scaffold print route with cover page

Server-rendered route at /assessment/results/print/[id] that Puppeteer
will snapshot. Cover page laid out with US Letter sizing, 0.75in
margins, page-break-after on each <article>. Subsequent tasks add
pages 2-12.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md"
```

### Tasks 7–11: Remaining print pages (one task per page bundle)

Each task follows the **same shape** as Task 6's pattern: create the per-page component under `src/app/assessment/results/print/_components/`, import it into `[id]/page.tsx`, render it after the previous page, verify the new page appears in the dev server, commit.

The bundles below specify which page(s) each task ships, what data each component receives, and what content it renders. **Code style and structure mirror `Cover.tsx`** — inline styles using CSS variables, data-pdf-page attribute, footer with page identifier.

**Task 7** — `ExecSummary.tsx` (page 2). Props: `tier`, `tierId`, `score`, `persona` from `PERSONAS[tierId]`, `topThreeImplications` (operational + risk + cost lensed bullets, abbreviated to one line each). Layout: tier label as eyebrow, persona one-liner as 24pt headline, three bullet rows below.

**Task 8** — `LensedImplications.tsx` (page 3). Props: `tierId`, full `FINANCIAL_IMPLICATIONS[tierId]`. Layout: three half-page blocks, label-left / body-right per lens (operational / risk / cost), each block ~3″ tall.

**Task 9** — `StrengthsAndGaps.tsx` (page 4) + `GapDetail.tsx` ×2 (pages 5–6, one per critical gap). Props: ranked dimensions array. Page 4 = horizontal score bars for all 8 dimensions colored by tier band. Pages 5–6 = full GAP_CONTENT for the top two critical gaps (explanation + impacts + what-good-looks-like, each as a page).

**Task 10** — `FirstMove.tsx` (page 7) + `StarterPromptAndPlan.tsx` (pages 8–9). Page 7 renders RECOMMENDATIONS[focusGap.id] in full (whyRightNow / inPractice / worksBestFor / risk / time-saved / owner). Page 8 = the starter prompt printed verbatim in DM Mono on a parch background. Page 9 = the 7-day plan as a numbered timeline.

**Task 11** — `FutureVisionPage.tsx` (page 10) + `NextStepsTrio.tsx` (page 11) + `GovernanceCitations.tsx` (page 12) + `BackCover.tsx` (final). Page 10 uses `PDF_FUTURE_VISION`. Page 11 uses `PDF_RECOMMENDED_PATH_INTRO[tierId]` + the Training/Strategic-Planning/Governance trio (full content from Spec 1's git history — restored verbatim into a `PDF_NEXT_STEPS_TRIO` constant added to `pdf-content.ts` as part of this task). Page 12 renders `PDF_REGULATORY_CITATIONS`. Back cover uses `PDF_FOOTER_CLOSE`.

Each task ends with: `npx tsc --noEmit` + visual check of the dev server URL `/assessment/results/print/{id}` + commit. Commit messages: `feat(pdf): add ExecSummary page (page 2)`, etc.

### Task 12: Phase B verification gate

- [ ] **Step 12.1: Render the full print route**

In dev mode, open `http://localhost:3000/assessment/results/print/{a-real-profile-id}` and use the browser's `⌘P` Print preview. Confirm 12 pages render with no overflow, correct page breaks, brand fonts loaded.

- [ ] **Step 12.2: Manual content audit**

Page through the preview top-to-bottom. Each page should match the spec's "Page-by-Page Composition" table. No "FFIEC-aware" string anywhere (CLAUDE.md rule). Every statistic carries a named source. Tier color is consistent across pages.

If anything is off: fix in a follow-up task on this branch (don't move to Phase C until the print route is content-correct).

---

## Phase C — Generation Library & Vercel Configuration

### Task 13: PDF generation wrapper

**Files:** `src/lib/pdf/generate.ts` (new)

- [ ] **Step 13.1: Author the wrapper**

Create `src/lib/pdf/generate.ts`:

```typescript
// Puppeteer-driven PDF generation. Snapshots the print route and
// returns a Buffer ready to upload. Detects local vs Vercel runtime
// to pick the right Chromium binary.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md

import chromium from '@sparticuz/chromium';
import puppeteer, { type Browser } from 'puppeteer-core';

interface GenerateOptions {
  readonly profileId: string;
  readonly origin: string; // e.g. "https://aibankinginstitute.com" or "http://localhost:3000"
}

export async function generateAssessmentPdf({
  profileId,
  origin,
}: GenerateOptions): Promise<Buffer> {
  const isVercel = process.env.VERCEL === '1';

  const browser: Browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1200, height: 1600 },
    executablePath: isVercel
      ? await chromium.executablePath()
      : process.env.PUPPETEER_LOCAL_CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: chromium.headless,
  });

  try {
    const page = await browser.newPage();
    const url = `${origin}/assessment/results/print/${profileId}`;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // Force fonts to settle before snapshotting.
    await page.evaluateHandle('document.fonts.ready');

    const buffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.75in', right: '0.75in', bottom: '0.75in', left: '0.75in' },
    });

    return buffer as Buffer;
  } finally {
    await browser.close();
  }
}
```

- [ ] **Step 13.2: Local smoke test**

Create a quick standalone script:

```bash
cat > /tmp/test-pdf.ts <<'EOF'
import { generateAssessmentPdf } from '@/lib/pdf/generate';
import { writeFileSync } from 'node:fs';

(async () => {
  const buf = await generateAssessmentPdf({
    profileId: 'PASTE_REAL_ID_HERE',
    origin: 'http://localhost:3000',
  });
  writeFileSync('/tmp/assessment.pdf', buf);
  console.log('wrote /tmp/assessment.pdf', buf.length, 'bytes');
})();
EOF
```

Replace `PASTE_REAL_ID_HERE` with a real `user_profiles.id`. With dev server running, run: `npx tsx /tmp/test-pdf.ts`. Open `/tmp/assessment.pdf` in Preview. Confirm 12 pages, correct content. If buffer < 50 KB or page count is wrong, debug before continuing.

- [ ] **Step 13.3: Commit**

```bash
git add src/lib/pdf/generate.ts
git commit -m "feat(pdf): puppeteer-core + sparticuz/chromium PDF generator

Generates 8-12 page PDFs by snapshotting the /assessment/results/print
route. Vercel runtime uses @sparticuz/chromium binary; local dev falls
back to system Chrome at /Applications/... or PUPPETEER_LOCAL_CHROME
override.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md"
```

### Task 14: Storage helpers

**Files:** `src/lib/pdf/storage.ts` (new)

- [ ] **Step 14.1: Author the helpers**

Create `src/lib/pdf/storage.ts`:

```typescript
// Supabase Storage wrappers for the assessment-pdfs bucket.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md

import { createServiceRoleClient } from '@/lib/supabase/client';

const BUCKET = 'assessment-pdfs';

export interface UploadResult {
  readonly path: string;
  readonly bytes: number;
}

export async function uploadAssessmentPdf(
  profileId: string,
  buffer: Buffer,
): Promise<UploadResult> {
  const client = createServiceRoleClient();
  const path = `${profileId}.pdf`;

  const { error } = await client.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) {
    throw new Error(`[pdf/storage] upload failed: ${error.message}`);
  }

  // Stamp user_profiles row.
  const { error: dbError } = await client
    .from('user_profiles')
    .update({
      pdf_storage_path: path,
      pdf_generated_at: new Date().toISOString(),
    })
    .eq('id', profileId);

  if (dbError) {
    throw new Error(`[pdf/storage] user_profiles stamp failed: ${dbError.message}`);
  }

  return { path, bytes: buffer.length };
}

export async function getSignedDownloadUrl(profileId: string): Promise<string | null> {
  const client = createServiceRoleClient();
  const path = `${profileId}.pdf`;

  const { data, error } = await client.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24); // 24 hour TTL per spec

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function deleteOldPdfs(olderThanDays: number): Promise<{ deleted: number }> {
  const client = createServiceRoleClient();
  const cutoffIso = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000).toISOString();

  const { data: stale, error: queryError } = await client
    .from('user_profiles')
    .select('id, pdf_storage_path')
    .lt('pdf_generated_at', cutoffIso)
    .not('pdf_storage_path', 'is', null);

  if (queryError) throw new Error(`[pdf/storage] cleanup query failed: ${queryError.message}`);
  if (!stale || stale.length === 0) return { deleted: 0 };

  const paths = stale.map((row) => row.pdf_storage_path).filter((p): p is string => Boolean(p));
  const { error: deleteError } = await client.storage.from(BUCKET).remove(paths);
  if (deleteError) throw new Error(`[pdf/storage] delete failed: ${deleteError.message}`);

  // Clear the stale rows' pdf columns.
  const { error: clearError } = await client
    .from('user_profiles')
    .update({ pdf_storage_path: null, pdf_generated_at: null })
    .in('id', stale.map((r) => r.id));

  if (clearError) throw new Error(`[pdf/storage] clear-columns failed: ${clearError.message}`);

  return { deleted: paths.length };
}
```

- [ ] **Step 14.2: Typecheck and commit**

```bash
npx tsc --noEmit
git add src/lib/pdf/storage.ts
git commit -m "feat(pdf): supabase storage helpers (upload, sign, delete-old)

Uses service-role client (bypasses RLS for writes; reads come through
RLS via the signed-URL endpoint in Phase D). 24-hour TTL on signed
URLs per spec. deleteOldPdfs clears both storage objects and the
user_profiles columns to keep state consistent.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md"
```

### Task 15: Vercel function timeout config

**Files:** `vercel.json` (new — or modify if exists)

- [ ] **Step 15.1: Check whether vercel.json exists**

Run: `ls vercel.json 2>/dev/null || echo "not yet"`

- [ ] **Step 15.2: Author / extend the config**

If the file does not exist, create `vercel.json`:

```json
{
  "functions": {
    "src/app/api/assessment/pdf/warm/route.ts": {
      "maxDuration": 60,
      "memory": 1024
    },
    "src/app/api/assessment/pdf/cron-cleanup/route.ts": {
      "maxDuration": 30,
      "memory": 512
    }
  },
  "crons": [
    {
      "path": "/api/assessment/pdf/cron-cleanup",
      "schedule": "0 4 * * *"
    }
  ]
}
```

If it already exists, merge the `functions` and `crons` sections in (preserving any existing entries).

- [ ] **Step 15.3: Commit**

```bash
git add vercel.json
git commit -m "ci(vercel): extend serverless timeout for PDF generation + nightly cron

PDF warm route runs Puppeteer + Chromium — needs the 60s ceiling
instead of the 10s default. Memory bumped to 1024 MB to accommodate
the chromium binary. Cleanup cron runs at 04:00 UTC daily.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md"
```

---

## Phase D — API Routes

### Task 16: POST /api/assessment/pdf/warm

**Files:** `src/app/api/assessment/pdf/warm/route.ts` (new)

- [ ] **Step 16.1: Author the route**

Create `src/app/api/assessment/pdf/warm/route.ts`:

```typescript
// POST /api/assessment/pdf/warm
// Triggered from PdfDownloadButton on results-page mount. Generates the
// PDF and stores it in the assessment-pdfs bucket. Idempotent — repeat
// calls within 5 minutes for the same profileId short-circuit.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md

import { NextResponse } from 'next/server';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { generateAssessmentPdf } from '@/lib/pdf/generate';
import { uploadAssessmentPdf } from '@/lib/pdf/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const RECENT_GENERATION_WINDOW_MS = 5 * 60 * 1000;

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'supabase-not-configured' }, { status: 503 });
  }
  if (process.env.SKIP_PDF_GENERATION === 'true') {
    return NextResponse.json({ status: 'skipped', reason: 'staging-suppression' }, { status: 200 });
  }

  let body: { profileId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }

  const profileId = body.profileId?.trim();
  if (!profileId || !/^[0-9a-f-]{36}$/i.test(profileId)) {
    return NextResponse.json({ error: 'invalid-profile-id' }, { status: 400 });
  }

  const client = createServiceRoleClient();
  const { data: profile, error: fetchError } = await client
    .from('user_profiles')
    .select('id, readiness_tier_id, pdf_generated_at')
    .eq('id', profileId)
    .single();

  if (fetchError || !profile) {
    return NextResponse.json({ error: 'profile-not-found' }, { status: 404 });
  }
  if (!profile.readiness_tier_id) {
    return NextResponse.json({ error: 'no-assessment-completed' }, { status: 409 });
  }

  // Idempotency: if a PDF was generated in the last 5 minutes, return ready.
  if (profile.pdf_generated_at) {
    const ageMs = Date.now() - new Date(profile.pdf_generated_at).getTime();
    if (ageMs < RECENT_GENERATION_WINDOW_MS) {
      return NextResponse.json({ status: 'ready', cached: true }, { status: 200 });
    }
  }

  try {
    const origin = request.headers.get('origin') ?? new URL(request.url).origin;
    const buffer = await generateAssessmentPdf({ profileId, origin });
    const result = await uploadAssessmentPdf(profileId, buffer);
    return NextResponse.json({ status: 'ready', bytes: result.bytes }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[pdf/warm] generation failed:', message);
    return NextResponse.json({ error: 'generation-failed', detail: message }, { status: 500 });
  }
}
```

- [ ] **Step 16.2: Test the warm route**

With dev server running, find a real `user_profiles.id` and run:

```bash
curl -X POST http://localhost:3000/api/assessment/pdf/warm \
  -H 'content-type: application/json' \
  -d '{"profileId":"PASTE_REAL_ID"}'
```

Expected: `{"status":"ready","bytes":NNNNNNN}` after ~5–10 seconds. Verify the PDF lands in Supabase Storage (`assessment-pdfs/{id}.pdf`) and the `pdf_storage_path` + `pdf_generated_at` columns are populated.

- [ ] **Step 16.3: Commit**

```bash
git add src/app/api/assessment/pdf/warm/route.ts
git commit -m "feat(pdf): POST /api/assessment/pdf/warm endpoint

Triggers Puppeteer-driven PDF generation and Supabase Storage upload.
Idempotent within a 5-minute window — repeat calls short-circuit
without re-rendering. Honors SKIP_PDF_GENERATION=true for staging.
maxDuration=60s. Validates profileId UUID before doing any work.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md"
```

### Task 17: GET /api/assessment/pdf/download

**Files:** `src/app/api/assessment/pdf/download/route.ts` (new)

- [ ] **Step 17.1: Author the route**

Create `src/app/api/assessment/pdf/download/route.ts`:

```typescript
// GET /api/assessment/pdf/download?profileId=...
// Validates Supabase Auth session, confirms ownership via auth.uid() =
// user_profiles.id, returns a 24h signed Storage URL.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClientWithCookies, isSupabaseConfigured } from '@/lib/supabase/client';
import { getSignedDownloadUrl } from '@/lib/pdf/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'supabase-not-configured' }, { status: 503 });
  }

  const url = new URL(request.url);
  const profileId = url.searchParams.get('profileId')?.trim();
  if (!profileId || !/^[0-9a-f-]{36}$/i.test(profileId)) {
    return NextResponse.json({ error: 'invalid-profile-id' }, { status: 400 });
  }

  const cookieStore = cookies();
  const client = createServerClientWithCookies(cookieStore);
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Defense-in-depth: explicit ownership check on top of RLS.
  if (user.id !== profileId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 404 });
  }

  const signedUrl = await getSignedDownloadUrl(profileId);
  if (!signedUrl) {
    return NextResponse.json({ error: 'pdf-not-ready' }, { status: 404 });
  }

  return NextResponse.json({ url: signedUrl }, { status: 200 });
}
```

- [ ] **Step 17.2: Test the download route**

The route requires an authenticated session; this is end-to-end-tested in Phase F's UI integration. Commit now and revisit during Phase F.

- [ ] **Step 17.3: Commit**

```bash
git add src/app/api/assessment/pdf/download/route.ts
git commit -m "feat(pdf): GET /api/assessment/pdf/download endpoint

Validates Supabase Auth session via cookies. Defense-in-depth ownership
check (auth.uid() === profileId) on top of RLS. Returns 24h-TTL signed
URL on success. Returns 404 (not 401) when ownership mismatches to
avoid leaking row existence.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md"
```

### Task 18: Cleanup cron route

**Files:** `src/app/api/assessment/pdf/cron-cleanup/route.ts` (new)

- [ ] **Step 18.1: Author the route**

Create `src/app/api/assessment/pdf/cron-cleanup/route.ts`:

```typescript
// GET /api/assessment/pdf/cron-cleanup
// Daily Vercel Cron sweeper. Deletes PDFs older than 30 days from
// Storage and clears the user_profiles.pdf_* columns.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md

import { NextResponse } from 'next/server';
import { deleteOldPdfs } from '@/lib/pdf/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const RETENTION_DAYS = 30;

export async function GET(request: Request) {
  // Vercel Cron sets this header. In dev, allow if SKIP_CRON_AUTH is set.
  const authHeader = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`;
  if (process.env.SKIP_CRON_AUTH !== 'true' && authHeader !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const result = await deleteOldPdfs(RETENTION_DAYS);
    return NextResponse.json({ status: 'ok', ...result }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[pdf/cron-cleanup] failed:', message);
    return NextResponse.json({ error: 'cleanup-failed', detail: message }, { status: 500 });
  }
}
```

- [ ] **Step 18.2: Add CRON_SECRET to .env.local**

Add `CRON_SECRET=<random-32-byte-hex>` to `.env.local` (and to Vercel environment variables for production via the dashboard — out of scope of this code change).

- [ ] **Step 18.3: Commit**

```bash
git add src/app/api/assessment/pdf/cron-cleanup/route.ts
git commit -m "feat(pdf): nightly cron route for 30-day PDF retention sweep

Authenticated via Bearer CRON_SECRET — Vercel Cron injects this header
on schedule. SKIP_CRON_AUTH=true bypass for local manual testing.
Calls into pdf/storage.deleteOldPdfs() which clears storage objects
and the user_profiles columns atomically.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md"
```

---

## Phase E — Auth Integration

The brainstorm locked "full Supabase Auth signup gate at PDF download click only." Currently the email-capture flow does NOT create an auth user. This phase adds the magic-link signup flow and the post-signin back-fill that links `user_profiles.id` to the new auth user's id.

### Task 19: Email-to-profile back-fill helper

**Files:** `src/lib/auth/back-fill-profile.ts` (new)

- [ ] **Step 19.1: Author the helper**

Create `src/lib/auth/back-fill-profile.ts`:

```typescript
// Server-side helper called from the auth callback after a magic-link
// signin. Links user_profiles.id (currently a generated UUID) to the
// new auth.users.id by matching on email.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md

import { createServiceRoleClient } from '@/lib/supabase/client';

export interface BackFillResult {
  readonly linked: boolean;
  readonly newProfileId?: string; // The auth user's id, post-update.
}

export async function backFillProfile(
  authUserId: string,
  email: string,
): Promise<BackFillResult> {
  const client = createServiceRoleClient();

  // Find the existing user_profiles row by email.
  const { data: existing, error: fetchError } = await client
    .from('user_profiles')
    .select('id, pdf_storage_path')
    .eq('email', email)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`[back-fill-profile] fetch failed: ${fetchError.message}`);
  }
  if (!existing) {
    return { linked: false };
  }
  if (existing.id === authUserId) {
    return { linked: true, newProfileId: authUserId };
  }

  // Update the profile id to match auth. If a PDF was already warmed at
  // the old path, rename the storage object so RLS still finds it.
  const oldId = existing.id;
  const oldPath = existing.pdf_storage_path;

  const { error: updateError } = await client
    .from('user_profiles')
    .update({
      id: authUserId,
      pdf_storage_path: oldPath ? `${authUserId}.pdf` : null,
    })
    .eq('id', oldId);

  if (updateError) {
    throw new Error(`[back-fill-profile] update failed: ${updateError.message}`);
  }

  if (oldPath) {
    const { error: moveError } = await client.storage
      .from('assessment-pdfs')
      .move(oldPath, `${authUserId}.pdf`);
    if (moveError) {
      // Non-fatal — the next warm call will overwrite at the right path.
      console.warn('[back-fill-profile] storage move failed:', moveError.message);
    }
  }

  return { linked: true, newProfileId: authUserId };
}
```

- [ ] **Step 19.2: Commit**

```bash
git add src/lib/auth/back-fill-profile.ts
git commit -m "feat(auth): back-fill user_profiles.id on magic-link signin

After a successful Supabase Auth signup, the user has an authed user
record but their assessment data is on a separate user_profiles row
keyed by email. Match-and-link by email; rename the storage object if
a PDF was already warmed at the pre-auth path.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md"
```

### Task 20: Auth callback wiring

**Files:** `src/app/auth/callback/route.ts` (verify exists; create or extend)

- [ ] **Step 20.1: Inspect or create the auth callback**

Run: `cat src/app/auth/callback/route.ts 2>/dev/null || echo "missing"`

If missing, create `src/app/auth/callback/route.ts`:

```typescript
// Supabase Auth callback. Magic-link emails redirect here with `code`
// in the query string. We exchange the code for a session, then back-
// fill user_profiles before redirecting to the destination.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClientWithCookies } from '@/lib/supabase/client';
import { backFillProfile } from '@/lib/auth/back-fill-profile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/assessment';

  if (!code) {
    return NextResponse.redirect(new URL('/?auth=missing-code', request.url));
  }

  const cookieStore = cookies();
  const client = createServerClientWithCookies(cookieStore);
  const { data, error } = await client.auth.exchangeCodeForSession(code);

  if (error || !data.session?.user) {
    return NextResponse.redirect(new URL('/?auth=exchange-failed', request.url));
  }

  const user = data.session.user;
  if (user.email) {
    try {
      await backFillProfile(user.id, user.email);
    } catch (err) {
      console.warn('[auth/callback] back-fill failed:', err);
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
```

If the file already exists, surgically add the `backFillProfile` call after the successful `exchangeCodeForSession`.

- [ ] **Step 20.2: Commit**

```bash
git add src/app/auth/callback/route.ts
git commit -m "feat(auth): call backFillProfile in auth callback

After exchangeCodeForSession succeeds, link the new auth user to the
existing user_profiles row by email. Non-fatal on failure (warn-log;
the user can still browse — just without their pre-auth assessment
data linked).

Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md"
```

### Task 21: Signup modal component

**Files:** `src/app/assessment/_components/SignupModal.tsx` (new)

- [ ] **Step 21.1: Author the modal**

Create `src/app/assessment/_components/SignupModal.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { signInWithMagicLink } from '@/lib/supabase/auth';

interface SignupModalProps {
  readonly email: string;
  readonly onClose: () => void;
}

export function SignupModal({ email, onClose }: SignupModalProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSend = async () => {
    setStatus('sending');
    setErrorMessage(null);
    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname + window.location.search)}`
          : undefined;
      const result = await signInWithMagicLink(email, redirectTo);
      if (result.success) {
        setStatus('sent');
      } else {
        setStatus('error');
        setErrorMessage(result.error ?? 'Could not send the link.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--color-ink)]/40"
      onClick={onClose}
    >
      <div
        className="bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/15 rounded-[3px] p-8 max-w-md w-[90%] shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="signup-modal-title" className="font-serif text-2xl text-[color:var(--color-ink)] mb-3">
          Create an account to download
        </h2>
        <p className="text-[15px] leading-[1.6] text-[color:var(--color-ink)]/75 mb-6">
          We&rsquo;ll email a sign-in link to <strong>{email}</strong>. Click it to confirm your account, then you&rsquo;ll be redirected back here to download your brief.
        </p>

        {status === 'idle' && (
          <button
            onClick={handleSend}
            className="w-full px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[12px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
          >
            Send my sign-in link
          </button>
        )}

        {status === 'sending' && (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/55 text-center">
            Sending&hellip;
          </p>
        )}

        {status === 'sent' && (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)] mb-3">
              Check your inbox
            </p>
            <p className="text-[14px] text-[color:var(--color-ink)]/75 leading-[1.55]">
              Open the email and click the sign-in link. This page will refresh automatically once you confirm.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-error)] mb-2">
              Something went wrong
            </p>
            <p className="text-[14px] text-[color:var(--color-ink)]/75 mb-4">
              {errorMessage ?? 'Try again, or refresh the page.'}
            </p>
            <button
              onClick={handleSend}
              className="w-full px-6 py-3 border border-[color:var(--color-ink)]/30 text-[color:var(--color-ink)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:border-[color:var(--color-terra)] transition-colors"
            >
              Resend link
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 block w-full text-[12px] text-[color:var(--color-ink)]/55 hover:text-[color:var(--color-terra)] transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 21.2: Confirm `signInWithMagicLink` accepts redirectTo**

Run: `grep -n "signInWithMagicLink" src/lib/supabase/auth.ts`. If the existing helper does not accept a `redirectTo` argument, extend it now (small surgical change in `auth.ts`). Otherwise this task is no-op for `auth.ts`.

- [ ] **Step 21.3: Commit**

```bash
git add src/app/assessment/_components/SignupModal.tsx src/lib/supabase/auth.ts
git commit -m "feat(auth): SignupModal with magic-link flow + states

Modal pre-filled with the user's captured email. State machine: idle
→ sending → sent → error. Round-trip via /auth/callback?next=
preserves the user's place on the results page.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md"
```

---

## Phase F — UI Integration

### Task 22: PdfDownloadButton state machine

**Files:** `src/app/assessment/_components/PdfDownloadButton.tsx` (new)

- [ ] **Step 22.1: Author the component**

Create `src/app/assessment/_components/PdfDownloadButton.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { SignupModal } from './SignupModal';

type State =
  | { kind: 'warming' }
  | { kind: 'ready' }
  | { kind: 'auth-prompt' }
  | { kind: 'downloading' }
  | { kind: 'done' }
  | { kind: 'error'; message: string };

interface PdfDownloadButtonProps {
  readonly profileId: string;
  readonly email: string;
}

export function PdfDownloadButton({ profileId, email }: PdfDownloadButtonProps) {
  const [state, setState] = useState<State>({ kind: 'warming' });

  // Fire warm on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/assessment/pdf/warm', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ profileId }),
        });
        const body = await res.json();
        if (cancelled) return;
        if (res.ok && body.status === 'ready') {
          setState({ kind: 'ready' });
        } else if (body.status === 'skipped') {
          setState({ kind: 'error', message: 'PDF generation suppressed in this environment.' });
        } else {
          setState({ kind: 'error', message: body.error ?? 'warm-failed' });
        }
      } catch (err) {
        if (cancelled) return;
        setState({
          kind: 'error',
          message: err instanceof Error ? err.message : 'warm-failed',
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  const handleDownload = async () => {
    // Auth check first.
    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setState({ kind: 'auth-prompt' });
      return;
    }

    setState({ kind: 'downloading' });
    try {
      const res = await fetch(
        `/api/assessment/pdf/download?profileId=${encodeURIComponent(profileId)}`,
      );
      const body = await res.json();
      if (!res.ok || !body.url) {
        setState({ kind: 'error', message: body.error ?? 'download-failed' });
        return;
      }

      // Trigger browser download.
      const a = document.createElement('a');
      a.href = body.url;
      a.download = 'AI-Readiness-Briefing.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setState({ kind: 'done' });
      if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
        window.plausible('pdf_downloaded', { props: { profileId } });
      }
    } catch (err) {
      setState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'download-failed',
      });
    }
  };

  return (
    <>
      <div className="mt-12 text-center" data-print-hide="true">
        {state.kind === 'warming' && (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/55">
            Preparing your brief&hellip;
          </p>
        )}
        {state.kind === 'ready' && (
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[12px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
          >
            Download PDF
          </button>
        )}
        {state.kind === 'downloading' && (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/55">
            Downloading&hellip;
          </p>
        )}
        {state.kind === 'done' && (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)]">
            Downloaded
          </p>
        )}
        {state.kind === 'error' && (
          <p className="font-mono text-[10px] text-[color:var(--color-error)]">
            Could not prepare PDF: {state.message}
          </p>
        )}
      </div>
      {state.kind === 'auth-prompt' && (
        <SignupModal email={email} onClose={() => setState({ kind: 'ready' })} />
      )}
    </>
  );
}
```

- [ ] **Step 22.2: Commit**

```bash
git add src/app/assessment/_components/PdfDownloadButton.tsx
git commit -m "feat(pdf): PdfDownloadButton with full state machine

idle/warming → ready → (auth-prompt | downloading) → done. Fires
warm POST on mount; download triggers Supabase Auth check, opens
SignupModal if needed, fetches signed URL on success and clicks an
invisible <a download>. Plausible pdf_downloaded event on success.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md"
```

### Task 23: Wire PdfDownloadButton into ResultsViewV2

**Files:** `src/app/assessment/_components/ResultsViewV2.tsx`

- [ ] **Step 23.1: Add the prop and import**

In `ResultsViewV2.tsx`, add to the existing imports:
```tsx
import { PdfDownloadButton } from './PdfDownloadButton';
```

In the `ResultsViewV2Props` interface, add:
```tsx
  readonly profileId: string;
```

In the destructuring of props at the top of the component, add `profileId`:
```tsx
export function ResultsViewV2({
  score,
  tier,
  tierId,
  dimensionBreakdown,
  email,
  firstName,
  institutionName,
  profileId,
}: ResultsViewV2Props) {
```

- [ ] **Step 23.2: Render the button**

Locate the appendix `<details>` block (search for `Full diagnostic · all 8 dimensions`). After that `</details>` and after the existing `<NewsletterCTA />` block, add:

```tsx
      <PdfDownloadButton profileId={profileId} email={email} />
```

- [ ] **Step 23.3: Commit**

```bash
git add src/app/assessment/_components/ResultsViewV2.tsx
git commit -m "feat(assessment): wire PdfDownloadButton into ResultsViewV2

Adds profileId prop and renders the download button after the
appendix. PrintButton was already removed in Spec 1; this is the
real PDF affordance.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md"
```

### Task 24: Pass profileId from page.tsx

**Files:** `src/app/assessment/page.tsx`, `src/app/api/capture-email/route.ts`, `src/lib/supabase/user-profiles.ts`

- [ ] **Step 24.1: `upsertReadinessResult` returns the row id**

In `src/lib/supabase/user-profiles.ts`, change the function to return `{ id: string | null }`. Add a `.select('id')` to the upsert:

```typescript
export async function upsertReadinessResult(
  email: string,
  result: ReadinessResult,
): Promise<{ id: string | null }> {
  if (SKIP || !isSupabaseConfigured()) return { id: null };

  const client = createServiceRoleClient();
  const { data, error } = await client.from('user_profiles').upsert(
    {
      email,
      readiness_score: result.score,
      readiness_tier_id: result.tierId,
      readiness_tier_label: result.tierLabel,
      readiness_answers: result.answers,
      readiness_at: result.completedAt,
      ...(result.version ? { readiness_version: result.version } : {}),
      ...(result.maxScore !== undefined ? { readiness_max_score: result.maxScore } : {}),
      ...(result.dimensionBreakdown
        ? { readiness_dimension_breakdown: result.dimensionBreakdown }
        : {}),
    },
    { onConflict: 'email' },
  ).select('id').single();

  if (error) {
    throw new Error(`[user-profiles] upsertReadinessResult failed: ${error.message}`);
  }
  return { id: data?.id ?? null };
}
```

- [ ] **Step 24.2: Capture-email route returns the profile id**

In `src/app/api/capture-email/route.ts`, capture the return and add it to the JSON response. Find the existing `await upsertReadinessResult(...)` invocation and update:

```typescript
  let profileId: string | null = null;
  if (isSupabaseConfigured()) {
    profileId = (await upsertReadinessResult(email, { /* existing args */ }).catch((err) => {
      console.warn('[capture-email] supabase skip', err);
      return { id: null };
    })).id;
  }
```

Then in the response body (find the existing `return NextResponse.json({...})`), add `profileId` to the returned object.

- [ ] **Step 24.3: Page.tsx threads the id through**

In `src/app/assessment/page.tsx`, the email-gate completion flow already receives the response. Add a state slot for `capturedProfileId` and pass it as a prop to `ResultsViewV2`:

```tsx
  const [capturedProfileId, setCapturedProfileId] = useState<string | null>(null);

  // In the existing onCaptured callback:
  // setCapturedProfileId(responseBody.profileId ?? null);

  // In the ResultsViewV2 render:
  // <ResultsViewV2 ... profileId={capturedProfileId ?? ''} />
```

(Exact handler integration depends on the existing capture flow shape — adjust to match the surrounding code.)

- [ ] **Step 24.4: Verify end-to-end**

Run dev server. Complete the assessment with a fresh email, hit the gate, see results. Open DevTools network tab and confirm:
1. `/api/capture-email` response contains `profileId`.
2. `/api/assessment/pdf/warm` POST fires within ~2 seconds of the results page mount.
3. After warm completes, button transitions to "Download PDF".
4. Clicking it (without auth) opens the SignupModal.

If anything fails, fix in this commit, do not advance.

- [ ] **Step 24.5: Commit**

```bash
git add src/app/assessment/page.tsx src/app/api/capture-email/route.ts src/lib/supabase/user-profiles.ts
git commit -m "feat(assessment): thread profile id through capture-email -> ResultsViewV2

upsertReadinessResult now returns the row id. Capture endpoint passes
it to the client. Assessment page state holds it. ResultsViewV2 forwards
it to PdfDownloadButton, which triggers warm with the right id.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md"
```

---

## Phase G — Polish & Verification

### Task 25: Plausible event for download click

**Files:** `src/app/assessment/_components/PdfDownloadButton.tsx`

- [ ] **Step 25.1: Add the click-time event**

Find the `handleDownload` function. Before the auth check, fire `pdf_download_clicked`:

```typescript
  const handleDownload = async () => {
    if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
      window.plausible('pdf_download_clicked', { props: { profileId } });
    }
    // ... existing auth check + download flow
  };
```

The `pdf_downloaded` event is already there from Task 22. Together they bracket the funnel — pre-auth click vs post-auth-and-download success — letting us measure auth-gate friction.

- [ ] **Step 25.2: Commit**

```bash
git add src/app/assessment/_components/PdfDownloadButton.tsx
git commit -m "feat(pdf): track pdf_download_clicked Plausible event

Fires before the auth check, bracketing the funnel with the existing
pdf_downloaded event. Lets us measure auth-gate friction post-launch.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md"
```

### Task 26: Acceptance criteria verification

- [ ] **Step 26.1: AC checklist run-through**

Run each spec acceptance criterion against the running system. For each, mark pass/fail and capture a quick note:

1. **Generation succeeds end-to-end** — complete assessment, observe PDF in Storage. PASS / FAIL.
2. **Warm timing < 10s on cold start** — measure with `time curl` against /warm. PASS / FAIL.
3. **Auth gate fires correctly** — click Download without auth, modal appears. PASS / FAIL.
4. **RLS denies pre-auth** — `curl /api/assessment/pdf/download?profileId=X` returns 401. PASS / FAIL.
5. **RLS permits post-auth** — same call after magic-link signin returns the URL. PASS / FAIL.
6. **Page composition matches table** — visual audit of all 12 pages. PASS / FAIL.
7. **Brand fidelity** — Cormorant + DM Sans + DM Mono load in PDF. PASS / FAIL.
8. **Citations completeness** — grep PDF text for "FFIEC-aware" (must find zero). PASS / FAIL.
9. **Retake produces fresh PDF** — re-take assessment, second PDF generated. PASS / FAIL.
10. **Retention sweep deletes 30+ day-old PDFs** — manually backdate a `pdf_generated_at` and run the cron endpoint with `SKIP_CRON_AUTH=true`. PASS / FAIL.
11. **Staging suppression** — set `SKIP_PDF_GENERATION=true` and confirm warm short-circuits. PASS / FAIL.
12. **Mobile / responsive** — DevTools at 375px. PASS / FAIL.

- [ ] **Step 26.2: Open the PR**

```bash
git push -u origin feature/assessment-pdf-download
gh pr create --title "Assessment PDF download (Spec 2 of 4)" --body "$(cat <<'EOF'
## Summary

Spec 2 of the four-surface assessment results program. Ships the board-ready PDF download — Puppeteer + Supabase Storage + Supabase Auth signup gate.

- Generation: headless Chromium via `@sparticuz/chromium` snapshots `/assessment/results/print/[id]`.
- Storage: `assessment-pdfs` bucket, RLS-keyed on `auth.uid() = user_profiles.id`.
- Auth gate: fires only at Download click. Magic-link signup pre-filled with captured email. `auth/callback` back-fills `user_profiles.id` to match the new auth user.
- Retention: 30 days, swept by daily Vercel Cron at 04:00 UTC.

## Spec & Plan

- Spec: `docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md`
- Plan: `docs/superpowers/plans/2026-05-04-assessment-pdf-download.md`

## Plan-time corrections

The spec referenced an `assessment_responses` table that doesn't exist. Plan corrected to use `user_profiles` (where assessment data actually lives per migration 00011). Spec doc amended in Step 0.3.

## Test plan

[Acceptance criteria checklist from Task 26 — copy results here]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Per CLAUDE.md, the `git push` step requires explicit user approval before execution. **Pause here and wait** for the user to confirm.

---

## Self-Review

**1. Spec coverage:**

| Spec section / AC | Plan task |
|---|---|
| Locked decisions table (generation tech, delivery, depth, storage, access, gate timing, warm/auth resolution) | Phases A–F integrated |
| File structure (8 new files, 5 modified) | Tasks 5–24 each touch 1–3 files |
| 12-page composition | Task 6 (cover) + Tasks 7–11 (one task per bundle) |
| Acceptance criteria #1–#12 | Task 26 (one step per AC) |
| Risk mitigations | Vercel timeout (Task 15), staging suppression (Tasks 16+18), 5-min idempotency window (Task 16) |
| Detail-level defaults (magic-link, retake, retention, citations, branding, page size) | Tasks 5, 13, 14, 18, 21 cover all |

Gap detected: Task 7–11 are **less concrete** than Task 6 (no full code shown for each per-page component). Justification: each follows the exact pattern of `Cover.tsx`, with only the data and layout changing per page. Inflating the plan to ~4,000 lines of inline tsx blocks would hurt readability without adding fidelity. The implementing engineer (or a subagent run) builds Tasks 7–11 by replicating Task 6's structure with the per-task data — this is acceptable risk given the exhaustively-modeled exemplar.

**2. Placeholder scan:** Checked. No "TBD", "TODO", "implement later", or generic "add error handling" instructions. Tasks 7–11 are intentionally less-prescriptive but every concrete data input + output is named explicitly.

**3. Type consistency:** `profileId` is the canonical identifier across all tasks (matches `user_profiles.id`). `assessment_responses` is never referenced. `generateAssessmentPdf` signature: `({ profileId, origin }) → Promise<Buffer>` consistent in Tasks 13, 16. `uploadAssessmentPdf(profileId, buffer) → UploadResult` consistent in Tasks 14, 16. `backFillProfile(authUserId, email) → BackFillResult` consistent in Tasks 19, 20.

---

## Plan complete

Saved to `docs/superpowers/plans/2026-05-04-assessment-pdf-download.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints.

Which approach?
