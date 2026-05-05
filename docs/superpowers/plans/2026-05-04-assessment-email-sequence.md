# Assessment Email Sequence (Spec 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire ConvertKit tier-tag routing into the email-capture flow so a successful assessment lands the user in one of four tier-keyed nurture sequences authored in the ConvertKit dashboard.

**Architecture:** A new `src/lib/convertkit/sequences.ts` module owns the real ConvertKit Tag API calls (`POST /v3/tags/:tag_id/subscribe` and the unsubscribe counterpart). The `/api/capture-email` route calls it after the existing form-subscribe and Supabase write, gated on `marketingOptIn`. A new `user_profiles` column records when the tag was added for ops debugging and idempotency. Retake re-routing reads the prior tier from `user_profiles` before the upsert overwrites it.

**Tech Stack:** Next.js 14 App Router, TypeScript strict mode, Supabase (postgres + service role client), ConvertKit v3 REST API, Plausible (deferred-queue pattern).

---

## Plan-time corrections

The spec doc references an `assessment_responses` table. The codebase uses `user_profiles` (Spec 2 plan-time correction documented at `docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md`). All migration and column references in this plan target `user_profiles`. The new column lives alongside the existing `readiness_*` family and is named `readiness_convertkit_tier_tagged_at` so its purpose is unambiguous.

The spec also assumes a fully-implemented ConvertKit form-subscribe path. In reality, `src/lib/convertkit/index.ts::subscribeToAssessmentForm` is a stub that throws if `CONVERTKIT_API_KEY` is set; the call site at `src/app/api/capture-email/route.ts:158` swallows the throw via `.catch()`. Spec 3 only ships the **tag-subscribe** integration. The form-subscribe stub remains as-is and is tracked as a separate followup. This plan therefore creates a NEW module `src/lib/convertkit/sequences.ts` rather than extending the stub.

