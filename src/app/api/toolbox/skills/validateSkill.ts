// src/app/api/toolbox/skills/validateSkill.ts
//
// Pure (no Next.js or Supabase deps) validator extracted from route.ts so it
// can be unit-tested. Both /api/toolbox/skills (POST) and
// /api/toolbox/skills/[skillId] (PATCH) call this.

import type {
  ToolboxSkill,
  ToolboxTemplateSkill,
  ToolboxVariable,
  ToolboxWorkflowSkill,
} from '@/lib/toolbox/types';

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function asVariableArray(value: unknown): ToolboxVariable[] {
  if (!Array.isArray(value)) return [];
  const out: ToolboxVariable[] = [];
  for (const raw of value) {
    if (typeof raw !== 'object' || raw === null) continue;
    const v = raw as Partial<ToolboxVariable>;
    if (typeof v.name !== 'string' || !v.name.trim()) continue;
    if (typeof v.label !== 'string' || !v.label.trim()) continue;
    const type = v.type;
    if (type !== 'text' && type !== 'textarea' && type !== 'select' && type !== 'number') continue;
    out.push({
      name: v.name.trim(),
      label: v.label.trim(),
      type,
      required: Boolean(v.required),
      options: Array.isArray(v.options) ? v.options.map(String) : undefined,
      placeholder: typeof v.placeholder === 'string' ? v.placeholder : undefined,
    });
  }
  return out;
}

function commonFields(skill: Record<string, unknown>): {
  cmd: string;
  name: string;
  desc: string;
} | null {
  if (typeof skill.cmd !== 'string' || !skill.cmd.startsWith('/')) return null;
  if (typeof skill.name !== 'string' || skill.name.trim().length < 2) return null;
  return {
    cmd: skill.cmd.trim(),
    name: skill.name.trim(),
    desc: typeof skill.desc === 'string' ? skill.desc : '',
  };
}

export function validateSkill(input: unknown): ToolboxSkill | null {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return null;
  const raw = input as Record<string, unknown>;
  const common = commonFields(raw);
  if (!common) return null;

  const kind = raw.kind === 'template' ? 'template' : 'workflow';

  const sharedMeta = {
    id: typeof raw.id === 'string' ? raw.id : '',
    templateId: typeof raw.templateId === 'string' ? raw.templateId : undefined,
    cmd: common.cmd,
    name: common.name,
    dept: typeof raw.dept === 'string' ? raw.dept : 'General',
    deptFull:
      typeof raw.deptFull === 'string'
        ? raw.deptFull
        : typeof raw.dept === 'string'
          ? raw.dept
          : 'General',
    difficulty:
      raw.difficulty === 'intermediate' || raw.difficulty === 'advanced'
        ? raw.difficulty
        : 'beginner',
    timeSaved: typeof raw.timeSaved === 'string' ? raw.timeSaved : 'Varies',
    cadence: typeof raw.cadence === 'string' ? raw.cadence : 'As needed',
    desc: common.desc,
    owner: typeof raw.owner === 'string' ? raw.owner : 'Unassigned',
    maturity:
      raw.maturity === 'pilot' || raw.maturity === 'production'
        ? raw.maturity
        : 'draft',
    version: typeof raw.version === 'string' ? raw.version : '1.0',
    pillar:
      raw.pillar === 'A' || raw.pillar === 'B' || raw.pillar === 'C'
        ? raw.pillar
        : undefined,
    source:
      raw.source === 'library' ||
      raw.source === 'course' ||
      raw.source === 'forked'
        ? raw.source
        : 'user',
    sourceRef: typeof raw.sourceRef === 'string' ? raw.sourceRef : undefined,
  } as const;

  if (kind === 'template') {
    if (typeof raw.systemPrompt !== 'string' || raw.systemPrompt.trim().length < 20) return null;
    if (typeof raw.userPromptTemplate !== 'string' || raw.userPromptTemplate.trim().length < 1) {
      return null;
    }
    const tpl: ToolboxTemplateSkill = {
      ...sharedMeta,
      kind: 'template',
      systemPrompt: raw.systemPrompt.trim(),
      userPromptTemplate: raw.userPromptTemplate.trim(),
      variables: asVariableArray(raw.variables),
      example:
        typeof raw.example === 'object' && raw.example !== null
          ? (raw.example as ToolboxTemplateSkill['example'])
          : undefined,
      output: typeof raw.output === 'string' ? raw.output : 'Markdown',
      tone: typeof raw.tone === 'string' ? raw.tone : 'Professional',
      length: typeof raw.length === 'string' ? raw.length : 'Concise',
    };
    return tpl;
  }

  // workflow kind
  if (typeof raw.purpose !== 'string' && typeof raw.desc !== 'string') return null;
  const wf: ToolboxWorkflowSkill = {
    ...sharedMeta,
    kind: 'workflow',
    purpose:
      typeof raw.purpose === 'string'
        ? raw.purpose
        : typeof raw.desc === 'string'
          ? raw.desc
          : '',
    success: typeof raw.success === 'string' ? raw.success : '',
    files: asStringArray(raw.files),
    connectors: asStringArray(raw.connectors),
    questions: typeof raw.questions === 'string' ? raw.questions : '',
    steps: asStringArray(raw.steps),
    output: typeof raw.output === 'string' ? raw.output : 'Markdown',
    tone: typeof raw.tone === 'string' ? raw.tone : 'Professional',
    length: typeof raw.length === 'string' ? raw.length : 'Concise',
    guardrails: asStringArray(raw.guardrails),
    customGuard: typeof raw.customGuard === 'string' ? raw.customGuard : '',
    samples: Array.isArray(raw.samples)
      ? raw.samples.filter(
          (s): s is { title: string; prompt: string } =>
            typeof s === 'object' &&
            s !== null &&
            typeof (s as { title?: unknown }).title === 'string' &&
            typeof (s as { prompt?: unknown }).prompt === 'string',
        )
      : [],
    systemPromptOverride:
      typeof raw.systemPromptOverride === 'string' ? raw.systemPromptOverride : undefined,
  };
  return wf;
}
