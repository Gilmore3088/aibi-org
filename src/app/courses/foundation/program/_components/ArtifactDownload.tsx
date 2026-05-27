'use client';

// ArtifactDownload — post-submission download link for activities whose
// completionTrigger is 'artifact-download'. A11Y-05: plain <a download>
// anchor, no JS required.
//
// Ported to mockup design system 2026-05-27 (Inter, ink/gold, mockup radii).

import type { CSSProperties } from 'react';

const INTER_STACK =
  '"Inter", ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const downloadLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  fontFamily: INTER_STACK,
  fontSize: 11,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  fontWeight: 700,
  padding: '10px 18px',
  borderRadius: 'var(--r-md)',
  border: '1px solid var(--ink-a15)',
  color: 'var(--ink)',
  background: '#FFFFFF',
  textDecoration: 'none',
};

export function ArtifactDownload({
  artifactId,
  moduleNumber,
}: {
  readonly artifactId: string;
  readonly moduleNumber: number;
}) {
  const href = artifactId.startsWith('aibi-p-m')
    ? `/api/courses/generate-module-artifact?module=${moduleNumber}`
    : `/artifacts/${artifactId}.pdf`;
  const label = artifactId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div
      style={{
        marginTop: 22,
        paddingTop: 16,
        borderTop: '1px solid var(--ink-a10)',
      }}
    >
      <p
        style={{
          fontFamily: INTER_STACK,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--gold-deep)',
          margin: '0 0 10px',
        }}
      >
        Your artifact is ready
      </p>
      <a href={href} download style={downloadLinkStyle}>
        ↓ Download {label}
      </a>
    </div>
  );
}
