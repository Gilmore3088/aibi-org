import { describe, expect, it } from 'vitest';
import {
  promptCardToToolboxSkill,
  playgroundMessagesToToolboxSkill,
  libraryEntryToToolboxSkill,
} from './save-mappers';

describe('promptCardToToolboxSkill', () => {
  const prompt = {
    id: 'p-001',
    title: 'Draft a denial letter (ECOA)',
    role: 'lender',
    relatedModule: 3,
    promptText: 'You are a community banker...',
    expectedOutput: 'A 1-page ECOA-compliant denial letter.',
    whenToUse: 'When a credit application is declined.',
    whatNotToPaste: 'Real applicant PII.',
    platform: 'claude',
    difficulty: 'intermediate',
    timeEstimate: '5 min',
  } as const;

  it('produces a template-kind skill with course provenance', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const skill = promptCardToToolboxSkill(prompt as any, 'user-1');
    expect(skill.kind).toBe('template');
    expect(skill.source).toBe('course');
    expect(skill.sourceRef).toBe('aibi-p/module-3/p-001');
    if (skill.kind !== 'template') throw new Error('expected template');
    expect(skill.userPromptTemplate).toContain('You are a community banker');
    expect(skill.desc.length).toBeGreaterThan(0);
    expect(skill.owner).toBe('user-1');
  });
});

describe('playgroundMessagesToToolboxSkill', () => {
  it('preserves the source skill kind (workflow) and appends a sample', () => {
    const sourceSkill = {
      kind: 'workflow',
      id: 'src-id',
      cmd: '/credit-memo',
      name: 'Credit Memo',
      purpose: 'p',
      success: 's',
      files: [],
      connectors: [],
      questions: 'q',
      steps: ['s1'],
      guardrails: ['g1'],
      customGuard: '',
      output: 'Markdown',
      tone: 'Professional',
      length: 'Concise',
      samples: [],
      version: '1.0',
      maturity: 'draft',
      owner: 'me',
      dept: 'Lending',
      deptFull: 'Lending',
      difficulty: 'beginner',
      timeSaved: 'varies',
      cadence: 'as needed',
      desc: 'd',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    const messages = [
      { role: 'user', content: 'Run on this loan.' },
      { role: 'assistant', content: '...output...' },
    ] as const;
    const out = playgroundMessagesToToolboxSkill({ skill: sourceSkill, messages, userId: 'u1' });
    expect(out.kind).toBe('workflow');
    expect(out.source).toBe('user');
    expect(out.owner).toBe('u1');
    if (out.kind !== 'workflow') throw new Error();
    expect(out.samples?.length).toBeGreaterThan(0);
    expect(out.samples[out.samples.length - 1].prompt).toContain('Run on this loan');
  });

  it('preserves the source skill kind (template) and populates example', () => {
    const sourceSkill = {
      kind: 'template',
      id: 'src-id',
      cmd: '/x',
      name: 'X',
      systemPrompt: 'sys',
      userPromptTemplate: 'Write {{kind}}.',
      variables: [{ name: 'kind', label: 'Kind', type: 'text', required: true }],
      version: '1.0',
      maturity: 'draft',
      owner: 'me',
      dept: 'General',
      deptFull: 'General',
      difficulty: 'beginner',
      timeSaved: 'varies',
      cadence: 'as needed',
      desc: 'd',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    const messages = [
      { role: 'user', content: 'Write memo.' },
      { role: 'assistant', content: 'Here is your memo: ...' },
    ] as const;
    const out = playgroundMessagesToToolboxSkill({ skill: sourceSkill, messages, userId: 'u1' });
    expect(out.kind).toBe('template');
    expect(out.owner).toBe('u1');
    if (out.kind !== 'template') throw new Error();
    expect(out.example?.input).toBeDefined();
    expect(out.example?.output).toContain('memo');
  });
});

describe('libraryEntryToToolboxSkill', () => {
  it('produces a forked-source skill referencing the version', () => {
    const entry = {
      id: 'lib-1',
      slug: 'denial-letter',
      kind: 'template',
      title: 'Denial Letter',
      description: 'd',
      systemPrompt: 'sp',
      userPromptTemplate: 'tmpl',
      variables: [],
      pillar: 'B',
      category: 'Lending',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    const out = libraryEntryToToolboxSkill(entry, 'u1', 'ver-7');
    expect(out.source).toBe('forked');
    expect(out.sourceRef).toBe('library:lib-1@ver-7');
    expect(out.kind).toBe('template');
    expect(out.owner).toBe('u1');
  });

  it('honors recipeSourceRef override when provided', () => {
    const entry = {
      id: 'lib-1',
      slug: 'denial-letter',
      kind: 'template',
      title: 'Denial Letter',
      description: 'd',
      systemPrompt: 'sp',
      userPromptTemplate: 'tmpl',
      variables: [],
      pillar: 'B',
      category: 'Lending',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    const out = libraryEntryToToolboxSkill(entry, 'u1', 'ver-7', 'cookbook:loan-memo#step-2');
    expect(out.source).toBe('forked');
    expect(out.sourceRef).toBe('cookbook:loan-memo#step-2');
  });
});
