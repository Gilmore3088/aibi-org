'use client';

import { useMemo, useState } from 'react';
import { getFoundationLabBrief } from '@content/courses/foundation-program';
import type { MicroTakeawayStep, ModuleInteractiveTakeawayProps } from './types';
import { saveInteractiveDraft } from './saveInteractiveDraft';

export function MicroModuleTakeawayBuilder({
  moduleNumber,
  moduleId,
  artifactLabel,
}: ModuleInteractiveTakeawayProps) {
  const brief = getFoundationLabBrief(moduleNumber);
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const steps = useMemo<readonly MicroTakeawayStep[]>(() => {
    if (!brief) return [];
    return [
      { id: 'try', label: 'Try', value: brief.labTask },
      { id: 'build', label: 'Build', value: brief.artifactAction },
      {
        id: 'review',
        label: 'Review',
        value: brief.reviewChecklist[0] ?? brief.learningLoop.feedbackCue,
      },
      { id: 'transfer', label: 'Use at work', value: brief.learningLoop.transferPrompt },
    ];
  }, [brief]);

  if (!brief) return null;

  const selectedSet = new Set(selected);
  const previewLines = steps.filter((step) => selectedSet.has(step.id));
  const complete = steps.length > 0 && selected.length === steps.length;

  const toggle = (id: string) => {
    setSavedAt(null);
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const save = () => {
    if (!complete) return;
    const saved = new Date().toISOString();
    const content = [
      `# Module ${moduleNumber} - ${artifactLabel}`,
      '',
      '## What you built',
      brief.outcome,
      '',
      '## Builder Moves',
      ...steps.map((step) => `- **${step.label}:** ${step.value}`),
      '',
      '## Banking Guardrail',
      brief.referenceLabel,
      '',
      '## Quality Check',
      ...brief.qualitySignals.map((signal) => `- ${signal}`),
    ].join('\n');

    saveInteractiveDraft({
      moduleId,
      moduleNumber,
      model: 'AiBI micro-module takeaway builder',
      dataset: brief.referenceLabel,
      savedAt: saved,
      reviewChecklist: brief.reviewChecklist,
      content,
    });
    setSavedAt(saved);
  };

  return (
    <section
      className="foundation-interactive-takeaway foundation-interactive-takeaway--micro"
      data-testid="foundation-micro-takeaway-builder"
      aria-label={`Module ${moduleNumber} takeaway builder`}
    >
      <div className="foundation-interactive-takeaway__head">
        <div>
          <p className="foundation-kicker">Micro takeaway</p>
          <h3>{artifactLabel}</h3>
          <p>{brief.outcome}</p>
        </div>
        <div className="foundation-score-badge">
          <span>{selected.length}/{steps.length}</span>
          <small>moves</small>
        </div>
      </div>

      <div className="foundation-interactive-takeaway__body foundation-micro-builder">
        <div className="foundation-micro-builder__steps" aria-label="Takeaway moves">
          {steps.map((step) => {
            const active = selectedSet.has(step.id);
            return (
              <button
                key={step.id}
                type="button"
                className={active ? 'is-active' : undefined}
                onClick={() => toggle(step.id)}
                aria-pressed={active}
              >
                <span>{step.label}</span>
                <strong>{step.value}</strong>
              </button>
            );
          })}
        </div>

        <div className="foundation-micro-builder__preview">
          <p className="foundation-kicker">Packet preview</p>
          <h4>{artifactLabel}</h4>
          {previewLines.length > 0 ? (
            <ul>
              {previewLines.map((step) => (
                <li key={step.id}>
                  <span>{step.label}</span>
                  {step.value}
                </li>
              ))}
            </ul>
          ) : (
            <p>Select each move to assemble the packet draft for this module.</p>
          )}
          <div>
            <span>Guardrail</span>
            <strong>{brief.referenceLabel}</strong>
          </div>
        </div>
      </div>

      <div className="foundation-interactive-takeaway__footer">
        <button type="button" onClick={save} disabled={!complete}>
          {savedAt ? 'Saved to packet draft' : complete ? `Save to ${artifactLabel}` : 'Select the four moves'}
        </button>
        <p>
          {complete
            ? 'This takeaway is ready to carry into Build and Save.'
            : 'One action, one artifact, one review rule.'}
        </p>
      </div>
    </section>
  );
}
