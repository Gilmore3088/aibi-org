# Feature Research

**Domain:** Self-paced professional certification course (LMS) — AiBI-P Banking AI Practitioner
**Researched:** 2026-04-15
**Confidence:** HIGH (stack decisions), MEDIUM (Accredible API specifics — docs partially gated)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or untrustworthy for a $79 professional credential.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Progress persistence and resume | Any multi-session course must survive tab kills, browser refresh, mobile backgrounding | MEDIUM | sessionStorage pattern already exists in assessment; Supabase for cross-device persistence |
| Forward-only module gating | Sequential unlocking prevents skipping; standard for professional certs | LOW | State in Supabase `module_completions` table; Next.js middleware or client-side check |
| Mobile-first layout | Banking staff complete on phones during breaks; horizontal scroll = abandoned course | MEDIUM | Tailwind responsive defaults; 14pt min at 390px; one-card-per-screen on mobile |
| Score/completion visibility before email gate | Gating kills conversions; learner should see tier/pass without surrendering email | LOW | Already implemented in assessment; replicate pattern |
| Email capture on assessment completion | Standard top-of-funnel capture for sequences | LOW | `/api/capture-email` already exists; reuse |
| Certificate upon completion | Without a credential artifact the course has no career value | MEDIUM | Accredible REST API — create credential via POST, returns shareable URL + LinkedIn badge link |
| Payment before access | Protect paid content; Stripe Checkout Session is standard | MEDIUM | `/api/create-checkout` stub exists; needs course-specific price ID and enrollment write to Supabase |
| Enrollment verification (auth gate) | Users must be authenticated and enrolled to access course content | MEDIUM | Supabase auth + RLS on `course_enrollments`; Next.js middleware for `/courses/aibi-p/*` |
| Course content separated from component code | Enables content iteration and future Kajabi migration | LOW | `/content/courses/aibi-p/` folder pattern already established |
| 404 / graceful error handling | Broken links on a paid product are trust-destroying | LOW | `not-found.tsx` already exists at app root |
| Accessible keyboard navigation | WCAG 2.1 AA is a constraint; professional audience includes screen reader users | MEDIUM | Tailwind focus rings; semantic HTML; test with axe or Lighthouse |

### Differentiators (Competitive Advantage)

Features that set AiBI-P apart from generic LMS courses (Teachable, Thinkific, Udemy-style).

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 3-question onboarding branch | Routes platform-specific content (Microsoft Copilot vs. ChatGPT Enterprise vs. generic) so every banker sees relevant examples — not a one-size course | MEDIUM | 3-question pre-flight in Supabase; component reads `platform_context` from user record; content files have platform variants in JSON/MDX |
| Skill Builder with 5-component fields and .md export | Learner leaves with a reusable prompt library, not just quiz scores; tangible output per module | MEDIUM | Client-side form with Role/Context/Task/Format/Constraint fields; server action generates `.md` file download; no third-party dependency |
| 5 downloadable artifacts | Learner keeps physical-feeling deliverables (Regulatory Cheatsheet, Acceptable Use Card, etc.) — reinforces completion and provides ongoing value | MEDIUM | 3 static PDFs served from `/public/artifacts/`; 2 dynamic PDFs (My First Skill, Platform Feature Reference Card) generated per-learner via `@react-pdf/renderer` or Puppeteer server action |
| Assessed work product (not exam score) | Demonstrates real capability; much harder to fake than a multiple-choice test; signals rigor to hiring managers | HIGH | 4-item submission with file upload to Supabase Storage; reviewer queue UI; 5-dimension rubric; Accuracy hard gate (score of 1 = auto fail) |
| Reviewer queue with 5-dimension rubric | Human review with structured scoring prevents credential inflation; builds brand trust | HIGH | Admin-only route `/admin/reviewer`; Supabase `work_product_submissions` table; reviewer claims a submission; scores 5 dimensions; auto-triggers Accredible on pass |
| LinkedIn badge via Accredible | AiBI-P on a LinkedIn profile is walking marketing; every earner is a referral vector | LOW | Accredible API returns `certificate_url` and `linkedin_add_url`; surface both on completion page |
| Institution bundle pricing (~$63/seat at 5+) | Community banks buy in cohorts; individual pricing blocks team adoption | MEDIUM | Stripe volume pricing (quantity at checkout) or separate price ID for institutional SKU; pass `quantity` param to Checkout Session |
| Plausible custom events (9) | Privacy-first analytics with granular funnel visibility; tells you exactly where learners drop | LOW | Deferred queue pattern already implemented in layout.tsx; add 9 event calls at module boundaries |
| ConvertKit tags on enrollment and certification | Drip sequences based on course state (enrolled but stalled, just certified, etc.) | LOW | `SKIP_CONVERTKIT` guard already exists; add enrollment tag on Stripe webhook; add certification tag on Accredible issuance |
| HubSpot property updates | Course status visible in deal pipeline; enables sales team follow-up on stalled learners | LOW | `hubspot` lib adapter already exists; add `course_status` and `certification_date` to pre-created properties |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Video content per module | Looks more "premium"; users expect it | Enormous content production cost; mobile data load; no reuse path to Kajabi without re-encoding; no value add over structured text + activities for banking content | Well-structured text modules with interactive drills deliver equivalent learning outcomes at 1/10th the production cost |
| Real-time chat / cohort discussions | "Community" feel; Teachable/Circle approach | Zero users at launch; complex moderation; off-brand for an institutional consulting product | Email sequence community + Executive Briefing offer is the relationship layer |
| Self-graded work product (learner submits, auto-passes) | Faster to build; no reviewer queue needed | Credential inflation destroys brand trust; every AiBI-P holder must have been genuinely evaluated | Reviewer queue with SLA (72-hour turnaround) is the brand differentiator |
| Let learners go back and change answers | Seems user-friendly | Enables score inflation and second-guessing; inconsistent with "demonstrated capability" framing | Show a review summary at end of each module before moving forward |
| Gamification (points, leaderboards, streaks) | Consumer LMS trend | Wrong register for compliance-adjacent professional banking content; feels like Duolingo for regulators | Progress bar, module completion checkmarks, and certificate are the appropriate achievement signals |
| Dark mode | Accessibility / preference request | Explicitly excluded by designer brief; parchment/terracotta brand system is the product | Ensure sufficient contrast in light mode (WCAG 2.1 AA) |
| Per-module retakes with different questions | Seems fair | 40-question bank with 12-per-attempt is already built and proven; adding retake branching mid-course is scope creep | Retake is for the final exam only; module activities are not graded |
| Kajabi-native delivery at launch | "Why build twice?" | Kajabi integration is a Phase 2 dependency; forces accounts, API contracts, and pricing decisions before the course is validated | Build course content in `/content/courses/aibi-p/` with Kajabi-migration-ready structure (MDX + JSON metadata); migration is a copy operation, not a rebuild |

