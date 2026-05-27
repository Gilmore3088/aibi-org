// AiBI Readiness Assessment — v3 Personalization Content
//
// Self-contained for v3. Tier-keyed content matches v2 voice (same tier ids,
// same intent) so the executive briefing reads consistently. Dimension-keyed
// content is freshly authored for the 12 v3 readiness dimensions.
//
// Voice: editorial-first, banker-direct, specific. No marketing language.
// Treat this file as a working first draft authored alongside the v3
// question pool; the user is expected to do a voice editing pass before
// the free funnel ships v3 to production.

import type { Tier } from './scoring';
import type { Dimension } from './types';

// ---------------------------------------------------------------------------
// PERSONAS — tier id → persona label + one-liner.
// ---------------------------------------------------------------------------

export interface Persona {
  readonly id: Tier['id'];
  readonly label: string;
  readonly oneLine: string;
}

export const PERSONAS: Record<Tier['id'], Persona> = {
  'starting-point': {
    id: 'starting-point',
    label: 'Unstructured AI',
    oneLine:
      "Your staff are already using AI — they just have no shared rules for it. Different teams make different decisions about what tools are safe and what data can go where. That is the gap to close first.",
  },
  'early-stage': {
    id: 'early-stage',
    label: 'Coordinated Experimentation',
    oneLine:
      "Some teams are running real AI experiments and getting wins. The ones who pull ahead next are the ones who turn those wins into shared workflows — not the ones who buy more tools.",
  },
  'building-momentum': {
    id: 'building-momentum',
    label: 'Program Building',
    oneLine:
      "Multiple teams are using AI and producing real value. The risk now is that the program lives or dies with two or three motivated employees. Time to codify what is working.",
  },
  'ready-to-scale': {
    id: 'ready-to-scale',
    label: 'Capability Leadership',
    oneLine:
      "AI is operating as a real capability inside your institution. The next question is replication speed — how fast every new hire reaches the same baseline as your strongest users.",
  },
};

// ---------------------------------------------------------------------------
// BIG INSIGHT — single sentence per tier.
// ---------------------------------------------------------------------------

export const BIG_INSIGHT: Record<Tier['id'], string> = {
  'starting-point':
    "Quick AI wins are within reach. What's missing is the shared structure to make them safe and repeatable.",
  'early-stage':
    "You have the curiosity. What you lack is the connective tissue that turns isolated wins into institutional capability.",
  'building-momentum':
    "Your workflows are working. The next constraint is measurement — outcomes documented well enough to defend the program at the board level.",
  'ready-to-scale':
    "You have a working program. The compounding question is whether every new hire can reach your top performers' baseline fast enough to keep the advantage.",
};

// ---------------------------------------------------------------------------
// SIGNATURE INSIGHT — the memorable line that travels with the report.
// ---------------------------------------------------------------------------

export const SIGNATURE_INSIGHT =
  "Most institutions do not fail because employees refuse to use AI. They struggle because experimentation spreads faster than operational standards.";

// ---------------------------------------------------------------------------
// MATURITY LADDER — six named rungs.
// ---------------------------------------------------------------------------

export interface MaturityRung {
  readonly label: string;
  readonly description: string;
}

export const MATURITY_LADDER: ReadonlyArray<MaturityRung> = [
  {
    label: 'AI Curiosity',
    description:
      "AI is on the agenda but not yet on the floor. Individual staff are experimenting on their own time.",
  },
  {
    label: 'Controlled Experimentation',
    description:
      "A small group of staff use AI inside loosely-defined guardrails. Wins are real but unevenly distributed.",
  },
  {
    label: 'Building Momentum',
    description:
      "Multiple teams produce measurable value with AI. The program survives on individual sponsors and a few motivated builders.",
  },
  {
    label: 'Operational Adoption',
    description:
      "AI-assisted workflows are documented, reviewed, and replicable. Outcomes are measured and reported to leadership monthly.",
  },
  {
    label: 'Governed Scale',
    description:
      "Every staff member shares the same safe-use baseline. Governance is examiner-grade and onboarding rebuilds capability automatically.",
  },
  {
    label: 'Institutional Advantage',
    description:
      "AI capability is a durable institutional asset. Compounding learning loops are the operating norm; the question shifts from adoption to compounding.",
  },
];

export const TIER_TO_RUNG: Record<Tier['id'], number> = {
  'starting-point': 0,
  'early-stage': 1,
  'building-momentum': 2,
  'ready-to-scale': 4,
};

// ---------------------------------------------------------------------------
// PRACTICE PICTURE — recognition copy by role, per tier.
// ---------------------------------------------------------------------------

export interface PracticePictureRow {
  readonly role: 'Operations' | 'Compliance / Risk' | 'Managers' | 'Executives';
  readonly body: string;
}

