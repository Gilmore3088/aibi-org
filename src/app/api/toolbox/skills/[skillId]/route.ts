import { NextResponse } from 'next/server';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import type { ToolboxSkill } from '@/lib/toolbox/types';

interface RouteParams {
  readonly params: { readonly skillId: string };
}

function validId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const access = await getPaidToolboxAccess();
  if (!access) return NextResponse.json({ error: 'Paid access required.' }, { status: 403 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Toolbox storage is not configured.' }, { status: 503 });
  if (!validId(params.skillId)) return NextResponse.json({ error: 'Invalid skill id.' }, { status: 400 });

  let body: { skill?: ToolboxSkill };
  try {
    body = (await request.json()) as { skill?: ToolboxSkill };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  if (!body.skill || typeof body.skill.name !== 'string' || typeof body.skill.cmd !== 'string') {
    return NextResponse.json({ error: 'Invalid skill payload.' }, { status: 400 });
  }

  const skill = { ...body.skill, id: params.skillId };
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('toolbox_skills')
    .update({
      template_id: skill.templateId ?? null,
      command: skill.cmd,
      name: skill.name,
      maturity: skill.maturity,
      skill,
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
  if (!access) return NextResponse.json({ error: 'Paid access required.' }, { status: 403 });
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

