'use client';

import type { ToolboxKind } from '@/lib/toolbox/types';

interface KindPickerProps {
  readonly value: ToolboxKind | null;
  readonly onChange: (kind: ToolboxKind) => void;
}

const OPTIONS: ReadonlyArray<{
  kind: ToolboxKind;
  title: string;
  blurb: string;
  example: string;
}> = [
  {
    kind: 'workflow',
    title: 'Workflow skill',
    blurb:
      'A multi-step skill the model runs against your scenario. You give it a role, clarifying questions, a workflow, and an output spec — then chat with it about your specific case.',
    example: 'Credit memo drafting · Denial letter authoring · Complaint response composition',
  },
  {
    kind: 'template',
    title: 'Template with variables',
    blurb:
      'A single-shot prompt with named {{variable}} blanks. You fill the variables, send once, get one output. Best for short repeatable patterns and for teaching prompt structure.',
    example: 'Adverse-action snippet · Loan-summary one-pager · Compliance disclosure draft',
  },
];

export function KindPicker({ value, onChange }: KindPickerProps) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
        Choose a kind
      </p>
      <h2 className="mt-2 text-2xl font-bold text-[color:var(--ink)]">
        What kind of skill are you building?
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-[color:var(--slate-600)]">
        Click a card to start. You can switch kinds later — your draft is kept
        until you save.
      </p>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {OPTIONS.map((opt) => {
          const selected = value === opt.kind;
          return (
            <li key={opt.kind}>
              <button
                type="button"
                onClick={() => onChange(opt.kind)}
                aria-pressed={selected}
                className={`group flex h-full w-full cursor-pointer flex-col rounded-[16px] border p-5 text-left transition-all ${
                  selected
                    ? 'border-[color:var(--gold)] bg-[color:var(--cream)] shadow-[var(--shadow-feature)]'
                    : 'border-[color:var(--ink-a15)] bg-white hover:-translate-y-1 hover:border-[color:var(--ink)] hover:shadow-[var(--shadow-soft)]'
                }`}
              >
                <h3 className="text-xl font-bold text-[color:var(--ink)]">
                  {opt.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--slate-600)]">
                  {opt.blurb}
                </p>
                <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.16em] text-[color:var(--slate-500)]">
                  Examples: {opt.example}
                </p>
                <p
                  className={`mt-auto pt-4 text-[11px] font-bold uppercase tracking-[0.18em] ${
                    selected
                      ? 'text-[color:var(--gold-deep)]'
                      : 'text-[color:var(--ink)] group-hover:text-[color:var(--ink-2)]'
                  }`}
                >
                  {selected ? 'SELECTED — CONTINUE BELOW' : 'CHOOSE THIS KIND'}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
