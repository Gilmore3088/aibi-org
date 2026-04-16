# Roadmap: AiBI-P — Banking AI Practitioner Course

## Overview

Build the complete AiBI-P certification course within the existing Next.js 14 site. The work flows in strict dependency order: database schema and content structure first (nothing else can start without these), then the course shell and assessment upgrade, then Stripe enrollment and paywall, then onboarding branch and progress persistence, then two phases of module activities and artifact generation, then the human-reviewed work product and reviewer queue, and finally certificate issuance and public verification. Each phase delivers a vertically testable slice before the next begins.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - DB schema migrations and content architecture established
- [x] **Phase 2: Course Shell + Assessment Upgrade** - Browsable 9-module course shell and upgraded 12-question assessment
- [x] **Phase 3: Stripe Checkout + Enrollment** - Payment flow, access gating, institution bundle model
- [x] **Phase 4: Onboarding Branch + Progress Tracking** - Survey routing, forward-only gating, resume functionality
- [x] **Phase 5: Modules 1-5 Activities + Artifacts** - Pillar A/B modules fully interactive with first three artifacts
- [x] **Phase 6: Modules 6-9 Activities + Skill Builder** - Pillar C/D modules, skill builder, My First Skill artifact
- [ ] **Phase 7: Work Product + Reviewer Queue** - 4-item submission, 5-dimension rubric, pass/fail workflow
- [ ] **Phase 8: Certificate + Verification** - Certificate issuance, LinkedIn badge, public verification endpoint

## Phase Details

### Phase 1: Foundation
**Goal**: Database schema and content architecture are established so every subsequent phase has somewhere to write data and a canonical place for module content
**Depends on**: Nothing (first phase)
**Requirements**: DB-01, DB-02, DB-03, DB-04, DB-05, DB-06, DB-07, CONT-01, CONT-02, CONT-03, CONT-04, CONT-05
**Success Criteria** (what must be TRUE):
  1. All five new database tables exist with correct columns, RLS policies, and indexed foreign keys — verifiable by running the Supabase Dashboard RLS tester against each table
  2. A developer can open `/content/courses/aibi-p/` and find module content files separated from component code — no module prose is hardcoded in any `.tsx` file
  3. The content structure matches the existing `content/assessments/v1/` pattern — same folder conventions, same typed import pattern
  4. Activity responses written to `activity_responses` table are visible only to the owning enrolled user (RLS enforced)
**Plans**: 2 plans
Plans:
- [x] 01-01-PLAN.md — Database schema (5 tables), RLS policies, indexes, TypeScript types, Supabase client
- [ ] 01-02-PLAN.md — Content architecture: typed module content files for all 9 AiBI-P modules

### Phase 2: Course Shell + Assessment Upgrade
**Goal**: The 9-module course is fully browsable (real content, pillar color banding, activity form shells) and the free assessment serves 12 rotating questions from the expanded pool
**Depends on**: Phase 1
**Requirements**: SHELL-01, SHELL-02, SHELL-03, SHELL-04, SHELL-05, SHELL-06, SHELL-07, SHELL-08, SHELL-09, SHELL-10, SHELL-11, SHELL-12, ASMT-01, ASMT-02, ASMT-03, ASMT-04, ASMT-05, ASMT-06, ASMT-07, ASMT-08, ASMT-09, ASMT-10, ASMT-11
**Success Criteria** (what must be TRUE):
  1. A visitor to `/courses/aibi-p` sees the four-pillar overview with Sage/Cobalt/Amber/Terra color banding and all 9 modules listed with times and outputs
  2. Navigating to any module page at `/courses/aibi-p/[1-9]` renders the real module content (not placeholder) with the correct pillar header color
  3. A non-enrolled visitor attempting to access a module page is redirected to the purchase page
  4. The free assessment at `/assessment` serves exactly 12 questions, shows "Question N of 12" throughout, and displays score and tier without requiring email entry
  5. The persistent left sidebar shows all modules grouped by pillar; completed modules show a checkmark; current module is highlighted; locked modules are visually distinct
**Plans**: 4 plans
Plans:
- [ ] 02-01-PLAN.md — Course layout shell: sidebar, overview page, pillar cards, module map, --color-amber
- [ ] 02-02-PLAN.md — Dynamic module pages: content rendering, pillar header bands, activity form shells
- [ ] 02-03-PLAN.md — Enrollment gating: Supabase enrollment check, server-side access rules, purchase page
- [ ] 02-04-PLAN.md — Assessment v2: 48-question pool, Fisher-Yates rotation, 12-question sessions, new scoring
**UI hint**: yes

