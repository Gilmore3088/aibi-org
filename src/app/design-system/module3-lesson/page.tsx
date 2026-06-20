import type { Metadata } from 'next';

import '@/styles/mockup.css';
import './m3.css';
import Module3LessonClient from './_client';

export const metadata: Metadata = {
  title: 'Module 3 lesson — The AI Banking Institute',
  description: 'Internal concept mockup. Not for external distribution.',
  robots: { index: false, follow: false },
};

export default function Module3LessonPage(): JSX.Element {
  return <Module3LessonClient />;
}
