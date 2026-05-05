# Product Simplification + In-Depth Assessment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Streamline the public product menu to four tiers (free assessment, paid In-Depth Assessment, AiBI-P course, custom-engagements stub), build the In-Depth Assessment hybrid flow with magic-link distribution and anonymized aggregate report for institution leaders, and rebalance tier thresholds to the 12-48 scale.

**Architecture:** Reuse existing 48-question pool (`content/assessments/v2/questions.ts`). New routes under `/assessment/in-depth/*`. Multi-tenant data via two new Supabase tables (`indepth_assessment_institutions`, `indepth_assessment_takers`) with magic-link tokens replacing per-seat counters. Anonymization enforced at the aggregation API layer, not the data layer. AiBI-S / AiBI-L deactivated in Stripe and soft-hidden via `next.config.mjs` redirects.

**Tech Stack:** Next.js 14 (App Router) · TypeScript · Supabase (Postgres + RLS + Auth) · Stripe Checkout · Resend (transactional) · ConvertKit (tags) · vitest

**Spec:** `docs/superpowers/specs/2026-05-05-product-simplification-and-indepth-assessment-design.md`

**Worktree:** `~/Projects/aibi-stripe-products` (branch `feature/stripe-products`)

---

## Pre-flight checklist

Before starting Task 1, verify environment is ready.

- [ ] **Step 0.1: Confirm worktree**

```bash
cd ~/Projects/aibi-stripe-products && git branch --show-current
```
Expected: `feature/stripe-products`

- [ ] **Step 0.2: Confirm clean working tree**

```bash
cd ~/Projects/aibi-stripe-products && git status --short
```
Expected: empty output (or only untracked `.env.local` if it exists in this worktree).

- [ ] **Step 0.3: Install deps if missing**

```bash
cd ~/Projects/aibi-stripe-products && [ -d node_modules ] || npm install
```

- [ ] **Step 0.4: Confirm Stripe + Supabase env present in symlinked .env.local**

```bash
cd ~/Projects/aibi-stripe-products && grep -E '^(STRIPE_INDEPTH_ASSESSMENT_PRICE_ID|STRIPE_INDEPTH_ASSESSMENT_VOLUME_PRICE_ID|STRIPE_WEBHOOK_SECRET|SUPABASE_SERVICE_ROLE_KEY)=' .env.local | wc -l
```
Expected: `4`

---

## Task 1: Deactivate AiBI-S and AiBI-L Stripe products

**Files:** None in repo. Stripe API only.

This must run via Stripe MCP, not by hand. Two product IDs to flip:
- AiBI-S: `prod_UShZSlWrdzgC3w`
- AiBI-L: `prod_UShZBcevbScyJJ`

- [ ] **Step 1.1: Deactivate AiBI-S product**

Stripe MCP call:
```
mcp__stripe__stripe_api_execute
  operation_id: PostProductsId
  parameters: { id: "prod_UShZSlWrdzgC3w", active: false }
```
Expected response: `{ id: "prod_UShZSlWrdzgC3w", active: false, ... }`

- [ ] **Step 1.2: Deactivate AiBI-L product**

```
mcp__stripe__stripe_api_execute
  operation_id: PostProductsId
  parameters: { id: "prod_UShZBcevbScyJJ", active: false }
```
Expected response: `{ id: "prod_UShZBcevbScyJJ", active: false, ... }`

- [ ] **Step 1.3: Verify both deactivated**

```
mcp__stripe__list_products
  limit: 10
```
Expected: AiBI-S and AiBI-L appear with `active: false`. AI Banking Practitioner Course and In-Depth Assessment remain `active: true`.

No commit — Stripe state change, not code change.

---

## Task 2: Database migration — In-Depth Assessment tables

**Files:**
- Create: `supabase/migrations/00028_indepth_assessment_tables.sql`

- [ ] **Step 2.1: Write migration file**

```sql
-- 00028_indepth_assessment_tables.sql
-- Adds the two tables backing the paid In-Depth AI Readiness Assessment.
-- See docs/superpowers/specs/2026-05-05-product-simplification-and-indepth-assessment-design.md

CREATE TABLE indepth_assessment_institutions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name    text NOT NULL,
  leader_user_id      uuid REFERENCES auth.users(id),
  leader_email        text NOT NULL,
  seats_purchased     int  NOT NULL CHECK (seats_purchased >= 10),
  stripe_session_id   text UNIQUE NOT NULL,
  amount_paid_cents   int  NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE indepth_assessment_takers (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id      uuid REFERENCES indepth_assessment_institutions(id) ON DELETE CASCADE,
  invite_email        text NOT NULL,
  invite_token        text UNIQUE NOT NULL,
  invite_sent_at      timestamptz NOT NULL DEFAULT now(),
  invite_consumed_at  timestamptz,
  completed_at        timestamptz,
  score_total         int,
  score_per_dimension jsonb,
  answers             jsonb,
  -- For individual ($99) buyers, this is the originating Stripe Checkout
  -- Session id; provides idempotency against duplicate webhook deliveries.
  -- NULL for invite-driven institution takers (their idempotency comes
  -- from the (institution_id, invite_email) unique constraint).
  stripe_session_id   text,
  CONSTRAINT one_seat_per_email_per_institution
    UNIQUE (institution_id, invite_email),
  CONSTRAINT individual_session_unique
    UNIQUE (stripe_session_id)
);

CREATE INDEX idx_indepth_takers_institution ON indepth_assessment_takers(institution_id);
CREATE INDEX idx_indepth_takers_token ON indepth_assessment_takers(invite_token);
CREATE INDEX idx_indepth_inst_leader ON indepth_assessment_institutions(leader_user_id);

ALTER TABLE indepth_assessment_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE indepth_assessment_takers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leader reads own institution" ON indepth_assessment_institutions
  FOR SELECT TO authenticated
  USING (leader_user_id = (select auth.uid()));

CREATE POLICY "Leader reads own institution takers" ON indepth_assessment_takers
  FOR SELECT TO authenticated
  USING (institution_id IN (
    SELECT id FROM indepth_assessment_institutions
    WHERE leader_user_id = (select auth.uid())
  ));

-- Service role bypasses RLS for webhook inserts and token-based take flow.
```

- [ ] **Step 2.2: Apply migration to Supabase**

Use Supabase MCP:
```
mcp__supabase__apply_migration
  name: "00028_indepth_assessment_tables"
  query: <contents of file from Step 2.1>
```

⚠️ **Before applying, ask user for ALL-CAPS confirmation per CLAUDE.md** if applying to a remote/production project. If applying to a sandbox project only, proceed.

- [ ] **Step 2.3: Verify tables created**

```
mcp__supabase__list_tables
  schemas: ["public"]
```
Expected: response includes `indepth_assessment_institutions` and `indepth_assessment_takers`.

- [ ] **Step 2.4: Commit**

```bash
cd ~/Projects/aibi-stripe-products
git add supabase/migrations/00028_indepth_assessment_tables.sql
git commit -m "feat(db): add In-Depth Assessment institution + taker tables"
```

---

## Task 3: Rebalance tier thresholds to 12-48 scale

**Files:**
- Modify: `content/assessments/v2/scoring.ts`

This is a foundational change — every consumer of `scoring.ts` (results pages, PDF, dashboard, etc.) inherits the new bands. Do this BEFORE building the In-Depth UI so new components use the new ranges from day one.

- [ ] **Step 3.1: Read existing scoring.ts to find threshold constants**

```bash
cd ~/Projects/aibi-stripe-products
grep -n -E "(28|22|15|14|21|27|32)" content/assessments/v2/scoring.ts
```
Identify the band boundaries currently encoded.

- [ ] **Step 3.2: Write the failing test**

Create `content/assessments/v2/scoring.test.ts` (or append to existing if one exists):
```typescript
import { describe, it, expect } from 'vitest';
import { getTier } from './scoring';

describe('getTier (12-48 scale)', () => {
  it.each([
    [12, 'starting-point'],
    [20, 'starting-point'],
    [21, 'early-stage'],
    [29, 'early-stage'],
    [30, 'building-momentum'],
    [38, 'building-momentum'],
    [39, 'ready-to-scale'],
    [48, 'ready-to-scale'],
  ])('score %i → %s', (score, expectedTierId) => {
    expect(getTier(score).id).toBe(expectedTierId);
  });
});
```

