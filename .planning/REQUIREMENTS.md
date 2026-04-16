# Requirements: AiBI-P — Banking AI Practitioner Course

**Defined:** 2026-04-15
**Core Value:** AiBI-P course must be completable on mobile in under 5.5 hours, produce 5 tangible artifacts, and culminate in an assessed work product that earns the AiBI-P credential.

## v1 Requirements

### Course Shell (SHELL)

- [ ] **SHELL-01**: Learner sees a course overview page at `/courses/aibi-p` showing the four pillars (Awareness, Understanding, Creation, Application) with pillar-specific color coding (Sage, Cobalt, Amber, Terra)
- [ ] **SHELL-02**: Learner sees the 9-module map with module numbers, titles, pillar assignments, estimated times, and key outputs
- [ ] **SHELL-03**: Learner navigates via a persistent left sidebar showing all modules grouped by pillar, with current module highlighted and completed modules marked with a check
- [ ] **SHELL-04**: Learner cannot skip ahead — modules are locked until the preceding module is completed (forward-only progression)
- [ ] **SHELL-05**: Forward-only progression is enforced server-side (API verifies all prior modules complete before writing a new completion), not just UI-disabled buttons
- [ ] **SHELL-06**: Learner can leave mid-module and return to exactly where they left off, including mid-activity (resume functionality)
- [ ] **SHELL-07**: Course progress is persisted to Supabase on every module completion (not sessionStorage — course spans hours, iOS kills backgrounded tabs)
- [ ] **SHELL-08**: Learner sees a progress indicator showing module-level completion (9 steps)
- [ ] **SHELL-09**: Course pages are fully responsive and completable on iPhone Safari without horizontal scrolling, minimum 14pt font on 390px viewport
- [ ] **SHELL-10**: Course shell converts existing HTML mockups from `content/courses/AiBI-P v1/stitch_ai_banking_institute_course/` into Next.js components matching the established design language
- [ ] **SHELL-11**: Module header bands are color-coded by pillar (Sage/Awareness, Cobalt/Understanding, Amber/Creation, Terra/Application)
- [ ] **SHELL-12**: Course is inaccessible to non-enrolled users (paywall functional — redirects to purchase page)

### Onboarding Branch (ONBD)

- [ ] **ONBD-01**: At enrollment, before Module 1, learner answers three survey questions: (1) Does your institution use Microsoft 365? (Yes/No/Not sure), (2) Do you have personal AI subscriptions? (Yes, select which / No, just free / None), (3) What is your primary role? (Lending/Operations/Compliance/Finance/Marketing/IT/Retail/Executive/Other)
- [ ] **ONBD-02**: Onboarding answers are saved to learner profile in Supabase
- [ ] **ONBD-03**: Onboarding answers route platform-specific content throughout the course (M365 users see Copilot activation path in M3; ChatGPT subscribers see ChatGPT content first; role determines which feature spotlights and automation examples are highlighted)
- [ ] **ONBD-04**: Learner can update their onboarding answers at any time from profile settings
- [ ] **ONBD-05**: Onboarding survey UI matches the HTML mockup in `aibi_p_refined_onboarding/`

### Module 1 — The Regulatory Landscape (M1)

- [ ] **M1-01**: Module displays the regulatory landscape content: opening frame (regulatory environment through 2026), AIEOG AI Lexicon context, five regulatory frameworks table (SR 11-7, Interagency TPRM Guidance, ECOA/Reg B, BSA/AML, AIEOG AI Lexicon) with columns: Framework, What It Is, How It Applies to AI, Staff-Level Impact
- [ ] **M1-02**: Module explains the AI use case inventory concept using the AIEOG definition, plain-language translation, and staff implication
- [ ] **M1-03**: Module presents the governed vs. ungoverned AI frame
- [ ] **M1-04**: Activity 1.1 — Regulatory Cheatsheet: learner answers two free-text questions (minimum 20 characters each): (1) Which framework is most relevant to your role? (2) What would you want your manager to know about AI governance?
- [ ] **M1-05**: Activity 1.1 submission triggers the Regulatory Cheatsheet PDF download (one-page PDF: front has 5 frameworks with staff-level implications, back has AIEOG vocabulary; date-stamped, version-controlled)
- [ ] **M1-06**: Module does not advance until Activity 1.1 is submitted
- [ ] **M1-07**: Module content and UI match the HTML mockup in `m1_refined_regulatory_landscape/`

