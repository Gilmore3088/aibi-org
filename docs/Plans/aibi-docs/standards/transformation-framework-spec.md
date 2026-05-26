# Banker AI Transformation Framework V1 — Authoring Spec

This is the spec for **authoring** the Banker AI Transformation Framework V1.
It is not the framework itself — it defines what content needs to be written,
what structure each section must follow, what citations are required, and
what quality bar applies.

For the individual counterpart, see `fluency-rubric-spec.md`. The two
frameworks share structural conventions and citation discipline.

---

## What the Framework is

The Banker AI Transformation Framework is the canonical published artifact
that defines what AI transformation looks like for a community bank or
credit union as an institution.

It is:

- **Institutional-scoped.** Measures an organization, not a person. The
  individual analog is the Banker AI Fluency Rubric.
- **Banking-specific.** Adapted from McKinsey Rewired 2.0's six-capability
  framework with banking-specific dimensions that respect regulatory,
  examination, and vendor-management contexts.
- **Citation-grade.** Every dimension and level references a named
  authority — FFIEC Interagency Guidance, OCC Risk Governance, NIST AI
  RMF, Rewired 2.0, comparable banking-specific sources.
- **Sized for community banks.** Generic enterprise transformation frameworks
  assume internal data science teams and aggressive operating model
  redesign. This framework is calibrated for institutions $250M to $10B AUM
  that don't hire data scientists and can't restructure quarterly.
- **Open.** Published under CC BY 4.0.

---

## Structure: 6 dimensions × 4 levels

| | Exploring | Piloting | Scaling | Rewired |
|---|---|---|---|---|
| **Roadmap** | descriptor | descriptor | descriptor | descriptor |
| **Talent Bench** | descriptor | descriptor | descriptor | descriptor |
| **Operating Model** | descriptor | descriptor | descriptor | descriptor |
| **Tech Environment** | descriptor | descriptor | descriptor | descriptor |
| **Data Embedding** | descriptor | descriptor | descriptor | descriptor |
| **Adoption & Scale** | descriptor | descriptor | descriptor | descriptor |

Twenty-four cells. Each cell is a one-line descriptor of what an institution
at that level demonstrates in that dimension.

Rewired is the destination state but is rare in community banking. Most
institutions will land at Exploring or Piloting in V1 assessments. That
distribution is itself the story.

---

## The six dimensions

Adapted from McKinsey Rewired 2.0 with banking-specific dimensions
substituted where the generic framework doesn't transfer. Roadmap, Talent
Bench, Operating Model, Tech Environment, Data Embedding, and Adoption &
Scale all map back to Rewired's six capabilities but are reframed for
community banking realities.

### 1. Roadmap

The institution's AI transformation strategy. How AI investment is
prioritized against other strategic initiatives. How use cases are
selected, sequenced, and tied to enterprise value.

For community banks specifically, this dimension asks: does the bank
have an AI roadmap that survives a board meeting? Does it tie to
specific business outcomes (efficiency ratio, deposit growth, lending
quality, fraud loss)?

### 2. Talent Bench

The institution's people capacity for AI work. Banker AI fluency across
the team (measured via the Fluency Rubric), plus tech specialist depth,
plus the "tech muscle" of business leaders 2–3 levels below the CEO
(per Rewired 2.0).

For community banks, this is rarely about hiring data scientists. It's
about upskilling the bankers already on the team, plus the AI literacy
of the CRO, COO, Head of Lending, and CIO/CTO.

This dimension connects directly to the Fluency Rubric — an institution's
Talent Bench is the aggregate distribution of its bankers across the
Fluency levels.

### 3. Operating Model

How AI work gets done day to day. Decision rights for AI use cases.
Governance structure (who approves what). Vendor management for
AI-enabled tools. Model risk management process for LLM-driven workflows.
Change management cadence within a regulatory examination calendar.

This dimension is heavily regulated. A community bank can have great
roadmap and great talent but if its operating model can't ship an AI
workflow through compliance review in less than six months, it's
Exploring regardless of what else looks good.

### 4. Tech Environment

The institution's technology stack as it relates to AI. Core banking
vendor flexibility (Jack Henry, Fiserv, FIS, Finastra). Integration
patterns for AI-enabled tools. Data access architecture. Whether the
bank can pilot a new AI capability without a six-month vendor
implementation.

For community banks specifically, this dimension is constrained by core
provider contracts. A bank can advance its tech environment, but only
within the boundaries its core vendor permits. Honest assessment of this
dimension is what differentiates a real institutional roadmap from
wishful thinking.

### 5. Data Embedding

How well data is structured, accessible, and governed for AI workflows.
For community banks, this is BSA data, lending data, deposit/customer
data, CRM, fraud, and compliance data. The question isn't "does the
data exist" — it's "can a banker get to it in a workflow without a
two-week IT ticket."

This is where the gap between large-bank capability and community-bank
reality is sharpest. Large banks have data lakes. Community banks have
core system extracts and a CRM. Honest assessment here.

### 6. Adoption & Scale

How AI capability moves from pilot to production. Training, change
management, examiner readiness, customer-facing rollout, internal
adoption metrics. This is the McKinsey Rewired 2.0 capability that maps
most directly to AiBI's mission of "turning bankers into builders."

A bank can pilot AI in one department forever without ever scaling.
Adoption & Scale measures whether AI capability spreads, sticks, and
survives a personnel change.

---

## The four levels

### Exploring

