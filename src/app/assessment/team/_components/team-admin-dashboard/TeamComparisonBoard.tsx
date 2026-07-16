import { TEAM_ASSESSMENT_SLICE_MIN } from '@/lib/team-assessment/constants';
import type {
  SliceAggregate,
  TeamAssessmentAggregate,
} from '@/lib/team-assessment/aggregate';
import { SectionHeading } from './SectionHeading';
import {
  heatmapStyle,
  lowestSlice,
  shortDimension,
  sortSlicesByMedian,
  strongestSlice,
} from './helpers';

export function TeamComparisonBoard({
  aggregate,
  directionalDepartmentCount,
  directionalRoleCount,
}: {
  readonly aggregate: TeamAssessmentAggregate;
  readonly directionalDepartmentCount: number;
  readonly directionalRoleCount: number;
}): JSX.Element {
  const roleLow = lowestSlice(aggregate.roles);
  const roleHigh = strongestSlice(aggregate.roles);
  const roleSpread = roleLow && roleHigh ? roleHigh.median - roleLow.median : 0;

  return (
    <section className="comparison-board" aria-labelledby="comparison-heading">
      <SectionHeading
        id="comparison-heading"
        eyebrow="Compare teams"
        title="Where readiness differs."
      />
      <div className="comparison-strip">
        <ComparisonStat label="Lowest department" value={lowestSlice(aggregate.departments)?.label ?? 'Not available'} />
        <ComparisonStat label="Strongest department" value={strongestSlice(aggregate.departments)?.label ?? 'Not available'} />
        <ComparisonStat label="Role spread" value={roleSpread > 0 ? `${roleSpread} pts` : 'Not available'} />
        <ComparisonStat
          label="Directional slices"
          value={`${directionalDepartmentCount + directionalRoleCount}`}
        />
      </div>
      <DepartmentHeatmap slices={aggregate.departments} />
      {(directionalDepartmentCount > 0 || directionalRoleCount > 0) && (
        <p className="privacy-copy">
          Directional sample: {directionalDepartmentCount} department slice
          {directionalDepartmentCount === 1 ? '' : 's'} and {directionalRoleCount} role slice
          {directionalRoleCount === 1 ? '' : 's'} below {TEAM_ASSESSMENT_SLICE_MIN} completions.
        </p>
      )}
      <div className="comparison-grid">
        <ComparisonList title="Department queue" slices={aggregate.departments} />
        <ComparisonList title="Role queue" slices={aggregate.roles} />
      </div>
    </section>
  );
}

function ComparisonStat({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}): JSX.Element {
  return (
    <div className="comparison-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ComparisonList({
  title,
  slices,
}: {
  readonly title: string;
  readonly slices: readonly SliceAggregate[];
}): JSX.Element {
  const sorted = sortSlicesByMedian(slices).slice(0, 5);
  return (
    <article className="comparison-list">
      <p className="kicker">{title}</p>
      <div className="comparison-rows">
        {sorted.map((slice) => (
          <div className="comparison-row" key={slice.id}>
            <div>
              <strong>{slice.label}</strong>
              <span>{slice.weakest?.label ?? 'No dimension signal'}</span>
            </div>
            <b>{slice.median}</b>
            <i>{slice.lowConfidence ? 'Directional' : 'Stable'}</i>
          </div>
        ))}
      </div>
    </article>
  );
}

function DepartmentHeatmap({
  slices,
}: {
  readonly slices: readonly SliceAggregate[];
}): JSX.Element {
  const dimensions = slices[0]?.dimensions ?? [];

  if (slices.length === 0 || dimensions.length === 0) {
    return (
      <p className="privacy-copy">
        Department heatmap appears after at least one department has a completed response.
      </p>
    );
  }

  return (
    <div className="heatmap-wrap">
      <div className="heatmap" role="table" aria-label="Department dimension heatmap">
        <div className="heatmap-row heatmap-head" role="row">
          <div className="heatmap-label" role="columnheader">Department</div>
          {dimensions.map((dim) => (
            <div className="heatmap-cell" role="columnheader" key={dim.id}>
              {shortDimension(dim.label)}
            </div>
          ))}
        </div>
        {slices.map((slice) => (
          <div className="heatmap-row" role="row" key={slice.id}>
            <div className="heatmap-label" role="rowheader">
              <strong>{slice.label}</strong>
              <small>
                {slice.count} response{slice.count === 1 ? '' : 's'}
                {slice.lowConfidence ? ' · directional' : ''}
              </small>
            </div>
            {slice.dimensions.map((dim) => (
              <div
                className="heatmap-cell"
                role="cell"
                key={dim.id}
                style={heatmapStyle(dim.median)}
                aria-label={`${slice.label}, ${dim.label}: ${dim.median}${slice.lowConfidence ? ', directional small sample' : ''}`}
              >
                {dim.median}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
