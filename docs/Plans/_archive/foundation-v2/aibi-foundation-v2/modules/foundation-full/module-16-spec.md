# Module 16: Role-Based Use Cases

**Pillar:** Application · **Duration:** 40 min · **Track:** Foundation Full
**Activity types used:** 8 (real-world capture), 4 (adaptive scenario)
**Daily-use outcomes:** Role Use-Case Card

---

## Why this module exists

Foundation is intentionally not split into role tracks (those are AiBI-Specialist). But every learner needs at least one fully-worked, role-specific application that ties everything in the course together. Module 16 is that bridge.

v2 expands from v1's 5 role families to 10 — enough that virtually every learner will see their role explicitly represented.

---

## Learning objectives

By the end, the learner will:

1. Read worked examples for their role family
2. Adapt one example to their specific position
3. Produce a fully-detailed Role Use-Case Card with realistic time and risk estimates
4. Plan to share the card with their manager and peers

---

## Activities

### Activity 16.1 — Pick your role family (2 min · type 1)

The platform asks the learner which role family fits best:

1. Operations
2. Lending
3. Compliance
4. Finance
5. Retail / Member Services
6. **BSA/AML** *(new in v2)*
7. **Internal Audit** *(new in v2)*
8. **IT / MSP Liaison** *(new in v2)*
9. **HR** *(new in v2)*
10. **Marketing** *(new in v2)*

Learner picks. Other families remain available to browse.

### Activity 16.2 — Walk through 5 examples for your family (15 min · type 4)

**Setup (1 min):** "Five examples from your role family. Each is a real, runnable use case at a $500M community bank. The platform will show you each, with the data tier, tool tier, and time/risk profile."

**The activity:**

For each role family, five worked examples (carrying forward from v1 for the original 5 families and authoring new for the new 5). Each example presented as a card with:
- Use case name
- Frequency
- Data tier
- Tool tier
- The prompt or workflow
- Sample sanitized output
- Time before/after AI
- Risk profile
- "Could you run this tomorrow?" (yes/no/with what)

Learner picks the closest to their actual job to adapt.

(Examples for the new families:)

**BSA/AML role family**

- BSA-1: Alert narrative drafting from structured case data (approved workflow only — Restricted)
- BSA-2: SAR draft refinement (approved workflow only — Restricted)
- BSA-3: Customer due diligence summary from open-source research (Public; Perplexity or Copilot Chat)
- BSA-4: BSA training scenario generation (Public; Copilot Chat)
- BSA-5: Regulatory bulletin reading and triage (Public; Copilot Chat or Claude)

**Internal Audit role family**

- IA-1: Audit work paper review for completeness (Confidential; M365 Copilot tenant-grounded)
- IA-2: Control narrative drafting (Internal; Copilot Chat)
- IA-3: Risk assessment language refinement (Internal; Copilot Chat)
- IA-4: Reading regulatory updates and mapping to existing controls (Public; Perplexity)
- IA-5: Interview question preparation (Internal; Copilot Chat)

**IT / MSP Liaison role family**

- IT-1: Vendor SOC 2 report summary and gap-analysis prompt (Confidential; M365 Copilot)
- IT-2: Internal IT ticket categorization and triage prompt (Internal; Copilot Chat)
- IT-3: Patch announcement drafting for end users (Internal; Copilot Chat)
- IT-4: Incident report drafting (Confidential; M365 Copilot)
- IT-5: AI vendor evaluation prep (uses Module 15 scorecard)

**HR role family**

- HR-1: Job description drafting (Internal; Copilot Chat)
- HR-2: Onboarding email composition (Internal; Copilot Chat)
- HR-3: Performance review language polish (Confidential — strip names; Copilot Chat with redaction)
- HR-4: Policy update communications (Internal; Copilot Chat)
- HR-5: Training material refresh (Internal; Copilot Chat)

**Marketing role family**

- MKT-1: Newsletter content drafting (Public; any tool)
- MKT-2: Member appreciation message (Internal; Copilot Chat)
- MKT-3: Community sponsorship response (Public; any tool)
- MKT-4: Fair-lending compliance check on draft campaigns (uses Module 7 lens; manager + compliance review)
- MKT-5: Rate sheet refresh narrative (Public; any tool)

### Activity 16.3 — Adapt your chosen example (15 min · type 8)

**Setup (1 min):** "Take the closest example. Make it yours."

**The activity:**

Learner takes the chosen example and customizes:

- Their specific task name
- Their actual frequency
- Their bank's specific tool (from Module 13)
- Their role-specific verification step
- Honest time-before/time-after estimates

Platform sends the system prompt to a default model with synthetic input matching the use case. Learner reviews output and adjusts.

**Capture:** customized Role Use-Case Card.

### Activity 16.4 — Plan to share (5 min · type 1)

**Setup (1 min):** "This card is most valuable when shared. The platform will format it and prompt next steps."

**The activity:**
1. Platform formats the customized card.
2. Learner picks: share with manager / share with peers / both / hold.
3. If share, platform generates an email draft with the card attached.

**Capture:** Role Use-Case Card → `module_16_role_use_case_card.md`.

---

## Daily-use outcomes

1. A **Role Use-Case Card** for one specific real task in the learner's role
2. **A planned share** — to manager, peers, or both
3. **Internalized pattern** — five role-specific examples the learner has seen and can adapt later

---

## Assessment criteria

- Role family chosen
- At least one example adapted with realistic detail
- Card has all required fields (data tier, tool tier, frequency, prompts, verification, time/risk)
- Share plan made

---

## Author/facilitator notes

- **Adding 5 role families is significant work.** The 25 new examples (5 families × 5 each) must be authored carefully and refreshed quarterly.
- **The BSA/AML examples are the most regulatory-sensitive.** Always emphasize "approved workflow only" for Restricted-tier work.
- **Sharing is voluntary, but encouraged.** Don't make it mandatory; manager visibility is the goal regardless.

---

## Dependencies and forward links

- **Depends on:** Modules 1–15 (synthesis module)
- **Feeds into:** Module 17 (Personal Prompt Library — the card becomes a flagship entry); Module 20 (Final Lab — the lab is often a deep-dive on this card); AiBI-Specialist (Departmental Skill Library is rolled-up cards)
