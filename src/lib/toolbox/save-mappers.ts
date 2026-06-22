import type { Prompt } from '@content/courses/foundation-program/prompt-library';
import type {
  ToolboxMessage,
  ToolboxScenario,
  ToolboxSkill,
  ToolboxTemplateSkill,
  ToolboxVariable,
  ToolboxWorkflowSkill,
} from '@/lib/toolbox/types';

export interface CourseArtifactField {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}

export interface CourseArtifactCapture {
  readonly moduleNumber: number;
  readonly activityId: string;
  readonly artifactName: string;
  readonly fields: readonly CourseArtifactField[];
  readonly reviewNote?: string;
  readonly transferPlan?: string;
  readonly readiness?: string;
}

interface FreshIds {
  readonly id: string;
  readonly cmd: string;
  readonly owner: string;
}

function freshIds(userId: string, baseCmd: string): FreshIds {
  return {
    id: '', // assigned by Postgres on insert
    cmd: `${baseCmd}-${Date.now().toString(36)}`,
    owner: userId,
  };
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function truncate(value: string, max = 240): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trim()}…`;
}

export function promptCardToToolboxSkill(prompt: Prompt, userId: string): ToolboxTemplateSkill {
  const { id, cmd, owner } = freshIds(userId, `/${prompt.id}`);
  return {
    kind: 'template',
    id,
    cmd,
    name: prompt.title,
    dept: 'General',
    deptFull: 'General',
    difficulty: prompt.difficulty,
    timeSaved: prompt.timeEstimate,
    cadence: 'As needed',
    desc: prompt.whenToUse ?? prompt.expectedOutput,
    owner,
    maturity: 'draft',
    version: '1.0',
    systemPrompt: '', // course prompts are typically a single user message
    userPromptTemplate: prompt.promptText,
    variables: [],
    example: { input: {}, output: prompt.expectedOutput },
    source: 'course',
    sourceRef: `aibi-p/module-${prompt.relatedModule}/${prompt.id}`,
  };
}

export function courseArtifactToToolboxSkill(
  capture: CourseArtifactCapture,
  userId: string,
): ToolboxSkill {
  const artifactSlug = slugify(capture.artifactName) || 'artifact';
  const cmd = `/foundation-m${capture.moduleNumber}-${artifactSlug}`;
  const fields = capture.fields.filter((field) => field.value.trim().length > 0);
  const fieldSummary = fields.map((field) => `${field.label}: ${truncate(field.value)}`);
  const reviewNote = capture.reviewNote?.trim() ?? '';
  const transferPlan = capture.transferPlan?.trim() ?? '';
  const samplePrompt = fields
    .map((field) => `## ${field.label}\n\n${field.value.trim()}`)
    .join('\n\n');
  const sourceRef = `aibi-p/module-${capture.moduleNumber}/${capture.activityId}`;
  const maturity = capture.readiness === 'reuse' ? 'pilot' : 'draft';

  if (isPromptTemplateModule(capture.moduleNumber)) {
    const variables = buildCourseArtifactVariables(fields);
    const userPromptTemplate = buildCourseTemplatePrompt(capture, fields, reviewNote, transferPlan);

    return {
      kind: 'template',
      id: '',
      cmd,
      name: `M${capture.moduleNumber}: ${capture.artifactName}`,
      dept: 'Foundation',
      deptFull: 'AiBI-Foundation',
      difficulty: 'beginner',
      timeSaved: 'Varies',
      cadence: 'As needed',
      desc: transferPlan
        ? `Saved from AiBI-Foundation. First reuse: ${truncate(transferPlan, 140)}`
        : 'Saved from an AiBI-Foundation prompt-building module.',
      owner: userId,
      maturity,
      version: '1.0',
      source: 'course',
      sourceRef,
      systemPrompt:
        'You support a banker using a saved AiBI-Foundation prompt asset. Stay within the stated safety boundary, use only approved non-sensitive inputs, flag gaps instead of guessing, and require human review before the output affects a customer, control, report, or decision.',
      userPromptTemplate,
      variables,
      example: {
        input: Object.fromEntries(fields.map((field) => [field.id, field.value])),
        output: capture.artifactName,
      },
      output: capture.artifactName,
      tone: 'Professional',
      length: 'Concise',
    };
  }

  return {
    kind: 'workflow',
    id: '',
    cmd,
    name: `M${capture.moduleNumber}: ${capture.artifactName}`,
    dept: 'Foundation',
    deptFull: 'AiBI-Foundation',
    difficulty: 'beginner',
    timeSaved: 'Varies',
    cadence: 'As needed',
    desc: transferPlan
      ? `Saved from AiBI-Foundation. First reuse: ${truncate(transferPlan, 140)}`
      : 'Saved from an AiBI-Foundation module artifact.',
    owner: userId,
    maturity,
    version: '1.0',
    source: 'course',
    sourceRef,
    purpose: transferPlan || `Reuse the ${capture.artifactName} from AiBI-Foundation module ${capture.moduleNumber}.`,
    success: reviewNote || 'A manager can inspect the artifact, review note, and reuse boundary.',
    files: ['Foundation Packet artifact'],
    connectors: [],
    questions: fields.map((field) => field.label).join('\n'),
    steps: fieldSummary.length > 0
      ? fieldSummary
      : [`Use the saved ${capture.artifactName} with human review before reuse.`],
    output: capture.artifactName,
    tone: 'Professional',
    length: 'Concise',
    guardrails: [
      'Use non-sensitive or approved internal data only.',
      'Keep human review before customer, control, report, or decision impact.',
      'Retain enough evidence for a manager or compliance partner to inspect.',
      ...(reviewNote ? [reviewNote] : []),
    ],
    customGuard: reviewNote,
    samples: samplePrompt
      ? [{ title: 'Saved course artifact', prompt: samplePrompt }]
      : [],
  };
}

