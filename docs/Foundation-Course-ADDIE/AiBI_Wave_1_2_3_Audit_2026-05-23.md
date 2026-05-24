# ADDIE Wave 1+2+3 Final e2e Drift + Thoroughness Audit
*Branch `feature/addie-v1` @ HEAD (`23d1f88`, 20 commits ahead of `main`). Audit conducted 2026-05-23 post-Wave-3c by an independent agent that cross-referenced the 8 ADDIE spec acceptance-gate sections + DECISIONS.md + all four operational trackers against the implemented code, migrations, and seeds.*

## Headline verdict
**Conditional GO for merge** — the rebuild is structurally complete, internally consistent, brand-clean, and far more thorough than the Wave 1 audit found. All 8 Sandbox §14 security tests still pass, all six modules (M0–M5) are seeded with lessons + variants + exercises + KC items, paywall gating fires on m4/m5, gate routing on m3.5 works, $99 assessment surface ships, team admin dashboard ships. **One real soft blocker** (auth route href mismatch — `/auth/sign-in` referenced from addie code, actual route is `/auth/login` / `/auth/signup`) plus the known bridge gap (`/assessment/in-depth` runner does not call the new addie persist endpoint). Neither breaks anything on `main`; both are pre-pilot fixes. Recommended to merge with the auth-href correction batched in.

## A. Spec acceptance gates roll-up
| Spec | Gates | Pass | Partial | Fail | Deferred (pre-pilot) |
|---|---|---|---|---|---|
| DB §12 | 10 | 10 | 0 | 0 | 0 (G9 closed Wave 1f) |
| Auth §12 | 13 | 8 | 2 | 0 | 3 |
| Sandbox §14 | 8 | 7 | 1 | 0 | 0 (global circuit breaker still untested per Wave 1) |
| Sandbox §15 | 8 | 8 | 0 | 0 | 0 (G4 reclassified Wave 1f) |
| Security §12 | 9 | 2 | 2 | 0 | 5 (privacy policy, /security page, /account/export+delete real impl, MailerLite unsub flip, pen-test) |

Auth partials: #2 anon→lead artifact migration is sequential not transactional (G6, slated for Wave 4); #10 MailerLite-unsubscribe → `leads.marketing_opt_in` webhook not wired.
Auth deferred: #7/#8 seat invite mismatched-email block path needs Resend signed-token template (MailerLite stub present); #13 `service_role` post-build grep not run.

## B. PRD §6 FR coverage (full set)
| FR | Description | Status | Evidence |
|---|---|---|---|
| FR-C1..C7 | Curriculum engine | ✅ | seeds m0..m5; modality dispatch in `LessonPlayer.tsx`; tier check `[lessonId]/page.tsx:236-238` |
| FR-S1..S9 | Sandbox blinders + A/B + skill + rate limits | ✅ | `sandbox-service/` + 8/8 §14 tests |
| FR-T1..T6 | Toolbox artifacts + 4-cap free + paid unlimited + .md export | ✅ | `src/lib/addie/toolbox/items.ts`; export route |
| FR-G1..G4 | Three-way gate + email consent + nurture CTA + analytics | ✅ | `GateScreen.tsx` + `capture-email/route.ts`; `gate_decision` emitted |
| FR-P1..P5 | Three Stripe products + team min-10 + hosted checkout + entitlement | ✅ | `products.ts` + three checkout routes; webhook writes entitlement + bindLeadToUser |
| FR-A1..A4 | 48-Q / 8-dim assessment + 4 deliverables + profile handoff | ⚠️ Partial | ADDIE side ships; profile handoff is the on-main runner's job (Wave 4 bridge) |
| FR-D1..D4 | Team admin + counts-only aggregates | ✅ | `/foundation/dashboard/team` reads `team_progress_v` |
| FR-U1..U3 | Free M0–M3 anon + identity for save + password/OAuth | ⚠️ Partial | M0–M3 anon flow works; two addie pages link to non-existent `/auth/sign-in` |
| FR-N1..N3 | Supabase event log + funnel + Toolbox reuse | ⚠️ Partial | Server-side emits comprehensive; lesson-player UI emits missing |

