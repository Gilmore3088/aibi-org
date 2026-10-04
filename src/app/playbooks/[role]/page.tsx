import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowGlyph, Button, SiteHeader } from '@/components/mockup';
import { AxHero, AxSection, AxWindow } from '@/components/ax';
import { PLAYBOOKS, type RoleSlug } from '../data';
import { PlaybookDownloadButton } from '../_components/PlaybookDownloadButton';
import { getAssetsForPlaybook, type PlaybookSlug } from '@content/playbook-assets/data';

export function generateStaticParams() {
  return (Object.keys(PLAYBOOKS) as RoleSlug[]).map((role) => ({ role }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ role: string }> },
): Promise<Metadata> {
  const { role } = await params;
  const playbook = (PLAYBOOKS as Record<string, { eyebrow?: string; lede?: string } | undefined>)[role];
  if (!playbook) {
    return { title: 'Role Playbook — The AI Banking Institute' };
  }
  return {
    title: `${playbook.eyebrow ?? 'Role Playbook'} — The AI Banking Institute`,
    ...(playbook.lede ? { description: playbook.lede } : {}),
  };
}

// Best-effort slug derivation when the playbook data.ts asset name doesn't
// match an asset registry entry by exact title — kebab the name, drop
// punctuation, and let the registry's slug field match.
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default async function PlaybookPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const data = PLAYBOOKS[role as RoleSlug];
  if (!data) notFound();
  const roleTitle = data.eyebrow.replace(/ Playbook$/, '');
  const builtAssets = getAssetsForPlaybook(role as PlaybookSlug);
  const templates = data.assets.flatMap((asset) => {
    const built = builtAssets.find(
      (a) =>
        a.title.toLowerCase() === asset.name.toLowerCase() ||
        a.slug === toSlug(asset.name),
    );
    if (asset.status !== 'Ready' || !built) return [];
    return [{ name: asset.name, type: asset.type, href: `/playbooks/${role}/${built.slug}` }];
  });

  const first = templates[0];

  return (
    <div className="mockup-scope ax-page">
      <SiteHeader activePath="/playbooks" cta={{ label: 'Get readiness score', href: '/assessment/take' }} />

      <AxHero
        cmd={`playbooks/${role} --open`}
        title={data.title}
        lede={data.lede}
        actions={
          <>
            {first ? (
              <Button variant="gold" size="lg" href={first.href}>
                Open the first template <ArrowGlyph />
              </Button>
            ) : null}
            <PlaybookDownloadButton role={role} roleTitle={roleTitle} />
          </>
        }
        aside={
          templates.length > 0 ? (
            <AxWindow title={`${role}/templates`} meta={`${templates.length} free`}>
              <ul className="pb-open">
                {templates.map((t) => (
                  <li key={t.href}>
                    <Link href={t.href}>
                      <span className="pb-open-type">{t.type}</span>
                      <span className="pb-open-name">{t.name}</span>
                      <span className="pb-open-go">Open template <span aria-hidden="true">→</span></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </AxWindow>
          ) : undefined
        }
      />

      <main>
        <AxSection light id="checklist">
          <div className="pb-check">
            <div className="ax-section-head">
              <p className="ax-k">Before it goes out</p>
              <h2 className="ax-display">Check every draft.</h2>
              <p>One fail and it goes back.</p>
            </div>
            <div className="ax-paper pb-check-paper">
              <p className="ax-k">{role}/review-checklist.md</p>
              <ul className="pb-checks">
                {data.checklist.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </AxSection>
      </main>

      <section className="ax-section ax-close">
        <div className="mk-container">
          <h2 className="ax-display">Build your own next.</h2>
          <p className="ax-muted">The Foundation course: eighteen short builds, each one a working tool.</p>
          <div className="ax-actions">
            {/* #327D — the purchase page reads ?role= and tailors its framing. */}
            <Button variant="gold" size="lg" href={`/courses/foundation/program/purchase?role=${role}`}>
              Start the course <ArrowGlyph />
            </Button>
            <Button variant="ghost-dark" size="lg" href="/courses/foundation/preview">
              Try module 1 free
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
