# AiBI Foundation — Module PRDs
*The module-level build spec. Pairs with: course-level `AiBI_Foundation_PRD.md` (product) and the per-module curriculum docs (content). Status tracked in `AiBI_Module_Production_Tracker.md`.*

**Document model (3 layers):**
- **Course PRD** — the whole product (features, stack, data model, funnel).
- **Module PRD** *(this doc)* — per-module scope, functional requirements, dependencies, acceptance criteria — what a developer builds.
- **Module curriculum doc** — per-module scripts, exercises, sandbox configs, takeaway templates — what the learner experiences. (M0 done.)

**Shared dependencies referenced below (build once):** Sandbox Platform `[LLM]` · Toolbox infra (email/entitlement-gated save, `.md` export) `[Supabase]` · Track system (`profile.track`) `[Supabase]` · Knowledge-check logging `[Supabase]` · Gate + entitlement `[Stripe][MailerLite]`.

**Universal acceptance criteria (every module):** every lesson ≤15 min incl. interaction · interactives keyboard-accessible (WCAG 2.1 AA) · captions + transcripts on all media · branched lessons render all 5 tracks · takeaways save to Toolbox (gated) · knowledge checks logged · data-discipline holds throughout · sandbox lessons pass injection/leak tests.

---

# Module 0 PRD — Orientation
**Tier:** Free · **Lessons:** 2 · **~15 min** · **Sandbox:** none · **Takeaway:** Data Discipline Card · **Curriculum doc:** ✅ `AiBI_Module_0_Orientation.md`

### Purpose
Onboard the learner, introduce the Toolbox and the free/paid model, capture the role track, and establish the data-discipline rule before any tool appears.

### In scope
0.1 How this works + Toolbox (video + track picker) · 0.2 Data discipline (video + off-limits sorter).
### Out of scope
Any AI tool use; the sandbox (first appears in M2).

