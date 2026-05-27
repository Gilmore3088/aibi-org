// /courses/foundation/program/gallery — Browsable gallery of exemplary AI outputs by role.
// Server Component shell with client-side role filtering.
// Wrapped in CourseShellWrapper so the LMS chrome matches the rest of the course tree.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CourseShellWrapper } from '@/components/lms/CourseShellWrapper';
import { OutputGalleryClient } from './OutputGalleryClient';
import { getEnrollment } from '../_lib/getEnrollment';

export const metadata: Metadata = {
  title: 'Output Gallery | AiBI-Foundation | The AI Banking Institute',
  description:
    'See what excellent AI outputs look like in every banking department. Role-specific examples from lending, operations, compliance, finance, marketing, and IT. Part of the AiBI-Foundation course.',
};

const kickerStyle = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: 'var(--gold-deep)',
};

const headlineStyle = {
  fontWeight: 700,
  fontSize: 'clamp(36px, 4.6vw, 56px)',
  lineHeight: 1.05,
  letterSpacing: '-0.025em',
  margin: '0 0 16px',
  color: 'var(--ink)',
};

const ledeStyle = {
  fontSize: 19,
  lineHeight: 1.45,
  color: 'var(--slate-600)',
  margin: '0 0 12px',
  maxWidth: '60ch',
};

export default async function OutputGalleryPage() {
  const enrollment = await getEnrollment();
  if (!enrollment) {
    redirect('/courses/foundation/program/purchase');
  }

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
          <span style={kickerStyle}>Reference · Exemplary Outputs</span>
          <span style={{ flex: 1, height: 1, background: 'var(--ink-a10)' }} />
        </div>

        <h1 style={headlineStyle}>Output gallery</h1>

        <p style={ledeStyle}>
          Excellence is recognizable before you can describe it.
        </p>
        <p
          style={{
            color: 'var(--slate-600)',
            fontSize: 15,
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
            borderLeft: '3px solid var(--gold)',
            paddingLeft: 14,
            paddingTop: 4,
            paddingBottom: 4,
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: 'var(--slate-600)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            <strong style={{ color: 'var(--ink)' }}>How to use this gallery:</strong>{' '}
            Filter to your role, expand an example, and read the &ldquo;What Makes This
            Effective&rdquo; section before producing your own output. Then compare.
          </p>
        </div>
      </header>

      <OutputGalleryClient />
    </CourseShellWrapper>
  );
}
