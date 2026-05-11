import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import Script from 'next/script';

import { rewriteBundleLinks } from '@/lib/redesign/bundle-links';
import './preview-home.css';

export const metadata: Metadata = {
  title: 'The AI Banking Institute — preview',
  description: 'Internal marketing landing preview. Not for external distribution.',
  robots: { index: false, follow: false },
};

const bodyHtml = rewriteBundleLinks(
  readFileSync(path.join(process.cwd(), 'src/app/preview-home/_body.html'), 'utf8'),
);

const inlineScript = readFileSync(
  path.join(process.cwd(), 'src/app/preview-home/_script.js'),
  'utf8',
);

export default function PreviewHomePage(): JSX.Element {
  return (
    <>
      <div className="ph-page" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <Script
        id="preview-home-inline"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: `(function(){\n${inlineScript}\n})();` }}
      />
    </>
  );
}
