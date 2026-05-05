# Product Simplification + In-Depth Assessment Hybrid — Design

**Date:** 2026-05-05
**Author:** James Gilmore (with Claude Opus 4.7)
**Status:** Approved for implementation planning
**Related:** `docs/stripe-products.md`, `content/assessments/v2/`, CLAUDE.md Decisions Log

---

## 1. Summary

Streamline the public product menu to four tiers, only three of which are visible
today. Build the previously-deferred **In-Depth AI Readiness Assessment** as a
hybrid product: individuals ($99) get their own results; institutional buyers
(10+ seats × $79) get a magic-link distribution flow plus an anonymized
aggregate report for the institution leader.

The 48 questions already exist in `content/assessments/v2/questions.ts`; this
spec is **not authoring content**. It's packaging, gating, and aggregation logic.

## 2. Public product taxonomy after this work lands

| Tier | Product | Price | State after launch |
|---|---|---|---|
| 1 | Free Readiness Assessment | $0 | Live (12 of 48 rotating) |
| 2 | In-Depth AI Readiness Assessment — Individual | $99 | NEW |
| 2 | In-Depth AI Readiness Assessment — Institution | $79/seat × 10+ | NEW |
| 3 | AI Banking Practitioner Course (AiBI-P) | $295 / $199/seat × 10+ | Live |
| — | AiBI-S Specialist | (was $1,495) | Soft-hidden + Stripe-deactivated |
| — | AiBI-L Leader | (was $2,800 / $12,000) | Soft-hidden + Stripe-deactivated |
| 4 | Custom engagements / Advisory | Custom | "Contact us" stub only |

## 3. Site information architecture

```
PUBLIC ROUTES
├── /                                         [LIVE] no change
├── /assessment                               [LIVE] free 12Q + new soft CTA to in-depth
├── /assessment/in-depth                      [NEW] marketing pitch + 2 buy CTAs
├── /assessment/in-depth/take                 [NEW] magic-link assessment flow (token-gated)
├── /assessment/in-depth/dashboard            [NEW] leader's seat-mgmt + aggregate (auth-gated)
├── /education                                [LIVE] AiBI-P card only; S/L cards REMOVED
├── /courses/aibi-p                           [LIVE] $295/$199 — unchanged
├── /courses/aibi-s                           [SOFT HIDE] redirect → /education
├── /courses/aibi-l                           [SOFT HIDE] redirect → /education
├── /for-institutions                         [LIVE] advisory tiers REMOVED, contact stub ADDED
└── /for-institutions/advisory                [SOFT HIDE] redirect → /for-institutions
```

Soft hide = redirect via `next.config.mjs`. Page files remain on disk, unreachable.
Restoring an offering in the future = remove redirect entry, re-add card to
`/education`, flip Stripe product `active=true`. ~10-minute reversal, no rework.

## 4. In-Depth Assessment flow

### 4.1 Individual buyer ($99)

1. `/assessment/in-depth` → click "Buy for myself"
2. `POST /api/create-checkout { product: 'indepth-assessment', mode: 'individual' }`
3. Stripe Checkout Session: `allow_promotion_codes: true` (so `AIBI-COMP-*` codes work)
4. `checkout.session.completed` → webhook → `provisionEnrollment()`:
   - Insert 1 row in `indepth_assessment_takers` with `institution_id = NULL`
   - Generate magic token, store in `invite_token`
   - Send `INDIVIDUAL_INVITE` email via Resend
   - Apply ConvertKit tag `indepth-assessment-individual`
5. Buyer clicks emailed link → `/assessment/in-depth/take?token=xyz`
6. Token verified, marks seat consumed (`invite_consumed_at = now()`)
7. Buyer answers 48 questions
8. Results page renders: full 8-dimension breakdown, peer band, recommended
   playbook, 30-day plan
9. Owner-bound `/results/in-depth/{id}` URL emailed (Spec 4 pattern)
10. Apply ConvertKit tag `indepth-assessment-completer`

### 4.2 Institution buyer (10+ seats × $79)

1. `/assessment/in-depth` → click "Buy for my team"
2. Quantity selector (min 10) + `institution_name` + buyer email captured
3. `POST /api/create-checkout { product: 'indepth-assessment', mode: 'institution',
   quantity: N, institution_name }`
