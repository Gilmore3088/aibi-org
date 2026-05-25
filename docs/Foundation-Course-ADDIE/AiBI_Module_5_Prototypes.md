# Module 5 — From idea to prototype *(detailed curriculum)*
### AiBI Foundation Course · "We turn your bankers into your builders."

| | |
|---|---|
| **Tier** | Paid (final module — the bridge from banker to builder) |
| **Lessons** | 5 (1 video · 1 audio · 1 worksheet · 2 interactive) |
| **Total runtime** | ~62 min in-app *(plus 1–2 hours of out-of-app prototype build between 5.3 and the end of 5.4)* |
| **Sandbox** | None — M5 uses worksheets + PRD builder + an out-of-app prototyping tool (Lovable / Replit Agents / Claude Code / v0) |
| **Module takeaways** | **Agent Blueprint** (5.1 — chaining diagram/template) · **Problem Backlog** (5.2) · **PRD** (5.3) · **Prototype URL** (5.4) |
| **Module objective** | The learner can frame a real problem from their week, write a one-page PRD a builder can act on, hand that PRD to a prototyping tool, and come back with a working URL — without violating data discipline at any step. |

**How to read this spec.** Same rail as M0 and M4: **Hook → Teach → Do → Take → Check**, with **SCRIPT (verbatim)** and **PRODUCTION** layers. None of M5 is branched ×5 tracks per spec; the track-aware framing comes in via examples inside the worksheet placeholders, not via separate variants.

**Why this module exists.** The course's promise was "we turn your bankers into your builders." M5 is where the bridge gets walked. Most learners exit M4 with a personal library of skills and the conviction that AI is useful. M5 asks the next question: what is the smallest real thing you could ship at your bank by Friday? Then it gives the learner the framing and tools to ship it — in a tool they keep, outside this course.

**Prerequisite artifacts** (must exist in Toolbox before M5 starts):
- A Working Skill from M4
- An entry from the M2.4 "Where AI fits" worksheet
- An active Foundation entitlement

---

## Lesson 5.1 — What an agent is, honestly
**Video · ~12 min · Paid**
**Objective:** *Distinguish* assistants, skills, and agents by review-loop length; *understand* what is realistic to deploy in a community bank in 2026.

| Beat | Time |
|---|---|
| Hook | 0:00–0:30 |
| Teach | 0:30–8:00 |
| Do (anchor card review) | 8:00–10:00 |
| Take + Check | 10:00–12:00 |

### HOOK
**SCRIPT (verbatim):**
> "Assistant, skill, agent. Used interchangeably in trade press; not the same thing. The difference matters the moment you build."

**PRODUCTION:** Three labelled columns build as the narrator names each shape. Above them, a single dimension: *review-loop length*. The agent column gets the oxblood rule (`--ledger-weak`) — not because the technology is bad, but because shipping one inside a bank in 2026 is the rare case, not the default.

### TEACH
**SCRIPT (verbatim):**
> "Three shapes. Three honest definitions.
>
> **Assistant — the chat box.** You ask, it answers, you decide. Everything in Module 3 lives here. Every step reviewed by a human. Highest fidelity, slowest cadence. The right shape for any output that goes to a member or a regulator.
>
> **Skill — the assistant with a job.** You set it up once and reuse it many times against the same shape of task. The Workbench Pack you built in Module 4 is five skills. Human is still in every loop; the loop is just shorter.
>
> **Agent — a string of AI steps that take actions.** Step one decides. Step two does. Step three checks. Step four loops back. Inside that loop the agent takes actions — reads a file, writes a record, calls an API, sends a message — without asking you first. Today's agents drift outside their sandbox, invent plausible-wrong steps, and occasionally take actions the loop didn't catch.
>
> One rule for the rest of this module: **anything you prototype is a draft, not a deployment.** Drafts do not go in front of members. Drafts do not connect to systems of record. Drafts do not get permission to move money. The point of the Foundation Course is to frame, scope, and prototype well enough that the people who can actually ship it build on what you handed them. That is the bridge from banker to builder."

