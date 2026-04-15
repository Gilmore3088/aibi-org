import type { Metadata } from 'next';
import Script from 'next/script';
import { Cormorant_Garamond, DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';

const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

// Deferred queue initializer — must run before the async Plausible script loads.
// See CLAUDE.md: never call window.plausible() directly without this guard.
const PLAUSIBLE_QUEUE_INIT = `
  window.plausible = window.plausible || function() {
    (window.plausible.q = window.plausible.q || []).push(arguments);
  };
`;

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The AI Banking Institute — AI Proficiency for Community Banks',
  description:
    'AiBI helps community banks and credit unions build AI proficiency through assessment, certification, and transformation consulting.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script id="plausible-queue-init" strategy="beforeInteractive">
          {PLAUSIBLE_QUEUE_INIT}
        </Script>
        {PLAUSIBLE_DOMAIN && (
          <Script
            defer
            data-domain={PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className={`${cormorant.variable} ${dmSans.variable} ${dmMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
