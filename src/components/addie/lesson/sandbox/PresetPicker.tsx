'use client';

// PresetPicker — renders the exercise's preset_context_blocks as a
// selectable list. Selecting a preset (1) toggles its id in `selected`
// and (2) optionally pre-fills the matching data slot via onFill so the
// learner sees what the model receives.

import { KickerLabel } from '@/components/addie/shared/KickerLabel';

interface PresetBlock {
  readonly id: string;
  readonly label: string;
  readonly body?: string;
}

interface PresetPickerProps {
  readonly presets: ReadonlyArray<PresetBlock>;
  readonly selected: ReadonlyArray<string>;
  readonly onSelect: (id: string, body: string | undefined) => void;
  readonly title?: string;
  readonly idScope?: string;
}

export function PresetPicker({
  presets,
  selected,
  onSelect,
  title = 'Starter prompts',
  idScope = '',
}: PresetPickerProps) {
  if (presets.length === 0) return null;
  return (
    <div>
      <KickerLabel tone="muted" id={`preset-${idScope}-label`}>
        {title}
      </KickerLabel>
      <ul
        aria-labelledby={`preset-${idScope}-label`}
        className="mt-2 grid gap-2 sm:grid-cols-2"
      >
        {presets.map((p) => {
          const active = selected.includes(p.id);
          return (
            <li key={p.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(p.id, p.body)}
                className={[
                  'w-full text-left min-h-[44px] px-3 py-2.5 text-sm',
                  'border rounded-[2px] transition-colors duration-[120ms]',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ledger-ink)]',
                  active
                    ? 'bg-[var(--ledger-ink)] text-[var(--ledger-paper)] border-[var(--ledger-ink)]'
                    : 'bg-[var(--ledger-paper)] text-[var(--ledger-ink)] border-[var(--ledger-rule-strong)] hover:border-[var(--ledger-ink)]',
                ].join(' ')}
              >
                {p.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
