import type { Metadata } from 'next';
import Link from 'next/link';

// Auth surfaces — login, signup, password reset, magic-link callback.
// Never index in search engines; transient pages tied to user state.
export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

// 2026-05-27 — ported from Ledger to mockup design system.
// Auth routes are CHROMELESS_PATHS in src/app/layout.tsx, so this
// layout supplies its own brand lockup + cream page chrome. Pages
// render their card body inside `children`.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mockup-scope" style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          gap: 28,
        }}
      >
        <Link
          href="/"
          className="mk-brand"
          aria-label="The AI Banking Institute home"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}
        >
          <span className="mk-seal" aria-hidden>
            <svg
              viewBox="0 0 24 24"
              width={22}
              height={22}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="22" x2="21" y2="22" />
              <line x1="6" y1="18" x2="6" y2="11" />
              <line x1="10" y1="18" x2="10" y2="11" />
              <line x1="14" y1="18" x2="14" y2="11" />
              <line x1="18" y1="18" x2="18" y2="11" />
              <polygon points="12 2 20 7 4 7" />
            </svg>
          </span>
          <span>
            <span className="mk-wm-1">The AI Banking Institute</span>
            <br />
            <span className="mk-wm-2">Regulated Intelligence</span>
          </span>
        </Link>

        {children}
      </main>
    </div>
  );
}
