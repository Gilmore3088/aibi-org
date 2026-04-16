// Reviewer dashboard layout — server component.
// Guards the entire /admin/reviewer/ route tree.
// Non-reviewers are redirected to / immediately.

import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { verifyReviewer } from '@/lib/auth/reviewerAuth';

interface ReviewerLayoutProps {
  readonly children: ReactNode;
}

export default async function ReviewerLayout({ children }: ReviewerLayoutProps) {
  const { isReviewer } = await verifyReviewer();

  if (!isReviewer) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <p className="font-sans text-sm text-gray-500">The AI Banking Institute</p>
          <h1
            className="mt-1 font-serif text-2xl font-normal text-gray-900"
            style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)' }}
          >
            Reviewer Dashboard
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
