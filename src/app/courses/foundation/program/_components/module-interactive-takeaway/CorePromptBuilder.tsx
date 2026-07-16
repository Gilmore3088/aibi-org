'use client';

import { useState } from 'react';
import { WIZARD_SCENARIOS, type CoreKey } from '../../_lib/promptWizardData';
import type { DraftPayload, ModuleInteractiveTakeawayProps } from './types';
import { saveInteractiveDraft } from './saveInteractiveDraft';

const CORE_PROMPT_COPY: Record<CoreKey, string> = {
  context: 'You are a branch banking assistant helping a teller answer a member.',
  objective: 'Tell me whether this $12 Basic Checking service fee can be waived.',
  resources: 'Use only the approved fee-waiver policy excerpt. If the policy does not cover it, say so.',
  expectations: 'Answer in 2-3 plain sentences and flag anything needing banker approval.',
};

export function UnusedCorePromptBuilder({ moduleId, artifactLabel }: Pick<ModuleInteractiveTakeawayProps, 'moduleId' | 'artifactLabel'>) {
  const scenario = WIZARD_SCENARIOS[0];
  const [activeKeys, setActiveKeys] = useState<ReadonlySet<CoreKey>>(
    () => new Set<CoreKey>(['context', 'objective']),
  );
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const score = scenario.elements.filter((element) => activeKeys.has(element.key)).length;
  const complete = score === scenario.elements.length;

  function toggle(key: CoreKey) {
    setSavedAt(null);
    setActiveKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const promptText = scenario.elements
    .filter((element) => activeKeys.has(element.key))
    .map((element) => CORE_PROMPT_COPY[element.key])
    .join('\n\n');
  const answerText = scenario.elements
    .map((element) => (activeKeys.has(element.key) ? element.good : element.bad))
    .join(' ');

  function save() {
    const saved = new Date().toISOString();
    const content = `# CORE prompt card\n\n## Use case\n${scenario.memberQuestion}\n\n## Prompt\n${promptText}\n\n## Source\n${scenario.sourceLabel}: ${scenario.sourceMaterial}\n\n## Review note\nCORE ${score}/4. ${complete ? scenario.winLine : 'Missing CORE elements must be added before reuse.'}\n\n## Model preview\n${answerText}`;
    const payload: DraftPayload = {
      moduleId,
      moduleNumber: 3,
      model: 'AiBI CORE prompt builder',
      dataset: scenario.title,
      savedAt: saved,
      reviewChecklist: ['Task is specific', 'Sensitive data is represented by placeholders', 'Escalation or review rule is included'],
      content,
    };
    saveInteractiveDraft(payload);
    setSavedAt(saved);
  }

  return (
    <section className="foundation-interactive-takeaway" data-testid="foundation-core-builder">
      <div className="foundation-interactive-takeaway__head">
        <div>
          <p className="foundation-interactive-takeaway__eyebrow">Build the reusable tool</p>
          <h3>CORE Prompt Builder</h3>
          <p>Toggle the missing prompt parts and watch the answer improve before you save it.</p>
        </div>
        <span className="foundation-interactive-score">CORE {score}/4</span>
      </div>

      <div className="foundation-core-builder__workspace">
        <div className="foundation-core-builder__toggles" aria-label="CORE prompt parts">
          {scenario.elements.map((element) => {
            const active = activeKeys.has(element.key);
            return (
              <button
                key={element.key}
                type="button"
                aria-pressed={active}
                className="foundation-core-toggle"
                onClick={() => toggle(element.key)}
              >
                <span>{element.label}</span>
                <small>{active ? element.oneLiner : element.missingHint}</small>
              </button>
            );
          })}
        </div>

        <div className="foundation-core-builder__preview">
          <div className="foundation-tool-panel">
            <p className="foundation-tool-panel__label">Your prompt</p>
            <pre>{promptText || 'Select CORE parts to assemble the prompt.'}</pre>
          </div>
          <div className={`foundation-tool-panel foundation-tool-panel--${complete ? 'good' : score >= 3 ? 'warn' : 'bad'}`}>
            <p className="foundation-tool-panel__label">
              Simulated answer - {complete ? 'Grounded' : score >= 3 ? 'Close' : 'Risky'}
            </p>
            <p>{answerText}</p>
          </div>
        </div>
      </div>

      <div className="foundation-interactive-takeaway__footer">
        <button type="button" onClick={save} disabled={!complete}>
          {savedAt ? 'Saved to packet draft' : complete ? `Save to ${artifactLabel}` : 'Add all CORE parts to save'}
        </button>
        <p>{complete ? scenario.winLine : 'The answer should visibly fail until the source and review rule are present.'}</p>
      </div>
    </section>
  );
}
