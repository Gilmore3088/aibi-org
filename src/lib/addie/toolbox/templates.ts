// Toolbox artifact templates — server-only loader + hydrator.
//
// Templates live at src/content/addie/toolbox-templates/<module>/<slug>.md
// and contain mustache-style {{placeholder}} tokens. At save time we
// resolve the template by artifact_type + lesson_id, hydrate the small
// set of placeholders we know server-side (learner_name, track,
// created_date, template_version, lesson_id), and leave the rest intact
// so the learner can fill them in via the editor.
//
// Falls back to a sensible default when no template matches — the
// artifact still gets a named header + lesson breadcrumb so the round-
// trip is meaningful.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ArtifactType } from './items';

const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'content', 'addie', 'toolbox-templates');

// Map (artifact_type, module-hint) → template file. Some artifacts only
// exist in one module; for those the lesson_id prefix is ignored.
const TEMPLATE_PATHS: Record<ArtifactType, string> = {
  data_discipline_card: 'm0/data-discipline-card.md',
  ai_toolkit_map: 'm1/ai-toolkit-map.md',
  first_conversation: 'm2/first-conversation.md',
  starter_prompt_pack: 'm3/starter-prompt-pack.md',
  skill: 'm4/working-skill.md',
  skill_template: 'm4/skill-template.md',
  agent_blueprint: 'm5/agent-blueprint.md',
  prd: 'm5/prd.md',
  prototype: 'm5/prototype.md',
  problem_backlog: 'm5/problem-backlog.md',
  // No dedicated template yet — falls back to the default.
  where_ai_fits: '',
};

export interface HydrationContext {
  readonly artifact_type: ArtifactType;
  readonly title: string;
  readonly lesson_id?: string | null;
  readonly lesson_title?: string | null;
  readonly track?: string | null;
  readonly learner_name?: string | null;
  readonly created_date?: string | null;
  readonly template_version?: string | null;
}

export const TEMPLATE_VERSION = '1';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function readableTrack(track: string | null | undefined): string {
  if (!track) return '—';
  return track.replace(/_/g, ' ');
}

export function defaultArtifactBody(ctx: HydrationContext): string {
  const lines: string[] = [
    `# ${ctx.title}`,
    '',
    `**Date:** ${ctx.created_date ?? todayIso()}`,
    `**Track:** ${readableTrack(ctx.track)}`,
  ];
  if (ctx.lesson_id) {
    lines.push(`**From lesson:** ${ctx.lesson_title ?? ctx.lesson_id}`);
  }
  lines.push('', '---', '');
  lines.push(
    'This artifact was saved from the course. Open it in the editor to add your own notes — what you tried, what worked, what you would do differently.',
  );
  lines.push('', `AiBI-Foundation · The AI Banking Institute`);
  return lines.join('\n');
}

// Mustache-style substitution. We only hydrate the placeholders we know;
// the rest stay as `{{slot_name}}` so the learner sees what to fill in.
// We also strip mustache section tags ({{#name}}…{{/name}}) — those are
// authoring scaffolds and never render literally.
export function hydrate(template: string, ctx: HydrationContext): string {
  const map: Record<string, string> = {
    learner_name: ctx.learner_name ?? '(your name)',
    track: readableTrack(ctx.track),
    created_date: ctx.created_date ?? todayIso(),
    date_iso: ctx.created_date ?? todayIso(),
    date: ctx.created_date ?? todayIso(),
    template_version: ctx.template_version ?? TEMPLATE_VERSION,
    skill_version: ctx.template_version ?? TEMPLATE_VERSION,
    source_exercise_id: ctx.lesson_id ?? '—',
    lesson_id: ctx.lesson_id ?? '—',
  };
  // Strip section tags first ({{#x}} and {{/x}}).
  let out = template.replace(/\{\{[#/][a-z0-9_]+\}\}\n?/gi, '');
  // Substitute known placeholders.
  out = out.replace(/\{\{([a-z0-9_]+)\}\}/gi, (whole, name: string) => {
    const v = map[name];
    return v !== undefined ? v : whole;
  });
  return out;
}

export async function loadTemplate(type: ArtifactType): Promise<string | null> {
  const rel = TEMPLATE_PATHS[type];
  if (!rel) return null;
  const abs = path.join(TEMPLATES_DIR, rel);
  try {
    return await fs.readFile(abs, 'utf8');
  } catch {
    return null;
  }
}

export async function resolveBody(ctx: HydrationContext): Promise<string> {
  const tmpl = await loadTemplate(ctx.artifact_type);
  if (!tmpl) return defaultArtifactBody(ctx);
  return hydrate(tmpl, ctx);
}
