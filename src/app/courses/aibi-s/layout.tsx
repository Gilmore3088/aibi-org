import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

interface LayoutProps {
  readonly children: ReactNode;
}

export default function AiBISLockedLayout({ children: _children }: LayoutProps) {
  notFound();
}