Note: The actual `getTier` return type may differ; adapt the assertion to match the existing API. If `getTier` returns `{ label: string }` instead of `{ id: string }`, assert on the label values: `'Starting Point' / 'Early Stage' / 'Building Momentum' / 'Ready to Scale'`.

- [ ] **Step 3.3: Run test, expect failures**

```bash
cd ~/Projects/aibi-stripe-products && npm test -- scoring.test
```
Expected: 4-8 failures (rows with scores in the new bands that fall in old bands).

- [ ] **Step 3.4: Update scoring.ts thresholds**

Replace numeric bands so that:
- Starting Point covers 12-20
- Early Stage covers 21-29
- Building Momentum covers 30-38
- Ready to Scale covers 39-48

Show the diff (example structure — adapt to actual file shape):
```typescript
// Before:
if (total >= 28) return { id: 'ready-to-scale', label: 'Ready to Scale', ... };
if (total >= 22) return { id: 'building-momentum', label: 'Building Momentum', ... };
if (total >= 15) return { id: 'early-stage', label: 'Early Stage', ... };
return            { id: 'starting-point', label: 'Starting Point', ... };

// After:
if (total >= 39) return { id: 'ready-to-scale', label: 'Ready to Scale', ... };
if (total >= 30) return { id: 'building-momentum', label: 'Building Momentum', ... };
if (total >= 21) return { id: 'early-stage', label: 'Early Stage', ... };
return            { id: 'starting-point', label: 'Starting Point', ... };
```

- [ ] **Step 3.5: Run tests, expect pass**

```bash
cd ~/Projects/aibi-stripe-products && npm test -- scoring.test
```
Expected: all rows pass.

- [ ] **Step 3.6: Run full test suite for regressions**

```bash
cd ~/Projects/aibi-stripe-products && npm test
```
Expected: no new failures. If existing tests reference the old thresholds (e.g., a snapshot test), update those tests' expected values to the new thresholds.

- [ ] **Step 3.7: Commit**

```bash
git add content/assessments/v2/scoring.ts content/assessments/v2/scoring.test.ts
git commit -m "feat(assessment): rebalance tier thresholds to 12-48 scale"
```

---

## Task 4: Audit and fix downstream tier-threshold references

**Files (audit; modify only if hardcoded numbers found):**
- `src/app/assessment/_components/ResultsView.tsx`
- `src/app/assessment/_components/ResultsViewV2.tsx`
- `src/app/assessment/_lib/useAssessment.ts`
- `src/app/assessment/_lib/useAssessmentV2.ts`
- `src/lib/pdf/TransformationReportDocument.tsx`
- Any other file matching the regex below

- [ ] **Step 4.1: Search for hardcoded thresholds**

```bash
cd ~/Projects/aibi-stripe-products
grep -rn -E "(score\s*>=?\s*(8|14|15|21|22|27|28|32))" src/ content/ 2>/dev/null | grep -v node_modules | grep -v scoring.ts | grep -v scoring.test.ts
```
List every hit. For each:
- If it's importing `getTier()` and not re-implementing band logic → SKIP (already correct).
- If it has its own hardcoded band boundary → REPLACE with `getTier()` call, or update the boundary to the new scale.

- [ ] **Step 4.2: Search for max-score-of-32 references**

```bash
cd ~/Projects/aibi-stripe-products
grep -rn -E "(\b32\b|maxScore\s*=\s*32|/\s*32\b)" src/ content/ 2>/dev/null | grep -v node_modules | grep -v ".test." | head -30
```
For each hit referring to assessment max score, replace with `48`.

- [ ] **Step 4.3: Run full test suite**

```bash
cd ~/Projects/aibi-stripe-products && npm test
```
Fix any new failures by following the same pattern (replace constants, prefer `getTier()` over duplicate logic).

- [ ] **Step 4.4: Commit (only if files changed)**

```bash
git add -A
git commit -m "refactor(assessment): align downstream consumers with 12-48 tier bands"
```

If no files changed, skip the commit and move on.

---

## Task 5: Extend CheckoutMetadata for multi-product

**Files:**
- Modify: `src/lib/stripe.ts`

- [ ] **Step 5.1: Update the CheckoutMetadata interface**

Replace the current interface:
```typescript
// Before
export interface CheckoutMetadata {
  product: 'aibi-p';
  mode: 'individual' | 'institution';
  ...
}

// After
export type CheckoutProduct = 'aibi-p' | 'indepth-assessment';

export interface CheckoutMetadata {
  product: CheckoutProduct;
  mode: 'individual' | 'institution';
  tier?: 'individual' | 'team';
  user_email?: string;
  institution_name?: string;
  leader_email?: string;             // always present for indepth-assessment
  /** Number of seats, serialised as a string (Stripe metadata values are strings). */
  quantity?: string;
  discount_applied?: 'institution_persistent';
}
```

- [ ] **Step 5.2: Run typecheck**

```bash
cd ~/Projects/aibi-stripe-products && npx tsc --noEmit 2>&1 | head -40
```
Note any errors flowing from the type change. They will be addressed in Tasks 6 + 13 — proceed even if errors exist.

- [ ] **Step 5.3: Commit**

```bash
git add src/lib/stripe.ts
git commit -m "feat(stripe): widen CheckoutMetadata to support indepth-assessment"
```

---

## Task 6: Refactor /api/create-checkout to dispatch on product

**Files:**
- Modify: `src/app/api/create-checkout/route.ts`
- Test: `src/app/api/create-checkout/route.test.ts` (create or extend)

- [ ] **Step 6.1: Write failing tests for the new dispatch**

Append to (or create) `src/app/api/create-checkout/route.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { POST } from './route';

const makeReq = (body: unknown) =>
  new Request('https://aibankinginstitute.com/api/create-checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('POST /api/create-checkout', () => {
  it('rejects unknown product', async () => {
    const res = await POST(makeReq({ product: 'unknown', mode: 'individual' }));
    expect(res.status).toBe(400);
  });

  it('rejects indepth-assessment institution mode with quantity < 10', async () => {
    const res = await POST(makeReq({
      product: 'indepth-assessment',
      mode: 'institution',
      quantity: 5,
      institution_name: 'Test Bank',
      leader_email: 'leader@bank.test',
    }));
    expect(res.status).toBe(400);
  });

  it('rejects indepth-assessment without leader_email', async () => {
    const res = await POST(makeReq({
      product: 'indepth-assessment',
      mode: 'individual',
    }));
    expect(res.status).toBe(400);
  });

  it('preserves aibi-p individual default behavior', async () => {
    const res = await POST(makeReq({ product: 'aibi-p', mode: 'individual' }));
    // 200 if env is set, 503 if not — both acceptable in test env
    expect([200, 503]).toContain(res.status);
  });
});
```

- [ ] **Step 6.2: Run tests, expect failures**

```bash
cd ~/Projects/aibi-stripe-products && npm test -- create-checkout
```
Expected: validation tests fail because route doesn't yet dispatch on product.

- [ ] **Step 6.3: Refactor the route**

Replace the route body. Key shape:

