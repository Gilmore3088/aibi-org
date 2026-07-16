import type { DimensionAggregate } from '@/lib/team-assessment/aggregate';
import { SectionHeading } from './SectionHeading';
import { dimensionActionFor } from './helpers';

export function TeamActionQueue({
  dimensions,
}: {
  readonly dimensions: readonly DimensionAggregate[];
}): JSX.Element {
  return (
    <section className="action-queue" aria-labelledby="action-queue-heading">
      <SectionHeading
        id="action-queue-heading"
        eyebrow="Execution queue"
        title="What leadership should run next."
      />
      <div className="action-board" role="table" aria-label="Team execution queue">
        <div className="action-board-head" role="row">
          <span role="columnheader">Phase</span>
          <span role="columnheader">Gap</span>
          <span role="columnheader">Owner</span>
          <span role="columnheader">Move</span>
          <span role="columnheader">Output</span>
        </div>
        {dimensions.map((dimension, index) => (
          <ActionQueueRow key={dimension.id} dimension={dimension} index={index} />
        ))}
      </div>
    </section>
  );
}

function ActionQueueRow({
  dimension,
  index,
}: {
  readonly dimension: DimensionAggregate;
  readonly index: number;
}): JSX.Element {
  const action = dimensionActionFor(dimension);
  const phases = ['Week 1', 'Days 8-30', 'Days 31-60'] as const;
  return (
    <div className="action-board-row" role="row">
      <div className="action-cell phase-cell" role="cell">
        <span>{phases[index] ?? 'Next'}</span>
        <i>Ready</i>
      </div>
      <div className="action-cell" role="cell">
        <strong>{dimension.label}</strong>
        <small>Median {dimension.median}</small>
      </div>
      <div className="action-cell" role="cell">{action.owner}</div>
      <div className="action-cell" role="cell">{action.shortMove}</div>
      <div className="action-cell" role="cell">{action.artifact}</div>
    </div>
  );
}
