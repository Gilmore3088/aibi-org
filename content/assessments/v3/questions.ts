// AiBI Readiness Snapshot — v3 Question Pool (INDIVIDUAL VOICE)
//
// 12 questions, one per signal. Total score range 12–48 (1–4 per question).
// Source: docs/Plans/_assets/aibi-assessment-architecture-2026-05-28.md
// Section 3 — "Free Assessment: 12 Readiness Signals" + Section 1's note
// that the free assessment is a screening tool, not a deep diagnostic.
//
// Voice is second-person and individual. The respondent answers about
// THEIR OWN day-to-day AI work, not their institution's policies. If a
// question reads like "does your bank have X?", rewrite it to "do you
// know/do X?" before merging.

import type { AssessmentQuestion } from './types';

export const questions: readonly AssessmentQuestion[] = [
  {
    id: 'sv-01',
    dimension: 'strategic-value',
    prompt: 'When you reach for AI in your work, is it tied to a specific problem you are trying to solve?',
    options: [
      { label: 'I have not found a specific problem AI helps me with yet.', points: 1 },
      { label: 'I try AI sometimes, but it is not tied to any real task.', points: 2 },
      { label: 'I use AI on two or three specific tasks where it saves me time.', points: 3 },
      { label: 'I use AI on named tasks where I can measure the time or quality difference.', points: 4 },
    ],
  },
  {
    id: 'atp-01',
    dimension: 'approved-tool-path',
    prompt: 'Do you know which AI tools you are allowed to use for work?',
    options: [
      { label: 'I am not sure what is approved — I use whatever I find online.', points: 1 },
      { label: 'I have a rough sense, but I have never seen an official list.', points: 2 },
      { label: 'I know the main approved tools and I stick to them most of the time.', points: 3 },
      { label: 'I work entirely inside approved tools and know who to ask before trying anything new.', points: 4 },
    ],
  },
  {
    id: 'dsr-01',
    dimension: 'data-safety-reflexes',
    prompt: 'Do you know what kinds of information you should never paste into an AI tool?',
    options: [
      { label: 'I have not thought about it — I paste whatever I need help with.', points: 1 },
      { label: 'I avoid the obvious things like full account numbers, but I am not sure beyond that.', points: 2 },
      { label: 'I strip identifiers, balances, and customer details before I paste anything.', points: 3 },
      { label: 'I follow a clear data-handling rule and know when to switch to an approved internal tool.', points: 4 },
    ],
  },
  {
    id: 'ps-01',
    dimension: 'prompting-skill',
    prompt: 'When you ask AI for something, do you get a useful, structured answer the first time?',
    options: [
      { label: 'Usually no — the answers are generic and I give up.', points: 1 },
      { label: 'Sometimes — it depends on how I word it.', points: 2 },
      { label: 'Most of the time — I have learned a few patterns that work.', points: 3 },
      { label: 'Reliably — I can ask AI to follow a format, cite sources, and check its own work.', points: 4 },
    ],
  },
  {
    id: 'rf-01',
    dimension: 'role-fit',
    prompt: 'Have you connected AI to specific tasks in your role, not just general curiosity?',
    options: [
      { label: 'No — I am mostly experimenting with AI in general.', points: 1 },
      { label: 'A little — I have used AI on one or two role-specific tasks.', points: 2 },
      { label: 'Yes — I have three or four named role-specific tasks where AI helps.', points: 3 },
      { label: 'Yes — AI is part of how I do my actual job, and I can describe exactly where.', points: 4 },
    ],
  },
  {
    id: 'hr-01',
    dimension: 'human-review',
    prompt: 'When you use AI to draft something for work, do you have a review step before it gets used?',
    options: [
      { label: 'No — if it looks right, I use it.', points: 1 },
      { label: 'I reread it, but no one else checks it.', points: 2 },
      { label: 'I review it carefully, and high-stakes items get a second pair of eyes.', points: 3 },
      { label: 'I follow a named review path — I know which items need a second reviewer and who that is.', points: 4 },
    ],
  },
  {
    id: 'doc-01',
    dimension: 'documentation',
    prompt: 'Could you show someone exactly what you asked AI and what it gave back?',
    options: [
      { label: 'No — once I am done, the conversation is gone.', points: 1 },
      { label: 'For some items, if I happened to save the chat.', points: 2 },
      { label: 'For most important items — I save the prompt and the output.', points: 3 },
      { label: 'Yes — I keep prompts, outputs, and edits in a place a reviewer or examiner could see.', points: 4 },
    ],
  },
  {
    id: 'va-01',
    dimension: 'vendor-awareness',
    prompt: 'Do you know which of the vendor tools you already use have AI features inside them?',
    options: [
      { label: 'No — I had not really thought about it.', points: 1 },
      { label: 'I know one or two, but I am sure there are more.', points: 2 },
      { label: 'I know most of them and what data each one sees.', points: 3 },
      { label: 'Yes — I can name the AI features in each tool and what the vendor does with our data.', points: 4 },
    ],
  },
  {
    id: 'cia-01',
    dimension: 'customer-impact-awareness',
    prompt: 'Do you know when AI touches a customer or a regulated decision in your work?',
    options: [
      { label: 'No — I have not mapped that out.', points: 1 },
      { label: 'I have a rough idea, but I am not always sure where the line is.', points: 2 },
      { label: 'Yes — I know which of my AI uses touch a customer or regulated decision and I treat those differently.', points: 3 },
      { label: 'Yes — and I know which compliance rules (ECOA, UDAAP, BSA, fair lending) apply to those uses.', points: 4 },
    ],
  },
  {
    id: 'wr-01',
    dimension: 'workflow-readiness',
    prompt: 'For your repeated work, can you describe the steps from input, to AI draft, to your review, to the final output?',
    options: [
      { label: 'No — every time I use AI it is ad hoc.', points: 1 },
      { label: 'I have a rough mental model, but nothing written down.', points: 2 },
      { label: 'Yes — for two or three recurring tasks, I have a clear step-by-step.', points: 3 },
      { label: 'Yes — I can hand my workflow to a colleague and they could pick it up.', points: 4 },
    ],
  },
  {
    id: 'tc-01',
    dimension: 'training-culture',
    prompt: 'Are you being taught safe, practical AI use at work — or are you figuring it out alone?',
    options: [
      { label: 'I am completely on my own.', points: 1 },
      { label: 'There is some general training, but nothing tied to my role.', points: 2 },
      { label: 'I get role-specific guidance and examples I can apply directly.', points: 3 },
      { label: 'I get role-specific training, examples, and coaching, and I know who to ask when I am stuck.', points: 4 },
    ],
  },
  {
    id: 'lv-01',
    dimension: 'leadership-visibility',
    prompt: 'Do you know what your leadership tracks about AI use, and how your work fits in?',
    options: [
      { label: 'I have no idea what leadership sees or wants.', points: 1 },
      { label: 'I know they care about it, but not what they actually measure.', points: 2 },
      { label: 'I know the high-level goals and roughly how my AI use connects.', points: 3 },
      { label: 'I know exactly what is measured, how my work contributes, and where the gaps still are.', points: 4 },
    ],
  },
];
