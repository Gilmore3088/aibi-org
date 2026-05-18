import type { Metadata } from 'next';

// Internal redesign checklist — not for public consumption.
export const metadata: Metadata = {
  title: 'Redesign checklist (internal)',
  robots: { index: false, follow: false },
};

export default function RedesignChecklistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