### Phase 3: Stripe Checkout + Enrollment
**Goal**: A learner can pay $79 for individual access or purchase institution seats, and the Stripe webhook provisions their enrollment in Supabase granting course access
**Depends on**: Phase 2
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04, PAY-05
**Success Criteria** (what must be TRUE):
  1. A learner who pays $79 via Stripe Checkout is provisioned with an enrollment row in `course_enrollments` and can immediately access the course
  2. An institution buyer can purchase 5+ seats at the ~$63/seat price; the institution's discount persists for all future AiBI-P purchases without needing to requalify
  3. A learner who enrolls after their institution already has a discount pays $63 automatically
  4. A non-enrolled visitor who tries to access any module URL is redirected to the purchase page, not a 404
**Plans**: 2 plans
Plans:
- [ ] 03-01-PLAN.md — Stripe SDK, create-checkout API route (individual + institution), purchase page Enroll button wiring
- [ ] 03-02-PLAN.md — Stripe webhook handler: signature verification, enrollment provisioning, institution bundle tracking

### Phase 4: Onboarding Branch + Progress Tracking
**Goal**: Enrolled learners complete a 3-question onboarding survey before Module 1, their platform context routes content throughout the course, and progress persists to Supabase so iOS tab kills cannot lose work
**Depends on**: Phase 3
**Requirements**: ONBD-01, ONBD-02, ONBD-03, ONBD-04, ONBD-05
**Success Criteria** (what must be TRUE):
  1. After paying, a learner sees the 3-question onboarding survey before the first module unlocks; survey answers are saved to Supabase
  2. A learner who uses Microsoft 365 sees the Copilot activation content path in Module 3; a ChatGPT subscriber sees ChatGPT content highlighted first
  3. A learner who closes their iPhone browser mid-module and returns hours later resumes at exactly the question they left — no data lost
  4. A learner cannot reach Module 2 content until Module 1's activity is submitted (forward-only enforced server-side, not just UI-disabled)
  5. A learner can update their onboarding platform selection from profile settings and the content routing updates on next page load
**Plans**: 2 plans
Plans:
- [ ] 04-01-PLAN.md — Onboarding survey page (3 questions), save-onboarding API route
- [ ] 04-02-PLAN.md — Progress persistence API, content routing helper, layout onboarding gate, settings page
**UI hint**: yes

### Phase 5: Modules 1-5 Activities + Artifacts
**Goal**: The first five modules (Awareness and Understanding pillars) are fully interactive — every activity is submittable, three artifacts are downloadable, the classification drill is timed, and the Acceptable Use Card is generated dynamically from learner responses
**Depends on**: Phase 4
**Requirements**: M1-01, M1-02, M1-03, M1-04, M1-05, M1-06, M1-07, M2-01, M2-02, M2-03, M2-04, M2-05, M2-06, M2-07, M3-01, M3-02, M3-03, M3-04, M3-05, M3-06, M4-01, M4-02, M4-03, M4-04, M4-05, M5-01, M5-02, M5-03, M5-04, M5-05, M5-06, M5-07, ARTF-01, ARTF-02, ARTF-05, ARTF-06, A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05, A11Y-06, FUNL-01, FUNL-02, FUNL-03
**Success Criteria** (what must be TRUE):
  1. After submitting Activity 1.1 (two free-text answers, minimum 20 chars each), the learner receives the Regulatory Cheatsheet PDF download and Module 2 unlocks
  2. After completing Activity 5.1 (20-scenario classification drill, timed), the learner sees their score with incorrect answers annotated; after Activity 5.2 (four role-specific questions), a personalized Acceptable Use Card PDF is generated and downloaded
  3. After completing Module 4, the Platform Feature Reference Card PDF is available for download; Module 4's activity shows the learner's role-specific feature spotlight
  4. A keyboard-only user can complete every activity in Modules 1-5 without a mouse; color is never the sole indicator of correct/incorrect classification
  5. A learner on iPhone Safari (390px) completes all five modules without horizontal scrolling, with all text at 14pt minimum
**Plans**: 4 plans
Plans:
- [ ] 05-01-PLAN.md — Activity submission system: interactive ActivityForm, submit-activity API, module page wiring
- [ ] 05-02-PLAN.md — Module-specific activities: subscription inventory (M2), classification drill (M5), Acceptable Use Card form (M5)
- [ ] 05-03-PLAN.md — Artifacts: static PDFs (Regulatory Cheatsheet, Platform Reference Card), dynamic PDF (Acceptable Use Card via @react-pdf/renderer)
- [ ] 05-04-PLAN.md — Accessibility audit (WCAG 2.1 AA), sales funnel CTAs, human verification checkpoint
**UI hint**: yes

