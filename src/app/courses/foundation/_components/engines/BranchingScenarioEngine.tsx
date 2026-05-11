'use client';

// BranchingScenarioEngine — real Activity Type 4 engine.
// Pure client component: deterministic state machine over a tree of nodes.
// No API calls, no external state. Author-supplied scenario tree drives the UI.
//
// Used wherever a module activity has a scenarioConfig field — currently the
// adaptive-scenario activity types and any others where authors choose to
// drive interactive choice through this engine (member dialogues, regulatory
// routing, examiner Q&A, role scenarios, etc.).
//
// Accessibility:
//   - Each node updates an aria-live region so screen-readers announce state
//     changes.
//   - Choices are real <button> elements with clear focus rings.
//   - Consequences and the endingRubric appear inline; no modals.
//   - Reset is one click and announces the restart.

import { useState, useCallback, useMemo } from 'react';
import type {
  BranchingScenarioConfig,
  ScenarioNode,
  ScenarioChoice,
} from '@content/courses/aibi-foundation';

interface BranchingScenarioEngineProps {
  readonly config: BranchingScenarioConfig;
  /** Optional callback when the learner reaches an END node. Used by the
   * route layer to record completion telemetry once persistence ships. */
  readonly onComplete?: (path: PathEntry[]) => void;
}

interface PathEntry {
  readonly nodeId: string;
  readonly choiceId?: string; // undefined for the final ending node
  readonly verdict?: ScenarioChoice['verdict'];
}

const VERDICT_META: Record<NonNullable<ScenarioChoice['verdict']>, { readonly label: string; readonly color: string }> = {
  best: { label: 'Best path', color: 'var(--color-sage)' },
  partial: { label: 'Partial credit', color: 'var(--color-amber)' },
  wrong: { label: 'Wrong path', color: 'var(--color-error, #9b2226)' },
  catastrophic: { label: 'Catastrophic', color: 'var(--color-error, #9b2226)' },
};

