# Module 13: AI Tools Comparison Lab

**Pillar:** Creation · **Duration:** 30 min · **Track:** Foundation Full
**Activity types used:** 2 (multi-model comparison — extended), 5 (build & test)
**Daily-use outcomes:** Personal Tool Choice Map (evidence-based)

---

## Why this module exists

In v1, "AI Tools Landscape" was an information-delivery module. In v2, it's an evidence lab: the learner runs the *same banking task* across all four major tools (Claude, ChatGPT, Gemini, M365 Copilot) and produces a Tool Choice Map based on their *own* observations — not on a vendor comparison table.

This is the module where the learner moves from "I have a vague preference" to "I have data on which tool fits which job."

---

## Learning objectives

By the end, the learner will:

1. Run the same task across four tools and observe meaningful differences
2. Articulate which tool is best for which workflow type, based on evidence
3. Apply the data-tier rules to all four tools
4. Produce a personalized Tool Choice Map that reflects their role's needs

---

## Activities

### Activity 13.1 — The big four-tool task (20 min · type 2)

**Setup (1 min):** "One task. Four tools. You'll run all four and compare."

**The activity:**
1. Platform presents a multi-part banking task that touches all the workflow types:
 - Summarize an attached internal procedure (Internal-tier, synthetic)
 - Extract 5 action items as a structured table
 - Draft a member-facing email about the procedure change
 - Compare the change to the previous procedure version (also attached)
2. Learner sends the *same prompt set* to four tools: Claude, ChatGPT, Gemini, and (if available) M365 Copilot Chat with file attachment.
3. Outputs come back. Side-by-side comparison.
4. Learner annotates each output:
 - Which tool produced the cleanest summary?
 - Which extraction was most accurate?
 - Which email matched the bank voice best?
 - Which comparison was most useful?
5. Platform asks for a one-line "winner" for each workflow type.

**Capture:** four annotated outputs + a workflow-by-workflow ranking.

### Activity 13.2 — The data-tier and tool-tier overlay (5 min · type 3)

**Setup (1 min):** "Capability is one axis. Data tier is the other. Sort each tool by what it can handle at your bank."

**The activity:**

Drag-and-drop interface: four tools across the data tiers (Public / Internal / Confidential / Restricted).

The *correct* placement reflects both vendor terms and the bank's approval status:
- Claude (free, personal): Public only
- Claude (Enterprise, if approved): up to Confidential
- ChatGPT (free, personal): Public only
- ChatGPT (Team/Enterprise, if approved): up to Confidential
- Gemini (free, personal): Public only
- Gemini (Workspace, if approved): up to Confidential if you're a Google shop
- M365 Copilot Chat (work account, free with M365): Internal
- M365 Copilot (paid, tenant-grounded): up to Confidential, with approved Restricted workflows

The platform gives feedback that distinguishes "what the tool can technically do" from "what your bank has approved for it."

**Capture:** correct tier placements → Personal Tool Choice Map section.

### Activity 13.3 — Build your Tool Choice Map (5 min · type 1)

**Setup (1 min):** "Now combine evidence and approvals into your map."

**The activity:**
1. Platform pre-fills a Tool Choice Map with:
 - The learner's workflow-by-workflow rankings from 13.1
 - The tier placements from 13.2
2. Learner adds:
 - Their bank's specific approved tools (likely Copilot Chat as the floor)
 - Their default tool for each of their top-3 candidate tasks (from Module 9)
 - Three tasks they will *not* pick a tool for themselves — they'll escalate

**Capture:** Personal Tool Choice Map → `module_13_tool_choice_map.md`.

---

## Daily-use outcomes

1. A **Tool Choice Map** built from the learner's own observations across four tools
2. **Multi-tool fluency** — the learner has used four major AI tools on real banking tasks
3. **A defensible answer** to "which tool for which job?" backed by evidence, not vendor marketing

---

## Assessment criteria

- All four tools used in 13.1
- Workflow-by-workflow rankings filled with reasoning
- Tier placements correct (with feedback iteration)
- Tool Choice Map filled with role-specific defaults and at least 3 escalation triggers

---

## Author/facilitator notes

- **Make the multi-part task realistic.** The whole point is that no tool dominates everything. Choose tasks that exercise different model strengths.
- **The "M365 Copilot if available" caveat:** not every bank has M365 Copilot deployed. The platform should detect or ask, and adapt the activity to three-tool comparison where needed.
- **Quarterly refresh is mandatory.** This module ages faster than any other. Re-run the comparison task every quarter.

---

## Dependencies and forward links

- **Depends on:** Modules 8, 11, 12 (all give the learner the workflows to compare)
- **Feeds into:** Module 17 (Personal Prompt Library — each entry tags its tool); Module 20 (Final Lab requires picking the right tool for the scenario)
