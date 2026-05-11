import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import Script from 'next/script';

import { rewriteBundleLinks } from '@/lib/redesign/bundle-links';
import './my-toolbox.css';

export const metadata: Metadata = {
  title: 'My Toolbox — The AI Banking Institute',
  description: 'Internal toolbox reference. Not for external distribution.',
  robots: { index: false, follow: false },
};

const bodyHtml = rewriteBundleLinks(
  readFileSync(path.join(process.cwd(), 'src/app/my-toolbox/_body.html'), 'utf8'),
);

const inlineScript = readFileSync(
  path.join(process.cwd(), 'src/app/my-toolbox/_script.js'),
  'utf8',
);

export default function MyToolboxPage(): JSX.Element {
  return (
    <>
      <div className="mt-page" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      {/*
        Re-execute the bundle's vanilla JS after the body is in the DOM.
        Wrapping in an IIFE prevents leaking globals; the script uses
        document.getElementById/querySelectorAll which all match elements
        rendered above.
      */}
      <Script
        id="my-toolbox-inline"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: `(function(){\n${inlineScript}\n})();` }}
      />
    </>
  );
}
