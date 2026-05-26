# Banker AI Fluency Rubric V1 — Authoring Spec

This is the spec for **authoring** the Banker AI Fluency Rubric V1. It is
not the rubric itself — it defines what content needs to be written, what
structure each section must follow, what citations are required, and what
quality bar applies.

When V1 is published, this spec becomes the maintenance contract for V1.1,
V2.0, and beyond.

---

## What the Rubric is

The Banker AI Fluency Rubric is the canonical published artifact that
defines what AI fluency looks like for an individual community banker or
credit union employee.

It is:

- **Individual-scoped.** Measures a person, not an institution.
- **Banking-specific.** Adapted from generic AI fluency methodology
  (Zapier V2) with regulatory and operational context that only applies
  in regulated financial services.
- **Citation-grade.** Every claim that an external reader could push back
  on traces to a named source — FFIEC guidance, SR 11-7, NIST AI RMF, the
  AIEOG AI Lexicon, or comparable.
- **Adaptive across roles.** A frontline lender, a compliance officer, and
  a chief risk officer are all measurable on the same rubric, with
  role-specific descriptors.
- **Open.** Published under CC BY 4.0. Anyone can quote, translate, or
  build on it — with attribution.

---

## Structure: 4 components × 4 levels

| | Aware | Capable | Embedded | Leading |
|---|---|---|---|---|
| **AI Mindset** | descriptor | descriptor | descriptor | descriptor |
| **AI Strategy** | descriptor | descriptor | descriptor | descriptor |
| **AI Building** | descriptor | descriptor | descriptor | descriptor |
| **AI Accountability** | descriptor | descriptor | descriptor | descriptor |

Sixteen cells. Each cell is a one-line descriptor of what a banker at that
level demonstrates in that component.

Capable is the certification floor — what a banker must demonstrate to earn
AiBI-Foundation. Embedded is what AiBI-S certifies. Leading is what AiBI-L
certifies.

---

## The four components

Accountability is the spine of the rubric, not the fourth component. Every
other component is ultimately evaluated through the accountability lens.
This ordering matters for content authoring — Accountability gets written
first because the other three components reference it.

### 1. AI Mindset

Curiosity about where AI fits in a regulated institution. Willingness to
experiment within guardrails. Honesty about the gap between what a model
can do and what's compliant for *this bank* to do today.

This is the attitudinal dimension. A banker with strong AI Mindset doesn't
assume AI replaces judgment — they treat it as a thinking partner whose
output requires the same scrutiny they'd apply to a junior analyst's draft.

### 2. AI Strategy

Selecting use cases that produce institutional value. Distinguishing
low-risk augmentation (drafting internal memos, summarizing call notes,
researching vendor capabilities) from high-risk delegation (credit
decisioning, customer communication, anything that becomes part of the
record).

Strategy is the dimension where a banker shows they understand *where*
AI belongs in their institution's specific risk profile.

### 3. AI Building

Constructing AI-supported workflows. Prompt design for banking concepts.
Tool selection aligned with vendor management policy. This is not
software engineering — bankers don't write code. They design repeatable
workflows that hold up to documentation requirements.

"Building" in this rubric means: a banker has produced a workflow that
another banker could pick up and run, documented well enough to survive
an examination question.

### 4. AI Accountability — the spine

Owning outcomes with the regulatory frame baked in. Documenting AI's
role in decisions so an examiner can reconstruct what happened.
Maintaining model risk management when the "model" is an LLM. Catching
what's wrong before it ships to a customer or a regulator.

This is where banking diverges hardest from generic AI fluency. Zapier
treats accountability as the fourth component. AiBI treats it as the
spine — every claim about Mindset, Strategy, or Building is ultimately
evaluated through "what could you defend to an examiner?"

---

## The four levels

### Aware

Has tried consumer AI tools (ChatGPT, Claude, copilots). Can describe at
a high level where AI might fit in banking. Has not yet integrated AI
into their actual work. Probably curious, not yet practitioner.

This level is the on-ramp. Most community bankers as of 2026 are here.

### Capable (minimum certification bar = AiBI-Foundation)

Uses AI in actual banking work. Has at least one repeatable AI-supported
workflow. Can articulate the workflow's impact (time saved, quality
improved, risk surfaced) and its risks (where the workflow could fail,
what compensating controls are in place).

A banker at Capable can be trusted to use AI without supervision in
low-to-moderate risk contexts.

### Embedded (= AiBI-S)

AI is a regular part of multiple workflows across the banker's role.
The banker has redesigned at least one process where AI changes the
shape of the work, not just the speed. They evaluate outputs critically
against policy and can mentor a peer through their first AI workflow.

A banker at Embedded shapes how a team uses AI, not just how they
personally use it.

### Leading (= AiBI-L)

