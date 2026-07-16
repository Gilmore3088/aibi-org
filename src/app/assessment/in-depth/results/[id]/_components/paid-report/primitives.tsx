'use client';

import Link from 'next/link';
import { useState } from 'react';
import { INK, GOLD_DEEP } from '@/lib/brand/colors';
import { GOLD_SOFT, LINE, btnPrimary, btnOutline } from './constants';
import { ClipboardIcon, BookmarkIcon, CheckIcon } from './icons';

export function Label({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'dark' | 'badge';
}): JSX.Element {
  const color =
    tone === 'dark' ? 'rgba(255,255,255,.55)' : tone === 'badge' ? 'rgba(7,26,47,.65)' : GOLD_DEEP;
  return (
    <div
      style={{
        color,
        textTransform: 'uppercase',
        letterSpacing: '0.16em',
        fontSize: '0.625rem',
        fontWeight: 900,
      }}
    >
      {children}
    </div>
  );
}

export function PromptBlock({ text, stretch }: { text: string; stretch?: boolean }): JSX.Element {
  return (
    <pre
      style={{
        background: INK,
        color: GOLD_SOFT,
        borderRadius: 20,
        padding: 18,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '0.8125rem',
        lineHeight: 1.55,
        whiteSpace: 'pre-wrap',
        margin: '12px 0 0',
        overflowX: 'auto',
        flex: stretch ? '1 1 auto' : undefined,
      }}
    >
      {text}
    </pre>
  );
}

export function PrintButton(): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined') window.print();
      }}
      style={{ ...btnOutline, border: `1px solid ${LINE}`, cursor: 'pointer' }}
    >
      Download PDF
    </button>
  );
}

export function SaveToToolboxButton({
  artifactName,
  roleLabel,
  prompt,
  rule,
}: {
  artifactName: string;
  roleLabel: string;
  prompt: string;
  rule: string;
}): JSX.Element {
  type SaveStatus =
    | 'idle'
    | 'saving'
    | 'saved'
    | 'auth-required'
    | 'paid-access-required'
    | 'error';
  const [status, setStatus] = useState<SaveStatus>('idle');
  const label =
    status === 'saving'
      ? 'Saving…'
      : status === 'saved'
        ? 'Saved'
        : status === 'auth-required'
          ? 'Sign in to save'
          : status === 'paid-access-required'
            ? 'Unlock Toolbox'
            : status === 'error'
              ? 'Try again'
              : 'Save to toolbox';
  const icon = status === 'saved' ? <CheckIcon /> : <BookmarkIcon />;
  // paid-access-required: signed in but missing a paid Toolbox entitlement.
  if (status === 'paid-access-required') {
    return (
      <Link
        href="/assessment/in-depth"
        style={{
          ...btnOutline,
          border: `1px solid ${LINE}`,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {icon}
        <span>{label}</span>
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={async () => {
        setStatus('saving');
        try {
          const res = await fetch('/api/toolbox/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              origin: 'in-depth',
              payload: { artifactName, roleLabel, prompt, rule },
            }),
          });
          if (res.status === 401) {
            setStatus('auth-required');
            setTimeout(() => {
              window.location.href =
                '/auth/login?next=' + encodeURIComponent(window.location.pathname);
            }, 800);
            return;
          }
          if (res.status === 403) {
            // Signed in but lacks paid Toolbox access — surface as upgrade path.
            setStatus('paid-access-required');
            return;
          }
          if (!res.ok) {
            setStatus('error');
            return;
          }
          setStatus('saved');
          setTimeout(() => setStatus('idle'), 2400);
        } catch {
          setStatus('error');
        }
      }}
      style={{
        ...btnOutline,
        border: `1px solid ${LINE}`,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function CopyButton({ text, label }: { text: string; label: string }): JSX.Element {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          // Fallback for older browsers: user can still highlight and copy.
        }
      }}
      style={{
        ...btnPrimary,
        border: 0,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {copied ? <CheckIcon /> : <ClipboardIcon />}
      <span>{copied ? 'Copied' : label}</span>
    </button>
  );
}
