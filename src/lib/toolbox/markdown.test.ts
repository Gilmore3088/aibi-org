import { describe, it, expect } from 'vitest';
import { buildToolboxSystemPrompt } from './markdown';
import type { ToolboxWorkflowSkill, ToolboxTemplateSkill } from './types';

const baseCommon = {
  id: 'sk_1',
  cmd: '/test',
  name: 'Test Skill',
  dept: 'Compliance',
  deptFull: 'Compliance & BSA/AML',
  difficulty: 'beginner' as const,
  timeSaved: '~1 hr',
  cadence: 'As needed',
  desc: 'Short description.',
  owner: 'Role owner',
  maturity: 'draft' as const,
  version: '1.0',
};

describe('buildToolboxSystemPrompt — workflow kind', () => {
  it('composes the prompt from purpose/questions/steps/guardrails', () => {
    const skill: ToolboxWorkflowSkill = {
      ...baseCommon,
      kind: 'workflow',
      purpose: 'Help with regulatory exam prep.',
      success: 'A 1-page summary.',
      files: [],
      connectors: [],
      questions: 'What is the exam date?',
      steps: ['Read policies', 'Draft summary'],
      output: 'Markdown',
      tone: 'Professional',
      length: 'Concise',
      guardrails: ['Never make final decisions'],
      customGuard: '',
      samples: [],
    };
    const prompt = buildToolboxSystemPrompt(skill);
    expect(prompt).toContain('Test Skill');
    expect(prompt).toContain('Help with regulatory exam prep.');
    expect(prompt).toContain('1. Read policies');
    expect(prompt).toContain('Never make final decisions');
  });

  it('uses systemPromptOverride verbatim when set', () => {
    const skill: ToolboxWorkflowSkill = {
      ...baseCommon,
      kind: 'workflow',
      purpose: 'IGNORED',
      success: '',
      files: [],
      connectors: [],
      questions: '',
      steps: [],
      output: 'Markdown',
      tone: 'Professional',
      length: 'Concise',
      guardrails: [],
      customGuard: '',
      samples: [],
      systemPromptOverride: 'You are a pirate. Speak only in pirate.',
    };
    const prompt = buildToolboxSystemPrompt(skill);
    expect(prompt).toBe('You are a pirate. Speak only in pirate.');
  });
});

describe('buildToolboxSystemPrompt — template kind', () => {
  it('returns systemPrompt verbatim and ignores workflow fields', () => {
    const skill: ToolboxTemplateSkill = {
      ...baseCommon,
      kind: 'template',
      systemPrompt:
        'You are a community-bank loan officer assistant. ' +
        'Use plain language at an 8th-grade reading level. Cite ECOA reason codes only.',
      userPromptTemplate:
        'Write an adverse action letter for {{applicant_name}}. ' +
        'Reasons: {{denial_reasons}}.',
      variables: [
        { name: 'applicant_name', label: 'Applicant Name', type: 'text', required: true },
        { name: 'denial_reasons', label: 'Denial Reasons', type: 'textarea', required: true },
      ],
    };
    const prompt = buildToolboxSystemPrompt(skill);
    expect(prompt).toContain('community-bank loan officer assistant');
    expect(prompt).toContain('ECOA reason codes');
    expect(prompt).not.toContain('PURPOSE');     // workflow-only header
    expect(prompt).not.toContain('WORKFLOW');    // workflow-only header
  });
});
