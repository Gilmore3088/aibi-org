'use client';

// PrototypeLauncher — Module 5.4 interactive. Non-LLM.
// Reads a tools list from the exercise descriptor's preset_context_blocks
// (block id = "tools", body = JSON array of {id,name,url,best_for}).
// Renders four cards with link-out buttons (target=_blank, rel=noopener
// noreferrer) and a save form where the learner picks the tool used,
// pastes their prototype URL, and writes a one-paragraph description.
// Saves to Toolbox as type='prototype'.
//
// SECURITY/SCOPE NOTE: there is no server-side URL validation in v1. The
// learner is trusted to paste a URL they own. We do a light client-side
// well-formedness check (URL constructor + http(s) protocol) so we do not
// store obvious junk, but a malicious paste of an arbitrary URL would
// reach the Toolbox row. Flagged in the M5 build report.

import { useCallback, useMemo, useState } from 'react';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import { LedgerInput } from '@/components/addie/shared/LedgerInput';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { detectPII, PIIWarning } from '@/components/addie/shared/PIIWarning';
import { SaveAsArtifactButton } from '@/components/addie/lesson/SaveAsArtifactButton';
import type { Track } from '@/components/addie/lesson/types';

interface PresetContextBlock {
  readonly id: string;
  readonly label: string;
  readonly body?: string;
}

interface ExerciseDescriptor {
  readonly id: string;
  readonly preset_context_blocks?: ReadonlyArray<PresetContextBlock>;
}

export interface PrototypeTool {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly best_for: string;
}

export interface PrototypeLauncherProps {
  readonly exerciseDescriptor: ExerciseDescriptor;
  readonly track?: Track | null;
  readonly lessonId?: string;
}

function isTool(value: unknown): value is PrototypeTool {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.url === 'string' &&
    typeof v.best_for === 'string'
  );
}

function parseTools(descriptor: ExerciseDescriptor): PrototypeTool[] {
  const block = descriptor.preset_context_blocks?.find((b) => b.id === 'tools');
  if (!block?.body) return [];
  try {
    const parsed: unknown = JSON.parse(block.body);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTool);
  } catch {
    return [];
  }
}

