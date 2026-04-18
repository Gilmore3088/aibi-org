import type { Metadata } from 'next';
import Script from 'next/script';
import { Cormorant_Garamond, Cormorant_SC, DM_Sans, DM_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
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

const cormorantSC = Cormorant_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant-sc',
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aibankinginstitute.com';
const SITE_NAME = 'The AI Banking Institute';
const SITE_TAGLINE = 'Turning Bankers into Builders';
const DEFAULT_DESCRIPTION =
  'The AI Banking Institute helps community banks and credit unions build AI proficiency through assessment, certification, and transformation consulting. Accessible, boundary-safe, capable.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — AI Proficiency for Community Banks`,
    template: `%s — ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'AI banking',
    'community bank AI',
    'credit union AI',
    'banking AI consulting',
    'AI governance SR 11-7',
    'AI readiness assessment',
    'fCAIO',
    'AiBI',
  ],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
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
      <body
        className={`${cormorant.variable} ${cormorantSC.variable} ${dmSans.variable} ${dmMono.variable} flex flex-col min-h-screen`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Header />
        <div id="main-content" className="flex-1">
          {children}
        </div>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
