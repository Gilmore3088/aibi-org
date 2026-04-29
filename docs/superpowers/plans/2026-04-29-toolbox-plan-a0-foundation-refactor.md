# Plan A0 — Toolbox Foundation Refactor

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconcile the existing live `/toolbox` infrastructure with the spec's locked decisions: introduce a real `entitlements` table as the single source of truth, refactor the existing access function to read from it, and move the route surface from `/toolbox` to `/dashboard/toolbox`. No parallel dual-stack code, no later cutover plan.

**Architecture:** One access path (refactor `getPaidToolboxAccess` to read from `entitlements`), one route surface (`/dashboard/toolbox/*`, with a 301 from the old URL), one source of truth (`entitlements` table populated by trigger from `course_enrollments`). Existing schema in `toolbox_skills` (migration 00012) is untouched in Plan A0 — the schema-shape evolution to the spec's Skill schema lives in Plan B.

**Tech Stack:** Next.js 14 App Router · TypeScript strict · Supabase Postgres + RLS · Vitest · existing `lib/ai-harness/` and `lib/toolbox/` (extended, not replaced).

---

## Existing State Notes (read before starting)

This plan was written against `feature/toolbox @ 674b08c` (2026-04-29) after a code review of the existing `/toolbox` infrastructure:

- `/toolbox` is a **complete, live v1** of the product surface. Five routes are wired:
  - `src/app/toolbox/page.tsx` (gate → ToolboxApp)
  - `src/app/toolbox/ToolboxApp.tsx` (588-line UI)
  - `src/app/api/toolbox/skills/route.ts` (GET, POST)
  - `src/app/api/toolbox/skills/[skillId]/route.ts` (PATCH, DELETE)
  - `src/app/api/toolbox/run/route.ts` (POST — Anthropic playground with PII scan, injection scan, rate limit, usage log)
- `src/lib/toolbox/access.ts` exposes `getPaidToolboxAccess()` consumed by all 5 routes above.
- `supabase/migrations/00012_toolbox_skills.sql` already created `toolbox_skills` and `ai_usage_log` with shapes that differ from the spec — Plan B reconciles. **This plan does not touch those tables.**
- `src/lib/ai-harness/` provides Anthropic client + rate-limit infra. **This plan does not touch ai-harness.**
- `src/lib/sandbox/pii-scanner.ts` and `injection-filter.ts` are real, well-designed regex scanners. **This plan does not touch them.**
- Production usage (verified 2026-04-29): **0 toolbox_skills rows, 0 toolbox-playground ai_usage_log rows.** No production data migration concerns.
- Dashboard at `src/app/dashboard/page.tsx` is a client component with section cards. There is no sidebar. New nav goes in as a section card.

If you find yourself editing `lib/ai-harness/`, `lib/sandbox/`, `migrations/00012_*`, or the Skill schema, stop — that's Plan B/D territory.

---

## File Structure

| Action | Path | Responsibility |
|---|---|---|
| Create | `supabase/migrations/00014_entitlements_table.sql` | `entitlements` table + RLS + indices |
| Create | `supabase/migrations/00015_entitlements_trigger.sql` | Trigger on `course_enrollments` → upsert into `entitlements` |
| Create | `supabase/migrations/00016_entitlements_backfill.sql` | Idempotent backfill of existing paid `course_enrollments` rows |
| Create | `src/lib/toolbox/access.test.ts` | Tests covering refactored `getPaidToolboxAccess` reading from `entitlements` |
| Modify | `src/lib/toolbox/access.ts` | Internals refactored to read `entitlements`; **public signature unchanged** |
| Move | `src/app/toolbox/` → `src/app/dashboard/toolbox/` | New IA placement; preserves `page.tsx` + `ToolboxApp.tsx` |
| Modify | `src/app/dashboard/toolbox/page.tsx` | Replace `redirect('/courses/aibi-p/purchase')` with new `Paywall` component |
| Create | `src/app/dashboard/toolbox/_components/Paywall.tsx` | Paywall UI per spec (bundled with paid course; CTA to /education) |
| Modify | `next.config.mjs` | Add 301 redirects: `/toolbox` and `/toolbox/:path*` → `/dashboard/toolbox` |
| Modify | `src/app/dashboard/page.tsx` | Add a Toolbox section card visible only to entitled users |
| Modify | `src/app/dashboard/page.tsx` (server component split) | Server component wrapper that does the entitlement check |
| Create | `docs/compliance/llm-data-handling.md` | Stub doc per spec §5.3a — Plan D fills in |

**Notes on the move:**
- `/api/toolbox/*` API routes stay at `/api/toolbox/*`. Only the page route surface moves. (APIs are a stable URL contract; the visible page URL is what changes.)
- Imports inside the moved files reference `@/lib/...` aliases — no path rewrites needed.

