import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';

import './user-home.css';

export const metadata: Metadata = {
  title: 'Home — The AI Banking Institute',
  description: 'Internal user home reference. Not for external distribution.',
  robots: { index: false, follow: false },
};

const bodyHtml = readFileSync(
  path.join(process.cwd(), 'src/app/user-home/_body.html'),
  'utf8',
);

export default function UserHomePage(): JSX.Element {
  return <div className="uh-page" dangerouslySetInnerHTML={{ __html: bodyHtml }} />;
}
