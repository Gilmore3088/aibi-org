/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // @react-pdf/renderer uses native Node.js modules (canvas, etc.) that must
    // not be bundled by webpack — mark as external for server components/routes.
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
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
    ];
  },
};

export default nextConfig;
