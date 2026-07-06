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

// Shared with v2 — single source in content/assessments/shared/free-readiness.
export { SIGNATURE_INSIGHT } from '@content/assessments/shared/free-readiness';

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
  /** One concrete next-step direction shown alongside the oneLine in
      preview surfaces (the EmailGate top-gap card). Distinct from
      RECOMMENDATIONS[id].title (the full first-move recommendation) so
      preview can give substance without exposing the full first move. */
  readonly nextStep: string;
  readonly explanation: string;
  readonly impacts: readonly [string, string];
  readonly whatGoodLooksLike: readonly [string, string];
}

export const GAP_CONTENT: Record<Dimension, GapContent> = {
  'strategic-value': {
    oneLine: 'You use AI in general, not on specific work that matters to you.',
    nextStep: 'Start by listing three tasks in your week where AI could save real time — be specific enough that you could try one tomorrow.',
    explanation:
      "AI is on your radar but not tied to a problem you actually own. Until you can name two or three of your own tasks where AI would save time or improve quality, AI stays a curiosity instead of a tool. The shift is from \"I should try AI\" to \"I use AI on these things.\"",
    impacts: [
      'Your time gets spent exploring AI generally instead of getting wins on specific work',
      'You cannot tell anyone — yourself or your manager — what AI is actually doing for your job',
    ],
    whatGoodLooksLike: [
      'You can name two or three of your own recurring tasks where AI consistently helps',
      'You can measure the difference — time saved, fewer revisions, faster turnaround',
    ],
  },
  'approved-tool-path': {
    oneLine: 'You are not sure which AI tools you are allowed to use at work.',
    nextStep: 'Start by emailing IT or compliance one sentence: "Which AI tools are approved for staff use, and for what data?"',
    explanation:
      "Most bankers default to whatever AI tool they found first. If you cannot point to an approved list — or worse, no approved list exists yet — you are guessing what is safe. The fastest fix is to ask the question once and use only the green-list tools after that.",
    impacts: [
      'You may be using tools your institution would not approve if asked',
      'The moment compliance or IT asks "what did you use?" you have to reconstruct it from memory',
    ],
    whatGoodLooksLike: [
      'You can name the approved AI tools at your institution and which data you can use in each',
      'When something new comes up, you know who to ask before trying it',
    ],
  },
  'data-safety-reflexes': {
    oneLine: 'You do not have a consistent rule for what never goes into AI.',
    nextStep: 'Start by writing down the categories of information you handle that should never go into a public AI tool.',
    explanation:
      "Pasting customer data, account numbers, or sensitive internal details into a public AI tool is the single most common AI mistake at a community bank. The fix is a reflex — strip identifiers first, paste second — built through practice, not a memo. Until that reflex is in place, every prompt is a risk.",
    impacts: [
      'A single careless paste can become a reportable incident',
      'You slow down on every prompt because you are not sure what is safe',
    ],
    whatGoodLooksLike: [
      'You strip identifiers, balances, and customer details before pasting — automatically',
      'You know when to switch to an approved internal tool because the work needs the real data',
    ],
  },
  'prompting-skill': {
    oneLine: 'You ask AI vague questions and get vague answers.',
    nextStep: 'Start by adding role, format, source, and a self-check instruction to your next prompt — and save it if it works.',
    explanation:
      "The difference between a useless AI answer and a useful one is usually the prompt. Most \"AI is overrated\" experiences are one prompt rewrite away from working. The fix is a small kit of patterns — role, format, source, check, edit — that you reuse until they're reflex.",
    impacts: [
      'You give up on tasks that AI could actually help with',
      'Each prompt feels like starting from scratch instead of building on what worked last time',
    ],
    whatGoodLooksLike: [
      'You reliably get structured, useful answers because your prompts include role, format, source, and a self-check',
      'You save the prompts that work and reuse them as your personal template library',
    ],
  },
  'role-fit': {
    oneLine: 'Your AI use is general experimentation, not tied to your actual job.',
    nextStep: 'Start by writing the five tasks that take the most time in your typical week — the ones AI could plausibly help on.',
    explanation:
      "General AI experiments do not stick. AI tied to three named tasks you already do every week becomes part of how you work. Until AI is mapped to specific things in your role — not \"productivity\" or \"writing\" but actual deliverables you own — it stays optional.",
    impacts: [
      'Your AI skills do not compound because you are not practicing on the same tasks repeatedly',
      'When asked "how does AI help you?", the answer stays vague',
    ],
    whatGoodLooksLike: [
      'You can describe three role-specific tasks where AI is part of how you do the work',
      'You can show before/after on at least one — the time saved, the quality difference, the artifact produced',
    ],
  },
  'human-review': {
    oneLine: 'You use AI output without a deliberate review step.',
    nextStep: 'Start by sorting your AI work into Low / Medium / High stakes — and write down who reviews the High items.',
    explanation:
      "AI writes confidently even when it is wrong. The fix is not a better AI — it is a review step you actually run. Low-stakes drafts can be self-reviewed; medium-stakes work goes to a colleague; high-stakes work (customer-facing, regulated decisions) goes to a named second reviewer.",
    impacts: [
      'Errors reach customers or decision processes because they read fine on the page',
      'When something goes wrong, you cannot point to a review step that should have caught it',
    ],
    whatGoodLooksLike: [
      'You can describe your review process for low/medium/high-stakes AI work — and who reviews each',
      'High-stakes AI work has a named second reviewer, not just your own re-read',
    ],
  },
  'documentation': {
    oneLine: 'You cannot show someone exactly what AI did or what you changed.',
    nextStep: 'Start by picking one place to save AI work — folder, OneNote section, shared drive — and use it today.',
    explanation:
      "AI work that you cannot reconstruct is AI work that will be questioned — by a colleague, a reviewer, or an examiner. The fix is a three-minute habit: capture the prompt, the unedited output, and the edits you made before using it. The evidence trail matters more than the tool.",
    impacts: [
      'You cannot defend AI-assisted work in a review or audit',
      'You repeat the same prompts because you did not save the ones that worked',
    ],
    whatGoodLooksLike: [
      'You save the prompt, the unedited output, and your edits for any AI-assisted work that leaves your desk',
      'A reviewer or examiner could reconstruct what AI did and what you decided',
    ],
  },
  'vendor-awareness': {
    oneLine: 'You do not know which of the tools you already use have AI inside them.',
    nextStep: 'Start by writing down every vendor tool you use in a week and marking yes / no / unknown for AI features.',
    explanation:
      "Most banking software has quietly added AI features in the last eighteen months — summarization, drafting, classification, \"smart\" assistants. Often turned on by default. If you do not know which of your tools have AI inside, you cannot manage what data those tools see or what the vendor does with it.",
    impacts: [
      'AI features may be processing customer or internal data without your knowledge',
      'You miss easy AI wins because you do not realize a tool already has the feature',
    ],
    whatGoodLooksLike: [
      'You can name the AI features in each vendor tool you use and what data each feature sees',
      'You know which vendors use your data for training and which do not',
    ],
  },
  'customer-impact-awareness': {
    oneLine: 'You are not always sure when AI touches a customer or a regulated decision.',
    nextStep: 'Start by listing every AI use in your work that ends up in front of a customer or feeds a decision.',
    explanation:
      "When AI helps draft a customer email, prepare a loan summary, generate adverse-action language, or sort complaints, it has crossed into regulated territory. ECOA/Reg B, UDAAP, BSA, and fair lending obligations apply whether or not you used AI. Knowing where the line is matters more than avoiding the work.",
    impacts: [
      'Customer-facing or regulated AI use happens without the review it actually requires',
      'When asked which compliance rules apply to your AI use, the answer is approximate',
    ],
    whatGoodLooksLike: [
      'You can list which of your AI uses touch a customer or a regulated decision — and treat those differently',
      'For each, you can name which compliance rule applies (ECOA, UDAAP, BSA, fair lending)',
    ],
  },
  'workflow-readiness': {
    oneLine: 'Your AI use is ad hoc — every time is the first time.',
    nextStep: 'Start by writing four steps for one recurring task: input, AI draft, review, final output. A colleague should be able to follow it.',
    explanation:
      "The difference between an AI chat and an AI workflow is whether anyone else could reproduce it. The format is always the same: input, AI draft, your review, final output. If you can write it down, a colleague can do it. If a colleague can do it, it becomes durable work — not just yours.",
    impacts: [
      'You re-invent the same prompt for the same task every time',
      'If you stepped away, no one else could continue the work',
    ],
    whatGoodLooksLike: [
      'For two or three recurring tasks, you have a written four-step flow: input → AI draft → review → final output',
      'A colleague could pick up your workflow and run it without asking you questions',
    ],
  },
  'training-culture': {
    oneLine: 'You are figuring AI out alone, without role-specific guidance.',
    nextStep: 'Start by picking three AI skills to build in the next six weeks — and one source for each.',
    explanation:
      "The bankers who go furthest with AI are not the ones with the best employer training — they are the ones who own their learning, pick specific skills to build, and name specific sources to learn from. \"I will figure it out\" is the strategy that does not work.",
    impacts: [
      'Your AI growth plateaus because you are repeating what you already know',
      'You cannot quickly answer "what should I learn next?" because no plan exists',
    ],
    whatGoodLooksLike: [
      'You get role-specific guidance — from training, examples, or coaching — that you can apply directly',
      'You know who to ask when you are stuck and where to go to level up',
    ],
  },
  'leadership-visibility': {
    oneLine: 'You do not know what your leadership tracks about AI or how your work fits.',
    nextStep: 'Start by scheduling fifteen minutes with your manager — ask what they actually measure about AI use.',
    explanation:
      "You cannot align with what you cannot see. If you do not know what good looks like to leadership — what is measured, what concerns them, what they want more of — your AI work is guesswork. The fix is one fifteen-minute conversation that turns abstract pressure into concrete direction.",
    impacts: [
      'Your AI work may be solving for the wrong outcome',
      "When recognition arrives, it goes to people whose work was visible — not necessarily better",
    ],
    whatGoodLooksLike: [
      'You know what leadership measures about AI use and how your work contributes',
      'You can name three things you would do differently this month based on that visibility',
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
    title: 'Pick two of your own recurring tasks to use AI on this month',
    riskLevel: 'Low',
    timeSaved: 'The shift from general AI experimentation to specific wins you can name',
    owner: 'You',
    explanation:
      "Stop using AI in general. Pick two recurring tasks you already do — narratives, summaries, drafts, replies — and commit to using AI on them this month. Track what worked, what you rewrote, and how much time it saved. Two specific wins beat ten general experiments.",
    whyRightNow: [
      'Directly addresses your gap in Strategic Value',
      'Builds a concrete answer to "how is AI helping you?"',
      'Creates the muscle memory that AI skill compounds on',
    ],
    inPractice:
      'A half-page brief per task: what you do today, the friction, the AI shape, what you still review, the win you will measure (time, quality, turnaround). Run one cycle per task this week.',
    worksBestFor: [
      'BSA / AML narrative drafting',
      'Loan-file summaries',
      'Member-message drafting (with review)',
    ],
  },
  'approved-tool-path': {
    title: 'Build a personal approved-tools reference card this week',
    riskLevel: 'Low',
    timeSaved: 'Stops the daily guessing about what is safe to use',
    owner: 'You (with one email to IT / Compliance)',
    explanation:
      "Send one email to your IT or compliance lead: \"Which AI tools are approved for staff use?\" Use the answer to build a one-page personal reference — Approved (green), Limited use (yellow), Off-limits (red). Then use only the green list for thirty days.",
    whyRightNow: [
      'Directly addresses your gap in Approved Tool Path',
      'Removes the unspoken risk of using an unsanctioned tool',
      'Gives you a credible answer if anyone asks "what did you use?"',
    ],
    inPractice:
      'One page. Three sections: Approved (with allowed data classes), Limited, Off-limits. Live with it for thirty days; note where it gets in your way so you can advocate for additions.',
    worksBestFor: [
      'Daily AI drafting work',
      'Cross-team collaboration on AI tools',
      'Onboarding into new departments',
    ],
  },
  'data-safety-reflexes': {
    title: 'Build a personal "what never goes in" reference card',
    riskLevel: 'Low',
    timeSaved: 'Removes the daily second-guessing about what is safe to paste',
    owner: 'You',
    explanation:
      "Make the rule explicit. Write down the categories of information you handle that should never go into a public AI tool. Practice stripping identifiers from three recent emails. Identify the approved internal tool you would switch to when the work needs the real data.",
    whyRightNow: [
      'Directly addresses your gap in Data Safety Reflexes',
      'Closes the single most common AI-driven incident at a community bank',
      'Builds the muscle memory every other AI signal depends on',
    ],
    inPractice:
      'A one-page card. Eight to ten categories. Three or four habits. Tape it to your monitor for a month and the reflex is permanent.',
    worksBestFor: [
      'Customer-facing message drafting',
      'BSA and complaint narratives',
      'Any AI use that touches real customer data',
    ],
  },
  'prompting-skill': {
    title: 'Adopt the five-part prompt frame for one week',
    riskLevel: 'Low',
    timeSaved: 'Turns generic AI answers into useful ones the first time',
    owner: 'You',
    explanation:
      "Every prompt for real work should include five things: the role AI is playing, the format you want back, the source material, an explicit \"check your work\" instruction, and what you will edit. Apply it to one task at a time. After a week you will have five prompts that work.",
    whyRightNow: [
      'Directly addresses your gap in Prompting Skill',
      'Saves the time currently spent rewriting bad answers',
      'Compounds — each pattern you learn applies to the next task',
    ],
    inPractice:
      'A five-line template. Fill in role, format, source, self-check, edit. Reuse for every prompt. Save the ones that work to a personal prompt library.',
    worksBestFor: [
      'Compliance review summaries',
      'Loan-narrative drafting',
      'Member-message drafts (with review)',
    ],
  },
  'role-fit': {
    title: 'Map AI to three specific tasks in your role',
    riskLevel: 'Low',
    timeSaved: 'Stops general experimentation; starts compounding skill on the same work',
    owner: 'You',
    explanation:
      "List the five tasks that take the most time in your typical week. Pick the three where AI could plausibly draft, summarize, classify, or compare. Run one real-work cycle this week on each. The point is to make AI part of how you actually do your job, not a side experiment.",
    whyRightNow: [
      'Directly addresses your gap in Role Fit',
      'Turns scattered AI use into compounding role-specific skill',
      'Builds the concrete answer to "how does AI help you?"',
    ],
    inPractice:
      'A short list of three named tasks. One AI-assisted cycle per task this week. Notes on what worked, what you rewrote, what you would do differently.',
    worksBestFor: [
      'Operations roles with recurring write-ups',
      'Compliance review',
      'Member-service draft generation',
    ],
  },
  'human-review': {
    title: 'Write your personal "review before send" checklist',
    riskLevel: 'Low',
    timeSaved: 'Catches the errors that read fine on the page',
    owner: 'You',
    explanation:
      "Sort your AI-assisted work into Low (drafts, internal), Medium (goes to a colleague), and High (touches a customer or a regulated decision). Define the review step for each. Write down who the named second reviewer is for High-tier work. Treat close calls as High.",
    whyRightNow: [
      'Directly addresses your gap in Human Review',
      'Catches the AI errors that look right but are not',
      'Pre-answers the audit question about your review process',
    ],
    inPractice:
      'A one-page checklist. Three tiers, criteria for each, the review step required, and named reviewers for High-tier work. Live with it for a month and refine.',
    worksBestFor: [
      'Customer-facing AI drafts',
      'Lending narrative review',
      'Compliance and complaint responses',
    ],
  },
  'documentation': {
    title: 'Start a three-minute "save the prompt" habit this week',
    riskLevel: 'Low',
    timeSaved: 'Three minutes per item now saves an hour of reconstruction later',
    owner: 'You',
    explanation:
      "Pick a location — a folder, a OneNote section, a shared drive. For each AI-assisted item, save: the date, the task, the prompt, the unedited output, the edits you made, the final version. A reviewer or examiner could reconstruct what AI did and what you decided.",
    whyRightNow: [
      'Directly addresses your gap in Documentation',
      'Creates the evidence trail your work needs if questioned',
      'Builds the library of prompts that worked',
    ],
    inPractice:
      'A simple template with six fields. Filled in as you go, not retroactively. Backfill one week of recent work to seed the library.',
    worksBestFor: [
      'AI work that touches a customer or a regulator',
      'Recurring tasks where prompts get reused',
      'Audit and exam preparation',
    ],
  },
  'vendor-awareness': {
    title: 'Inventory the AI hiding inside your vendor tools',
    riskLevel: 'Low',
    timeSaved: 'Surfaces AI features that may already be processing your data',
    owner: 'You (with light vendor research)',
    explanation:
      "Write down every vendor tool you use in a typical week. For each, mark Yes / No / Unknown for \"has AI features.\" For Unknown, spend two minutes on the vendor's release notes. Note what data each AI feature has access to.",
    whyRightNow: [
      'Directly addresses your gap in Vendor Awareness',
      'Surfaces AI you did not know was processing your data',
      'Lets you make informed choices about which AI features to use',
    ],
    inPractice:
      'A one-page inventory: vendor, primary use, AI features (yes/no/unknown), what data the AI sees, notes. Done once, updated quarterly.',
    worksBestFor: [
      'Core banking and loan-origination platforms',
      'Document management and ticketing tools',
      'BSA / AML software stacks',
    ],
  },
  'customer-impact-awareness': {
    title: 'Map your AI uses to the regulated decisions they touch',
    riskLevel: 'Low',
    timeSaved: 'Pre-answers the examiner question about AI in regulated work',
    owner: 'You',
    explanation:
      "List every place AI assists your work that ends up in front of a customer or feeds a decision. For each, note which rule applies — ECOA/Reg B, UDAAP, BSA, fair lending — or mark \"internal only.\" Tighten the review step for each rule-touching item.",
    whyRightNow: [
      'Directly addresses your gap in Customer Impact Awareness',
      "Reframes AI use from \"experimentation\" to \"work I can defend\"",
      'Creates the answer your compliance partner will eventually ask for',
    ],
    inPractice:
      'A short map: AI use case, who sees the output, which rule applies, the review step. Living document; updated as your AI use changes.',
    worksBestFor: [
      'Adverse-action language drafting',
      'Marketing copy and complaint responses',
      'BSA narrative review',
    ],
  },
  'workflow-readiness': {
    title: 'Document one recurring AI workflow end-to-end this month',
    riskLevel: 'Low',
    timeSaved: 'Stops re-inventing the same prompt every time',
    owner: 'You',
    explanation:
      "Pick one recurring task where AI already helps. Write the four steps: input (raw material), AI draft (prompt + tool + output shape), review (who checks what), final output (where it goes, what is saved). Hand it to a colleague. If they can run it without asking, you have a workflow.",
    whyRightNow: [
      'Directly addresses your gap in Workflow Readiness',
      'Turns ad-hoc AI use into durable, transferable work',
      'Creates the template every other workflow will follow',
    ],
    inPractice:
      'A one-page workflow doc. Four steps. Clear enough that a colleague can run it cold. Updated as the workflow matures.',
    worksBestFor: [
      'BSA narrative drafting',
      'Loan-file summary generation',
      'Recurring member-message templates',
    ],
  },
  'training-culture': {
    title: 'Build a six-week personal AI learning plan',
    riskLevel: 'Low',
    timeSaved: 'Replaces "I will figure it out" with measurable skill growth',
    owner: 'You',
    explanation:
      "Pick three concrete AI skills relevant to your role. Name one source for each — a course, a written guide, a colleague who already does it well. Block thirty minutes a week per skill on your calendar. Six weeks × three skills × thirty minutes = nine hours of real practice.",
    whyRightNow: [
      'Directly addresses your gap in Training Culture',
      'Owns your AI growth instead of waiting for institutional training',
      'Builds the answer to "what did you learn this quarter?"',
    ],
    inPractice:
      'A personal six-week plan. Three skills. Three sources. Week-by-week practice schedule. Specific "done" criteria for each skill at week six.',
    worksBestFor: [
      'Self-directed professional development',
      'Manager / employee growth conversations',
      'Preparing for the next role',
    ],
  },
  'leadership-visibility': {
    title: 'Have a fifteen-minute "what does AI good look like?" conversation',
    riskLevel: 'Low',
    timeSaved: 'Replaces guesswork with direction',
    owner: 'You (plus your manager)',
    explanation:
      "Schedule fifteen minutes with your manager. Ask five questions: What does leadership want from AI use this year? What worries leadership about AI? How is AI use measured? What would \"exceeding expectations\" look like? Where can I see this measured? Translate the answers into three things you will do differently this month.",
    whyRightNow: [
      'Directly addresses your gap in Leadership Visibility',
      'Aligns your AI work to what your institution actually values',
      'Creates the recognition path that makes AI work visible',
    ],
    inPractice:
      'One fifteen-minute conversation. Notes you can act on. Three changes to your work this month. One follow-up with a colleague to share what you learned.',
    worksBestFor: [
      'Performance review preparation',
      'Department or team alignment',
      'Pursuing leadership-track opportunities',
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
    label: 'Candidate-task brief starter',
    prompt: `I work at a community bank and I want to use AI on a specific recurring task instead of experimenting in general. The task is [DESCRIBE THE TASK].

Help me draft a half-page brief covering:
- What I do today, in three to five bullets
- The friction points AI could meaningfully reduce
- The shape of the AI assistance (drafting, summarizing, classifying, comparing)
- What I would still review myself
- The measurable 30-day outcome (time saved, fewer revisions, faster turnaround)

Tone: specific, conservative, no vendor jargon. Length: half a page maximum.`,
  },

  'approved-tool-path': {
    label: 'Approved-tools reference-card builder',
    prompt: `Help me draft a one-page personal "approved AI tools" reference card for my own use at a community bank.

Format three sections:
- Approved (green): tools I can use, including what data classes are allowed
- Limited use (yellow): tools I can use only for certain data
- Off-limits (red): tools I should not use, including why

I will fill in the tool names. Keep the language plain enough that a colleague could read it in under two minutes. Include a one-line footer on what to do if I want to add a new tool.`,
  },

  'data-safety-reflexes': {
    label: 'Personal "what never goes in" card',
    prompt: `Help me draft a one-page personal "safe AI use" reference card for a community bank employee.

Include:
- Eight to ten categories of information that should never go into a public AI tool, with one-sentence reasons each
- Four habits to build: strip identifiers first, use approved tools for sensitive work, check outputs before sending, know who to ask
- One short paragraph on how to think about close calls

Tone: matter-of-fact, no scare quotes. Length: fits on a single printed page.`,
  },

  'prompting-skill': {
    label: 'Five-pattern prompting starter kit',
    prompt: `Help me draft five reusable prompt templates for my work at a community bank as a [YOUR ROLE].

Each template should follow this five-part shape:
- Role (what role AI is playing — analyst, drafter, reviewer, summarizer)
- Format (what shape I want the answer in)
- Source material (what I will paste in)
- Self-check instruction (what AI should verify in its own answer)
- What I will edit (where my judgment overrides AI)

Pick five high-leverage patterns for a community bank role. Keep each template tight enough to paste and fill in.`,
  },

  'role-fit': {
    label: 'Three role-specific AI use cases',
    prompt: `Help me identify three tasks in the role of [YOUR ROLE] at a community bank where AI would plausibly save time or improve quality.

For each task, describe:
- What I do today (one short paragraph)
- The shape of the AI assistance (drafting, summarizing, classifying, comparing)
- The prompt frame I would use
- What I would still review myself before the output is used
- The measurable difference I should expect to see in a week

Avoid generic productivity examples. Be specific to this role.`,
  },

  'human-review': {
    label: 'Personal review-before-send checklist',
    prompt: `Help me draft a personal "AI work review" checklist for my role at a community bank.

The checklist should have three tiers:
- Low (drafts, internal notes — self-review only)
- Medium (work that goes to a colleague — colleague reviews)
- High (work that touches a customer or a regulated decision — named second reviewer)

For each tier, specify: the criteria that put work in this tier, the review step required, who reviews. For the High tier, list three to five specific things the reviewer should check (accuracy of figures, sources for claims, customer-facing language, compliance fit, retention).`,
  },

  'documentation': {
    label: 'AI recordkeeping template',
    prompt: `Help me design a lightweight recordkeeping template for AI-assisted work at a community bank.

The template should capture:
- Date and task name
- The prompt I used (verbatim)
- The unedited AI output
- The edits I made before use
- The final version that was used

Keep it tight enough that filling it in takes under three minutes per item. Include a one-line note on retention practice — how long to keep these records and where they should live.`,
  },

  'vendor-awareness': {
    label: 'Personal vendor-AI inventory worksheet',
    prompt: `Help me design a one-page vendor-AI inventory worksheet for an individual community bank employee.

Columns should include:
- Vendor name
- Primary use (what I use the tool for)
- Has AI features (yes / no / unknown)
- AI features in use
- Data the AI sees
- Notes

Include a brief instruction on how to check release notes when the answer is "unknown," and a one-line prompt for what to do when I find an AI feature I did not know about.`,
  },

  'customer-impact-awareness': {
    label: 'AI customer-impact map',
    prompt: `Help me draft a one-page "customer impact map" for my AI-assisted work at a community bank.

For each AI use case I list, the map should show:
- What the AI produced
- Who it ends up in front of (customer, internal, regulator)
- Which rule applies (ECOA / Reg B, UDAAP, BSA, fair lending, internal only)
- The specific review step required before use
- The retention practice

Give me the headers and a worked example for one obvious case (a customer email draft, say). I will fill in my own cases from there.`,
  },

  'workflow-readiness': {
    label: 'Four-step AI workflow document',
    prompt: `Help me draft a four-step workflow document for using AI on [DESCRIBE THE RECURRING TASK] at a community bank.

Format:
- Step 1 — Input: what raw material starts the task
- Step 2 — AI Draft: the prompt template, the tool, the expected output shape
- Step 3 — Review: who reviews, what they check, what gets rejected
- Step 4 — Final Output: where it goes, what is saved, retention

Write it tight enough for a colleague to follow without asking me questions. Include a one-line "common failure mode" note at the end of each step.`,
  },

  'training-culture': {
    label: 'Personal six-week AI learning plan',
    prompt: `Help me draft a personal six-week AI learning plan for a community bank employee in the role of [YOUR ROLE].

Pick three concrete AI skills relevant to that role. For each:
- Why this skill matters for this role
- One starter source (a course, a written guide, a community of practice — be specific)
- A week-by-week practice schedule that fits in thirty minutes per week
- What "done" looks like at the end of week six

Six weeks total. Three skills running in parallel, thirty minutes per skill per week. Be specific about deliverables, not just topics.`,
  },

  'leadership-visibility': {
    label: 'Leadership-visibility conversation kit',
    prompt: `Help me prepare for a fifteen-minute conversation with my manager about AI use at a community bank.

The conversation goals are: understand what leadership tracks about AI, what good looks like, what worries them, where my work fits.

Draft five primary questions I should ask. For each, include two short follow-up questions to use if the first answer is too general. Tone: professional, curious, not pushy. Also include three things I should be ready to share about my own AI use — wins, questions, where I am stuck — so the conversation is a two-way exchange.`,
  },
};

// ---------------------------------------------------------------------------
// SEVEN-DAY ACTIVATION PLAN — generic, applies to all tiers.
// ---------------------------------------------------------------------------

// Shared with v2 — single source in content/assessments/shared/free-readiness.
export { SEVEN_DAY_PLAN } from '@content/assessments/shared/free-readiness';

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
// STAFFING REALITY — asset-band-keyed. Optional context stripe on the free
// report; renders only when the reader shared an asset band at the email
// gate. Context only — never affects the score.
// ---------------------------------------------------------------------------

import type { FreeAssetBand } from './asset-bands';

export interface StaffingReality {
  readonly headline: string;
  readonly body: string;
}

export const STAFFING_REALITY: Record<FreeAssetBand, StaffingReality> = {
  'under-150m': {
    headline: 'For an institution under $150M',
    body:
      'You likely have no dedicated AI, IT security, or compliance analyst — the same few people wear all of those hats. Your fastest path is one named owner with a few protected hours a month, one low-risk workflow, and a one-page acceptable-use rule. Skip anything in this report that assumes a committee.',
  },
  '150m-500m': {
    headline: 'For an institution between $150M and $500M',
    body:
      'You probably have named owners for compliance and IT, but AI is a dual-hat assignment on top of a full day job. Pick two owners — one business, one risk — and give them a standing 30 minutes every other week. Your advantage is speed: decisions here take a meeting, not a quarter.',
  },
  '500m-1b-plus': {
    headline: 'For an institution of $500M to $1B+',
    body:
      'You have real departments — which means your bigger risk is inconsistency between them, not absence of capability. The recommendations here work best routed through your existing committee structure: a shared acceptable-use standard, one pilot per department, and evidence that rolls up to the board.',
  },
};

// ---------------------------------------------------------------------------
// CLOSING CTA — tier-keyed. Shared with v2 (identical strategy + copy);
// single source in content/assessments/shared/free-readiness.
// ---------------------------------------------------------------------------

export { TIER_CLOSING_CTA } from '@content/assessments/shared/free-readiness';
export type { CtaOffer, TierClosingCta } from '@content/assessments/shared/free-readiness';
