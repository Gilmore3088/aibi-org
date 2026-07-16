import type {
  DimensionAggregate,
  SliceAggregate,
} from '@/lib/team-assessment/aggregate';

export function DimensionTable({
  dimensions,
}: {
  readonly dimensions: readonly DimensionAggregate[];
}): JSX.Element {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Dimension</th>
            <th>Median</th>
            <th>Middle 50%</th>
            <th>Distribution</th>
          </tr>
        </thead>
        <tbody>
          {dimensions.map((dim) => (
            <tr key={dim.id}>
              <td>{dim.label}</td>
              <td>{dim.median}</td>
              <td className="muted">
                {dim.p25}-{dim.p75}
              </td>
              <td>
                <Bar value={dim.median} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SliceTable({ slices }: { readonly slices: readonly SliceAggregate[] }): JSX.Element {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Slice</th>
            <th>Completed</th>
            <th>Signal</th>
            <th>Median</th>
            <th>Weakest</th>
            <th>Strongest</th>
          </tr>
        </thead>
        <tbody>
          {slices.map((slice) => (
            <tr key={slice.id}>
              <td>{slice.label}</td>
              <td>{slice.count}</td>
              <td>
                <span className={`sample-chip ${slice.lowConfidence ? 'is-directional' : 'is-stable'}`}>
                  {slice.lowConfidence ? 'Directional' : 'Stable'}
                </span>
              </td>
              <td>{slice.median}</td>
              <td>{slice.weakest?.label ?? '-'}</td>
              <td>{slice.strongest?.label ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Bar({ value }: { readonly value: number }): JSX.Element {
  return (
    <span className="bar">
      <i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </span>
  );
}