---

## Feature Dependencies

```
Stripe Checkout ($79 / institutional)
    └──creates──> course_enrollments (Supabase)
                      └──gates──> /courses/aibi-p/* (Next.js middleware)
                                      └──enables──> Module progression tracking
                                                        └──gates──> Work product submission
                                                                        └──triggers──> Reviewer queue
                                                                                           └──on pass──> Accredible API
                                                                                                             └──returns──> Certificate URL + LinkedIn badge

Onboarding branch (3 questions)
    └──writes──> platform_context (Supabase user record)
                     └──conditions──> Platform-specific content variants in modules

Skill Builder (per module)
    └──generates──> .md export (downloaded by learner)
    └──feeds into──> Work product submission (Module 9 assessed item)

Supabase Auth
    └──required by──> All of the above
```

### Dependency Notes

- **Stripe Checkout requires Supabase enrollment write:** The webhook handler must write to `course_enrollments` before any access check can work. The existing stub at `/api/webhooks/stripe` needs course-enrollment logic added.
- **Accredible requires reviewer pass:** Certificate is never issued automatically. Reviewer must score all 5 rubric dimensions and Accuracy must be >= 2. Auto-fail on Accuracy=1 must be enforced at the API level, not just the UI.
- **Onboarding branch required before Module 1:** Platform context must be captured first to condition content rendering. Cannot be deferred or made optional.
- **Supabase Auth required for all course routes:** The existing site has no auth layer. This is a net-new dependency for the course milestone — users must have accounts. Auth must be implemented before any course feature can be tested end-to-end.
- **Dynamic PDF requires server-side rendering:** Cannot use client-side `jsPDF`; the "My First Skill" PDF must embed learner-entered Skill Builder data. Requires a server action or API route with `@react-pdf/renderer`.
- **ConvertKit and HubSpot are low-risk late additions:** Both adapters exist. Wire enrollment tag on Stripe webhook success. Wire certification tag on Accredible issuance. Neither blocks launch.

---

## MVP Definition

### Launch With (v1)

Minimum viable product to sell and deliver the AiBI-P credential.

