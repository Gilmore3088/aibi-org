# Institute Overview

The strategic story of what AiBI is, who it serves, and how the pieces fit
together. Read this before anything else in this folder.

---

## The thesis

Community banks and credit unions face an AI transformation they cannot defer
and cannot navigate with consumer AI tools or generic frameworks. They need a
banker-specific operating system for AI fluency — one that respects regulatory
constraints, examiner expectations, and the institutional risk tolerance that
defines banking.

AiBI is the institute that publishes that operating system, certifies people
against it, and engages institutions on it.

The work has two characters:

1. **Standards** — open, published, citable frameworks that define what good
   AI fluency and transformation look like in community banking.
2. **Products** — paid programs, assessments, and advisory engagements that
   move individuals and institutions along the standards.

The standards are the moat. The products are the throughput.

---

## Two audiences, two tracks, two frameworks

AiBI serves two audiences with materially different needs and price points.
The whole architecture flows from that asymmetry.

| | Individual track | Institutional track |
|---|---|---|
| **Buyer** | Community banker, credit union employee, compliance officer | CRO, COO, Head of Lending, Chief Risk Officer |
| **Diagnostic** | Free assessment, In-Depth (individual) | In-Depth (team), Advisory intake |
| **Framework** | Banker AI Fluency Rubric (4 components × 4 levels) | Banker AI Transformation Framework (6 dimensions × 4 levels) |
| **Programs** | AiBI-Foundation → AiBI-S → AiBI-L | Leadership Advisory engagement |
| **Annual artifact** | *State of Banker AI Fluency* | *State of Banker AI Transformation* |
| **Authority anchor** | Adapted from the Zapier AI Fluency Rubric methodology | Adapted from McKinsey Rewired 2.0 |
| **Banking authority** | FFIEC, SR 11-7, AIEOG | FFIEC, NIST AI RMF, OCC Risk Governance |

Both tracks share infrastructure: the same site, the same brand, the same
assessment platform, the same content engine.

---

## The Standards section as gravity center

The architectural decision that holds everything together: **the Standards
section is the gravity center of the Institute, not a marketing page.**

Real institutes (FFIEC, NIST, the Aspen Institute) organize around their
canonical artifacts. AiBI does the same. Programs, Assessments, Advisory,
and Research are all positioned as *derivative of, or downstream from,*
Standards.

Commercial consequence: when AiBI-Foundation is positioned as "our course,"
it competes with every other AI course on the internet. When AiBI-Foundation
is positioned as "the program that certifies Capable on the Banker AI Fluency
Rubric," it competes with nothing — because no other course certifies against
that rubric.

The rubric is the moat. The course is the throughput. The site architecture
makes that visible.

---

## Site architecture (target end-state)

Top-level nav, in order:

```
Home | Standards | Programs | Assessments | Advisory | Research | About | Sign in
```

| Section | Contains | Free or paid |
|---|---|---|
| Standards | Fluency Rubric, Transformation Framework, glossary, bibliography, Standards Board | Free, always |
| Programs | AiBI-Foundation, AiBI-S, AiBI-L | Paid |
| Assessments | Free fluency check, In-Depth (individual + team) | Mixed |
| Advisory | Leadership Advisory engagements | Paid (enterprise) |
| Research | The AI Banking Brief, annual *State of...* reports | Free |
| About | Mission, team, methodology | — |

This is not the current site. The Standards section does not yet exist.
Building it is the primary work documented in
`standards-implementation-plan.md`.

---

## The customer journey, individual side

A community banker reads a LinkedIn post → lands on `/standards/fluency-rubric` →
sees a real institutional document, not a sales page → takes the free
assessment → gets scored as Aware (with weakest component flagged) → sees the
explicit path: "AiBI-Foundation certifies Capable" → buys Foundation → completes
it → earns AiBI-Foundation credential → sees the next path: "AiBI-S certifies
Embedded" → considers it.

Every step references the same map. The journey reads as one coherent system,
not three disconnected products.

---

## The customer journey, institutional side

A compliance officer at a $500M community bank reads the annual *State of
Banker AI Fluency* report → sees their bank is probably below median → brings
it to the CRO → CRO takes In-Depth → scored as Embedded individually → sees
the Transformation Framework and recognizes their institution is "Piloting"
→ buys team In-Depth licenses → gets a distribution of fluency scores across
the team AND an institutional position on the Transformation Framework → uses
that to build a multi-year development plan → engages Leadership Advisory →
buys Foundation cohort licenses for the lowest-scoring bankers.

Without the Standards, In-Depth is just a score. With the Standards, In-Depth
is *an institutional diagnostic that drives a multi-year development plan*.
The economics of the customer relationship change.

---

## The flywheel

Every assessment (free or paid) becomes a data point. After a year, the
dataset becomes:

1. **The annual *State of Banker AI Fluency* report** — anchor content piece,
   written once a year. Same role as the BAI Banking Outlook or the Cornerstone
   "What's Going On in Banking" report.
2. **In-product benchmarking** — In-Depth respondents see "your institution is
   in the 34th percentile for AI Building among community banks under $1B AUM."
   That is worth real money.
3. **Targeting signal for Leadership Advisory** — institutions with specific
   gap profiles are obvious advisory targets.

Cycle: rubric → assessments → data → benchmark report → credibility → more
assessments. After cycle two, the rubric is canonical and AiBI is the only
company sitting on the dataset.

---

## Where this is going

12-month horizon:

- Phase 1–6 (months 1–3): Standards section live with both frameworks V1
- Phase 7–8 (months 4–5): Assessments rewired to position against the frameworks
- Phase 9–10 (months 6–9): Leadership Advisory engagements built around the framework
- Phase 11–12 (months 9–12): First *State of...* annual reports published
- Phase 13+ (months 12+): Standards Board recruited, V2 frameworks scoped

24-month horizon:

- Two annual flagship reports establish AiBI as the citation source
- Standards Board includes named community-bank practitioners
- Multi-year institutional engagements anchored to the Transformation Framework
- AiBI-S and AiBI-L certifications become the recognized credential layer above
  AiBI-Foundation
- The dataset becomes proprietary advantage

---

## What this is *not*

- Not a generic AI consulting practice
- Not a course business that happens to have a brand
- Not a tool platform — AiBI doesn't sell software, it sells fluency and
  certification
- Not a vendor selling AI to bankers — AiBI sells *AI fluency* to bankers,
  agnostic to which AI tools they ultimately use

If a positioning decision conflicts with these, the positioning loses.

---

## See also

- `standards-implementation-plan.md` for the build plan
- `standards/fluency-rubric-spec.md` for the individual framework
- `standards/transformation-framework-spec.md` for the institutional framework
- `decisions-log.md` for resolved architectural calls
- `brand/brand-guide.md` for voice and visual system
