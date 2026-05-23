# AiBI Foundation — Zero-to-Launch Checklist

**How to use:** work top-to-bottom by workstream; the critical path below shows what blocks what. Tool tags `[Stripe] [Supabase] [MailerLite] [LLM] [Host]` mark where each tool does the work.

**Tooling map (the tools we're using):**
- **[Stripe]** — all payments + receipts.
- **[Supabase]** — Postgres database, learner auth (+ auth emails), file/media storage, event logging.
- **[MailerLite]** — all other email: gate confirmations, seat invites, assessment delivery, nurture sequences, marketing.
- **[LLM]** — Anthropic (default) + OpenAI + Google APIs for the sandbox. *(Not a business tool; required infra.)*
- **[Host]** — frontend hosting for the custom app (e.g. Vercel/Netlify); domain already live.

**Critical path:** lock design *(done)* → build sandbox + app scaffold + DB schema *(parallel)* → produce all content + build assessment *(parallel; video is the long pole)* → wire payments/email/analytics → QA → pilot → fix → launch.

---

## 0 · Setup & infrastructure
- [x] Code repo + project board; frontend framework chosen (Next.js 14 App Router on `main`; ADDIE on `feature/addie-v1`).
- [x] `[Supabase]` Project provisioned; migration workflow via `supabase db query --linked` (divergence-safe; see CLAUDE.md memory note).
- [x] `[Host]` `aibankinginstitute.com` live on Vercel; HTTPS; Preview-per-branch is the de facto staging (no separate staging env).
- [x] `[LLM]` API keys obtained for Anthropic / OpenAI / Google; server-side only (loaded inside `sandbox-service/` directory boundary).
- [x] `[Stripe]` `[MailerLite]` Accounts live; keys in Vercel + `.env.local`; addie-specific `STRIPE_ADDIE_WEBHOOK_SECRET` + `ANON_SESSION_COOKIE_SECRET` added 2026-05-23.
- [x] Frontend host = Vercel; Stripe = direct (hosted checkout). Locked in DECISIONS.md; no separate "processor" decision needed.

## 1 · Course content — design & production *(largest workstream; mostly net-new)*
- [ ] Confirm the locked design (ADDIE v2 + PRD) is the build spec.
- [ ] Storyboard & script all ~22 lessons (Hook → Teach → Do → Take → Check), all ≤15 min.
- [ ] Write the 5 role-track variants for the branched lessons (M1.3, M2.4, M3.5, M4.3).
- [ ] Write all knowledge checks (2–3 per lesson).
- [ ] Author the ~11 Toolbox takeaway templates (`.md`: Data Discipline Card → Problem Backlog).
- [ ] Produce ~12 video lessons: record, edit, **caption + transcript** each.
- [ ] Produce ~2 audio lessons + transcripts.
- [ ] Weave the data-discipline rule through M0/M1/M3 + every M4/M5 build.
- [ ] `[Supabase]` Store finished media/transcripts; map content to module/lesson/track records.

## 2 · The $99 Readiness Assessment *(can build in parallel — semi-standalone)*
- [ ] Write the 48 questions, mapped to 8 readiness dimensions.
- [ ] Build the scoring model (questions → dimension scores).
- [ ] Build the four deliverables: dimensional scorecard, personalized plan, curated ideas + prompts, CTAs.
- [ ] Define the profile handoff (track, tool_exposure, comfort_level, dimension scores) → course.
- [ ] `[Stripe]` Gate the assessment behind the $99 purchase. `[MailerLite]` Deliver results + CTA emails.

## 3 · Controlled AI sandbox *(technical spine — build & validate early)* `[LLM]`
*Build against the spec: `AiBI_Sandbox_Service_Tech_Spec.md` (build sequence §15, security gates §14). **Shipped Wave 1b + 1e (2026-05-23) at commits 13e0010 + 90d1f26.***

- [x] Provider gateway: `sandbox-service/src/gateway/{index,anthropic,openai,google}.ts` — one interface, one-shot failover, 10s timeout.
- [x] Prompt assembler with canary: `sandbox-service/src/exercises/assembler.ts` + `canary.ts` (`[[AIBI-SYS-7Q]]`).
- [x] Output gating: `sandbox-service/src/gate/pipeline.ts` — length cap → leak scan → safety screen → normalize.
- [x] Injection resistance: lever allowlist enforced; `<learner_data>` slot delimiter escaped; system prompt server-only.
- [x] Learner-facing provider switcher: `defaultProvider` + `allowProviderSwitch` on Exercise, dispatched in gateway.
- [x] Save-to-Toolbox hook (API): `addie.toolbox_items` insert path via `sandbox-service/src/handlers/run.ts`. UI ships Wave 2a.
- [x] Per-learner rate limits + cost caps + daily LLM-spend budget + per-provider circuit breaker: `sandbox-service/src/rateLimit/index.ts` + `observability/cost.ts` + `supabase/migrations/00052_addie_sandbox_spend.sql`.
- [x] **Security test:** all 8 Spec §14 acceptance tests pass — `sandbox-service/tests/security/*.test.ts` (injection-reveal, slot-close, lever allowlist, PII check, length cap, failover, anon rate limit, no-leakage payload).

## 4 · Web app build *(engineering)*
*Build against the specs: `AiBI_Technical_Design_Doc.md` (architecture + repo + API surface), `AiBI_Design_System_Spec.md` (UI kit), `AiBI_Screen_Inventory_Spec.md` (screens + flows + states).*

- [ ] Lesson player for all modalities (video/audio/interactive/sandbox/worksheet).
- [ ] Tier gating: M0–M3 free (no account to view), M4–M5 require paid entitlement.
- [ ] Role-track selection + branched-lesson rendering.
- [ ] The **three-way gate screen** after M3 (Pay / Email-to-keep / Decline).
- [ ] Toolbox UI: create, version, `.md` export; persistence requires email or paid account.
- [ ] Team admin dashboard: seat mgmt + progress + activity rollups (metadata only — never artifact content).
- [ ] Responsive layout; **WCAG 2.1 AA** (captions, transcripts, keyboard nav, contrast).

## 5 · Database & accounts `[Supabase]`
*Build against the spec: `AiBI_Database_Schema_RLS_Spec.md` (migration order §11, acceptance gates §12). **Schema + RLS shipped Wave 1a + 1c + 1f (2026-05-23) under `addie.*` per DECISIONS.md.***

- [x] Schema for all entities: 17 migrations (00037–00053), 19 `addie.*` tables — `addie.{leads, learner_profiles, teams, seats, modules, lessons, lesson_track_variants, entitlements, knowledge_checks, knowledge_check_results, assessment_results, toolbox_items, toolbox_item_versions, events, exercises, sandbox_sessions, stripe_events, pending_entitlements, sandbox_spend}` + `client_exercise_v` and `team_progress_v` views.
- [x] Auth: Supabase Auth (email/password + OAuth) — works out-of-the-box; `addie.learner_profiles` is auto-created via `trg_addie_create_learner_profile` on `auth.users` insert. **Learner-facing sign-up UI is Wave 2a.**
- [x] Row-level security: every `addie.*` table has RLS enabled with `(select auth.uid())` policies per spec §5; DB Spec §12 acceptance gates 1–10 pass (9 fixed Wave 1f via `bindLeadToUser` wiring).
- [x] Storage buckets: 3 created via `00053_addie_storage_buckets.sql` (`addie-course-media`, `addie-toolbox-exports`, `addie-assessment-deliverables`) + 4 RLS policies on `storage.objects`.

## 6 · Payments & entitlements `[Stripe]` `[Supabase]`
*Build against the spec: `AiBI_Auth_Entitlements_Spec.md` (gate fork §4, lead-bind §5, Stripe webhook §6, team seats §7, acceptance gates §12). **Webhook + checkout endpoints shipped Wave 1d + 1f (2026-05-23).***

- [x] Stripe products/prices live: $99 In-Depth (`STRIPE_INDEPTH_PRICE_ID`), $295 Foundation Individual (`STRIPE_FOUNDATION_PRICE_ID` / legacy `STRIPE_FOUNDATIONS_PRICE_ID`), $199/seat × min-10 Team (`STRIPE_FOUNDATIONS_INSTITUTION_PRICE_ID` — pre-existing). Two CLAUDE.md naming-rule renames applied 2026-05-23.
- [x] Hosted checkout: `src/lib/addie/stripe/checkout.ts` + `src/app/api/addie/checkout/{individual,team,assessment}/route.ts`. Server-side redirect; no client Stripe key. Team enforces N≥10.
- [x] Webhooks → entitlement writes: `src/app/api/addie/webhooks/stripe/route.ts` (path `/api/addie/webhooks/stripe`, separate from legacy). Wave 1f fixed the idempotency ledger column drift (G1) — `addie.stripe_events` insert now writes the correct schema. `bindLeadToUser` wired (G3).
- [ ] **Team flow UI**: invite endpoints exist (`/api/addie/team/seats/{invite,accept,revoke}`); admin dashboard UI + invitee accept flow ship Wave 3b. *(Seats are correctly created on invite, not at purchase — per design; see Wave 1 audit G2 reclassification.)*
- [x] `[Stripe]` Receipts (Stripe-managed); refund handling = `charge.refunded` → revoke entitlement by `stripe_session_id`.

## 7 · Email & lifecycle `[MailerLite]` `[Supabase]` `[Stripe]`
- [x] `[Supabase]` Auth emails (verify, password reset) — default Supabase Auth templates; no custom flow needed for Wave 1.
- [x] `[MailerLite]` Gate email capture → Lead → MailerLite sync: `src/app/api/addie/gate/capture-email/route.ts` + `src/lib/addie/leads/upsert.ts`; rate-limited 30/IP/hr. Anon→lead artifact migration via `migrateAnonToLead`.
- [ ] `[MailerLite]` Nurture sequence: "not-yet" lead → value drip → $99 assessment CTA. *(Sequence + drip authoring is operator work; gate fork emits `gate_decision=decline` event which the sequence will trigger on.)*
- [ ] `[MailerLite]` Team seat invitations + assessment results delivery — current `sendInvitation` is a MailerLite stub; spec wants Resend transactional with signed-token invite link. Ships Wave 2/3 with the team admin UI.
- [x] `[Stripe]` Purchase receipts — Stripe-managed; nothing to wire.
- [x] **Explicit marketing consent** at capture: `capture-email` route honors `marketing_opt_in` and propagates to MailerLite groups. Unsubscribe via MailerLite-managed link.
- [ ] Verify deliverability (SPF/DKIM/DMARC) — operator action; existing main domain already configured for Resend/MailerLite sending.

## 8 · Analytics & instrumentation `[Supabase]`
- [x] Events table + write helper: `addie.events` (bigserial PK, indexed on user/action/object/lead) + `src/lib/addie/events/emit.ts`. Wave 1 emit() call sites: `lead_created`, `gate_decision`, `entitlement_granted`, `pending_entitlement_created`, `seat_invited`, `seat_accepted`, `seat_revoked`, `sandbox_run` (via sandbox_sessions log), `lead_bound_to_user`. Lesson views/completions + artifact save/reuse + KC results emit Wave 2a.
- [ ] Funnel view + gate-fork distribution dashboard. Events are logged; dashboard reader ships Wave 3.
- [ ] **Toolbox reuse** tracking — emit point Wave 2a; reader Wave 3.
- [ ] Simple internal dashboard. Wave 3.

## 9 · Security, privacy & compliance
*Build against the spec: `AiBI_Security_Privacy_Spec.md` (test plan §4, honest posture §5, retention/deletion §8, pre-pilot gate §12).*

- [x] Confirm **no PII / account data / customer data / MNPI** is collectable anywhere — sandbox bounded inputs verified by §3 above + `piiCheck.ts` slot validator (test: `pii_input_check.test.ts`).
- [x] Encryption at rest + in transit; secrets server-side only — Supabase + Vercel defaults; `service_role` + LLM keys never leave server (sandbox-service/ + src/lib/addie/ are server-only).
- [ ] Privacy Policy + Terms of Service published and linked — pre-pilot operator work.
- [ ] Data retention + deletion policy; learner export/delete (`/account/export`, `/account/delete`) — Wave 2/3 UI + privacy-policy review.
- [ ] **Provider data-terms one-pager** for banking buyers — operator content work (Anthropic/OpenAI/Google commercial terms).
- [ ] Accessibility audit (WCAG 2.1 AA) signed off — Wave 2/3 after UI ships.

## 10 · Legal & business
- [ ] **Resolve the employment / conflict-of-interest position** with respect to your current employer before commercial sales to banks/credit unions (IP ownership, moonlighting, non-compete). This is the known pre-commercialization blocker — clear it first.
- [ ] Business entity / banking + tax setup for revenue.
- [ ] Confirm pricing, refund, and team-minimum (10-seat) terms in the ToS.

## 11 · QA, pilot & launch
- [ ] Full content QA: every lesson ≤15 min, every track branch renders, every takeaway saves.
- [ ] Flow QA: gate fork, email capture, `[Stripe]` test-mode purchases (all 3 products), entitlement unlock, team invites.
- [ ] Email QA: every `[MailerLite]`/`[Supabase]`/`[Stripe]` email fires and lands.
- [ ] Cross-browser + mobile responsive pass.
- [ ] **Pilot the complete course** with one friendly community bank / credit union.
- [ ] Collect formative feedback (Evaluation 5.1) → fix → re-verify.
- [ ] Go live: switch Stripe to live mode, analytics on, support inbox monitored.

## 12 · Marketing site & go-to-market
- [ ] Landing/marketing page on the live domain (positioning: "bankers into builders"; use the interactive-overview aesthetic).
- [ ] Pricing page (Assessment / Individual / Team).
- [ ] Funnel entry: free-course CTA + assessment CTA.
- [ ] FAQ + support contact; data-discipline reassurance for banking buyers.
- [ ] Launch announcement plan (email list, LinkedIn, any community-bank channels).

---

### Rough sequencing (parallel tracks)
1. **Now:** §0 infra, §5 schema, §3 sandbox — start immediately; sandbox is the riskiest piece.
2. **In parallel (long pole):** §1 content production (video) + §2 assessment.
3. **Once app scaffold exists:** §4 app, §6 payments, §7 email, §8 analytics.
4. **Before launch:** §9 + §10 (clear the employment blocker), then §11 QA + pilot.
5. **Launch:** §12 live, Stripe live mode, monitoring on.
