# AiBI Foundation — Start Here
*The orientation document. Read this first. Then read the documents below in the order that matches your role.*

**Project:** The AI Banking Institute · Foundation Course
**Tagline:** "We turn your bankers into your builders."
**Branch (build):** `feature/addie-v1` · **Folder:** `docs/Foundation-Course-ADDIE/`

---

## 1 · The product in 60 seconds

The Foundation Course is an exclusively-online, self-paced course that takes a banking professional from **"I've heard of generative AI"** to **"I built something useful this week, and I know the line I can't cross."**

It is also the **top of the commercial funnel** for The AI Banking Institute. Four interlocking systems make it work:

1. **A curriculum engine** — 6 modules, ~22 lessons, every lesson ≤15 min, branched into 5 role tracks.
2. **A controlled AI sandbox** — on-rails, multi-provider (Anthropic / OpenAI / Gemini), injection-resistant; learners interact with real models inside *bounded levers* — no free-text chat, no way to paste sensitive data.
3. **A Toolbox** — versioned `.md` artifacts the learner produces; persistence requires an email (free side) or a paid account.
4. **A freemium gate** — M0–M3 are free, gate after M3, M4–M5 are paid. The gate is a **three-way fork**: Pay · Email-to-keep · Decline → routed to the $99 Readiness Assessment.

A separate **$99 Readiness Assessment** (48 questions, 8 dimensions, four deliverables) sits both as an entry point to the funnel and as the nurture destination for email leads.

**Pricing:** Assessment $99 · Individual course $295 · Team course $199/seat (10-seat minimum).

**No credential in v1** — completion is tracked but not marketed. Revisit once we have traction and a recognized credentialing path.

---

## 2 · How the documentation works (the 3-layer model)

Build specs and learner content live on different layers. Always know which layer you are in.

```
   ┌──────────────────────────────────────────────────────────────┐
   │  LAYER 1 — Vision & strategy                                  │
   │  ADDIE Design v2 · Interactive Overview (HTML)                │
   │  "Why does this exist and what is it?"                        │
   └──────────────────────────────────────────────────────────────┘
                              ▼
   ┌──────────────────────────────────────────────────────────────┐
   │  LAYER 2 — Product/engineering requirements                   │
   │  Course PRD                ──►  Module PRDs (M0–M5)           │
   │  "What does the developer build?"                             │
   └──────────────────────────────────────────────────────────────┘
                              ▼
   ┌──────────────────────────────────────────────────────────────┐
   │  LAYER 3 — Learner content (per module)                       │
   │  Module 0 Orientation (✅ done)  · M1–M5 curriculum docs (🔲)  │
   │  "What does the learner see, hear, and do?"                   │
   └──────────────────────────────────────────────────────────────┘

   Cross-cutting:
   - Launch Checklist (cross-workstream execution)
   - Module Production Tracker (per-module build status)
   - Handoff Docs Checklist (P1/P2/P3 docs still to write)
   - LMS Mockup (clickable visual prototype)
```

---

## 3 · The 8 documents — what each is, who reads it, when

### 3.1 · `AiBI_Foundation_Course_ADDIE_Design_v2.md` — Instructional design source of truth
- **What it is:** The pedagogical blueprint. Built on ADDIE (Analysis → Design → Development → Implementation → Evaluation). Defines the course objectives (Bloom-laddered), the 6-module structure, the 5 role tracks, the lesson template (Hook → Teach → Do → Take → Check), the gate, the sandbox philosophy, and the Kirkpatrick-based evaluation plan.
- **Authority:** **Source of truth for everything pedagogical.** If the curriculum doc and the ADDIE doc disagree, the ADDIE doc wins.
- **Who reads it:** Everyone, but in depth — instructional designers, content authors, the PM.
- **When you use it:**
  - Before you write or review any lesson content.
  - When deciding whether something belongs in free vs. paid.
  - When deciding what counts as a "takeaway."
  - When measuring whether the course is working (§5).
- **How to use it:** Read end-to-end once. Then keep it open as a reference while authoring modules. Section 2 is the course map; section 3 is the development plan; section 5 is the evaluation plan.

