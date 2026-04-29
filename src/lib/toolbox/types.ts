// src/lib/toolbox/types.ts
//
// Plan B (decision #23): a Skill is either a 'workflow' kind (rich
// workflow definition; system prompt is generated) or a 'template' kind
// (fill-in-the-blank with {{variables}}; system prompt is stored).

export type ToolboxMaturity = 'draft' | 'pilot' | 'production';
export type ToolboxKind = 'workflow' | 'template';
export type ToolboxSource = 'library' | 'course' | 'user' | 'forked';
export type ToolboxPillar = 'A' | 'B' | 'C';

export interface ToolboxScenario {
  readonly title: string;
  readonly prompt: string;
}

export interface ToolboxVariable {
  readonly name: string;
  readonly label: string;
  readonly type: 'text' | 'textarea' | 'select' | 'number';
  readonly required: boolean;
  readonly options?: readonly string[];
  readonly placeholder?: string;
}

export interface ToolboxTeachingAnnotation {
  readonly anchor:
    | 'purpose' | 'questions' | 'steps' | 'guardrails' | 'output'
    | 'system_prompt' | 'user_template' | 'variables' | 'example';
  readonly pattern: string;
  readonly explanation: string;
}

interface ToolboxSkillCommon {
  readonly id: string;
  readonly templateId?: string;
  readonly cmd: string;            // '/credit-memo' (also functions as unique key per user)
  readonly name: string;
  readonly dept: string;
  readonly deptFull: string;
  readonly difficulty: 'beginner' | 'intermediate' | 'advanced';
  readonly timeSaved: string;
  readonly cadence: string;
  readonly desc: string;
  readonly owner: string;
  readonly maturity: ToolboxMaturity;
  readonly version: string;
  readonly created?: string;
  readonly modified?: string;

  readonly pillar?: ToolboxPillar;
  readonly source?: ToolboxSource;
  readonly sourceRef?: string;
  readonly teachingAnnotations?: readonly ToolboxTeachingAnnotation[];
}

export interface ToolboxWorkflowSkill extends ToolboxSkillCommon {
  readonly kind: 'workflow';
  readonly purpose: string;
  readonly success: string;
  readonly files: readonly string[];
  readonly connectors: readonly string[];
  readonly questions: string;       // newline-delimited
  readonly steps: readonly string[];
  readonly output: string;
  readonly tone: string;
  readonly length: string;
  readonly guardrails: readonly string[];
  readonly customGuard: string;
  readonly samples: readonly ToolboxScenario[];
  // Optional override — if set, used verbatim instead of the generated prompt
  readonly systemPromptOverride?: string;
}

export interface ToolboxTemplateSkill extends ToolboxSkillCommon {
  readonly kind: 'template';
  readonly systemPrompt: string;            // 100-300 words
  readonly userPromptTemplate: string;      // contains {{variable}} placeholders
  readonly variables: readonly ToolboxVariable[];
  readonly example?: { readonly input: Readonly<Record<string, string>>; readonly output: string };
  // Output spec fields (template kind shares with workflow but optional)
  readonly output?: string;
  readonly tone?: string;
  readonly length?: string;
}

export type ToolboxSkill = ToolboxWorkflowSkill | ToolboxTemplateSkill;

// Templates are workflow-kind only in v1 (the file-based seed set is all
// workflow). The `id` here is a content slug (e.g., 'exam-prep') — distinct
// from the UUID assigned when a learner forks a template into their personal
// toolbox. Plan C will widen this to allow either kind in the DB-backed
// Library.
export type ToolboxSkillTemplate = Omit<
  ToolboxWorkflowSkill,
  'created' | 'modified' | 'templateId'
>;

export interface ToolboxMessage {
  readonly role: 'user' | 'assistant';
  readonly content: string;
}

// Type guards
export function isWorkflowSkill(skill: ToolboxSkill): skill is ToolboxWorkflowSkill {
  return skill.kind === 'workflow';
}

export function isTemplateSkill(skill: ToolboxSkill): skill is ToolboxTemplateSkill {
  return skill.kind === 'template';
}
