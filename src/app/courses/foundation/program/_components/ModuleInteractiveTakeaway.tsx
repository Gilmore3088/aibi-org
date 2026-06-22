'use client';

/* eslint-disable @typescript-eslint/no-unused-vars -- Legacy bespoke widgets are retained while the 18-module course uses the unified micro-builder. */

import { useMemo, useState, type ReactNode } from 'react';
import {
  WIZARD_SCENARIOS,
  type CoreKey,
} from '../_lib/promptWizardData';
import { getFoundationLabBrief } from '@content/courses/foundation-program';

interface ModuleInteractiveTakeawayProps {
  readonly moduleNumber: number;
  readonly moduleId: string;
  readonly artifactLabel: string;
}

interface DraftPayload {
  readonly moduleId: string;
  readonly moduleNumber: number;
  readonly model: string;
  readonly dataset: string;
  readonly savedAt: string;
  readonly reviewChecklist: readonly string[];
  readonly content: string;
}

interface MicroTakeawayStep {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}

const FONT_STACK = 'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const CORE_PROMPT_COPY: Record<CoreKey, string> = {
  context: 'You are a branch banking assistant helping a teller answer a member.',
  objective: 'Tell me whether this $12 Basic Checking service fee can be waived.',
  resources: 'Use only the approved fee-waiver policy excerpt. If the policy does not cover it, say so.',
  expectations: 'Answer in 2-3 plain sentences and flag anything needing banker approval.',
};

type SafetyKind = 'pii' | 'action' | 'send';

interface SafetyHit {
  readonly start: number;
  readonly end: number;
  readonly kind: SafetyKind;
}

