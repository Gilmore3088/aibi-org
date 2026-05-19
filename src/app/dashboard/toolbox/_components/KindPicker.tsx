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
    title: 'Workflow Skill',
    blurb:
      'A multi-step skill the AI runs against your scenario. You give it a role, clarifying questions, a workflow, and an output spec — then chat with it about your specific case.',
    example: 'Credit memo drafting · Denial letter authoring · Complaint response composition',
  },
  {
    kind: 'template',
    title: 'Template with Variables',
    blurb:
      'A single-shot prompt with named {{variable}} blanks. You fill the variables, send once, get one output. Best for short repeatable patterns and for teaching prompt structure.',
    example: 'Adverse-action snippet · Loan-summary one-pager · Compliance disclosure draft',
  },
];

export function KindPicker({ value, onChange }: KindPickerProps) {
  return (
    <div>
      <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--ledger-accent)]">
        Choose a kind
      </p>
      <h2 className="mt-2 font-serif text-2xl text-[color:var(--color-ink)]">
        What kind of skill are you building?
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-[color:var(--color-ink)]/70">
        Click a card to start. You can switch kinds later — your draft is
        kept until you save.
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
                className={`group flex h-full w-full cursor-pointer flex-col rounded-[3px] border p-5 text-left transition-all ${
                  selected
                    ? 'border-[color:var(--ledger-accent)] bg-[color:var(--ledger-paper)] shadow-[0_1px_0_0_var(--ledger-accent)]'
                    : 'border-[color:var(--ledger-rule-strong)] bg-[color:#FAF7EE] hover:-translate-y-0.5 hover:border-[color:var(--ledger-ink)] hover:shadow-sm'
                }`}
              >
                <h3 className="font-serif text-xl text-[color:var(--color-ink)]">
                  {opt.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-ink)]/75">
                  {opt.blurb}
                </p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-slate)]">
                  Examples: {opt.example}
                </p>
                <p
                  className={`mt-auto pt-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] ${
                    selected
                      ? 'text-[color:var(--ledger-accent)]'
                      : 'text-[color:var(--ledger-ink-2)] group-hover:text-[color:var(--ledger-ink)]'
                  }`}
                >
                  {selected ? 'Selected ✓ — continue below' : 'Choose this kind →'}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