export const PRACTICE_PICTURE: Record<Tier['id'], ReadonlyArray<PracticePictureRow>> = {
  'starting-point': [
    {
      role: 'Operations',
      body:
        "A handful of staff are using AI for summaries, draft emails, or research — but each person is doing it their own way. Nobody can point to a workflow that is documented or repeatable.",
    },
    {
      role: 'Compliance / Risk',
      body:
        "There is concern about what data is being pasted where, what vendors are touching customer information, and whether review steps are consistent. The instinct is to slow everything down until somebody writes it all up.",
    },
    {
      role: 'Managers',
      body:
        "There is curiosity, but not enough proof. Without measurable wins, managers cannot defend giving their team time to learn this — and the staff who could lead it do not have permission to.",
    },
    {
      role: 'Executives',
      body:
        "Leadership knows AI matters, but does not yet have a confident answer to 'where are we today, and what is our first move?' That uncertainty turns every conversation into a survey of opinions.",
    },
  ],
  'early-stage': [
    {
      role: 'Operations',
      body:
        "Two or three people on the team are getting real time savings with AI. Everyone else can tell something is working, but cannot quite point to which prompt or which tool is doing it.",
    },
    {
      role: 'Compliance / Risk',
      body:
        "A baseline policy probably exists, but it lags the way staff are actually using AI. The audit-trail question — what tool, what data, what review — has different answers in different rooms.",
    },
    {
      role: 'Managers',
      body:
        "Managers see the wins but can't yet codify them. Without a documented workflow, replicating the same outcome on another team takes weeks instead of days.",
    },
    {
      role: 'Executives',
      body:
        "Leadership sees evidence that AI is producing value, but cannot defend continued investment in front of the board without measurement. The conversation needs a number, not a feeling.",
    },
  ],
  'building-momentum': [
    {
      role: 'Operations',
      body:
        "Multiple teams are running AI-assisted workflows. The patterns are real, but they only live in two or three people's heads — when those people are out, the work slows down visibly.",
    },
    {
      role: 'Compliance / Risk',
      body:
        "Governance is real but uneven. One team's documentation would pass an examiner; another team's would not. The risk is not policy absence — it is inconsistent application across the institution.",
    },
    {
      role: 'Managers',
      body:
        "Managers are managing the program by hand, tracking who's doing what in spreadsheets. Without standardized workflows and outcome measurement, scale always feels two hires away.",
    },
    {
      role: 'Executives',
      body:
        "Leadership wants to invest more but needs to defend ROI numerically. The metrics exist on individual desks; they have never been rolled up into the kind of view a board expects.",
    },
  ],
  'ready-to-scale': [
    {
      role: 'Operations',
      body:
        "Standard workflows are documented and most teams follow them. The remaining variation is between top performers and average performers — the question is how to close that gap faster for every new hire.",
    },
    {
      role: 'Compliance / Risk',
      body:
        "Governance is mature. The audit trail holds up under examiner review. The remaining concern is keeping policy current as new tools and new vendor relationships arrive.",
    },
    {
      role: 'Managers',
      body:
        "Managers spend less time on policy and more time on coaching. The bottleneck is replication speed — getting the next class of analysts to your top performers' baseline without slowing the program down.",
    },
    {
      role: 'Executives',
      body:
        "Leadership has documented outcomes and a defensible budget story. The strategic question is no longer whether to invest, but where the next compounding investment is — measurement, leadership judgment, or capability depth.",
    },
  ],
};

// ---------------------------------------------------------------------------
// GAP CONTENT — per v3 dimension: oneLine, explanation, impacts[2],
// whatGoodLooksLike[2]. Renders inside the rich gap card.
// ---------------------------------------------------------------------------

export interface GapContent {
  readonly oneLine: string;
  readonly explanation: string;
  readonly impacts: readonly [string, string];
  readonly whatGoodLooksLike: readonly [string, string];
}