4. Stripe Checkout Session: `allow_promotion_codes: true`,
   `phone_number_collection: false`, capture buyer name via Stripe's
   `customer_creation`
5. `checkout.session.completed` → webhook:
   - Insert row in `indepth_assessment_institutions` with
     `seats_purchased = quantity`, `leader_email = buyer email`,
     `leader_user_id = NULL` (bound on first dashboard login)
   - Apply ConvertKit tag `indepth-assessment-leader` to leader email
   - **No taker rows yet** — leader generates those at the dashboard
6. Buyer redirected to `/assessment/in-depth/dashboard?session={stripe_session_id}`
7. First dashboard visit: prompt buyer to log in or sign up via Supabase Auth
   (existing flow). On successful auth, bind `leader_user_id` to current row
   matching `stripe_session_id` and `leader_email`.
8. Dashboard shows:
   - Roster (initially empty)
   - "Invite staff" textarea — paste up to N emails; system enforces N ≤ remaining seats
   - On send: 1 row per email in `indepth_assessment_takers`, magic token
     generated, `INSTITUTION_INVITE` email sent via Resend (with leader name in
     subject and body)
   - Live status per row: `pending` (invite_consumed_at IS NULL) /
     `in-progress` (consumed but not completed) / `complete`
   - "View aggregate report" button — disabled until 3+ takers complete
9. Each invitee clicks email → `/assessment/in-depth/take?token=...` → 48Q →
   their own results (private; leader never sees individual scores)

## 5. Data model

```sql
-- Migration file (next sequential number)
-- supabase/migrations/000NN_indepth_assessment_tables.sql

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
  CONSTRAINT one_seat_per_email_per_institution
    UNIQUE (institution_id, invite_email)
);

CREATE INDEX idx_indepth_takers_institution ON indepth_assessment_takers(institution_id);
CREATE INDEX idx_indepth_takers_token ON indepth_assessment_takers(invite_token);
CREATE INDEX idx_indepth_inst_leader ON indepth_assessment_institutions(leader_user_id);

ALTER TABLE indepth_assessment_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE indepth_assessment_takers ENABLE ROW LEVEL SECURITY;

-- Leader reads own institution + its takers (RLS pattern from CLAUDE.md)
CREATE POLICY "Leader reads own institution" ON indepth_assessment_institutions
  FOR SELECT TO authenticated
  USING (leader_user_id = (select auth.uid()));

CREATE POLICY "Leader reads own institution takers" ON indepth_assessment_takers
  FOR SELECT TO authenticated
  USING (institution_id IN (
    SELECT id FROM indepth_assessment_institutions
    WHERE leader_user_id = (select auth.uid())
  ));

-- Service role bypasses RLS for token-based take flow + webhook inserts
```

**Tier thresholds rebalanced for 12-48 scale (used by both free and in-depth):**
- Starting Point: 12-20 (was 8-14)
- Early Stage: 21-29 (was 15-21)
- Building Momentum: 30-38 (was 22-27)
- Ready to Scale: 39-48 (was 28-32)

Equal-spaced bands of 9 points each (10 in the top tier, which gets the
remainder of the 12-48 range). Same labels, same color tokens
(`var(--color-error)`, `var(--color-terra)`, `var(--color-terra-light)`,
`var(--color-sage)`). Old `assessment_responses` rows keep their existing tier
labels — no migration to rebucket historical data.

**Champion threshold rescaled accordingly:** ≥ 36 (75% of 48) → updated to
≥ 39 (entry to "Ready to Scale" tier) to match the new band boundaries.

## 6. Aggregate report (institution leader's view)

```typescript
interface AggregateReport {
  institution_name: string;
  seats_purchased: number;
  responses_received: number;        // count of completed takers
  responses_in_progress: number;
  responses_pending: number;

  overall: {
    average_score: number;           // mean of score_total (12-48 scale)
    distribution: {                  // bucket counts, no individual scores
      starting_point: number;
      early_stage: number;
      building_momentum: number;
      ready_to_scale: number;
    };
    tier_label: string;              // tier of the AVERAGE score
  };

  dimensions: Array<{
    dimension_id: string;
    dimension_label: string;
    average: number;                 // mean per-dimension score (out of 24)
    range: { min: number; max: number };
    distribution: { low: number; mid: number; high: number };
    weakest_areas: boolean;
    strongest_areas: boolean;
  }>;

  champions: Array<{                 // 0, 1, or 2 entries
    email: string;
    overall_score: number;
    strongest_dimension: string;
  }>;

  recommended_focus: Array<{
    dimension_label: string;
    reason: string;
    starter_artifact_link: string;
  }>;
}
```

