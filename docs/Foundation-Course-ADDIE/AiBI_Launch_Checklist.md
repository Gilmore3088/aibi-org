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
- [ ] Create the code repo + project board; pick frontend framework (React).
- [ ] `[Supabase]` Create project; set up local dev + migrations workflow.
- [ ] `[Host]` Connect the live domain to the app host; HTTPS; staging + production environments.
- [ ] `[LLM]` Obtain API keys: Anthropic (default), OpenAI, Google; store as server-side secrets only.
- [ ] `[Stripe]` `[MailerLite]` Create accounts; generate API keys; secrets management (no keys in client code).
- [ ] Decide frontend host (`[Host]`) and confirm Stripe processor — the two remaining open items in the PRD.

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
- [ ] Write the 48 questions, mapped to 10+ readiness dimensions.
- [ ] Build the scoring model (questions → dimension scores).
- [ ] Build the four deliverables: dimensional scorecard, personalized plan, curated ideas + prompts, CTAs.
- [ ] Define the profile handoff (track, tool_exposure, comfort_level, dimension scores) → course.
- [ ] `[Stripe]` Gate the assessment behind the $99 purchase. `[MailerLite]` Deliver results + CTA emails.

## 3 · Controlled AI sandbox *(technical spine — build & validate early)* `[LLM]`
- [ ] Provider gateway: one interface fronting Claude (default) / OpenAI / Gemini; failover.
- [ ] Prompt assembler: hidden system prompt + fixed task scaffold + **bounded learner levers** (input-as-data only).
- [ ] Output gating: length caps, content screening, strip any system-prompt leakage.
- [ ] Injection resistance: learner text never treated as instruction; system prompt non-extractable; no tool access.
- [ ] Learner-facing provider switcher (the teachable "compare models" feature).
- [ ] Save-to-Toolbox hook (email- or entitlement-gated).
- [ ] Per-learner rate limits + cost caps + budget alerts.
- [ ] **Security test:** attempt injection / prompt-extraction / data-paste and confirm all fail.

## 4 · Web app build *(engineering)*
- [ ] Lesson player for all modalities (video/audio/interactive/sandbox/worksheet).
- [ ] Tier gating: M0–M3 free (no account to view), M4–M5 require paid entitlement.
- [ ] Role-track selection + branched-lesson rendering.
- [ ] The **three-way gate screen** after M3 (Pay / Email-to-keep / Decline).
- [ ] Toolbox UI: create, version, `.md` export; persistence requires email or paid account.
- [ ] Team admin dashboard: seat mgmt + progress + activity rollups (metadata only — never artifact content).
- [ ] Responsive layout; **WCAG 2.1 AA** (captions, transcripts, keyboard nav, contrast).

## 5 · Database & accounts `[Supabase]`
- [ ] Schema for all entities: Learner, Profile, Entitlement, Team, Seat, Module/Lesson, KnowledgeCheck/Result, SandboxSession, ToolboxItem, Lead, AssessmentResult, Event.
- [ ] Auth: email/password (user-set) + SSO/OAuth for existing accounts; **learners create their own accounts**.
- [ ] Row-level security so learners only ever see their own data.
- [ ] Storage buckets for media + exported artifacts.

## 6 · Payments & entitlements `[Stripe]` `[Supabase]`
- [ ] Create Stripe products/prices: Assessment **$99**, Individual **$295**, Team **$199/seat (min 10)**.
- [ ] Hosted checkout (no card data stored anywhere).
- [ ] Webhooks → write entitlements into Supabase on successful payment.
- [ ] Team flow: purchase N seats → issue invites → each invitee self-registers → seat → entitlement.
- [ ] `[Stripe]` Receipts; refund/cancel handling.

## 7 · Email & lifecycle `[MailerLite]` `[Supabase]` `[Stripe]`
- [ ] `[Supabase]` Auth emails (verify, password reset).
- [ ] `[MailerLite]` Gate email capture → write Lead in Supabase → sync to MailerLite list.
- [ ] `[MailerLite]` Nurture sequence: "not-yet" lead → value drip → $99 assessment CTA.
- [ ] `[MailerLite]` Team seat invitations + assessment results delivery.
- [ ] `[Stripe]` Purchase receipts.
- [ ] **Explicit marketing consent** at capture + working unsubscribe (compliance).
- [ ] Verify deliverability (domain auth: SPF/DKIM/DMARC for sending).

## 8 · Analytics & instrumentation `[Supabase]`
- [ ] Log events: lesson views/completions, knowledge-check results, sandbox runs, artifact saves/reuse, gate decisions.
- [ ] Funnel view: assessment → free → email/pay paths; **gate-fork distribution**; conversion rates.
- [ ] **Toolbox reuse** tracking (the headline behavior metric).
- [ ] Simple internal dashboard to read the above.

## 9 · Security, privacy & compliance
- [ ] Confirm **no PII / account data / customer data / MNPI** is collectable anywhere (sandbox bounded inputs verified in §3).
- [ ] Encryption at rest + in transit; secrets server-side only.
- [ ] Privacy Policy + Terms of Service published and linked.
- [ ] Data retention + deletion policy; learner export/delete request path.
- [ ] **Provider data-terms one-pager** for banking buyers (confirm current Anthropic/OpenAI/Google commercial terms before publishing).
- [ ] Accessibility audit (WCAG 2.1 AA) signed off.

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