export const GAP_CONTENT: Record<Dimension, GapContent> = {
  'strategic-value': {
    oneLine: 'No named bottlenecks. AI conversations stay theoretical.',
    explanation:
      "AI is on the agenda but not yet tied to a specific workflow, efficiency target, or revenue line. Without a named bottleneck and a named owner, the program lives in slide decks and never reaches anyone's desk.",
    impacts: [
      'Budget conversations stall because no concrete outcome is being defended',
      'Staff time gets spent on experiments that no one can defend to leadership',
    ],
    whatGoodLooksLike: [
      'Two or three named high-friction workflows scoped as AI candidates with owners',
      'AI initiatives mapped to specific efficiency-ratio or revenue lines that leadership tracks',
    ],
  },
  'infrastructure-readiness': {
    oneLine: 'Your core systems block the integrations a program would need.',
    explanation:
      "AI tools deliver value when they can read the data and write back into the systems where work happens. A closed core or fragile integration pattern turns every workflow into a multi-month vendor project, and most workflows never make it past the request stage.",
    impacts: [
      'Useful AI workflows stay stuck behind core-provider integration queues',
      'Innovation depends on a small number of vendor-selected tools',
    ],
    whatGoodLooksLike: [
      'A stack that supports standard APIs and has completed at least one custom integration this year',
      'A documented integration path for adding third-party tools without core-provider involvement',
    ],
  },
  'data-quality': {
    oneLine: 'Your data is too scattered for AI to be useful on it.',
    explanation:
      "AI tools are only as good as the data they reference. If pulling a clean view of a customer or a loan requires a manual reconciliation exercise, AI cannot meaningfully assist — and the institutions that move fastest are the ones whose data layer is ready before the tools arrive.",
    impacts: [
      "AI tools cannot reliably draw on institutional context — every prompt has to recreate it",
      'Reporting accuracy degrades faster than anyone realizes when AI is layered on shaky data',
    ],
    whatGoodLooksLike: [
      "A unified, verified data layer that AI tools can reference for accurate institutional context",
      'A documented data-quality review cadence with named owners for each domain',
    ],
  },
  'security-approved-tools': {
    oneLine: 'Staff use whatever AI they find. You cannot see, govern, or defend it.',
    explanation:
      "Without an approved AI tool list and traffic that routes through institution-controlled channels, staff use whatever public tools they find. The institution loses visibility into what data is going where, and the audit trail your examiner expects cannot be produced.",
    impacts: [
      "PII or member data ends up in public AI tools without anyone knowing it happened",
      "The examiner asks for your AI tool inventory and you cannot produce one",
    ],
    whatGoodLooksLike: [
      "All staff AI use routes through institution-approved channels with logging and access controls",
      "A documented approved-tool list with named owners and a review cadence as tools change",
    ],
  },
  'runtime-safeguards': {
    oneLine: 'No input or output controls. Staff judgment is the only line of defense.',
    explanation:
      "Runtime safeguards are the checks that catch unsafe data going into AI tools and unsafe content coming back. Without them, every AI-assisted task depends on the carefulness of one person — and the failure mode is the prompt that contained PII the user did not notice.",
    impacts: [
      'A single staff prompt with restricted data becomes a reportable incident',
      'Output errors reach customers or decision processes before anyone reviews them',
    ],
    whatGoodLooksLike: [
      'Input controls (PII masking, restricted-data screening) and output review for any customer- or decision-facing work',
      'A documented review cadence with named owners and sampled spot-checks even on automated workflows',
    ],
  },
  'regulatory-compliance': {
    oneLine: 'AI-assisted decisions are not yet mapped to the regulatory regime they touch.',
    explanation:
      "AI in credit, marketing, or member service touches ECOA / Reg B, the AIEOG Lexicon, and SR 11-7 — whether or not the institution has thought through how. If an AI tool helped shape an adverse decision, you have to be able to explain the principal reasons. Today that question does not yet have a documented answer.",
    impacts: [
      'Adverse-action disclosures cannot be reliably produced for AI-assisted decisions',
      "An examiner asking 'how does AI fit into your compliance program?' lands in silence",
    ],
    whatGoodLooksLike: [
      'AI-assisted processes generate the required principal-reason disclosures as a standard output',
      'A compliance review pattern that treats AI-assisted work as in-scope from day one, not retroactively',
    ],
  },
  'fair-lending-testing': {
    oneLine: 'Disparate-impact risk is not being measured inside AI-assisted processes.',
    explanation:
      "Fair lending obligations apply regardless of whether a model was trained on internal data or a vendor brought it in. Without a documented testing protocol that covers AI-assisted decisions, the institution accumulates compliance risk that compounds quietly until something forces it into the open.",
    impacts: [
      'A disparate-impact claim against an AI-assisted process arrives with no evidence of testing',
      'Board reporting on fair lending lags the way decisions are actually being made',
    ],
    whatGoodLooksLike: [
      'A documented fair-lending testing protocol for AI-assisted processes, including disparate-impact analysis',
      "Board-level reporting that includes AI-assisted decision outcomes as a standard line item",
    ],
  },
  'human-in-the-loop': {
    oneLine: 'Oversight levels are ad hoc. Some decisions get four reviews; some get none.',
    explanation:
      "Human-in-the-loop is the line between automation that helps and automation that harms. Without a written policy mapping each AI use case to a specific oversight level (automated, sampled, mandatory approval), staff use their own judgment — and the institution discovers the gaps only after something has gone wrong.",
    impacts: [
      'High-risk decisions get treated like low-risk ones depending on who is doing the work',
      'An incident exposes that the oversight policy was a conversation, not a document',
    ],
    whatGoodLooksLike: [
      'A formal policy mapping each AI use case to an oversight level with logs and named owners',
      'A review cadence that adjusts oversight levels as use cases mature, not just at the start',
    ],
  },
  'talent-culture': {
    oneLine: 'No active preparation for the shift from task execution to AI oversight.',
    explanation:
      "AI moves a meaningful share of staff work from doing the task to overseeing the task. Institutions that have not retrained roles, redefined expectations, or built career paths around AI oversight will find their best people leaving for institutions that have.",
    impacts: [
      'Capability stays vendor-shaped because no internal pipeline is being built',
      'Talented operations and compliance staff leave for institutions that have already done the role redesign',
    ],
    whatGoodLooksLike: [
      "Institution-wide training, redefined role expectations, and career paths built around working alongside AI",
      'A named pipeline of analysts and ops staff who can graduate into AI-builder and oversight roles',
    ],
  },
  'data-safety-reflexes': {
    oneLine: 'Staff cannot reliably name what data is restricted from AI tools.',
    explanation:
      "Data safety in the AI era is a reflex, not a memo. If staff have not been trained on a clear classification system (Green / Yellow / Red, NPI / PII / public, or equivalent), they will make different decisions in different rooms — and the worst decision becomes a reportable incident.",
    impacts: [
      'NPI or PII ends up inside AI tools because the policy was implicit, not practiced',
      'Compliance spends review cycles undoing the consequences of routine staff judgment',
    ],
    whatGoodLooksLike: [
      'Staff use a clear classification system reflexively; restricted data is masked or kept out of AI tools as a matter of habit',
      'Onboarding includes the classification system as a hands-on module with worked examples',
    ],
  },
  'continuous-validation': {
    oneLine: 'AI tools are being treated like static models — annual review at most.',
    explanation:
      "AI models change. Vendors push updates; performance drifts; new edge cases appear. A model risk framework built for the static models of 2010 cannot keep up. Continuous validation — drift monitoring, behavior tracking, performance review on an ongoing basis — is the new bar.",
    impacts: [
      'Model drift goes unnoticed until an outcome forces a retroactive review',
      'Vendor updates change behavior between annual reviews and nobody catches it',
    ],
    whatGoodLooksLike: [
      'Drift, performance, and behavior monitoring on an ongoing basis with named owners',
      'A documented framework that treats AI tools as live systems, not annual artifacts',
    ],
  },
  'vendor-risk': {
    oneLine: 'AI vendors are being onboarded like ordinary SaaS — no AI-specific questions.',
    explanation:
      "Third-party AI risk extends beyond data handling. Model behavior, explainability, drift, and integration risk all sit outside the standard TPRM questionnaire. Without an AI-specific overlay, the institution assumes risk it has not measured — and finds out at incident time.",
    impacts: [
      'A vendor model change introduces unintended behavior the institution has no contractual recourse against',
      'Examiner asks for AI-specific TPRM evidence and the answer is the standard SaaS questionnaire',
    ],
    whatGoodLooksLike: [
      'An AI-specific TPRM overlay covering model behavior, explainability, drift monitoring, and integration risk',
      "Contractual notification requirements for material model or behavior changes from each AI vendor",
    ],
  },
};

