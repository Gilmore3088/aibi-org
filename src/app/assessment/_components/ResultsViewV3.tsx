'use client';

// ResultsViewV3 — free-flow post-email-capture result surface.
//
// Voice / framing per operator feedback 2026-05-29:
//   - The free result is a snapshot, not a diagnostic. It surfaces 12
//     answers grouped by topic, not the paid 8-dimension scorecard.
//   - Free tells you where to start. Paid tells you how to build the plan.
//   - Free output expanded with takeaways (prompt, helper tool, artifact)
//     rather than dimension scores.
//   - 8-dimension diagnostic + role-specific roadmap + reviewer-ready PDF
//     are explicitly locked behind a "Unlock In-Depth · $99" preview.
//
// Source layout: /Users/jgmbp/Downloads/preview.html (mockup).

import type { Tier, DimensionScore } from '@content/assessments/v3/scoring';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { DIMENSION_LABELS } from '@content/assessments/v3/types';
import type { Dimension } from '@content/assessments/v3/types';
import type { FreeRole } from '@content/assessments/v3/roles';
import { DIMENSION_LABELS as V4_DIMENSION_LABELS } from '@content/assessments/v4/types';
import { PLAYBOOK_INDEX, PLAYBOOKS, PLAYBOOK_FOCUS, FREE_ROLE_TO_PLAYBOOK, type RoleSlug } from '@/app/playbooks/data';
import { SiteHeader } from '@/components/mockup';
import { CopyPrompt } from '@/components/ax';
import { PdfDownloadButton } from './PdfDownloadButton';
import { getStarterArtifact } from '@content/assessments/v3/starter-artifacts';
import {
  formatRoiCurrency,
  formatRoiNumber,
  type RoiAssessmentContext,
} from '@/lib/roi/assessment-context';
import {
  GAP_CONTENT,
  RECOMMENDATIONS,
  STARTER_PROMPTS,
  SEVEN_DAY_PLAN,
  STAFFING_REALITY,
  TIER_CLOSING_CTA,
} from '@content/assessments/v3/personalization';
import type { FreeAssetBand } from '@content/assessments/v3/asset-bands';

const V3_MAX_SCORE = 48;

interface ResultsViewV3Props {
  readonly score: number;
  readonly tier: Tier;
  readonly tierId: Tier['id'];
  readonly dimensionBreakdown: Record<Dimension, DimensionScore>;
  readonly email?: string | null;
  readonly firstName?: string | null;
  readonly institutionName?: string | null;
  readonly profileId: string | null;
  /** Free-funnel role the respondent selected at email capture. Drives which
   *  role playbook is flagged as "Best match". Null when the role was skipped. */
  readonly role?: FreeRole | null;
  /** Optional asset band shared at the email gate. Renders the staffing-
   *  reality stripe; context only — never affects the score. */
  readonly assetBand?: FreeAssetBand | null;
  /** Show the "you used a personal email" note above the report. Set on the
   *  immediate post-capture hand-off when a free-mail domain was used. */
  readonly showPersonalEmailNote?: boolean;
  /** Optional calculator context passed from the ROI block into the assessment. */
  readonly roiContext?: RoiAssessmentContext | null;
}

interface RankedSignal {
  readonly id: Dimension;
  readonly label: string;
  readonly score: number;
  readonly maxScore: number;
}

type SignalBand = 'low' | 'mid' | 'high';

function bandForSignal(s: RankedSignal): SignalBand {
  // 1 / 4 → low, 2-3 / 4 → mid, 4 / 4 → high.
  // The v3 free assessment uses 1-question-per-signal so the band is the
  // raw answer: 1 = "needs structure", 2-3 = "developing", 4 = "strong".
  if (s.score >= 4) return 'high';
  if (s.score <= 1) return 'low';
  // Treat 3 as 'high' so the grid shows clear contrast — the user
  // distinguishing between 2 and 3 deserves the visual recognition.
  return s.score >= 3 ? 'high' : 'mid';
}

function pillFor(band: SignalBand): string {
  if (band === 'high') return 'Strong';
  if (band === 'low') return 'Needs structure';
  return 'Developing';
}

const MISSION_INSTITUTION_PATTERN =
  /\b(mdi|minority depository|cdfi|community development|mission|underserved|low-income|lmi)\b/i;

function missionInstitutionName(institutionName: string | null | undefined): string | null {
  const trimmed = institutionName?.trim();
  if (!trimmed || !MISSION_INSTITUTION_PATTERN.test(trimmed)) return null;
  return trimmed;
}


