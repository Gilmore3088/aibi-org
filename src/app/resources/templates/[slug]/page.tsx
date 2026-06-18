// /resources/templates/[slug] — render an inline practical template.
//
// Each template is a structured starter document a banker can read,
// copy, and adapt. Content lives in src/app/resources/templates/data.ts.

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  SiteHeader,
  Section,
  Button,
  EyebrowChip,
  CtaBand,
  DocumentPreview,
} from '@/components/mockup';
import { TEMPLATES, getTemplate, type Template } from '../data';
import { TemplateActions } from './TemplateActions';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Serialize a template to plain Markdown so a banker can copy/download and
// adapt it (qa-site-walk U18). Server-side; the string is handed to the
// client TemplateActions component.
function templateToMarkdown(t: Template): string {
  const lines: string[] = [`# ${t.title}`, '', t.dek, ''];
  for (const s of t.sections) {
    lines.push(`## ${s.heading}`, '');
    if (s.intro) lines.push(s.intro, '');
    if (s.items) for (const item of s.items) lines.push(`- ${item}`);
    if (s.steps) s.steps.forEach((step, i) => lines.push(`${i + 1}. ${step}`));
    if (s.items || s.steps) lines.push('');
  }
  if (t.sourcedFrom.length) {
    lines.push('## Sourced from', '');
    for (const src of t.sourcedFrom) lines.push(`- ${src}`);
    lines.push('');
  }
  lines.push('---', '', 'Starter template from The AI Banking Institute — adapt before adoption.');
  return lines.join('\n');
}

function templatePreviewLines(section: Template['sections'][number]): string[] {
  if (section.items && section.items.length > 0) return section.items.slice(0, 3);
  if (section.steps && section.steps.length > 0) return section.steps.slice(0, 3);
  if (section.intro) return [section.intro];
  return ['Open the full section below for detail.'];
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

  const markdown = templateToMarkdown(t);

  return (
    <div className="mockup-scope">
      <SiteHeader
        activePath="/resources"
        cta={{ label: 'Get readiness score', href: '/assessment/take' }}
      />

      <section className="mk-hero mk-template-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <EyebrowChip>AI Banking Resources · Template</EyebrowChip>
            <h1>{t.title}</h1>
            <p className="mk-lede">{t.dek}</p>
            <div className="mk-tpl-meta">
              <span>For: {t.audience}</span>
              <span>{t.readMinutes} min</span>
            </div>
            <div style={{ marginTop: 20 }}>
              <TemplateActions markdown={markdown} slug={t.slug} surface="dark" />
            </div>
          </div>
          <TemplateHeroPreview template={t} />
        </div>
      </section>

      <Section variant="std" surface="white">
        <DocumentPreview
          eyebrow="Template preview"
          title={t.title}
          dek={t.dek}
          sections={t.sections.slice(0, 4).map((section) => ({
            heading: section.heading,
            lines: templatePreviewLines(section),
          }))}
          aside={
            <>
              <p className="mk-proof-eyebrow">For</p>
              <p>{t.audience}</p>
              <p className="mk-proof-eyebrow" style={{ marginTop: 18 }}>
                Actions
              </p>
              <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                <TemplateActions markdown={markdown} slug={t.slug} />
              </div>
            </>
          }
        />
      </Section>

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

          <div className="mk-tpl-actions" style={{ flexWrap: 'wrap', gap: 12 }}>
            <TemplateActions markdown={markdown} slug={t.slug} />
            <Button variant="ink" href="/resources#templates">
              ← All templates
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
          { label: 'Browse more resources', href: '/resources', variant: 'gold' },
          { label: 'Take the readiness assessment', href: '/assessment', variant: 'ghost-dark' },
        ]}
      />
    </div>
  );
}

function TemplateHeroPreview({ template }: { readonly template: Template }) {
  return (
    <aside className="mk-template-hero-doc" aria-label={`${template.title} preview`}>
      <div className="mk-template-hero-doc-head">
        <p className="mk-proof-eyebrow">Word-ready starter</p>
        <h2>{template.title}</h2>
        <p>{template.audience}</p>
      </div>
      <div className="mk-template-hero-doc-body">
        {template.sections.slice(0, 4).map((section, idx) => (
          <div key={section.heading} className="mk-template-hero-doc-row">
            <span>{String(idx + 1).padStart(2, '0')}</span>
            <div>
              <h3>{section.heading}</h3>
              <p>{templatePreviewLines(section)[0]}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
