'use client';

// ArtifactDownload — post-submission download link for activities whose
// completionTrigger is 'artifact-download'. A11Y-05: plain <a download>
// anchor, no JS required.

import type { CSSProperties } from 'react';

const downloadLinkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  fontFamily: 'var(--ledger-mono)',
  fontSize: 11,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontWeight: 600,
  padding: '10px 18px',
  borderRadius: 2,
  border: '1px solid var(--ledger-rule-strong)',
  color: 'var(--ledger-ink)',
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
        borderTop: '1px solid var(--ledger-rule)',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--ledger-mono)',
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--ledger-muted)',
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