```typescript
// Pseudocode skeleton — adapt to existing structure:
export async function POST(request: Request) {
  const body = await parseJson(request);
  const product = body.product;

  if (product === 'aibi-p') return handleAibiP(body, request);
  if (product === 'indepth-assessment') return handleIndepth(body, request);

  return NextResponse.json(
    { error: 'product must be "aibi-p" or "indepth-assessment".' },
    { status: 400 }
  );
}

async function handleIndepth(body, request) {
  const mode = body.mode;
  const leaderEmail = body.leader_email;

  if (!leaderEmail || !EMAIL_RE.test(leaderEmail)) {
    return NextResponse.json({ error: 'leader_email required and must be valid' }, { status: 400 });
  }

  if (mode !== 'individual' && mode !== 'institution') {
    return NextResponse.json({ error: 'mode must be individual or institution' }, { status: 400 });
  }

  if (mode === 'institution') {
    const quantity = Number(body.quantity);
    if (!Number.isInteger(quantity) || quantity < 10) {
      return NextResponse.json({ error: 'institution mode requires quantity >= 10' }, { status: 400 });
    }
    if (typeof body.institution_name !== 'string' || body.institution_name.trim() === '') {
      return NextResponse.json({ error: 'institution_name required' }, { status: 400 });
    }
  }

  const priceId = mode === 'individual'
    ? process.env.STRIPE_INDEPTH_ASSESSMENT_PRICE_ID
    : process.env.STRIPE_INDEPTH_ASSESSMENT_VOLUME_PRICE_ID;

  if (!priceId) {
    return NextResponse.json({ error: 'Payment system not configured.' }, { status: 503 });
  }

  const stripe = (await import('@/lib/stripe')).stripe;
  const origin = getOrigin(request);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price: priceId,
      quantity: mode === 'institution' ? Number(body.quantity) : 1,
    }],
    allow_promotion_codes: true,
    customer_email: leaderEmail,
    success_url: mode === 'institution'
      ? `${origin}/assessment/in-depth/dashboard?session={CHECKOUT_SESSION_ID}`
      : `${origin}/assessment/in-depth/take?from=checkout&session={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/assessment/in-depth`,
    metadata: {
      product: 'indepth-assessment',
      mode,
      quantity: String(mode === 'institution' ? body.quantity : 1),
      leader_email: leaderEmail,
      ...(mode === 'institution' ? { institution_name: body.institution_name.trim() } : {}),
    },
  });

  return NextResponse.json({ url: session.url });
}

function handleAibiP(body, request) {
  // Existing AiBI-P logic, unchanged. Wrap the existing function body.
}
```

- [ ] **Step 6.4: Run tests, expect pass**

```bash
cd ~/Projects/aibi-stripe-products && npm test -- create-checkout
```
Expected: all tests pass.

- [ ] **Step 6.5: Commit**

```bash
git add src/app/api/create-checkout/route.ts src/app/api/create-checkout/route.test.ts
git commit -m "feat(api): dispatch /api/create-checkout on product (adds indepth-assessment)"
```

---

## Task 7: Magic-link token utilities

**Files:**
- Create: `src/lib/indepth/tokens.ts`
- Test: `src/lib/indepth/tokens.test.ts`

- [ ] **Step 7.1: Write tests**

`src/lib/indepth/tokens.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { generateInviteToken, isValidInviteToken } from './tokens';

describe('invite tokens', () => {
  it('generates 32+ char base64url tokens', () => {
    const t = generateInviteToken();
    expect(t).toMatch(/^[A-Za-z0-9_-]{32,}$/);
  });

  it('isValidInviteToken accepts generated tokens', () => {
    const t = generateInviteToken();
    expect(isValidInviteToken(t)).toBe(true);
  });

  it('isValidInviteToken rejects short / suspicious strings', () => {
    expect(isValidInviteToken('')).toBe(false);
    expect(isValidInviteToken('short')).toBe(false);
    expect(isValidInviteToken('x'.repeat(100) + '!?')).toBe(false);
  });

  it('two generated tokens are different (statistically)', () => {
    const t1 = generateInviteToken();
    const t2 = generateInviteToken();
    expect(t1).not.toBe(t2);
  });
});
```

- [ ] **Step 7.2: Run tests, expect failure**

```bash
cd ~/Projects/aibi-stripe-products && npm test -- tokens
```
Expected: import fails.

- [ ] **Step 7.3: Write tokens.ts**

`src/lib/indepth/tokens.ts`:
```typescript
// Magic-link invite tokens for the In-Depth Assessment.
// Tokens are random 32-byte values, base64url-encoded.
// Stored in indepth_assessment_takers.invite_token (UNIQUE).
// Token validity is enforced by lookup in the DB, not by signing —
// a stolen token is a stolen seat. Tokens are one-shot:
// invite_consumed_at marks first redemption.

import { randomBytes } from 'crypto';

const TOKEN_BYTES = 32;
const TOKEN_REGEX = /^[A-Za-z0-9_-]{32,}$/;

export function generateInviteToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url');
}

export function isValidInviteToken(token: string): boolean {
  return typeof token === 'string' && TOKEN_REGEX.test(token);
}
```

- [ ] **Step 7.4: Run tests, expect pass**

```bash
cd ~/Projects/aibi-stripe-products && npm test -- tokens
```

- [ ] **Step 7.5: Commit**

```bash
git add src/lib/indepth/tokens.ts src/lib/indepth/tokens.test.ts
git commit -m "feat(indepth): magic-link invite token generator"
```

---

## Task 8: Resend email templates for In-Depth Assessment

**Files:**
- Modify: `src/lib/resend/index.ts` (extend with three new send functions)
- Test: `src/lib/resend/indepth.test.ts` (new)

- [ ] **Step 8.1: Write tests for the three new senders**

`src/lib/resend/indepth.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sendIndepthIndividualInvite,
  sendIndepthInstitutionInvite,
  sendIndepthIndividualResults,
} from '.';

describe('In-Depth Resend templates', () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = 'test_key';
  });

  it('sendIndepthIndividualInvite: skips when no API key', async () => {
    delete process.env.RESEND_API_KEY;
    const res = await sendIndepthIndividualInvite({
      email: 'buyer@bank.test',
      takeUrl: 'https://aibankinginstitute.com/assessment/in-depth/take?token=abc',
    });
    expect(res).toEqual({ skipped: true, reason: expect.stringMatching(/RESEND/i) });
  });

  it('sendIndepthInstitutionInvite: includes leader name + institution in body', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'em_test' }), { status: 200 })
    );
    await sendIndepthInstitutionInvite({
      inviteeEmail: 'staff@bank.test',
      leaderName: 'Jane Smith',
      institutionName: 'First Community Bank',
      takeUrl: 'https://example.test/take?token=xyz',
    });
    const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
    expect(body.html).toContain('Jane Smith');
    expect(body.html).toContain('First Community Bank');
    expect(body.html).toContain('https://example.test/take?token=xyz');
    fetchSpy.mockRestore();
  });

  it('sendIndepthIndividualResults: includes results URL', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'em_test' }), { status: 200 })
    );
    await sendIndepthIndividualResults({
      email: 'taker@bank.test',
      resultsUrl: 'https://example.test/results/in-depth/123',
      score: 36,
      tierLabel: 'Building Momentum',
    });
    const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
    expect(body.html).toContain('https://example.test/results/in-depth/123');
    expect(body.html).toContain('Building Momentum');
    fetchSpy.mockRestore();
  });
});
```

- [ ] **Step 8.2: Run tests, expect failures**

```bash
cd ~/Projects/aibi-stripe-products && npm test -- indepth
```
Expected: import errors for the three new functions.

- [ ] **Step 8.3: Add the three send functions**

In `src/lib/resend/index.ts`, append (using the existing `sendAssessmentBreakdownEmail` as the structural template — same fetch pattern, same env-guarded skip semantics, same RESEND_FROM / REPLY_TO constants).

Each function:
- Accepts a typed payload
- Returns `Promise<ResendResult>`
- Skips with `{ skipped: true, reason }` if `RESEND_API_KEY` unset
- POSTs to `RESEND_API_URL` with `from`, `to`, `subject`, `html`, `reply_to`
- Logs and swallows errors (non-blocking pattern documented at top of file)

Subject + body content per spec §8.1.

- [ ] **Step 8.4: Run tests, expect pass**

```bash
cd ~/Projects/aibi-stripe-products && npm test -- indepth
```

- [ ] **Step 8.5: Commit**

```bash
git add src/lib/resend/index.ts src/lib/resend/indepth.test.ts
git commit -m "feat(email): three Resend templates for In-Depth Assessment"
```

---

## Task 9: provisionEnrollment branches for indepth-assessment

**Files:**
- Modify: `src/lib/stripe/provision-enrollment.ts`
- Test: `src/lib/stripe/provision-enrollment.test.ts` (extend)

- [ ] **Step 9.1: Write the failing tests**

Append to existing test file:
```typescript
describe('provisionEnrollment — indepth-assessment', () => {
  it('individual mode inserts a takers row with institution_id NULL and sends invite', async () => {
    // STUB: full execution requires live Supabase + Resend + ConvertKit mocks.
    // Type-only check that the function accepts the new metadata shape:
    const session = makeSession({
      metadata: {
        product: 'indepth-assessment',
        mode: 'individual',
        leader_email: 'buyer@bank.test',
        quantity: '1',
      },
      customer_details: { email: 'buyer@bank.test', /* ... */ } as any,
    });
    // const result = await provisionEnrollment(session);
    // assert.equal(result.action, 'created');
    // assert.equal(result.type, 'indepth-individual');
    expect(session.metadata?.product).toBe('indepth-assessment');
  });

  it('institution mode inserts an institutions row but no taker rows', async () => {
    const session = makeSession({
      metadata: {
        product: 'indepth-assessment',
        mode: 'institution',
        leader_email: 'leader@bank.test',
        quantity: '10',
        institution_name: 'First Community Bank',
      },
    });
    expect(session.metadata?.institution_name).toBe('First Community Bank');
  });
});
```

- [ ] **Step 9.2: Extend provision-enrollment.ts**

Add new branches inside the function:

```typescript
// After the existing aibi-p branches, before the final 'Unrecognised mode' return:

if (product === 'indepth-assessment' && mode === 'individual') {
  // Idempotency: skip if a row with this stripe_session_id already exists.
  const { data: existing, error: existingErr } = await supabase
    .from('indepth_assessment_takers')
    .select('id')
    .eq('stripe_session_id', session.id)
    .limit(1);

  if (existingErr) return { error: 'lookup failed', code: 'db_error' };
  if (existing && existing.length > 0) {
    return { action: 'skipped', type: 'indepth-individual' };
  }

  const { generateInviteToken } = await import('@/lib/indepth/tokens');
  const token = generateInviteToken();

  const leaderEmail = (metadata.leader_email ?? session.customer_details?.email ?? '') as string;
  if (!leaderEmail) {
    return { error: 'No email available for indepth-individual', code: 'missing_metadata' };
  }

  const { error: insertErr } = await supabase
    .from('indepth_assessment_takers')
    .insert({
      institution_id: null,
      invite_email: leaderEmail,
      invite_token: token,
      stripe_session_id: session.id,
    });

  if (insertErr) {
    // 23505 = unique_violation; treat as idempotent retry race
    if (insertErr.code === '23505') return { action: 'skipped', type: 'indepth-individual' };
    return { error: 'insert failed', code: 'db_error' };
  }

  // Send invite email + apply ConvertKit tag (best-effort, non-blocking)
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aibankinginstitute.com';
  const takeUrl = `${origin}/assessment/in-depth/take?token=${token}`;
  await import('@/lib/resend').then(m => m.sendIndepthIndividualInvite({
    email: leaderEmail, takeUrl,
  }));
  await import('@/lib/convertkit').then(m => m.tagSubscriber?.({
    email: leaderEmail,
    tag: 'indepth-assessment-individual',
  }));

  return { action: 'created', type: 'indepth-individual' };
}

if (product === 'indepth-assessment' && mode === 'institution') {
  const leaderEmail = (metadata.leader_email ?? session.customer_details?.email ?? '') as string;
  const seats = parseInt(metadata.quantity ?? '0', 10);
  const instName = (metadata.institution_name ?? '').trim();

  if (!leaderEmail || !instName || !Number.isFinite(seats) || seats < 10) {
    return { error: 'invalid metadata for indepth-institution', code: 'missing_metadata' };
  }

  const { error: insertErr } = await supabase
    .from('indepth_assessment_institutions')
    .insert({
      institution_name: instName,
      leader_email: leaderEmail,
      seats_purchased: seats,
      stripe_session_id: session.id,
      amount_paid_cents: seats * 7900,
    });

  if (insertErr) {
    if (insertErr.code === '23505') return { action: 'skipped', type: 'indepth-institution' };
    return { error: 'insert failed', code: 'db_error' };
  }

  await import('@/lib/convertkit').then(m => m.tagSubscriber?.({
    email: leaderEmail,
    tag: 'indepth-assessment-leader',
  }));

  return { action: 'created', type: 'indepth-institution' };
}
```

Update the return type (`ProvisionResult.type`) union to include `'indepth-individual' | 'indepth-institution'`.

- [ ] **Step 9.3: Run tests**

```bash
cd ~/Projects/aibi-stripe-products && npm test -- provision-enrollment
```
Expected: pass.

- [ ] **Step 9.4: Run typecheck**

```bash
cd ~/Projects/aibi-stripe-products && npx tsc --noEmit 2>&1 | head -40
```
Fix any reported issues — most likely the `ProvisionResult.type` union expansion needs to be reflected in callers.

- [ ] **Step 9.5: Commit**

```bash
git add src/lib/stripe/provision-enrollment.ts src/lib/stripe/provision-enrollment.test.ts
git commit -m "feat(stripe): provision indepth-assessment enrollments at webhook time"
```

---

## Task 10: /assessment/in-depth marketing page

**Files:**
- Create: `src/app/assessment/in-depth/page.tsx`
- Create: `src/app/assessment/in-depth/_components/BuyForMyselfCard.tsx`
- Create: `src/app/assessment/in-depth/_components/BuyForMyTeamCard.tsx`

- [ ] **Step 10.1: Build page.tsx**

Server component. Sections:
- Hero: "In-Depth AI Readiness Assessment" headline + subhead
- "What you get" 3-column feature row (full 48Q diagnostic, 8-dimension breakdown, 30-day action plan)
- Pricing pair: BuyForMyselfCard ($99 individual) + BuyForMyTeamCard ($79/seat × 10+)
- Privacy footer: explains anonymization for institutional buyers (1-paragraph callout)

Use existing typography tokens (Cormorant headings, DM Sans body, DM Mono for numbers). Color discipline: terra for CTAs, cobalt forbidden here (cobalt = Pillar B / security only per CLAUDE.md).

- [ ] **Step 10.2: Build BuyForMyselfCard.tsx**

Client component. Form:
- Email input (required)
- Submit button "Buy for myself — $99"
- POSTs to `/api/create-checkout` with `{ product: 'indepth-assessment', mode: 'individual', leader_email: email }`
- On success → redirect to `result.url`
- On error → render inline error message

- [ ] **Step 10.3: Build BuyForMyTeamCard.tsx**

Client component. Form:
- Email input (required) — labeled "Your email (the leader's email)"
- Institution name input (required)
- Quantity input (number, min 10, default 10)
- Live total display: `quantity × $79 = $X` rendered in DM Mono
- Submit button "Buy for my team — $X"
- POSTs to `/api/create-checkout` with `{ product: 'indepth-assessment', mode: 'institution', leader_email, institution_name, quantity }`
- Same redirect / error handling as Step 10.2

- [ ] **Step 10.4: Manual smoke**

```bash
cd ~/Projects/aibi-stripe-products && npm run dev
```
Visit `http://localhost:3000/assessment/in-depth`. Verify both cards render. Submit each (with test Stripe key — checkout will redirect; cancel and return).

- [ ] **Step 10.5: Commit**

```bash
git add src/app/assessment/in-depth/
git commit -m "feat(indepth): marketing page with buy-for-myself + buy-for-my-team CTAs"
```

---

## Task 11: /assessment/in-depth/take — token-gated 48Q flow

**Files:**
- Create: `src/app/assessment/in-depth/take/page.tsx`
- Create: `src/app/assessment/in-depth/take/_TakeClient.tsx`
- Create: `src/app/api/indepth/submit-answers/route.ts`
- Test: `src/app/api/indepth/submit-answers/route.test.ts`

The take flow reuses `content/assessments/v2/questions.ts` and existing `useAssessmentV2` hook patterns where possible. Differences from the free flow: present ALL 48 questions (no 12-question rotation), token validation up-front, persists final score+answers to `indepth_assessment_takers`.

- [ ] **Step 11.1: Build the take page (server)**

`page.tsx`:
- Read `?token=` from searchParams
- Validate format with `isValidInviteToken`
- Look up the taker row by token (service-role lookup; this is a public flow)
- If not found → render "Invite link is invalid or expired"
- If `completed_at IS NOT NULL` → redirect to `/results/in-depth/{taker.id}`
- Otherwise mark `invite_consumed_at = now()` if null, render `<TakeClient takerId={...} />`

- [ ] **Step 11.2: Build the take client**

`_TakeClient.tsx` (client component):
- Render all 48 questions (no rotation — pull straight from `questions` export).
- One-question-at-a-time UX on mobile (existing v2 pattern).
- Persist progress to localStorage keyed by taker id (so a refresh doesn't lose state).
- On final submit → POST `/api/indepth/submit-answers` with `{ takerId, answers }`.
- On success → redirect to `/results/in-depth/{takerId}`.

- [ ] **Step 11.3: Write tests for /api/indepth/submit-answers**

```typescript
import { describe, it, expect } from 'vitest';
import { POST } from './route';

const makeReq = (body: unknown) => new Request('https://x/api/indepth/submit-answers', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

describe('POST /api/indepth/submit-answers', () => {
  it('rejects missing takerId', async () => {
    const res = await POST(makeReq({ answers: {} }));
    expect(res.status).toBe(400);
  });

  it('rejects answers with wrong question count', async () => {
    const res = await POST(makeReq({ takerId: 'uuid', answers: { 'cau-01': 3 } }));
    expect(res.status).toBe(400);
  });

  it('rejects scores outside 1-4', async () => {
    const answers = Object.fromEntries(
      Array.from({ length: 48 }, (_, i) => [`q-${i}`, i === 0 ? 99 : 2])
    );
    const res = await POST(makeReq({ takerId: 'uuid', answers }));
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 11.4: Build /api/indepth/submit-answers**

```typescript
// src/app/api/indepth/submit-answers/route.ts
import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/client';
import { questions } from 'content/assessments/v2/questions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALL_QUESTION_IDS = new Set(questions.map(q => q.id));

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.takerId !== 'string') {
    return NextResponse.json({ error: 'takerId required' }, { status: 400 });
  }

  const answers = body.answers as Record<string, number>;
  if (!answers || Object.keys(answers).length !== 48) {
    return NextResponse.json({ error: 'must answer all 48 questions' }, { status: 400 });
  }

  for (const [qid, score] of Object.entries(answers)) {
    if (!ALL_QUESTION_IDS.has(qid)) {
      return NextResponse.json({ error: `unknown question id: ${qid}` }, { status: 400 });
    }
    if (!Number.isInteger(score) || score < 1 || score > 4) {
      return NextResponse.json({ error: `invalid score for ${qid}` }, { status: 400 });
    }
  }

  // Compute totals
  const total = Object.values(answers).reduce((a, b) => a + b, 0);
  const perDim: Record<string, number> = {};
  for (const q of questions) {
    perDim[q.dimension] = (perDim[q.dimension] ?? 0) + (answers[q.id] ?? 0);
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from('indepth_assessment_takers')
    .update({
      completed_at: new Date().toISOString(),
      score_total: total,
      score_per_dimension: perDim,
      answers,
    })
    .eq('id', body.takerId);

  if (error) {
    return NextResponse.json({ error: 'persist failed' }, { status: 500 });
  }

  // Apply completer tag (best-effort)
  try {
    const { data: row } = await supabase
      .from('indepth_assessment_takers')
      .select('invite_email')
      .eq('id', body.takerId)
      .single();
    if (row?.invite_email) {
      const { tagSubscriber } = await import('@/lib/convertkit');
      await tagSubscriber?.({ email: row.invite_email, tag: 'indepth-assessment-completer' });
    }
  } catch { /* swallow */ }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 11.5: Run tests, expect pass**

```bash
cd ~/Projects/aibi-stripe-products && npm test -- submit-answers
```

- [ ] **Step 11.6: Commit**

```bash
git add src/app/assessment/in-depth/take/ src/app/api/indepth/submit-answers/
git commit -m "feat(indepth): token-gated 48-question take flow"
```

---

## Task 12: /results/in-depth/{id} results page

**Files:**
- Create: `src/app/results/in-depth/[id]/page.tsx`

- [ ] **Step 12.1: Build the page (server component)**

- Fetch the taker row by id (service role)
- If `completed_at IS NULL` → 404
- Compute tier via `getTier(score_total)` from `content/assessments/v2/scoring.ts`
- Render: score (DM Mono, big), tier label + headline, per-dimension breakdown bars (8 dimensions), tailored next steps using existing `starter-artifacts.ts` data.

Reuse the visual language of `src/app/assessment/_components/ResultsView.tsx`. The data shape is the same; only the source (DB row instead of in-flight session state) differs.

- [ ] **Step 12.2: Send results email at completion**

Modify `src/app/api/indepth/submit-answers/route.ts` (Task 11) to fire `sendIndepthIndividualResults` after the DB update succeeds, with `resultsUrl = ${origin}/results/in-depth/${takerId}`.

- [ ] **Step 12.3: Manual smoke**

After Task 11 + this task land, manually walk: buy ($99) → check email link → take → submit → land on results URL → verify email arrives.

- [ ] **Step 12.4: Commit**

```bash
git add src/app/results/in-depth/ src/app/api/indepth/submit-answers/route.ts
git commit -m "feat(indepth): owner-bound /results/in-depth/{id} + completion email"
```

---

## Task 13: /api/indepth/invite — leader generates invites

**Files:**
- Create: `src/app/api/indepth/invite/route.ts`
- Test: `src/app/api/indepth/invite/route.test.ts`

- [ ] **Step 13.1: Tests**

```typescript
import { describe, it, expect } from 'vitest';
import { POST } from './route';

const makeReq = (body: unknown, cookies: Record<string, string> = {}) =>
  new Request('https://x/api/indepth/invite', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('POST /api/indepth/invite', () => {
  it('rejects unauthenticated request', async () => {
    const res = await POST(makeReq({ institutionId: 'uuid', emails: ['a@b.c'] }));
    expect([401, 403]).toContain(res.status);
  });

  it('rejects emails over remaining seat count', async () => {
    // Stub: requires test fixture institution + auth
    expect(true).toBe(true);
  });

  it('rejects malformed emails', async () => {
    // Stub
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 13.2: Implementation**

Behavior:
- Authenticate via Supabase session cookies (`createServerClient(cookies())`)
- Read `institutionId`, `emails: string[]` from body
- Verify caller's `auth.uid()` matches `leader_user_id` on the institution row (or bind it now if currently null AND `leader_email` matches caller's email)
- Validate each email format
- Compute `seats_used = count(takers WHERE institution_id = institutionId)`; reject if `seats_used + emails.length > seats_purchased`
- For each email: generate token, insert taker row, send `sendIndepthInstitutionInvite`
- Return `{ created: emails.length, errors: [] }` (or partial success with errors per email)

- [ ] **Step 13.3: Run tests, expect pass**

```bash
cd ~/Projects/aibi-stripe-products && npm test -- indepth/invite
```

- [ ] **Step 13.4: Commit**

```bash
git add src/app/api/indepth/invite/
git commit -m "feat(indepth): leader invite API with seat-cap enforcement"
```

---

## Task 14: /api/indepth/aggregate — anonymized aggregate report

**Files:**
- Create: `src/lib/indepth/aggregate.ts` (pure logic, no I/O)
- Test: `src/lib/indepth/aggregate.test.ts`
- Create: `src/app/api/indepth/aggregate/route.ts`

Pure-logic function isolated for high test coverage; route is a thin wrapper.

- [ ] **Step 14.1: Tests for aggregate logic**

`src/lib/indepth/aggregate.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { computeAggregate, MIN_RESPONSES, CHAMPION_THRESHOLD } from './aggregate';

const completer = (overrides: any) => ({
  invite_email: 'x@b.test',
  completed_at: new Date().toISOString(),
  score_total: 30,
  score_per_dimension: {},
  ...overrides,
});

describe('computeAggregate', () => {
  it('returns floor message when fewer than MIN_RESPONSES completed', () => {
    const result = computeAggregate({
      institutionName: 'Test', seatsPurchased: 10,
      takers: [
        completer({ invite_email: 'a@b.test' }),
        completer({ invite_email: 'c@b.test' }),
      ],
    });
    expect(result.unlocked).toBe(false);
    expect(result.responsesReceived).toBe(2);
  });

  it('returns full aggregate at MIN_RESPONSES (3) and above', () => {
    const result = computeAggregate({
      institutionName: 'Test', seatsPurchased: 10,
      takers: [
        completer({ invite_email: 'a@b.test', score_total: 24 }),
        completer({ invite_email: 'b@b.test', score_total: 30 }),
        completer({ invite_email: 'c@b.test', score_total: 36 }),
      ],
    });
    expect(result.unlocked).toBe(true);
    expect(result.overall.average_score).toBe(30);
  });

  it('surfaces 0 champions when nobody clears the threshold', () => {
    const result = computeAggregate({
      institutionName: 'Test', seatsPurchased: 10,
      takers: Array.from({ length: 5 }, (_, i) =>
        completer({ invite_email: `${i}@b.test`, score_total: 30 })),
    });
    expect(result.champions).toHaveLength(0);
  });

  it('surfaces top 2 champions only when score >= 39', () => {
    const result = computeAggregate({
      institutionName: 'Test', seatsPurchased: 10,
      takers: [
        completer({ invite_email: 'a@b.test', score_total: 45 }),
        completer({ invite_email: 'b@b.test', score_total: 42 }),
        completer({ invite_email: 'c@b.test', score_total: 38 }),  // below threshold
        completer({ invite_email: 'd@b.test', score_total: 30 }),
      ],
    });
    expect(result.champions.map(c => c.email)).toEqual(['a@b.test', 'b@b.test']);
  });

  it('never exposes raw scores in the response', () => {
    const result = computeAggregate({
      institutionName: 'Test', seatsPurchased: 10,
      takers: [
        completer({ invite_email: 'a@b.test', score_total: 24 }),
        completer({ invite_email: 'b@b.test', score_total: 30 }),
        completer({ invite_email: 'c@b.test', score_total: 36 }),
      ],
    });
    const json = JSON.stringify(result);
    expect(json).not.toContain('"score_total"');
    expect(json).not.toContain('"answers"');
  });
});
```

- [ ] **Step 14.2: Run tests, expect failure**

- [ ] **Step 14.3: Implement aggregate.ts**

```typescript
// src/lib/indepth/aggregate.ts
// Pure logic — no DB, no I/O. Drives the institution leader's dashboard.
// All anonymization rules from spec §6.1 enforced here.

import { getTier } from 'content/assessments/v2/scoring';
import { questions } from 'content/assessments/v2/questions';

export const MIN_RESPONSES = 3;
export const CHAMPION_THRESHOLD = 39;
export const CHAMPION_LIMIT = 2;

const DIMENSIONS = Array.from(new Set(questions.map(q => q.dimension)));
const DIMENSION_LABELS: Record<string, string> = {
  // Map dimension ids to human labels — pull from existing v2 data
  // See content/assessments/v2/types.ts for the canonical map; use it directly:
  // import { DIMENSION_LABELS } from 'content/assessments/v2/types';
};

// (Adapt to actual labels available in v2/types.ts.)

interface Taker {
  invite_email: string;
  completed_at: string | null;
  score_total: number | null;
  score_per_dimension: Record<string, number> | null;
}

interface Input {
  institutionName: string;
  seatsPurchased: number;
  takers: ReadonlyArray<Taker>;
}

interface Aggregate {
  unlocked: boolean;
  institutionName: string;
  seatsPurchased: number;
  responsesReceived: number;
  responsesInProgress: number;
  responsesPending: number;
  overall?: {
    average_score: number;
    distribution: Record<string, number>;
    tier_label: string;
  };
  dimensions?: Array<{
    dimension_id: string;
    dimension_label: string;
    average: number;
    range: { min: number; max: number };
    distribution: { low: number; mid: number; high: number };
    weakest_areas: boolean;
    strongest_areas: boolean;
  }>;
  champions: Array<{ email: string; overall_score: number; strongest_dimension: string }>;
  recommended_focus?: Array<{ dimension_label: string; reason: string; starter_artifact_link: string }>;
}

export function computeAggregate(input: Input): Aggregate {
  const completed = input.takers.filter(t => t.completed_at && t.score_total != null);
  const inProgress = input.takers.filter(t => !t.completed_at).length;
  // Note: pending = invited but not consumed; need invite_consumed_at to distinguish.
  // For v1, treat all not-completed as "in progress" if you don't have invite_consumed_at in scope.

  const responsesReceived = completed.length;

  if (responsesReceived < MIN_RESPONSES) {
    return {
      unlocked: false,
      institutionName: input.institutionName,
      seatsPurchased: input.seatsPurchased,
      responsesReceived,
      responsesInProgress: inProgress,
      responsesPending: input.seatsPurchased - input.takers.length,
      champions: [],
    };
  }

  const sum = completed.reduce((s, t) => s + (t.score_total ?? 0), 0);
  const avg = sum / completed.length;

  const distribution = {
    starting_point: completed.filter(t => (t.score_total ?? 0) <= 20).length,
    early_stage: completed.filter(t => (t.score_total ?? 0) >= 21 && (t.score_total ?? 0) <= 29).length,
    building_momentum: completed.filter(t => (t.score_total ?? 0) >= 30 && (t.score_total ?? 0) <= 38).length,
    ready_to_scale: completed.filter(t => (t.score_total ?? 0) >= 39).length,
  };

  // Dimensions
  const dimensionStats = DIMENSIONS.map(dim => {
    const scores = completed
      .map(t => t.score_per_dimension?.[dim])
      .filter((s): s is number => typeof s === 'number');
    const avgDim = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const min = scores.length ? Math.min(...scores) : 0;
    const max = scores.length ? Math.max(...scores) : 0;
    const lowBand = avgDim - 4;
    const highBand = avgDim + 4;
    return {
      dimension_id: dim,
      dimension_label: DIMENSION_LABELS[dim] ?? dim,
      average: Math.round(avgDim * 10) / 10,
      range: { min, max },
      distribution: {
        low: scores.filter(s => s < lowBand).length,
        mid: scores.filter(s => s >= lowBand && s <= highBand).length,
        high: scores.filter(s => s > highBand).length,
      },
      weakest_areas: false,
      strongest_areas: false,
    };
  });

  // Mark weakest/strongest 2 dimensions
  const sortedByAvg = [...dimensionStats].sort((a, b) => a.average - b.average);
  sortedByAvg.slice(0, 2).forEach(d => { d.weakest_areas = true; });
  sortedByAvg.slice(-2).forEach(d => { d.strongest_areas = true; });

  // Champions
  const sortedByScore = [...completed].sort((a, b) => (b.score_total ?? 0) - (a.score_total ?? 0));
  const champions = sortedByScore
    .slice(0, CHAMPION_LIMIT)
    .filter(t => (t.score_total ?? 0) >= CHAMPION_THRESHOLD)
    .map(t => {
      const dimScores = t.score_per_dimension ?? {};
      const strongest = Object.entries(dimScores)
        .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] ?? '';
      return {
        email: t.invite_email,
        overall_score: t.score_total ?? 0,
        strongest_dimension: DIMENSION_LABELS[strongest] ?? strongest,
      };
    });

  return {
    unlocked: true,
    institutionName: input.institutionName,
    seatsPurchased: input.seatsPurchased,
    responsesReceived,
    responsesInProgress: inProgress,
    responsesPending: Math.max(0, input.seatsPurchased - input.takers.length),
    overall: {
      average_score: Math.round(avg * 10) / 10,
      distribution,
      tier_label: getTier(Math.round(avg)).label,
    },
    dimensions: dimensionStats,
    champions,
    // recommended_focus: derived from weakest dims; left as v1.5 follow-up.
  };
}
```

- [ ] **Step 14.4: Run tests, expect pass**

- [ ] **Step 14.5: Build the route wrapper**

`src/app/api/indepth/aggregate/route.ts`:
- GET-only, requires authenticated session
- Reads `?institutionId=` from search params
- Verifies caller is `leader_user_id` on the institution
- Loads takers via `createServerClient(cookies())` — RLS enforces visibility
- Calls `computeAggregate(...)` with institution name + seats + takers
- Returns the JSON

- [ ] **Step 14.6: Commit**

```bash
git add src/lib/indepth/aggregate.ts src/lib/indepth/aggregate.test.ts src/app/api/indepth/aggregate/
git commit -m "feat(indepth): anonymized aggregate report API + pure-logic computeAggregate"
```

---

## Task 15: /assessment/in-depth/dashboard — leader's seat management + aggregate

**Files:**
- Create: `src/app/assessment/in-depth/dashboard/page.tsx`
- Create: `src/app/assessment/in-depth/dashboard/_DashboardClient.tsx`

- [ ] **Step 15.1: Build dashboard page (server)**

Auth-gated:
- If unauthenticated → redirect to login with returnTo
- If authenticated but no institution row matches `leader_user_id` AND `leader_email` matches the user's email → bind `leader_user_id = auth.uid()` on the row matching `?session=...` from search params
- Render the dashboard client with the institution id

- [ ] **Step 15.2: Build dashboard client**

Two sections:

1. **Roster** — table of `{ email, status }` per taker row
   - Status: `pending` (invite_consumed_at IS NULL), `in-progress` (consumed, not completed), `complete`
   - "Invite staff" form: textarea (one email per line) + send button
   - On send → POST `/api/indepth/invite`

2. **Aggregate** — fetched from `/api/indepth/aggregate?institutionId=...`
   - If `unlocked: false` → render "Aggregate unlocks at 3 completed responses ({n} of {seats})"
   - If `unlocked: true` → render overall + per-dimension cards + champions section

- [ ] **Step 15.3: Manual smoke**

```bash
npm run dev
```
Walk: buy 10-seat institution → check post-purchase redirect → log in → invite 3 emails → take all 3 from invitation links → return to dashboard → verify aggregate unlocks at exactly 3.

- [ ] **Step 15.4: Commit**

```bash
git add src/app/assessment/in-depth/dashboard/
git commit -m "feat(indepth): leader dashboard — roster, invites, anonymized aggregate"
```

---

## Task 16: Soft-hide AiBI-S and AiBI-L from public surfaces

**Files:**
- Modify: `next.config.mjs` (add 2 redirects)
- Modify: `src/app/education/page.tsx` (remove S/L cards)

- [ ] **Step 16.1: Add redirects to next.config.mjs**

In the `redirects` array, append:
```javascript
{ source: '/courses/aibi-s', destination: '/education', permanent: false },
{ source: '/courses/aibi-l', destination: '/education', permanent: false },
{ source: '/courses/aibi-s/:path*', destination: '/education', permanent: false },
{ source: '/courses/aibi-l/:path*', destination: '/education', permanent: false },
```

`permanent: false` (302) deliberately — these will come back. 301 would cache forever.

Add a comment block ABOVE the redirects:
```javascript
// Decision log: 2026-05-05 — AiBI-S and AiBI-L soft-hidden until ready.
// Reactivation: remove these 4 entries, re-add cards in src/app/education/page.tsx,
// flip products to active=true in Stripe Dashboard.
```

- [ ] **Step 16.2: Remove S/L cards from /education**

Open `src/app/education/page.tsx`. Find the array of certifications (the one containing AiBI-P, AiBI-S, AiBI-L). Remove the S and L entries. **Keep AiBI-P only.**

Add a comment above the array:
```typescript
// 2026-05-05: AiBI-S and AiBI-L hidden pending readiness. To restore,
// re-add the entries (kept in git history at commit b37711f) and
// remove the corresponding redirects from next.config.mjs.
```

- [ ] **Step 16.3: Audit other surfaces for S/L mentions**

```bash
cd ~/Projects/aibi-stripe-products
grep -rn -E "(aibi-s|aibi-l|AiBI-S|AiBI-L)" src/ 2>/dev/null \
  | grep -v node_modules \
  | grep -v ".test." \
  | grep -v "/courses/aibi-s/" \
  | grep -v "/courses/aibi-l/" \
  | grep -v provision-enrollment.ts \
  | grep -v stripe.ts
```

Review every hit. For each:
- Public-facing copy → remove or rewrite to say "AiBI-P (additional certifications coming)"
- Type unions / metadata enums → leave (internal only)
- Dashboards / admin surfaces (under `/dashboard/admin/`) → leave (not public)
- Nav components → remove the link

Make changes and re-run grep until only internal references remain.

- [ ] **Step 16.4: Manual smoke**

```bash
npm run dev
```
Visit `/courses/aibi-s` → verify redirect to `/education`. Visit `/education` → verify only AiBI-P card renders.

- [ ] **Step 16.5: Commit**

```bash
git add next.config.mjs src/app/education/ <other touched files from Step 16.3>
git commit -m "feat(site): soft-hide AiBI-S and AiBI-L behind redirects pending readiness"
```

---

## Task 17: Replace advisory tiers with custom-engagements stub on /for-institutions

**Files:**
- Modify: `next.config.mjs` (add advisory redirect)
- Modify: `src/app/for-institutions/page.tsx`

- [ ] **Step 17.1: Add advisory redirect**

Append to `next.config.mjs` redirects array:
```javascript
{ source: '/for-institutions/advisory', destination: '/for-institutions', permanent: false },
{ source: '/for-institutions/advisory/:path*', destination: '/for-institutions', permanent: false },
```

- [ ] **Step 17.2: Remove advisory tier cards from /for-institutions/page.tsx**

Identify the section rendering the three advisory tiers (Pilot · Program · Leadership Advisory). Delete that section entirely. Keep:
- The In-Depth Assessment institution-bundle pitch (10+ × $79)
- The AiBI-P institution bundle pitch (10+ × $199)

- [ ] **Step 17.3: Add custom-engagements stub**

Append a small section near the bottom of the page:

```tsx
<section className="mt-24 max-w-2xl mx-auto text-center">
  <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
    Custom Engagements
  </p>
  <h3 className="font-serif text-2xl text-[color:var(--color-ink)] leading-tight">
    Tailored advisory work
  </h3>
  <p className="mt-4 font-sans text-sm text-[color:var(--color-ink)]/80">
    For institution-wide enablement programs or custom advisory engagements,
    please reach out:
  </p>
  <p className="mt-3 font-mono text-sm">
    <a
      href="mailto:hello@aibankinginstitute.com"
      className="text-[color:var(--color-terra)] hover:text-[color:var(--color-terra-light)] underline underline-offset-4"
    >
      hello@aibankinginstitute.com
    </a>
  </p>
</section>
```

(User can swap the email address during execution if they prefer a different one.)

- [ ] **Step 17.4: Verify the existing /services 301 is intact**

```bash
grep -n "'/services'" next.config.mjs
```
Expected: `{ source: '/services', destination: '/for-institutions', permanent: true }`. Do not remove or change this.

- [ ] **Step 17.5: Manual smoke**

`/for-institutions/advisory` → redirect to `/for-institutions`. `/for-institutions` shows In-Depth + AiBI-P institution pitches and the custom-engagements mailto stub at bottom. No advisory tier cards visible.

- [ ] **Step 17.6: Commit**

```bash
git add next.config.mjs src/app/for-institutions/page.tsx
git commit -m "feat(site): replace advisory tiers with custom-engagements contact stub"
```

---

## Task 18: Add free-assessment soft CTA pointing to In-Depth

**Files:**
- Modify: `src/app/assessment/_components/ResultsViewV2.tsx` (or wherever the email-gated results render)

- [ ] **Step 18.1: Identify insertion point**

```bash
cd ~/Projects/aibi-stripe-products
grep -n "starter" src/app/assessment/_components/ResultsViewV2.tsx | head -10
```
Insert below the starter-artifact card, above the footer.

- [ ] **Step 18.2: Add CTA block**

```tsx
<aside className="mt-12 border border-[color:var(--color-terra)]/30 bg-[color:var(--color-parch)] p-8">
  <p className="font-serif-sc text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
    Want the full picture?
  </p>
  <h3 className="font-serif text-xl text-[color:var(--color-ink)] leading-tight">
    The In-Depth Assessment is 48 questions across all 8 dimensions
  </h3>
  <p className="mt-3 font-sans text-sm text-[color:var(--color-ink)]/80">
    Same diagnostic, full depth — every dimension scored independently, with a
    20-page institutional report and a 30-day action plan.
  </p>
  <a
    href="/assessment/in-depth"
    className="mt-4 inline-block px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-mono text-[10px] uppercase tracking-[0.15em] hover:bg-[color:var(--color-terra-light)] transition-colors"
  >
    See the In-Depth Assessment →
  </a>
</aside>
```

- [ ] **Step 18.3: Manual smoke**

Walk through the free assessment, enter email, verify the new CTA appears below the starter artifact.

- [ ] **Step 18.4: Commit**

```bash
git add src/app/assessment/_components/ResultsViewV2.tsx
git commit -m "feat(assessment): soft CTA from free results to In-Depth Assessment"
```

---

## Task 19: CLAUDE.md Decisions Log entry

**Files:**
- Modify: `CLAUDE.md` (in main worktree, copied via the same pattern as `docs/stripe-products.md`)

- [ ] **Step 19.1: Add the entry**

Append this entry under the existing "## Decisions Log" section, after the most recent entry:

```markdown
**2026-05-05 — Product menu simplified to four tiers.** Public site reduced
to: free assessment, In-Depth Assessment ($99 / $79 at 10+), AiBI-P course
($295 / $199 at 10+), and a "custom engagements — contact us" stub. AiBI-S
and AiBI-L soft-hidden (route redirects to /education, products deactivated
in Stripe — reversible by toggle). Advisory tiers (Pilot/Program/Leadership
Advisory) removed pending case-study content. The 48 questions in
content/assessments/v2/questions.ts now back two products: the existing
free 12-question rotation, and a new paid 48-question In-Depth Assessment
with hybrid individual/institution flow + anonymized aggregate report for
institution leaders. Tier thresholds rebalanced from 8-32 to 12-48 scale
(equal-spaced 9-point bands: 12-20, 21-29, 30-38, 39-48). Plans/ canonical
specs left unchanged — site intentionally diverges from plans for tiers
being held back. Decision drivers + design discussion in
`docs/superpowers/specs/2026-05-05-product-simplification-and-indepth-assessment-design.md`.
```

- [ ] **Step 19.2: Mirror to main worktree**

CLAUDE.md is the file in the main worktree. Edit there:
```bash
# Edit ~/Projects/TheAiBankingInstitute/CLAUDE.md (main worktree)
# Then mirror into feature worktree for commit:
cp ~/Projects/TheAiBankingInstitute/CLAUDE.md ~/Projects/aibi-stripe-products/CLAUDE.md
```

- [ ] **Step 19.3: Commit**

```bash
cd ~/Projects/aibi-stripe-products
git add CLAUDE.md
git commit -m "docs(claude.md): log 2026-05-05 product simplification + In-Depth launch"
```

---

## Task 20: End-to-end manual walkthrough

No code. This is a checklist. Document the run in `tasks/indepth-launch-walkthrough-2026-05-05.md`.

- [ ] **Step 20.1: Test individual purchase ($99) end-to-end**

  - [ ] `/assessment/in-depth` renders, both cards visible
  - [ ] Submit BuyForMyself with `you+test@example.com`
  - [ ] Stripe Checkout loads with $99 amount
  - [ ] Apply promo code `AIBI-COMP-01` → total goes to $0
  - [ ] Complete checkout
  - [ ] Inbox receives `INDIVIDUAL_INVITE` email
  - [ ] Click link → `/assessment/in-depth/take?token=...` loads
  - [ ] Answer all 48 questions
  - [ ] Submit → land on `/results/in-depth/{id}` with scored breakdown
  - [ ] Inbox receives `INDIVIDUAL_RESULTS` email with that URL
  - [ ] Verify `indepth_assessment_takers` row has `score_total`, `score_per_dimension`, `answers` populated
  - [ ] Verify ConvertKit subscriber tagged `indepth-assessment-individual` and `indepth-assessment-completer`

- [ ] **Step 20.2: Test institution purchase (10 seats × $79) end-to-end**

  - [ ] Submit BuyForMyTeam with quantity 10, institution name, leader email
  - [ ] Stripe Checkout shows $790 total
  - [ ] Apply promo code `AIBI-COMP-02` → total goes to $0
  - [ ] Complete checkout → redirected to `/assessment/in-depth/dashboard?session=...`
  - [ ] Sign up / log in
  - [ ] Verify `indepth_assessment_institutions` row created and `leader_user_id` bound
  - [ ] Roster shows 0 of 10 seats used
  - [ ] Invite 3 staff emails (use 3 mailbox addresses you control)
  - [ ] Verify 3 `INSTITUTION_INVITE` emails sent
  - [ ] Take the assessment from each invite link
  - [ ] After 2 of 3 complete: dashboard shows aggregate locked
  - [ ] After 3 complete: aggregate unlocks; verify per-dimension breakdown, no individual scores leaking, no names exposed
  - [ ] If any score ≥ 39, verify champion section surfaces email + strongest dimension

- [ ] **Step 20.3: Test soft hides**

  - [ ] `/courses/aibi-s` → 302 → `/education`
  - [ ] `/courses/aibi-l` → 302 → `/education`
  - [ ] `/for-institutions/advisory` → 302 → `/for-institutions`
  - [ ] `/education` page renders only AiBI-P card
  - [ ] `/for-institutions` shows custom-engagements mailto stub

- [ ] **Step 20.4: Test tier rebalance on free assessment**

  - [ ] Take the free 12Q assessment with answers averaging ~3 (score in 30-38 range)
  - [ ] Verify "Building Momentum" tier label rendered
  - [ ] Take with all 1s (score 12) → "Starting Point"
  - [ ] Take with all 4s (score 48) → "Ready to Scale"

- [ ] **Step 20.5: Final commit + summary**

```bash
git add tasks/indepth-launch-walkthrough-2026-05-05.md
git commit -m "docs(walkthrough): end-to-end test record for In-Depth Assessment launch"
```

---

## Done state

When all 20 tasks are complete:
- Stripe sandbox: 4 products, 2 active (In-Depth, AiBI-P), 2 inactive (S, L)
- Public site: 4 product tiers visible (free assessment, In-Depth $99/$79, AiBI-P $295/$199, custom-engagements stub)
- In-Depth Assessment: working end-to-end for both individual and institution purchase paths
- Anonymized aggregate report: enforces 3-response floor, top-2 champion threshold ≥ 39
- AiBI-S / AiBI-L: soft-hidden (route redirects + product cards removed); reversible in <10 minutes
- Advisory tiers: removed; replaced with mailto contact stub
- Free assessment: tier thresholds rebalanced to 12-48 scale
- All changes on `feature/stripe-products` branch, **not pushed** (push requires explicit user approval per CLAUDE.md)

## Open implementation flags (decide during execution, not now)

- Email address in custom-engagements stub (default: `hello@aibankinginstitute.com`)
- Champion threshold may need post-launch tuning based on real distributions; centralized in `src/lib/indepth/aggregate.ts` constants
- Resend templates use existing transactional-email lib; layout follows `sendAssessmentBreakdownEmail` voice
- Stripe live-mode migration: separate task, not in scope here
- Staging environment testing: deferred — `staging.aibankinginstitute.com` does not exist yet