const SAFETY_PATTERNS: readonly { readonly kind: SafetyKind; readonly re: RegExp }[] = [
  { kind: 'pii', re: /\b\d{3}-\d{2}-\d{4}\b/g },
  { kind: 'pii', re: /\b(?:acct|account)\s*#?\s*\d{3,}\b/gi },
  { kind: 'pii', re: /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g },
  { kind: 'pii', re: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g },
  {
    kind: 'action',
    re: /\b(waive|approve|deny|decline|refund|reverse|grant|close the account|increase the (?:credit )?limit)\b/gi,
  },
  {
    kind: 'send',
    re: /\b(?:email|send)\b[^.]{0,44}\b(?:member|customer|borrower|client|her|him|them|directly)\b/gi,
  },
];

const SAFETY_SAMPLES: readonly { readonly label: string; readonly text: string }[] = [
  {
    label: 'Overdraft notice',
    text: 'Draft an overdraft notice for Maria Lopez, SSN 481-22-9930, account 0042871, balance -$240.18, and email it directly to her. Also go ahead and waive the $35 fee.',
  },
  {
    label: 'Rate explainer',
    text: 'Explain how a 7.5% APR applies to a personal loan over a 60-month term. Use the attached rate disclosure as the only source.',
  },
  {
    label: 'Credit decision',
    text: 'Review this application and decline the loan, then draft the denial letter and send it to the borrower today.',
  },
];

const ISSUE_COPY: Record<SafetyKind, { readonly title: string; readonly body: string }> = {
  pii: {
    title: 'Customer data detected',
    body: 'Strip account, SSN, card, email, and other identifiers before a general AI tool sees the prompt.',
  },
  action: {
    title: 'Money or account decision',
    body: 'AI can prepare the picture. A person owns waiving, approving, denying, refunding, or closing.',
  },
  send: {
    title: 'No review before send',
    body: 'Customer-facing output needs a named human review step before it leaves the bank.',
  },
};

type EmailMove = 'redact' | 'action' | 'owner' | 'deadline';

const EMAIL_RAW_NOTE =
  'Maria at Downtown says account 872399 is still showing the duplicate $35 fee. She emailed again and is upset. Can someone look before the Friday huddle? I think Alex was checking with Ops but I am not sure.';

const EMAIL_MOVES: readonly {
  readonly id: EmailMove;
  readonly label: string;
  readonly short: string;
  readonly missing: string;
}[] = [
  {
    id: 'redact',
    label: 'Strip identifiers',
    short: 'Names and account data become placeholders.',
    missing: 'The draft still exposes customer and account details.',
  },
  {
    id: 'action',
    label: 'Lead with action',
    short: 'The first line says what needs to happen.',
    missing: 'The reader has to infer the task.',
  },
  {
    id: 'owner',
    label: 'Name owner',
    short: 'Alex/Ops is accountable for the next check.',
    missing: 'No one owns the next move.',
  },
  {
    id: 'deadline',
    label: 'Set deadline',
    short: 'Friday huddle becomes the time boundary.',
    missing: 'The task can drift.',
  },
] as const;

type ClaimVerdict = 'verified' | 'unsupported' | 'wrong';

const CLAIM_VERDICTS: readonly ClaimVerdict[] = ['verified', 'unsupported', 'wrong'];

const CLAIM_REVIEW_ITEMS: readonly {
  readonly id: string;
  readonly claim: string;
  readonly expected: ClaimVerdict;
  readonly evidence: string;
}[] = [
  {
    id: 'reg-e-timer',
    claim: 'Covered EFT disputes need an initial investigation response within 10 business days.',
    expected: 'verified',
    evidence: 'The source packet includes the 10-business-day Reg E timer summary.',
  },
  {
    id: 'fee-waiver',
    claim: 'Every duplicate overdraft fee under $50 must be waived automatically.',
    expected: 'wrong',
    evidence: 'The sample fee policy requires manager review; it does not create an automatic waiver.',
  },
  {
    id: 'launch-date',
    claim: 'The updated disclosure goes live on June 1.',
    expected: 'unsupported',
    evidence: 'No launch date appears in the sample source. The date must be verified before reuse.',
  },
] as const;

type ToolCategory = 'general' | 'copilot' | 'search' | 'notebook' | 'escalate';
type ToolZone = 'green' | 'yellow' | 'red';

const TOOL_CATEGORY_LABEL: Record<ToolCategory, string> = {
  general: 'General chat',
  copilot: 'Workplace copilot',
  search: 'Search-answer',
  notebook: 'Notebook',
  escalate: 'Escalate',
};

const TOOL_ZONE_LABEL: Record<ToolZone, string> = {
  green: 'Green',
  yellow: 'Yellow',
  red: 'Red',
};

const TOOL_CHOICE_TASKS: readonly {
  readonly id: string;
  readonly task: string;
  readonly correctCategory: ToolCategory;
  readonly correctZone: ToolZone;
  readonly reason: string;
}[] = [
  {
    id: 'public-reg-update',
    task: 'Summarize a public FDIC article for tomorrow morning huddle.',
    correctCategory: 'search',
    correctZone: 'green',
    reason: 'Public source, low sensitivity, and source links matter more than chat fluency.',
  },
  {
    id: 'policy-compare',
    task: 'Compare two internal policy PDFs and extract changed review steps.',
    correctCategory: 'notebook',
    correctZone: 'yellow',
    reason: 'The source set should stay bounded, and internal documents need an approved tool.',
  },
  {
    id: 'denial-notice',
    task: 'Draft a member-specific denial notice from an application file.',
    correctCategory: 'escalate',
    correctZone: 'red',
    reason: 'Credit decisions and customer-specific data belong in approved controlled processes.',
  },
  {
    id: 'meeting-summary',
    task: 'Summarize a Teams meeting transcript already stored in the institution tenant.',
    correctCategory: 'copilot',
    correctZone: 'yellow',
    reason: 'The data is internal, and the safer path is the approved workplace environment.',
  },
] as const;

interface StructuredBuilderMove {
  readonly id: string;
  readonly label: string;
  readonly short: string;
  readonly missing: string;
  readonly artifactLine: string;
}

interface StructuredBuilderConfig {
  readonly moduleNumber: number;
  readonly testId: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly scoreLabel: string;
  readonly badLabel: string;
  readonly badWay: string;
  readonly previewLabel: string;
  readonly artifactHeading: string;
  readonly model: string;
  readonly dataset: string;
  readonly reviewChecklist: readonly string[];
  readonly completeLine: string;
  readonly incompleteLine: string;
  readonly moves: readonly StructuredBuilderMove[];
}

const _STRUCTURED_BUILDER_CONFIGS: Record<number, StructuredBuilderConfig> = {
  4: {
    moduleNumber: 4,
    testId: 'foundation-work-profile-builder',
    eyebrow: 'Build reusable context',
    title: 'Work Profile Scrubber',
    description: 'Keep useful role context and remove the details that should never become reusable prompt material.',
    scoreLabel: 'Profile',
    badLabel: 'Overexposed profile',
    badWay:
      'I manage Downtown branch complaints, including Maria Lopez account 872399. We are preparing a confidential Q3 staffing change. Write in my voice and mention our private member-retention plan.',
    previewLabel: 'Safe about-me.md preview',
    artifactHeading: 'Safe AI work profile',
    model: 'AiBI work profile scrubber',
    dataset: 'Work Profile Examples',
    reviewChecklist: ['No customer examples', 'No confidential bank plans', 'Tone guidance is concrete'],
    completeLine: 'The profile is useful without exposing customer, account, strategy, or confidential institution data.',
    incompleteLine: 'The profile should not be reusable until the sensitive context is removed and boundaries are explicit.',
    moves: [
      {
        id: 'role',
        label: 'Keep role context',
        short: 'Role and audience stay because they improve outputs.',
        missing: 'The model will not know the work context.',
        artifactLine: 'Role: community banking operator supporting branch, member-service, and manager-ready communication.',
      },
      {
        id: 'tone',
        label: 'Set tone',
        short: 'Tone guidance is concrete and reusable.',
        missing: 'The model may guess the voice.',
        artifactLine: 'Tone: concise, practical, plain-language, with action and owner visible early.',
      },
      {
        id: 'strip',
        label: 'Strip examples',
        short: 'Customer, account, and confidential examples are removed.',
        missing: 'The profile still contains sensitive examples.',
        artifactLine: 'Never include: customer names, account numbers, private complaints, confidential staffing, or strategy details.',
      },
      {
        id: 'boundary',
        label: 'Add boundary',
        short: 'The profile says when to stop and verify.',
        missing: 'The next user may treat draft output as final.',
        artifactLine: 'Boundary: produce drafts only; a human verifies policy, numbers, and any customer-impacting language.',
      },
    ],
  },
  5: {
    moduleNumber: 5,
    testId: 'foundation-project-brief-builder',
    eyebrow: 'Build scoped context',
    title: 'Project Brief Builder',
    description: 'Turn a vague rollout request into bounded context AI can reuse without drifting.',
    scoreLabel: 'Brief',
    badLabel: 'Vague request',
    badWay:
      'Help with the AI rollout. Make it good for everyone, include anything important, and draft what leadership needs.',
    previewLabel: 'Reusable brief preview',
    artifactHeading: 'Project Brief Template',
    model: 'AiBI project brief builder',
    dataset: 'Project Brief Scenario',
    reviewChecklist: ['Project data is sanitized', 'Out-of-scope work is explicit', 'Reviewer is named'],
    completeLine: 'The brief is scoped enough for another teammate to reuse and review.',
    incompleteLine: 'The brief needs audience, source, constraints, success metric, and reviewer before reuse.',
    moves: [
      {
        id: 'goal',
        label: 'Define goal',
        short: 'The work has one outcome.',
        missing: 'The model will expand the project on its own.',
        artifactLine: 'Goal: produce a manager-ready rollout brief for one approved internal AI use case.',
      },
      {
        id: 'audience',
        label: 'Name audience',
        short: 'The reader and decision level are clear.',
        missing: 'The output may aim at the wrong reader.',
        artifactLine: 'Audience: department manager and compliance reviewer, not customers or public distribution.',
      },
      {
        id: 'source',
        label: 'Bound source',
        short: 'The model only uses sanitized source material.',
        missing: 'The model may invent context or pull from unsafe material.',
        artifactLine: 'Source: sanitized process notes and approved policy excerpts only.',
      },
      {
        id: 'constraint',
        label: 'Set constraints',
        short: 'Out-of-scope work and review owner are named.',
        missing: 'Scope creep and review gaps stay hidden.',
        artifactLine: 'Constraints: no customer data, no legal conclusions, no launch approval; reviewer: named manager.',
      },
      {
        id: 'metric',
        label: 'Add success metric',
        short: 'The brief says what good looks like.',
        missing: 'The team cannot judge whether the draft helped.',
        artifactLine: 'Success metric: reviewer can identify action, owner, risk, and next step in under two minutes.',
      },
    ],
  },
  6: {
    moduleNumber: 6,
    testId: 'foundation-document-workflow-builder',
    eyebrow: 'Build source discipline',
    title: 'Document Workflow Builder',
    description: 'Repair a weak file prompt so unsupported answers are surfaced instead of invented.',
    scoreLabel: 'Source',
    badLabel: 'Weak file prompt',
    badWay:
      'Read this policy PDF and summarize the important stuff. Fill in anything missing from your general knowledge and make it sound complete.',
    previewLabel: 'Source-grounded workflow preview',
    artifactHeading: 'Document Workflow Prompt',
    model: 'AiBI document workflow builder',
    dataset: 'Source-Grounded Workflow',
    reviewChecklist: ['Source-only instruction is present', 'Citations or references are required', 'Reviewer checks claims against source'],
    completeLine: 'The workflow forces source-only answers, visible gaps, and human verification.',
    incompleteLine: 'The workflow is still vulnerable to unsupported claims until every source control is present.',
    moves: [
      {
        id: 'source-only',
        label: 'Source only',
        short: 'The model cannot answer from general knowledge.',
        missing: 'The model may fill gaps from memory.',
        artifactLine: 'Use only the provided document. Do not use general knowledge to fill missing information.',
      },
      {
        id: 'narrow',
        label: 'Ask narrowly',
        short: 'The question is bounded to the task.',
        missing: 'The output may become a broad essay.',
        artifactLine: 'Extract only owner, deadline, required action, exception, and evidence source.',
      },
      {
        id: 'cite',
        label: 'Require reference',
        short: 'Each claim points back to the source.',
        missing: 'The reviewer cannot trace claims.',
        artifactLine: 'For every claim, include section/page reference or quote label from the source.',
      },
      {
        id: 'gap',
        label: 'Name gaps',
        short: 'Missing answers become review flags.',
        missing: 'Unsupported gaps can look complete.',
        artifactLine: 'If the answer is not in the source, write "not found in source" and flag for review.',
      },
      {
        id: 'review',
        label: 'Add verification',
        short: 'A person checks the final summary.',
        missing: 'The model output may bypass human review.',
        artifactLine: 'Reviewer checks all dates, thresholds, and policy claims before circulation.',
      },
    ],
  },
  8: {
    moduleNumber: 8,
    testId: 'foundation-workflow-map-builder',
    eyebrow: 'Build the control path',
    title: 'Workflow Control Map',
    description: 'Place human checkpoints before customer-impacting or money-moving steps.',
    scoreLabel: 'Controls',
    badLabel: 'Unsafe automation flow',
    badWay:
      'Customer complaint arrives -> AI drafts response -> AI sends response -> monthly QA samples a few cases.',
    previewLabel: 'Controlled workflow preview',
    artifactHeading: 'Workflow Map',
    model: 'AiBI workflow control mapper',
    dataset: 'Workflow Map Scenario',
    reviewChecklist: ['AI never owns the decision', 'Handoffs are named', 'Blocked actions are explicit'],
    completeLine: 'The workflow shows the happy path, failure path, human owner, and retained evidence.',
    incompleteLine: 'The workflow is not deployable until decision, send, and failure controls are visible.',
    moves: [
      {
        id: 'trigger',
        label: 'Name trigger',
        short: 'The workflow starts from a specific event.',
        missing: 'The process begins too vaguely to control.',
        artifactLine: 'Trigger: sanitized customer complaint or internal request enters the approved intake queue.',
      },
      {
        id: 'assist',
        label: 'Limit AI assist',
        short: 'AI drafts and organizes; it does not decide.',
        missing: 'AI may appear to own judgment.',
        artifactLine: 'AI assist: summarize facts, draft internal notes, and list missing evidence only.',
      },
      {
        id: 'checkpoint',
        label: 'Add checkpoint',
        short: 'A named human reviews before impact.',
        missing: 'Customer-facing work can leave without accountability.',
        artifactLine: 'Human checkpoint: named reviewer approves, edits, or rejects before any customer-facing action.',
      },
      {
        id: 'escalation',
        label: 'Add escalation',
        short: 'Red-zone issues route out of the flow.',
        missing: 'Exceptions can be handled by the wrong person.',
        artifactLine: 'Escalation: fees, disputes, credit, legal, compliance, or NPI issues move to approved process.',
      },
      {
        id: 'archive',
        label: 'Retain evidence',
        short: 'The workflow keeps a review trail.',
        missing: 'The team cannot audit what happened.',
        artifactLine: 'Archive: retain prompt, source, draft, edits, reviewer, decision, and final artifact.',
      },
    ],
  },
  10: {
    moduleNumber: 10,
    testId: 'foundation-role-use-case-builder',
    eyebrow: 'Build the role pilot',
    title: 'Role Use-Case Builder',
    description: 'Narrow a broad AI idea into one use case a manager can review, pilot, and govern.',
    scoreLabel: 'Use case',
    badLabel: 'Too broad to pilot',
    badWay:
      'Use AI to improve lending productivity across the department and make staff faster.',
    previewLabel: 'Role use-case card preview',
    artifactHeading: 'Role Use-Case Card',
    model: 'AiBI role use-case builder',
    dataset: 'Role Use-Case Scenarios',
    reviewChecklist: ['Input shape is sanitized', 'Reviewer checks the right failure mode', 'Escalation is clear'],
    completeLine: 'The use case is narrow, reviewable, and safe enough for a manager pilot discussion.',
    incompleteLine: 'The use case is not ready until input, AI work, reviewer, failure mode, and escalation are visible.',
    moves: [
      {
        id: 'role',
        label: 'Pick role',
        short: 'The use case names a department and daily task.',
        missing: 'A generic use case cannot be reviewed by a manager.',
        artifactLine: 'Role/task: lending staff prepare sanitized borrower-meeting notes from approved templates.',
      },
      {
        id: 'input',
        label: 'Shape input',
        short: 'Input is sanitized and repeatable.',
        missing: 'The team may paste raw files or customer data.',
        artifactLine: 'Input: redacted meeting purpose, approved product notes, and placeholder borrower facts only.',
      },
      {
        id: 'ai-task',
        label: 'Limit AI task',
        short: 'AI drafts support material, not a decision.',
        missing: 'The AI task may drift into regulated judgment.',
        artifactLine: 'AI task: draft prep notes, questions to ask, and missing-information checklist.',
      },
      {
        id: 'reviewer',
        label: 'Name reviewer',
        short: 'A human owner checks the right thing.',
        missing: 'No one owns fact, tone, or policy review.',
        artifactLine: 'Reviewer: lender verifies facts, policy fit, and customer-facing language before use.',
      },
      {
        id: 'failure',
        label: 'Define failure',
        short: 'The card says what can go wrong.',
        missing: 'The pilot cannot measure risk.',
        artifactLine: 'Failure mode: invented borrower facts, unsupported policy claims, or implied credit recommendation.',
      },
      {
        id: 'escalate',
        label: 'Set escalation',
        short: 'Red-zone work routes out of the use case.',
        missing: 'Sensitive exceptions may stay in the pilot flow.',
        artifactLine: 'Escalate: credit decision, adverse action, NPI, or exception approval moves to approved process.',
      },
    ],
  },
  11: {
    moduleNumber: 11,
    testId: 'foundation-prompt-library-builder',
    eyebrow: 'Build reusable assets',
    title: 'Prompt Library Builder',
    description: 'Upgrade a one-off prompt into a managed library item with version, safety note, and example.',
    scoreLabel: 'Library',
    badLabel: 'One-off prompt',
    badWay:
      'Prompt: make this better. Saved in personal notes with no example, safety note, owner, or review date.',
    previewLabel: 'Managed prompt card preview',
    artifactHeading: 'Personal Prompt Library',
    model: 'AiBI prompt library builder',
    dataset: 'Prompt Library Samples',
    reviewChecklist: ['Each prompt has a safety note', 'Examples are sanitized', 'Stale prompts have a review cadence'],
    completeLine: 'The prompt card is reusable, inspectable, versioned, and safe to share with a colleague.',
    incompleteLine: 'The prompt is still a one-off until it has purpose, prompt text, safety note, example, and review cadence.',
    moves: [
      {
        id: 'name',
        label: 'Name asset',
        short: 'The library item has a clear use case.',
        missing: 'A colleague cannot tell when to use it.',
        artifactLine: 'Name/use case: staff email rewrite for internal action requests.',
      },
      {
        id: 'prompt',
        label: 'Write prompt',
        short: 'The prompt includes placeholders and output shape.',
        missing: 'The user still has to invent the prompt each time.',
        artifactLine: 'Prompt: rewrite redacted notes into action, owner, deadline, and human-review note.',
      },
      {
        id: 'safety',
        label: 'Add safety note',
        short: 'The card says what not to paste.',
        missing: 'Sensitive data could enter a repeat workflow.',
        artifactLine: 'Safety note: use placeholders only; do not paste customer names, account data, NPI, or confidential plans.',
      },
      {
        id: 'example',
        label: 'Add example',
        short: 'A sanitized before/after makes reuse easier.',
        missing: 'The prompt is hard to inspect or teach.',
        artifactLine: 'Example: [MEMBER] asks about [ACCOUNT REMOVED]; output keeps action and verification note.',
      },
      {
        id: 'version',
        label: 'Version it',
        short: 'The card has a version and review cadence.',
        missing: 'The team cannot tell whether the prompt is stale.',
        artifactLine: 'Version: v1.0; review monthly or when policy, process, or model behavior changes.',
      },
    ],
  },
  12: {
    moduleNumber: 12,
    testId: 'foundation-final-package-builder',
    eyebrow: 'Build the credential evidence',
    title: 'Final Package Builder',
    description: 'Assemble the evidence chain that proves AI-assisted work stayed human-owned.',
    scoreLabel: 'Package',
    badLabel: 'Thin final submission',
    badWay:
      'Submit the polished answer and say AI helped. No raw output, no source, no edits, and no safety boundary.',
    previewLabel: 'Foundation packet preview',
    artifactHeading: 'Foundation Packet Summary',
    model: 'AiBI final package builder',
    dataset: 'Foundation Packet Materials',
    reviewChecklist: ['Raw output is preserved', 'Human edits are annotated', 'Safe AI pledge is specific'],
    completeLine: 'The package lets a reviewer trace input, model work, human edits, verification, and safety judgment.',
    incompleteLine: 'The package is not credential-ready until the evidence chain and human ownership are visible.',
    moves: [
      {
        id: 'workflow',
        label: 'Name workflow',
        short: 'The submission starts with one bounded workflow.',
        missing: 'A reviewer cannot tell what work was performed.',
        artifactLine: 'Workflow: one repeatable banking task with audience, source, and success criteria named.',
      },
      {
        id: 'input',
        label: 'Show input',
        short: 'Sanitized input and prompt are preserved.',
        missing: 'The reviewer cannot inspect what the model received.',
        artifactLine: 'Input evidence: sanitized source, prompt, placeholders, and what-not-to-paste boundary.',
      },
      {
        id: 'raw',
        label: 'Keep raw output',
        short: 'The unedited AI output is visible.',
        missing: 'Human judgment cannot be distinguished from model output.',
        artifactLine: 'Raw output: preserved exactly enough for review, with sensitive data excluded.',
      },
      {
        id: 'edits',
        label: 'Annotate edits',
        short: 'Human changes are explained.',
        missing: 'The package does not prove ownership.',
        artifactLine: 'Human edits: facts checked, unsupported claims removed, tone adjusted, final artifact approved.',
      },
      {
        id: 'safety',
        label: 'State boundary',
        short: 'The package names the safety decision.',
        missing: 'The reviewer cannot see why the use was allowed.',
        artifactLine: 'Safety boundary: data zone, approved tool path, reviewer, escalation trigger, and retention note.',
      },
      {
        id: 'pledge',
        label: 'Add pledge',
        short: 'The learner commits to reuse rules.',
        missing: 'The packet lacks a forward-looking behavior commitment.',
        artifactLine: 'Pledge: I will verify facts, protect customer data, retain review evidence, and escalate red-zone work.',
      },
    ],
  },
};

function saveInteractiveDraft(payload: DraftPayload) {
  try {
    window.localStorage.setItem(`foundation-lab-draft-${payload.moduleId}`, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('foundation-lab-draft-updated', { detail: payload }));
  } catch {
    window.dispatchEvent(new CustomEvent('foundation-lab-draft-updated', { detail: payload }));
  }
}

function scanPrompt(text: string): SafetyHit[] {
  const hits: SafetyHit[] = [];
  for (const { kind, re } of SAFETY_PATTERNS) {
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(text))) {
      hits.push({ start: match.index, end: match.index + match[0].length, kind });
      if (match.index === re.lastIndex) re.lastIndex += 1;
    }
  }

  hits.sort((a, b) => a.start - b.start);
  const out: SafetyHit[] = [];
  let cursor = -1;
  for (const hit of hits) {
    if (hit.start >= cursor) {
      out.push(hit);
      cursor = hit.end;
    }
  }
  return out;
}

