import {
  isTemplateSkill,
  isWorkflowSkill,
  type ToolboxSkill,
  type ToolboxWorkflowSkill,
} from './types';

function yaml(value: string): string {
  return JSON.stringify(value ?? '');
}

function list(items: readonly string[]): string {
  if (items.length === 0) return '- None specified\n';
  return items.map((item) => `- ${item}`).join('\n') + '\n';
}

export function generateToolboxMarkdown(skill: ToolboxSkill): string {
  if (isTemplateSkill(skill)) {
    return generateTemplateMarkdown(skill);
  }
  return generateWorkflowMarkdown(skill);
}

function generateWorkflowMarkdown(skill: ToolboxWorkflowSkill): string {
  const today = new Date().toISOString().split('T')[0];

  let md = '---\n';
  md += `name: ${yaml(skill.cmd.replace(/^\//, ''))}\n`;
  md += `command: ${yaml(skill.cmd)}\n`;
  md += `kind: workflow\n`;
  md += `title: ${yaml(skill.name)}\n`;
  md += `description: ${yaml(skill.desc || skill.purpose)}\n`;
  md += `version: ${yaml(skill.version || '1.0')}\n`;
  md += `owner: ${yaml(skill.owner || 'Unassigned')}\n`;
  md += `maturity: ${yaml(skill.maturity || 'draft')}\n`;
  md += `department: ${yaml(skill.deptFull || skill.dept || 'General')}\n`;
  md += `cadence: ${yaml(skill.cadence || 'As needed')}\n`;
  md += `created: ${yaml(skill.created || today)}\n`;
  md += '---\n\n';

  md += `# ${skill.name}\n\n`;
  md += `> Trigger this skill by typing \`${skill.cmd}\` in any compatible Claude interface.\n\n`;
  md += '## Purpose\n\n';
  md += `${skill.purpose || skill.desc}\n\n`;
  md += '## Definition of Done\n\n';
  md += `${skill.success || 'A reviewed, reusable institutional output.'}\n\n`;
  md += '## Required Context\n\n';
  md += '### Files and folders\n\n';
  md += list(skill.files ?? []);
  md += '\n### Connected apps\n\n';
  md += list(skill.connectors ?? []);
  md += '\n## Before Starting - Required Questions\n\n';
  const questions = (skill.questions || '')
    .split('\n')
    .map((q) => q.trim())
    .filter(Boolean);
  md += questions.length
    ? questions.map((question, idx) => `${idx + 1}. ${question}`).join('\n') + '\n\n'
    : '1. What context is missing before this work can begin?\n\n';
  md += '## Workflow\n\n';
  md += (skill.steps ?? []).map((step, idx) => `${idx + 1}. ${step}`).join('\n')
    || '1. Complete the task using the provided context.';
  md += '\n\n';
  if (skill.customGuard) {
    md += '### Escalation Triggers\n\n';
    md += `${skill.customGuard}\n\n`;
  }
  md += '## Output\n\n';
  md += '| Field | Requirement |\n| --- | --- |\n';
  md += `| Format | ${skill.output || 'Markdown'} |\n`;
  md += `| Tone | ${skill.tone || 'Professional'} |\n`;
  md += `| Length | ${skill.length || 'Concise'} |\n\n`;
  md += '## Rules - Never Do These\n\n';
  md += list(skill.guardrails ?? []);
  if (skill.customGuard) {
    md += `\n- ${skill.customGuard}\n`;
  }
  md += '\n---\n\n';
  md += '*Generated via the AI Banking Institute Toolbox.*\n';

  return md;
}

function generateTemplateMarkdown(skill: ToolboxSkill): string {
  if (!isTemplateSkill(skill)) return '';
  const today = new Date().toISOString().split('T')[0];

  let md = '---\n';
  md += `name: ${yaml(skill.cmd.replace(/^\//, ''))}\n`;
  md += `command: ${yaml(skill.cmd)}\n`;
  md += `kind: template\n`;
  md += `title: ${yaml(skill.name)}\n`;
  md += `description: ${yaml(skill.desc)}\n`;
  md += `version: ${yaml(skill.version || '1.0')}\n`;
  md += `created: ${yaml(skill.created || today)}\n`;
  md += '---\n\n';

  md += `# ${skill.name}\n\n`;
  md += `${skill.desc}\n\n`;
  md += '## System Prompt\n\n';
  md += '```\n' + skill.systemPrompt + '\n```\n\n';
  md += '## User Prompt Template\n\n';
  md += '```\n' + skill.userPromptTemplate + '\n```\n\n';
  md += '## Variables\n\n';
  if (skill.variables.length === 0) {
    md += '- None\n\n';
  } else {
    md += '| Name | Label | Type | Required |\n| --- | --- | --- | --- |\n';
    for (const v of skill.variables) {
      md += `| \`${v.name}\` | ${v.label} | ${v.type} | ${v.required ? 'yes' : 'no'} |\n`;
    }
    md += '\n';
  }
  if (skill.example) {
    md += '## Example\n\n';
    md += '**Input:**\n\n```json\n' + JSON.stringify(skill.example.input, null, 2) + '\n```\n\n';
    md += '**Output:**\n\n```\n' + skill.example.output + '\n```\n\n';
  }
  md += '\n---\n\n';
  md += '*Generated via the AI Banking Institute Toolbox.*\n';
  return md;
}

export function buildToolboxSystemPrompt(skill: ToolboxSkill): string {
  if (isTemplateSkill(skill)) {
    return skill.systemPrompt;
  }
  if (skill.systemPromptOverride) {
    return skill.systemPromptOverride;
  }
  return composeWorkflowSystemPrompt(skill);
}

function composeWorkflowSystemPrompt(skill: ToolboxWorkflowSkill): string {
  if (!isWorkflowSkill(skill)) return '';
  const guardrails = [
    ...(skill.guardrails ?? []),
    ...(skill.customGuard ? [skill.customGuard] : []),
  ];

  return `You are an AI assistant for a U.S. community bank or credit union, executing a specific institutional skill.

SKILL: ${skill.name}
TRIGGER: ${skill.cmd}
DEPARTMENT: ${skill.deptFull || skill.dept || 'General'}

PURPOSE
${skill.purpose || skill.desc || ''}

CLARIFYING QUESTIONS
${skill.questions || ''}

WORKFLOW
${(skill.steps || []).map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

OUTPUT SPECIFICATION
- Format: ${skill.output || 'Markdown'}
- Tone: ${skill.tone || 'Professional'}
- Length: ${skill.length || 'Concise'}

RULES
${guardrails.map((rule) => `- ${rule}`).join('\n')}

DEMO MODE
This is a learning playground inside the AI Banking Institute. Produce the useful deliverable the skill is designed to create. Ask clarifying questions only when the user's scenario does not provide enough information.

REGULATORY DISCIPLINE
Do not fabricate URLs, guidance letter numbers, bulletin IDs, court cases, contact details, examiner names, or specific regulatory subsection numbers. You may cite real top-level authorities such as 12 CFR 1002, 12 CFR 1005, Dodd-Frank Section 1031, OCC 2013-29, and the FFIEC IT Handbook. If a precise citation or source is not supplied, say it needs verification instead of inventing it.

SAFETY
Do not approve credit, legal, compliance, employment, or customer-impacting decisions. Frame recommendations as draft work for human review.`;
}