### Functional requirements
- **FR-M0-1 Track picker** (0.1): 5 selectable cards; pre-selected from assessment if present; writes `profile.track`; updateable later. Drives all downstream branching.
- **FR-M0-2 Off-limits sorter** (0.2): renders the selected track's off-limits list + a 4-item safe/anonymize sort with immediate right/wrong feedback. **×5 track content.**
- **FR-M0-3 Takeaways:** *Course Roadmap* (light, generated from track) and the **Data Discipline Card** (renders the universal rule + the "describe the situation, not the person" move + the track's off-limits block). Both saveable.
- **FR-M0-4 Knowledge checks:** 3 items per lesson, logged.

### State & events
Writes `profile.track`; logs lesson views/completions, check results, artifact saves.
### Dependencies
Track system · Toolbox infra · check logging. (No sandbox.)
### Acceptance criteria
Track selection persists and re-renders 0.2; sorter feedback correct for all 5 tracks; Data Discipline Card renders the right track block; both lessons ≤15 min.
### Assets
2 videos · 1 sorter (×5) · 1 track picker · 2 takeaway templates · 6 checks.

---

# Module 1 PRD — What generative AI is
**Tier:** Free · **Lessons:** 4 · **Sandbox:** none · **Takeaway:** AI Toolkit Map · **Curriculum doc:** 🔲

### Purpose
Demystify generative AI, build shared vocabulary, map the tool landscape (assistants vs. builders), and make relevance concrete per role.

### In scope
1.1 What it is/isn't (video) · 1.2 Tool landscape (video + sortable matrix) · 1.3 Why this matters for your role (audio, **branched ×5**) · 1.4 Good vs. bad use in a bank (video).
### Out of scope
Hands-on tool use, prompting mechanics (M3).

### Functional requirements
- **FR-M1-1 Tool-landscape matrix** (1.2): interactive sortable/filterable matrix of named tools (Claude, ChatGPT, Gemini, Perplexity / Replit, Lovable, Bolt, Claude Code) by purpose ("thinking partner" vs. "construction crew"). Content authorable without deploy (tools change fast).
- **FR-M1-2 Branched audio** (1.3): 5 role-specific audio segments + transcripts; rendered by `profile.track`.
- **FR-M1-3 Takeaway:** **AI Toolkit Map** — personalized one-pager of which tools fit the learner's role; saveable.
- **FR-M1-4 Knowledge checks:** ~10 items, logged.

### State & events / Dependencies
Reads `profile.track`; logs standard events. Deps: Track system · Toolbox infra.
### Acceptance criteria
Matrix is filterable + accessible; 1.3 renders correct track variant; Toolkit Map reflects track; content updatable without code deploy.
### Assets
3 videos · 1 audio (×5) · 1 matrix interactive · 1 takeaway template · ~10 checks.

---

# Module 2 PRD — Access & workflow
**Tier:** Free · **Lessons:** 4 · **Sandbox:** ⚠ first sandbox (2.3) · **Takeaway:** First Conversation transcript · **Curriculum doc:** 🔲

### Purpose
Get the learner to first successful, safe contact with a model and see where AI fits the workday.

### In scope
2.1 Getting access (video) · 2.2 What each tool is for (video) · 2.3 Your first conversation (**controlled sandbox**) · 2.4 Where AI fits your week (worksheet, **branched ×5**).
### Out of scope
Prompt-structure theory (M3); free-form chat (never).

### Functional requirements
- **FR-M2-1 Sandbox config — 2.3 (first run):** hidden system prompt = neutral assistant for a banking training exercise; fixed task scaffold = a friendly preset starter ("introduce yourself and offer 3 ways you could help in my role"); **minimal levers** (pick a preset prompt + send) to keep first contact simple; output gated; provider switcher visible (default Claude). Save transcript to Toolbox.
- **FR-M2-2 Workflow worksheet** (2.4): role-specific "where AI fits my week" template, **×5 tracks**; saveable.
- **FR-M2-3 Knowledge checks:** ~10 items, logged.

### State & events / Dependencies
Logs sandbox session (provider, no raw sensitive data). **Deps: Sandbox Platform (critical — must be live)** · Track system · Toolbox infra.
### Acceptance criteria
2.3 returns a real model response inside the bounded sandbox; no free-text injection possible; transcript saves; 2.4 renders all 5 tracks; ≤15 min.
### Assets
2 videos · 1 sandbox config · 1 worksheet (×5) · 1 takeaway · ~10 checks.

---

# Module 3 PRD — Talking to the machine (prompting)
**Tier:** Free (last free module) · **Lessons:** 5 · **Sandbox:** 3.2, 3.5 · **Gate follows** · **Takeaway:** Starter Prompt Pack · **Curriculum doc:** 🔲

### Purpose
Teach prompting fundamentals (the highest-leverage skill) and the data no-nos; prove the free tier's value; land the learner at the gate having just produced something useful.

### In scope
3.1 Anatomy of a prompt (video) · 3.2 How output changes — A/B (**sandbox**) · 3.3 Patterns (video + cheat sheet) · 3.4 Banking no-nos (video + spot-the-violation) · 3.5 Real use cases (**sandbox, branched ×5**) · **the gate**.
### Out of scope
Skills/automation (M4 — paid).

### Functional requirements
- **FR-M3-1 Sandbox config — 3.2 (A/B mode):** fixed task ("summarize this Reg E change for branch staff"); learner toggles bounded levers (+role / +audience / +format / +length) and swaps preset context blocks; renders 2–3 configs side-by-side with output diff; demonstrates "relevance beats volume."
- **FR-M3-2 Spot-the-violation** (3.4): sample prompts containing PII/account/MNPI; learner flags violations; teaches anonymization.
- **FR-M3-3 Sandbox config — 3.5 (branched ×5):** role-specific real tasks (Reg-E summary, member-comms, research, etc.); produces a prompt saved to the **Starter Prompt Pack** (3 prompts).
- **FR-M3-4 Cheat sheet** takeaway (3.3); **Starter Prompt Pack** takeaway (3.5).
- **FR-M3-5 The gate** (module end): three-way fork screen — Pay (`[Stripe]`) / Email-to-keep (`[Supabase]`→`[MailerLite]`) / Decline → $99 assessment nudge.
- **FR-M3-6 Knowledge checks:** ~12 items, logged.

### State & events / Dependencies
Logs sandbox sessions + gate decision (fork distribution metric). Deps: Sandbox Platform · Track system · Toolbox · **Gate + email capture**.
### Acceptance criteria
A/B diff renders; spot-the-violation scores correctly; 3.5 renders all 5 tracks and saves a prompt; gate fork records choice and routes correctly; ≤15 min each.
### Assets
3 videos · 2 sandbox configs · 1 spot-the-violation · 1 gate screen · 2 takeaways · ~12 checks.

---

# Module 4 PRD — Automating the repetitive (skills)
**Tier:** Paid · **Lessons:** 4 · **Sandbox:** skill builder (4.2–4.4) · **Takeaways:** Working Skill · Skill Template · Prompt Library unlock · unlimited saves · **Curriculum doc:** 🔲

### Purpose
Turn a repeating task into a reusable, parameterized skill — the first "build" capability and the start of paid value.

### In scope
4.1 What a skill is (video) · 4.2 Build your first skill (skill builder) · 4.3 Build a skill for your role (skill builder, **branched ×5**) · 4.4 Test, refine, guardrail-check (skill builder).
### Out of scope
Agents/prototypes (M5).

### Functional requirements
- **FR-M4-1 Skill builder** (on the sandbox rail): create a parameterized prompt template with labeled **input slots + defaults**; save; run with new inputs; version. Inputs remain bounded/data-only (no injection).
- **FR-M4-2 Role skill** (4.3, ×5): prebuilt starting templates — Reg-E summarizer, member-comms clarifier, "ten competitors" research compiler, press-release generator, IT vendor checklist — learner customizes and saves a **Working Skill**.
- **FR-M4-3 Guardrail check** (4.4): the skill is validated against the data-discipline rule before save.
- **FR-M4-4 Takeaways:** Working Skill · Skill Template · **unlock full Prompt Library + unlimited Toolbox saves** (entitlement-gated).
- **FR-M4-5 Knowledge checks:** ~8 items, logged.

### State & events / Dependencies
Requires paid entitlement to access. Deps: Sandbox Platform · **Entitlement gating** `[Stripe][Supabase]` · Toolbox (unlimited) · Track system.
### Acceptance criteria
A saved skill re-runs with new inputs and produces consistent output; guardrail check blocks sensitive-data templates; all 5 track skills build and save; ≤15 min each.
### Assets
1 video · 1 skill-builder interactive · 5 role skill templates · 2 takeaway templates · ~8 checks.

---

# Module 5 PRD — From idea to prototype (agents & building)
**Tier:** Paid · **Lessons:** 5 · **Sandbox/builders:** 5.3, 5.4 · **Takeaways:** Agent Blueprint · PRD · Prototype · Problem Backlog · **Curriculum doc:** 🔲

### Purpose
Move the learner from consumer to builder: chain skills into an agent, frame a problem, write a lightweight PRD, and ship a working prototype.

### In scope
5.1 What an agent is (video) · 5.2 Framing a problem (video + worksheet) · 5.3 Writing a lightweight PRD (interactive) · 5.4 Build a prototype (interactive + link-out) · 5.5 Where to go next (audio).
### Out of scope
Production deployment; embedding third-party builders (link-out only).

### Functional requirements
- **FR-M5-1 Problem-framing worksheet** (5.2): brainstorm/plan template → **Problem Backlog** takeaway.
- **FR-M5-2 PRD builder** (5.3): guided form (problem, users, must-haves, constraints) → generates a lightweight **PRD `.md`** the learner can hand to a builder tool.
- **FR-M5-3 Prototype flow** (5.4): guidance + **link-out** to Lovable / Replit / Claude Code (learners use their own accounts; nothing embedded). Capture a link/reference as the **Prototype** artifact.
- **FR-M5-4 Agent Blueprint** takeaway (5.1): a chaining diagram/template.
- **FR-M5-5 Send-off** (5.5): upsell handoff to specialist tracks.
- **FR-M5-6 Knowledge checks:** ~10 items, logged.

### State & events / Dependencies
Requires paid entitlement. Deps: Entitlement gating · Toolbox · builder-tool link-outs.
### Acceptance criteria
PRD builder outputs a usable `.md`; prototype link saves to Toolbox; all takeaways persist; ≤15 min each (5.4 may guide an out-of-app build that runs longer — in-app time ≤15 min).
### Assets
2 videos · 1 audio · 1 worksheet · 1 PRD builder · 1 prototype flow · 4 takeaway templates · ~10 checks.

---

### Notes
- The **$99 Readiness Assessment** is a separate product (specced in the course PRD §6.6). It can get its own product PRD on request.
- If you'd prefer these as **six separate files** (one per module, paired beside each curriculum doc), say the word — straightforward to split.
