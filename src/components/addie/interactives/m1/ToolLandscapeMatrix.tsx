'use client';

// ToolLandscapeMatrix — Module 1, Lesson 2 interactive.
// Learner places ~12 named generative AI tools into a 2×2 matrix.
//   Horizontal axis (GRADED):       Just chats  ↔  Builds things
//   Vertical axis (informational):  Free tier   ↔  Paid tier
//
// On submit, the horizontal axis is scored. Vendor URLs are revealed for
// tools placed in the correct horizontal half. The learner's full placement
// is handed back via onComplete so the lesson can persist it as the
// AI Toolkit Map artifact.
//
// Keyboard-first: each tool is a roving-tabindex item with arrow-key
// movement between quadrants and Enter/Space to drop. HTML5 drag is also
// supported for pointer users.

import { useCallback, useMemo, useState } from 'react';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';

export type AssistantOrBuilder = 'assistant' | 'builder';
export type PricingTier = 'free' | 'paid';

export interface ToolDefinition {
  readonly name: string;
  readonly hint: string;
  readonly ground_truth_category: AssistantOrBuilder;
  readonly vendor_url: string | null;
}

export type QuadrantId =
  | 'assistant_free'
  | 'assistant_paid'
  | 'builder_free'
  | 'builder_paid';

export interface ToolPlacement {
  readonly tool: string;
  readonly quadrant: QuadrantId;
  readonly horizontal: AssistantOrBuilder;
  readonly pricing: PricingTier;
}

interface PresetContextBlock {
  readonly id: string;
  readonly label: string;
  readonly body?: string;
}

interface ExerciseDescriptor {
  readonly id: string;
  readonly preset_context_blocks?: ReadonlyArray<PresetContextBlock>;
}

export interface ToolLandscapeMatrixProps {
  readonly exerciseDescriptor: ExerciseDescriptor;
  readonly onComplete?: (result: {
    readonly placements: ReadonlyArray<ToolPlacement>;
    readonly correct: number;
    readonly total: number;
  }) => void;
}

interface QuadrantDef {
  readonly id: QuadrantId;
  readonly horizontal: AssistantOrBuilder;
  readonly pricing: PricingTier;
  readonly label: string;
}

const QUADRANTS: ReadonlyArray<QuadrantDef> = [
  { id: 'assistant_free', horizontal: 'assistant', pricing: 'free', label: 'Just chats · Free tier' },
  { id: 'assistant_paid', horizontal: 'assistant', pricing: 'paid', label: 'Just chats · Paid tier' },
  { id: 'builder_free', horizontal: 'builder', pricing: 'free', label: 'Builds things · Free tier' },
  { id: 'builder_paid', horizontal: 'builder', pricing: 'paid', label: 'Builds things · Paid tier' },
];

const UNPLACED: 'unplaced' = 'unplaced';
type Bucket = QuadrantId | typeof UNPLACED;

function parseTools(descriptor: ExerciseDescriptor): ReadonlyArray<ToolDefinition> {
  const block = descriptor.preset_context_blocks?.find((b) => b.id === 'tools');
  const raw = block?.body;
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isToolDefinition);
  } catch {
    return [];
  }
}

function isToolDefinition(value: unknown): value is ToolDefinition {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === 'string' &&
    typeof v.hint === 'string' &&
    (v.ground_truth_category === 'assistant' || v.ground_truth_category === 'builder') &&
    (v.vendor_url === null || typeof v.vendor_url === 'string')
  );
}

interface PlacementState {
  readonly [toolName: string]: Bucket;
}

function initialPlacements(tools: ReadonlyArray<ToolDefinition>): PlacementState {
  const out: Record<string, Bucket> = {};
  for (const t of tools) out[t.name] = UNPLACED;
  return out;
}

function toolsIn(placements: PlacementState, bucket: Bucket): ReadonlyArray<string> {
  return Object.entries(placements)
    .filter(([, b]) => b === bucket)
    .map(([name]) => name);
}

