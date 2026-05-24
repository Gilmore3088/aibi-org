'use client';

// LessonTutor — collapsible "Ask about this lesson" rail.
//
// Foundation-course-content-audit-2026-05-24 §3.1. The single highest-leverage
// AI-native move on the course: a tutor that knows the current lesson, the
// learner's track, and the standing data-discipline rule. Streams Haiku-grade
// answers in 1–2 short paragraphs. Refuses PII-shaped questions at the door.
//
// Layout decisions:
//   - Desktop ≥ xl (1280+): sits as a sibling to the sticky TOC, below it
//     in the same right rail, collapsed by default
//   - Tablet / mobile: sticky bottom-right floating chip; tapped opens a
//     full-screen sheet
//   - All state is in-component; nothing is persisted unless the learner
//     clicks "Save to Toolbox" (separate save endpoint, future)

import { useCallback, useEffect, useRef, useState } from 'react';

interface LessonTutorProps {
  readonly lessonId: string;
}

interface Turn {
  readonly role: 'user' | 'assistant';
  readonly content: string;
  readonly errored?: boolean;
  readonly blocked?: { reason: string; guidance: string };
}

const MAX_QUESTION_CHARS = 1200;

export function LessonTutor({ lessonId }: LessonTutorProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  // A25 rework (Wave D critique 2026-05-24): the panel is full-screen
  // on mobile (fixed inset-0) and modal in effect — assistive tech
  // should treat it as aria-modal=true. On xl+ it becomes a side rail
  // with the page still readable; aria-modal=false is correct there.
  // Track viewport via matchMedia so the attribute reflects reality.
  const [isModal, setIsModal] = useState(false);
  // Refs for initial focus on open + return focus on close (the audit
  // explicitly listed both as missing).
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const openTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 1279px)');
    const apply = () => setIsModal(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Initial focus on open → close button (predictable starting point).
  // Return focus to the open trigger on close.
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => closeButtonRef.current?.focus());
    } else {
      openTriggerRef.current?.focus();
    }
  }, [open]);

  // Auto-scroll to the latest turn as it streams in.
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [turns]);

  // Esc to close (matches the lesson-shell's bottom-pill ←/→/J/K convention).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const ask = useCallback(async () => {
    const q = question.trim();
    if (!q || pending) return;
    setPending(true);
    setTurns((prev) => [...prev, { role: 'user', content: q }]);
    setQuestion('');

    // Index of the assistant placeholder we're about to append. We mutate
    // its content as the stream arrives.
    let assistantIdx = -1;
    setTurns((prev) => {
      assistantIdx = prev.length;
      return [...prev, { role: 'assistant', content: '' }];
    });

    const history = turns
      .filter((t) => !t.blocked && !t.errored)
      .map((t) => ({ role: t.role, content: t.content }));

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const res = await fetch('/api/addie/tutor/stream', {
        method: 'POST',
        signal: ac.signal,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lessonId, question: q, history }),
      });

      if (res.status === 422) {
        const body = (await res.json()) as { reason?: string; guidance?: string };
        setTurns((prev) => {
          const next = [...prev];
          next[assistantIdx] = {
            role: 'assistant',
            content: '',
            blocked: {
              reason: body.reason ?? 'Your question may contain sensitive data.',
              guidance: body.guidance ?? 'Describe the situation, not the person.',
            },
          };
          return next;
        });
        return;
      }
      if (!res.ok || !res.body) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setTurns((prev) => {
          const next = [...prev];
          next[assistantIdx] = {
            role: 'assistant',
            content: body.error ?? `Request failed (${res.status}).`,
            errored: true,
          };
          return next;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let acc = '';
      let sawDone = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          let event: { type?: string; text?: string; message?: string };
          try {
            event = JSON.parse(line) as typeof event;
          } catch {
            continue;
          }
          if (event.type === 'text' && typeof event.text === 'string') {
            acc += event.text;
            setTurns((prev) => {
              const next = [...prev];
              next[assistantIdx] = { role: 'assistant', content: acc };
              return next;
            });
          } else if (event.type === 'done') {
            sawDone = true;
          } else if (event.type === 'error') {
            setTurns((prev) => {
              const next = [...prev];
              next[assistantIdx] = {
                role: 'assistant',
                content: acc + (acc ? '\n\n' : '') + 'Stream interrupted. Try again.',
                errored: true,
              };
              return next;
            });
          }
        }
      }
      if (!sawDone && acc.length === 0) {
        setTurns((prev) => {
          const next = [...prev];
          next[assistantIdx] = {
            role: 'assistant',
            content: 'No answer came back. Try rephrasing.',
            errored: true,
          };
          return next;
        });
      }
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === 'AbortError';
      if (!aborted) {
        setTurns((prev) => {
          const next = [...prev];
          next[assistantIdx] = {
            role: 'assistant',
            content: err instanceof Error ? err.message : 'Request failed.',
            errored: true,
          };
          return next;
        });
      }
    } finally {
      abortRef.current = null;
      setPending(false);
    }
  }, [question, pending, turns, lessonId]);

  const clear = useCallback(() => {
    if (pending && abortRef.current) abortRef.current.abort();
    setTurns([]);
    setQuestion('');
  }, [pending]);

  // ── Collapsed state ────
  // Quiet chip docked top-right inside the right rail, out of the way of
  // the bottom sticky-nav pill. No competing floating CTAs at the bottom.
  if (!open) {
    return (
      <button
        ref={openTriggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="fixed top-24 right-4 z-30 inline-flex items-center gap-2 px-3 py-1.5 rounded-[2px] border border-[var(--ledger-rule-strong)] bg-[var(--ledger-paper)] text-[var(--ledger-ink)] hover:border-[var(--ledger-ink)] transition-colors duration-[120ms]"
        aria-label="Open the lesson tutor"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="text-[var(--ledger-accent)]">
          <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M6 3v3l2 1" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
        <span className="font-mono uppercase tracking-[0.16em] text-[0.6rem]">
          Ask
        </span>
      </button>
    );
  }

  // ── Open state (full panel) ─────────────────────────────────
  // A25 (audit 2026-05-24): the open panel is now a proper role=dialog
  // with aria-labelledby pointing at the panel title. The transcript
  // region carries aria-live='polite' so streaming assistant turns are
  // announced to screen-reader users. aria-busy on the form mirrors
  // the pending state for assistive tech.
  return (
    <div
      role="dialog"
      aria-modal={isModal}
      aria-labelledby="addie-tutor-title"
      className="fixed inset-0 xl:inset-auto xl:top-[88px] xl:right-4 xl:w-[26rem] xl:h-[calc(100vh-104px)] z-50 flex flex-col bg-[var(--ledger-paper)] border border-[var(--ledger-rule-strong)] xl:rounded-[3px] shadow-[var(--ledger-shadow)]"
    >
      <header className="flex items-baseline justify-between px-4 py-3 border-b border-[var(--ledger-rule)]">
        <div>
          <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)]">
            Lesson tutor
          </div>
          <h2
            id="addie-tutor-title"
            className="font-serif text-base text-[var(--ledger-ink)] leading-tight mt-0.5"
          >
            Trained on this lesson
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {turns.length > 0 ? (
            <button
              type="button"
              onClick={clear}
              disabled={pending}
              className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)] disabled:opacity-50"
            >
              Clear
            </button>
          ) : null}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setOpen(false)}
            className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)]"
            aria-label="Close the lesson tutor"
          >
            Close
          </button>
        </div>
      </header>

      <div
        ref={transcriptRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions"
      >
        {turns.length === 0 ? (
          <div className="text-sm text-[var(--ledger-ink-2)] leading-relaxed">
            <p>
              Ask anything about this lesson. The tutor knows the lesson body,
              your role track, and the data-discipline rule — it will refuse to
              summarize a real customer or account number.
            </p>
            <p className="mt-3 text-[var(--ledger-muted)] text-xs">
              Examples · <em className="not-italic">&ldquo;Why do you keep saying it&apos;s pattern-completion?&rdquo;</em> · <em className="not-italic">&ldquo;Give me a one-line script for an examiner who asks about this.&rdquo;</em>
            </p>
          </div>
        ) : null}

        {turns.map((t, i) => {
          if (t.role === 'user') {
            return (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] px-3 py-2 bg-[var(--ledger-parch)] rounded-[3px] text-sm text-[var(--ledger-ink)]">
                  {t.content}
                </div>
              </div>
            );
          }
          if (t.blocked) {
            return (
              <div key={i} className="border-l-[3px] border-[var(--ledger-weak)] bg-[color-mix(in_srgb,var(--ledger-weak)_5%,var(--ledger-paper))] pl-3 pr-3 py-3">
                <div className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-weak)] mb-1">
                  Blocked
                </div>
                <p className="text-sm text-[var(--ledger-ink)]">{t.blocked.reason}</p>
                <p className="text-sm text-[var(--ledger-ink-2)] mt-2">{t.blocked.guidance}</p>
              </div>
            );
          }
          return (
            <div key={i} className="text-sm leading-relaxed text-[var(--ledger-ink)] whitespace-pre-wrap">
              {t.content}
              {pending && i === turns.length - 1 && !t.errored ? (
                <span className="inline-block w-2 h-4 ml-0.5 align-[-2px] bg-[var(--ledger-accent)] animate-pulse" aria-hidden="true" />
              ) : null}
            </div>
          );
        })}
      </div>

      <form
        className="border-t border-[var(--ledger-rule)] p-3"
        aria-busy={pending}
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
      >
        <label className="sr-only" htmlFor="addie-tutor-input">Ask about this lesson</label>
        <textarea
          id="addie-tutor-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, MAX_QUESTION_CHARS))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              ask();
            }
          }}
          placeholder="Ask about this lesson…"
          rows={3}
          disabled={pending}
          className="w-full px-3 py-2 text-sm bg-[var(--ledger-bg)] border border-[var(--ledger-rule)] rounded-[2px] focus:outline-none focus:border-[var(--ledger-ink)] resize-none disabled:opacity-50"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--ledger-muted)] tabular-nums">
            {question.length} / {MAX_QUESTION_CHARS} · ⌘⏎ to send
          </span>
          <button
            type="submit"
            disabled={!question.trim() || pending}
            className="px-3 py-1.5 bg-[var(--ledger-ink)] text-[var(--ledger-paper)] font-mono uppercase tracking-[0.16em] text-[0.65rem] rounded-[2px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {pending ? 'Thinking…' : 'Ask'}
          </button>
        </div>
      </form>
    </div>
  );
}
