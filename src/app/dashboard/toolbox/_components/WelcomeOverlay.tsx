'use client';

import { useEffect, useCallback, useRef } from 'react';
import type { ToolboxTier } from '@/lib/toolbox/access';

const LS_KEY = 'aibi.toolbox.onboarded-v1';

interface WelcomeOverlayProps {
  readonly tier: ToolboxTier;
  readonly onDismiss: () => void;
  readonly onOpenLibrary?: () => void;
}

function ToolboxMiniMap() {
  const panes = [
    {
      label: 'Library',
      title: 'Exam prep playbook',
      detail: 'Vetted starter',
      accent: 'var(--gold)',
    },
    {
      label: 'AiBI Lab',
      title: 'Run sample facts',
      detail: 'No real data',
      accent: 'var(--ink)',
    },
    {
      label: 'My Toolbox',
      title: 'Saved v1.0',
      detail: 'Ready to reuse',
      accent: 'var(--gold-deep)',
    },
  ] as const;

  return (
    <div
      className="toolbox-welcome-map"
      aria-label="Toolbox workflow preview"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 8,
        margin: '4px 0 22px',
        padding: 10,
        border: '1px solid var(--ink-a10)',
        borderRadius: 16,
        background: '#fff',
      }}
    >
      {panes.map((pane, index) => (
        <div
          key={pane.label}
          className="toolbox-welcome-map__pane"
          style={{
            minHeight: 112,
            border: '1px solid var(--ink-a10)',
            borderRadius: 12,
            background: index === 1 ? 'var(--cream)' : 'var(--cream-2)',
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: 'var(--slate-500)',
                fontSize: 9,
                fontWeight: 850,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              {pane.label}
            </p>
            <p
              style={{
                margin: '7px 0 0',
                color: 'var(--ink)',
                fontSize: 14,
                lineHeight: 1.18,
                fontWeight: 850,
              }}
            >
              {pane.title}
            </p>
          </div>
          <div style={{ display: 'grid', gap: 5 }}>
            <span
              aria-hidden="true"
              style={{
                display: 'block',
                width: index === 0 ? '72%' : index === 1 ? '88%' : '62%',
                height: 6,
                borderRadius: 999,
                background: pane.accent,
                opacity: index === 1 ? 0.95 : 0.75,
              }}
            />
            <span
              style={{
                color: index === 1 ? 'var(--ink)' : 'var(--slate-500)',
                fontSize: 11,
                lineHeight: 1.25,
                fontWeight: 750,
              }}
            >
              {pane.detail}
            </span>
          </div>
        </div>
      ))}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 560px) {
              .toolbox-welcome-map {
                grid-template-columns: 1fr !important;
              }
              .toolbox-welcome-map__pane {
                min-height: auto !important;
                display: grid !important;
                grid-template-columns: minmax(0, 1fr) 86px !important;
                align-items: center !important;
              }
            }
          `,
        }}
      />
    </div>
  );
}

export function WelcomeOverlay({ tier, onDismiss, onOpenLibrary }: WelcomeOverlayProps) {
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

  const openLibrary = useCallback(() => {
    dismiss();
    onOpenLibrary?.();
  }, [dismiss, onOpenLibrary]);

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
        aria-label={isFoundation ? 'Welcome to your workbench' : 'Your paid Toolbox is unlocked'}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--cream)',
          border: '1px solid var(--ink-a15)',
          borderTop: '4px solid var(--gold)',
          borderRadius: 20,
          padding: '36px 40px 32px',
          maxWidth: 660,
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
          {isFoundation ? 'Welcome to your workbench' : 'Paid Toolbox unlocked'}
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
            ? 'Turn a course artifact into a reusable playbook.'
            : 'Build one reusable banking asset.'}
        </h2>

        <ToolboxMiniMap />

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
              'Start from a pre-built banking playbook in the Library.',
              'Run it in the AiBI Lab against sample facts.',
              'Save the version you trust to My Toolbox.',
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
              'Start from a pre-built banking playbook in the Library.',
              'Run it in the AiBI Lab against sample facts.',
              'Save the version you trust to My Toolbox.',
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
            Your In-Depth purchase includes Build, AiBI Lab, and saved Toolbox assets. Use sample facts until your institution approves live data.
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
            Your Foundation Packet proves what you built in the course. The Toolbox is where reusable prompts and playbooks live after you test them.
          </p>
        )}

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={openLibrary}
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
