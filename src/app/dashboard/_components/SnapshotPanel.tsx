import type { ReadinessSnapshot } from '../deriveDashboardViewModel';

export function SnapshotPanel({
  snapshot,
  inDepthEntitled,
}: {
  readonly snapshot: ReadinessSnapshot;
  readonly inDepthEntitled: boolean;
}) {
  const pct = Math.round((snapshot.score / snapshot.maxScore) * 100);
  const sourceLabel = snapshot.isInDepth ? 'In-Depth Briefing' : 'Free Readiness Scan';
  const takenAt = snapshot.takenAt
    ? new Date(snapshot.takenAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;
  return (
    <div className="snap">
      <div className="snap-row">
        <div className="snap-cell">
          <span className="snap-lab">Tier</span>
          <span className="snap-tier">{snapshot.tierLabel}</span>
        </div>
        <div className="snap-cell">
          <span className="snap-lab">Score</span>
          <span className="snap-score">
            {snapshot.score}
            <span className="snap-score-max">/{snapshot.maxScore}</span>
          </span>
          <span className="snap-pct">{pct}%</span>
        </div>
        <div className="snap-cell">
          <span className="snap-lab">Source</span>
          <span className="snap-source">{sourceLabel}</span>
          {takenAt && <span className="snap-meta">Filed {takenAt}</span>}
        </div>
      </div>
      {!snapshot.isInDepth && !inDepthEntitled && (
        <p className="snap-foot">
          The free scan gives you the headline. The In-Depth Assessment gives you the explanation —
          eight dimensions, peer-band comparison, and a ninety-day action register.
        </p>
      )}
    </div>
  );
}
