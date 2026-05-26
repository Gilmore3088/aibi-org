# AiBI Foundation — Module Production Tracker
*Per-module curriculum build needs. The companion to the launch checklist.*

**How the docs fit together:**
- **Launch Checklist** → cross-cutting workstreams (infra, payments, email, security, GTM).
- **This tracker** → what every module/lesson needs to be *produced*, with status.
- **Detailed curriculum docs** (one per module, e.g. `AiBI_Module_0_Orientation.md`) → the actual scripts, exercises, sandbox configs, and takeaway templates.

**Status legend:** ✅ done · 🛠 in progress · 🔲 not started
*(Note: a module's **spec** can be ✅ while its **production** is 🔲 — M0 below shows exactly that.)*

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
| Readiness Assessment | 1 | 48 Q / 10+ dimensions — separate build (bottom) |

**Progress snapshot:** detailed specs 1/6 · media recorded 0/13 · interactives built 0/9 · sandbox platform 🔲

---

## Shared dependencies (build once — these gate the interactive lessons)
- [ ] **Controlled sandbox platform** — provider gateway, prompt assembler, output gate, injection guard, provider switcher, save-to-Toolbox. *Blocks 2.3, 3.2, 3.4, 3.5 and all of M4–M5.* `[LLM]` · *Spec ✅ `AiBI_Sandbox_Service_Tech_Spec.md` (2026-05-23) — build per §15; sign off per §14.*
- [ ] **Toolbox infrastructure** — create / version / `.md` export / email-or-entitlement-gated save. `[Supabase]`
- [ ] **Track system** — `profile.track` selection + branched-lesson rendering. *Set in 0.1; consumed by every branch.* `[Supabase]`
- [ ] **Knowledge-check logging** — capture results for the learning metric. `[Supabase]`

---

## M0 · Orientation — *(Free · 2 lessons · ~15 min)*
**Detailed spec:** ✅ `AiBI_Module_0_Orientation.md` · **Takeaway:** Data Discipline Card

| Lesson | Modality | ~min | Branched | Interactive | Takeaway contribution |
|---|---|---|---|---|---|
| 0.1 How this works + Toolbox | Video | 7 | — | track picker | Course Roadmap (light) |
| 0.2 The one rule: data discipline | Video | 8 | content per track | off-limits sorter | **Data Discipline Card** |

- [x] Detailed curriculum doc
- [ ] Record + edit 2 videos
- [ ] Captions + transcripts (×2)
- [ ] Build track-selection interaction (writes `profile.track`)
- [ ] Build "off-limits in your world" sorter (×5 track variants)
- [ ] Author Course Roadmap generator + **Data Discipline Card** template (5 track blocks)
- [ ] Wire 6 knowledge-check items
- [ ] QA: ≤15 min, accessibility (WCAG 2.1 AA)

## M1 · What generative AI is — *(Free · 4 lessons)*
**Detailed spec:** 🔲 · **Takeaway:** AI Toolkit Map

| Lesson | Modality | ~min | Branched | Interactive | Takeaway contribution |
|---|---|---|---|---|---|
| 1.1 What it actually is (and isn't) | Video | 10 | — | — | — |
| 1.2 Tool landscape: assistants vs. builders | Video + sort | 12 | — | sortable matrix | AI Toolkit Map (build) |
| 1.3 Why this matters for your role | Audio | 8 | **×5 tracks** | — | — |
| 1.4 Good vs. bad use in a bank | Video | 9 | — | — | — |

- [ ] Detailed curriculum doc
- [ ] Record + edit 3 videos + **1 audio (×5 track variants)**
- [ ] Captions + transcripts (all)
- [ ] Build tool-landscape sortable matrix interaction
- [ ] Author **AI Toolkit Map** template
- [ ] Wire ~10 knowledge-check items
- [ ] QA: ≤15 min, accessibility

## M2 · Access & workflow — *(Free · 4 lessons)*
**Detailed spec:** 🔲 · **Takeaway:** First Conversation transcript · **⚠ first sandbox lesson (2.3)**

| Lesson | Modality | ~min | Branched | Interactive | Takeaway contribution |
|---|---|---|---|---|---|
| 2.1 Getting access | Video | 10 | — | — | — |
| 2.2 What each tool is for | Video | 12 | — | — | — |
| 2.3 Your first conversation | **Sandbox** | 15 | — | controlled sandbox | First Conversation transcript |
| 2.4 Where AI fits in your week | Worksheet | 10 | **×5 tracks** | worksheet | — |

- [ ] Detailed curriculum doc
- [ ] Record + edit 2 videos
- [ ] **Sandbox config for 2.3** (hidden system prompt + fixed task + bounded levers + gating)
- [ ] Build "where AI fits your week" worksheet (×5 track variants)
- [ ] Author First Conversation save flow
- [ ] Captions + transcripts; ~10 knowledge-check items
- [ ] QA: ≤15 min, accessibility · *requires sandbox platform live*

## M3 · Talking to the machine — prompting — *(Free · 5 lessons · last free module)*
**Detailed spec:** 🔲 · **Takeaway:** Starter Prompt Pack (3 prompts) · **gate follows this module**

| Lesson | Modality | ~min | Branched | Interactive | Takeaway contribution |
|---|---|---|---|---|---|
| 3.1 Anatomy of a prompt | Video | 12 | — | — | — |
| 3.2 How output changes (A/B) | **A/B sandbox** | 15 | — | A/B sandbox | prompt → pack |
| 3.3 Prompting patterns | Video + cheat sheet | 12 | — | — | cheat sheet |
| 3.4 Banking no-nos deep dive | Video + interactive | 12 | — | spot-the-violation | — |
| 3.5 Real use cases | **Sandbox** | 15 | **×5 tracks** | controlled sandbox | **Starter Prompt Pack** |

- [ ] Detailed curriculum doc
- [ ] Record + edit 3 videos (3.1, 3.3, 3.4)
- [ ] **Sandbox config for 3.2 (A/B mode) and 3.5 (×5 track tasks)**
- [ ] Build "spot-the-violation" interactive (3.4)
- [ ] Author prompting cheat sheet + **Starter Prompt Pack** template
- [ ] Build the **three-way gate screen** (Pay / Email / Decline) at module end `[Stripe][MailerLite]`
- [ ] Captions + transcripts; ~12 knowledge-check items
- [ ] QA: ≤15 min, accessibility

## ═══ GATE (pay or email) ═══

## M4 · Automating the repetitive — skills — *(Paid · 4 lessons)*
**Detailed spec:** 🔲 · **Takeaways:** Working Skill · Skill Template · full Prompt Library unlocked · unlimited saves

| Lesson | Modality | ~min | Branched | Interactive | Takeaway contribution |
|---|---|---|---|---|---|
| 4.1 What a "skill" is | Video | 10 | — | — | — |
| 4.2 Build your first skill | Interactive | 15 | — | skill builder | Skill Template |
| 4.3 Build a skill for your role | Interactive | 15 | **×5 tracks** | skill builder | **Working Skill** |
| 4.4 Test, refine, guardrail-check | Interactive | 12 | — | skill builder | — |

- [ ] Detailed curriculum doc
- [ ] Record + edit 1 video (4.1)
- [ ] Build the **skill-builder** interactive (input slots / defaults / save) on the sandbox rail
- [ ] Author 4.3 ×5 track skill builds (Reg-E summarizer, member-comms clarifier, competitor-research compiler, etc.)
- [ ] Author **Skill Template** + unlock full Prompt Library
- [ ] Entitlement gating verified `[Supabase][Stripe]`
- [ ] Captions + transcript; ~8 knowledge-check items
- [ ] QA: ≤15 min, accessibility

## M5 · From idea to prototype — agents & building — *(Paid · 5 lessons)*
**Detailed spec:** 🔲 · **Takeaways:** Agent Blueprint · PRD · Prototype · Problem Backlog

| Lesson | Modality | ~min | Branched | Interactive | Takeaway contribution |
|---|---|---|---|---|---|
| 5.1 What an agent is | Video | 12 | — | — | — |
| 5.2 Framing a problem | Video + worksheet | 12 | — | worksheet | Problem Backlog |
| 5.3 Writing a lightweight PRD | Interactive | 15 | — | PRD builder | PRD |
| 5.4 Build a prototype | Interactive | 15 | — | builder + link-out | Prototype |
| 5.5 Where to go next | Audio | 8 | — | — | — |

- [ ] Detailed curriculum doc
- [ ] Record + edit 2 videos + 1 audio (5.5)
- [ ] Build problem-framing worksheet + PRD builder interactive
- [ ] Build 5.4 prototype flow (link-out to Lovable / Replit / Claude Code)
- [ ] Author **Agent Blueprint · PRD · Problem Backlog** templates
- [ ] Captions + transcripts; ~10 knowledge-check items
- [ ] QA: ≤15 min, accessibility

---

## Readiness Assessment (separate build) — $99
- [ ] Write 48 questions mapped to 10+ readiness dimensions
- [ ] Build scoring model (questions → dimension scores)
- [ ] Author 4 deliverables: dimensional scorecard · personalized plan · curated ideas + prompts · CTAs
- [ ] Define profile handoff (track, tool_exposure, comfort_level, dimension scores) → course `[Supabase]`
- [ ] Gate behind $99 `[Stripe]`; deliver results `[MailerLite]`

---

### Build order suggestion
1. **Shared dependencies first** (sandbox platform especially — it blocks 9 lessons).
2. Detailed spec → produce, **one module at a time** (M0 spec ✅ → build M0 media/interactions, or continue specs M1→M5 in parallel with production).
3. The 20 branched variants and the sandbox configs are the two biggest content efforts — schedule them deliberately.
