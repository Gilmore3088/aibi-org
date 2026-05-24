'use client';

// LeverControls — renders a set of toggle/select lever descriptors as
// keyboard-accessible radio groups. The full lever_directives string
// payload never reaches the client; we only see {key, label, type, options}.

import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import type { SandboxLeverDescriptor } from '../types';

interface LeverControlsProps {
  readonly levers: ReadonlyArray<SandboxLeverDescriptor>;
  readonly values: Record<string, string>;
  readonly onChange: (key: string, value: string) => void;
  /** Suffix appended to control ids to keep two A/B columns unique on the page. */
  readonly idScope?: string;
  readonly disabled?: boolean;
}

export function LeverControls({
  levers,
  values,
  onChange,
  idScope = '',
  disabled = false,
}: LeverControlsProps) {
  if (levers.length === 0) return null;
  return (
    <div className="flex flex-col gap-4">
      {levers.map((lever) => {
        const groupId = `lever-${lever.key}-${idScope}`;
        const selected = values[lever.key];
        return (
          <div key={lever.key}>
            <KickerLabel tone="muted" id={`${groupId}-label`}>
              {lever.label}
            </KickerLabel>
            <div
              role="radiogroup"
              aria-labelledby={`${groupId}-label`}
              className="mt-2 flex flex-wrap gap-2"
            >
              {lever.options.map((opt) => {
                const active = selected === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={disabled}
                    onClick={() => onChange(lever.key, opt.id)}
                    className={[
                      'min-h-[44px] px-3 py-2 text-xs font-medium',
                      'border rounded-[2px] transition-colors duration-[120ms]',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ledger-ink)]',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      active
                        ? 'bg-[var(--ledger-ink)] text-[var(--ledger-paper)] border-[var(--ledger-ink)]'
                        : 'bg-[var(--ledger-paper)] text-[var(--ledger-ink)] border-[var(--ledger-rule-strong)] hover:border-[var(--ledger-ink)]',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
