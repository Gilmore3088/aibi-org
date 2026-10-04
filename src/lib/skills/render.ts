// Renders a banker skill three ways:
//   - fillPrompt: the instructions with the banker's values filled in, ready
//     to paste into any AI tool. Blank fields stay as [Label] so the gap is
//     visible.
//   - toSkillMd: a Claude Skill (SKILL.md). Claude asks for the inputs, so the
//     fields become an "Inputs" list and the {{keys}} become their labels.
//     Enabled in Claude settings, the skill also works in Claude for Excel,
//     PowerPoint, Word and Outlook.
//   - skillFolderName: the folder (and zip) name Claude expects.

import type { BankerSkill } from '@content/skills';

const FIELD = /\{\{([a-z0-9_]+)\}\}/g;

/** Claude caps a skill description at 200 characters. */
export const SKILL_DESCRIPTION_MAX = 200;

export function fillPrompt(skill: Pick<BankerSkill, 'instructions' | 'fields'>, values: Readonly<Record<string, string>> = {}): string {
  const labels = new Map(skill.fields.map((f) => [f.key, f.label]));
  return skill.instructions.replace(FIELD, (_m, key: string) => {
    const value = values[key]?.trim();
    return value ? value : `[${labels.get(key) ?? key}]`;
  });
}

export function skillFolderName(skill: BankerSkill): string {
  return skill.slug;
}

/** Claude reads the description to decide when to load the skill, so the trigger leads. */
export function skillDescription(skill: BankerSkill): string {
  const trigger = `Use when ${lowerFirst(skill.useWhen)}`;
  const full = `${trigger} ${skill.youGet}`;
  if (full.length <= SKILL_DESCRIPTION_MAX) return full;
  if (trigger.length <= SKILL_DESCRIPTION_MAX) return trigger;
  return `${trigger.slice(0, SKILL_DESCRIPTION_MAX - 1).trimEnd()}…`;
}

export function toSkillMd(skill: BankerSkill): string {
  const labels = new Map(skill.fields.map((f) => [f.key, f.label]));
  const body = skill.instructions.replace(FIELD, (_m, key: string) => `<${labels.get(key) ?? key}>`);
  const inputs = skill.fields
    .map((f) => {
      const need = f.required ? 'required' : 'optional';
      const options = f.options?.length ? ` One of: ${f.options.join(', ')}.` : '';
      const file = f.kind === 'file' ? ' A file path or an attached file.' : '';
      return `- **${f.label}** (${need}).${file}${options} Example: ${oneLine(f.example)}`;
    })
    .join('\n');
  const template = skill.usesTemplate
    ? '\n## Template\n\nIf a template file (.xlsx, .pptx or .docx) is in this skill\'s folder, use it as the template. Otherwise ask for the path to the bank\'s template.\n'
    : '';

  return `---
name: ${skillFolderName(skill)}
description: ${yamlString(skillDescription(skill))}
---

# ${skill.name}

${skill.useWhen} You get: ${lowerFirst(skill.youGet)}

Works best in: ${skill.apps.join(', ')}.

## Inputs

Ask for any required input that is missing before you start. Do not guess.

${inputs}
${template}
## Instructions

${body}

## Before you hand it back

Remind the user to check:
${skill.checks.map((c) => `- ${c}`).join('\n')}

Never use this skill with: ${skill.neverPaste}

---
${skill.id} · v${skill.version} · The AI Banking Institute · reviewed ${skill.verifiedOn}
`;
}

function lowerFirst(s: string): string {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

function oneLine(s: string): string {
  const flat = s.replace(/\s+/g, ' ').trim();
  return flat.length > 120 ? `${flat.slice(0, 117)}...` : flat;
}

function yamlString(s: string): string {
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}
