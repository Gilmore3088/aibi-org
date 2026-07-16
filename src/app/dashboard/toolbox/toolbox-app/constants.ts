import type { ToolboxTemplateSkill, ToolboxWorkflowSkill } from '@/lib/toolbox/types';

export const EMPTY_WORKFLOW_SKILL: ToolboxWorkflowSkill = {
  kind: 'workflow',
  id: '',
  cmd: '/new-skill',
  name: 'New Banking Skill',
  dept: 'General',
  deptFull: 'General',
  difficulty: 'beginner',
  timeSaved: 'Varies',
  cadence: 'As needed',
  desc: '',
  purpose: '',
  success: '',
  files: [],
  connectors: [],
  questions: '',
  steps: ['Review the provided context.', 'Draft the requested output.', 'Flag gaps and review items.'],
  output: 'Markdown (.md)',
  tone: 'Professional',
  length: 'Concise',
  guardrails: ['Never make final decisions', 'Flag missing data', 'Cite only provided sources'],
  customGuard: '',
  owner: 'Role owner',
  maturity: 'draft',
  version: '1.0',
  samples: [],
};

export const EMPTY_TEMPLATE_SKILL: ToolboxTemplateSkill = {
  kind: 'template',
  id: '',
  cmd: '/new-template',
  name: 'New Prompt Template',
  dept: 'General',
  deptFull: 'General',
  difficulty: 'beginner',
  timeSaved: 'Varies',
  cadence: 'As needed',
  desc: 'A short prompt template with fillable variables.',
  owner: 'Role owner',
  maturity: 'draft',
  version: '1.0',
  systemPrompt:
    'You are a community-bank assistant. Use plain language at an 8th-grade reading level. ' +
    'Cite sources only when provided; never invent regulatory citations.',
  userPromptTemplate: 'Write a {{kind_of_output}} for {{recipient}}.\n\nContext:\n{{context}}',
  variables: [
    { name: 'kind_of_output', label: 'Kind of output', type: 'text', required: true },
    { name: 'recipient', label: 'Recipient', type: 'text', required: true },
    { name: 'context', label: 'Context', type: 'textarea', required: true },
  ],
  output: 'Markdown',
  tone: 'Professional',
  length: 'Concise',
};

export const FIRST_RUN_DISMISSED_KEY = 'aibi-toolbox-first-run-hint-dismissed';
export const RECOMMENDED_STARTER_ID = 'exam-prep';
