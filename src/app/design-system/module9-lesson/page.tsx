import type { Metadata } from 'next';

import '@/styles/mockup.css';
import './m9.css';
import Module9LessonClient from './_client';

export const metadata: Metadata = {
  title: 'Module 9 lesson — The AI Banking Institute',
  description: 'Internal concept mockup. Not for external distribution.',
  robots: { index: false, follow: false },
};

export default function Module9LessonPage(): JSX.Element {
  return <Module9LessonClient />;
}