### 6.1 Anonymization rules

1. **No individual scores ever exposed** — only averages, distributions, ranges.
2. **No names ever exposed** — emails only (which the leader supplied at invite time).
3. **Champions gated** — surfaced only when (a) score is in top 2 AND (b) overall
   score ≥ 39 ("Ready to Scale" tier). If only 1 person clears the bar, only 1
   surfaces; if zero, the section doesn't render.
4. **3-response privacy floor** — if `responses_received < 3`, render "Aggregate
   report unlocks at 3 completed responses (currently {n} of {seats_purchased})".
   Hide everything except roster status counts.
5. **Per-dimension distributions are bucketed** (low/mid/high thirds) — leader
   cannot reverse-engineer a specific score from a specific person.

## 7. Stripe changes

### 7.1 Already created (no change in this work)
- In-Depth Assessment product + 2 prices ($99 / $79) — `prod_UShU2x1hnWjYe2`
- Comp coupon `gx8c3qa3` + 2 promo codes (`AIBI-COMP-01/02`)
- AiBI-P product + 2 prices ($295 / $199) — `prod_UShU302Dln6DMz`
- Production webhook endpoint listening for `checkout.session.completed`,
  `payment_intent.payment_failed`, `charge.refunded`

### 7.2 Stripe changes this work executes
- Set `prod_UShZSlWrdzgC3w` (AiBI-S) `active = false`
- Set `prod_UShZBcevbScyJJ` (AiBI-L) `active = false`
- Reactivation later = single dashboard toggle (no env or code changes needed)

### 7.3 Checkout Session metadata convention
```typescript
metadata: {
  product: 'indepth-assessment',
  mode: 'individual' | 'institution',
  quantity: '1' | '10' | '15' | ...,    // string per Stripe metadata convention
  institution_name?: string,             // institution mode only
  leader_email: string,                  // always
}
```

## 8. Email + ConvertKit

### 8.1 Resend transactional templates (3 new)

1. **INDIVIDUAL_INVITE** — sent to $99 buyer post-purchase
   Subject: "Your In-Depth AI Readiness Assessment is ready"
   Body: button → `/assessment/in-depth/take?token=...`
   Note: "Takes 15-20 minutes. Save and resume any time."

2. **INSTITUTION_INVITE** — one per staff invitee, sent from leader's dashboard
   Subject: "{leader_name} invited you to take the In-Depth AI Readiness Assessment"
   Body: brief context + button → `/assessment/in-depth/take?token=...`
   Privacy line: "Your individual responses stay private; only aggregated
   patterns are shared with leadership."

3. **INDIVIDUAL_RESULTS** — sent to taker on completion
   Subject: "Your In-Depth AI Readiness Assessment results"
   Body: owner-bound `/results/in-depth/{id}` URL + summary stats
   (Reuses Spec 4 pattern from `2026-05-04-assessment-return-url.md`)

Leader does NOT receive a per-taker results email. Leader checks dashboard.

### 8.2 ConvertKit tags (no new sequences in v1)
- `indepth-assessment-individual` — applied to $99 buyer at webhook time
- `indepth-assessment-leader` — applied to 10+ seat buyer at webhook time
- `indepth-assessment-completer` — applied when any taker finishes 48Q

User authors follow-up sequences manually in ConvertKit later. No code change
required to wire sequences if/when they exist (tags are already attached).

## 9. Removal scope (S/L + advisory + alignment audit)

### 9.1 AiBI-S / AiBI-L
- `/courses/aibi-s/*` and `/courses/aibi-l/*` route files: LEAVE on disk.
- `next.config.mjs`: ADD redirects from those routes to `/education`.
- `/education/page.tsx`: REMOVE the AiBI-S and AiBI-L cards from the rendered
  list. Keep code commented or in git history for easy revival.
- Top nav, footer, sitemap.xml: AUDIT and REMOVE any S/L links.
- Inbound links from prose elsewhere: AUDIT — rewrite to `/education` or remove
  the sentence; case-by-case decision per occurrence.
- Plans/ canonical specs: LEAVE unchanged. Plans diverge from current site
  state intentionally, tracked via Decisions Log entry.
