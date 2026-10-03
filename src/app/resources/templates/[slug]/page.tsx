// /resources/templates/[slug] — render an inline practical template.
//
// Each template is a structured starter document a banker can read,
// download, and adapt. Content lives in src/app/resources/templates/data.ts.

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowGlyph, Button, SiteHeader } from '@/components/mockup';
import { AxHero, AxWindow } from '@/components/ax';
import { TEMPLATES, getTemplate } from '../data';
import { TemplateActions } from './TemplateActions';

interface PageProps {
  params: Promise<{ slug: string }>;
}


export function generateStaticParams() {
  // 'ai-workflow-sop' has a dedicated static page at
  // /resources/templates/ai-workflow-sop (the interactive SOP builder), so
  // exclude it here — otherwise the dynamic param collides with that static
  // route now that both live under /resources/templates/ (post 2026-06-01
  // /research→/resources consolidation).
  return TEMPLATES.filter((t) => t.slug !== 'ai-workflow-sop').map((t) => ({
    slug: t.slug,
  }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const t = getTemplate(params.slug);
  if (!t) return { title: 'Template not found' };
  return {
    alternates: { canonical: `/resources/templates/${t.slug}` },
    title: `${t.title} — AI Banking Resources`,
    description: t.dek,
    openGraph: {
      title: t.title,
      description: t.dek,
      url: `/resources/templates/${t.slug}`,
      type: 'article',
    },
    twitter: {
      title: t.title,
      description: t.dek,
    },
  };
}

export default async function TemplatePage(props: PageProps) {
  const params = await props.params;
  const t = getTemplate(params.slug);
  if (!t) notFound();

  return (
    <div className="mockup-scope ax-page">
      <SiteHeader activePath="/resources" cta={{ label: 'Get readiness score', href: '/assessment/take' }} />

      <AxHero
        cmd={`resources/templates/${t.slug}`}
        title={t.title}
        lede={t.dek}
        actions={<TemplateActions title={t.title} slug={t.slug} />}
        aside={
          <AxWindow title={`${t.slug}.docx`} meta={`Template · ${t.readMinutes} min`}>
            <p className="ax-k ax-gold">Contents</p>
            <ol className="pb-toc">
              {t.sections.map((section, idx) => (
                <li key={section.heading}>
                  <a href={`#section-${idx + 1}`}>
                    <span className="pb-step-n">{String(idx + 1).padStart(2, '0')}</span>
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
            <p className="pb-toc-for">
              <strong>For:</strong> {t.audience}
            </p>
          </AxWindow>
        }
      />

      <main>
        <section id="document" className="ax-section ax-light" aria-label={t.title}>
          <div className="mk-container">
            <p className="pb-crumb">
              <Link href="/resources">Resources</Link>
              <span aria-hidden="true"> / </span>
              <Link href="/resources#templates">Templates</Link>
            </p>
            <article className="pb-doc">
              {t.sections.map((s, idx) => (
                <section
                  key={s.heading}
                  id={`section-${idx + 1}`}
                  className="pb-doc-section"
                  aria-labelledby={`section-${idx + 1}-h`}
                >
                  <p className="pb-doc-n">{String(idx + 1).padStart(2, '0')}</p>
                  <div>
                    <h2 id={`section-${idx + 1}-h`}>{s.heading}</h2>
                    {s.intro && <p className="pb-doc-intro">{s.intro}</p>}
                    {s.tables?.map((table) => (
                      <div
                        key={table.caption ?? table.headers.join('-')}
                        className="pb-doc-table"
                        tabIndex={0}
                        role="region"
                        aria-label={table.caption ?? `${s.heading} table`}
                      >
                        {table.caption && <p className="pb-doc-caption">{table.caption}</p>}
                        <table>
                          <thead>
                            <tr>
                              {table.headers.map((header) => (
                                <th key={header} scope="col">{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {table.rows.map((row) => (
                              <tr key={row.join('|')}>
                                {row.map((cell, cellIndex) => (
                                  <td key={`${cellIndex}-${cell}`}>{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                    {s.items && (
                      <ul className="pb-checks">
                        {s.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                    {s.steps && (
                      <ol className="pb-doc-steps">
                        {s.steps.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                </section>
              ))}
              <aside aria-label="Sources" className="pb-doc-sources">
                <p className="ax-k">Sourced from</p>
                <ul>
                  {t.sourcedFrom.map((src) => (
                    <li key={src}>{src}</li>
                  ))}
                </ul>
              </aside>
            </article>
          </div>
        </section>
      </main>

      <section className="ax-section ax-close">
        <div className="mk-container">
          <p className="ax-k">Adapt before adopting</p>
          <h2 className="ax-display">
            A starter, <span className="ax-gold">not final policy.</span>
          </h2>
          <p className="ax-muted">
            Every template names a section your institution should change. Take it to your committee, your auditor,
            and your examiner before adoption.
          </p>
          <div className="ax-actions">
            <Button variant="gold" size="lg" href="/resources">
              Browse more resources <ArrowGlyph />
            </Button>
            <Button variant="ghost-dark" size="lg" href="/assessment/take">
              Take the free assessment
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
