// /courses/foundation/program/gallery — Browsable gallery of exemplary AI outputs by role.
// Server Component shell with client-side role filtering.
// Wrapped in CourseShellWrapper so the LMS chrome matches the rest of the course tree.

import type { Metadata } from 'next';
import { CourseShellWrapper } from "@/components/lms/CourseShellWrapper";
import { OutputGalleryClient } from './OutputGalleryClient';

export const metadata: Metadata = {
  title: 'Output Gallery | AiBI-Foundation | The AI Banking Institute',
  description:
    'See what excellent AI outputs look like in every banking department. Role-specific examples from lending, operations, compliance, finance, marketing, and IT. Part of the AiBI-Foundation course.',
};

export default async function OutputGalleryPage() {
  return (
    <CourseShellWrapper crumbs={['Education', 'AiBI-Foundation', 'Output Gallery']}>
      <header style={{ marginBottom: 40 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 18,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--ledger-mono)',
              fontSize: 10.5,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--ledger-accent)',
            }}
          >
            Reference · Exemplary Outputs
          </span>
          <span style={{ flex: 1, height: 1, background: 'var(--ledger-rule)' }} />
        </div>

        <h1
          style={{
            fontFamily: 'var(--ledger-serif)',
            fontWeight: 500,
            fontSize: 'clamp(40px, 5vw, 60px)',
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
            margin: '0 0 18px',
            color: 'var(--ledger-ink)',
          }}
        >
          Output{' '}
          <em style={{ color: 'var(--ledger-accent)', fontStyle: 'normal', fontWeight: 500 }}>
            Gallery.
          </em>
        </h1>

        <p
          style={{
            fontFamily: 'var(--ledger-serif)',
            fontStyle: 'italic',
            fontSize: 20,
            lineHeight: 1.45,
            color: 'var(--ledger-ink-2)',
            margin: '0 0 12px',
            maxWidth: '60ch',
          }}
        >
          Excellence is recognizable before you can describe it.
        </p>
        <p
          style={{
            color: 'var(--ledger-slate)',
            fontSize: 14.5,
            lineHeight: 1.6,
            margin: '0 0 12px',
            maxWidth: '64ch',
          }}
        >
          This gallery shows what institutional-grade AI output looks like across six
          banking departments — from loan file checklists to board memos to SAR
          narrative drafts. Each example was produced using the skills and prompting
          patterns taught in AiBI-Foundation. Study the quality markers — they are the
          same criteria your capstone submission will be evaluated against.
        </p>

        <div
          role="note"
          aria-label="How to use this gallery"
          style={{
            marginTop: 18,
            borderLeft: '2px solid var(--ledger-accent)',
            paddingLeft: 14,
            paddingTop: 4,
            paddingBottom: 4,
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: 'var(--ledger-ink-2)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            <strong style={{ color: 'var(--ledger-ink)' }}>How to use this gallery:</strong>{' '}
            Filter to your role, expand an example, and read the &ldquo;What Makes This
            Effective&rdquo; section before producing your own output. Then compare.
          </p>
        </div>
      </header>

      <OutputGalleryClient />
    </CourseShellWrapper>
  );
}