function safeRewrite(text: string): string {
  let cleaned = text;
  cleaned = cleaned.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');
  cleaned = cleaned.replace(/\b(?:acct|account)\s*#?\s*\d{3,}\b/gi, 'account [last 4]');
  cleaned = cleaned.replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, '[card]');
  cleaned = cleaned.replace(/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, '[email]');
  cleaned = cleaned.replace(
    /\b(?:and )?(?:go ahead and )?(waive|approve|deny|decline|refund|reverse|grant)\b/gi,
    'note whether to $1, pending approval',
  );
  cleaned = cleaned.replace(
    /\b(email|send)\b([^.]{0,44})\b(member|customer|borrower|client|her|him|them|directly)\b/gi,
    'prepare$2for human review before any send',
  );
  return `${cleaned.trim()} Use only fields provided; a person reviews and owns any decision before sending.`;
}

function HighlightedPrompt({ text, hits }: { readonly text: string; readonly hits: readonly SafetyHit[] }) {
  const parts: ReactNode[] = [];
  let cursor = 0;

  hits.forEach((hit, index) => {
    if (hit.start > cursor) {
      parts.push(<span key={`plain-${index}`}>{text.slice(cursor, hit.start)}</span>);
    }
    parts.push(
      <mark key={`hit-${index}`} className={`foundation-safety-highlight foundation-safety-highlight--${hit.kind}`}>
        {text.slice(hit.start, hit.end)}
      </mark>,
    );
    cursor = hit.end;
  });

  if (cursor < text.length) {
    parts.push(<span key="plain-end">{text.slice(cursor)}</span>);
  }

  return <>{parts}</>;
}

