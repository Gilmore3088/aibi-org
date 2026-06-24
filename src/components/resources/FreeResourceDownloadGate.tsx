'use client';

import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react';
import {
  buildFreeResourceDownloadHref,
  type FreeResourceCaptureContext,
  normalizeCaptureEmail,
  readRememberedFreeResourceCapture,
  rememberFreeResourceCapture,
} from '@/lib/resources/freeResourceCapture';

type GatePhase = 'idle' | 'form' | 'submitting' | 'done' | 'error';
type ButtonVariant = 'gold' | 'ink' | 'ghost-dark' | 'ghost-light';
type ButtonSize = 'md' | 'lg';

const variantClass: Record<ButtonVariant, string> = {
  gold: 'mk-btn-gold',
  ink: 'mk-btn-ink',
  'ghost-dark': 'mk-btn-ghost-dark',
  'ghost-light': 'mk-btn-ghost-light',
};

export interface FreeResourceDownloadGateProps {
  readonly title: string;
  readonly href: string;
  readonly slug: string;
  readonly source: string;
  readonly format?: string;
  readonly actionLabel?: string;
  readonly capturedLabel?: string;
  readonly buttonVariant?: ButtonVariant;
  readonly buttonSize?: ButtonSize;
  readonly buttonClassName?: string;
  readonly containerClassName?: string;
  readonly onNavigate?: (href: string) => void;
  readonly children?: ReactNode;
}

function buttonClass({
  buttonClassName,
  buttonVariant = 'ink',
  buttonSize = 'md',
}: Pick<FreeResourceDownloadGateProps, 'buttonClassName' | 'buttonVariant' | 'buttonSize'>): string {
  if (buttonClassName) return buttonClassName;
  return [
    'mk-btn',
    variantClass[buttonVariant],
    buttonSize === 'lg' ? 'mk-btn-lg' : null,
  ].filter(Boolean).join(' ');
}

export function FreeResourceDownloadGate({
  title,
  href,
  slug,
  source,
  format = 'PDF',
  actionLabel,
  capturedLabel,
  buttonVariant,
  buttonSize,
  buttonClassName,
  containerClassName,
  onNavigate,
  children,
}: FreeResourceDownloadGateProps) {
  const [phase, setPhase] = useState<GatePhase>('idle');
  const [captured, setCaptured] = useState(false);
  const [captureContext, setCaptureContext] = useState<FreeResourceCaptureContext | null>(null);
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const inputId = useId();

  const unlockedLabel = capturedLabel ?? `Download ${format}`;
  const lockedLabel = actionLabel ?? `Get ${format}`;
  const label = captured ? unlockedLabel : lockedLabel;

  useEffect(() => {
    const remembered = readRememberedFreeResourceCapture();
    if (remembered) {
      setCaptured(true);
      setEmail(remembered.email);
      setCaptureContext(remembered);
    }
  }, []);

  function openDownload(context: FreeResourceCaptureContext | null = captureContext) {
    const attributedHref = buildFreeResourceDownloadHref(href, {
      source,
      ...(context?.role ? { role: context.role } : {}),
      ...(context?.tier ? { tier: context.tier } : {}),
      ...(context?.tierLabel ? { tierLabel: context.tierLabel } : {}),
      ...(context?.topGap ? { topGap: context.topGap } : {}),
    });
    if (onNavigate) onNavigate(attributedHref);
    else window.location.assign(attributedHref);
    setPhase('done');
  }

  function handleClick() {
    if (captured) {
      openDownload();
      return;
    }
    setPhase('form');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = normalizeCaptureEmail(email);

    if (!normalizedEmail) {
      setErrorMsg('Please enter a valid work email address.');
      setPhase('error');
      return;
    }

    setPhase('submitting');
    setErrorMsg('');

    try {
      const response = await fetch('/api/capture-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          lead_source: source,
          requested_artifact: slug,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? `Request failed (${response.status})`);
      }

      const capturedAt = new Date().toISOString();
      const nextContext: FreeResourceCaptureContext = {
        email: normalizedEmail,
        source,
        capturedAt,
      };
      rememberFreeResourceCapture(nextContext);
      setCaptureContext(nextContext);
      setCaptured(true);
      openDownload(nextContext);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
      setPhase('error');
    }
  }

  const containerClass = ['fr-download-gate', containerClassName].filter(Boolean).join(' ');

  if (phase === 'done') {
    return (
      <div className={containerClass} role="status" aria-live="polite">
        <span className="mk-download-gate-ok">Opening {title}&hellip;</span>
      </div>
    );
  }

  if (phase === 'form' || phase === 'submitting' || phase === 'error') {
    return (
      <form
        className={['mk-download-gate-form', containerClassName].filter(Boolean).join(' ')}
        onSubmit={handleSubmit}
        aria-label={`Enter your email to download ${title}`}
        noValidate
      >
        <div className="mk-download-gate-field">
          <label htmlFor={inputId} className="mk-download-gate-label">
            Work email
          </label>
          <div className="mk-download-gate-row">
            <input
              id={inputId}
              type="email"
              autoComplete="email"
              placeholder="you@yourbank.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              disabled={phase === 'submitting'}
              aria-describedby={errorMsg ? `${inputId}-error` : undefined}
              className="mk-download-gate-input"
              required
            />
            <button
              type="submit"
              className="mk-btn mk-btn-gold mk-download-gate-submit"
              disabled={phase === 'submitting'}
            >
              {phase === 'submitting' ? 'Sending...' : 'Get file'}
            </button>
          </div>
          {errorMsg ? (
            <p id={`${inputId}-error`} className="mk-download-gate-error" role="alert">
              {errorMsg}
            </p>
          ) : null}
        </div>
      </form>
    );
  }

  return (
    <div className={containerClass}>
      <button
        type="button"
        className={buttonClass({ buttonClassName, buttonVariant, buttonSize })}
        onClick={handleClick}
        aria-label={`${label} for ${title}`}
      >
        {children ?? label}
      </button>
    </div>
  );
}
