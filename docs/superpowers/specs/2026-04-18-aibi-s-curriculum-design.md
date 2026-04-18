# AiBI-S Curriculum Design

**Status:** Design approved 2026-04-18 — ready for implementation planning
**Supersedes:** `content/courses/aibi-s/aibi-s-prd.md` (cohort-format PRD)
**Owner:** James Gilmore
**Level:** AiBI-S (Specialist, Level 2 of the AiBI credential ladder)
**Prereq:** AiBI-P (Practitioner)

---

## 1. Summary

AiBI-S is a self-paced specialist certification for department managers and
team leads at community banks and credit unions. A learner takes one
high-value workflow from their real department, deploys AI against it,
measures what changed, defends the result under pressure from role-appropriate
personas, and then extracts a departmental AI operating model grounded in that
experience.

The course is organized around **increasing adversarial pressure** (not
increasing time) and around a **single A-to-C thread** — one workflow carries
the learner from departmental work audit through deployment and measurement
through operating-model extraction. Simulation is the pedagogical rhythm, not
a capstone event.

### Position in the Credential Ladder

| Level | Credential | Margin of Error | Audience | Core Artifact |
|-------|-----------|----------------|----------|---------------|
| 1 | AiBI-P | Personal | Individual banker | Personal skill + assessed work product |
| **2** | **AiBI-S** | **Team / Department** | **Department manager or team lead** | **Deployed departmental automation + operating model + defended artifact bundle** |
| 3 | AiBI-L | Institutional / Executive | C-suite, board, fCAIO | Institution-wide governance + examiner-ready artifacts |

Executive-level personas (CFO, Examiner, Board) and institutional governance
topics are explicitly reserved for AiBI-L. AiBI-S operates at the department
margin of error — colleagues catch mistakes, reputation has some risk but is
recoverable.

---

## 2. Format and Access Model

### 2.1 Format

- **Self-paced.** No "X weeks" duration claim in any marketing or course
  framing. Matches the AiBI-P convention.
- No live cohort, no weekly deadlines, no live sessions, no instructor-led
  breakouts. Pressure and rigor come from the embedded simulation engine, not
  from cohort accountability.
- Learner can start, pause, and resume any track at will.

### 2.2 Prerequisite

A valid AiBI-P certification is required. Verification happens at enrollment
(first login), not at purchase — this prevents cart abandonment from learners
who have the credential but cannot locate their certificate ID at checkout. A
learner who has completed AiBI-P under a different email uses a manual
override pathway.

### 2.3 Role Tracks — Five Full Tracks, All Included

AiBI-S ships with five complete role tracks:

| Track | Code | Target Audience |
|-------|------|----------------|
| Operations | `/Ops` | Operations managers, back-office leads, project managers |
| Lending | `/Lending` | Loan officers, credit analysts, lending managers |
| Compliance | `/Compliance` | Compliance officers, BSA/AML analysts, risk managers |
| Finance | `/Finance` | CFOs in small institutions, controllers, financial analysts |
| Retail | `/Retail` | Branch managers, member services leads, contact center managers |

Each track is effectively its own enrollment with track-specific content:
platform deep dives, example workflows, persona scripts, work-audit templates,
and skill library starters.

**All five tracks are unlocked at purchase.** A learner completes one, two, or
all five at the same price. The price does not scale with track completion —
this is deliberate. See §9 Commercial Structure.

---

## 3. The Thread — A→C in a Single Case Study

The structural spine of AiBI-S is a single A-to-C thread. The same workflow
the learner audits in Phase I is the one they deploy in Phase II and harvest
the operating model from in Phase III. One case study carries through the
entire course for each track.

This is what keeps a self-paced learner finishing — they are not starting
over each phase; they are deepening a single real thing they care about.

```
Phase I: Audit       →  pick the workflow
Phase II: Build      →  deploy it, measure it, defend it
Phase III: Scale     →  extract the operating model from what you learned
```

---

## 4. Phase Structure

Three phases. Capability-progression, not time-bound.

