# AiBI — Auth & Entitlements Spec
*The server-side flow for the identity ladder (anonymous → email lead → authenticated learner) and what each state can do. Implements Foundation PRD §6.4, §6.5, §6.8 and bridges the Database Schema + Sandbox specs.*

| | |
|---|---|
| **Auth provider** | Supabase Auth (email/password + OAuth) — **learners create their own accounts** |
| **Payments** | Stripe (hosted checkout, webhook-driven entitlement writes) |
| **Email** | MailerLite (nurture, invites) · Resend (transactional) |
| **Data shape** | Defined in `AiBI_Database_Schema_RLS_Spec.md`; this doc owns the *flow* |
| **Status** | Spec v1 — build alongside Stripe + lead capture |

---

## 1 · The three identity states

The product supports **three** distinct identity states. Every endpoint, every UI affordance, and every analytics event must know which state the visitor is in.

| State | How identified | What they can do | What they cannot do |
|---|---|---|---|
| **Anonymous viewer** | Cookie-scoped `anon_session_id` (uuid) only | View published M0–M3 lessons; play sandbox runs (rate-limited); answer knowledge checks (transient) | Save anything; access M4–M5; access Toolbox |
| **Email lead** | `leads.email` (no `auth.users` row) | Everything anon can; **save the 4 free light artifacts**; receive nurture | Access M4–M5; save more than 4 artifacts |
| **Authenticated learner** | `auth.users.id` + `learner_profiles` | Everything lead can; **with active entitlement**: M4–M5, unlimited Toolbox, Prompt Library | Anything they don't own; another learner's data |
| **Team admin** *(sub-role)* | Authenticated + `teams.admin_user_id = uid` | Everything learner can; team rollups; seat invite/assign/revoke | Read seat-holders' artifact bodies or sandbox transcripts |

The **transitions** between these states are the security-critical surface. Get those right and the rest is policy enforcement.

---

## 2 · Anonymous sessions

PRD intent: M0–M3 viewable without account *or* email. We still need to track progress and bind in-session work to a future identity at the gate.

**Implementation:**
- On first visit to any course route, server issues `anon_session_id` (uuid v4) in a **httpOnly, SameSite=Lax, Secure** cookie. Lifetime 30 days; sliding (refreshed on activity). Rotation on identity-binding (anon → lead) for safety.
- All free-side writes (transient knowledge-check results, in-session sandbox runs, draft Toolbox items) key on `anon_session_id`.
- The cookie is **opaque** — it identifies a row in a server-side `anon_sessions` table, not the learner. Stolen cookies grant access to progress only, never to artifacts (anon cannot save).
- Anonymous sandbox runs are rate-limited harder than authenticated runs (Sandbox spec §11): per-IP throttle, per-session token budget, cheaper pinned model, optional lightweight challenge if abuse detected.
- Anon sessions emit `events` with `anon_session_id` populated and `user_id`/`lead_id` null.

```sql
-- Companion table to support anon → lead migration (referenced by §9 of schema spec)
CREATE TABLE anon_sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track       track,                       -- if learner picked one in M0 without auth
  created_at  timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);
```

No RLS — table is server-only (service_role).

---

## 3 · Sign-up & sign-in

**Rule:** the system never creates an account or sets a password on a user's behalf. PRD FR-P4 / FR-U3.

### 3.1 Email/password
- Supabase Auth handles credential storage, email verification, password reset.
- On successful sign-up, the `auth.users` insert trigger fires `create_learner_profile()` (Database spec §10).
- If `learner_profiles.email` matches an existing `leads.email`, the **lead-bind** flow runs (§5).

### 3.2 OAuth / SSO
- Google + Microsoft as v1 providers (most likely match for bank/credit-union staff identities).
- Supabase normalizes the OAuth identity to an `auth.users` row; same lead-bind flow runs.
- Email comes from the OAuth identity; the learner can update marketing consent post-bind.

### 3.3 Email verification
- Required for password sign-up before any paid purchase grant. *(Free-tier reads do not require verification — the verification email itself doubles as MailerLite double opt-in.)*
- Verification email is Supabase-sent (Auth) — not MailerLite.

### 3.4 What we never do
- Auto-create accounts from leads. A lead remains a lead until the human signs up themselves.
- Magic-link sign-in *without* a pre-existing account. (Magic-link for password reset only.)
- Cross-account merges. If a learner signs up with a different email than their lead, the lead stays separate; we do not heuristically merge.