**PRODUCTION:**
- Three case cards in sequence: assistant (good), skill (good), agent (bad).
- Closing card: "Draft, not deployment. Banker to builder. That is the bridge."

### DO — Agent Blueprint *(light interaction, ~90 s)*
A single-screen interaction: the learner clicks through a four-step chaining diagram (Step 1 decides · Step 2 does · Step 3 checks · Step 4 loops/stops). Each step renders a tile with a one-line example for the learner's track. Save fires the `aibi:artifact-saved` event and writes the Toolbox row.

### TAKE — Agent Blueprint *(Toolbox artifact)*
A `.md` artifact with the four-step chaining diagram + the track-specific example + the "draft not deployment" rule baked into the footer. Per the Module PRD (FR-M5-4) this is a first-class M5.1 takeaway, not a bonus. Template at `content/addie/toolbox-templates/m5/agent-blueprint.md`.

### CHECK
1. *Which shape is right for member-facing output?* → **Assistant — every step reviewed.**
2. *What's the agent rule for the rest of M5?* → **Draft, not deployment. No systems of record, no member surfaces, no money movement.**
3. *Fastest way to spot an oversold agent demo?* → **Ask "what happens if step 3 returns a plausibly wrong result?" If the answer is a hand-wave, no review point.**

---

## Lesson 5.2 — Framing a problem worth building for
**Worksheet · ~12 min · Paid · Toolbox artifact: Problem Backlog**
**Objective:** *Frame* three real problems from the learner's own week using the 5-question template; *save* the backlog.

| Beat | Time |
|---|---|
| Hook | 0:00–0:30 |
| Teach | 0:30–3:30 |
| Do (3 problem frames) | 3:30–11:00 |
| Take + Check | 11:00–12:00 |

### HOOK
**SCRIPT (verbatim):**
> "Most early AI projects fail by building the wrong thing well. The fix: write the problem down before you build, in a shape a builder reads in thirty seconds."

**PRODUCTION:** Five labelled fields in a vertical stack. Each shows a placeholder example pulled from the learner's track.

### TEACH
**SCRIPT (verbatim):**
> "Five questions. Each one tightens the frame.
>
> **Who** has the problem? A specific role, not 'customers' or 'the team.' 'A teller on the consumer line Tuesday afternoon' is a who. 'The bank' is not.
>
> **What breaks?** Concrete moment, not abstract metric. 'A member calls about a hold; the teller needs forty minutes to figure out which hold' beats 'service times are too long.'
>
> **Current workaround.** What does the person actually do today? Even 'they apologise and the member hangs up' is information about where the floor is.
>
> **What good looks like.** Describe the moment, not the solution. 'Teller answers in under five minutes with the right explanation' is a frame. 'Deploy an agent' is a guess at the means.
>
> **Why now?** External pressure or carried-too-long pain? Both answers are useful; pretending you don't need to know is not.
>
> Three filled frames make a Problem Backlog. The best one becomes your Lesson 5.3 PRD. The other two stay in your Toolbox — most learners build one of them within six months."

**PRODUCTION:**
- Each of the five fields gets a one-line guidance tooltip on first focus.
- A soft progress strip across the top fills as fields are completed; the third filled frame triggers the "Save Problem Backlog" CTA.

### DO — Problem framer ×3 *(interactive)*
**PRODUCTION:** `ProblemFrame` widget (Wave 3a). On save, writes `addie.toolbox_items` with `type = 'problem_backlog'` containing all three frames as structured JSON.

### TAKE — Problem Backlog artifact
```
backlog:
  - who: "..."
    what_breaks: "..."
    current_workaround: "..."
    what_good_looks_like: "..."
    why_now: "..."
    is_lead_frame: true   # the one chosen for 5.3's PRD
  - { ... second frame ... }
  - { ... third frame ... }
```

