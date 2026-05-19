import type { Metadata } from 'next';
import Link from 'next/link';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import { ToolboxApp } from './ToolboxApp';
import { ContextStrip } from './_components/ContextStrip';
import { Paywall } from './_components/Paywall';

export const metadata: Metadata = {
  title: 'AI Banking Toolbox | The AI Banking Institute',
  description:
    'Build, test, save, and export banking AI skills. Included with every paid enrollment.',
};

export default async function ToolboxPage() {
  const access = await getPaidToolboxAccess();

  if (!access) {
    return <Paywall />;
  }

  // The page chrome is intentionally lean — kicker + back link + a pair
  // of quick links to Library/Cookbook. The big H1 / description that
  // used to live here was duplicating each tab's own title (e.g. the
  // "Your toolbox." H2 inside My Toolbox), reading as "toolbox in a
  // toolbox". Per the 2026-05-19 visual review, each tab provides its
  // own surface title; this chrome just frames the section.
  return (
    <main className="min-h-screen bg-[color:var(--ledger-bg)]">
      <div className="border-b border-[color:var(--ledger-rule)] bg-[color:var(--ledger-paper)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4 lg:px-10">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--ledger-accent)]">
            Banking AI Toolbox · Foundation tier
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/toolbox/library"
              className="inline-flex items-center gap-2 border border-[color:var(--ledger-rule)] bg-[color:#FAF7EE] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ledger-ink-2)] transition-colors hover:border-[color:var(--ledger-ink)] hover:text-[color:var(--ledger-ink)]"
            >
              Library →
            </Link>
            <Link
              href="/dashboard/toolbox/cookbook"
              className="inline-flex items-center gap-2 border border-[color:var(--ledger-rule)] bg-[color:#FAF7EE] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ledger-ink-2)] transition-colors hover:border-[color:var(--ledger-ink)] hover:text-[color:var(--ledger-ink)]"
            >
              Cookbook →
            </Link>
            <Link
              href="/courses/foundation/program"
              className="inline-flex items-center border border-[color:var(--ledger-rule-strong)] bg-[color:#FAF7EE] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--ledger-ink-2)] transition-colors hover:border-[color:var(--ledger-ink)] hover:text-[color:var(--ledger-ink)]"
            >
              ← Coursework
            </Link>
          </div>
        </div>
        <ContextStrip />
      </div>
      <ToolboxApp />
    </main>
  );
}

