import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import Script from 'next/script';

import { rewriteBundleLinks } from '@/lib/redesign/bundle-links';
import './playground.css';

export const metadata: Metadata = {
  title: 'Playground — The AI Banking Institute',
  description: 'Internal playground reference. Not for external distribution.',
  robots: { index: false, follow: false },
};

const bodyHtml = rewriteBundleLinks(
  readFileSync(path.join(process.cwd(), 'src/app/playground/_body.html'), 'utf8'),
);

const inlineScript = readFileSync(
  path.join(process.cwd(), 'src/app/playground/_script.js'),
  'utf8',
);

export default function PlaygroundPage(): JSX.Element {
  return (
    <>
      <div className="pg-page" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <Script
        id="playground-inline"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: inlineScript }}
      />
    </>
  );
}