### 3.2 · `AiBI_Foundation_PRD.md` — Course-level product/engineering source of truth
- **What it is:** The product requirements document for the *whole* product. Features, non-functional requirements, the data model, the integrations + stack, the technical architecture, the risks, and the resolved/open decisions.
- **Authority:** **Source of truth for everything product/engineering.** If a module PRD and the course PRD disagree, the course PRD wins.
- **Who reads it:** Everyone, end-to-end. Dev and PM in depth.
- **When you use it:**
  - When scoping any build work.
  - When you need to know what tool does what (§9 integrations).
  - When you need the data model (§8).
  - When you hit a decision that may already be answered (§14).
- **How to use it:** Read end-to-end once. Section 6 (functional requirements), §7 (non-functional), §8 (data model), §9 (stack), §10 (architecture) are the dense parts. Reference, don't memorize.

### 3.3a · `AiBI_Sandbox_Service_Tech_Spec.md` — Backend spec for the controlled AI sandbox
- **What it is:** The technical spec for the security-critical Sandbox Service — the only component that talks to an LLM provider. Defines the **Exercise** abstraction (server-owned config that fully describes a safe interaction), the prompt-assembly contract (the "blinders"), the provider gateway (Anthropic / OpenAI / Google), the output-gating pipeline, the security model (threat model + defenses + honest posture), the API contract, rate limits + cost control, and a security test plan that must pass before pilot.
- **Authority:** **Source of truth for sandbox implementation.** Elaborates Course PRD §6.2 (FR-S1–S9) and §10 (architecture). Sandbox lessons (2.3, 3.2, 3.5, 4.2–4.4, 5.3) build on top of this.
- **Who reads it:** Backend developers (every line). Security/privacy reviewer (every line). PM (§1–§5 + §14 test plan). Content authors writing sandbox lessons (§3 Exercise model, §4 prompt assembly, §8 modes) so the lessons fit the rails.
- **When you use it:**
  - Building any sandbox endpoint or adapter.
  - Authoring a new Exercise (content authors write Exercises; the service executes them).
  - Reviewing a PR that touches LLM calls, prompts, or learner input handling.
  - Pre-pilot — the §14 acceptance gates are the security sign-off.
- **How to use it:** Read §1–§5 once for the model. Keep §3 (Exercise schema), §4 (prompt assembly), and §9 (API contract) open when building. Run §14 as a literal test plan.

### 3.3b · `AiBI_Database_Schema_RLS_Spec.md` — Concrete Postgres schema + row-level security
- **What it is:** Every learner-data table specified as concrete Postgres DDL (columns, types, FKs, indexes), with RLS policies for each, the identity ladder (anonymous → lead → learner), the small set of triggers, migration order, and a pre-ship acceptance checklist. Closes Course PRD §8 (which lists entities only).
- **Authority:** **Source of truth for the database.** Implements Course PRD §8. Sandbox tables are owned by the Sandbox spec §10 — this doc cross-references rather than redefines.
- **Who reads it:** Backend developers (every line). Anyone writing a server endpoint that reads/writes a learner row. Security/privacy reviewer.
- **When you use it:**
  - Writing a Supabase migration.
  - Authoring an RLS policy (use the patterns in §5 verbatim; never invent your own).
  - Reviewing a PR that touches data.
  - Pre-launch — the §12 acceptance gates must all pass.
- **How to use it:** Read §2 (principles) + §3 (entity overview) once. Then jump to the table you're touching in §5. The migration order in §11 is the build sequence.

### 3.3c · `AiBI_Auth_Entitlements_Spec.md` — Identity ladder, gate fork, Stripe + team seats
- **What it is:** Server-side flow for the three identity states (anonymous viewer → email lead → authenticated learner) and the transitions between them. Owns the gate-fork endpoints, Stripe checkout + webhook handler, lead-bind, team-seat invite/accept/revoke, marketing-consent rules, and failure-mode recovery.
- **Authority:** **Source of truth for auth and payments flow.** Implements Course PRD §6.4 (gate), §6.5 (payments), §6.7 (team), §6.8 (auth). Pairs with the Database spec (which owns the data shape) and the Sandbox spec (entitlement check at the LLM boundary).
- **Who reads it:** Backend developers building checkout, webhook, or gate endpoints. Anyone touching learner state transitions.
- **When you use it:** Writing any server endpoint that creates a learner, captures a lead, processes a payment, or invites a seat.
- **How to use it:** Read §1 (the three states) and §4 (gate fork) first; jump to the specific flow you're building. The §12 acceptance gates are the pre-ship checklist.

