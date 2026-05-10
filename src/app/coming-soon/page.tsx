// /coming-soon — minimal pre-launch holding page.
//
// One sentence, no links, no CTAs. Surfaced via the COMING_SOON=true
// middleware rewrite while the public site is dark. /auth and /admin
// bypass the middleware so the operator can still log in.

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'The AI Banking Institute' },
  description: 'Coming soon.',
  robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9f6f0',
        color: '#1e1a14',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontWeight: 500,
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          lineHeight: 1.3,
          maxWidth: '40rem',
          margin: 0,
          letterSpacing: '-0.005em',
        }}
      >
        We will be helping you with all the AI noise soon.
      </p>
    </main>
  );
}
