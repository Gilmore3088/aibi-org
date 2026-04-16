# AiBI — Persistent To-Do / Backlog

Last updated: 2026-04-15

## Phase 1 — MVP Launch Gate

### Done (this session)

- [x] Repo scaffolded (Next.js 14, TS, Tailwind, App Router)
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
- [x] `/dashboard` — tier-adaptive user dashboard with radar chart,
      localStorage persistence, recommendations based on score
- [x] Custom SVG favicon + apple icon + OG image
- [x] robots.txt + sitemap.xml (auto-generated)
- [x] Per-page SEO metadata
- [x] 404 page + error boundary + global error
- [x] Cormorant SC font + DM Mono on all numbers
- [x] WCAG 2.1 AA contrast compliance (slate + dust tokens added)
- [x] Skip-to-content, focus rings, ARIA labels, reduced motion
- [x] Print stylesheet for assessment results PDF
- [x] Designer-brief-aligned: buttons uppercase 11px, cards 3px radius,
      sticky nav 97% opacity, card hover states, active:scale on buttons
- [x] Brand standard: full name in prose, acronym for credentials only
- [x] Slogan: "Turning Bankers into Builders"
- [x] `.impeccable.md` design context + CLAUDE.md decisions log
- [x] Build + typecheck green (21 routes)

### Not yet done (requires accounts or real-device testing)

- [ ] Manual mobile QA on real iPhone Safari (user's device)
- [ ] Fill in `[founder bio placeholder]` on `/about` (user's content)
- [ ] Sign up for Supabase — wire `src/lib/supabase` adapter
- [ ] Sign up for ConvertKit or Loops — wire newsletter + assessment sequences
- [ ] Sign up for HubSpot or Attio — wire CRM contact creation
- [ ] Set `NEXT_PUBLIC_CALENDLY_URL` with real Calendly link
- [ ] Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` with real Plausible domain
- [ ] Dashboard auth — replace localStorage with Supabase Auth + user table
      so dashboard works across devices (currently same-browser only)
- [ ] Rate limiting on `/api/capture-email` (Upstash or Vercel KV)
- [ ] DNS + SSL for AIBankingInstitute.com
- [ ] Vercel deployment connected to GitHub repo

## Phase 1.5 — Data loop (after first 50 respondents)

- [ ] Wire Supabase insert in `/api/capture-email`
- [ ] Admin route `/admin/assessments` — list completions, export CSV
- [ ] Compute aggregates: median score by tier, asset_size, charter type
- [ ] Add "sourced peer stat" teaser to TierPreview pre-email

## Phase 2 — Real peer benchmarks (needs ~200 respondents)

- [ ] "You ranked Nth percentile among peers" panel on results
- [ ] Segment by core vendor, asset size, charter type
- [ ] Opt-in "benchmark me quarterly" newsletter segment

## Phase 2 — Monetization (Stripe + Kajabi)

- [ ] Stripe Checkout for $97 AI Foundations
- [ ] Stripe Checkout for $295 AiBI-P
- [ ] `/api/webhooks/stripe` with signature verification
- [ ] Zapier/Make to Kajabi user provisioning
- [ ] DO NOT ship checkout without provisioning path (CLAUDE.md rule)

## Backlog / Ideas

- [ ] Hero left-aligned two-column variant — built as `/?hero=split`,
      needs side-by-side user evaluation before committing to one layout
- [ ] More exam questions — currently 40 for AiBI-P; need pools for
      AiBI-S (per track) and AiBI-L. Also expand AiBI-P pool to 60-80
      for better randomization variety.
- [ ] Downloadable branded PDF certificate (post-proficiency assessment)
- [ ] Assessment results emailed to the user (needs email service)
- [ ] AI Banking Brief newsletter — first issue from Evident/Apiture data
- [ ] About page founder bio completion
- [ ] Case studies section (needs real clients)
