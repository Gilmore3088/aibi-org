import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';

import { rewriteBundleLinks } from '@/lib/redesign/bundle-links';
import './foundation-preview.css';

export const metadata: Metadata = {
  title: 'AiBI Foundation — preview',
  description: 'Internal foundation course preview. Not for external distribution.',
  robots: { index: false, follow: false },
};

const bodyHtml = rewriteBundleLinks(
  readFileSync(
    path.join(process.cwd(), 'src/app/courses/foundation-preview/_body.html'),
    'utf8',
  ),
);

export default function FoundationPreviewPage(): JSX.Element {
  return <div className="fp-page" dangerouslySetInnerHTML={{ __html: bodyHtml }} />;
}
