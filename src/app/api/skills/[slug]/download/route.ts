// GET /api/skills/<slug>/download — the skill as a Claude Skill zip
// (<slug>/SKILL.md). Upload it in Claude under Customize > Skills; once
// enabled it also works in Claude for Excel, PowerPoint, Word and Outlook.
// Locked skills return 403 with where to unlock them.

import { getSkillBySlug } from '@content/skills';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';
import { canOpenSkill, getSkillAccess } from '@/lib/skills/access';
import { skillFolderName, toSkillMd } from '@/lib/skills/render';
import { buildZip } from '@/lib/skills/zip';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }): Promise<Response> {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) return Response.json({ error: 'No skill with that name.' }, { status: 404 });

  const limited = await rateLimitOrFail({
    key: 'skills-download',
    scope: 'ip',
    identifier: getRequestIp(request),
    max: 60,
    windowSeconds: 3600,
  });
  if (limited) return limited as unknown as Response;

  const access = await getSkillAccess();
  if (!canOpenSkill(access, skill)) {
    return Response.json(
      { error: 'Take the free assessment to unlock your role\'s skills, or enroll to unlock all of them.', unlock: '/assessment' },
      { status: 403 },
    );
  }

  const folder = skillFolderName(skill);
  const zip = buildZip([{ path: `${folder}/SKILL.md`, content: toSkillMd(skill) }]);
  return new Response(zip, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${folder}.zip"`,
      'Content-Length': String(zip.length),
      'Cache-Control': 'private, no-store',
    },
  });
}