// ---------------------------------------------------------------------------
// RECOMMENDATIONS — per v3 dimension.
// ---------------------------------------------------------------------------

export interface Recommendation {
  readonly title: string;
  readonly riskLevel: 'Low' | 'Moderate' | 'Higher';
  readonly timeSaved: string;
  readonly owner: string;
  readonly explanation: string;
  readonly whyRightNow: readonly string[];
  readonly inPractice: string;
  readonly worksBestFor: readonly string[];
}

export const RECOMMENDATIONS: Record<Dimension, Recommendation> = {
  'strategic-value': {
    title: 'Name two AI candidate workflows this quarter',
    riskLevel: 'Low',
    timeSaved: 'Unlocks the budget conversation that comes next',
    owner: 'COO or AI lead + department heads',
    explanation:
      'Pick two recurring high-friction workflows — loan ops, BSA narratives, member communications, vendor-due-diligence summaries. Scope them as AI candidates with named owners and a measurable target. Specific workflows produce specific budgets; abstract programs produce abstract budgets.',
    whyRightNow: [
      'Directly addresses your gap in Strategic Value',
      'Converts an abstract conversation into a budget conversation',
      "Forces specificity — you cannot scope a workflow you have not named",
    ],
    inPractice:
      'A one-page brief per candidate: the workflow today, the friction, the AI shape that would help, the owner, and the 90-day measurable outcome. Take the two best to leadership.',
    worksBestFor: [
      'Loan operations',
      'BSA / AML narrative drafting',
      'Member communications drafts (with review)',
    ],
  },
  'infrastructure-readiness': {
    title: 'Inventory your core APIs and integration gaps',
    riskLevel: 'Low',
    timeSaved: 'Removes the silent blocker behind every later AI workflow',
    owner: 'CIO / IT lead',
    explanation:
      'Build a one-page map: which core systems expose standard APIs, which are closed, which require a vendor request. Most AI workflow proposals stall on infrastructure questions that were never inventoried. Inventory the answer once and reuse it for every later workflow.',
    whyRightNow: [
      'Directly addresses your gap in Infrastructure Readiness',
      'Saves every later workflow from rediscovering the same blockers',
      'Provides the artifact your AI roadmap needs as a precondition',
    ],
    inPractice:
      'A single sheet with one row per system: integration type (open API / vendor marketplace / closed), last custom integration completed, integration-time estimate. Owned by IT, reviewed by the AI lead quarterly.',
    worksBestFor: [
      'Core platform planning conversations',
      'Vendor selection',
      'Annual technology budgeting',
    ],
  },
  'data-quality': {
    title: 'Stand up one verified data view',
    riskLevel: 'Low',
    timeSaved: 'Becomes the substrate every AI workflow draws on',
    owner: 'Data / BI lead + department owner',
    explanation:
      'Pick the one data domain where AI workflows will land first — most likely member / customer 360 or loan operations. Build one verified, deduplicated view that AI tools can reference. The downstream workflows compound on it; the institutions that skip this step rebuild the same view three times.',
    whyRightNow: [
      'Directly addresses your gap in Data Quality',
      'Every later AI workflow benefits from the same view',
      "Surfaces data-quality issues that were always there but never measured",
    ],
    inPractice:
      'One named domain. One owner. A documented refresh cadence. A data-quality review note attached. AI tools point at this view, not at the raw systems.',
    worksBestFor: [
      'Member / customer 360 reporting',
      'Loan portfolio analysis',
      'Operational dashboards',
    ],
  },
  'security-approved-tools': {
    title: 'Publish a one-page approved AI tool list',
    riskLevel: 'Low',
    timeSaved: 'Closes the audit risk your examiner is going to ask about',
    owner: 'Compliance + IT',
    explanation:
      'A short list — three to five tools at most — with: tool name, what data is allowed in it, who approved it, the review cadence, and who to ask for additions. Staff stop guessing; compliance stops chasing; the examiner gets the artifact they were going to ask for.',
    whyRightNow: [
      'Directly addresses your gap in Security & Approved Tools',
      'Closes a documented audit risk',
      'Gives staff a credible answer to "what can I use?"',
    ],
    inPractice:
      'One page. Three columns: tool, allowed data class, owner. A footer for the request-an-addition process. Reviewed quarterly; published in the same place as your acceptable use policy.',
    worksBestFor: [
      'Operations teams',
      'Compliance review',
      'New-hire onboarding packs',
    ],
  },
  'runtime-safeguards': {
    title: 'Add an input/output checklist to one workflow',
    riskLevel: 'Low',
    timeSaved: '15 minutes per pass, becomes reflex within a month',
    owner: 'Workflow owner + compliance',
    explanation:
      "Pick one AI-assisted workflow staff already use. Add a two-sided checklist: before prompting (what data is in this? is it restricted?) and before using the output (does this need a reviewer? is it customer-facing?). Reflexes are built by repetition, not by training videos.",
    whyRightNow: [
      'Directly addresses your gap in Runtime Safeguards',
      'Builds the reflex you need on every later workflow',
      "Creates the audit artifact ('here is the checklist we follow')",
    ],
    inPractice:
      'Six lines on a card. Three input checks, three output checks. Lives on the side of the screen, not in a binder. Reviewed monthly and refined as the workflow matures.',
    worksBestFor: [
      'Member-facing draft generation',
      'Internal summary workflows',
      'Compliance review processes',
    ],
  },
  'regulatory-compliance': {
    title: 'Map one AI use case to its regulatory regime',
    riskLevel: 'Low',
    timeSaved: 'Pre-answers the examiner question and the customer dispute',
    owner: 'Compliance + workflow owner',
    explanation:
      "Pick one AI-assisted process that touches a regulated decision — adverse action, marketing eligibility, fraud screening. Write the one-page map: which regulation applies, what disclosures are required, who reviews the output, how the principal reasons are produced. The other use cases get the same treatment, one at a time.",
    whyRightNow: [
      'Directly addresses your gap in Regulatory Compliance',
      'Becomes the template for every later AI-assisted decision',
      'Surfaces gaps before an examiner or a customer does',
    ],
    inPractice:
      'A one-page summary: process, regulation, disclosure requirement, review step, retention rule. Living document; updated as the process evolves.',
    worksBestFor: [
      'Adverse-action processes',
      'Marketing eligibility decisions',
      'Member service tier routing',
    ],
  },
  'fair-lending-testing': {
    title: 'Run a disparate-impact pass on one AI-assisted process',
    riskLevel: 'Low',
    timeSaved: 'Pre-empts the disparate-impact claim that would arrive cold',
    owner: 'Compliance + analytics',
    explanation:
      "Pick the AI-assisted process closest to a credit decision. Run the same disparate-impact analysis your standard fair-lending program applies, with AI-assisted decisions flagged in the data. Report the outcome to the same forum your fair-lending program reports to. Make AI-assisted decisions a standard line item, not an exception.",
    whyRightNow: [
      'Directly addresses your gap in Fair Lending Testing',
      'Establishes the protocol every later AI-assisted decision will follow',
      'Closes a regulatory exposure that compounds quietly until forced into the open',
    ],
    inPractice:
      'A documented testing pass, completed once. Flag AI-assisted decisions in the data. Compare disparate-impact metrics against the non-AI baseline. Report to the same forum at the same cadence.',
    worksBestFor: [
      'Credit decision workflows',
      'Marketing eligibility decisions',
      'Member service tier assignment',
    ],
  },
  'human-in-the-loop': {
    title: 'Write the oversight matrix for your AI use cases',
    riskLevel: 'Low',
    timeSaved: 'Turns an implicit policy into a defensible one',
    owner: 'Compliance + AI lead',
    explanation:
      "Take the AI use cases that exist today. Map each one to an oversight level: automated, sampled review, mandatory human approval. Write it on one page. Review it quarterly. Without the matrix, oversight is whatever the most cautious or the most rushed person decides this week.",
    whyRightNow: [
      'Directly addresses your gap in Human-in-the-Loop',
      'Closes the audit question about oversight policy',
      "Forces a conversation about which use cases deserve which level of review",
    ],
    inPractice:
      'One page. Columns: use case, oversight level, named reviewer, review cadence, log location. Living document. Reviewed quarterly. Updated as use cases mature.',
    worksBestFor: [
      'Credit decision support workflows',
      'Member service draft generation',
      'Internal summary workflows',
    ],
  },
  'talent-culture': {
    title: 'Redefine one role around AI oversight',
    riskLevel: 'Moderate',
    timeSaved: 'Establishes the career path that retains your best people',
    owner: 'HR + department head',
    explanation:
      "Pick one role — most likely an operations analyst or compliance specialist. Rewrite the job description to include AI oversight and workflow design. Update the performance expectations. Make it the role that gets the institution's next builder onto a defined path, instead of leaving for an institution that has one.",
    whyRightNow: [
      'Directly addresses your gap in Talent & Culture',
      "Signals to staff that the institution is investing in their next move, not waiting for it",
      'Establishes the template the rest of the role redefinitions follow',
    ],
    inPractice:
      'One redefined role. One updated job description. One performance objective tied to an AI workflow they will own. Reviewed at the next performance cycle.',
    worksBestFor: [
      'Operations analysts',
      'Compliance specialists',
      'Lending operations leads',
    ],
  },
  'data-safety-reflexes': {
    title: 'Train one team on Green / Yellow / Red',
    riskLevel: 'Low',
    timeSaved: 'Lowers your single-largest unmeasured compliance risk',
    owner: 'L&D + Compliance',
    explanation:
      "A 30-minute team session walking through a simple classification — Green (public), Yellow (internal), Red (NPI / PII). Worked examples from real banking work, with the fake data plainly marked. Follow up with two-week reinforcement: the manager reviews one AI-assisted output per week with the team and flags the data class.",
    whyRightNow: [
      'Directly addresses your gap in Data Safety Reflexes',
      "Reduces the most common AI-driven compliance failure (PII into public tools)",
      'Establishes the reflex that every later workflow depends on',
    ],
    inPractice:
      'A 30-minute training. Worked examples on a one-page card. Two weeks of reinforcement reviews. Repeats with the next team the following month.',
    worksBestFor: [
      'Operations teams',
      'BSA / AML and compliance',
      'Front-line member service',
    ],
  },
  'continuous-validation': {
    title: 'Add one drift check to your model risk framework',
    riskLevel: 'Low',
    timeSaved: 'Closes the gap before the audit finds it',
    owner: 'Model risk + analytics',
    explanation:
      "Pick the AI tool with the highest decision weight. Add one quantitative drift check on a monthly cadence — output distribution, error rate, or a holdout sample. Document the threshold that triggers a deeper review. The point is to leave annual review behind for one tool, not all of them at once.",
    whyRightNow: [
      'Directly addresses your gap in Continuous Validation',
      'Establishes the cadence that later validation work will inherit',
      "Closes a gap your examiner is going to surface eventually",
    ],
    inPractice:
      'One tool. One drift metric. One monthly review. One named threshold. A note in the model inventory that this tool is on the continuous cadence; the others are still on annual until brought across.',
    worksBestFor: [
      'Credit decision support models',
      'Fraud-screening tools',
      'Pricing or risk-tier assistants',
    ],
  },
  'vendor-risk': {
    title: 'Add an AI-specific overlay to your TPRM questionnaire',
    riskLevel: 'Low',
    timeSaved: 'Pre-answers the examiner question on third-party AI risk',
    owner: 'Vendor management + compliance',
    explanation:
      "Take your standard TPRM questionnaire. Add a one-page AI overlay: model behavior, explainability, drift monitoring, integration risk, notification requirements for material model changes. Apply it to every AI vendor going forward, and retroactively to the top three already in production.",
    whyRightNow: [
      'Directly addresses your gap in Vendor Risk',
      'Becomes the standard every later AI vendor passes through',
      'Closes a documented audit risk',
    ],
    inPractice:
      'One page added to the TPRM packet. Three retroactive applications to existing vendors this quarter. Standard for every new vendor going forward.',
    worksBestFor: [
      'AI feature additions to existing platforms',
      'New AI vendor selection',
      'Model-update notification requirements',
    ],
  },
};

