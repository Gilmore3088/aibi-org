import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

interface WorkshopLayoutProps {
  readonly children: ReactNode;
}

export default function AiBILLockedLayout({ children: _children }: WorkshopLayoutProps) {
  notFound();
}
