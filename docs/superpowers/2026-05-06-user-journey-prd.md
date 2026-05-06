# User Journey PRD — Page Directory + Consolidation Map

**Audited:** 2026-05-06
**Branch:** feature/stripe-products
**Purpose:** Single source of truth for what every public-facing page is
for, what journey it belongs to, and where we have duplicate / redundant
surfaces that can be consolidated.

---

## 1. The five primary journeys

### Journey A — Cold visitor → free assessment

```
/  (homepage)
   └─► /assessment/start  (landing: "what to expect")
         └─► /assessment   (12Q quiz, sessionStorage-backed)
               ├─ Score + tier shown immediately (no gate)
               └─ EmailGate captures email + firstName + institutionName
                     └─► /results/[id]  (auth-required permanent home)
```

**Conversion intent:** email capture → ConvertKit + HubSpot → Calendly /
AiBI-P / In-Depth CTAs.
**Friction today:** lands on `/assessment/start` then transitions to
`/assessment`. Two URLs for one experience.

---

### Journey B — In-Depth individual buyer ($99)

```
/assessment/in-depth   (marketing + two purchase cards)
   └─► Stripe Checkout
         └─► /assessment/in-depth/take?session=…   (server resolves token)
               └─ FORCED REDIRECT (Phase 2): /auth/login?next=…&email=…
                     └─ Magic link → email click → back to /take?token=…
                           └─► 48Q quiz (localStorage-backed)
                                 └─► /api/indepth/submit-answers
                                       └─► /results/in-depth/[id]
                                              └─ Tailored starter artifact
                                                 (rendered markdown)
```

**Convert intent:** entitlement `indepth-starter-toolkit` granted →
`/dashboard/toolbox` read-only.
**Friction today:** post-checkout redirect dance (session→token→login→
take). Each hop is necessary but the experience is jarring.

---

### Journey C — In-Depth institution leader ($79/seat × 10+)

```
/assessment/in-depth   (BuyForMyTeamCard)
   └─► Stripe Checkout
         └─► /assessment/in-depth/dashboard?session=…   (auth required)
               └─ Bind leader_user_id on first visit
               └─ Invite roster (textarea → /api/indepth/invite → Resend)
               └─ Aggregate report (locked < 3 responses)
                     └─ Champions, dimension breakdown, distribution
```

The leader gets `indepth-starter-toolkit` entitlement too → toolbox
read-only access.

---

### Journey D — In-Depth institution invitee (staff)

```
[email from leader]
   └─► /assessment/in-depth/take?token=<magic-link>
         └─ token validated, invite_consumed_at marked
         └─ NO sign-in required (token IS the access key)
               └─► 48Q quiz
                     └─► /results/in-depth/[id]
```

Invitees can complete without an account. Their result is anonymized in
the leader's aggregate; their personal result is reachable only via the
magic link (or, post-completion, via /dashboard/assessments if they
later sign in with that email).

---

### Journey E — AiBI-P learner (course buyer, $295 / $199 institution)

```
/education  →  /courses/aibi-p   (overview + buy CTA)
   └─► /courses/aibi-p/purchase  →  Stripe Checkout
         └─► /courses/aibi-p?enrolled=true
               └─ webhook → entitlements + course_enrollments row
               └─ FORCED REDIRECT: /courses/aibi-p/onboarding (3Q survey)
                     └─► /courses/aibi-p/[1..N]   (modules)
                           ├─ /artifacts/[id]
                           ├─ /toolkit          (personal artifact roundup)
                           ├─ /prompt-library
                           ├─ /quick-wins
                           ├─ /post-assessment
                           ├─ /tool-guides
                           ├─ /gallery
                           ├─ /submit           (work product)
                           ├─ /certificate      (after passing)
                           └─ /settings
```

Plus: `/certifications/exam/aibi-p` for the proficiency exam,
`/dashboard/toolbox` for the production toolbox, `/dashboard/progression`
for module progress.

---

## 2. Page directory

### 2.1 Public marketing

| Path | Purpose | Notes |
|---|---|---|
| `/` | Homepage. Hero + ROI calc + 3 pillars + sourced stats. | Primary CTA = free assessment. |
| `/about` | Founder story. | Phase 3. Lightweight. |
| `/security` | Pillar B (security) landing. | Free guide download. |
| `/privacy` | Privacy policy. | |
| `/terms` | Terms of service. | |
| `/ai-use-disclaimer` | AI usage disclosure. | |
| `/coming-soon` | Holding page. | Pre-launch only; not in main nav. |

### 2.2 Education hub

