'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AIBI_SAFETY_NOTE,
  PROMPT_CARD_CATEGORIES,
  PROMPT_CARDS,
  type PromptCard,
} from '@/content/prompt-cards/cards';
import { SiteHeader } from '@/components/mockup';
import {
  buildFreeResourceDownloadHref,
  normalizeCaptureEmail,
  readRememberedFreeResourceCapture,
  rememberFreeResourceCapture,
  type FreeResourceCaptureContext,
} from '@/lib/resources/freeResourceCapture';
const STORAGE_KEY = 'aibi-prompt-cards-unlocked';

function buildPrompt(card: PromptCard): string {
  const inputs = card.inputs
    .map((input) => `${input.label}: [${input.helper}]`)
    .join('\n');
  return `${card.promptTemplate}\n\nInputs to complete:\n${inputs}\n\nSafety note: ${AIBI_SAFETY_NOTE}`;
}

function downloadPromptCardsPdf(blob: Blob) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'AiBI-Prompt-Cards.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function PromptCardsExperience() {
  const [unlocked, setUnlocked] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(PROMPT_CARDS[0].id);
  const [category, setCategory] = useState('All');
  const [copied, setCopied] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [captureContext, setCaptureContext] = useState<FreeResourceCaptureContext | null>(null);

  useEffect(() => {
    const remembered = readRememberedFreeResourceCapture();
    if (remembered) {
      setCaptureContext(remembered);
      setUnlocked(true);
      return;
    }

    setUnlocked(window.localStorage.getItem(STORAGE_KEY) === 'true');
  }, []);

  const visibleCards = useMemo(() => (
    category === 'All'
      ? PROMPT_CARDS
      : PROMPT_CARDS.filter((card) => card.category === category)
  ), [category]);
  const downloadHref = useMemo(() => buildFreeResourceDownloadHref('/api/prompt-cards/download', {
    source: 'prompt-cards-library',
    ...(captureContext?.role ? { role: captureContext.role } : {}),
    ...(captureContext?.tier ? { tier: captureContext.tier } : {}),
    ...(captureContext?.tierLabel ? { tierLabel: captureContext.tierLabel } : {}),
    ...(captureContext?.topGap ? { topGap: captureContext.topGap } : {}),
  }), [captureContext]);

  const selected = PROMPT_CARDS.find((card) => card.id === selectedId) ?? PROMPT_CARDS[0];
  const sampleCards = PROMPT_CARDS.slice(0, 4);
  const cardsForGrid = unlocked ? visibleCards : sampleCards;

  function unlock() {
    setLeadOpen(true);
  }

  function markUnlocked(context?: FreeResourceCaptureContext) {
    if (context) {
      rememberFreeResourceCapture(context);
      setCaptureContext(context);
    }
    window.localStorage.setItem(STORAGE_KEY, 'true');
    setUnlocked(true);
    setLeadOpen(false);
  }

  async function copyPrompt(card: PromptCard) {
    await navigator.clipboard.writeText(buildPrompt(card));
    setCopied(card.id);
    window.setTimeout(() => setCopied(null), 1800);
  }

  function selectCard(card: PromptCard) {
    setSelectedId(card.id);
  }

  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/resources" cta={{ label: 'Take assessment', href: '/assessment/take' }} />
      <main className="bg-[color:var(--cream)]">
        <section className="border-b border-[color:var(--ink)]/10 bg-[color:#FFFFFF]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-20">
          <div>
            <p className="font-serif-sc text-[0.6875rem] uppercase tracking-[0.22em] text-[color:var(--gold)]">
              AiBI Prompt Cards
            </p>
            <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.98] text-[color:var(--ink)] md:text-7xl">
              Use AI in Banking With Structure, Clarity, and Control
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[color:var(--slate-600)] md:text-lg">
              20 structured workflows from the AI Banking Institute to help banking professionals use AI with better inputs, clearer outputs, and stronger review habits.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {unlocked ? (
                <a
                  href={downloadHref}
                  className="bg-[color:var(--gold)] px-6 py-3 text-center font-mono text-[0.625rem] uppercase tracking-widest text-[color:var(--cream)] transition-colors hover:bg-[color:var(--gold-2)]"
                >
                  Download PDF
                </a>
              ) : (
                <button
                  type="button"
                  onClick={unlock}
                  className="bg-[color:var(--gold)] px-6 py-3 text-center font-mono text-[0.625rem] uppercase tracking-widest text-[color:var(--cream)] transition-colors hover:bg-[color:var(--gold-2)]"
                >
                  Get the AiBI Prompt Cards
                </button>
              )}
              <Link
                href="/courses/foundation/program"
                className="border border-[color:var(--ink)]/25 px-6 py-3 text-center font-mono text-[0.625rem] uppercase tracking-widest text-[color:var(--ink)] transition-colors hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
              >
                Explore AiBI-Foundation
              </Link>
            </div>
          </div>
          <div className="grid content-start gap-3">
            {sampleCards.map((card, index) => (
              <button
                key={card.id}
                type="button"
                onClick={() => selectCard(card)}
                className="grid grid-cols-[40px_1fr] gap-4 border border-[color:var(--ink)]/10 bg-white/45 p-4 text-left transition-colors hover:border-[color:var(--gold)]/50"
              >
                <span className="font-mono text-[0.6875rem] text-[color:var(--gold)] tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <span className="block font-serif text-2xl leading-tight text-[color:var(--ink)]">{card.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-[color:var(--slate-600)]">{card.description}</span>
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
          <div key={title} className="border-t border-[color:var(--ink)]/15 pt-4">
            <h2 className="font-serif text-2xl text-[color:var(--ink)]">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--slate-600)]">{body}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-16 lg:grid-cols-[360px_1fr] lg:px-10">
        <aside className="h-fit lg:sticky lg:top-28">
          <div className="border border-[color:var(--ink)]/10 bg-[color:#FFFFFF] p-5">
            <p className="font-serif-sc text-[0.6875rem] uppercase tracking-[0.2em] text-[color:var(--gold)]">
              Library
            </p>
            <h2 className="mt-2 font-serif text-3xl leading-tight text-[color:var(--ink)]">
              {unlocked ? 'All 20 workflow cards' : 'Preview cards'}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--slate-600)]">
              Prompt Cards are for structured external use. The paid Toolbox adds account storage, Claude testing, and Markdown skill export.
            </p>
            {unlocked ? (
              <a
                href={downloadHref}
                className="mt-5 block bg-[color:var(--ink)] px-4 py-3 text-center font-mono text-[0.625rem] uppercase tracking-widest text-[color:var(--cream)]"
              >
                Download PDF
              </a>
            ) : (
              <button
                type="button"
                onClick={unlock}
                className="mt-5 w-full bg-[color:var(--gold)] px-4 py-3 font-mono text-[0.625rem] uppercase tracking-widest text-[color:var(--cream)]"
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
                      ? 'border-[color:var(--gold)] bg-[color:var(--gold)] text-[color:var(--cream)]'
                      : 'border-[color:var(--ink)]/15 text-[color:var(--ink)]'
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
                    ? 'border-[color:var(--gold)] bg-white'
                    : 'border-[color:var(--ink)]/10 bg-white/45 hover:border-[color:var(--gold)]/50'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[0.625rem] uppercase tracking-widest text-[color:var(--gold)]">{card.category}</span>
                  <span className="font-mono text-[0.5625rem] uppercase tracking-widest text-[color:var(--slate-600)]">{card.difficulty}</span>
                </div>
                <h3 className="mt-3 font-serif text-2xl leading-tight text-[color:var(--ink)]">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--slate-600)]">{card.description}</p>
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
            }}
            onUnlock={unlock}
          />
        </div>
      </section>

      <section className="border-t border-[color:var(--ink)]/10 bg-[color:var(--ink)] px-6 py-12 text-[color:var(--cream)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-serif-sc text-[0.6875rem] uppercase tracking-[0.2em] text-[color:var(--cream-2)]">
              Course bridge
            </p>
            <h2 className="mt-2 font-serif text-4xl leading-tight">Ready for the full AiBI Method?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--cream)]/75">
              Foundation turns these habits into training. Toolbox turns the method into saved, tested, exportable workflows.
            </p>
          </div>
          <Link
            href="/courses/foundation/program"
            className="bg-[color:var(--gold)] px-6 py-3 text-center font-mono text-[0.625rem] uppercase tracking-widest text-[color:var(--cream)]"
          >
            View AiBI-Foundation
          </Link>
        </div>
        </section>

        {leadOpen && (
          <LeadModal onClose={() => setLeadOpen(false)} onUnlocked={markUnlocked} />
        )}
      </main>
    </div>
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
    <article className="border border-[color:var(--ink)]/10 bg-white p-5 md:p-7">
      <div className="flex flex-col gap-3 border-b border-[color:var(--ink)]/10 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-mono text-[0.625rem] uppercase tracking-widest text-[color:var(--gold)]">{props.card.category}</p>
          <h2 className="mt-2 font-serif text-4xl leading-tight text-[color:var(--ink)]">{props.card.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--slate-600)]">{props.card.description}</p>
        </div>
        {locked ? (
          <button type="button" onClick={props.onUnlock} className="bg-[color:var(--gold)] px-4 py-3 font-mono text-[0.625rem] uppercase tracking-widest text-[color:var(--cream)]">
            Unlock
          </button>
        ) : (
          <button type="button" onClick={props.onCopy} className="bg-[color:var(--gold)] px-4 py-3 font-mono text-[0.625rem] uppercase tracking-widest text-[color:var(--cream)]">
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
        <h3 className="font-serif text-2xl text-[color:var(--ink)]">Prompt Template</h3>
        <pre className="mt-3 whitespace-pre-wrap bg-[color:#FFFFFF] p-4 font-mono text-xs leading-relaxed text-[color:var(--ink)]">
          {locked ? 'Unlock the full library to copy the complete structured prompt.' : buildPrompt(props.card)}
        </pre>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DetailBlock title="Output Structure" items={props.card.outputStructure} />
        <DetailBlock title="Review Checklist" items={props.card.reviewChecklist} />
      </div>

      <div className="mt-6 border-l-2 border-[color:var(--gold)] bg-[color:#FFFFFF] p-4">
        <h3 className="font-serif text-xl text-[color:var(--ink)]">AiBI Safety Note</h3>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--slate-600)]">{AIBI_SAFETY_NOTE}</p>
      </div>

      <button
        type="button"
        onClick={props.onExpand}
        disabled={locked}
        className="mt-6 border border-[color:var(--ink)]/20 px-4 py-3 font-mono text-[0.625rem] uppercase tracking-widest text-[color:var(--ink)] disabled:opacity-45"
      >
        Expand for More Depth
      </button>
      {props.expanded && (
        <DetailBlock title="Advanced Structure" items={props.card.expandContent} />
      )}

      <div className="mt-6 border-t border-[color:var(--ink)]/10 pt-5">
        <h3 className="font-serif text-2xl text-[color:var(--ink)]">Example Run</h3>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--slate-600)]">{props.card.exampleRun}</p>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-[color:var(--ink)]/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-serif text-2xl text-[color:var(--ink)]">Ready for the full AiBI Method?</p>
        <Link href="/courses/foundation/program" className="bg-[color:var(--ink)] px-4 py-3 text-center font-mono text-[0.625rem] uppercase tracking-widest text-[color:var(--cream)]">
          Foundation course
        </Link>
      </div>
    </article>
  );
}