### CHECK
1. *What does "describe the moment, not the solution" mean?* → **Outcome language ('teller answers in five minutes') beats means language ('deploy an agent').**
2. *Why three frames, not one?* → **Two will become PRDs within six months; the spare is leverage, not waste.**
3. *Why "why now"?* → **Tells you whether you have permission to build or whether you're about to fight for budget.**

---

## Lesson 5.3 — Writing a lightweight PRD
**Interactive · ~15 min · Paid · Toolbox artifact: PRD**
**Objective:** *Convert* the lead frame from 5.2 into a one-page PRD with nine sections; *export* as markdown.

| Beat | Time |
|---|---|
| Hook | 0:00–0:30 |
| Teach | 0:30–3:30 |
| Do (PRD builder, 9 sections) | 3:30–13:00 |
| Take + Check | 13:00–15:00 |

### HOOK
**SCRIPT (verbatim):**
> "One-page PRD. Thirty minutes the first time, ten the next. The single most useful artifact when you want a builder — model or human — to come back with a real thing."

**PRODUCTION:** A blank PRD shell renders on the right; the nine section labels fade in. On the left, the learner's lead frame from 5.2 is pinned as a reference panel.

### TEACH
**SCRIPT (verbatim):**
> "Three rules before the nine sections.
>
> **Contract, not wish list.** Every line is a promise to build or a promise not to build. If a sentence doesn't narrow the build, cut it.
>
> **Goal sentence is the whole PRD compressed.** Outcome, not feature. 'A teller finds the right hold explanation in under two minutes' is a goal. 'We will build a hold-explainer skill' is a feature disguised as a goal. Spend ten minutes on the goal; the other eight sections fall out.
>
> **Non-goals stop scope creep.** Two or three lines. 'Not replacing the core. Not handling escalations. Not customer-facing yet.' Every shipped PRD had non-goals; every PRD that turned into a quarter-long mess did not."

**PRODUCTION:**
- The PRD Builder enforces ≥6 of 9 sections before save (per Wave 3a spec).
- Each section field shows the one-line guidance from the SCRIPT as placeholder.
- "Export as markdown" button highlights once all nine sections have content.

### DO — PRD Builder *(interactive)*
**PRODUCTION:** `PRDBuilder` widget (Wave 3a). On save, writes `addie.toolbox_items` with `type = 'prd'`. The body_md is the full PRD as a single markdown file, ready to paste into a prototyping tool in 5.4.

The nine sections:
1. **Goal** — one sentence, outcome not feature
2. **Non-goals** — two or three lines
3. **Users** — sharpened "who" from 5.2
4. **Constraints** — time, budget, data discipline, regulatory
5. **Success criteria** — two or three measurable things
6. **Scope (in)** — 3–7 bullets
7. **Scope (out)** — same length
8. **Dependencies** — what has to be in place + who owns it
9. **Risks** — two or three failure modes + mitigations

### TAKE — PRD artifact
A single `.md` file in the Toolbox under the M5 collection. The file is the entire prompt for 5.4.

### CHECK
1. *What separates a PRD that ships from a PRD that gets ignored?* → **Contract not wish list, outcome goal, named non-goals.**
2. *What's the success-criteria bar?* → **Measurable without asking anyone — time saved, errors avoided, completions before escalation. "People will say they like it" fails.**
3. *Why write success criteria right after the goal, not last?* → **If you can't name two measurable outcomes immediately, the goal is still too fuzzy. Tighten the goal first.**

---

## Lesson 5.4 — Build a prototype
**Interactive + out-of-app · ~15 min in-app + 1–2 hours external · Paid · Toolbox artifact: Prototype URL**
**Objective:** *Pick* a prototyping tool that fits the PRD shape, *paste* the PRD as opening prompt, *iterate* until the core moment works end-to-end, *return* with a live URL.