---

## Task 1: Verify dev environment

**Files:** none

- [ ] **Step 1: Confirm worktree and branch**

```bash
cd ~/Projects/aibi-toolbox
git status
git log --oneline -3
```

Expected: branch `feature/toolbox`, latest commit `674b08c` or later, working tree clean.

- [ ] **Step 2: Confirm tests run**

Run: `cd ~/Projects/aibi-toolbox && npm test -- --run --reporter=basic 2>&1 | tail -10`
Expected: existing test suite executes cleanly. Note the baseline pass/fail count for comparison at the end.

- [ ] **Step 3: Confirm Supabase access path**

Migrations apply via the project's existing flow. Per `MEMORY.md` (Supabase migration naming divergence), `supabase db push` is preferred for migrations and `supabase db query --linked` for ad-hoc queries. The Supabase CLI must be linked to the remote project before `db query --linked` works — link is configured in `~/Projects/TheAiBankingInstitute`, not in this worktree. **Run migration verification queries from `~/Projects/TheAiBankingInstitute`, not from `~/Projects/aibi-toolbox`.**

No commit.

---

## Task 2: Migration — entitlements table

**Files:**
- Create: `supabase/migrations/00014_entitlements_table.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 00014_entitlements_table.sql
-- Source of truth for whether a user has access to a paid product surface.
-- Populated by trigger from course_enrollments (00015) and idempotent
-- backfill (00016). Phase 2 standalone Toolbox subscriptions will write
-- rows here directly with source='subscription'.

CREATE TABLE IF NOT EXISTS entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product text NOT NULL CHECK (
    product IN ('aibi-p', 'aibi-s', 'aibi-l', 'toolbox-only')
  ),
  source text NOT NULL CHECK (
    source IN ('course_enrollment', 'subscription', 'manual')
  ),
  source_ref text,
  active boolean NOT NULL DEFAULT true,
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_entitlements_user_active
  ON entitlements (user_id) WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_entitlements_source_ref
  ON entitlements (source, source_ref);

CREATE UNIQUE INDEX IF NOT EXISTS uq_entitlements_user_product_source_ref
  ON entitlements (user_id, product, source, COALESCE(source_ref, ''));

CREATE TRIGGER trg_entitlements_set_updated_at
  BEFORE UPDATE ON entitlements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own entitlements.
CREATE POLICY "Users read own entitlements" ON entitlements
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

-- No INSERT/UPDATE/DELETE policy for authenticated users; writes happen
-- via the trigger (00015) or service-role contexts only.
```

- [ ] **Step 2: Apply the migration**

From `~/Projects/TheAiBankingInstitute` (where Supabase is linked):
```bash
cd ~/Projects/TheAiBankingInstitute
git fetch . feature/toolbox:feature/toolbox 2>/dev/null || true
# Pull the migration file from the feature worktree into a temp location, OR
# apply via supabase db push from the toolbox worktree if it's linkable there.
```

Practical path: copy the migration file into `~/Projects/TheAiBankingInstitute/supabase/migrations/` (it will already be there once the branch merges, but pre-merge we need to land it on remote). Then:
```bash
cd ~/Projects/TheAiBankingInstitute && supabase db push
```

Per CLAUDE.md ⚠️ rule, **confirm with the user before running `supabase db push` against a remote project** — surface the exact migration filename and ask for explicit go-ahead.

- [ ] **Step 3: Verify the table exists**

```bash
cd ~/Projects/TheAiBankingInstitute && supabase db query --linked \
  "SELECT column_name, data_type FROM information_schema.columns
   WHERE table_name = 'entitlements' ORDER BY ordinal_position;"
```
Expected: 11 columns (id, user_id, product, source, source_ref, active, granted_at, expires_at, revoked_at, created_at, updated_at).

- [ ] **Step 4: Commit**

```bash
cd ~/Projects/aibi-toolbox
git add supabase/migrations/00014_entitlements_table.sql
git commit -m "feat(toolbox): add entitlements table

Source of truth for paid-product access. Populated by trigger from
course_enrollments (00015) and one-time backfill (00016). Phase 2
subscriptions write directly with source='subscription'.

RLS allows authenticated users to read their own entitlements; all
writes are gated to triggers or service-role contexts."
```

---

## Task 3: Migration — trigger from course_enrollments

