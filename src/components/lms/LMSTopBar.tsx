import type { ReactNode } from 'react';

interface Props {
  readonly crumbs: readonly string[];
  readonly right?: ReactNode;
}

export function LMSTopBar({ crumbs, right }: Props) {
  return (
    <div
      className="lms-topbar"
      style={{
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
      <div className="lms-topbar__right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {right}
      </div>
      {/* Sticky positioning is desktop-only. On mobile (< 768px) the bar
          scrolls with the page so its breadcrumb + right-slot content
          doesn't multi-line and occlude content below. The bar is also
          slightly tighter on mobile padding-wise to keep the height
          compact. See #205. */}
      <style>{`
        @media (min-width: 768px) {
          .lms-topbar {
            position: sticky;
            top: 0;
            z-index: 5;
          }
        }
        @media (max-width: 767px) {
          .lms-topbar {
            padding: 12px 16px !important;
            gap: 12px !important;
          }
          .lms-topbar nav {
            font-size: 11px !important;
          }
          /* The right slot ("Not yet enrolled", "N/M complete") is
             informational. On narrow viewports it pushes the breadcrumb
             onto a second line. Hide it on mobile — the same info is
             surfaced inline elsewhere on the page (e.g. EnrollButton CTA,
             course-overview progress meter). */
          .lms-topbar__right {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
