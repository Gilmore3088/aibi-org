/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // @react-pdf/renderer uses native Node.js modules (canvas, etc.) that must
    // not be bundled by webpack — mark as external for server components/routes.
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
};

export default nextConfig;