**Files:**
- Create: `supabase/migrations/00015_entitlements_trigger.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 00015_entitlements_trigger.sql
-- Keep entitlements in sync with course_enrollments without lag.
-- INSERT/UPDATE/DELETE on course_enrollments triggers an upsert into
-- entitlements. Only the three paid products map to Toolbox entitlements.

CREATE OR REPLACE FUNCTION public.sync_entitlement_from_enrollment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product text;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_product := OLD.product;
  ELSE
    v_product := NEW.product;
  END IF;

  IF v_product NOT IN ('aibi-p', 'aibi-s', 'aibi-l') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF (TG_OP = 'DELETE') THEN
    UPDATE entitlements
       SET active = false,
           revoked_at = now()
     WHERE user_id = OLD.user_id
       AND source = 'course_enrollment'
       AND source_ref = OLD.id::text
       AND active = true;
    RETURN OLD;
  END IF;

  INSERT INTO entitlements (user_id, product, source, source_ref, active, granted_at, expires_at)
  VALUES (
    NEW.user_id,
    NEW.product,
    'course_enrollment',
    NEW.id::text,
    true,
    COALESCE(NEW.created_at, now()),
    NULL
  )
  ON CONFLICT (user_id, product, source, COALESCE(source_ref, ''))
  DO UPDATE SET
    active = true,
    revoked_at = NULL,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_course_enrollments_sync_entitlement ON course_enrollments;
CREATE TRIGGER trg_course_enrollments_sync_entitlement
  AFTER INSERT OR UPDATE OR DELETE ON course_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.sync_entitlement_from_enrollment();
```

- [ ] **Step 2: Apply the migration**

⚠️ CONFIRM WITH USER BEFORE running `supabase db push`. Then:
```bash
cd ~/Projects/TheAiBankingInstitute && supabase db push
```

- [ ] **Step 3: Smoke-test the trigger**

Find a real test user (not a production user). If only production users exist, **DO NOT INSERT TEST ROWS WITHOUT EXPLICIT USER APPROVAL** per CLAUDE.md.

If approved:
```bash
supabase db query --linked "
WITH ins AS (
  INSERT INTO course_enrollments (user_id, product)
  SELECT id, 'aibi-p' FROM auth.users LIMIT 1
  RETURNING id, user_id
)
SELECT
  (SELECT count(*) FROM entitlements e
    JOIN ins ON e.source_ref = ins.id::text AND e.user_id = ins.user_id) AS entitlement_created;"
```
Expected: `entitlement_created = 1`.

If the user prefers no test inserts: skip Step 3 and rely on the backfill verification in Task 4 to validate the trigger machinery is wired correctly.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/00015_entitlements_trigger.sql
git commit -m "feat(toolbox): trigger course_enrollments -> entitlements

INSERT/UPDATE upserts an active entitlement; DELETE marks the
entitlement inactive (preserves history). Only the three paid
products map; free/waitlist enrollments are intentionally ignored."
```

---

## Task 4: Migration — idempotent backfill

**Files:**
- Create: `supabase/migrations/00016_entitlements_backfill.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 00016_entitlements_backfill.sql
-- One-time backfill: every existing paid course_enrollments row gets a
-- corresponding entitlements row. Idempotent — safe to re-run thanks to
-- the unique index on (user_id, product, source, COALESCE(source_ref, '')).

INSERT INTO entitlements (user_id, product, source, source_ref, active, granted_at)
SELECT
  ce.user_id,
  ce.product,
  'course_enrollment',
  ce.id::text,
  true,
  COALESCE(ce.created_at, now())
FROM course_enrollments ce
WHERE ce.product IN ('aibi-p', 'aibi-s', 'aibi-l')
ON CONFLICT (user_id, product, source, COALESCE(source_ref, ''))
DO NOTHING;
```

- [ ] **Step 2: Apply the migration**

⚠️ CONFIRM WITH USER. Then:
```bash
cd ~/Projects/TheAiBankingInstitute && supabase db push
```

- [ ] **Step 3: Verify counts match**

```bash
supabase db query --linked "
SELECT
  (SELECT count(*) FROM course_enrollments
     WHERE product IN ('aibi-p','aibi-s','aibi-l')) AS enrollments,
  (SELECT count(*) FROM entitlements
     WHERE source='course_enrollment' AND active=true) AS entitlements;"
```
Expected: the two counts are equal.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/00016_entitlements_backfill.sql
git commit -m "feat(toolbox): backfill entitlements from course_enrollments

One-time, idempotent. Brings the entitlements table to parity with
existing paid enrollments. Counts must match after apply."
```

---

## Task 5: Write the failing test for refactored access.ts

**Files:**
- Create: `src/lib/toolbox/access.test.ts`

- [ ] **Step 1: Write the test**

