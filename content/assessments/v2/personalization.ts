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
      'AI is already being used inside your organization—but without consistent training, structure, or safeguards. This creates uneven results, missed efficiency gains, and unnecessary risk.',
  },
  'early-stage': {
    id: 'early-stage',
    label: 'Coordinated Experimentation',
    oneLine:
      'AI is in use across some teams, but adoption is uneven and outcomes are inconsistent. The institutions that pull ahead from here are the ones that systematize the wins, not the ones that buy more tools.',
  },
  'building-momentum': {
    id: 'building-momentum',
    label: 'Program Building',
    oneLine:
      'AI is producing real value across multiple teams—but the program is fragile. Without measured outcomes and codified workflows, leadership support erodes faster than capability builds.',
  },
  'ready-to-scale': {
    id: 'ready-to-scale',
    label: 'Capability Leadership',
    oneLine:
      'AI is operating as a strategic capability inside your institution. The opportunity now is replication speed: how fast you codify what works for the next wave of staff.',
  },
};

// ---------------------------------------------------------------------------
// SECTION 2 — BIG INSIGHT (the hook). Single sentence per tier.
// ---------------------------------------------------------------------------

export const BIG_INSIGHT: Record<Tier['id'], string> = {
  'starting-point':
    'You are capable of quick AI wins—but currently lack the structure to use AI safely and consistently.',
  'early-stage':
    'You have the people and curiosity. What you lack is a coordinated program that turns isolated wins into institutional capability.',
  'building-momentum':
    'You have working AI workflows. What you need next is the discipline to measure outcomes well enough to defend the program with leadership.',
  'ready-to-scale':
    'You have a working program. The compounding question now is whether you can replicate it across every new hire fast enough to stay ahead.',
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
    oneLine: 'AI tools are not embedded in repeating workflows. Use is sporadic and invisible to managers.',
    explanation:
      'AI tools are not yet embedded in repeating workflows. Use is sporadic, individual, and invisible to managers — which means time savings are real but not measurable.',
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
    oneLine: 'AI usage is happening — but not shared or improving across your team.',
    explanation:
      'There is no shared place where staff can try, share, and improve AI use. Without that, every learning has to be rediscovered by the next person.',
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
    oneLine: 'Skills are not compounding. Every employee is figuring this out alone.',
    explanation:
      'Staff have not yet been through structured training on safe and effective AI use. The gap shows up as cautious avoidance from some staff and unsafe enthusiasm from others.',
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
    oneLine: 'No first workflow has been identified. The program never gets started.',
    explanation:
      'No low-risk workflow has been identified where AI can immediately save time. Without a beachhead, the program never gets started.',
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
    oneLine: 'Leadership has not committed. The program lives or dies by individual sponsors.',
    explanation:
      'Senior leadership has not committed to AI as a strategic priority. Without that air cover, the program lives or dies by individual sponsors.',
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
    oneLine: 'Staff may be doing the right things, but you cannot prove it to an examiner.',
    explanation:
      'Your AI security posture is not yet documented in a way your examiner would accept. Staff may be doing the right things, but you cannot prove it.',
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
    oneLine: 'No training system. Skills decay between events; new hires arrive into a vacuum.',
    explanation:
      'There is no recurring practice cadence for AI skills. One-off training fades within a quarter; without a place where practice lives, capability does not compound.',
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
    oneLine: 'No internal builder. Every workflow improvement requires consultant or vendor work.',
    explanation:
      'There is not yet a named internal builder — the analyst or operations person who turns AI tools into working processes for everyone else. Without one, capability stays vendor-shaped.',
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
    title: 'Run AiBI-P Module 01 with one team',
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
    timeSaved: 'Removes the SR 11-7 question your examiner is going to ask',
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
      'Time savings exist on individual desks but never aggregate to a measurable efficiency gain at the institution level. Without sanctioned workflows, the program cannot be staffed or budgeted with confidence.',
    risk:
      'Staff use of public AI tools without policy or audit trail creates compliance exposure under SR 11-7 and the AIEOG Lexicon. The risk question your examiner will ask cannot yet be answered with documentation.',
    cost:
      'Every workflow improvement requires consultant or vendor involvement. There is no internal capability accumulating, so spend keeps repeating instead of compounding into capability.',
  },
  'early-stage': {
    operational:
      'Uneven adoption means efficiency gains are not realized across the organization. Isolated wins cannot scale without process alignment, and the gap between top-performing teams and the rest widens.',
    risk:
      'Absence of a program increases compliance risk. Audit trails are inconsistent, raising questions about what tools are used, what data is exposed, and who is approving usage at the institution level.',
    cost:
      'Reliance on vendors or consultants for every workflow improvement can become expensive and delays internal capability. Building internal skills reduces long-term costs and reduces vendor lock-in.',
  },
  'building-momentum': {
    operational:
      'Multiple teams are producing measurable savings, but the program lacks the documented outcomes leadership needs to defend continued investment. Inconsistent measurement obscures which workflows are actually moving the efficiency ratio.',
    risk:
      'Governance exists but is uneven. Examiner-grade documentation needs to be standardized across teams before staff turnover or a single incident creates exposure.',
    cost:
      'The program survives on individual sponsorship rather than institutional investment. Without measured ROI, budget conversations stall and capability that should compound stays linear.',
  },
  'ready-to-scale': {
    operational:
      'AI is producing measurable, repeatable efficiency gains across departments. The risk now is not adoption — it is replication speed. Institutions that codify their program can extend the advantage; institutions that do not lose ground when staff turn over.',
    risk:
      'Mature governance reduces incident risk to acceptable levels. The remaining risk is complacency: programs that stop investing in the next wave of capability fall behind faster than they realize.',
    cost:
      'Internal capability has reduced vendor dependence and extended the productive life of staff hours. The next investment is not in tools — it is in the practice cadence that compounds capability across every new hire.',
  },
};

