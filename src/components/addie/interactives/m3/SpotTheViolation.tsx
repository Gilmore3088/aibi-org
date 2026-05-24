'use client';

// SpotTheViolation — Module 3.4 interactive drill. Not an LLM exercise.
// Reads scenarios from the exercise descriptor's preset_context_blocks[0].body
// (a JSON-encoded array) and walks the learner through them one at a time
// with reveal-on-answer explanations and a final tally. Ledger styling,
// fully keyboard accessible.
//
// Seed contract (see supabase/seed/m3_addie.sql, exercise m3-4-spot-the-violation):
//   - Each scenario has exactly two options.
//   - scenario.options[0] is the CORRECT pick (its explanation is the
//     teaching explanation; its is_violation flag describes the truth of
//     the situation).
//   - scenario.options[1] is the WRONG pick (its explanation is the
//     "here is why that is wrong" line).
// This ordering keeps the JSON authorable and the widget logic boring.

import { useMemo, useState, useCallback } from 'react';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';

interface ScenarioOption {
  readonly id: string;
  readonly label: string;
  readonly is_violation: boolean;
  readonly explanation: string;
}

interface Scenario {
  readonly id: string;
  readonly situation: string;
  readonly options: ReadonlyArray<ScenarioOption>;
}

interface PresetContextBlock {
  readonly id: string;
  readonly label: string;
  readonly body?: string;
}

export interface SpotTheViolationDescriptor {
  readonly preset_context_blocks: ReadonlyArray<PresetContextBlock>;
}

export interface SpotTheViolationResult {
  readonly total: number;
  readonly correct: number;
  readonly answers: ReadonlyArray<{
    readonly scenarioId: string;
    readonly selectedOptionId: string;
    readonly correct: boolean;
  }>;
}

export interface SpotTheViolationProps {
  readonly exerciseDescriptor: SpotTheViolationDescriptor;
  readonly onComplete?: (result: SpotTheViolationResult) => void;
}

interface AnswerRecord {
  readonly scenarioId: string;
  readonly selectedOptionId: string;
  readonly correct: boolean;
}

function parseScenarios(descriptor: SpotTheViolationDescriptor): Scenario[] {
  const block = descriptor.preset_context_blocks.find((b) => b.id === 'scenarios');
  if (!block?.body) return [];
  try {
    const parsed = JSON.parse(block.body) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is Scenario => {
      if (typeof s !== 'object' || s === null) return false;
      const obj = s as Record<string, unknown>;
      return (
        typeof obj.id === 'string' &&
        typeof obj.situation === 'string' &&
        Array.isArray(obj.options) &&
        obj.options.length === 2
      );
    });
  } catch {
    return [];
  }
}

