'use client';

import { useEffect, useCallback, useRef } from 'react';
import type { ToolboxTier } from '@/lib/toolbox/access';

const LS_KEY = 'aibi.toolbox.onboarded-v1';

interface WelcomeOverlayProps {
  readonly tier: ToolboxTier;
  readonly onDismiss: () => void;
}

export function WelcomeOverlay({ tier, onDismiss }: WelcomeOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(LS_KEY, '1');
    } catch {
      // Quota exceeded or private mode — still dismiss visually.
    }
    onDismiss();
  }, [onDismiss]);

  // Esc to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [dismiss]);

  // Focus trap — keep focus inside the overlay
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    return () => {
      prev?.focus();
    };
  }, []);

  const isFoundation = tier === 'full';

  return (
    <div
      role="presentation"
      onClick={dismiss}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={isFoundation ? 'Welcome to your workbench' : 'Your AI Starter Toolkit is unlocked'}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--cream)',
          border: '1px solid var(--ink-a15)',
          borderTop: '4px solid var(--gold)',
          borderRadius: 20,
          padding: '36px 40px 32px',
          maxWidth: 560,
          width: '100%',
          position: 'relative',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
        }}
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={dismiss}
          aria-label="Close welcome overlay"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 22,
            lineHeight: 1,
            color: 'var(--slate-500)',
            padding: '4px 8px',
            borderRadius: 6,
          }}
        >
          ×
        </button>

        {/* Eyebrow */}
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--gold-deep)',
            marginBottom: 12,
          }}
        >
          {isFoundation ? 'Welcome to your workbench' : 'Toolkit unlocked'}
        </p>

        {/* Heading */}
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            marginBottom: 14,
          }}
        >
          {isFoundation
            ? 'Run a real banker prompt in 3 minutes.'
            : 'Your AI Starter Toolkit is unlocked.'}
        </h2>

        {/* Steps / body */}
        {isFoundation ? (
          <ol
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {[
              'Open the BSA-officer kit (12 prompts, all live)',
              'Click the "SAR narrative frame" tile',
              'Click "Open in Playground" — try it with the sample alert facts, see the output',
            ].map((step, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  gap: 12,
                  fontSize: 15,
                  lineHeight: 1.55,
                  color: 'var(--ink)',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: 'var(--gold-deep)',
                    flexShrink: 0,
                    width: 18,
                    marginTop: 1,
                  }}
                  aria-hidden="true"
                >
                  {i + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        ) : (
          <ol
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {[
              'Browse the BSA-officer kit (12 prompts live)',
              'Copy any prompt\'s body to your clipboard',
              'Paste into Claude, ChatGPT, or Gemini — the prompt is the artifact.',
            ].map((step, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  gap: 12,
                  fontSize: 15,
                  lineHeight: 1.55,
                  color: 'var(--ink)',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: 'var(--gold-deep)',
                    flexShrink: 0,
                    width: 18,
                    marginTop: 1,
                  }}
                  aria-hidden="true"
                >
                  {i + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        )}

        {!isFoundation && (
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.55,
              color: 'var(--slate-500)',
              marginBottom: 20,
            }}
          >
            Build + Playground unlock with the AiBI-Foundation course. We don&rsquo;t nag you about it from here.
          </p>
        )}

        {isFoundation && (
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.55,
              color: 'var(--slate-500)',
              marginBottom: 20,
            }}
          >
            The other three kits (Lender · Branch · Compliance) are in active SME review. Watch this dashboard.
          </p>
        )}

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={dismiss}
            style={{
              background: 'var(--gold)',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: 10,
              border: 'none',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {isFoundation ? 'Open the Library →' : 'Open the Library →'}
          </button>
          <button
            type="button"
            onClick={dismiss}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 13,
              color: 'var(--slate-500)',
              cursor: 'pointer',
              padding: '12px 4px',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            I&rsquo;ll explore on my own
          </button>
        </div>
      </div>
    </div>
  );
}

export function readOnboarded(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return Boolean(localStorage.getItem(LS_KEY));
  } catch {
    return true;
  }
}
