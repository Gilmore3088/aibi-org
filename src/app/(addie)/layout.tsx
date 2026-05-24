// ADDIE route-group layout. Wraps every /foundation/* route with the
// addie-course-surface CSS scope, the sticky AddieNav, the AddieSurface
// client enabler (reveal-on-scroll + reading progress), and the footer.

import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { AddieNav } from '@/components/addie/shell/AddieNav';
import { AddieFooter } from '@/components/addie/shell/AddieFooter';
import { AddieSurface } from '@/components/addie/shell/AddieSurface';

export default async function AddieGroupLayout({ children }: { children: ReactNode }) {
  // Cheap signed-in detection for the nav label only. Authoritative
  // session checks happen in pages/route-handlers via createServerClient.
  let signedIn = false;
  try {
    const h = await headers();
    const cookie = h.get('cookie') ?? '';
    if (cookie.includes('sb-') || cookie.includes('supabase-auth')) {
      signedIn = true;
    }
  } catch {
    signedIn = false;
  }

  return (
    <div className="addie-course-surface bg-[var(--ledger-bg)] min-h-screen text-[var(--ledger-ink)]">
      <AddieSurface readingProgress />
      <AddieNav signedIn={signedIn} />
      <div>{children}</div>
      <AddieFooter />
    </div>
  );
}
