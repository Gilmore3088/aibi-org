'use client';

import Link from 'next/link';

export function Paywall() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
        Toolbox
      </p>
      <h1 className="mt-3 text-4xl font-bold leading-tight text-[color:var(--ink)] md:text-5xl">
        Reusable banking AI assets live here.
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-[color:var(--slate-600)]">
        The Foundation Packet proves what you built in the course. The Toolbox
        is where tested prompts, playbooks, and reusable workflows live after
        you run them through the AiBI Lab. Access is included with every paid
        AiBI-Foundation enrollment.
      </p>
      <div className="mt-8 grid gap-3 border-y border-[color:var(--ink-a10)] py-5 sm:grid-cols-3">
        {[
          ['Library', 'Start from banker-vetted playbooks.'],
          ['AiBI Lab', 'Test with sample facts and selected models.'],
          ['My Toolbox', 'Save trusted, reusable versions.'],
        ].map(([label, body]) => (
          <div key={label}>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--gold-deep)]">
              {label}
            </p>
            <p className="mt-2 text-sm font-semibold leading-snug text-[color:var(--slate-600)]">
              {body}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/courses"
          className="inline-flex items-center justify-center rounded-[12px] bg-[color:var(--ink)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[1.2px] text-white transition-colors hover:bg-[color:var(--ink-2)]"
        >
          BROWSE COURSES
        </Link>
        <Link
          href="/assessment/take"
          className="inline-flex items-center justify-center rounded-[12px] border border-[color:var(--ink-a15)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[1.2px] text-[color:var(--ink)] transition-colors hover:border-[color:var(--ink)]"
        >
          START WITH THE FREE ASSESSMENT
        </Link>
      </div>
    </main>
  );
}