| Phase | Core Question | Deliverables | Dominant AiBI Pillar |
|-------|---------------|--------------|----------------------|
| **Phase I — Foundation** | What in my department is worth automating, and how do I scope it? | Departmental work audit (10+ workflows scored) · track-specific AI workspace configured · shortlisted automation candidate | A (Accessible) |
| **Phase II — First Build** | Can I build it, measure it, and defend it? | Deployed automation running in the learner's department · before/after measurement data · defended against Department Head, Compliance Liaison, and Resistant Team Member personas | B (Boundary-Safe) |
| **Phase III — Scale** | What did I learn, and what is the playbook for my department? | Departmental AI operating model extracted from the deployment · 3-skill starter library · peer Department Manager defense · full capstone submission | C (Capable) |

### 4.1 Phase I — Foundation (What to automate and how to scope it)

Units cover:

- The shift from personal to institutional skill (ownership, versioning,
  documentation, handoff, data handling, failure modes as a table the learner
  fills in for their own context)
- Work decomposition — scoring workflows on frequency, time, and
  standardization value
- Data classification gating — every workflow audited must be tagged Tier 1,
  2, or 3 before it can be considered for automation
- Regulatory applicability — which of the five frameworks (SR 11-7, TPRM,
  ECOA/Reg B, BSA/AML, AIEOG) applies to this workflow, and what documentation
  burden that creates
- Track-specific platform deep dive — per §4.4

**Phase I exit artifact:** the departmental work audit with at least 10
workflows scored, tiered, and framework-tagged, plus a shortlisted automation
candidate selected with a written rationale.

### 4.2 Phase II — First Build (Deploy, measure, defend)

Units cover:

- Advanced skill authoring using RTFC+D+G (Role, Task, Format, Constraint +
  Data tier + Governance) — the institutional extension of AiBI-P's RTFC
  framework
- Multi-step skills, skill chaining, context engineering at institutional
  scale
- Deployment mechanics — handoff documentation, owner assignment, colleague
  training, adoption friction
- Measurement discipline — baseline capture, before/after data collection,
  attribution (what changed because of the skill vs. what changed anyway)
- Failure-mode register and guardrails — disclaimers, HITL checkpoints,
  validation layers
- Persona defenses — Department Head on scope/ROI, Compliance Liaison on
  governance, Resistant Team Member on adoption

**Phase II exit artifact:** a deployed automation running in the learner's
actual department with at least two weeks of measured before/after data and a
defended record (three persona memos faced, three rebuttals written, three
AI-probed chat transcripts, refined final versions).

### 4.3 Phase III — Scale (Extract the playbook)

Units cover:

- Pattern extraction — what worked in the deployment, what did not, what is
  transferable
- Operating-model components — work audit cadence, prioritization criteria,
  skill library governance, ownership assignment, measurement framework,
  training plan, failure-mode register, adoption strategy
- Skill library design — naming conventions, version control, quarterly
  review cycles, ownership, deprecation
- Cross-functional pressure — peer Department Manager challenges the
  operating model with "would this work for my department?"

**Phase III exit artifact:** a ~12-section departmental AI operating model
document, a 3-skill starter library (each skill written to RTFC+D+G), and a
defended version of the operating model against the peer Department Manager
persona.

### 4.4 Track-Specific Content

Each track has its own authoring. Specifically per track, authored 5 times:

- **Platform deep dive** — the platforms a specialist in that track needs
  deep proficiency with. Ops: Copilot (Teams/Outlook/Excel) + Power Automate.
  Lending: Claude Projects + ChatGPT Custom GPTs + Copilot in Excel.
  Compliance: Perplexity + NotebookLM + Claude Projects.
  Finance: Claude Projects + Copilot in Excel. Retail: Copilot in
  Outlook/Teams + ChatGPT Custom GPTs + Claude Projects.
- **Example workflows** — 6–10 track-specific workflows learners can use as
  audit-entry starting points
- **Work-audit template** — scored matrix pre-populated with track-typical
  workflows to lower the starter friction
- **Persona scripts** — 4 personas × 3 phases = 12 persona appearances per
  track (see §6)
