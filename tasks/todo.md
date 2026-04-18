# AiBI — Persistent To-Do / Backlog

Last updated: 2026-04-15

## Phase 1 — MVP Launch Gate

### Done (session 2026-04-15)

- [x] Repo scaffolded (Next.js 14, TS, Tailwind, App Router)
- [x] GitHub repo created: github.com/Gilmore3088/aibi-org (public)
- [x] Feature branch `feature/phase-1-prototype` pushed (28 commits)
- [x] `/assessment` with 8 questions + sessionStorage persistence
- [x] Score gating (tier label visible pre-email; score + breakdown post-email)
- [x] Tier-specific "Choose Your Next Step" cards on results page
- [x] "What your score means" personalized interpretation per tier
- [x] `/api/capture-email` stub (validates, logs, no-ops adapters)
- [x] `/api/subscribe-newsletter` and `/api/inquiry` stubs
- [x] Plausible deferred queue + custom events
- [x] Full 8-section homepage per PRD feedback (hero, pillars, three fears,
      widening gap, security band, ROI calculator, engagement tiers,
      certifications overview, final CTA band)
- [x] Hero A/B variant (centered default, `/?hero=split` for two-column)
- [x] `/services` with 3 tiers + monthly cadence + transformation scoreboard
- [x] `/certifications` with Choose Your Path, sample question, 3 tracks,
      inquiry form, enterprise CTA
- [x] `/certifications/exam/aibi-p` proficiency assessment — 40 banking-
      specific questions, randomized 12-question draws, proficiency levels
- [x] `/foundations` $97 course landing (inquiry flow, no Stripe)
- [x] `/security` standalone Pillar B with Safe AI Use Guide download form
- [x] `/about` founder story (placeholder bio to fill in)
- [x] `/resources` with Guides / Articles / Publications sections
- [x] `/resources/the-widening-ai-gap` (Evident AI Index data)
- [x] `/resources/members-will-switch` (Apiture consumer switching data)
- [x] `/dashboard` — tier-adaptive user dashboard with SVG radar chart,
      localStorage persistence, recommendations based on score
