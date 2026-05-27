'use client';

import Link from 'next/link';

export function Paywall() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
        Toolbox
      </p>
      <h1 className="mt-3 text-4xl font-bold leading-tight text-[color:var(--ink)] md:text-5xl">
        Included with any paid course
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-[color:var(--slate-600)]">
        The Toolbox — Skill Builder, Library, multi-provider Playground, and
        Cookbook — is bundled with every paid enrollment in AiBI-Foundation.
        Enroll in the course and your access turns on automatically.
      </p>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/education"
          className="inline-flex items-center justify-center rounded-[12px] bg-[color:var(--ink)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[1.2px] text-white transition-colors hover:bg-[color:var(--ink-2)]"
        >
          BROWSE COURSES
        </Link>
        <Link
          href="/assessment/start"
          className="inline-flex items-center justify-center rounded-[12px] border border-[color:var(--ink-a15)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[1.2px] text-[color:var(--ink)] transition-colors hover:border-[color:var(--ink)]"
        >
          START WITH THE FREE ASSESSMENT
        </Link>
      </div>
    </main>
  );
}
