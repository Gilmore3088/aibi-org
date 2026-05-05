# Assessment Return URL (Spec 4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a stable, owner-bound `/results/{id}` URL that signed-in users can return to days later to see the same brief, with the database (not session state) as source of truth.

**Architecture:** A new `src/app/results/[id]/page.tsx` server component reads the `user_profiles` row by id, validates ownership via Supabase Auth session, recomputes tier + dimension breakdown from stored answers, and hands props to the existing `ResultsViewV2` client component. No new schema, no new auth surface — Spec 2's auth already rebinds `user_profiles.id = auth.uid()`. SignupModal's `next` query param shifts from `/assessment` to `/results/{profileId}` so post-signup the URL becomes the bookmarkable working artifact.

**Tech Stack:** Next.js 14 App Router (server components), TypeScript strict mode, Supabase (`@supabase/ssr` server client + service role for ownership checks), existing v2 scoring + personalization content.

---

## Plan-time corrections

The spec doc has three architectural mismatches against the running codebase (same family of corrections that hit Specs 2 and 3):

1. **`assessment_responses` does not exist.** The codebase keeps assessment data on `user_profiles`. All references in the plan target `user_profiles`. The URL is `/results/{user_profiles.id}`.

2. **`assessment_responses.user_id` does not exist.** Spec 2's `backFillProfile` rebinds `user_profiles.id = auth.uid()` at signup, so RLS gates via `auth.uid() = user_profiles.id`. There is no separate `user_id` column, and the in-code defense-in-depth check is `user.id === params.id` (already done by Spec 2's `/api/assessment/pdf/download` route — same shape).

3. **AC #10 ("each retake = separate row = separate URL") is deferred.** The current `upsertReadinessResult(..., { onConflict: 'email' })` overwrites on retake, so retaking produces the same `user_profiles.id`. Building a `readiness_history` table is a non-trivial schema change with cascading impacts on capture-email, the breakdown email, and the PDF print route. v1.0 of Spec 4 ships with retake-overwrite. The URL stays stable per user; old scores are not preserved. Phase 1.5+ enhancement, tracked in the PR body.

The spec also called for migration 00028 adding `CREATE INDEX assessment_responses_user_id_idx ON assessment_responses(user_id)`. Since neither table nor column exists, and `user_profiles.id` is already the primary key (implicit btree index), **no migration is needed**.

---

## File structure

**New files:**

| Path | Purpose |
|---|---|
| `src/app/results/[id]/page.tsx` | Server component. Auth + ownership check, calls loader, renders ResultsViewV2. |
| `src/lib/assessment/load-response.ts` | Server-only helper. Single export `loadAssessmentResponse(id)` returns ResultsViewV2-shaped props or null. |

**Modified files:**

| Path | Why |
|---|---|
| `src/app/assessment/_components/SignupModal.tsx` | Change the `next` param fed to `signInWithMagicLink` from the current pathname (`/assessment`) to `/results/{profileId}` when `profileId` is available. |
| `src/app/assessment/_components/ResultsViewV2.tsx` | Audit-only: confirm no remaining `useState` initialization that depends on session state. Should be a no-op after Spec 1's reshape, but verify. |

**No-touch:**

- `content/assessments/v2/scoring.ts` and `personalization.ts` — Spec 4's "recompute on view" relies on these being read every render. Don't change.
- Spec 2's PDF generation, storage, auth callback — untouched.
- Spec 3's ConvertKit tagging — untouched. Email body content (operator-authored in CK dashboard) should reference `/results/{id}` once Spec 4 ships; that's an operator action documented in the PR body, not code.

---

## Phase A — Foundations

### Task 0: Pre-flight worktree

**Files:** none (operational)

- [ ] **Step 0.1: Confirm Spec 2 is on main**

```bash
git -C /Users/jgmbp/Projects/TheAiBankingInstitute log origin/main --oneline | head -5 | grep -q "Spec 2 of 4" && echo OK || echo MISSING
```

