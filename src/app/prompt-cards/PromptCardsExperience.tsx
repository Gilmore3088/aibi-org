'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AIBI_SAFETY_NOTE,
  PROMPT_CARD_CATEGORIES,
  PROMPT_CARDS,
  type PromptCard,
} from '@/content/prompt-cards/cards';
import { trackEvent } from '@/lib/analytics/plausible';

const STORAGE_KEY = 'aibi-prompt-cards-unlocked';

function buildPrompt(card: PromptCard): string {
  const inputs = card.inputs
    .map((input) => `${input.label}: [${input.helper}]`)
    .join('\n');
  return `${card.promptTemplate}\n\nInputs to complete:\n${inputs}\n\nSafety note: ${AIBI_SAFETY_NOTE}`;
}

export function PromptCardsExperience() {
  const [unlocked, setUnlocked] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(PROMPT_CARDS[0].id);
  const [category, setCategory] = useState('All');
  const [copied, setCopied] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setUnlocked(window.localStorage.getItem(STORAGE_KEY) === 'true');
    trackEvent('prompt_cards_page_view');
  }, []);

  const visibleCards = useMemo(() => (
    category === 'All'
      ? PROMPT_CARDS
      : PROMPT_CARDS.filter((card) => card.category === category)
  ), [category]);

  const selected = PROMPT_CARDS.find((card) => card.id === selectedId) ?? PROMPT_CARDS[0];
  const sampleCards = PROMPT_CARDS.slice(0, 4);
  const cardsForGrid = unlocked ? visibleCards : sampleCards;

  function unlock() {
    setLeadOpen(true);
  }

  function markUnlocked() {
    window.localStorage.setItem(STORAGE_KEY, 'true');
    setUnlocked(true);
    setLeadOpen(false);
  }

  async function copyPrompt(card: PromptCard) {
    await navigator.clipboard.writeText(buildPrompt(card));
    setCopied(card.id);
    trackEvent('prompt_card_prompt_copy', { card_id: card.id });
    window.setTimeout(() => setCopied(null), 1800);
  }

  function selectCard(card: PromptCard) {
    setSelectedId(card.id);
    trackEvent('prompt_card_view', { card_id: card.id });
  }

  return (
    <main className="bg-[color:var(--color-linen)]">
      <section className="border-b border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-20">
          <div>
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-terra)]">
              AiBI Prompt Cards
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.98] text-[color:var(--color-ink)] md:text-7xl">
              Use AI in Banking With Structure, Clarity, and Control
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[color:var(--color-slate)] md:text-lg">
              20 structured workflows from the AI Banking Institute to help banking professionals use AI with better inputs, clearer outputs, and stronger review habits.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={unlock}
                className="bg-[color:var(--color-terra)] px-6 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)] transition-colors hover:bg-[color:var(--color-terra-light)]"
              >
                Get the AiBI Prompt Cards
              </button>
              <Link
                href="/courses/foundations"
                className="border border-[color:var(--color-ink)]/25 px-6 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-ink)] transition-colors hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)]"
              >
                Explore AiBI Foundations
              </Link>
            </div>
          </div>
          <div className="grid content-start gap-3">
            {sampleCards.map((card, index) => (
              <button
                key={card.id}
                type="button"
                onClick={() => selectCard(card)}
                className="grid grid-cols-[40px_1fr] gap-4 border border-[color:var(--color-ink)]/10 bg-white/45 p-4 text-left transition-colors hover:border-[color:var(--color-terra)]/50"
              >
                <span className="font-mono text-[11px] text-[color:var(--color-terra)] tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <span className="block font-serif text-2xl leading-tight text-[color:var(--color-ink)]">{card.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-[color:var(--color-slate)]">{card.description}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-4 lg:px-10">
        {[
          ['Context', 'Frame the banking situation before asking AI to act.'],
          ['Inputs', 'Name the source material and missing information.'],
          ['Prompt', 'Use role, task, constraints, and output format.'],
          ['Review', 'Check facts, risk, assumptions, and next steps.'],
        ].map(([title, body]) => (
          <div key={title} className="border-t border-[color:var(--color-ink)]/15 pt-4">
            <h2 className="font-serif text-2xl text-[color:var(--color-ink)]">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-slate)]">{body}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-16 lg:grid-cols-[360px_1fr] lg:px-10">
        <aside className="h-fit lg:sticky lg:top-28">
          <div className="border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-5">
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
              Library
            </p>
            <h2 className="mt-2 font-serif text-3xl leading-tight text-[color:var(--color-ink)]">
              {unlocked ? 'All 20 workflow cards' : 'Preview cards'}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-slate)]">
              Prompt Cards are for structured external use. The paid Toolbox adds account storage, Claude testing, and Markdown skill export.
            </p>
            {unlocked ? (
              <a
                href="/api/prompt-cards/download"
                onClick={() => trackEvent('prompt_card_pdf_download')}
                className="mt-5 block bg-[color:var(--color-ink)] px-4 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]"
              >
                Download PDF
              </a>
            ) : (
              <button
                type="button"
                onClick={unlock}
                className="mt-5 w-full bg-[color:var(--color-terra)] px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]"
              >
                Unlock full library
              </button>
            )}
          </div>
          {unlocked && (
            <div className="mt-4 flex flex-wrap gap-2">
              {['All', ...PROMPT_CARD_CATEGORIES].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`border px-3 py-2 text-xs transition-colors ${
                    category === item
                      ? 'border-[color:var(--color-terra)] bg-[color:var(--color-terra)] text-[color:var(--color-linen)]'
                      : 'border-[color:var(--color-ink)]/15 text-[color:var(--color-ink)]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </aside>

        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            {cardsForGrid.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  if (!unlocked && !sampleCards.some((sample) => sample.id === card.id)) {
                    unlock();
                    return;
                  }
                  selectCard(card);
                }}
                className={`border p-5 text-left transition-colors ${
                  selected.id === card.id
                    ? 'border-[color:var(--color-terra)] bg-white'
                    : 'border-[color:var(--color-ink)]/10 bg-white/45 hover:border-[color:var(--color-terra)]/50'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)]">{card.category}</span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--color-slate)]">{card.difficulty}</span>
                </div>
                <h3 className="mt-3 font-serif text-2xl leading-tight text-[color:var(--color-ink)]">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-slate)]">{card.description}</p>
              </button>
            ))}
          </div>

          <CardDetail
            card={selected}
            unlocked={unlocked}
            copied={copied === selected.id}
            expanded={Boolean(expanded[selected.id])}
            onCopy={() => copyPrompt(selected)}
            onExpand={() => {
              setExpanded((prev) => ({ ...prev, [selected.id]: !prev[selected.id] }));
              trackEvent('prompt_card_expand_click', { card_id: selected.id });
            }}
            onUnlock={unlock}
          />
        </div>
      </section>

      <section className="border-t border-[color:var(--color-ink)]/10 bg-[color:var(--color-ink)] px-6 py-12 text-[color:var(--color-linen)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra-pale)]">
              Course bridge
            </p>
            <h2 className="mt-2 font-serif text-4xl leading-tight">Ready for the full AiBI Method?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--color-linen)]/75">
              Foundations turns these habits into training. Toolbox turns the method into saved, tested, exportable workflows.
            </p>
          </div>
          <Link
            href="/courses/foundations"
            onClick={() => trackEvent('prompt_card_course_click')}
            className="bg-[color:var(--color-terra)] px-6 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]"
          >
            View AiBI Foundations
          </Link>
        </div>
      </section>

      {leadOpen && (
        <LeadModal onClose={() => setLeadOpen(false)} onUnlocked={markUnlocked} />
      )}
    </main>
  );
}

