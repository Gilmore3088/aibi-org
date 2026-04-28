import { NextResponse } from 'next/server';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import type { ToolboxSkill } from '@/lib/toolbox/types';

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
  };
}

function validateSkill(input: unknown): ToolboxSkill | null {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return null;
  const skill = input as Partial<ToolboxSkill>;
  if (typeof skill.cmd !== 'string' || !skill.cmd.startsWith('/')) return null;
  if (typeof skill.name !== 'string' || skill.name.trim().length < 2) return null;
  if (typeof skill.purpose !== 'string' && typeof skill.desc !== 'string') return null;

  return {
    id: typeof skill.id === 'string' ? skill.id : '',
    templateId: typeof skill.templateId === 'string' ? skill.templateId : undefined,
    cmd: skill.cmd.trim(),
    name: skill.name.trim(),
    dept: skill.dept ?? 'General',
    deptFull: skill.deptFull ?? skill.dept ?? 'General',
    difficulty: skill.difficulty ?? 'beginner',
    timeSaved: skill.timeSaved ?? 'Varies',
    cadence: skill.cadence ?? 'As needed',
    desc: skill.desc ?? skill.purpose ?? '',
    purpose: skill.purpose ?? skill.desc ?? '',
    success: skill.success ?? '',
    files: Array.isArray(skill.files) ? skill.files.map(String) : [],
    connectors: Array.isArray(skill.connectors) ? skill.connectors.map(String) : [],
    questions: skill.questions ?? '',
    steps: Array.isArray(skill.steps) ? skill.steps.map(String) : [],
    output: skill.output ?? 'Markdown (.md)',
    tone: skill.tone ?? 'Professional',
    length: skill.length ?? 'Concise',
    guardrails: Array.isArray(skill.guardrails) ? skill.guardrails.map(String) : [],
    customGuard: skill.customGuard ?? '',
    owner: skill.owner ?? 'Unassigned',
    maturity: skill.maturity ?? 'draft',
    version: skill.version ?? '1.0',
    samples: Array.isArray(skill.samples) ? skill.samples : [],
  };
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
    .upsert({
      user_id: access.userId,
      template_id: skill.templateId ?? null,
      command: skill.cmd,
      name: skill.name,
      maturity: skill.maturity,
      skill,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,command' })
    .select('id, skill, created_at, updated_at')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Could not save Toolbox skill.' }, { status: 500 });
  }

  return NextResponse.json({ skill: normalizeSkill(data as ToolboxSkillRow) }, { status: 201 });
}
