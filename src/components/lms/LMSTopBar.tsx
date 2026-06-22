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
        background: 'var(--cream)',
        borderBottom: '1px solid var(--ink-a10)',
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
          fontFamily: 'var(--font-inter, Inter, ui-sans-serif, system-ui, sans-serif)',
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '-0.005em',
          textTransform: 'uppercase',
          color: 'var(--slate-600)',
          lineHeight: 1,
        }}
      >
        {crumbs.map((c, i) => (
          <span
            key={`${c}-${i}`}
            className={`lms-topbar__crumb${i === crumbs.length - 1 ? ' lms-topbar__crumb--current' : ''}`}
          >
            {i > 0 && (
              <span
                className="lms-topbar__separator"
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
                    ? 'var(--ink)'
                    : 'var(--slate-600)',
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
      {/* Sticky positioning is desktop-only. On tablet/mobile (< 1024px) the bar
          scrolls with the page so its breadcrumb + right-slot content
          doesn't multi-line and occlude content below. The bar is also
          slightly tighter on mobile padding-wise to keep the height
          compact. See #205.

          dangerouslySetInnerHTML is intentional: previously rendered as
          inline `<style>{template-string}</style>` which triggered React
          hydration mismatches (#315). React's text-content reconciler
          re-parsed the CSS-comment block on the client and diverged
          from the SSR string when quotes appeared inside the comment.
          Using dangerouslySetInnerHTML treats the body as opaque and
          keeps SSR/CSR byte-for-byte identical. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (min-width: 1024px) {
          .lms-topbar {
            position: sticky;
            top: 0;
            z-index: 5;
          }
        }
        @media (max-width: 1023px) {
          .lms-topbar {
            padding: 12px 16px !important;
            gap: 12px !important;
          }
          .lms-topbar nav {
            font-size: 11px !important;
          }
          .lms-topbar__crumb:not(.lms-topbar__crumb--current),
          .lms-topbar__separator {
            display: none !important;
          }
          /* Hide the right slot on mobile so the breadcrumb stays one line. */
          .lms-topbar__right {
            display: none !important;
          }
        }
      `,
        }}
      />
    </div>
  );
}