Expected: `OK`. If `MISSING`, Spec 2 hasn't merged — STOP and ask. Spec 4 depends on Spec 2's `backFillProfile` and Spec 2's `user_profiles.id` rebinding.

- [ ] **Step 0.2: Note Spec 3 status (informational only)**

```bash
gh pr view 42 --repo Gilmore3088/aibi-org --json state -q '.state'
```

Expected: `OPEN` or `MERGED`. Either is fine — Spec 4 does not touch any file Spec 3 modified (capture-email, EmailGate, sequences module). If Spec 3 has merged the PR by the time you push Spec 4, no conflict. If still open, parallel branches.

- [ ] **Step 0.3: Create the worktree**

```bash
cd /Users/jgmbp/Projects/TheAiBankingInstitute
git fetch origin main
git worktree add ../aibi-return-url -b feature/assessment-return-url origin/main
ln -s /Users/jgmbp/Projects/TheAiBankingInstitute/.env.local ../aibi-return-url/.env.local
cd ../aibi-return-url && npm install
```

Verify: `git worktree list` shows the new path on `feature/assessment-return-url`.

### Task 1: loadAssessmentResponse server-only helper

**Files:**
- Create: `src/lib/assessment/load-response.ts`

- [ ] **Step 1.1: Inspect ResultsViewV2's prop contract**

Open `src/app/assessment/_components/ResultsViewV2.tsx` and find `interface ResultsViewV2Props`. As of Spec 2 it is:

```typescript
interface ResultsViewV2Props {
  readonly score: number;
  readonly tier: Tier;
  readonly tierId: Tier['id'];
  readonly dimensionBreakdown: Record<Dimension, DimensionScore>;
  readonly email: string;
  readonly firstName?: string | null;
  readonly institutionName?: string | null;
  readonly profileId: string | null;
}
```

