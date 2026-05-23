// ADDIE route-group layout. Not chromeless — the global SiteNav already
// wraps every route via src/app/layout.tsx, and learners need its primary
// nav to return to the marketing site. We add the section-local AddieNav
// + AddieFooter inside the main column.

import type { ReactNode } from 'react';
import { AddieNav } from '@/components/addie/shell/AddieNav';
import { AddieFooter } from '@/components/addie/shell/AddieFooter';
import { resolveAddieIdentity } from '@/lib/addie/auth/resolveIdentity';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';

export default async function AddieGroupLayout({ children }: { children: ReactNode }) {
  // Cheap signed-in detection — the AddieNav surfaces "Account" vs "Sign in"
  // based on user_id. We synthesize a minimal request-like for cookie reads.
  let signedIn = false;
  try {
    const h = await headers();
    const cookie = h.get('cookie') ?? '';
    if (cookie.includes('sb-') || cookie.includes('supabase-auth')) {
      signedIn = true;
    }
    // Best-effort: resolveAddieIdentity needs a NextRequest; we don't have one
    // in a layout. The cookie sniff above is good enough for the nav label.
    void resolveAddieIdentity;
    void ({} as NextRequest);
  } catch {
    signedIn = false;
  }

  return (
    <div className="bg-[var(--ledger-bg)] min-h-screen text-[var(--ledger-ink)]">
      <AddieNav signedIn={signedIn} />
      <div>{children}</div>
      <AddieFooter />
    </div>
  );
}
