'use client';

import { useEffect, useRef, useState } from 'react';

// A real practice-rep exchange, played once: the prompt types into the
// composer, is sent, and the model answer streams in word by word. After it
// finishes a Replay control appears — it never loops on its own, so the page
// carries one moving element at most.
//
// Reduced motion (and no-JS / test environments that report it) renders the
// finished exchange immediately.

export interface AiSessionProps {
  /** Small label in the window chrome, e.g. "Practice rep · Module 9". */
  readonly label: string;
  /** The prompt as the learner sends it. */
  readonly prompt: string;
  /** The model answer, verbatim from the course content. */
  readonly answer: string;
  /** Guardrail chips shown once the answer has finished. */
  readonly checks?: readonly string[];
  /** Caption under the window — provenance of the example. */
  readonly footnote: string;
}

type Phase = 'idle' | 'typing' | 'thinking' | 'streaming' | 'done';

const TYPE_STEP = 3; // characters per tick
const TICK_MS = 28;
const THINK_MS = 700;
const WORD_MS = 70;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function AiSession({ label, prompt, answer, checks = [], footnote }: AiSessionProps) {
  const words = answer.split(' ');
  const [phase, setPhase] = useState<Phase>('idle');
  const [chars, setChars] = useState(0);
  const [shownWords, setShownWords] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const finish = () => {
    clear();
    setChars(prompt.length);
    setShownWords(words.length);
    setPhase('done');
  };

  const play = () => {
    clear();
    if (prefersReducedMotion()) {
      finish();
      return;
    }
    setChars(0);
    setShownWords(0);
    setPhase('typing');
  };

  // Start when the window scrolls into view (or immediately without IO).
  useEffect(() => {
    if (prefersReducedMotion()) {
      finish();
      return;
    }
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      play();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          play();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === 'typing') {
      if (chars >= prompt.length) {
        setPhase('thinking');
        return;
      }
      timer.current = setTimeout(() => setChars((c) => Math.min(prompt.length, c + TYPE_STEP)), TICK_MS);
    } else if (phase === 'thinking') {
      timer.current = setTimeout(() => setPhase('streaming'), THINK_MS);
    } else if (phase === 'streaming') {
      if (shownWords >= words.length) {
        setPhase('done');
        return;
      }
      timer.current = setTimeout(() => setShownWords((w) => w + 1), WORD_MS);
    }
    return clear;
  }, [phase, chars, shownWords, prompt.length, words.length]);

  const composing = phase === 'idle' || phase === 'typing';
  const sent = !composing;

  return (
    <div ref={rootRef} className="hm-session">
      <div className="hm-session-bar">
        <span className="hm-session-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span>Your bank&rsquo;s approved AI tool</span>
        <span className="hm-session-tag">{label}</span>
      </div>

      <div className="hm-session-body" aria-live="off">
        {sent && <p className="hm-msg hm-msg-user">{prompt}</p>}
        {phase === 'thinking' && (
          <p className="hm-thinking" aria-label="Generating">
            <span />
            <span />
            <span />
          </p>
        )}
        {(phase === 'streaming' || phase === 'done') && (
          <div className="hm-msg hm-msg-ai">
            <span className="hm-ai-badge" aria-hidden="true">
              AI
            </span>
            <p>{words.slice(0, shownWords).join(' ')}</p>
          </div>
        )}
        {phase === 'done' && checks.length > 0 && (
          <ul className="hm-session-checks" aria-label="Why this is safe">
            {checks.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="hm-composer">
        <span className={composing && chars > 0 ? 'hm-composer-text' : 'hm-composer-placeholder'}>
          {composing && chars > 0 ? prompt.slice(0, chars) : 'Message your approved AI tool…'}
          {phase === 'typing' && <span className="hm-caret" aria-hidden="true" />}
        </span>
        {phase === 'done' ? (
          <button type="button" className="hm-replay" onClick={play}>
            Replay
          </button>
        ) : (
          <span className={`hm-send${composing && chars > 0 ? ' is-ready' : ''}`} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </span>
        )}
      </div>
      <p className="hm-session-foot">{footnote}</p>
    </div>
  );
}