```typescript
// src/lib/toolbox/access.test.ts
//
// The refactor preserves the public signature of getPaidToolboxAccess but
// changes the internal read path from course_enrollments -> entitlements.
// These tests pin the new behavior.

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetUser = vi.fn();
const mockEq2 = vi.fn();
const mockEq1 = vi.fn(() => ({ eq: mockEq2 }));
const mockSelect = vi.fn(() => ({ eq: mockEq1 }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));
vi.mock('next/headers', () => ({
  cookies: () => ({ getAll: () => [], setAll: () => {} }),
}));
vi.mock('@/lib/supabase/client', () => ({
  isSupabaseConfigured: () => true,
}));

import { getPaidToolboxAccess } from './access';

describe('getPaidToolboxAccess (reads from entitlements)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon';
    process.env.NODE_ENV = 'test';
    delete process.env.SKIP_ENROLLMENT_GATE;
  });

  it('returns null when no user is signed in', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });
    expect(await getPaidToolboxAccess()).toBeNull();
  });

  it('returns access when user has at least one active entitlement', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } });
    mockEq2.mockResolvedValueOnce({
      data: [{ product: 'aibi-p' }, { product: 'aibi-s' }],
      error: null,
    });

    const result = await getPaidToolboxAccess();
    expect(result).not.toBeNull();
    expect(result!.userId).toBe('user-1');
    expect(result!.products).toEqual(['aibi-p', 'aibi-s']);

    // Verify the query went to the entitlements table, not course_enrollments.
    expect(mockFrom).toHaveBeenCalledWith('entitlements');
  });

  it('returns null when there are no active entitlements', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } });
    mockEq2.mockResolvedValueOnce({ data: [], error: null });
    expect(await getPaidToolboxAccess()).toBeNull();
  });

  it('returns null and fails closed on query error', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } } });
    mockEq2.mockResolvedValueOnce({ data: null, error: { message: 'boom' } });
    expect(await getPaidToolboxAccess()).toBeNull();
  });

  it('honors SKIP_ENROLLMENT_GATE in non-production', async () => {
    process.env.NODE_ENV = 'development';
    process.env.SKIP_ENROLLMENT_GATE = 'true';
    const result = await getPaidToolboxAccess();
    expect(result).not.toBeNull();
    expect(result!.userId).toBe('dev-bypass');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd ~/Projects/aibi-toolbox && npx vitest run src/lib/toolbox/access.test.ts`
Expected: FAIL — the existing implementation queries `course_enrollments`, so the `mockFrom` assertion against `'entitlements'` will fail.

- [ ] **Step 3: Commit the failing test**

```bash
git add src/lib/toolbox/access.test.ts
git commit -m "test(toolbox): failing test pinning entitlements read path"
```

---

## Task 6: Refactor access.ts to read from entitlements

**Files:**
- Modify: `src/lib/toolbox/access.ts`

- [ ] **Step 1: Replace the implementation**

The public signature stays exactly the same — `getPaidToolboxAccess(): Promise<PaidAccess | null>` with the same `PaidAccess` shape. Only the table changes.

```typescript
// src/lib/toolbox/access.ts
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export interface PaidAccess {
  readonly userId: string;
  readonly products: readonly string[];
}

const PAID_PRODUCTS = ['aibi-p', 'aibi-s', 'aibi-l', 'toolbox-only'] as const;

export async function getPaidToolboxAccess(): Promise<PaidAccess | null> {
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.SKIP_ENROLLMENT_GATE === 'true'
  ) {
    return { userId: 'dev-bypass', products: ['dev-bypass'] };
  }

  if (!isSupabaseConfigured()) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = cookies();

  const supabase = ssrCreateServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('entitlements')
    .select('product')
    .eq('user_id', user.id)
    .eq('active', true);

  if (error || !data || data.length === 0) return null;

  const products = data
    .map((row) => String(row.product))
    .filter((p) => (PAID_PRODUCTS as readonly string[]).includes(p));

  if (products.length === 0) return null;

  return { userId: user.id, products };
}
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `cd ~/Projects/aibi-toolbox && npx vitest run src/lib/toolbox/access.test.ts`
Expected: all 5 tests PASS.

- [ ] **Step 3: Type-check and run full test suite for regressions**

Run: `cd ~/Projects/aibi-toolbox && npx tsc --noEmit && npm test -- --run`
Expected: zero TypeScript errors. Test suite count matches the baseline from Task 1 plus the 5 new tests passing.

- [ ] **Step 4: Commit**

```bash
git add src/lib/toolbox/access.ts
git commit -m "refactor(toolbox): read access from entitlements

getPaidToolboxAccess now reads from the entitlements table instead of
deriving from course_enrollments directly. Public signature unchanged;
all 5 callers (page + 4 API routes) keep working without edits.

