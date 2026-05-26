# AiBI Foundation Course — ADDIE Design (v2, blank-slate redesign)
### *"We turn your bankers into your builders."*

**Product:** Foundation course — The AI Banking Institute
**Format:** Exclusively online · self-paced · async (no cohort in v1)
**Audience:** Compliance · Lending · Operations · IT · Leadership · Frontline · Retail → consolidated into **5 tracks**
**Design model:** ADDIE (Analysis → Design → Development → Implementation → Evaluation)
**Architecture principle:** the course structure is derived from **instructional-design fundamentals** (measurable objectives sequenced up Bloom's taxonomy), *not* from any pre-existing brand framework.
**Lesson constraint:** ≤15 minutes, every lesson.
**Commercial model:** **freemium gate** — Modules 0–3 free, gate after Module 3, Modules 4–5 paid.

---

# 1. ANALYSIS

## 1.1 The business case

The target learner is a banking professional who has *heard of* generative AI and is somewhere between curious and quietly anxious. They have no framework for what's safe, what's useful, or where to start. The Foundation course moves that person from **"I've heard of it"** → **"I built something useful this week, and I know the line I can't cross."**

The course doubles as the **top of the commercial funnel.** The first four modules are free and must be genuinely valuable on their own — good enough that the learner trusts the product and *feels* the value before they're ever asked to pay. The gate after Module 3 is where the promise shifts from *using* AI to *building* with it.

## 1.2 Entry funnel & pricing (confirmed)

| Step | Product | Price | Notes |
|---|---|---|---|
| Free tier | Modules 0–3 | **$0** | No purchase required; artifacts created in-session. **Saving requires an email** (see 1.3) |
| Lead capture | Email at the gate | **$0** | Email unlocks keeping the free artifacts; routes the not-yet-ready learner toward the assessment |
| Diagnostic | AI Readiness Assessment | **$99** | Personal/team baseline with its own deliverables/benefits; **feeds personalization** (2.7). Can be an entry point *or* a mid-funnel nurture offer for email leads |
| Course — Individual | Foundation (full) | **$295** | One learner, full access |
| Course — Team | Foundation (full) | **$199 / seat** | **Minimum 10 seats**; includes admin dashboard |

The funnel is **not a single straight line.** A learner can enter via the assessment *or* via the free course. The email captured at the gate is the connective tissue: it lets a not-yet-ready learner keep what they built and become a nurturable lead pointed at the $99 assessment.

## 1.3 The freemium gate — the central commercial design

This is the spine of the v2 design. Two principles govern it:

**Principle 1 — The free side proves *competence*; the paid side delivers *transformation*.**
Free modules teach a learner to *use* AI (awareness, access, prompting). That's immediately useful and builds trust. The paid modules teach them to *build* with AI (skills, agents, prototypes) — the actual "bankers into builders" promise. The line is honest: consumption is free, creation is paid.

**Principle 2 — Takeaway density increases across the gate.**
Per your direction, value is measured in *what the learner can take away.* Free modules each yield **one light artifact** (enough to be useful and prove value). Paid modules each yield **multiple, richer, role-customized, reusable artifacts** that populate a persistent Toolbox. The gate is not a wall — it's a visible step-up in what the learner walks away with. (Full escalation table in 2.5.)

**Principle 3 — Saving anything requires an email; the gate is a three-way fork.**
Artifacts are *created in-session* throughout the free modules but aren't persisted until the learner gives an email. The natural ask is at the gate, which becomes a fork rather than a binary paywall:

- **"Ready to continue" → Pay.** Unlocks M4–M5 + the full, unlimited, persistent Toolbox.
- **"Not yet" → Email.** Unlocks keeping everything they built in M0–M3, and converts them into a nurturable lead.
- That email lead is then **pointed at the $99 Readiness Assessment** — a lower-commitment paid step with its own deliverables and benefits, and a second on-ramp back into the funnel.

So the email does double duty: it's the *only* save mechanism (every persistence event is a lead-capture event) and it's the soft-landing for anyone not ready to buy.

```
FREE (artifacts created in-session)           │  PAID
Module 0  Orientation                         │
Module 1  Awareness                           │
Module 2  Access & Workflow                   │
Module 3  Prompting  ◄── last free module     │
══════════════════ GATE (three-way fork) ═════════════════════
   ├─ "Ready" ─► PAY ($295 ind / $199 seat) ──►│  Module 4  Skills (automate)
   │                                           │  Module 5  Build (agents → prototype)
   ├─ "Not yet" ─► EMAIL ─► keep free artifacts
   │                         │
   └─────────────────────────► nurture ─► $99 Readiness Assessment ─► (back into funnel)
```

## 1.4 Audience analysis → 5 tracks

Seven roles, but they share one conceptual spine and differ only at the *applied/practice* moments. For production efficiency the seven consolidate into **five tracks** (learners self-select; pre-filled from the Readiness Assessment):

| Track | Roles folded in | Applied flavor |
|---|---|---|
| **Risk & Compliance** | Compliance, Risk | regulation summaries, policy drafting |
| **Customer-Facing** | Frontline, Retail, Lending | member comms, document narratives |
| **Back-Office Process** | Operations, Marketing | comms rewrite, weekly research, press releases |
| **Technical** | IT | prototyping, governance lens |
| **Leadership** | Leadership | problem framing, ROI/feasibility reading |

## 1.5 Constraints & guardrails

- **Online-only, async, self-paced.** No live attendance dependency. Time-poor learners.
- **≤15 minutes per lesson.** Hard ceiling. Microlearning.
- **Banking data discipline is woven throughout, never a single lesson.** The rule — *no PII, no account numbers, no customer data, no MNPI* — is introduced in M1, drilled in M3, and re-checked in every M4/M5 build. It is also **structurally enforced by the sandbox design** (1.6).
- **Every lesson produces a takeaway** that contributes to the Toolbox; takeaway richness escalates across the gate.
- **Mixed modality:** video, audio, interactive activity, and the controlled API sandbox.

## 1.6 The controlled-sandbox philosophy (a design constraint, not just a feature)

The interactive core is a **scaffolded, on-rails sandbox** — *not* an open chat window. The course controls the underlying prompt; the learner manipulates only bounded, designated levers; the output is gated before display. Learners get authentic model responses (Claude / OpenAI / Gemini) but with **"blinders"**: they cannot view or freely rewrite the hidden system prompt, cannot perform prompt injection, and cannot paste arbitrary data into the controlled exercises. This is both a *pedagogical* choice (clean, comparable lessons) and a *risk* choice (the structure itself prevents data leakage and abuse). Technical spec in 3.2.

## 1.7 Terminal learning objectives (Bloom-laddered)

By completion, a learner can:

1. **(Remember/Understand)** Explain what generative AI is, name the major tool categories, and choose the right tool for a task.
2. **(Understand/Apply)** Access the tools and fit them into a real workflow.
3. **(Apply)** Use core prompting patterns and reliably improve an output by changing structure and context.
4. **(Apply)** Identify and avoid banking-specific data/compliance risks.
5. **(Create)** Build a reusable *skill* that automates a repetitive task from their own role. *(paid)*
6. **(Create)** Frame a problem, write a lightweight PRD, and build a working prototype. *(paid)*

The cognitive demand rises module over module; the free tier covers objectives 1–4 (use), the paid tier covers 5–6 (build).

---

# 2. DESIGN

## 2.1 Design principles

- **Scaffolded progression up Bloom's** — each module raises cognitive demand; nothing in M4 is attempted before the prompting fluency of M3.
- **Microlearning** — ≤15-min lessons; Mayer's segmenting principle does real work.
- **Takeaway escalation across the gate** — free = 1 light artifact/module; paid = multiple rich, reusable artifacts/module.
- **Controlled experience** — on-rails sandbox; bounded learner inputs; gated outputs.
- **Role-relevant at the applied moment** — shared spine, 5-track branching only where practice happens.

## 2.2 Course map

Six modules, ~22 lessons, all ≤15 min. Free seat time ≈ 2 hrs; full course ≈ 4–4.5 hrs.

| Module | Title | Tier | Lessons | Dominant modality |
|---|---|---|---|---|
| **M0** | Orientation: How this works | Free | 2 | Video + setup |
| **M1** | What generative AI is | Free | 4 | Video + interactive sort |
| **M2** | Access & workflow | Free | 4 | Video + controlled sandbox |
| **M3** | Talking to the machine (prompting) | Free | 5 | Controlled A/B sandbox |
| **— GATE —** | | | | |
| **M4** | Automating the repetitive (skills) | **Paid** | 4 | Interactive build |
| **M5** | From idea to prototype (agents & building) | **Paid** | 5 | Interactive build |

## 2.3 Module designs

### Module 0 — Orientation *(free, ~15 min total)*
**Objective:** Set up the learner for success and plant the data-discipline mindset before any tool appears.

| # | Lesson | Modality | ~min |
|---|---|---|---|
| 0.1 | How this course works + your Toolbox | Video | 7 |
| 0.2 | The one rule that matters: data discipline | Video | 8 |

- Track is auto-selected from the Readiness Assessment (changeable here).
- **Takeaway:** a printable **Data Discipline Card** (the no-PII/no-account/no-MNPI rule).

### Module 1 — What generative AI is *(free)*
**Objective:** Demystify, build vocabulary, survey the landscape, reduce fear.

| # | Lesson | Modality | ~min |
|---|---|---|---|
| 1.1 | What generative AI actually is (and isn't) | Video | 10 |
| 1.2 | The tool landscape: assistants vs. builders | Video + sortable matrix | 12 |
| 1.3 | Why this matters for *your* role | Role-branched audio + read | 8 |
| 1.4 | What "good" and "bad" use looks like in a bank | Video | 9 |

- **1.2** covers both categories you named: *assistants* (Claude, ChatGPT, Gemini, Perplexity) and *builders* (Replit, Lovable, Bolt, Claude Code) — "thinking partners" vs. "construction crews," with a when-to-reach-for-which heuristic.
- **Takeaway (light):** a personalized **AI Toolkit Map** — which tools fit their role.

### Module 2 — Access & workflow *(free)*
**Objective:** First successful contact; understand purpose; see where AI fits the workday.

| # | Lesson | Modality | ~min |
|---|---|---|---|
| 2.1 | Getting access: accounts, free vs. paid, the interface | Video walkthrough | 10 |
| 2.2 | What each tool is *for*: research / drafting / analysis / building | Video | 12 |
| 2.3 | Your first conversation | **Controlled sandbox** | 15 |
| 2.4 | Where AI fits in your week | Role-branched worksheet | 10 |

- **2.3** is the learner's first sandbox run — fully on-rails; they pick a preset task and watch a real model respond.
- **Takeaway (light):** their saved **First Conversation** transcript.

### Module 3 — Talking to the machine: prompting *(free — last free module)*
**Objective:** Prompt fundamentals — the highest-leverage skill, and the value the free tier is built to prove.

| # | Lesson | Modality | ~min |
|---|---|---|---|
| 3.1 | Anatomy of a prompt: Role · Task · Context · Format · Constraints | Video | 12 |
| 3.2 | How output changes with format & information | **Controlled A/B sandbox** | 15 |
| 3.3 | Prompting patterns: examples, step-by-step, persona | Video + cheat sheet | 12 |
| 3.4 | Banking no-nos — the deep dive | Video + "spot the violation" interactive | 12 |
| 3.5 | Real use cases: summarize a regulation, do research, draft a comms piece | Role-branched controlled sandbox | 15 |

- **3.2** is the conceptual heart: same task, escalating prompt structures, output diff rendered side-by-side (on rails — see 3.2 in Development).
- **Takeaway (light):** a **Starter Prompt Pack** — 3 role-relevant prompts. *(The full, persistent, unlimited Prompt Library unlocks behind the gate.)*

> **The gate moment (designed three-way fork).** Module 3 ends with the learner having just made a model produce something genuinely useful, holding 3 prompts they built. The screen presents three doors:
> 1. **Ready to continue → Pay.** *"You've learned to **use** AI. Now learn to **build** with it — turn that prompt into a skill you run every week, chain skills into an agent, and ship a working prototype."* Unlocks M4–M5 and the full Toolbox.
> 2. **Not yet → Give us your email.** Keep everything you built in the free modules. (This is the *only* way to save it.)
> 3. The email path then **nudges toward the $99 Readiness Assessment** — a smaller paid step with its own deliverables, and a second route back into the funnel.
> Consumption becomes creation here, and the takeaways get richer — but no one leaves empty-handed, and every saved artifact is a captured lead.

### Module 4 — Automating the repetitive: skills *(paid)*
**Objective:** Turn a repeating task into a reusable, parameterized skill.

| # | Lesson | Modality | ~min |
|---|---|---|---|
| 4.1 | What a "skill" is: a saved, templated, reusable workflow | Video | 10 |
| 4.2 | Build your first skill: input slots & defaults | Interactive build | 15 |
| 4.3 | Build a skill for *your* role | **Role-branched interactive** | 15 |
| 4.4 | Test, refine, guardrail-check | Interactive | 12 |

- **4.3 per track:** comms-rewriter (Back-Office) · press-release generator (Back-Office/Marketing) · Reg-E summarizer (Compliance) · the **"ten local competitors" weekly research compiler** (drop in your own list, save, reuse indefinitely) · member-comms clarifier (Customer-Facing).
- **Takeaways (rich):** a **working saved Skill** + a reusable **Skill Template** + the **full Prompt Library unlocked** + unlimited Toolbox saves.

### Module 5 — From idea to prototype: agents & building *(paid)*
**Objective:** Chain skills into an agent; go idea → PRD → working prototype; inspire curiosity.

| # | Lesson | Modality | ~min |
|---|---|---|---|
| 5.1 | What an agent is: chaining skills; when it's appropriate | Video | 12 |
| 5.2 | Framing a problem: brainstorm & plan | Video + worksheet | 12 |
| 5.3 | Writing a lightweight PRD (the minimum AI needs to build for you) | Interactive | 15 |
| 5.4 | Build a prototype (Lovable / Replit / Claude Code) | Interactive build | 15 |
| 5.5 | Where to go next | Audio/video send-off | 8 |

- **Takeaways (rich):** an **Agent Blueprint** + a **lightweight PRD** + an export/link to their **first prototype** + a **Problem Backlog** template for future ideas.
- **5.5** is the upsell handoff to Specialist tracks.

## 2.4 The Toolbox

A versioned library of everything the learner produces. Artifacts are **created in-session** during the free modules but **persist only once the learner provides an email** (free path) or pays (full account) — there is no anonymous saving. Free learners can keep **4 light artifacts** via email; paid learners unlock a **growing, unlimited, reusable** library. The Toolbox is the durable value of the paid product, the lead-capture mechanism for the free tier, *and* the strongest behavior-change signal (see 5.2 — reuse = transformation).

## 2.5 Takeaway escalation across the gate

| Module | Tier | Takeaway(s) | Density |
|---|---|---|---|
| M0 | Free | Data Discipline Card | light |
| M1 | Free | AI Toolkit Map | light |
| M2 | Free | First Conversation transcript | light |
| M3 | Free | Starter Prompt Pack (3 prompts) | light |
| **M4** | **Paid** | Working Skill · Skill Template · **full Prompt Library unlocked** · unlimited saves | **rich** |
| **M5** | **Paid** | Agent Blueprint · PRD · Prototype · Problem Backlog | **rich** |

## 2.6 Lesson template (every lesson)

Hook (≤60s, role-relevant "why") → Teach (dominant modality) → Do (sandbox/sort/build/worksheet) → Take (save the Toolbox artifact) → Check (2–3 quick checks). Consistent shape = repeatable production + predictable learner experience.

## 2.7 Readiness-Assessment → personalization hook (planned, loose)

The $99 assessment can run *before* the course (as an entry point) or *after* the gate (as the email-lead nurture step). Either way it should write a small profile the course can read: **track**, **tool exposure**, **comfort level**. v1 use is conservative — pre-select the track and tune the M1.3 "why this matters" branch. Architect the handoff now (a simple profile record keyed to the learner, by email) even if v1 only consumes one or two fields; richer adaptation (e.g., skipping basics for high-comfort learners) can come later without re-plumbing. When the assessment comes *after* the free course, it also enriches the lead with role/comfort data for better-targeted upsell.

---

# 3. DEVELOPMENT

## 3.1 Asset inventory

| Asset | Est. count | Notes |
|---|---|---|
| Video lessons | ~12 | Scripted, ≤15 min, captioned + transcript |
| Audio lessons | ~2 | Role-context, commute-friendly |
| Interactive activities | ~9 | Controlled sandboxes, sorts, spot-the-violation, builders |
| Controlled API sandbox | 1 platform | Multi-provider; reused M2→M5 |
| Toolbox artifact templates | ~10 | Pre-built `.md` learners clone |
| Knowledge checks | ~22 sets | 2–3 items/lesson |
| Capstone | 1 | Paid; see 5.4 |

## 3.2 The controlled sandbox — technical centerpiece (your vision, spec'd)

A single embedded, **provider-agnostic** playground reused across modules, built on rails.

**Provider abstraction + learner-facing switcher.** One internal interface; swappable backends (Claude / OpenAI / Gemini). A **default provider is set per lesson (Claude as primary), but the learner can switch models across vendors** from a visible selector. This is deliberately *exposed* and turned into a teachable feature: in the A/B lessons the learner can run the *same controlled prompt* against different models and see how responses differ — a cheap, vivid lesson in "the model matters too, not just the prompt." Switching the provider never changes the blinders: the learner picks *which* model, never *how* the prompt is assembled. (Standard messages-style endpoints; structured JSON for the A/B and scoring views.)

**Controlled prompt assembly — the "blinders."** The full prompt sent to the model is composed of three parts:
1. a **hidden system prompt** (set by the course; never shown, never editable),
2. a **fixed task scaffold** (the lesson's task; the learner can't rewrite it),
3. **bounded learner levers** — the only thing the learner controls: toggle/add a *role*, a *format constraint*, an *example*, or pick from **preset context blocks**. Free-text entry, where allowed, is inserted strictly as **data into a labeled slot**, never as instructions.

**Injection resistance.** Learner input is always treated as untrusted data, never as system instruction. The system prompt is non-extractable (filtered from outputs). No tool access from inside the sandbox. This is what lets the experience be authentic *and* safe.

**Output gating.** Responses pass through a display filter before the learner sees them — length caps, content screening, and stripping of any attempt to surface the hidden prompt. The learner sees "what the model would say," cleaned for a controlled classroom.

**Save-to-Toolbox.** Every output has a save button → writes a versioned `.md` artifact. **Saving requires an email** (free path; capped to the 4 light artifacts) or a paid account (unlimited). No anonymous persistence — every save is a lead-capture event.

> Because inputs are bounded, learners *can't* paste raw PII into controlled exercises — the structure enforces the data-discipline rule the lessons teach. When learners later graduate to unscaffolded real tools (M4/M5 with Claude Code / Lovable / Replit), the M1+M3 discipline training is what protects them, since those tools have no blinders.

## 3.3 Fully developed exemplar — **Lesson 3.2** (production template)

**"How output changes with format & information"** · Controlled A/B sandbox · 15 min

- **Hook (45s, cold-open video):** *"You asked the same question twice and got two different answers. That's not the AI being random — that's you. Let's prove it."*
- **Teach (4 min):** the five levers (Role · Task · Context · Format · Constraints); a vague prompt → mediocre output, the same task structured → strong output.
- **Do (8 min, on-rails A/B):** the task is fixed by us — *"Summarize this Reg E change for branch staff."* The learner can't edit the task; they only **toggle levers**: +role, +audience, +format spec, +length cap, and swap among preset context blocks. Three configurations render side-by-side; the output diff is the lesson. The learner annotates what improved and why; then removes context to watch precision drop (proving *relevance beats volume*).
- **Take (1.5 min):** save the best configuration to the **Starter Prompt Pack**.
- **Check (45s):** match lever-change → output-change; spot the missing lever in a weak prompt; T/F "more context is always better" (false).

**Artifact produced (light, free-tier):**
```markdown
# Prompt — Plain-Language Regulation Summary
Role: You are a compliance analyst at a community bank.
Task: Summarize the regulation change below for branch staff.
Audience: Frontline tellers, no legal background.
Format: 5 bullets + one "what to tell members" line.
Constraints: ≤150 words. No legal jargon. No customer data in input.
---
[PASTE PUBLIC REGULATION TEXT HERE]
```

Every other lesson is scripted against this Hook → Teach → Do → Take → Check skeleton.

## 3.4 Build sequence

Build the **free tier first** (M0–M3 + the sandbox) — it *is* the funnel and must exist before paid content earns its audience. Instrument it, validate value and gate conversion, then build M4–M5.

---

# 4. IMPLEMENTATION

## 4.1 Purchase-to-access + gate mechanics

```
ENTRY (either door)
   ├─ AI Readiness Assessment ($99) ─ writes profile: track · tool exposure · comfort
   └─ Free course directly
        ▼
FREE access → M0, M1, M2, M3   (no card, no email required to view)
   • artifacts created in-session, not yet persisted
        ▼
GATE after M3 ── three-way fork ──
   ├─ "Ready to continue" → PAY
   │      ├─ Individual ($295) ──────► full account, M4–M5 unlock, unlimited Toolbox
   │      └─ Team ($199/seat, 10+) ──► admin seats; per-seat assessment; team dashboard
   ├─ "Not yet" → EMAIL ──► keep free artifacts (only save path) + become a lead
   │                          └─► nurture toward $99 Readiness Assessment ──► back into funnel
        ▼
Completion → M5 prototype + Toolbox in hand → Specialist upsell (5.5)
```

## 4.2 Delivery model

- **Async, self-paced. No cohort in v1.** (Cohort layer parked for a later release.)
- **Platform:** a **custom, self-built web app** (no third-party LMS). Built on Supabase (database/auth/storage) with Resend (transactional email) and MailerLite (nurture). Learning events are logged directly in Supabase. Requirements: tier-gating after M3, role/track gating, team admin dashboard, and the controlled sandbox embedded in the app.

## 4.3 Onboarding & support

M0 *is* the onboarding (the Toolbox + the one rule). In-course sandbox help; a pinned data-discipline FAQ. Team admins get a one-page rollout guide (seat assignment, reading the dashboard).

## 4.4 Soft launch

1. Ship free tier (M0–M3 + sandbox); pilot with one friendly community bank / credit union.
2. Instrument value and **gate-conversion**.
3. Iterate, then build paid M4–M5.
4. General availability.

---

# 5. EVALUATION

Structured on **Kirkpatrick's four levels**, with the freemium funnel added as a first-class business metric.

## 5.1 Formative (during development)
Per-module pilots: lesson time vs. the 15-min ceiling; sandbox completion; drop-off; and whether the free takeaways are reused unprompted. Fix before scaling.

## 5.2 Summative — Kirkpatrick + funnel

| Level | Measures | Foundation signals |
|---|---|---|
| **L1 — Reaction** | Did they value it? | Per-module thumbs; completion NPS; "Was your role represented?" |
| **L2 — Learning** | Did they learn? | Knowledge checks; **Readiness-Assessment retake delta**; capstone |
| **L3 — Behavior** | Using it at work? | **Toolbox reuse** (headline metric — skills re-run after course end); 30-day "used AI at work this week?" |
| **L4 — Results** | Business impact | Self-reported time saved/week; tasks automated via M4 skills; team dashboard rollups |
| **Funnel (business)** | Does free convert? | **Free→paid conversion rate**; M3-gate drop-off; free-tier completion; assessment→free→paid path |

> Two metrics matter most: **gate conversion** (does the free tier earn the sale?) and **Toolbox reuse** (does the paid tier change behavior?). A learner who returns to re-run a skill they built has crossed from *trained* to *changed* — the proof that sells Team and Specialist tiers.

## 5.3 Feedback loops
Lesson thumbs → quarterly refresh (M1.2's tool matrix needs a scheduled review — tooling moves fast). Sandbox logs surface confusing tasks. Team dashboards become case-study fuel.

## 5.4 Capstone & completion *(paid)* — no formal credential in v1
- **Capstone = the deliverable, not a certificate.** Completing M5 means the learner walks away with a working prototype + PRD in their Toolbox. The value *is* the artifact, not a badge.
- **A short data-discipline scenario check** runs at the end as a confidence confirmation (you know the line), folded into completion — not a high-stakes gating exam.
- **No credential in v1, by design.** A certificate now would carry no external weight, so it isn't a critical success factor. The completion state is tracked (for L2 measurement and upsell timing) but not marketed as a credential.
- **Future option:** once the product has traction and a path to *recognized* credentialing exists, a credential can be layered on top of the existing completion data with no rework. Parked, not abandoned.

---

# 6. Decisions

**Resolved this round:**
- Team = **$199/seat, 10-seat minimum**; Individual = **$295**.
- **No cohort** in v1.
- **5 role tracks.**
- **Free Modules 0–3, gate after M3, paid M4–M5.**
- Architecture driven by **instructional design / ADDIE**, not a pre-existing pillar framework.
- Sandbox = **controlled, multi-provider, bounded inputs, gated output, injection-resistant.**
- Readiness Assessment **feeds personalization** (planned hook; conservative v1 use).
- **Saving requires an email** — no anonymous persistence. The gate is a **three-way fork** (Pay / Email-to-keep / → $99 Assessment). Every save is a lead-capture event.
- **Provider switcher is exposed to learners** — Claude default, learner can pick across vendors; cross-model comparison becomes a teachable feature. Blinders unaffected.
- **No formal credential in v1** — completion is tracked but not marketed as a credential; revisit once there's traction and recognized credentialing.

**Next-step candidates (your call):**
1. Full lesson-by-lesson scripts for the **free tier (M0–M3)** — the part that has to ship first.
2. A buildable **PRD for the controlled sandbox** (provider abstraction, bounded levers, gating, switcher).
3. The **gate screen** itself — copy + UX for the three-way fork.
4. The **$99 Readiness Assessment** design (questions, scoring, deliverables) since it's now both an entry point and the email-lead destination.
