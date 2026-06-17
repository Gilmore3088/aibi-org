import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import {
  Cormorant_SC,
  Inter,
  Instrument_Serif,
  Newsreader,
  JetBrains_Mono,
} from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { Analytics } from '@vercel/analytics/next';
import { SiteNav, SiteFooter } from '@/components/system';
import { MockupSiteFooter } from '@/components/mockup';
import { BRAND } from '@content/copy';
import { organizationJsonLd, websiteJsonLd, jsonLdString } from '@/lib/seo/jsonld';
import './globals.css';

// Routes that render WITHOUT the global Header/Footer chrome. These pages
// provide their own internal brand lockup, so showing the global Header on
// top would produce a duplicate logo (or, in the case of the design system
// reference, would frame a pixel-faithful mockup with extraneous chrome).
const CHROMELESS_PATHS: readonly string[] = [
  // 2026-05-26 redesign sprint — every route ported to the mockup design
  // system renders its own SiteHeader from @/components/mockup. As each
  // route migrates, it joins this list. When all routes have migrated
  // the global SiteNav is removed entirely.
  '/',
  '/assessment',
  '/assessment/take',
  '/results',
  '/courses',
  '/playground',
  '/practice',
  '/my-toolbox',
  '/for-institutions',
  '/playbooks',
  '/dashboard',
  '/courses/foundation/program',
  '/auth',
  '/',
  '/security',
  '/certifications',
  '/education',
  '/resources',
  '/faq',
  '/privacy',
  '/terms',
  '/ai-use-disclaimer',

  // Pre-existing chromeless routes (own brand lockup or no chrome by design)
  '/design-system',
  // /courses/foundation/program and /auth intentionally NOT chromeless —
  // both need the global SiteNav. /auth surfaces drop the LedgerSurface
  // internal lockup via showHeader={false} so there's no duplicate mark.
  // CourseShell's sidebar + breadcrumb cover the course tree only.
];

// 2026-05-17: Cormorant Garamond, DM Sans, and DM Mono removed — they
// were declared here but had zero references anywhere in src/. They were
// blocking the LCP element (the H1 in Newsreader) by competing for the
// font network budget. Cormorant SC stays because tokens.css's
// --font-serif-sc still maps to it for small-caps surfaces.
// 2026-05-17 perf: dropped weights 500/600/700 — every `.font-serif-sc`
// usage in src/ inherits the default 400 weight (no font-bold / font-medium
// utilities applied). Cuts ~3 KB of @font-face declarations from the
// shared layout CSS (18 declarations × 6 unicode subsets).
const cormorantSC = Cormorant_SC({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-cormorant-sc',
  display: 'swap',
});

// Ledger brand-refresh fonts (2026-05-09). Loaded as the primary stack
// (Newsreader serif + Geist sans + JetBrains Mono).
//
// 2026-05-17 perf notes:
//   - Weight 300 dropped: zero references in src/ (Lighthouse and grep
//     both confirmed). Saves one font file from the critical fetch.
//   - display kept as 'swap', not 'optional'. Tested 'optional' against
//     Lighthouse and it produced no measurable LCP improvement
//     (Lighthouse 3.3s LCP is network-bound by font download on
//     throttled 4G — real users see LCP < 500ms uncached, ~0ms cached).
//     'swap' preserves the brand identity on first paint.
//   - Split into two configs (Wave A3): hero (400 + italic, preloaded)
//     covers ledes/body; heavy (500/600/700, no preload) covers section
//     titles + the few bold serif pulls. Two distinct CSS variables —
//     tokens.css chains them in font-family so the
//     browser resolves heavy weights to newsreaderHeavy's family when
//     they're requested. (Spec said "both bind --font-newsreader" but a
//     single variable can't expose two families — see audit trail.)
// The Next build still logs "Failed to find font override values for font
// `Newsreader`" four times — @next/font/google's metric database doesn't
// include Newsreader. We compensate manually: globals.css declares a
// "Newsreader Fallback" @font-face that wraps Times New Roman with
// size-adjust + ascent/descent overrides matching Newsreader's metrics,
// and tokens.css chains it between the loading Newsreader family and the
// generic serif chain. No CLS hop on first paint.
const newsreaderHero = Newsreader({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader-hero',
  display: 'swap',
  preload: true,
});

const newsreaderHeavy = Newsreader({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal'],
  variable: '--font-newsreader-heavy',
  display: 'swap',
  preload: false,
});

// Geist ships its own variable font wrapper — `--font-geist-sans`.
// We re-export GeistSans's variable as `--font-geist` on the body class
// so legacy consumers (Ledger-era fallback chains) continue to resolve.
// 2026-05-17 perf: dropped weight 500 — no `font-mono font-medium` usage
// in src/. Weights 400 (default) and 600 (font-semibold on mono buttons,
// kicker labels, plan markers) cover every observed usage.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

// Inter — primary mockup-system font (2026-05-26). Weights 400/500/600/700/800
// cover every observed use in public/sketches/_mockup.css and the per-page
// sketches. Exposed as --font-inter; mockup.css references it via the
// "Inter" family-name fallback chain so a missing variable still resolves.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

// Brand v1 (2026-05-28) — Instrument Serif italic 400 is the sole italic
// glyph on the site. Reserved for the bracketed [Ai] mark's stylized "i"
// via the `.si` class (see src/styles/brand.css). Italic-only, weight 400
// only — nothing else loads. Display 'swap' is safe: the mark falls back
// to Newsreader italic from --font-mark-serif before Instrument Serif
// arrives, and Newsreader is already on the critical font budget.
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

// Apex `aibankinginstitute.com` 301s to `www.aibankinginstitute.com` at the
// edge (Vercel + DNS), so the www subdomain is the canonical host. Default
// to it explicitly here — the BRAND.domains.primary value is the apex used
// in display copy / email addresses and is NOT the canonical web origin.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${BRAND.domains.primary}`;
const DEFAULT_DESCRIPTION =
  'The AI Banking Institute helps community banks and credit unions build AI proficiency through assessment, certification, and curriculum aligned with SR 11-7, TPRM, ECOA / Reg B, and the AIEOG AI Lexicon.';

// Explicit viewport so every public route gets the mobile-first defaults.
// Without this, Next.js 14 falls back to its own defaults — same values,
// but having it explicit makes the contract grep-able and prevents future
// metadata refactors from accidentally dropping mobile sizing.
// See #194.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Every page becomes self-canonical by default (relative '/' resolves
  // against metadataBase + the current request path). Pages that need a
  // different canonical override this in their own metadata export.
  alternates: {
    canonical: '/',
  },
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

// Chromeless routes that should still have NO footer at all. Truly-bare
// surfaces — operator tools, the pre-launch holding page, and signed-in
// app shells that own their own bottom chrome.
const FOOTERLESS_PATHS: readonly string[] = [
  '/coming-soon',
  '/design-system',
  '/auth',
  '/dashboard',
  '/courses/foundation/program',
  '/assessment/take',
  '/assessment/in-depth/take',
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get('x-pathname') ?? '/';
  const chromeless = CHROMELESS_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const footerless = FOOTERLESS_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const showMockupFooter = chromeless && !footerless;

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
        className={`${cormorantSC.variable} ${newsreaderHero.variable} ${newsreaderHeavy.variable} ${GeistSans.variable} ${jetbrainsMono.variable} ${inter.variable} ${instrumentSerif.variable} flex flex-col min-h-screen`}
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
        {showMockupFooter && <MockupSiteFooter />}
        <Analytics />
      </body>
    </html>
  );
}
