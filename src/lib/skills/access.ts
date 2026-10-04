// Who can open which skills.
//
//   - Any paid product (course, In-Depth assessment, toolbox) opens every
//     playbook and every skill.
//   - Finishing the free assessment opens the playbook for the role picked
//     there, plus the everyday and Excel/PowerPoint skills.
//   - Everyone else sees skill names and one sample skill per playbook.
//
// The free-assessment signal is a signed cookie set by /api/capture-email,
// because the assessment is anonymous. A signed-in user whose profile has a
// role gets the same unlock without the cookie.

import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import { getSkillsByGroup, type BankerSkill } from '@content/skills';
import { normalizeStoredRoleToFreeRole, parseFreeRole, type FreeRole } from '@content/assessments/v3/roles';
import { FREE_ROLE_TO_PLAYBOOK, type RoleSlug } from '@/app/playbooks/data';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import { getAuthUser } from '@/lib/api/auth';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

export const PLAYBOOK_ROLE_COOKIE = 'aibi_playbook_role';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export interface SkillAccess {
  readonly paid: boolean;
  /** Playbooks this visitor has unlocked. Empty for an anonymous visitor. */
  readonly roles: readonly RoleSlug[];
}

function secret(): string | null {
  const s = process.env.SKILLS_ACCESS_SECRET ?? process.env.CRON_SECRET;
  if (s) return s;
  return process.env.NODE_ENV === 'production' ? null : 'dev-only-skills-access';
}

function sign(value: string, key: string): string {
  return createHmac('sha256', key).update(value).digest('base64url');
}

export function signPlaybookRole(role: FreeRole): string | null {
  const key = secret();
  return key ? `${role}.${sign(role, key)}` : null;
}

export function verifyPlaybookRole(raw: string | undefined): FreeRole | null {
  const key = secret();
  if (!raw || !key) return null;
  const dot = raw.lastIndexOf('.');
  if (dot < 1) return null;
  const role = parseFreeRole(raw.slice(0, dot));
  if (!role) return null;
  const expected = Buffer.from(sign(role, key));
  const given = Buffer.from(raw.slice(dot + 1));
  return expected.length === given.length && timingSafeEqual(expected, given) ? role : null;
}

/** Called by /api/capture-email after a free assessment is captured. */
export function setPlaybookRoleCookie(response: NextResponse, role: FreeRole | undefined): NextResponse {
  if (!role) return response;
  const value = signPlaybookRole(role);
  if (!value) return response;
  response.cookies.set(PLAYBOOK_ROLE_COOKIE, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}

async function profileRole(): Promise<FreeRole | null> {
  if (!isSupabaseConfigured()) return null;
  const user = await getAuthUser();
  if (!user) return null;
  const supabase = createServiceRoleClient();
  // Two plain .eq() lookups rather than one .or() string, so an email can
  // never be read as filter syntax.
  const lookups: [column: 'user_id' | 'email', value: string][] = [['user_id', user.id]];
  if (user.email) lookups.push(['email', user.email.toLowerCase()]);
  for (const [column, value] of lookups) {
    const { data } = await supabase
      .from('user_profiles')
      .select('role')
      .eq(column, value)
      .not('readiness_at', 'is', null)
      .limit(1)
      .maybeSingle();
    const role = data ? normalizeStoredRoleToFreeRole(data.role) : null;
    if (role) return role;
  }
  return null;
}

export async function getSkillAccess(): Promise<SkillAccess> {
  try {
    if (await getPaidToolboxAccess()) return { paid: true, roles: [] };
  } catch {
    // Supabase unavailable: fall through to the free signals.
  }
  const jar = await cookies();
  const fromCookie = verifyPlaybookRole(jar.get(PLAYBOOK_ROLE_COOKIE)?.value);
  let role = fromCookie;
  if (!role) {
    try {
      role = await profileRole();
    } catch {
      role = null;
    }
  }
  return { paid: false, roles: role ? [FREE_ROLE_TO_PLAYBOOK[role]] : [] };
}

export function canOpenPlaybook(access: SkillAccess, role: RoleSlug): boolean {
  return access.paid || access.roles.includes(role);
}

/** The first skill in each playbook is open to everyone, as a sample. */
export function isSampleSkill(skill: BankerSkill): boolean {
  if (skill.group === 'everyday' || skill.group === 'office') return false;
  return getSkillsByGroup(skill.group)[0]?.id === skill.id;
}

export function canOpenSkill(access: SkillAccess, skill: BankerSkill): boolean {
  if (access.paid || isSampleSkill(skill)) return true;
  if (skill.group === 'everyday' || skill.group === 'office') return access.roles.length > 0;
  return access.roles.includes(skill.group);
}
