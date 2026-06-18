'use client';

import { useState } from 'react';

interface TeamCopyButtonProps {
  readonly text: string;
  readonly label: string;
  readonly copiedLabel?: string;
  readonly variant?: 'dark' | 'light' | 'gold';
}

export function TeamCopyButton({
  text,
  label,
  copiedLabel = 'Copied',
  variant = 'light',
}: TeamCopyButtonProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" className={`team-copy-button is-${variant}`} onClick={copy}>
      {copied ? copiedLabel : label}
      <style jsx>{`
        .team-copy-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          border-radius: 12px;
          padding: 0 18px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .is-light {
          border: 1px solid var(--ink-a10);
          background: #fff;
          color: var(--ink);
        }
        .is-dark {
          border: 0;
          background: var(--ink);
          color: var(--cream);
        }
        .is-gold {
          border: 0;
          background: var(--gold);
          color: var(--ink);
        }
      `}</style>
    </button>
  );
}
