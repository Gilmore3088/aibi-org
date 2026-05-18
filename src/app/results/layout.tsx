import type { Metadata } from 'next';

// /results/[id] — bearer-token shared link to a personal assessment result.
// The id segment is the user_profiles UUID (122 bits, unguessable).
// Never index — these URLs are private-by-obscurity.
export const metadata: Metadata = {
  title: 'Your AI Readiness Results',
  robots: { index: false, follow: false },
};

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
