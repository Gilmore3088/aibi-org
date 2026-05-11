import createMDX from '@next/mdx';

// Production guard: SKIP_MAILERLITE=true must never reach prod, or every
// real user opt-in silently skips the MailerLite call and the nurture
// automation never fires. The suppression flag is only for staging/preview.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-3-email.md
if (
  process.env.NODE_ENV === 'production' &&
  process.env.VERCEL_ENV === 'production' &&
  process.env.SKIP_MAILERLITE === 'true'
) {
  throw new Error(
    '[next.config] SKIP_MAILERLITE=true detected in production environment. ' +
      'This flag is for staging only. Remove it from Vercel production env vars before deploying.',
  );
}

const withMDX = createMDX({
  // No remark/rehype plugins for now — design-system MDX components are
  // imported explicitly by each essay rather than auto-injected.
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  experimental: {
    // Native-binary packages that must not be bundled by webpack.
    //   @react-pdf/renderer  — uses native canvas modules
    //   @sparticuz/chromium  — bundles Chromium binary for Vercel serverless
    //   puppeteer-core       — peer of @sparticuz/chromium; same exclusion needed
    serverComponentsExternalPackages: [
      '@react-pdf/renderer',
      '@sparticuz/chromium',
      'puppeteer-core',
    ],
  },
  // Decision log: 2026-04-17 — /courses and /certifications merged into /education
  // to reduce nav clutter. Exact-match redirects preserve sub-route access:
  // /courses/aibi-p, /courses/aibi-s, /courses/aibi-l remain the course pages,
  // and /certifications/exam remains the sample exam.
  //
  // Decision log: 2026-04-24 — /services reworked to /for-institutions with
  // an education-first positioning. The old consulting page is replaced; the
  // three advisory tiers live at /for-institutions/advisory.
  //
  // Decision log: 2026-04-29 — /toolbox moved under /dashboard per spec §4.3
  // (paid Toolbox surface lives under /dashboard). Both exact and sub-path
  // redirects preserve any existing course-content deep links.
  //
  // Decision log: 2026-05-07 — design-2.0 IA: /resources → /research,
  // /courses/* → /education/<program>/*. Old routes preserved here as
  // permanent redirects so internal links and external references still
  // resolve while the migration completes in Phase 07.
  //
  // Decision log: 2026-05-09 — friendly short URLs added for email and
  // print copy: /practitioner → /courses/aibi-p, /consulting →
  // /for-institutions/advisory. Lets author copy use memorable paths
  // without having to know the canonical routes.
  async redirects() {
    return [
      { source: '/courses', destination: '/education', permanent: true },
      { source: '/certifications', destination: '/education', permanent: true },
      { source: '/services', destination: '/for-institutions', permanent: true },
      { source: '/foundations', destination: '/education', permanent: true },
      { source: '/toolbox', destination: '/dashboard/toolbox', permanent: true },
      { source: '/toolbox/:path*', destination: '/dashboard/toolbox/:path*', permanent: true },
      // /resources root → /research; individual essays remain at /resources/<slug>
      // until Phase 07 migration ports each essay to MDX in content/essays/.
      { source: '/resources', destination: '/research', permanent: true },
      // Foundation rename (2026-05-10) — every legacy /courses/aibi-p path
      // redirects to /courses/foundation/program. permanent: true emits HTTP
      // 308 (method-preserving, cacheable, search-engine-friendly). Keep
      // these forever — sent emails, Stripe receipts, indexed search results
      // all link to /courses/aibi-p and there is no removal date.
      { source: '/courses/aibi-p', destination: '/courses/foundation/program', permanent: true },
      { source: '/courses/aibi-p/:path*', destination: '/courses/foundation/program/:path*', permanent: true },
      { source: '/certifications/exam/aibi-p', destination: '/courses/foundation/program/exam', permanent: true },
      // Friendly short URLs flipped to the new canonical home.
      { source: '/practitioner', destination: '/courses/foundation/program', permanent: true },
      // Wave D inverse: until /education/<program> ships as a real page,
      // those routes redirect to /courses/foundation/program (the active
      // program). Use temporary (302) so we can flip when Wave D migrates.
      { source: '/education/practitioner', destination: '/courses/foundation/program', permanent: false },
      { source: '/education/practitioner/:path*', destination: '/courses/foundation/program/:path*', permanent: false },
      { source: '/education/specialist', destination: '/coming-soon?interest=specialist', permanent: false },
      { source: '/education/specialist/:path*', destination: '/coming-soon?interest=specialist', permanent: false },
      { source: '/education/leader', destination: '/coming-soon?interest=leader', permanent: false },
      { source: '/education/leader/:path*', destination: '/coming-soon?interest=leader', permanent: false },
      { source: '/consulting', destination: '/for-institutions/advisory', permanent: true },
    ];
  },
  // Security headers applied to every route.
  //
  // CSP is in REPORT-ONLY mode for now. Violations log to the browser
  // console but do not block resource loads. Once a few preview-deploy
  // smoke tests confirm zero unexpected violations, flip
  // `Content-Security-Policy-Report-Only` → `Content-Security-Policy`
  // in the header below to enforce.
  //
  // Origin whitelist:
  //   - Supabase    *.supabase.co     (auth, storage, realtime, REST)
  //   - Stripe      js.stripe.com, *.stripe.com, *.stripe.network, q.stripe.com
  //                                   (checkout, fraud detection scripts)
  //   - Vercel      vitals.vercel-insights.com, va.vercel-scripts.com
  //                                   (Analytics + Speed Insights)
  //   - Calendly    *.calendly.com, assets.calendly.com
  //                                   (Executive Briefing embed)
  //   - Google      fonts.googleapis.com, fonts.gstatic.com
  //                                   (Newsreader + Geist + JetBrains Mono)
  //
  // MailerLite, Resend, Anthropic, OpenAI: server-side only — no client
  // origins needed.
  async headers() {
    const csp = [
      "default-src 'self'",
      // Next.js inlines hydration scripts; without 'unsafe-inline' the page
      // does not interactively boot. 'unsafe-eval' is NOT included — Next.js
      // 14 production builds don't require it.
      "script-src 'self' 'unsafe-inline' https://js.stripe.com https://*.stripe.com https://va.vercel-scripts.com",
      // Tailwind inline styles need 'unsafe-inline'. Google Fonts stylesheets too.
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      // data:/blob: for image-resize previews and inline SVGs.
      "img-src 'self' data: blob: https://*.supabase.co https://*.stripe.com https://q.stripe.com",
      "media-src 'self' blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.stripe.com https://*.vercel-insights.com https://vitals.vercel-insights.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://*.calendly.com",
      "frame-ancestors 'self'",
      "form-action 'self' https://checkout.stripe.com https://*.calendly.com",
      "base-uri 'self'",
      "object-src 'none'",
      "manifest-src 'self'",
      "worker-src 'self' blob:",
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          // Prevent clickjacking. SAMEORIGIN (not DENY) so internal previews
          // can iframe our own routes for QA tooling.
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Prevent MIME sniffing.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Send origin (not full URL) on cross-origin requests.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Force HTTPS for 2 years. `preload` requires submitting to
          // hstspreload.org once we're confident the apex + all subdomains
          // are https-only forever.
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Disable browser features we don't use. Reduces fingerprint
          // surface and prevents third-party scripts from quietly enabling
          // them.
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(self "https://js.stripe.com" "https://checkout.stripe.com")',
          },
          // Modern replacement for X-XSS-Protection. Cross-origin isolation
          // not strictly required (we don't use SharedArrayBuffer) so we
          // keep it permissive enough for Stripe/Calendly popups.
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          // CSP in report-only mode. Flip the key to `Content-Security-Policy`
          // to enforce after preview validation.
          { key: 'Content-Security-Policy-Report-Only', value: csp },
        ],
      },
    ];
  },
};

export default withMDX(nextConfig);