function buildEmailDraft(activeMoves: ReadonlySet<EmailMove>): string {
  const has = (move: EmailMove) => activeMoves.has(move);
  const subject = has('action')
    ? 'Subject: Action needed before Friday huddle'
    : 'Subject: Can someone look at this?';
  const opener = has('action')
    ? 'Please confirm whether the duplicate fee has been corrected and what staff should tell the member.'
    : 'The member is upset about the fee issue and needs a response.';
  const protectedLine = has('redact')
    ? 'Protected details: [MEMBER], [ACCOUNT REMOVED], and dollar amount carried only because it is needed for the fee review.'
    : 'Details still exposed: Maria, account 872399, duplicate $35 fee.';
  const owner = has('owner') ? 'Owner: Alex with Ops.' : 'Owner: [VERIFY].';
  const deadline = has('deadline') ? 'Deadline: before the Friday huddle.' : 'Deadline: [VERIFY].';
  const review = has('redact') && has('action')
    ? 'Human review: confirm the fee status in the approved system before any member-facing response.'
    : 'Human review: do not send until identifiers are removed and the action is clear.';

  return [subject, opener, owner, deadline, protectedLine, review].join('\n');
}

function UnusedEmailRewriteCoach({
  moduleId,
  artifactLabel,
}: Pick<ModuleInteractiveTakeawayProps, 'moduleId' | 'artifactLabel'>) {
  const [activeMoves, setActiveMoves] = useState<ReadonlySet<EmailMove>>(
    () => new Set<EmailMove>(['action']),
  );
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const score = EMAIL_MOVES.filter((move) => activeMoves.has(move.id)).length;
  const complete = score === EMAIL_MOVES.length;
  const draft = buildEmailDraft(activeMoves);

  function toggle(move: EmailMove) {
    setSavedAt(null);
    setActiveMoves((current) => {
      const next = new Set(current);
      if (next.has(move)) {
        next.delete(move);
      } else {
        next.add(move);
      }
      return next;
    });
  }

  function save() {
    const saved = new Date().toISOString();
    const content = `# Action-first email rewrite\n\n## Raw note\n${EMAIL_RAW_NOTE}\n\n## Rewritten draft\n${draft}\n\n## Review note\nClarity score ${score}/4. ${complete ? 'Identifiers are stripped, action, owner, and deadline are visible.' : 'Missing moves must be completed before reuse.'}`;
    const payload: DraftPayload = {
      moduleId,
      moduleNumber: 1,
      model: 'AiBI email rewrite coach',
      dataset: 'Messy Internal Email Drafts',
      savedAt: saved,
      reviewChecklist: ['No customer or account data', 'Action appears in the first two lines', 'Deadline and owner are explicit'],
      content,
    };
    saveInteractiveDraft(payload);
    setSavedAt(saved);
  }

  return (
    <section className="foundation-interactive-takeaway" data-testid="foundation-email-rewrite-coach">
      <div className="foundation-interactive-takeaway__head">
        <div>
          <p className="foundation-interactive-takeaway__eyebrow">Build the first reusable habit</p>
          <h3>Email Rewrite Coach</h3>
          <p>Turn a messy note into a safe internal action request before the general lab opens.</p>
        </div>
        <span className="foundation-interactive-score">Clarity {score}/4</span>
      </div>

      <div className="foundation-email-rewrite__workspace">
        <div className="foundation-tool-panel foundation-tool-panel--bad">
          <p className="foundation-tool-panel__label">Bad way</p>
          <p>{EMAIL_RAW_NOTE}</p>
        </div>

        <div className="foundation-takeaway-move-grid" aria-label="Rewrite moves">
          {EMAIL_MOVES.map((move) => {
            const active = activeMoves.has(move.id);
            return (
              <button
                key={move.id}
                type="button"
                aria-pressed={active}
                className="foundation-takeaway-toggle"
                onClick={() => toggle(move.id)}
              >
                <span>{move.label}</span>
                <small>{active ? move.short : move.missing}</small>
              </button>
            );
          })}
        </div>

        <div className={`foundation-tool-panel foundation-tool-panel--${complete ? 'good' : 'warn'}`}>
          <p className="foundation-tool-panel__label">Rewritten draft</p>
          <pre>{draft}</pre>
        </div>
      </div>

      <div className="foundation-interactive-takeaway__footer">
        <button type="button" onClick={save} disabled={!complete}>
          {savedAt ? 'Saved to packet draft' : complete ? `Save to ${artifactLabel}` : 'Complete the four moves to save'}
        </button>
        <p>{complete ? 'The draft is short, redacted, owned, and deadline-bound.' : 'The tool should make the missing judgment visible.'}</p>
      </div>
    </section>
  );
}

function verdictLabel(verdict: ClaimVerdict): string {
  if (verdict === 'verified') return 'Verified';
  if (verdict === 'unsupported') return 'Unsupported';
  return 'Wrong';
}

