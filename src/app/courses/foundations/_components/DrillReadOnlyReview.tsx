// DrillReadOnlyReview — Score summary and per-scenario annotations
// shown after a ClassificationDrill is completed or already submitted.

import { CheckIcon, XIcon, ClockIcon } from './DrillIcons';

interface DrillScenario {
  readonly scenario: string;
  readonly tier: string;
  readonly reasoning: string;
}

interface DrillAnswer {
  readonly scenarioIndex: number;
  readonly selected: string | null;
  readonly correct: string;
  readonly timeRemaining: number;
}

export function tierToValue(tier: string): string {
  if (tier.startsWith('Tier 1')) return 'tier-1';
  if (tier.startsWith('Tier 2')) return 'tier-2';
  if (tier.startsWith('Tier 3')) return 'tier-3';
  return 'tier-1';
}

export function valueToLabel(value: string | null): string {
  if (value === 'tier-1') return 'Tier 1 — Public Information';
  if (value === 'tier-2') return 'Tier 2 — Internal Only';
  if (value === 'tier-3') return 'Tier 3 — Highly Restricted';
  if (value === 'no-answer') return 'Time expired — no answer';
  return '—';
}

interface DrillReadOnlyReviewProps {
  readonly scenarios: readonly DrillScenario[];
  readonly answers: readonly DrillAnswer[];
  readonly score: number;
}

export function DrillReadOnlyReview({
  scenarios,
  answers,
  score,
}: DrillReadOnlyReviewProps) {
  const pct = Math.round((score / answers.length) * 100);
  const tier1 = { correct: 0, total: 0 };
  const tier2 = { correct: 0, total: 0 };
  const tier3 = { correct: 0, total: 0 };

  for (const a of answers) {
    const sc = scenarios[a.scenarioIndex];
    if (!sc) continue;
    const tier = tierToValue(sc.tier);
    if (tier === 'tier-1') {
      tier1.total++;
      if (a.selected === tier) tier1.correct++;
    } else if (tier === 'tier-2') {
      tier2.total++;
      if (a.selected === tier) tier2.correct++;
    } else {
      tier3.total++;
      if (a.selected === tier) tier3.correct++;
    }
  }

  return (
    <div className="space-y-6">
      {/* Score summary */}
      <div className="text-center py-6 bg-[color:var(--color-parch)] rounded-sm">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-1">
          Drill Score
        </p>
        <p className="font-serif text-5xl font-bold text-[color:var(--color-ink)]">
          {score}/{answers.length}
        </p>
        <p className="font-mono text-sm text-[color:var(--color-slate)] mt-1">{pct}% correct</p>
      </div>

      {/* Tier breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tier 1 — Public', ...tier1 },
          { label: 'Tier 2 — Internal', ...tier2 },
          { label: 'Tier 3 — Restricted', ...tier3 },
        ].map((t) => (
          <div
            key={t.label}
            className="text-center py-3 px-2 bg-[color:var(--color-parch)] rounded-sm border border-[color:var(--color-parch-dark)]"
          >
            <p className="font-mono text-[10px] text-[color:var(--color-slate)] mb-1 leading-tight">
              {t.label}
            </p>
            <p className="font-mono text-xl font-bold text-[color:var(--color-ink)]">
              {t.correct}/{t.total}
            </p>
          </div>
        ))}
      </div>

      {/* Per-scenario annotations */}
      <div className="space-y-3">
        {answers.map((a, i) => {
          const sc = scenarios[a.scenarioIndex];
          if (!sc) return null;
          const correctValue = tierToValue(sc.tier);
          const isCorrect = a.selected === correctValue;
          const isTimeout = a.selected === 'no-answer' || a.selected === null;

          return (
            <div
              key={i}
              className={[
                'p-4 rounded-sm border',
                isCorrect
                  ? 'border-[color:var(--color-sage)]/40 bg-[color:var(--color-sage)]/5'
                  : isTimeout
                    ? 'border-amber-400/40 bg-amber-50'
                    : 'border-[color:var(--color-error)]/30 bg-[color:var(--color-error)]/5',
              ].join(' ')}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    'mt-0.5 shrink-0 flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest',
                    isCorrect
                      ? 'text-[color:var(--color-sage)]'
                      : isTimeout
                        ? 'text-amber-600'
                        : 'text-[color:var(--color-error)]',
                  ].join(' ')}
                >
                  {isCorrect ? (
                    <>
                      <CheckIcon />
                      Correct
                    </>
                  ) : isTimeout ? (
                    <>
                      <ClockIcon />
                      Time expired
                    </>
                  ) : (
                    <>
                      <XIcon />
                      Incorrect
                    </>
                  )}
                </div>
                <p className="text-[10px] font-mono text-[color:var(--color-slate)] leading-tight">
                  Scenario {a.scenarioIndex + 1} of {answers.length}
                </p>
              </div>

              <p className="mt-2 text-sm font-sans text-[color:var(--color-ink)] leading-relaxed">
                {sc.scenario}
              </p>

              {!isCorrect && (
                <div className="mt-3 pt-3 border-t border-current/10 space-y-1">
                  <p className="text-xs font-mono text-[color:var(--color-slate)]">
                    Your answer:{' '}
                    <span className="text-[color:var(--color-ink)]">
                      {valueToLabel(a.selected)}
                    </span>
                  </p>
                  <p className="text-xs font-mono text-[color:var(--color-slate)]">
                    Correct answer:{' '}
                    <span className="font-semibold text-[color:var(--color-ink)]">
                      {valueToLabel(correctValue)}
                    </span>
                  </p>
                  <p className="text-xs font-sans text-[color:var(--color-slate)] mt-2">
                    {sc.reasoning}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
