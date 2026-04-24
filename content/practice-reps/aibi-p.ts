import type { PracticeRep, Simulation, Artifact, CertificateRequirement } from '@/types/lms';

export const AIBI_P_PRACTICE_REPS: readonly PracticeRep[] = [
  {
    id: 'rewrite-for-clarity',
    courseId: 'aibi-p',
    moduleNumber: 1,
    title: 'Rewrite for Clarity',
    skill: 'Tone control and clear writing',
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
    moduleNumber: 2,
    title: 'Convert a Risky Prompt',
    skill: 'Data safety and prompt sanitization',
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
    moduleNumber: 4,
    title: 'Spot the Unsupported Claim',
    skill: 'Verification and human review',
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
    moduleNumber: 5,
    title: 'Classify the Use Case',
    skill: 'Risk classification',
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
    moduleNumber: 7,
    title: 'Draft a Complaint Response',
    skill: 'Empathy with risk boundaries',
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
    id: 'board-summary',
    courseId: 'aibi-p',
    moduleNumber: 9,
    title: 'Board-Ready Summary',
    skill: 'Executive summary drafting',
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
    moduleNumber: 5,
    title: 'Sanitize Before Upload',
    skill: 'Pre-prompt data review',
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
] as const;

export const AIBI_P_SIMULATIONS: readonly Simulation[] = AIBI_P_PRACTICE_REPS.map((rep) => ({
  ...rep,
  simulationType: 'role-based',
}));

export const AIBI_P_ARTIFACTS: readonly Artifact[] = [
  {
    id: 'safe-ai-use-checklist',
    courseId: 'aibi-p',
    moduleNumber: 2,
    title: 'Safe AI Use Checklist',
    description: 'A quick reference for what to strip, what to verify, and when to escalate.',
    format: 'pdf',
    sourceActivityId: 'safe-prompt-conversion',
    downloadHref: '/artifacts/safe-ai-use-checklist.pdf',
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
    id: 'ai-output-review-worksheet',
    courseId: 'aibi-p',
    moduleNumber: 4,
    title: 'AI Output Review Worksheet',
    description: 'A structured review checklist for unsupported claims, missing sources, and risky language.',
    format: 'worksheet',
    sourceActivityId: 'spot-the-hallucination',
    countsTowardCertificate: true,
  },
  {
    id: 'red-yellow-green-use-card',
    courseId: 'aibi-p',
    moduleNumber: 5,
    title: 'Red / Yellow / Green Use Card',
    description: 'A plain-English AI use boundary guide for regulated banking work.',
    format: 'pdf',
    sourceActivityId: 'classify-the-ai-use-case',
    downloadHref: '/artifacts/red-yellow-green-use-card.pdf',
    countsTowardCertificate: true,
  },
];

export const AIBI_P_CERTIFICATE_REQUIREMENTS: readonly CertificateRequirement[] = [
  {
    id: 'modules-complete',
    label: 'Complete all modules',
    description: 'Finish every AiBI-P module in order.',
    requiredCount: 9,
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