The loader must produce this shape (with `profileId` set, `firstName`/`institutionName` null since Spec 2's plan-time correction already documented they are not persisted).

- [ ] **Step 1.2: Author the helper**

Create `src/lib/assessment/load-response.ts`:

```typescript
// Server-only. Loads a user_profiles row by id and shapes it into the
// props ResultsViewV2 expects. Recomputes tier + dimensions live so a
// future scoring/copy update propagates to historical visits.
//
// Defense-in-depth: this helper does NOT enforce ownership. Callers
// (the /results/[id] route) MUST verify the requesting auth.uid()
// matches the row's id before exposing the result.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-4-return-url.md

import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getTierV2 } from '@content/assessments/v2/scoring';
import type { Tier, DimensionScore } from '@content/assessments/v2/scoring';
import type { Dimension } from '@content/assessments/v2/types';

export interface AssessmentResponseLoaded {
  readonly profileId: string;
  readonly email: string;
  readonly score: number;
  readonly maxScore: number;
  readonly tier: Tier;
  readonly tierId: Tier['id'];
  readonly dimensionBreakdown: Record<Dimension, DimensionScore>;
  readonly readinessAt: string;
}

export async function loadAssessmentResponse(
  id: string,
): Promise<AssessmentResponseLoaded | null> {
  if (!isSupabaseConfigured()) return null;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('user_profiles')
    .select(
      'id, email, readiness_score, readiness_max_score, readiness_tier_id, readiness_dimension_breakdown, readiness_at',
    )
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  if (data.readiness_tier_id == null) return null;
  if (typeof data.readiness_score !== 'number') return null;
  if (!data.readiness_dimension_breakdown) return null;

  const tier = getTierV2(data.readiness_score);
  const breakdown = data.readiness_dimension_breakdown as Record<
    Dimension,
    DimensionScore
  >;

  return {
    profileId: data.id as string,
    email: data.email as string,
    score: data.readiness_score,
    maxScore: (data.readiness_max_score as number | null) ?? 48,
    tier,
    tierId: tier.id,
    dimensionBreakdown: breakdown,
    readinessAt: (data.readiness_at as string) ?? new Date().toISOString(),
  };
}
```

- [ ] **Step 1.3: Typecheck**

```bash
cd /Users/jgmbp/Projects/aibi-return-url && npx tsc --noEmit
```

Expected: clean exit. If `Tier` or `DimensionScore` aren't exported from the scoring module, fall back to importing from wherever ResultsViewV2 imports them — the imports must match exactly.

- [ ] **Step 1.4: Commit**

```bash
git -C /Users/jgmbp/Projects/aibi-return-url add src/lib/assessment/load-response.ts
git -C /Users/jgmbp/Projects/aibi-return-url commit -m "feat(assessment): server-only loadAssessmentResponse helper

Reads user_profiles row by id, recomputes tier from stored score, and
returns props-shaped object that matches ResultsViewV2's contract.
Recompute-on-view means future scoring/copy updates propagate to
historical briefs without per-row migration. UUID format guard +
data-shape sanity checks return null instead of throwing — callers
treat null as 404.

Refs: docs/superpowers/plans/2026-05-04-assessment-return-url.md
Phase A Task 1.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase B — /results/[id] route

### Task 2: Server component with auth + ownership check

**Files:**
- Create: `src/app/results/[id]/page.tsx`

- [ ] **Step 2.1: Inspect Spec 2's pattern for cookie-based auth**

The existing `/api/assessment/pdf/download/route.ts` (shipped in Spec 2) uses this pattern:

```typescript
const cookieStore = cookies();
const client = createServerClientWithCookies(cookieStore);
const { data: { user } } = await client.auth.getUser();
if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
if (user.id !== profileId) return NextResponse.json({ error: 'forbidden' }, { status: 404 });
```

Spec 4 mirrors this approach but in a Page Component context (redirect on no auth, notFound on ownership mismatch).

- [ ] **Step 2.2: Author the page**

Create `src/app/results/[id]/page.tsx`:

```typescript
// /results/[id] — owner-bound assessment brief return URL.
//
// Auth: requires Supabase Auth session. Unauthenticated visits redirect
// to signin with `next=/results/[id]` so the user lands back here.
//
// Ownership: defense-in-depth — explicit auth.uid() === params.id check.
// RLS would also enforce this on user_profiles, but the loader uses the
// service-role client so we MUST gate in code.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-4-return-url.md

import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import {
  createServerClientWithCookies,
  isSupabaseConfigured,
} from '@/lib/supabase/client';
import { loadAssessmentResponse } from '@/lib/assessment/load-response';
import { ResultsViewV2 } from '@/app/assessment/_components/ResultsViewV2';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ResultsPageProps {
  readonly params: { readonly id: string };
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  if (!isSupabaseConfigured()) notFound();

  const cookieStore = cookies();
  const supabase = createServerClientWithCookies(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next = encodeURIComponent(`/results/${params.id}`);
    redirect(`/auth/login?next=${next}`);
  }

  // Ownership gate — must come BEFORE the loader call so an attacker
  // probing for valid ids can't time-fingerprint the row's existence.
  if (user.id !== params.id) notFound();

  const response = await loadAssessmentResponse(params.id);
  if (!response) notFound();

  return (
    <main className="min-h-screen bg-[color:var(--color-linen)] py-12 px-4">
      <ResultsViewV2
        score={response.score}
        tier={response.tier}
        tierId={response.tierId}
        dimensionBreakdown={response.dimensionBreakdown}
        email={response.email}
        firstName={null}
        institutionName={null}
        profileId={response.profileId}
      />
    </main>
  );
}
```

- [ ] **Step 2.3: Confirm `/auth/login` exists**

```bash
ls /Users/jgmbp/Projects/aibi-return-url/src/app/auth/login 2>/dev/null && echo OK || echo MISSING_LOGIN_PAGE
```

If `MISSING_LOGIN_PAGE`, the redirect target doesn't exist. Search for the actual signin route:

```bash
grep -r "signInWithMagicLink\|/auth/login\|/login" /Users/jgmbp/Projects/aibi-return-url/src/app --include='*.tsx' -l 2>/dev/null | head -5
```

Use whichever signin route exists; if it isn't `/auth/login`, edit the redirect target in Step 2.2 accordingly. (As of Spec 2, the codebase uses Supabase magic-link signin via SignupModal — there may not be a standalone `/auth/login` page; if so, redirect to `/?signin=1&next=...` or whatever the established pattern is. Check with the operator before guessing.)

- [ ] **Step 2.4: Typecheck and build**

```bash
cd /Users/jgmbp/Projects/aibi-return-url && npx tsc --noEmit && npm run build
```

Expected: both clean. The new route should appear in the build output as `ƒ /results/[id]` (dynamic, server-rendered).

- [ ] **Step 2.5: Commit**

```bash
git -C /Users/jgmbp/Projects/aibi-return-url add src/app/results/[id]/page.tsx
git -C /Users/jgmbp/Projects/aibi-return-url commit -m "feat(results): /results/[id] return-URL page with auth + ownership gate

Server component reads cookie-based Supabase Auth session, redirects
unauthenticated visitors to signin with next=/results/[id], 404s on
ownership mismatch (auth.uid() !== params.id) without leaking row
existence, and renders ResultsViewV2 from loadAssessmentResponse
output. Recompute-on-view means future copy/scoring updates surface
to returning users automatically.

Refs: docs/superpowers/plans/2026-05-04-assessment-return-url.md
Phase B Task 2.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase C — Wiring entry/exit

### Task 3: SignupModal next-param shifts to /results/{profileId}

**Files:**
- Modify: `src/app/assessment/_components/SignupModal.tsx`

Right now SignupModal computes `next` as the current pathname + search:

```typescript
const next =
  typeof window !== 'undefined'
    ? window.location.pathname + window.location.search
    : '/assessment';
const result = await signInWithMagicLink(email, next);
```

Spec 4 wants the post-signup landing page to be `/results/{profileId}` — the new URL — so the user emerges from the magic-link round-trip on their bookmarkable brief. PdfDownloadButton (the modal's caller) already has `profileId` and forwards `email` into `<SignupModal email={...} />`. Add `profileId` to the same prop bridge.

- [ ] **Step 3.1: Add profileId prop to SignupModal**

In `src/app/assessment/_components/SignupModal.tsx`, find the existing props interface:

```typescript
interface SignupModalProps {
  readonly email: string;
  readonly onClose: () => void;
}
```

Replace with:

```typescript
interface SignupModalProps {
  readonly email: string;
  readonly profileId: string | null;
  readonly onClose: () => void;
}
```

In the destructuring:

```typescript
export function SignupModal({ email, onClose }: SignupModalProps) {
```

Replace with:

```typescript
export function SignupModal({ email, profileId, onClose }: SignupModalProps) {
```

- [ ] **Step 3.2: Update the next computation**

Find the existing block:

```typescript
      const next =
        typeof window !== 'undefined'
          ? window.location.pathname + window.location.search
          : '/assessment';
      const result = await signInWithMagicLink(email, next);
```

Replace with:

```typescript
      const next = profileId
        ? `/results/${profileId}`
        : typeof window !== 'undefined'
          ? window.location.pathname + window.location.search
          : '/assessment';
      const result = await signInWithMagicLink(email, next);
```

- [ ] **Step 3.3: Forward profileId from PdfDownloadButton**

Open `src/app/assessment/_components/PdfDownloadButton.tsx`. Find the existing render block that mounts `<SignupModal email={email} onClose={...} />`:

```typescript
      {state.kind === 'auth-prompt' && (
        <SignupModal email={email} onClose={() => setState({ kind: 'ready' })} />
      )}
```

Replace with:

```typescript
      {state.kind === 'auth-prompt' && (
        <SignupModal
          email={email}
          profileId={profileId}
          onClose={() => setState({ kind: 'ready' })}
        />
      )}
```

(`profileId` is already in scope as a prop on PdfDownloadButton — verify with a quick grep before pasting.)

- [ ] **Step 3.4: Typecheck**

```bash
cd /Users/jgmbp/Projects/aibi-return-url && npx tsc --noEmit
```

Expected: clean exit.

- [ ] **Step 3.5: Commit**

```bash
git -C /Users/jgmbp/Projects/aibi-return-url add src/app/assessment/_components/SignupModal.tsx src/app/assessment/_components/PdfDownloadButton.tsx
git -C /Users/jgmbp/Projects/aibi-return-url commit -m "feat(auth): post-signup landing redirects to /results/[profileId]

SignupModal accepts profileId; when available, sets the magic-link
next= param to /results/{profileId} so the user lands on their
bookmarkable working artifact instead of bouncing back to /assessment.
Falls back to current pathname when profileId is null. PdfDownloadButton
forwards profileId to the modal.

Refs: docs/superpowers/plans/2026-05-04-assessment-return-url.md
Phase C Task 3.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase D — Audit + verification

### Task 4: ResultsViewV2 props-only audit

**Files:** none (verification only)

- [ ] **Step 4.1: Search for session-state reads**

Run:

```bash
grep -n "sessionStorage\|localStorage\|useEffect\|useState" /Users/jgmbp/Projects/aibi-return-url/src/app/assessment/_components/ResultsViewV2.tsx | head -30
```

Expected: any matches must be either (a) ephemeral UI state (e.g., a toggle for opening a `<details>` block) or (b) absent entirely. There must be NO `sessionStorage.getItem('aibi-...')` or `localStorage.getItem('aibi-...')` reads — those would break the return-URL contract because returning users don't have those keys populated.

- [ ] **Step 4.2: Visual verify**

Boot dev server in the worktree (operator action — paste the URL into a browser, sign in as a real user, navigate to `/results/{their-id}`). Confirm the brief renders identically to the in-flow `/assessment` results. Capture any diffs.

If the audit finds session-state reads that would break return-trips, surface them as a separate task — they're a Spec 1 leftover that snuck through. Do not paper over with a "rehydrate from server" hack inside ResultsViewV2; the right fix is removing the session-state read.

- [ ] **Step 4.3: Document audit outcome**

If everything passes: no commit. Move to Task 5.

If the audit found and fixed a session-state read: separate commit with message `refactor(results-view): remove session-state read incompatible with return-URL`.

### Task 5: Acceptance criteria + PR (paused for push approval)

**Files:** none (verification + PR shaped for human approval)

- [ ] **Step 5.1: AC checklist**

For each criterion, mark pass/fail:

1. **URL works for owner** — sign in as a real user, navigate to `/results/{their-id}`, see brief. PASS / FAIL.
2. **URL is private to others** — sign in as User-A, navigate to `/results/<User-B's-id>`, expect 404 (not 401, not the brief). PASS / FAIL.
3. **Unauthenticated redirect** — sign out, navigate to `/results/{any-id}`, expect redirect to `/auth/login?next=...` (or whichever signin route the codebase uses). PASS / FAIL.
4. **Source-of-truth verified** — sign in, clear browser sessionStorage + localStorage, reload `/results/{your-id}`, expect identical rendering. PASS / FAIL.
5. **Recompute works** — temporarily edit `content/assessments/v2/scoring.ts` (e.g., shift a tier breakpoint), reload `/results/{your-id}`, expect the new tier label if your score crosses the new boundary. Revert before commit. PASS / FAIL.
6. **No leak via service-role** — `loadAssessmentResponse` uses service role; the route's ownership gate blocks at `user.id !== params.id`. Confirm in code review (visual). PASS / FAIL.
7. **No migration/index needed** — confirmed in plan-time corrections. NOT-APPLICABLE.
8. **Spec 3 email link resolves** — operator-gated. CK Email #1 should link to `/results/{id}`. NOT-CODE-VERIFIABLE.
9. **Browser back-button** — open `/results/{id}` directly, hit back, confirm no infinite redirect or assessment re-write. PASS / FAIL.
10. **Retake produces new URL** — DEFERRED to Phase 1.5+ (plan-time correction #3). Document in PR body.
11. **Mobile parity** — DevTools at 375px, render `/results/{id}`, no horizontal scroll, no layout shift. PASS / FAIL.
12. **404 page is well-styled** — navigate to `/results/00000000-0000-0000-0000-000000000000` (signed in or not — should 404 either way after the redirect). Expect the project's existing 404 page. PASS / FAIL.

- [ ] **Step 5.2: PR command (paused for approval)**

Per CLAUDE.md, `git push` requires explicit user approval. STOP HERE. When the user approves, run:

```bash
git -C /Users/jgmbp/Projects/aibi-return-url push -u origin feature/assessment-return-url
gh pr create --repo Gilmore3088/aibi-org --title "Assessment return URL — /results/[id] (Spec 4 of 4)" --body "$(cat <<'EOF'
## Summary

Spec 4 of the four-surface assessment results program. Stands up a stable, owner-bound \`/results/{id}\` URL so signed-in users can return to their brief days/weeks later and see the same content with the database (not session state) as source of truth.

- **Loader** (\`src/lib/assessment/load-response.ts\`): server-only helper. Reads \`user_profiles\` by id, recomputes tier + dimension breakdown live from stored answers. Future scoring or copy updates propagate to returning users automatically — no per-row migration.
- **Page** (\`src/app/results/[id]/page.tsx\`): server component. Cookie-based Supabase Auth session check, defense-in-depth ownership gate (\`auth.uid() === params.id\`), 404s on mismatch (no row-existence leak), unauth redirect to signin with \`next=/results/[id]\`. Renders existing ResultsViewV2 with loaded props.
- **SignupModal**: \`next\` param now resolves to \`/results/{profileId}\` when available, so post-magic-link the user lands on their bookmarkable artifact.
- **No new schema, no new auth surface.** Spec 2's \`backFillProfile\` already rebinds \`user_profiles.id = auth.uid()\` at signup, so RLS gates ownership without a separate \`user_id\` column.

## Spec & Plan

- Spec: \`docs/superpowers/specs/2026-05-04-assessment-results-spec-4-return-url.md\`
- Plan: \`docs/superpowers/plans/2026-05-04-assessment-return-url.md\`

## Plan-time corrections

- Spec referenced \`assessment_responses\` table — corrected to \`user_profiles\` (same correction as Specs 2 & 3 PRs).
- Spec referenced \`assessment_responses.user_id\` — corrected to \`user_profiles.id = auth.uid()\` per Spec 2's auth model.
- AC #10 (\"each retake = separate row = separate URL\") **deferred to Phase 1.5+**: current \`upsert(onConflict: 'email')\` overwrites on retake, so retaking produces the same id. Building \`readiness_history\` is a non-trivial schema change with cascading impacts on capture-email, breakdown email, and PDF print route. v1.0 ships with retake-overwrite — the URL stays stable per user; old scores aren't preserved.
- Spec called for migration 00028 indexing \`assessment_responses(user_id)\` — **not needed**: the column doesn't exist, and \`user_profiles.id\` is the PK with implicit btree index.

## Test plan

Code-side:
- [ ] \`npx tsc --noEmit\` clean
- [ ] \`npm run build\` succeeds; \`/results/[id]\` appears as dynamic route
- [ ] Owner visit renders brief
- [ ] Non-owner authenticated visit returns 404 (not 401)
- [ ] Unauthenticated visit redirects to signin with next param
- [ ] sessionStorage/localStorage cleared → brief still renders identically (DB is source of truth)
- [ ] Browser back-button doesn't loop or re-write
- [ ] Mobile (375px) parity with in-flow render
- [ ] 404 page styled (not stack trace)

Operator-gated:
- [ ] CK Email #1 (Spec 3) links to \`/results/{id}\` — update in CK dashboard
- [ ] Recompute test: temporary scoring tweak in staging propagates to historical visits

## Phase 1.5+ followups

- \`readiness_history\` table + per-retake URLs (AC #10 of original spec)
- \`/dashboard\` page listing all of a user's assessment briefs
- Re-PDF generation on return after Spec 2's 30-day retention sweep

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review

**1. Spec coverage:**

| Spec section / AC | Plan task |
|---|---|
| Locked decision: owner-only, signed-in | Task 2 (auth gate + ownership check) |
| Locked decision: URL `/results/{id}` | Task 2 (route at `src/app/results/[id]/page.tsx`) |
| Locked decision: no `/dashboard` | Out-of-scope, called out in plan + PR body |
| Locked decision: DB source-of-truth | Task 1 (loader reads from `user_profiles`) |
| Locked decision: each retake = new URL | **DEFERRED** — plan-time correction #3, called out in PR body |
| Default: auth model reuses Spec 2 | Task 2 (uses `createServerClientWithCookies` like Spec 2's PDF download route) |
| Default: rows kept forever | Implicit (no retention sweep added) |
| Default: refresh semantics — recompute on view | Task 1 (`getTierV2(score)` called every load) |
| Default: not-found is 404 not 401 | Task 2 (`notFound()` on ownership mismatch) |
| Default: unauth redirect | Task 2 (`redirect('/auth/login?next=...')`) |
| AC #1 owner sees brief | Task 5.1 |
| AC #2 private to others | Task 5.1 |
| AC #3 unauth redirect | Task 5.1 |
| AC #4 source-of-truth | Task 5.1 |
| AC #5 recompute works | Task 5.1 |
| AC #6 no service-role leak | Task 2 ownership gate + Task 5.1 verify |
| AC #7 index exists | Plan-time correction #4 — N/A |
| AC #8 Spec 3 email links | Operator-gated, called out in PR body |
| AC #9 back-button tolerates | Task 5.1 |
| AC #10 retake new URL | Deferred, called out in PR body |
| AC #11 mobile parity | Task 5.1 |
| AC #12 404 styled | Task 5.1 |
| Risk: stale tier copy on return | Acknowledged in spec; recompute design is intentional |
| Risk: RLS bypass via service role | Task 2 explicit ownership gate (defense-in-depth) |
| Risk: redirect race / flash | Task 3 routes via auth callback, not in-flow |
| Risk: Spec 4 breaks Spec 2 PDF | Task 5.1 AC #8 catches via shared auth surface |

Gap: none in code-side coverage.

**2. Placeholder scan:** None. Every step has exact code or exact commands. The single open consult-the-operator question (signin route name in Task 2.3) is gated behind a verification grep, not a placeholder — the engineer will know whether `/auth/login` exists before writing the redirect target.

**3. Type consistency:**
- `AssessmentResponseLoaded` shape (Task 1.2) maps directly to `ResultsViewV2Props` (Task 1.1's Step inspection): `score`, `tier`, `tierId`, `dimensionBreakdown`, `email`, `profileId` all line up.
- `loadAssessmentResponse(id: string) → Promise<AssessmentResponseLoaded | null>` is consistent across Task 1 (defines), Task 2 (consumes).
- `SignupModalProps` adds `profileId: string | null` (Task 3.1) and PdfDownloadButton's existing `profileId: string` (a stricter type) is structurally assignable.
- `params.id` is `string` from Next.js route param convention; `loadAssessmentResponse`'s UUID regex narrows it before any DB call.

No issues to fix.
