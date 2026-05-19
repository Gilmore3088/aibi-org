import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import Script from 'next/script';

import { rewriteBundleLinks } from '@/lib/redesign/bundle-links';
import { TOOLS } from '@/lib/my-toolbox/tools';
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

// The bundle's vanilla JS reads tool data from a JSON island injected
// just above it; the script's view-layer code rebuilds the full TOOLS
// map by merging this data with locally-defined previewBody + footer
// helpers. See src/lib/my-toolbox/tools.ts.
const toolsJson = JSON.stringify(TOOLS);

export default function MyToolboxPage(): JSX.Element {
  return (
    <>
      <div className="mt-page" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <script
        id="toolbox-tools-data"
        type="application/json"
        // Safe: TOOLS is build-time data, but escape </script in body
        // text to prevent any future tool body breaking out.
        dangerouslySetInnerHTML={{
          __html: toolsJson.replace(/<\/script/gi, '<\\/script'),
        }}
      />
      {/*
        Re-execute the bundle's vanilla JS after the body is in the DOM.
        Wrapping in an IIFE prevents leaking globals; the script reads
        the JSON island above to hydrate its TOOLS map.
      */}
      <Script
        id="my-toolbox-inline"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: `(function(){\n${inlineScript}\n})();` }}
      />
    </>
  );
}