- **Skill library starters** — 3–5 reference skills per track the learner can
  adapt rather than build from scratch

---

## 5. The Unit Pedagogy — The 6-Beat Loop

Every instructional unit in AiBI-S follows the same rhythm. This is the
mechanism that delivers simulation-and-interactivity throughout the course,
not just at the capstone.

| Beat | What It Does | Interactivity | Framework Hooks |
|------|--------------|---------------|-----------------|
| **1. Learn** | Short content block: concept + worked banking example | Inline callouts state which AiBI pillar (A/B/C), which regulatory framework(s), and which data tier(s) this unit touches | AiBI A-B-C, 5 regulatory frameworks, Tier 1/2/3 classification |
| **2. Practice** | Decision simulation on a scripted banking scenario | Learner makes a choice; system responds with branch consequences. Example: "You received this data — classify the tier. Wrong answers reveal the compliance failure mode and branch the learner into remediation content" | Data classification gate, RTFC skill anatomy, AIEOG vocabulary |
| **3. Apply** | Learner applies the concept to their own real departmental workflow | Writes, configures, or deploys against their actual audit entry — no synthetic sandbox | Track-specific templates and examples |
| **4. Defend** | Persona challenges the learner's applied work | Written memo fires first (pre-authored per track per persona); learner writes rebuttal; AI chat probe follows up on the rebuttal's specifics, 3–5 targeted turns | Persona selection depends on unit focus |
| **5. Refine** | Learner iterates based on defense outcome | Revision submitted; AI-judge rubric scores Before → After, highlights any governance or guardrail gaps | RTFC+D+G extension |
| **6. Capture** | The refined artifact joins the cumulative deliverable stack | Work audit → workspace → deployed automation → operating model. One thread thickens as it progresses | Single A→C thread |

### 5.1 Why a Fixed Rhythm

- **Predictability aids completion** in self-paced formats. Learners know
  what to expect every unit.
- **Regulation is lived, not lectured.** Every Practice and Defend beat
  enforces SR 11-7 / TPRM / ECOA / BSA/AML / AIEOG at the exact point a real
  deployer would encounter them. No standalone "Regulatory Module" — the
  regulatory content is the spine of the Practice and Defend beats.
- **Data classification is a gate, not a topic.** Practice beats force tier
  classification before subsequent beats unlock. Tier 3 data never appears in
  any sample content — the course enforces its own tier discipline.
- **AiBI pillar markers are visible in the UI.** A learner can see a running
  balance of A, B, and C units completed — if they're under-representing any
  pillar, the dashboard surfaces it.

### 5.2 The Simulation Types

Within the 6-beat loop, Practice and Defend beats draw from five simulation
types:

