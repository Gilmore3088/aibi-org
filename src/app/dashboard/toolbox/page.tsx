import type { Metadata } from 'next';
import Link from 'next/link';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import { ToolboxApp } from './ToolboxApp';
import { ContextStrip } from './_components/ContextStrip';
import { Paywall } from './_components/Paywall';

export const metadata: Metadata = {
  title: 'AI Banking Toolbox | The AI Banking Institute',
  description:
    'Build, test, save, and export banking AI prompts. Included with every paid enrollment.',
};

export default async function ToolboxPage() {
  const access = await getPaidToolboxAccess();

  if (!access) {
    return <Paywall />;
  }

  // The page chrome is intentionally lean — kicker + quick links to
  // Library/Cookbook + a back link to the course. Each tab inside ToolboxApp
  // renders its own surface heading, so this chrome only frames the section.
  return (
    <main className="mockup-scope min-h-screen bg-[color:var(--cream)]">
      <div className="border-b border-[color:var(--ink-a10)] bg-[color:var(--cream)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4 lg:px-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--gold-deep)]">
            Banking AI Toolbox · Foundation tier
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/toolbox/library"
              className="inline-flex items-center gap-2 rounded-[12px] border border-[color:var(--ink-a10)] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--ink)] transition-colors hover:border-[color:var(--gold)] hover:text-[color:var(--gold-deep)]"
            >
              LIBRARY →
            </Link>
            <Link
              href="/dashboard/toolbox/cookbook"
              className="inline-flex items-center gap-2 rounded-[12px] border border-[color:var(--ink-a10)] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--ink)] transition-colors hover:border-[color:var(--gold)] hover:text-[color:var(--gold-deep)]"
            >
              COOKBOOK →
            </Link>
            <Link
              href="/courses/foundation/program"
              className="inline-flex items-center rounded-[12px] border border-[color:var(--ink-a15)] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--ink)] transition-colors hover:border-[color:var(--ink)]"
            >
              ← COURSEWORK
            </Link>
          </div>
        </div>
        <ContextStrip />
      </div>
      <ToolboxApp />
    </main>
  );
}
