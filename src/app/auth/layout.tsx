import type { Metadata } from 'next';

// Auth surfaces — login, signup, password reset, magic-link callback.
// Never index in search engines; transient pages tied to user state.
export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // 2026-05-26 redesign sprint: wrap auth surfaces in mockup-scope so they
  // pick up Inter font + cream page background + mockup palette via the
  // Ledger token remap in tokens-ledger.css. LedgerSurface internal lockup
  // is suppressed per-page via showHeader={false}.
  return <div className="mockup-scope">{children}</div>;
}
