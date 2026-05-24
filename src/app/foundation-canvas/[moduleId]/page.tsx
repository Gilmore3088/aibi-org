// /foundation-canvas/[moduleId] — per-module print-to-PDF canvas.
// Renders every lesson screenshot in the module stacked vertically with
// page-break-before discipline so save-as-PDF produces one screen per
// page. Header carries the module title + lesson count + a "Print this
// page" hint. Operator-gated identically to the parent canvas page.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOperatorContext } from '@/lib/addie/auth/isOperator';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import { isPreviewAuthBypassEnabled } from '@/lib/auth/previewBypass';
import { PrintButton } from './PrintButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ModuleRow {
  readonly id: string;
  readonly ordinal: number;
  readonly title: string;
  readonly tier: 'free' | 'paid';
  readonly summary: string | null;
}

interface LessonRow {
  readonly id: string;
  readonly module_id: string;
  readonly ordinal: number;
  readonly title: string;
  readonly modality: string;
  readonly duration_min: number;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}): Promise<Metadata> {
  const { moduleId } = await params;
  return {
    title: `Canvas · ${moduleId.toUpperCase()} | Foundation Course operator`,
    robots: { index: false, follow: false },
  };
}

export default async function ModuleCanvas({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const ctx = await getOperatorContext();
  const isDev = process.env.NODE_ENV !== 'production';
  if (!ctx.isOperator && !isPreviewAuthBypassEnabled() && !isDev) notFound();

  const { moduleId } = await params;
  if (!/^m[0-9]+$/.test(moduleId)) notFound();

  const svc = getAddieServiceClient();
  const [{ data: moduleRow }, { data: lessonRows }] = await Promise.all([
    svc.from('modules').select('id, ordinal, title, tier, summary').eq('id', moduleId).maybeSingle(),
    svc
      .from('lessons')
      .select('id, module_id, ordinal, title, modality, duration_min')
      .eq('module_id', moduleId)
      .eq('published', true)
      .order('ordinal', { ascending: true }),
  ]);
  const mod = moduleRow as ModuleRow | null;
  const lessons = (lessonRows ?? []) as LessonRow[];
  if (!mod) notFound();

  return (
    <>
      {/* Inline print CSS — no Tailwind here because Tailwind's `print:`
          modifier doesn't reliably express the break-before discipline
          this page needs. Each .canvas-page is one logical PDF page
          and renders edge-to-edge in the print preview. */}
      <style>{`
        @page {
          size: Letter portrait;
          margin: 0;
        }
        @media print {
          html, body { background: white !important; margin: 0 !important; }
          .no-print { display: none !important; }
          .canvas-page {
            page-break-before: always;
            page-break-inside: avoid;
            break-before: page;
            break-inside: avoid;
          }
          .canvas-page:first-of-type {
            page-break-before: auto;
            break-before: auto;
          }
          .canvas-page img {
            max-height: 100vh;
            width: 100% !important;
            height: auto !important;
            object-fit: contain;
          }
        }
        .canvas-page {
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .canvas-page img {
          display: block;
          width: 100%;
          height: auto;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          border: 1px solid var(--ledger-rule, #d5d1c2);
        }
      `}</style>

      <main
        style={{
          background: 'var(--ledger-bg)',
          color: 'var(--ledger-ink)',
          minHeight: '100vh',
          padding: '32px 24px 96px',
        }}
      >
        {/* ── Toolbar (hidden in print) ───────────────────────────── */}
        <header
          className="no-print"
          style={{
            maxWidth: 1100,
            margin: '0 auto 28px',
            borderBottom: '2px solid var(--ledger-ink)',
            paddingBottom: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 14,
              alignItems: 'baseline',
              flexWrap: 'wrap',
              marginBottom: 10,
            }}
          >
            <Link
              href="/foundation-canvas"
              style={{
                fontFamily: 'var(--ledger-mono)',
                fontSize: 10.5,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--ledger-muted)',
                textDecoration: 'none',
                borderBottom: '1px solid var(--ledger-muted)',
                paddingBottom: 1,
              }}
            >
              ← All modules
            </Link>
            <span
              style={{
                fontFamily: 'var(--ledger-mono)',
                fontSize: 10.5,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--ledger-accent)',
                fontWeight: 600,
              }}
            >
              {mod.id.toUpperCase()} · {mod.tier} · {lessons.length} lessons
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--ledger-serif)',
              fontWeight: 600,
              fontSize: 'clamp(34px, 4vw, 48px)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              margin: '6px 0 8px',
            }}
          >
            Canvas — {mod.title}
          </h1>
          {mod.summary ? (
            <p
              style={{
                fontFamily: 'var(--ledger-serif)',
                fontSize: 17,
                lineHeight: 1.45,
                color: 'var(--ledger-ink-2)',
                margin: 0,
                maxWidth: '64ch',
              }}
            >
              {mod.summary}
            </p>
          ) : null}
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <PrintButton />
            <a
              href={`/canvas/modules/${mod.id}.pdf`}
              download
              style={{
                fontFamily: 'var(--ledger-mono)',
                fontSize: 10.5,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ledger-accent)',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              Or download the prebuilt PDF bundle
            </a>
            <span
              style={{
                fontFamily: 'var(--ledger-mono)',
                fontSize: 10,
                letterSpacing: '0.16em',
                color: 'var(--ledger-muted)',
              }}
            >
              · The prebuilt bundle ships a single tall PNG; this page
              prints one screen per page.
            </span>
          </div>
        </header>

        {/* ── The canvas itself — one page per lesson ──────────── */}
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 28 }}>
          {lessons.map((l, idx) => (
            <article key={l.id} className="canvas-page">
              <header
                className="no-print"
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 12,
                  paddingBottom: 10,
                  marginBottom: 12,
                  borderBottom: '1px solid var(--ledger-rule)',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--ledger-mono)',
                    fontSize: 10,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: 'var(--ledger-accent)',
                    fontWeight: 600,
                  }}
                >
                  {l.id}
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--ledger-serif)',
                    fontWeight: 500,
                    fontSize: 22,
                    lineHeight: 1.2,
                    letterSpacing: '-0.015em',
                    margin: 0,
                  }}
                >
                  {l.title}
                </h2>
                <span
                  style={{
                    fontFamily: 'var(--ledger-mono)',
                    fontSize: 10,
                    letterSpacing: '0.16em',
                    color: 'var(--ledger-muted)',
                  }}
                >
                  {l.modality} · {l.duration_min}m
                </span>
                <span
                  style={{
                    fontFamily: 'var(--ledger-mono)',
                    fontSize: 10,
                    letterSpacing: '0.16em',
                    color: 'var(--ledger-muted)',
                    marginLeft: 'auto',
                  }}
                >
                  Screen {idx + 1} of {lessons.length}
                </span>
              </header>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/canvas/${l.id}.png`}
                alt={`${l.id} — ${l.title}`}
                loading="lazy"
              />
            </article>
          ))}

          {/* Gate appears as the post-M3 page when this is the M3 canvas */}
          {mod.id === 'm3' ? (
            <article className="canvas-page">
              <header
                className="no-print"
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 12,
                  paddingBottom: 10,
                  marginBottom: 12,
                  borderBottom: '2px solid var(--ledger-accent)',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--ledger-mono)',
                    fontSize: 10,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: 'var(--ledger-accent)',
                    fontWeight: 600,
                  }}
                >
                  Gate
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--ledger-serif)',
                    fontWeight: 500,
                    fontSize: 22,
                    margin: 0,
                  }}
                >
                  Three-way fork after Module 3
                </h2>
              </header>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/canvas/gate.png" alt="Gate — three-way fork" loading="lazy" />
            </article>
          ) : null}
        </div>
      </main>
    </>
  );
}
