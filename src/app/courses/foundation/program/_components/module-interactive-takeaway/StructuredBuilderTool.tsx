'use client';

import { useState } from 'react';
import type {
  DraftPayload,
  ModuleInteractiveTakeawayProps,
  StructuredBuilderConfig,
} from './types';
import { saveInteractiveDraft } from './saveInteractiveDraft';

export function UnusedStructuredBuilderTool({
  moduleId,
  artifactLabel,
  config,
}: Pick<ModuleInteractiveTakeawayProps, 'moduleId' | 'artifactLabel'> & {
  readonly config: StructuredBuilderConfig;
}) {
  const [activeMoves, setActiveMoves] = useState<ReadonlySet<string>>(
    () => new Set<string>([config.moves[0]?.id ?? '']),
  );
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const score = config.moves.filter((move) => activeMoves.has(move.id)).length;
  const complete = score === config.moves.length;
  const previewLines = config.moves.map((move) => ({
    ...move,
    active: activeMoves.has(move.id),
  }));

  function toggle(moveId: string) {
    setSavedAt(null);
    setActiveMoves((current) => {
      const next = new Set(current);
      if (next.has(moveId)) {
        next.delete(moveId);
      } else {
        next.add(moveId);
      }
      return next;
    });
  }

  function save() {
    const saved = new Date().toISOString();
    const body = previewLines
      .map((line) => `- ${line.active ? line.artifactLine : `[VERIFY] ${line.label}: ${line.missing}`}`)
      .join('\n');
    const content = `# ${config.artifactHeading}\n\n## Bad way\n${config.badWay}\n\n## Built artifact\n${body}\n\n## Review note\n${config.scoreLabel} score ${score}/${config.moves.length}. ${complete ? config.completeLine : config.incompleteLine}`;
    const payload: DraftPayload = {
      moduleId,
      moduleNumber: config.moduleNumber,
      model: config.model,
      dataset: config.dataset,
      savedAt: saved,
      reviewChecklist: config.reviewChecklist,
      content,
    };
    saveInteractiveDraft(payload);
    setSavedAt(saved);
  }

  return (
    <section className="foundation-interactive-takeaway" data-testid={config.testId}>
      <div className="foundation-interactive-takeaway__head">
        <div>
          <p className="foundation-interactive-takeaway__eyebrow">{config.eyebrow}</p>
          <h3>{config.title}</h3>
          <p>{config.description}</p>
        </div>
        <span className="foundation-interactive-score">
          {config.scoreLabel} {score}/{config.moves.length}
        </span>
      </div>

      <div className="foundation-structured-builder__workspace">
        <div className="foundation-tool-panel foundation-tool-panel--bad">
          <p className="foundation-tool-panel__label">{config.badLabel}</p>
          <p>{config.badWay}</p>
        </div>

        <div className="foundation-structured-builder__moves" aria-label={`${config.title} controls`}>
          {config.moves.map((move) => {
            const active = activeMoves.has(move.id);
            return (
              <button
                key={move.id}
                type="button"
                aria-pressed={active}
                className="foundation-takeaway-toggle"
                onClick={() => toggle(move.id)}
              >
                <span>{move.label}</span>
                <small>{active ? move.short : move.missing}</small>
              </button>
            );
          })}
        </div>

        <div className={`foundation-tool-panel foundation-tool-panel--${complete ? 'good' : 'warn'}`}>
          <p className="foundation-tool-panel__label">{config.previewLabel}</p>
          <ul className="foundation-structured-preview-list">
            {previewLines.map((line) => (
              <li key={line.id} data-active={line.active ? 'true' : 'false'}>
                <strong>{line.active ? line.label : `${line.label} missing`}</strong>
                <span>{line.active ? line.artifactLine : line.missing}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="foundation-interactive-takeaway__footer">
        <button type="button" onClick={save} disabled={!complete}>
          {savedAt ? 'Saved to packet draft' : complete ? `Save to ${artifactLabel}` : 'Complete all controls to save'}
        </button>
        <p>{complete ? config.completeLine : config.incompleteLine}</p>
      </div>
    </section>
  );
}
