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
  async redirects() {
    return [
      { source: '/courses', destination: '/education', permanent: true },
      { source: '/certifications', destination: '/education', permanent: true },
      // Retire the AiBI-S cohort scaffolding — self-serve prototype takes over.
      // Purchase/submit/resources sub-routes intentionally left in place.
      { source: '/courses/aibi-s', destination: '/aibi-s-preview', permanent: false },
      { source: '/courses/aibi-s/1', destination: '/aibi-s-preview', permanent: false },
      { source: '/courses/aibi-s/2', destination: '/aibi-s-preview', permanent: false },
      { source: '/courses/aibi-s/3', destination: '/aibi-s-preview', permanent: false },
      { source: '/courses/aibi-s/4', destination: '/aibi-s-preview', permanent: false },
      { source: '/courses/aibi-s/5', destination: '/aibi-s-preview', permanent: false },
      { source: '/courses/aibi-s/6', destination: '/aibi-s-preview', permanent: false },
    ];
  },
};

export default nextConfig;