## C. Module acceptance per AiBI_Module_PRDs.md
- **M0** ✅ all FR-M0-1..4 shipped: TrackPicker + OffLimitsSorter (×5 tracks) + 2 toolbox templates + 6 KC items.
- **M1** ✅ all FR-M1-1..4: ToolLandscapeMatrix + 5 m1.3 variants + AI Toolkit Map template + 10 KCs.
- **M2** ✅ all FR-M2-1..3: `m2-3-first-conversation` real LLM exercise; WhereAIFitsWorksheet ×5; First Conversation save.
- **M3** ✅ all FR-M3-1..6: `m3-2-ab-output` (ab mode) + `m3-5-real-use-cases` (single, role lever drives 5-track conditional directives) + SpotTheViolation (12 scenarios) + Starter Prompt Pack + gate wired on m3.5 completion.
- **M4** ✅ all FR-M4-1..5: SkillBuilder + SkillTester; `m4-3-role-skill` track_defaults; guardrail-check; paid gate enforced; 5 m4.3 variants.
- **M5** ✅ all FR-M5-1..6: ProblemFrame + PRDBuilder (≥6 of 9 sections) + PrototypeLauncher (Lovable/Replit/Claude Code/v0) + 4 templates.

**13 exercises:** 3 real LLM (m2.3, m3.2, m3.5 — canary + hardened preamble) + 10 non-LLM marker. Matches spec.

## D. Locked-decision audit
All 8 locked decisions in DECISIONS.md 2026-05-23 verified in code:
- `addie.*` schema isolation ✅
- Sandbox in `sandbox-service/` Vercel Functions ✅
- 8 dimensions (not 10+) ✅ (mirrored across `dimensions.ts`, `persist.ts`, `DimensionScorecard.tsx`)
- Team SKU one-time, no `customer.subscription.*` ✅
- `STRIPE_ADDIE_WEBHOOK_SECRET` preferred ✅
- Team-seat price fallback chain ✅
- No credential / no certificate ✅ (0 imports of `src/lib/certificates/` from addie code)
- `(addie)` route group + `/api/addie/*` + `/api/sandbox/*` namespace ✅ (`/courses/foundation/program` untouched)

## E. Tracker integrity
- **Module Production Tracker** — every `[x]` claim verified against code; ticks distinguish *built* from *media-pending*; honest.
- **Launch Checklist** — §0 / §3 / §5 / §6 / §7 / §8 partials accurate; pre-pilot items honestly open.
- **Handoff Docs Checklist** — every closure verified; open P2 items genuinely pending.
- **Start_Here.md §7** — ⚠️ STALE: reads "post-Wave 1, ready for Wave 2" at 17 commits, reality is post-Wave 3c at 20 commits. Doc drift, not code drift.

## F. Screen inventory coverage (~45 screens)
- **Shipped (~22):** course landing, module index, lesson player (all 7 modality views), gate, learner dashboard, team admin dashboard, Toolbox list + item view, assessment list + result view, account + export + delete stubs, ToolboxDrawer, KnowledgeCheck inline.
- **Partial:** Sandbox single-run UI uses generic flows for rate-limit / PII pre-flight; Toolbox drawer cap-warning state not visibly distinct; no explicit reduced-motion fallback noted.
- **Missing (deferred-correctly):** All Auth pages owned by main; marketing pages owned by main; system pages owned by main; checkout confirm/cancel/success owned by Stripe-hosted; account-deletion grace banner not built (matches 501 stub).

## G. Bridge gaps
1. **G-Bridge-1 (known):** on-main `/assessment/in-depth` runner doesn't POST to `/api/addie/assessment/results`. Wave 4. *Important, not blocker.*
2. **G-Bridge-2 (NEW):** Two `/auth/sign-in` href references in addie code; actual route is `/auth/login`. **Soft blocker — fix before merge.**
3. **G-Bridge-3 (NEW):** Lesson-player UI emits no analytics (`lesson_view`, `lesson_complete`, `artifact_save`, `toolbox_reuse`). Wave 4. *Important.*
4. **G-Bridge-4:** Resend signed-token invite template (MailerLite stub today). Pre-pilot.

