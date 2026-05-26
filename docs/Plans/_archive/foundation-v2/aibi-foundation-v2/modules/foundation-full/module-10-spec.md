# Module 10: Projects and Context

**Pillar:** Understanding · **Duration:** 20 min · **Track:** Foundation Full
**Activity types used:** 5 (build & test — multi-platform project build)
**Daily-use outcomes:** Project Brief deployable in two platforms

---

## Why this module exists

By Module 9, the learner has identified three high-fit candidate tasks. Module 10 turns one of those tasks into a *project* — a persistent context (system prompt + reference materials) the learner returns to every time they pick up the work.

The activity has the learner build the same project on *two* different platforms (Claude Projects and a Custom GPT, for example) so they can see that the project pattern is universal — not platform-specific.

---

## Learning objectives

By the end, the learner will:

1. Define a project as a persistent context (system prompt + reference files + ongoing history)
2. Write a 5-part system prompt (role, context, rules, format, what to ask)
3. Deploy the same project on two different platforms
4. Capture a Project Brief that documents the project for the long term

---

## Activities

### Activity 10.1 — Anatomy of a project (3 min · reading + quick pick)

**Setup (1 min):** "A project has three parts. You'll build all three."

**The activity:**
- Platform displays the three parts (system prompt / reference materials / conversation history) with banking examples.
- Learner picks one of their top-3 candidates from Module 9 to be their first project.

### Activity 10.2 — Build & test the system prompt (10 min · type 5)

**Setup (1 min):** "Write the system prompt for your project. The platform will stress-test it."

**The activity:**
1. Platform displays a system prompt editor with five labeled sections:
 - ROLE
 - CONTEXT
 - RULES (including data discipline rules)
 - FORMAT
 - WHAT TO ASK ME
2. Learner drafts each section. Platform offers banking-flavored examples if stuck.
3. Learner clicks "Test." Platform sends the system prompt + a battery of realistic user prompts to a default model and shows responses.
4. Platform also runs three stress tests:
 - **Vague input** — does the system prompt prompt the learner to clarify?
 - **Wrong-tier input** — if the learner pastes "John Smith account #123-456-789," does the system prompt's data rule kick in?
 - **Off-task input** — does the system prompt narrow scope, or does it sprawl?
5. Results displayed. Learner iterates.

**Capture:** the working system prompt + stress-test results → embedded in the Project Brief.

### Activity 10.3 — Deploy across two platforms (5 min · type 5)

**Setup (1 min):** "The same project pattern works in different tools. Deploy yours in two."

**The activity:**

Learner deploys the system prompt in:
- **Claude Projects** (within the platform's Claude integration)
- **A Custom GPT** (within the platform's ChatGPT integration)

For each, the learner runs one realistic input and compares responses.

The platform shows that project results vary by model — same system prompt, different output styles.

**Capture:** notes on which model handled the project better → addendum to the Project Brief.

### Activity 10.4 — Document the Project Brief (1 min · capture)

**The activity:** platform pre-fills the Project Brief template with everything from the prior activities. Learner reviews and saves.

**Capture:** complete Project Brief → `module_10_project_brief.md`.

---

## Daily-use outcomes

1. A **Project Brief** the learner can use to set up the same project on any platform
2. **A working system prompt** that has been stress-tested
3. **Multi-platform fluency** — the learner has deployed projects in two tools and seen the differences

---

## Assessment criteria

- System prompt has all 5 sections
- Stress-tests show the system prompt resists at least 2 of 3 attack types (vague / wrong-tier / off-task)
- Project deployed in at least 2 platforms (or 1 platform + clear documentation if only 1 is approved)
- Project Brief captures everything for future re-deployment

---

## Author/facilitator notes

- **The "back at the bank" callout matters here.** Most $500M community banks won't have approved Claude or Custom GPT for production use. Be explicit: the platform exposure is for learning. At the bank, learners apply the *pattern* using approved tools (Copilot Chat saved chats, M365 Copilot in Word, etc.).
- **Stress-test inputs must be calibrated quarterly.** The model behaviors change.
- **Multi-platform deploy is optional if a learner only has access to one platform.** The platform should detect this and adapt.

---

## Dependencies and forward links

- **Depends on:** Modules 4 (data discipline), 8 (prompting), 9 (top-3 candidates)
- **Feeds into:** Modules 11 onwards (every Creation activity benefits from project thinking); Module 17 (Personal Prompt Library entries can reference projects)
