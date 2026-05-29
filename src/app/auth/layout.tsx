import type { Metadata } from 'next';
import Link from 'next/link';
import { Wordmark } from '@/components/brand';

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
        {/* Brand v1 (2026-05-28) — bracketed [Ai] mark. */}
        <Link
          href="/"
          aria-label="The AI Banking Institute home"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
        >
          <Wordmark variant="full" tone="dark" size={22} />
        </Link>

        {children}
      </main>
    </div>
  );
}
