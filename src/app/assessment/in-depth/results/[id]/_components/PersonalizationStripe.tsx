// PersonalizationStripe — the In-Depth Briefing's dynamic personalization
// rendering (#97 §7, §13).
//
// Renders two prominent blocks at the end of the Briefing:
//
//   1. Profile diagnosis — if detectProfile() recognizes a named score
//      shape (governance-priority, capability-priority, etc.), shows the
//      diagnosis + priority + Foundation emphasis. Skipped when no profile
//      cleanly applies — renderer falls back to the regular ninety-day
//      framing.
//
//   2. Foundation module recommendations — for the buyer's weakest
//      dimension, the three Foundation modules that close the gap fastest,
//      each with a one-line rationale. Drives the closing CTA into the
//      $295 course with concrete starting points.
//
// Role-aware framing is layered onto the diagnosis when a role is supplied.
// Falls through to the un-roled default if role is null/'other'.
//
// Markup mirrors the existing `chapter` pattern used elsewhere in the
// Briefing so .briefing.css styles cascade without new classes (apart from
// a small additive .recs block defined alongside in briefing.css).

import Link from 'next/link';
import type { DimensionScore } from '@content/assessments/v2/scoring';
import type { Dimension } from '@content/assessments/v2/types';
import { detectProfile, PROFILE_META } from '@content/assessments/v2/profiles';
import { FOUNDATION_RECOMMENDATIONS } from '@content/assessments/v2/foundation-recommendations';
import { getRoleFraming } from '@content/assessments/v2/role-framing';
import type { Role } from '@content/assessments/v2/role';

interface Props {
  readonly dimensionBreakdown: Record<Dimension, DimensionScore>;
  readonly role?: Role | null;
}

function weakestDimension(
  scores: Record<Dimension, DimensionScore>,
): Dimension {
  const entries = Object.entries(scores) as [Dimension, DimensionScore][];
  return entries
    .map(([dim, s]) => ({
      dim,
      pct: s.maxScore > 0 ? s.score / s.maxScore : 0,
    }))
    .sort((a, b) => a.pct - b.pct || a.dim.localeCompare(b.dim))[0].dim;
}

export function PersonalizationStripe({ dimensionBreakdown, role }: Props) {
  const profile = detectProfile(dimensionBreakdown);
  const meta = profile ? PROFILE_META[profile] : null;
  const weakest = weakestDimension(dimensionBreakdown);
  const modules = FOUNDATION_RECOMMENDATIONS[weakest];
  const roleFraming = role && role !== 'other'
    ? getRoleFraming(role, weakest)
    : null;

  return (
    <section className="chapter shaded" id="ch-personalization">
      <div className="container">
        <div className="ch-head">
          <div className="left">
            <div className="num">
              Reading <em>·</em>
              <br />
              For your seat
            </div>
          </div>
          <div>
            {meta ? (
              <>
                <h2>
                  Your score shape · <em>{meta.label}.</em>
                </h2>
                <p className="body">{meta.diagnosis}</p>
                <p className="body" style={{ marginTop: 18 }}>
                  <strong>Priority:</strong> {meta.priority}
                </p>
                {roleFraming ? (
                  <p className="body" style={{ marginTop: 18, fontStyle: 'italic' }}>
                    {roleFraming}
                  </p>
                ) : null}
                <p className="body" style={{ marginTop: 18, color: 'var(--slate)' }}>
                  {meta.foundationEmphasis}
                </p>
              </>
            ) : (
              <>
                <h2>Your starting point, <em>named.</em></h2>
                {roleFraming ? (
                  <p className="body" style={{ fontStyle: 'italic' }}>{roleFraming}</p>
                ) : (
                  <p className="body">
                    Your readiness shape doesn&rsquo;t cleanly fit one of the
                    five archetypes we name explicitly — which is the most
                    common result. The deep dives above are your sharper read.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Foundation recommendations — concrete next step into the $295 course */}
        <div className="recs">
          <div className="recs-head">
            <span className="recs-kicker">Start here in AiBI-Foundation</span>
            <span className="recs-rule" />
          </div>
          <p className="recs-deck">
            The Foundation course is twelve modules. Based on your weakest
            dimension, these three close the gap fastest. Buyers get
            <em> lifetime access</em> to all twelve.
          </p>
          <ol className="recs-list">
            {modules.map((mod, idx) => (
              <li key={mod.number} className="rec">
                <div className="rec-head">
                  <span className="rec-num">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="rec-title">
                    Module {mod.number} — <em>{mod.title}</em>
                  </span>
                </div>
                <p className="rec-why">{mod.why}</p>
              </li>
            ))}
          </ol>
          <div className="recs-cta">
            <Link
              href="/courses/foundation/program/purchase"
              className="recs-cta-primary"
            >
              Enroll in AiBI-Foundation · $295 →
            </Link>
            <Link
              href="/courses/foundation/program"
              className="recs-cta-secondary"
            >
              Or preview the full curriculum
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
