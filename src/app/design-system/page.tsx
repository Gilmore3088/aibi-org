import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';

import './design-system.css';

export const metadata: Metadata = {
  title: 'Design System — The AI Banking Institute',
  description: 'Internal Ledger design system reference. Not for external distribution.',
  robots: { index: false, follow: false },
};

const bodyHtml = readFileSync(
  path.join(process.cwd(), 'src/app/design-system/_body.html'),
  'utf8',
);

export default function DesignSystemPage(): JSX.Element {
  return <div className="ds-page" dangerouslySetInnerHTML={{ __html: bodyHtml }} />;
}