export function ToolLandscapeMatrix({
  exerciseDescriptor,
  onComplete,
}: ToolLandscapeMatrixProps) {
  const tools = useMemo(() => parseTools(exerciseDescriptor), [exerciseDescriptor]);
  const toolsByName = useMemo(() => {
    const m = new Map<string, ToolDefinition>();
    for (const t of tools) m.set(t.name, t);
    return m;
  }, [tools]);

  const [placements, setPlacements] = useState<PlacementState>(() => initialPlacements(tools));
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const placeTool = useCallback((toolName: string, bucket: Bucket) => {
    setPlacements((prev) => {
      if (prev[toolName] === bucket) return prev;
      return { ...prev, [toolName]: bucket };
    });
  }, []);

  const onKeyDownTool = useCallback(
    (toolName: string, e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (submitted) return;
      const order: ReadonlyArray<Bucket> = [
        UNPLACED,
        'assistant_free',
        'assistant_paid',
        'builder_free',
        'builder_paid',
      ];
      const current = placements[toolName] ?? UNPLACED;
      const idx = order.indexOf(current);

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActiveTool((prev) => (prev === toolName ? null : toolName));
        return;
      }

      // Movement keys cycle through buckets directly.
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = order[(idx + 1) % order.length];
        if (next !== undefined) placeTool(toolName, next);
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const next = order[(idx - 1 + order.length) % order.length];
        if (next !== undefined) placeTool(toolName, next);
      }
    },
    [placeTool, placements, submitted],
  );

  const allPlaced = useMemo(
    () => tools.length > 0 && tools.every((t) => placements[t.name] !== UNPLACED),
    [placements, tools],
  );

  const onSubmit = useCallback(() => {
    if (!allPlaced || submitted) return;
    setSubmitted(true);

    const finalised: ToolPlacement[] = [];
    let correct = 0;
    for (const t of tools) {
      const bucket = placements[t.name];
      if (bucket === undefined || bucket === UNPLACED) continue;
      const q = QUADRANTS.find((x) => x.id === bucket);
      if (!q) continue;
      finalised.push({
        tool: t.name,
        quadrant: q.id,
        horizontal: q.horizontal,
        pricing: q.pricing,
      });
      if (q.horizontal === t.ground_truth_category) correct += 1;
    }
    onComplete?.({ placements: finalised, correct, total: tools.length });
  }, [allPlaced, onComplete, placements, submitted, tools]);

  if (tools.length === 0) {
    return (
      <LedgerCard variant="recessed" className="p-5">
        <p className="text-sm text-[var(--ledger-muted)]">
          No tools available for this exercise yet.
        </p>
      </LedgerCard>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <KickerLabel tone="muted">Tool landscape · 2×2 sort</KickerLabel>
        <span className="font-mono text-xs text-[var(--ledger-muted)] tabular-nums">
          {tools.length - toolsIn(placements, UNPLACED).length}/{tools.length} placed
        </span>
      </div>

      <UnplacedTray
        tools={toolsIn(placements, UNPLACED).map((n) => toolsByName.get(n)).filter(isDefined)}
        activeTool={activeTool}
        submitted={submitted}
        onActivate={(name) => setActiveTool((prev) => (prev === name ? null : name))}
        onKeyDown={onKeyDownTool}
        onDropTo={(name) => {
          placeTool(name, UNPLACED);
          setActiveTool(null);
        }}
        onZoneClick={() => {
          if (activeTool && !submitted) {
            placeTool(activeTool, UNPLACED);
            setActiveTool(null);
          }
        }}
      />

      <Matrix
        placements={placements}
        toolsByName={toolsByName}
        submitted={submitted}
        activeTool={activeTool}
        onActivate={(name) => setActiveTool((prev) => (prev === name ? null : name))}
        onKeyDown={onKeyDownTool}
        onDropTo={(name, bucket) => {
          placeTool(name, bucket);
          setActiveTool(null);
        }}
        onZoneClick={(bucket) => {
          if (activeTool && !submitted) {
            placeTool(activeTool, bucket);
            setActiveTool(null);
          }
        }}
      />

      {!submitted ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--ledger-muted)]">
            Use the mouse, or focus a tool and press the arrow keys to cycle through quadrants.
          </p>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!allPlaced}
            className={ledgerPrimaryButton}
          >
            Score the sort
          </button>
        </div>
      ) : (
        <ResultSummary
          tools={tools}
          placements={placements}
        />
      )}
    </div>
  );
}

