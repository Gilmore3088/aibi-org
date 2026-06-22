import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getSupportAdminSession } from '@/lib/support/auth';
import './support.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Support Ops',
  robots: { index: false, follow: false },
};

export default async function SupportAdminLayout({ children }: { children: ReactNode }) {
  const headerList = await headers();
  const nextPath = headerList.get('x-pathname') ?? '/admin/support';
  const session = await getSupportAdminSession();

  if (!session.ok) {
    if (session.reason === 'unauthenticated' || session.reason === 'supabase_not_configured') {
      redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`);
    }
    if (session.reason === 'untrusted_device') {
      redirect(`/auth/confirm-device-pending?email=${encodeURIComponent(session.email ?? '')}`);
    }
    notFound();
  }

  return (
    <div className="support-admin">
      <header className="support-admin__top">
        <div>
          <p className="support-admin__eyebrow">Private admin</p>
          <h1>Support Ops</h1>
        </div>
        <div className="support-admin__identity">
          <span>{session.user.email}</span>
        </div>
      </header>
      <nav className="support-admin__nav" aria-label="Support admin">
        <Link href="/admin/support">Queue</Link>
        <Link href="/admin/support/search">Search</Link>
        <a href="/api/admin/support/export.csv?range=30d">Export CSV</a>
      </nav>
      {children}
    </div>
  );
}
