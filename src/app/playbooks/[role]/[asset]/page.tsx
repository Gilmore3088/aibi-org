// /playbooks/[role]/[asset] — render a structured playbook asset.
//
// Each asset is a starter document a banker can read, copy, and adapt.
// The styling deliberately echoes the printed PDF playbooks (public/
// downloads/source/_brand.css) so the on-screen artifact reads as the
// same family: navy .play-head, cream .principle callout with a gold
// left rule, dark .prompt block, gold-deep "☐" checklist markers.
//
// Issue #327 (part B). Content lives in content/playbook-assets/data.ts.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowGlyph, Button, SiteHeader } from '@/components/mockup';
import { AxHero, AxWindow, CopyPrompt } from '@/components/ax';
import {
  PLAYBOOK_ASSETS,
  getPlaybookAsset,
  type AssetSection,
} from '@content/playbook-assets/data';
import { PLAYBOOKS } from '../../data';

interface PageProps {
  params: Promise<{ role: string; asset: string }>;
}

export function generateStaticParams() {
  return PLAYBOOK_ASSETS.map((a) => ({ role: a.playbook, asset: a.slug }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const a = getPlaybookAsset(params.asset);
  if (!a || a.playbook !== params.role) return { title: 'Asset not found' };
  return {
    alternates: { canonical: `/playbooks/${a.playbook}/${a.slug}` },
    title: `${a.title} — ${playbookLabel(a.playbook)} Playbook`,
    description: a.dek,
    openGraph: {
      title: a.title,
      description: a.dek,
      url: `/playbooks/${a.playbook}/${a.slug}`,
      type: 'article',
    },
    twitter: {
      title: a.title,
      description: a.dek,
    },
  };
}

function playbookLabel(slug: string): string {
  return PLAYBOOKS[slug as keyof typeof PLAYBOOKS]?.eyebrow.replace(
    / Playbook$/,
    '',
  ) ?? slug;
}


export default async function PlaybookAssetPage(props: PageProps) {
  const params = await props.params;
  const a = getPlaybookAsset(params.asset);
  if (!a || a.playbook !== params.role) notFound();
  const role = playbookLabel(a.playbook);
  const fileName = `${a.slug}.md`;

  return (
    <div className="mockup-scope ax-page">
      <SiteHeader activePath="/playbooks" cta={{ label: 'Get readiness score', href: '/assessment/take' }} />

      <AxHero
        cmd={`playbooks/${a.playbook}/${a.slug}`}
        title={a.title}
        lede={a.dek}
        actions={
          <>
            <Button variant="gold" size="lg" href="#document">
              Read the {a.kind.toLowerCase()} <ArrowGlyph />
            </Button>
            <Button variant="ghost-dark" size="lg" href={`/api/playbooks/${a.playbook}/${a.slug}/word`}>
              Download Word file
            </Button>
          </>
        }
        aside={
          <AxWindow title={fileName} meta={`${a.kind} · ${a.readMinutes} min`}>
            <p className="ax-k ax-gold">Contents</p>
            <ol className="pb-toc">
              {a.sections.map((section, idx) => (
                <li key={section.heading}>
                  <a href={`#section-${idx + 1}`}>
                    <span className="pb-step-n">{String(idx + 1).padStart(2, '0')}</span>
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
            <p className="pb-toc-for">
              <strong>For:</strong> {a.audience}
            </p>
          </AxWindow>
        }
      />

      <main>
        <section id="document" className="ax-section ax-light" aria-label={a.title}>
          <div className="mk-container">
            <p className="pb-crumb">
              <Link href="/playbooks">Playbooks</Link>
              <span aria-hidden="true"> / </span>
              <Link href={`/playbooks/${a.playbook}`}>{role}</Link>
              <span aria-hidden="true"> / </span>
              {a.kind}
            </p>
            <article className="pb-doc">
              {a.sections.map((section, idx) => (
                <AssetSectionBlock key={section.heading} section={section} index={idx + 1} />
              ))}
              {a.sourcedFrom.length > 0 && (
                <aside aria-label="Sources" className="pb-doc-sources">
                  <p className="ax-k">Sourced from</p>
                  <ul>
                    {a.sourcedFrom.map((source) => (
                      <li key={source}>{source}</li>
                    ))}
                  </ul>
                </aside>
              )}
            </article>
          </div>
        </section>
      </main>

      <section className="ax-section ax-close">
        <div className="mk-container">
          <p className="ax-k">{role} Playbook</p>
          <h2 className="ax-display">
            The file is the start. <span className="ax-gold">Practice is where it sticks.</span>
          </h2>
          <p className="ax-muted">
            The AiBI-Foundation course walks through the same prompts, with reviewed work you can take to your team.
          </p>
          <div className="ax-actions">
            <Button variant="gold" size="lg" href={`/courses/foundation/program/purchase?role=${a.playbook}`}>
              Start your {role} path <ArrowGlyph />
            </Button>
            <Button variant="ghost-dark" size="lg" href={`/playbooks/${a.playbook}`}>
              Back to the playbook
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function AssetSectionBlock({ section, index }: { section: AssetSection; index: number }) {
  return (
    <section id={`section-${index}`} className="pb-doc-section" aria-labelledby={`section-${index}-h`}>
      <p className="pb-doc-n">{String(index).padStart(2, '0')}</p>
      <div>
        <h2 id={`section-${index}-h`}>{section.heading}</h2>
        {section.intro && <p className="pb-doc-intro">{section.intro}</p>}
        {section.principle && <p className="pb-doc-principle">{section.principle}</p>}
        {section.items && (
          <ul className="pb-checks">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        {section.fields && (
          <dl className="pb-doc-fields">
            {section.fields.map((field) => (
              <div key={field.label}>
                <dt>{field.label}</dt>
                <dd>{field.help}</dd>
              </div>
            ))}
          </dl>
        )}
        {section.steps && (
          <ol className="pb-doc-steps">
            {section.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        )}
        {section.prompt && <CopyPrompt label="Prompt" prompt={section.prompt} />}
      </div>
    </section>
  );
}
