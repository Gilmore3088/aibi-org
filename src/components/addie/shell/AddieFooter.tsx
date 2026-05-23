// AddieFooter — minimal footer for the (addie) section. Single rule + legal.

import Link from 'next/link';

export function AddieFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--ledger-rule)] bg-[var(--ledger-bg)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-sm text-[var(--ledger-muted)]">
        <div className="font-mono uppercase tracking-[0.16em] text-[0.7rem]">
          The AI Banking Institute · Foundation Course
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/privacy" className="hover:text-[var(--ledger-ink)]">Privacy</Link>
          <Link href="/terms" className="hover:text-[var(--ledger-ink)]">Terms</Link>
          <Link href="/security" className="hover:text-[var(--ledger-ink)]">Security</Link>
        </div>
      </div>
    </footer>
  );
}
