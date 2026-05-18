import type { Metadata } from 'next';

// Auth surfaces — login, signup, password reset, magic-link callback.
// Never index in search engines; transient pages tied to user state.
export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
