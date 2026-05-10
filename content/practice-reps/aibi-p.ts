import type { PracticeRep, Simulation, Artifact, CertificateRequirement } from '@/types/lms';

export const AIBI_P_PRACTICE_REPS: readonly PracticeRep[] = [
  {
    id: 'rewrite-for-clarity',
    courseId: 'aibi-p',
    moduleNumber: 1,
    title: 'Rewrite for Clarity',
    skill: 'Tone control and clear writing',
    promptStrategy: 'transformation',
    role: 'all',
    timeEstimateMinutes: 5,
    scenario:
      'An internal email about a procedure change is wordy, indirect, and hard for branch staff to act on.',
    task:
      'Use AI to rewrite the message so the action, deadline, and owner are obvious.',
    constraints: [
      'Keep the rewritten email under 150 words.',
      'Do not add facts that are not in the source message.',
      'Use a calm professional tone.',
    ],
    starterPrompt:
      'Rewrite this internal email for clarity. Keep the facts unchanged, make the required action obvious, and use a professional community banking tone: [PASTE EMAIL]',
    modelAnswer:
      'Team, starting Monday, use the updated account-opening checklist for every new consumer account. The checklist is saved in the shared procedures folder. Branch managers should confirm by Friday that each banker has reviewed it. Questions should go to Operations before the Monday rollout.',
    feedback: [
      'Good outputs preserve facts and remove extra commentary.',
      'The best version makes the action, owner, and deadline visible in the first two sentences.',
    ],
    reflectionQuestion: 'What did AI make clearer that you might miss when writing quickly?',
    safetyLevel: 'green',
  },
  {
    id: 'safe-prompt-conversion',
    courseId: 'aibi-p',
    moduleNumber: 9,
    title: 'Convert a Risky Prompt',
    skill: 'Data safety and prompt sanitization',
    promptStrategy: 'sanitization',
    role: 'all',
    timeEstimateMinutes: 6,
    scenario:
      'A colleague wants to paste a customer complaint with account details into a public AI tool.',
    task:
      'Remove sensitive details and rewrite the prompt so it asks for reusable guidance, not customer-specific handling.',
    constraints: [
      'Remove names, account numbers, balances, dates of birth, and transaction details.',
      'Do not ask AI to decide whether the bank made an error.',
      'Ask for draft language that a banker will review.',
    ],
    starterPrompt:
      'Sanitize this risky prompt for safe AI use. Replace customer-specific facts with placeholders and keep the task focused on draft language for human review: [PASTE PROMPT]',
    modelAnswer:
      'Draft a professional response template for a customer who is upset about an overdraft fee. Do not promise a refund or admit bank error. Keep the tone empathetic, offer to review the account by phone, and include placeholders for banker name and phone number.',
    feedback: [
      'The sanitized version removes customer data and turns the task into a reusable template.',
      'It keeps decision-making with the banker instead of the AI tool.',
    ],
    reflectionQuestion: 'Which details did you remove because they were unnecessary for the task?',
    safetyLevel: 'yellow',
  },
  {
    id: 'first-role-prompt',
    courseId: 'aibi-p',
    moduleNumber: 3,
    title: 'Build Your First Role Prompt',
    skill: 'Reusable prompt construction',
    promptStrategy: 'structured',
    role: 'all',
    timeEstimateMinutes: 7,
    scenario:
      'You want one reusable prompt for a weekly task in your role.',
    task:
      'Build a role-based prompt with role, task, format, and constraints.',
    constraints: [
      'Use placeholders for any institution-specific details.',
      'Specify the audience and output format.',
      'Include a verification or review instruction.',
    ],
    starterPrompt:
      'Help me turn this recurring banking task into a reusable prompt. Role: [YOUR ROLE]. Task: [TASK]. Audience: [AUDIENCE]. Output format: [FORMAT]. Constraints: [CONSTRAINTS].',
    modelAnswer:
      'You are a retail banking communication assistant. Draft a concise customer email about [TOPIC] for [AUDIENCE]. Use plain language, avoid promises or legal conclusions, keep under 175 words, and flag any claim that needs banker or compliance review.',
    feedback: [
      'A reusable prompt has placeholders instead of live customer data.',
      'Constraints turn a generic draft into a bank-safe draft.',
    ],
    reflectionQuestion: 'Where would this prompt save you time this week?',
    safetyLevel: 'green',
  },
  {
    id: 'spot-the-hallucination',
    courseId: 'aibi-p',
    moduleNumber: 2,
    title: 'Spot the Unsupported Claim',
    skill: 'Verification and human review',
    promptStrategy: 'analysis',
    role: 'all',
    timeEstimateMinutes: 6,
    scenario:
      'An AI-generated banking response sounds confident but includes claims that are not supported by the provided source.',
    task:
      'Identify unsupported claims and rewrite the answer so uncertainty is visible.',
    constraints: [
      'Do not invent citations.',
      'Mark uncertain claims as needs review.',
      'Separate verified facts from assumptions.',
    ],
    starterPrompt:
      'Review this AI-generated banking response. List unsupported claims, mark anything that needs review, and rewrite the answer using only verified facts: [PASTE RESPONSE]',
    modelAnswer:
      'Unsupported: the specific regulatory citation, the deadline, and the claim that all community banks are exempt. Rewrite with review flags before any external use.',
    feedback: [
      'Strong review catches confident claims without evidence.',
      'Banking outputs should make uncertainty explicit instead of hiding it.',
    ],
    reflectionQuestion: 'Which phrase made the answer sound more certain than it really was?',
    safetyLevel: 'yellow',
  },
  {
    id: 'classify-the-ai-use-case',
    courseId: 'aibi-p',
    moduleNumber: 9,
    title: 'Classify the Use Case',
    skill: 'Risk classification',
    promptStrategy: 'analysis',
    role: 'all',
    timeEstimateMinutes: 5,
    scenario:
      'A team proposes several AI uses, from drafting generic emails to analyzing customer financial data.',
    task:
      'Classify each use as green, yellow, or red and explain the boundary.',
    constraints: [
      'Classify up when uncertain.',
      'Red uses must not go into public AI tools.',
      'Yellow uses require approved tools and human review.',
    ],
    starterPrompt:
      'Classify these AI use cases as green, yellow, or red for a community financial institution. Explain the reason and the required safeguard: [PASTE USE CASES]',
    modelAnswer:
      'Generic email drafting is green. Internal policy summaries are yellow. Customer PII, credit decisions, and SAR-related content are red unless handled in a formally approved system.',
    feedback: [
      'The useful habit is not avoiding AI; it is matching the task to the right risk boundary.',
      'Red/yellow/green language helps nontechnical staff remember the rule.',
    ],
    reflectionQuestion: 'Which use case would you escalate before trying it?',
    safetyLevel: 'yellow',
  },
  {
    id: 'summarize-a-policy',
    courseId: 'aibi-p',
    moduleNumber: 6,
    title: 'Summarize a Policy for Frontline Staff',
    skill: 'Summarization and audience targeting',
    promptStrategy: 'transformation',
    role: 'operations',
    timeEstimateMinutes: 7,
    scenario:
      'A procedure document is long and difficult for frontline staff to translate into daily action.',
    task:
      'Ask AI for a plain-language summary that separates must-do steps from background context.',
    constraints: [
      'Do not change policy meaning.',
      'Flag ambiguous language.',
      'Write for frontline staff.',
    ],
    starterPrompt:
      'Summarize this procedure for frontline banking staff. Separate required actions, background context, and items that need supervisor review: [PASTE APPROVED POLICY EXCERPT]',
    modelAnswer:
      'Required actions should be listed as short steps, background should be no more than three bullets, and ambiguous policy language should be flagged for supervisor review.',
    feedback: [
      'Good summaries preserve policy meaning while reducing reading friction.',
      'Ambiguity flags are better than confident guesses.',
    ],
    reflectionQuestion: 'What part of the policy would still need a human owner?',
    safetyLevel: 'yellow',
  },
  {
    id: 'customer-complaint-response',
    courseId: 'aibi-p',
    moduleNumber: 10,
    title: 'Draft a Complaint Response',
    skill: 'Empathy with risk boundaries',
    promptStrategy: 'structured',
    role: 'retail',
    timeEstimateMinutes: 7,
    scenario:
      'A customer is frustrated about a fee and wants an explanation.',
    task:
      'Draft a response that is empathetic, clear, and careful about promises.',
    constraints: [
      'Do not promise refunds.',
      'Do not admit bank error.',
      'Offer a phone call.',
      'Keep under 150 words.',
    ],
    starterPrompt:
      'Draft a professional response template for a customer upset about a fee. Keep the tone empathetic, do not promise a refund or admit error, and offer a phone call with [BANKER NAME] at [PHONE].',
    modelAnswer:
      'Thank you for reaching out. I understand why this fee is frustrating, and I would be glad to review the account activity with you. Please call me at [PHONE], or reply with a convenient time, and I will walk through what happened and any available options. Thank you, [BANKER NAME].',
    feedback: [
      'The response acknowledges emotion without deciding the outcome.',
      'It keeps the banker in control of account-specific review.',
    ],
    reflectionQuestion: 'Where did the draft avoid overpromising?',
    safetyLevel: 'yellow',
  },
  {
    id: 'meeting-summary',
    courseId: 'aibi-p',
    moduleNumber: 8,
    title: 'Turn Notes into Next Steps',
    skill: 'Meeting summarization',
    promptStrategy: 'transformation',
    role: 'all',
    timeEstimateMinutes: 6,
    scenario:
      'A meeting produced scattered notes and no clear owner list.',
    task:
      'Use AI to turn notes into decisions, action items, owners, and open questions.',
    constraints: [
      'Use placeholders for names if notes include sensitive details.',
      'Do not invent owners.',
      'Separate decisions from open questions.',
    ],
    starterPrompt:
      'Convert these meeting notes into a concise summary with decisions, action items, owners, deadlines, and open questions. Do not invent missing owners or dates: [PASTE NOTES]',
    modelAnswer:
      'A useful output has four sections: decisions made, action items with owners, open questions, and follow-up needed before the next meeting.',
    feedback: [
      'AI is strongest when formatting messy notes into a reviewable structure.',
      'Missing owners or dates should be flagged, not fabricated.',
    ],
    reflectionQuestion: 'Which follow-up would you send first?',
    safetyLevel: 'green',
  },
  {
    id: 'build-ai-personal-system',
    courseId: 'aibi-p',
    moduleNumber: 4,
    title: 'Build Your AI Personal System',
    skill: 'Reusable AI context setup',
    promptStrategy: 'template',
    role: 'all',
    timeEstimateMinutes: 7,
    scenario:
      'You want AI to understand your role, voice, project context, examples, and boundaries without rewriting the same setup every time.',
    task:
      'Draft a safe starter outline for your AI Personal System files.',
    constraints: [
      'Do not include customer data, passwords, or confidential records.',
      'Use placeholders for role, projects, examples, and boundaries.',
      'Include a do-not-do file that keeps human review visible.',
    ],
    starterPrompt:
      'Help me create a safe AI Personal System for banking work. Draft outlines for about-me.md, voice-profile.md, project-brief.md, prompt-library.md, output-examples.md, and do-not-do.md using placeholders only.',
    modelAnswer:
      'A strong starter system includes role context, preferred tone, current project scope, reusable prompt patterns, approved example outputs, and explicit boundaries such as no customer data, no credit decisions, and human review for external-facing work.',
    feedback: [
      'Good system files make repeated AI work faster without adding sensitive data.',
      'The do-not-do file is as important as the prompt library because it preserves banking boundaries.',
    ],
    reflectionQuestion: 'Which file would save you the most setup time this week?',
    safetyLevel: 'green',
  },
  {
    id: 'board-summary',
    courseId: 'aibi-p',
    moduleNumber: 10,
    title: 'Board-Ready Summary',
    skill: 'Executive summary drafting',
    promptStrategy: 'structured',
    role: 'executive',
    timeEstimateMinutes: 7,
    scenario:
      'A project update needs to be summarized for a nontechnical board audience.',
    task:
      'Draft a plain-language summary with progress, risk, decision needed, and next step.',
    constraints: [
      'Do not use AI hype language.',
      'Flag numbers that need verification.',
      'Keep under 200 words.',
    ],
    starterPrompt:
      'Draft a board-ready summary of this project update for a community financial institution. Include progress, risk, decision needed, and next step. Flag numbers that need verification: [PASTE UPDATE]',
    modelAnswer:
      'The strongest board summary separates operational progress from decision requests and marks unverified metrics clearly.',
    feedback: [
      'Board-facing AI output must be plain, sourced, and modest.',
      'Verified numbers matter more than polished language.',
    ],
    reflectionQuestion: 'Which metric would you verify before sending?',
    safetyLevel: 'yellow',
  },
  {
    id: 'sanitize-before-upload',
    courseId: 'aibi-p',
    moduleNumber: 9,
    title: 'Sanitize Before Upload',
    skill: 'Pre-prompt data review',
    promptStrategy: 'sanitization',
    role: 'all',
    timeEstimateMinutes: 5,
    scenario:
      'A document has useful process information mixed with sensitive customer details.',
    task:
      'Identify what must be removed before asking AI for a process summary.',
    constraints: [
      'Remove customer identifiers.',
      'Remove account and transaction details.',
      'Keep only process language needed for the task.',
    ],
    starterPrompt:
      'Review this text before AI use. Identify sensitive details to remove and produce a sanitized version suitable for asking for a process summary: [PASTE TEXT]',
    modelAnswer:
      'Remove names, account numbers, balances, transaction dates, addresses, phone numbers, and any unique incident details that identify a customer.',
    feedback: [
      'Sanitization happens before prompting, not after the AI responds.',
      'A safe prompt needs only the facts required for the task.',
    ],
    reflectionQuestion: 'What information felt useful but unnecessary for the AI task?',
    safetyLevel: 'red',
  },
  {
    id: 'project-brief-builder',
    courseId: 'aibi-p',
    moduleNumber: 5,
    title: 'Build a Project Brief',
    skill: 'Reusable project context',
    promptStrategy: 'thinking',
    role: 'all',
    timeEstimateMinutes: 6,
    scenario:
      'You have a recurring project that needs the same background context every time you ask AI for help.',
    task:
      'Create a sanitized project brief with goal, audience, source material, constraints, and review owner.',
    constraints: [
      'Use placeholders for confidential details.',
      'Do not include customer or account data.',
      'Name the human reviewer for final output.',
    ],
    starterPrompt:
      'Create a reusable project brief for this banking project using placeholders only. Include goal, audience, source material, constraints, output format, and review owner: [DESCRIBE PROJECT]',
    modelAnswer:
      'A strong project brief gives AI enough context to help without exposing sensitive data. It names the goal, audience, allowed sources, constraints, output format, and review owner.',
    feedback: [
      'Good context improves output quality without requiring sensitive details.',
      'A review owner keeps accountability visible.',
    ],
    reflectionQuestion: 'Which project context can be reused safely?',
    safetyLevel: 'green',
  },
  {
    id: 'choose-the-right-tool',
    courseId: 'aibi-p',
    moduleNumber: 7,
    title: 'Choose the Right Tool',
    skill: 'Tool selection',
    promptStrategy: 'thinking',
    role: 'all',
    timeEstimateMinutes: 5,
    scenario:
      'A banker has three tasks: draft an email, summarize a source document, and research a public topic.',
    task:
      'Match each task to the safest AI tool category and explain the data boundary.',
    constraints: [
      'Separate public research from internal document work.',
      'Do not assume personal accounts are approved for bank data.',
      'Name the approval or data question before use.',
    ],
    starterPrompt:
      'For each task, recommend the safest AI tool category and the data boundary to check first: [PASTE TASKS]',
    modelAnswer:
      'Use chat for low-risk drafting, file-grounded tools for approved document summaries, and search-answer tools for public research. Approval and data classification decide final use.',
    feedback: [
      'Tool choice starts with task and data, not brand familiarity.',
      'Approved access matters more than capability.',
    ],
    reflectionQuestion: 'Which task requires approval before trying it?',
    safetyLevel: 'yellow',
  },
  {
    id: 'save-three-prompts',
    courseId: 'aibi-p',
    moduleNumber: 11,
    title: 'Save Three Reusable Prompts',
    skill: 'Prompt library building',
    promptStrategy: 'template',
    role: 'all',
    timeEstimateMinutes: 7,
    scenario:
      'You want a small prompt library for the tasks you repeat most often.',
    task:
      'Save three reusable prompts with when-to-use and what-not-to-paste notes.',
    constraints: [
      'Use placeholders instead of real customer information.',
      'Include one safety note per prompt.',
      'Organize prompts by task type.',
    ],
    starterPrompt:
      'Help me turn these recurring tasks into three reusable banking prompts. Add when-to-use and what-not-to-paste notes for each: [PASTE TASKS]',
    modelAnswer:
      'A useful prompt library includes the prompt text, task category, role, output format, safety note, and examples of data that should not be pasted.',
    feedback: [
      'Reusable prompts reduce setup time.',
      'Safety notes make the prompt usable later without forgetting the boundary.',
    ],
    reflectionQuestion: 'Which prompt will you use first this week?',
    safetyLevel: 'green',
  },
  {
    id: 'final-practitioner-lab-plan',
    courseId: 'aibi-p',
    moduleNumber: 12,
    title: 'Plan Your Final Lab',
    skill: 'Final work product preparation',
    promptStrategy: 'multi-step',
    role: 'all',
    timeEstimateMinutes: 7,
    scenario:
      'You need to choose one safe, useful workflow for your final practitioner lab.',
    task:
      'Define the workflow, prompt, source context, output, review step, and artifact evidence.',
    constraints: [
      'Choose a low-risk workflow.',
      'Use sanitized or approved context.',
      'Document the human review step.',
    ],
    starterPrompt:
      'Help me plan a final AI practitioner lab for this workflow. Include prompt, context, output, review step, artifact evidence, and safety boundary: [DESCRIBE WORKFLOW]',
    modelAnswer:
      'A strong final lab package includes sanitized context, a structured prompt, raw AI output, human review notes, final edited output, and the artifact created.',
    feedback: [
      'The lab demonstrates judgment, not just prompting.',
      'The review notes are evidence that the learner stayed accountable.',
    ],
    reflectionQuestion: 'What will prove that your final output was reviewed by a human?',
    safetyLevel: 'yellow',
  },
] as const;

