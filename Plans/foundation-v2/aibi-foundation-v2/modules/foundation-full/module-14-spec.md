# Module 14: Agents and Workflow Thinking

**Pillar:** Creation · **Duration:** 30 min · **Track:** Foundation Full
**Activity types used:** 5 (build & test — workflow builder), 7 (tabletop)
**Daily-use outcomes:** Workflow Map; first low-code agent design

---

## Why this module exists

The course has, until now, treated AI as a single-step assistant. Module 14 introduces multi-step thinking: workflows where each step is either an AI call or a human checkpoint, and lightweight agents that string steps together autonomously.

The activity has the learner build a real workflow for one of their recurring tasks, stress-test it for the human checkpoints, and design (but not deploy) a simple agent. Agent deployment belongs in AiBI-Specialist; Foundation teaches the *thinking*.

---

## Learning objectives

By the end, the learner will:

1. Distinguish workflow from project from one-shot
2. Build a workflow with explicit AI steps and human checkpoints
3. Identify where checkpoints are mandatory (member-impact, decision points)
4. Sketch a low-code agent design with bank-grade guardrails

---

## Activities

### Activity 14.1 — Workflow builder (15 min · type 5)

**Setup (1 min):** "Take one of your top-3 candidate tasks. Map it out as a current workflow. Then redesign with AI."

**The activity:**
1. Platform displays a two-column workflow editor:
 - Left: current workflow (no AI), step by step
 - Right: redesigned workflow with AI steps and human checkpoints
2. Each step on the right is tagged: AI step / Human checkpoint
3. Each AI step is tagged with: data tier + tool tier
4. Platform validates as the learner builds:
 - At least one human checkpoint required
 - Member-impact workflows must have a human checkpoint immediately before output leaves the bank
 - Restricted-tier steps must have approved-workflow tag
5. Platform asks the learner to enter approximate timings for each step (before/after).
6. Learner clicks "Test." Platform sends sample inputs through the workflow's AI steps and reports.

**Capture:** Workflow Map → `module_14_workflow_map.md`.

### Activity 14.2 — Agent design sketch (10 min · type 5)

**Setup (1 min):** "An agent is a workflow with autonomy. You'll sketch one — not deploy."

**The activity:**

Platform displays the agent-design template:

| Field | Description |
|---|---|
| Agent name | What it's called |
| One-sentence purpose | Job description |
| Trigger | What makes it run (e.g., new email in shared inbox, scheduled time, manual button) |
| Steps | What it does, in order — with AI steps tagged |
| Tools the agent can read | Email, files, transcript — read-only access |
| Tools the agent can write | (Should be VERY narrow) |
| Human checkpoint | Where the human approves before any external action |
| Audit trail | What's logged |
| Boundary | What the agent will NEVER do |

Learner builds the sketch for one of these scenarios (or their own):

- An agent that triages incoming member emails and posts cards to a Teams channel for human pickup
- An agent that summarizes weekly meeting transcripts and emails the summary to a distribution list
- An agent that watches a regulatory feed and posts new bulletins to a compliance Teams channel

Platform validates:
- At least one human checkpoint
- Audit trail specified
- Boundary explicit
- Tier-appropriate

**Capture:** agent-design sketch → `module_14_agent_design_sketch.md`.

### Activity 14.3 — Tabletop: when agents go wrong (4 min · type 7)

**Setup (1 min):** "Three brief scenarios where agents fail. Walk through each."

**The activity:**

Three short tabletops:

1. *"Your email-triage agent miscategorizes a member's complaint as spam. The member doesn't get a human response for three days. What broke? What do you change?"* → answer: missing human checkpoint on classification edge cases; need a periodic spam-bucket review.

2. *"Your summary agent's output included a hallucinated 'action item' that the team chased for a week. What broke?"* → answer: missing verification step; need source-quote verification in the agent's output format.

3. *"Your regulatory-feed agent stopped posting because the source feed changed format. Compliance hasn't seen a new bulletin in 30 days. What broke?"* → answer: silent failure mode; need monitoring and alerts.

**Capture:** lessons → addendum to the agent-design sketch.

---

## Daily-use outcomes

1. A **Workflow Map** for a real recurring task
2. An **agent-design sketch** the learner could take to IT/the AI program owner
3. **Realistic agent intuition** — including the failure modes

---

## Assessment criteria

- Workflow has at least one human checkpoint and tier-appropriate AI steps
- Agent sketch has all required fields including audit and boundary
- All three tabletops correctly identify the failure mode and remediation

---

## Author/facilitator notes

- **Don't hype agents.** The current AI ecosystem is full of overstated agent claims. Module 14 must give learners a clear-eyed view that includes operational complexity and governance load.
- **Light MCP touch.** If a learner asks about MCP servers, mention briefly as "a way some AI tools connect to other systems — covered in Specialist tier" and move on.
- **The boundary field is the most important.** A well-bounded agent is governable; an open-ended agent is not.

---

## Dependencies and forward links

- **Depends on:** Modules 5 (cyber/threats — agents have unique risks), 7 (regulatory routing), 10 (projects), 11–12 (document/spreadsheet workflows)
- **Feeds into:** Module 16 (some role use cases are workflows); Module 18 (Incident Response — the third tabletop is a bridge); AiBI-Specialist (Week 3 deep-dives agents)