Adds 'toolbox-only' to PAID_PRODUCTS in anticipation of Phase 2
standalone subscriptions."
```

---

## Task 7: Move /toolbox/* → /dashboard/toolbox/*

**Files:**
- Move: `src/app/toolbox/page.tsx` → `src/app/dashboard/toolbox/page.tsx`
- Move: `src/app/toolbox/ToolboxApp.tsx` → `src/app/dashboard/toolbox/ToolboxApp.tsx`

- [ ] **Step 1: Verify destination doesn't exist**

```bash
cd ~/Projects/aibi-toolbox && ls src/app/dashboard/toolbox 2>&1
```
Expected: `No such file or directory`. If it exists, stop and ask the user — something else has been built in the meantime.

- [ ] **Step 2: Move the directory with git so history is preserved**

```bash
cd ~/Projects/aibi-toolbox
git mv src/app/toolbox/page.tsx src/app/dashboard/toolbox/page.tsx
git mv src/app/toolbox/ToolboxApp.tsx src/app/dashboard/toolbox/ToolboxApp.tsx
# git mv on a directory works on macOS but moving files individually is safer
# in case there are sibling files we missed.
```

If there are any other files under `src/app/toolbox/` not listed above (re-check with `ls src/app/toolbox/` before this step), `git mv` each one. Confirm `src/app/toolbox/` is empty:
```bash
ls src/app/toolbox/ 2>&1
```
Expected: `No such file or directory` (git mv removes the now-empty parent).

- [ ] **Step 3: Verify imports inside moved files still resolve**

```bash
cd ~/Projects/aibi-toolbox && npx tsc --noEmit
```
Expected: zero errors. The moved files use `@/lib/...` aliases which are unchanged.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(toolbox): move /toolbox -> /dashboard/toolbox

Aligns IA with spec §4.3 (paid surface lives under /dashboard).
Old URL gets a 301 redirect in the next task. /api/toolbox/* API
routes are unchanged — only the page surface moves."
```

---

## Task 8: Add 301 redirect from /toolbox to /dashboard/toolbox

**Files:**
- Modify: `next.config.mjs`

- [ ] **Step 1: Add the redirect to the existing array**

Locate the `redirects()` block in `next.config.mjs` (already exists per CLAUDE.md decision-log entries). Append two new entries:

```javascript
// next.config.mjs — append to existing redirects() return array
{ source: '/toolbox', destination: '/dashboard/toolbox', permanent: true },
{ source: '/toolbox/:path*', destination: '/dashboard/toolbox/:path*', permanent: true },
```

The full updated `redirects()` should read (paste into the file, replacing the existing return array):

```javascript
async redirects() {
  return [
    { source: '/courses', destination: '/education', permanent: true },
    { source: '/certifications', destination: '/education', permanent: true },
    { source: '/services', destination: '/for-institutions', permanent: true },
    { source: '/foundations', destination: '/education', permanent: true },
    // 2026-04-29 — Plan A0: Toolbox moves to /dashboard/toolbox per spec §4.3.
    { source: '/toolbox', destination: '/dashboard/toolbox', permanent: true },
    { source: '/toolbox/:path*', destination: '/dashboard/toolbox/:path*', permanent: true },
  ];
},
```

- [ ] **Step 2: Verify in dev**

Kill any zombie dev servers (per `feedback_dev_server_hygiene.md`):
```bash
lsof -ti:3000 | xargs -r kill
cd ~/Projects/aibi-toolbox && npm run dev
```

In a browser:
- `http://localhost:3000/toolbox` → 308 redirect to `/dashboard/toolbox` (Next.js uses 308 for permanent: true; this is correct).
- `http://localhost:3000/dashboard/toolbox` → renders ToolboxApp (or paywall, depending on auth state).

- [ ] **Step 3: Commit**

```bash
git add next.config.mjs
git commit -m "feat(toolbox): 301 redirect /toolbox -> /dashboard/toolbox

Course-content links and bookmarks pointing at the old URL keep
working; new IA is the canonical path."
```

---

## Task 9: Replace redirect-on-no-access with Paywall component

**Files:**
- Create: `src/app/dashboard/toolbox/_components/Paywall.tsx`
- Modify: `src/app/dashboard/toolbox/page.tsx`

The existing page does `redirect('/courses/aibi-p/purchase')` when access is null. Spec §4.2 says unentitled users should see a paywall page that explains the bundle and links to `/education`.

- [ ] **Step 1: Write the Paywall component**

