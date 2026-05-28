# #184 — Toolbox content research (Lender / Branch / Compliance)

**Status:** DRAFT — input for the kits that ship under issue #184.
**Date:** 2026-05-19 (autonomous session).
**See:** [issue #184](https://github.com/Gilmore3088/aibi-org/issues/184), [memory `feedback_184_is_content_aggregation`](../../../../.claude/projects/-Users-jgmbp-Projects-TheAiBankingInstitute/memory/feedback_184_is_content_aggregation.md).

This is **not** SME interview output. It is a public-output aggregation:
themes that named industry commentators have surfaced publicly about
AI in community banking, clustered into the three roles that #184 will
populate (Lender · Branch manager · Compliance).

The list below is the **starting set** and intentionally biased toward
analysts + advisory voices who post frequently and citably. The 25-banker
operator list referenced in `docs/handoffs/session-signoff-2026-05-19.md`
should replace these once it is located — operator quotes carry more
weight than analyst commentary for tools the operators themselves will
use.

## Public commentators surfaced (web search, 2026-05-19)

| Name | Role / Affiliation | Surface | Themes touched |
|------|-------------------|---------|----------------|
| Jim Marous | Banking Transformed podcast · Financial Brand | LinkedIn + podcast | Agentic AI adoption gap (96% engaged vs. 19% production); 2026 budget priorities |
| Ron Shevlin | Cornerstone Advisors CRO · `What's Going On in Banking` annual | LinkedIn + Forbes | Operationalizing AI; closing the plans-vs-execution gap |
| JP Nicols | Innosect · Bank Innovators Council | Blog + LinkedIn | Innovation strategy; AI inside a regulated culture |
| Steven Ramirez | Beyond the Arc | LinkedIn | Community-bank AI rollout dynamics |
| Sam Maule | Moov | LinkedIn | AI + fintech infrastructure for community FIs |
| Steve Sargent | (LinkedIn personality, banker) | LinkedIn post 2026-05 | "Most community banks still treat AI like…" (credit decisioning) |
| Michael Abbott | Accenture | Financial Brand article | "Optimize my idle cash" — consumer-side AI shift |
| Charlotte Little | Atlantic Community Bankers Bank | LinkedIn | Community-bank operations |
| Amanda Harris | Community Bankers' Bank | LinkedIn | Community-bank back-office |

**Gap:** The web searches surface very few **operator-side** community
bankers (working lenders, working branch managers, working compliance
officers) writing publicly under their own name. Three reasons this
matters:

1. The issue's acceptance criteria require **SME identified and signed off
   as content reviewer** for each role. None of the names above are
   operating lenders / branch managers / compliance officers — they are
   analysts and advisors.
2. The memory entry says "pull what the bankers are already saying
   publicly." That works well for industry commentary; less well for
   operational prompts the actual operators will use day-to-day.
3. The 25-banker list referenced in the prior session sign-off was
   never located. It almost certainly contains the operator names that
   would close this gap.

**Recommendation for the PR reviewer:**

- Replace each tool's `proposed_reviewer` placeholder with a real
  operating banker from your personal network (or the 25-banker list
  when it surfaces).
- Validate each prompt's content with that reviewer before the PR
  flips from Draft → Ready.

## Themes clustered per role

### Lender (5 tools)

- **Borrower-context summarization.** Commentary across The Financial Brand
  and Anthropic's recent agent launch (American Banker, 2026) frames credit
  memo writing as the canonical first AI use case in community banking:
  *"taking a set of information and developing a narrative off of it that
  is easy to understand and push forward through an approval process."*
- **ECOA / Reg B adverse-action letters.** Compliance literature
  (Wolters Kluwer 2025–2026 BSA/AML developments piece; ncontracts 2026
  emerging risks guide) repeatedly flags adverse-action letter precision
  as a Reg B exposure surface that LLMs both help and hurt.
- **Covenant extraction.** AI underwriting platform pieces (aloan.ai,
  Timvero, BAI) consistently identify covenant + condition extraction
  from credit agreements as a high-value, low-creativity AI task — well
  matched to a structured-output skill.
- **Multi-pass credit memo agents.** The Anthropic agent launch (American
  Banker, 2026-05) ships a credit-memo agent specifically; community-bank
  framing requires a slimmer 4-pass version with examiner-ready citations.
- **Lender starter kit playbook.** Holistic guidance for a lender team
  introducing AI; sources: ICBA 2026 Accelerator Program (Clox AI,
  VaultRight); Cornerstone *What's Going On in Banking* recommendations.

### Branch manager (4 tools)

- **Customer / member complaint response.** Branch-management resume
  literature highlights *"reducing customer complaints by 30%"* as a
  benchmark; the regulator-facing element is what an AI prompt must add
  (UDAAP-aware tone, no admission language).
- **Weekly huddle prep brief.** Coaching cadence in retail banking
  (banking center manager job descriptions, 2026 resume examples)
  centers on weekly cadence; the AI value is summarization, not coaching.
- **Coaching-note tone check (skill).** Behavioral coaching frameworks
  (Cornerstone's banking strategies content) consistently warn against
  vague or judgement-loaded coaching notes; a tone-check skill enforces
  fair, specific, behavioral language.
- **Member follow-up after escalation.** Brings together the complaint
  response + huddle cadence — the bridge from incident to retention.

### Compliance (5 tools)

- **Vendor TPRM language.** ncontracts 2026 *Emerging Risks* guide:
  *"49% of FIs report exams now focus on specific areas such as
  cybersecurity and TPRM rather than comprehensive reviews."* AI
  vendor diligence (Freddie Mac AI governance, March 2026) raises
  the stakes.
- **Exception letter (issued).** Standard regulator-friendly format;
  every compliance team has one; an AI prompt enforces the structure.
- **Regulator-friendly executive summary.** Translate technical
  findings into examiner-ready narratives — the rescinded SR 11-7
  framework (replaced April 2026) makes summary clarity more important,
  not less, because risk-based exams reward concision.
- **Citation-checked research extract (skill).** AIEOG Lexicon (Feb 2026)
  defines hallucination, governance, and HITL; the skill enforces every
  factual claim trace to a citation present in the input.
- **3-pass policy-document reviewer agent.** Read → check against named
  reg → output sectioned summary of gaps. The Wolters Kluwer 2025–2026
  BSA/AML piece + the April 2026 OCC Bulletin 2026-13 rescinding SR 11-7
  are the canonical reference documents for community-bank policy.

## Per-tool citation placeholders

Each shipped tool carries a `<!-- pending_reviewer -->` block with:

- The theme cluster it draws from (Lender, Branch, Compliance).
- The commentator(s) whose public output most directly informs it.
- An explicit "needs SME signoff" marker.

The reviewer's job is to:

1. Replace the commentator name with the actual operating banker who
   validated the prompt.
2. Add a quote / link to that banker's public statement that supports
   the prompt's framing.
3. Remove the `<!-- pending_reviewer -->` marker.

That converts the tool from DRAFT to shippable.
