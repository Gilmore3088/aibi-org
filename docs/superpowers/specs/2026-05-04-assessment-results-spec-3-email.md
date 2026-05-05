# Assessment Results — Spec 3: Email Follow-Up Sequence (Conversion)

**Date:** 2026-05-04
**Status:** Draft (awaiting user review)
**Owner:** James Gilmore
**Parent:** `docs/superpowers/specs/2026-05-04-assessment-results-four-surfaces.md`
**Position:** Surface 3 of 4. Ships after Spec 2 (PDF) merges.

---

## Job

A timed sequence of 3 emails delivered after email capture. Optimized for **conversion**: tier-specific CTAs, urgency-appropriate cadence, pulling cut on-screen content (Section 8 Future Vision, Section 10 close) into long-tail nurture, and reinforcing the path to AiBI-P enrollment or Executive Briefing booking.

Audience: the assessment-taker, currently shopping or curious.

## Locked Decisions (from Brainstorm)

| Decision | Choice | Rationale / Tradeoff |
|---|---|---|
| Trigger | On email capture, immediately tagged in ConvertKit | Aligns with `CLAUDE.md` decision (2026-04-17): ConvertKit handles marketing email; Resend handles transactional. ConvertKit's UI manages cadence and content, minimizing app-side complexity. |
| Cadence | 3 emails over 7 days | Tight, focused, low unsubscribe risk. Matches a B2B drip without becoming nurture-fatigue. 12 emails total to author (3 × 4 tiers). |
| Email #1 timing | 1–2 hours after capture (not immediate) | Lets the user finish reading the on-screen brief first. Avoids the "we already emailed you the same thing you're staring at" dissonance. |
| Sequence framework | One ConvertKit Sequence per tier (4 sequences total) | Each sequence has its own subscribers (one tag = one sequence). Cleaner than a single mega-sequence with conditional logic. |

## Detail-Level Defaults (overridable in ConvertKit dashboard at any time)

### Email job map per tier