### Module 2 — The Tools Landscape + Onboarding Branch (M2)

- [ ] **M2-01**: Module displays the complete tools landscape table: 7 platforms (ChatGPT, Claude, Microsoft Copilot, Google Gemini, NotebookLM, Perplexity, Microsoft Copilot in M365) with columns: Platform, Type, Primary Strength, Free Tier?, Paid Tier
- [ ] **M2-02**: Module includes a "Tools out of scope" section noting Replit, Lovable, Bolt.new, Claude Code as deferred to AiBI-S
- [ ] **M2-03**: Module explains onboarding branch platform routing — content sequencing is personalized based on onboarding answers, but all platforms are covered regardless
- [ ] **M2-04**: Activity 2.1 — Subscription Inventory: form with one row per platform, three-option radio buttons (Have access / No access / Not sure)
- [ ] **M2-05**: Subscription inventory submission routes subsequent platform content based on responses
- [ ] **M2-06**: Module advances after inventory submission
- [ ] **M2-07**: Module content and UI match the HTML mockup in `m2_the_expanded_ai_ecosystem/`

### Module 3 — What You Already Have + Activation (M3)

- [ ] **M3-01**: Module displays M365 Copilot activation path (shown to learners who answered Yes to M365 in onboarding): table with M365 plan tiers (Business Basic, Business Standard/Premium, Copilot 365 add-on) and what Copilot is available in each
- [ ] **M3-02**: Module includes data protection note about M365 Copilot (contractual protection, not technical — IT/compliance should confirm plan tier)
- [ ] **M3-03**: Module displays free vs. paid tier comparison: what changes on paid (rate limits, model access, context window, data protections, persistent custom instructions)
- [ ] **M3-04**: Module includes institutional licensing guidance (don't use personal accounts for sensitive work; ask IT about approved tools)
- [ ] **M3-05**: Activity 3.1 — Your First Open: learner opens an AI tool, types the specified greeting, spends 5 minutes exploring, answers one free-text question about a feature they didn't know existed
- [ ] **M3-06**: Module content and UI match the HTML mockup in `m3_what_you_already_have_activation/`

### Module 4 — Platform Features Deep Dive (M4)

- [ ] **M4-01**: Module displays feature coverage table across platforms: 8 features (Deep Research, Web Search, File Upload, Voice Mode, Custom Instructions/Skills, Memory, Image/Document Generation, NotebookLM, Perplexity) with columns: Feature, What It Does, Which Platforms, Banking Use Case
- [ ] **M4-02**: Module displays one of six role-specific feature spotlights based on onboarding role selection (Lending, Operations, Compliance, Marketing, Finance/Accounting, IT/Executive) — relevant one highlighted, all accessible
- [ ] **M4-03**: Activity 4.1 — Feature Discovery: learner picks one unused feature, tries it, writes two sentences about what they tried and what surprised them
- [ ] **M4-04**: On module completion, Platform Feature Reference Card artifact is triggered for download (one-page PDF: all six platforms, key features, paid tier requirements, role relevance)
- [ ] **M4-05**: Module content and UI match the HTML mockup in `m4_platform_features_deep_dive/`

### Module 5 — Safe Use + The Six Failure Patterns (M5)

- [ ] **M5-01**: Module opens with the Shadow AI opening script (verbatim from PRD — "Before we talk about what you should do...")
- [ ] **M5-02**: Module displays the three-tier data classification table: Tier 1 (Never in any AI tool — member PII, MNPI, exam findings, SAR info, proprietary credit policy), Tier 2 (Enterprise-licensed tools only — operational workflows, internal drafts, meeting summaries, templates), Tier 3 (Any tool — public research, personal productivity, templates, learning)
- [ ] **M5-03**: Module displays the six banking hallucination patterns, each with: pattern name, banking example, why dangerous, the defense. Patterns: (1) Regulatory Citation Fabrication, (2) Financial Ratio Confabulation, (3) Credit Policy Hallucination, (4) Temporal Regulatory Confusion, (5) SAR Narrative Overreach, (6) Fabricated Precedent
- [ ] **M5-04**: Activity 5.1 — The 20-Second Classification Drill: 20 work scenarios presented one at a time, learner classifies each as Tier 1/2/3, timed, score shown after completion, incorrect classifications show correct answer with one-sentence explanation
- [ ] **M5-05**: Activity 5.2 — Build Your Acceptable Use Card: learner answers four questions for their role: (1) Which AI tools am I authorized to use? (2) What data is safe per tool by tier? (3) What do I do when unsure? (4) Who is my point of contact?
- [ ] **M5-06**: Activity 5.2 completion triggers dynamic PDF generation of personalized Acceptable Use Card (single-page PDF, personalized to learner's role, downloadable and printable)
- [ ] **M5-07**: Module content and UI match the HTML mockup in `m5_refined_safe_use_guardrails/`

### Module 6 — Anatomy of a Skill (M6)

- [ ] **M6-01**: Module explains what a skill is using three mental models (standing order, trained colleague, smart template) with plain language and why-it-matters columns
- [ ] **M6-02**: Module explains skills are cross-platform (text file, not a feature) and shows where skills live in each platform (ChatGPT, Claude, Microsoft Copilot, Gemini, Perplexity) with table
- [ ] **M6-03**: Module presents the anatomy of a good skill — five components (Role, Context, Task, Format, Constraint) with "What It Does", "What Bad Looks Like", and "What Good Looks Like" columns per component
- [ ] **M6-04**: Module includes good skills vs mediocre skills comparison across dimensions (Specificity, Constraints, Format, Testing, Portability)
- [ ] **M6-05**: Activity 6.1 — Three-Skill Diagnosis: learner evaluates three example skills (poor, mediocre, strong) and identifies which component is weakest and what would fix it
- [ ] **M6-06**: On module completion, Skill Template Library artifact is triggered for download (formatted PDF + five .md skill starter files: Meeting Summary, Regulatory Research, Loan Pipeline, Exception Report, Marketing Content)
- [ ] **M6-07**: Module content and UI match the HTML mockup in `m6_anatomy_of_a_skill/`

### Module 7 — Write Your First Skill (M7)

- [ ] **M7-01**: Module presents the skill builder interface with five labeled component fields (Role, Context, Task, Format, Constraint)
- [ ] **M7-02**: Each field has placeholder text showing a role-specific banking example based on onboarding role selection
- [ ] **M7-03**: Skill builder includes five role-specific skill starters (reviewed and validated against actual banking workflows per PRD)
- [ ] **M7-04**: Activity 7.1 — Write Your First Skill: learner completes all five component fields to create their first skill
- [ ] **M7-05**: On Activity 7.1 completion, learner's skill is saved and downloadable as a .md file (named using format: [Role]-[Task]-Skill-v1.md)
- [ ] **M7-06**: Learner can download their skill .md file at any time post-completion (My First Skill artifact)
- [ ] **M7-07**: Module introduces the one-change iteration rule (change one variable at a time, test, observe)
- [ ] **M7-08**: Module content and UI match the HTML mockup in `m7_refined_skill_builder/`

### Module 8 — Test, Iterate, and Share (M8)

- [ ] **M8-01**: Module presents the iteration protocol — structured approach to testing and refining skills
- [ ] **M8-02**: Module explains skill portability across platforms
- [ ] **M8-03**: Module presents the Margin of Error Progression framework (Personal → Team → Institution → Customer-facing) with level, margin of error, who is affected, and AiBI course mapping
- [ ] **M8-04**: Activity 8.1 — Iterate and Save: learner runs their M7 skill three more times with different inputs, applies one-change rule per iteration, saves final skill as .md file, writes three sentences about what changed and what a colleague should know
- [ ] **M8-05**: Module content and UI match the HTML mockup in `m8_test_iterate_share/`

### Module 9 — Automate 1-3 Real Tasks (M9)

- [ ] **M9-01**: Module presents the Automation Identification Framework — three screening questions: (1) Do I do it repeatedly in a consistent pattern? (2) Does it take more time than it should, mostly producing output not thinking? (3) Does the output need to be consistent every time?
- [ ] **M9-02**: Module displays role-specific automation examples table with three tiers per role (Lending, Operations, Compliance, Finance, Marketing): Tier 1 (easiest), Tier 2 (more value), Tier 3 (highest value, requires iteration)
- [ ] **M9-03**: Module reinforces the Quality Standard: "If you submitted this output to your supervisor without mentioning AI was involved, would anyone push back on the substance?"
- [ ] **M9-04**: Module content and UI match the HTML mockup in `m9_final_capstone_submission/`

### Assessed Work Product (WORK)

- [ ] **WORK-01**: Learner submits a 4-item work product package: (1) the skill file (.md or plain text with all 5 components labeled), (2) the input used (redacted of sensitive data with [REDACTED]), (3) the raw AI output (unedited), (4) the final edited output plus 4-6 sentence annotation covering hallucination patterns found, what was verified, one improvement for next iteration
- [ ] **WORK-02**: Submission form includes file upload for skill .md, text fields for input/raw output/edited output/annotation
- [ ] **WORK-03**: File uploads use Supabase presigned URLs (client uploads directly to Supabase Storage, not through Next.js API route — Vercel 4.5MB body limit)
- [ ] **WORK-04**: Submission cannot proceed unless all four items are provided
- [ ] **WORK-05**: Learner receives a completion email on submission with confirmation and expected review timeline

### Reviewer Queue (REVW)

- [ ] **REVW-01**: Reviewer dashboard displays submitted work products in a queue ordered by submission date
- [ ] **REVW-02**: Reviewer scores each submission across 5 dimensions (Accuracy, Completeness, Tone and Voice, Judgment, Skill Quality) on a 1-4 scale per the PRD rubric
- [ ] **REVW-03**: A score of 1 on Accuracy automatically fails the submission regardless of total score (hard gate)
- [ ] **REVW-04**: Passing score is 14 or above (out of 20) with minimum 3 on Accuracy
- [ ] **REVW-05**: On initial failure, learner receives written feedback identifying specific dimensions that fell short and actionable guidance
- [ ] **REVW-06**: One resubmission is permitted per learner; resubmissions reviewed within five business days
- [ ] **REVW-07**: Reviewer is any certified AiBI-S or AiBI-L holder; reviewers calibrated using shared anchor submissions (one per score level per dimension); new reviewers must score five anchor submissions within one point before reviewing live submissions
- [ ] **REVW-08**: Reviewer approval triggers certificate issuance flow

### Certificate and Verification (CERT)

- [ ] **CERT-01**: Certificate awarded when: all 9 modules completed, work product submitted, rubric score >= 14 with Accuracy >= 3
- [ ] **CERT-02**: Certificate displays: recipient name (Cormorant serif 28pt), designation "AiBI-P -- Banking AI Practitioner" (Cormorant SC 18pt), issuing institution (Cormorant SC 14pt), date issued (DM Mono 12pt), certificate ID (DM Mono 10pt), verification URL (DM Mono 10pt), assessment note "Assessed by skill submission and work product -- not a test score" (DM Sans italic 10pt), AiBI circular seal watermark at 8% opacity
- [ ] **CERT-03**: Certificate PDF delivered to learner email within 24 hours of reviewer approval
- [ ] **CERT-04**: Certificate design matches the HTML mockup in `aibi_p_official_certificate/`
- [ ] **CERT-05**: Verification page at `/verify/[certificateID]` returns: holder name, designation, date issued, issuing institution — no additional personal data exposed
- [ ] **CERT-06**: Certificate ID is a unique alphanumeric identifier

### Downloadable Artifacts (ARTF)

- [ ] **ARTF-01**: Regulatory Cheatsheet: one-page PDF, date-stamped, version-controlled. Front: five frameworks with staff-level implications. Back: AIEOG vocabulary. Triggered after Activity 1.1. Design standard: terracotta/parchment color system, Cormorant serif, AiBI mark watermark, AIBankingInstitute.com footer, version number and date.
- [ ] **ARTF-02**: Acceptable Use Card: single-page dynamic PDF generated from Activity 5.2 responses, personalized to learner's role, downloadable and printable. Generated via `@react-pdf/renderer` in API route.
- [ ] **ARTF-03**: Skill Template Library: formatted PDF + five .md skill starter files (Meeting Summary, Regulatory Research, Loan Pipeline, Exception Report, Marketing Content). Triggered on M6 completion.
- [ ] **ARTF-04**: My First Skill: learner's own completed skill from Activity 7.1, saved and downloadable as .md file at any time post-completion.
- [ ] **ARTF-05**: Platform Feature Reference Card: one-page PDF. All six platforms, key features, paid tier requirements, role relevance. Triggered on M4 completion.
- [ ] **ARTF-06**: All artifacts are designed to be forwarded — professional enough to share with board members or include in staff onboarding materials.

### Stripe Checkout and Enrollment (PAY)

- [ ] **PAY-01**: Stripe Checkout Session for $79 individual purchase
- [ ] **PAY-02**: Institution bundle pricing: ~$63/seat (20% off) at 5+ seats purchased together
- [ ] **PAY-03**: Once an institution has purchased at institution tier, discount persists for all future AiBI-P purchases (they don't need to hit 5 seats again)
- [ ] **PAY-04**: On `payment.success` webhook: write enrollment to Supabase `course_enrollments` table, grant course access
- [ ] **PAY-05**: Institution enrollment model includes `institution_enrollments` table with `seats_purchased` and `seats_used` for per-learner tracking

### Assessment Upgrade (ASMT)

- [ ] **ASMT-01**: Free assessment expanded from 8 fixed questions to 12 questions per session, rotating from a pool of 40-50 questions
- [ ] **ASMT-02**: Rotation logic: at least one question per each of the 8 core dimensions, 4 questions randomly distributed across dimensions
- [ ] **ASMT-03**: The 8 dimensions: (1) Current AI Usage, (2) Experimentation Culture, (3) AI Literacy Level, (4) Quick Win Potential, (5) Leadership Buy-In, (6) Security Posture, (7) Training Infrastructure, (8) Builder Potential
- [ ] **ASMT-04**: Score range updated to 12-48 (12 questions x 4 points max)
- [ ] **ASMT-05**: Updated tier boundaries: Starting Point (12-22), Early Stage (23-32), Building Momentum (33-40), Ready to Scale (41-48)
- [ ] **ASMT-06**: Score and tier label visible immediately after submission without email gate (per PRD Section 3.3 CRITICAL note)
- [ ] **ASMT-07**: Email requested for detailed dimension breakdown and personalized roadmap
- [ ] **ASMT-08**: Tier routing: Starting Point/Early Stage → primary CTA is AiBI-P $79; Building Momentum/Ready to Scale → primary CTA is Executive Briefing
- [ ] **ASMT-09**: No back navigation — once answered, a question cannot be changed
- [ ] **ASMT-10**: Progress indicator visible throughout ("Question 4 of 12")
- [ ] **ASMT-11**: Assessment content lives in `/content/assessments/v2/` following existing versioned content architecture

### Content Architecture (CONT)

- [ ] **CONT-01**: All module content lives in `/content/courses/aibi-p/` — not hardcoded in .tsx component files
- [ ] **CONT-02**: Content structure is Kajabi-migration-ready: module content can be extracted and migrated without rebuilding
- [ ] **CONT-03**: Content references existing HTML mockups from `content/courses/AiBI-P v1/stitch_ai_banking_institute_course/` as design source of truth
- [ ] **CONT-04**: Activity responses saved to learner profile in Supabase; activities cannot be re-submitted after advancing (except assessed work product resubmission)
- [ ] **CONT-05**: All free-text response fields have minimum character requirements as specified per activity in the PRD

### Database Schema (DB)

- [ ] **DB-01**: `course_enrollments` table extended with: `onboarding_answers` (jsonb), `completed_modules` (integer array or jsonb), `current_module` (integer), `enrolled_at` (timestamptz)
- [ ] **DB-02**: `activity_responses` table: id, enrollment_id, module_number, activity_id, response (jsonb), created_at
- [ ] **DB-03**: `work_submissions` table: id, enrollment_id, skill_file_url, input_text, raw_output_text, edited_output_text, annotation_text, submitted_at, reviewer_id, review_scores (jsonb), review_feedback (text), review_status (pending/approved/failed/resubmitted), reviewed_at
- [ ] **DB-04**: `certificates` table: id, enrollment_id, certificate_id (unique alphanumeric), holder_name, designation, issued_at
- [ ] **DB-05**: `institution_enrollments` table: id, institution_name, seats_purchased, seats_used, stripe_session_id, discount_locked (boolean), created_at
- [ ] **DB-06**: RLS policies on all new tables; wrap `auth.uid()` in SELECT for performance per CLAUDE.md pattern
- [ ] **DB-07**: Indexes on all policy columns and foreign keys

### Accessibility (A11Y)

- [ ] **A11Y-01**: All interactive activities operable by keyboard without mouse
- [ ] **A11Y-02**: Color is never the sole means of conveying information
- [ ] **A11Y-03**: All images and icons have descriptive alt text
- [ ] **A11Y-04**: Minimum color contrast ratio: 4.5:1 body text, 3:1 large text (WCAG 2.1 AA)
- [ ] **A11Y-05**: Skill file downloads work without JavaScript disabled
- [ ] **A11Y-06**: All video content (if used) has closed captions

### Pricing and Sales Funnel (FUNL)

- [ ] **FUNL-01**: Sales funnel flow: Free 12-question assessment ($0) → Score creates urgency → AiBI-P course ($79 individual) → Executive Briefing ($150-200, credited toward consulting)
- [ ] **FUNL-02**: Starting Point/Early Stage tier routing → primary CTA: AiBI-P $79. Building Momentum → primary CTA: Executive Briefing. Ready to Scale → primary CTA: Executive Briefing with note "You may be ready to skip to AiBI-S"
- [ ] **FUNL-03**: An individual who bought at $79 before institution tier: certificate is identical, no downgrade or refund required

## v2 Requirements (Deferred)

### Third-Party Integrations

- **INTG-01**: Accredible API integration for digital badge generation and LinkedIn sharing
- **INTG-02**: ConvertKit tags: `aibi-p-enrolled` on enrollment, `aibi-p-certified` on certificate issuance, Day 0/3/7 onboarding sequence
- **INTG-03**: HubSpot contact property updates: `course_enrolled`, `aibi_p_certified` with date
- **INTG-04**: 9 Plausible analytics events: course_enrolled, onboarding_completed, module_completed, artifact_downloaded, skill_saved, work_product_submitted, work_product_passed, work_product_failed, certificate_issued
- **INTG-05**: Completion email automation on all 9 modules complete + work product submitted

### Executive Briefing Deep Assessment

- **EXEC-01**: 30-40 question pre-work assessment sent automatically via Calendly on booking
- **EXEC-02**: Institutional Readiness Report PDF produced post-call from deep assessment data

### Kajabi Migration

- **LMS-01**: Migrate course content from Next.js to Kajabi LMS platform
- **LMS-02**: Zapier/Make automation: Stripe payment.success → Kajabi user creation + product access

## Out of Scope

| Feature | Reason |
|---------|--------|
| Video content per module | Wrong ROI for banking text content; PRD is text-first |
| Self-graded work product | Credential inflation destroys brand trust; human review is non-negotiable |
| Going back to change answers | Undermines "demonstrated capability" framing; prevents score inflation |
| Dark mode | Explicitly excluded per designer brief |
| Real-time chat | High complexity, not core to course value |
| Copilot Studio deployment | Enterprise feature beyond AiBI-P scope |
| AiBI-S / AiBI-L courses | Future milestones |
| Mobile native app | Web-first, mobile responsive |
| OAuth login | Email/password via Supabase Auth sufficient for v1 |


## Traceability

Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DB-01 | Phase 1 | Pending |
| DB-02 | Phase 1 | Pending |
| DB-03 | Phase 1 | Pending |
| DB-04 | Phase 1 | Pending |
| DB-05 | Phase 1 | Pending |
| DB-06 | Phase 1 | Pending |
| DB-07 | Phase 1 | Pending |
| CONT-01 | Phase 1 | Pending |
| CONT-02 | Phase 1 | Pending |
| CONT-03 | Phase 1 | Pending |
| CONT-04 | Phase 1 | Pending |
| CONT-05 | Phase 1 | Pending |
| SHELL-01 | Phase 2 | Pending |
| SHELL-02 | Phase 2 | Pending |
| SHELL-03 | Phase 2 | Pending |
| SHELL-04 | Phase 2 | Pending |
| SHELL-05 | Phase 2 | Pending |
| SHELL-06 | Phase 2 | Pending |
| SHELL-07 | Phase 2 | Pending |
| SHELL-08 | Phase 2 | Pending |
| SHELL-09 | Phase 2 | Pending |
| SHELL-10 | Phase 2 | Pending |
| SHELL-11 | Phase 2 | Pending |
| SHELL-12 | Phase 2 | Pending |
| ASMT-01 | Phase 2 | Pending |
| ASMT-02 | Phase 2 | Pending |
| ASMT-03 | Phase 2 | Pending |
| ASMT-04 | Phase 2 | Pending |
| ASMT-05 | Phase 2 | Pending |
| ASMT-06 | Phase 2 | Pending |
| ASMT-07 | Phase 2 | Pending |
| ASMT-08 | Phase 2 | Pending |
| ASMT-09 | Phase 2 | Pending |
| ASMT-10 | Phase 2 | Pending |
| ASMT-11 | Phase 2 | Pending |
| PAY-01 | Phase 3 | Pending |
| PAY-02 | Phase 3 | Pending |
| PAY-03 | Phase 3 | Pending |
| PAY-04 | Phase 3 | Pending |
| PAY-05 | Phase 3 | Pending |
| ONBD-01 | Phase 4 | Pending |
| ONBD-02 | Phase 4 | Pending |
| ONBD-03 | Phase 4 | Pending |
| ONBD-04 | Phase 4 | Pending |
| ONBD-05 | Phase 4 | Pending |
| M1-01 | Phase 5 | Pending |
| M1-02 | Phase 5 | Pending |
| M1-03 | Phase 5 | Pending |
| M1-04 | Phase 5 | Pending |
| M1-05 | Phase 5 | Pending |
| M1-06 | Phase 5 | Pending |
| M1-07 | Phase 5 | Pending |
| M2-01 | Phase 5 | Pending |
| M2-02 | Phase 5 | Pending |
| M2-03 | Phase 5 | Pending |
| M2-04 | Phase 5 | Pending |
| M2-05 | Phase 5 | Pending |
| M2-06 | Phase 5 | Pending |
| M2-07 | Phase 5 | Pending |
| M3-01 | Phase 5 | Pending |
| M3-02 | Phase 5 | Pending |
| M3-03 | Phase 5 | Pending |
| M3-04 | Phase 5 | Pending |
| M3-05 | Phase 5 | Pending |
| M3-06 | Phase 5 | Pending |
| M4-01 | Phase 5 | Pending |
| M4-02 | Phase 5 | Pending |
| M4-03 | Phase 5 | Pending |
| M4-04 | Phase 5 | Pending |
| M4-05 | Phase 5 | Pending |
| M5-01 | Phase 5 | Pending |
| M5-02 | Phase 5 | Pending |
| M5-03 | Phase 5 | Pending |
| M5-04 | Phase 5 | Pending |
| M5-05 | Phase 5 | Pending |
| M5-06 | Phase 5 | Pending |
| M5-07 | Phase 5 | Pending |
| ARTF-01 | Phase 5 | Pending |
| ARTF-02 | Phase 5 | Pending |
| ARTF-05 | Phase 5 | Pending |
| ARTF-06 | Phase 5 | Pending |
| A11Y-01 | Phase 5 | Pending |
| A11Y-02 | Phase 5 | Pending |
| A11Y-03 | Phase 5 | Pending |
| A11Y-04 | Phase 5 | Pending |
| A11Y-05 | Phase 5 | Pending |
| A11Y-06 | Phase 5 | Pending |
| FUNL-01 | Phase 5 | Pending |
| FUNL-02 | Phase 5 | Pending |
| FUNL-03 | Phase 5 | Pending |
| M6-01 | Phase 6 | Pending |
| M6-02 | Phase 6 | Pending |
| M6-03 | Phase 6 | Pending |
| M6-04 | Phase 6 | Pending |
| M6-05 | Phase 6 | Pending |
| M6-06 | Phase 6 | Pending |
| M6-07 | Phase 6 | Pending |
| M7-01 | Phase 6 | Pending |
| M7-02 | Phase 6 | Pending |
| M7-03 | Phase 6 | Pending |
| M7-04 | Phase 6 | Pending |
| M7-05 | Phase 6 | Pending |
| M7-06 | Phase 6 | Pending |
| M7-07 | Phase 6 | Pending |
| M7-08 | Phase 6 | Pending |
| M8-01 | Phase 6 | Pending |
| M8-02 | Phase 6 | Pending |
| M8-03 | Phase 6 | Pending |
| M8-04 | Phase 6 | Pending |
| M8-05 | Phase 6 | Pending |
| M9-01 | Phase 6 | Pending |
| M9-02 | Phase 6 | Pending |
| M9-03 | Phase 6 | Pending |
| M9-04 | Phase 6 | Pending |
| ARTF-03 | Phase 6 | Pending |
| ARTF-04 | Phase 6 | Pending |
| WORK-01 | Phase 7 | Pending |
| WORK-02 | Phase 7 | Pending |
| WORK-03 | Phase 7 | Pending |
| WORK-04 | Phase 7 | Pending |
| WORK-05 | Phase 7 | Pending |
| REVW-01 | Phase 7 | Pending |
| REVW-02 | Phase 7 | Pending |
| REVW-03 | Phase 7 | Pending |
| REVW-04 | Phase 7 | Pending |
| REVW-05 | Phase 7 | Pending |
| REVW-06 | Phase 7 | Pending |
| REVW-07 | Phase 7 | Pending |
| REVW-08 | Phase 7 | Pending |
| CERT-01 | Phase 8 | Pending |
| CERT-02 | Phase 8 | Pending |
| CERT-03 | Phase 8 | Pending |
| CERT-04 | Phase 8 | Pending |
| CERT-05 | Phase 8 | Pending |
| CERT-06 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 135 total
- Mapped to phases: 135
- Unmapped: 0

**Note:** Requirements file contained 135 v1 requirements. Instructions referenced 93; actual count from file is 135. All 135 mapped.

---
*Requirements defined: 2026-04-15*
*Last updated: 2026-04-15 — traceability populated by roadmapper*
