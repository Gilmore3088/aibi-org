# Skill Pedagogy Reference — AIDB Skills Master Class

**Source:** AIDB Operators Cut — Skills Master Class (Nufar Gaspar + Nathaniel Whittemore)
**Saved:** 2026-04-16
**Purpose:** Enrich AiBI-P M6-M8 skill modules with proven teaching patterns

## Key Concepts to Incorporate into AiBI-P

### 1. The 5 Skill Killers (for M6 — Anatomy of a Skill)

| # | Killer | Problem | Fix |
|---|--------|---------|-----|
| 1 | Description doesn't trigger properly | Too vague, too narrow, or wrong person | Specific, loud, third-person. "Use when..." format |
| 2 | Over-defining the process | Railroading instead of guiding | Set degrees of freedom: tight for fragile ops, loose for creative |
| 3 | Stating the obvious | Wasting tokens on what the model knows | Challenge every paragraph: "Does Claude really need this?" |
| 4 | Missing gotcha section | Not capturing failure patterns | Document every failure you've seen. This IS the value |
| 5 | Monolithic blob | Everything in one file | SKILL.md under 500 lines. Move references to separate files |

### 2. Extended Skill Anatomy (enhances RTFC framework)

| Component | What It Does | Banking Adaptation |
|-----------|-------------|-------------------|
| name | Lowercase, hyphens, max 64 chars. Gerund form | loan-file-completeness-check |
| description | A TRIGGER, not a summary. "Use when..." format | "Use when a loan officer uploads a file for QC review" |
| Instructions | Numbered steps or bulleted lists over prose | Tight for compliance tasks, loose for research |
| Output Format | Show, don't describe. Include a literal template | Include the exact memo format your institution uses |
| Gotcha Section | Highest-signal content. Where the model goes wrong | "Do not cite regulatory statutes without [VERIFY] flag" |
| Constraints | What NOT to do. Sharp and specific | "Never include member PII in output" |

**Skip the Role/Identity section** — legacy prompt engineering. Tell the model what YOUR approach does differently, not what persona to adopt.

### 3. Two Fundamental Skill Types

| Type | What It Does | Durability |
|------|-------------|------------|
| Capability Uplift | Enables functions the model can't do well on its own | May become obsolete as models improve |
| Encoded Preference | Sequences existing capabilities according to YOUR workflow | Gets more valuable over time |

**Key insight:** Spend most time on PREFERENCE skills. They encode how YOUR team works.

### 4. The Litmus Test (for M8 — Iterate)

"If you find yourself having to iterate and refine the output AFTER the skill runs — editing, correcting, restructuring — then the skill itself needs improvement. A well-built skill produces output you can use directly."

### 5. Progressive Disclosure in Skill Design

| Layer | What Loads | Token Cost |
|-------|-----------|------------|
| 1. Description | ~100 tokens in system prompt | Always loaded |
| 2. SKILL.md body | Full instructions | Only when triggered |
| 3. Folder contents | Scripts, assets, references | Only when needed |

### 6. Context Binding Rule

| Put in the folder when... | Point externally when... |
|---------------------------|------------------------|
| Context is specific to this skill and travels with it (rubric, template, persona, examples) | Context is shared across skills or changes independently (CLAUDE.md, project docs, stakeholder list) |

Rule of thumb: "about the skill" = inside. "About you/your org" = outside.

### 7. When to Re-evaluate Your Skills

| Trigger | What to Do |
|---------|-----------|
| Model change | New model drops — gotcha section might solve problems the new model doesn't have |
| Tool change | Moving between tools? Skills are portable but behaviors differ. Validate. |
| Results degrade | Before blaming the model: did YOUR context go stale? |
| Before scaling | About to share with 50 people? Run proper evals first |
| Quarterly | Even if nothing seems broken. Capability skills may have been surpassed by the base model |

### 8. 4 Universal Starter Skills (adapt for banking)

1. **Research with Confidence** — multi-source research with confidence scoring and cross-source fact-checking
   - Banking: regulatory research, competitor analysis, market conditions
2. **Devil's Advocate** — identify hidden assumptions, construct strongest counter-arguments, find blind spots
   - Banking: credit exception review, strategic proposal stress-testing
3. **Morning Briefing** — structured daily brief from calendar, priorities, pending items
   - Banking: branch manager daily prep, executive morning brief
4. **Board of Advisors** — multi-perspective review from expert archetypes (Strategist, Operator, etc.)
   - Banking: loan committee simulation, ALCO scenario analysis

### 9. Advanced Patterns (AiBI-S content)

| Pattern | What It Does | Banking Example |
|---------|-------------|-----------------|
| Skill Dispatcher | Meta-skill routing to the right skill | Route by document type: loan app → QC, complaint → UDAAP review |
| Skill Chaining | Output of one → input to another | Research → Devil's Advocate → Executive Summary |
| Loop Skills | Iterative: check → act → check again | BSA monitoring, exception report tracking |
| Agentic Loops | Spawn sub-agents, maintain state | Deep regulatory research with parallel source verification |

### 10. The 5-Stage Organizational Skill Process (AiBI-S/L content)

1. **Discovery** — Run work audits. Map the shadow skill landscape.
2. **Curation** — Prioritize by frequency x impact x standardization value. SMEs own skills, not engineers.
3. **Validation** — Test against real scenarios. A/B test vs. unstructured prompting. Test across tools.
4. **Bundling** — Package into plugins. Define org-wide vs. team vs. personal. Version control everything.
5. **Ownership & Maintenance** — Champions per domain. Quarterly review. Usage tracking. Deprecation process.
