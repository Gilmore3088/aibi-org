import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowGlyph, Button, SiteHeader } from '@/components/mockup';
import { AxHero, AxSection, AxWindow } from '@/components/ax';
import { PLAYBOOKS, type RoleSlug } from '../data';
import { PlaybookDownloadButton } from '../_components/PlaybookDownloadButton';
import { ALL_SKILLS, getSkillsByGroup, type BankerSkill } from '@content/skills';
import { DATA_TEST, PROMPT_CHECK_EXAMPLE } from '@content/skills/data-test';
import { canOpenPlaybook, canOpenSkill, getSkillAccess } from '@/lib/skills/access';
import { DataLightTest } from '@/components/playbooks/DataLightTest';
import { SkillLibrary, type SkillView } from '@/components/playbooks/SkillLibrary';
import { PromptChecker } from '@/components/home/PromptChecker';

export function generateStaticParams() {
  return (Object.keys(PLAYBOOKS) as RoleSlug[]).map((role) => ({ role }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ role: string }> },
): Promise<Metadata> {
  const { role } = await params;
  const playbook = (PLAYBOOKS as Record<string, { eyebrow?: string; lede?: string } | undefined>)[role];
  if (!playbook) {
    return { title: 'Role Playbook' };
  }
  return {
    title: `${playbook.eyebrow ?? 'Role Playbook'}: AI Skills for the Role`,
    alternates: { canonical: `/playbooks/${role}` },
    ...(playbook.lede ? { description: playbook.lede } : {}),
  };
}

function teaser(s: BankerSkill): SkillView {
  return { open: false, id: s.id, slug: s.slug, name: s.name, useWhen: s.useWhen, youGet: s.youGet, apps: s.apps };
}

function openView(s: BankerSkill): SkillView {
  return {
    open: true,
    id: s.id,
    slug: s.slug,
    name: s.name,
    useWhen: s.useWhen,
    youGet: s.youGet,
    apps: s.apps,
    usesTemplate: s.usesTemplate,
    fields: s.fields,
    instructions: s.instructions,
    checks: s.checks,
    neverPaste: s.neverPaste,
  };
}

const HOW_TO = [
  { step: 'Pick a skill', body: 'Each one does one job you already do.' },
  { step: 'Fill in the blanks', body: 'Copy the finished prompt into any AI tool.' },
  { step: 'Or add it to Claude', body: 'Download it once. It works in chat, Excel, PowerPoint, Word and Outlook.' },
];

export default async function PlaybookPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const data = PLAYBOOKS[role as RoleSlug];
  if (!data) notFound();
  const slug = role as RoleSlug;
  const roleTitle = data.eyebrow.replace(/ Playbook$/, '');

  const access = await getSkillAccess();
  const unlocked = canOpenPlaybook(access, slug);
  const roleSkills = getSkillsByGroup(slug);
  // Locked visitors still get one full sample: the playbook's first skill.
  const view = (s: BankerSkill) => (canOpenSkill(access, s) ? openView(s) : teaser(s));
  const sections = [
    { title: `${roleTitle} skills`, skills: roleSkills.map(view) },
    { title: 'Everyday skills', skills: getSkillsByGroup('everyday').map(view) },
    { title: 'Excel and PowerPoint', skills: getSkillsByGroup('office').map(view) },
  ];
  const total = sections.reduce((n, s) => n + s.skills.length, 0);
  const unlock = {
    label: 'Take the free assessment',
    href: '/assessment',
    note: `The free assessment unlocks the playbook for your role. Any purchase unlocks every playbook and all ${ALL_SKILLS.length} skills.`,
  };

  return (
    <div className="mockup-scope ax-page">
      <SiteHeader activePath="/playbooks" cta={{ label: 'Get readiness score', href: '/assessment/take' }} />

      <AxHero
        cmd={`playbooks/${role} --skills`}
        title={data.title}
        lede={`${total} skills for ${roleTitle.toLowerCase()} work, a data test, and a prompt check. Fill in the blanks, or add them to Claude.`}
        actions={
          unlocked ? (
            <>
              <Button variant="gold" size="lg" href="#skills">
                Open the skills <ArrowGlyph />
              </Button>
              <a className="mk-btn mk-btn-ghost-dark mk-btn-lg" href={`/api/skills/bundle/${role}`}>
                Download all {total} for Claude
              </a>
            </>
          ) : (
            <>
              <Button variant="gold" size="lg" href={unlock.href}>
                Unlock with the free assessment <ArrowGlyph />
              </Button>
              <Button variant="ghost-dark" size="lg" href="#skills">
                Try a sample skill
              </Button>
            </>
          )
        }
        aside={
          <AxWindow title={`${role}/how-to.md`} meta="3 steps">
            <ol className="pb-steps">
              {HOW_TO.map((h, i) => (
                <li key={h.step}>
                  <span className="pb-step-n">{String(i + 1).padStart(2, '0')}</span>
                  <span className="pb-step-body">
                    <strong>{h.step}</strong>
                    <span className="pb-step-out">{h.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </AxWindow>
        }
      />

      <main>
        <AxSection light id="learn" kicker="Learn" title={data.usesHeading}>
          <div className="pb-learn">
            <ul className="pb-learn-uses">
              {data.uses.map((u) => (
                <li key={u.title}>
                  <h3>{u.title}</h3>
                  <p>{u.desc}</p>
                </li>
              ))}
            </ul>
            <div className="ax-paper pb-check-paper">
              <p className="ax-k">Check every draft before it goes out</p>
              <ul className="pb-checks">
                {data.checklist.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </AxSection>

        <AxSection id="test" kicker="Test yourself" title="Green, yellow or red?">
          <p className="pb-test-lede">Six things you might paste into an AI tool. Sort each one.</p>
          <DataLightTest items={DATA_TEST[slug]} />
        </AxSection>

        <AxSection light id="skills" kicker="Skills" title={unlocked ? 'Pick one. Fill in the blanks.' : 'Try one free. Unlock the rest.'}>
          <SkillLibrary sections={sections} unlock={unlock} />
        </AxSection>

        {/* Last check before anything gets pasted. */}
        <PromptChecker example={PROMPT_CHECK_EXAMPLE[slug]} />
      </main>

      <section className="ax-section ax-light is-paper ax-close">
        <div className="mk-container">
          <h2 className="ax-display">Build your own next.</h2>
          <p className="ax-muted">The Foundation course: eighteen short builds, each one a working tool.</p>
          <div className="ax-actions">
            {/* #327D: the purchase page reads ?role= and tailors its framing. */}
            <Button variant="gold" size="lg" href={`/courses/foundation/program/purchase?role=${role}`}>
              Start the course <ArrowGlyph />
            </Button>
            <PlaybookDownloadButton role={role} roleTitle={roleTitle} />
          </div>
        </div>
      </section>
    </div>
  );
}
