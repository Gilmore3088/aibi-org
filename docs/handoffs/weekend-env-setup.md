# Weekend Environment Setup Backlog

**Created:** 2026-05-05 · **Target:** weekend of 2026-05-09
**Goal:** Get production-deployed code (Specs 1–4 merged on main) actually functional by populating Vercel env vars and authoring ConvertKit dashboard content.

---

## Status snapshot

`vercel env ls` against `aibi-org` returned only 4 vars:

```
COMING_SOON                        Development, Preview, Production
SUPABASE_SERVICE_ROLE_KEY          Production only
NEXT_PUBLIC_SUPABASE_ANON_KEY      Production only
NEXT_PUBLIC_SUPABASE_URL           Production only
```

Everything else the codebase reads is missing in Vercel. The site is up, but every adapter is silently skipping. The full var inventory lives in `.env.local.example` — use it as the master reference.

---

## Phase 0 — Five-minute quick wins (do first)

These take seconds and unblock multiple downstream items.

- [ ] **`CRON_SECRET`** in Vercel Production + Preview.
  - Generate fresh: `openssl rand -hex 32`
  - One value generated this session if you want to use it: `f8ae202a6e04ce5f6dbec8ee12af502d0a7c9963a167dc12b1bfaeb25fe105cf` (or generate new — your call)
  - Vercel dashboard → aibi-org → Settings → Environment Variables → Add → name=`CRON_SECRET`, value=hex string, environments=Production + Preview (NOT Development unless you want local cleanup-cron testing without `SKIP_CRON_AUTH`)
  - **Verifies:** nightly 04:00 UTC `/api/assessment/pdf/cron-cleanup` stops 401-ing

- [ ] **`NEXT_PUBLIC_PLAUSIBLE_DOMAIN`** in Vercel Production + Preview.
  - Value: `aibankinginstitute.com`
  - **Verifies:** Plausible custom events (`assessment_complete`, `pdf_download_clicked`, `pdf_downloaded`, `convertkit_tag_added`) flow into your Plausible dashboard

- [ ] **Replicate Supabase keys to Preview + Development.**
  - Right now only Production has them. Vercel preview deploys (PR previews) silently fall back to "Supabase not configured" everywhere.
  - In Vercel dashboard, edit each of `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` → check the Preview + Development boxes (same values as Production for v1).
  - **Verifies:** PR previews actually render `/results/[id]`, capture-email persists, etc.
  - **If you want a separate staging DB later** (recommended for safety), provision a new Supabase project, copy its keys to Preview only, leave Production pointing at the live DB. Out of scope for this weekend.

---

## Phase 1 — ConvertKit (the biggest gap, ~30 min)