### 3.3d · `AiBI_Technical_Design_Doc.md` — Engineering blueprint
- **What it is:** The top-level architecture doc. Stack choices with reasons, service boundaries, repo layout, environments, env-var additions, the API surface, CI/CD, observability, performance budgets, build sequence.
- **Authority:** **Source of truth for engineering architecture.** Stitches Sandbox + Database + Auth specs together. Names the seams between web app, Sandbox Service, Supabase, Stripe, MailerLite, Resend, and LLM providers.
- **Who reads it:** Every engineer joining the project. The PM for sequencing.
- **When you use it:**
  - Onboarding any new dev.
  - Scaffolding a new directory or service.
  - Deciding where new code goes.
  - Sequencing the cross-team build (§11).
- **How to use it:** Read end-to-end once. Keep §4 (repo layout) and §7 (API surface) open while building.

### 3.3e · `AiBI_Design_System_Spec.md` — UI kit
- **What it is:** Visual + interaction language. Color tokens (Ledger, single-sourced), typography (3 families, italics retired), spacing/radii/shadow/motion, component specs (Button, Input, Card, Lesson player, Sandbox controls, Gate fork, Toolbox drawer, Knowledge check, Nav, Modal, Toast), iconography, imagery, voice + microcopy, accessibility, responsive posture, forbidden patterns.
- **Authority:** **Source of truth for the UI kit.** CLAUDE.md Design Context is the brand law; this doc maps it to components.
- **Who reads it:** Designers (every line). Frontend developers (every line). Anyone writing UI copy (§8 voice rules).
- **When you use it:** Designing or building any UI surface. The §11 forbidden-pattern list is the "is this off-brand?" reference.
- **How to use it:** Read §1–§4 once (aesthetic, color, typography, spacing). Then jump to the component you need in §5.