function UnusedClaimReviewWorkbench({
  moduleId,
  artifactLabel,
}: Pick<ModuleInteractiveTakeawayProps, 'moduleId' | 'artifactLabel'>) {
  const [verdicts, setVerdicts] = useState<Record<string, ClaimVerdict | undefined>>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const reviewed = CLAIM_REVIEW_ITEMS.filter((item) => verdicts[item.id]).length;
  const correct = CLAIM_REVIEW_ITEMS.filter((item) => verdicts[item.id] === item.expected).length;
  const complete = reviewed === CLAIM_REVIEW_ITEMS.length;

  function choose(itemId: string, verdict: ClaimVerdict) {
    setSavedAt(null);
    setVerdicts((current) => ({ ...current, [itemId]: verdict }));
  }

  function save() {
    const saved = new Date().toISOString();
    const rows = CLAIM_REVIEW_ITEMS.map((item) => {
      const selected = verdicts[item.id];
      return `| ${item.claim} | ${selected ? verdictLabel(selected) : 'Not reviewed'} | ${verdictLabel(item.expected)} | ${item.evidence} |`;
    }).join('\n');
    const content = `# AI Claim Review worksheet\n\n| Claim | Learner call | Expected call | Evidence needed |\n| --- | --- | --- | --- |\n${rows}\n\n## Habit to save\nI will treat numbers, dates, names, and policy claims as draft material until the source proves them.`;
    const payload: DraftPayload = {
      moduleId,
      moduleNumber: 2,
      model: 'AiBI claim review workbench',
      dataset: 'AI Claim Review Packet',
      savedAt: saved,
      reviewChecklist: ['Every number is checked', 'Every date is checked', 'Unsupported claims are labeled before reuse'],
      content,
    };
    saveInteractiveDraft(payload);
    setSavedAt(saved);
  }

  return (
    <section className="foundation-interactive-takeaway" data-testid="foundation-claim-review-workbench">
      <div className="foundation-interactive-takeaway__head">
        <div>
          <p className="foundation-interactive-takeaway__eyebrow">Build the verification habit</p>
          <h3>Claim Review Workbench</h3>
          <p>Classify each confident claim before it reaches a memo, board packet, or customer-facing draft.</p>
        </div>
        <span className="foundation-interactive-score">{correct}/{CLAIM_REVIEW_ITEMS.length} clean calls</span>
      </div>

      <div className="foundation-claim-review__workspace">
        {CLAIM_REVIEW_ITEMS.map((item, index) => {
          const selected = verdicts[item.id];
          const isCorrect = selected === item.expected;
          return (
            <div key={item.id} className="foundation-claim-card">
              <p className="foundation-tool-panel__label">Claim {index + 1}</p>
              <h4>{item.claim}</h4>
              <div className="foundation-claim-card__choices" aria-label={`Verdict for claim ${index + 1}`}>
                {CLAIM_VERDICTS.map((verdict) => (
                  <button
                    key={verdict}
                    type="button"
                    aria-pressed={selected === verdict}
                    className="foundation-claim-choice"
                    onClick={() => choose(item.id, verdict)}
                  >
                    {verdictLabel(verdict)}
                  </button>
                ))}
              </div>
              <div
                className={`foundation-tool-panel foundation-tool-panel--${!selected ? 'warn' : isCorrect ? 'good' : 'bad'}`}
              >
                <p className="foundation-tool-panel__label">
                  {!selected ? 'Evidence check' : isCorrect ? 'Good call' : 'Recheck'}
                </p>
                <p>{selected ? item.evidence : 'Pick the claim status, then compare it to the source evidence.'}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="foundation-interactive-takeaway__footer">
        <button type="button" onClick={save} disabled={!complete}>
          {savedAt ? 'Saved to packet draft' : complete ? `Save to ${artifactLabel}` : 'Review all claims to save'}
        </button>
        <p>{complete ? 'The worksheet now shows the evidence habit, not just the answer.' : 'Adult learning starts with the decision before the explanation.'}</p>
      </div>
    </section>
  );
}

function UnusedStructuredBuilderTool({
  moduleId,
  artifactLabel,
  config,
}: Pick<ModuleInteractiveTakeawayProps, 'moduleId' | 'artifactLabel'> & {
  readonly config: StructuredBuilderConfig;
}) {
  const [activeMoves, setActiveMoves] = useState<ReadonlySet<string>>(
    () => new Set<string>([config.moves[0]?.id ?? '']),
  );
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const score = config.moves.filter((move) => activeMoves.has(move.id)).length;
  const complete = score === config.moves.length;
  const previewLines = config.moves.map((move) => ({
    ...move,
    active: activeMoves.has(move.id),
  }));

  function toggle(moveId: string) {
    setSavedAt(null);
    setActiveMoves((current) => {
      const next = new Set(current);
      if (next.has(moveId)) {
        next.delete(moveId);
      } else {
        next.add(moveId);
      }
      return next;
    });
  }

  function save() {
    const saved = new Date().toISOString();
    const body = previewLines
      .map((line) => `- ${line.active ? line.artifactLine : `[VERIFY] ${line.label}: ${line.missing}`}`)
      .join('\n');
    const content = `# ${config.artifactHeading}\n\n## Bad way\n${config.badWay}\n\n## Built artifact\n${body}\n\n## Review note\n${config.scoreLabel} score ${score}/${config.moves.length}. ${complete ? config.completeLine : config.incompleteLine}`;
    const payload: DraftPayload = {
      moduleId,
      moduleNumber: config.moduleNumber,
      model: config.model,
      dataset: config.dataset,
      savedAt: saved,
      reviewChecklist: config.reviewChecklist,
      content,
    };
    saveInteractiveDraft(payload);
    setSavedAt(saved);
  }

  return (
    <section className="foundation-interactive-takeaway" data-testid={config.testId}>
      <div className="foundation-interactive-takeaway__head">
        <div>
          <p className="foundation-interactive-takeaway__eyebrow">{config.eyebrow}</p>
          <h3>{config.title}</h3>
          <p>{config.description}</p>
        </div>
        <span className="foundation-interactive-score">
          {config.scoreLabel} {score}/{config.moves.length}
        </span>
      </div>

      <div className="foundation-structured-builder__workspace">
        <div className="foundation-tool-panel foundation-tool-panel--bad">
          <p className="foundation-tool-panel__label">{config.badLabel}</p>
          <p>{config.badWay}</p>
        </div>

        <div className="foundation-structured-builder__moves" aria-label={`${config.title} controls`}>
          {config.moves.map((move) => {
            const active = activeMoves.has(move.id);
            return (
              <button
                key={move.id}
                type="button"
                aria-pressed={active}
                className="foundation-takeaway-toggle"
                onClick={() => toggle(move.id)}
              >
                <span>{move.label}</span>
                <small>{active ? move.short : move.missing}</small>
              </button>
            );
          })}
        </div>

        <div className={`foundation-tool-panel foundation-tool-panel--${complete ? 'good' : 'warn'}`}>
          <p className="foundation-tool-panel__label">{config.previewLabel}</p>
          <ul className="foundation-structured-preview-list">
            {previewLines.map((line) => (
              <li key={line.id} data-active={line.active ? 'true' : 'false'}>
                <strong>{line.active ? line.label : `${line.label} missing`}</strong>
                <span>{line.active ? line.artifactLine : line.missing}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="foundation-interactive-takeaway__footer">
        <button type="button" onClick={save} disabled={!complete}>
          {savedAt ? 'Saved to packet draft' : complete ? `Save to ${artifactLabel}` : 'Complete all controls to save'}
        </button>
        <p>{complete ? config.completeLine : config.incompleteLine}</p>
      </div>
    </section>
  );
}

function UnusedCorePromptBuilder({ moduleId, artifactLabel }: Pick<ModuleInteractiveTakeawayProps, 'moduleId' | 'artifactLabel'>) {
  const scenario = WIZARD_SCENARIOS[0];
  const [activeKeys, setActiveKeys] = useState<ReadonlySet<CoreKey>>(
    () => new Set<CoreKey>(['context', 'objective']),
  );
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const score = scenario.elements.filter((element) => activeKeys.has(element.key)).length;
  const complete = score === scenario.elements.length;

  function toggle(key: CoreKey) {
    setSavedAt(null);
    setActiveKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const promptText = scenario.elements
    .filter((element) => activeKeys.has(element.key))
    .map((element) => CORE_PROMPT_COPY[element.key])
    .join('\n\n');
  const answerText = scenario.elements
    .map((element) => (activeKeys.has(element.key) ? element.good : element.bad))
    .join(' ');

  function save() {
    const saved = new Date().toISOString();
    const content = `# CORE prompt card\n\n## Use case\n${scenario.memberQuestion}\n\n## Prompt\n${promptText}\n\n## Source\n${scenario.sourceLabel}: ${scenario.sourceMaterial}\n\n## Review note\nCORE ${score}/4. ${complete ? scenario.winLine : 'Missing CORE elements must be added before reuse.'}\n\n## Model preview\n${answerText}`;
    const payload: DraftPayload = {
      moduleId,
      moduleNumber: 3,
      model: 'AiBI CORE prompt builder',
      dataset: scenario.title,
      savedAt: saved,
      reviewChecklist: ['Task is specific', 'Sensitive data is represented by placeholders', 'Escalation or review rule is included'],
      content,
    };
    saveInteractiveDraft(payload);
    setSavedAt(saved);
  }

  return (
    <section className="foundation-interactive-takeaway" data-testid="foundation-core-builder">
      <div className="foundation-interactive-takeaway__head">
        <div>
          <p className="foundation-interactive-takeaway__eyebrow">Build the reusable tool</p>
          <h3>CORE Prompt Builder</h3>
          <p>Toggle the missing prompt parts and watch the answer improve before you save it.</p>
        </div>
        <span className="foundation-interactive-score">CORE {score}/4</span>
      </div>

      <div className="foundation-core-builder__workspace">
        <div className="foundation-core-builder__toggles" aria-label="CORE prompt parts">
          {scenario.elements.map((element) => {
            const active = activeKeys.has(element.key);
            return (
              <button
                key={element.key}
                type="button"
                aria-pressed={active}
                className="foundation-core-toggle"
                onClick={() => toggle(element.key)}
              >
                <span>{element.label}</span>
                <small>{active ? element.oneLiner : element.missingHint}</small>
              </button>
            );
          })}
        </div>

        <div className="foundation-core-builder__preview">
          <div className="foundation-tool-panel">
            <p className="foundation-tool-panel__label">Your prompt</p>
            <pre>{promptText || 'Select CORE parts to assemble the prompt.'}</pre>
          </div>
          <div className={`foundation-tool-panel foundation-tool-panel--${complete ? 'good' : score >= 3 ? 'warn' : 'bad'}`}>
            <p className="foundation-tool-panel__label">
              Simulated answer - {complete ? 'Grounded' : score >= 3 ? 'Close' : 'Risky'}
            </p>
            <p>{answerText}</p>
          </div>
        </div>
      </div>

      <div className="foundation-interactive-takeaway__footer">
        <button type="button" onClick={save} disabled={!complete}>
          {savedAt ? 'Saved to packet draft' : complete ? `Save to ${artifactLabel}` : 'Add all CORE parts to save'}
        </button>
        <p>{complete ? scenario.winLine : 'The answer should visibly fail until the source and review rule are present.'}</p>
      </div>
    </section>
  );
}

function UnusedPromptSafetyCheck({ moduleId, artifactLabel }: Pick<ModuleInteractiveTakeawayProps, 'moduleId' | 'artifactLabel'>) {
  const [text, setText] = useState(SAFETY_SAMPLES[0].text);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const hits = useMemo(() => scanPrompt(text), [text]);
  const kinds = useMemo(() => new Set(hits.map((hit) => hit.kind)), [hits]);
  const level = kinds.has('pii') || kinds.has('action') ? 'red' : kinds.has('send') ? 'yellow' : 'green';
  const levelLabel =
    level === 'red' ? 'Red - do not run' : level === 'yellow' ? 'Yellow - review first' : 'Green - usable with review';
  const issueKinds = Array.from(kinds);
  const rewrite = safeRewrite(text);

  function save() {
    const saved = new Date().toISOString();
    const content = `# Prompt Safety Check\n\n## Original prompt\n${text}\n\n## Verdict\n${levelLabel}\n\n## Issues\n${issueKinds.length > 0 ? issueKinds.map((kind) => `- ${ISSUE_COPY[kind].title}: ${ISSUE_COPY[kind].body}`).join('\n') : '- No PII or red-zone action detected. Human review still required.'}\n\n## Safer version\n${rewrite}`;
    const payload: DraftPayload = {
      moduleId,
      moduleNumber: 9,
      model: 'AiBI prompt safety check',
      dataset: 'Prompt Safety Check samples',
      savedAt: saved,
      reviewChecklist: ['Customer data is stripped', 'Decision boundary is clear', 'Reviewer is named'],
      content,
    };
    saveInteractiveDraft(payload);
    setSavedAt(saved);
  }

  return (
    <section className="foundation-interactive-takeaway" data-testid="foundation-safety-check">
      <div className="foundation-interactive-takeaway__head">
        <div>
          <p className="foundation-interactive-takeaway__eyebrow">Run the reusable tool</p>
          <h3>Prompt Safety Check</h3>
          <p>Paste a prompt, spot unsafe inputs, and save the safer version to your packet.</p>
        </div>
        <span className={`foundation-safety-verdict foundation-safety-verdict--${level}`}>{levelLabel}</span>
      </div>

      <div className="foundation-safety-check__samples" aria-label="Sample prompts">
        {SAFETY_SAMPLES.map((sample) => (
          <button
            key={sample.label}
            type="button"
            onClick={() => {
              setText(sample.text);
              setSavedAt(null);
            }}
          >
            {sample.label}
          </button>
        ))}
      </div>

      <div className="foundation-safety-check__workspace">
        <label className="foundation-safety-check__input">
          <span>Your prompt</span>
          <textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setSavedAt(null);
            }}
            rows={7}
          />
        </label>

        <div className="foundation-tool-panel foundation-tool-panel--scan">
          <p className="foundation-tool-panel__label">Safety scan</p>
          <p className="foundation-safety-scan-text">
            <HighlightedPrompt text={text} hits={hits} />
          </p>
          <div className="foundation-safety-issues">
            {issueKinds.length > 0 ? (
              issueKinds.map((kind) => (
                <div key={kind}>
                  <strong>{ISSUE_COPY[kind].title}</strong>
                  <span>{ISSUE_COPY[kind].body}</span>
                </div>
              ))
            ) : (
              <div>
                <strong>No flagged pattern</strong>
                <span>Still review the source, facts, and final output before use.</span>
              </div>
            )}
          </div>
          <div className="foundation-safety-rewrite">
            <p className="foundation-tool-panel__label">Safer version</p>
            <p>{rewrite}</p>
          </div>
        </div>
      </div>

      <div className="foundation-interactive-takeaway__footer">
        <button type="button" onClick={save}>
          {savedAt ? 'Saved to packet draft' : `Save to ${artifactLabel}`}
        </button>
        <p>Runs locally in the lesson. No sample prompt is sent to a model.</p>
      </div>
    </section>
  );
}

interface ToolChoiceAnswer {
  readonly category?: ToolCategory;
  readonly zone?: ToolZone;
}

function UnusedToolChoiceSorter({
  moduleId,
  artifactLabel,
}: Pick<ModuleInteractiveTakeawayProps, 'moduleId' | 'artifactLabel'>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ToolChoiceAnswer>>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const activeTask = TOOL_CHOICE_TASKS[activeIndex] ?? TOOL_CHOICE_TASKS[0];
  const activeAnswer = answers[activeTask.id] ?? {};
  const answered = TOOL_CHOICE_TASKS.filter((task) => answers[task.id]?.category && answers[task.id]?.zone).length;
  const score = TOOL_CHOICE_TASKS.filter((task) => {
    const answer = answers[task.id];
    return answer?.category === task.correctCategory && answer.zone === task.correctZone;
  }).length;
  const complete = answered === TOOL_CHOICE_TASKS.length;
  const activeCorrect =
    activeAnswer.category === activeTask.correctCategory && activeAnswer.zone === activeTask.correctZone;
  const activeAnswered = Boolean(activeAnswer.category && activeAnswer.zone);

  function updateAnswer(next: ToolChoiceAnswer) {
    setSavedAt(null);
    setAnswers((current) => ({
      ...current,
      [activeTask.id]: {
        ...current[activeTask.id],
        ...next,
      },
    }));
  }

  function save() {
    const saved = new Date().toISOString();
    const rows = TOOL_CHOICE_TASKS.map((task) => {
      const answer = answers[task.id] ?? {};
      return `| ${task.task} | ${answer.category ? TOOL_CATEGORY_LABEL[answer.category] : 'Not selected'} | ${answer.zone ? TOOL_ZONE_LABEL[answer.zone] : 'Not selected'} | ${TOOL_CATEGORY_LABEL[task.correctCategory]} / ${TOOL_ZONE_LABEL[task.correctZone]} | ${task.reason} |`;
    }).join('\n');
    const content = `# Tool Choice Map\n\n| Task | Chosen tool path | Data zone | Model answer | Reason |\n| --- | --- | --- | --- | --- |\n${rows}\n\n## Reuse rule\nCapability does not equal approval. Match the work to source, data class, and approved tool before prompting.`;
    const payload: DraftPayload = {
      moduleId,
      moduleNumber: 7,
      model: 'AiBI tool choice sorter',
      dataset: 'Tool Choice Scenarios',
      savedAt: saved,
      reviewChecklist: ['Tool category matches the task', 'Data zone is named before prompting', 'Approval and capability are treated separately'],
      content,
    };
    saveInteractiveDraft(payload);
    setSavedAt(saved);
  }

  return (
    <section className="foundation-interactive-takeaway" data-testid="foundation-tool-choice-sorter">
      <div className="foundation-interactive-takeaway__head">
        <div>
          <p className="foundation-interactive-takeaway__eyebrow">Build the decision map</p>
          <h3>Tool Choice Sorter</h3>
          <p>Pick the tool path and data zone before the task reaches a prompt window.</p>
        </div>
        <span className="foundation-interactive-score">{score}/{TOOL_CHOICE_TASKS.length} mapped</span>
      </div>

      <div className="foundation-tool-choice__workspace">
        <div className="foundation-tool-choice__queue" aria-label="Tool-choice tasks">
          {TOOL_CHOICE_TASKS.map((task, index) => {
            const answer = answers[task.id];
            const done = Boolean(answer?.category && answer.zone);
            const correct = answer?.category === task.correctCategory && answer.zone === task.correctZone;
            return (
              <button
                key={task.id}
                type="button"
                aria-pressed={index === activeIndex}
                className="foundation-tool-choice__queue-item"
                onClick={() => setActiveIndex(index)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{task.task}</strong>
                <small>{done ? (correct ? 'Mapped' : 'Needs review') : 'Not mapped'}</small>
              </button>
            );
          })}
        </div>

        <div className="foundation-tool-choice__decision">
          <div className="foundation-tool-panel">
            <p className="foundation-tool-panel__label">Task</p>
            <h4>{activeTask.task}</h4>
          </div>

          <div className="foundation-tool-choice__options">
            <div>
              <p className="foundation-tool-panel__label">Tool path</p>
              <div className="foundation-tool-choice__button-grid">
                {(Object.keys(TOOL_CATEGORY_LABEL) as ToolCategory[]).map((category) => (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={activeAnswer.category === category}
                    className="foundation-claim-choice"
                    onClick={() => updateAnswer({ category })}
                  >
                    {TOOL_CATEGORY_LABEL[category]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="foundation-tool-panel__label">Data zone</p>
              <div className="foundation-tool-choice__button-grid foundation-tool-choice__button-grid--zones">
                {(Object.keys(TOOL_ZONE_LABEL) as ToolZone[]).map((zone) => (
                  <button
                    key={zone}
                    type="button"
                    aria-pressed={activeAnswer.zone === zone}
                    className="foundation-claim-choice"
                    onClick={() => updateAnswer({ zone })}
                  >
                    {TOOL_ZONE_LABEL[zone]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`foundation-tool-panel foundation-tool-panel--${!activeAnswered ? 'warn' : activeCorrect ? 'good' : 'bad'}`}>
            <p className="foundation-tool-panel__label">
              {!activeAnswered ? 'Feedback' : activeCorrect ? 'Good fit' : 'Review the match'}
            </p>
            <p>
              {activeAnswered
                ? activeTask.reason
                : 'Choose both the tool path and the data zone. The reason appears after your decision.'}
            </p>
          </div>
        </div>
      </div>

      <div className="foundation-interactive-takeaway__footer">
        <button type="button" onClick={save} disabled={!complete}>
          {savedAt ? 'Saved to packet draft' : complete ? `Save to ${artifactLabel}` : `${answered}/${TOOL_CHOICE_TASKS.length} tasks mapped`}
        </button>
        <p>{complete ? 'The map is ready to reuse before the next AI task.' : 'Make the routing decision before the prompt.'}</p>
      </div>
    </section>
  );
}

function MicroModuleTakeawayBuilder({
  moduleNumber,
  moduleId,
  artifactLabel,
}: ModuleInteractiveTakeawayProps) {
  const brief = getFoundationLabBrief(moduleNumber);
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const steps = useMemo<readonly MicroTakeawayStep[]>(() => {
    if (!brief) return [];
    return [
      { id: 'try', label: 'Try', value: brief.labTask },
      { id: 'build', label: 'Build', value: brief.artifactAction },
      {
        id: 'review',
        label: 'Review',
        value: brief.reviewChecklist[0] ?? brief.learningLoop.feedbackCue,
      },
      { id: 'transfer', label: 'Use at work', value: brief.learningLoop.transferPrompt },
    ];
  }, [brief]);

  if (!brief) return null;

  const selectedSet = new Set(selected);
  const previewLines = steps.filter((step) => selectedSet.has(step.id));
  const complete = steps.length > 0 && selected.length === steps.length;

  const toggle = (id: string) => {
    setSavedAt(null);
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const save = () => {
    if (!complete) return;
    const saved = new Date().toISOString();
    const content = [
      `# Module ${moduleNumber} - ${artifactLabel}`,
      '',
      '## What you built',
      brief.outcome,
      '',
      '## Builder Moves',
      ...steps.map((step) => `- **${step.label}:** ${step.value}`),
      '',
      '## Banking Guardrail',
      brief.referenceLabel,
      '',
      '## Quality Check',
      ...brief.qualitySignals.map((signal) => `- ${signal}`),
    ].join('\n');

    saveInteractiveDraft({
      moduleId,
      moduleNumber,
      model: 'AiBI micro-module takeaway builder',
      dataset: brief.referenceLabel,
      savedAt: saved,
      reviewChecklist: brief.reviewChecklist,
      content,
    });
    setSavedAt(saved);
  };

  return (
    <section
      className="foundation-interactive-takeaway foundation-interactive-takeaway--micro"
      data-testid="foundation-micro-takeaway-builder"
      aria-label={`Module ${moduleNumber} takeaway builder`}
    >
      <div className="foundation-interactive-takeaway__head">
        <div>
          <p className="foundation-kicker">Micro takeaway</p>
          <h3>{artifactLabel}</h3>
          <p>{brief.outcome}</p>
        </div>
        <div className="foundation-score-badge">
          <span>{selected.length}/{steps.length}</span>
          <small>moves</small>
        </div>
      </div>

      <div className="foundation-interactive-takeaway__body foundation-micro-builder">
        <div className="foundation-micro-builder__steps" aria-label="Takeaway moves">
          {steps.map((step) => {
            const active = selectedSet.has(step.id);
            return (
              <button
                key={step.id}
                type="button"
                className={active ? 'is-active' : undefined}
                onClick={() => toggle(step.id)}
                aria-pressed={active}
              >
                <span>{step.label}</span>
                <strong>{step.value}</strong>
              </button>
            );
          })}
        </div>

        <div className="foundation-micro-builder__preview">
          <p className="foundation-kicker">Packet preview</p>
          <h4>{artifactLabel}</h4>
          {previewLines.length > 0 ? (
            <ul>
              {previewLines.map((step) => (
                <li key={step.id}>
                  <span>{step.label}</span>
                  {step.value}
                </li>
              ))}
            </ul>
          ) : (
            <p>Select each move to assemble the packet draft for this module.</p>
          )}
          <div>
            <span>Guardrail</span>
            <strong>{brief.referenceLabel}</strong>
          </div>
        </div>
      </div>

      <div className="foundation-interactive-takeaway__footer">
        <button type="button" onClick={save} disabled={!complete}>
          {savedAt ? 'Saved to packet draft' : complete ? `Save to ${artifactLabel}` : 'Select the four moves'}
        </button>
        <p>
          {complete
            ? 'This takeaway is ready to carry into Build and Save.'
            : 'One action, one artifact, one review rule.'}
        </p>
      </div>
    </section>
  );
}

export function ModuleInteractiveTakeaway({
  moduleNumber,
  moduleId,
  artifactLabel,
}: ModuleInteractiveTakeawayProps) {
  return (
    <MicroModuleTakeawayBuilder
      moduleNumber={moduleNumber}
      moduleId={moduleId}
      artifactLabel={artifactLabel}
    />
  );
}

export function ModuleInteractiveTakeawayStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          .foundation-interactive-takeaway {
            display: grid;
            gap: 18px;
            margin: 0 0 18px;
            border: 1px solid var(--ink-a10);
            border-radius: 18px;
            background: #fff;
            box-shadow: var(--shadow-soft);
            overflow: hidden;
            font-family: ${FONT_STACK};
          }
          .foundation-interactive-takeaway__head {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 18px;
            align-items: start;
            padding: clamp(18px, 2.4vw, 24px);
            background: var(--cream-2);
            border-bottom: 1px solid var(--ink-a10);
          }
          .foundation-interactive-takeaway__head h3 {
            margin: 0;
            color: var(--ink);
            font-size: clamp(24px, 2.4vw, 34px);
            line-height: 1.05;
            font-weight: 850;
            letter-spacing: 0;
          }
          .foundation-interactive-takeaway__head p:last-child {
            margin: 8px 0 0;
            color: var(--slate-600);
            font-size: 15px;
            line-height: 1.45;
            font-weight: 650;
            max-width: 62ch;
          }
          .foundation-interactive-takeaway__eyebrow,
          .foundation-tool-panel__label {
            margin: 0 0 8px;
            color: var(--gold-deep);
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.17em;
            text-transform: uppercase;
          }
          .foundation-interactive-score,
          .foundation-safety-verdict {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 38px;
            border-radius: 999px;
            padding: 0 14px;
            background: var(--ink);
            color: #fff;
            font-size: 12px;
            font-weight: 850;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            white-space: nowrap;
          }
          .foundation-core-builder__workspace,
          .foundation-safety-check__workspace {
            display: grid;
            grid-template-columns: minmax(260px, 0.38fr) minmax(0, 0.62fr);
            gap: 18px;
            padding: 0 clamp(18px, 2.4vw, 24px);
          }
          .foundation-email-rewrite__workspace {
            display: grid;
            grid-template-columns: minmax(220px, 0.28fr) minmax(240px, 0.32fr) minmax(0, 0.4fr);
            gap: 14px;
            padding: 0 clamp(18px, 2.4vw, 24px);
          }
          .foundation-claim-review__workspace {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
            padding: 0 clamp(18px, 2.4vw, 24px);
          }
          .foundation-tool-choice__workspace {
            display: grid;
            grid-template-columns: minmax(230px, 0.34fr) minmax(0, 0.66fr);
            gap: 16px;
            padding: 0 clamp(18px, 2.4vw, 24px);
          }
          .foundation-structured-builder__workspace {
            display: grid;
            grid-template-columns: minmax(220px, 0.28fr) minmax(240px, 0.32fr) minmax(0, 0.4fr);
            gap: 14px;
            padding: 0 clamp(18px, 2.4vw, 24px);
          }
          .foundation-structured-builder__moves {
            display: grid;
            gap: 10px;
            align-content: start;
          }
          .foundation-structured-preview-list {
            display: grid;
            gap: 9px;
            margin: 0;
            padding: 0;
            list-style: none;
          }
          .foundation-structured-preview-list li {
            display: grid;
            gap: 3px;
            border: 1px solid var(--ink-a10);
            border-radius: 12px;
            background: #fff;
            padding: 10px 12px;
          }
          .foundation-structured-preview-list li[data-active="false"] {
            background: var(--cream);
            opacity: 0.78;
          }
          .foundation-structured-preview-list strong {
            color: var(--ink);
            font-size: 13px;
            line-height: 1.22;
            font-weight: 850;
          }
          .foundation-structured-preview-list span {
            color: var(--slate-600);
            font-size: 12.5px;
            line-height: 1.35;
            font-weight: 650;
          }
          .foundation-tool-choice__queue {
            display: grid;
            gap: 9px;
            align-content: start;
          }
          .foundation-tool-choice__queue-item {
            display: grid;
            grid-template-columns: 34px minmax(0, 1fr);
            gap: 10px;
            align-items: start;
            border: 1px solid var(--ink-a10);
            border-radius: 14px;
            background: #fff;
            padding: 11px 12px;
            color: var(--ink);
            text-align: left;
            cursor: pointer;
            font-family: ${FONT_STACK};
          }
          .foundation-tool-choice__queue-item[aria-pressed="true"] {
            border-color: var(--ink);
            background: var(--ink);
            color: #fff;
          }
          .foundation-tool-choice__queue-item span {
            display: grid;
            width: 30px;
            height: 30px;
            place-items: center;
            border-radius: 999px;
            background: var(--cream);
            color: var(--gold-deep);
            font-size: 11px;
            font-weight: 900;
          }
          .foundation-tool-choice__queue-item[aria-pressed="true"] span {
            background: var(--gold);
            color: var(--ink);
          }
          .foundation-tool-choice__queue-item strong {
            color: inherit;
            font-size: 13px;
            line-height: 1.25;
            font-weight: 850;
          }
          .foundation-tool-choice__queue-item small {
            grid-column: 2;
            color: inherit;
            opacity: 0.72;
            font-size: 11px;
            line-height: 1.2;
            font-weight: 750;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
          .foundation-tool-choice__decision {
            display: grid;
            gap: 12px;
            align-content: start;
          }
          .foundation-tool-choice__decision h4 {
            margin: 0;
            color: var(--ink);
            font-size: clamp(22px, 2vw, 30px);
            line-height: 1.08;
            font-weight: 850;
            letter-spacing: 0;
          }
          .foundation-tool-choice__options {
            display: grid;
            grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.75fr);
            gap: 12px;
          }
          .foundation-tool-choice__button-grid {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 7px;
          }
          .foundation-tool-choice__button-grid--zones {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .foundation-core-builder__toggles {
            display: grid;
            gap: 10px;
          }
          .foundation-core-toggle,
          .foundation-takeaway-toggle {
            display: grid;
            gap: 6px;
            border: 1px solid var(--ink-a10);
            border-radius: 14px;
            background: var(--cream);
            padding: 13px 14px;
            text-align: left;
            color: var(--ink);
            cursor: pointer;
            font-family: ${FONT_STACK};
          }
          .foundation-core-toggle[aria-pressed="true"],
          .foundation-takeaway-toggle[aria-pressed="true"] {
            background: var(--ink);
            color: #fff;
            border-color: var(--ink);
          }
          .foundation-core-toggle span,
          .foundation-takeaway-toggle span {
            font-size: 14px;
            font-weight: 850;
            line-height: 1.2;
          }
          .foundation-core-toggle small,
          .foundation-takeaway-toggle small {
            color: inherit;
            opacity: 0.76;
            font-size: 12px;
            line-height: 1.35;
            font-weight: 650;
          }
          .foundation-takeaway-move-grid {
            display: grid;
            gap: 10px;
          }
          .foundation-core-builder__preview {
            display: grid;
            gap: 12px;
          }
          .foundation-tool-panel {
            border: 1px solid var(--ink-a10);
            border-radius: 16px;
            background: #fff;
            padding: 16px;
            color: var(--ink);
          }
          .foundation-tool-panel pre {
            white-space: pre-wrap;
            margin: 0;
            color: var(--ink);
            font-family: ${FONT_STACK};
            font-size: 14px;
            line-height: 1.5;
            font-weight: 700;
          }
          .foundation-claim-card {
            display: grid;
            gap: 12px;
            border: 1px solid var(--ink-a10);
            border-radius: 16px;
            background: #fff;
            padding: 16px;
            min-width: 0;
          }
          .foundation-claim-card h4 {
            margin: 0;
            color: var(--ink);
            font-size: 17px;
            line-height: 1.25;
            font-weight: 850;
            letter-spacing: 0;
          }
          .foundation-claim-card__choices {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 7px;
          }
          .foundation-claim-choice {
            min-height: 38px;
            border: 1px solid var(--ink-a10);
            border-radius: 10px;
            background: var(--cream);
            color: var(--ink);
            font-family: ${FONT_STACK};
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            cursor: pointer;
          }
          .foundation-claim-choice[aria-pressed="true"] {
            background: var(--ink);
            color: #fff;
            border-color: var(--ink);
          }
          .foundation-tool-panel > p:last-child,
          .foundation-safety-rewrite p:last-child,
          .foundation-safety-scan-text {
            margin: 0;
            color: var(--ink);
            font-size: 15px;
            line-height: 1.55;
            font-weight: 680;
          }
          .foundation-tool-panel--good {
            border-color: rgba(4, 120, 87, 0.36);
            background: #ecfdf5;
          }
          .foundation-tool-panel--warn {
            border-color: var(--gold-a40);
            background: var(--cream);
          }
          .foundation-tool-panel--bad {
            border-color: rgba(185, 28, 28, 0.2);
            background: #fff7f7;
          }
          .foundation-interactive-takeaway--micro {
            border-radius: 16px;
          }
          .foundation-micro-builder {
            display: grid;
            grid-template-columns: minmax(0, 1.05fr) minmax(280px, 0.95fr);
            gap: 16px;
            padding: 0 clamp(18px, 2.4vw, 24px);
          }
          .foundation-micro-builder__steps {
            display: grid;
            gap: 10px;
          }
          .foundation-micro-builder__steps button {
            display: grid;
            grid-template-columns: 92px minmax(0, 1fr);
            gap: 14px;
            align-items: start;
            width: 100%;
            min-height: 70px;
            text-align: left;
            border: 1px solid var(--ink-a10);
            border-radius: 14px;
            background: var(--cream);
            padding: 14px;
            color: var(--ink);
            font-family: ${FONT_STACK};
            cursor: pointer;
          }
          .foundation-micro-builder__steps button.is-active {
            border-color: var(--gold);
            background: var(--gold-a10);
          }
          .foundation-micro-builder__steps button span,
          .foundation-micro-builder__preview > div span,
          .foundation-micro-builder__preview li span {
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--gold-deep);
          }
          .foundation-micro-builder__steps button strong {
            font-size: 15px;
            line-height: 1.4;
            font-weight: 760;
            color: var(--ink);
          }
          .foundation-micro-builder__preview {
            display: grid;
            align-content: start;
            gap: 12px;
            border: 1px solid var(--ink-a10);
            border-radius: 16px;
            background: #fff;
            padding: 18px;
          }
          .foundation-micro-builder__preview h4 {
            margin: 0;
            font-size: clamp(20px, 2vw, 26px);
            line-height: 1.1;
            color: var(--ink);
            letter-spacing: 0;
          }
          .foundation-micro-builder__preview p {
            margin: 0;
            color: var(--slate-600);
            font-size: 15px;
            line-height: 1.5;
            font-weight: 620;
          }
          .foundation-micro-builder__preview ul {
            display: grid;
            gap: 10px;
            padding: 0;
            margin: 0;
            list-style: none;
          }
          .foundation-micro-builder__preview li,
          .foundation-micro-builder__preview > div {
            display: grid;
            gap: 5px;
            border-top: 1px solid var(--ink-a10);
            padding-top: 10px;
            color: var(--ink);
            font-size: 14px;
            line-height: 1.45;
            font-weight: 680;
          }
          .foundation-interactive-takeaway__footer {
            display: grid;
            grid-template-columns: auto minmax(0, 1fr);
            gap: 14px;
            align-items: center;
            padding: 0 clamp(18px, 2.4vw, 24px) clamp(18px, 2.4vw, 24px);
          }
          .foundation-interactive-takeaway__footer button {
            min-height: 44px;
            border: 1px solid var(--ink);
            border-radius: 12px;
            background: var(--ink);
            color: #fff;
            padding: 0 18px;
            font-family: ${FONT_STACK};
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            cursor: pointer;
          }
          .foundation-interactive-takeaway__footer button:disabled {
            border-color: var(--ink-a10);
            background: var(--slate-100);
            color: var(--slate-500);
            cursor: not-allowed;
          }
          .foundation-interactive-takeaway__footer p {
            margin: 0;
            color: var(--slate-600);
            font-size: 13px;
            line-height: 1.4;
            font-weight: 650;
          }
          .foundation-safety-check__samples {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            padding: 0 clamp(18px, 2.4vw, 24px);
          }
          .foundation-safety-check__samples button {
            border: 1px solid var(--ink-a10);
            border-radius: 999px;
            background: var(--cream);
            color: var(--ink);
            padding: 9px 13px;
            font-family: ${FONT_STACK};
            font-size: 12px;
            font-weight: 800;
            cursor: pointer;
          }
          .foundation-safety-check__input {
            display: grid;
            gap: 8px;
          }
          .foundation-safety-check__input span {
            color: var(--gold-deep);
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.17em;
            text-transform: uppercase;
          }
          .foundation-safety-check__input textarea {
            width: 100%;
            resize: vertical;
            border: 1px solid var(--ink-a10);
            border-radius: 16px;
            background: #fff;
            color: var(--ink);
            padding: 14px;
            font-family: ${FONT_STACK};
            font-size: 15px;
            line-height: 1.5;
            outline-color: var(--gold-deep);
          }
          .foundation-safety-verdict--green {
            background: #047857;
          }
          .foundation-safety-verdict--yellow {
            background: var(--gold);
            color: var(--ink);
          }
          .foundation-safety-verdict--red {
            background: #991b1b;
          }
          .foundation-safety-highlight {
            border-radius: 5px;
            padding: 1px 3px;
            font-weight: 850;
          }
          .foundation-safety-highlight--pii {
            background: #fee2e2;
            color: #7f1d1d;
          }
          .foundation-safety-highlight--action {
            background: #fef3c7;
            color: #713f12;
          }
          .foundation-safety-highlight--send {
            background: #dbeafe;
            color: #1e3a8a;
          }
          .foundation-safety-issues {
            display: grid;
            gap: 8px;
            margin: 14px 0;
          }
          .foundation-safety-issues div {
            display: grid;
            gap: 3px;
            border: 1px solid var(--ink-a10);
            border-radius: 12px;
            background: var(--cream-2);
            padding: 10px 12px;
          }
          .foundation-safety-issues strong {
            color: var(--ink);
            font-size: 13px;
            line-height: 1.25;
          }
          .foundation-safety-issues span {
            color: var(--slate-600);
            font-size: 12px;
            line-height: 1.35;
            font-weight: 650;
          }
          .foundation-safety-rewrite {
            border-top: 1px solid var(--ink-a10);
            padding-top: 13px;
          }
          @media (max-width: 860px) {
            .foundation-interactive-takeaway__head,
            .foundation-core-builder__workspace,
            .foundation-email-rewrite__workspace,
            .foundation-claim-review__workspace,
            .foundation-tool-choice__workspace,
            .foundation-structured-builder__workspace,
            .foundation-micro-builder,
            .foundation-safety-check__workspace,
            .foundation-interactive-takeaway__footer {
              grid-template-columns: 1fr;
            }
            .foundation-micro-builder__steps button {
              grid-template-columns: 1fr;
            }
            .foundation-tool-choice__options,
            .foundation-tool-choice__button-grid {
              grid-template-columns: 1fr;
            }
            .foundation-interactive-score,
            .foundation-safety-verdict {
              justify-self: start;
            }
            .foundation-interactive-takeaway__footer button {
              width: 100%;
            }
          }
        `,
      }}
    />
  );
}
