'use client';

import Link from 'next/link';
import { useEffect } from 'react';

// window.plausible is typed in src/types/plausible.d.ts and queue-initialized
// in src/app/layout.tsx — we just call through the typed global here.

export function Paywall() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.plausible === 'function') {
      window.plausible('toolbox_paywall_shown', { props: { source: 'direct' } });
    }
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
        Banking AI Playbooks
      </p>
      <h1 className="mt-3 font-serif text-4xl text-[color:var(--color-ink)] md:text-5xl">
        Included with any paid course
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-[color:var(--color-ink)]/80">
        Banking AI Playbooks — Skill Builder, Template Library, multi-provider
        Playground, and Recipes — are bundled with every paid enrollment in
        AiBI-P, AiBI-S, or AiBI-L. Enroll in any course and your access
        turns on automatically.
      </p>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/education"
          className="inline-flex items-center justify-center rounded-[2px] bg-[color:var(--color-terra)] px-6 py-3 font-sans text-[11px] font-semibold uppercase tracking-[1.2px] text-[color:var(--color-linen)] hover:bg-[color:var(--color-terra-light)]"
        >
          Browse Courses
        </Link>
        <Link
          href="/assessment/start"
          className="inline-flex items-center justify-center rounded-[2px] border border-[color:var(--color-ink)]/20 px-6 py-3 font-sans text-[11px] font-semibold uppercase tracking-[1.2px] text-[color:var(--color-ink)] hover:border-[color:var(--color-ink)]/40"
        >
          Start with the free assessment
        </Link>
      </div>
    </main>
  );
}