| Path | Purpose | Notes |
|---|---|---|
| `/education` | Unified hub. **Free classes** + **Paid diagnostics** + **Certifications**. | Replaced /courses + /certifications. |
| `/for-institutions` | Institution-facing pitch. **In-Depth** band + samples + custom-engagements stub. | |
| `/for-institutions/advisory` | Pilot · Program · Leadership Advisory. | Prices removed pending case studies. |
| `/for-institutions/samples/efficiency-ratio-workbook` | Free sample artifact. | |

### 2.3 Free Assessment (12Q)

| Path | Purpose | Notes |
|---|---|---|
| `/assessment/start` | "What to expect" landing. | **Candidate for consolidation** with `/assessment`. |
| `/assessment` | The quiz UI itself. | sessionStorage; EmailGate at end. |
| `/results/[id]` | Owner-bound result. | Auth required. Score + tier + 7-day plan + In-Depth CTA. |
| `/assessment/results/print/[id]` | Print-friendly version. | Used by PDF generation. |

### 2.4 In-Depth Assessment (48Q paid)

| Path | Purpose | Notes |
|---|---|---|
| `/assessment/in-depth` | Marketing + BuyForMyself + BuyForMyTeam. | Server-resolves auth → prefills email. |
| `/assessment/in-depth/take` | Token-gated quiz. | Individual buyers redirected to /auth/login first. |
| `/assessment/in-depth/dashboard` | Institution leader dashboard. | Auth + ownership-bound; roster + invites + aggregate. |
| `/results/in-depth/[id]` | Result page. | Score / tier / 8-dim breakdown / starter artifact. |

### 2.5 Auth

| Path | Purpose | Notes |
|---|---|---|
| `/auth/login` | Password + Magic Link. | `?email=` prefill, `?next=` redirect. Magic-link default for in-depth take redirects. |
| `/auth/signup` | Account creation. | |
| `/auth/forgot-password` | Reset flow. | |
| `/auth/reset-password` | Set new password. | |
| `/auth/callback` | OAuth + magic-link landing. | Route handler, not a page. |

### 2.6 Dashboard

| Path | Purpose | Notes |
|---|---|---|
| `/dashboard` | Learner home. Next action / artifacts / readiness / SAFE. | |
| `/dashboard/assessments` | All completed takes (in-depth + free). | New 2026-05-05. |
| `/dashboard/progression` | Module progress detail. | **Possible overlap** with `/dashboard` itself. |
| `/dashboard/toolbox` | Banking AI Toolbox. Full or Starter tier. | Tabs: Guide, Library, Build, Playground, My Toolbox. |
| `/dashboard/toolbox/library` + `/library/[slug]` | Library browse + skill detail. | |
| `/dashboard/toolbox/cookbook` + `/cookbook/[slug]` | Recipes catalog + detail. | |

### 2.7 AiBI-P course

| Path | Purpose | Notes |
|---|---|---|
| `/courses/aibi-p` | Course overview. | Now exempt from onboarding redirect (2026-05-05). |
| `/courses/aibi-p/purchase` | Buy flow. | Redirects to /education for non-enrollees? Verify. |
| `/courses/aibi-p/onboarding` | 3Q survey + WelcomeFirstPrompt. | Forced for new enrollees. |
| `/courses/aibi-p/[module]` | Module page (12 modules). | Sequential. |
| `/courses/aibi-p/artifacts/[artifactId]` | Artifact view. | |
| `/courses/aibi-p/toolkit` | Personal toolkit roundup. | Pulls saved artifacts + skills. |
| `/courses/aibi-p/prompt-library` | Prompt library. | |
| `/courses/aibi-p/quick-wins` | Quick-win logs. | |
| `/courses/aibi-p/post-assessment` | After-course assessment. | **Possibly overlaps** with /certifications/exam. |
| `/courses/aibi-p/tool-guides` | Tool-specific how-tos. | |
| `/courses/aibi-p/gallery` | Cohort gallery. | |
| `/courses/aibi-p/submit` | Work-product submission. | |
| `/courses/aibi-p/certificate` | Credential preview / download. | |
| `/courses/aibi-p/settings` | Onboarding answer edits. | |

### 2.8 AiBI-S, AiBI-L (soft-hidden 2026-05-05)

| Path | Purpose | Notes |
|---|---|---|
| `/courses/aibi-s` + `/aibi-s/ops` + `/aibi-s/ops/unit/[unitId]` | Specialist track. | Redirected to /education in next.config.mjs. |
| `/courses/aibi-l` + `/aibi-l/[session]` + `/aibi-l/request` | Leader track. | Same. |

### 2.9 Certifications + verification

