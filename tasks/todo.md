# AiBI — Persistent To-Do / Backlog

Last updated: 2026-04-15

## Phase 1 — MVP Launch Gate (in progress)

See CLAUDE.md "MVP Launch Gate" checklist for the full list. Current state:

- [x] Repo scaffolded (Next.js 14, TS, Tailwind, App Router)
- [x] `/assessment` with 8 questions + sessionStorage persistence
- [x] Score gating (tier label visible pre-email; score + breakdown post-email)
- [x] `/api/capture-email` stub (validates, logs, no-ops adapters)
- [x] Plausible deferred queue + `assessment_start`/`complete`/`email_captured` events
- [x] Build + typecheck green
- [ ] Manual mobile QA on real iPhone Safari
- [ ] Home page copy review + styling pass
- [ ] `/services`, `/certifications` pages (inquiry form only for certifications)
- [ ] 404 page
- [ ] Sign up for ConvertKit (or Loops), HubSpot (or Attio), Supabase
- [ ] Wire `src/lib/convertkit`, `src/lib/hubspot`, `src/lib/supabase` adapters
- [ ] Rate limiting on `/api/capture-email` (Vercel KV or Upstash) — add week before launch
- [ ] Calendly Executive Briefing link — set `NEXT_PUBLIC_CALENDLY_URL`
- [ ] DNS + SSL for AIBankingInstitute.com
- [ ] Mobile QA: full assessment in <3 min on iPhone Safari

## Phase 1.5 — Data loop (after first 50 respondents)

- [ ] Wire Supabase insert in `/api/capture-email` — persist every completion
  (email, score, tier, answers, institution_name, asset_size, timestamp)
- [ ] Dashboard route `/admin/assessments` — simple auth, list completions,
  export CSV
- [ ] Compute aggregates: median score by tier, by asset_size, by charter type
- [ ] Add "sourced peer stat" teaser to TierPreview pre-email using existing
  CLAUDE.md-approved stats (Bank Director 2024, Gartner via Jack Henry, etc.)

## Phase 2 — Real peer benchmarks (pie in the sky — needs ~200 respondents)

Idea from session 2026-04-15: once there are enough completions to compute
honest percentiles, show respondents a "you rank Nth" panel on the results
page.

- [ ] "You ranked 50th percentile among Jack Henry clients" or similar peer
  segmentation (by core vendor, asset size, charter type)
- [ ] Pre-email teaser: "You're at tier X. Institutions your size typically
  score Y." — only once real aggregate exists and N is large enough to be
  meaningful (N >= 30 per segment is the floor)
- [ ] Percentile rank with interpretation: "The top 20% of community banks
  your size are in 'Building Momentum' or higher — here's what they do
  differently"
- [ ] Opt-in "benchmark me quarterly" newsletter segment

## Phase 2 — Monetization (Stripe + Kajabi)

- [ ] Stripe Checkout for $97 AI Foundations
- [ ] Stripe Checkout for $295 AiBI-P
- [ ] `/api/webhooks/stripe` with signature verification
- [ ] Zapier/Make → Kajabi user provisioning (DO NOT ship checkout without
  this path — CLAUDE.md rule)

## Notes

- Never add unsourced statistics to any user-facing copy (CLAUDE.md rule).
- Peer benchmarks are the highest-leverage Phase 2 feature — they turn the
  assessment into a returning user loop (annual re-benchmarking).
