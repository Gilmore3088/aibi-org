import type { Metadata } from 'next';
import { headers } from 'next/headers';
import {
  Cormorant_SC,
  Newsreader,
  JetBrains_Mono,
} from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { Analytics } from '@vercel/analytics/next';
import { SiteNav, SiteFooter } from '@/components/system';
import { BRAND } from '@content/copy';
import { organizationJsonLd, websiteJsonLd, jsonLdString } from '@/lib/seo/jsonld';
import './globals.css';

// Routes that render WITHOUT the global Header/Footer chrome. These pages
// provide their own internal brand lockup, so showing the global Header on
// top would produce a duplicate logo (or, in the case of the design system
// reference, would frame a pixel-faithful mockup with extraneous chrome).
const CHROMELESS_PATHS: readonly string[] = [
  '/coming-soon',
  '/design-system',
  '/user-home',
  '/my-toolbox',
  '/playground',
  '/faq',
  '/preview-home',
  '/briefing-preview',
  '/lms-preview',
  '/courses/foundation-preview',
  '/courses/foundation/program', // CourseShell renders its own sidebar + breadcrumb chrome
  '/auth', // Ledger-redesigned auth surfaces render their own brand lockup
  '/redesign-checklist',
];

// 2026-05-17: Cormorant Garamond, DM Sans, and DM Mono removed — they
// were declared here but had zero references anywhere in src/. They were
// blocking the LCP element (the H1 in Newsreader) by competing for the
// font network budget. Cormorant SC stays because tokens.css's
// --font-serif-sc still maps to it for small-caps surfaces.
const cormorantSC = Cormorant_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant-sc',
  display: 'swap',
});

// Ledger brand-refresh fonts (2026-05-09). Loaded as the primary stack
// (Newsreader serif + Geist sans + JetBrains Mono).
//
// 2026-05-17: display 'swap' → 'optional'. The H1 "Turning Bankers into
// Builders" in Newsreader was the LCP element; with 'swap' the browser
// waits up to ~3s for Newsreader before rendering the heading, which
// pinned LCP at 3.3-3.8s. With 'optional' the browser renders the H1
// in the fallback (Iowan Old Style → Georgia) immediately if Newsreader
// hasn't loaded within ~100ms, and does NOT swap when it finishes. The
// trade: occasional first paint in the system fallback instead of
// Newsreader. On second visit / cached browsing the user sees Newsreader
// normally. adjustFontFallback (default true) matches the fallback's
// x-height + cap-height to Newsreader's to minimize layout difference.
const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'optional',
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
        {/* Organization + WebSite JSON-LD. Rendered on every page so
            crawlers always see the org graph node. Course/Article-level
            structured data lives on individual route pages. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(websiteJsonLd()) }}
        />
      </head>

      <body
        className={`${cormorantSC.variable} ${newsreader.variable} ${GeistSans.variable} ${jetbrainsMono.variable} flex flex-col min-h-screen`}
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
