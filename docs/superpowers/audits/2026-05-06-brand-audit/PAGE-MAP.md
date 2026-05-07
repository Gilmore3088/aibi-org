# AiBI Page Map — Live Route Inventory

**Date:** 2026-05-06
**Purpose:** Complete inventory of every user-facing route in the live Next.js app, categorized for brand audit prioritization.
**Source:** `src/app/` on branch `design-2.0` (forked from `main` at fe7cb4d).
**Excluded:** `src/app/api/**` route handlers (server-only, not user-facing).

---

## Audit priority key

| Tier | Meaning |
|------|---------|
| **P0** | Funnel-critical. Every visitor sees this. Brand drift here costs conversions. Audit first. |
| **P1** | High-traffic post-conversion or marketing. Materially shapes the brand impression. Audit second. |
| **P2** | Lower-traffic but visible. Should still feel branded. Audit third. |
| **P3** | Authenticated, niche, or admin. Brand-internal — audit last or skip. |

---

## 1. Public marketing & primary funnel — P0

The pages a stranger lands on. Brand impression starts here.

| Route | File | LOC | Purpose | Audit |
|---|---|---|---|---|
| `/` | `src/app/page.tsx` | 234 | Homepage. Composes `HomeContextStrip`, `ROICalculator`, `InteractiveSkillsPreview` plus inline "How it works" + CTAs. | **P0** |
| `/about` | `src/app/about/page.tsx` | 84 | Founder + mission. | **P0** |
| `/education` | `src/app/education/page.tsx` | 452 | Education hub (merged `/courses` + `/certifications` per 2026-04-17 decision). Catalog of free + paid programs. | **P0** |
| `/for-institutions` | `src/app/for-institutions/page.tsx` | 321 | Institutional sales surface. Three-tier engagement framing. | **P0** |
| `/for-institutions/advisory` | `src/app/for-institutions/advisory/page.tsx` | 195 | Pilot / Program / Leadership Advisory detail. | **P1** |
| `/for-institutions/samples/efficiency-ratio-workbook` | `src/app/for-institutions/samples/efficiency-ratio-workbook/page.tsx` | 221 | Free sample artifact (FDIC efficiency-ratio workbook). | **P1** |
| `/resources` | `src/app/resources/page.tsx` | 276 | Article archive. Index of the AI Banking Brief essays. | **P0** |
| `/security` | `src/app/security/page.tsx` | 146 | Security / Pillar B landing (per CLAUDE.md route table). | **P1** |

## 2. Assessment funnel — P0

The conversion engine. Every brand mistake here is amplified.

| Route | File | LOC | Purpose | Audit |
|---|---|---|---|---|
| `/assessment` | `src/app/assessment/page.tsx` | 216 | Main free 12-question assessment. Mobile-first, sessionStorage-persistent. | **P0** |
| `/assessment/start` | `src/app/assessment/start/page.tsx` | 76 | Intro / start gate. | **P0** |
| `/results/[id]` | `src/app/results/[id]/page.tsx` | — | Owner-bound results page (Spec 4 from the 2026-05-04 four-surface program). | **P0** |
| `/assessment/results/print/[id]` | `src/app/assessment/results/print/[id]/page.tsx` | 110 | Print-optimized results view (PDF source). | **P1** |

## 3. Long-form essays / "AI Banking Brief" content — P1

Six published essays as of audit date. These are the research-shop substance and define institutional credibility.

| Route | File | LOC | Topic | Audit |
|---|---|---|---|---|
| `/resources/six-ways-ai-fails-in-banking` | 402 | Failure modes essay | **P1** |
| `/resources/ai-governance-without-the-jargon` | 342 | Governance primer | **P1** |
| `/resources/the-skill-not-the-prompt` | 313 | Practitioner pedagogy essay | **P1** |
| `/resources/what-your-efficiency-ratio-is-hiding` | 284 | Efficiency-ratio analysis | **P1** |
| `/resources/members-will-switch` | 208 | Switching-risk essay | **P1** |
| `/resources/the-widening-ai-gap` | 200 | Inequality-in-adoption essay | **P1** |

(All under `src/app/resources/<slug>/page.tsx`.)

## 4. AiBI-Practitioner course / LMS — P1

The paid product experience. Every enrolled banker lives here.