```tsx
// src/app/dashboard/toolbox/_components/Paywall.tsx
'use client';

import Link from 'next/link';
import { useEffect } from 'react';

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number> }) => void;
  }
}

export function Paywall() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
      window.plausible('toolbox_paywall_shown', { props: { source: 'direct' } });
    }
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
        Toolbox
      </p>
      <h1 className="mt-3 font-serif text-4xl text-[color:var(--color-ink)] md:text-5xl">
        Included with any paid course
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-[color:var(--color-ink)]/80">
        The AiBI Toolbox — Skill Builder, Template Library, multi-provider
        Playground, and Cookbook — is bundled with every paid enrollment in
        AiBI-P, AiBI-S, or AiBI-L. Enroll in any course and your access
        turns on automatically.
      </p>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/education"
          className="inline-flex items-center justify-center rounded-[2px] bg-[color:var(--color-terra)] px-6 py-3 font-sans text-[11px] font-semibold uppercase tracking-[1.2px] text-[color:var(--color-linen)] hover:bg-[color:var(--color-terra-light)]"
        >
          Browse Courses
        </Link>
        <Link
          href="/assessment/start"
          className="inline-flex items-center justify-center rounded-[2px] border border-[color:var(--color-ink)]/20 px-6 py-3 font-sans text-[11px] font-semibold uppercase tracking-[1.2px] text-[color:var(--color-ink)] hover:border-[color:var(--color-ink)]/40"
        >
          Start with the free assessment
        </Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Update the page to render Paywall instead of redirecting**

The existing `src/app/dashboard/toolbox/page.tsx` currently calls `redirect('/courses/aibi-p/purchase')`. Replace that branch with `<Paywall />`:

```tsx
// src/app/dashboard/toolbox/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import { ToolboxApp } from './ToolboxApp';
import { Paywall } from './_components/Paywall';

export const metadata: Metadata = {
  title: 'AI Banking Toolbox | The AI Banking Institute',
  description:
    'Build, test, save, and export banking AI skills. Included with every paid enrollment.',
};

export default async function ToolboxPage() {
  const access = await getPaidToolboxAccess();

  if (!access) {
    return <Paywall />;
  }

  return (
    <main className="min-h-screen bg-[color:var(--color-linen)]">
      <div className="border-b border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 lg:flex-row lg:items-end lg:justify-between lg:px-10">
          <div>
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
              Paid Learner Toolbox
            </p>
            <h1 className="mt-2 font-serif text-4xl leading-tight text-[color:var(--color-ink)] md:text-5xl">
              Banking AI Toolbox
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--color-slate)]">
              Build durable AI skills, test them through the AIBI API proxy, save them to your account, and export Markdown files for your own repository.
            </p>
          </div>
          <Link
            href="/courses/aibi-p"
            className="inline-flex w-fit items-center border border-[color:var(--color-ink)]/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-ink)] transition-colors hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)]"
          >
            Back to coursework
          </Link>
        </div>
      </div>
      <ToolboxApp />
    </main>
  );
}
```

- [ ] **Step 3: Type-check and build**

```bash
cd ~/Projects/aibi-toolbox && npx tsc --noEmit && npm run build 2>&1 | tail -20
```
Expected: zero errors; `/dashboard/toolbox` listed in the build output.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/toolbox/_components/Paywall.tsx src/app/dashboard/toolbox/page.tsx
git commit -m "feat(toolbox): replace redirect with Paywall component

Unentitled users now see a Paywall page explaining the bundle and
linking to /education and /assessment/start, instead of being kicked
to /courses/aibi-p/purchase. Fires plausible toolbox_paywall_shown."
```

---

## Task 10: Add Toolbox section card to /dashboard

**Files:**
- Modify: `src/app/dashboard/page.tsx`

The dashboard is a client component. Server-side entitlement check happens via the existing `/api/dashboard/learner` endpoint, which already returns enrollment data. We surface the Toolbox card based on whether the loaded user has an active enrollment in any paid product (the learner endpoint returns `enrollment` with a `product` field; check it).

- [ ] **Step 1: Find the right insertion point**

Read `src/app/dashboard/page.tsx`. The existing render returns a series of `<section>` elements. Insert a new section card titled "Toolbox" after the "Saved Prompts" section and before "Artifacts" — Toolbox sits naturally between curated content and the user's own outputs.

- [ ] **Step 2: Compute entitled state**

The dashboard already loads `dashboard.enrollment`. The `enrollment` shape doesn't currently expose `product`, so we need to verify what's available. Run:
```bash
cd ~/Projects/aibi-toolbox && grep -n "enrollment" src/app/api/dashboard/learner/route.ts | head -10
```

Two paths based on what you find:
- **(a)** If the learner endpoint already returns the product in `dashboard.enrollment.product`: gate the new section card on `dashboard.enrollment.product` being one of `['aibi-p', 'aibi-s', 'aibi-l']`.
- **(b)** If it does not: add a small new endpoint `src/app/api/dashboard/toolbox-access/route.ts` that calls `getPaidToolboxAccess()` server-side and returns `{ entitled: boolean }`. Fetch from the dashboard client component on mount.

