'use client';

// Dashboard layout — wraps every /dashboard/* page in the JourneyShell
// (left rail with the 4-verb spine + main slot). Derives the active verb
// from the pathname so the rail highlights correctly per page.
//
// Plan ref: Plans/refactor-momentum-first-ux-restructure.md §3.3.

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { JourneyShell, type JourneyVerb } from '@/components/JourneyShell';

function pathToVerb(pathname: string): JourneyVerb {
  if (pathname.startsWith('/dashboard/toolbox')) return 'apply';
  if (pathname.startsWith('/dashboard/assessments')) return 'assess';
  if (pathname.startsWith('/dashboard/progression')) return 'learn';
  // /dashboard itself defaults to 'learn' — the dashboard hero leads with
  // the next-lesson card; if you redesign it as a multi-verb landing,
  // change this default.
  return 'learn';
}

export default function DashboardLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  const pathname = usePathname();
  const activeVerb = pathToVerb(pathname ?? '/dashboard');
  return <JourneyShell activeVerb={activeVerb}>{children}</JourneyShell>;
}
