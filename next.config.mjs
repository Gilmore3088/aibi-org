import createMDX from '@next/mdx';

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
      { source: '/courses/aibi-p', destination: '/education/practitioner', permanent: true },
      { source: '/courses/aibi-p/:path*', destination: '/education/practitioner/:path*', permanent: true },
      { source: '/courses/aibi-s', destination: '/education/specialist', permanent: true },
      { source: '/courses/aibi-s/:path*', destination: '/education/specialist/:path*', permanent: true },
      { source: '/courses/aibi-l', destination: '/education/leader', permanent: true },
      { source: '/courses/aibi-l/:path*', destination: '/education/leader/:path*', permanent: true },
      { source: '/certifications/exam/aibi-p', destination: '/education/practitioner/exam', permanent: true },
    ];
  },
};

export default withMDX(nextConfig);