### Phase 6: Modules 6-9 Activities + Skill Builder
**Goal**: The Creation and Application pillars are fully interactive — the skill builder produces a real .md file, the iteration protocol guides the learner through four tests, the automation framework produces their final task list, and the Skill Template Library is downloadable
**Depends on**: Phase 5
**Requirements**: M6-01, M6-02, M6-03, M6-04, M6-05, M6-06, M6-07, M7-01, M7-02, M7-03, M7-04, M7-05, M7-06, M7-07, M7-08, M8-01, M8-02, M8-03, M8-04, M8-05, M9-01, M9-02, M9-03, M9-04, ARTF-03, ARTF-04
**Success Criteria** (what must be TRUE):
  1. After completing Activity 6.1 (three-skill diagnosis), the Skill Template Library artifact downloads — a PDF plus five .md starter files
  2. A learner can complete all five fields of the skill builder with role-specific placeholder examples visible; on submission, a .md file named `[Role]-[Task]-Skill-v1.md` downloads to their device
  3. The learner's completed skill is accessible for re-download from their profile at any time after Activity 7.1 completion (My First Skill artifact)
  4. Activity 8.1 guides the learner through four iterations with the one-change rule; the final iterated skill saves as a new .md file
  5. Module 9 presents the role-specific automation examples table (three tiers per role) and Module 9 completion unlocks the assessed work product submission form
**Plans**: 2 plans
Plans:
- [ ] 06-01-PLAN.md — Skill Diagnosis (M6), Skill Builder with .md export (M7), Skill Template Library artifact, role-specific placeholders
- [ ] 06-02-PLAN.md — Iteration Tracker (M8), CompletionCTA updates (M6-M9), M9 completion gate, My First Skill re-download
**UI hint**: yes

### Phase 7: Work Product + Reviewer Queue
**Goal**: Learners submit their 4-item work product package via direct Supabase Storage upload, reviewers score submissions against the 5-dimension rubric with the Accuracy hard gate enforced server-side, and failed submissions receive written feedback with one resubmission permitted
**Depends on**: Phase 6
**Requirements**: WORK-01, WORK-02, WORK-03, WORK-04, WORK-05, REVW-01, REVW-02, REVW-03, REVW-04, REVW-05, REVW-06, REVW-07, REVW-08
**Success Criteria** (what must be TRUE):
  1. A learner can upload their skill .md file directly to Supabase Storage (not through a Vercel function) and submit text fields for input, raw output, edited output, and annotation — form cannot be submitted with any of the four items missing
  2. A reviewer accessing `/admin/reviewer/` sees the submission queue ordered by date; selecting a submission shows the 5-dimension rubric with 1-4 radio buttons per dimension
  3. A submission with a score of 1 on Accuracy is automatically failed regardless of total score — this check happens server-side before any status update
  4. A passing submission (score >= 14, Accuracy >= 3) transitions the enrollment to `approved` status; a failing submission sends the learner written feedback and opens the resubmission path
  5. A learner who failed receives actionable written feedback identifying specific dimensions and can resubmit exactly once; their resubmission appears at the top of the reviewer queue
**Plans**: 2 plans
Plans:
- [ ] 01-01-PLAN.md — Database schema (5 tables), RLS policies, indexes, TypeScript types, Supabase client
- [ ] 01-02-PLAN.md — Content architecture: typed module content files for all 9 AiBI-P modules

### Phase 8: Certificate + Verification
**Goal**: Reviewer approval triggers certificate record creation and PDF delivery, the certificate matches the specified design, a public verification endpoint returns holder details, and the learner sees their LinkedIn badge link on the completion page
**Depends on**: Phase 7
**Requirements**: CERT-01, CERT-02, CERT-03, CERT-04, CERT-05, CERT-06
**Success Criteria** (what must be TRUE):
  1. When a reviewer approves a submission, the system re-reads `approved` status from the database before issuing a certificate — no certificate is issued unless the status column confirms approval
  2. The learner receives a certificate PDF by email within 24 hours of approval; the certificate displays the correct typography (Cormorant 28pt name, DM Mono 12pt date, DM Mono certificate ID) and AiBI circular seal watermark at 8% opacity
  3. Navigating to `/verify/[certificateID]` without logging in returns the holder name, designation, date issued, and issuing institution — and nothing else
  4. The certificate ID is a unique alphanumeric string; a second approval attempt for the same enrollment does not create a duplicate certificate
**Plans**: 2 plans
Plans:
- [ ] 01-01-PLAN.md — Database schema (5 tables), RLS policies, indexes, TypeScript types, Supabase client
- [ ] 01-02-PLAN.md — Content architecture: typed module content files for all 9 AiBI-P modules
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/2 | In Progress|  |
| 2. Course Shell + Assessment Upgrade | 0/4 | Not started | - |
| 3. Stripe Checkout + Enrollment | 0/2 | Not started | - |
| 4. Onboarding Branch + Progress Tracking | 0/2 | Not started | - |
| 5. Modules 1-5 Activities + Artifacts | 0/4 | Not started | - |
| 6. Modules 6-9 Activities + Skill Builder | 0/2 | Not started | - |
| 7. Work Product + Reviewer Queue | 0/TBD | Not started | - |
| 8. Certificate + Verification | 0/TBD | Not started | - |