The new feature lives on `feature/assessment-email-sequence` from `main` after Spec 2 (PR #41) has merged. If Spec 2 is still open at execution time, pause and ask.

---

## File structure

**New files:**

| Path | Purpose |
|---|---|
| `src/lib/convertkit/sequences.ts` | Real ConvertKit v3 Tag API: `tagAssessmentTier`, `removeAssessmentTier`, `TIER_TO_TAG_ENV`. |
| `src/lib/convertkit/sequences.test.ts` | Vitest unit tests with `fetch` mocked. |
| `supabase/migrations/00027_readiness_convertkit_tagged_at.sql` | Adds `readiness_convertkit_tier_tagged_at timestamptz` to `user_profiles`. |

**Modified files:**

| Path | Why |
|---|---|
| `src/app/api/capture-email/route.ts` | Insert tag-subscribe call after the existing Supabase upsert; pre-read prior tier for retake unsubscribe; stamp the new column. |
| `src/lib/supabase/user-profiles.ts` | Add `getReadinessTierByEmail(email)` helper for the retake-detection read; add `markConvertKitTagged(profileId)` write. |
| `.env.local.example` (if it exists, otherwise just docs) | Document the four new tag-id env vars. Skipped if file not present. |

---

## Phase A — Pre-flight + schema

### Task 0: Pre-flight worktree + spec sanity

**Files:** none (operational)

- [ ] **Step 0.1: Confirm Spec 2 PR has merged**

Run:

```bash
gh pr view 41 --json state,mergedAt -q '{state, mergedAt}'
```

Expected: `state: "MERGED"`. If still `OPEN`, STOP and surface to the user — Spec 3 depends on Spec 2 migrations and `user_profiles` shape.

- [ ] **Step 0.2: Create the worktree**

```bash
cd ~/Projects/TheAiBankingInstitute
git fetch origin main
git worktree add ../aibi-email-sequence -b feature/assessment-email-sequence origin/main
ln -s ~/Projects/TheAiBankingInstitute/.env.local ../aibi-email-sequence/.env.local
cd ../aibi-email-sequence && npm install
```

Verify: `git worktree list` shows the new path on `feature/assessment-email-sequence`.

- [ ] **Step 0.3: Verify migration baseline**

Run: `ls supabase/migrations/ | tail -5`

Expected output ends with `00026_assessment_pdfs_bucket.sql` (Spec 2's last migration). If `00026_*` is missing, Spec 2 wasn't merged correctly — STOP and ask.

### Task 1: Migration 00027 — convertkit-tagged-at column

**Files:**
- Create: `supabase/migrations/00027_readiness_convertkit_tagged_at.sql`

- [ ] **Step 1.1: Write the migration**

Create `supabase/migrations/00027_readiness_convertkit_tagged_at.sql`:

```sql
-- 00027_readiness_convertkit_tagged_at.sql
-- Spec 3: ConvertKit-driven 3-email × 4-tier sequence.
--
-- Records when the user_profiles row was tagged into the appropriate tier
-- sequence in ConvertKit. NULL means: never tagged (e.g. marketing_opt_in
-- was false, or the assessment predates Spec 3, or the CK call failed).
--
-- Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-3-email.md

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS readiness_convertkit_tier_tagged_at timestamptz;

COMMENT ON COLUMN public.user_profiles.readiness_convertkit_tier_tagged_at IS
  'Timestamp when ConvertKit tier-sequence tag was last added for this user. NULL = never tagged.';
```

- [ ] **Step 1.2: Apply via Supabase MCP**

Use the Supabase MCP `apply_migration` tool with `name: "20260504_readiness_convertkit_tagged_at"` and the SQL body from Step 1.1.

Expected: success. If MCP rejects with a duplicate-column error, the column already exists — accept that and continue.

- [ ] **Step 1.3: Verify column exists**

Use Supabase MCP `execute_sql`:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
  AND column_name = 'readiness_convertkit_tier_tagged_at';
```

Expected: one row, `data_type = timestamp with time zone`, `is_nullable = YES`.

- [ ] **Step 1.4: Commit**

```bash
git add supabase/migrations/00027_readiness_convertkit_tagged_at.sql
git commit -m "feat(supabase): add readiness_convertkit_tier_tagged_at to user_profiles

Records when ConvertKit's tier-sequence tag was added. NULL means
never tagged (opt-out, pre-Spec-3 row, or CK call failed). Used for
ops debugging and idempotency in the capture-email route.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-3-email.md
Phase A Task 1.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase B — ConvertKit tag adapter

### Task 2: Tier→tag-env mapping module

**Files:**
- Create: `src/lib/convertkit/sequences.ts`

- [ ] **Step 2.1: Author the module skeleton with mappings**

Create `src/lib/convertkit/sequences.ts`:

```typescript
// ConvertKit tier-sequence tag adapter.
// Adds and removes per-tier tags so the user lands in the right ConvertKit
// Sequence (one Sequence per tier, triggered by tag-add).
//
// Spec 3 only calls the Tag API. The form-subscribe path lives in
// ./index.ts and remains a stub until that work ships.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-3-email.md

const CK_API_BASE = 'https://api.convertkit.com/v3';

export type TierId =
  | 'starting-point'
  | 'early-stage'
  | 'building-momentum'
  | 'ready-to-scale';

// Maps each tierId to the env var that holds that tier's CK tag id.
// The dashboard step (one-time) creates the four tags and the operator
// pastes their numeric ids into .env.local (and Vercel env).
export const TIER_TO_TAG_ENV: Record<TierId, string> = {
  'starting-point': 'CONVERTKIT_TAG_ID_STARTING_POINT',
  'early-stage': 'CONVERTKIT_TAG_ID_EARLY_STAGE',
  'building-momentum': 'CONVERTKIT_TAG_ID_BUILDING_MOMENTUM',
  'ready-to-scale': 'CONVERTKIT_TAG_ID_READY_TO_SCALE',
};

export interface TagResult {
  readonly status: 'tagged' | 'skipped' | 'failed';
  readonly reason?: string;
}

function isStaging(): boolean {
  return process.env.SKIP_CONVERTKIT === 'true';
}

function getApiKey(): string | null {
  return process.env.CONVERTKIT_API_KEY ?? null;
}

function getTagIdForTier(tier: TierId): string | null {
  const envName = TIER_TO_TAG_ENV[tier];
  return process.env[envName] ?? null;
}
```

- [ ] **Step 2.2: Add `tagAssessmentTier`**

Append to `src/lib/convertkit/sequences.ts`:

```typescript
export interface TagInput {
  readonly email: string;
  readonly tierId: TierId;
  readonly firstName?: string;
}

/**
 * Add the per-tier ConvertKit tag for this email. Triggers the Sequence
 * whose "When subscriber is added to tag X" automation matches.
 *
 * Returns 'skipped' (not an error) when:
 *   - SKIP_CONVERTKIT=true (staging)
 *   - CONVERTKIT_API_KEY missing
 *   - the tier's tag id env var is unset
 *
 * Returns 'failed' (logs warn) when the API call returns non-2xx.
 * Never throws — capture-email's success path must not block on CK.
 */
export async function tagAssessmentTier(input: TagInput): Promise<TagResult> {
  if (isStaging()) {
    return { status: 'skipped', reason: 'staging-suppression' };
  }
  const apiKey = getApiKey();
  if (!apiKey) {
    return { status: 'skipped', reason: 'no-api-key' };
  }
  const tagId = getTagIdForTier(input.tierId);
  if (!tagId) {
    return { status: 'skipped', reason: `no-tag-id-for-${input.tierId}` };
  }

  try {
    const res = await fetch(`${CK_API_BASE}/tags/${tagId}/subscribe`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        email: input.email,
        ...(input.firstName ? { first_name: input.firstName } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => 'unknown');
      console.warn(
        `[convertkit/sequences] tagAssessmentTier failed: ${res.status} ${detail}`,
      );
      return { status: 'failed', reason: `${res.status}` };
    }
    return { status: 'tagged' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.warn('[convertkit/sequences] tagAssessmentTier error:', message);
    return { status: 'failed', reason: message };
  }
}
```

- [ ] **Step 2.3: Add `removeAssessmentTier`**

Append to `src/lib/convertkit/sequences.ts`:

```typescript
/**
 * Remove the per-tier ConvertKit tag from this email. Used on retake when
 * the new tier differs from the old. ConvertKit's tag-unsubscribe endpoint
 * is `POST /v3/tags/:tag_id/unsubscribe` with the email in the body.
 *
 * Returns 'skipped' on the same conditions as tagAssessmentTier. Never throws.
 */
export async function removeAssessmentTier(input: TagInput): Promise<TagResult> {
  if (isStaging()) {
    return { status: 'skipped', reason: 'staging-suppression' };
  }
  const apiKey = getApiKey();
  if (!apiKey) {
    return { status: 'skipped', reason: 'no-api-key' };
  }
  const tagId = getTagIdForTier(input.tierId);
  if (!tagId) {
    return { status: 'skipped', reason: `no-tag-id-for-${input.tierId}` };
  }

  try {
    const res = await fetch(`${CK_API_BASE}/tags/${tagId}/unsubscribe`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        api_secret: apiKey,
        email: input.email,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => 'unknown');
      console.warn(
        `[convertkit/sequences] removeAssessmentTier failed: ${res.status} ${detail}`,
      );
      return { status: 'failed', reason: `${res.status}` };
    }
    return { status: 'tagged' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.warn('[convertkit/sequences] removeAssessmentTier error:', message);
    return { status: 'failed', reason: message };
  }
}
```

> **API note:** ConvertKit's tag-unsubscribe endpoint requires `api_secret`, not `api_key`. The codebase already uses `CONVERTKIT_API_KEY` for everything; if the dashboard distinguishes them, set both to the secret value, or rename later. For v1 keep the single env var and document in the env-var setup step.

- [ ] **Step 2.4: Typecheck**

Run: `npx tsc --noEmit`

Expected: clean exit. If errors, fix the offending types in `sequences.ts` before continuing.

- [ ] **Step 2.5: Commit**

```bash
git add src/lib/convertkit/sequences.ts
git commit -m "feat(convertkit): tag-add + tag-remove adapter for tier sequences

Real ConvertKit v3 Tag API integration. tagAssessmentTier triggers
the per-tier nurture sequence. removeAssessmentTier handles retake
re-routing. Both honor SKIP_CONVERTKIT and missing-api-key by
returning a skipped TagResult (never throwing) — capture-email's
success path must never block on CK availability.

Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-3-email.md
Phase B Task 2.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 3: Vitest smoke test for the adapter

**Files:**
- Create: `src/lib/convertkit/sequences.test.ts`

- [ ] **Step 3.1: Confirm vitest is installed**

Run: `ls node_modules/vitest 2>/dev/null && echo OK || echo MISSING`

If `MISSING`, this codebase does not run vitest — skip Task 3 entirely and proceed to Task 4. If `OK`, continue.

- [ ] **Step 3.2: Author the test**

Create `src/lib/convertkit/sequences.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tagAssessmentTier, removeAssessmentTier } from './sequences';

describe('convertkit/sequences', () => {
  const ORIGINAL_ENV = { ...process.env };
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.SKIP_CONVERTKIT;
    process.env.CONVERTKIT_API_KEY = 'test-key';
    process.env.CONVERTKIT_TAG_ID_STARTING_POINT = '1001';
    fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ subscription: {} }), { status: 200 }),
    );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    process.env = ORIGINAL_ENV;
  });

  it('skips when SKIP_CONVERTKIT=true', async () => {
    process.env.SKIP_CONVERTKIT = 'true';
    const result = await tagAssessmentTier({
      email: 'a@example.com',
      tierId: 'starting-point',
    });
    expect(result.status).toBe('skipped');
    expect(result.reason).toBe('staging-suppression');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('skips when api key is missing', async () => {
    delete process.env.CONVERTKIT_API_KEY;
    const result = await tagAssessmentTier({
      email: 'a@example.com',
      tierId: 'starting-point',
    });
    expect(result.status).toBe('skipped');
    expect(result.reason).toBe('no-api-key');
  });

  it('skips when the tier tag id env var is missing', async () => {
    delete process.env.CONVERTKIT_TAG_ID_STARTING_POINT;
    const result = await tagAssessmentTier({
      email: 'a@example.com',
      tierId: 'starting-point',
    });
    expect(result.status).toBe('skipped');
    expect(result.reason).toBe('no-tag-id-for-starting-point');
  });

  it('posts to /tags/:id/subscribe with the api_key body', async () => {
    const result = await tagAssessmentTier({
      email: 'a@example.com',
      tierId: 'starting-point',
      firstName: 'Sam',
    });
    expect(result.status).toBe('tagged');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.convertkit.com/v3/tags/1001/subscribe');
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body as string);
    expect(body.api_key).toBe('test-key');
    expect(body.email).toBe('a@example.com');
    expect(body.first_name).toBe('Sam');
  });

  it('returns failed (not throws) on non-2xx response', async () => {
    fetchSpy.mockResolvedValue(new Response('rate limited', { status: 429 }));
    const result = await tagAssessmentTier({
      email: 'a@example.com',
      tierId: 'starting-point',
    });
    expect(result.status).toBe('failed');
    expect(result.reason).toBe('429');
  });

  it('removeAssessmentTier hits /tags/:id/unsubscribe', async () => {
    const result = await removeAssessmentTier({
      email: 'a@example.com',
      tierId: 'starting-point',
    });
    expect(result.status).toBe('tagged');
    const [url] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.convertkit.com/v3/tags/1001/unsubscribe');
  });
});
```

- [ ] **Step 3.3: Run the test**

Run: `npx vitest run src/lib/convertkit/sequences.test.ts`

Expected: all 6 tests pass. If any fails, fix the corresponding code in `sequences.ts`.

- [ ] **Step 3.4: Commit**

```bash
git add src/lib/convertkit/sequences.test.ts
git commit -m "test(convertkit): vitest smoke tests for tag adapter

