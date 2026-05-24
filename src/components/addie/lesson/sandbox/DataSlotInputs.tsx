'use client';

// DataSlotInputs — renders the exercise's data_slots as textareas with
// inline char-count and a soft PII pre-flight (client-side patterns only;
// the sandbox-service does the authoritative check). Preset bodies can
// pre-fill the slot via the optional `presetFill` map keyed by slot key.

import { useId } from 'react';
import { PIIWarning, detectPII } from '@/components/addie/shared/PIIWarning';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import type { SandboxDataSlotDescriptor } from '../types';

interface DataSlotInputsProps {
  readonly slots: ReadonlyArray<SandboxDataSlotDescriptor>;
  readonly values: Record<string, string>;
  readonly onChange: (key: string, value: string) => void;
  readonly idScope?: string;
  readonly disabled?: boolean;
}

export function DataSlotInputs({
  slots,
  values,
  onChange,
  idScope = '',
  disabled = false,
}: DataSlotInputsProps) {
  if (slots.length === 0) return null;
  return (
    <div className="flex flex-col gap-5">
      {slots.map((slot) => (
        <DataSlot
          key={slot.key}
          slot={slot}
          value={values[slot.key] ?? ''}
          onChange={(v) => onChange(slot.key, v)}
          idScope={idScope}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

function DataSlot({
  slot,
  value,
  onChange,
  idScope,
  disabled,
}: {
  readonly slot: SandboxDataSlotDescriptor;
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly idScope: string;
  readonly disabled: boolean;
}) {
  const generatedId = useId();
  const inputId = `slot-${slot.key}-${idScope || generatedId}`;
  const helpId = `${inputId}-help`;
  const overLimit = value.length > slot.maxChars;
  const piiFlagged = detectPII(value);

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ledger-ink-2)] mb-2"
      >
        {slot.label}
        {slot.required ? (
          <span className="ml-1 text-[var(--ledger-weak)]" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <textarea
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-describedby={helpId}
        aria-required={slot.required || undefined}
        aria-invalid={overLimit || undefined}
        rows={5}
        maxLength={slot.maxChars + 200}
        className={[
          'block w-full bg-[var(--ledger-paper)] border rounded-[2px]',
          'px-3 py-2 text-[var(--ledger-ink)] text-sm leading-relaxed',
          'placeholder:text-[var(--ledger-muted)]',
          'transition-colors duration-[120ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
          'focus:outline-none focus:border-[var(--ledger-ink)]',
          'focus:border-l-[2px] focus:border-l-[var(--ledger-accent)]',
          'disabled:bg-[var(--ledger-parch)] disabled:cursor-not-allowed',
          overLimit
            ? 'border-[var(--ledger-weak)]'
            : 'border-[var(--ledger-rule-strong)]',
        ].join(' ')}
      />
      <div
        id={helpId}
        className="mt-1.5 flex items-center justify-between gap-3 text-xs"
      >
        <KickerLabel tone="muted">
          {slot.piiCheck ? 'No customer data — synthetic or public only' : ''}
        </KickerLabel>
        <span
          className={`font-mono tabular-nums ${
            overLimit ? 'text-[var(--ledger-weak)]' : 'text-[var(--ledger-muted)]'
          }`}
        >
          {value.length} / {slot.maxChars}
        </span>
      </div>
      <PIIWarning visible={piiFlagged} />
    </div>
  );
}
