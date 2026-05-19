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

  return (
    <main className="min-h-screen bg-[color:var(--ledger-bg)]">
      <div className="border-b border-[color:var(--ledger-rule)] bg-[color:var(--ledger-paper)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 lg:flex-row lg:items-end lg:justify-between lg:px-10">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--ledger-accent)]">
              Banking AI Toolbox · Foundation tier
            </p>
            <h1 className="mt-2 font-serif text-4xl leading-tight tracking-[-0.025em] text-[color:var(--ledger-ink)] md:text-5xl">
              The <em className="italic text-[color:var(--ledger-accent)]">Banking AI</em> toolbox.
            </h1>
            <p className="mt-3 max-w-2xl font-serif text-base leading-relaxed text-[color:var(--ledger-ink-2)]">
              Build durable AI skills, test them through the AiBI API proxy, save them to your account, and export Markdown files for your own repository.
            </p>
          </div>
          <Link
            href="/courses/foundation/program"
            className="inline-flex w-fit items-center border border-[color:var(--ledger-rule-strong)] bg-[color:#FAF7EE] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--ledger-ink-2)] transition-colors hover:border-[color:var(--ledger-ink)] hover:text-[color:var(--ledger-ink)]"
          >
            ← Back to coursework
          </Link>
        </div>
        <div className="mx-auto flex max-w-7xl flex-wrap gap-3 px-6 pb-6 lg:px-10">
          <Link
            href="/dashboard/toolbox/library"
            className="inline-flex items-center gap-2 border border-[color:var(--ledger-rule)] bg-[color:#FAF7EE] px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ledger-ink-2)] transition-colors hover:border-[color:var(--ledger-ink)] hover:text-[color:var(--ledger-ink)]"
          >
            Browse Library →
          </Link>
          <Link
            href="/dashboard/toolbox/cookbook"
            className="inline-flex items-center gap-2 border border-[color:var(--ledger-rule)] bg-[color:#FAF7EE] px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ledger-ink-2)] transition-colors hover:border-[color:var(--ledger-ink)] hover:text-[color:var(--ledger-ink)]"
          >
            Cookbook →
          </Link>
        </div>
        <ContextStrip />
      </div>
      <ToolboxApp />
    </main>
  );
}

