// /guides/[slug] — one evergreen, search-intent guide.
//
// Page anatomy (fixed, so every guide converts the same way):
//   header → MDX body → visible FAQ → sources → related guides →
//   one closing CTA (free assessment), framed by the guide's dimension.
// JSON-LD: Article + FAQPage + BreadcrumbList.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleShell } from '@/components/mockup';
import { DIMENSION_LABELS } from '@content/assessments/v4/types';
import { listGuides, loadGuide } from '@content/guides/_lib/registry';
import {
  articleJsonLd,
  breadcrumbListJsonLd,
  faqPageJsonLd,
  jsonLdString,
} from '@/lib/seo/jsonld';
import { GuideCta } from '../GuideCta';

interface Params {
  readonly params: Promise<{ readonly slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const guides = await listGuides();
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const mod = await loadGuide(slug);
  if (!mod) return {};
  const { meta } = mod;
  return {
    title: { absolute: meta.seoTitle },
    description: meta.description,
    alternates: { canonical: `/guides/${meta.slug}` },
    openGraph: {
      type: 'article',
      title: meta.title,
      description: meta.description,
      modifiedTime: meta.updated,
    },
  };
}

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default async function GuidePage({ params }: Params) {
  const { slug } = await params;
  const mod = await loadGuide(slug);
  if (!mod) notFound();
  const { meta, default: Body } = mod;
  const dimension = DIMENSION_LABELS[meta.dimension];

  const all = await listGuides();
  const related = meta.related
    .map((r) => all.find((g) => g.slug === r))
    .filter((g): g is NonNullable<typeof g> => g != null);

  const ld = [
    articleJsonLd({
      slug: `/guides/${meta.slug}`,
      headline: meta.title,
      description: meta.description,
      dateModified: meta.updated,
      authorName: 'The AI Banking Institute',
    }),
    faqPageJsonLd({
      questions: meta.faqs.map((f) => ({ question: f.q, answer: f.a })),
    }),
    breadcrumbListJsonLd({
      items: [
        { name: 'Guides', slug: '/guides' },
        { name: meta.title, slug: `/guides/${meta.slug}` },
      ],
    }),
  ];

  return (
    <>
      {ld.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(obj) }}
        />
      ))}
      <ArticleShell
        readMinutes={meta.readMinutes}
        lastUpdated={formatDate(meta.updated)}
        backHref="/guides"
        backLabel="← Guides"
        activePath="/resources"
        ctaSource={`sticky-mobile-cta-guide-${meta.slug}`}
      >
        <article className="mk-container mk-post">
          <header className="mk-post-head">
            <p className="mk-k">
              Guide · {dimension} · {meta.audience}
            </p>
            <h1>{meta.title}</h1>
            <p className="mk-post-dek">{meta.description}</p>
          </header>

          <div className="mk-prose">
            <Body />
          </div>

          <section className="mk-guide-faq" aria-labelledby="guide-faq-title">
            <h2 id="guide-faq-title">Common questions</h2>
            <dl>
              {meta.faqs.map((f) => (
                <div key={f.q}>
                  <dt>{f.q}</dt>
                  <dd>{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          {meta.sources.length > 0 && (
            <footer className="mk-post-sources">
              <h2>Sources</h2>
              <ol>
                {meta.sources.map((s) => (
                  <li key={s.label}>
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
              <p className="mk-guide-note">
                This guide is general education for community banks and credit unions, not legal or
                compliance advice. Confirm requirements with your counsel and your primary regulator.
              </p>
            </footer>
          )}

          {related.length > 0 && (
            <nav className="mk-guide-related" aria-labelledby="guide-related-title">
              <h2 id="guide-related-title">Related guides</h2>
              <ul>
                {related.map((g) => (
                  <li key={g.slug}>
                    <Link href={`/guides/${g.slug}`}>{g.title}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </article>

        <section className="ax-article-close">
          <div className="mk-container">
            <p className="ax-k">{dimension} is one of eight readiness dimensions</p>
            <h2>See where your institution stands on it.</h2>
            <p>
              The free assessment scores all eight in twelve questions and about three minutes. You get a
              score, your top gap, and a starter artifact. No login.
            </p>
            <GuideCta slug={meta.slug} placement="close" className="mk-btn mk-btn-gold mk-btn-lg">
              Take the free assessment <span aria-hidden="true">→</span>
            </GuideCta>
          </div>
        </section>
      </ArticleShell>
    </>
  );
}
