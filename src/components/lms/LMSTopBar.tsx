import type { ReactNode } from 'react';

interface Props {
  readonly crumbs: readonly string[];
  readonly right?: ReactNode;
}

export function LMSTopBar({ crumbs, right }: Props) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 5,
        background: 'var(--ledger-bg)',
        borderBottom: '1px solid var(--ledger-rule)',
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
      }}
    >
      <nav
        aria-label="Breadcrumb"
        style={{
          fontFamily: 'var(--ledger-sans)',
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: '-0.005em',
          textTransform: 'uppercase',
          color: 'var(--ledger-slate)',
          lineHeight: 1,
        }}
      >
        {crumbs.map((c, i) => (
          <span key={`${c}-${i}`}>
            {i > 0 && (
              <span
                style={{
                  margin: '0 10px',
                  color: 'rgba(14,27,45,0.2)',
                  fontWeight: 400,
                }}
              >
                /
              </span>
            )}
            <span
              style={{
                color:
                  i === crumbs.length - 1
                    ? 'var(--ledger-ink)'
                    : 'var(--ledger-slate)',
              }}
            >
              {c}
            </span>
          </span>
        ))}
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{right}</div>
    </div>
  );
}