Verifies skip paths (staging, no key, no tag id), happy-path POST
url + body, non-2xx returns failed (not throws), and the unsubscribe
endpoint shape.

Refs: docs/superpowers/plans/2026-05-04-assessment-email-sequence.md
Phase B Task 3.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase C — Capture-email integration

### Task 4: Tier-by-email read helper

**Files:**
- Modify: `src/lib/supabase/user-profiles.ts`

- [ ] **Step 4.1: Append the helper**

In `src/lib/supabase/user-profiles.ts`, after the existing exports (and before any helpers section if present), append:

```typescript
/**
 * Read just the prior readiness_tier_id for an email. Used by capture-email
 * BEFORE the upsert overwrites the row, so retake re-routing knows which
 * old tier tag to remove from ConvertKit.
 *
 * Returns null when no row exists, when SKIP_SUPABASE_PROFILES=true,
 * or when Supabase is not configured.
 */
export async function getReadinessTierByEmail(
  email: string,
): Promise<string | null> {
  if (SKIP || !isSupabaseConfigured()) return null;

  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('user_profiles')
    .select('readiness_tier_id')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.warn('[user-profiles] getReadinessTierByEmail failed:', error.message);
    return null;
  }
  return (data?.readiness_tier_id as string | null) ?? null;
}
```