| Route | File | LOC | Purpose | Audit |
|---|---|---|---|---|
| `/courses/aibi-p` | `src/app/courses/aibi-p/page.tsx` | 287 | Course landing / overview. The CFI-style program detail page in the live app. | **P1** |
| `/courses/aibi-p/[module]` | `src/app/courses/aibi-p/[module]/page.tsx` | 252 | Module view. The lesson body of the LMS. | **P1** |
| `/courses/aibi-p/onboarding` | `src/app/courses/aibi-p/onboarding/page.tsx` | — | First-run onboarding. | **P1** |
| `/courses/aibi-p/post-assessment` | `src/app/courses/aibi-p/post-assessment/page.tsx` | — | Post-course assessment. | **P2** |
| `/courses/aibi-p/purchase` | `src/app/courses/aibi-p/purchase/page.tsx` | 193 | Stripe checkout entrypoint. | **P1** |
| `/courses/aibi-p/certificate` | `src/app/courses/aibi-p/certificate/page.tsx` | 308 | Certificate display + download. | **P1** |
| `/courses/aibi-p/gallery` | `src/app/courses/aibi-p/gallery/page.tsx` | 80 | Practitioner artifact gallery. | **P2** |
| `/courses/aibi-p/quick-wins` | `src/app/courses/aibi-p/quick-wins/page.tsx` | 520 | Quick-wins log surface. | **P2** |
| `/courses/aibi-p/settings` | `src/app/courses/aibi-p/settings/page.tsx` | — | Account settings within course. | **P3** |
| `/courses/aibi-p/submit` | `src/app/courses/aibi-p/submit/page.tsx` | 151 | Artifact submission. | **P2** |
| `/courses/aibi-p/tool-guides` | `src/app/courses/aibi-p/tool-guides/page.tsx` | 188 | Tool walkthroughs. | **P2** |
| `/courses/aibi-p/toolkit` | `src/app/courses/aibi-p/toolkit/page.tsx` | 604 | Practitioner toolkit hub (largest LMS surface). | **P1** |
| `/courses/aibi-p/prompt-library` | `src/app/courses/aibi-p/prompt-library/page.tsx` | — | Prompt library. | **P2** |
| `/courses/aibi-p/artifacts/[artifactId]` | `src/app/courses/aibi-p/artifacts/[artifactId]/page.tsx` | 112 | Single artifact view. | **P2** |

## 5. AiBI-S (Specialist) course — P2

Currently soft-hidden per 2026-05-05 product simplification, but routes exist.

| Route | File | LOC | Purpose | Audit |
|---|---|---|---|---|
| `/courses/aibi-s` | `src/app/courses/aibi-s/page.tsx` | 63 | Specialist landing (soft-hidden). | **P2** |
| `/courses/aibi-s/ops` | `src/app/courses/aibi-s/ops/page.tsx` | 186 | Ops track. | **P2** |
| `/courses/aibi-s/ops/unit/[unitId]` | `src/app/courses/aibi-s/ops/unit/[unitId]/page.tsx` | — | Ops unit. | **P2** |
| `/courses/aibi-s/purchase` | `src/app/courses/aibi-s/purchase/page.tsx` | 282 | Specialist checkout. | **P2** |

## 6. AiBI-L (Leader) course — P2

Cohort-supported, currently low-traffic.

| Route | File | LOC | Purpose | Audit |
|---|---|---|---|---|
| `/courses/aibi-l` | `src/app/courses/aibi-l/page.tsx` | 297 | Leader program overview. | **P2** |
| `/courses/aibi-l/[session]` | `src/app/courses/aibi-l/[session]/page.tsx` | 278 | Cohort session view. | **P2** |
| `/courses/aibi-l/request` | `src/app/courses/aibi-l/request/page.tsx` | 290 | Request-an-engagement form. | **P2** |

## 7. Certifications — P1

| Route | File | LOC | Purpose | Audit |
|---|---|---|---|---|
| `/certifications/exam/aibi-p` | `src/app/certifications/exam/aibi-p/page.tsx` | 254 | Final certification exam UI. | **P1** |

## 8. Authentication surfaces — P1

Public, hit on every signup / login.

| Route | File | LOC | Purpose | Audit |
|---|---|---|---|---|
| `/auth/login` | `src/app/auth/login/page.tsx` | 257 | Login. | **P1** |
| `/auth/signup` | `src/app/auth/signup/page.tsx` | 235 | Signup. | **P1** |
| `/auth/forgot-password` | `src/app/auth/forgot-password/page.tsx` | 101 | Password reset request. | **P2** |
| `/auth/reset-password` | `src/app/auth/reset-password/page.tsx` | 115 | Password reset confirm. | **P2** |

## 9. Authenticated dashboard & toolbox — P2

Logged-in member home.

