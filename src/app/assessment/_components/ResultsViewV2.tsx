'use client';

import type { Tier } from '@content/assessments/v2/scoring';
import type { DimensionScore } from '@content/assessments/v2/scoring';
import { DIMENSION_LABELS } from '@content/assessments/v2/types';
import type { Dimension } from '@content/assessments/v2/types';
import { ScoreRing } from './ScoreRing';
import { NewsletterCTA } from './NewsletterCTA';
import { PrintButton } from './PrintButton';
import {
  getAssessmentNextStep,
  getFirstPracticeRecommendation,
  getTopAssessmentGaps,
} from '@/lib/lms/assessment-recommendations';

interface ResultsViewV2Props {
  readonly score: number;
  readonly tier: Tier;
  readonly tierId: Tier['id'];
  readonly dimensionBreakdown: Record<Dimension, DimensionScore>;
  readonly email: string;
}

export function ResultsViewV2({
  score,
  tier,
  tierId,
  dimensionBreakdown,
  email,
}: ResultsViewV2Props) {
  const dimensions = Object.entries(dimensionBreakdown) as [Dimension, DimensionScore][];
  const topGaps = getTopAssessmentGaps(dimensionBreakdown);
  const nextStep = getAssessmentNextStep(tierId);
  const firstPractice = getFirstPracticeRecommendation(tierId);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-16">
      {/* Confirmation header */}
      <div className="text-center" data-print-hide="true">
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-2">
          Your AI Readiness Results
        </p>
        <p className="text-sm text-[color:var(--color-ink)]/70">
          Results delivered to {email}
        </p>
      </div>

      {/* Score ring + tier interpretation */}
      <div className="flex flex-col items-center print-avoid-break">
        <ScoreRing
          score={score}
          minScore={12}
          maxScore={48}
          colorVar={tier.colorVar}
          label={tier.label}
        />
        <h2 className="font-serif text-3xl md:text-4xl text-center mt-8 max-w-xl text-[color:var(--color-ink)]">
          {tier.headline}
        </h2>
        <p className="text-lg text-[color:var(--color-ink)]/75 text-center mt-4 max-w-2xl leading-relaxed">
          {tier.summary}
        </p>
      </div>

      {/* Score interpretation */}
      <section className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-8 md:p-10 print-avoid-break">
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-4">
          What your score means
        </p>
        <ScoreInterpretation score={score} tierId={tierId} />
      </section>

      {/* Top gaps */}
      <section className="print-avoid-break">
        <h3 className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-6">
          Your top 3 gaps
        </h3>
        <div className="grid gap-4">
          {topGaps.map((gap) => (
            <div
              key={gap.id}
              className="border border-[color:var(--color-ink)]/10 rounded-[3px] p-5 bg-[color:var(--color-linen)]"
            >
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-serif text-xl text-[color:var(--color-ink)]">
                  {gap.label}
                </p>
                <p className="font-mono text-xs text-[color:var(--color-slate)] tabular-nums">
                  {gap.score}/{gap.maxScore}
                </p>
              </div>
              <div className="mt-3 h-2 bg-[color:var(--color-ink)]/10 rounded-[1px] overflow-hidden">
                <div
                  className="h-full bg-[color:var(--color-terra)]"
                  style={{ width: `${Math.round(gap.pct * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* One primary next step */}
      <section
        className="bg-[color:var(--color-parch)] border border-[color:var(--color-terra)]/25 rounded-[3px] p-8 md:p-10"
        data-print-hide="true"
      >
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
          Recommended next step
        </p>
        <h3 className="font-serif text-3xl text-[color:var(--color-ink)] leading-tight mb-3">
          {nextStep.title}
        </h3>
        <p className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed max-w-2xl mb-6">
          {nextStep.description}
        </p>
        <a
          href={nextStep.href}
          className="inline-block px-7 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
        >
          {nextStep.cta}
        </a>
      </section>

      {/* First practice recommendation */}
      <section className="border-l-2 border-[color:var(--color-terra)] pl-5 print-avoid-break">
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-3">
          First practice recommendation
        </p>
        <p className="font-serif text-2xl text-[color:var(--color-ink)] leading-snug">
          {firstPractice}
        </p>
      </section>

      {/* Dimension breakdown */}
      <section className="print-avoid-break">
        <h3 className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-6">
          Your dimension breakdown
        </h3>
        <div className="space-y-4">
          {dimensions.map(([dim, data]) => {
            const pct = data.maxScore > 0 ? data.score / data.maxScore : 0;
            const filledBars = data.maxScore > 0
              ? Math.round(pct * 4)
              : 0;
            return (
              <div key={dim} className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-lg text-[color:var(--color-ink)]">
                    {DIMENSION_LABELS[dim]}
                  </span>
                  <span className="font-mono text-xs text-[color:var(--color-slate)] tabular-nums">
                    {data.score} / {data.maxScore}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={
                        'h-2 flex-1 ' +
                        (bar <= filledBars
                          ? 'bg-[color:var(--color-terra)]'
                          : 'bg-[color:var(--color-ink)]/10')
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Newsletter */}
      <div data-print-hide="true">
        <NewsletterCTA email={email} />
      </div>

      {/* Download */}
      <div className="text-center" data-print-hide="true">
        <PrintButton />
        <p className="font-mono text-[10px] text-[color:var(--color-slate)] mt-3">
          Use your browser&rsquo;s &ldquo;Save as PDF&rdquo; option from the
          print dialog to save a copy for your team.
        </p>
      </div>

      {/* Print-only footer */}
      <div className="print-footer">
        <p>
          <strong>The AI Banking Institute</strong> &middot; Turning Bankers
          into Builders
        </p>
        <p>
          Results generated for {email} &middot; Score: {score}/48 &middot;
          Tier: {tier.label}
        </p>
        <p>
          aibankinginstitute.com &middot; Request an Executive Briefing to
          discuss your results.
        </p>
      </div>
    </div>
  );
}

function ScoreInterpretation({
  score,
  tierId,
}: {
  score: number;
  tierId: Tier['id'];
}) {
  switch (tierId) {
    case 'starting-point':
      return (
        <div className="space-y-3 text-[color:var(--color-ink)]/80 leading-relaxed">
          <p>
            Based on your score of{' '}
            <strong className="font-mono tabular-nums">{score}/48</strong>:
            your institution is at the beginning of its AI journey. Most staff
            have limited exposure to AI tools, and there is no formal governance
            or training in place.
          </p>
          <p>
            This is not a problem. It is a starting position. The institutions
            that move fastest from here are the ones that start with staff
            literacy — not with a vendor purchase or a committee.
          </p>
          <p className="font-medium text-[color:var(--color-ink)]">
            Our recommendation: build foundational AI literacy across your team
            before investing in tools or automation. The AiBI-P course is
            designed exactly for this moment.
          </p>
        </div>
      );
    case 'early-stage':
      return (
        <div className="space-y-3 text-[color:var(--color-ink)]/80 leading-relaxed">
          <p>
            Based on your score of{' '}
            <strong className="font-mono tabular-nums">{score}/48</strong>:
            your institution has early adopters experimenting with AI, but
            adoption is uneven and governance is informal or absent.
          </p>
          <p>
            The risk at this stage is not that your people will fail with AI.
            It is that the experiments stay isolated — that the teller who saves
            90 minutes a week never tells the operations team, and the operations
            team never tells the board.
          </p>
          <p className="font-medium text-[color:var(--color-ink)]">
            Our recommendation: a free Executive Briefing to map the pockets of
            activity already happening inside your institution and design a path
            from scattered experiments to a coordinated program.
          </p>
        </div>
      );
    case 'building-momentum':
      return (
        <div className="space-y-3 text-[color:var(--color-ink)]/80 leading-relaxed">
          <p>
            Based on your score of{' '}
            <strong className="font-mono tabular-nums">{score}/48</strong>:
            your institution has real traction. Multiple teams are using AI,
            leadership is aware, and governance exists in some form.
          </p>
          <p>
            The next challenge is proving ROI. Leadership support will erode
            unless the early wins are documented with hard numbers — hours
            recaptured, dollars saved, processes eliminated.
          </p>
          <p className="font-medium text-[color:var(--color-ink)]">
            Our recommendation: an Operational Quick Win Sprint. Three
            automations, implemented in 4&ndash;6 weeks, with a documented
            before-and-after impact report. $5,000&ndash;$15,000 with a 90-day
            ROI guarantee.
          </p>
        </div>
      );
    case 'ready-to-scale':
      return (
        <div className="space-y-3 text-[color:var(--color-ink)]/80 leading-relaxed">
          <p>
            Based on your score of{' '}
            <strong className="font-mono tabular-nums">{score}/48</strong>:
            your institution is positioned to lead its peer group. You have the
            culture, governance, and leadership commitment to operate AI as a
            strategic capability.
          </p>
          <p>
            The opportunity now is compounding. The institutions at your tier
            are the ones that will set the standard for what community bank AI
            looks like in two years. The question is whether you codify what
            works fast enough to compound the advantage.
          </p>
          <p className="font-medium text-[color:var(--color-ink)]">
            Our recommendation: a conversation about the AiBI fCAIO program —
            a structured monthly operating system that installs capability
            transfer from day one. Your team runs the program independently
            when we leave.
          </p>
        </div>
      );
  }
}