- [ ] **Step 4.2: Append a stamp helper**

In the same file, append:

```typescript
/**
 * Stamp the user_profiles row to record when the ConvertKit tier-sequence
 * tag was added. Best-effort — capture-email logs and continues on failure.
 */
export async function markConvertKitTagged(profileId: string): Promise<void> {
  if (SKIP || !isSupabaseConfigured()) return;

  const client = createServiceRoleClient();
  const { error } = await client
    .from('user_profiles')
    .update({ readiness_convertkit_tier_tagged_at: new Date().toISOString() })
    .eq('id', profileId);

  if (error) {
    console.warn('[user-profiles] markConvertKitTagged failed:', error.message);
  }
}
```

- [ ] **Step 4.3: Typecheck**

Run: `npx tsc --noEmit`

Expected: clean exit.

- [ ] **Step 4.4: Commit**

```bash
git add src/lib/supabase/user-profiles.ts
git commit -m "feat(user-profiles): add getReadinessTierByEmail + markConvertKitTagged

getReadinessTierByEmail reads the prior tier so capture-email can
remove the stale CK tag on retake before the upsert overwrites it.
markConvertKitTagged stamps readiness_convertkit_tier_tagged_at on
successful tag-add.

Refs: docs/superpowers/plans/2026-05-04-assessment-email-sequence.md
Phase C Task 4.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 5: Wire tag-add + retake-remove into capture-email

**Files:**
- Modify: `src/app/api/capture-email/route.ts`

- [ ] **Step 5.1: Import the new helpers**

At the top of `src/app/api/capture-email/route.ts`, alongside the existing imports, add:

```typescript
import {
  upsertReadinessResult,
  getReadinessTierByEmail,
  markConvertKitTagged,
} from '@/lib/supabase/user-profiles';
import {
  tagAssessmentTier,
  removeAssessmentTier,
  type TierId,
} from '@/lib/convertkit/sequences';
```

(Replace the existing single-import line for `upsertReadinessResult`.)

- [ ] **Step 5.2: Read prior tier BEFORE the upsert**

Find this block in the route handler (around line 173–187 currently):

```typescript
  if (isSupabaseConfigured()) {
    await upsertReadinessResult(email, {
      // ...
    }).catch((err) => console.warn('[capture-email] supabase skip', err));
  }