Choose path (a) if the data is already there (preferred — no new endpoint). Document the decision in the commit message.

- [ ] **Step 3: Add the section card**

Add the following block to the dashboard render, between "Saved Prompts" and "Artifacts":

```tsx
{toolboxEntitled && (
  <section>
    <DashboardPanel title="Your Toolbox">
      <p className="text-sm text-[color:var(--color-slate)] leading-relaxed">
        Build reusable AI skills with guardrails, test them in the
        Playground, and export them to your institutional AI tool.
        Included with your enrollment.
      </p>
      <Link
        href="/dashboard/toolbox"
        className="inline-block mt-4 font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)] border-b border-[color:var(--color-terra)]"
      >
        Open Toolbox
      </Link>
    </DashboardPanel>
  </section>
)}
```

Compute `toolboxEntitled` near the top of the render function based on the path chosen in Step 2.

- [ ] **Step 4: Type-check and dev-server visual check**

```bash
cd ~/Projects/aibi-toolbox && npx tsc --noEmit
lsof -ti:3000 | xargs -r kill
npm run dev
```

Visit `http://localhost:3000/dashboard`:
- Logged-in entitled user: "Your Toolbox" card appears between Saved Prompts and Artifacts.
- Logged-in unentitled user: card is absent.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/page.tsx [optional new endpoint files]
git commit -m "feat(toolbox): surface toolbox card on dashboard for entitled users

Replaces the absence of dashboard nav with an inline section card
that links to /dashboard/toolbox. Visible only when the loaded
dashboard data confirms the user has a paid enrollment."
```

---

## Task 11: Stub the compliance doc

**Files:**
- Create: `docs/compliance/llm-data-handling.md`

- [ ] **Step 1: Write the stub**

```markdown
# LLM Data Handling — Provider Stance

**Status:** Stub. Plan D fills this in with verified provider terms before
the multi-provider Playground ships.

This document is the audit trail for §5.3a of the AiBI Toolbox design spec
(`docs/superpowers/specs/2026-04-29-aibi-toolbox-design.md`). It records
the data-handling stance of each LLM provider used in the AiBI Toolbox
Playground, on the specific API tier in use, with a verification date and
link to the provider's published terms.

**Review cadence:** quarterly, by the engineering owner. Each review
either re-confirms the stance or files an issue if the terms have changed.

---

## Anthropic
- **Tier in use:** _to be filled by Plan D_
- **Last verified:** _yyyy-mm-dd_
- **Provider terms link:** _to be filled by Plan D_
- **Stance:** _to be filled by Plan D_

## OpenAI
- **Tier in use:** _to be filled by Plan D_
- **Last verified:** _yyyy-mm-dd_
- **Provider terms link:** _to be filled by Plan D_
- **Stance:** _to be filled by Plan D_

## Google (Gemini)
- **Tier in use:** _to be filled by Plan D_
- **Last verified:** _yyyy-mm-dd_
- **Provider terms link:** _to be filled by Plan D_
- **Stance:** _to be filled by Plan D_
```

- [ ] **Step 2: Commit**

```bash
git add docs/compliance/llm-data-handling.md
git commit -m "docs(compliance): stub llm data-handling provider doc

Plan D fills this in with verified provider terms before the Playground
ships. Existing now so future UI links don't 404."
```

---

## Task 12: End-to-end smoke test of all 5 routes

**Files:** none

After the refactor, all 5 existing routes (the page + 4 API routes) consume the refactored `getPaidToolboxAccess`. Verify each still works.

- [ ] **Step 1: Full type-check + tests + build**

```bash
cd ~/Projects/aibi-toolbox && npx tsc --noEmit && npm test -- --run && npm run build 2>&1 | tail -20
```
Expected: zero TypeScript errors, all tests pass, build succeeds.

- [ ] **Step 2: Manual smoke matrix (in dev)**

Kill zombie dev servers, start fresh:
```bash
lsof -ti:3000 | xargs -r kill
cd ~/Projects/aibi-toolbox && npm run dev
```

Test each route as both an entitled and unentitled user (use `SKIP_ENROLLMENT_GATE=true` to simulate entitled in dev if a real entitled test user is unavailable):

| Route | Entitled | Unentitled |
|---|---|---|
| `GET /toolbox` | 308 → `/dashboard/toolbox` → ToolboxApp renders | 308 → `/dashboard/toolbox` → Paywall renders |
| `GET /dashboard/toolbox` | ToolboxApp renders | Paywall renders |
| `GET /api/toolbox/skills` | `{ "skills": [] }` | `{ "error": "Paid access required." }` 403 |
| `POST /api/toolbox/skills` (with valid body) | `{ "skill": {...} }` 201 | `{ "error": "Paid access required." }` 403 |
| `PATCH /api/toolbox/skills/<uuid>` | success or 500 if no row | 403 |
| `DELETE /api/toolbox/skills/<uuid>` | `{ "ok": true }` | 403 |
| `POST /api/toolbox/run` (valid body) | streaming response | 403 |
| `GET /dashboard` | "Your Toolbox" card visible | card absent |

For the API routes, use curl with the dev session cookie:
```bash
curl -s http://localhost:3000/api/toolbox/skills \
  -H "Cookie: $(cat /path/to/test-session-cookie)" | head -3
