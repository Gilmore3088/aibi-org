'use client';

import { useState } from 'react';

// A prompt the reader can lift straight into their approved AI tool.
// Copies to the clipboard; falls back silently where the API is absent.

export interface CopyPromptProps {
  readonly label: string;
  readonly prompt: string;
}

export function CopyPrompt({ label, prompt }: CopyPromptProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (permissions, insecure context) — the text stays selectable.
    }
  };

  return (
    <div className="ax-prompt">
      <p className="ax-k ax-gold">{label}</p>
      <p>{prompt}</p>
      <button type="button" className="ax-btn-line" onClick={copy} aria-live="polite">
        {copied ? 'Copied' : 'Copy prompt'}
      </button>
    </div>
  );
}
