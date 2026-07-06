import type { CSSProperties } from 'react';

const INTER_STACK =
  '"Inter", ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const META_LABEL: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
  margin: 0,
};

interface PendingState {
  readonly title: string;
  readonly body: string;
  readonly ctaHref: string;
  readonly ctaLabel: string;
  readonly progress: { readonly done: number; readonly total: number } | null;
}

interface CertificatePendingProps {
  readonly pendingState: PendingState;
}

export function CertificatePending({ pendingState }: CertificatePendingProps) {
  return (
    <div
      style={{
        textAlign: 'center',
        background: 'var(--cream)',
        border: '1px solid var(--ink-a10)',
        borderRadius: 'var(--r-xl)',
        padding: '56px 32px',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          background: 'var(--gold-a20)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
        }}
        aria-hidden
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ width: 32, height: 32, color: 'var(--gold-deep)' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2
        style={{
          fontFamily: INTER_STACK,
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--ink)',
          letterSpacing: '-0.01em',
          margin: '0 0 12px',
        }}
      >
        {pendingState.title}
      </h2>
      <p
        style={{
          fontFamily: INTER_STACK,
          fontSize: '1rem',
          lineHeight: 1.6,
          color: 'var(--slate-600)',
          maxWidth: 460,
          margin: '0 auto 24px',
        }}
      >
        {pendingState.body}
      </p>
      {pendingState.progress && (
        <div style={{ maxWidth: 320, margin: '0 auto 28px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              ...META_LABEL,
              marginBottom: 6,
            }}
          >
            <span>Course progress</span>
            <span>
              {pendingState.progress.done} / {pendingState.progress.total} modules
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={pendingState.progress.done}
            aria-valuemin={0}
            aria-valuemax={pendingState.progress.total}
            aria-label="Modules completed"
            style={{
              height: 8,
              background: 'var(--ink-a10)',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.round((pendingState.progress.done / pendingState.progress.total) * 100)}%`,
                background: 'var(--gold)',
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      )}
      <a
        href={pendingState.ctaHref}
        style={{
          display: 'inline-block',
          background: 'var(--ink)',
          color: '#FFFFFF',
          fontFamily: INTER_STACK,
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding: '12px 24px',
          borderRadius: 'var(--r-md)',
          textDecoration: 'none',
        }}
      >
        {pendingState.ctaLabel}
      </a>
    </div>
  );
}