---

## 4 · Gate flow — the three-way fork after M3

PRD §1.3, §6.4. End of Module 3 → screen presents three doors.

```
                       ┌────────── Pay (Individual or Team) ──────────► Checkout (§6)
End of M3 ─► GATE ─────┼────────── Email-to-keep ────────────────────► Lead capture (§5)
                       └────────── Decline (continue without saving) ► (nudge to $99 assessment)
```

### 4.1 Pay path
Routes to `/checkout/individual` or `/checkout/team`. See §6 — Stripe + entitlements.

### 4.2 Email-to-keep path
**Endpoint:** `POST /api/gate/capture-email`
**Auth:** anon session required.
**Body:** `{ email, marketing_opt_in: boolean }`

1. Validate email syntax + RFC compliance.
2. **Rate-limit by IP** (5/hour, sliding window) and by `anon_session_id` (1/session).
3. Server upsert:
   ```sql
   INSERT INTO leads (email, source, track, marketing_opt_in)
   SELECT lower($1), 'gate', a.track, $2
   FROM anon_sessions a WHERE a.id = $session_cookie
   ON CONFLICT (email) DO UPDATE SET
     marketing_opt_in = EXCLUDED.marketing_opt_in,
     track = COALESCE(leads.track, EXCLUDED.track),
     updated_at = now();
   ```
