// /coming-soon — minimal pre-launch holding page.
//
// One sentence, no links, no CTAs. Surfaced via the COMING_SOON=true
// middleware rewrite while the public site is dark. /auth bypasses the
// middleware so the operator can still log in.

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'The AI Banking Institute' },
  description: 'Coming soon.',
  robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
  return (
    <main className="mockup-scope mk-coming-soon">
      <p>We will be helping you with all the AI noise soon.</p>
    </main>
  );
}
