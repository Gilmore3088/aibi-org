import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import { ToolboxApp } from './ToolboxApp';

export const metadata: Metadata = {
  title: 'AI Banking Toolbox | The AI Banking Institute',
  description:
    'A paid-user Toolbox for building, testing, saving, and exporting banking AI skills.',
};

export default async function ToolboxPage() {
  const access = await getPaidToolboxAccess();

  if (!access) {
    redirect('/courses/aibi-p/purchase');
  }

  return (
    <main className="min-h-screen bg-[color:var(--color-linen)]">
      <div className="border-b border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 lg:flex-row lg:items-end lg:justify-between lg:px-10">
          <div>
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
              Paid Learner Toolbox
            </p>
            <h1 className="mt-2 font-serif text-4xl leading-tight text-[color:var(--color-ink)] md:text-5xl">
              Banking AI Toolbox
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--color-slate)]">
              Build durable AI skills, test them through the AIBI API proxy, save them to your account, and export Markdown files for your own repository.
            </p>
          </div>
          <Link
            href="/courses/aibi-p"
            className="inline-flex w-fit items-center border border-[color:var(--color-ink)]/20 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-ink)] transition-colors hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)]"
          >
            Back to coursework
          </Link>
        </div>
      </div>
      <ToolboxApp />
    </main>
  );
}

