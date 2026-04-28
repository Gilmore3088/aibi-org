export type ToolboxMaturity = 'draft' | 'pilot' | 'production';

export interface ToolboxScenario {
  readonly title: string;
  readonly prompt: string;
}

export interface ToolboxSkillTemplate {
  readonly id: string;
  readonly cmd: string;
  readonly name: string;
  readonly dept: string;
  readonly deptFull: string;
  readonly difficulty: 'beginner' | 'intermediate' | 'advanced';
  readonly timeSaved: string;
  readonly cadence: string;
  readonly desc: string;
  readonly purpose: string;
  readonly success: string;
  readonly files: readonly string[];
  readonly connectors: readonly string[];
  readonly questions: string;
  readonly steps: readonly string[];
  readonly output: string;
  readonly tone: string;
  readonly length: string;
  readonly guardrails: readonly string[];
  readonly customGuard: string;
  readonly owner: string;
  readonly maturity: ToolboxMaturity;
  readonly samples: readonly ToolboxScenario[];
}

export interface ToolboxSkill extends ToolboxSkillTemplate {
  readonly templateId?: string;
  readonly version: string;
  readonly created?: string;
  readonly modified?: string;
}

export interface ToolboxMessage {
  readonly role: 'user' | 'assistant';
  readonly content: string;
}