const PROMPT_TEMPLATE_MODULES = new Set([2, 4, 5, 6, 8, 9, 10]);

function isPromptTemplateModule(moduleNumber: number): boolean {
  return PROMPT_TEMPLATE_MODULES.has(moduleNumber);
}

function buildCourseArtifactVariables(
  fields: readonly CourseArtifactField[],
): readonly ToolboxVariable[] {
  const seen = new Set<string>();

  return fields.map((field) => {
    let name = slugify(field.id || field.label).replace(/-/g, '_') || 'input';
    if (/^\d/.test(name)) name = `field_${name}`;
    while (seen.has(name)) {
      name = `${name}_value`;
    }
    seen.add(name);

    return {
      name,
      label: field.label,
      type: 'textarea',
      required: true,
      placeholder: truncate(field.value, 160),
    } satisfies ToolboxVariable;
  });
}

function buildCourseTemplatePrompt(
  capture: CourseArtifactCapture,
  fields: readonly CourseArtifactField[],
  reviewNote: string,
  transferPlan: string,
): string {
  const variables = buildCourseArtifactVariables(fields);
  const blocks = fields.map((field, index) => {
    const variable = variables[index];
    return `## ${field.label}\n\n{{${variable.name}}}`;
  });

  return [
    `# ${capture.artifactName}`,
    '',
    'Use this saved Foundation prompt asset for a low-risk, approved banking task.',
    '',
    ...blocks,
    '',
    '## Human review boundary',
    reviewNote || '{{human_review_boundary}}',
    '',
    '## First reuse plan',
    transferPlan || '{{first_reuse_plan}}',
    '',
    'Before final use, verify facts, remove sensitive data, and keep a human owner on the output.',
  ].join('\n');
}

interface PlaygroundCapture {
  readonly skill: ToolboxSkill;
  readonly messages: readonly ToolboxMessage[];
  readonly userId: string;
}

export function playgroundMessagesToToolboxSkill(input: PlaygroundCapture): ToolboxSkill {
  const { skill, messages, userId } = input;
  const { id, cmd, owner } = freshIds(userId, skill.cmd);

  const reversed = [...messages].reverse();
  const lastUser = reversed.find((m) => m.role === 'user');
  const lastAssistant = reversed.find((m) => m.role === 'assistant');

  if (skill.kind === 'workflow') {
    const appended: readonly ToolboxScenario[] = lastUser
      ? [...skill.samples, { title: 'From Playground', prompt: lastUser.content }]
      : skill.samples;

    const fresh: ToolboxWorkflowSkill = {
      ...skill,
      id,
      cmd,
      owner,
      maturity: 'draft',
      source: 'user',
      sourceRef: undefined,
      samples: appended,
    };
    return fresh;
  }

  const fresh: ToolboxTemplateSkill = {
    ...skill,
    id,
    cmd,
    owner,
    maturity: 'draft',
    source: 'user',
    sourceRef: undefined,
    example: {
      input: {},
      output: lastAssistant?.content ?? skill.example?.output ?? '',
    },
  };
  return fresh;
}

interface LibraryEntry {
  readonly id: string;
  readonly slug: string;
  readonly kind: 'workflow' | 'template';
  readonly title: string;
  readonly description: string;
  readonly systemPrompt?: string;
  readonly userPromptTemplate?: string;
  readonly variables?: readonly ToolboxVariable[];
  readonly workflowDefinition?: Partial<ToolboxWorkflowSkill>;
  readonly pillar?: 'A' | 'B' | 'C';
  readonly category: string;
}

export function libraryEntryToToolboxSkill(
  entry: LibraryEntry,
  userId: string,
  versionId: string,
  recipeSourceRef?: string,
): ToolboxSkill {
  const { id, cmd, owner } = freshIds(userId, `/${entry.slug}`);
  const common = {
    id,
    cmd,
    owner,
    name: entry.title,
    dept: entry.category,
    deptFull: entry.category,
    difficulty: 'intermediate' as const,
    timeSaved: 'varies',
    cadence: 'As needed',
    desc: entry.description,
    maturity: 'draft' as const,
    version: '1.0',
    pillar: entry.pillar,
    source: 'forked' as const,
    sourceRef: recipeSourceRef ?? `library:${entry.id}@${versionId}`,
  };

  if (entry.kind === 'workflow') {
    const def = entry.workflowDefinition ?? {};
    const workflow: ToolboxWorkflowSkill = {
      ...common,
      kind: 'workflow',
      purpose: def.purpose ?? '',
      success: def.success ?? '',
      files: def.files ?? [],
      connectors: def.connectors ?? [],
      questions: def.questions ?? '',
      steps: def.steps ?? [],
      output: def.output ?? '',
      tone: def.tone ?? '',
      length: def.length ?? '',
      guardrails: def.guardrails ?? [],
      customGuard: def.customGuard ?? '',
      samples: def.samples ?? [],
    };
    return workflow;
  }

  const template: ToolboxTemplateSkill = {
    ...common,
    kind: 'template',
    systemPrompt: entry.systemPrompt ?? '',
    userPromptTemplate: entry.userPromptTemplate ?? '',
    variables: entry.variables ?? [],
  };
  return template;
}