The institution is curious. Maybe one or two pilots running. AI is in
strategy decks but not in operations. Most use is individual bankers
experimenting with consumer tools. Governance exists in principle but
not in practice — there is no AI policy or it's a one-page draft.

This is where most community banks $250M–$2B AUM sit in 2026. Exploring
is not a failing — it's the honest baseline.

### Piloting

The institution has at least one production AI workflow with documented
governance, named owner, and measurable outcome. Multiple pilots are
running with discipline. There is a written AI policy, vendor management
includes AI capabilities, and the bank can answer an examiner's question
about its AI use without scrambling.

Piloting institutions have moved past experimentation but haven't yet
scaled. The friction is usually Operating Model or Tech Environment.

### Scaling

AI workflows are in production across multiple departments. The bank's
Talent Bench is materially upgraded — multiple bankers at Embedded or
Leading on the Fluency Rubric. Operating model has clear AI governance
that's actively used, not just documented. The bank can ship a new AI
capability in weeks, not months.

Scaling institutions are visibly transforming. Customers and examiners
both notice the change in how the bank operates.

### Rewired

AI is core to how the institution works. The operating model assumes AI
capacity in workforce planning. Tech environment is flexible enough to
integrate new AI tools without core-vendor friction. Senior leadership
is at Leading on the Fluency Rubric. The bank has visibly become AI-native
while remaining recognizably community.

Rewired is rare in community banking as of 2026. Naming it matters — it
gives institutions a destination.

---

## Required content per section

For V1 launch, each dimension and level must include the same structure
as the Fluency Rubric (see `fluency-rubric-spec.md` § Required content
per section). Word counts are larger because dimensions are richer than
components and the institutional content requires more context.

### Per dimension (6 sections × ~500 words each + examples + citations = ~900 words per section)

1. **Definition** — 150–200 words. What this dimension measures. Why
   it's a dimension. How it differs from the same-named McKinsey
   capability.
2. **What this looks like in community banking** — 3–5 institution-specific
   examples. Each names a bank size band ($250M–$1B, $1B–$5B, $5B–$10B),
   a scenario, and what makes it good or weak. Examples must respect
   the specific operating constraints of community banks (core vendor
   lock-in, smaller team sizes, examination cadence).
3. **How this is assessed** — observable signals. What an institutional
   diagnostic asks. What a CRO or examiner would look for.
4. **Citations** — minimum 4 footnoted sources per dimension. At least
   one regulatory (FFIEC, OCC, Fed SR 11-7), at least one institutional
   framework (NIST AI RMF, COSO, COBIT where relevant), at least one
   Rewired 2.0 reference, at least one banker practitioner source.

### Per level (4 sections × ~500 words each)

1. **Definition** — 150 words. What separates this level from the one
   below.
2. **What this looks like across dimensions** — 6 sentences, one per
   dimension. Becomes a matrix row.
3. **How an institution demonstrates this level** — what evidence the
   In-Depth team assessment or Leadership Advisory intake looks for.
4. **What it takes to move up** — 100–150 words. Honest about what's
   hard about the next level. Most institutions stall at this transition
   for the following reasons.

### Matrix descriptors (24 cells × 1 line each)

Same approach as the Fluency Rubric. Written last, distilling the
long-form content.

---

## Total V1 word-count target

| Section | Word count |
|---|---|
| Overview / abstract | 200 |
| 6 dimension long-form sections | ~5,400 |
| 4 level long-form sections | ~2,000 |
| 24 matrix descriptors | ~400 |
| "How this framework is used" block | 400 |
| Citation block | 200 |
| **Subtotal** | **~8,600** |

This framework runs longer than the Fluency Rubric because institutional
content carries more context and more citations per claim.

---

## Quality bar — what can ship

Same checklist as the Fluency Rubric (see `fluency-rubric-spec.md` § Quality
bar). Plus one additional requirement specific to this framework:

- [ ] Every dimension's "what this looks like in community banking" section
      includes examples spanning at least two of the three bank size bands
      ($250M–$1B, $1B–$5B, $5B–$10B). Examples that only describe one
      bank size leave the rubric feeling incomplete for the other audiences.

---

## Mapping: which products engage at which levels

| Level | AiBI engagement that addresses it |
|---|---|
| Exploring | In-Depth team assessment (diagnostic only) |
| Piloting | In-Depth team assessment + Leadership Advisory (light-touch roadmap) |
| Scaling | Leadership Advisory (full engagement) + Foundation cohort licenses for the team |
| Rewired | Sustaining engagement: annual In-Depth + ongoing advisory |

This mapping must appear on the framework overview page. It connects
the abstract framework to concrete commercial offerings.

---

## Relationship to the Fluency Rubric

These two frameworks reinforce each other. An institution's Talent Bench
dimension is *literally* the aggregate distribution of its bankers across
the Fluency Rubric levels. A bank with 30 employees all at Aware will
struggle to advance past Exploring on Talent Bench. A bank with multiple
employees at Embedded and at least one at Leading can credibly claim
Scaling.

The two-framework architecture is not redundant — it's complementary. The
Fluency Rubric measures *who you have*. The Transformation Framework
measures *what they do collectively*. An institutional diagnostic uses
both.

---

## See also

- `fluency-rubric-spec.md` — the individual counterpart
- `publication-standards.md` — license, versioning, citation format
- `../runbooks/content-authoring-guide.md` — voice and writing process
- `../brand/brand-guide.md` — the Ledger brand system
- `../institute-overview.md` — strategic context (two-track architecture)
- `../standards-implementation-plan.md` — engineering plan for the section