// ---------------------------------------------------------------------------
// STARTER PROMPTS — per v3 dimension. One per dimension; chosen by weakest.
// ---------------------------------------------------------------------------

export interface StarterPrompt {
  readonly label: string;
  readonly prompt: string;
}

export const STARTER_PROMPTS: Record<Dimension, StarterPrompt> = {
  'strategic-value': {
    label: 'Candidate workflow brief starter',
    prompt: `I am scoping a workflow inside my community bank or credit union as an AI candidate. The workflow is [DESCRIBE WORKFLOW IN PLAIN LANGUAGE].

Help me draft a one-page brief covering:
- The workflow today, in three to five bullets
- The friction points an AI tool could meaningfully reduce
- The shape of the AI assistance (summarization, drafting, classification, comparison)
- The named owner and review step
- A measurable 90-day outcome

Tone should be specific, conservative, and free of vendor jargon. Audience: an executive committee that has not yet committed budget.`,
  },
  'infrastructure-readiness': {
    label: 'Core systems integration map starter',
    prompt: `I am inventorying the integration readiness of my institution's systems for upcoming AI workflows.

Help me draft a one-page map covering:
- Each core or operational system in scope
- The integration type (open API, vendor marketplace only, closed)
- The last custom integration completed and roughly how long it took
- Known blockers or dependencies on the core provider
- A "ready / partial / blocked" rating per system

Format as a single table I can take to IT and the AI lead.`,
  },
  'data-quality': {
    label: 'Verified data view starter',
    prompt: `I am scoping a verified, AI-ready data view for one domain at my institution. The domain is [MEMBER 360 / LOAN PORTFOLIO / OPERATIONAL].

Help me draft:
- The source systems that feed this view
- The deduplication and reconciliation rules
- The refresh cadence
- The named owner
- The data-quality review notes to attach

Keep it practical for a community-bank-sized data team. No big-data tooling assumed.`,
  },
  'security-approved-tools': {
    label: 'Approved AI tool list starter',
    prompt: `I am publishing my institution's first one-page approved AI tool list.

For each tool, capture:
- Tool name and vendor
- The data class allowed in it (public / internal / restricted)
- The named owner (who approves new use cases)
- The review cadence
- The process for requesting an addition

Format as a one-page document I can publish alongside our acceptable use policy. Tone is matter-of-fact, not promotional.`,
  },
  'runtime-safeguards': {
    label: 'Input/output checklist starter',
    prompt: `I am creating a runtime safeguards checklist for one AI-assisted workflow. The workflow is [DESCRIBE WORKFLOW].

Draft a six-line checklist:
- Three "before prompting" checks (what data is going in, is any of it restricted, do I have the right approved tool)
- Three "before using output" checks (does this need a reviewer, is this customer-facing, has the output been sampled for accuracy)

Keep it short enough to live on the side of a screen. Tone is operational, not theoretical.`,
  },
  'regulatory-compliance': {
    label: 'AI use-case regulatory map starter',
    prompt: `I am mapping one AI-assisted process at my institution to the regulations that apply to it. The process is [DESCRIBE THE PROCESS].

Draft a one-page map covering:
- The process today, in three to five bullets
- The regulations that apply (ECOA / Reg B, SR 11-7, AIEOG Lexicon, others)
- The disclosures required (adverse-action reasons, model documentation, etc.)
- The review step and named reviewer
- The retention rule for any AI-generated artifact

Tone is practical, examiner-aware, and free of consultancy jargon.`,
  },
  'fair-lending-testing': {
    label: 'Disparate-impact pass starter',
    prompt: `I am running a disparate-impact analysis on one AI-assisted process at my institution. The process is [DESCRIBE].

Help me draft:
- The data slice I need (decisions, applicant attributes, protected-class indicators where available)
- The metrics to compute (approval rate gap, score distribution comparison, outcome variance)
- The non-AI baseline to compare against
- The reporting forum and cadence
- The escalation path if a metric crosses an internal threshold

Output should be a one-page plan I can take to compliance and analytics.`,
  },
  'human-in-the-loop': {
    label: 'Oversight matrix starter',
    prompt: `I am writing my institution's first AI oversight matrix.

For each AI use case in production, capture:
- The use case (one line)
- The oversight level (automated / sampled / mandatory approval)
- The named reviewer
- The review cadence
- Where the log lives

Format as a single one-page table. Tone is operational. Audience: compliance, audit, examiners.`,
  },
  'talent-culture': {
    label: 'Role redefinition starter',
    prompt: `I am redefining one role at my institution around AI oversight. The current role is [TITLE].

Help me draft:
- A revised one-paragraph role description
- Three performance objectives tied to AI workflows or oversight outcomes
- The 90-day onboarding plan for someone stepping into the role
- The reporting line and the manager review cadence

Tone is straightforward and grounded in community-bank operations. No tech-industry job-description language.`,
  },
  'data-safety-reflexes': {
    label: 'Data classification training starter',
    prompt: `I am running a 30-minute training on data safety for AI use with one team.

Help me draft:
- A one-paragraph framing for staff who have never thought about this
- The three categories (Green / Yellow / Red) with one-line definitions
- Five worked examples using clearly synthetic (not real) data, showing the classification call
- Two short check-for-understanding questions
- The two-week reinforcement plan the manager runs after the session

Audience: front-line community-bank or credit-union staff. Tone is practical, not technical.`,
  },
  'continuous-validation': {
    label: 'Drift check starter',
    prompt: `I am adding a continuous drift check to one AI tool in our model inventory. The tool is [DESCRIBE TOOL AND DECISION WEIGHT].

Help me draft:
- The drift metric (output distribution, error rate, or holdout-sample performance)
- The cadence (monthly is the default)
- The threshold that triggers a deeper review
- The named reviewer
- Where the result is logged and to whom it reports

Output should be a one-page addition to the model risk file for this tool.`,
  },
  'vendor-risk': {
    label: 'AI vendor TPRM overlay starter',
    prompt: `I am adding an AI-specific overlay to my institution's standard TPRM questionnaire.

Draft a one-page overlay covering:
- Model behavior and known limitations
- Explainability (can principal-reason disclosures be produced)
- Drift monitoring (vendor practices and notifications)
- Integration risk (where the model touches our systems and our data)
- Notification requirements for material model or behavior changes

Tone is examiner-grade. Audience: vendor management plus compliance.`,
  },
};

