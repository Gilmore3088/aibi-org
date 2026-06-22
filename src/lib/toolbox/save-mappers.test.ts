import { describe, expect, it } from 'vitest';
import { FOUNDATION_MICRO_MODULES } from '@content/courses/foundation-program/micro-modules';
import {
  courseArtifactToToolboxSkill,
  promptCardToToolboxSkill,
  playgroundMessagesToToolboxSkill,
  libraryEntryToToolboxSkill,
} from './save-mappers';

describe('courseArtifactToToolboxSkill', () => {
  const promptTemplateModules = new Set([2, 4, 5, 6, 8, 9, 10]);

  it('turns a completed workflow module artifact into a workflow skill with course provenance', () => {
    const skill = courseArtifactToToolboxSkill(
      {
        moduleNumber: 15,
        activityId: '15.1',
        artifactName: 'Human Review Gate Card',
        readiness: 'reuse',
        reviewNote: 'Reviewer can stop the output before it reaches a customer.',
        transferPlan: 'Use this on the next AI-assisted branch procedure update.',
        fields: [
          {
            id: 'paused_work',
            label: 'Paused work',
            value: 'AI drafts the first branch procedure update.',
          },
          {
            id: 'escalation_trigger',
            label: 'Escalation trigger',
            value: 'Stop if the draft includes unsupported policy claims.',
          },
        ],
      },
      'user-1',
    );

    expect(skill.kind).toBe('workflow');
    if (skill.kind !== 'workflow') throw new Error('expected workflow');
    expect(skill.cmd).toBe('/foundation-m15-human-review-gate-card');
    expect(skill.name).toBe('M15: Human Review Gate Card');
    expect(skill.source).toBe('course');
    expect(skill.sourceRef).toBe('aibi-p/module-15/15.1');
    expect(skill.owner).toBe('user-1');
    expect(skill.maturity).toBe('pilot');
    expect(skill.steps.join('\n')).toContain('Paused work');
    expect(skill.guardrails.join('\n')).toContain('human review');
    expect(skill.samples[0]?.prompt).toContain('AI drafts the first branch procedure update');
  });

  it('turns a prompt-builder module artifact into a reusable template skill', () => {
    const skill = courseArtifactToToolboxSkill(
      {
        moduleNumber: 9,
        activityId: '9.1',
        artifactName: 'Reusable Prompt Template',
        readiness: 'reuse',
        reviewNote: 'Human verifies source claims before the template is reused.',
        transferPlan: 'Use this for the weekly branch operations handoff.',
        fields: [
          {
            id: 'prompt_body',
            label: 'Prompt body',
            value:
              'Turn redacted branch notes into five staff handoff bullets. Do not add facts. Flag missing owner or deadline.',
          },
          {
            id: 'safety_note',
            label: 'Safety note',
            value: 'Use redacted notes only. No customer identifiers, account data, or confidential strategy.',
          },
        ],
      },
      'user-1',
    );

    expect(skill.kind).toBe('template');
    if (skill.kind !== 'template') throw new Error('expected template');
    expect(skill.cmd).toBe('/foundation-m9-reusable-prompt-template');
    expect(skill.name).toBe('M9: Reusable Prompt Template');
    expect(skill.sourceRef).toBe('aibi-p/module-9/9.1');
    expect(skill.maturity).toBe('pilot');
    expect(skill.systemPrompt).toContain('saved AiBI-Foundation prompt asset');
    expect(skill.userPromptTemplate).toContain('{{prompt_body}}');
    expect(skill.userPromptTemplate).toContain('{{safety_note}}');
    expect(skill.variables.map((variable) => variable.name)).toEqual([
      'prompt_body',
      'safety_note',
    ]);
    expect(skill.example?.input.prompt_body).toContain('redacted branch notes');
  });

  it('maps every Foundation module artifact into a toolbox-ready saved asset', () => {
    for (const microModule of FOUNDATION_MICRO_MODULES) {
      const reviewBoundary = microModule.reviewChecklist.join('; ');
      const transferPlan = microModule.transferMove;
      const skill = courseArtifactToToolboxSkill(
        {
          moduleNumber: microModule.number,
          activityId: `${microModule.number}.1`,
          artifactName: microModule.saveArtifact,
          reviewNote: reviewBoundary,
          transferPlan,
          fields: [
            {
              id: 'artifact_draft',
              label: 'Artifact draft',
              value: microModule.proofToSave,
            },
            {
              id: 'banking_guardrail',
              label: 'Banking guardrail',
              value: microModule.bankingGuardrail,
            },
          ],
        },
        'user-1',
      );

      expect(skill.name).toBe(`M${microModule.number}: ${microModule.saveArtifact}`);
      expect(skill.source).toBe('course');
      expect(skill.sourceRef).toBe(`aibi-p/module-${microModule.number}/${microModule.number}.1`);
      expect(skill.desc).toContain('Saved from AiBI-Foundation');
      expect(skill.desc).toContain(transferPlan.slice(0, 40));
      expect(skill.kind).toBe(promptTemplateModules.has(microModule.number) ? 'template' : 'workflow');

      if (skill.kind === 'template') {
        expect(skill.userPromptTemplate).toContain('{{artifact_draft}}');
        expect(skill.userPromptTemplate).toContain(reviewBoundary);
        expect(skill.userPromptTemplate).toContain(transferPlan);
        expect(skill.variables.length).toBeGreaterThan(0);
      } else {
        expect(skill.purpose).toBe(transferPlan);
        expect(skill.success).toBe(reviewBoundary);
        expect(skill.guardrails.join('\n')).toContain('human review');
        expect(skill.guardrails.join('\n')).toContain(reviewBoundary);
        expect(skill.samples[0]?.prompt).toContain(microModule.proofToSave);
      }
    }
  });
});

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
