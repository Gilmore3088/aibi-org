import { NextResponse } from 'next/server';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import type { ToolboxSkill } from '@/lib/toolbox/types';
import { validateSkill } from './validateSkill';

interface ToolboxSkillRow {
  readonly id: string;
  readonly skill: ToolboxSkill;
  readonly created_at: string;
  readonly updated_at: string;
}

function normalizeSkill(row: ToolboxSkillRow): ToolboxSkill {
  return {
    ...row.skill,
    id: row.id,
    created: row.skill.created ?? row.created_at,
    modified: row.updated_at,
  } as ToolboxSkill;
}

export async function GET(): Promise<NextResponse> {
  const access = await getPaidToolboxAccess();
  if (!access) return NextResponse.json({ error: 'Paid access required.' }, { status: 403 });
  if (!isSupabaseConfigured()) return NextResponse.json({ skills: [] });

  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('toolbox_skills')
    .select('id, skill, created_at, updated_at')
    .eq('user_id', access.userId)
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Could not load Toolbox skills.' }, { status: 500 });
  }

  return NextResponse.json({
    skills: ((data ?? []) as ToolboxSkillRow[]).map(normalizeSkill),
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  const access = await getPaidToolboxAccess();
  if (!access) return NextResponse.json({ error: 'Paid access required.' }, { status: 403 });
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Server-side Toolbox storage is not configured.' }, { status: 503 });
  }

  let body: { skill?: unknown };
  try {
    body = (await request.json()) as { skill?: unknown };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const skill = validateSkill(body.skill);
  if (!skill) return NextResponse.json({ error: 'Invalid skill payload.' }, { status: 400 });

  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('toolbox_skills')
    .upsert(
      {
        user_id: access.userId,
        template_id: skill.templateId ?? null,
        command: skill.cmd,
        name: skill.name,
        maturity: skill.maturity,
        // Preserve full skill blob in the JSONB column for back-compat with
        // existing reads (normalizeSkill reads from row.skill).
        skill,
        // New explicit columns (Plan B / decision #23):
        kind: skill.kind,
        system_prompt:
          skill.kind === 'template'
            ? skill.systemPrompt
            : skill.kind === 'workflow' && skill.systemPromptOverride
              ? skill.systemPromptOverride
              : null,
        user_prompt_template:
          skill.kind === 'template' ? skill.userPromptTemplate : null,
        variables: skill.kind === 'template' ? skill.variables : [],
        pillar: skill.pillar ?? null,
        teaching_annotations: skill.teachingAnnotations ?? [],
        source: skill.source ?? 'user',
        source_ref: skill.sourceRef ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,command' },
    )
    .select('id, skill, created_at, updated_at')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Could not save Toolbox skill.' }, { status: 500 });
  }

  return NextResponse.json({ skill: normalizeSkill(data as ToolboxSkillRow) }, { status: 201 });
}
