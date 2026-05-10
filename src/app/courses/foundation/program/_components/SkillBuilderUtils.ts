// SkillBuilderUtils — Pure utility functions for SkillBuilder.

import { FORMAT_OPTIONS } from '../_lib/skillBuilderData';

export const FIELD_IDS = {
  role: 'skill-role',
  context: 'skill-context',
  task: 'skill-task',
  format: 'skill-format',
  constraint: 'skill-constraint',
  mdContent: 'skill-md-content',
} as const;

export function sanitizeFilename(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40);
}

export function generateSkillMarkdown(values: Record<string, string>): string {
  const formatLabel =
    FORMAT_OPTIONS.find((o) => o.value === values[FIELD_IDS.format])?.label ??
    values[FIELD_IDS.format] ??
    '';

  const roleWords = (values[FIELD_IDS.role] ?? '').split(' ').slice(0, 8).join(' ');
  const title = roleWords ? `${roleWords} Skill` : 'Banking AI Skill';

  return (
    `# ${title} - v1.0\n\n` +
    `## Role\n${values[FIELD_IDS.role] ?? ''}\n\n` +
    `## Context\n${values[FIELD_IDS.context] ?? ''}\n\n` +
    `## Task\n${values[FIELD_IDS.task] ?? ''}\n\n` +
    `## Format\n${formatLabel}\n\n` +
    `## Constraints\n${values[FIELD_IDS.constraint] ?? ''}\n`
  );
}

export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function buildFilename(values: Record<string, string>): string {
  const roleRaw = values[FIELD_IDS.role] ?? '';
  const taskRaw = values[FIELD_IDS.task] ?? '';

  const roleWords = roleRaw
    .replace(/^you are a\s+/i, '')
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 2)
    .join('-');

  const taskWords = taskRaw
    .replace(/^analyze|^review|^produce|^draft/i, '')
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 2)
    .join('-');

  const rolePart = sanitizeFilename(roleWords) || 'Banking';
  const taskPart = sanitizeFilename(taskWords) || 'Skill';

  return `${rolePart}-${taskPart}-Skill-v1.md`;
}

export function validateFields(values: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values[FIELD_IDS.role]?.trim()) {
    errors[FIELD_IDS.role] = 'Role is required.';
  } else if ((values[FIELD_IDS.role]?.length ?? 0) < 20) {
    errors[FIELD_IDS.role] = `Must be at least 20 characters (currently ${values[FIELD_IDS.role]?.length ?? 0}).`;
  }

  if (!values[FIELD_IDS.context]?.trim()) {
    errors[FIELD_IDS.context] = 'Context is required.';
  } else if ((values[FIELD_IDS.context]?.length ?? 0) < 20) {
    errors[FIELD_IDS.context] = `Must be at least 20 characters (currently ${values[FIELD_IDS.context]?.length ?? 0}).`;
  }

  if (!values[FIELD_IDS.task]?.trim()) {
    errors[FIELD_IDS.task] = 'Task is required.';
  } else if ((values[FIELD_IDS.task]?.length ?? 0) < 30) {
    errors[FIELD_IDS.task] = `Must be at least 30 characters (currently ${values[FIELD_IDS.task]?.length ?? 0}).`;
  }

  if (!values[FIELD_IDS.format]) {
    errors[FIELD_IDS.format] = 'Please select a Format.';
  }

  if (!values[FIELD_IDS.constraint]?.trim()) {
    errors[FIELD_IDS.constraint] = 'Constraints are required.';
  } else if ((values[FIELD_IDS.constraint]?.length ?? 0) < 30) {
    errors[FIELD_IDS.constraint] = `Must be at least 30 characters (currently ${values[FIELD_IDS.constraint]?.length ?? 0}).`;
  }

  return errors;
}