export const AIBI_P_SIMULATIONS: readonly Simulation[] = AIBI_P_PRACTICE_REPS.map((rep) => ({
  ...rep,
  simulationType: 'role-based',
}));

export const AIBI_P_ARTIFACTS: readonly Artifact[] = [
  {
    id: 'safe-ai-use-checklist',
    courseId: 'aibi-p',
    moduleNumber: 9,
    title: 'Safe AI Use Checklist',
    description: 'A quick reference for what to strip, what to verify, and when to escalate.',
    format: 'md',
    sourceActivityId: 'safe-prompt-conversion',
    downloadHref: '/artifacts/safe-ai-use-checklist.md',
    countsTowardCertificate: true,
  },
  {
    id: 'first-prompt-template',
    courseId: 'aibi-p',
    moduleNumber: 3,
    title: 'First Prompt Template',
    description: 'A reusable role-based prompt pattern for weekly banking work.',
    format: 'prompt-card',
    sourceActivityId: 'first-role-prompt',
    countsTowardCertificate: true,
  },
  {
    id: 'prompt-strategy-cheat-sheet',
    courseId: 'aibi-p',
    moduleNumber: 3,
    title: 'Prompt Strategy Cheat Sheet',
    description: 'A quick guide for choosing structured, transformation, analysis, thinking, template, or sanitization prompts.',
    format: 'worksheet',
    sourceActivityId: 'first-role-prompt',
    countsTowardCertificate: true,
  },
  {
    id: 'ai-output-review-worksheet',
    courseId: 'aibi-p',
    moduleNumber: 2,
    title: 'AI Output Review Worksheet',
    description: 'A structured review checklist for unsupported claims, missing sources, and risky language.',
    format: 'worksheet',
    sourceActivityId: 'spot-the-hallucination',
    countsTowardCertificate: true,
  },
  {
    id: 'red-yellow-green-use-card',
    courseId: 'aibi-p',
    moduleNumber: 9,
    title: 'Red / Yellow / Green Use Card',
    description: 'A plain-English AI use boundary guide for regulated banking work.',
    format: 'md',
    sourceActivityId: 'classify-the-ai-use-case',
    downloadHref: '/artifacts/red-yellow-green-use-card.md',
    countsTowardCertificate: true,
  },
  {
    id: 'ai-personal-system-pack',
    courseId: 'aibi-p',
    moduleNumber: 4,
    title: 'AI Personal System Pack',
    description: 'A starter set of reusable context files for safer daily AI work.',
    format: 'md',
    sourceActivityId: 'build-ai-personal-system',
    countsTowardCertificate: true,
  },
];

