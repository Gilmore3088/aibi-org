// Static reference data + shared styles for /courses/foundation/program/toolkit.

import type { CSSProperties } from 'react';

export const PLATFORM_LABELS: Record<string, string> = {
  'chatgpt-access': 'ChatGPT (OpenAI)',
  'claude-access': 'Claude (Anthropic)',
  'gemini-access': 'Gemini (Google)',
  'copilot-access': 'Microsoft 365 Copilot',
  'perplexity-access': 'Perplexity',
  'notebooklm-access': 'NotebookLM (Google)',
  'copilot-free-access': 'Microsoft Copilot (Free)',
};

export const ACCESS_LABELS: Record<string, string> = {
  free: 'Free tier',
  paid: 'Paid subscription',
  'not-sure': 'Not sure',
  none: 'Not using',
  institutional: 'Institutional license (IT-provisioned)',
  'not-provisioned': 'Not provisioned for me',
};

// Dev-mode placeholder used when Supabase is not configured.
export const DEV_ACTIVITY_RESPONSES: Record<string, Record<string, string>> = {
  '2.1': {
    'chatgpt-access': 'paid',
    'claude-access': 'free',
    'gemini-access': 'none',
    'copilot-access': 'not-provisioned',
    'perplexity-access': 'none',
    'notebooklm-access': 'free',
    'copilot-free-access': 'free',
  },
  '7.1': {
    'skill-role':
      'You are a senior compliance officer at a community bank with expertise in BSA/AML regulations and staff training.',
    'skill-context':
      'The bank needs to translate dense regulatory guidance into plain-language FAQs for frontline staff who handle BSA-related customer interactions.',
    'skill-task':
      'Analyze the provided regulatory guidance document and produce a structured FAQ of 8–12 questions with plain-language answers suitable for frontline staff with no compliance background.',
    'skill-format': 'numbered-list',
    'skill-constraint':
      'Never fabricate regulatory citations. Flag any threshold, deadline, or penalty amount for human verification. Use plain language — avoid legal jargon. Maximum 2 sentences per answer.',
    'skill-md-content':
      '# Compliance Officer Skill - v1.0\n\n## Role\nYou are a senior compliance officer at a community bank with expertise in BSA/AML regulations and staff training.\n\n## Context\nThe bank needs to translate dense regulatory guidance into plain-language FAQs for frontline staff who handle BSA-related customer interactions.\n\n## Task\nAnalyze the provided regulatory guidance document and produce a structured FAQ of 8–12 questions with plain-language answers suitable for frontline staff with no compliance background.\n\n## Format\nNumbered list\n\n## Constraints\nNever fabricate regulatory citations. Flag any threshold, deadline, or penalty amount for human verification. Use plain language — avoid legal jargon. Maximum 2 sentences per answer.\n',
  },
  '8.1': {
    'test-input-1':
      'BSA Officer Memo from October 2025 re: updated CTR filing thresholds and structuring detection requirements.',
    'output-assessment-1':
      'Performed well overall. The FAQ structure was clean and staff-readable. One failure: the AI generated a specific dollar threshold without flagging it for verification — a direct violation of the Constraints component.',
    'test-input-2':
      'CFPB guidance on UDAP/UDAAP plain-language disclosure requirements. More ambiguous and less structured than a BSA memo.',
    'output-assessment-2':
      'Constraints gap exposed: the skill did not handle ambiguous source documents well. The AI presented interpretations as facts rather than flagging them as areas requiring legal review.',
    'revision-notes':
      'Added a Constraint: "If the source document contains ambiguous language or interpretations, present them as areas requiring legal review — never as definitive rules." Also strengthened the task definition to explicitly require flagging all specific dollar amounts, dates, and thresholds.',
    'sharing-ladder-level': 'team',
  },
  '9.capstone': {
    'automation-what':
      'Automated the first draft of BSA regulatory FAQ documents for frontline staff training.',
    'automation-tier': 'Tier B — Requires compliance officer review before distribution',
    'quality-standard': 'passed',
  },
};

export const kickerStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

export const sectionCardStyle: CSSProperties = {
  background: 'var(--cream-2)',
  border: '1px solid var(--ink-a10)',
  borderRadius: 24,
  padding: 28,
  marginBottom: 24,
  boxShadow: 'var(--shadow-soft)',
};

export interface CountSummary {
  readonly prompts: number;
  readonly workProducts: number;
  readonly cards: number;
  readonly inventories: number;
  readonly reports: number;
}

export function buildCountLine(c: CountSummary): string {
  const parts: string[] = [];
  if (c.prompts > 0) parts.push(`${c.prompts} saved prompt${c.prompts === 1 ? '' : 's'}`);
  if (c.workProducts > 0)
    parts.push(`${c.workProducts} reviewed work product${c.workProducts === 1 ? '' : 's'}`);
  if (c.cards > 0) parts.push(`${c.cards} Acceptable Use card${c.cards === 1 ? '' : 's'}`);
  if (c.inventories > 0)
    parts.push(`${c.inventories} subscription inventor${c.inventories === 1 ? 'y' : 'ies'}`);
  if (c.reports > 0)
    parts.push(`${c.reports} transformation report${c.reports === 1 ? '' : 's'}`);
  return parts.join(' · ');
}