function isWellFormedHttpUrl(value: string): boolean {
  if (!value.trim()) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function renderMarkdown(
  tool: PrototypeTool,
  url: string,
  whatItDoes: string,
): string {
  const today = new Date().toISOString().slice(0, 10);
  return [
    '# Prototype',
    '',
    `_Saved ${today} · Lesson 5.4 · Module 5_`,
    '',
    '## Tool used',
    '',
    `${tool.name} (${tool.url})`,
    '',
    '## Prototype URL',
    '',
    url,
    '',
    '## What it does',
    '',
    whatItDoes,
    '',
    '## What is next',
    '',
    '_Add a sentence or two when you decide whether to keep building this, hand it off, or shelve it._',
    '',
  ].join('\n');
}

export function PrototypeLauncher({
  exerciseDescriptor,
  track = null,
  lessonId = 'm5.4',
}: PrototypeLauncherProps) {
  const tools = useMemo(() => parseTools(exerciseDescriptor), [exerciseDescriptor]);
  const [selectedToolId, setSelectedToolId] = useState<string>('');
  const [protoUrl, setProtoUrl] = useState('');
  const [whatItDoes, setWhatItDoes] = useState('');

  const selectedTool = tools.find((t) => t.id === selectedToolId) ?? null;
  const urlIsValid = isWellFormedHttpUrl(protoUrl);
  const descriptionLongEnough = whatItDoes.trim().length >= 20;
  const hasPII = detectPII(whatItDoes) || detectPII(protoUrl);
  const canSave =
    selectedTool !== null && urlIsValid && descriptionLongEnough && !hasPII;

  const markdown = useMemo(() => {
    if (!selectedTool) return '';
    return renderMarkdown(selectedTool, protoUrl.trim(), whatItDoes.trim());
  }, [selectedTool, protoUrl, whatItDoes]);

  const handleUrlChange = useCallback((value: string) => {
    setProtoUrl(value);
  }, []);

  if (tools.length === 0) {
    return (
      <LedgerCard variant="recessed" className="p-5">
        <p className="text-sm text-[var(--ledger-muted)]">
          No prototyping tools seeded for this exercise.
        </p>
      </LedgerCard>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <KickerLabel tone="muted">Pick a tool · open in new tab</KickerLabel>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {tools.map((tool) => {
            const isSelected = tool.id === selectedToolId;
            return (
              <LedgerCard
                key={tool.id}
                variant="standard"
                className={
                  'p-4 transition-colors duration-[120ms] ' +
                  (isSelected
                    ? 'border-[var(--ledger-accent)]'
                    : 'hover:border-[var(--ledger-rule-strong)]')
                }
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-serif text-lg text-[var(--ledger-ink)]">
                    {tool.name}
                  </h3>
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[var(--ledger-muted)]">
                    {tool.id}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--ledger-ink-2)]">
                  Best for: {tool.best_for}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={
                      'inline-flex items-center font-mono text-xs uppercase tracking-[0.18em] ' +
                      'border border-[var(--ledger-ink)] text-[var(--ledger-ink)] ' +
                      'rounded-[2px] px-3 py-2 ' +
                      'hover:bg-[var(--ledger-ink)] hover:text-[var(--ledger-paper)] ' +
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ' +
                      'focus-visible:outline-[var(--ledger-ink)]'
                    }
                  >
                    Open {tool.name}
                  </a>
                  <LedgerButton
                    variant={isSelected ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setSelectedToolId(tool.id)}
                    aria-pressed={isSelected}
                  >
                    {isSelected ? 'Selected' : 'I am using this'}
                  </LedgerButton>
                </div>
              </LedgerCard>
            );
          })}
        </div>
      </div>

      <LedgerCard variant="standard" className="p-5 space-y-5">
        <div>
          <KickerLabel tone="muted">Save prototype reference</KickerLabel>
          <p className="mt-2 text-sm text-[var(--ledger-ink-2)]">
            When your build is done enough to click through, come back and
            save the URL plus a one-paragraph description of what it does.
          </p>
        </div>

        <LedgerInput
          label="Prototype URL"
          help="A live URL. Auth-gated is fine."
          placeholder="https://your-prototype.lovable.app"
          value={protoUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          error={
            protoUrl.length > 0 && !urlIsValid
              ? 'Enter a full URL starting with http:// or https://'
              : null
          }
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
        />

        <div>
          <label
            htmlFor="m5-4-what-it-does"
            className="block font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ledger-ink-2)] mb-2"
          >
            What it does
          </label>
          <textarea
            id="m5-4-what-it-does"
            rows={4}
            placeholder="A teller-facing tool that takes a hold ID and returns a plain-English explanation of why the hold is on the account and when it will release."
            value={whatItDoes}
            onChange={(e) => setWhatItDoes(e.target.value)}
            aria-describedby="m5-4-what-it-does-help"
            className={
              'block w-full bg-[var(--ledger-paper)] border border-[var(--ledger-rule-strong)] ' +
              'rounded-[2px] px-3 py-2 text-[var(--ledger-ink)] ' +
              'placeholder:text-[var(--ledger-muted)] ' +
              'transition-colors duration-[120ms] ease-[cubic-bezier(0.4,0,0.2,1)] ' +
              'focus:outline-none focus:border-[var(--ledger-ink)] ' +
              'focus:border-l-[2px] focus:border-l-[var(--ledger-accent)]'
            }
          />
          <p
            id="m5-4-what-it-does-help"
            className="mt-2 text-sm text-[var(--ledger-muted)]"
          >
            One paragraph. Who uses it, what it produces, why it matters.
          </p>
        </div>

        <PIIWarning visible={hasPII} />
      </LedgerCard>

      <div className="flex items-center gap-3">
        <SaveAsArtifactButton
          type="prototype"
          title="Prototype — Lesson 5.4"
          body_md={markdown}
          lesson_id={lessonId}
          track={track}
          disabled={!canSave}
          disabledReason={
            hasPII
              ? 'Remove customer data first'
              : !selectedTool
                ? 'Pick the tool you used'
                : !urlIsValid
                  ? 'Paste a valid http(s) URL'
                  : 'Add a longer description (at least 20 characters)'
          }
        />
      </div>
    </section>
  );
}
