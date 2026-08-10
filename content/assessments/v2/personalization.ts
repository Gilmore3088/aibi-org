// Dynamic Assessment Results — Phase 1.5 + 2 + 3 personalization data.
// Spec: docs/superpowers/specs/2026-05-04-dynamic-assessment-results.md
// Production copy authored by user 2026-05-04 with tier variants written
// to match the same voice for the three higher tiers (the user's draft was
// calibrated to Starting Point).

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
// SECTION 2 — BIG INSIGHT (the hook). Single sentence per tier.
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
// One sentence, two-clause structure. Treated as a distinct visual
// element on both surfaces (italic display serif on parchment with a
// hairline rule above and below). Lives between the Diagnosis and the
// Practice Picture on screen; between ExecSummary and PracticePicture
// in the PDF (Spec 5 — page 2.5, no number).
// ---------------------------------------------------------------------------

// Shared with v3 — single source in content/assessments/shared/free-readiness.
export { SIGNATURE_INSIGHT } from '@content/assessments/shared/free-readiness';

// ---------------------------------------------------------------------------
// MATURITY LADDER — six named rungs from AI Curiosity through
// Institutional Advantage. The four scoring tiers map to rungs 1, 2,
// 3, and 5 (rungs 4 and 6 are aspirational and not directly measured
// by the free 12-question pool). The ladder gives the reader context
// for where they are and a visible next-step ambition.
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

/**
 * Map each scoring tier onto its rung index in the six-rung ladder.
 * Starting Point → rung 0 (AI Curiosity)
 * Early Stage     → rung 1 (Controlled Experimentation)
 * Building Momentum → rung 2 (Building Momentum)
 * Ready to Scale  → rung 4 (Governed Scale)
 *
 * Rungs 3 (Operational Adoption) and 5 (Institutional Advantage) are
 * aspirational — they describe states beyond what the free pool can
 * confidently measure. The In-Depth assessment is the path to landing
 * on those rungs with evidence.
 */
export const TIER_TO_RUNG: Record<Tier['id'], number> = {
  'starting-point': 0,
  'early-stage': 1,
  'building-momentum': 2,
  'ready-to-scale': 4,
};

// ---------------------------------------------------------------------------
// SECTION 1b — What this looks like in practice. Recognition copy by
// internal role (operations / compliance / managers / executives),
// per tier. This is the "they understand us" page; lives between the
// diagnosis and the big insight on screen, and as its own page in the PDF.
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
// SECTION 4 — Gap content. Per dimension: explanation · impacts · what good
// looks like. Drives the rich gap cards.
// ---------------------------------------------------------------------------

export interface GapContent {
  readonly oneLine: string;
  readonly explanation: string;
  readonly impacts: readonly [string, string];
  readonly whatGoodLooksLike: readonly [string, string];
}