// ---------------------------------------------------------------------------
// SEVEN-DAY ACTIVATION PLAN — generic, applies to all tiers.
// ---------------------------------------------------------------------------

export const SEVEN_DAY_PLAN: ReadonlyArray<{ readonly day: number; readonly action: string }> = [
  { day: 1, action: 'Choose one internal workflow to test (start with your recommended use case).' },
  { day: 2, action: 'Run the workflow manually using AI.' },
  { day: 3, action: 'Review the output for clarity, accuracy, and tone.' },
  { day: 4, action: 'Refine your prompt and test again.' },
  { day: 5, action: 'Measure time saved versus your current process.' },
  { day: 6, action: 'Share results with one colleague or manager.' },
  { day: 7, action: 'Decide whether to expand or formalize the workflow.' },
];

// ---------------------------------------------------------------------------
// FINANCIAL IMPLICATIONS — tier-keyed exec-translation.
// ---------------------------------------------------------------------------

export interface FinancialImplications {
  readonly operational: string;
  readonly risk: string;
  readonly cost: string;
}

export const FINANCIAL_IMPLICATIONS: Record<Tier['id'], FinancialImplications> = {
  'starting-point': {
    operational:
      "Time is being saved on individual desks but it never rolls up to a number you can show the board. Without sanctioned workflows, the program cannot be staffed or budgeted with confidence.",
    risk:
      "Staff are using AI tools without policy or audit trail. Under SR 11-7 and the AIEOG Lexicon, examiners will ask what tools you approve, for what data, with what review — and that question cannot yet be answered on paper.",
    cost:
      "Every workflow improvement still needs a vendor or consultant. Spend repeats instead of compounding into capability your team owns.",
  },
  'early-stage': {
    operational:
      "Wins are real but uneven. The gap between your top-performing team and everyone else widens with each month that the strong patterns are not written down.",
    risk:
      "Audit trails vary by team. An examiner walking the floor would get four different answers about what tools are in use and who approved them.",
    cost:
      "Vendors are doing the work your team could be doing. Each engagement leaves no durable capability behind.",
  },
  'building-momentum': {
    operational:
      "Several teams are producing measurable savings — but the measurement itself is uneven. Without documented outcomes, leadership cannot tell which workflows are actually moving the efficiency ratio.",
    risk:
      "Governance exists in pockets. Examiner-grade documentation needs to be standardized across teams before staff turnover or a single incident creates exposure.",
    cost:
      "The program survives on two or three motivated sponsors. Without measured ROI, budget conversations stall and what should compound stays linear.",
  },
  'ready-to-scale': {
    operational:
      "AI is producing repeatable efficiency gains across departments. The risk now is not adoption — it's replication speed. Institutions that codify their program extend the advantage; those that don't lose ground when staff turn over.",
    risk:
      "Governance is mature enough that incident risk is acceptable. The remaining risk is complacency — programs that stop investing in the next wave fall behind faster than they realize.",
    cost:
      "Vendor dependence is down and capability is compounding. The next investment is not in tools — it's in the practice cadence that gets every new hire to baseline.",
  },
};

