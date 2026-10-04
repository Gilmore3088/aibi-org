// POST /api/skills/<slug>/feedback  { worked: boolean, note?: string }
// Records a "Did this work?" click. The weekly skills refresh uses these to
// pick which skills to improve first. Stores no personal data.

import { getSkillBySlug } from '@content/skills';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';
import { canOpenSkill, getSkillAccess } from '@/lib/skills/access';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

const NOTE_MAX = 500;

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }): Promise<Response> {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) return Response.json({ error: 'No skill with that name.' }, { status: 404 });

  const limited = await rateLimitOrFail({
    key: 'skills-feedback',
    scope: 'ip',
    identifier: getRequestIp(request),
    max: 30,
    windowSeconds: 3600,
  });
  if (limited) return limited as unknown as Response;

  let body: { worked?: unknown; note?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Send JSON: { "worked": true | false }.' }, { status: 400 });
  }
  if (typeof body.worked !== 'boolean') return Response.json({ error: '"worked" must be true or false.' }, { status: 400 });
  if (body.note !== undefined && typeof body.note !== 'string') return Response.json({ error: '"note" must be text.' }, { status: 400 });
  const note = typeof body.note === 'string' && body.note.trim() ? body.note.trim().slice(0, NOTE_MAX) : null;

  if (!canOpenSkill(await getSkillAccess(), skill)) {
    return Response.json({ error: 'Unlock this skill to rate it.' }, { status: 403 });
  }
  if (!isSupabaseConfigured()) return Response.json({ ok: true, stored: false });

  const { error } = await createServiceRoleClient().from('skill_feedback').insert({
    skill_id: skill.id,
    skill_slug: skill.slug,
    skill_version: skill.version,
    worked: body.worked,
    note,
  });
  if (error) {
    console.error('[skills/feedback] insert failed:', error.message);
    return Response.json({ error: 'Could not save that. Try again later.' }, { status: 503 });
  }
  return Response.json({ ok: true, stored: true });
}