export const GAP_CONTENT: Record<Dimension, GapContent> = {
  'current-ai-usage': {
    oneLine: 'AI use is sporadic, individual, and invisible to managers.',
    explanation:
      "AI is being used, but not in any workflow that repeats. The time savings are real — they just live inside one person's day and never roll up to a number you can manage.",
    impacts: [
      'Productivity gains stay locked inside individual desks',
      'No baseline exists to measure what AI is or is not doing for your institution',
    ],
    whatGoodLooksLike: [
      'At least one workflow per department where AI is used the same way every time',
      'Managers can name which tasks have been moved to AI and what they cost before',
    ],
  },
  'experimentation-culture': {
    oneLine: 'AI use happens — but nobody learns from anyone else.',
    explanation:
      "There is no shared place to try, swap, and improve prompts. Every lesson has to be rediscovered by the next person who needs it.",
    impacts: [
      'The same prompt gets re-invented across teams instead of refined',
      'Wins go silent — leadership never hears about them',
    ],
    whatGoodLooksLike: [
      'A monthly forum where staff demonstrate one prompt that saved them time',
      'A shared library of reusable prompts your team trusts',
    ],
  },
  'ai-literacy-level': {
    oneLine: 'Every employee is figuring this out alone.',
    explanation:
      "Staff have not been through structured training on safe AI use. Some are too cautious to use it at all; others use it confidently in places they should not. Both reactions create real cost.",
    impacts: [
      'Two failure modes coexist: paralysis (afraid to use it) and oversharing (PII into public tools)',
      'Compliance risk grows faster than productivity gain',
    ],
    whatGoodLooksLike: [
      'Every staff member can articulate when to use AI, when not to, and how to review output',
      'Onboarding includes an AI module by default',
    ],
  },
  'quick-win-potential': {
    oneLine: 'No first workflow named. Conversations stay theoretical.',
    explanation:
      "No low-risk workflow has been picked as the proving ground. Without a concrete first win, the program stays in slide decks and never reaches anyone's desk.",
    impacts: [
      'Conversations stay theoretical instead of producing measurable savings',
      'Skeptics inside the institution stay skeptical because nothing concrete has happened yet',
    ],
    whatGoodLooksLike: [
      'One named workflow where AI saves a measurable amount of time every week',
      'A second workflow lined up to start once the first is stable',
    ],
  },
  'leadership-buy-in': {
    oneLine: 'No committed senior sponsor. The program runs on volunteers.',
    explanation:
      "Senior leadership has not committed to AI as a strategic priority. Without that air cover, the program lives or dies with the one or two employees willing to push it forward.",
    impacts: [
      'Budget conversations stall — AI is treated as IT spend, not capability investment',
      'Compliance and risk teams default to "no" without a counterweight',
    ],
    whatGoodLooksLike: [
      'A named executive sponsor with AI on their performance objectives',
      'AI capability appears in the strategic plan, not just the IT roadmap',
    ],
  },
  'security-posture': {
    oneLine: 'Right behavior may be happening — you cannot prove it on paper.',
    explanation:
      "Your AI security posture is not yet documented in a form an examiner would accept. Staff may be doing the right things every day, but there is no record to point to when asked.",
    impacts: [
      'Examiner asks for the AI workflow inventory — you cannot produce one',
      'A single staff prompt with PII becomes a reportable incident',
    ],
    whatGoodLooksLike: [
      'A documented AI use policy with examples, not just principles',
      'An inventory of which tools are approved, for which data, with which review steps',
    ],
  },
  'training-infrastructure': {
    oneLine: 'No practice cadence. Skills decay between events.',
    explanation:
      "There is no recurring rhythm for AI practice. One-off training events fade within a quarter, and new hires arrive with no path into the workflows your team has built.",
    impacts: [
      'Skills decay between training events; new hires arrive into a vacuum',
      'Leadership keeps paying for kickoff sessions that never produce durable capability',
    ],
    whatGoodLooksLike: [
      'A weekly or biweekly cadence where staff practice one new AI workflow',
      'A library of recorded reps that new hires can step into during onboarding',
    ],
  },
  'builder-potential': {
    oneLine: 'No internal builder. Workflow improvements wait for vendors.',
    explanation:
      "There is no named builder — the analyst or operations person who turns AI tools into working processes the rest of the team can reuse. Without one, capability stays vendor-shaped.",
    impacts: [
      'Every workflow improvement requires consultant or vendor work',
      'The institution remains dependent on external expertise indefinitely',
    ],
    whatGoodLooksLike: [
      'At least one person inside the institution who builds and refines workflows for others',
      'A pipeline of analysts and ops people who can graduate into builder roles',
    ],
  },
};

