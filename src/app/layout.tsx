import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { GeistSans } from 'geist/font/sans';
import { Analytics } from '@vercel/analytics/next';
import { LayoutChrome } from '@/components/system';
import { MockupSiteFooter } from '@/components/mockup';
import { BRAND } from '@content/copy';
import { organizationJsonLd, websiteJsonLd, jsonLdString } from '@/lib/seo/jsonld';
import './globals.css';

// The root layout previously read headers() (x-pathname) to pick the chrome,
// which forced dynamic rendering app-wide. The hydration fix removed that
// header read (chrome now derives from usePathname in LayoutChrome), which
// made every page static-generation-eligible and surfaced
// useSearchParams-without-Suspense prerender errors on the client auth pages.
// Restore the prior app-wide dynamic rendering explicitly — it matches what
// production does today and keeps the deterministic-chrome fix intact.
export const dynamic = 'force-dynamic';

// 2026-09-30: all Google-served families switched to self-hosted woff2s in
// src/app/fonts (latin subsets from the @fontsource builds of the same
// Google Fonts releases, SIL OFL). next/font/google fetches
// fonts.googleapis.com during `next build`, and that fetch is the repo's
// only recurring CI flake — it killed unrelated runs on 2026-08-17 and
// 2026-09-30. next/font/local reads metrics from the committed files, so
// builds are hermetic and the fallback metrics no longer depend on
// @next/font's bundled Google metrics database.
//
// 2026-05-17: Cormorant Garamond, DM Sans, and DM Mono removed — they
// were declared here but had zero references anywhere in src/. They were
// blocking the LCP element (the H1 in Newsreader) by competing for the
// font network budget. Cormorant SC stays because tokens.css's
// --font-serif-sc still maps to it for small-caps surfaces; only the 400
// weight ships (every `.font-serif-sc` usage inherits the default weight).
const cormorantSC = localFont({
  src: './fonts/cormorant-sc-latin-400-normal.woff2',
  weight: '400',
  style: 'normal',
  variable: '--font-cormorant-sc',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
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
// The hero/heavy split survives self-hosting, but both configs now point at
// the same [opsz,wght] variable files (the same axes Google was serving), so
// "heavy" costs no extra download — the browser reuses the cached file and
// resolves 500-700 from the wght axis. The manual "Newsreader Fallback"
// @font-face in globals.css stays: tokens.css chains it independently, and
// next/font/local's own synthesized fallback (computed from the committed
// file's real metrics) now layers on top instead of failing like the old
// Google metrics lookup did.
const newsreaderHero = localFont({
  src: [
    { path: './fonts/newsreader-latin-opsz-normal.woff2', style: 'normal' },
    { path: './fonts/newsreader-latin-opsz-italic.woff2', style: 'italic' },
  ],
  weight: '200 800',
  variable: '--font-newsreader-hero',
  display: 'swap',
  preload: true,
  adjustFontFallback: 'Times New Roman',
});

const newsreaderHeavy = localFont({
  src: [{ path: './fonts/newsreader-latin-opsz-normal.woff2', style: 'normal' }],
  weight: '200 800',
  variable: '--font-newsreader-heavy',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Times New Roman',
});

// Geist ships its own variable font wrapper — `--font-geist-sans`.
// We re-export GeistSans's variable as `--font-geist` on the body class
// so legacy consumers (Ledger-era fallback chains) continue to resolve.
// The variable file covers the full wght axis in one 40 KB download —
// smaller than the two static instances (400 + 600) it replaces.
const jetbrainsMono = localFont({
  src: [{ path: './fonts/jetbrains-mono-latin-wght-normal.woff2', style: 'normal' }],
  weight: '100 800',
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

// Inter — primary mockup-system font (2026-05-26). Weights 400/500/600/700/800
// cover every observed use in public/sketches/_mockup.css and the per-page
// sketches. Exposed as --font-inter; mockup.css references it via the
// "Inter" family-name fallback chain so a missing variable still resolves.
const inter = localFont({
  src: [{ path: './fonts/inter-latin-wght-normal.woff2', style: 'normal' }],
  weight: '100 900',
  variable: '--font-inter',
  display: 'swap',
});

// Brand v1 (2026-05-28) — Instrument Serif italic 400 is the sole italic
// glyph on the site. Reserved for the bracketed [Ai] mark's stylized "i"
// via the `.si` class (see src/styles/brand.css). Italic-only, weight 400
// only — nothing else loads. Display 'swap' is safe: the mark falls back
// to Newsreader italic from --font-mark-serif before Instrument Serif
// arrives, and Newsreader is already on the critical font budget.
const instrumentSerif = localFont({
  src: './fonts/instrument-serif-latin-400-italic.woff2',
  weight: '400',
  style: 'italic',
  variable: '--font-instrument-serif',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});

// Apex `aibankinginstitute.com` 301s to `www.aibankinginstitute.com` at the
// edge (Vercel + DNS), so the www subdomain is the canonical host. Default
// to it explicitly here — the BRAND.domains.primary value is the apex used
// in display copy / email addresses and is NOT the canonical web origin.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${BRAND.domains.primary}`;
const DEFAULT_DESCRIPTION =
  'The AI Banking Institute helps community banks and credit unions build AI proficiency through assessment, certification, and curriculum aligned with SR 26-2, TPRM, ECOA / Reg B, and the AIEOG AI Lexicon.';

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
    'AI governance SR 26-2',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // The chrome-visibility decision (which Header/Footer subtree mounts) is made
  // inside <LayoutChrome> from usePathname(), NOT from the x-pathname request
  // header. usePathname() is identical across SSR and the first client render,
  // so server HTML and client hydration always agree — this removes the only
  // non-deterministic input that produced the intermittent React #418
  // hydration error on /resources via soft navigation. The chrome elements are
  // Server Components (SiteNav reads next/headers for nav-active state), so we
  // render them here and hand them to the client wrapper as slots; the wrapper
  // only chooses which slot to mount.
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
        <LayoutChrome
          skipLink={
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
          }
          mockupFooter={<MockupSiteFooter />}
        >
          {children}
        </LayoutChrome>
        <Analytics />
      </body>
    </html>
  );
}
