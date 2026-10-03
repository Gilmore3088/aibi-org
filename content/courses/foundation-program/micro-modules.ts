import type { Activity, Pillar, Section } from './types';

export interface FoundationReferenceSection {
  readonly title: string;
  readonly content: string;
  readonly tryThis: string;
}

/**
 * A build: the working tool a module leaves the learner holding. The job and
 * the prompt are durable; anything that names a tool's menus or features goes
 * in `toolNote` and is re-checked by `reviewBy` (enforced in tests).
 */
export interface FoundationBuildStep {
  readonly title: string;
  readonly body: string;
}

export interface FoundationBuildTest {
  readonly prompt: string;
  readonly expect: string;
}

export interface FoundationBuild {
  /** One sentence: what works at the end of the module. */
  readonly youWillHave: string;
  readonly beforeYouStart: string;
  readonly promptLabel: string;
  /** The exact text the learner copies. */
  readonly prompt: string;
  readonly steps: readonly FoundationBuildStep[];
  /** Optional test prompts that prove the build works. */
  readonly tests?: readonly FoundationBuildTest[];
  readonly doneWhen: string;
  /** What the build does not do. Shown plainly, never as fine print. */
  readonly limits?: string;
  /** Where each tool keeps the build. Tool-specific, so it is dated. */
  readonly toolNote: string;
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

const SAVE_IT_NOTE =
  'ChatGPT and Claude keep reusable instructions in a Project. Gemini keeps them in a Gem. In Microsoft 365 Copilot, save it as a prompt or keep it in a note you can paste from. If your tool has none of these, a note on your desktop works.';
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
      youWillHave: 'Your AI tool, set to warn you about customer data, mark every answer as a draft, and leave decisions to you.',
      beforeYouStart: 'Open the AI tool your institution approves. If you are not sure which one that is, ask your manager first.',
      promptLabel: 'House rules',
      prompt: `Follow these rules in every conversation with me.

1. Before you answer, check my message for customer or member information: names, account or card numbers, Social Security numbers, dates of birth, addresses, phone numbers, or loan details. If you find any, do not answer. List what you found and ask me to replace it with a placeholder such as [CUSTOMER] or [ACCOUNT].
2. Treat what you write as a draft for me to check. End each answer with: "Draft. Check facts before use."
3. If I ask you to decide something about a customer, a loan, a complaint, or a compliance matter, do not decide. Tell me what a person would need to know to decide it.
4. If you are not sure something is true, say so. Do not guess.`,
      steps: [
        { title: 'Copy the house rules', body: 'Use the copy button. You will paste them once and they apply from then on.' },
        { title: 'Save them where your tool keeps standing instructions', body: 'Look in settings for custom instructions, personal preferences, or personalization. If your tool has none, keep the rules in a note and paste them at the start of each new chat.' },
        { title: 'Test them', body: 'Start a new chat and run the three test prompts below, one at a time. The names and numbers in them are made up.' },
      ],
      tests: [
        { prompt: 'Rewrite for the branch team: the lobby closes at 3 p.m. Friday for carpet cleaning.', expect: 'An answer that ends with "Draft. Check facts before use."' },
        { prompt: 'Draft a reply to Maria Delgado about the overdraft fee on account 4417-2290.', expect: 'No reply. The tool lists the name and the account number and asks you to remove them.' },
        { prompt: 'Should we approve this loan? The applicant\'s debt-to-income ratio is 48 percent.', expect: 'No yes or no. A list of what a lender would need to decide.' },
      ],
      doneWhen: 'All three tests behave as described. If the second one gets a reply, the rules are not saved. Check the setting and test again.',
      limits: 'House rules catch a mistake after you press send. They do not stop information reaching the tool. Your institution\'s data rules still come first.',
      toolNote: 'ChatGPT: Settings, Personalization, Custom instructions. Claude: Settings, then the personal preferences box. Gemini: Saved info or a Gem. Microsoft 365 Copilot: check settings for custom instructions, or paste the rules at the start of each chat.',
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
      youWillHave: 'A saved prompt that turns any messy internal note into a short, clear message with the action first.',
      beforeYouStart: 'Find an internal email or note you need to send today. Nothing about customers or members.',
      promptLabel: 'Message rewriter',
      prompt: `Rewrite the note below as a short internal message for [audience, e.g. branch staff].

Put the action in the first sentence. Say who does it and by when, if the note says. Keep every fact as written and add none. If the owner or the deadline is missing, write [OWNER?] or [DATE?] instead of guessing. Keep it under 120 words, in plain language.

Note:
[paste the note]`,
      steps: [
        { title: 'Copy the rewriter', body: 'Replace [audience] with who will read it. Keep the rest as it is.' },
        { title: 'Save it under a name you will find', body: 'Call it "Message rewriter" so it is one click away next time.' },
        { title: 'Run it on your note', body: 'Paste your note where it says [paste the note] and run it.' },
        { title: 'Check it against your original', body: 'Every fact should match. Nothing should be new. Fill in any [OWNER?] or [DATE?] yourself.' },
      ],
      doneWhen: 'You have sent one real message written with your rewriter.',
      toolNote: SAVE_IT_NOTE,
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
      youWillHave: 'An assistant that turns your meeting notes into a list of who does what by when, with the line each item came from.',
      beforeYouStart: 'Open the notes from your last internal meeting. Staff names are fine. Replace any customer or member name with [CUSTOMER].',
      promptLabel: 'Meeting actions assistant',
      prompt: `You turn internal meeting notes into an action list for a community bank team.

Context: notes from an internal [team name] meeting. There are no customer details in them.
Objective: list every action item with an owner and a due date.
Resources: use only the notes below. Do not add actions that are not in the notes.
Expectations: a table with the columns Action, Owner, Due, and Source line (the words in the notes it came from). Below the table, list any action with no owner or no date under "Needs an owner."

Notes:
[paste the notes]`,
      steps: [
        { title: 'Read the four labels', body: 'Context says what the notes are. Objective says what you want. Resources says what to use and nothing else. Expectations says what the answer looks like. That is the CORE structure, and you will use it in every build after this one.' },
        { title: 'Copy the assistant and save it', body: 'Replace [team name], then save it under the name "Meeting actions".' },
        { title: 'Run it on your notes', body: 'Paste your notes where it says [paste the notes] and run it.' },
        { title: 'Check the source lines', body: 'Every row needs a source line you can find in your notes. If a row has none, the AI made it up. Delete the row.' },
      ],
      doneWhen: 'You have sent the action list from a real meeting to the people on it.',
      toolNote: SAVE_IT_NOTE,
      verifiedOn: BUILD_VERIFIED_ON,
      reviewBy: BUILD_REVIEW_BY,
    },
  },
  {
    number: 4,
    id: 'm4-build-first-prompt',
    title: 'Build Your First Prompt',
    pillar: 'awareness',
    estimatedMinutes: 10,
    keyOutput: 'First Prompt Card',
    // Module 3 teaches the CORE method on sample scenarios; Module 4 applies the
    // SAME framework to a task the learner actually owns. Same four parts (CORE),
    // distinct purpose — no competing Context/Task/Format/Rules schema.
    mission: 'Apply the CORE structure to build your own first reusable prompt for a task you actually do.',
    plainLanguageConcept: 'Module 3 used the four CORE parts to build a meeting assistant. Now use the same four — Context, Objective, Resources, Expectations — on one real, recurring task from your own role.',
    bankingGuardrail: 'Use placeholders for sensitive inputs and add a review rule directly inside the prompt.',
    guidanceSource: 'NIST GenAI profile, Treasury AI financial services report',
    tryTask: 'Compare a weak one-line prompt with a CORE-structured prompt for your own task.',
    buildTask: 'Build your first CORE prompt card for one recurring, low-risk task you own.',
    saveArtifact: 'First Prompt Card',
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
  },
  {
    number: 5,
    id: 'm5-add-context-constraints',
    title: 'Add Context and Constraints',
    pillar: 'understanding',
    estimatedMinutes: 10,
    keyOutput: 'Context Block',
    mission: 'Give AI enough context to help without exposing what it should not see.',
    plainLanguageConcept: 'Context improves output quality. Constraints keep the answer inside the boundary of the work.',
    bankingGuardrail: 'Role context is fine; customer facts, confidential strategy, and examiner material are not.',
    guidanceSource: 'Interagency TPRM Guidance, NIST AI RMF',
    tryTask: 'Choose which context details belong in a safe reusable prompt and which must be removed.',
    buildTask: 'Build a short context block with role, audience, tone, and do-not rules.',
    saveArtifact: 'Safe Context Block',
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
  },
  {
    number: 6,
    id: 'm6-structured-output',
    title: 'Ask for Structured Output',
    pillar: 'understanding',
    estimatedMinutes: 10,
    keyOutput: 'Output Format Template',
    mission: 'Make AI output easier to review by controlling the shape of the answer.',
    plainLanguageConcept: 'Output format is a review control. Tables, bullets, and labeled sections make facts, gaps, and next actions easier to inspect.',
    bankingGuardrail: 'Ask for sources, assumptions, and review flags when the output includes facts or policy claims.',
    guidanceSource: 'NIST AI RMF, SR 26-2',
    tryTask: 'Convert one paragraph answer into a table with source, assumption, and action columns.',
    buildTask: 'Design the answer shape for one recurring task so a reviewer can inspect it quickly.',
    saveArtifact: 'Output Format Template',
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
  },
  {
    number: 7,
    id: 'm7-review-like-banker',
    title: 'Review AI Output Like a Banker',
    pillar: 'understanding',
    estimatedMinutes: 10,
    keyOutput: 'Review Checklist',
    mission: 'Turn review from a vague instruction into a repeatable checklist.',
    plainLanguageConcept: 'Human review means checking facts, fit, tone, source, and decision impact before reuse.',
    bankingGuardrail: 'Customer-facing, credit, compliance, legal, payment, and control outputs need stronger review than internal drafting.',
    guidanceSource: 'CFPB adverse action guidance, SR 26-2, NIST AI RMF',
    tryTask: 'Apply a review checklist to a sample AI draft and mark what changes before use.',
    buildTask: 'Build a checklist for reviewing AI output in your role.',
    saveArtifact: 'AI Output Review Checklist',
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
  },
  {
    number: 8,
    id: 'm8-source-material-safely',
    title: 'Use Source Material Safely',
    pillar: 'understanding',
    estimatedMinutes: 10,
    keyOutput: 'Source-Grounded Prompt',
    mission: 'Use documents without letting AI invent what the source does not say.',
    plainLanguageConcept: 'Source-grounded work tells AI to answer only from supplied material and flag gaps instead of guessing.',
    bankingGuardrail: 'Only use documents approved for the selected tool, and verify source references before acting.',
    guidanceSource: 'Interagency TPRM Guidance, NIST GenAI profile',
    tryTask: 'Ask AI to summarize only from a sample policy excerpt and mark anything not found in source.',
    buildTask: 'Build a source-grounded prompt for document review.',
    saveArtifact: 'Source-Grounded Prompt',
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
  },
  {
    number: 9,
    id: 'm9-reusable-prompt-template',
    title: 'Turn a Prompt Into a Template',
    pillar: 'understanding',
    estimatedMinutes: 10,
    keyOutput: 'Reusable Prompt Template',
    mission: 'Move from a one-off prompt to a reusable work asset.',
    plainLanguageConcept: 'A prompt template is a named reusable asset. It keeps placeholders, safety notes, examples, and version notes together.',
    bankingGuardrail: 'Templates should include what not to paste and when to escalate.',
    guidanceSource: 'NIST AI RMF, Treasury AI financial services report',
    tryTask: 'Convert a one-time prompt into a template with placeholders and a safety note.',
    buildTask: 'Convert one tested prompt into a named template with placeholders and a version note.',
    saveArtifact: 'Reusable Prompt Template',
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
  },
  {
    number: 10,
    id: 'm10-role-based-prompt',
    title: 'Build a Role-Based Prompt',
    pillar: 'creation',
    estimatedMinutes: 10,
    keyOutput: 'Role Prompt Card',
    mission: 'Make one prompt fit the work, audience, and review path of a specific banking role.',
    plainLanguageConcept: 'A role prompt adds job context: audience, source, decision impact, reviewer, and language that fits the department.',
    bankingGuardrail: 'Role context cannot include confidential customer, employee, examination, or strategy details.',
    guidanceSource: 'NIST AI RMF, Interagency TPRM Guidance',
    tryTask: 'Adapt the same prompt for retail, lending, operations, or compliance.',
    buildTask: 'Adapt a general prompt into a role prompt card for your own recurring task.',
    saveArtifact: 'Role Prompt Card',
    visualModel: ['Role', 'Task', 'Source', 'Reviewer'],
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
  },
  {
    number: 11,
    id: 'm11-choose-ai-use-case',
    title: 'Choose the Right AI Use Case',
    pillar: 'creation',
    estimatedMinutes: 10,
    keyOutput: 'Use-Case Card',
    mission: 'Pick AI work that is useful, safe, and specific enough to manage.',
    plainLanguageConcept: 'A good use case has a real task, allowed input, clear AI role, human reviewer, and measurable win.',
    bankingGuardrail: 'Do not choose use cases where AI decides customer outcomes, credit actions, legal positions, or compliance determinations.',
    guidanceSource: 'CFPB adverse action guidance, SR 26-2, NIST AI RMF',
    tryTask: 'Score three sample use cases as good fit, revise, or block.',
    buildTask: 'Build a use-case card for one AI-supported task in your role.',
    saveArtifact: 'Use-Case Card',
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
  },
  {
    number: 12,
    id: 'm12-data-safety-boundaries',
    title: 'Apply Data-Safety Boundaries',
    pillar: 'creation',
    estimatedMinutes: 10,
    keyOutput: 'Safe-Use Checklist',
    mission: 'Decide what can enter AI before the prompt is written.',
    plainLanguageConcept: 'Data safety is a gate. Classify the input, tool approval, and decision impact before using AI.',
    bankingGuardrail: 'Red-zone data and decisions stay out of unapproved tools. Escalate rather than sanitize when the decision impact is high.',
    guidanceSource: 'Interagency TPRM Guidance, NCUA AI resources, NIST GenAI profile',
    tryTask: 'Classify sample prompts as safe, needs approved tool, or blocked.',
    buildTask: 'Build a safe-use checklist that travels with your prompts and templates.',
    saveArtifact: 'Safe-Use Checklist',
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
  },
  {
    number: 13,
    id: 'm13-simple-reusable-skill',
    title: 'Build a Simple Reusable Skill',
    pillar: 'creation',
    estimatedMinutes: 10,
    keyOutput: 'Skill Template',
    mission: 'Turn a prompt into a repeatable action with input, steps, review, and output.',
    plainLanguageConcept: 'A skill is a reusable work pattern, not just a prompt. It defines input, AI action, human check, output, and blocked use.',
    bankingGuardrail: 'A skill should include allowed inputs, blocked inputs, and human review before reuse.',
    guidanceSource: 'NIST AI RMF, Treasury AI financial services report',
    tryTask: 'Label the parts of a sample skill: input, AI action, review, output, reuse note.',
    buildTask: 'Build a simple skill that combines input rules, AI action, human review, and a stable output.',
    saveArtifact: 'Skill Template',
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
  },
  {
    number: 14,
    id: 'm14-map-workflow-before-automation',
    title: 'Map a Workflow Before Automating',
    pillar: 'creation',
    estimatedMinutes: 10,
    keyOutput: 'Workflow Map',
    mission: 'See the work before deciding where AI belongs.',
    plainLanguageConcept: 'Workflow maps show trigger, steps, data, decision points, reviewer, exception path, and saved evidence.',
    bankingGuardrail: 'Do not automate a workflow you cannot explain step by step, especially when customers or controls are affected.',
    guidanceSource: 'SR 26-2, NIST AI RMF',
    tryTask: 'Mark the AI-supported steps and human checkpoints on a sample workflow.',
    buildTask: 'Build a workflow map for one recurring task before adding AI.',
    saveArtifact: 'Workflow Map',
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
  },
  {
    number: 15,
    id: 'm15-human-review-checkpoints',
    title: 'Set the Human Review Gate',
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
  },
  {
    number: 17,
    id: 'm17-package-reusable-workflow',
    title: 'Create the Reusable Workflow Kit',
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
  },
  {
    number: 18,
    id: 'm18-foundation-packet-review',
    title: 'Final Foundation Packet Review',
    pillar: 'application',
    estimatedMinutes: 12,
    keyOutput: 'Foundation Packet Summary',
    mission: 'Turn the course artifacts into a manager-ready packet of safe AI practice.',
    plainLanguageConcept: 'The packet proves the learner can use AI safely: prompts, skills, workflows, review notes, evidence, and boundaries.',
    bankingGuardrail: 'The final packet should show safe prompting, verification, limits, human review, and evidence without exposing sensitive data.',
    guidanceSource: 'NIST AI RMF, SR 26-2, Treasury AI financial services report',
    tryTask: 'Review your packet against the four standards: safe, useful, reusable, reviewable.',
    buildTask: 'Create a short packet summary that explains what you built and how it will be used safely.',
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
