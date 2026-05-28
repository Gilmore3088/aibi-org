// /research/templates/[slug] — render an inline practical template.
//
// Each template is a structured starter document a banker can read,
// copy, and adapt. Content lives in src/app/research/templates/data.ts.

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  SiteHeader,
  Section,
  Button,
  EyebrowChip,
  CtaBand,
} from '@/components/mockup';
import { TEMPLATES, getTemplate } from '../data';

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const t = getTemplate(params.slug);
  if (!t) return { title: 'Template not found' };
  return {
    alternates: { canonical: `/research/templates/${t.slug}` },
    title: `${t.title} — AI Banking Resources`,
    description: t.dek,
    openGraph: {
      title: t.title,
      description: t.dek,
      url: `/research/templates/${t.slug}`,
      type: 'article',
    },
    twitter: {
      title: t.title,
      description: t.dek,
    },
  };
}

export default function TemplatePage({ params }: PageProps) {
  const t = getTemplate(params.slug);
  if (!t) notFound();

  return (
    <div className="mockup-scope">
      <SiteHeader
        activePath="/research"
        cta={{ label: 'Get readiness score', href: '/assessment/take' }}
      />

      <section className="mk-hero mk-hero-compact">
        <div className="mk-container mk-hero-inner">
          <div>
            <EyebrowChip>AI Banking Resources · Template</EyebrowChip>
            <h1>{t.title}</h1>
            <p className="mk-lede">{t.dek}</p>
            <div className="mk-tpl-meta">
              <span>For: {t.audience}</span>
              <span>{t.readMinutes} min</span>
            </div>
          </div>
        </div>
      </section>

      <Section variant="std" surface="white">
        <article className="mk-tpl-doc">
          {t.sections.map((s) => (
            <section key={s.heading} className="mk-tpl-section">
              <h2>{s.heading}</h2>
              {s.intro && <p>{s.intro}</p>}
              {s.items && (
                <ul>
                  {s.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {s.steps && (
                <ol>
                  {s.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              )}
            </section>
          ))}

          <aside className="mk-tpl-sources">
            <div className="mk-k">Sourced from</div>
            <ul>
              {t.sourcedFrom.map((src) => (
                <li key={src}>{src}</li>
              ))}
            </ul>
          </aside>

          <div className="mk-tpl-actions">
            <Button variant="ink" href="/research#templates">
              ← All templates
            </Button>
            <Button variant="ghost-light" href="/research#subscribe">
              Get new templates when they ship
            </Button>
          </div>
        </article>
      </Section>

      <CtaBand
        kicker="Adapt before adopting"
        heading={<>These are starters — not final policy.</>}
        body={
          <>
            Every template names a section your institution should change. Bring it to your
            committee, your auditor, and your examiner before adoption.
          </>
        }
        actions={[
          { label: 'Browse more resources', href: '/research', variant: 'gold' },
          { label: 'Take the readiness assessment', href: '/assessment', variant: 'ghost-dark' },
        ]}
      />
    </div>
  );
}