Sets AI policy or strategy for their team or institution. Manages a
portfolio of AI use cases across risk profiles. Demonstrably improves
outcomes (efficiency, quality, customer experience, risk surfacing)
while reducing or managing risk. Owns governance: vendor diligence,
model risk management, audit trail, examiner readiness.

A banker at Leading is the kind of N-2 or N-3 leader McKinsey Rewired
2.0 describes — domain expertise blended with AI capability, capable of
steering team-level adoption.

---

## Required content per section

For V1 launch, each component and level page must include:

### Per component (4 sections × ~400 words each + examples + citations = ~700 words per section)

1. **Definition** — one paragraph, 100–150 words. Plain language. What this
   component measures. Why it's a component.
2. **What this looks like in practice** — 3–5 banker-specific examples.
   Each example names a role (lender, compliance officer, BSA analyst,
   CRO), an AI workflow, and what makes it good. Examples vary by level
   so a reader can see the trajectory.
3. **How this is measured** — observable signals. What assessment items
   probe this component. What an interviewer or examiner would look for.
4. **Citations** — minimum 3 footnoted sources per component, linking
   to the Bibliography page. At least one regulatory source (FFIEC, SR
   11-7, NIST AI RMF), at least one non-banking authority (Zapier rubric,
   McKinsey, Anthropic), at least one banker practitioner source if
   available.

### Per level (4 sections × ~400 words each)

1. **Definition** — one paragraph, 100–150 words. What demonstrates this
   level. What separates it from the level below.
2. **What this looks like across components** — short descriptor for each
   of the 4 components at this level (4 sentences). Becomes a matrix row.
3. **How to demonstrate it** — what evidence a banker brings to qualify
   at this level. What an assessment or certification process looks for.
4. **Mapping to AiBI certifications** — explicit link to AiBI-Foundation
   (Capable), AiBI-S (Embedded), or AiBI-L (Leading). Aware does not map
   to a certification; it's the pre-Foundation state.

### Matrix descriptors (16 cells × 1 line each)

Each of the 16 cells (4 components × 4 levels) gets a one-line descriptor
that fits in a grid cell. These are written *after* the long-form
content so they distill what's been established.

---

## Total V1 word-count target

| Section | Word count |
|---|---|
| Overview / abstract | 150 |
| 4 component long-form sections | ~2,800 |
| 4 level long-form sections | ~1,600 |
| 16 matrix descriptors | ~250 |
| "How this rubric is used" block | 300 |
| Citation block | 150 |
| **Subtotal** | **~5,250** |

For both frameworks combined (this one + Transformation Framework), the
target is 12,000–15,000 words of framework content plus ~5,000 words of
glossary entries plus ~3,000 words of bibliography annotations. Total
V1 authoring: roughly 20,000–25,000 words of original content.

---

## Quality bar — what can ship

A section is ready to publish when:

- [ ] Voice matches `brand/brand-guide.md` § Voice (Authoritative, Grounded,
      Human; editorial-first, promotional never)
- [ ] No banned phrases per `brand-guide.md` § Banned phrases (FFIEC-aware,
      AiBI-Practitioner, plural Foundations, BAI-PSL, etc.)
- [ ] No anti-AI-slop violations per `brand-guide.md` § Slop signatures
- [ ] Every claim that could be challenged is footnoted to a named source
- [ ] Banker-specific examples (not generic SaaS examples)
- [ ] At least one example references a regulatory context (BSA, lending,
      compliance, examination, risk committee)
- [ ] Reviewed by at least one community-bank practitioner (per `open-questions.md`
      content review process)
- [ ] Renders cleanly in the MDX page at the assigned URL
- [ ] Citations link to live entries in `/standards/bibliography/`
- [ ] Stable anchor IDs assigned (see `publication-standards.md` § Anchor stability)

A section that fails any of these is not ready to ship. There is no
acceptable level of "we'll fix it after launch" for V1 — the first
impression is the citation impression.

---

## Mapping: which products certify which levels

| Level | AiBI product that certifies it |
|---|---|
| Aware | No certification; free assessment positions here |
| Capable | AiBI-Foundation |
| Embedded | AiBI-S (specialty tracks) |
| Leading | AiBI-L (leadership track) |

This mapping must be stated explicitly on every level page. The reverse
mapping (each product page references the level it certifies) is part
of the Phase 5 cross-linking sweep in `standards-implementation-plan.md`.

---

## See also

- `transformation-framework-spec.md` — the institutional counterpart
- `publication-standards.md` — license, versioning, citation format,
  anchor stability rules
- `../runbooks/content-authoring-guide.md` — voice and writing process
- `../brand/brand-guide.md` — the Ledger brand system and banned phrases
- `../standards-implementation-plan.md` — engineering plan for the section
