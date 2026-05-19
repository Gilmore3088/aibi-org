import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import Script from 'next/script';

import { rewriteBundleLinks } from '@/lib/redesign/bundle-links';
import { TOOLS } from '@/lib/my-toolbox/tools';
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

// Shared tool data so /playground?tool=<key> can pre-load any tool from
// /my-toolbox into the editor. See src/lib/my-toolbox/tools.ts.
const toolsJson = JSON.stringify(TOOLS);

export default function PlaygroundPage(): JSX.Element {
  return (
    <>
      <div className="pg-page" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <script
        id="toolbox-tools-data"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: toolsJson.replace(/<\/script/gi, '<\\/script'),
        }}
      />
      <Script
        id="playground-inline"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: inlineScript }}
      />
    </>
  );
}
