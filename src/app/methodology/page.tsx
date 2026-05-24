// /methodology — public-facing page that renders the In-Depth
// methodology document. Audit A17 (2026-05-24): the In-Depth product
// claimed exam-defensible / board-ready status without a methodology
// artifact a CRO could hand to an examiner. This route is that artifact.

import type { Metadata } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import { MarkdownRenderer } from '@/components/lms/MarkdownRenderer';

export const metadata: Metadata = {
  title: 'In-Depth Assessment — Methodology | The AI Banking Institute',
  description:
    'The rubric, scoring rationale, and threshold logic for the In-Depth AI Readiness Assessment. Versioned. Examiner-aligned.',
  alternates: { canonical: '/methodology' },
};

export const dynamic = 'force-static';
export const revalidate = false;

export default async function MethodologyPage() {
  const docPath = path.join(process.cwd(), 'docs', 'in-depth-methodology-v2.md');
  let raw: string;
  try {
    raw = await fs.readFile(docPath, 'utf8');
  } catch (err) {
    console.error('[methodology] failed to read doc:', err);
    raw = '# Methodology document temporarily unavailable\n\nPlease email hello@aibankinginstitute.com for the latest version.';
  }
  // Strip the YAML front matter (between two `---` lines) before rendering.
  const fmMatch = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);
  const body = fmMatch ? fmMatch[1] : raw;

  return (
    <main
      style={{
        background: 'var(--ledger-bg)',
        minHeight: '70vh',
        padding: '48px 24px 96px',
        color: 'var(--ledger-ink)',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div
          style={{
            fontFamily: 'var(--ledger-mono)',
            fontSize: 10.5,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--ledger-accent)',
            marginBottom: 22,
            paddingBottom: 14,
            borderBottom: '2px solid var(--ledger-ink)',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <span>The AI Banking Institute · Methodology</span>
          <span style={{ color: 'var(--ledger-muted)' }}>v2.0 · 2026-05-24</span>
        </div>
        <MarkdownRenderer content={body} className="methodology-body" />
        <p
          style={{
            marginTop: 56,
            paddingTop: 18,
            borderTop: '1px solid var(--ledger-rule)',
            fontFamily: 'var(--ledger-mono)',
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--ledger-muted)',
          }}
        >
          Source: <code>docs/in-depth-methodology-v2.md</code>
        </p>
      </div>
    </main>
  );
}
