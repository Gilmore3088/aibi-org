'use client';

import Link from 'next/link';
import type { ToolboxSkillTemplate } from '@/lib/toolbox/types';
import { ToolboxQualityLadder } from '../_components/ToolboxQualityLadder';
import type { TabId } from './types';

export function GuidePanel({
  savedCount,
  starter,
  setTab,
  onStartMission,
}: {
  readonly savedCount: number;
  readonly starter: ToolboxSkillTemplate | null;
  readonly setTab: (tab: TabId) => void;
  readonly onStartMission: () => void;
}) {
  const missionSteps = [
    ['Load', starter?.name ?? 'Regulatory Exam Preparation'],
    ['Run', 'Use the built-in exam sample.'],
    ['Review', 'Mark one evidence gap or edit.'],
    ['Save', 'Keep the trusted version.'],
  ] as const;
  const proofPoints = [
    ['Library', 'Banking-safe starters'],
    ['AiBI Lab', 'Sample facts only'],
    ['My Toolbox', 'Reusable version'],
  ] as const;
  const workDestinations = [
    ['Foundation Packet', 'Module artifacts you submit as proof of learning.'],
    ['My Toolbox', 'Reusable prompts and playbooks after you test them.'],
  ] as const;

  return (
    <section className="py-6 text-[color:var(--ink)]" aria-labelledby="toolbox-guide-heading">
      <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <div>
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.22em] text-[color:var(--gold-deep)]">
            Start here · First 10 minutes
          </p>
          <h1
            id="toolbox-guide-heading"
            className="mt-3 max-w-2xl text-4xl leading-[0.98] tracking-[-0.035em] text-[color:var(--ink)] md:text-6xl"
          >
            Run one workflow. Save one reusable asset.
          </h1>
          <p className="mt-5 max-w-xl text-base font-semibold leading-relaxed text-[color:var(--slate-600)]">
            The course builds judgment. The Toolbox turns inspected prompts and playbooks into assets you can run again.
          </p>
          <div className="mt-5 grid max-w-xl grid-cols-2 gap-2">
            {workDestinations.map(([label, body]) => (
              <div
                key={label}
                className="border border-[color:var(--ink-a10)] bg-white px-3 py-3 sm:px-4"
              >
                <p className="text-[0.625rem] font-black uppercase tracking-[0.18em] text-[color:var(--gold-deep)]">
                  {label}
                </p>
                <p className="mt-1 text-xs font-bold leading-snug text-[color:var(--ink)] sm:text-sm">
                  {body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onStartMission}
              className="min-h-[44px] bg-[color:var(--gold-deep)] px-6 py-3 text-[0.625rem] font-black uppercase tracking-[0.18em] text-[color:var(--cream)] transition-colors hover:bg-[color:var(--ink)]"
            >
              Start guided run
            </button>
            <button
              type="button"
              onClick={() => setTab('toolbox')}
              className="min-h-[44px] border border-[color:var(--ink-a15)] px-6 py-3 text-[0.625rem] font-black uppercase tracking-[0.18em] text-[color:var(--ink)] transition-colors hover:border-[color:var(--ink)]"
            >
              My Toolbox {savedCount > 0 ? `(${savedCount})` : ''}
            </button>
          </div>
        </div>

        <div className="border border-[color:var(--ink)] bg-white">
          <div className="grid gap-5 border-b border-[color:var(--ink-a10)] p-5 md:grid-cols-[minmax(0,1fr)_180px] md:items-center">
            <div>
              <p className="text-[0.625rem] font-black uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
                Guided mission
              </p>
              <h2 className="mt-2 text-3xl leading-tight tracking-[-0.03em] text-[color:var(--ink)]">
                {starter?.name ?? 'Regulatory Exam Preparation'}
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-[color:var(--slate-600)]">
                Start with a fabricated exam scenario, inspect the output, and save a reusable version.
              </p>
            </div>
            <div className="bg-[color:var(--ink)] px-4 py-3 text-[color:var(--cream)]">
              <p className="text-[0.625rem] font-black uppercase tracking-[0.18em] text-[color:var(--gold)]">
                Current proof
              </p>
              <p className="mt-1 text-3xl font-black leading-none tracking-[-0.03em]">
                {savedCount}
              </p>
              <p className="mt-1 text-xs font-bold text-white/70">
                saved asset{savedCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <ol className="grid grid-cols-2 gap-0 md:grid-cols-4">
            {missionSteps.map(([label, body], index) => (
              <li
                key={label}
                className="grid min-h-[104px] gap-2 border-b border-r border-[color:var(--ink-a10)] p-3 even:border-r-0 md:block md:min-h-[132px] md:border-b-0 md:border-r md:p-4 md:last:border-r-0"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--cream)] text-[0.6875rem] font-black tabular-nums text-[color:var(--gold-deep)] md:mb-4 md:h-9 md:w-9 md:text-xs">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <span className="block text-[0.625rem] font-black uppercase tracking-[0.18em] text-[color:var(--gold-deep)]">
                    {label}
                  </span>
                  <span className="mt-1 block text-xs font-bold leading-snug text-[color:var(--ink)] md:mt-2 md:text-sm">
                    {body}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <ToolboxQualityLadder className="mt-8" />

      <div className="mt-8 grid grid-cols-3 gap-2 border-y border-[color:var(--ink-a10)] py-5 md:gap-3">
        {proofPoints.map(([label, body]) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              if (label === 'Library') setTab('library');
              if (label === 'AiBI Lab') setTab('playground');
              if (label === 'My Toolbox') setTab('toolbox');
            }}
            className="min-h-[68px] border border-[color:var(--ink-a10)] bg-[color:var(--cream)] px-3 py-3 text-left transition-colors hover:border-[color:var(--gold-deep)] md:min-h-[88px] md:px-4"
          >
            <span className="block text-[0.5625rem] font-black uppercase tracking-[0.14em] text-[color:var(--gold-deep)] md:text-[0.625rem] md:tracking-[0.18em]">
              {label}
            </span>
            <span className="mt-1 block text-xs font-bold leading-snug text-[color:var(--slate-600)] md:mt-2 md:text-sm md:leading-relaxed">
              {body}
            </span>
          </button>
        ))}
      </div>

      <aside className="mt-6 border-l-4 border-[color:var(--gold)] bg-[color:var(--cream)] px-5 py-4">
        <p className="text-[0.6875rem] uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
          Need an example?
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--slate-500)]">
          The Cookbook shows one complete workflow with the prompt, model output, review notes, and gotchas.
        </p>
        <Link
          href="/dashboard/toolbox/cookbook"
          className="mt-4 inline-block text-[0.625rem] uppercase tracking-widest text-[color:var(--gold-deep)] border-b border-[color:var(--gold-deep)] hover:text-[color:var(--ink)] hover:border-[color:var(--ink)]"
        >
          Read the Cookbook →
        </Link>
      </aside>
    </section>
  );
}