function CardDetail(props: {
  readonly card: PromptCard;
  readonly unlocked: boolean;
  readonly copied: boolean;
  readonly expanded: boolean;
  readonly onCopy: () => void;
  readonly onExpand: () => void;
  readonly onUnlock: () => void;
}) {
  const locked = !props.unlocked;

  return (
    <article className="border border-[color:var(--color-ink)]/10 bg-white p-5 md:p-7">
      <div className="flex flex-col gap-3 border-b border-[color:var(--color-ink)]/10 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-terra)]">{props.card.category}</p>
          <h2 className="mt-2 font-serif text-4xl leading-tight text-[color:var(--color-ink)]">{props.card.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--color-slate)]">{props.card.description}</p>
        </div>
        {locked ? (
          <button type="button" onClick={props.onUnlock} className="bg-[color:var(--color-terra)] px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]">
            Unlock
          </button>
        ) : (
          <button type="button" onClick={props.onCopy} className="bg-[color:var(--color-terra)] px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]">
            {props.copied ? 'Copied' : 'Copy prompt'}
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DetailBlock title="Use Case" items={[props.card.useCase]} />
        <DetailBlock title="When To Use" items={[props.card.whenToUse]} />
        <DetailBlock title="When Not To Use" items={[props.card.whenNotToUse]} />
        <DetailBlock title="Inputs" items={props.card.inputs.map((input) => `${input.label}: ${input.helper}`)} />
      </div>

      <div className="mt-6">
        <h3 className="font-serif text-2xl text-[color:var(--color-ink)]">Prompt Template</h3>
        <pre className="mt-3 whitespace-pre-wrap bg-[color:var(--color-parch)] p-4 font-mono text-xs leading-relaxed text-[color:var(--color-ink)]">
          {locked ? 'Unlock the full library to copy the complete structured prompt.' : buildPrompt(props.card)}
        </pre>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DetailBlock title="Output Structure" items={props.card.outputStructure} />
        <DetailBlock title="Review Checklist" items={props.card.reviewChecklist} />
      </div>

      <div className="mt-6 border-l-2 border-[color:var(--color-terra)] bg-[color:var(--color-parch)] p-4">
        <h3 className="font-serif text-xl text-[color:var(--color-ink)]">AiBI Safety Note</h3>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-slate)]">{AIBI_SAFETY_NOTE}</p>
      </div>

      <button
        type="button"
        onClick={props.onExpand}
        disabled={locked}
        className="mt-6 border border-[color:var(--color-ink)]/20 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-ink)] disabled:opacity-45"
      >
        Expand for More Depth
      </button>
      {props.expanded && (
        <DetailBlock title="Advanced Structure" items={props.card.expandContent} />
      )}

      <div className="mt-6 border-t border-[color:var(--color-ink)]/10 pt-5">
        <h3 className="font-serif text-2xl text-[color:var(--color-ink)]">Example Run</h3>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-slate)]">{props.card.exampleRun}</p>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-[color:var(--color-ink)]/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-serif text-2xl text-[color:var(--color-ink)]">Ready for the full AiBI Method?</p>
        <Link href="/courses/foundations" className="bg-[color:var(--color-ink)] px-4 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)]">
          AiBI Foundations
        </Link>
      </div>
    </article>
  );
}

