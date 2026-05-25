# AiBI Foundation — Module Production Tracker
*Per-module curriculum build needs. The companion to the launch checklist.*

**How the docs fit together:**
- **Launch Checklist** → cross-cutting workstreams (infra, payments, email, security, GTM).
- **This tracker** → what every module/lesson needs to be *produced*, with status.
- **Detailed curriculum docs** (one per module, e.g. `AiBI_Module_0_Orientation.md`) → the actual scripts, exercises, sandbox configs, and takeaway templates.

**Status legend:** ✅ done · 🛠 in progress · 🔲 not started
*(Note: a module's **spec** can be ✅ while its **production** is 🔲 — M0 below shows exactly that.)*

**2026-05-24 update — text-density pass:** all 24 lesson `body_md` blocks were
restructured to use the editorial visual vocabulary (`[stat]` · `[case:good]` ·
`[tip]` · `[warn]`) in place of long narrator-quote paragraphs. Body content
cut 44% overall (44% M2 / 46% M1 / 45% M0 / 40% M3 / 49% M4 / 43% M5). The two
bugs flagged in this session — `/api/addie/maturity` identity (auth users
returned zero progress) and SacredRule a11y (no focus management) — are
fixed. Seeds are edited in `supabase/seed/m{0..5}_addie.sql` and require
operator apply to the linked DB. Tests: 405/405 · typecheck clean · all 24
lesson endpoints return 200. See `docs/handoffs/addie-status-2026-05-24-text-cut.md`.

---

## Course rollup

| Asset | Count | Notes |
|---|---|---|
| Modules | 6 (M0–M5) | M0 spec ✅; M1–M5 spec 🔲 |
| Lessons | 24 | all ≤15 min |
| Video lessons | ~13 | record + edit + caption + transcript each |
| Audio lessons | 2 | 1.3, 5.5 (+transcripts) |
| Interactive / sandbox lessons | ~9 | 2.3, 3.2, 3.4, 3.5, 4.2, 4.3, 4.4, 5.3, 5.4 |
| **Branched lessons (×5 tracks)** | 4 → **20 variants** | 1.3, 2.4, 3.5, 4.3 — the bulk of the "all 5 tracks" work |
| Toolbox takeaway templates | ~11 | one+ per module |
| Controlled sandbox platform | 1 | built once, reused M2→M5 (see Shared Dependencies) |
| Knowledge-check sets | 24 | 2–3 items per lesson |
| Readiness Assessment | 1 | 48 Q / 8 dimensions — separate build (bottom) |

**Progress snapshot (2026-05-24):** detailed specs **3/6** (M0 · M4 · M5 ship this session; M1–M3 still seed-only) · media recorded 0/13 (camera/mic work — **not engineering scope**; see *Media production* section at bottom) · interactives built **9/9** ✅ · sandbox platform ✅ · track-aware chrome ✅ (TrackChrome + 15 hooks wired) · maturity-stage celebration ✅ · proactive tutor scaffold ✅ · Resend invite template ✅ · a11y static audit ✅ clean across 8 key pages

---

## Shared dependencies (build once — these gate the interactive lessons)
- [x] **Controlled sandbox platform** — provider gateway, prompt assembler, output gate, injection guard, provider switcher, save-to-Toolbox API. *Blocks 2.3, 3.2, 3.4, 3.5 and all of M4–M5.* `[LLM]` · *Service shipped Wave 1b+1e (2026-05-23); all 8 §14 acceptance tests pass. Save-to-Toolbox UI ships Wave 2a.*
- [x] **Toolbox infrastructure** — DB tables + RLS + entitlement check + `.md`-export storage bucket + free-tier 4-artifact cap helper. `[Supabase]` *(backend done Wave 1c+1d. Drawer UI + create/version endpoints + `.md` export route ship Wave 2a.)*
- [x] **Track system** — `addie.track` enum + `addie.learner_profiles.track` + `addie.lesson_track_variants` table + RLS. *Set in 0.1; consumed by every branch.* `[Supabase]` *(schema done Wave 1a. Track-picker UI + branched renderer ship Wave 2a; per-track variant content authored Wave 2b.)*
- [x] **Knowledge-check logging** — `addie.knowledge_checks` + `addie.knowledge_check_results` (anon-or-user write path) + RLS. `[Supabase]` *(schema done Wave 1c. Write endpoint + UI ship Wave 2a.)*

---

## M0 · Orientation — *(Free · 2 lessons · ~15 min)*
**Detailed spec:** ✅ `AiBI_Module_0_Orientation.md` · **Takeaway:** Data Discipline Card · **Body text cut 45% (2026-05-24)**

| Lesson | Modality | ~min | Branched | Interactive | Takeaway contribution |
|---|---|---|---|---|---|
| 0.1 How this works + Toolbox | Video | 7 | — | track picker | Course Roadmap (light) |
| 0.2 The one rule: data discipline | Video | 8 | content per track | off-limits sorter | **Data Discipline Card** |

- [x] Detailed curriculum doc
- [ ] Record + edit 2 videos *(media production — operator work; backend wired)*
- [ ] Captions + transcripts (×2) *(media production)*
- [x] Track-selection interaction *(TrackPicker shipped Wave 2a; server action writes addie.learner_profiles.track)*
- [x] Off-limits-in-your-world sorter *(OffLimitsSorter widget Wave 2b; 5 track filters; tests 4/4)*
- [x] Course Roadmap + Data Discipline Card templates *(content/addie/toolbox-templates/m0/*.md, Wave 2b)*
- [x] 6 knowledge-check items *(addie.knowledge_checks rows seeded Wave 2b)*
- [ ] QA: ≤15 min, accessibility (WCAG 2.1 AA) *(post-pilot)*

## M1 · What generative AI is — *(Free · 4 lessons)*
**Detailed spec:** ✅ seeded in `supabase/seed/m1_addie.sql` (Wave 2b) · **Takeaway:** AI Toolkit Map · **Body text cut 46% (2026-05-24)**

| Lesson | Modality | ~min | Branched | Interactive | Takeaway contribution |
|---|---|---|---|---|---|
| 1.1 What it actually is (and isn't) | Video | 10 | — | — | — |
| 1.2 Tool landscape: assistants vs. builders | Video + sort | 12 | — | sortable matrix | AI Toolkit Map (build) |
| 1.3 Why this matters for your role | Audio | 8 | **×5 tracks** | — | — |
| 1.4 Good vs. bad use in a bank | Video | 9 | — | — | — |

- [x] Module + 4 lesson rows + 5 m1.3 track variants seeded
- [ ] Record + edit 3 videos + **1 audio (×5 track variants)** *(media production — operator work)*
- [ ] Captions + transcripts (all) *(media production)*
- [x] Tool-landscape sortable matrix interaction *(ToolLandscapeMatrix Wave 2b; 12 tools; tests 6/6)*
- [x] AI Toolkit Map template *(content/addie/toolbox-templates/m1/ai-toolkit-map.md)*
- [x] 10 knowledge-check items seeded
- [ ] QA: ≤15 min, accessibility *(post-pilot)*

## M2 · Access & workflow — *(Free · 4 lessons)*
**Detailed spec:** ✅ seeded in `supabase/seed/m2_addie.sql` (Wave 2b) · **Takeaway:** First Conversation transcript · **⚠ first sandbox lesson (2.3) — wired** · **Body text cut 44% (2026-05-24)**

| Lesson | Modality | ~min | Branched | Interactive | Takeaway contribution |
|---|---|---|---|---|---|
| 2.1 Getting access | Video | 10 | — | — | — |
| 2.2 What each tool is for | Video | 12 | — | — | — |
| 2.3 Your first conversation | **Sandbox** | 15 | — | controlled sandbox | First Conversation transcript |
| 2.4 Where AI fits in your week | Worksheet | 10 | **×5 tracks** | worksheet | — |

- [x] Module + 4 lesson rows + 5 m2.4 track variants seeded
- [ ] Record + edit 2 videos *(media production — operator work)*
- [x] **Sandbox config for 2.3** *(`m2-3-first-conversation` Exercise row: canary `[[AIBI-SYS-7Q]]`, 4 starter-prompt levers, 1 PII-checked data slot, 200-word synthetic-regulation preset, gating 600 tokens/3500 chars, Anthropic default with switcher)*
- [x] "Where AI fits your week" worksheet ×5 track variants *(WhereAIFitsWorksheet widget Wave 2b; tests 4/4)*
- [x] First Conversation save flow *(SaveAsArtifactButton in SandboxLessonView → `addie.toolbox_items` type='first_conversation')*
- [x] ~10 knowledge-check items seeded
- [ ] Captions + transcripts *(media production)*
- [ ] QA: ≤15 min, accessibility · *requires sandbox platform live* *(sandbox platform live since Wave 1e; A11y pass deferred to pilot)*

## M3 · Talking to the machine — prompting — *(Free · 5 lessons · last free module)*
**Detailed spec:** ✅ seeded in `supabase/seed/m3_addie.sql` (Wave 2b) · **Takeaway:** Starter Prompt Pack (3 prompts) · **gate follows this module — wired** · **Body text cut 40% (2026-05-24)**

| Lesson | Modality | ~min | Branched | Interactive | Takeaway contribution |
|---|---|---|---|---|---|
| 3.1 Anatomy of a prompt | Video | 12 | — | — | — |
| 3.2 How output changes (A/B) | **A/B sandbox** | 15 | — | A/B sandbox | prompt → pack |
| 3.3 Prompting patterns | Video + cheat sheet | 12 | — | — | cheat sheet |
| 3.4 Banking no-nos deep dive | Video + interactive | 12 | — | spot-the-violation | — |
| 3.5 Real use cases | **Sandbox** | 15 | **×5 tracks** | controlled sandbox | **Starter Prompt Pack** |

- [x] Module + 5 lesson rows + 5 m3.5 track variants seeded
- [ ] Record + edit 3 videos (3.1, 3.3, 3.4) *(media production — operator work)*
- [x] **Sandbox configs**: `m3-2-ab-output` (mode=ab, 2 levers audience×length, PII-checked reg_text slot), `m3-5-real-use-cases` (mode=single with role lever for 5-track conditional directives, required PII-checked use_case_brief slot)
- [x] Spot-the-violation interactive *(SpotTheViolation widget Wave 2b; 12 scenarios; tests 4/4)*
- [x] Prompting cheat sheet + Starter Prompt Pack template *(content/addie/toolbox-templates/m3/*.md)*
- [x] Three-way gate screen at module end *(Wave 2a: GateScreen + EmailOptionForm + PayOptionCard + DeclineOption → wired via `gateTrigger.ts` + `gateNext` payload field; on m3.5 completion the NextLessonCTA routes to /foundation/gate)* `[Stripe][MailerLite]`
- [x] ~12 knowledge-check items seeded
- [ ] Captions + transcripts *(media production)*
- [ ] QA: ≤15 min, accessibility *(post-pilot)*

## ═══ GATE (pay or email) ═══

## M4 · Automating the repetitive — skills — *(Paid · 4 lessons)*
**Detailed spec:** ✅ `AiBI_Module_4_Skills.md` (2026-05-24) · **Takeaways:** Working Skill · Skill Template · full Prompt Library unlocked · unlimited saves · **Body text cut 49% (2026-05-24)**

| Lesson | Modality | ~min | Branched | Interactive | Takeaway contribution |
|---|---|---|---|---|---|
| 4.1 What a "skill" is | Video | 10 | — | — | — |
| 4.2 Build your first skill | Interactive | 15 | — | skill builder | Skill Template |
| 4.3 Build a skill for your role | Interactive | 15 | **×5 tracks** | skill builder | **Working Skill** |
| 4.4 Test, refine, guardrail-check | Interactive | 12 | — | skill builder | — |

- [x] Module + 4 lesson rows + 5 m4.3 track variants seeded *(supabase/seed/m4_addie.sql, Wave 3a)*
- [ ] Record + edit 1 video (4.1) *(media production — operator work)*
- [x] **Skill-builder** interactive *(SkillBuilder widget Wave 3a; template + role-skill modes; multi-step form; persists addie.toolbox_items.body_md = JSON matching sandbox-service/handlers/skill.ts SkillBody)*
- [x] 4.3 ×5 track skill builds *(track_defaults block in m4-3-role-skill exercise; SkillBuilder pre-selects per-track defaults)*
- [x] **Skill Template** + working-skill templates *(content/addie/toolbox-templates/m4/*.md)*
- [x] Entitlement gating *(addie.lessons paid-tier RLS + explicit `hasAnyFoundationEntitlement` check at lesson page renders Paywall for paid modules without active entitlement)* `[Supabase][Stripe]`
- [x] ~8 knowledge-check items seeded
- [ ] Captions + transcript *(media production)*
- [ ] QA: ≤15 min, accessibility *(post-pilot)*

## M5 · From idea to prototype — agents & building — *(Paid · 5 lessons)*
**Detailed spec:** ✅ `AiBI_Module_5_Prototypes.md` (2026-05-24) · **Takeaways:** Agent Blueprint · PRD · Prototype · Problem Backlog · **Body text cut 43% (2026-05-24)**

| Lesson | Modality | ~min | Branched | Interactive | Takeaway contribution |
|---|---|---|---|---|---|
| 5.1 What an agent is | Video | 12 | — | — | — |
| 5.2 Framing a problem | Video + worksheet | 12 | — | worksheet | Problem Backlog |
| 5.3 Writing a lightweight PRD | Interactive | 15 | — | PRD builder | PRD |
| 5.4 Build a prototype | Interactive | 15 | — | builder + link-out | Prototype |
| 5.5 Where to go next | Audio | 8 | — | — | — |

- [x] Module + 5 lesson rows seeded *(supabase/seed/m5_addie.sql, Wave 3a; no branched lessons in M5 per spec)*
- [ ] Record + edit 2 videos + 1 audio (5.5) *(media production — operator work; 5.1 + 5.5 narration scripts seeded as body_md)*
- [x] Problem-framing worksheet + PRD builder *(ProblemFrame + PRDBuilder widgets Wave 3a; PRDBuilder enforces ≥6 of 9 sections before save)*
- [x] 5.4 prototype flow *(PrototypeLauncher widget Wave 3a; link-out to Lovable / Replit Agents / Claude Code / v0; saves type='prototype' artifact)*
- [x] **Agent Blueprint · PRD · Problem Backlog · Prototype** templates *(content/addie/toolbox-templates/m5/*.md, all 4 ship — agent-blueprint is bonus per the migration 00038 enum)*
- [x] ~10 knowledge-check items seeded
- [ ] Captions + transcripts *(media production)*
- [ ] QA: ≤15 min, accessibility *(post-pilot)*

---

## Readiness Assessment (separate build) — $99
- [x] 48 questions mapped to 8 readiness dimensions *(authored on main in `content/assessments/v2/`; ADDIE adopts the existing model per DECISIONS.md 2026-05-23)*
- [x] Scoring model *(in `content/assessments/v2/types.ts` + scoring helpers on main)*
- [x] 4 deliverables surfaced *(Wave 3b: `src/app/(addie)/foundation/assessment/[id]/page.tsx` renders all 4 sections — DimensionScorecard / Personalized plan / Ideas+Prompts / CTAs — from `addie.assessment_results` columns)*
- [x] Profile handoff defined *(addie.learner_profiles.{track, tool_exposure, comfort_level} columns exist Wave 1a; assessment runner needs to write them — TODO at the runner side, Wave 3c bridge work)*
- [x] Gate behind $99 *(`STRIPE_INDEPTH_PRICE_ID` checkout via `/api/addie/checkout/assessment`, Wave 1d)*; deliver results *(POST `/api/addie/assessment/results` persists to addie.assessment_results idempotently; GET enforces ownership; MailerLite delivery is the runner's responsibility on main)*

**ADDIE-side persistence shipped Wave 3b (commit pending):** server route at `/api/addie/assessment/results` (POST UPSERT, rate-limited 5/IP/hr; GET ownership-enforced); helper `src/lib/addie/assessment/persist.ts` with idempotency on `stripe_session_id` or `(email, date)`; reader UI at `/foundation/assessment` lists own briefings + `[id]` view renders the 4 deliverables; 8 dimension keys mirror `content/assessments/v2/types.ts` exactly. The on-main 48-Q runner needs a TODO call to the new POST endpoint on completion — bridge wiring is Wave 3c follow-up.

## Team admin dashboard

- [x] Route at `/foundation/dashboard/team` *(Wave 3b)*; auth-gates to teams.admin_user_id; reads `addie.team_progress_v` (counts only, NO artifact bodies per FR-D4); seats table with status pills + invite form + revoke/resend actions; budget math enforced server- and client-side.
- [x] Resend-invite endpoint at `/api/addie/team/seats/[seatId]/resend` (emits `seat_invite_resent`, distinct from `seat_invited`, so funnel counts stay clean).
- [ ] Resend transactional template with signed-token link *(MailerLite stub in place; Resend template is a Wave 3c/pre-pilot follow-up per Auth Spec §7.2).*

---

---

## Media production — physical-world work, not engineering scope

The following remain after every engineering item ships. They require
cameras, microphones, voice talent, and an edit suite — not a code
deploy. Tracked here for completeness but **out of engineering scope.**

| Asset | Count | Notes |
|---|---|---|
| Video lessons | 13 | M0.1, M0.2, M1.1, M1.2, M1.4, M2.1, M2.2, M3.1, M3.3, M3.4, M4.1, M5.1, M5.2 |
| Audio lessons | 2 | M1.3 (×5 track variants) · M5.5 |
| Captions (.vtt) | 13 | One per video; English baseline |
| Transcripts | 15 | Both modalities |
| Voice direction | — | Calm, editorial, no cheerleader register — see M0 doc PRODUCTION blocks |

Backend wiring (player, captions track, transcript toggle, autosave of
playback position) is already shipped — media drops in by uploading
`<lesson_id>.mp4`/`.mp3` + `<lesson_id>.vtt` to the configured public
bucket and updating `lesson_track_variants.media_ref` (or
`lessons.media_ref` for non-branched). No further engineering required
to ship the recorded media.

---

### Build order suggestion
1. **Shared dependencies first** (sandbox platform especially — it blocks 9 lessons).
2. Detailed spec → produce, **one module at a time** (M0 spec ✅ → build M0 media/interactions, or continue specs M1→M5 in parallel with production).
3. The 20 branched variants and the sandbox configs are the two biggest content efforts — schedule them deliberately.
