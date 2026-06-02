import createMDX from '@next/mdx';
import bundleAnalyzer from '@next/bundle-analyzer';

// Bundle analyzer — runs only when ANALYZE=true.
//   ANALYZE=true npm run build
// Opens an interactive treemap (.next/analyze/*.html) breaking down
// the server + client + edge bundles by package. Useful for catching
// new heavy dependencies before they ship.
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

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
      // 2026-05-26: /courses is now the canonical Course landing.
      // /education is retired as a tab and redirects to /courses; the
      // 2026-04-17 catalog-style page is replaced by a course-focused
      // page at /courses (see src/app/courses/_client.tsx).
      { source: '/education', destination: '/courses', permanent: true },
      { source: '/education/:path*', destination: '/courses', permanent: true },
      // /certifications redirect removed 2026-05-27 — the route has a real
      // page at src/app/certifications/page.tsx and is referenced by
      // CLAUDE.md §16 launch gate as an inquiry surface. The redirect was
      // suppressing the existing page. Issue #317.
      // (Sub-route redirect kept: /certifications/exam/aibi-p is below.)
      { source: '/services', destination: '/for-institutions', permanent: true },
      { source: '/teams', destination: '/for-institutions', permanent: true },
      { source: '/foundations', destination: '/courses', permanent: true },
      // 2026-05-29 product simplification: no separate /about page (the
      // institute speaks through its product surfaces, not a bio page) and
      // no advisory offering (the institute sells education + the In-Depth
      // Assessment, not consulting). /research consolidates into /resources.
      { source: '/about', destination: '/', permanent: true },
      { source: '/for-institutions/advisory', destination: '/for-institutions', permanent: true },
      // 2026-06-01: /research fully consolidated into /resources. The bare
      // /research hub and every /research/<slug> article + /research/templates/*
      // page now live under /resources. Both 308s so old bookmarks, sitemaps,
      // and indexed article URLs resolve to the canonical /resources location.
      { source: '/research', destination: '/resources', permanent: true },
      { source: '/research/:path*', destination: '/resources/:path*', permanent: true },
      { source: '/toolbox', destination: '/dashboard/toolbox', permanent: true },
      { source: '/toolbox/:path*', destination: '/dashboard/toolbox/:path*', permanent: true },
      // 2026-05-28: /assessment/in-depth/dashboard renamed to /access.
      // The page is a gated cohort-leader view; "dashboard" implied a live
      // analytics surface it wasn't. Permanent redirect so external links
      // (Stripe receipts, ConvertKit-era emails) keep working.
      {
        source: '/assessment/in-depth/dashboard',
        destination: '/assessment/in-depth/access',
        permanent: true,
      },
      // 2026-06-01: the old /resources/<slug> → /research/<slug> rule was
      // removed. Those six article slugs now render directly at
      // /resources/<slug> (the consolidation target); the inverse
      // /research/:path* → /resources/:path* rule above covers legacy links.
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
      // /education/specialist and /education/leader retired 2026-05-26;
      // legacy paths now resolve to the Course landing (/education itself
      // also redirects to /courses — see the top of this list).
      { source: '/education/specialist', destination: '/courses', permanent: true },
      { source: '/education/specialist/:path*', destination: '/courses', permanent: true },
      { source: '/education/leader', destination: '/courses', permanent: true },
      { source: '/education/leader/:path*', destination: '/courses', permanent: true },
      // /courses/aibi-s and /courses/aibi-l retired 2026-05-26.
      { source: '/courses/aibi-s', destination: '/courses', permanent: true },
      { source: '/courses/aibi-s/:path*', destination: '/courses', permanent: true },
      { source: '/courses/aibi-l', destination: '/courses', permanent: true },
      { source: '/courses/aibi-l/:path*', destination: '/courses', permanent: true },
      // 2026-06-01 flow audit: collapse the /consulting double-hop. This used
      // to land on /for-institutions/advisory, which itself redirects to
      // /for-institutions — two HTTP round-trips. Point straight at the final
      // destination so legacy /consulting links resolve in a single hop.
      { source: '/consulting', destination: '/for-institutions', permanent: true },
      // 2026-05-26: /results used to render a full sample report
      // (score, tier, dimensions) on a public URL with no email gate
      // — direct violation of the email-gate UX contract. The demo
      // moved to /results/sample with prominent "SAMPLE" badges; this
      // 308 keeps old bookmarks landing somewhere sensible.
      { source: '/results', destination: '/assessment', permanent: true },
      // 2026-05-28: every downloadable artifact moved to Supabase Storage
      // and is served via /api/resources/[slug]/download (signed URLs +
      // entitlement gating + per-download logging). Public-facing legacy
      // /downloads/<slug>.{pdf,zip} URLs (sent emails, external links,
      // any straggling code refs) redirect to the API. 308 = permanent,
      // method-preserving, cacheable. See DECISIONS.md 2026-05-28.
      { source: '/downloads/:slug.pdf', destination: '/api/resources/:slug/download', permanent: true },
      { source: '/downloads/:slug.zip', destination: '/api/resources/:slug/download', permanent: true },
    ];
  },
  // Security headers applied to every route.
  //
  // CSP is ENFORCED (flipped from Report-Only 2026-05-17 after the
  // §16 security audit verified zero unexpected violations on the
  // preview deploys). Violations now block resource loads.
  //
  // To roll back during incident response, change the header key
  // below from `Content-Security-Policy` to
  // `Content-Security-Policy-Report-Only` and redeploy.
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
    // Next.js dev mode (HMR / React Fast Refresh) evaluates strings as JS, so
    // local `npm run dev` needs 'unsafe-eval' or client components never
    // hydrate (the page renders SSR but interactive bits — e.g. /research's
    // cover-chart animation — silently fail under the enforced CSP). Production
    // builds don't use eval, so it stays OUT of prod CSP. 2026-05-21.
    const devEval = process.env.NODE_ENV === 'production' ? '' : " 'unsafe-eval'";
    const csp = [
      "default-src 'self'",
      // Next.js inlines hydration scripts; without 'unsafe-inline' the page
      // does not interactively boot. 'unsafe-eval' is dev-only (see devEval).
      `script-src 'self' 'unsafe-inline'${devEval} https://js.stripe.com https://*.stripe.com https://va.vercel-scripts.com`,
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
          // CSP enforced (was report-only until 2026-05-17). Roll back
          // by reverting to `Content-Security-Policy-Report-Only` if a
          // new third-party integration trips violations in production.
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(withMDX(nextConfig));
