// /guides — index of evergreen, search-intent guides, grouped by the eight
// canonical readiness dimensions (same order the assessment reports them).
// Briefings are the dated feed; guides are the reference shelf.

import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/mockup';
import { AxSection } from '@/components/ax';
import { DIMENSION_LABELS, type Dimension } from '@content/assessments/v4/types';
import { listGuides } from '@content/guides/_lib/registry';
import { breadcrumbListJsonLd, jsonLdString } from '@/lib/seo/jsonld';

export const metadata: Metadata = {
  title: 'AI Guides for Community Banks and Credit Unions — The AI Banking Institute',
  description:
    'Practical, sourced guides to AI policy, vendor review, data safety, and examiner readiness for community banks and credit unions.',
  alternates: { canonical: '/guides' },
};

const DIMENSION_ORDER = Object.keys(DIMENSION_LABELS) as Dimension[];

export default async function GuidesIndex() {
  const guides = await listGuides();
  const groups = DIMENSION_ORDER.map((d) => ({
    dimension: d,
    label: DIMENSION_LABELS[d],
    items: guides.filter((g) => g.dimension === d),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="mockup-scope ax-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(breadcrumbListJsonLd({ items: [{ name: 'Guides', slug: '/guides' }] })),
        }}
      />
      <SiteHeader activePath="/resources" cta={{ label: 'Get readiness score', href: '/assessment/take' }} />

      <header className="ax-masthead">
        <div className="mk-container">
          <p className="ax-cmd">guides --audience community-banks,credit-unions</p>
          <div className="ax-masthead-row">
            <h1 className="ax-display">Guides</h1>
            <p className="ax-masthead-lede">
              Answers to the questions bankers actually ask about AI: what to write down, what to ask a
              vendor, what an examiner will want to see. Organized by the eight readiness dimensions. For
              what changed this week, read the <Link href="/briefings">briefings</Link>.
            </p>
          </div>
        </div>
      </header>

      {groups.map((group) => (
        <AxSection key={group.dimension} id={group.dimension} kicker="Dimension" title={group.label} light>
          <div className="ax-cards">
            {group.items.map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`} className="ax-card">
                <span className="ax-card-body">
                  <span className="ax-card-meta">
                    <span className="ax-gold">{g.audience}</span> · {g.readMinutes} min
                  </span>
                  <span className="ax-card-title">{g.title}</span>
                  <span className="ax-card-dek">{g.description}</span>
                </span>
              </Link>
            ))}
          </div>
        </AxSection>
      ))}
    </div>
  );
}