- [ ] Supabase Auth (email/password) — gates all course content; no auth = no course
- [ ] Stripe Checkout ($79 individual price ID, quantity param for institutional) — no payment = no enrollment
- [ ] Stripe webhook writes to `course_enrollments` — connects payment to access
- [ ] `/courses/aibi-p` shell: 9 module cards, pillar grouping, progress indicators
- [ ] Module content rendering from `/content/courses/aibi-p/` — text, activities, drills
- [ ] Forward-only progress gating in Supabase (`module_completions` table)
- [ ] 3-question onboarding branch — platform_context stored in user record
- [ ] Skill Builder (5-component form + .md export) — the signature interactive feature
- [ ] 3 static artifact downloads (Regulatory Cheatsheet, Acceptable Use Card, Skill Template Library)
- [ ] 1 dynamic artifact: "My First Skill" PDF populated from Skill Builder data
- [ ] Work product submission (4-item, file upload via Supabase Storage signed URLs)
- [ ] Reviewer queue at `/admin/reviewer` (claim, score 5 dimensions, Accuracy hard gate)
- [ ] Accredible API integration on reviewer pass — POST credential, surface URL + LinkedIn link
- [ ] Certificate verification endpoint (`/api/verify/[uuid]`) — public, no auth required
- [ ] 9 Plausible analytics events at module boundaries

### Add After Validation (v1.x)

Features to add once core is working and first cohort has completed.

- [ ] Institutional bundle pricing (~$63/seat at 5+) — trigger: first institution inquiry
- [ ] ConvertKit enrollment and certification tags — trigger: first 10 enrollees
- [ ] HubSpot `course_status` and `certification_date` properties — trigger: first 10 enrollees
- [ ] "Platform Feature Reference Card" dynamic PDF (2nd dynamic artifact) — trigger: first learner feedback
- [ ] Progress resume across devices (Supabase-backed, not just sessionStorage) — trigger: first complaint about losing progress

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Kajabi migration — move course delivery to Kajabi; content already in migration-ready format
- [ ] Peer benchmark on work product scores ("You ranked in the top 30% of AiBI-P submissions") — requires N >= 30 submissions per segment
- [ ] AiBI-S and AiBI-L courses — subsequent milestones
- [ ] Batch/cohort enrollment flow for institutions (admin uploads CSV, bulk provisions seats)
- [ ] Certificate expiration and renewal workflow (AiBI-P v2 recertification)

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Supabase Auth | HIGH | MEDIUM | P1 |
| Stripe Checkout + enrollment write | HIGH | MEDIUM | P1 |
| Course shell + module gating | HIGH | MEDIUM | P1 |
| Onboarding branch | HIGH | LOW | P1 |
| Skill Builder + .md export | HIGH | MEDIUM | P1 |
| Work product submission (file upload) | HIGH | MEDIUM | P1 |
| Reviewer queue + rubric | HIGH | HIGH | P1 |
| Accredible certificate issuance | HIGH | LOW | P1 |
| Static artifact downloads (3) | MEDIUM | LOW | P1 |
| Dynamic PDF — My First Skill | MEDIUM | MEDIUM | P1 |
| Certificate verification endpoint | MEDIUM | LOW | P1 |
| Plausible 9 events | MEDIUM | LOW | P1 |
| Institutional bundle pricing | HIGH | LOW | P2 |
| ConvertKit enrollment/cert tags | MEDIUM | LOW | P2 |
| HubSpot property updates | MEDIUM | LOW | P2 |
| Dynamic PDF — Platform Feature Reference Card | LOW | MEDIUM | P2 |
| Cross-device progress resume | MEDIUM | LOW | P2 |
| Kajabi migration | HIGH (long-term) | HIGH | P3 |
| Peer benchmarking | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

Evaluated against: Teachable, Thinkific, Coursera for Business, LinkedIn Learning. AiBI-P competes on rigor and domain specificity, not breadth.

| Feature | Teachable / Thinkific | LinkedIn Learning | Our Approach |
|---------|----------------------|-------------------|--------------|
| Completion gate | Linear or free-choice | Always free-choice | Forward-only; cannot revisit past answers |
| Assessment | Multiple choice quiz | Quiz + project | Assessed work product with human review — highest rigor |
| Certificate | Auto-issued on completion | Auto-issued on completion | Issued by reviewer approval only; human verification |
| Artifacts / deliverables | None standard | None | 5 downloadable artifacts including dynamic PDFs personalized to learner |
| Platform routing | None | None | 3-question onboarding branch routes platform-specific content |
| Prompt tool | None | None | Skill Builder with 5-component structured form + export |
| LinkedIn integration | Generic badge | Native badge | Accredible LinkedIn badge with one-click add |
| Domain specificity | Generic | Generic | Banking-exclusive; regulatory context baked in (SR 11-7, ECOA/Reg B, AIEOG) |
| Price point | $99–$2,000 per course | $39.99/month subscription | $79 individual; ~$63/seat institution |

---

## Implementation Complexity Notes by Feature Group

### Group 1: Auth + Enrollment (Blocker for Everything)
Supabase Auth is net-new to the existing site. Must implement before any other course feature can be tested. Estimated complexity: MEDIUM. Standard pattern — email/password, magic link as fallback, RLS policies on `course_enrollments`.