1. **Decision sims** — multiple-choice with consequences (e.g., "Which data
   tier applies here?")
2. **Workflow sims** — drag-to-configure or prompt-building with AI-judge
   evaluation
3. **Persona sims** — written memo → learner rebuttal → AI chat probe
   (see §6 for persona roster)
4. **Edge-case sims** — "here's a bad input, predict what happens, then
   observe what actually happens"
5. **Regulatory sims** — "here is a hypothetical examiner or compliance
   question — draft a response"

---

## 6. The Persona Roster

AiBI-S uses four personas, each authored five times (once per track). All
four personas appear at least once per phase, across the 6-beat loop's Defend
beat.

| Persona | Role | Typical Questions | Where They Appear |
|---------|------|-------------------|-------------------|
| **Department Head** | The budget-and-risk-tolerance authority for the department | "Why this workflow first?" · "What is the ROI case?" · "What happens when it breaks?" · "How does this reflect on me with the CEO?" | Phases I–III, every phase |
| **Compliance Liaison** | The department-level compliance partner (not the institution's Examiner — reserved for AiBI-L) | "What data tier is in play?" · "Which framework applies?" · "Where is the HITL checkpoint?" · "How would you document this for an exam?" | Phase II primarily, Phase III light touch |
| **Resistant Team Member** | The skeptical colleague whose job changes | "Why should I trust this?" · "Will this replace me?" · "What happens if the AI is wrong and I get blamed?" · "Why should I learn a new tool?" | Phase II primarily |
| **Peer Department Manager** | A cross-functional peer in another department | "Would this work for my department?" · "How does your playbook scale?" · "What should I do differently in my context?" | Phase III primarily, final defense |

### 6.1 Authoring Budget

4 personas × 5 tracks × 3 phases of appearance = **60 written memos + 60 AI
chat system prompts + 60 grading rubrics** to author. This is the central
authoring investment of AiBI-S, and it is what justifies the price relative
to AiBI-P.

### 6.2 Persona Execution Mechanism

The simulation engine blends written and AI-driven pressure:

1. **Written memo fires first.** The persona's challenge memo is pre-authored,
   deterministic, and brand-voice-perfect. Every learner faces the same
   baseline challenge.
2. **Learner drafts a written rebuttal.** Typed response submitted in the
   course UI.
3. **AI chat probe follows up.** The same persona, now played by an LLM
   loaded with track context and the learner's actual rebuttal, asks 3–5
   targeted follow-up questions that interrogate the learner's specific
   words. Probe turns are bounded — no open-ended chat that can drift.
4. **The graded artifact is the written memo + rebuttal + chat transcript
   together.** The learner takes this bundle away as a real document they can
   keep in their personal playbook.

No video recording. No live human instructor. The AI-driven probe is what
makes the defense unfakeable per learner, and the written memo is what keeps
the brand voice consistent and the pressure calibrated.

---

## 7. Capstone and Certification

### 7.1 Capstone Submission — Per Track

The graduate submits a single defended package for each track they are
certifying in. The package contains:

1. **The deployed automation** — running in their real department, with
   before/after data (hours saved, error reduction, or throughput delta — the
   metric is track-specific).
2. **The departmental AI operating model** — the ~12-section document.
3. **The 3-skill starter library** — each skill written to RTFC+D+G, each
   tagged with owner, version, data tier, regulatory framework, and failure
   modes.
4. **The complete defended artifact bundle** — every persona memo faced
   across the track + the learner's rebuttals + AI chat transcripts + refined
   final versions.

### 7.2 The Final Defense

At capstone submission, a fifth persona sequence fires: each of the four
personas issues one last challenge memo calibrated to the actual submitted
package. The learner must defend the *whole* package, not individual units.
This is the AI-driven equivalent of standing in front of a review panel.

### 7.3 Three Grading Layers

| Layer | What Is Graded | Mechanism | Turnaround |
|-------|---------------|-----------|------------|
| **Unit-level** | Refine-beat output vs. rubric | AI-judge, fully automated | Instant |
| **Phase gate** | Cumulative artifacts at end of Phase I, II, III | AI-judge with human spot-check when the AI score is borderline | Under 72 hours |
| **Certification** | Full capstone package + final persona defense | Mandatory human review by an Institute-credentialed reviewer, with AI-judge pre-grading to accelerate | Within 5 business days |

### 7.4 Five Grading Dimensions (0–4 each, 20 total)

1. **Applied rigor** — real data, real deployment, real colleagues. No
   synthetic workflows, no simulated departments, no handwaving.
2. **Regulatory compliance** — the five frameworks correctly applied at the
   right beats. Every Practice and Defend beat that touched a framework must
   show the learner invoked it appropriately.
3. **Defense quality** — rebuttals and chat responses held up under
   adversarial probing. Coherent, specific, not evasive.
4. **Artifact completeness** — the operating model covers all required
   sections. The skill library entries meet the RTFC+D+G schema. Nothing
   missing.
5. **Pillar balance** — A, B, and C all meaningfully reinforced across the
   submission. A track that is all-Capable-no-Boundary-Safe does not pass.

**Passing threshold: 15/20 with no single dimension below 3.** Below
passing, the learner receives specific remediation feedback and can resubmit
the failing dimensions (not the whole course) within 90 days.

### 7.5 Credential Model

- Completing one track earns an `AiBI-S/<track>` designation.
- Completing additional tracks adds designations to the same credential
  record.
- Completing all five tracks earns the rare `AiBI-S · Full Specialist`
  honorific.
- The defended artifact bundle is linkable from the credential verification
  page — proof the learner faced and survived the personas, not just a PDF
  claim.

Credential display:

| Completion | Display |
|-----------|---------|
| One track | `AiBI-S/Ops · The AI Banking Institute` |
| Two tracks | `AiBI-S/Ops · AiBI-S/Lending · The AI Banking Institute` |
| All five | `AiBI-S · Full Specialist · The AI Banking Institute` |

---

## 8. Regulatory and Security Framework Integration

Non-negotiable. Every unit must be authored with explicit reference to the
following, or the unit is not done.

### 8.1 The Five Regulatory Frameworks

Every unit that touches a banking workflow must tag which frameworks apply:

| Framework | Applies When | Documentation Burden |
|-----------|-------------|---------------------|
| SR 11-7 (Fed Model Risk) | AI model influences a material decision | Model validation, conceptual soundness, explainability, monitoring |
| Interagency TPRM | AI feature is operated by a vendor | Third-party due diligence, contract provisions, ongoing monitoring |
| ECOA / Reg B | AI influences credit decisions | Fair-lending testing, adverse-action reasons, protected-class disparity analysis |
| BSA/AML | AI influences transaction monitoring, CDD, or SAR narratives | Human review of all SAR narratives, audit trail of model changes |
| AIEOG AI Lexicon (Treasury/FBIIC/FSSCC, Feb 2026) | Always — shared vocabulary | Use AIEOG terms (hallucination, AI governance, use case inventory, HITL, third-party AI risk, explainability) |

Persona challenges in Defend beats explicitly invoke the applicable
framework(s) for the scenario. The Compliance Liaison persona is the primary
regulatory pressure-test at the department level.

### 8.2 Data Classification (Institutional Security)

Three-tier data classification gates every Practice and Apply beat:

| Tier | Examples | Rules |
|------|----------|-------|
| **Tier 1 — Public** | Rate sheets, published financials, marketing collateral | Any AI tool OK |
| **Tier 2 — Internal** | Internal procedures, board memos, internal financial data | Institution-sanctioned AI platforms only; never consumer ChatGPT/Claude accounts |
| **Tier 3 — Restricted** | Member PII, loan tape rows with identifiers, non-public supervisory information | Institution-sanctioned AI platforms only, with explicit vendor AI-data-handling review; never paste without redaction |

The course itself must enforce its own tier discipline: Tier 3 data never
appears in sample content. Sample data must be realistic but synthetic or
aggressively redacted.

The Practice beat on data classification acts as a gate — a learner cannot
progress past the classification beat without correctly tiering the scenario's
data.

### 8.3 AiBI Framework (A-B-C)

AiBI-P established the A-B-C pillar framework (Accessible, Boundary-Safe,
Capable). AiBI-S extends this:

- **A (Accessible)** — moving a skill from personal to team-wide usability.
  Dominant in Phase I.
- **B (Boundary-Safe)** — governance, data handling, regulatory fit,
  documentation, HITL checkpoints. Dominant in Phase II.
- **C (Capable)** — measurably changing the work in a way the institution can
  point to. Dominant in Phase III.

Every unit is tagged with a pillar, and the learner's dashboard shows a
running balance. The capstone cannot pass without all three pillars
meaningfully reinforced (see §7.4, dimension 5).

### 8.4 RTFC+D+G Skill Authoring

AiBI-P taught RTFC (Role, Task, Format, Constraint). AiBI-S extends this to
**RTFC+D+G** for institutional skills:

- **D — Data tier declared.** The skill documentation states the tier(s) of
  data it handles and what must be redacted.
- **G — Governance declared.** The skill documentation states the applicable
  regulatory framework, the HITL requirement (if any), the failure modes, and
  the owner.

Every skill in the 3-skill starter library and in the deployed automation
must conform to RTFC+D+G or it does not pass the capstone.

---

## 9. Commercial Structure

### 9.1 Pricing — Launch at $1,495, Do Not Raise Without Customer Validation

**Launch price: $1,495 individual.** This matches the existing AiBI-S PRD.
It is the maximum price we will charge until we have paying customers and
completion data.

Price validation rule:

- Hold at $1,495 through launch.
- Do not plan or communicate any price increase before we have at least 25
  paid enrollments, ≥60% completion rate, and strong qualitative feedback.
- If we find AiBI-S is under-pricing relative to perceived value once
  customer data is in hand, a price lift to $1,995 or above can be
  considered — but only with data.
- Discount paths (early-graduate pricing, institutional cohort pricing) are
  fine at any time, because they create inbound signal without raising the
  public rate.
- Institutional cohort pricing is custom quote on 8+ seats (unchanged).

**We will not price ourselves out of a market we have not yet sold to. We
will also not discount preemptively on a product that has the strategic
depth described in this design.**

### 9.2 What Is Included in $1,495

All five role tracks. Full simulation engine. Certification review at the
track level. Career-long access — a graduate whose role changes over time
can pursue new tracks without re-purchasing.

### 9.3 Why Track-Included, Not Track-Charged

Three reasons, in priority order:

1. **Simplicity matches AiBI-P.** AiBI-P is one price, no upsell treadmill.
   AiBI-S should read the same way to the same buyer.
2. **Intrinsic motivation to stack.** Graduates are not "paying more to do
   more" — they are unlocking what they already own. Completion rate on
   track 2+ will beat what it would be under per-track pricing, because the
   marginal cost is zero and the marginal career value is real.
3. **Institutional cross-training.** A bank that buys 10 seats now has a
   cross-functional AI training asset: a Lending officer can explore the
   Compliance track to understand how their work connects. This is easier to
   sell institutionally than five separate products.

### 9.4 Institutional Cohort Pricing

Unchanged from the existing PRD:

- 8+ seats triggers custom quote.
- Private institution cohort (12+ seats from one institution) gets a
  pre-build consultation to calibrate the work-audit template and example
  library to the institution's technology stack.
- Institution track purchases can mix (e.g., 3 seats emphasizing /Lending + 5
  seats emphasizing /Ops) — all still unlocked across all tracks.

### 9.5 AiBI-S in the Sales Funnel

| Step | Product | Price | Purpose |
|------|---------|-------|---------|
| 1 | Free 12-question assessment | $0 | Creates tier-based urgency, routes to AiBI-P |
| 2a | AiBI-P | $295 | Foundation. Prereq for AiBI-S. |
| 2b | Executive Briefing | $150–200 credited | Institution-level conversation, potential institutional AiBI-S cohort lead |
| **3** | **AiBI-S** | **$1,495** | **Primary product for department managers. The internal-champion factory.** |
| 4 | AiBI-L | $2,800+ | C-suite and board. Governance, roadmap, examiner readiness. |
| 5 | Consulting / fCAIO | Custom | AiBI-S graduates drive this pipeline. |

The strategic value of AiBI-S to the business is not the $1,495 revenue — it is
the creation of an internal champion at the institution who has deployed AI,
measured the results, and can present those results to their own leadership.
That champion becomes the internal buyer of AiBI-L and the originator of
consulting engagements.

---

## 10. Outputs and Assets — What Gets Built

This section summarizes the authoring and platform work required to ship
AiBI-S. Detailed implementation planning is a separate document.

### 10.1 Content Authoring (per track, 5 tracks total)

- Phase I units (work audit, platform deep dive, data classification gating,
  regulatory applicability, workspace configuration)
- Phase II units (RTFC+D+G, deployment mechanics, measurement, guardrails,
  failure modes)
- Phase III units (pattern extraction, operating-model components, skill
  library design)
- 6–10 track-specific example workflows
- A pre-populated work-audit template
- 3–5 reference skills per track (starters for the 3-skill library)

### 10.2 Simulation Engine Assets

- 60 written persona memos (4 personas × 5 tracks × 3 phases)
- 60 AI chat system prompts (one per memo)
- 60 grading rubrics (one per memo)
- Rubrics for the 5 simulation types (decision, workflow, persona,
  edge-case, regulatory)
- Final-defense persona memos (4 personas × 5 tracks = 20 final-defense
  memos calibrated to submitted capstone packages)

### 10.3 Platform Capabilities

- Unit-level AI-judge grader with rubric support
- Persona chat runtime with system-prompt loading, track-context loading,
  and bounded turn count
- Phase gate submission UI with AI pre-scoring and human spot-check queue
- Certification submission UI with mandatory human-review workflow
- Pillar-balance dashboard visible to the learner
- Data-tier gate enforcement in Practice beats
- Credential verification page that links to the defended artifact bundle
- Multi-track credential display that stacks designations
- Resubmission flow for failing dimensions (90-day window)

### 10.4 Support Assets

- Manual AiBI-P prereq override path for cross-email learners
- Institutional cohort onboarding flow (8+ seats, custom pre-build
  consultation)
- Credential PDFs + LinkedIn badge generation per track + Full Specialist
  honorific

---

## 11. Open Questions (Deferred to Implementation Planning)

The following decisions do not block this design but will need resolution
during implementation planning:

1. **Human reviewer recruitment and calibration.** Certification layer
   requires Institute-credentialed human reviewers. Need a reviewer training
   program, a calibration rubric, and a scheduling approach that holds
   turnaround under 5 business days.
2. **AI-judge model selection and prompt engineering.** The grading and
   persona-chat runtimes require a specific model (Claude 4 Opus for
   certification-tier grading, Claude 4 Sonnet for unit-level grading).
   Prompt templates, few-shot examples, and rubric loading need authoring.
3. **Measurement tooling for the deployed automation.** How does a learner
   capture before/after data in a way the platform can verify? Does the
   platform accept self-reported data with affidavit, or does it require
   uploaded artifacts (screenshots, exported reports)?
4. **Peer review mechanics without a cohort.** Is there an async peer review
   loop where graduated AiBI-S holders review current learners' submissions?
   This could strengthen the credential without reintroducing cohort
   timing constraints. Candidate for Phase 2 post-launch.
5. **Graduate network.** A post-certification network (quarterly calls,
   skill-library swap, regulatory-update briefings) could strengthen
   retention and drive AiBI-L conversion. Scope deferred.
6. **Price-lift mechanics.** How is the launch-price-to-target-price
   transition communicated? Grandfathering for early enrollees?

---

## 12. What This Design Does and Does Not Do

**This design does:**

- Preserve the AiBI-S credential's strategic position at the department
  margin of error
- Keep the 5 role tracks as the central differentiator, now bundled into one
  price
- Install a simulation engine as the core pedagogical mechanism (not a
  capstone event)
- Integrate regulation, data classification, and the AiBI frameworks as
  mandatory per-unit tags (not standalone modules)
- Produce portable artifacts a graduate can use to lead AI deployment in
  their real department

**This design does not:**

- Promise any specific completion time or duration
- Include live instruction, cohort mechanics, or scheduled deadlines
- Handle CFO-level, Examiner-level, or Board-level personas (reserved for
  AiBI-L)
- Replace the AiBI-P prereq or its content
- Raise price above $1,495 before we have paying customers, completion
  data, and qualitative feedback — see §9.1

---

## 13. References

- `content/courses/aibi-s/aibi-s-prd.md` — the prior cohort-format PRD,
  superseded by this design for format and pricing, but still valuable for
  content-authoring detail per track
- `content/courses/aibi-s/curriculum-reference.md` — the 6-week structure
  reference, now superseded for format
- `content/courses/aibi-p/` — AiBI-P content, the foundation this course
  builds on
- `CLAUDE.md` — project intelligence file with regulatory frameworks,
  sourced statistics, brand rules
- `.impeccable.md` — design system context
- `Plans/aibi-foundation-v3.html` — the AiBI brand foundation document
- `Plans/aibi-prd.html` — the overall product PRD
