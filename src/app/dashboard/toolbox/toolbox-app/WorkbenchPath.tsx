'use client';

import type { TabId } from './types';

export function WorkbenchPath({
  activeTab,
  savedCount,
  activeSkillName,
  onOpenLibrary,
  onOpenPlayground,
  onOpenToolbox,
}: {
  readonly activeTab: TabId;
  readonly savedCount: number;
  readonly activeSkillName: string | null;
  readonly onOpenLibrary: () => void;
  readonly onOpenPlayground: () => void;
  readonly onOpenToolbox: () => void;
}) {
  const activeStep =
    activeTab === 'playground' && activeSkillName
      ? 'run'
      : activeTab === 'toolbox'
        ? 'save'
        : 'choose';
  const nextMove =
    activeTab === 'library'
      ? 'Run one starter with sample facts.'
      : activeTab === 'playground'
        ? activeSkillName
          ? 'Review the output, then save the trusted version.'
          : 'Choose a Library playbook first.'
        : activeTab === 'toolbox'
          ? savedCount > 0
            ? 'Re-run, export, or improve a saved asset.'
            : 'Start from the Library to save your first asset.'
          : 'Start in the Library.';

  const steps = [
    {
      id: 'choose',
      label: 'Choose',
      title: 'Library playbook',
      detail: 'Pick a banking-safe starter.',
      active: activeStep === 'choose',
      action: onOpenLibrary,
      disabled: false,
    },
    {
      id: 'run',
      label: 'Run',
      title: 'AiBI Lab',
      detail: activeSkillName
        ? `Testing: ${activeSkillName}`
        : 'Use sample facts only.',
      active: activeStep === 'run',
      action: onOpenPlayground,
      disabled: false,
    },
    {
      id: 'save',
      label: 'Save',
      title: 'My Toolbox',
      detail: savedCount > 0 ? `${savedCount} reusable asset${savedCount === 1 ? '' : 's'}` : 'Keep the trusted version.',
      active: activeStep === 'save',
      action: onOpenToolbox,
      disabled: false,
    },
  ] as const;

  return (
    <section
      aria-label="Toolbox workflow"
      className="mb-8 border-y border-[color:var(--ink-a10)] bg-white/55 py-4"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[0.625rem] font-bold uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
            Current workflow
          </p>
          <p className="mt-1 text-lg font-bold leading-snug text-[color:var(--ink)]">
            {nextMove}
          </p>
        </div>
        <ol className="grid min-w-0 flex-1 gap-2 sm:grid-cols-3 lg:max-w-3xl">
          {steps.map((step, index) => (
            <li key={step.id}>
              <button
                type="button"
                onClick={step.action}
                disabled={step.disabled}
                aria-current={step.active ? 'step' : undefined}
                className={`grid h-full w-full grid-cols-[34px_minmax(0,1fr)] items-center gap-3 border px-3 py-3 text-left transition-colors ${
                  step.active
                    ? 'border-[color:var(--ink)] bg-[color:var(--ink)] text-white'
                    : 'border-[color:var(--ink-a10)] bg-[color:var(--cream)] text-[color:var(--ink)] hover:border-[color:var(--gold-deep)]'
                } ${step.disabled ? 'cursor-not-allowed opacity-55 hover:border-[color:var(--ink-a10)]' : ''}`}
              >
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full text-[0.6875rem] font-black tabular-nums ${
                    step.active
                      ? 'bg-[color:var(--gold)] text-[color:var(--ink)]'
                      : 'bg-white text-[color:var(--gold-deep)]'
                  }`}
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.625rem] font-black uppercase tracking-[0.16em]">
                    {step.label}
                  </span>
                  <span className="mt-1 block truncate text-sm font-bold">
                    {step.title}
                  </span>
                  <span
                    className={`mt-0.5 block truncate text-xs font-semibold ${
                      step.active ? 'text-white/70' : 'text-[color:var(--slate-500)]'
                    }`}
                  >
                    {step.detail}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