function DetailBlock({ title, items }: { readonly title: string; readonly items: readonly string[] }) {
  return (
    <section className="mt-6">
      <h3 className="font-serif text-2xl text-[color:var(--ink)]">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-[color:var(--slate-600)]">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-[color:var(--gold)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function LeadModal({
  onClose,
  onUnlocked,
}: {
  readonly onClose: () => void;
  readonly onUnlocked: (context: FreeResourceCaptureContext) => void;
}) {
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
      if (!res.ok) throw new Error(data.error ?? 'Could not load the cards.');
      const pdfHref = buildFreeResourceDownloadHref('/api/prompt-cards/download', {
        source: 'prompt-cards-lead-modal',
        role,
      });
      const pdfRes = await fetch(pdfHref, { cache: 'no-store' });
      if (!pdfRes.ok) {
        const pdfError = (await pdfRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(pdfError.error ?? 'The PDF could not be generated. Please try again.');
      }
      downloadPromptCardsPdf(await pdfRes.blob());
      onUnlocked({
        email: normalizeCaptureEmail(email) ?? email,
        source: 'prompt-cards',
        role,
        capturedAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the cards.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[color:var(--ink)]/60 px-4">
      <form onSubmit={submit} className="w-full max-w-xl bg-[color:var(--cream)] border border-[color:var(--ink)]/15 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-serif-sc text-[0.6875rem] uppercase tracking-[0.2em] text-[color:var(--gold)]">Unlock library</p>
            <h2 className="mt-2 font-serif text-4xl text-[color:var(--ink)]">Get the AiBI Prompt Cards</h2>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--slate-600)]">Unlock the full library and PDF download.</p>
          </div>
          <button type="button" onClick={onClose} className="font-mono text-xs uppercase tracking-widest text-[color:var(--slate-600)]">Close</button>
        </div>
        <div className="mt-6 grid gap-4">
          <label className="block">
            <span className="font-mono text-[0.625rem] uppercase tracking-widest text-[color:var(--slate-600)]">Email</span>
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full border border-[color:var(--ink)]/15 bg-white px-3 py-3 text-sm" />
          </label>
          <label className="block">
            <span className="font-mono text-[0.625rem] uppercase tracking-widest text-[color:var(--slate-600)]">Role</span>
            <select value={role} onChange={(event) => setRole(event.target.value)} className="mt-2 w-full border border-[color:var(--ink)]/15 bg-white px-3 py-3 text-sm">
              <option value="practitioner">Banking practitioner</option>
              <option value="compliance-risk">Compliance / Risk</option>
              <option value="executive">Executive</option>
              <option value="training-buyer">Training Buyer</option>
              <option value="other">Other</option>
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-mono text-[0.625rem] uppercase tracking-widest text-[color:var(--slate-600)]">Institution type</span>
              <input value={institutionType} onChange={(event) => setInstitutionType(event.target.value)} placeholder="Bank, credit union..." className="mt-2 w-full border border-[color:var(--ink)]/15 bg-white px-3 py-3 text-sm" />
            </label>
            <label className="block">
              <span className="font-mono text-[0.625rem] uppercase tracking-widest text-[color:var(--slate-600)]">Asset size</span>
              <input value={assetSize} onChange={(event) => setAssetSize(event.target.value)} placeholder="$500M-$1B" className="mt-2 w-full border border-[color:var(--ink)]/15 bg-white px-3 py-3 text-sm" />
            </label>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-[color:#9b2226]">{error}</p>}
        <button disabled={submitting} type="submit" className="mt-6 w-full bg-[color:var(--gold)] px-5 py-3 font-mono text-[0.625rem] uppercase tracking-widest text-[color:var(--cream)] disabled:opacity-50">
          {submitting ? 'Preparing PDF...' : 'Unlock and download cards'}
        </button>
      </form>
    </div>
  );
}
