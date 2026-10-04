// /briefings/[slug] — renders one MDX briefing (pulse or deep dive) inside
// the site-wide article chrome. The MDX module supplies the body; meta
// drives the header, chips, JSON-LD, and sources block. Unknown slugs 404.
//
// The six legacy essays do NOT render here — they keep their bespoke pages
// at /resources/<slug> and appear in the /briefings feed via LEGACY_ESSAYS.

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleShell } from '@/components/mockup';
import { loadBriefing } from '@content/briefings/_lib/registry';
import {
  articleJsonLd,
  breadcrumbListJsonLd,
  jsonLdString,
} from '@/lib/seo/jsonld';

interface Params {
  readonly params: Promise<{ readonly slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const mod = await loadBriefing(slug);
  if (!mod) return {};
  const { meta } = mod;
  return {
    title: meta.title,
    description: meta.dek,
    alternates: { canonical: `/briefings/${meta.slug}` },
    openGraph: {
      type: 'article',
      title: meta.title,
      description: meta.dek,
      publishedTime: meta.date,
      authors: [meta.author ?? 'AiBI Research Desk'],
    },
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function BriefingPage({ params }: Params) {
  const { slug } = await params;
  const mod = await loadBriefing(slug);
  if (!mod) notFound();
  const { meta, default: Body } = mod;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(
            articleJsonLd({
              slug: `/briefings/${meta.slug}`,
              headline: meta.title,
              description: meta.dek ?? meta.title,
              datePublished: meta.date,
              authorName: meta.author ?? 'AiBI Research Desk',
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(
            breadcrumbListJsonLd({
              items: [
                { name: 'Briefings', slug: '/briefings' },
                { name: meta.title, slug: `/briefings/${meta.slug}` },
              ],
            }),
          ),
        }}
      />
      <ArticleShell
        readMinutes={meta.readMinutes}
        byline={meta.author ?? 'AiBI Research Desk'}
        backHref="/briefings"
        backLabel="← Briefings"
        activePath="/briefings"
        closing
      >
        <article className="mk-container mk-post">
          <header className="mk-post-head">
            <p className="mk-k">
              {meta.category} · {formatDate(meta.date)}
            </p>
            <h1>{meta.title}</h1>
            {meta.dek && <p className="mk-post-dek">{meta.dek}</p>}
          </header>
          <div className="mk-prose">
            <Body />
          </div>
          {meta.sources && meta.sources.length > 0 && (
            <footer className="mk-post-sources">
              <h2>Sources</h2>
              <ol>
                {meta.sources.map((s, i) => (
                  <li key={i}>
                    {s.url ? (
                      <a href={s.url} rel="noopener noreferrer" target="_blank">
                        {s.label}
                      </a>
                    ) : (
                      s.label
                    )}
                  </li>
                ))}
              </ol>
            </footer>
          )}
        </article>
      </ArticleShell>
    </>
  );
}