| Path | Purpose | Notes |
|---|---|---|
| `/certifications/exam/aibi-p` | Proficiency exam. | Standalone surface; entry point unclear. |
| `/verify/[certificateId]` | Public credential verification. | LinkedIn-shareable. |

### 2.10 Resources / lead-mag

| Path | Purpose | Notes |
|---|---|---|
| `/resources` | AI Banking Brief archive + newsletter signup. | |
| `/resources/the-widening-ai-gap` | Article. | |
| `/resources/members-will-switch` | Article. | |
| `/resources/six-ways-ai-fails-in-banking` | Article. | |
| `/resources/the-skill-not-the-prompt` | Article. | |
| `/resources/ai-governance-without-the-jargon` | Article. | |
| `/resources/what-your-efficiency-ratio-is-hiding` | Article. | |
| `/prompt-cards` | Lead-magnet card pack. | Email-gated. |
| `/practice/[repId]` | "Today's AI Rep" practice. | |

### 2.11 Admin (internal only)

| Path | Purpose |
|---|---|
| `/admin` | Internal dashboard. |
| `/admin/reviewer/[id]` | Submission review. |

---

## 3. Consolidation candidates

Ranked by impact-per-effort. Pick whichever combination feels right.

### 3.1 — Merge `/assessment/start` into `/assessment` (high impact, low risk)

**Today:** `/assessment/start` shows a "what to expect" page; clicking
"Start" navigates to `/assessment` which is the actual quiz. Two URLs,
one journey.

**Proposal:** Inline the start-page copy as the first screen of
`/assessment` itself (above the question card, hidden once Q1 is
answered). Redirect `/assessment/start` → `/assessment`.

**Wins:** one less hop. Returning visitors with no in-progress state
land directly on the welcome screen; visitors mid-take resume.

### 3.2 — Collapse `/dashboard/progression` into `/dashboard` (medium)

The dashboard already shows next action, course progress, and artifacts.
`/dashboard/progression` appears to render module status detail —
verify whether anything there isn't already on `/dashboard`. If it's
purely a deeper module view, fold it into a `<details>` block on
`/dashboard` or move to `/courses/aibi-p` sidebar.

### 3.3 — `/certifications/exam/aibi-p` ⇄ `/courses/aibi-p/post-assessment`
       (medium)

Probably the same exam wearing two URLs. Pick one canonical, redirect
the other. Likely keep `/certifications/exam/aibi-p` as the public
verifiable surface; redirect post-assessment to it.

### 3.4 — `/for-institutions/advisory` rolled into `/for-institutions` (small)

The advisory tiers (Pilot/Program/Leadership Advisory) are presently a
single section. Make them an anchor (`#advisory`) on the main page
instead of a sub-route. Reduces nav fanout; keeps one URL for the
institution conversation.

### 3.5 — `/assessment/results/print/[id]` is internal — hide from nav (verify)

Already not user-discoverable, but worth confirming nothing links to it
publicly. The PDF generation should be the only consumer.

### 3.6 — Rename for clarity (no consolidation, just naming)

- `/assessment` → `/assessment/take` (parallels `/assessment/in-depth/take`)
- `/courses/aibi-p` (overview) is fine; the **layout** does the heavy
  lifting — confirm the overview screen reads well for both new and
  enrolled users (one page, two states).

---

## 4. Frictions worth fixing without consolidating

| Friction | Current | Proposed |
|---|---|---|
| Buyer enters email twice | Free EmailGate + In-Depth purchase | (Done 2026-05-05) — `/api/auth/me` prefill on EmailGate; server-side prefill on cards |
| In-Depth post-checkout dance | session→token→login→take | (Done 2026-05-05) — but still 4 hops. Consider compressing token-resolution into the same page render. |
| Free assessment auto-loads stale | sessionStorage rehydration | (Done 2026-05-05) — drop completed state on hydration |
| "For Learners" gated by onboarding | Layout redirect | (Done 2026-05-05) — overview now exempt |
| In-Depth artifact wall of text | `whitespace-pre-wrap` | (Done 2026-05-05) — react-markdown |
| Toolbox tier unclear to starter buyers | One paywall | (Done 2026-05-05) — `tier: 'full' \| 'starter'` with banner |

---

## 5. Recommended next step

Pick one of:

- **A.** Implement the start-page consolidation (3.1). Concrete,
  low-risk, removes one URL from the funnel.
- **B.** Audit `/dashboard/progression` vs `/dashboard` overlap (3.2)
  and decide whether to merge.
- **C.** Decide on advisory rollup (3.4) — small, but tightens the
  /for-institutions story.

Or: surface a different journey I haven't named.
