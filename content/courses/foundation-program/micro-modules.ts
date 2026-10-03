import type { Activity, Pillar, Section } from './types';

export interface FoundationReferenceSection {
  readonly title: string;
  readonly content: string;
  readonly tryThis: string;
}

/**
 * A build: the working tool a module leaves the learner holding. Shown as
 * three short steps (copy, save, test), so every field is short. The job and
 * the prompt are durable; `toolPaths` name real menus and are re-checked by
 * `reviewBy` (enforced in tests).
 */
export type BuildTool = 'ChatGPT' | 'Claude' | 'Gemini' | 'Copilot';

export interface FoundationBuildToolPath {
  readonly tool: BuildTool;
  readonly where: string;
}

export interface FoundationBuildTest {
  /** Short button label. */
  readonly label: string;
  /** What the learner sends. */
  readonly prompt: string;
  /** What a working build replies, shown as an example. */
  readonly reply: string;
}

export interface FoundationBuild {
  /** One sentence: what works at the end of the module. */
  readonly youWillHave: string;
  readonly beforeYouStart: string;
  readonly promptLabel: string;
  /** The exact text the learner copies. */
  readonly prompt: string;
  /** Three or four short phrases: what the prompt makes the tool do. */
  readonly highlights: readonly string[];
  readonly toolPaths: readonly FoundationBuildToolPath[];
  readonly tests: readonly FoundationBuildTest[];
  /** One line: what to check in the real result. */
  readonly check: string;
  readonly doneWhen: string;
  /** What the build does not do, in one line. */
  readonly limits?: string;
  readonly verifiedOn: string;
  readonly reviewBy: string;
}

export interface FoundationMicroModule {
  readonly number: number;
  readonly id: string;
  readonly title: string;
  readonly pillar: Pillar;
  readonly estimatedMinutes: number;
  readonly keyOutput: string;
  readonly mission: string;
  readonly plainLanguageConcept: string;
  readonly bankingGuardrail: string;
  readonly guidanceSource: string;
  readonly tryTask: string;
  readonly buildTask: string;
  readonly saveArtifact: string;
  readonly visualModel: readonly string[];
  readonly reviewChecklist: readonly string[];
  readonly qualitySignals: readonly string[];
  readonly weakExample: string;
  readonly strongExample: string;
  readonly exampleWhy: string;
  readonly transferMove: string;
  readonly proofToSave: string;
  readonly reference: readonly FoundationReferenceSection[];
  /** Present when the module is a build: one working tool per module. */
  readonly build?: FoundationBuild;
}

/** Where each tool keeps standing instructions that apply to every chat. */
const HOUSE_RULE_PATHS: readonly FoundationBuildToolPath[] = [
  { tool: 'ChatGPT', where: 'Settings → Personalization → Custom instructions' },
  { tool: 'Claude', where: 'Settings → Profile → personal preferences' },
  { tool: 'Gemini', where: 'Settings → Saved info' },
  { tool: 'Copilot', where: 'Paste it at the start of each chat.' },
];

const SAVE_AS_PROJECT: readonly FoundationBuildToolPath[] = [
  { tool: 'ChatGPT', where: 'Create a project and paste it into the project instructions.' },
  { tool: 'Claude', where: 'Create a project and paste it into the project instructions.' },
  { tool: 'Gemini', where: 'Create a Gem and paste it into its instructions.' },
  { tool: 'Copilot', where: 'Keep it in a note and paste it when you need it.' },
];
const BUILD_VERIFIED_ON = '2026-10-03';
const BUILD_REVIEW_BY = '2027-01-03';

const commonReference = (
  title: string,
  guidance: string,
  concept: string,
  tryThis: string,
): readonly FoundationReferenceSection[] => [
  {
    title,
    content: `${concept}\n\nBanking connection: ${guidance}. Keep the work low-risk, source-grounded, and reviewed by a human before it affects a customer, control, report, or decision.`,
    tryThis,
  },
];

function buildActivity(module: FoundationMicroModule): Activity {
  // A build saves the working thing itself, not a description of it.
  const isBuild = Boolean(module.build);
  return {
    id: `${module.number}.1`,
    title: `Save: ${module.saveArtifact}`,
    description: module.buildTask,
    type: 'form',
    completionTrigger: 'module-advance',
    fields: [
      {
        id: 'artifact_draft',
        label: isBuild ? 'Paste what you saved' : 'What did you build?',
        type: 'textarea',
        placeholder: module.saveArtifact,
        minLength: 24,
        required: true,
      },
      {
        id: 'review_note',
        label: isBuild ? 'What did you check when you ran it?' : 'What did you check before saving it?',
        type: 'textarea',
        placeholder: module.reviewChecklist.join('; '),
        minLength: 24,
        required: true,
      },
      {
        id: 'first_use',
        label: isBuild ? 'What real work did you use it on?' : 'Where will you reuse this at work?',
        type: 'textarea',
        placeholder: module.transferMove,
        minLength: 24,
        required: true,
      },
    ],
  };
}

