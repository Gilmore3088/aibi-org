import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import Script from 'next/script';

import { rewriteBundleLinks } from '@/lib/redesign/bundle-links';
import './faq.css';

export const metadata: Metadata = {
  title: 'FAQ — The AI Banking Institute',
  description: 'Internal FAQ reference. Not for external distribution.',
  robots: { index: false, follow: false },
};

const bodyHtml = rewriteBundleLinks(
  readFileSync(path.join(process.cwd(), 'src/app/faq/_body.html'), 'utf8'),
);

const inlineScript = readFileSync(
  path.join(process.cwd(), 'src/app/faq/_script.js'),
  'utf8',
);

export default function FaqPage(): JSX.Element {
  return (
    <>
      <div className="faq-page" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <Script
        id="faq-inline"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: `(function(){\n${inlineScript}\n})();` }}
      />
    </>
  );
}