| Beat | Time |
|---|---|
| Hook | 0:00–0:30 |
| Teach | 0:30–4:00 |
| Do (tool launcher + external build) | 4:00–13:00 in-app *(plus external build time)* |
| Take + Check | 13:00–15:00 |

### HOOK
**SCRIPT (verbatim):**
> "Fifteen minutes here; the build is the next hour or two outside this course. Bring back a URL."

**PRODUCTION:** Four tool cards lay out left-to-right. Each carries a one-line shape descriptor and a "match to your PRD" indicator that the launcher computes from the PRD's scope section.

### TEACH
**SCRIPT (verbatim):**
> "Three things to get right before you open the prototyping tool.
>
> **Pick the tool that fits the shape.** Lovable for marketing pages and small web apps. Replit Agents for working scripts and small tools that run. Claude Code for real files in a real project another developer could continue. v0 for clickable React UI mockups. Match the tool to the artifact, not to the brand you have heard about most.
>
> **PRD as opening prompt.** Your saved PRD is a complete brief. Paste the whole document. Resist summarising — the constraints and non-goals are exactly what stops the tool drifting into a generic build. Iterate for an hour. The useful version arrives on the second iteration, not the first.
>
> **Synthetic data only.** A prototype builder is an AI tool with extra hands — file system access, code execution, sometimes a deploy step. Invented names, account shapes, amounts. The temptation to paste real records 'to make the demo more compelling' is the single most expensive mistake learners make. Don't be the test case."

**PRODUCTION:**
- The launcher shows the four tools as a grid. Hovering one expands a "best for" descriptor.
- After the learner returns and submits a URL + a one-paragraph description, the launcher confirms and shows the saved Prototype artifact in the Toolbox sidebar.

### DO — Tool launcher + external build *(interactive)*
**PRODUCTION:** `PrototypeLauncher` widget (Wave 3a). On URL submit, writes `addie.toolbox_items` with `type = 'prototype'` containing `{ url, description, tool_used }`. The learner can re-enter to update the URL (re-deploys, post-iteration revisions).

### TAKE — Prototype URL artifact
A single Toolbox record with `{ url, description, tool_used }`. The Prototype is the most-shared artifact in the course — operators see in analytics that learners who ship a Prototype URL are 3-4× more likely to bring a peer along (M5.5 direction one).

### CHECK
1. *What's "done enough"?* → **Stakeholder can click through, the PRD's core moment works end-to-end, you'd walk a peer through it without apologising. Live link, not a screenshot.**
2. *Why paste the whole PRD, not a summary?* → **Constraints and non-goals are what stops the tool drifting into a generic build.**
3. *What's the rule on real customer data inside the prototype builder?* → **No. Synthetic only. Builders have hands — file access, code execution, sometimes deploys — and the audit trail is harder to clean than for an assistant.**

---

## Lesson 5.5 — Where to go next
**Audio · ~8 min · Paid · No new artifact (closes the course)**
**Objective:** *Pick* one ninety-day direction; *understand* what comes after Foundation; *commit* to one shipped artifact a week.

| Beat | Time |
|---|---|
| Hook | 0:00–0:30 |
| Teach | 0:30–6:30 |
| Do (direction pick) | 6:30–7:30 |
| Take + Check | 7:30–8:00 |

### HOOK
**SCRIPT (verbatim):**
> "You finished. You now hold a Data Discipline Card, an AI Toolkit Map, a First Conversation, a Starter Prompt Pack, a Workbench Pack, a Problem Backlog, a PRD, and a prototype URL. That is not AI literacy. That is a practice."

**PRODUCTION:** Audio lesson. On-screen: a list of every Toolbox artifact the learner produced across M0–M5, animated in as the artifact name is spoken.