```

Replace it with:

```typescript
  // Read the prior tier BEFORE the upsert so we know whether to remove
  // a stale CK tag on retake. Captured here even if upsert fails — we
  // still want to fix CK state if it drifted.
  const priorTierId = isSupabaseConfigured()
    ? ((await getReadinessTierByEmail(email)) as TierId | null)
    : null;

  let profileId: string | null = null;
  if (isSupabaseConfigured()) {
    const result = await upsertReadinessResult(email, {
      score,
      tierId: tier,
      tierLabel,
      answers,
      completedAt,
      ...(version ? { version } : {}),
      ...(maxScore !== undefined ? { maxScore } : {}),
      ...(dimensionBreakdown ? { dimensionBreakdown } : {}),
    }).catch((err) => {
      console.warn('[capture-email] supabase skip', err);
      return { id: null as string | null };
    });
    profileId = result.id;
  }
```

> **Note:** Spec 2 already added `profileId` capture and the response carries it. If `profileId` is already declared earlier in the file (Spec 2 may have moved it), keep the single declaration and only add the `priorTierId` line plus reuse the existing `profileId`. Run `grep -n "profileId" src/app/api/capture-email/route.ts` first to verify.

- [ ] **Step 5.3: Add the tag-add + retake-remove block**

Immediately after the upsert block above, insert:

```typescript
  // ConvertKit tier-sequence routing. Honors marketing_opt_in only.
  // Retake re-route: if the prior tier differs, remove its tag first so
  // the user lands cleanly in the new tier's sequence.
  if (marketingOptIn === true) {
    const newTier = tier as TierId;

    if (priorTierId && priorTierId !== newTier) {
      const removed = await removeAssessmentTier({
        email,
        tierId: priorTierId as TierId,
      });
      if (removed.status === 'failed') {
        console.warn(
          '[capture-email] CK retake unsubscribe failed:',
          removed.reason,
        );
      }
    }

    const added = await tagAssessmentTier({
      email,
      tierId: newTier,
      ...(trimmedFirstName ? { firstName: trimmedFirstName } : {}),
    });

    if (added.status === 'tagged' && profileId) {
      await markConvertKitTagged(profileId);
    } else if (added.status === 'failed') {
      console.warn('[capture-email] CK tier tag failed:', added.reason);
    }
  }
