import type { Metadata } from 'next';

import '@/styles/mockup.css';
import './hero-options.css';
import HeroOptionsClient from './_client';

export const metadata: Metadata = {
  title: 'Hero options — The AI Banking Institute',
  description: 'Internal preview of candidate homepage hero treatments. Not for external distribution.',
  robots: { index: false, follow: false },
};

export default function HeroOptionsPage(): JSX.Element {
  return <HeroOptionsClient />;
}
