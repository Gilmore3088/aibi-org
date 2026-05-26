---
title: LMS Page Map — Foundation Course Interior
date: 2026-05-26
branch: feature/redesign-mockup-system
status: pre-mockup
purpose: drive design work on /courses/foundation/program/* surfaces
---

# LMS Page Map

The Foundation course interior at `/courses/foundation/program/*` is **the next surface to redesign.** This document inventories every page in that tree so mockups can be commissioned in the right order. **No code changes yet** — mockups first, then implementation.

## How to read this map

For each route:
- **What it is** — one-line purpose
- **Auth state** — what the visitor must be to reach it (anonymous / signed-in / enrolled)
- **Today** — what currently ships (chrome + design system)
- **Mockup needed?** — yes/no/already-mockup, with priority

## Conventions

- The whole tree lives under `src/app/courses/foundation/program/`
- All authenticated routes share `program/layout.tsx` which renders `CourseShell` (sidebar + breadcrumb)
- Module content lives in `content/courses/foundation-program/module-{1..12}.ts`
- 43 `_components/` files back the surfaces — many will collapse once the design system is unified

## The Foundation course at a glance

- **12 modules** (Awareness · Understanding · Creation · Application)
- **3 reviewed AI artifacts per practitioner**
- **$295 single seat** · $199/seat at 10+ · lifetime access
- **AiBI-Foundation credential** on completion

---

## Routes

### Pre-enrollment (anonymous OK)

#### `/courses/foundation/program/purchase`
- **What:** The $295 Stripe checkout. Also serves as the **public marketing landing for the course** — anyone clicking "View the curriculum" from `/education` lands here.
- **Auth state:** Anonymous OK. Renders different content for unenrolled vs already-enrolled visitors.
- **Today:** Long page with marketing content + Stripe checkout button. Mixed design system (some Ledger tokens, some mockup). Hero H1 reads "AI Banking Foundation." instead of "AiBI-Foundation."
- **Mockup needed?** **Yes — Priority 1.** This is the buyer's first close look at the course. Must read as a polished sales page. Restore the "credential your examiner respects" line.

#### `/courses/foundation/program/purchased`
- **What:** Stripe success-URL landing. "You're enrolled — here's what's next."
- **Auth state:** Signed-in, just-purchased.
- **Today:** Ledger tokens throughout. Audit flagged: "within minutes" / "Takes 30 seconds" → soften to natural language. "Read-only access to the Library and Cookbook" leads with the constraint, not the value.
- **Mockup needed?** **Yes — Priority 2.** First post-payment impression; sets the emotional tone of the entire course.

#### `/courses/foundation-preview` (sibling, not under /program)
- **What:** Internal preview bundle. Robots noindex.
- **Auth state:** Public but internal-only by convention.
- **Mockup needed?** **No.** Internal-only.

---

### Enrolled — Course shell

#### `/courses/foundation/program` (root)
- **What:** Course landing for enrolled learners. Module grid + resume-here state.
- **Auth state:** Enrolled.
- **Today:** Renders `HeroIntro` + `OutcomesPanel` + `CourseStructure` + 12 module cards. Uses Ledger tokens. H1 reads "AI Banking Foundation" not "AiBI-Foundation" (per audit).
- **Mockup needed?** **Yes — Priority 1.** This is the home base — what learners see every time they open the course.

#### `/courses/foundation/program/[module]` (one of 12)
- **What:** The actual module body — lessons, activities, examples, skill drills.
- **Auth state:** Enrolled. Some modules gate later modules.
- **Today:** Heavy custom layout. `ModuleHeader`, `ModuleTabs`, `SkillBuilder`, `OutputExample`, `WorkProductForm`, `ActivityForm`. ~25 distinct sub-components per module. Ledger tokens + retired `<em fontStyle="italic">` patterns.
- **Mockup needed?** **Yes — Priority 1 (template).** This is the most complex surface in the tree. One module mockup defines the template for all twelve. Pick **Module 4 — The AI Workbench** as the canonical because it's the most complex (four labs + Workbench Pack artifact per project memory).

---

### Enrolled — Onboarding + intake

#### `/courses/foundation/program/onboarding`
- **What:** First-time onboarding survey (role, asset size, learning goal).
- **Auth state:** Newly enrolled, hasn't completed onboarding.
- **Today:** Wraps `OnboardingSurvey` component.
- **Mockup needed?** **Yes — Priority 2.** Sets expectations for the whole course.

#### `/courses/foundation/program/post-assessment`
- **What:** Re-take the readiness assessment after the course; compare scores.
- **Auth state:** Enrolled + completed.
- **Today:** Wraps a v2 of the assessment.
- **Mockup needed?** **Yes — Priority 3.** Capstone surface; less frequent traffic.

---

### Enrolled — Toolbox + artifact surfaces

#### `/courses/foundation/program/toolkit`
- **What:** Per-learner toolkit — the saved artifacts from each module.
- **Auth state:** Enrolled.
- **Today:** Lists artifacts with strong citation language (e.g. "Regulatory Cheatsheet" cites AIEOG vocabulary).
- **Decision 2026-05-26:** Merging into `/dashboard/toolbox` as the **"My Saved" tab**. Route becomes a 308 redirect to `/dashboard/toolbox?tab=saved` once the tab ships. Until then, the page stays live.
- **Mockup needed?** **No standalone mockup** — the work happens as part of the `/dashboard/toolbox` "My Saved" tab in Wave 2.

#### `/courses/foundation/program/prompt-library`
- **What:** Redirects to `/dashboard/toolbox/library`.
- **Auth state:** Enrolled.
- **Mockup needed?** **No.** Redirect only.

#### `/courses/foundation/program/quick-wins`
- **What:** Lightweight "log a win" surface that earns a recommendation-letter template.
- **Auth state:** Enrolled.
- **Today:** **Audit-blocker — uses "unlock" in metadata description.**
- **Mockup needed?** **Yes — Priority 3.** Small surface but conversion-relevant. Fix the "unlock" word as part of the mockup pass.

#### `/courses/foundation/program/tool-guides`
- **What:** Setup guides for the six AI platforms (Claude / ChatGPT / Gemini / Copilot / Notion / Perplexity).
- **Auth state:** Enrolled.
- **Today:** Concrete description naming all six platforms.
- **Mockup needed?** **Yes — Priority 2.** Frequently visited reference surface.

#### `/courses/foundation/program/artifacts/[artifactId]`
- **What:** One saved artifact — view + share + download.
- **Auth state:** Enrolled.
- **Today:** Dynamic detail page.
- **Mockup needed?** **Yes — Priority 2.** The credential's portable proof.

---

### Enrolled — Submission + cert

#### `/courses/foundation/program/submit`
- **What:** Submit completed work for review.
- **Auth state:** Enrolled.
- **Today:** Standard submission form.
- **Mockup needed?** **Yes — Priority 3.** Low-traffic but critical to the "scored on reviewed work" promise.

#### `/courses/foundation/program/certificate`
- **What:** The earned credential view. Also drives the cert PDF.
- **Auth state:** Enrolled + completed.
- **Today:** **Audit-blocker — uses em-dash in credential format** ("AiBI-Foundation — The AI Banking Institute"). Brand standard is middle dot.
- **Mockup needed?** **Yes — Priority 1.** This is the brand's most-screenshot-worthy moment. The credential's portable identity comes from this page.

#### `/courses/foundation/program/gallery`
- **What:** Public-facing gallery of completed learner work (opt-in).
- **Auth state:** Public.
- **Today:** Renders selected artifacts.
- **Mockup needed?** **Yes — Priority 2.** Social proof / marketing surface.

---

### Enrolled — Account

#### `/courses/foundation/program/settings`
- **What:** Per-learner profile + preferences.
- **Auth state:** Enrolled.
- **Today:** Standard settings page.
- **Mockup needed?** **Yes — Priority 4.** Functional, low visual stakes.

---

## Mockup commission order

| Wave | Surfaces | Why |
|---|---|---|
| **Wave 1 — Foundations** | `/program` (home), `/program/[module]` (M4 as template), `/program/purchase`, `/program/certificate` | Sets the design language for the whole tree. M4 mockup is the template for all 12 modules. Cert is the brand's most-shareable artifact. |
| **Wave 2 — Daily-use surfaces** | `/program/toolkit`, `/program/tool-guides`, `/program/artifacts/[id]`, `/program/onboarding`, `/program/purchased` | The pages a learner visits weekly. Onboarding + purchased land the emotional tone after enrollment. |
| **Wave 3 — Periphery** | `/program/quick-wins`, `/program/submit`, `/program/post-assessment`, `/program/gallery` | Lower traffic but each carries one important promise (wins, reviewed work, capstone, social proof). |
| **Wave 4 — Settings** | `/program/settings` | Functional only. |

## Existing assets to reference

- **Module 4 v5 prototype:** `.superpowers/brainstorm/.../module-4-experience.html` (per memory `project_m4_workbench_pack`)
- **Module mockup philosophy:** memory `project_foundation_course_experience` — "calm operating system not LMS · Toolbox = personal AI operating layer · finish line = 'I can use this Monday'"
- **Mockup design system source of truth:** `public/sketches/_mockup.css` + `src/styles/tokens-mockup.css`
- **Existing live LMS code:** `src/app/courses/foundation/program/` (15 routes, 43 _components)
- **Content the LMS renders:** `content/courses/foundation-program/module-{1..12}.ts` + `modules.ts` registry

## Things the mockups must answer

These cross-cutting questions need a design decision before any single surface ships.

### Operator decisions logged 2026-05-26

1. **Sidebar vs top-nav for CourseShell?** — **SIDEBAR. Locked 2026-05-26.** Compared via [`/sketches/lms-shell-options.html`](/sketches/lms-shell-options.html). Existing `CourseShell` already implements the sidebar pattern — the mockup pass restyles it with the mockup palette (gold accent, ink fill, Inter type, pillar-grouped module list, always-on progress block). No structural refactor needed.
2. **Where does the Toolbox live across `/my-toolbox`, `/dashboard/toolbox`, `/program/toolkit`?** — **MERGE INTO ONE SURFACE. Locked 2026-05-26.** Single Toolbox at `/dashboard/toolbox` with three tabs:
   - **Library** — Institute-curated banker-vetted prompts
   - **Cookbook** — multi-step recipes
   - **My Saved** — the learner's own artifacts from course modules (subsumes today's `/program/toolkit`)

   `/my-toolbox` stays as the public preview/demo (pre-purchase marketing). `/program/toolkit` becomes a redirect to `/dashboard/toolbox?tab=saved` **once the "My Saved" tab is built** (Wave 2 mockup work). Don't ship the redirect today — users would land on an empty surface. In-course links inside modules will point at `/dashboard/toolbox?tab=saved` after the merge.
3. **Module-level navigation pattern (tabs vs sub-routes)?** — **Decision deferred.** Today's `ModuleTabs` (in-page Learn it / Try it / Use it / Save it) stays as the working assumption; the mockup pass will revisit if a sub-route pattern emerges naturally.
4. **Saved artifacts: card or row, one design or per-surface?** — **One design.** Library + Cookbook + Toolkit all share the same saved-artifact card. Build it once.
5. **Credential display format (middle dot vs em-dash)?** — **Not a priority.** The audit flagged the em-dash on the live cert; leave as-is for now and revisit when the certificate page enters Wave 1 mockups.

## What this map does not cover

- The reviewer-facing surfaces (where the Institute reviews submitted work)
- The cohort-leader dashboard (`/assessment/in-depth/dashboard` shadow)
- AiBI-S Specialist + AiBI-L Leader interiors (shipped after Foundation validates)
- Email templates (MailerLite + Resend, outside this repo)

---

## Next step

Operator decides which Wave 1 surface to mockup first. Recommendation: start with `/program` (home) since it sets the chrome that every other interior page reads against. Then `/program/[module]` (M4) since it's the highest-complexity template.