### TEACH
**SCRIPT (verbatim):**
> "Three things to settle before you close the tab.
>
> **Pick one direction for ninety days.** Deepen one skill — sharpen one of your Workbench skills for a month and become the in-house AI workflow person. Bring a peer along — walk a teammate through the modules; that's how a practice becomes a culture. Or build out the prototype — find a stakeholder who cares and turn the URL into a small real thing. Pick one. All three at once is how the practice fades by month two.
>
> **What comes after Foundation.** Two further credentials are shaping. AiBI-S, Specialist, goes deep on one operational area you have already chosen — Operations, Lending, Risk, IT. AiBI-L, Leader, is for the people who will own AI as a function inside their institution. Neither open yet. No scarcity script — you have the artifacts; you don't need the badges to do the work.
>
> **Ship one artifact a week.** Refined prompt. New skill. Tightened PRD. The Toolbox is memory; the work is yours.
>
> Close the tab. Open one prompt from your Pack. Use it before you stand up from this desk. That is the whole point."

**PRODUCTION:**
- The artifact list cross-fades to a single CTA card: "Open your Toolbox."
- Final still card: "From 'I've heard of it' → 'I built it.' The bridge held."

### DO — Direction pick *(light interaction)*
A single 3-option radio: deepen / bring a peer / build out. Selection writes `addie.learner_profiles.ninety_day_direction`. Used by ops follow-up emails 30 / 60 / 90 days post-completion.

### TAKE — No new artifact
Module closes the course. Toolbox is the takeaway.

### CHECK
1. *Default direction if you can't decide?* → **Bring a peer along — teaching is the fastest way to find what you actually understand.**
2. *What signals when AiBI-S / AiBI-L credentials open?* → **Toolbox-saved learners hear first; no scarcity script, no promises about dates.**
3. *What's the smallest unit of compounding?* → **One shipped artifact a week.**

---

## Module artifacts summary

| Lesson | Toolbox artifact | Type |
|---|---|---|
| 5.1 | Agent Blueprint | `agent_blueprint` |
| 5.2 | Problem Backlog (3 framed problems) | `problem_backlog` |
| 5.3 | PRD (one-page markdown) | `prd` |
| 5.4 | Prototype URL + description | `prototype` |
| 5.5 | *(none — direction written to profile)* | — |

By the end of M5 — and by the end of the Foundation Course — the learner's Toolbox holds **at least 8 artifacts** across the six modules. That is the real measure of completion; the certificate (if it ships) is downstream.

## Reconciliation with AiBI_Module_PRDs.md (M5) and the seeded SQL

The Module PRD (`AiBI_Module_PRDs.md`) and the implementation seed
(`supabase/seed/m5_addie.sql`) diverge in two places. **The seed is the
implementation truth; this curriculum doc has been amended to match.**

| Item | PRD says | Seed (and this doc) say | Resolution |
|---|---|---|---|
| Prototyping tools | "Lovable / Replit / Claude Code" (3 tools, FR-M5-3) | "Lovable / Replit Agents / Claude Code / v0" (4 tools) | Seed wins. v0 added for UI/UX clickable-mockup PRDs — a shape the PRD did not anticipate. |
| Agent Blueprint placement | PRD lists Agent Blueprint as a first-class M5.1 takeaway (FR-M5-4) | Originally this doc treated it as optional/bonus; **amended above** to match the PRD | PRD wins. M5.1 now produces the Agent Blueprint as its Toolbox artifact. |

## Operator notes

- **No sandbox in M5.** 5.4 explicitly hands the work out of this course; we do not embed prototyping tools. The launcher is read-only metadata.
- **Entitlement gate:** `/foundation/m5/*` checks `hasAnyFoundationEntitlement(user)`. Non-entitled users see `PaywallPreview` with the M5.1 anchor card as the public-facing preview.
- **Prototype URL retention:** Toolbox records keep the URL for the lifetime of the Toolbox; we do not crawl, validate, or store the prototype's content. The URL is the learner's, hosted on the prototyping tool's domain.
- **Tests:** `PRDBuilder.test.tsx`, `ProblemFrame.test.tsx`, `PrototypeLauncher.test.tsx`, `m5_seed.test.ts`. 12/12 passing as of 2026-05-24.
