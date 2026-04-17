'use client';

// MiniTutorial — step-by-step tutorial component with numbered steps,
// embedded prompt card, screenshot placeholders, and callout sections.
// Designed for the AiBI-P "First Try" and "Starter Skill" tutorials.

import type { MiniTutorial as MiniTutorialData } from '@content/courses/aibi-p/prompt-library';
import { PLATFORM_META } from '@content/courses/aibi-p/prompt-library';
import { PromptCard } from './PromptCard';

interface MiniTutorialProps {
  readonly tutorial: MiniTutorialData;
}

export function MiniTutorial({ tutorial }: MiniTutorialProps) {
  const platformMeta = PLATFORM_META[tutorial.platform];

  return (
    <article className="border border-[color:var(--color-parch-dark)] rounded-sm bg-[color:var(--color-linen)] overflow-hidden">
      {/* Tutorial header */}
      <div className="bg-[color:var(--color-parch)] px-6 py-5 border-b border-[color:var(--color-parch-dark)]">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest rounded-sm text-[color:var(--color-linen)]"
            style={{ backgroundColor: platformMeta.colorVar }}
          >
            {platformMeta.label}
          </span>
          <span className="font-mono text-[11px] text-[color:var(--color-slate)]">
            {tutorial.timeEstimate}
          </span>
        </div>
        <h3 className="font-serif text-xl font-bold text-[color:var(--color-ink)] leading-snug">
          {tutorial.title}
        </h3>
        <p className="font-sans text-sm text-[color:var(--color-ink)]/80 mt-2 leading-relaxed">
          {tutorial.introduction}
        </p>
      </div>

      {/* Steps */}
      <div className="px-6 py-6 space-y-6">
        <ol className="space-y-6">
          {tutorial.steps.map((step) => (
            <li key={step.stepNumber} className="flex gap-4">
              {/* Step number circle */}
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm font-bold text-[color:var(--color-linen)]"
                style={{ backgroundColor: 'var(--color-terra)' }}
                aria-hidden="true"
              >
                {step.stepNumber}
              </div>

              <div className="flex-1 space-y-2">
                <p className="font-sans text-sm font-semibold text-[color:var(--color-ink)]">
                  {step.instruction}
                </p>
                {step.detail && (
                  <p className="font-sans text-sm text-[color:var(--color-ink)]/80 leading-relaxed">
                    {step.detail}
                  </p>
                )}

                {/* Screenshot placeholder */}
                {step.screenshotPlaceholder && (
                  <div className="mt-3 border border-dashed border-[color:var(--color-parch-dark)] rounded-sm bg-[color:var(--color-parch)] px-4 py-6 text-center">
                    <p className="font-mono text-[11px] text-[color:var(--color-slate)] uppercase tracking-widest">
                      [{step.screenshotPlaceholder}]
                    </p>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>

        {/* Embedded prompt */}
        <div className="pt-4 border-t border-[color:var(--color-parch-dark)]">
          <p className="text-[11px] font-mono uppercase tracking-widest text-[color:var(--color-slate)] mb-3">
            The prompt
          </p>
          <PromptCard prompt={tutorial.prompt} />
        </div>
      </div>

      {/* Callout sections */}
      <div className="px-6 pb-6 space-y-4">
        {/* What went well */}
        <div
          className="rounded-sm px-5 py-4 border-l-4"
          style={{ borderColor: 'var(--color-sage)', backgroundColor: 'var(--color-parch)' }}
        >
          <p className="text-[11px] font-mono uppercase tracking-widest text-[color:var(--color-sage)] mb-2">
            What went well
          </p>
          <p className="font-sans text-sm text-[color:var(--color-ink)] leading-relaxed">
            {tutorial.whatWentWell}
          </p>
        </div>

        {/* What to watch for */}
        <div
          className="rounded-sm px-5 py-4 border-l-4"
          style={{ borderColor: 'var(--color-terra)', backgroundColor: 'var(--color-parch)' }}
        >
          <p className="text-[11px] font-mono uppercase tracking-widest text-[color:var(--color-terra)] mb-2">
            What to watch for
          </p>
          <p className="font-sans text-sm text-[color:var(--color-ink)] leading-relaxed">
            {tutorial.whatToWatchFor}
          </p>
        </div>
      </div>
    </article>
  );
}
