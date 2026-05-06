// Production guard: SKIP_CONVERTKIT=true must never reach prod, or every
// real user opt-in silently skips the CK call and the nurture sequence
// never fires. The staging suppression flag is only for staging/preview.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-3-email.md
if (
  process.env.NODE_ENV === 'production' &&
  process.env.VERCEL_ENV === 'production' &&
  process.env.SKIP_CONVERTKIT === 'true'
) {
  throw new Error(
    '[next.config] SKIP_CONVERTKIT=true detected in production environment. ' +
      'This flag is for staging only. Remove it from Vercel production env vars before deploying.',
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
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
  async redirects() {
    return [
      { source: '/courses', destination: '/education', permanent: true },
      { source: '/certifications', destination: '/education', permanent: true },
      { source: '/services', destination: '/for-institutions', permanent: true },
      { source: '/foundations', destination: '/education', permanent: true },
      { source: '/toolbox', destination: '/dashboard/toolbox', permanent: true },
      { source: '/toolbox/:path*', destination: '/dashboard/toolbox/:path*', permanent: true },
      // Decision log: 2026-05-05 — AiBI-S and AiBI-L soft-hidden until ready.
      // Reactivation: remove these 4 entries, re-add cards in src/app/education/page.tsx,
      // flip products to active=true in Stripe Dashboard.
      { source: '/courses/aibi-s', destination: '/education', permanent: false },
      { source: '/courses/aibi-l', destination: '/education', permanent: false },
      { source: '/courses/aibi-s/:path*', destination: '/education', permanent: false },
      { source: '/courses/aibi-l/:path*', destination: '/education', permanent: false },
      // Decision log: 2026-05-05 — Advisory tiers (Pilot/Program/Leadership Advisory)
      // removed pending case studies. Custom engagements offered via mailto stub on
      // /for-institutions until case-study content exists.
      { source: '/for-institutions/advisory', destination: '/for-institutions', permanent: false },
      { source: '/for-institutions/advisory/:path*', destination: '/for-institutions', permanent: false },
      // Decision log: 2026-05-06 — /assessment/start interstitial removed.
      // The assessment now lives at a single URL (/assessment) with an inline
      // intro panel rendered above Q1 (Plans/refactor-momentum-first-ux-restructure.md).
      // External bookmarks + ConvertKit drip emails redirect transparently.
      { source: '/assessment/start', destination: '/assessment', permanent: true },
    ];
  },
};

export default nextConfig;