### 3.3f · `AiBI_Screen_Inventory_Spec.md` — Every screen, every flow
- **What it is:** The catalogue of ~45 screens we build in v1, the eight primary user flows that connect them, the six baseline states every screen must handle, and mobile considerations. Pairs with the Design System doc — that one covers *how*, this one covers *what + when*.
- **Authority:** **Source of truth for screens and flows.** If a flow diagram appears elsewhere and conflicts, this doc wins.
- **Who reads it:** Designers, frontend developers, QA, the PM.
- **When you use it:**
  - Sprint planning (which screens are in scope this cycle).
  - Designing a new screen (check it's in the inventory; if not, add it before building).
  - QA (the §5 state checklist is the per-screen QA pass).
- **How to use it:** Read §1 (inventory) + §4 (primary flows) once. Then jump to the screen catalogue in §3 for the one you're working on.

### 3.3g · `AiBI_Security_Privacy_Spec.md` — Consolidated security + privacy posture
- **What it is:** The system-wide security contract. Data classes, structural enforcement of the data-discipline rule, the prompt-injection test plan, the buyer-facing honest posture (the `/security` one-pager), encryption + secrets posture, OWASP top-10 mapping, retention + deletion, logging + monitoring, incident response, pre-pilot security gate, residual-risk list.
- **Authority:** **Source of truth for security posture.** Per-component specs (Sandbox §5, Database §12, Auth §9–10) own their internals; this doc owns the system-wide posture and the buyer-facing position.
- **Who reads it:** Engineers (every line). Security/privacy reviewer (every line). PM (§5 honest posture, §10 incident response, §12 pre-pilot gate).
- **When you use it:**
  - Building anything that touches identity, payments, or LLM calls.
  - Preparing for a banking-buyer security review.
  - Annual / quarterly security review cycles.
  - Incident response.
- **How to use it:** Read §1 (the brand promise), §3 (structural enforcement), and §5 (the honest posture) before any external conversation about security. The §12 pre-pilot gate is the literal checklist before the pilot ships.

### 3.3 · `AiBI_Module_PRDs.md` — Per-module build specs (M0–M5)
- **What it is:** One PRD per module, all in one file. For each module: purpose, in/out of scope, functional requirements (FR-Mx-N), state & events, dependencies, acceptance criteria, asset inventory.
- **Authority:** Derived from the course PRD; per-module spec for developers.
- **Who reads it:** Developers building each module. PM for status tracking.
- **When you use it:**
  - When planning a sprint for a module.
  - When writing acceptance criteria for a PR.
  - When scoping the interactive/sandbox configs for a module.
- **How to use it:** When you start a module, read its PRD section once. Use the *Functional requirements* list as your build checklist; use the *Acceptance criteria* as your definition of done.

### 3.4 · `AiBI_Module_0_Orientation.md` — Detailed curriculum for Module 0
- **What it is:** The fully-scripted curriculum for the two M0 lessons. Two layers per beat: **SCRIPT (verbatim)** for narration, **PRODUCTION** for on-screen elements, b-roll, interactions, timing. Includes all 5-track content for the data-discipline sorter, the Data Discipline Card template, and an M0 production checklist.
- **Authority:** Detailed spec — the *learner-facing* truth for M0. Also the **template** every other module's curriculum doc must follow.
- **Who reads it:** Anyone producing M0 (video, design, dev). Anyone authoring M1–M5 curriculum docs reads it as the template.
- **When you use it:**
  - Recording video → SCRIPT block is verbatim narration.
  - Building the track-picker, sorter, Data Discipline Card, or Course Roadmap → PRODUCTION block.
  - QA → run the production checklist at the bottom + the §CHECK items.
  - Authoring M1's curriculum doc → copy this file's structure exactly.
- **How to use it:** This is the gold standard. Treat the shape (Hook → Teach → Do → Take → Check, both SCRIPT + PRODUCTION layers) as **non-negotiable** when writing M1–M5.

### 3.5 · `AiBI_Module_Production_Tracker.md` — Per-module production status
- **What it is:** A status board. For every module/lesson it lists modality, time budget, branching, interactives, and the takeaway. Each module has a production checklist with ✅ / 🛠 / 🔲 markers. Includes a "shared dependencies" section (build once: sandbox platform, Toolbox infra, track system, knowledge-check logging) and a build-order suggestion.
- **Authority:** Derivative; the operational tracker.
- **Who reads it:** PM daily. Everyone else when they want to know "what's done, what's not."
- **When you use it:**
  - Standups / status updates.
  - Sequencing work across modules.
  - Spotting blockers (e.g., the sandbox platform blocks 9 lessons).
- **How to use it:** Update the checkbox the moment something flips status. Read top-to-bottom when planning the next week.

### 3.6 · `AiBI_Launch_Checklist.md` — Cross-workstream zero-to-launch plan
- **What it is:** The whole launch broken into 13 numbered workstreams: infrastructure, content production, the $99 assessment, sandbox, app build, database, payments, email, analytics, security/privacy, legal, QA/pilot, marketing site. Each workstream is a checklist tagged with the relevant tool (`[Stripe]`, `[Supabase]`, `[MailerLite]`, `[LLM]`, `[Host]`).
- **Authority:** Derivative; the execution plan.
- **Who reads it:** PM owns it. Everyone references the workstream they own.
- **When you use it:**
  - Planning the overall delivery.
  - Onboarding a new contributor to *their* workstream (jump to that §, ignore the rest).
  - Pre-launch — the QA section (§11) is the gate.
- **How to use it:** Read once end-to-end to understand the surface area. Then bookmark the section you own and work it.

### 3.7 · `AiBI_Handoff_Docs_Checklist.md` — Gap list of dev/design/PM docs still to write
- **What it is:** A catalog of the *additional* documents we still need to write before serious build can start (technical design, sandbox technical spec, schema + RLS, auth & entitlements, Stripe spec, MailerLite spec, content model, event taxonomy, security spec, QA plan, runbook, design system, screen inventory, component specs, brand & voice, a11y spec, responsive spec, team onboarding, glossary). Each is priority-rated **P1** (unblocks build) → **P3** (nice-to-have).
- **Authority:** Derivative; a gap analysis.
- **Who reads it:** PM and team leads. Anyone before they say "we're ready to build."
- **When you use it:**
  - Sprint planning ("which P1 do we knock out next?").
  - When a dev or designer says "I don't have what I need."
- **How to use it:** Work the P1s first, top to bottom. The recommended build order at the bottom is the path: **Sandbox Technical Spec → Schema + RLS → Auth & entitlements → Technical Design Doc → Design system + Screen inventory → Security & privacy spec.**

### 3.8 · `README.md` — The folder index
- **What it is:** A one-page table listing every file in this folder, what it is, and its authority level. Plus the "confirmed tools" line and the superseded-docs note.
- **Authority:** Index only.
- **Who reads it:** Everyone, the moment they open this folder.
- **When you use it:** The "where do I find X?" moment. Glance, then go to the source.
- **How to use it:** Don't write content into the README — write content into the relevant doc and add a line to the README pointing to it.

---

## 4 · Reading paths by role

### 4.1 · New developer — first 2 hours
1. **This doc** (`AiBI_Start_Here.md`) — 15 min.
2. `AiBI_Technical_Design_Doc.md` — 25 min, end-to-end. Stack, service boundaries, repo layout, environments, API surface, build sequence. This is your map.
3. `AiBI_Foundation_PRD.md` — 20 min. Skim §1–§5 for context; read §6 (functional requirements), §8 (data model entities), §9 (stack), §10 (architecture).
4. `AiBI_Database_Schema_RLS_Spec.md` — 20 min. Skim §2 (principles) + §3 (entity overview), then the tables you'll touch.
5. `AiBI_Auth_Entitlements_Spec.md` — 20 min. §1 identity ladder + §4 gate fork + §6 Stripe. Anything you build that touches a learner row probably crosses this doc.
6. `AiBI_Sandbox_Service_Tech_Spec.md` — 20 min if touching anything sandbox-related; skim §1–§5 otherwise.
7. `AiBI_Security_Privacy_Spec.md` — 10 min. §3 structural enforcement + §6 secrets + §12 pre-pilot gate.
8. `AiBI_Module_PRDs.md` — 10 min for the module you'll build first; skim the others.
9. `AiBI_Launch_Checklist.md` §0 + your workstream — 10 min.

### 4.2 · New designer — first 2 hours
1. **This doc** — 15 min.
2. `AiBI_Foundation_Course_ADDIE_Design_v2.md` — 25 min, end-to-end. (Pedagogy drives every UX decision here.)
3. `AiBI_Design_System_Spec.md` — 25 min, end-to-end. The visual + interaction language is the contract you work in.
4. `AiBI_Screen_Inventory_Spec.md` — 25 min. The list of screens you're designing and the flows that connect them.
5. `AiBI_Module_0_Orientation.md` — 15 min. The only fully-imagined learner experience we have; everything else takes cues from here.
6. The LMS mockup HTML (open in a browser) — 10 min. Shows the chrome around M0.
7. `AiBI_Foundation_PRD.md` §6.2 (sandbox), §6.3 (Toolbox), §6.4 (gate) — 10 min. The three surfaces that need the most original design.

### 4.3 · New content author / instructional designer — first 90 minutes
1. **This doc** — 15 min.
2. `AiBI_Foundation_Course_ADDIE_Design_v2.md` — 45 min, end-to-end. This is your bible.
3. `AiBI_Module_0_Orientation.md` — 20 min. Read it as the **template you will copy** for the module you're authoring.
4. `AiBI_Module_PRDs.md` — 10 min for the module you'll author first. Note its functional requirements — your content must enable them (the sorter, the A/B sandbox, the gate).

### 4.4 · New PM / lead — first 2 hours
1. **This doc** — 15 min.
2. `AiBI_Foundation_PRD.md` — 25 min, end-to-end.
3. `AiBI_Foundation_Course_ADDIE_Design_v2.md` §1 (analysis) + §5 (evaluation) — 15 min.
4. `AiBI_Technical_Design_Doc.md` §11 (build sequence) + §12 (risks) — 10 min. The path forward and where it can blow up.
5. `AiBI_Security_Privacy_Spec.md` §5 (honest posture) + §12 (pre-pilot gate) — 10 min. Banking-buyer conversations and the launch gate.
6. `AiBI_Launch_Checklist.md` — 15 min, end-to-end. Your operating manual.
7. `AiBI_Module_Production_Tracker.md` — 10 min. Your status board.
8. `AiBI_Handoff_Docs_Checklist.md` — 5 min. The P1s are done; the P2/P3s are the next backlog.
9. `AiBI_Screen_Inventory_Spec.md` §1 (inventory) + §4 (primary flows) — 10 min. The shape of what's being built.

---

## 5 · Conflict-resolution rules (which doc wins when they disagree)

Documents drift. When two of them conflict, use this precedence:

| Topic | Authoritative doc |
|---|---|
| What the learner experiences (script, interaction, takeaway) | **Module curriculum doc** (e.g., `AiBI_Module_0_Orientation.md`) |
| What the developer builds for a module | **`AiBI_Module_PRDs.md`** for that module |
| How the sandbox is implemented (Exercise model, prompt assembly, gateway, gating, API) | **`AiBI_Sandbox_Service_Tech_Spec.md`** |
| Database table shape, columns, indexes, RLS policies | **`AiBI_Database_Schema_RLS_Spec.md`** |
| Server-side identity/payment flows (gate fork, lead-bind, Stripe webhook, team seats) | **`AiBI_Auth_Entitlements_Spec.md`** |
| Engineering architecture, repo layout, environments, API surface | **`AiBI_Technical_Design_Doc.md`** |
| Visual language, component specs, voice rules, accessibility | **`AiBI_Design_System_Spec.md`** |
| Which screens exist, the flows between them, per-screen states | **`AiBI_Screen_Inventory_Spec.md`** |
| Security posture, prompt-injection testing, retention + deletion, incident response | **`AiBI_Security_Privacy_Spec.md`** |
| Pedagogy, course structure, gate philosophy, evaluation | **`AiBI_Foundation_Course_ADDIE_Design_v2.md`** |
| Product features, data model, stack, integrations | **`AiBI_Foundation_PRD.md`** |
| Build status / "is it done?" | **`AiBI_Module_Production_Tracker.md`** |
| What still needs to be written | **`AiBI_Handoff_Docs_Checklist.md`** |
| Workstream sequencing | **`AiBI_Launch_Checklist.md`** |

**If a conflict is structural** (e.g., two docs imply different module counts), stop work and resolve it. Update the lower-authority doc and **add a `DECISIONS.md` entry** at the project root recording what changed and why.

---

## 6 · Non-negotiables (the rules every employee follows)

These don't live in any single doc — they live across all of them.

1. **No PII, no account numbers, no customer data, no MNPI** is ever collected, stored, or transmittable through any course surface. The sandbox's bounded inputs make this structurally impossible — that is the brand promise to banking buyers.
2. **Every lesson is ≤15 minutes**, end-to-end, including interaction. Hard ceiling.
3. **Every lesson follows the same shape:** Hook → Teach → Do → Take → Check.
4. **Branched lessons render all 5 role tracks.** No exceptions.
5. **Saving anything (free side) requires an email.** Every save is a lead-capture event.
6. **No credential in v1.** Completion is tracked but not marketed as a credential.
7. **The sandbox is on-rails.** No free-form chat, ever. Learner input is data, never instruction. The hidden system prompt is non-extractable.
8. **Accessibility is WCAG 2.1 AA** — captions + transcripts on media, keyboard navigation on every interactive, sufficient contrast.

---

## 7 · Where we are *right now* (post-Wave 1, ready for Wave 2)

**Wave 1 (shared dependencies) is done as of 2026-05-23.** 17 commits ahead of `main`, all isolated to the `addie.*` Postgres schema + `sandbox-service/` + `src/lib/addie/` + `src/app/api/{addie,sandbox,skill}/`. The existing `/courses/foundation/program` and `public.*` are untouched.

**What's live:**
- ✅ 17 SQL migrations applied (19 `addie.*` tables, 4 storage buckets, 4 storage RLS policies, all DB Spec §12 gates pass)
- ✅ Sandbox Service end-to-end: provider gateway (Anthropic / OpenAI / Gemini) · `Exercise` model + assembler + canary · output gate · `/sandbox/run` + `/sandbox/ab` + `/api/skill/run` · rate limits · daily LLM spend budget + per-provider circuit breaker · **all 8 Sandbox Spec §14 acceptance tests pass**
- ✅ Auth + payments: HMAC anon-session cookie · gate fork (`capture-email` + `decline`) · Stripe checkout × 3 products · Stripe webhook (path: `/api/addie/webhooks/stripe`, separate from legacy) · team seat invite/accept/revoke
- ✅ Locked decisions in `DECISIONS.md`: sandbox = Vercel Functions same repo · schema isolated under `addie.*` · ADDIE adopts existing 8-dimension In-Depth model · team SKU is one-time payment in v1
- ✅ Audit + cleanup: `AiBI_Wave_1_Audit_2026-05-23.md` (full drift + thoroughness audit); Wave 1f cleanup closed audit blockers G1 (webhook ledger column drift), G3 (`bindLeadToUser` wired into webhook), G5 (one-time-payment decision documented), G9 (stale comments)
- ✅ Tests: `npx tsc --noEmit` clean · `npx vitest run` → 41/41 pass

**Wave 2 (the lesson player + free side + module scaffolding) starts here.** Two sub-waves with one checkpoint between them:

- **Wave 2a — web app shell.** Under `src/app/(addie)/foundation/[moduleId]/[lessonId]/...` and `src/app/(addie)/dashboard/...`. The lesson player (renders video/audio/interactive/sandbox/worksheet modalities), the Toolbox drawer UI, the **three-way gate UI screen** after M3 (Pay / Email-to-keep / Decline), the learner dashboard skeleton, account export/delete pages. Wires the existing API endpoints. Honors Ledger design tokens. Does **not** touch `/courses/foundation/program`.

- **Wave 2b — M0–M3 module scaffolding (parallel — 4 subagents, one per module).** Each subagent seeds `addie.modules`/`lessons`/`lesson_track_variants` from the corresponding spec + M0 curriculum doc, wires the interactives the spec calls for (track picker, off-limits sorter, AI Toolkit Map, A/B sandbox, spot-the-violation, etc.), authors the Toolbox templates per module, wires the knowledge-checks. Sandbox lessons reference the existing `addie.exercises` table; the curriculum agent writes the Exercise rows for that module.

- **Checkpoint 2** — anon → M0 → M3 → gate end-to-end smoke. Pause for review before Wave 3.

**Wave 3** (M4 + M5 paid, $99 assessment surface, team admin dashboard) is downstream of Checkpoint 2 — not yet started.

**Where to look:**
- For the full Wave 1 audit results (gate-by-gate, with file:line evidence): `AiBI_Wave_1_Audit_2026-05-23.md`
- For the operational tracker as you build: `AiBI_Module_Production_Tracker.md` (M0–M5 production checklists) and `AiBI_Launch_Checklist.md` (cross-workstream items). **Tick boxes in the same commit that lands the work** — the trackers ran stale through Wave 1 and that's a process bug the team has agreed not to repeat.
- For locked decisions and intentional deviations from spec: `DECISIONS.md` (entries dated 2026-05-23 cover the Wave 1 architectural calls)

---

## 8 · Glossary (the words we use)

- **Blinders** — the controlled-prompt design that lets a learner manipulate bounded levers but never the underlying system prompt.
- **Gate** — the three-way fork after Module 3 (Pay / Email-to-keep / Decline).
- **Light artifact vs. rich artifact** — free-tier single takeaway (one card, one map) vs. paid-tier multi-artifact output (Skill + Template + Library unlock, etc.).
- **Module curriculum doc** — the per-module learner-content spec (Hook → Teach → Do → Take → Check, with SCRIPT + PRODUCTION layers).
- **Module PRD** — the per-module engineering spec inside `AiBI_Module_PRDs.md`.
- **Sandbox** — the on-rails, multi-provider playground reused M2 → M5.
- **Track** — one of five role-based content branches (Risk & Compliance · Customer-Facing · Back-Office Process · Technical · Leadership).
- **Toolbox** — the learner's persistent, versioned library of created `.md` artifacts.

---

## 9 · Where to ask questions

- **Conflicts between docs** → flag in your PR; resolve via §5 above; record in `DECISIONS.md`.
- **Missing doc** (you can't build because something isn't written) → check `AiBI_Handoff_Docs_Checklist.md`. If it's a known gap, see who owns it. If it isn't on the list, add it.
- **Decision you don't want to relitigate later** → write a `DECISIONS.md` entry at the project root the moment you make it.

---

*Last updated 2026-05-23. Owned by James. Update this doc whenever the document set changes.*
