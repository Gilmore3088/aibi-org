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

const RISK_LABEL = { high: 'High review', med: 'Review', low: 'Low risk' } as const;

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

  return (
    <div className="mockup-scope ax-page">
      {/* Nav CTA matches the rest of the site (top-of-funnel readiness),
          so the playbook doesn't ship three identical enroll CTAs (hero +
          footer + nav). Issue #327 (part C). */}
      <SiteHeader activePath="/playbooks" cta={{ label: 'Get readiness score', href: '/assessment/take' }} />

      <AxHero
        cmd={`playbooks/${role} --open`}
        title={data.title}
        lede={data.lede}
        actions={
          <>
            {/* #327D — the purchase page reads ?role= and surfaces
                role-tailored framing, so the role-specific label is honest. */}
            <Button variant="gold" size="lg" href={`/courses/foundation/program/purchase?role=${role}`}>
              Start your {roleTitle} path <ArrowGlyph />
            </Button>
            <PlaybookDownloadButton role={role} roleTitle={roleTitle} />
          </>
        }
        aside={
          <AxWindow title={`${role}/workflow.md`} meta={`${data.ops.length} steps`}>
            <p className="ax-k ax-gold">{data.opHeading}</p>
            <ol className="pb-steps">
              {data.ops.map((step) => (
                <li key={step.step}>
                  <span className="pb-step-n">{step.step}</span>
                  <span className="pb-step-body">
                    <strong>{step.title}</strong>
                    <span className="pb-step-out">→ {step.artifact}</span>
                  </span>
                </li>
              ))}
            </ol>
          </AxWindow>
        }
      />

      <main>
        <AxSection light id="use-cases" kicker="Use cases" title={data.usesHeading}>
          <ol className="pb-uses">
            {data.uses.map((useCase, idx) => (
              <li key={useCase.title}>
                <span className="pb-use-n">{String(idx + 1).padStart(2, '0')}</span>
                <span className="pb-use-main">
                  <h3>{useCase.title}</h3>
                  <p>{useCase.desc}</p>
                </span>
                <span className="pb-use-out">
                  <span className="pb-use-artifact">{useCase.artifact}</span>
                  <span className={`pb-risk is-${useCase.risk}`}>{RISK_LABEL[useCase.risk]}</span>
                </span>
              </li>
            ))}
          </ol>
        </AxSection>

        <AxSection id="checklist">
          <div className="pb-check">
            <div className="ax-section-head">
              <p className="ax-k">Review checklist</p>
              <h2 className="ax-display">Review checklist.</h2>
              <p>A named reviewer checks each line. If one fails, the draft goes back.</p>
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

        {templates.length > 0 && (
          <AxSection
            light
            id="templates"
            kicker="Templates"
            title="Open a file. Adapt it today."
            lede="Ready-to-use templates from this playbook. Each one opens in full, free."
          >
            <ul className="pb-files">
              {templates.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="pb-file">
                    <span className="pb-file-type">{t.type}</span>
                    <span className="pb-file-name">{t.name}</span>
                    <span className="pb-file-open">Open template <span aria-hidden="true">→</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          </AxSection>
        )}
      </main>

      <section className="ax-section ax-close">
        <div className="mk-container">
          <p className="ax-k">{data.eyebrow}</p>
          <h2 className="ax-display">{data.cta.heading}</h2>
          <p className="ax-muted">{data.cta.body}</p>
          <div className="ax-actions">
            <Button variant="gold" size="lg" href="/courses/foundation/program/purchase">
              Start the course <ArrowGlyph />
            </Button>
            {/* /my-toolbox is auth-gated (#318); send readers to the public hub. */}
            <Button variant="ghost-dark" size="lg" href="/resources">
              Browse downloads
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