4. **Migrate anon work to lead:** rewrite `toolbox_items.anon_session_id → lead_id`, same for `assessment_results` if present, same for non-transient `knowledge_check_results`.
5. **Apply the 4-artifact cap** before migration — if the anon learner somehow produced more than 4 draft artifacts (shouldn't happen but defensively), keep the 4 most recent of the light types.
6. **MailerLite sync** (if `SKIP_MAILERLITE !== 'true'`):
   - Add to `MAILERLITE_GROUP_ID_NEWSLETTER` (only if `marketing_opt_in`) + assessment-nurture group.
   - `lead.nurture_state` mirrors MailerLite state for observability.
7. **Resend transactional:** "Your free artifacts are saved — here's your library link" + the $99 assessment CTA.
8. Emit `events` with `action='gate_decision'`, `payload={fork:'email', tier:'free'}`.

### 4.3 Decline path
**Endpoint:** `POST /api/gate/decline`
- No DB writes other than `events` (`action='gate_decision'`, `payload={fork:'decline'}`).
- UI nudges to the $99 assessment landing page.
- Anon session continues (they can change their mind later — the work isn't deleted until session expiry).

### 4.4 Gate UI guarantees
- The fork must be **visible at the same moment** — never sequential ("buy or else"). Three doors, equal visual weight, honest copy.
- After fork, the learner sees a confirmation of *what just happened* and *what's next*. Never a dead end.

---

## 5 · Lead-bind (lead → authenticated learner)

The single most important transition. A learner has an email lead; they later sign up for an account using the same email. Their free artifacts and assessment result must follow them.

**Trigger:** `auth.users` insert (Supabase Auth event).

**Server flow (service_role):**
```
1. Lowercase the new user's email.
2. SELECT id FROM leads WHERE email = lower(:new_email) AND bound_user_id IS NULL;
3. If found:
   a. UPDATE leads SET bound_user_id = :new_user_id WHERE id = :lead_id;
   b. UPDATE toolbox_items SET user_id = :new_user_id, lead_id = NULL WHERE lead_id = :lead_id;
   c. UPDATE assessment_results SET user_id = :new_user_id WHERE lead_id = :lead_id;
   d. UPDATE events SET user_id = :new_user_id WHERE lead_id = :lead_id;
   e. Carry the lead's track onto learner_profiles if profile.track IS NULL.
   f. Emit event action='lead_bound', payload={lead_id, user_id}.
4. If not found: nothing to do.
```

**Concurrency:** wrap 3a–e in a single transaction. The `bound_user_id IS NULL` predicate prevents double-binding if two near-simultaneous sign-ups occur for the same email (vanishingly rare given Auth's own uniqueness check, but cheap).

**Idempotency:** if the trigger somehow runs twice for the same user, step 2 returns no rows (already bound) — no-op.

**No retroactive merging.** If a learner signs up with a different email than their lead, the lead remains separate. We surface a UI affordance in `/account` that lets the learner *manually* claim a lead they own ("I had a different email earlier — claim that account") with email verification on the lead's address. v1 may defer this affordance; the database is ready.

---

## 6 · Purchase → entitlement (the Stripe flow)

PRD §6.5. Three SKUs:

| SKU | Stripe price env | Product code | Unlocks |
|---|---|---|---|
| Individual Foundation | `STRIPE_FOUNDATION_PRICE_ID` (legacy fallbacks: `*_FOUNDATIONS_*`, `*_AIBIP_*`) | `foundation_individual` | M4–M5 + unlimited Toolbox + Prompt Library |
| Team seat × N (min 10) | `STRIPE_FOUNDATION_INSTITUTION_PRICE_ID` (per-seat) | `foundation_team_seat` | M4–M5 + unlimited Toolbox per assigned learner; admin dashboard |
| In-Depth Assessment | `STRIPE_INDEPTH_PRICE_ID` | `assessment_in_depth` | The 48-Q assessment, the four deliverables |

### 6.1 Checkout creation
**Endpoint:** `POST /api/create-checkout`
- **Individual:** body `{product:'foundation_individual', email?}`. Pre-fills checkout email if known. Returns Stripe Checkout Session URL.
- **Team:** body `{product:'foundation_team_seat', seats:N, email}` with `N >= 10`. Stripe Checkout creates a *quantity-priced* line item. Server pre-validates `N >= 10` server-side — never trust the client.
- **Assessment:** body `{product:'assessment_in_depth', email?}`.

For all three: write a pending row in a `pending_checkouts` table keyed by `stripe_session_id` so the webhook can correlate even if the user never returns to the success URL.

### 6.2 Webhook handler — the source of truth for entitlements
**Endpoint:** `POST /api/webhooks/stripe`

**MUST verify signature:**
```typescript
const sig = req.headers.get('stripe-signature')!;
const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
// throws on invalid — let it throw
```

Handle:
- `checkout.session.completed` (one-time payments)
- `customer.subscription.created` + `customer.subscription.updated` (team seats if modeled as subscription)
- `customer.subscription.deleted` → set entitlements `status='revoked'`
- `charge.refunded` → set entitlement status accordingly

**Idempotency:** Stripe retries. Persist the `event.id` in a `stripe_events` table on first receipt; reject duplicates.

**On `checkout.session.completed`:**
1. Resolve customer email from the session.
2. Find or create `auth.users` row? **No.** Create a `leads` row keyed by email if no user exists; the user signs up themselves; lead-bind (§5) fires.
3. If user exists: write `entitlements(user_id, product, stripe_session_id, status='active')`.
4. If user does not yet exist: write a **deferred entitlement** keyed by email in `pending_entitlements(email, product, stripe_session_id, created_at)`. On user sign-up, the lead-bind also drains `pending_entitlements`.
5. **Team purchase:** also create `teams` row (admin = the buyer) + `seats(N)` rows with `status='invited'`. Resend sends N invitations to the admin to forward.
6. Send Resend receipt; sync Stripe customer → MailerLite "Customer" group.
7. Emit `events` `action='purchase_completed'`.

```sql
CREATE TABLE pending_entitlements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           citext NOT NULL,
  product         text NOT NULL,
  stripe_session_id text NOT NULL UNIQUE,
  payload         jsonb,                     -- seat counts, etc.
  created_at      timestamptz NOT NULL DEFAULT now(),
  consumed_at     timestamptz
);
CREATE TABLE stripe_events (
  id           text PRIMARY KEY,             -- Stripe event.id
  received_at  timestamptz NOT NULL DEFAULT now()
);
```

Both tables RLS-enabled with no client policies (server-only).

### 6.3 Entitlement read path
The web app checks `(select count(*) from entitlements where user_id = auth.uid() and status='active' and product IN (...))` at every paid surface. RLS already restricts to own rows. Cache the boolean in the client session token claims if perf demands it; otherwise just query — it's a single indexed scan.

### 6.4 Refunds / revocation
- Customer-initiated refund within Stripe's window → `charge.refunded` webhook → set `entitlements.status='revoked'`.
- Manual revocation (fraud, chargeback) → admin endpoint `POST /api/admin/entitlements/:id/revoke` (service_role).
- Revoked entitlements **stay in the table** (audit trail). Status check excludes non-active.

---

## 7 · Team admin flow

PRD §6.7. Team admin is just an authenticated learner who *also* owns one or more `teams` rows.

### 7.1 Becoming an admin
- Buy ≥10 seats → webhook creates `teams(admin_user_id=buyer)` + `seats` rows.
- Admin sees `/dashboard/team` once any `teams` row exists where `admin_user_id = (select auth.uid())`.

### 7.2 Seat invitation
**Endpoint:** `POST /api/team/seats/invite`
- Body: `{team_id, emails: [...]}`
- Validates `team_id` belongs to caller; validates `count(seats.invited|assigned) + len(emails) <= teams.seats_purchased`.
- Upserts `seats(team_id, invited_email=lower(email), status='invited')`.
- For each: Resend invitation email containing a sign-up link with `?invite=<seat_id>` (signed token, 7-day expiry).
- Emit `events` `action='seat_invited'`.

### 7.3 Seat acceptance
- Invitee clicks sign-up link with `?invite=<seat_id>`.
- Server validates the signed token, captures the `seat_id` in a short-lived cookie.
- Learner self-registers (Supabase Auth). The `create_learner_profile` trigger fires. A **post-trigger flow** reads the cookie, validates `seats.invited_email == new user's email`, sets `seats.learner_user_id = new_user_id, status='assigned', accepted_at=now()`, and writes `entitlements(product='foundation_team_seat', seat_id=...)`.
- If email mismatch (invitee used a different email): block the bind, surface a clear UI message; admin must re-invite the correct email.

### 7.4 Seat revoke / reassign
- Admin can revoke an assigned seat → `seats.status='revoked'`, the seat's entitlement also moves to `status='revoked'`.
- Reassigning is just an invite + accept on a new email. The old `seats` row stays revoked (audit). Total active seats never exceeds `seats_purchased`.

### 7.5 Admin dashboard reads
- Reads the `team_progress_v` view (Database spec §7). Aggregates only. **No artifact bodies, no sandbox transcripts, ever** (PRD FR-D4).
- If admin needs a richer view in v2, write new aggregate views — never expose row content.

---

## 8 · Page-level access control (the gating logic)

| Surface | Anon | Lead | Learner (free) | Learner (paid) | Team admin |
|---|---|---|---|---|---|
| Marketing pages, `/assessment` (public), `/courses/foundation/program` listing | ✓ | ✓ | ✓ | ✓ | ✓ |
| M0–M3 lesson player | ✓ | ✓ | ✓ | ✓ | ✓ |
| Save artifact (free-tier light) | ✗ | ✓ (cap 4) | ✓ (cap 4) | ✓ | ✓ |
| `/checkout/individual`, `/checkout/team`, `/checkout/assessment` | ✓ | ✓ | ✓ | ✓ | ✓ |
| M4–M5 lesson player | ✗ | ✗ | ✗ | ✓ | ✓ (if entitled) |
| Toolbox unlimited save + Prompt Library | ✗ | ✗ | ✗ | ✓ | ✓ |
| `/dashboard` (own progress) | ✗ | ✗ | ✓ | ✓ | ✓ |
| `/dashboard/team` | ✗ | ✗ | ✗ | ✗ | ✓ |

Enforcement layers (defense-in-depth):
1. **Server-rendered page** checks state before render; redirects on mismatch.
2. **API routes** double-check (a learner could craft a request bypassing the page).
3. **RLS** (Database spec) is the floor — even if both above were bypassed, the row wouldn't return.
4. **Sandbox/entitlement gates** at the Sandbox Service for paid exercises.

If a row reaches the client that shouldn't have, **the bug is in layer 1 or 2**, but layer 3 should have already stopped the leak. Treat any cross-tenant leak as a sev-1.

---

## 9 · Session, token, and CSRF posture

- **Sessions:** Supabase Auth's JWT + refresh token in httpOnly cookies (the SDK's default).
- **CSRF:** SameSite=Lax on the session cookie; explicit anti-CSRF token on state-changing POSTs (checkout, gate capture, team invite). Reject mismatches.
- **`anon_session_id` cookie:** httpOnly, SameSite=Lax, Secure. Rotated on identity bind.
- **Service-role key:** server-side only. Never present in any client bundle. Verified via `git secrets` + `gitleaks` before commits.
- **JWT verification:** every server endpoint that reads/writes learner data verifies the JWT and uses the *user's* RLS-bound client, not service_role. Service-role is reserved for system flows (webhook, lead-bind, seat-bind) — explicit, audited, never inherited.

---

## 10 · Marketing consent + unsubscribe (compliance)

PRD NFR-PRIV1. Three rules:

1. **Marketing consent is explicit and separate** from any other action. Sign-up does not imply marketing consent. A separate, unchecked-by-default checkbox at gate email capture and at sign-up.
2. **MailerLite sync respects `marketing_opt_in`.** Subscribe only when true. Unsubscribe via MailerLite link must flip `leads.marketing_opt_in = false` via webhook back to us (so our internal state matches).
3. **Transactional email is always allowed** (receipts, invitations, password reset). Distinct from marketing.

---

## 11 · Failure modes & recovery

| Failure | What we do |
|---|---|
| Stripe webhook lost | Reconcile job daily: list `checkout.session.completed` from Stripe, diff against `stripe_events`, replay missing ones (idempotent). |
| Email send fails (Resend or MailerLite) | Queue + retry (3 attempts, exponential backoff). Log to events as `email_send_failed` with reason. Surface a banner in the admin dashboard if rate exceeds 1%. |
| Lead-bind race (user signs up while a webhook is mid-flight) | Idempotent rewrites + `bound_user_id IS NULL` predicate (§5). At worst the second writer no-ops. |
| Anon cookie deleted mid-session | New `anon_session_id` issued; prior progress is gone. Acceptable — they had no expectation of persistence; that's the whole point of the gate. |
| OAuth email mismatch | Cannot match a lead by OAuth email if the lead was captured with a different email. Surface manual claim UI (§5 deferred). |
| Stripe refund after entitlement use | Mark revoked; do **not** retroactively delete artifacts/toolbox content the learner produced. They keep what they built. |

---

## 12 · Acceptance gates

- [ ] Anon visitor can complete M0–M3 and reach the gate without any sign-in prompt.
- [ ] Email-to-keep migrates all in-session artifacts/results to the new `lead_id` in one transaction.
- [ ] Lead → user binding fires within 5s of `auth.users` insert; all child rows rebind cleanly.
- [ ] Stripe webhook signature verification rejects unsigned + tampered payloads.
- [ ] Duplicate Stripe events (same `event.id`) are idempotent.
- [ ] A team purchase for `seats=10` writes one `teams` row + ten `seats` rows; admin sees them in dashboard.
- [ ] Seat invite → sign-up with matching email → seat auto-assigns + entitlement granted.
- [ ] Seat invite → sign-up with mismatched email → block + clear error; no entitlement granted.
- [ ] A paid learner whose entitlement is revoked loses M4–M5 access on next page load (no stale cache).
- [ ] Marketing-consent unsubscribe via MailerLite flips `leads.marketing_opt_in` and stops future sends.
- [ ] Team admin cannot read any seat-holder's artifact body or sandbox transcript — only aggregates.
- [ ] Two test learners sharing the same IP cannot read each other's data (RLS holds).
- [ ] `service_role` key does not appear in any client bundle (`grep` post-build).

---

## 13 · Open decisions

1. **Magic-link sign-in** as an alternative to password — convenient for banking buyers; defer to v1.5 unless friction data demands it sooner.
2. **OAuth providers v1** — Google (likely yes), Microsoft (likely yes), Okta (defer).
3. **Manual lead-claim UI** — the "I had a different email earlier" flow. v1 punt unless friction emerges; schema is ready.
4. **Pending-entitlement TTL** — how long does an unredeemed `pending_entitlements` row live before we auto-refund or alert? Suggest 14 days + alert.
5. **Team seat-pool re-sale** — if an admin revokes a seat, can they re-invite without buying more? Spec says yes (revoke + invite = net zero seats), but confirm.
6. **Account deletion** — PRD NFR-PRIV2 requires export/delete. v1 implements export (read-only download); delete is admin-flagged + 30-day soft-delete then hard.

---

## 14 · Cross-references

- Foundation PRD §6.4 (gate), §6.5 (payments), §6.7 (team), §6.8 (auth), §7.1 (security), §7.2 (privacy).
- Database Schema & RLS Spec §5.2 (leads), §5.3 (entitlements), §5.4 (teams/seats), §9 (identity-ladder transitions — this doc owns the *flow*; schema owns the *data shape*).
- Sandbox Service Tech Spec §10 (entitlement check for paid Exercises).
- CLAUDE.md — Stripe Webhook Signature Verification block, rate-limiting pattern.
- Handoff Docs Checklist — closes the "Auth & entitlements spec" P1.
