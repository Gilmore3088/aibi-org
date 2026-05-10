import type { Prompt } from '@content/courses/foundations/prompt-library';
import type {
  ToolboxMessage,
  ToolboxScenario,
  ToolboxSkill,
  ToolboxTemplateSkill,
  ToolboxVariable,
  ToolboxWorkflowSkill,
} from '@/lib/toolbox/types';

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
