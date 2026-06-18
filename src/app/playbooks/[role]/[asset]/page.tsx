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
import {
  SiteHeader,
  Section,
  EyebrowChip,
  CtaBand,
  DocumentPreview,
} from '@/components/mockup';
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

function sectionPreviewLines(section: AssetSection): string[] {
  if (section.items && section.items.length > 0) return section.items.slice(0, 3);
  if (section.steps && section.steps.length > 0) return section.steps.slice(0, 3);
  if (section.principle) return [section.principle];
  if (section.intro) return [section.intro];
  if (section.prompt) return ['Copy the prompt block, then adapt the role, context, and review owner.'];
  return ['Open the full section below for detail.'];
}

export default async function PlaybookAssetPage(props: PageProps) {
  const params = await props.params;
  const a = getPlaybookAsset(params.asset);
  if (!a || a.playbook !== params.role) notFound();

  return (
    <div className="mockup-scope">
      <SiteHeader
        activePath="/playbooks"
        cta={{ label: 'Get readiness score', href: '/assessment/take' }}
      />

      {/* Hero — compact, breadcrumb-led so the parent playbook stays
          one click away. Mirrors the printed playbook cover hierarchy. */}
      <section className="mk-hero mk-hero-compact">
        <div className="mk-container mk-hero-inner">
          <div>
            <p
              style={{
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--slate-500)',
                marginBottom: 16,
              }}
            >
              <Link
                href={`/playbooks/${a.playbook}`}
                style={{ color: 'var(--slate-500)', textDecoration: 'none' }}
              >
                {playbookLabel(a.playbook)} Playbook
              </Link>
              <span style={{ margin: '0 8px' }} aria-hidden>·</span>
              {a.kind}
            </p>
            <EyebrowChip>{a.kind} · {a.readMinutes} min</EyebrowChip>
            <h1>{a.title}</h1>
            <p className="mk-lede">{a.dek}</p>
            <p
              style={{
                color: 'var(--slate-600)',
                fontSize: 14,
                marginTop: 12,
              }}
            >
              <strong style={{ color: 'var(--ink)' }}>For:</strong>{' '}
              {a.audience}
            </p>
          </div>
        </div>
      </section>

      <Section variant="std" surface="white">
        <DocumentPreview
          eyebrow={`${a.kind} preview`}
          title={a.title}
          dek={a.dek}
          sections={a.sections.slice(0, 4).map((section) => ({
            heading: section.heading,
            lines: sectionPreviewLines(section),
          }))}
          aside={
            <>
              <p className="mk-proof-eyebrow">Use this when</p>
              <p>{a.audience} need a structured starting point before adoption.</p>
              <p className="mk-proof-eyebrow" style={{ marginTop: 18 }}>
                Next step
              </p>
              <p>
                Review the full artifact below, then return to the role playbook
                for related tools.
              </p>
              <Link
                href={`/playbooks/${a.playbook}`}
                className="mk-btn mk-btn-gold"
                style={{ marginTop: 18, color: 'var(--ink)' }}
              >
                Back to playbook
              </Link>
            </>
          }
        />
      </Section>

      {/* Sections — each rendered with the PDF .play-head pattern: a navy
          panel introducing the section, then the content body in a white
          surface so the page reads as a sequence of "plays". */}
      <Section variant="std">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            maxWidth: 820,
            margin: '0 auto',
          }}
        >
          {a.sections.map((section, idx) => (
            <AssetSectionBlock
              key={section.heading}
              section={section}
              index={idx + 1}
              total={a.sections.length}
            />
          ))}

          {a.sourcedFrom.length > 0 && (
            <aside
              aria-label="Sources"
              style={{
                borderTop: '1px solid var(--ink-a10, rgba(7,26,47,0.10))',
                paddingTop: 20,
                marginTop: 12,
              }}
            >
              <p
                style={{
                  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--gold-deep)',
                  marginBottom: 8,
                }}
              >
                Sourced from
              </p>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  color: 'var(--slate-600)',
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                {a.sourcedFrom.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </Section>

      <CtaBand
        kicker={`${playbookLabel(a.playbook)} Playbook`}
        heading={<>The artifact is the start. The course is where it sticks.</>}
        body={
          <>
            Use this template, then walk through the practice loop in the
            AiBI-Foundation course — the same prompts, with reviewed work
            you can take to your team.
          </>
        }
        actions={[
          {
            label: `Start your ${playbookLabel(a.playbook)} path`,
            href: `/courses/foundation/program/purchase?role=${a.playbook}`,
            variant: 'gold',
          },
          {
            label: 'Back to the playbook',
            href: `/playbooks/${a.playbook}`,
            variant: 'ghost-dark',
          },
        ]}
      />
    </div>
  );
}

function AssetSectionBlock({
  section,
  index,
  total,
}: {
  section: AssetSection;
  index: number;
  total: number;
}) {
  return (
    <article
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--ink-a10, rgba(7,26,47,0.10))',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-soft, 0 1px 2px rgba(0,0,0,.06))',
      }}
    >
      {/* PDF .play-head — navy header with gold-soft eyebrow numbering. */}
      <header
        style={{
          background: 'var(--ink)',
          color: '#FFFFFF',
          padding: '16px 24px',
        }}
      >
        <div
          style={{
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--gold-soft)',
            marginBottom: 4,
          }}
        >
          Section {index} of {total}
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: 22,
            lineHeight: 1.25,
            color: '#FFFFFF',
            fontWeight: 600,
          }}
        >
          {section.heading}
        </h2>
      </header>

      <div style={{ padding: '24px 28px' }}>
        {section.intro && (
          <p
            style={{
              margin: '0 0 16px',
              color: 'var(--slate-600)',
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            {section.intro}
          </p>
        )}

        {section.principle && (
          <div
            style={{
              background: 'var(--cream-2)',
              borderLeft: '3px solid var(--gold)',
              borderRadius: 12,
              padding: '14px 18px',
              margin: '4px 0 16px',
              color: 'var(--ink)',
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1.55,
            }}
          >
            {section.principle}
          </div>
        )}

        {section.items && (
          <ul
            className="aibi-asset-checklist"
            style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
            }}
          >
            {section.items.map((item) => (
              <li
                key={item}
                style={{
                  position: 'relative',
                  paddingLeft: 26,
                  margin: '8px 0',
                  color: 'var(--ink)',
                  fontSize: 15,
                  lineHeight: 1.55,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    color: 'var(--gold-deep)',
                    fontWeight: 700,
                  }}
                >
                  ☐
                </span>
                {item}
              </li>
            ))}
          </ul>
        )}

        {section.steps && (
          <ol
            style={{
              margin: 0,
              paddingLeft: 22,
              color: 'var(--ink)',
              fontSize: 15,
              lineHeight: 1.6,
            }}
          >
            {section.steps.map((step) => (
              <li key={step} style={{ margin: '6px 0' }}>
                {step}
              </li>
            ))}
          </ol>
        )}

        {section.prompt && (
          <pre
            style={{
              marginTop: 16,
              background: 'var(--ink)',
              color: '#E9EEF6',
              borderRadius: 10,
              padding: '14px 16px',
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
              fontSize: 12.5,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              overflowX: 'auto',
            }}
          >
            <span
              style={{
                display: 'block',
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--gold-soft)',
                marginBottom: 8,
              }}
            >
              Prompt
            </span>
            {section.prompt}
          </pre>
        )}
      </div>
    </article>
  );
}