export function BranchingScenarioEngine({ config, onComplete }: BranchingScenarioEngineProps) {
  const nodeMap = useMemo(() => {
    const m = new Map<string, ScenarioNode>();
    for (const n of config.nodes) m.set(n.id, n);
    return m;
  }, [config.nodes]);

  const [path, setPath] = useState<PathEntry[]>(() => [{ nodeId: config.startNodeId }]);
  const [pendingConsequence, setPendingConsequence] = useState<string | null>(null);

  const currentNodeId = path[path.length - 1].nodeId;
  const currentNode = nodeMap.get(currentNodeId);
  const isEnded = !currentNode || (currentNode && (!currentNode.choices || currentNode.choices.length === 0));

  const handleChoice = useCallback(
    (choice: ScenarioChoice) => {
      const nextNodeId = choice.nextNodeId;
      // Record the choice on the current node, then advance to next.
      setPath((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = { ...last, choiceId: choice.id, verdict: choice.verdict };
        updated.push({ nodeId: nextNodeId });
        return updated;
      });
      if (choice.consequence) {
        setPendingConsequence(choice.consequence);
      }
    },
    [],
  );

  const handleReset = useCallback(() => {
    setPath([{ nodeId: config.startNodeId }]);
    setPendingConsequence(null);
  }, [config.startNodeId]);

  // Fire onComplete once when reaching an end node.
  const completionFiredRef = useMemo(() => ({ value: false }), []);
  if (isEnded && !completionFiredRef.value && onComplete) {
    completionFiredRef.value = true;
    // defer to avoid setState-during-render warning
    queueMicrotask(() => onComplete(path));
  }

  if (!currentNode) {
    // Defensive: missing node means a config bug; render a recoverable message
    // rather than crashing the whole module page.
    return (
      <div className="bg-[color:var(--color-parch)] p-4 border-l-2 border-[color:var(--color-error,#9b2226)]">
        <p className="font-mono text-[11px] uppercase tracking-[0.10em] text-[color:var(--color-error,#9b2226)] mb-1">
          Scenario configuration error
        </p>
        <p className="text-sm text-[color:var(--color-ink)]">
          Node <code className="font-mono">{currentNodeId}</code> was not found in the scenario tree. The author should review the activity config.
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="mt-3 font-mono text-[11px] uppercase tracking-[0.10em] py-1 px-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)]"
        >
          Restart
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4" aria-live="polite">
      {config.intro && path.length === 1 && (
        <p className="text-sm text-[color:var(--color-muted,#5b5346)] italic mb-4">
          {config.intro}
        </p>
      )}

      {/* Path so far — compact breadcrumb of nodes already passed */}
      {path.length > 1 && (
        <ol className="flex flex-wrap gap-1 mb-3" aria-label="Path so far">
          {path.slice(0, -1).map((entry, i) => {
            const verdict = entry.verdict;
            const dotColor = verdict ? VERDICT_META[verdict].color : 'var(--color-muted, #5b5346)';
            return (
              <li
                key={`${entry.nodeId}-${i}`}
                className="font-mono text-[10px] tabular-nums text-[color:var(--color-muted,#5b5346)] flex items-center gap-1"
              >
                <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} aria-hidden="true" />
                <span>step {i + 1}</span>
                {i < path.length - 2 && <span aria-hidden="true">·</span>}
              </li>
            );
          })}
        </ol>
      )}

      {/* Consequence reveal — shown after a choice that has one, before the next prompt */}
      {pendingConsequence && (
        <aside
          role="status"
          className="bg-[color:var(--color-parch)] border-l-2 border-[color:var(--color-amber)] py-3 px-4 mb-4"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-[color:var(--color-amber)] mb-1">
            Consequence
          </p>
          <p className="text-sm text-[color:var(--color-ink)] leading-relaxed">{pendingConsequence}</p>
          <button
            type="button"
            onClick={() => setPendingConsequence(null)}
            className="mt-3 font-mono text-[11px] uppercase tracking-[0.10em] py-1 px-3 border border-[color:var(--color-rule,#d8cfbe)] hover:bg-[color:var(--color-linen)] transition-colors"
          >
            Continue
          </button>
        </aside>
      )}

      {!pendingConsequence && (
        <>
          {/* Current node */}
          <div className="bg-[color:var(--color-linen)] border border-[color:var(--color-rule,#d8cfbe)] py-4 px-5">
            {currentNode.speaker && (
              <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-[color:var(--color-muted,#5b5346)] mb-2">
                {currentNode.speaker}
              </p>
            )}
            <p className="text-[color:var(--color-ink)] leading-relaxed">
              {currentNode.prompt}
            </p>
          </div>

          {/* Ending state */}
          {isEnded && (
            <div className="bg-[color:var(--color-parch)] border-l-4 py-4 px-5"
              style={{ borderLeftColor: currentNode.endingVerdict ? VERDICT_META[currentNode.endingVerdict].color : 'var(--color-sage)' }}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.10em] mb-2"
                style={{ color: currentNode.endingVerdict ? VERDICT_META[currentNode.endingVerdict].color : 'var(--color-sage)' }}
              >
                {currentNode.endingVerdict ? VERDICT_META[currentNode.endingVerdict].label : 'Scenario complete'}
              </p>
              {currentNode.endingRubric && (
                <p className="text-[color:var(--color-ink)] leading-relaxed mb-3">
                  {currentNode.endingRubric}
                </p>
              )}
              {config.bestPathHint && (
                <p className="text-sm text-[color:var(--color-muted,#5b5346)] italic mb-3">
                  {config.bestPathHint}
                </p>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="font-mono text-[11px] uppercase tracking-[0.10em] py-1 px-3 border border-[color:var(--color-rule,#d8cfbe)] hover:bg-[color:var(--color-linen)] transition-colors"
              >
                Run again
              </button>
            </div>
          )}

          {/* Choices */}
          {currentNode.choices && currentNode.choices.length > 0 && (
            <ul className="space-y-2" aria-label="Choices">
              {currentNode.choices.map((choice) => (
                <li key={choice.id}>
                  <button
                    type="button"
                    onClick={() => handleChoice(choice)}
                    className="w-full text-left bg-[color:var(--color-linen)] hover:bg-[color:var(--color-parch)] border border-[color:var(--color-rule,#d8cfbe)] hover:border-[color:var(--color-terra)] focus:outline-none focus:border-[color:var(--color-terra)] focus:ring-1 focus:ring-[color:var(--color-terra)] py-3 px-4 transition-colors text-[color:var(--color-ink)]"
                  >
                    {choice.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