| Route | File | LOC | Purpose | Audit |
|---|---|---|---|---|
| `/dashboard` | `src/app/dashboard/page.tsx` | 531 | Member dashboard home. | **P2** |
| `/dashboard/progression` | `src/app/dashboard/progression/page.tsx` | 634 | Learner progression view (largest dashboard surface). | **P2** |
| `/dashboard/toolbox` | `src/app/dashboard/toolbox/page.tsx` | — | Toolbox landing. | **P2** |
| `/dashboard/toolbox/cookbook` | `src/app/dashboard/toolbox/cookbook/page.tsx` | 118 | Cookbook index. | **P2** |
| `/dashboard/toolbox/cookbook/[slug]` | `src/app/dashboard/toolbox/cookbook/[slug]/page.tsx` | 109 | Single recipe. | **P2** |
| `/dashboard/toolbox/library` | `src/app/dashboard/toolbox/library/page.tsx` | 179 | Library index. | **P2** |
| `/dashboard/toolbox/library/[slug]` | `src/app/dashboard/toolbox/library/[slug]/page.tsx` | 269 | Single library item. | **P2** |

## 10. Practice & misc surfaces — P2

| Route | File | LOC | Purpose | Audit |
|---|---|---|---|---|
| `/practice/[repId]` | `src/app/practice/[repId]/page.tsx` | — | Single practice rep (interactive AI exercise). | **P2** |
| `/prompt-cards` | `src/app/prompt-cards/page.tsx` | — | Prompt-card lead-magnet surface. | **P2** |
| `/verify/[certificateId]` | `src/app/verify/[certificateId]/page.tsx` | 421 | Public credential verification. Branded face seen by employers. | **P1** |

## 11. Legal & utility — P2

| Route | File | LOC | Purpose | Audit |
|---|---|---|---|---|
| `/privacy` | `src/app/privacy/page.tsx` | — | Privacy policy. | **P2** |
| `/terms` | `src/app/terms/page.tsx` | — | Terms of service. | **P2** |
| `/ai-use-disclaimer` | `src/app/ai-use-disclaimer/page.tsx` | — | AI use disclaimer. | **P2** |
| `/coming-soon` | `src/app/coming-soon/page.tsx` | 288 | Coming-soon holding page (per 2026-04-18 decision; pulled DNS in panic). | **P2** |

## 12. Admin — P3 (excluded from brand audit)

| Route | File | LOC | Audit |
|---|---|---|---|
| `/admin` | `src/app/admin/page.tsx` | 167 | **P3** |
| `/admin/reviewer` | `src/app/admin/reviewer/page.tsx` | 78 | **P3** |
| `/admin/reviewer/[id]` | `src/app/admin/reviewer/[id]/page.tsx` | 211 | **P3** |

---

## Shared chrome

These render on every page and define the brand impression at the seam:

| File | Purpose |
|---|---|
| `src/app/layout.tsx` | Root layout — fonts, head, top-level wrappers. |
| `src/components/Header.tsx` | Site nav. |
| `src/components/Footer.tsx` | Footer. |
| `src/components/MobileNav.tsx` | Mobile nav drawer. |
| `src/components/AibiSeal.tsx` | Brand seal mark. |
| `src/components/JourneyBanner.tsx` | Cross-page funnel banner. |
| `src/components/AuthButton.tsx`, `AuthDropdown.tsx` | Auth chrome. |
| `src/components/sections/HomeContextStrip.tsx` | Homepage context strip. |
| `src/components/sections/ROICalculator.tsx`, `ROICalculatorBody.tsx` | ROI calculator (homepage island). |
| `src/components/sections/InteractiveSkillsPreview.tsx` | Skills preview component. |
| `src/components/sections/SampleQuestion.tsx` | Sample question component. |

Shared chrome must be audited *first* — its drift propagates everywhere.

---

## Audit waves

Given roughly 60 user-facing routes, the audit will run in four waves:

**Wave 0 — Shared chrome** (1 doc): `Header`, `Footer`, `MobileNav`, `JourneyBanner`, `layout.tsx`, brand seal usage. The most leveraged audit.

**Wave 1 — P0 funnel** (~10 docs): `/`, `/about`, `/education`, `/for-institutions`, `/resources`, `/assessment`, `/assessment/start`, `/results/[id]`, plus `/courses/aibi-p` and `/auth/login` if traffic warrants.

**Wave 2 — P1 brand surfaces** (~15 docs): essays, course interior, certificate, verify, signup, advisory.

**Wave 3 — P2 lower priority** (~25 docs): AiBI-S/L pages, dashboard interior, toolbox, practice, legal.

Per-page audit doc lives at `docs/superpowers/audits/2026-05-06-brand-audit/<route-slug>.md`.

---

## Counts

- **Total user-facing routes:** ~63
- **P0:** 12
- **P1:** 17
- **P2:** 31
- **P3 (excluded):** 3

The full audit is roughly 60 page-reviews. Expect Wave 0 + Wave 1 to land in this session; Waves 2–3 are subsequent work.
