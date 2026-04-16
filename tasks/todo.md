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

### Next session — immediate priorities

1. [ ] **Fill in founder bio** on `/about` — replace `[founder bio placeholder]`
       with real background, institutions served, personal story
2. [ ] **Mobile QA on real iPhone Safari** — full assessment in <3 minutes,
       all pages readable, touch targets, no horizontal scroll
3. [ ] **Decide hero layout** — visit `/?hero=split` vs `/` on desktop and
       mobile, pick one, delete the other
4. [ ] **Sign up for Supabase** → wire `src/lib/supabase/client.ts` with real
       URL + keys → persist assessment results + exam results to database
5. [ ] **Wire dashboard auth** — replace localStorage with Supabase Auth so
       dashboard works across devices (magic link or email/password)
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
12. [ ] **Rate limiting** on `/api/capture-email` — Upstash or Vercel KV,
        add the week before launch (zero traffic currently)

### Known prototype limitations

- Dashboard only works in the same browser (localStorage, not server-side)
- "Request Executive Briefing" links go to placeholder Calendly URL
- Email capture logs to console, not to any database or CRM
- Newsletter subscribe is a no-op until ConvertKit/Loops is wired
- Safe AI Use Guide download form logs intent but doesn't deliver a PDF
- No user accounts / authentication
- No Stripe checkout (Phase 2)
- Assessment questions are still being refined (content in content/assessments/v1/)
- Proficiency exam is AiBI-P only (no AiBI-S or AiBI-L question pools yet)

## Phase 1.5 — Data loop (after first 50 respondents)

- [ ] Wire Supabase insert in `/api/capture-email` — persist every completion
- [ ] Admin route `/admin/assessments` — list completions, export CSV
- [ ] Compute aggregates: median score by tier, asset_size, charter type
- [ ] Add "sourced peer stat" teaser to TierPreview pre-email using real data
- [ ] Assessment results emailed to the user (needs email service wired)
- [ ] Downloadable branded PDF certificate (post-proficiency assessment)

## Phase 2 — Real peer benchmarks (needs ~200 respondents)

- [ ] "You ranked Nth percentile among peers" panel on results page
- [ ] Pre-email teaser: "Institutions your size typically score Y"
- [ ] Segment by core vendor, asset size, charter type (N >= 30 per segment)
- [ ] Opt-in "benchmark me quarterly" newsletter segment

## Phase 2 — Monetization (Stripe + Kajabi)

- [ ] Stripe Checkout for $97 AI Foundations
- [ ] Stripe Checkout for $295 AiBI-P
- [ ] `/api/webhooks/stripe` with signature verification
- [ ] Zapier/Make automation → Kajabi user provisioning
- [ ] DO NOT ship checkout without provisioning path (CLAUDE.md rule)

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
