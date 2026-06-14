'use client';

// ArtifactActions — Copy / Share buttons for the artifact body.
// Copy puts the artifact text on the clipboard.
// Share copies the public deep-link URL.
// Download + Open-in-Toolbox are rendered server-side as anchors.

import { useState, useCallback } from 'react';

interface ArtifactActionsProps {
  readonly copyText: string;
  readonly shareUrl: string;
}

const RESET_MS = 2000;

export function ArtifactActions({ copyText, shareUrl }: ArtifactActionsProps) {
  const [copied, setCopied] = useState<'text' | 'url' | null>(null);

  const copyToClipboard = useCallback(async (value: string, kind: 'text' | 'url') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), RESET_MS);
    } catch {
      // Clipboard refused — leave UI untouched. Banker can still select+copy.
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      <button
        type="button"
        onClick={() => void copyToClipboard(copyText, 'text')}
        style={buttonStyle}
      >
        {copied === 'text' ? 'COPIED' : 'COPY TO CLIPBOARD'}
      </button>
      <button
        type="button"
        onClick={() => void copyToClipboard(shareUrl, 'url')}
        style={buttonStyle}
      >
        {copied === 'url' ? 'LINK COPIED' : 'COPY SHARE LINK'}
      </button>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '11px 18px',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  borderRadius: 12,
  background: 'var(--cream-2)',
  border: '1px solid var(--ink-a10)',
  color: 'var(--ink)',
  cursor: 'pointer',
  fontFamily: 'inherit',
};
