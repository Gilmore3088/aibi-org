// /dashboard/toolbox/starter — landing for In-Depth Assessment buyers.
//
// Read-only entry point: no Build, Playground, or My Playbooks. Hands the
// reader to the Library and pitches AiBI-P for hands-on access. Separate
// route per the post-launch review (DHH path: split routes over tier
// branching inside one app).

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  getPaidToolboxAccess,
  hasFullToolboxAccess,
  hasStarterToolkitAccess,
} from '@/lib/toolbox/access';
import { Paywall } from '../_components/Paywall';

export const metadata: Metadata = {
  title: 'AI Starter Toolkit | The AI Banking Institute',
  description:
    'Read-only access to the banking AI playbook library, included with your In-Depth AI Readiness Assessment.',
};

export default async function StarterToolkitPage() {
  const access = await getPaidToolboxAccess();
  if (!access) return <Paywall />;

  // Course/toolbox-only buyers get the full app — bounce them home.
  if (hasFullToolboxAccess(access)) {
    redirect('/dashboard/toolbox');
  }

  if (!hasStarterToolkitAccess(access)) {
    return <Paywall />;
  }

  return (
    <main className="min-h-screen bg-[color:var(--color-linen)]">
      <div className="border-b border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)]">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-10">
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
            AI Starter Toolkit
          </p>
          <h1 className="mt-2 font-serif text-4xl leading-tight text-[color:var(--color-ink)] md:text-5xl">
            Your starter toolkit, included with your assessment.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[color:var(--color-slate)]">
            Browse pre-built banking AI playbooks distilled from the AiBI-P
            curriculum. Read-only by design — building, testing in the
            Playground, and saving your own playbooks unlocks with course
            enrollment.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <section className="grid gap-6 md:grid-cols-2">
          <article className="border border-[color:var(--color-ink)]/10 bg-white p-8">
            <p className="font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-terra)]">
              Step 1
            </p>
            <h2 className="mt-2 font-serif text-2xl text-[color:var(--color-ink)]">
              Browse the Library
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-slate)]">
              Forty plus playbooks across credit, deposits, ops, marketing, and
              compliance. Each one is annotated with use case, guardrails, and
              expected output.
            </p>
            <Link
              href="/dashboard/toolbox/library"
              className="mt-6 inline-flex items-center border border-[color:var(--color-terra)] px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)] transition-colors hover:bg-[color:var(--color-terra)] hover:text-white"
            >
              Open Library →
            </Link>
          </article>

          <article className="border border-[color:var(--color-ink)]/10 bg-white p-8">
            <p className="font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-terra)]">
              Step 2
            </p>
            <h2 className="mt-2 font-serif text-2xl text-[color:var(--color-ink)]">
              Re-read your assessment briefing
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-slate)]">
              Your dimension breakdown points to the playbooks worth your time
              first. Match low-scoring dimensions to library categories.
            </p>
            <Link
              href="/dashboard/assessments"
              className="mt-6 inline-flex items-center border border-[color:var(--color-ink)]/30 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-ink)] transition-colors hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)]"
            >
              View assessments →
            </Link>
          </article>
        </section>

        <section className="mt-12 border-l-2 border-[color:var(--color-terra)] bg-[color:var(--color-parch)] p-8">
          <p className="font-serif-sc text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-terra)]">
            When you're ready to build
          </p>
          <h2 className="mt-2 font-serif text-2xl text-[color:var(--color-ink)]">
            AiBI-P unlocks the full toolkit.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[color:var(--color-ink)]/80">
            Course enrollment unlocks the Builder (write your own playbooks),
            the Playground (test against the AIBI API proxy), saved playbooks,
            and Markdown export. Same library, plus the surfaces to make it
            yours.
          </p>
          <Link
            href="/courses/aibi-p/purchase"
            className="mt-6 inline-flex items-center bg-[color:var(--color-terra)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-white transition-colors hover:bg-[color:var(--color-terra-light)]"
          >
            Enroll in AiBI-P
          </Link>
        </section>
      </div>
    </main>
  );
}
