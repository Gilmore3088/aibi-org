'use client';

import Link from 'next/link';

export function Paywall() {
  return (
    <main className="mockup-scope min-h-screen bg-[color:var(--cream)] px-6 py-16">
      <section className="mx-auto max-w-5xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
        Toolbox preview
      </p>
      <h1 className="mt-3 text-4xl font-bold leading-tight text-[color:var(--ink)] md:text-5xl">
        Reusable banking AI assets live here.
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[color:var(--slate-600)]">
        Preview the Library, AiBI Lab, and saved-asset flow. Full Toolbox access
        is included with the paid In-Depth Assessment and the AiBI-Foundation
        course, so buyers can build, run, save, and export reusable work.
      </p>
      <div className="mt-8 grid gap-3 border-y border-[color:var(--ink-a10)] py-5 sm:grid-cols-3">
        {[
          ['Library', 'Start from banker-vetted prompts and playbooks.'],
          ['AiBI Lab', 'Test against sample facts with approved model options.'],
          ['My Toolbox', 'Save trusted versions as reusable templates.'],
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
      <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="border border-[color:var(--ink-a10)] bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--gold-deep)]">
            Preview flow
          </p>
          <ol className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ['01', 'Choose a banking-safe starter.'],
              ['02', 'Run it with sample facts.'],
              ['03', 'Save the reviewed asset.'],
            ].map(([step, body]) => (
              <li key={step} className="border border-[color:var(--ink-a10)] bg-[color:var(--cream)] p-4">
                <p className="text-[11px] font-black text-[color:var(--gold-deep)]">{step}</p>
                <p className="mt-2 text-sm font-bold leading-snug text-[color:var(--ink)]">{body}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="border border-[color:var(--ink)] bg-[color:var(--ink)] p-5 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--gold)]">
            Unlocks with paid access
          </p>
          <p className="mt-3 text-2xl font-bold leading-tight">
            Build, AiBI Lab, save, and export.
          </p>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-white/70">
            Free visitors can see the workflow. Paid assessment and course users
            can use the live builders.
          </p>
        </div>
      </div>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/assessment/in-depth"
          className="inline-flex items-center justify-center rounded-[12px] bg-[color:var(--ink)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[1.2px] text-white transition-colors hover:bg-[color:var(--ink-2)]"
        >
          UNLOCK WITH IN-DEPTH
        </Link>
        <Link
          href="/courses"
          className="inline-flex items-center justify-center rounded-[12px] border border-[color:var(--ink-a15)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[1.2px] text-[color:var(--ink)] transition-colors hover:border-[color:var(--ink)]"
        >
          VIEW FOUNDATION COURSE
        </Link>
      </div>
      </section>
    </main>
  );
}
