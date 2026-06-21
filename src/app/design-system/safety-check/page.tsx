import type { Metadata } from 'next';

import '@/styles/mockup.css';
import './safety.css';
import SafetyCheckClient from './_client';

export const metadata: Metadata = {
  title: 'Prompt Safety Check — The AI Banking Institute',
  description: 'Internal concept mockup. Not for external distribution.',
  robots: { index: false, follow: false },
};

export default function SafetyCheckPage(): JSX.Element {
  return <SafetyCheckClient />;
}
