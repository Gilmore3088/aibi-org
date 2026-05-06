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

  const isStarter = access.tier === 'starter';

  return (
    <main className="min-h-screen bg-[color:var(--color-linen)]">
      <div className="border-b border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 lg:flex-row lg:items-end lg:justify-between lg:px-10">
          <div>
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
              {isStarter ? 'AI Starter Toolkit' : 'Paid Learner Toolbox'}
            </p>
            <h1 className="mt-2 font-serif text-4xl leading-tight text-[color:var(--color-ink)] md:text-5xl">
              Banking AI Toolbox
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--color-slate)]">
              {isStarter
                ? 'Browse the curated banking-AI skill library. Save, test, and export are reserved for AiBI-P enrollees.'
                : 'Build durable AI skills, test them through the AIBI API proxy, save them to your account, and export Markdown files for your own repository.'}
            </p>
          </div>
          <Link
            href={isStarter ? '/courses/aibi-p' : '/courses/aibi-p'}
            className="inline-flex w-fit items-center border border-[color:var(--color-ink)]/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-ink)] transition-colors hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)]"
          >
            {isStarter ? 'Upgrade to AiBI-P' : 'Back to coursework'}
          </Link>
        </div>
        {isStarter && (
          <div className="border-t border-[color:var(--color-ink)]/10 bg-[color:var(--color-linen)]">
            <div className="mx-auto max-w-7xl px-6 py-3 lg:px-10">
              <p className="font-sans text-sm text-[color:var(--color-ink)]/80">
                <span className="font-serif-sc text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mr-2">
                  Starter
                </span>
                Read-only library access from your In-Depth Assessment purchase.{' '}
                <Link
                  href="/courses/aibi-p"
                  className="text-[color:var(--color-terra)] hover:text-[color:var(--color-terra-light)] underline"
                >
                  Enroll in AiBI-P
                </Link>{' '}
                to build, test, save, and export your own skills.
              </p>
            </div>
          </div>
        )}
        <div className="mx-auto max-w-7xl px-6 pb-6 lg:px-10">
          <Link
            href="/dashboard/toolbox/library"
            className="inline-flex items-center gap-2 border border-[color:var(--color-ink)]/15 bg-white px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-ink)] transition-colors hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)]"
          >
            Browse Library →
          </Link>
        </div>
        <ContextStrip />
      </div>
      <ToolboxApp tier={access.tier} />
    </main>
  );
}