export function SpotTheViolation({
  exerciseDescriptor,
  onComplete,
}: SpotTheViolationProps) {
  const scenarios = useMemo(() => parseScenarios(exerciseDescriptor), [exerciseDescriptor]);
  const [index, setIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [finished, setFinished] = useState(false);

  const handleSelect = useCallback(
    (scenario: Scenario, option: ScenarioOption) => {
      if (selectedOptionId !== null) return; // answer locks once chosen
      const correctOption = scenario.options[0];
      const isCorrect = !!correctOption && option.id === correctOption.id;
      setSelectedOptionId(option.id);
      setAnswers((prev) => [
        ...prev,
        {
          scenarioId: scenario.id,
          selectedOptionId: option.id,
          correct: isCorrect,
        },
      ]);
    },
    [selectedOptionId]
  );

  const handleNext = useCallback(() => {
    setSelectedOptionId(null);
    if (index + 1 >= scenarios.length) {
      setFinished(true);
      const correct = answers.filter((a) => a.correct).length;
      onComplete?.({
        total: scenarios.length,
        correct,
        answers,
      });
      return;
    }
    setIndex((i) => i + 1);
  }, [index, scenarios.length, answers, onComplete]);

  const handleRestart = useCallback(() => {
    setIndex(0);
    setSelectedOptionId(null);
    setAnswers([]);
    setFinished(false);
  }, []);

  if (scenarios.length === 0) {
    return (
      <LedgerCard variant="standard" className="p-6">
        <KickerLabel tone="muted">Spot the violation</KickerLabel>
        <p className="mt-2 text-[var(--ledger-muted)]">
          No scenarios have been seeded for this exercise. Wave 2b will seed
          addie.exercises.preset_context_blocks for m3-4-spot-the-violation.
        </p>
      </LedgerCard>
    );
  }

  if (finished) {
    const correct = answers.filter((a) => a.correct).length;
    // "Missed violation" = the truth was a real violation and the learner
    // picked the non-violation option.
    const missedViolations = answers.filter((a) => {
      const scenario = scenarios.find((s) => s.id === a.scenarioId);
      const correctOption = scenario?.options[0];
      const realViolation = correctOption?.is_violation === true;
      const picked = scenario?.options.find((o) => o.id === a.selectedOptionId);
      return realViolation && picked?.is_violation === false;
    }).length;

    return (
      <LedgerCard variant="feature" className="p-6">
        <KickerLabel tone="accent">Drill complete</KickerLabel>
        <p
          className="mt-2 text-[var(--ledger-ink)] font-serif text-2xl"
          aria-live="polite"
        >
          {correct} of {scenarios.length} correct
        </p>
        {missedViolations > 0 ? (
          <p className="mt-3 text-[var(--ledger-weak)] font-semibold">
            You missed {missedViolations} real violation{missedViolations === 1 ? '' : 's'}
            {' '}— re-run the drill to lock it in.
          </p>
        ) : (
          <p className="mt-3 text-[var(--ledger-ink-2)]">
            Clean run. Carry the instinct into Lesson 3.5.
          </p>
        )}
        <div className="mt-5">
          <LedgerButton variant="secondary" onClick={handleRestart}>
            Restart drill
          </LedgerButton>
        </div>
      </LedgerCard>
    );
  }

  const scenario = scenarios[index];
  if (!scenario) return null;
  const correctOption = scenario.options[0];
  const selected = scenario.options.find((o) => o.id === selectedOptionId) ?? null;
  const isCorrect = selected !== null && selected.id === correctOption?.id;
  const missedRealViolation =
    selected !== null &&
    selected.is_violation === false &&
    correctOption?.is_violation === true;

  return (
    <section aria-labelledby="stv-heading" className="space-y-4">
      <header className="flex items-baseline justify-between">
        <KickerLabel tone="muted">
          Scenario {index + 1} of {scenarios.length}
        </KickerLabel>
        <KickerLabel tone="muted">
          {answers.filter((a) => a.correct).length} correct
        </KickerLabel>
      </header>

      <LedgerCard variant="standard" className="p-6">
        <h3 id="stv-heading" className="font-serif text-xl text-[var(--ledger-ink)]">
          {scenario.situation}
        </h3>

        <div
          role="radiogroup"
          aria-label="Is this a violation?"
          className="mt-5 grid gap-3 sm:grid-cols-2"
        >
          {scenario.options.map((option) => {
            const isSelected = option.id === selectedOptionId;
            const showCorrect =
              selectedOptionId !== null && option.id === correctOption?.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={selectedOptionId !== null}
                onClick={() => handleSelect(scenario, option)}
                className={`text-left p-4 rounded-[3px] border transition-colors duration-[120ms] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ledger-ink)] ${
                  showCorrect
                    ? 'border-[var(--ledger-accent)] bg-[var(--ledger-paper)]'
                    : isSelected
                      ? 'border-[var(--ledger-weak)] bg-[var(--ledger-paper)]'
                      : 'border-[var(--ledger-rule)] bg-[var(--ledger-paper)] hover:border-[var(--ledger-rule-strong)]'
                } disabled:cursor-default`}
              >
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--ledger-muted)]">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>

        {selected !== null ? (
          <div
            className={`mt-5 p-4 rounded-[3px] border ${
              missedRealViolation
                ? 'border-[var(--ledger-weak)] bg-[var(--ledger-paper)]'
                : isCorrect
                  ? 'border-[var(--ledger-accent)] bg-[var(--ledger-tape)]'
                  : 'border-[var(--ledger-rule)] bg-[var(--ledger-parch)]'
            }`}
            aria-live="polite"
          >
            <KickerLabel tone={missedRealViolation ? 'accent' : 'muted'}>
              {missedRealViolation
                ? 'You missed a violation'
                : isCorrect
                  ? 'Correct'
                  : 'Not quite'}
            </KickerLabel>
            <p className="mt-2 text-[var(--ledger-ink-2)]">{selected.explanation}</p>
          </div>
        ) : null}

        <div className="mt-5 flex justify-end">
          <LedgerButton
            variant="primary"
            disabled={selectedOptionId === null}
            onClick={handleNext}
          >
            {index + 1 >= scenarios.length ? 'See result' : 'Next scenario'}
          </LedgerButton>
        </div>
      </LedgerCard>
    </section>
  );
}
