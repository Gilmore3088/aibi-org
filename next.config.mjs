// Production guard: SKIP_MAILERLITE=true must never reach prod, or every
// real user opt-in silently skips the MailerLite call and the nurture
// automation never fires. The suppression flag is only for staging/preview.
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
      { source: '/practitioner', destination: '/courses/aibi-p', permanent: true },
      { source: '/consulting', destination: '/for-institutions/advisory', permanent: true },
    ];
  },
};

export default nextConfig;