export const AIBI_P_CERTIFICATE_REQUIREMENTS: readonly CertificateRequirement[] = [
  {
    id: 'modules-complete',
    label: 'Complete all modules',
    description: 'Finish every AiBI Foundations module in order.',
    requiredCount: 12,
  },
  {
    id: 'required-activities',
    label: 'Complete required activities',
    description: 'Submit each module activity and required artifact.',
  },
  {
    id: 'practice-reps',
    label: 'Complete practice reps',
    description: 'Finish at least five short banking AI practice reps.',
    requiredCount: 5,
  },
  {
    id: 'final-assessment',
    label: 'Pass final practical assessment',
    description: 'Submit the final work product package for review.',
  },
  {
    id: 'safe-use-pledge',
    label: 'Agree to safe AI use pledge',
    description: 'Confirm the SAFE rule before certificate issue.',
  },
];

export function getDailyPracticeRep(seed = new Date().toISOString().slice(0, 10)): PracticeRep {
  const dayTotal = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0);
  return AIBI_P_PRACTICE_REPS[dayTotal % AIBI_P_PRACTICE_REPS.length];
}

export function getPracticeRepById(repId: string): PracticeRep | undefined {
  return AIBI_P_PRACTICE_REPS.find((rep) => rep.id === repId);
}
