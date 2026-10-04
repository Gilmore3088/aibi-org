// GET /api/skills/bundle/<role> — every skill a playbook includes (its role
// skills, the everyday skills, and the Excel/PowerPoint skills) in one zip.
// Claude takes one skill per upload, so the bundle holds one ready-to-upload
// zip per skill plus a README saying how to add them.

import { ALL_SKILLS } from '@content/skills';
import { PLAYBOOKS, type RoleSlug } from '@/app/playbooks/data';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';
import { canOpenPlaybook, getSkillAccess } from '@/lib/skills/access';
import { skillFolderName, toSkillMd } from '@/lib/skills/render';
import { buildZip } from '@/lib/skills/zip';

export async function GET(request: Request, { params }: { params: Promise<{ role: string }> }): Promise<Response> {
  const { role } = await params;
  const playbook = PLAYBOOKS[role as RoleSlug];
  if (!playbook) return Response.json({ error: 'No playbook with that name.' }, { status: 404 });

  const limited = await rateLimitOrFail({
    key: 'skills-bundle',
    scope: 'ip',
    identifier: getRequestIp(request),
    max: 20,
    windowSeconds: 3600,
  });
  if (limited) return limited as unknown as Response;

  const access = await getSkillAccess();
  if (!canOpenPlaybook(access, role as RoleSlug)) {
    return Response.json(
      { error: 'Take the free assessment to unlock your role\'s playbook, or enroll to unlock all of them.', unlock: '/assessment' },
      { status: 403 },
    );
  }

  const skills = ALL_SKILLS.filter((s) => s.group === role || s.group === 'everyday' || s.group === 'office');
  const folder = `aibi-${role}-skills`;
  const readme = `${playbook.eyebrow}: ${skills.length} skills

Each .zip in this folder is one Claude Skill.

To add one:
1. In Claude, open Customize > Skills.
2. Upload the skill's .zip file and turn it on.
3. Ask for what you need, or name the skill ("rewrite this email").

Skills you turn on also work in Claude for Excel, PowerPoint, Word and Outlook.
Your organization's admin may need to allow custom skills first.

Skills:
${skills.map((s) => `- ${s.name} (${s.id}): ${s.useWhen}`).join('\n')}

The AI Banking Institute. Review each output before you use it.
`;
  const zip = buildZip([
    { path: `${folder}/README.txt`, content: readme },
    ...skills.map((s) => ({
      path: `${folder}/${skillFolderName(s)}.zip`,
      content: buildZip([{ path: `${skillFolderName(s)}/SKILL.md`, content: toSkillMd(s) }]),
    })),
  ]);
  return new Response(zip, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${folder}.zip"`,
      'Content-Length': String(zip.length),
      'Cache-Control': 'private, no-store',
    },
  });
}
