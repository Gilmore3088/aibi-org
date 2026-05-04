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
      <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
        Choose a kind
      </p>
      <h2 className="mt-2 font-serif text-2xl text-[color:var(--color-ink)]">
        What kind of skill are you building?
      </h2>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {OPTIONS.map((opt) => {
          const selected = value === opt.kind;
          return (
            <li key={opt.kind}>
              <button
                type="button"
                onClick={() => onChange(opt.kind)}
                aria-pressed={selected}
                className={`w-full text-left rounded-[3px] border p-5 transition-colors ${
                  selected
                    ? 'border-[color:var(--color-terra)] bg-[color:var(--color-parch)]'
                    : 'border-[color:var(--color-ink)]/15 hover:border-[color:var(--color-terra)]'
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
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