- Files like `docs/AiBI-P-Practitioner-Course-Overview.md`: LEAVE.

### 9.2 Consulting / Advisory
- `/for-institutions/advisory` route: redirect to `/for-institutions`.
- `/for-institutions/page.tsx`: REMOVE the "Pilot · Program · Leadership
  Advisory" tier section.
- ADD bottom section to `/for-institutions/page.tsx`:

  > **Custom engagements**
  > For tailored advisory work or institution-wide enablement programs,
  > please reach out: [hello@aibankinginstitute.com](mailto:hello@aibankinginstitute.com)

  Email address can be swapped during implementation if user prefers a
  different one — implementation flag, not a design decision.

- Verify the existing `/services` → `/for-institutions` 301 in `next.config.mjs`
  is intact.

### 9.3 Tier label rebalance side-effects
Files touching the 8-32 numeric thresholds need updating to 12-48:
- `content/assessments/v2/scoring.ts` — primary location
- `src/app/assessment/_components/ResultsView.tsx` and `ResultsViewV2.tsx`
- `src/app/assessment/_lib/useAssessment.ts` and `useAssessmentV2.ts`
- `src/lib/pdf/TransformationReportDocument.tsx`
- Any references to `28`, `22`, `15`, `8` as numeric tier cutoffs in source
- `tasks/todo.md` and `.planning/` references — audit and update copy

### 9.4 CLAUDE.md Decisions Log entry (added in implementation)
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
(linear scaling, same labels and colors). Plans/ canonical specs left
unchanged — site intentionally diverges from plans for tiers being held back.
```

## 10. Out of scope for this implementation

- Authoring new question content (already exists in `v2/questions.ts`)
- Authoring ConvertKit sequences for In-Depth tags (tags only — leader authors
  sequences manually later via ConvertKit dashboard)
- Per-department/unit aggregation (deferred to a later iteration; would add a
  `unit` field per-taker)
- Auto-generating PDF reports for In-Depth takers (in-screen results only for
  v1, same pattern as free assessment; PDF deferred)
- Wiring `charge.refunded` to revoke access (subscribed but not handled in v1
  per `docs/stripe-products.md`)
- AiBI-S / AiBI-L code wiring of any kind (deactivated, soft-hidden)
- Live Stripe mode migration (test-mode only for this feature)
- Staging environment testing (`staging.aibankinginstitute.com` does not exist;
  test against test-mode Stripe in feature worktree dev only)

## 11. Implementation steps (high-level, for the plan)

1. Database migration: `indepth_assessment_institutions` + `indepth_assessment_takers` tables, RLS, indexes
2. Update `CheckoutMetadata` type and `provisionEnrollment` to handle `product: 'indepth-assessment'`
3. Refactor `/api/create-checkout` route to dispatch on `product` (preserve existing AiBI-P behavior)
4. New `/assessment/in-depth/page.tsx` — marketing pitch with two buy CTAs
5. New `/assessment/in-depth/take/page.tsx` — token-gated 48Q flow
6. New `/assessment/in-depth/dashboard/page.tsx` — leader's seat-mgmt + aggregate report
7. New API routes: `/api/indepth/invite` (leader generates invites), `/api/indepth/aggregate` (leader fetches aggregate JSON)
8. Three new Resend templates wired into existing email-sending lib
9. ConvertKit tag application at webhook time (extend existing tag logic)
10. Tier threshold rebalance to 12-48 scale across all referenced files
11. Soft-hide AiBI-S/L: `next.config.mjs` redirects, remove cards from `/education`
12. Remove advisory tiers from `/for-institutions`, add custom-engagements stub
13. Site alignment audit sweep (Section 9 of this spec)
14. Stripe: deactivate AiBI-S and AiBI-L products via MCP
15. CLAUDE.md Decisions Log entry
16. End-to-end test: $99 individual purchase + $790 (10-seat) institution purchase via comp code, verify webhook → token → take → results / dashboard / aggregate at 3+ responses

## 12. Open implementation flags (decide during plan execution, not now)

- Custom-engagements email address default: `hello@aibankinginstitute.com`
  (user can override during plan execution)
- Champion threshold may need tuning post-launch based on real-world score
  distributions; logic is centralized for easy adjustment
- Resend templates use existing transactional-email lib; layout and copy follow
  existing assessment-completion email style (consistent voice with brand)