// ---------------------------------------------------------------------------
// Closing CTA — tier-keyed single-card replacement for the cut Next-Steps trio.
// One card renders at the bottom of the on-screen brief, varying content by
// tier. Drives /courses/foundation/program (Starting Point + Early Stage) or
// /for-institutions/advisory (Building Momentum + Ready to Scale).
// ---------------------------------------------------------------------------

export interface TierClosingCta {
  readonly eyebrow: string;
  readonly headline: string;
  readonly body: string;
  readonly ctaLabel: string;
  readonly ctaHref: string;
}

export const TIER_CLOSING_CTA: Record<Tier['id'], TierClosingCta> = {
  'starting-point': {
    eyebrow: 'Your next move',
    headline: 'Get your team trained on AI fundamentals.',
    body:
      'Skills come first. AiBI-P teaches working AI use to bankers in 12 short modules — your team can start this week.',
    ctaLabel: 'Enroll your team in AiBI-P',
    ctaHref: '/courses/foundation/program',
  },
  'early-stage': {
    eyebrow: 'Your next move',
    headline: 'Get your team trained on AI fundamentals.',
    body:
      'You have momentum. Lock it in with AiBI-P — your bankers learn the same patterns repeatable across the institution.',
    ctaLabel: 'Enroll your team in AiBI-P',
    ctaHref: '/courses/foundation/program',
  },
  'building-momentum': {
    eyebrow: 'Your next move',
    headline: 'Walk through these results with us.',
    body:
      "You're ready for a roadmap conversation, not a course. An Executive Briefing translates this report into a phased plan with leadership at the table.",
    ctaLabel: 'Request an Executive Briefing',
    ctaHref: '/for-institutions/advisory',
  },
  'ready-to-scale': {
    eyebrow: 'Your next move',
    headline: 'Talk to us about Leadership Advisory.',
    body:
      "You don't need foundations — you need ongoing AI judgment at the leadership level. Leadership Advisory is fractional CAIO work for institutions with internal momentum.",
    ctaLabel: 'Request a conversation',
    ctaHref: '/for-institutions/advisory',
  },
};