interface UnplacedTrayProps {
  readonly tools: ReadonlyArray<ToolDefinition>;
  readonly activeTool: string | null;
  readonly submitted: boolean;
  readonly onActivate: (name: string) => void;
  readonly onKeyDown: (name: string, e: React.KeyboardEvent<HTMLButtonElement>) => void;
  readonly onDropTo: (name: string) => void;
  readonly onZoneClick: () => void;
}

function UnplacedTray({
  tools,
  activeTool,
  submitted,
  onActivate,
  onKeyDown,
  onDropTo,
  onZoneClick,
}: UnplacedTrayProps) {
  return (
    <LedgerCard
      variant="recessed"
      className="p-4"
      data-testid="unplaced-tray"
      onClick={onZoneClick}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const name = e.dataTransfer.getData('text/plain');
        if (name) onDropTo(name);
      }}
    >
      <KickerLabel tone="muted">Unplaced</KickerLabel>
      <div
        className="mt-2 flex flex-wrap gap-2 min-h-[2.5rem]"
      >
        {tools.length === 0 ? (
          <p className="text-xs text-[var(--ledger-muted)]">
            Everything placed. Review the matrix and score the sort.
          </p>
        ) : (
          tools.map((t) => (
            <ToolChip
              key={t.name}
              tool={t}
              isActive={activeTool === t.name}
              submitted={submitted}
              onActivate={() => onActivate(t.name)}
              onKeyDown={(e) => onKeyDown(t.name, e)}
            />
          ))
        )}
      </div>
    </LedgerCard>
  );
}

interface MatrixProps {
  readonly placements: PlacementState;
  readonly toolsByName: ReadonlyMap<string, ToolDefinition>;
  readonly submitted: boolean;
  readonly activeTool: string | null;
  readonly onActivate: (name: string) => void;
  readonly onKeyDown: (name: string, e: React.KeyboardEvent<HTMLButtonElement>) => void;
  readonly onDropTo: (name: string, bucket: QuadrantId) => void;
  readonly onZoneClick: (bucket: QuadrantId) => void;
}

function Matrix({
  placements,
  toolsByName,
  submitted,
  activeTool,
  onActivate,
  onKeyDown,
  onDropTo,
  onZoneClick,
}: MatrixProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em] text-[var(--ledger-muted)]">
        <span>Just chats</span>
        <span>Builds things</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {QUADRANTS.map((q) => {
          const names = toolsIn(placements, q.id);
          return (
            <LedgerCard
              key={q.id}
              variant="standard"
              className="p-3 min-h-[8rem]"
              data-testid={`quadrant-${q.id}`}
              onClick={() => onZoneClick(q.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const name = e.dataTransfer.getData('text/plain');
                if (name) onDropTo(name, q.id);
              }}
            >
              <div className="flex items-baseline justify-between">
                <KickerLabel tone={q.horizontal === 'builder' ? 'accent' : 'muted'}>
                  {q.label}
                </KickerLabel>
              </div>
              <div
                className="mt-2 flex flex-wrap gap-2"
              >
                {names.length === 0 ? (
                  <p className="text-xs text-[var(--ledger-muted)]">Empty.</p>
                ) : (
                  names
                    .map((n) => toolsByName.get(n))
                    .filter(isDefined)
                    .map((t) => {
                      const correct =
                        submitted && t.ground_truth_category === q.horizontal;
                      const incorrect =
                        submitted && t.ground_truth_category !== q.horizontal;
                      return (
                        <ToolChip
                          key={t.name}
                          tool={t}
                          isActive={activeTool === t.name}
                          submitted={submitted}
                          isCorrect={correct}
                          isIncorrect={incorrect}
                          onActivate={() => onActivate(t.name)}
                          onKeyDown={(e) => onKeyDown(t.name, e)}
                        />
                      );
                    })
                )}
              </div>
            </LedgerCard>
          );
        })}
      </div>
    </div>
  );
}