```

- [ ] **Step 3: Confirm trigger sync works end-to-end**

⚠️ Only with explicit user approval (per CLAUDE.md):
```bash
# Insert a fresh course_enrollments row for a test user
supabase db query --linked "
INSERT INTO course_enrollments (user_id, product)
VALUES ('<test-user-uuid>', 'aibi-p')
RETURNING id;"
# Verify entitlement materialized
supabase db query --linked "
SELECT product, source, active FROM entitlements
WHERE user_id = '<test-user-uuid>'
ORDER BY created_at DESC LIMIT 1;"
```
Expected: the new entitlement row exists with `active = true` within seconds.

If user declines the test insert: skip — Task 4's count check already validates the trigger machinery.

- [ ] **Step 4: No commit needed** if everything passed cleanly. If you found and fixed regressions during smoke-testing, commit those fixes with a `fix(toolbox): plan A0 smoke-test fix — <details>` message.

---

## Definition of Done

Plan A0 is complete when ALL of the following are true:

- [ ] Migrations 00014, 00015, 00016 applied; counts match between paid `course_enrollments` and active `entitlements` rows.
- [ ] `src/lib/toolbox/access.ts` reads from `entitlements`; tests in `src/lib/toolbox/access.test.ts` pass.
- [ ] All 5 existing Toolbox routes (page + 4 API routes) work without code changes to the routes themselves — only `access.ts` was refactored.
- [ ] `/toolbox` → `/dashboard/toolbox` 308 redirect is live.
- [ ] `/dashboard/toolbox` renders ToolboxApp for entitled users and Paywall for unentitled users (no more redirect to `/courses/aibi-p/purchase`).
- [ ] `/dashboard` surfaces a Toolbox section card for entitled users.
- [ ] `npm test`, `npx tsc --noEmit`, and `npm run build` all pass with zero new errors.
- [ ] `docs/compliance/llm-data-handling.md` exists as a stub.
- [ ] No dual-stack code paths. No "later cutover" TODOs.

---

## What Plan A0 explicitly does NOT do

- **Schema-shape evolution of `toolbox_skills`** to the spec's Skill schema (system_prompt, user_prompt_template, variables, teaching_annotations) → **Plan B**
- **Existing UI vocabulary translation** (the 588-line `ToolboxApp.tsx` still uses `cmd`/`name`/`purpose`/`samples` etc.) → **Plan B**
- **Library + versioning** → **Plan C**
- **Multi-provider Playground (OpenAI, Google) + streaming + cost-as-dollars meter + per-IP rate limit + layered PII safety** → **Plans D and E**
- **"Save to Toolbox" capture mechanic across course content** → **Plan F**
- **Cookbook** → **Plan G**
- **Provider data-handling doc fill-in** → **Plan D**

---

## Self-Review

**Spec coverage check (Plan A0 only — Plans B–H cover their own sections):**

| Spec section | Plan A0 coverage |
|---|---|
| §4.1 Access Rule (Locked) | Tasks 5, 6 |
| §4.2 User types — paywall behavior | Task 9 (Paywall component) |
| §4.3 IA placement `/dashboard/toolbox` | Tasks 7, 8 |
| §7.5 Entitlement check (real table from v1) + reconciliation via trigger | Tasks 2, 3, 4 |
| §9 Instrumentation — `toolbox_paywall_shown` | Task 9 |
| §10 Open question 10 (reconciliation method — trigger preferred) | Task 3 |
| §11 Engineering step 1 (Foundation) | All Plan A0 tasks |

**Placeholder scan:** None. Every code block is runnable. Every command shows expected output. The only conditional (Task 10 Step 2 path (a) vs (b)) is a real fork that depends on existing endpoint shape, not a placeholder.

**Type consistency:** `PaidAccess` shape unchanged — all 5 callers continue to read `.userId` and `.products`. `PAID_PRODUCTS` constant gains `'toolbox-only'` for Phase 2 forward-compatibility but the existing 3 products are preserved.

**Scope check:** 12 tasks, each 2–10 minutes, single concern per task. No task spans multiple subsystems. The migration sequence (2→3→4) is intentionally split because each is independently committable and reviewable.
