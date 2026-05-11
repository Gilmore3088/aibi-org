import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LMS Prototype — preview',
  description: 'Internal LMS prototype preview. Not for external distribution.',
  robots: { index: false, follow: false },
};

// The LMS prototype uses CDN React + Babel-in-the-browser to compile its
// JSX files at runtime. That doesn't co-exist with Next's own React without
// careful loader gymnastics. The pragmatic move: serve the bundle as static
// files under /lms-prototype/ and frame it in an iframe. Faithful to the
// design's runtime behavior, zero React conflict, future bundle re-imports
// just need the public/ files refreshed.
export default function LmsPreviewPage(): JSX.Element {
  return (
    <iframe
      src="/lms-prototype/index.html"
      title="LMS Prototype"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 0 }}
    />
  );
}