This is what unblocks the email-sequence flow you just shipped (PR #42).

### 1A. Find your CK API credentials

- [ ] Log into ConvertKit (kit.com).
- [ ] Settings → Advanced → Show API credentials. Two separate strings:
  - `API Key` (public-ish, used for subscribe endpoints)
  - `API Secret` (private, used for unsubscribe and read endpoints)
- [ ] Copy both. Paste them into:
  - Vercel Production + Preview as `CONVERTKIT_API_KEY` and `CONVERTKIT_API_SECRET`
  - Local `.env.local` (so you can test against real CK in dev — or alternatively set `SKIP_CONVERTKIT=true` locally to skip)

### 1B. Create the four tier Tags

In CK dashboard → Subscribers → Tags → Create new (×4). Exact names matter only for your operator clarity — the codebase identifies them by env var, not name. Suggested:

- [ ] `aibi-assessment-startingpoint`
- [ ] `aibi-assessment-earlystage`
- [ ] `aibi-assessment-buildingmomentum`
- [ ] `aibi-assessment-readytoscale`

After each tag is saved, **the URL bar shows the numeric tag ID**, e.g. `app.kit.com/tags/12345`. Copy each id.

- [ ] In Vercel Production + Preview, set:
  - `CONVERTKIT_TAG_ID_STARTING_POINT` = numeric id of starting-point tag
  - `CONVERTKIT_TAG_ID_EARLY_STAGE` = …
  - `CONVERTKIT_TAG_ID_BUILDING_MOMENTUM` = …
  - `CONVERTKIT_TAG_ID_READY_TO_SCALE` = …

### 1C. Create the four Sequences (with empty bodies for now)

In CK dashboard → Sequences → Create new (×4). For each:

- [ ] Name it (e.g. "AiBI Assessment Follow-Up — Starting Point").
- [ ] Add 3 placeholder emails (Day 0, Day 3, Day 7). Body content can be empty — the trigger fires regardless.
- [ ] Set the trigger: "When subscriber is added to tag X" → pick the matching tier tag.
- [ ] Activate the Sequence.

After this step is done, the next opt-in capture in production tags the subscriber, the matching Sequence triggers, and the user receives the (currently empty) email — so before activating, **finish 1D** below to avoid sending blank emails.

### 1D. Author email content

This is the longest-running piece. Use the spec's job map as the brief:

| # | Day | Job |
|---|---|---|
| 1 | 0 (1–2h delay) | "Your brief is ready" — link to `https://aibankinginstitute.com/results/{subscriber.profileId}` (Spec 4 makes that real) |
| 2 | 3 | "What good looks like for your tier" — pull `FUTURE_VISION` content from the PDF |
| 3 | 7 | Tier-keyed conversion ask — Starting Point + Early Stage push AiBI-P enrollment; Building Momentum + Ready to Scale push Executive Briefing |

Subject lines from the spec (institutional tone, no emoji, no exclamation):

| # | Tier | Subject |
|---|---|---|
| 1 | All | "Your AI Readiness brief, [{firstName}]" |
| 2 | starting-point | "What good looks like for community banks just starting" |
| 2 | early-stage | "From scattered to systematic — what's next" |
| 2 | building-momentum | "From program to advantage — measuring outcomes" |
| 2 | ready-to-scale | "The compounding advantage — what comes after readiness" |
| 3 | starting-point / early-stage | "AiBI-P starts when you're ready" |
| 3 | building-momentum | "Walk through your results with us" |
| 3 | ready-to-scale | "Leadership Advisory — what fractional CAIO looks like" |

Reference: spec at `docs/superpowers/specs/2026-05-04-assessment-results-spec-3-email.md`

### 1E. Verify end-to-end

- [ ] Complete the live assessment with a test email + opt-in.
- [ ] In CK dashboard, find the subscriber → confirm correct tier tag attached → confirm Sequence triggered.
- [ ] Check inbox (Gmail + Outlook test addresses) for Email #1.
- [ ] In Plausible, confirm `convertkit_tag_added` event appears with the right tier prop.

### 1F. After everything works

- [ ] Remove `SKIP_CONVERTKIT=true` from any production env if it was accidentally set (the build guard in `next.config.mjs` will refuse to build if it leaks into Production, but worth a manual check).
- [ ] On Vercel Preview/staging, **set** `SKIP_CONVERTKIT=true` to suppress real CK calls during preview deploys — otherwise every PR preview tags real users.

---

## Phase 2 — Other adapters (~20 min total)

These are the non-Spec-3 surfaces that are also degraded right now.

### 2A. Resend (transactional email — breakdown email after capture)

- [ ] Log into Resend, copy API key.
- [ ] Vercel Production + Preview: set `RESEND_API_KEY`.
- [ ] Optional: set `RESEND_FROM` (default sender address) and `RESEND_FROM_NAME` (default sender name) if you want to override Resend dashboard defaults.
- [ ] Verify a custom domain is configured + verified in Resend (per CLAUDE.md note: `onboarding@resend.dev` is interim — needs `aibankinginstitute.com` verified before production).

### 2B. HubSpot (CRM)

- [ ] In HubSpot dashboard → Settings → Integrations → Private Apps → create or open existing app → copy access token.
- [ ] Vercel Production: set `HUBSPOT_API_KEY`.
- [ ] Auto-create the 5 custom contact properties:
  ```bash
  HUBSPOT_API_KEY=pat-... npm run hubspot:create-properties:dry  # preview
  HUBSPOT_API_KEY=pat-... npm run hubspot:create-properties      # apply
  ```
  Script lives at `scripts/hubspot-create-properties.mjs`. Idempotent —
  re-running skips properties that already exist. Creates: `assessment_score`
  (Number), `score_tier`, `institution_name` (text), `asset_size` and
  `lead_source` (dropdowns). Verify in HubSpot UI under Settings → Properties
  → Contact properties → "AiBI Assessment" group.

### 2C. Calendly

- [ ] Get your Executive Briefing Calendly link (e.g. `https://calendly.com/[handle]/executive-briefing`).
- [ ] Vercel Production + Preview + Development: set `NEXT_PUBLIC_CALENDLY_URL`.
- [ ] Verify CTAs route correctly on the live `/for-institutions` page after the next deploy.

### 2D. AI providers (ANTHROPIC, OPENAI, GEMINI)

These exist locally (per shell env / wherever you've been using them). They are not in Vercel.

- [ ] Locate your Anthropic key (`echo $ANTHROPIC_API_KEY` in your terminal — it's loaded from `~/.zshrc`).
- [ ] Locate OpenAI + Gemini keys (your shell env doesn't have these per the audit; check 1Password or the respective dashboards).
- [ ] Vercel Production + Preview: set `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`.
- [ ] Audit the app to identify which features actually need each — if Gemini and OpenAI aren't used in production paths, scope down to just Anthropic.

### 2E. Toolbox rate limit salt

- [ ] Generate: `openssl rand -hex 32`
- [ ] Vercel Production: set `TOOLBOX_IP_HASH_SALT`.
- [ ] **Verifies:** per-IP rate limits are stable across pod restarts. Without this, the salt regenerates on each cold boot and rate-limit counters reset.

---

## Phase 3 — Phase 2 (Stripe) deferred

Don't worry about these this weekend unless you're shipping the AiBI-P Stripe flow:

- [ ] `STRIPE_SECRET_KEY=sk_live_...`
- [ ] `STRIPE_WEBHOOK_SECRET=whsec_...`
- [ ] `NEXT_PUBLIC_STRIPE_KEY=pk_live_...`
- [ ] `STRIPE_FOUNDATIONS_PRICE_ID=`
- [ ] `STRIPE_PRACTITIONER_PRICE_ID=`

Plus the in-house Stripe webhook handler (`/api/webhooks/stripe`) that verifies the signature and inserts a `course_enrollments` row. Per 2026-05-05 decision, no Kajabi, no Zapier. Until the webhook handler is built and tested, manually insert `course_enrollments` rows for any pre-launch sales.

---

## Verification checklist (run after each phase)

- [ ] **Phase 0 done?** Trigger a manual cleanup-cron call: `curl -H "Authorization: Bearer $CRON_SECRET" https://aibankinginstitute.com/api/assessment/pdf/cron-cleanup` — expect `200 {"status":"ok","deleted":N}`.
- [ ] **Phase 1 done?** Complete the live assessment with `marketing_opt_in=true`, watch Vercel logs for `[capture-email]` warnings (none = good), watch Plausible dashboard for `convertkit_tag_added` event, check CK subscriber list.
- [ ] **Phase 2 done?** Look at Vercel function logs for any remaining `[*] skip` warnings — each adapter that's now configured should be quiet.

---

## Reference

- Full env-var inventory: `.env.local.example` in repo root
- Env-var rationale per surface: PR descriptions for #41 (Spec 2), #42 (Spec 3), #43 (Spec 4)
- Plausible event names: `assessment_start`, `assessment_complete`, `email_captured`, `pdf_download_clicked`, `pdf_downloaded`, `convertkit_tag_added`, `briefing_booked`, `purchase_initiated` (per CLAUDE.md analytics section)