// ---------------------------------------------------------------------------
// SECTION 5 — Recommendations (existing).
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
  'current-ai-usage': {
    title: 'Standardize meeting summaries',
    riskLevel: 'Low',
    timeSaved: '~60 min per meeting',
    owner: 'Ops / Admin',
    explanation:
      'Pick one recurring meeting. Use a shared prompt to turn the recording or transcript into action items, owners, and dates. Same prompt every week, same review step every week.',
    whyRightNow: [
      'Directly addresses your gap in Current AI Usage',
      'Low operational risk',
      'Produces immediate, visible time savings',
    ],
    inPractice:
      'Convert a 60–90 minute internal meeting into a one-page summary with decisions, owners, and next steps in under five minutes.',
    worksBestFor: [
      'Committee meetings',
      'Internal project updates',
      'Recurring team syncs',
    ],
  },
  'experimentation-culture': {
    title: 'Run a 30-minute "show your prompt" lunch',
    riskLevel: 'Low',
    timeSaved: '~3 hours per week recovered across the team',
    owner: 'Department lead',
    explanation:
      'Three staff members each share one prompt that saved them time this month, plus the review step they use. Document what worked. Repeat monthly. This is how isolated experiments become institutional knowledge.',
    whyRightNow: [
      'Directly addresses your gap in Experimentation Culture',
      'Costs nothing — uses time you already have',
      'Builds the prompt library you will need for the next stage',
    ],
    inPractice:
      'Three short demos. Each one shows: the prompt, the workflow it improved, and the review step. Notes go into a shared doc.',
    worksBestFor: [
      'Operations teams',
      'Lending departments',
      'Marketing and member service',
    ],
  },
  'ai-literacy-level': {
    title: 'Run AiBI-Foundation Module 01 with one team',
    riskLevel: 'Low',
    timeSaved: 'Compounding — pays back across every later workflow',
    owner: 'Department lead + L&D',
    explanation:
      'Five-to-seven minute reps on safe prompting basics. The team that goes through it together stops asking the AI policy team theoretical questions and starts asking workflow questions instead.',
    whyRightNow: [
      'Directly addresses your gap in AI Literacy Level',
      'Lowers compliance risk before it materializes',
      'Establishes the shared vocabulary the rest of the program needs',
    ],
    inPractice:
      'One team — eight to twelve people — works through Module 01 together over two weeks. They emerge with a common framework and the confidence to try the next workflow.',
    worksBestFor: [
      'Operations teams',
      'BSA/AML and compliance',
      'Front-line member service',
    ],
  },
  'quick-win-potential': {
    title: 'Rewrite a messy internal email',
    riskLevel: 'Low',
    timeSaved: '~15 min per email · pays back the same morning',
    owner: 'Front-line manager',
    explanation:
      'Pick the kind of email your team rewrites three times a week — a policy reminder, a status update, a meeting recap. Use a single prompt with a documented review step. The first rep takes ten minutes; the tenth takes one.',
    whyRightNow: [
      'Directly addresses your gap in Quick Win Potential',
      'Low operational risk',
      'Produces immediate, visible time savings',
    ],
    inPractice:
      'Take one email type. Write a prompt that turns the messy draft into a clear, branded version. Review every output the first month, then sample weekly.',
    worksBestFor: [
      'Internal policy reminders',
      'Project status updates',
      'Member communications drafts (with review)',
    ],
  },
  'leadership-buy-in': {
    title: 'Present one ROI estimate to leadership',
    riskLevel: 'Low',
    timeSaved: 'Unlocks budget for the next move',
    owner: 'AI lead + finance',
    explanation:
      'Use the conservative ROI model from this assessment with your real staff numbers. Present one slide: hours recovered, dollars equivalent, where the time went. Leadership commits to programs that have a number attached.',
    whyRightNow: [
      'Directly addresses your gap in Leadership Buy-In',
      'Converts an abstract conversation into a budget conversation',
      'Forces specificity — you cannot bluff a number',
    ],
    inPractice:
      'A single slide with three numbers: hours recovered per week, equivalent loaded-cost dollars per year, and what those hours could be redirected toward.',
    worksBestFor: [
      'Board updates',
      'Annual planning sessions',
      'Budget renewal conversations',
    ],
  },
  'security-posture': {
    title: 'Document one approved AI workflow end-to-end',
    riskLevel: 'Low',
    timeSaved: 'Removes the SR 26-2 question your examiner is going to ask',
    owner: 'Compliance + Ops',
    explanation:
      'One workflow, written down: which tool, what data goes in, what review happens, who signs off. This is the artifact your examiner wants to see, and the artifact your team needs to scale safely. Start with the workflow you already trust.',
    whyRightNow: [
      'Directly addresses your gap in Security Posture',
      'Becomes the template for every workflow that follows',
      'Closes a documented audit risk',
    ],
    inPractice:
      'Pick the workflow staff already use safely. Write the standard operating procedure: tool, inputs, review, sign-off, retention. Two pages, with a screenshot.',
    worksBestFor: [
      'Compliance review processes',
      'Member-facing draft generation',
      'Internal summary workflows',
    ],
  },
  'training-infrastructure': {
    title: 'Pilot a 12-week practice cadence with one cohort',
    riskLevel: 'Low',
    timeSaved: 'Persistent — outlasts the staff turnover that kills one-off training',
    owner: 'L&D + Department lead',
    explanation:
      'Five-to-seven minute reps, weekly, in a shared space. The training infrastructure problem is not "who teaches" — it is "where does practice live after the kickoff session?" Make the cadence the answer.',
    whyRightNow: [
      'Directly addresses your gap in Training Infrastructure',
      'Builds the muscle that makes every later investment compound',
      'Provides the practice surface new hires step into',
    ],
    inPractice:
      'One cohort of eight to twelve. Weekly thirty-minute session. One workflow per week with a take-home rep. Twelve weeks later, you have a documented pattern other departments can copy.',
    worksBestFor: [
      'Operations teams',
      'BSA/AML',
      'Front-line lending and member service',
    ],
  },
  'builder-potential': {
    title: 'Identify your first internal builder',
    riskLevel: 'Low',
    timeSaved: 'Capability multiplier — one builder unlocks ten workflows',
    owner: 'AI lead',
    explanation:
      'Look for the analyst or operations person who already automates spreadsheets without being asked. Give them one workflow and one prompt system. Builders convert tools into capability faster than committees do.',
    whyRightNow: [
      'Directly addresses your gap in Builder Potential',
      'Reduces vendor dependence',
      'Sets up the internal pipeline that scales the program',
    ],
    inPractice:
      'One named person, one workflow, one review cadence with their manager. The deliverable is not a deck — it is a working prompt system another team can adopt.',
    worksBestFor: [
      'Operations analysts',
      'Lending operations',
      'Compliance specialists',
    ],
  },
};