export const FOUNDATION_MICRO_MODULES: readonly FoundationMicroModule[] = [
  {
    number: 1,
    // Slug kept for saved progress. The module is now a build: the learner's
    // AI tool, set up with house rules before any real work goes in.
    id: 'm1-ai-capabilities-limits',
    title: 'Set Your AI House Rules',
    pillar: 'awareness',
    estimatedMinutes: 10,
    keyOutput: 'AI House Rules',
    mission: 'Set up your AI tool so it warns you about customer data and marks every answer as a draft.',
    plainLanguageConcept: 'AI can draft, summarize, classify, and structure work. It cannot know your bank policy, verify truth by itself, or own a regulated decision. House rules make your tool say so every time.',
    bankingGuardrail: 'House rules are a reminder, not a control. Your institution\'s approved-tool list and data rules decide what you may paste.',
    guidanceSource: 'NIST AI RMF, SR 26-2, Treasury AI financial services report',
    tryTask: 'Run three test prompts and check that your tool flags the one with customer data.',
    buildTask: 'Save standing instructions that flag customer data, mark answers as drafts, and refuse decisions.',
    saveArtifact: 'AI House Rules',
    visualModel: ['Draft', 'Check', 'Decide', 'Own'],
    reviewChecklist: ['No customer data', 'Marks answers as drafts', 'Refuses customer decisions'],
    qualitySignals: ['Saved in your own tool', 'Passes all three tests', 'Short enough to read'],
    weakExample: 'Be careful with customer data.',
    strongExample: 'If my message contains a customer name, account number, or SSN, stop and tell me what to remove before you answer.',
    exampleWhy: 'The strong rule says what to look for and what to do, so it works without you remembering to check.',
    transferMove: 'Use your house rules in every AI conversation at work, starting with the rest of this course.',
    proofToSave: 'Your saved house rules and the test prompt they caught.',
    reference: commonReference(
      'AI drafts; you decide',
      'Regulators focus on accountable use, validation, documentation, and human oversight when AI affects banking outcomes',
      'AI is useful for drafting words and organizing information. The closer a task gets to a customer, a control, a report, or a regulated decision, the more a person has to check and own it. House rules keep that line visible in every conversation.',
      'Run one of your own low-risk tasks through your guarded tool and read the draft line at the end.',
    ),
    build: {
      youWillHave: 'Your AI tool, set to flag customer data, mark every answer as a draft, and leave decisions to you.',
      beforeYouStart: 'Open the AI tool your institution approves.',
      promptLabel: 'House rules',
      prompt: `Follow these rules in every conversation with me.

1. Before you answer, check my message for customer or member information: names, account or card numbers, Social Security numbers, dates of birth, addresses, phone numbers, or loan details. If you find any, do not answer. List what you found and ask me to replace it with a placeholder such as [CUSTOMER] or [ACCOUNT].
2. Treat what you write as a draft for me to check. End each answer with: "Draft. Check facts before use."
3. If I ask you to decide something about a customer, a loan, a complaint, or a compliance matter, do not decide. Tell me what a person would need to know to decide it.
4. If you are not sure something is true, say so. Do not guess.`,
      highlights: ['Flags customer data', 'Marks every answer a draft', 'Leaves decisions to you', 'Says when it is unsure'],
      toolPaths: HOUSE_RULE_PATHS,
      tests: [
        {
          label: 'A safe request',
          prompt: 'Rewrite for the branch team: the lobby closes at 3 p.m. Friday for carpet cleaning.',
          reply: 'Heads up: the lobby closes at 3 p.m. this Friday for carpet cleaning. Please plan appointments around it.\n\nDraft. Check facts before use.',
        },
        {
          label: 'Customer data',
          prompt: 'Draft a reply to Maria Delgado about the overdraft fee on account 4417-2290.',
          reply: 'I can\'t answer yet. Your message includes a customer name (Maria Delgado) and an account number (4417-2290). Replace them with [CUSTOMER] and [ACCOUNT], then send it again.',
        },
        {
          label: 'A decision',
          prompt: 'Should we approve this loan? The applicant\'s debt-to-income ratio is 48 percent.',
          reply: 'I won\'t make that decision. A lender would need the full application, your credit policy, verified income, and the applicant\'s credit history.\n\nDraft. Check facts before use.',
        },
      ],
      check: 'Send all three in a new chat. Your tool should answer each one the way the example does.',
      doneWhen: 'Your tool stops on the customer-data test.',
      limits: 'It catches a mistake after you press send. Your institution\'s data rules still come first.',
      verifiedOn: BUILD_VERIFIED_ON,
      reviewBy: BUILD_REVIEW_BY,
    },
  },
  {
    number: 2,
    // Slug kept for saved progress. The module is now a build: a saved
    // rewrite prompt the learner uses on a real internal message the same day.
    id: 'm2-low-risk-message-rewrite',
    title: 'Build a Message Rewriter',
    pillar: 'awareness',
    estimatedMinutes: 10,
    keyOutput: 'Message Rewriter',
    mission: 'Build a saved prompt that turns a messy internal note into a clear message, and send one today.',
    plainLanguageConcept: 'A non-sensitive internal message is the safest first job for AI. The AI fixes the structure; you keep the facts and the final say.',
    bankingGuardrail: 'Strip names, account data, loan details, and confidential bank information before using AI.',
    guidanceSource: 'Interagency TPRM Guidance, NIST GenAI profile',
    tryTask: 'Rewrite a messy internal note so the action, owner, and deadline are clear.',
    buildTask: 'Save a reusable rewrite prompt, then use it on one real internal note.',
    saveArtifact: 'Message Rewriter',
    visualModel: ['Redact', 'Rewrite', 'Review', 'Send'],
    reviewChecklist: ['Identifiers removed', 'Facts unchanged', 'Action first'],
    qualitySignals: ['Shorter than original', 'Clear owner', 'No invented details'],
    weakExample: 'Make this sound better: Mary Jones called about account 4412.',
    strongExample: 'Rewrite this redacted internal note. Do not add facts. Make the action, owner, and deadline clear.',
    exampleWhy: 'The strong prompt keeps the useful structure while removing sensitive identifiers.',
    transferMove: 'Use the rewriter on one internal message before you leave today.',
    proofToSave: 'Your saved rewrite prompt and one message you sent with it.',
    reference: commonReference(
      'The safest first win',
      'AI input handling and vendor/tool approval matter even when the task feels routine',
      'Internal message rewriting is useful because it is concrete and easy to review. It becomes risky only when the learner pastes information the tool is not approved to receive.',
      'Take one messy note, replace sensitive details with placeholders, and rewrite it under 120 words.',
    ),
    build: {
      youWillHave: 'A saved prompt that turns any messy internal note into a short message with the action first.',
      beforeYouStart: 'Find an internal note you need to send today. Nothing about customers.',
      promptLabel: 'Message rewriter',
      prompt: `Rewrite the note below as a short internal message for [audience, e.g. branch staff].

Put the action in the first sentence. Say who does it and by when, if the note says. Keep every fact as written and add none. If the owner or the deadline is missing, write [OWNER?] or [DATE?] instead of guessing. Keep it under 120 words, in plain language.

Note:
[paste the note]`,
      highlights: ['Action first', 'Keeps your facts', 'Flags a missing owner or date', 'Under 120 words'],
      toolPaths: SAVE_AS_PROJECT,
      tests: [
        {
          label: 'A messy note',
          prompt: 'hey all so starting monday vault counts need two people, the old count form is gone so use the new one in the shared drive, questions to Dana',
          reply: 'Starting Monday, do every vault count with two people and use the new count form in the shared drive. The old form is retired. Questions go to Dana.\n\nOwner: [OWNER?]',
        },
      ],
      check: 'Every fact matches your note and nothing is new. Fill in any [OWNER?] or [DATE?] yourself.',
      doneWhen: 'You send one real message written with it.',
      verifiedOn: BUILD_VERIFIED_ON,
      reviewBy: BUILD_REVIEW_BY,
    },
  },
  {
    number: 3,
    // id retains its original slug for backward compatibility; the module's
    // user-facing identity is the CORE prompt (Context, Objective, Resources,
    // Expectations), taught by building a meeting actions assistant.
    id: 'm3-spot-weak-ai-output',
    title: 'Build a Meeting Actions Assistant',
    pillar: 'awareness',
    estimatedMinutes: 12,
    keyOutput: 'Meeting Actions Assistant',
    mission: 'Use the CORE structure to build an assistant that turns meeting notes into who does what by when.',
    plainLanguageConcept: 'A strong prompt names four things — Context, Objective, Resources, and Expectations. Vague prompts get vague answers.',
    bankingGuardrail: 'Tell the AI to use only the notes you provide, and keep customer details out of them.',
    guidanceSource: 'NIST AI RMF, NIST GenAI profile',
    tryTask: 'Rewrite a vague request into a CORE prompt: Context, Objective, Resources, Expectations.',
    buildTask: 'Save the meeting actions prompt and run it on notes from a real meeting.',
    saveArtifact: 'Meeting Actions Assistant',
    visualModel: ['Context', 'Objective', 'Resources', 'Expectations'],
    reviewChecklist: ['Every row has a source line', 'Nothing added that is not in the notes', 'Missing owners flagged'],
    qualitySignals: ['Uses only the notes', 'Owner and date on every action', 'Checkable in a minute'],
    weakExample: 'Summarize these meeting notes.',
    strongExample: 'Using only the notes below, list every action with its owner, due date, and the line it came from.',
    exampleWhy: 'The strong prompt names the source, the output, and a way to check it, so the answer is usable without rework.',
    transferMove: 'Run the assistant on your next meeting\'s notes and send the list the same day.',
    proofToSave: 'Your saved assistant prompt and one action list you sent.',
    reference: commonReference(
      'A clear prompt is a control',
      'A prompt that names context, objective, the approved source, and the output shape is easier to review and safer to reuse',
      'Most learners do not need model theory first. They need a repeatable structure — Context, Objective, Resources, Expectations — that turns a vague ask into reviewable, reusable work.',
      'Rewrite one vague request into a CORE prompt that names the context, the objective, the only source to use, and the expected format.',
    ),
    build: {
      youWillHave: 'An assistant that turns meeting notes into who does what by when, with the line each item came from.',
      beforeYouStart: 'Open the notes from your last internal meeting. Swap any customer name for [CUSTOMER].',
      promptLabel: 'Meeting actions assistant',
      prompt: `You turn internal meeting notes into an action list for a community bank team.

Context: notes from an internal [team name] meeting. There are no customer details in them.
Objective: list every action item with an owner and a due date.
Resources: use only the notes below. Do not add actions that are not in the notes.
Expectations: a table with the columns Action, Owner, Due, and Source line (the words in the notes it came from). Below the table, list any action with no owner or no date under "Needs an owner."

Notes:
[paste the notes]`,
      highlights: ['Context', 'Objective', 'Resources', 'Expectations'],
      toolPaths: SAVE_AS_PROJECT,
      tests: [
        {
          label: 'Sample notes',
          prompt: 'Ops huddle. Priya to swap the ATM signs by the 10th. New hire laptops still not ordered. Marcus will send the holiday schedule Friday.',
          reply: 'Action | Owner | Due | Source line\nSwap ATM signs | Priya | the 10th | "Priya to swap the ATM signs by the 10th"\nSend holiday schedule | Marcus | Friday | "Marcus will send the holiday schedule Friday"\n\nNeeds an owner: order new-hire laptops.',
        },
      ],
      check: 'Every row has a source line you can find in your notes. Delete any row that does not.',
      doneWhen: 'You send the action list from a real meeting to the people on it.',
      verifiedOn: BUILD_VERIFIED_ON,
      reviewBy: BUILD_REVIEW_BY,
    },
  },
  {
    number: 4,
    id: 'm4-build-first-prompt',
    title: 'Build Your Weekly Task Assistant',
    pillar: 'awareness',
    estimatedMinutes: 10,
    keyOutput: 'Weekly Task Assistant',
    // Module 3 teaches the CORE method on sample scenarios; Module 4 applies the
    // SAME framework to a task the learner actually owns. Same four parts (CORE),
    // distinct purpose — no competing Context/Task/Format/Rules schema.
    mission: 'Apply the CORE structure to build your own first reusable prompt for a task you actually do.',
    plainLanguageConcept: 'Module 3 used the four CORE parts to build a meeting assistant. Now use the same four — Context, Objective, Resources, Expectations — on one real, recurring task from your own role.',
    bankingGuardrail: 'Use placeholders for sensitive inputs and add a review rule directly inside the prompt.',
    guidanceSource: 'NIST GenAI profile, Treasury AI financial services report',
    tryTask: 'Compare a weak one-line prompt with a CORE-structured prompt for your own task.',
    buildTask: 'Save a CORE prompt for one weekly task and run it on this week\'s input.',
    saveArtifact: 'Weekly Task Assistant',
    visualModel: ['Context', 'Objective', 'Resources', 'Expectations'],
    reviewChecklist: ['Objective is specific', 'Placeholders used for inputs', 'Review rule included'],
    qualitySignals: ['Reusable next week', 'Clear output shape', 'No sensitive examples'],
    weakExample: 'Write this better for my manager.',
    strongExample: 'Context: branch update for managers. Objective: a 5-bullet summary. Resources: use only the note below. Expectations: no new facts; flag anything missing.',
    exampleWhy: 'The strong prompt uses the four CORE parts, so the model gets the work shape and cannot invent details.',
    transferMove: 'Use your card on one real low-risk task and edit the output before saving.',
    proofToSave: 'Your first CORE prompt card with placeholders, an output shape, and a review boundary.',
    reference: commonReference(
      'Apply the CORE parts to your own work',
      'Human review and source awareness belong inside the instruction, not added after failure',
      'You already know the CORE parts from the last module. This one is about making your first prompt for a task you actually own — context, objective, the approved source, and the expected output.',
      'Rewrite one vague request from your own work as a CORE prompt with a clear review rule.',
    ),
    build: {
      youWillHave: 'A saved CORE prompt for a task you do every week, ready to reuse with new inputs.',
      beforeYouStart: 'Pick one low-risk task you repeat weekly, like a status note or schedule update.',
      promptLabel: 'Weekly task assistant',
      prompt: `Context: I am a [your role] at a community bank. Every week I [describe the task].
Objective: [what the finished piece should do, in one sentence].
Resources: use only what I paste below. Do not add facts.
Expectations: [format, e.g. up to 4 bullets under 100 words]. Mark anything missing as [CHECK].

Input:
[paste this week's notes]`,
      highlights: ['Your task, your words', 'Only your inputs', 'Same shape every week', 'Gaps marked [CHECK]'],
      toolPaths: SAVE_AS_PROJECT,
      tests: [
        {
          label: 'Sample task',
          prompt: `Context: I am a branch operations lead. Every week I send managers a staffing update.
Objective: tell managers who is out and what coverage is set.
Resources: use only the notes below.
Expectations: up to 4 bullets, under 80 words. Mark gaps as [CHECK].

Input:
Mon Lee out. Tue-Wed Ortiz in training. Float teller covers Mon. Wed coverage not set.`,
          reply: `- Monday: Lee is out; the float teller covers.
- Tuesday and Wednesday: Ortiz is in training.
- Wednesday coverage: [CHECK] not set yet.`,
        },
      ],
      check: 'Every bullet traces to your input. You fill in anything marked [CHECK].',
      doneWhen: 'You have used it on this week\'s real task.',
      verifiedOn: BUILD_VERIFIED_ON,
      reviewBy: BUILD_REVIEW_BY,
    },
  },
  {
    number: 5,
    id: 'm5-add-context-constraints',
    title: 'Build Your Role Context',
    pillar: 'understanding',
    estimatedMinutes: 10,
    keyOutput: 'Role Context Block',
    mission: 'Give AI enough context to help without exposing what it should not see.',
    plainLanguageConcept: 'Context improves output quality. Constraints keep the answer inside the boundary of the work.',
    bankingGuardrail: 'Role context is fine; customer facts, confidential strategy, and examiner material are not.',
    guidanceSource: 'Interagency TPRM Guidance, NIST AI RMF',
    tryTask: 'Choose which context details belong in a safe reusable prompt and which must be removed.',
    buildTask: 'Save standing context about your role, readers and no-go list in your AI tool.',
    saveArtifact: 'Role Context Block',
    visualModel: ['Role', 'Audience', 'Tone', 'Do-not'],
    reviewChecklist: ['No customer examples', 'No confidential strategy', 'Do-not rules specific'],
    qualitySignals: ['Reusable', 'Short', 'Improves output without secrets'],
    weakExample: 'Use this complaint from a named customer as my style example.',
    strongExample: 'I work in branch operations. Use plain language for staff. Never include customer identifiers.',
    exampleWhy: 'The strong context helps the model adapt without leaking sensitive detail.',
    transferMove: 'Paste the context block above one approved prompt and compare the output quality.',
    proofToSave: 'Context block plus the details you intentionally excluded.',
    reference: commonReference(
      'Useful context without exposure',
      'Data classification and tool approval determine what context can enter an AI system',
      'Foundation learners need a safe version of personalization. A reusable context block should describe the work pattern, not disclose live customer or bank-confidential facts.',
      'Write three useful context lines and three lines that should never be pasted.',
    ),
    build: {
      youWillHave: 'Standing context about your role and readers, so answers fit your job without retyping it.',
      beforeYouStart: 'Think about who reads your work and what they should never see.',
      promptLabel: 'Role context',
      prompt: `About my work:
- I work in [department] at a community bank.
- My readers are usually [audience, e.g. branch staff, the board].
- Write in plain language and short sentences. No jargon.
- Never include customer names, account numbers or other customer details.
- Do not guess at policy. If an answer depends on our policy, say so.`,
      highlights: ['Your role', 'Your readers', 'Your tone', 'Your no-go list'],
      toolPaths: HOUSE_RULE_PATHS,
      tests: [
        {
          label: 'Same request, your voice',
          prompt: `Explain this to branch staff: the wire cutoff moves from 3 p.m. to 2 p.m. on Monday.`,
          reply: `Starting Monday, the wire cutoff is 2 p.m. instead of 3 p.m. Submit same-day wires before 2 p.m.`,
        },
      ],
      check: 'Answers should fit your readers and tone without you asking.',
      doneWhen: 'A new chat answers in your voice without you adding context.',
      verifiedOn: BUILD_VERIFIED_ON,
      reviewBy: BUILD_REVIEW_BY,
    },
  },
  {
    number: 6,
    id: 'm6-structured-output',
    title: 'Build a Report Explainer',
    pillar: 'understanding',
    estimatedMinutes: 10,
    keyOutput: 'Report Explainer',
    mission: 'Make AI output easier to review by controlling the shape of the answer.',
    plainLanguageConcept: 'Output format is a review control. Tables, bullets, and labeled sections make facts, gaps, and next actions easier to inspect.',
    bankingGuardrail: 'Ask for sources, assumptions, and review flags when the output includes facts or policy claims.',
    guidanceSource: 'NIST AI RMF, SR 26-2',
    tryTask: 'Convert one paragraph answer into a table with source, assumption, and action columns.',
    buildTask: 'Save the report explainer and run it on a summary table you share internally.',
    saveArtifact: 'Report Explainer',
    visualModel: ['Label', 'Limit', 'Source', 'Flag'],
    reviewChecklist: ['Format is reviewable', 'Source column present', 'Assumptions flagged'],
    qualitySignals: ['Skimmable', 'Easy to verify', 'Manager-ready'],
    weakExample: 'Give me a detailed answer.',
    strongExample: 'Return a table: claim, source, confidence, reviewer action. Mark unsourced claims.',
    exampleWhy: 'The strong prompt makes review visible and prevents paragraph drift.',
    transferMove: 'Use the format template on one task where you normally get wordy output.',
    proofToSave: 'Reviewable output format and one sample answer using it.',
    reference: commonReference(
      'Format is a control',
      'Documentation and traceability improve when outputs expose sources, assumptions, and review actions',
      'A structured answer is not just cleaner. It is easier for a human to audit, correct, and reuse in a banking workflow.',
      'Ask the lab for the same output as a paragraph and as a table, then compare review effort.',
    ),
    build: {
      youWillHave: 'A prompt that turns a table of figures into plain notes on what changed, laid out for a quick check.',
      beforeYouStart: 'Use a summary table you already share internally. No customer-level rows.',
      promptLabel: 'Report explainer',
      prompt: `Here is a table of [report name] for [this period] and [last period].
For each line, write one row in a table with the columns: Line, This period, Last period, Change, Note.
Use only the numbers in the table. Do not explain why a number changed unless the table says why; write [ASK OWNER] instead.
End with the three largest changes, one sentence each.

Table:
[paste the table]`,
      highlights: ['Table in, table out', 'Only your numbers', 'No guessed reasons', 'Top three changes'],
      toolPaths: SAVE_AS_PROJECT,
      tests: [
        {
          label: 'Sample table',
          prompt: `Line | Sept | Aug
New accounts | 142 | 118
Branch visits | 9,850 | 10,400
Online enrollments | 260 | 255`,
          reply: `Line | This period | Last period | Change | Note
New accounts | 142 | 118 | +24 | Up. [ASK OWNER]
Branch visits | 9,850 | 10,400 | -550 | Down. [ASK OWNER]
Online enrollments | 260 | 255 | +5 | About flat.

Largest changes: branch visits fell by 550. New accounts rose by 24. Online enrollments rose by 5.`,
        },
      ],
      check: 'Recompute two changes yourself. Every reason comes from the owner, not the AI.',
      doneWhen: 'You have used it on a real report before it went out.',
      verifiedOn: BUILD_VERIFIED_ON,
      reviewBy: BUILD_REVIEW_BY,
    },
  },
  {
    number: 7,
    id: 'm7-review-like-banker',
    title: 'Build a Draft Checker',
    pillar: 'understanding',
    estimatedMinutes: 10,
    keyOutput: 'Draft Checker',
    mission: 'Turn review from a vague instruction into a repeatable checklist.',
    plainLanguageConcept: 'Human review means checking facts, fit, tone, source, and decision impact before reuse.',
    bankingGuardrail: 'Customer-facing, credit, compliance, legal, payment, and control outputs need stronger review than internal drafting.',
    guidanceSource: 'CFPB adverse action guidance, SR 26-2, NIST AI RMF',
    tryTask: 'Apply a review checklist to a sample AI draft and mark what changes before use.',
    buildTask: 'Save the draft checker and run it on a real AI draft and its source.',
    saveArtifact: 'Draft Checker',
    visualModel: ['Fact', 'Fit', 'Tone', 'Impact'],
    reviewChecklist: ['Facts verified', 'Audience fit checked', 'Impact level named'],
    qualitySignals: ['Clear pass/fail checks', 'Escalation triggers visible', 'Usable under deadline'],
    weakExample: 'Looks good to me.',
    strongExample: 'Facts match source, tone fits staff audience, no customer impact, ready after manager review.',
    exampleWhy: 'The strong review names evidence, audience, impact, and reviewer.',
    transferMove: 'Use the checklist before copying any AI output into work product.',
    proofToSave: 'Role-specific review checklist with escalation triggers.',
    reference: commonReference(
      'Review is the professional standard',
      'AI outputs remain human-owned when used in banking work',
      'A review checklist prevents the learner from treating AI review as a vibe check. It makes judgment explicit and repeatable.',
      'Take one AI output and write what you checked, what you changed, and what you rejected.',
    ),
    build: {
      youWillHave: 'A prompt that checks any AI draft against its source and lists every claim the source does not support.',
      beforeYouStart: 'Have an AI draft and the source it came from. No customer details in either.',
      promptLabel: 'Draft checker',
      prompt: `Compare the draft to the source below.
List every statement in the draft as a row with the columns: Statement, In source (yes / no / partly), Where.
Mark anything the source does not say as UNSUPPORTED. Do not judge whether it is true, only whether the source says it.
End with the number of unsupported statements.

Source:
[paste the source]

Draft:
[paste the draft]`,
      highlights: ['Every claim listed', 'Source or no source', 'Unsupported flagged', 'A count at the end'],
      toolPaths: SAVE_AS_PROJECT,
      tests: [
        {
          label: 'Sample check',
          prompt: `Source: Branch hours change to 9 a.m. to 5 p.m. on Nov 1.

Draft: Starting Nov 1, branches open 9 to 5 and add Saturday hours.`,
          reply: `Statement | In source | Where
Branches open 9 to 5 from Nov 1 | yes | sentence 1
Branches add Saturday hours | no | UNSUPPORTED

Unsupported statements: 1.`,
        },
      ],
      check: 'Remove or source every UNSUPPORTED line before the draft is used.',
      doneWhen: 'You have run it on a real AI draft and fixed what it found.',
      limits: 'It checks against the source you give it. It cannot tell you whether the source is right.',
      verifiedOn: BUILD_VERIFIED_ON,
      reviewBy: BUILD_REVIEW_BY,
    },
  },
  {
    number: 8,
    id: 'm8-source-material-safely',
    title: 'Build a Policy Question Desk',
    pillar: 'understanding',
    estimatedMinutes: 10,
    keyOutput: 'Policy Question Desk',
    mission: 'Use documents without letting AI invent what the source does not say.',
    plainLanguageConcept: 'Source-grounded work tells AI to answer only from supplied material and flag gaps instead of guessing.',
    bankingGuardrail: 'Only use documents approved for the selected tool, and verify source references before acting.',
    guidanceSource: 'Interagency TPRM Guidance, NIST GenAI profile',
    tryTask: 'Ask AI to summarize only from a sample policy excerpt and mark anything not found in source.',
    buildTask: 'Set up a workspace over one approved procedure that cites sections or says not found.',
    saveArtifact: 'Policy Question Desk',
    visualModel: ['Approved source', 'Limited question', 'Citation', 'Gap flag'],
    reviewChecklist: ['Document approved', 'Claims cite source', 'Gaps marked'],
    qualitySignals: ['No outside claims', 'Source references visible', 'Fast to verify'],
    weakExample: 'Summarize this and fill in any missing best practices.',
    strongExample: 'Use only the source below. Cite section names. If not found, write "not found in source."',
    exampleWhy: 'The strong prompt prevents unsupported fill-in and makes verification part of the output.',
    transferMove: 'Use the prompt on one approved non-sensitive source document.',
    proofToSave: 'Prompt plus verified summary and one source-check note.',
    reference: commonReference(
      'Ground the model in the source',
      'Third-party/tool approval and source verification matter when documents enter AI workflows',
      'File and document workflows feel powerful because they save reading time. The control is source grounding: the learner must know what went in and what the output actually cites.',
      'Find one claim in an AI summary and verify it against the supplied source.',
    ),
    build: {
      youWillHave: 'A workspace over your own procedures that answers staff questions with the section cited, or says it is not there.',
      beforeYouStart: 'Choose one procedure your institution allows in your AI tool. No customer data.',
      promptLabel: 'Policy desk instructions',
      prompt: `Answer questions using only the documents in this workspace.
For every answer, name the document and section it came from.
If the answer is not in the documents, reply: "Not found in our procedures. Ask [owner]." Do not answer from general knowledge.
Keep answers under 80 words.`,
      highlights: ['Your documents only', 'Section named every time', 'Says "not found"', 'Short answers'],
      toolPaths: [
        { tool: 'ChatGPT', where: 'Create a project, add the procedure to its files, and paste this into the instructions.' },
        { tool: 'Claude', where: 'Create a project, add the procedure to its knowledge, and paste this into the instructions.' },
        { tool: 'Gemini', where: 'Create a Gem, add the procedure as a file, and paste this into its instructions.' },
        { tool: 'Copilot', where: 'Attach the procedure in a chat and paste the instructions first.' },
      ],
      tests: [
        {
          label: 'Not in the procedures',
          prompt: `What is our policy on notarizing documents for non-customers?`,
          reply: `Not found in our procedures. Ask [owner].`,
        },
      ],
      check: 'Open the cited section for two answers and confirm it says what the answer says.',
      doneWhen: 'It cites the right section for a real question and says "not found" when it should.',
      verifiedOn: BUILD_VERIFIED_ON,
      reviewBy: BUILD_REVIEW_BY,
    },
  },
  {
    number: 9,
    id: 'm9-reusable-prompt-template',
    title: 'Build a Reply Template',
    pillar: 'understanding',
    estimatedMinutes: 10,
    keyOutput: 'Reply Template',
    mission: 'Move from a one-off prompt to a reusable work asset.',
    plainLanguageConcept: 'A prompt template is a named reusable asset. It keeps placeholders, safety notes, examples, and version notes together.',
    bankingGuardrail: 'Templates should include what not to paste and when to escalate.',
    guidanceSource: 'NIST AI RMF, Treasury AI financial services report',
    tryTask: 'Convert a one-time prompt into a template with placeholders and a safety note.',
    buildTask: 'Save a named, versioned reply template and have a colleague use it once.',
    saveArtifact: 'Reply Template',
    visualModel: ['Name', 'Use case', 'Prompt', 'Safety note'],
    reviewChecklist: ['Placeholders used', 'Do-not-paste rule included', 'Version note added'],
    qualitySignals: ['Searchable name', 'Reusable by a peer', 'Boundary travels with prompt'],
    weakExample: 'Make this better.',
    strongExample: 'Internal staff update rewrite v1: paste redacted notes, produce 5 bullets, no new facts, manager review.',
    exampleWhy: 'The strong prompt carries use, format, safety, and version context forward.',
    transferMove: 'Save one prompt you will actually reuse and add a version note after testing.',
    proofToSave: 'Named prompt template with placeholders, safety note, and version note.',
    reference: commonReference(
      'Templates compound learning',
      'Reusable AI assets need boundaries so repeated use does not create repeated risk',
      'Prompt templates are the first bridge from AI experimentation to durable capability. The safety note is part of the template, not a separate memory task.',
      'Take yesterday\'s best prompt and rewrite it so a peer could use it safely.',
    ),
    build: {
      youWillHave: 'A named template for member replies that keeps your tone and uses only the facts you give it.',
      beforeYouStart: 'Pick a reply your team writes often, like a fee question or an hours change.',
      promptLabel: 'Reply template',
      prompt: `Name: Reply template, [topic], v1

Write a reply to a member about [topic] in our institution's voice: warm, plain, no jargon, under 120 words.
Use only these facts: [facts].
Address the member as [MEMBER NAME]. Never include account numbers.
End with: "Questions? Call us at [phone] or stop by any branch."
A staff member reviews it before sending.`,
      highlights: ['Named and versioned', 'Your tone', 'Only facts you supply', 'Staff review'],
      toolPaths: SAVE_AS_PROJECT,
      tests: [
        {
          label: 'Fee question',
          prompt: `Topic: the monthly maintenance fee. Facts: it is waived with a $500 minimum balance or one direct deposit a month.`,
          reply: `Hi [MEMBER NAME],

Thanks for asking about the monthly maintenance fee. You can avoid it two ways: keep at least $500 in the account, or have one direct deposit each month.

Questions? Call us at [phone] or stop by any branch.`,
        },
      ],
      check: 'Every fact in the reply is one you supplied. The name and version sit on the first line.',
      doneWhen: 'A colleague has used your template for a real reply.',
      verifiedOn: BUILD_VERIFIED_ON,
      reviewBy: BUILD_REVIEW_BY,
    },
  },
  {
    number: 10,
    id: 'm10-role-based-prompt',
    title: 'Build Your Role Assistant',
    pillar: 'creation',
    estimatedMinutes: 10,
    keyOutput: 'Role Assistant',
    mission: 'Make one prompt fit the work, audience, and review path of a specific banking role.',
    plainLanguageConcept: 'A role prompt adds job context: audience, source, decision impact, reviewer, and language that fits the department.',
    bankingGuardrail: 'Role context cannot include confidential customer, employee, examination, or strategy details.',
    guidanceSource: 'NIST AI RMF, Interagency TPRM Guidance',
    tryTask: 'Adapt the same prompt for retail, lending, operations, or compliance.',
    buildTask: 'Set up an assistant with your role, three tasks and review rules, then use it once.',
    saveArtifact: 'Role Assistant',
    visualModel: ['Context (role)', 'Objective', 'Resources', 'Expectations (reviewer)'],
    reviewChecklist: ['Role is specific', 'Source is allowed', 'Reviewer named'],
    qualitySignals: ['Fits one job', 'Not generic', 'Escalation visible'],
    weakExample: 'Act like a banker and help me.',
    strongExample: 'Act as an operations analyst preparing a staff handoff. Use only approved notes. Output a checklist for manager review.',
    exampleWhy: 'The strong prompt names the role, source boundary, output, and reviewer.',
    transferMove: 'Use the role card on one task in your actual job and refine it afterward.',
    proofToSave: 'Role prompt card with reviewer, source boundary, and first-use note.',
    reference: commonReference(
      'Role context makes prompts practical',
      'Different banking functions carry different data, customer-impact, and control obligations',
      'Foundation learners should not learn "generic AI." They should learn how the same primitive adapts to their role without losing safety boundaries.',
      'Write one role-specific constraint that would not appear in a generic prompt.',
    ),
    build: {
      youWillHave: 'An assistant set up for your job, with your tasks and review rules, one click away.',
      beforeYouStart: 'List the three tasks you would hand an assistant first.',
      promptLabel: 'Role assistant',
      prompt: `You are an assistant for a [role] at a community bank.
I use you for: [task 1], [task 2], [task 3].
For every request:
1. If the task is unclear, ask one question before you start.
2. Use only the material I provide. Mark gaps as [CHECK].
3. Keep customer details out. If I paste any, stop and tell me.
4. End with one line naming who should review it: [reviewer].`,
      highlights: ['Your three tasks', 'Asks before guessing', 'Keeps customer data out', 'Names the reviewer'],
      toolPaths: [
        { tool: 'ChatGPT', where: 'Create a project or a custom GPT and paste this into its instructions.' },
        { tool: 'Claude', where: 'Create a project and paste this into the project instructions.' },
        { tool: 'Gemini', where: 'Create a Gem and paste this into its instructions.' },
        { tool: 'Copilot', where: 'If your bank allows Copilot agents, create one. Otherwise paste this at the start of a chat.' },
      ],
      tests: [
        {
          label: 'A vague request',
          prompt: `Write the thing for Friday.`,
          reply: `Which of your three tasks is this for, and who will read it?`,
        },
      ],
      check: 'It should ask, not guess, when a request is vague.',
      doneWhen: 'You have used it for one of your three tasks this week.',
      verifiedOn: BUILD_VERIFIED_ON,
      reviewBy: BUILD_REVIEW_BY,
    },
  },
  {
    number: 11,
    id: 'm11-choose-ai-use-case',
    title: 'Build a Use-Case Screener',
    pillar: 'creation',
    estimatedMinutes: 10,
    keyOutput: 'Use-Case Screener',
    mission: 'Pick AI work that is useful, safe, and specific enough to manage.',
    plainLanguageConcept: 'A good use case has a real task, allowed input, clear AI role, human reviewer, and measurable win.',
    bankingGuardrail: 'Do not choose use cases where AI decides customer outcomes, credit actions, legal positions, or compliance determinations.',
    guidanceSource: 'CFPB adverse action guidance, SR 26-2, NIST AI RMF',
    tryTask: 'Score three sample use cases as good fit, revise, or block.',
    buildTask: 'Save the screener and rate one real AI idea from your team.',
    saveArtifact: 'Use-Case Screener',
    visualModel: ['Task', 'Input', 'AI role', 'Human review'],
    reviewChecklist: ['Input allowed', 'AI role bounded', 'Win measurable'],
    qualitySignals: ['Concrete task', 'Risk owner visible', 'Blocked cases named'],
    weakExample: 'Use AI to improve lending.',
    strongExample: 'Use AI to draft a sanitized meeting-prep checklist from approved notes; lender verifies facts before use.',
    exampleWhy: 'The strong use case is specific enough to govern and measure.',
    transferMove: 'Take one candidate use case to your manager or compliance partner for feedback.',
    proofToSave: 'Use-case card with input, AI role, reviewer, failure mode, and metric.',
    reference: commonReference(
      'Specific beats ambitious',
      'High-impact AI use cases require stronger controls, documentation, and oversight',
      'A foundation learner does not need a moonshot use case. They need one defensible use case that shows the institution how safe AI practice looks in daily work.',
      'Rewrite a vague AI idea into a one-task use case with a named reviewer.',
    ),
    build: {
      youWillHave: 'A prompt that rates any AI idea as go, revise or block, with the reason and the reviewer.',
      beforeYouStart: 'Bring one AI idea from your team, described without customer details.',
      promptLabel: 'Use-case screener',
      prompt: `Rate this AI use case for a community bank as GO, REVISE or BLOCK.
- BLOCK if AI would decide credit, a customer outcome, a legal position or a compliance determination.
- REVISE if it needs customer data, has no named reviewer, or has no way to measure the win.
- GO if a person reviews the output before it is used and no customer data goes in.
Reply with: the rating, the rule that decided it, what would change the rating, and who should review it.

Use case:
[describe the idea]`,
      highlights: ['Go, revise or block', 'The rule behind it', 'What would change it', 'Who reviews'],
      toolPaths: SAVE_AS_PROJECT,
      tests: [
        {
          label: 'Sample idea',
          prompt: `Use AI to approve small-business loan applications.`,
          reply: `Rating: BLOCK.
Rule: AI would decide credit.
What would change it: use AI only to summarize the application for the lender, who decides.
Reviewer: credit officer.`,
        },
      ],
      check: 'Read the rule it cites. The screener sorts; you make the call.',
      doneWhen: 'You have screened one real idea from your team.',
      verifiedOn: BUILD_VERIFIED_ON,
      reviewBy: BUILD_REVIEW_BY,
    },
  },
  {
    number: 12,
    id: 'm12-data-safety-boundaries',
    title: 'Build a Data Traffic Light',
    pillar: 'creation',
    estimatedMinutes: 10,
    keyOutput: 'Data Traffic Light',
    mission: 'Decide what can enter AI before the prompt is written.',
    plainLanguageConcept: 'Data safety is a gate. Classify the input, tool approval, and decision impact before using AI.',
    bankingGuardrail: 'Red-zone data and decisions stay out of unapproved tools. Escalate rather than sanitize when the decision impact is high.',
    guidanceSource: 'Interagency TPRM Guidance, NCUA AI resources, NIST GenAI profile',
    tryTask: 'Classify sample prompts as safe, needs approved tool, or blocked.',
    buildTask: 'Save the traffic-light prompt and check one kind of data before you use it.',
    saveArtifact: 'Data Traffic Light',
    visualModel: ['Data class', 'Tool approval', 'Decision impact', 'Escalate'],
    reviewChecklist: ['Data classified', 'Tool approved', 'Escalation rule included'],
    qualitySignals: ['Fast yes/no path', 'Names red-zone examples', 'Reviewer can inspect'],
    weakExample: 'It is only a draft, so I can paste the full scenario.',
    strongExample: 'This contains NPI and affects a decision. Use an approved controlled workflow or do not use AI.',
    exampleWhy: 'The strong call treats data and decision impact as gates before prompting.',
    transferMove: 'Run the checklist before saving any reusable prompt or skill.',
    proofToSave: 'Safe-use checklist with green, yellow, red, and escalation examples.',
    reference: commonReference(
      'Safety happens before prompting',
      'Data handling, third-party use, and customer-impact decisions must be controlled before AI use',
      'Sanitization is useful, but it is not magic. Some work should not enter a tool at all unless the institution has approved the workflow and data class.',
      'Classify three inputs from your job as green, yellow, or red for AI use.',
    ),
    build: {
      youWillHave: 'A prompt that tells you green, yellow or red for a kind of data before you paste anything.',
      beforeYouStart: 'You describe the data, never paste it. "A complaint email with a name" is a description.',
      promptLabel: 'Data traffic light',
      prompt: `I will describe a kind of information, not paste it. Classify it for use in this AI tool.
GREEN: public or internal material with no customer details. OK to use.
YELLOW: internal material that needs names, numbers or identifiers removed first. Tell me what to remove.
RED: customer or member data, credentials, exam material, or anything that affects a customer decision. Do not use it here. Tell me who to ask.
Reply with the color, a one-line reason and the next step.

Description:
[describe the information]`,
      highlights: ['Describe, never paste', 'Green, yellow, red', 'What to remove', 'Who to ask'],
      toolPaths: SAVE_AS_PROJECT,
      tests: [
        {
          label: 'Sample',
          prompt: `A member complaint email that includes their name and account number.`,
          reply: `RED.
Reason: it contains a member name and an account number.
Next step: do not paste it. Rewrite the complaint without identifiers, then check again.`,
        },
      ],
      check: 'If you are unsure, treat it as red and ask.',
      doneWhen: 'You have checked one real kind of data before using it.',
      limits: 'It follows your description. Your institution\'s data rules still decide.',
      verifiedOn: BUILD_VERIFIED_ON,
      reviewBy: BUILD_REVIEW_BY,
    },
  },
  {
    number: 13,
    id: 'm13-simple-reusable-skill',
    title: 'Build a Procedure Simplifier Skill',
    pillar: 'creation',
    estimatedMinutes: 10,
    keyOutput: 'Procedure Simplifier Skill',
    mission: 'Turn a prompt into a repeatable action with input, steps, review, and output.',
    plainLanguageConcept: 'A skill is a reusable work pattern, not just a prompt. It defines input, AI action, human check, output, and blocked use.',
    bankingGuardrail: 'A skill should include allowed inputs, blocked inputs, and human review before reuse.',
    guidanceSource: 'NIST AI RMF, Treasury AI financial services report',
    tryTask: 'Label the parts of a sample skill: input, AI action, review, output, reuse note.',
    buildTask: 'Save the simplifier skill and run it on one hard-to-follow internal procedure.',
    saveArtifact: 'Procedure Simplifier Skill',
    visualModel: ['Input', 'AI action', 'Human check', 'Reusable output'],
    reviewChecklist: ['Allowed inputs named', 'Human check named', 'Output format stable'],
    qualitySignals: ['Repeatable', 'Teachable to peer', 'Safety boundary embedded'],
    weakExample: 'Skill: answer questions for my team.',
    strongExample: 'Skill: convert redacted meeting notes into a staff action list; manager verifies owners and deadlines.',
    exampleWhy: 'The strong skill is bounded, repeatable, and reviewable.',
    transferMove: 'Use the skill template once, then revise the review step based on what failed.',
    proofToSave: 'Skill template with input, action, review, output, and blocked-input notes.',
    reference: commonReference(
      'Skills are reusable work patterns',
      'Reusable AI workflows need controls that travel with the asset',
      'A foundation-level skill is not an agent. It is a structured repeatable prompt pattern with a human check and a saved output.',
      'Turn one prompt from your library into a skill by adding input, review, and output rules.',
    ),
    build: {
      youWillHave: 'A reusable skill that turns any procedure into a one-page frontline guide with escalation points.',
      beforeYouStart: 'Have one internal procedure frontline staff find hard to follow.',
      promptLabel: 'Procedure simplifier skill',
      prompt: `Skill: Procedure simplifier
Input: one internal procedure. No customer data.
Steps:
1. Find the three situations staff meet most often.
2. For each, write one plain instruction under 25 words.
3. List exactly when to escalate, and to whom, using only the procedure.
Output: a one-page guide titled "[Procedure], quick guide".
Review: the procedure owner checks it before it is shared.
Do not use for: legal, credit or compliance decisions.`,
      highlights: ['Input rules', 'Fixed steps', 'Same output every time', 'Owner review'],
      toolPaths: SAVE_AS_PROJECT,
      tests: [
        {
          label: 'Sample procedure',
          prompt: `Procedure: Lost debit card. Verify identity with two questions. Block the card in the core system. Order a replacement; it arrives in 7 to 10 days. If fraud is reported, transfer to the fraud team.`,
          reply: `Lost debit card, quick guide
1. Verify identity with two questions.
2. Block the card in the core system.
3. Order a replacement. Tell the member it arrives in 7 to 10 days.
Escalate: if the member reports fraud, transfer to the fraud team.
Review: procedure owner.`,
        },
      ],
      check: 'Every instruction must appear in the procedure. The owner signs off before sharing.',
      doneWhen: 'You have run it on one real procedure and the owner has seen the result.',
      verifiedOn: BUILD_VERIFIED_ON,
      reviewBy: BUILD_REVIEW_BY,
    },
  },
  {
    number: 14,
    id: 'm14-map-workflow-before-automation',
    title: 'Build a Workflow Mapper',
    pillar: 'creation',
    estimatedMinutes: 10,
    keyOutput: 'Workflow Mapper',
    mission: 'See the work before deciding where AI belongs.',
    plainLanguageConcept: 'Workflow maps show trigger, steps, data, decision points, reviewer, exception path, and saved evidence.',
    bankingGuardrail: 'Do not automate a workflow you cannot explain step by step, especially when customers or controls are affected.',
    guidanceSource: 'SR 26-2, NIST AI RMF',
    tryTask: 'Mark the AI-supported steps and human checkpoints on a sample workflow.',
    buildTask: 'Save the workflow mapper and map one recurring process you know well.',
    saveArtifact: 'Workflow Mapper',
    visualModel: ['Trigger', 'Steps', 'Checkpoint', 'Evidence'],
    reviewChecklist: ['Decision points named', 'Reviewer before impact', 'Exception path visible'],
    qualitySignals: ['No hidden steps', 'Human handoff clear', 'Evidence retained'],
    weakExample: 'Let AI handle the whole intake and response process.',
    strongExample: 'AI drafts intake summary. Staff verifies facts, selects next action, and archives reviewed output.',
    exampleWhy: 'The strong workflow places AI support before, not instead of, accountable human action.',
    transferMove: 'Map one real workflow and circle the first low-risk AI-supported step.',
    proofToSave: 'Workflow map with trigger, AI step, human checkpoint, escalation, and evidence.',
    reference: commonReference(
      'Map first, automate later',
      'Controls, validation, and monitoring depend on understanding the actual workflow',
      'Learners should understand agent-shaped thinking without being pushed to build agents. The foundation skill is mapping where autonomy would create risk.',
      'Write the seven steps of one manual workflow before proposing any AI support.',
    ),
    build: {
      youWillHave: 'A prompt that turns your description of a process into steps, marking where AI helps and where a person decides.',
      beforeYouStart: 'Pick one recurring process you know well. Describe it in your own words.',
      promptLabel: 'Workflow mapper',
      prompt: `Turn my description into a numbered workflow table with the columns: Step, Who, Input, AI could help (yes / no), Why, Human decision (yes / no).
Mark AI "yes" only for drafting, summarizing or organizing. Mark any step that affects a customer, a control or a decision as a human decision.
Do not add steps I did not describe. List anything missing under "Questions".

Process:
[describe it]`,
      highlights: ['Every step visible', 'Where AI helps', 'Where a person decides', 'Gaps as questions'],
      toolPaths: SAVE_AS_PROJECT,
      tests: [
        {
          label: 'Sample process',
          prompt: `New-account welcome: the banker opens the account, sends a welcome email, schedules a 30-day call, and logs the call.`,
          reply: `Step | Who | Input | AI? | Why | Human decision?
1 Open account | Banker | Application | no | Customer outcome | yes
2 Welcome email | Banker | Template | yes | Drafting | no
3 Schedule call | Banker | Calendar | no | | no
4 Log the call | Banker | Call notes | yes | Summarizing | no

Questions: who reviews the welcome email before it goes out?`,
        },
      ],
      check: 'Circle the first low-risk "AI could help" step. That is your next build.',
      doneWhen: 'You have mapped one real process and picked its first AI step.',
      verifiedOn: BUILD_VERIFIED_ON,
      reviewBy: BUILD_REVIEW_BY,
    },
  },
  {
    number: 15,
    id: 'm15-human-review-checkpoints',
    title: 'Build a Review Gate',
    pillar: 'application',
    estimatedMinutes: 10,
    keyOutput: 'Human Review Gate Card',
    mission: 'Decide where AI-assisted work must stop before it can move forward.',
    plainLanguageConcept: 'A review gate is a clear pause before AI-assisted work affects a customer, report, control, or decision.',
    bankingGuardrail: 'Human review only counts when the reviewer can approve, edit, block, or escalate before impact.',
    guidanceSource: 'NIST AI RMF, CFPB adverse action guidance, SR 26-2',
    tryTask: 'Choose the best review gate in three sample AI-supported workflows.',
    buildTask: 'Create a gate card that names the pause, reviewer authority, escalation trigger, and resume condition.',
    saveArtifact: 'Human Review Gate Card',
    visualModel: ['Pause', 'Check', 'Approve', 'Resume'],
    reviewChecklist: ['Gate happens before impact', 'Decision authority named', 'Resume condition clear'],
    qualitySignals: ['Prevents downstream harm', 'Clear enough for a peer to follow', 'Authority is named'],
    weakExample: 'Review a few AI outputs later to see if the tool is good.',
    strongExample: 'Pause before the draft reaches staff; the operations manager can approve, edit, block, or escalate it.',
    exampleWhy: 'The strong version names the pause, the reviewer, and the authority before impact.',
    transferMove: 'Add one review gate before trying an AI-supported workflow at work.',
    proofToSave: 'Human review gate with the pause point, reviewer authority, escalation trigger, and resume condition.',
    reference: commonReference(
      'Review before impact',
      'Human oversight must be meaningful when AI influences regulated or customer-impacting work',
      'A review checkpoint only matters if it occurs before the action and the reviewer can change the outcome. Otherwise it is monitoring, not control.',
      'Choose one workflow step and write the review gate a manager can enforce.',
    ),
    build: {
      youWillHave: 'A prompt that sets the review step for any AI-assisted task: who checks, what they check, when it stops.',
      beforeYouStart: 'Pick one tool you built in this course that others will see the output of.',
      promptLabel: 'Review gate builder',
      prompt: `For the AI-assisted task below, write a review gate:
- Where the work pauses before it reaches anyone else.
- Who reviews it, by role.
- What they check, five items at most.
- What makes them stop it or escalate it, and to whom.
- When it can go ahead.
Keep it to one short list a manager can enforce.

Task:
[describe the task and who sees the output]`,
      highlights: ['Where it pauses', 'Who checks', 'What they check', 'When it stops'],
      toolPaths: SAVE_AS_PROJECT,
      tests: [
        {
          label: 'Sample task',
          prompt: `AI drafts the monthly staff newsletter from department notes.`,
          reply: `Pause: before it is sent to staff.
Reviewer: communications lead.
Check: facts match the department notes; no customer details; no policy promises; dates; tone.
Stop or escalate: anything about pay, policy or customers goes to HR or compliance.
Go ahead: after the reviewer approves in writing.`,
        },
      ],
      check: 'The pause has to come before the work reaches anyone else.',
      doneWhen: 'One of your tools has a review gate your manager has seen.',
      verifiedOn: BUILD_VERIFIED_ON,
      reviewBy: BUILD_REVIEW_BY,
    },
  },
  {
    number: 16,
    id: 'm16-document-evidence-decisions',
    title: 'Keep the Proof',
    pillar: 'application',
    estimatedMinutes: 10,
    keyOutput: 'AI Evidence Note',
    mission: 'Make AI-assisted work easy for a manager to review.',
    plainLanguageConcept: 'An evidence note is a short receipt: what you asked, what source you used, what AI drafted, what you changed, and when it can be reused.',
    bankingGuardrail: 'When AI supports reviewed work, keep enough proof for a manager, auditor, or compliance partner to understand what changed.',
    guidanceSource: 'SR 26-2, NIST AI RMF, Treasury AI financial services report',
    tryTask: 'Match prompt, source, draft, edit, and owner to the reviewer questions they answer.',
    buildTask: 'Write a five-line evidence note for one AI-assisted work product.',
    saveArtifact: 'AI Evidence Note',
    visualModel: ['Ask', 'Source', 'Draft', 'Edit', 'Reuse'],
    reviewChecklist: ['Source named', 'Human change explained', 'Reuse boundary included'],
    qualitySignals: ['Readable in under one minute', 'Shows banker judgment', 'Manager-ready'],
    weakExample: 'I used AI, checked it, and made edits.',
    strongExample: 'Prompt used; source checked; AI draft corrected; unsupported claim removed; final owner and reuse boundary named.',
    exampleWhy: 'The strong note gives a reviewer the proof chain without requiring the whole AI chat transcript.',
    transferMove: 'Attach this note to the next AI-assisted draft you plan to reuse or show a manager.',
    proofToSave: 'Five-line note with ask, source, AI draft, human change, owner, and reuse boundary.',
    reference: commonReference(
      'Evidence makes judgment visible',
      'Documentation supports oversight, review, validation, and accountability',
      'Learners do not need a complex audit file. They need a compact evidence note that proves the human did the professional review.',
      'Write a five-line evidence note for one AI-assisted output.',
    ),
    build: {
      youWillHave: 'A prompt that writes a five-line evidence note for any AI-assisted work in under a minute.',
      beforeYouStart: 'Pick one piece of AI-assisted work you plan to reuse or show a manager.',
      promptLabel: 'Evidence note maker',
      prompt: `Write a five-line evidence note from what I tell you:
1. Ask: what I asked the AI to do.
2. Source: what material it used.
3. Draft: what the AI produced, in one line.
4. Changes: what I corrected or removed.
5. Owner and reuse: who owns the final version and when it can be reused.
Use only what I tell you. Write [MISSING] on any line I did not cover.

What happened:
[describe your prompt, source and edits]`,
      highlights: ['Five lines', 'Ask, source, draft', 'What you changed', 'Owner and reuse'],
      toolPaths: SAVE_AS_PROJECT,
      tests: [
        {
          label: 'Sample note',
          prompt: `Used the message rewriter on the vault-count note. Source was the ops memo. Removed a deadline it made up. I own it.`,
          reply: `1. Ask: rewrite the vault-count note for staff.
2. Source: the operations memo.
3. Draft: a short staff message with the action first.
4. Changes: removed a deadline the memo did not state.
5. Owner and reuse: owned by me; reuse rule [MISSING].`,
        },
      ],
      check: 'Fill in every [MISSING] line before you file the note.',
      doneWhen: 'A real piece of AI-assisted work has its note attached.',
      verifiedOn: BUILD_VERIFIED_ON,
      reviewBy: BUILD_REVIEW_BY,
    },
  },
  {
    number: 17,
    id: 'm17-package-reusable-workflow',
    title: 'Build a Handoff Kit',
    pillar: 'application',
    estimatedMinutes: 10,
    keyOutput: 'Reusable Workflow Kit',
    mission: 'Bundle one tested prompt or skill into a peer-ready kit.',
    plainLanguageConcept: 'A workflow kit is a reusable operating pattern: job, prompt or skill, allowed inputs, blocked uses, review gate, evidence, and peer test.',
    bankingGuardrail: 'Do not treat a workflow kit as team-ready until inputs, blocked uses, reviewer, escalation path, evidence, and peer test are explicit.',
    guidanceSource: 'Interagency TPRM Guidance, SR 26-2, NIST AI RMF',
    tryTask: 'Inspect a sample kit and mark what is missing before a peer could run it.',
    buildTask: 'Package one tested prompt or skill with allowed inputs, review gate, evidence note, and peer test.',
    saveArtifact: 'Reusable Workflow Kit',
    visualModel: ['Job', 'Prompt/skill', 'Boundary', 'Peer test'],
    reviewChecklist: ['Inputs bounded', 'Blocked uses named', 'Peer test included'],
    qualitySignals: ['Peer can run it safely', 'Manager can review it quickly', 'Boundary travels with the asset'],
    weakExample: 'Here is my prompt. Anyone can use it.',
    strongExample: 'Here is the job, allowed inputs, blocked uses, prompt or skill, review gate, evidence note, and peer test.',
    exampleWhy: 'The strong kit is reusable because the safety boundary and test plan travel with the asset.',
    transferMove: 'Ask one peer or manager to test the kit before treating it as stable.',
    proofToSave: 'Workflow kit with the job, reusable asset, allowed inputs, blocked uses, review gate, evidence, and peer test.',
    reference: commonReference(
      'Reusable means inspectable',
      'Institutional reuse requires clear ownership, boundaries, and evidence',
      'The course should end with assets that feel like real work product. A workflow kit is useful beyond the course because it can be reviewed, revised, and reused.',
      'Ask whether a peer could run your package safely without extra explanation.',
    ),
    build: {
      youWillHave: 'A one-page kit for one of your tools that a colleague can run safely without asking you.',
      beforeYouStart: 'Pick the tool from this course you use most.',
      promptLabel: 'Handoff kit',
      prompt: `Turn my tool into a one-page handoff kit with these headings:
Job it does / Prompt or setup (word for word) / What to paste in / Never paste / Review step / How to test it / Owner.
Use only what I give you. Mark gaps as [CHECK].

My tool:
[paste the prompt and describe how you use it]`,
      highlights: ['The job', 'The exact prompt', 'The never-paste list', 'How to test it'],
      toolPaths: SAVE_AS_PROJECT,
      tests: [
        {
          label: 'Sample kit',
          prompt: `My meeting actions assistant. I run it after every ops huddle. My manager checks the list before I send it.`,
          reply: `Job: turns ops huddle notes into an action list.
Prompt: [paste word for word]
Paste in: meeting notes with staff names only.
Never paste: customer names or account details.
Review step: manager checks the list before it is sent.
How to test it: run it on last week's notes; every row needs a source line.
Owner: [CHECK]`,
        },
      ],
      check: 'Give it to a colleague. If they have to ask you anything, add the answer to the kit.',
      doneWhen: 'A colleague has run your tool from the kit alone.',
      verifiedOn: BUILD_VERIFIED_ON,
      reviewBy: BUILD_REVIEW_BY,
    },
  },
  {
    number: 18,
    id: 'm18-foundation-packet-review',
    title: 'Write Your Packet Summary',
    pillar: 'application',
    estimatedMinutes: 12,
    keyOutput: 'Foundation Packet Summary',
    mission: 'Turn the course artifacts into a manager-ready packet of safe AI practice.',
    plainLanguageConcept: 'The packet proves the learner can use AI safely: prompts, skills, workflows, review notes, evidence, and boundaries.',
    bankingGuardrail: 'The final packet should show safe prompting, verification, limits, human review, and evidence without exposing sensitive data.',
    guidanceSource: 'NIST AI RMF, SR 26-2, Treasury AI financial services report',
    tryTask: 'Review your packet against the four standards: safe, useful, reusable, reviewable.',
    buildTask: 'Save the summary prompt, list your tools, and send the summary to your manager.',
    saveArtifact: 'Foundation Packet Summary',
    visualModel: ['Safe', 'Useful', 'Reusable', 'Reviewable'],
    reviewChecklist: ['Sensitive data removed', 'Review notes included', 'Next use named'],
    qualitySignals: ['Manager-ready', 'Shows judgment', 'Points to reusable assets'],
    weakExample: 'I completed the modules and learned prompts.',
    strongExample: 'I built reusable AI assets, documented review, named boundaries, and selected where I will use them next.',
    exampleWhy: 'The strong summary proves transfer to real work instead of course completion only.',
    transferMove: 'Use the packet summary in a manager conversation about safe AI use in your role.',
    proofToSave: 'Foundation Packet Summary with strongest artifacts, safety boundary, and next-use plan.',
    reference: commonReference(
      'The packet is the product',
      'Training value increases when the learner leaves with evidence of controlled, reusable AI practice',
      'The final packet should feel like what the learner bought: not a certificate alone, but a set of working assets they can reuse and discuss with a manager.',
      'Select the three strongest artifacts in your packet and write the sentence that explains why each matters.',
    ),
    build: {
      youWillHave: 'A one-page summary of the tools you built, ready for a conversation with your manager.',
      beforeYouStart: 'List the tools from this course you actually use.',
      promptLabel: 'Packet summary',
      prompt: `Write a one-page summary for my manager of the AI tools I built in this course.
For each tool: its name, the job it does, how often I use it, and its review step.
Then name the one tool I would roll out to the team first, and why.
Use only what I list. Plain language, under 250 words.

My tools:
[list each tool and how you use it]`,
      highlights: ['Every tool, one line', 'How often you use it', 'Its review step', 'What to roll out next'],
      toolPaths: SAVE_AS_PROJECT,
      tests: [
        {
          label: 'Sample summary',
          prompt: `House rules: every chat. Message rewriter: 3 times a week, I check facts. Meeting actions: after each huddle, manager checks.`,
          reply: `AI tools I built in AiBI-Foundation

House rules: set in my AI tool; apply to every chat. Review: built in.
Message rewriter: about three times a week for staff messages. Review: I check facts before sending.
Meeting actions assistant: after each ops huddle. Review: my manager checks the list.

Roll out first: the meeting actions assistant. The source-line check makes it quick for a manager to review.`,
        },
      ],
      check: 'Every tool listed is one you actually use.',
      doneWhen: 'You have sent the summary to your manager.',
      verifiedOn: BUILD_VERIFIED_ON,
      reviewBy: BUILD_REVIEW_BY,
    },
  },
] as const;

export const MICRO_MODULES_BY_NUMBER = new Map(
  FOUNDATION_MICRO_MODULES.map((module) => [module.number, module]),
);

export function buildMicroModule(module: FoundationMicroModule) {
  return {
    number: module.number,
    id: module.id,
    title: module.title,
    pillar: module.pillar,
    estimatedMinutes: module.estimatedMinutes,
    keyOutput: module.keyOutput,
    activities: [buildActivity(module)],
  } as const;
}

export function buildMicroSections(module: FoundationMicroModule): readonly Section[] {
  return module.reference.map((section, index) => ({
    id: `m${module.number}-micro-ref-${index + 1}`,
    title: section.title,
    content: section.content,
    tryThis: section.tryThis,
  }));
}