function DetailBlock({ title, items }: { readonly title: string; readonly items: readonly string[] }) {
  return (
    <section className="mt-6">
      <h3 className="font-serif text-2xl text-[color:var(--color-ink)]">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-[color:var(--color-slate)]">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-[color:var(--color-terra)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function LeadModal({ onClose, onUnlocked }: { readonly onClose: () => void; readonly onUnlocked: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('practitioner');
  const [institutionType, setInstitutionType] = useState('');
  const [assetSize, setAssetSize] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/prompt-cards/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, institutionType, assetSize }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not unlock cards.');
      trackEvent('prompt_card_email_submit', { role });
      onUnlocked();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not unlock cards.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[color:var(--color-ink)]/60 px-4">
      <form onSubmit={submit} className="w-full max-w-xl bg-[color:var(--color-linen)] p-6 shadow-2xl md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">Unlock library</p>
            <h2 className="mt-2 font-serif text-4xl text-[color:var(--color-ink)]">Get the AiBI Prompt Cards</h2>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-slate)]">Unlock the full library and PDF download.</p>
          </div>
          <button type="button" onClick={onClose} className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-slate)]">Close</button>
        </div>
        <div className="mt-6 grid gap-4">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">Email</span>
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full border border-[color:var(--color-ink)]/15 bg-white px-3 py-3 text-sm" />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">Role</span>
            <select value={role} onChange={(event) => setRole(event.target.value)} className="mt-2 w-full border border-[color:var(--color-ink)]/15 bg-white px-3 py-3 text-sm">
              <option value="foundations">Foundations</option>
              <option value="compliance-risk">Compliance / Risk</option>
              <option value="executive">Executive</option>
              <option value="training-buyer">Training Buyer</option>
              <option value="other">Other</option>
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">Institution type</span>
              <input value={institutionType} onChange={(event) => setInstitutionType(event.target.value)} placeholder="Bank, credit union..." className="mt-2 w-full border border-[color:var(--color-ink)]/15 bg-white px-3 py-3 text-sm" />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">Asset size</span>
              <input value={assetSize} onChange={(event) => setAssetSize(event.target.value)} placeholder="$500M-$1B" className="mt-2 w-full border border-[color:var(--color-ink)]/15 bg-white px-3 py-3 text-sm" />
            </label>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-[color:var(--color-error)]">{error}</p>}
        <button disabled={submitting} type="submit" className="mt-6 w-full bg-[color:var(--color-terra)] px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-linen)] disabled:opacity-50">
          {submitting ? 'Unlocking...' : 'Unlock cards'}
        </button>
      </form>
    </div>
  );
}