- [x] Custom SVG favicon + apple icon + OG image (programmatic)
- [x] robots.txt + sitemap.xml (auto-generated from routes)
- [x] Per-page SEO metadata on every route
- [x] 404 page + error boundary + global error
- [x] Cormorant SC font for labels/designations + DM Mono on all numbers
- [x] WCAG 2.1 AA contrast compliance (slate #6b6355 + dust #9b9085 tokens)
- [x] Skip-to-content link, focus rings, ARIA labels, reduced motion
- [x] Print stylesheet for assessment results PDF
- [x] Designer-brief-aligned: buttons uppercase 11px, cards 3px radius,
      sticky nav 97% opacity, card hover states, active:scale on buttons
- [x] Brand standard: "The AI Banking Institute" in prose, acronym for
      credentials only (AiBI-P/S/L, AiBI fCAIO)
- [x] Slogan: "Turning Bankers into Builders"
- [x] `.impeccable.md` design context (full design system reference)
- [x] CLAUDE.md decisions log (7 session decisions documented)
- [x] Build + typecheck green (21 routes, all under 111 kB first-load)

### Done (AiBI-P course milestone)

- [x] Assessment upgraded to v2 — 12 questions drawn from 48-question pool,
      8 dimensions, new scoring range 12–48
- [x] Full AiBI-P course built — 9 modules, in-module activities, skill
      builder exercises, and downloadable artifacts per module
- [x] Stripe checkout code ready — `/api/create-checkout` route and
      `/api/webhooks/stripe` handler with signature verification
- [x] Supabase schema created — 5 tables (`assessment_responses`,
      `course_enrollments`, `work_product_submissions`, `certificates`,
      `reviewer_queue`), RLS policies, and indexes
- [x] Supabase project linked and environment variables configured
- [x] Certificate generation built — programmatic PDF/page at `/certificates/[id]`
- [x] `/verify` endpoint built — public certificate verification by ID
- [x] Reviewer queue built — 5-dimension rubric, reviewer assignment, status
      tracking for work product grading
- [x] Work product submission built — presigned S3/Storage uploads,
      submission status page

### Done (session 2026-04-17)

- [x] `/courses` landing page — three-track hub for P/S/L with enrollment
      status, progress bars, pricing, prerequisite notes
- [x] Dashboard courses card + tier recommendations rewired to actual courses
- [x] Assessment next-step cards route to course pages (not /foundations)
- [x] Cross-course navigation — header "Courses" link, breadcrumbs on all
      3 course overview pages, JourneyBanner at P completion → S
- [x] Mobile navigation drawer — hamburger menu with slide-out, focus trap,
      Escape key, focus restoration (was completely missing)
- [x] Fixed broken /sign-in links in both EnrollButtons → /auth/login
- [x] A11Y hardening: MobileNav focus trap, EmailGate labels + aria,
      QuestionCard radio semantics, RadarChart sr-only data table,
      ProgressBar aria-label, semantic nav wrappers
- [x] --color-dust contrast fix — 254 occurrences replaced with --color-slate
      across 56 files for WCAG AA compliance
- [x] Design system normalization — added cobalt-pale/sage-pale CSS vars,
      fixed heading hierarchy (h1→h3 skip), spacing scale (p-10→p-12)
- [x] Homepage narrative reorder: problem→fears→framework→proof→ask
- [x] Homepage hero rewritten: "The big banks are spending billions..."
- [x] Pillar section: removed redundant A/B/C circles, numbered inline labels
- [x] AiBI-S: 3 new components (ActivityForm, WeekCompletionCTA, PromptCard)
- [x] AiBI-L: 2 new workshop tools (MaturityScorecard, ROI Calculator)
- [x] AI Practice Sandbox Phase 1 — Claude-only inline sandbox in Module 5
      with PII scanning, injection filtering, streaming, sample data,
      markdown rendering, message rate limiting

### Next session — "Polish & Parity" sprint

**Course UX parity (apply AiBI-P patterns to S and L):**

1. [ ] **Apply LearnSection to AiBI-S weeks** — replace WeekContent dump
       with collapsible accordion, mini TOC, reading time per section
2. [ ] **Apply LearnSection to AiBI-L sessions** — replace SectionBlock dump
       with same interactive format
3. [ ] **Compact sticky headers for AiBI-S/L** — match the AiBI-P module
       header pattern (single-row, sticky, cobalt/sage accent)
4. [ ] **Add key takeaways to all 9 AiBI-P modules** — 3-4 bullet "After
       this module" box at top of each Learn tab
5. [ ] **Add key takeaways to AiBI-S weeks and AiBI-L sessions**

**Content & media enhancements:**

6. [ ] **Regulatory framework table links** — make regulation names
       clickable to official sources (SR 11-7, ECOA, GLBA, etc.)
7. [ ] **MediaEmbed component** — placeholder for video, images, or
       interactive elements within Learn sections (ready for content)
8. [ ] **"Try this" callout boxes** — embedded in Learn content where
       theory meets practice, bridging to the Practice tab
9. [ ] **Module 2 ecosystem table** — further polish on the card grid

**Sandbox Phase 2 (multi-provider):**

10. [ ] **OpenAI adapter** — install SDK, wire into API route
11. [ ] **Gemini adapter** — install SDK, wire into API route
12. [ ] **Enable provider switching** — remove "Coming soon" from tabs
13. [ ] **Recharts integration** — render chart code blocks as visuals

**Sandbox Phase 3 (AiBI-S + AiBI-L exercises):**

14. [ ] **Build AiBI-S sandbox configs** — W1-W6 exercises (Dept Scanner,
        Workspace Architect, Automation Builder, Impact Calculator,
        Training Script Generator, Playbook Drafter)
15. [ ] **Build AiBI-L sandbox configs** — S1-S4 exercises (Maturity
        Sandbox, Policy Drafter, Financial Narrative, Board Q&A Simulator)
16. [ ] **Role-track sample data** — 5 variants per AiBI-S exercise

**Remaining from prior sessions:**

17. [ ] **Fill in founder bio** on `/about`
18. [ ] **Mobile QA on real iPhone Safari**
19. [ ] **Delete HeroSplit variant** — hero decision is made (static hero)
20. [ ] **Test full course flow with real Supabase auth**
21. [ ] **Supabase Auth setup** — signup/login flow
22. [ ] **Create work-products Storage bucket policies**

**External service wiring (when accounts are created):**

23. [ ] Sign up for Calendly → wire Executive Briefing links
24. [ ] Sign up for Plausible → wire analytics events
25. [ ] Sign up for ConvertKit or Loops → wire email capture
26. [ ] Sign up for HubSpot or Attio → wire CRM
27. [ ] Connect Vercel → deploy to AIBankingInstitute.com
28. [ ] DNS + SSL for AIBankingInstitute.com
29. [ ] Create Stripe products → wire Price IDs
30. [ ] Rate limiting on `/api/capture-email`

### Known prototype limitations

- Dashboard only works in the same browser (localStorage, not server-side)
  until Supabase Auth is wired
- "Request Executive Briefing" links go to placeholder Calendly URL
- Email capture logs to console, not to any database or CRM
- Newsletter subscribe is a no-op until ConvertKit/Loops is wired
- Safe AI Use Guide download form logs intent but doesn't deliver a PDF
- Course flow uses dev bypass (`SKIP_DEV_BYPASS`) — not tested with real auth
- Work-products Storage bucket has no RLS policies yet (upload will fail for
  real users)
- Stripe checkout code is built but no live Price IDs set; do not ship
  without provisioning path (CLAUDE.md rule)

## Phase 1.5 — Data loop (after first 50 respondents)

- [ ] Wire Supabase insert in `/api/capture-email` — persist every completion
- [ ] Admin route `/admin/assessments` — list completions, export CSV
- [ ] Compute aggregates: median score by tier, asset_size, charter type
- [ ] Add "sourced peer stat" teaser to TierPreview pre-email using real data
- [ ] Assessment results emailed to the user (needs email service wired)

## Phase 2 — Real peer benchmarks (needs ~200 respondents)

- [ ] "You ranked Nth percentile among peers" panel on results page
- [ ] Pre-email teaser: "Institutions your size typically score Y"
- [ ] Segment by core vendor, asset size, charter type (N >= 30 per segment)
- [ ] Opt-in "benchmark me quarterly" newsletter segment

## Phase 2 — Monetization (Stripe + Kajabi)

- [ ] Stripe checkout is code-complete — wire live Price IDs and test end-to-end
- [ ] Zapier/Make automation → Kajabi user provisioning on payment.success
- [ ] DO NOT ship checkout without provisioning path (CLAUDE.md rule)

## AI Practice Sandbox — Phase 2

Phase 1 shipped (2026-04-17): Claude-only sandbox in Module 5 with PII
scanning, injection filtering, sample data, and streaming.

- [ ] **OpenAI adapter** — `src/lib/sandbox/providers/openai.ts`, install
      `openai` SDK, wire into API route provider switch
- [ ] **Gemini adapter** — `src/lib/sandbox/providers/gemini.ts`, install
      `@google/generative-ai` SDK, wire into API route provider switch
- [ ] **Enable provider switching in UI** — remove "Coming soon" from
      ChatGPT/Gemini tabs, wire provider selection to API calls
- [ ] **Recharts integration** — install `recharts`, detect `chart` code
      blocks in AI responses, render as bar/pie/line charts styled to
      design system (sage/cobalt/terra, DM Mono labels)
- [ ] **PDF export on responses** — "Download as PDF" button on rich AI
      responses, client-side PDF generation from rendered output
- [ ] **Copy to clipboard** on individual AI responses (formatted markdown)
- [ ] **Production rate limiting** — move message counters from in-memory
      Map to Supabase or Redis; persist across server restarts
- [ ] **Production auth validation** — wire Supabase auth check in API
      route (currently dev bypass only)
- [ ] **Monthly spend monitoring** — track API costs per provider, alert
      at configurable threshold

## AI Practice Sandbox — Phase 3 (AiBI-S + AiBI-L Coverage)

AiBI-P sandbox is COMPLETE (all 9 modules shipped with exercises).

### AiBI-S Sandbox Exercises (6 weeks)

- [ ] **W1 Department Scanner** — load sample department workflow data,
      AI identifies top 5 automation candidates ranked by hours saved
- [ ] **W2 Workspace Architect** — learner describes dept tools/workflows,
      AI generates recommended AI workspace configuration
- [ ] **W3 Automation Builder** — load sample workflow (e.g., monthly
      exception report), build automation prompt with AI coaching
- [ ] **W4 Impact Calculator** — load before/after data, AI generates
      formatted ROI report with charts
- [ ] **W5 Training Script Generator** — describe team roles/comfort,
      AI drafts 30-min training script customized to department
- [ ] **W6 Playbook Drafter** — AI assembles complete department AI
      playbook: governed use cases, owners, measurement, escalation

### AiBI-L Sandbox Exercises (4 sessions)

- [ ] **S1 Maturity Sandbox** — after MaturityScorecard, ask AI "Given
      our maturity level, what should our 90-day priorities be?"
- [ ] **S2 Policy Drafter** — load governance framework outline, AI
      expands specific sections with examiner-ready language
- [ ] **S3 Financial Narrative** — after ROI Calculator, paste numbers,
      AI drafts the financial narrative for the board deck
- [ ] **S4 Board Q&A Simulator** — AI plays skeptical board member,
      learner practices answering, AI scores and suggests improvements

### Shared Infrastructure

- [ ] **Role-track-specific sample data** — Operations/Lending/Compliance/
      Finance/Retail variants for each AiBI-S exercise (5x datasets)
- [ ] **Sample document library** — vendor contracts, compliance policies,
      board memos, audit findings per role track
- [ ] **Contract analysis mode** — system prompt for vendor agreement review
- [ ] **Process automation mode** — system prompt for workflow analysis
- [ ] **Wire AiBI-S tabbed layout** — Learn/Practice/Apply tabs for weeks
- [ ] **Wire AiBI-L tabbed layout** — Learn/Practice/Apply tabs for sessions

### Remaining wiring from this session

- [ ] **Wire AiBI-S new components** — import ActivityForm, WeekCompletionCTA,
      PromptCard into week pages
- [ ] **Wire AiBI-L worksheets** — import MaturityScorecard into Session 1
      page, ROI Calculator into Session 3 page
- [ ] **Module 2 ecosystem table** — visual redesign (currently one big table)

## Backlog / Ideas

- [ ] Hero layout decision — `/?hero=split` built, needs side-by-side eval
- [ ] More exam questions — expand AiBI-P pool to 60-80; create pools for
      AiBI-S (per role track: Ops, Lending, Compliance, Finance, Retail)
      and AiBI-L
- [ ] AI Banking Brief newsletter — first issue from Evident/Apiture data
- [ ] Case studies section (needs real Quick Win Sprint clients)
- [ ] LinkedIn post templates (branded image templates per pillar)
- [ ] PowerPoint/Keynote master template for client deliverables
- [ ] Email signature template (HTML)
- [ ] Engagement report cover template (board-presentable)
- [ ] AiBI-P/S/L certificate design (print-ready PDF, per designer brief)
- [ ] Set up Accredible account for LinkedIn badge sharing (v2 — post-launch)

## Reference documents in /Plans/

| File | What it is |
|------|------------|
| `aibi-prd.html` | Product requirements, user flows, launch gate |
| `aibi-foundation-v3.html` | Brand identity, A-B-C framework, business model |
| `aibi-site-v3.html` | Full design system, page specs, components |
| `aibi-developer-spec.html` | Architecture, stack, assessment logic |
| `aibi-designer-brief.html` | Visual identity, color system, typography |
| `aibi-consultant-playbook.html` | Executive Briefing script, Quick Win methodology |
| `feedback-v1-aibi-landing-page-prd.docx` | V1 landing page PRD feedback |
| `EAI-Key-findings_2510-4.pdf` | Evident AI Index October 2025 |
| `AI Mastery Predictor Test...pdf` | GenAIPI competitor — results page UX |
| `AI Proficiency Certification...pdf` | GenAIPI competitor — cert page + dashboard |
| `AI Transformation System...pdf` | GenAIPI competitor — home page + engagement tiers |
| `exam/` | GenAIPI competitor — exam flow screenshots |