## H. Brand / italics / banned-word grep
- 1 minor hit: "unlocked" in `PayOptionCard.tsx` (defensible past-participle but flaggable). Nice-to-fix.
- 0 italics in addie code (universal `font-style:normal!important` rule respected).
- 0 "AiBI-Practitioner" / "AiBI-P" / "Banking AI Practitioner" / "AiBI Foundations" residue.
- 0 imports from `src/lib/certificates/` anywhere in addie code.

## I. Findings + priorities
- **G2 auth href (soft blocker):** `src/app/(addie)/foundation/dashboard/team/page.tsx:51`, possibly `src/app/(addie)/account/page.tsx:66`. Fix: replace `/auth/sign-in` → `/auth/login`. 5 min.
- **Lesson analytics emits missing (important):** add `emit({action:'lesson_view'/'lesson_complete'/'artifact_save'/'toolbox_reuse', ...})` from LessonPlayer mount, NextLessonCTA click, SaveAsArtifactButton success branch. Wave 4.
- **Start_Here.md §7 doc drift (nice):** append post-Wave 3 paragraph; mark Wave 2+3 ✅.
- **"unlocked" word (nice):** rewrite PayOptionCard body line without the banned form.
- **On-main runner → /api/addie/assessment/results bridge (important):** Wave 4.
- **Auth §12 #10 MailerLite unsubscribe → leads.marketing_opt_in (pre-pilot):** Wave 4.

## J. Pre-merge punch list

**HARD blockers:** none.

**SOFT (fix before pilot or in immediate follow-up):**
- [ ] Fix `/auth/sign-in` href → `/auth/login` (5-min fix; landed alongside this audit doc).
- [ ] Wire `/assessment/in-depth` runner → POST `/api/addie/assessment/results` (Wave 4).
- [ ] Wire lesson-side analytics emits (Wave 4).
- [ ] Refresh `Start_Here.md §7` to post-Wave-3c (nice; landed alongside this audit doc).
- [ ] Replace "unlocked" in PayOptionCard (nice; landed alongside this audit doc).
- [ ] G6: make anon→lead artifact migration transactional.
- [ ] Resend signed-token invite template (pre-pilot).
- [ ] MailerLite unsubscribe → `leads.marketing_opt_in` webhook (pre-pilot).

**OPERATOR action (engineering can't do):**
- [ ] Record + edit + caption + transcribe ~13 videos + 2 audios + 5 m1.3 audio variants.
- [ ] Stripe live-mode price IDs (currently test mode).
- [ ] MailerLite assessment + nurture sequences authored.
- [ ] Privacy Policy + ToS published; `/security` posture page; vendor commercial-API data terms verified.
- [ ] Resolve employment / IP / conflict-of-interest position (Launch Checklist §10).
- [ ] Full A11y audit + iPhone Safari pass (pre-pilot per spec).

## K. Recommendation
**Merge it.** This is a clean, internally consistent rebuild. Twenty commits delivered a fully-isolated `addie.*` Postgres schema (18 migrations, no risk to live data on `main`), a security-hardened sandbox service with eight passing injection/leak tests, the entire free side (M0–M3) with role branching, the paid side (M4–M5) with paywall enforcement, the three-way gate, the team admin dashboard, the $99 assessment results surface, and Stripe + auth wiring that respects every locked decision. The tracker is honest about what's done vs. media-pending vs. operator work. The only real polish item before merge is the two broken `/auth/sign-in` links (5 minutes — landed in the same commit as this audit); after that the "Wave 4" punch list (assessment-runner bridge, lesson-side analytics, transactional invite template) can ship as a follow-up PR straight after merge. Nothing here lies to learners, leaks customer data, or breaks `main`. Pilot-readiness depends on operator-side work (videos, MailerLite sequences, privacy policy, A11y audit), but engineering's job on the rebuild is done.
