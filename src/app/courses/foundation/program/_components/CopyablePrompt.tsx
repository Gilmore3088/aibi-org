'use client';

import { useState, useCallback } from 'react';

const COPY_RESET_MS = 2000;

const MONO_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

export function CopyablePrompt({ text }: { readonly text: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const handleCopy = useCallback(async () => {
    const reset = () => setTimeout(() => setStatus('idle'), COPY_RESET_MS);

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        setStatus('copied');
        reset();
        return;
      } catch {
        // fall through to execCommand fallback
      }
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    let succeeded = false;
    try {
      succeeded = document.execCommand('copy');
    } catch {
      succeeded = false;
    }
    document.body.removeChild(textarea);
    setStatus(succeeded ? 'copied' : 'failed');
    reset();
  }, [text]);

  const copied = status === 'copied';
  const failed = status === 'failed';

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--ink-a10)',
          borderRadius: 'var(--r-md)',
          padding: '16px 80px 16px 16px',
        }}
      >
        <pre
          style={{
            fontFamily: MONO_STACK,
            fontSize: '1rem',
            lineHeight: 1.6,
            color: 'var(--ink)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0,
          }}
        >
          {text}
        </pre>
      </div>
      <button
        type="button"
        onClick={() => { void handleCopy(); }}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          padding: '6px 12px',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          borderRadius: 'var(--r-sm)',
          border: 'none',
          cursor: 'pointer',
          background: failed
            ? '#B91C1C'
            : copied
              ? 'var(--emerald-700)'
              : 'var(--ink)',
          color: '#FFFFFF',
        }}
        aria-live="polite"
        aria-label={
          failed
            ? 'Copy failed — select the prompt manually'
            : copied
              ? 'Copied to clipboard'
              : 'Copy prompt to clipboard'
        }
      >
        {failed ? 'Failed' : copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