// ---------------------------------------------------------------------------
// SECTION 6 — Starter prompts (Section 6 / Interactive Prompt Block).
// One per dimension; the prompt the visitor leaves with depends on their
// bottom-ranked dimension.
// ---------------------------------------------------------------------------

export interface StarterPrompt {
  readonly label: string;
  readonly prompt: string;
}

export const STARTER_PROMPTS: Record<Dimension, StarterPrompt> = {
  'current-ai-usage': {
    label: 'Meeting summary starter',
    prompt: `I want to summarize an internal meeting into a clear, professional summary.

Please structure the output with:
- Key decisions
- Action items (with owner and deadline)
- Open questions

Keep it concise and formatted for internal distribution.

Do not include any sensitive or customer-specific information.`,
  },
  'experimentation-culture': {
    label: 'Prompt-share lunch starter',
    prompt: `I am hosting a 30-minute internal session where three staff members each demonstrate one prompt that has saved them time this month.

For each prompt, capture:
- The exact prompt text
- The workflow it improved
- The review step the presenter uses to verify output
- One example before-and-after (without any sensitive data)

Format the output as a single-page handout teams can take back to their desks.`,
  },
  'ai-literacy-level': {
    label: 'Safe-prompt training starter',
    prompt: `I am running a 60-minute internal training on safe AI use for our staff.

Generate a session outline with:
- Three concrete dos and three concrete don'ts for prompting
- One worked example showing a safe prompt and an unsafe one (using fictional data)
- A two-question check-for-understanding at the end

Tone should be practical and free of hype. Audience: community-bank or credit-union staff who have not used generative AI in their work before.`,
  },
  'quick-win-potential': {
    label: 'Email rewrite starter',
    prompt: `I need to rewrite a draft internal email so it is clear, professional, and ready for distribution.

Please:
- Keep all factual information unchanged
- Improve clarity and tone
- Use short paragraphs and bullet points where appropriate
- Flag anything that looks like it needs a manager review before sending

Do not include any customer-specific information or PII in the rewrite.`,
  },
  'leadership-buy-in': {
    label: 'ROI slide starter',
    prompt: `Help me draft a single slide for an executive update on our AI program.

The slide should answer:
- How many staff hours per week have we recovered through AI workflows?
- What is the equivalent loaded-cost dollars per year?
- Where could those hours be redirected to create new value?

Keep the language plain, conservative, and free of vendor jargon. No projections beyond what we can defend with current data.`,
  },
  'security-posture': {
    label: 'Workflow documentation starter',
    prompt: `Help me document one approved AI workflow end-to-end.

Capture:
- The tool used (and the version, if relevant)
- The data that goes in
- The review step before output is used
- The person who signs off
- The retention rule for the output

Format as a two-page standard operating procedure that a compliance reviewer or examiner could read in five minutes.`,
  },
  'training-infrastructure': {
    label: '12-week cadence starter',
    prompt: `I am setting up a 12-week practice cadence for one cohort of eight to twelve staff.

Each week needs:
- One specific workflow to practice
- A five-to-seven minute exercise
- A take-home rep
- A reflection question for the next session

Order the twelve weeks from lowest-risk and highest-frequency workflows toward more involved ones. Match the cadence to community-bank operations: ops, lending, member service.`,
  },
  'builder-potential': {
    label: 'First-builder kickoff starter',
    prompt: `I am giving one internal staff member responsibility for building and refining one AI workflow that other teams will adopt.

Help me draft:
- A one-paragraph charter for the role
- The first workflow they will own
- The review cadence with their manager
- The deliverable in 30 days (a working prompt system, not a deck)

The person is an operations analyst, not a technical specialist.`,
  },
};

// ---------------------------------------------------------------------------
// SECTION 7 — 7-Day Activation Plan (generic, applies to all tiers).
// ---------------------------------------------------------------------------

// Shared with v3 — single source in content/assessments/shared/free-readiness.
export { SEVEN_DAY_PLAN } from '@content/assessments/shared/free-readiness';

// ---------------------------------------------------------------------------
// Implications for Financial Professionals — tier-keyed exec-translation
// across the three lenses a banker reads through.
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
      "Staff are pasting work into public AI tools without policy or audit trail. Under SR 26-2 and the AIEOG Lexicon, examiners will ask what tools you approve, for what data, with what review — and that question cannot yet be answered on paper.",
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
// CLOSING CTA — tier-keyed. Shared with v3 (identical strategy + copy);
// single source in content/assessments/shared/free-readiness.
// ---------------------------------------------------------------------------

export { TIER_CLOSING_CTA } from '@content/assessments/shared/free-readiness';
export type { CtaOffer, TierClosingCta } from '@content/assessments/shared/free-readiness';
