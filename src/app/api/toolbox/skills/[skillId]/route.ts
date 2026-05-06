import { NextResponse } from 'next/server';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getPaidToolboxAccess, hasFullToolboxAccess } from '@/lib/toolbox/access';
import type { ToolboxSkill } from '@/lib/toolbox/types';
import { validateSkill } from '../validateSkill';

interface RouteParams {
  readonly params: { readonly skillId: string };
}

function validId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const access = await getPaidToolboxAccess();
  if (!hasFullToolboxAccess(access)) {
    return NextResponse.json({ error: 'Paid access required.' }, { status: 403 });
  }
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Toolbox storage is not configured.' }, { status: 503 });
  if (!validId(params.skillId)) return NextResponse.json({ error: 'Invalid skill id.' }, { status: 400 });

  let body: { skill?: unknown };
  try {
    body = (await request.json()) as { skill?: unknown };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const validated = validateSkill(body.skill);
  if (!validated) return NextResponse.json({ error: 'Invalid skill payload.' }, { status: 400 });

  const skill: ToolboxSkill = { ...validated, id: params.skillId } as ToolboxSkill;

  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('toolbox_skills')
    .update({
      template_id: skill.templateId ?? null,
      command: skill.cmd,
      name: skill.name,
      maturity: skill.maturity,
      skill,
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
    })
    .eq('id', params.skillId)
    .eq('user_id', access.userId)
    .select('id, skill, created_at, updated_at')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Could not update Toolbox skill.' }, { status: 500 });
  }

  return NextResponse.json({
    skill: {
      ...(data.skill as ToolboxSkill),
      id: data.id,
      created: (data.skill as ToolboxSkill).created ?? data.created_at,
      modified: data.updated_at,
    },
  });
}

export async function DELETE(_request: Request, { params }: RouteParams): Promise<NextResponse> {
  const access = await getPaidToolboxAccess();
  if (!hasFullToolboxAccess(access)) {
    return NextResponse.json({ error: 'Paid access required.' }, { status: 403 });
  }
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Toolbox storage is not configured.' }, { status: 503 });
  if (!validId(params.skillId)) return NextResponse.json({ error: 'Invalid skill id.' }, { status: 400 });

  const client = createServiceRoleClient();
  const { error } = await client
    .from('toolbox_skills')
    .delete()
    .eq('id', params.skillId)
    .eq('user_id', access.userId);

  if (error) return NextResponse.json({ error: 'Could not delete Toolbox skill.' }, { status: 500 });

  return NextResponse.json({ ok: true });
}