### Group 2: Course Shell + Progress (Core UX)
Module card grid, pillar grouping, forward-only gating. The sessionStorage pattern from the assessment is a direct template. Supabase `module_completions` table replaces sessionStorage for persistence. Complexity: MEDIUM. Risk: mobile layout at 9 modules + 4 pillars needs careful responsive design.

### Group 3: Interactive Activities (Differentiating UX)
Skill Builder is the highest-value interactive element. Five text fields, client-side validation, server action for .md download. Forms, drills, and inventories are structured text interactions — no third-party library needed. Complexity: MEDIUM. Risk: Markdown export must be clean enough to paste into any AI tool.

### Group 4: Artifacts (Deliverable Quality)
Static PDFs: LOW complexity, just file serving. Dynamic PDFs: MEDIUM complexity. `@react-pdf/renderer` is the right choice over Puppeteer for this use case — no headless browser needed, pure React component to PDF, works in Vercel serverless. Puppeteer requires a separate rendering service or Vercel's edge runtime limitations.

### Group 5: Work Product + Reviewer Queue (Highest Complexity)
This is the highest-complexity feature group. File upload via Supabase signed URLs (avoids 1MB Next.js body limit). Reviewer queue is a simple admin CRUD interface — no real-time needed. The 5-dimension rubric is a form with numeric inputs and an Accuracy hard gate enforced in the submit handler. Complexity: HIGH. Risk: reviewer SLA (72-hour turnaround target) is an ops concern, not a technical one — but the UI must surface submission age clearly.

### Group 6: Certificate Issuance (Low Complexity, High Value)
Accredible REST API. POST to `/v1/credentials` with learner name, email, group ID (maps to AiBI-P credential template in Accredible dashboard), and issued_at date. Returns `id`, `url`, and a LinkedIn share URL. Surface on completion page. Complexity: LOW. Risk: Accredible account must be provisioned and credential template created before code runs.

### Group 7: Analytics + Integrations (Low Complexity, Deferrable)
All three (Plausible, ConvertKit, HubSpot) have established patterns in the codebase. Plausible deferred queue already in layout.tsx. ConvertKit `SKIP_CONVERTKIT` guard already exists. HubSpot adapter exists. Complexity: LOW. Risk: none, defer until v1.x.

---

## Dependencies on Existing Infrastructure

| Existing Piece | How Course Reuses It | What Must Be Added |
|---------------|----------------------|-------------------|
| `sessionStorage` persistence pattern | Template for module answer persistence | Supabase-backed persistence for cross-device resume |
| `/api/capture-email` | Reuse on enrollment for ConvertKit tag | Add `course_enrolled` tag parameter |
| `/api/webhooks/stripe` | Extend with course enrollment write | Add `course_enrollments` insert on `payment_intent.succeeded` |
| `src/lib/convertkit/` | Tag learner on enrollment and certification | Add `tagContact()` calls at two new trigger points |
| `src/lib/hubspot/` | Update contact properties | Pre-create `course_status` and `certification_date` in HubSpot dashboard |
| `src/lib/supabase/` | All course data persistence | New tables: `course_enrollments`, `module_completions`, `work_product_submissions` |
| Plausible deferred queue | 9 new custom events | Event calls at module entry, completion, submission, pass |
| `/content/` folder pattern | Course content in `/content/courses/aibi-p/` | New content structure for 9 modules with platform variant support |
| `ScoreRing.tsx`, `ProgressBar.tsx` | Visual progress indicators | May need module-specific variants |

---

## Sources

- [Accredible API Documentation](https://docs.api.accredible.com/) — credential creation, verification endpoint
- [Accredible Help: API FAQs](https://help.accredible.com/s/article/api-faq?language=en_US) — authentication, sandbox vs. production
- [Stripe: Recurring Pricing Models](https://docs.stripe.com/products-prices/pricing-models) — volume/per-seat pricing options
- [Supabase: Signed URL File Uploads](https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl) — file upload pattern for work product submissions
- [Next.js File Upload with Server Actions](https://akoskm.com/file-upload-with-nextjs-14-and-server-actions/) — implementation pattern
- [LearnDash: Course Progression](https://learndash.com/support/kb/core/courses/course-progression/) — linear vs. free-form progression patterns
- [LMS Portals: eLearning Design Mistakes](https://www.lmsportals.com/post/ten-common-mistakes-to-avoid-in-elearning-course-design) — anti-pattern source
- [Sertifier: LMS Certification Guide](https://sertifier.com/blog/lms-certification/) — certification workflow patterns

---

*Feature research for: AiBI-P self-paced professional certification course on Next.js 14*
*Researched: 2026-04-15*