| # | Day | Job | Content source |
|---|---|---|---|
| 1 | 0 (1–2h) | "Your brief is ready" — link back to results page, brand reinforcement, mention the PDF awaits in their account | Cover line + "click to revisit" link to `/assessment/results/{token}` (Spec 4 makes this a permanent URL; Spec 3 ships with sessionStorage round-trip if Spec 4 hasn't merged) |
| 2 | 3 | "What good looks like for your tier" | `FUTURE_VISION` content (cut from on-screen in Spec 1) framed as "Here's the institution you can build" |
| 3 | 7 | Tier-keyed conversion ask | Mirrors the on-screen `TIER_CLOSING_CTA` per tier — Starting Point + Early Stage push AiBI-P; Building Momentum + Ready to Scale push Executive Briefing / Leadership Advisory |

### Per-tier Sequence structure (ConvertKit dashboard reference)

| Tier ID | ConvertKit tag | ConvertKit Sequence name |
|---|---|---|
| `starting-point` | `aibi-assessment-startingpoint` | "AiBI Assessment Follow-Up — Starting Point" |
| `early-stage` | `aibi-assessment-earlystage` | "AiBI Assessment Follow-Up — Early Stage" |
| `building-momentum` | `aibi-assessment-buildingmomentum` | "AiBI Assessment Follow-Up — Building Momentum" |
| `ready-to-scale` | `aibi-assessment-readytoscale` | "AiBI Assessment Follow-Up — Ready to Scale" |

### Suppression and retake handling

- **Unsubscribe**: ConvertKit's standard unsubscribe link removes the user from ALL Institute lists (newsletter + assessment sequences). Honor `marketing_opt_in` from email capture — users who unchecked it never get tagged.
- **Retake**: If the user retakes the assessment and produces a different tier, the server adds the new tier tag and removes the old one in the same ConvertKit API call. ConvertKit auto-resubscribes them into the new sequence. Their position in the old sequence is lost — this is acceptable.
- **Suppression rules**: A user who has booked an Executive Briefing (HubSpot deal opened) is removed from the conversion-pushing emails. Detection via HubSpot webhook → ConvertKit tag-removal. (This is a v1.1 enhancement; v1.0 ships without HubSpot/CK coupling.)

### Subject lines (defaults — author may override in ConvertKit)

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

Subject lines are **lowercase-leading institutional tone**, no exclamation marks, no clickbait, no emoji. Per `CLAUDE.md` brand voice.

## Architecture

**New files:**

- `src/lib/convertkit/sequences.ts` — single export `tagAssessmentTier({ email, tierId, marketingOptIn })`. Maps `tierId → CK tag`, calls `POST /v3/tags/:tag_id/subscribe`. Honors `marketingOptIn = false` by skipping the call entirely (and also skips when `SKIP_CONVERTKIT=true`, per existing CLAUDE.md staging suppression).
- `supabase/migrations/00027_assessment_tier_tagged_at.sql` — adds `convertkit_tagged_at` timestamp column on `assessment_responses` for idempotency and ops debugging. Nullable; back-filled to NULL on existing rows.

**Modified files:**

- `src/app/api/capture-email/route.ts` (existing) — after writing the `assessment_responses` row and the existing newsletter ConvertKit form post, calls `tagAssessmentTier(...)` if `marketing_opt_in === true`. Stores the timestamp in `convertkit_tagged_at`.

**External setup (one-time, in ConvertKit dashboard, not in code):**

- 4 new Tags created (one per tier ID listed above)
- 4 new Sequences authored, each with 3 emails matching the job map and subject lines
- Each Sequence's "Trigger" set to "When subscriber is added to tag X"
- HTML email templates use Cormorant + DM Sans pulled from web fonts (graceful fallback to system serif/sans for clients that block web fonts)

**Environment variables (already in `.env.local` per CLAUDE.md):**

- `CONVERTKIT_API_KEY`
- `CONVERTKIT_ASSESSMENT_FORM_ID` (already used by capture-email)
- New: `CONVERTKIT_TAG_ID_STARTING_POINT`, `_EARLY_STAGE`, `_BUILDING_MOMENTUM`, `_READY_TO_SCALE` — populated after the dashboard tag creation step.

## What This Spec Does NOT Do

- **No ConvertKit content authoring in code.** Email bodies, subject-line A/B variants, and cadence adjustments live in the ConvertKit dashboard. The repo holds only the tagging integration.
- **No PDF attachment.** Email #1 *links* to the results page where the warmed PDF is downloadable post-auth (per Spec 2). Attaching the PDF directly hurts deliverability and bypasses the Spec 2 auth gate.
- **No HubSpot suppression coupling for v1.0.** "User booked a briefing → suppress conversion email" is a v1.1 follow-up. Tracked as Open Question.
- **No deeper personalization beyond tier in v1.0.** No per-dimension drill-down emails, no peer-benchmark referencing. Both belong post-Phase 1.5.
- **No transactional email replacement.** Resend-backed Supabase Auth magic-link emails (Spec 2) keep their existing path. ConvertKit only owns the marketing sequence.

## Acceptance Criteria

1. **Tagging fires correctly**: A successful email-capture POST with `marketing_opt_in=true` and tier `building-momentum` results in a ConvertKit subscriber with the `aibi-assessment-buildingmomentum` tag. Verified via `GET /v3/subscribers/:id/tags`.
2. **Opt-out honored**: A capture POST with `marketing_opt_in=false` results in NO ConvertKit tag-add API call. Logged for observability.
3. **Staging suppression**: With `SKIP_CONVERTKIT=true`, no real CK API calls fire. Logs note "tier tagging skipped (staging)."
4. **Idempotency**: A repeat capture for the same email + same tier results in NO duplicate tag-add (ConvertKit's API is idempotent on this; we still verify behavior is correct).
5. **Retake re-routes correctly**: A user who first scored Starting Point and then retakes to Building Momentum is removed from the Starting Point sequence and added to Building Momentum.
6. **Schema migration applied cleanly**: 00027 migration adds `convertkit_tagged_at` to `assessment_responses` with `NULL` default. Existing rows untouched.
7. **Sequence content authored end-to-end**: All 12 emails (3 × 4 tiers) exist in ConvertKit with subjects matching the table, body content matching the job map, branded with Cormorant + DM Sans where rendering supports it.
8. **Email #1 lands in inbox (not spam) for Gmail and Outlook test addresses**: Verified manually pre-launch on both providers.
9. **Unsubscribe link works**: Standard ConvertKit unsubscribe in Email #1 footer removes the user from all 4 tier sequences AND from the newsletter list.
10. **Plausible custom event tracking**: New event `convertkit_tag_added` fires on successful tagging with props `{ tier, opt_in: true }`. Used to monitor signup-to-tag conversion ratio.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| ConvertKit's tag API rate-limited at peak (e.g., conference announcement) | Capture endpoint already has rate-limiting; CK calls are downstream and inherit the limit. CK errors logged and retried via a simple in-process backoff. |
| User unsubscribes after Email #1, never sees PDF/Briefing pitch | Acceptable. Forced sequencing alienates the audience. Track unsubscribe rate as a quality signal — if >20%, redesign cadence. |
| Email content drifts from on-screen brief tone (someone edits CK without code review) | Document the email job map and tone guide in this spec. Periodic content-review at sprint reviews. |
| `SKIP_CONVERTKIT=true` accidentally pushed to production | CLAUDE.md already calls this out. Add a build-time assertion: production builds fail if `SKIP_CONVERTKIT === 'true'` is set in `process.env`. |
| ConvertKit form ID drift between staging and production | Already separated via `CONVERTKIT_ASSESSMENT_FORM_ID` env var. Tag IDs added per-environment too. |
| Tier tag added but user never gets the sequence (e.g., automation paused) | ConvertKit dashboard health-check during weekly ops review. Plausible event ratio (`tag_added` vs `sequence_email_opened` from CK reporting) flags drift. |

## Open Questions (for plan-time, not blockers)

- **HubSpot ↔ ConvertKit suppression coupling**: When a user books an Executive Briefing (HubSpot deal opened), should they auto-exit the email sequence? v1.1 enhancement. Need HubSpot webhook → CK tag-removal Zap or Make.com flow.
- **Re-engagement sequence**: A user who opens Email #1 but doesn't click anything for 14 days — separate re-engagement track, or accept the silence? Probably accept for v1.0.
- **A/B testing subject lines**: ConvertKit supports it natively. Worth running for the Email #3 conversion ask. Track post-launch.
- **Newsletter cross-pollination**: Should completing the assessment auto-subscribe to the AI Banking Brief newsletter? Currently optional via the `newsletter` checkbox. Default behavior depends on `marketing_opt_in` semantics — needs a product call.
