// Dimension-keyed starter artifacts for the v3 post-assessment breakdown.
// Each banker who completes the assessment gets ONE artifact tied to their
// lowest-scoring dimension — copy/pasteable markdown they can take to a
// colleague this week.
//
// Voice: banker-direct, specific. Three concrete actions for the week, one
// starter prompt that works in any chat tool, one clear citation strip.
// No marketing, no AI buzzwords. Same body ships across all four tiers
// for a given dimension; tier-specific framing is added at render time.

import type { Dimension } from './types';

export interface StarterArtifact {
  readonly title: string;
  readonly subtitle: string;
  readonly filename: string;
  readonly body: string;
}

const ARTIFACTS: Record<Dimension, StarterArtifact> = {
  'strategic-value': {
    title: 'A 30-day "candidate workflow" brief',
    subtitle: 'Pick two workflows worth scoping for AI — name owners, name outcomes.',
    filename: 'aibi-strategic-value.md',
    body: `# A 30-day "candidate workflow" brief

The institutions that move from AI talk to AI value share one thing: they pick
specific workflows, name owners, and tie those workflows to numbers leadership
already tracks. Programs that stay at the "we should look at AI" altitude rarely
make it through a budget cycle.

## Three things you can do this week

1. **List the friction.** Sit with each department head for 20 minutes. Ask one
   question: "What is the recurring task that takes too long and produces an
   output that is mostly the same every time?" Write down what you hear.
2. **Pick two candidates.** From the list, pick two workflows you think AI
   could meaningfully assist — typical candidates are BSA narrative drafting,
   loan-file summaries, vendor-due-diligence write-ups, member communications.
3. **Write the one-page brief.** For each candidate: the workflow today, the
   friction, the AI shape (summarization, drafting, classification), the named
   owner, the 90-day measurable outcome. Take both to leadership.

## A starter prompt to use

> Help me draft a one-page candidate-workflow brief for an AI initiative at my
> community bank. The workflow is [DESCRIBE]. Cover: the workflow today in
> three to five bullets, the friction points, the shape of the AI assistance,
> the named owner, and a measurable 90-day outcome. Tone: specific,
> conservative, no vendor jargon.

## Why this is the right first step

Budget conversations stall on abstraction. Two named workflows with named
owners and named outcomes turn the AI conversation into a project plan, and
project plans get funded.

## Citations

- AI Playbook for Banks and Credit Unions, Cornerstone Advisors, 2025
- Getting Started in AI, Jack Henry & Associates, 2025
`,
  },

  'infrastructure-readiness': {
    title: 'A one-page core-integration map',
    subtitle: 'Inventory the silent blocker behind every later AI workflow.',
    filename: 'aibi-infrastructure-readiness.md',
    body: `# A one-page core-integration map

Most AI workflow proposals do not fail on AI. They fail on integration —
"can the data get in, can the output get back, does the core provider need
to be involved." Inventory the answer once and reuse it for every later
proposal.

## Three things you can do this week

1. **List every operational system.** Core, loan origination, deposit
   platform, CRM, document management, BSA / AML, board portal. One row
   each.
2. **Tag the integration type.** Open API, vendor marketplace only, closed.
   Note the last custom integration completed and roughly how long it took.
3. **Rate readiness.** "Ready" if we can integrate without core-provider
   intervention. "Partial" if the provider's marketplace covers it.
   "Blocked" if any new connection is a multi-month vendor project.

## A starter prompt to use

> Help me draft a one-page core-integration map for AI workflows at my
> institution. The systems are [LIST]. For each, capture: integration type,
> last custom integration completed, known blockers, and a "ready / partial /
> blocked" rating. Format as a single table.

## Why this is the right first step

AI initiatives that look the same on paper diverge wildly based on
integration readiness. Surface the constraint before you scope the workflow,
not after.

## Citations

- AI Playbook for Banks and Credit Unions, Cornerstone Advisors, 2025
- Hybrid Multi-Cloud AI Strategy, SS&C Managed IT, 2025
`,
  },

  'data-quality': {
    title: 'A one-domain verified data view',
    subtitle: 'Build the substrate every later AI workflow will draw on.',
    filename: 'aibi-data-quality.md',
    body: `# A one-domain verified data view

AI is only as good as the data it references. Most community banks discover
this the hard way — three AI experiments in a row produce uneven results
because the underlying data was uneven. Build one verified view first;
everything else compounds on it.

## Three things you can do this week

1. **Pick the domain.** Member / customer 360 is the most common first
   choice. Loan portfolio is the second. Pick the one where the next two
   AI workflows will land.
2. **Document the rules.** Source systems that feed the view, deduplication
   logic, refresh cadence, the named owner. One page.
3. **Attach the review note.** Known data-quality issues, the cadence of
   the data-quality review, who signs off. Make the review note part of
   the view itself, not a separate document nobody reads.

## A starter prompt to use

> Help me scope a verified, AI-ready data view for the [MEMBER 360 / LOAN
> PORTFOLIO / OPERATIONAL] domain at my community bank. For each:
> source systems, deduplication and reconciliation rules, refresh cadence,
> named owner, data-quality review notes to attach. Keep it practical for a
> community-bank-sized data team.

## Why this is the right first step

AI tools that draw on the same verified view get better together. AI tools
that draw on raw systems each carry their own data-quality risk. Build the
view once and the program compounds; rebuild it three times and it does
not.

## Citations

- AI Playbook for Banks and Credit Unions, Cornerstone Advisors, 2025
- Hybrid Multi-Cloud AI Strategy, SS&C Managed IT, 2025
`,
  },

  'security-approved-tools': {
    title: 'A one-page approved AI tool list',
    subtitle: 'Stop guessing which tools are sanctioned. Publish the answer.',
    filename: 'aibi-security-approved-tools.md',
    body: `# A one-page approved AI tool list

Staff use what they find. Without a published list of approved tools, they
make different decisions in different rooms — and the worst decision becomes
a reportable incident. Publish the list this week. It is the cheapest single
risk reduction available to you.

## Three things you can do this week

1. **List the tools you already pay for.** Microsoft Copilot, an enterprise
   ChatGPT instance, your core provider's AI feature, the document tool's AI
   add-on. Three to five tools is plenty.
2. **For each, decide the data class.** Green (public), Yellow (internal
   non-NPI), Red (do not paste customer / member data into this tool). Be
   explicit.
3. **Publish it.** Same place as the acceptable use policy. Footer with the
   "request an addition" process and the named owner.

## A starter prompt to use

> Help me draft a one-page approved AI tool list for my community bank or
> credit union. For each tool: name, vendor, allowed data class
> (Green / Yellow / Red), the named owner who approves new use cases, and the
> review cadence. Include a footer for the addition-request process. Tone is
> matter-of-fact, not promotional.

## Why this is the right first step

Examiners will ask for this artifact. The AIEOG AI Lexicon (US Treasury,
Feb 2026) defines an "AI use case inventory" as a baseline expectation;
your approved-tool list is the first half of that artifact.

## Citations

- AIEOG AI Lexicon, US Treasury / FBIIC / FSSCC, February 2026
- SR 11-7 Guidance on Model Risk Management, Federal Reserve / OCC
`,
  },

  'runtime-safeguards': {
    title: 'An input/output checklist for one workflow',
    subtitle: 'Build the reflex on one workflow, then replicate it.',
    filename: 'aibi-runtime-safeguards.md',
    body: `# An input/output checklist for one workflow

Reflexes are built by repetition. Pick one AI-assisted workflow staff already
use. Add a six-line checklist. Watch the reflex form within a month.

## Three things you can do this week

1. **Pick the workflow.** The one staff already use confidently — a meeting
   summary, a draft email, a document summary.
2. **Write the three input checks.** What data is in this prompt. Is any of
   it restricted (PII, NPI, loan files). Am I using the approved tool for
   this data class.
3. **Write the three output checks.** Does this need a reviewer. Is this
   customer-facing or internal. Has a sample of recent output been spot-
   checked for accuracy this month.

## A starter prompt to use

> Draft a six-line input/output checklist for one AI-assisted workflow at
> my institution. The workflow is [DESCRIBE]. Three "before prompting"
> checks and three "before using the output" checks. Short enough to live
> on the side of a screen.

## Why this is the right first step

Runtime safeguards are not a memo; they are a habit. Build the habit on one
workflow, then replicate the checklist pattern to the next one. Within a
quarter, every AI-assisted workflow has its own.

## Citations

- AI Playbook for Banks and Credit Unions, Cornerstone Advisors, 2025
- Hybrid Multi-Cloud AI Strategy, SS&C Managed IT, 2025
- AIEOG AI Lexicon, US Treasury / FBIIC / FSSCC, February 2026
`,
  },

  'regulatory-compliance': {
    title: 'One AI use case mapped to its regulatory regime',
    subtitle: 'Pre-answer the examiner question and the customer dispute.',
    filename: 'aibi-regulatory-compliance.md',
    body: `# One AI use case mapped to its regulatory regime

Pick the AI-assisted process closest to a regulated decision. Write the
one-page map. The other use cases get the same treatment, one at a time —
but the first one establishes the pattern.

## Three things you can do this week

1. **Pick the use case.** Adverse-action decisions, marketing eligibility,
   fraud screening, member-service tier routing. Start with the one that
   touches the most regulation.
2. **Write the map.** Process today (three to five bullets), regulations
   that apply, disclosures required, named reviewer, retention rule.
3. **Bring it to compliance.** Not for approval — for refinement. The map
   gets sharper after the compliance team reads it and edits it.

## A starter prompt to use

> Help me draft a one-page regulatory map for an AI-assisted process at
> my community bank or credit union. The process is [DESCRIBE]. Cover:
> the process today, applicable regulations (ECOA / Reg B, SR 11-7, AIEOG
> Lexicon, others), disclosures required, the review step and named
> reviewer, and the retention rule. Tone: examiner-aware, no consultancy
> jargon.

## Why this is the right first step

The GAO has flagged that no comprehensive AI-specific banking framework
exists yet — but existing regulations (SR 11-7, ECOA / Reg B, TPRM) already
apply. Mapping one use case now is the cheapest way to be ready when the
framework arrives.

## Citations

- GAO-25-107197, US GAO, May 2025
- AIEOG AI Lexicon, US Treasury / FBIIC / FSSCC, February 2026
- SR 11-7 Guidance on Model Risk Management, Federal Reserve / OCC
`,
  },

  'fair-lending-testing': {
    title: 'A disparate-impact pass on one AI-assisted process',
    subtitle: 'Pre-empt the claim that would otherwise arrive cold.',
    filename: 'aibi-fair-lending-testing.md',
    body: `# A disparate-impact pass on one AI-assisted process

Fair-lending obligations apply whether an AI tool is in the path or not.
Run the same disparate-impact analysis your standard program applies, with
AI-assisted decisions flagged in the data. Treat AI-assisted decisions as
a line item, not an exception.

## Three things you can do this week

1. **Pick the process.** The AI-assisted process closest to a credit
   decision — pricing tier, automated declines, marketing eligibility.
2. **Pull the data.** Decisions, applicant attributes, protected-class
   indicators where available, flagged by whether AI was in the path.
3. **Run the metrics.** Approval-rate gap, score distribution, outcome
   variance. Compare AI-assisted decisions to the non-AI baseline. Report
   to the same forum at the same cadence.

## A starter prompt to use

> Help me design a one-page disparate-impact pass on an AI-assisted process
> at my institution. The process is [DESCRIBE]. Cover: the data slice
> needed, the metrics to compute, the non-AI baseline to compare against,
> the reporting forum and cadence, and the escalation path if a metric
> crosses an internal threshold.

## Why this is the right first step

ECOA / Reg B does not have an "AI exception." The institutions that run
the testing pass before being asked are positioned to defend the program;
the ones that don't are positioned to explain why.

## Citations

- Equal Credit Opportunity Act / Regulation B, CFPB
- AIEOG AI Lexicon, US Treasury / FBIIC / FSSCC, February 2026
- GAO-25-107197, US GAO, May 2025
`,
  },

  'human-in-the-loop': {
    title: 'A one-page AI oversight matrix',
    subtitle: 'Turn implicit policy into a defensible document.',
    filename: 'aibi-human-in-the-loop.md',
    body: `# A one-page AI oversight matrix

Oversight without a written policy is oversight that varies by the day,
the team, and the person on duty. The matrix is one page; the value is
that the institution stops re-litigating the question every time a new use
case arrives.

## Three things you can do this week

1. **List the use cases.** Every AI-assisted task in production today.
   One line each.
2. **Tag the oversight level.** Automated (no review), sampled (random
   spot-check), mandatory (every output reviewed). Be explicit per use
   case.
3. **Name the reviewer.** A person, not a role. Add the review cadence
   and the log location. Living document; reviewed quarterly.

## A starter prompt to use

> Help me draft a one-page AI oversight matrix for my institution. For
> each AI use case in production, cover: use case (one line), oversight
> level (automated / sampled / mandatory), the named reviewer, the review
> cadence, and where the log lives. Format as a single one-page table.

## Why this is the right first step

The AIEOG Lexicon defines "human-in-the-loop" as a baseline expectation.
The matrix is the artifact that proves you have one — and the document
that prevents oversight from drifting silently as use cases multiply.

## Citations

- AIEOG AI Lexicon, US Treasury / FBIIC / FSSCC, February 2026
- SR 11-7 Guidance on Model Risk Management, Federal Reserve / OCC
- AI Playbook for Banks and Credit Unions, Cornerstone Advisors, 2025
`,
  },

  'talent-culture': {
    title: 'Redefine one role around AI oversight',
    subtitle: 'Establish the career path before your best people look for one.',
    filename: 'aibi-talent-culture.md',
    body: `# Redefine one role around AI oversight

AI shifts a meaningful share of staff work from doing the task to
overseeing it. Institutions that do not redefine roles in light of that
shift lose their best people to institutions that have. Redefine one role
this quarter; let it become the template.

## Three things you can do this week

1. **Pick the role.** An operations analyst or compliance specialist is
   the most common starting point — someone whose work AI will materially
   change in the next year.
2. **Rewrite the role description.** Add AI oversight and workflow design
   responsibilities. Add the performance objectives tied to AI workflows
   they will own. Update the reporting line if needed.
3. **Run it past the person in the role.** Their input shapes the
   definition. Their excitement shapes the retention story.

## A starter prompt to use

> Help me redefine the [ROLE TITLE] position at my community bank or
> credit union around AI oversight. Draft: a revised one-paragraph role
> description, three performance objectives tied to AI workflows or
> oversight outcomes, the 90-day onboarding plan, the reporting line and
> the manager review cadence. Tone: grounded in community-bank operations.

## Why this is the right first step

Staff watch where the institution invests. A redefined role with named
performance objectives signals investment more clearly than any all-staff
email. It also surfaces the next builder before someone else hires them.

## Citations

- AI Playbook for Banks and Credit Unions, Cornerstone Advisors, 2025
- Getting Started in AI, Jack Henry & Associates, 2025
`,
  },

  'data-safety-reflexes': {
    title: 'A 30-minute Green/Yellow/Red training for one team',
    subtitle: 'Build the reflex that prevents the most common AI compliance failure.',
    filename: 'aibi-data-safety-reflexes.md',
    body: `# A 30-minute Green/Yellow/Red training for one team

The single most common AI failure at community banks is PII or NPI ending
up in a public AI tool because no one had a reflex about it. The reflex
is built in 30 minutes, reinforced over two weeks, and lasts.

## Three things you can do this week

1. **Build the one-page card.** Green (public information, fine to paste),
   Yellow (internal non-NPI, use only approved tools), Red (NPI / PII /
   loan files, do not paste anywhere). One worked example per category.
2. **Run the session.** 30 minutes with one team. Five worked examples
   using clearly synthetic data, showing the call. Two short check-for-
   understanding questions.
3. **Run the reinforcement.** For the next two weeks, the manager reviews
   one AI-assisted output per week with the team and flags the data class.
   The reflex forms in repetition, not in training.

## A starter prompt to use

> Help me run a 30-minute data-safety training on AI use for one team at
> my community bank. Cover: a one-paragraph framing for staff who have not
> thought about this, the three categories (Green / Yellow / Red) with
> one-line definitions, five worked examples using clearly synthetic data,
> two short check-for-understanding questions, and the two-week
> reinforcement plan the manager runs after the session.

## Why this is the right first step

Compliance training that lives in a binder produces compliance theater.
Reflexes that live in weekly reviews produce compliance reality. The
30-minute session plus two weeks of reinforcement is the difference.

## Citations

- AIEOG AI Lexicon, US Treasury / FBIIC / FSSCC, February 2026
- Hybrid Multi-Cloud AI Strategy, SS&C Managed IT, 2025
- AI Playbook for Banks and Credit Unions, Cornerstone Advisors, 2025
`,
  },

  'continuous-validation': {
    title: 'A monthly drift check on one AI tool',
    subtitle: 'Move one tool off annual review. The others follow.',
    filename: 'aibi-continuous-validation.md',
    body: `# A monthly drift check on one AI tool

Static model risk frameworks cannot handle AI tools that change. Pick
the tool with the highest decision weight. Add one quantitative drift
check at a monthly cadence. Establish the pattern; expand from there.

## Three things you can do this week

1. **Pick the tool.** The AI tool whose output influences the most
   decisions — most often a credit-decision support model, a fraud-
   screening tool, or a pricing assistant.
2. **Pick the drift metric.** Output distribution, error rate against a
   holdout sample, or approval-rate change. One metric is enough to start.
3. **Document the threshold.** What number triggers a deeper review.
   Where does the result get logged. Who is the named reviewer.

## A starter prompt to use

> Help me add a continuous drift check to one AI tool in my institution's
> model inventory. The tool is [DESCRIBE]. Cover: the drift metric (output
> distribution, error rate, or holdout-sample performance), the cadence,
> the threshold that triggers a deeper review, the named reviewer, and
> where the result is logged. Format as a one-page addition to the model
> risk file.

## Why this is the right first step

SR 11-7 was written for static models. The institutions that extend its
spirit to live AI systems — drift monitoring, ongoing validation, named
reviewers — are the ones whose model risk programs hold up under
examination. Start with one tool; expand to the inventory.

## Citations

- SR 11-7 Guidance on Model Risk Management, Federal Reserve / OCC
- AIEOG AI Lexicon, US Treasury / FBIIC / FSSCC, February 2026
- GAO-25-107197, US GAO, May 2025
`,
  },

  'vendor-risk': {
    title: 'An AI-specific TPRM overlay',
    subtitle: 'Add one page to the standard questionnaire. Apply it to every AI vendor.',
    filename: 'aibi-vendor-risk.md',
    body: `# An AI-specific TPRM overlay

Standard TPRM was built for SaaS. AI vendors carry risk that a generic
questionnaire does not surface — model behavior, explainability, drift,
integration risk, model-change notifications. Add the overlay once and
reuse it.

## Three things you can do this week

1. **Draft the overlay.** One page covering: model behavior and known
   limitations, explainability (can principal-reason disclosures be
   produced), drift monitoring and vendor practices, integration risk,
   notification requirements for material model or behavior changes.
2. **Apply it retroactively.** The three AI vendors with the highest
   decision weight in production. Score them on the overlay this quarter.
3. **Apply it going forward.** Every new AI vendor passes through the
   overlay during onboarding. The standard packet now includes it.

## A starter prompt to use

> Help me draft a one-page AI-specific overlay for my institution's
> standard TPRM questionnaire. Cover: model behavior and known
> limitations, explainability and adverse-action disclosure support,
> drift monitoring and vendor practices, integration risk, and
> notification requirements for material model or behavior changes.
> Tone: examiner-grade. Audience: vendor management plus compliance.

## Why this is the right first step

The Interagency TPRM Guidance applies to AI vendors but does not yet
spell out AI-specific questions. Adding the overlay puts the institution
ahead of the examiner expectation and creates a contractual basis for
notification when a model changes underneath you.

## Citations

- Interagency Guidance on Third-Party Risk Management, Federal Reserve / OCC / FDIC
- AIEOG AI Lexicon, US Treasury / FBIIC / FSSCC, February 2026
- AI Playbook for Banks and Credit Unions, Cornerstone Advisors, 2025
`,
  },
};

export function getStarterArtifact(dimension: Dimension): StarterArtifact {
  return ARTIFACTS[dimension];
}

export const STARTER_ARTIFACTS = ARTIFACTS;
