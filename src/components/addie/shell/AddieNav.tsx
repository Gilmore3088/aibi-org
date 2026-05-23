// AddieNav — top nav for the Foundation Course (addie) section.
// Sits ABOVE the existing global SiteNav slot but only inside the (addie)
// route group, so it doesn't affect main marketing chrome.

import Link from 'next/link';

interface AddieNavProps {
  readonly courseName?: string;
  readonly signedIn?: boolean;
}

export function AddieNav({ courseName = 'Foundation Course', signedIn = false }: AddieNavProps) {
  return (
    <nav
      aria-label="Foundation Course"
      className="border-b border-[var(--ledger-rule)] bg-[var(--ledger-bg)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <Link
          href="/foundation"
          className="font-mono font-semibold uppercase tracking-[0.18em] text-xs text-[var(--ledger-ink)]"
        >
          The AI Banking Institute · {courseName}
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/foundation/dashboard"
            className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)]"
          >
            Dashboard
          </Link>
          <Link
            href="/foundation/foundation/dashboard/toolbox"
            className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)]"
          >
            Toolbox
          </Link>
          <Link
            href={signedIn ? '/account' : '/auth/login'}
            className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-ink)] hover:underline underline-offset-4"
          >
            {signedIn ? 'Account' : 'Sign in'}
          </Link>
        </div>
      </div>
    </nav>
  );
}
