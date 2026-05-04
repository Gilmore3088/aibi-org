'use client';

import { PLAYGROUND_MODELS } from '@/lib/toolbox/playground-models';
import type { ProviderName } from '@/lib/ai-harness/types';

const COMPLIANCE_DOC_URL =
  'https://github.com/Gilmore3088/aibi-org/blob/main/docs/compliance/llm-data-handling.md';

// Set this in lockstep with docs/compliance/llm-data-handling.md.
const STANCE_LAST_VERIFIED = '2026-05-04';

const PROVIDER_LABELS: Record<ProviderName, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  gemini: 'Google',
};

export interface ModelSelection {
  readonly provider: ProviderName;
  readonly model: string;
}

interface Props {
  readonly value: ModelSelection;
  readonly onChange: (next: ModelSelection) => void;
  readonly disabled?: boolean;
}

export function ModelPicker({ value, onChange, disabled }: Props) {
  const grouped = (['anthropic', 'openai', 'gemini'] as const).map((p) => ({
    provider: p,
    label: PROVIDER_LABELS[p],
    options: PLAYGROUND_MODELS.filter((m) => m.provider === p),
  }));

  const compositeValue = `${value.provider}::${value.model}`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="toolbox-model-picker" className="text-sm font-medium text-ink">
        Model
      </label>
      <select
        id="toolbox-model-picker"
        className="border border-ink/20 rounded px-3 py-2 bg-linen text-ink focus:outline-none focus:ring-2 focus:ring-terra"
        value={compositeValue}
        disabled={disabled}
        onChange={(e) => {
          const [provider, model] = e.target.value.split('::') as [ProviderName, string];
          onChange({ provider, model });
        }}
      >
        {grouped.map((g) => (
          <optgroup key={g.provider} label={g.label}>
            {g.options.map((m) => (
              <option key={m.id} value={`${m.provider}::${m.id}`}>
                {m.displayName}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <p className="text-xs text-ink/70">
        Last verified {STANCE_LAST_VERIFIED} —{' '}
        <a className="underline" href={COMPLIANCE_DOC_URL} target="_blank" rel="noreferrer">
          provider data-handling stance
        </a>
        .
      </p>
    </div>
  );
}