function bestMatchPlaybook(role: FreeRole | null | undefined): RoleSlug {
  return role ? FREE_ROLE_TO_PLAYBOOK[role] : 'retail';
}

export function ResultsViewV3({
  score,
  tier,
  tierId,
  dimensionBreakdown,
  firstName,
  institutionName,
  profileId,
  role,
  assetBand,
  showPersonalEmailNote,
  roiContext,
}: ResultsViewV3Props) {
  // 12 free-question topics, ordered by score ascending so the weakest are easy to find.
  const signals: RankedSignal[] = (
    Object.entries(dimensionBreakdown) as readonly [Dimension, DimensionScore][]
  )
    .map(([id, data]) => ({
      id,
      label: DIMENSION_LABELS[id],
      score: data.score,
      maxScore: data.maxScore,
    }))
    .sort((a, b) => a.score - b.score);

  const lowest = signals.filter((s) => s.score <= 2).slice(0, 4);
  const focusGap = signals[0] ?? null;

  const gap = focusGap ? GAP_CONTENT[focusGap.id] : null;
  const recommendation = focusGap ? RECOMMENDATIONS[focusGap.id] : null;
  const starterPrompt = focusGap ? STARTER_PROMPTS[focusGap.id] : null;
  const artifact = focusGap ? getStarterArtifact(focusGap.id) : null;
  const cta = TIER_CLOSING_CTA[tierId];

  const matchedPlaybook = bestMatchPlaybook(role);
  const missionName = missionInstitutionName(institutionName);
  const staffingReality = assetBand ? STAFFING_REALITY[assetBand] : null;

  const resultHeadline = firstName?.trim()
    ? `${firstName.trim()}, your result is ${tier.label}.`
    : `Your result: ${tier.label}.`;
  const matchedPlaybookPath = `/playbooks/${matchedPlaybook}`;

  return (
    <div className="rv">
      <ResultPrintStyles />
      <div className="mockup-scope" data-print-hide="true">
        <SiteHeader
          activePath="/assessment"
          cta={{ label: 'Download report', href: '#download-report' }}
        />
      </div>

      <div className="rv-band is-dark rv-band-first">
      <div className="rv-inner">
        {showPersonalEmailNote && (
          <aside aria-label="Personal email notice" className="rv-note">
            <p className="rv-k">Note</p>
            <p>
              You submitted a personal email. The report below is tailored using the
              institution you provided. If you&rsquo;d prefer follow-up emails to land at
              your work address, just retake the assessment with your work email and
              we&rsquo;ll merge the records.
            </p>
          </aside>
        )}

        {/* HERO — the score as a dial, the headline, and the three facts that matter. */}
        <section className="rv-hero" aria-label="Your result">
          <ScoreDial score={score} max={V3_MAX_SCORE} tierLabel={tier.label} />
          <div className="rv-hero-copy">
            <p className="rv-k rv-gold">AI Readiness Snapshot</p>
            <h1 className="rv-display">{resultHeadline}</h1>
            {gap && <p className="rv-lede">{gap.oneLine}</p>}
          </div>
          <dl className="rv-readout">
            {focusGap && (
              <div>
                <dt>Top gap</dt>
                <dd>{focusGap.label}</dd>
              </div>
            )}
            {recommendation && (
              <div>
                <dt>Quick win</dt>
                <dd>{recommendation.title}</dd>
              </div>
            )}
            {artifact && (
              <div>
                <dt>Starter template</dt>
                <dd>{artifact.title}</dd>
              </div>
            )}
          </dl>
        </section>

        {roiContext && <RoiContextPanel roiContext={roiContext} />}

        <QuickActionStrip matchedPlaybookPath={matchedPlaybookPath} profileId={profileId} />

        {missionName && (
          <section className="rv-panel" aria-label="Mission lens">
            <p className="rv-k rv-gold">Mission lens</p>
            <h2 className="rv-h2">
              Read this result through {missionName}&rsquo;s capacity and trust goals.
            </h2>
            <p className="rv-body">
              For MDI, CDFI, and community-development institutions, the first AI win should
              not be novelty. Start with an internal workflow that protects member or borrower
              trust, documents human review, and gives staff more time for mission work.
            </p>
            <ul className="rv-checks rv-checks-3">
              {[
                'Pick a low-risk internal workflow before any customer-facing use.',
                'Name the human reviewer and keep the reviewed artifact.',
                'Measure recaptured staff time alongside service quality and fairness checks.',
              ].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {staffingReality && (
          <section className="rv-panel" aria-label="Staffing reality" data-testid="staffing-reality">
            <p className="rv-k rv-gold">Staffing reality</p>
            <h2 className="rv-h2">{staffingReality.headline}</h2>
            <p className="rv-body">{staffingReality.body}</p>
          </section>
        )}

      </div>
      </div>
      <div className="rv-band is-light">
      <div className="rv-inner">
        {/* FREE SNAPSHOT TOPICS — one bar per answer, weakest first. Not the
            paid 8-dimension diagnostic. */}
        <section className="rv-section rv-split">
          <div>
            <p className="rv-k rv-gold">12-question snapshot summary</p>
            <h2 className="rv-h2">Your 12 answers, grouped by topic.</h2>
            <p className="rv-body">
              The free snapshot uses twelve plain-language questions to estimate
              where to start. The In-Depth Assessment is a separate
              eight-dimension diagnostic for a fuller action plan.
            </p>
            {signals.filter((s) => bandForSignal(s) === bandForSignal(signals[0])).length >= 8 && (
              <p data-testid="uniform-band-note" className="rv-body rv-muted">
                Most of your topics landed at the same stage — that&rsquo;s normal
                for a first pass, not a data problem. The one to act on is the top
                gap above; the rest will move together as the basics go in.
              </p>
            )}
            <p className="rv-legend" aria-hidden="true">
              <span className="is-low" /> Needs structure <span className="is-mid" /> Developing{' '}
              <span className="is-high" /> Strong
            </p>
          </div>
          <ol className="rv-bars">
            {signals.map((s, i) => {
              const band = bandForSignal(s);
              return (
                <li key={s.id} className={`is-${band}${i === 0 ? ' is-top' : ''}`}>
                  <span className="rv-bar-label">{s.label}</span>
                  <span
                    className="rv-bar-track"
                    role="progressbar"
                    aria-valuenow={s.score}
                    aria-valuemin={0}
                    aria-valuemax={s.maxScore}
                    aria-label={`${s.label}: ${s.score} of ${s.maxScore}`}
                  >
                    {Array.from({ length: s.maxScore }, (_, k) => (
                      <span key={k} className={k < s.score ? 'is-on' : undefined} />
                    ))}
                  </span>
                  <span className="rv-bar-val">
                    {s.score}/{s.maxScore}
                  </span>
                  <span className="rv-bar-band">{i === 0 ? 'Top gap' : pillFor(band)}</span>
                </li>
              );
            })}
          </ol>
        </section>

        {/* SIGNAL DETAIL — collapsed by default. */}
        {lowest.length > 0 && (
          <details className="rv-details">
            <summary>View signal detail</summary>
            <dl>
              {lowest.map((s) => (
                <div key={s.id}>
                  <dt>{s.label}</dt>
                  <dd>{GAP_CONTENT[s.id].oneLine}</dd>
                  <span className={`rv-pill is-${bandForSignal(s)}`}>{pillFor(bandForSignal(s))}</span>
                </div>
              ))}
            </dl>
          </details>
        )}

        {/* TOP GAP EXPLAINED */}
        {focusGap && gap && (
          <section className="rv-panel rv-gap">
            <p className="rv-k rv-gold">Top gap explained</p>
            <h2 className="rv-h2">What is {focusGap.label}?</h2>
            <p className="rv-body rv-wide">{gap.explanation}</p>
            <div className="rv-cols-3">
              <MiniCard label="What this leads to" items={gap.impacts} />
              <MiniCard label="What good looks like" items={gap.whatGoodLooksLike} />
              <MiniCard
                label="Your first move"
                items={recommendation ? [recommendation.inPractice] : ['Take the first move from your recommended starter artifact.']}
              />
            </div>
          </section>
        )}

      </div>
      </div>
      <div className="rv-band is-dark">
      <div className="rv-inner">
        {/* THREE TAKEAWAYS — prompt / helper tool / artifact. */}
        {focusGap && (
          <section className="rv-section">
            <p className="rv-k rv-gold">Three things you can use this week</p>
            <h2 className="rv-h2">Your next steps.</h2>
            <div className="rv-takeaways">
              {starterPrompt && (
                <article className="rv-take rv-take-prompt">
                  <TakeawayNum n={1} />
                  <h3>Prompt to try</h3>
                  <p className="rv-muted">{starterPrompt.label}</p>
                  <CopyPrompt label="Paste into your approved AI tool" prompt={starterPrompt.prompt} />
                </article>
              )}
              <article className="rv-take">
                <TakeawayNum n={2} />
                <h3>Helper tool</h3>
                <p className="rv-muted">A quick task-fit check before testing any AI workflow.</p>
                <ul className="rv-checks">
                  <li>Is the task internal?</li>
                  <li>Is the source approved?</li>
                  <li>Can a human review it?</li>
                  <li>Does it avoid real customer data?</li>
                  <li>Can success be measured?</li>
                </ul>
              </article>
              {artifact && (
                <article className="rv-take">
                  <TakeawayNum n={3} />
                  <h3>A document to keep</h3>
                  <p className="rv-muted">{artifact.subtitle}</p>
                  {profileId ? (
                    <div className="rv-take-foot">
                      <PdfDownloadButton profileId={profileId} />
                    </div>
                  ) : (
                    <div className="rv-take-foot" data-print-hide="true">
                      <PrintReportButton label="Print report" />
                    </div>
                  )}
                </article>
              )}
            </div>
          </section>
        )}

      </div>
      </div>
      <div className="rv-band is-light">
      <div className="rv-inner">
        {/* 7-DAY PLAN — a timeline, one step per day. */}
        <section className="rv-section">
          <p className="rv-k rv-gold">Your 7-day starter plan</p>
          <h2 className="rv-h2">One small step per day.</h2>
          <ol className="rv-days">
            {SEVEN_DAY_PLAN.map((d) => (
              <li key={d.day}>
                <span className="rv-day-n">Day {d.day}</span>
                <p>{d.action}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 30/60/90 PLAN — phase 1 visible; phases 2 + 3 partially locked. */}
        <section className="rv-section">
          <p className="rv-k rv-gold">30 / 60 / 90 plan</p>
          <h2 className="rv-h2">
            Start with the first 30 days. Unlock the deployment plan when you need the detail.
          </h2>
          <div className="rv-cols-3 rv-phases">
            <div className="rv-phase is-open">
              <div className="rv-phase-head">
                <div>
                  <p className="rv-k rv-gold">Days 1–30</p>
                  <h3>Pick the first use cases</h3>
                </div>
                <span className="rv-pill is-high">Included</span>
              </div>
              <ul className="rv-checks">
                {[
                  'Choose one safe internal workflow.',
                  'Build a reusable AI working brief.',
                  'Apply Green / Yellow / Red data safety and name the reviewer.',
                  'Run one low-risk test and measure draft time.',
                ].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="rv-phase-foot" data-print-hide="true">
                <p>Keep the first 30 days moving.</p>
                <ResultActionLink href={matchedPlaybookPath} variant="ink" fullWidth>
                  Open your role playbook
                </ResultActionLink>
                <ResultActionLink href="/assessment/in-depth" variant="gold" fullWidth>
                  Get the 90-day playbook
                </ResultActionLink>
              </div>
            </div>
            <PartialLockedPhase
              label="Days 31–60"
              title="Prototype and secure"
              visibleItem="Turn the tested prompt into a reusable skill."
              lockedItems={[
                'Define allowed and blocked inputs.',
                'Create the workflow SOP.',
                'Track correction rate and reuse count.',
              ]}
            />
            <PartialLockedPhase
              label="Days 61–90"
              title="Deploy and validate"
              visibleItem="Train one role group on the reviewed workflow."
              lockedItems={[
                'Publish the reviewed artifact.',
                'Report usage and savings.',
                'Decide whether to scale.',
              ]}
            />
          </div>
        </section>

      </div>
      </div>
      <div className="rv-band is-dark">
      <div className="rv-inner">
        {/* LOCKED PAID DIAGNOSTIC PREVIEW — the 8 paid dimensions, named. */}
        <section className="rv-panel rv-upsell">
          <div>
            <p className="rv-k rv-gold">A separate diagnostic</p>
            <h2 className="rv-h2">The 8-dimension In-Depth Diagnostic.</h2>
            <p className="rv-body">
              The free snapshot you just took is twelve plain-language signals.
              The In-Depth is a separate diagnostic — forty-eight questions
              across eight readiness dimensions, per-dimension root causes, a
              role-specific 30/60/90 playbook, sample prompts, an evidence
              checklist your reviewer can read, and a reviewer-ready report
              you can forward.
            </p>
            <div className="rv-actions">
              <a href="/assessment/in-depth" className="rv-btn rv-btn-gold">
                Take the In-Depth · $99
              </a>
              <a
                href={cta.tertiary.href}
                data-plausible-event-source={cta.tertiary.source}
                className="rv-btn rv-btn-ghost"
              >
                Or talk to us
              </a>
            </div>
          </div>
          <div className="rv-dims">
            <p className="rv-k rv-gold">8-dimension diagnostic</p>
            <ol>
              {Object.values(V4_DIMENSION_LABELS).map((d, i) => (
                <li key={d}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {d}
                </li>
              ))}
            </ol>
            <p className="rv-muted">
              Plus role-specific roadmap, sample prompts, evidence checklist,
              and a reviewer-ready PDF.
            </p>
          </div>
        </section>

      </div>
      </div>
      <div className="rv-band is-light">
      <div className="rv-inner">
        {/* ROLE PLAYBOOKS — the best match opened as a file, the rest as an index. */}
        <section className="rv-section">
          <div className="rv-section-head">
            <p className="rv-k rv-gold">Role playbooks</p>
            <h2 className="rv-h2">The playbook for your role.</h2>
            <p className="rv-body">Free to read, no email gate.</p>
          </div>
          <div className="rv-pb">
            <PlaybookPreview slug={matchedPlaybook} />
            <nav className="rv-pb-index" aria-label="Other role playbooks">
              <p className="rv-k">Other seats</p>
              <ul>
                {PLAYBOOK_INDEX.filter((p) => p.slug !== matchedPlaybook).map((p) => (
                  <li key={p.slug}>
                    <a href={`/playbooks/${p.slug}`}>
                      <span className="rv-pb-index-title">{p.title}</span>
                      <span className="rv-pb-index-tag">{PLAYBOOK_FOCUS[p.slug]}</span>
                      <span className="rv-pb-index-arrow" aria-hidden="true">→</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}

/** Score as a gold arc on a dark ring, the tier underneath. */
function ScoreDial({ score, max, tierLabel }: { readonly score: number; readonly max: number; readonly tierLabel: string }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const frac = max > 0 ? Math.min(Math.max(score / max, 0), 1) : 0;
  return (
    <div className="rv-dial">
      <svg viewBox="0 0 168 168" aria-hidden="true">
        <circle cx="84" cy="84" r={r} className="rv-dial-track" />
        <circle
          cx="84"
          cy="84"
          r={r}
          className="rv-dial-arc"
          strokeDasharray={`${c * frac} ${c}`}
          transform="rotate(-90 84 84)"
        />
      </svg>
      <p className="rv-dial-num">
        <span className="rv-k">Your score</span>
        <strong>{score}</strong>
        <span className="rv-dial-max">/ {max}</span>
      </p>
      <p className="rv-dial-tier">{tierLabel}</p>
    </div>
  );
}

function RoiContextPanel({
  roiContext,
}: {
  readonly roiContext: RoiAssessmentContext;
}) {
  return (
    <section className="rv-panel rv-roi">
      <div>
        <p className="rv-k rv-gold">Your ROI scenario</p>
        <h2 className="rv-h2">Estimate the hours AI could save your team.</h2>
        <p className="rv-body">
          You modeled {formatRoiNumber(roiContext.fte)} employees at{' '}
          {formatRoiCurrency(roiContext.costPerFTE)} loaded cost and{' '}
          {roiContext.loHours}-{roiContext.hiHours} hours per week. The
          assessment below points to the first workflow discipline to improve
          before treating the estimate as achievable.
        </p>
      </div>
      <div className="rv-roi-figure">
        <p className="rv-k">Estimated annual capacity</p>
        <strong>{formatRoiCurrency(roiContext.mid)}</strong>
        <p>
          Range {formatRoiCurrency(roiContext.low)}-{formatRoiCurrency(roiContext.high)} ·{' '}
          {formatRoiNumber(roiContext.hoursPerYear)} hours/year · ~
          {roiContext.payrollRecaptured}% of payroll.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */

function ResultPrintStyles() {
  return (
    <style jsx global>{`
      @media print {
        @page {
          size: letter;
          margin: 0.55in;
        }

        body {
          background: #ffffff !important;
        }

        main {
          background: #ffffff !important;
          padding: 0 !important;
        }

        [data-print-hide='true'] {
          display: none !important;
        }
      }
    `}</style>
  );
}

function QuickActionStrip({
  matchedPlaybookPath,
  profileId,
}: {
  readonly matchedPlaybookPath: string;
  readonly profileId: string | null;
}) {
  return (
    <section
      id="download-report"
      className="rv-strip"
      data-print-hide="true"
      aria-label="Recommended next actions"
    >
      <div>
        <p className="rv-k rv-gold">Start here</p>
        <h2 className="rv-strip-title">What to do next.</h2>
      </div>
      <div className="rv-actions">
        <ResultActionLink href={matchedPlaybookPath} variant="ink">
          Open role playbook
        </ResultActionLink>
        {profileId ? (
          <PdfDownloadButton profileId={profileId} compact label="Download report" />
        ) : (
          <PrintReportButton compact label="Print report" />
        )}
        <ResultActionLink href="/assessment/in-depth" variant="gold">
          Get 90-day playbook
        </ResultActionLink>
      </div>
    </section>
  );
}

function PrintReportButton({
  compact = false,
  label,
}: {
  readonly compact?: boolean;
  readonly label: string;
}) {
  return (
    <button
      type="button"
      data-print-hide="true"
      className={`rv-btn rv-btn-ghost${compact ? '' : ' rv-btn-block'}`}
      onClick={() => window.print()}
    >
      {label}
    </button>
  );
}

function ResultActionLink({
  href,
  variant,
  fullWidth = false,
  children,
}: {
  readonly href: string;
  readonly variant: 'ink' | 'gold';
  readonly fullWidth?: boolean;
  readonly children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rv-btn ${variant === 'gold' ? 'rv-btn-gold' : 'rv-btn-ghost'}${fullWidth ? ' rv-btn-block' : ''}`}
    >
      {children}
    </Link>
  );
}

function MiniCard({ label, items }: { readonly label: string; readonly items: readonly string[] }) {
  return (
    <div className="rv-mini">
      <p className="rv-k rv-gold">{label}</p>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function TakeawayNum({ n }: { readonly n: number }) {
  return <span className="rv-take-n">{String(n).padStart(2, '0')}</span>;
}

function PartialLockedPhase({
  label,
  title,
  visibleItem,
  lockedItems,
}: {
  readonly label: string;
  readonly title: string;
  readonly visibleItem: string;
  readonly lockedItems: readonly string[];
}) {
  return (
    <div className="rv-phase">
      <div className="rv-phase-head">
        <div>
          <p className="rv-k rv-gold">{label}</p>
          <h3>{title}</h3>
        </div>
        <span className="rv-pill">Paid</span>
      </div>
      <div className="rv-phase-preview">
        <p className="rv-k">Preview</p>
        <p>{visibleItem}</p>
      </div>
      <ul className="rv-locked">
        {lockedItems.map((item, i) => (
          <li key={i}>
            <span className="rv-lock" aria-label="Locked">
              Locked
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="rv-phase-note">
        <strong>Detailed in the In-Depth</strong> — the 8-dimension diagnostic carries this through with
        deployment specifics.
      </p>
    </div>
  );
}

const RISK_LABEL = { high: 'High review', med: 'Review', low: 'Low risk' } as const;

/** The best-match playbook shown as the document it is: its real use cases
 *  and the artifact each one leaves behind. */
function PlaybookPreview({ slug }: { readonly slug: RoleSlug }) {
  const pb = PLAYBOOKS[slug];
  return (
    <a href={`/playbooks/${slug}`} className="rv-pb-file">
      <span className="rv-pb-bar">
        <span>playbooks/{slug}</span>
        <span className="rv-pb-match">Best match</span>
      </span>
      <span className="rv-pb-body">
        <span className="rv-k rv-gold">{pb.eyebrow}</span>
        <span className="rv-pb-title">{pb.title}</span>
        <span className="rv-pb-lede">{pb.lede}</span>
        <span className="rv-pb-uses">
          {pb.uses.slice(0, 3).map((u) => (
            <span key={u.title} className="rv-pb-use">
              <span className="rv-pb-use-title">{u.title}</span>
              <span className="rv-pb-use-meta">
                <span className="rv-pb-artifact">{u.artifact}</span>
                <span className={`rv-pb-risk is-${u.risk}`}>{RISK_LABEL[u.risk]}</span>
              </span>
            </span>
          ))}
        </span>
        <span className="rv-pb-open">
          Open the playbook <span aria-hidden="true">→</span>
        </span>
      </span>
    </a>
  );
}
