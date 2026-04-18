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

### Next session — immediate priorities

1. [ ] **Fill in founder bio** on `/about` — replace `[founder bio placeholder]`
       with real background, institutions served, personal story
2. [ ] **Mobile QA on real iPhone Safari** — full assessment in <3 minutes,
       all pages readable, touch targets, no horizontal scroll
3. [ ] **Decide hero layout** — visit `/?hero=split` vs `/` on desktop and
       mobile, pick one, delete the other
4. [ ] **Test full course flow with real Supabase auth** — set
       `SKIP_DEV_BYPASS=true`, run end-to-end from enrollment → module
       completion → work product submission → certificate generation
5. [ ] **Create work-products Storage bucket policies** — Supabase Storage
       RLS so enrolled users can upload, only reviewers can download
6. [ ] **Sign up for Calendly** → set `NEXT_PUBLIC_CALENDLY_URL` in .env.local
       → all "Request Executive Briefing" CTAs become real booking links
7. [ ] **Sign up for Plausible** → set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` → analytics
       go live on assessment_start, assessment_complete, email_captured events
8. [ ] **Sign up for ConvertKit or Loops** → wire `src/lib/convertkit/` adapter
       → assessment email capture + newsletter subscribe become real
9. [ ] **Sign up for HubSpot or Attio** → wire `src/lib/hubspot/` adapter →
       CRM contact creation on email capture + inquiry form
10. [ ] **Connect Vercel** to GitHub repo → deploy to AIBankingInstitute.com
11. [ ] **DNS + SSL** for AIBankingInstitute.com
12. [ ] **Create Stripe products** — $79 individual license and ~$63 institution
        bundle price → copy Price IDs into env vars
        (`STRIPE_FOUNDATIONS_PRICE_ID`, `STRIPE_PRACTITIONER_PRICE_ID`)
13. [ ] **Supabase Auth setup** — user signup/login flow (magic link or
        email/password), wire to `/dashboard` so it works across devices
14. [ ] **Rate limiting** on `/api/capture-email` — Upstash or Vercel KV,
        add the week before launch (zero traffic currently)

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

## AI Practice Sandbox — Phase 3 (Full Coverage)

- [ ] **Sandbox exercises for all AiBI-P modules** — add sandbox configs
      with module-specific system prompts, sample data, and suggested
      prompts for modules 2-4, 6-9
- [ ] **Role-track-specific sample data** — Operations/Lending/Compliance/
      Finance/Retail variants for each exercise (5x sample datasets)
- [ ] **AiBI-S sandbox exercises** — 6 weeks of department-manager-level
      exercises with cobalt accent and role-track filtering
- [ ] **AiBI-L workshop sandbox** — live facilitator-guided exercises
      using institution-specific data (pre-loaded from planning call)
- [ ] **Sample document library** — vendor contracts, compliance policies,
      board memos, audit findings, BSA/AML policies per role track
- [ ] **Contract analysis mode** — system prompt variant for analyzing
      vendor agreements, flagging risk clauses with severity ratings
- [ ] **Process automation mode** — system prompt variant for workflow
      analysis, identifying automation candidates, estimating ROI

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
