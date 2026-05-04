import { describe, it, expect } from 'vitest';
import { validateSkill } from './validateSkill';

describe('validateSkill — workflow kind (default)', () => {
  it('accepts a minimal workflow payload and defaults kind', () => {
    const result = validateSkill({
      cmd: '/credit-memo',
      name: 'Credit Memo Drafter',
      desc: 'Drafts a credit memo from a loan application.',
    });
    expect(result).not.toBeNull();
    expect(result!.kind).toBe('workflow');
    expect(result!.cmd).toBe('/credit-memo');
  });

  it('rejects when cmd does not start with slash', () => {
    expect(validateSkill({ cmd: 'credit-memo', name: 'X', desc: 'Y' })).toBeNull();
  });

  it('rejects when name is too short', () => {
    expect(validateSkill({ cmd: '/x', name: 'A', desc: 'Y' })).toBeNull();
  });

  it('preserves arrays for files / connectors / steps / guardrails', () => {
    const result = validateSkill({
      cmd: '/x',
      name: 'Test Skill',
      desc: 'd',
      files: ['/policies/'],
      connectors: ['Google Drive'],
      steps: ['Step one', 'Step two'],
      guardrails: ['Never decide'],
    });
    expect(result).not.toBeNull();
    if (result!.kind !== 'workflow') throw new Error('expected workflow');
    expect(result!.files).toEqual(['/policies/']);
    expect(result!.connectors).toEqual(['Google Drive']);
    expect(result!.steps).toEqual(['Step one', 'Step two']);
    expect(result!.guardrails).toEqual(['Never decide']);
  });
});

describe('validateSkill — template kind', () => {
  const goodTemplate = {
    kind: 'template' as const,
    cmd: '/denial-letter',
    name: 'Denial Letter Drafter',
    desc: 'Drafts an ECOA-compliant adverse action letter.',
    systemPrompt:
      'You are a community-bank loan officer assistant. Use plain language at an 8th-grade level.',
    userPromptTemplate:
      'Write an adverse action letter for {{applicant_name}}. Reasons: {{denial_reasons}}.',
    variables: [
      { name: 'applicant_name', label: 'Applicant Name', type: 'text', required: true },
      { name: 'denial_reasons', label: 'Denial Reasons', type: 'textarea', required: true },
    ],
  };

  it('accepts a valid template payload', () => {
    const result = validateSkill(goodTemplate);
    expect(result).not.toBeNull();
    expect(result!.kind).toBe('template');
    if (result!.kind !== 'template') throw new Error('expected template');
    expect(result!.variables).toHaveLength(2);
    expect(result!.variables[0].name).toBe('applicant_name');
  });

  it('rejects when systemPrompt is missing', () => {
    const { systemPrompt: _omit, ...rest } = goodTemplate;
    expect(validateSkill(rest)).toBeNull();
  });

  it('rejects when userPromptTemplate is missing', () => {
    const { userPromptTemplate: _omit, ...rest } = goodTemplate;
    expect(validateSkill(rest)).toBeNull();
  });

  it('rejects when systemPrompt is too short (<20 chars)', () => {
    expect(validateSkill({ ...goodTemplate, systemPrompt: 'short' })).toBeNull();
  });

  it('drops invalid variables silently', () => {
    const result = validateSkill({
      ...goodTemplate,
      variables: [
        { name: 'ok', label: 'OK', type: 'text', required: false },
        { name: '', label: 'Bad — empty name', type: 'text', required: false },
        { name: 'bad_type', label: 'Bad type', type: 'image', required: false },
      ],
    });
    expect(result).not.toBeNull();
    if (result!.kind !== 'template') throw new Error('expected template');
    expect(result!.variables).toHaveLength(1);
    expect(result!.variables[0].name).toBe('ok');
  });
});
