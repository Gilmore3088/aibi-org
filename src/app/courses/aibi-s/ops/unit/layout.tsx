import type { Metadata } from 'next';

// Individual AiBI-S Operations units — authed, per-learner progress state.
// Noindex; the course landing page (/courses/aibi-s) is the public surface.
export const metadata: Metadata = {
  title: 'AiBI-S Operations — Unit',
  robots: { index: false, follow: false },
};

export default function AibiSOpsUnitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
