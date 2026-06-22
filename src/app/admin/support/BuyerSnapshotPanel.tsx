import type { BuyerSnapshot } from '@/lib/support/buyer';

function formatDate(value: string | null | undefined): string {
  if (!value) return 'n/a';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function eligibilityClass(label: string): string {
  if (label === 'eligible') return 'is-good';
  if (label === 'ineligible') return 'is-bad';
  return 'is-warn';
}

export function BuyerSnapshotPanel({ snapshot }: { readonly snapshot: BuyerSnapshot }) {
  return (
    <section className="support-panel">
      <div className="support-section-head">
        <div>
          <p className="support-kicker">Buyer snapshot</p>
          <h2>{snapshot.email}</h2>
        </div>
      </div>

      <div className="support-snapshot-grid">
        <div>
          <span className="support-label">Enrollments</span>
          <strong>{snapshot.enrollments.length}</strong>
        </div>
        <div>
          <span className="support-label">Active entitlements</span>
          <strong>{snapshot.entitlements.filter((row) => row.active).length}</strong>
        </div>
        <div>
          <span className="support-label">Certificates</span>
          <strong>{snapshot.certificates.length}</strong>
        </div>
        <div>
          <span className="support-label">Team cohorts</span>
          <strong>{snapshot.teamCohorts.length}</strong>
        </div>
      </div>

      <div className="support-list-block">
        <h3>Purchases and access</h3>
        {snapshot.purchases.length === 0 ? (
          <p className="support-muted">No local purchase records found for this lookup.</p>
        ) : null}
        {snapshot.purchases.map((purchase) => (
          <div className="support-record" key={`${purchase.kind}-${purchase.id}`}>
            <div>
              <strong>{purchase.product}</strong>
              <p>{purchase.kind.replaceAll('_', ' ')} · purchased {formatDate(purchase.purchasedAt)}</p>
              {purchase.stripeSessionId ? <code>{purchase.stripeSessionId}</code> : null}
              {purchase.refundEligibility.blockers.length > 0 ? (
                <p>Blockers: {purchase.refundEligibility.blockers.join(' ')}</p>
              ) : (
                <p>{purchase.refundEligibility.reasons.join(' ')}</p>
              )}
            </div>
            <div className="support-record__side">
              <span className={`support-pill ${eligibilityClass(purchase.refundEligibility.label)}`}>
                {purchase.refundEligibility.label.replaceAll('_', ' ')}
              </span>
              {purchase.stripeDashboardUrl ? (
                <a href={purchase.stripeDashboardUrl} target="_blank" rel="noreferrer">
                  Stripe
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="support-list-block">
        <h3>Enrollment detail</h3>
        {snapshot.enrollments.map((enrollment) => (
          <div className="support-record" key={enrollment.id}>
            <div>
              <strong>{enrollment.product}</strong>
              <p>
                Module {enrollment.currentModule} · {enrollment.completedModules.length} completed · user{' '}
                {enrollment.userId ?? 'not linked'}
              </p>
            </div>
          </div>
        ))}
        {snapshot.teamCohorts.map((cohort) => (
          <div className="support-record" key={cohort.id}>
            <div>
              <strong>{cohort.institutionName}</strong>
              <p>
                Team Assessment · {cohort.seatsPurchased} seats · {cohort.completedResponses} completed ·{' '}
                {cohort.status}
              </p>
              {cohort.stripeSessionId ? <code>{cohort.stripeSessionId}</code> : null}
            </div>
          </div>
        ))}
      </div>

      <div className="support-list-block">
        <h3>Profile and work state</h3>
        <p className="support-muted">
          Saved prompts: {snapshot.savedPromptCount} · artifacts: {snapshot.artifactCount} · refunded sessions:{' '}
          {snapshot.refundedSessionIds.length} · activity responses: {snapshot.activityResponseCount}
        </p>
        {snapshot.profiles.map((profile) => (
          <div className="support-record" key={profile.id}>
            <div>
              <strong>{profile.readinessTierLabel ?? 'Assessment profile'}</strong>
              <p>
                Version {profile.readinessVersion ?? 'n/a'} · score {profile.readinessScore ?? 'n/a'} ·{' '}
                {formatDate(profile.readinessAt)}
              </p>
            </div>
          </div>
        ))}
        {snapshot.errors.length > 0 ? (
          <p className="support-muted">Partial lookup warnings: {snapshot.errors.join(' · ')}</p>
        ) : null}
      </div>
    </section>
  );
}