```

- [ ] **Step 5.4: Typecheck the route**

Run: `npx tsc --noEmit`

Expected: clean exit. Common failure: `tier as TierId` is too loose if `TierId` is a string literal union — TypeScript may reject the cast. Fix by adding a runtime guard:

```typescript
const VALID_TIERS: ReadonlySet<string> = new Set([
  'starting-point',
  'early-stage',
  'building-momentum',
  'ready-to-scale',
]);
if (marketingOptIn === true && VALID_TIERS.has(tier)) {
  const newTier = tier as TierId;
  // ... rest of the block
}
```

If you hit this, replace the `if (marketingOptIn === true) {` opening with the guarded version above. The body stays the same.

- [ ] **Step 5.5: Run a build smoke**

Run: `npm run build`

Expected: success. If the build fails, fix the offending types before continuing.

- [ ] **Step 5.6: Commit**

```bash
git add src/app/api/capture-email/route.ts
git commit -m "feat(capture-email): tier-tag CK + retake re-route + stamp profile

After the user_profiles upsert: if marketingOptIn=true and the new tier
differs from the prior, remove the stale CK tag, then add the new one.
On successful tag-add, stamp readiness_convertkit_tier_tagged_at via
markConvertKitTagged. All CK calls are non-blocking — capture-email
success is independent of CK availability.

Refs: docs/superpowers/plans/2026-05-04-assessment-email-sequence.md
Phase C Task 5.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 6: Plausible `convertkit_tag_added` event

**Files:**
- Modify: `src/app/api/capture-email/route.ts`

> **Why server-side?** The Plausible queue pattern in CLAUDE.md is browser-side. Capture-email runs on the server, so we cannot fire `window.plausible` from here. Instead we return a flag in the response and let the client fire the event after the gate handler resolves.

- [ ] **Step 6.1: Return a flag from the API**

In the route's final response, replace:

```typescript
  return NextResponse.json({ ok: true, profileId });
```

With:

```typescript
  return NextResponse.json({
    ok: true,
    profileId,
    convertkitTagAdded: marketingOptIn === true,
  });
```

(The flag is a local-knowledge signal, not the actual API result — the call may still have skipped or failed downstream. If the operator wants exact success-vs-skip telemetry, route through Supabase logs or extend the flag to the `TagResult.status`. For v1 we keep it simple: opt-in true → fire the event.)

- [ ] **Step 6.2: Update EmailGate to forward the flag and fire Plausible**

Open `src/app/assessment/_components/EmailGate.tsx`. Find the `onCaptured(...)` invocation that currently passes `firstName`, `institutionName`, `profileId`. Surrounding code (Spec 2 Task 24):

```typescript
      onCaptured(trimmedEmail, {
        firstName: firstName.trim() || undefined,
        institutionName: institutionName.trim() || undefined,
        profileId: data.profileId ?? null,
      });
```

Above the `onCaptured(...)` call, add:

```typescript
      if (
        data.convertkitTagAdded &&
        typeof window !== 'undefined' &&
        typeof window.plausible === 'function'
      ) {
        window.plausible('convertkit_tag_added', {
          props: { tier: tierId, opt_in: marketingOptIn },
        });
      }
```

Also extend the local `data` type assertion to include the new field. Find:

```typescript
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        profileId?: string | null;
      };
```

Replace with:

```typescript
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        profileId?: string | null;
        convertkitTagAdded?: boolean;
      };
```

- [ ] **Step 6.3: Typecheck**

Run: `npx tsc --noEmit`

Expected: clean exit.

- [ ] **Step 6.4: Commit**

```bash
git add src/app/api/capture-email/route.ts src/app/assessment/_components/EmailGate.tsx
git commit -m "feat(analytics): fire convertkit_tag_added Plausible event client-side

API returns convertkitTagAdded boolean reflecting the opt-in decision
made server-side. EmailGate fires the Plausible event with tier prop
once the response resolves.

Refs: docs/superpowers/plans/2026-05-04-assessment-email-sequence.md
Phase C Task 6.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Phase D — Build-time guard + verification

### Task 7: Build-time guard against SKIP_CONVERTKIT=true in production

**Files:**
- Modify: `next.config.mjs` (or wherever the existing build config lives)

- [ ] **Step 7.1: Confirm config path**

Run: `ls next.config.mjs next.config.js next.config.ts 2>/dev/null`

Expected: one path is printed. Use that path for Step 7.2.

- [ ] **Step 7.2: Author the assertion**

Open the config file. At the very top of the file (after any imports, before the config object), insert:

```javascript
// Production guard: SKIP_CONVERTKIT=true must never reach prod, or every
// real user opt-in silently skips the CK call and the nurture sequence
// never fires. The staging suppression flag is only for staging/preview.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-3-email.md
if (
  process.env.NODE_ENV === 'production' &&
  process.env.VERCEL_ENV === 'production' &&
  process.env.SKIP_CONVERTKIT === 'true'
) {
  throw new Error(
    '[next.config] SKIP_CONVERTKIT=true detected in production environment. ' +
      'This flag is for staging only. Remove it from Vercel production env vars before deploying.',
  );
}
```

> **Why both `NODE_ENV` and `VERCEL_ENV`?** Local `next build` sets `NODE_ENV=production` regardless of where it's running. Pairing with `VERCEL_ENV=production` ensures we only crash the build when Vercel is actually building for the production environment.

- [ ] **Step 7.3: Smoke the assertion**

Run:

```bash
NODE_ENV=production VERCEL_ENV=production SKIP_CONVERTKIT=true node -e "import('./next.config.mjs').catch(e => { console.log('CAUGHT:', e.message); process.exit(0); })"
```

Expected: prints `CAUGHT: [next.config] SKIP_CONVERTKIT=true detected in production environment. ...`. If the assertion does not fire, fix the file extension or the import path.

- [ ] **Step 7.4: Confirm normal builds still pass**

Run: `npm run build`

Expected: success. (No env vars set means the guard does nothing.)

- [ ] **Step 7.5: Commit**

```bash
git add next.config.mjs
git commit -m "chore(build): assert SKIP_CONVERTKIT=true never reaches production

Throws at build start if NODE_ENV=production AND VERCEL_ENV=production
AND SKIP_CONVERTKIT=true. Prevents the silent-skip footgun where every
real user opt-in flows through staging suppression.

Refs: docs/superpowers/plans/2026-05-04-assessment-email-sequence.md
Phase D Task 7.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

### Task 8: Acceptance criteria + PR

**Files:** none (verification only)

- [ ] **Step 8.1: AC checklist run-through**

For each criterion, mark pass/fail and capture a quick note:

1. **Tagging fires correctly** — with all four `CONVERTKIT_TAG_ID_*` env vars set and `CONVERTKIT_API_KEY` set, complete an assessment with `marketingOptIn=true`. Inspect ConvertKit dashboard → Subscribers → search by email → confirm the right tier tag is present. PASS / FAIL.
2. **Opt-out honored** — repeat with `marketingOptIn=false`. Confirm no tag appears in CK dashboard. Server logs note nothing (no skip-warning either; the call simply isn't made). PASS / FAIL.
3. **Staging suppression** — set `SKIP_CONVERTKIT=true` and re-test opt-in. Confirm zero CK API calls in network logs and the server logs `tagAssessmentTier` not invoked OR the adapter returned `{ status: 'skipped', reason: 'staging-suppression' }`. PASS / FAIL.
4. **Idempotency** — submit the same opt-in capture twice. Confirm the user has the tag exactly once in CK (CK's tag-subscribe is idempotent — verifies behavior matches expectation). PASS / FAIL.
5. **Retake re-routes correctly** — submit Starting Point capture, verify tag. Submit Building Momentum capture from same email, verify Starting Point tag is removed and Building Momentum tag is present. PASS / FAIL.
6. **Schema migration applied cleanly** — query `\d user_profiles` (or via Supabase Studio) and confirm `readiness_convertkit_tier_tagged_at` column exists with `timestamp with time zone` type, nullable. PASS / FAIL.
7. **Sequence content authored end-to-end** — operator manually verifies in CK dashboard. Out-of-scope of code review; track in launch checklist. NOT-CODE-VERIFIABLE.
8. **Email #1 lands in inbox** — operator manually tests with Gmail and Outlook addresses. NOT-CODE-VERIFIABLE.
9. **Unsubscribe link works** — operator manually tests. NOT-CODE-VERIFIABLE.
10. **Plausible event tracking** — open Plausible dashboard, complete an opt-in assessment, confirm `convertkit_tag_added` appears with `tier` prop within 5 minutes. PASS / FAIL.

- [ ] **Step 8.2: Open the PR (paused for explicit user approval)**

Per CLAUDE.md, `git push` requires explicit user approval. STOP HERE and surface the PR command to the user. When they approve, run:

```bash
git push -u origin feature/assessment-email-sequence
gh pr create --title "Assessment email sequence — ConvertKit tier tagging (Spec 3 of 4)" --body "$(cat <<'EOF'
## Summary

Spec 3 of the four-surface assessment results program. Wires the email-capture flow into ConvertKit's tier-sequence automations.

- **Adapter:** new \`src/lib/convertkit/sequences.ts\` calls \`POST /v3/tags/:tag_id/subscribe\` and the unsubscribe counterpart. Returns structured TagResult; never throws.
- **Capture flow:** capture-email reads prior tier BEFORE upsert, removes stale tag on retake, adds new tag, stamps \`readiness_convertkit_tier_tagged_at\`.
- **Schema:** migration 00027 adds the timestamp column to \`user_profiles\` (NULL default).
- **Analytics:** \`convertkit_tag_added\` Plausible event fires client-side after the API confirms opt-in.
- **Build guard:** \`next.config.mjs\` rejects \`SKIP_CONVERTKIT=true\` in Vercel production.

Email body content + cadence + subject lines live in the ConvertKit dashboard (one Sequence per tier, four total). The repo holds only the tagging integration.

## Spec & Plan

- Spec: \`docs/superpowers/specs/2026-05-04-assessment-results-spec-3-email.md\`
- Plan: \`docs/superpowers/plans/2026-05-04-assessment-email-sequence.md\`

## Plan-time corrections

- Spec referenced \`assessment_responses\` — corrected to \`user_profiles\` per the same Spec 2 correction.
- Spec assumed \`subscribeToAssessmentForm\` was real — it's a stub. New module \`sequences.ts\` is the first real CK integration; form subscribe stub is tracked as a separate followup.

## Required env-var setup

- \`CONVERTKIT_API_KEY\` — already in CLAUDE.md
- \`CONVERTKIT_TAG_ID_STARTING_POINT\`
- \`CONVERTKIT_TAG_ID_EARLY_STAGE\`
- \`CONVERTKIT_TAG_ID_BUILDING_MOMENTUM\`
- \`CONVERTKIT_TAG_ID_READY_TO_SCALE\`
- \`SKIP_CONVERTKIT=true\` — Vercel staging env only

Plus four Tags + four Sequences authored in the ConvertKit dashboard before the launch.

## Test plan

- [ ] Tagging fires for each tier (manual, requires CK dashboard access)
- [ ] Opt-out skips the call cleanly
- [ ] Staging suppression returns skipped TagResult
- [ ] Retake removes prior tier tag before adding new
- [ ] Migration 00027 applied cleanly
- [ ] Plausible \`convertkit_tag_added\` event fires
- [ ] Build guard fails when SKIP_CONVERTKIT=true + VERCEL_ENV=production

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review

**1. Spec coverage:**

| Spec section / AC | Plan task |
|---|---|
| Locked decisions: trigger on capture, 3 emails / 7 days, Sequence-per-tier | Task 5 (capture-email integration triggers tagging on capture) |
| Detail-level email job map | Out-of-code (CK dashboard) — flagged in PR body |
| Per-tier Sequence structure / tag naming | Task 2 (TIER_TO_TAG_ENV mapping) |
| Suppression — opt-out honored | Task 5 (`if (marketingOptIn === true)` guard) |
| Suppression — retake re-routing | Task 5 (Step 5.3 prior-tier read + remove) |
| Suppression — booked-briefing exit (v1.1) | Out-of-scope — explicitly deferred per spec |
| Subject lines defaults | Out-of-code (CK dashboard) — flagged in PR body |
| Architecture: `sequences.ts` | Task 2 |
| Architecture: migration 00027 | Task 1 |
| Architecture: capture-email modification | Task 5 |
| Architecture: env vars | Task 2.1 (TIER_TO_TAG_ENV) + PR body required-setup |
| AC #1 Tagging fires | Task 8 Step 1 |
| AC #2 Opt-out honored | Task 8 Step 2 |
| AC #3 Staging suppression | Task 8 Step 3 |
| AC #4 Idempotency | Task 8 Step 4 |
| AC #5 Retake re-routes | Task 8 Step 5 |
| AC #6 Migration cleanly applied | Task 1 + Task 8 Step 6 |
| AC #7 Sequence content authored | Out-of-code — operator gate |
| AC #8 Email lands in inbox | Out-of-code — operator gate |
| AC #9 Unsubscribe link works | Out-of-code — operator gate |
| AC #10 Plausible event tracking | Task 6 + Task 8 Step 10 |
| Risk: rate-limited at peak | Existing rate-limit (CLAUDE.md) handles it; CK errors are non-blocking by design (Task 2 contract) |
| Risk: SKIP_CONVERTKIT pushed to prod | Task 7 build guard |
| Risk: tag-id drift | Per-environment env vars (Task 2.1) |

Gap detected: **none in code-side coverage.** Operator-gated criteria (AC #7, #8, #9) are correctly out-of-scope for code work and called out in the launch checklist.

**2. Placeholder scan:** None. All steps contain exact code, exact commands, expected outputs.

**3. Type consistency:** `TierId` is the canonical literal-union type defined once in `sequences.ts` (Task 2.1) and imported in `route.ts` (Task 5.1). `TagInput` carries `email`, `tierId`, optional `firstName` consistently across `tagAssessmentTier` (Task 2.2), `removeAssessmentTier` (Task 2.3), and the call sites (Task 5.3). `TagResult` is consistent across both functions. `getReadinessTierByEmail` returns `string | null` (Task 4.1) and the route narrows to `TierId | null` via cast at the call site (Task 5.2). `markConvertKitTagged` takes a `profileId: string` consistent with Spec 2's `profileId` thread (Task 5.3).