interface ToolChipProps {
  readonly tool: ToolDefinition;
  readonly isActive: boolean;
  readonly submitted: boolean;
  readonly isCorrect?: boolean;
  readonly isIncorrect?: boolean;
  readonly onActivate: () => void;
  readonly onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

function ToolChip({
  tool,
  isActive,
  submitted,
  isCorrect,
  isIncorrect,
  onActivate,
  onKeyDown,
}: ToolChipProps) {
  const showLink = submitted && isCorrect === true && tool.vendor_url !== null;
  const borderColor = isIncorrect
    ? 'var(--ledger-weak)'
    : isCorrect
      ? 'var(--ledger-accent)'
      : 'var(--ledger-rule)';
  return (
    <span className="inline-flex flex-col items-stretch">
      <button
        type="button"
        aria-pressed={isActive}
        aria-label={`${tool.name} — ${tool.hint}`}
        title={tool.hint}
        draggable={!submitted}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', tool.name);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onActivate();
        }}
        onKeyDown={onKeyDown}
        disabled={submitted}
        className={
          'rounded-[2px] border bg-[var(--ledger-paper)] px-3 py-2 ' +
          'font-mono text-xs uppercase tracking-[0.16em] ' +
          'text-[var(--ledger-ink)] transition-colors duration-[120ms] ' +
          'hover:border-[var(--ledger-rule-strong)] ' +
          'focus:outline-none focus:ring-2 focus:ring-[var(--ledger-accent)] focus:ring-offset-2 ' +
          'disabled:cursor-default ' +
          (isActive ? 'shadow-[var(--ledger-shadow)] ' : '')
        }
        style={{ borderColor }}
      >
        {tool.name}
      </button>
      {showLink && tool.vendor_url !== null ? (
        <a
          href={tool.vendor_url}
          target="_blank"
          rel="noopener noreferrer"
          className={
            'mt-1 font-mono text-[10px] uppercase tracking-[0.18em] ' +
            'text-[var(--ledger-accent)] hover:underline ' +
            'focus:outline-none focus:ring-2 focus:ring-[var(--ledger-accent)]'
          }
        >
          Vendor link
        </a>
      ) : null}
    </span>
  );
}

interface ResultSummaryProps {
  readonly tools: ReadonlyArray<ToolDefinition>;
  readonly placements: PlacementState;
}

function ResultSummary({ tools, placements }: ResultSummaryProps) {
  let correct = 0;
  for (const t of tools) {
    const bucket = placements[t.name];
    const q = QUADRANTS.find((x) => x.id === bucket);
    if (q && q.horizontal === t.ground_truth_category) correct += 1;
  }
  return (
    <LedgerCard variant="feature" className="p-5" aria-live="polite">
      <KickerLabel tone="accent">Scored</KickerLabel>
      <h3 className="mt-2 font-serif text-2xl text-[var(--ledger-ink)]">
        {correct} of {tools.length} on the assistant-vs-builder axis.
      </h3>
      <p className="mt-2 text-[var(--ledger-ink-2)]">
        Vendor links are revealed for the tools you placed in the correct horizontal half. The
        pricing axis is informational — tiers change often. Save the placement to your Toolbox
        as your AI Toolkit Map.
      </p>
    </LedgerCard>
  );
}

const ledgerPrimaryButton =
  'rounded-[2px] border border-[var(--ledger-ink)] bg-[var(--ledger-ink)] px-4 py-2 ' +
  'font-mono text-xs uppercase tracking-[0.18em] text-[var(--ledger-paper)] ' +
  'transition-colors duration-[120ms] hover:bg-[var(--ledger-ink-2)] ' +
  'focus:outline-none focus:ring-2 focus:ring-[var(--ledger-accent)] focus:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

function isDefined<T>(v: T | undefined): v is T {
  return v !== undefined;
}
