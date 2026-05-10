import type { Metadata } from 'next';
import Script from 'next/script';
import { headers } from 'next/headers';
import {
  Cormorant_Garamond,
  Cormorant_SC,
  DM_Sans,
  DM_Mono,
  Newsreader,
  JetBrains_Mono,
} from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { Analytics } from '@vercel/analytics/next';
import { SiteNav, SiteFooter } from '@/components/system';
import { BRAND } from '@content/copy';
import './globals.css';

// Routes that render WITHOUT the global Header/Footer chrome. These pages
// provide their own internal brand lockup, so showing the global Header on
// top would produce a duplicate logo (or, in the case of the design system
// reference, would frame a pixel-faithful mockup with extraneous chrome).
const CHROMELESS_PATHS: readonly string[] = ['/coming-soon', '/design-system', '/user-home', '/my-toolbox'];

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

// Ledger brand-refresh fonts (2026-05-09). Loaded alongside the legacy
// Cormorant/DM Sans/DM Mono stack while surfaces are migrated. The legacy
// fonts will be removed once the migration is complete.
const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
});

// Geist ships its own variable font wrapper — `--font-geist-sans`.
// We alias it via tokens-ledger.css's `--ledger-sans → var(--font-geist)`.
// To keep the variable name `--font-geist` (referenced in tokens-ledger.css),
// we re-export GeistSans's variable under that name on the body class.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${BRAND.domains.primary}`;
const DEFAULT_DESCRIPTION =
  'The AI Banking Institute helps community banks and credit unions build AI proficiency through assessment, certification, and curriculum aligned with SR 11-7, TPRM, ECOA / Reg B, and the AIEOG AI Lexicon.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s — ${BRAND.name}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'AI banking',
    'community bank AI',
    'credit union AI',
    'AI governance SR 11-7',
    'AI readiness assessment',
    'AI proficiency training',
    'community bank AI training',
  ],
  authors: [{ name: BRAND.name }],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: BRAND.name,
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: DEFAULT_DESCRIPTION,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get('x-pathname') ?? '/';
  const chromeless = CHROMELESS_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

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
        className={`${cormorant.variable} ${cormorantSC.variable} ${dmSans.variable} ${dmMono.variable} ${newsreader.variable} ${GeistSans.variable} ${jetbrainsMono.variable} flex flex-col min-h-screen`}
      >
        {!chromeless && (
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
        )}
        {!chromeless && <SiteNav />}
        <div id="main-content" className="flex-1">
          {children}
        </div>
        {!chromeless && <SiteFooter />}
        <Analytics />
      </body>
    </html>
  );
}