// ---------------------------------------------------------------------------
// CLOSING CTA — tier-keyed.
// ---------------------------------------------------------------------------

export interface CtaOffer {
  readonly label: string;
  readonly href: string;
  readonly source: 'free-results-primary' | 'free-results-secondary' | 'free-results-tertiary';
}

export interface TierClosingCta {
  readonly eyebrow: string;
  readonly headline: string;
  readonly body: string;
  readonly primary: CtaOffer;
  readonly secondary: CtaOffer;
  readonly tertiary: CtaOffer;
}

export const TIER_CLOSING_CTA: Record<Tier['id'], TierClosingCta> = {
  'starting-point': {
    eyebrow: 'Your next move',
    headline: 'Start with AiBI-Foundation.',
    body:
      "Your score says AI is already being used inside your organization without consistent training or guardrails. The fastest way to fix that is to build internal capability — one workflow owner, one safe-use habit, one repeatable workflow at a time. AiBI-Foundation is twelve self-paced modules built for banking professionals.",
    primary: {
      label: 'Enroll in AiBI-Foundation · $295',
      href: '/courses/foundation/program',
      source: 'free-results-primary',
    },
    secondary: {
      label: 'Or take the In-Depth Assessment · $99',
      href: '/assessment/in-depth',
      source: 'free-results-secondary',
    },
    tertiary: {
      label: 'Request an Executive Briefing',
      href: '/for-institutions/advisory',
      source: 'free-results-tertiary',
    },
  },
  'early-stage': {
    eyebrow: 'Your next move',
    headline: 'Turn experimentation into capability.',
    body:
      "You have curiosity and a few early wins. The next constraint is not another tool — it is structured AI capability your team can replicate. AiBI-Foundation gives each staff member a safe-use checklist, a prompt builder, and reusable banking workflows. Take it as a team and codify what's already working.",
    primary: {
      label: 'Enroll in AiBI-Foundation · $295',
      href: '/courses/foundation/program',
      source: 'free-results-primary',
    },
    secondary: {
      label: 'Or take the In-Depth Assessment · $99',
      href: '/assessment/in-depth',
      source: 'free-results-secondary',
    },
    tertiary: {
      label: 'Request an Executive Briefing',
      href: '/for-institutions/advisory',
      source: 'free-results-tertiary',
    },
  },
  'building-momentum': {
    eyebrow: 'Your next move',
    headline: 'Standardize what is already working.',
    body:
      "Your teams are producing real value with AI. The risk now is that progress depends on a few motivated individuals. AiBI-Foundation turns those individual wins into a shared baseline — every staff member with the same safe-use habits, the same prompt patterns, the same reusable workflows. It is the cheapest path from fragile momentum to repeatable program.",
    primary: {
      label: 'Enroll in AiBI-Foundation · $295',
      href: '/courses/foundation/program',
      source: 'free-results-primary',
    },
    secondary: {
      label: 'Or take the In-Depth Assessment · $99',
      href: '/assessment/in-depth',
      source: 'free-results-secondary',
    },
    tertiary: {
      label: 'Request an Executive Briefing',
      href: '/for-institutions/advisory',
      source: 'free-results-tertiary',
    },
  },
  'ready-to-scale': {
    eyebrow: 'Your next move',
    headline: 'Talk to us about Leadership Advisory.',
    body:
      "Your institution has built real AI capability. The opportunity now is leadership judgment — what to prioritize next, how to measure outcomes, how to defend the program at the board level. Leadership Advisory is fractional Chief AI Officer work for institutions with internal momentum. AiBI-Foundation stays available as the onboarding path for every new hire.",
    primary: {
      label: 'Request a conversation',
      href: '/for-institutions/advisory',
      source: 'free-results-primary',
    },
    secondary: {
      label: 'Onboard new hires with AiBI-Foundation · $295',
      href: '/courses/foundation/program',
      source: 'free-results-secondary',
    },
    tertiary: {
      label: 'Take the In-Depth Assessment · $99',
      href: '/assessment/in-depth',
      source: 'free-results-tertiary',
    },
  },
};
