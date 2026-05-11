import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import Script from 'next/script';

import { rewriteBundleLinks } from '@/lib/redesign/bundle-links';
import './briefing-preview.css';

export const metadata: Metadata = {
  title: 'AI Readiness Briefing — preview',
  description: 'Internal assessment results briefing preview. Not for external distribution.',
  robots: { index: false, follow: false },
};

const bodyHtml = rewriteBundleLinks(
  readFileSync(path.join(process.cwd(), 'src/app/briefing-preview/_body.html'), 'utf8'),
);

const inlineScript = readFileSync(
  path.join(process.cwd(), 'src/app/briefing-preview/_script.js'),
  'utf8',
);

// The bundle's <body> carried four data attributes that drive variant
// styling (direction = ledger | signal | field | editorial; mark =
// lockup | seal | wordmark; grain = on | off; headline = serif | sans).
// They live on the wrapper now since dSIH can't put them on document.body.
export default function BriefingPreviewPage(): JSX.Element {
  return (
    <>
      <div
        className="brief-page"
        data-direction="ledger"
        data-mark="lockup"
        data-grain="on"
        data-headline="serif"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
      <Script
        id="briefing-inline"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: `(function(){\n${inlineScript}\n})();` }}
      />
    </>
  );
}
