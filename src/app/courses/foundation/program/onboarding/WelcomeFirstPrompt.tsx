'use client';

// WelcomeFirstPrompt — first-prompt-in-90-seconds onboarding moment.
// A new banker hits this BEFORE the survey. They run one pre-filled prompt,
// see real AI output, and then continue to the survey. The point is to win
// the next ten minutes of attention with one tangible result.
//
// Audit ref: H12 — onboarding was a survey-first wall. Value before form.

import { useCallback, useEffect, useRef, useState } from 'react';

interface WelcomeFirstPromptProps {
  readonly onContinue: () => void;
}

const SAMPLE_INPUT = `Hi all - just a heads up, the kiosk thing in the lobby for the new account application
flow has been kind of buggy lately, multiple ppl have flagged it, IT is aware but no fix
yet, in the meantime can we please default to the iPad workflow til further notice? thanks
- jane`;

const SYSTEM_PROMPT = `You are a banking communications assistant helping a community-bank
operations manager rewrite an internal staff message into the voice of a professional
banking communication. Keep the message factual, kind, and unambiguous about what
staff should do. Cut filler. Do not add new information that wasn't in the original.
Keep it under 100 words. Reply with the rewritten message only — no preamble, no
disclaimers, no explanations.`;

const USER_PROMPT_PREFIX =
  'Please rewrite this internal staff email into a clear, professional bank-internal note. ' +
  'Keep it under 100 words. Original message:\n\n';

export function WelcomeFirstPrompt({ onContinue }: WelcomeFirstPromptProps) {
  const [phase, setPhase] = useState<'idle' | 'streaming' | 'done' | 'error'>('idle');
  const [output, setOutput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement | null>(null);
  const continueRef = useRef<HTMLButtonElement | null>(null);

  const runPrompt = useCallback(async () => {
    setPhase('streaming');
    setOutput('');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/sandbox/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'claude',
          systemPrompt: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: USER_PROMPT_PREFIX + SAMPLE_INPUT }],
          // Use a stable moduleId so the per-session rate-limit map keys
          // welcome-prompt usage separately from real module practice.
          // moduleId kept as 'aibi-p-welcome' for rate-limit-store continuity
          // across the rename — changing it would reset every existing key.
          moduleId: 'aibi-p-welcome',
          product: 'foundation',
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Could not reach the AI sandbox. Try again in a moment.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setOutput(accumulated);
      }

      setPhase('done');
    } catch (err) {
      setPhase('error');
      setErrorMessage(err instanceof Error ? err.message : 'Unexpected error.');
    }
  }, []);

  // Move focus to the Continue button when the response completes — the
  // banker's natural next step.
  useEffect(() => {
    if (phase === 'done') {
      requestAnimationFrame(() => continueRef.current?.focus());
    }
  }, [phase]);

  return (
    <main className="min-h-screen bg-[color:var(--color-linen)] px-6 py-12 md:py-20">
      <div className="max-w-3xl mx-auto">
        <p className="font-serif-sc text-xs uppercase tracking-[0.22em] text-[color:var(--color-terra)] mb-3">
          Your first AI win — under 90 seconds
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight mb-5">
          Before the survey, see what AI can do for you.
        </h1>
        <p className="text-base md:text-lg text-[color:var(--color-ink)]/75 leading-relaxed mb-10 max-w-2xl">
          Below is a real internal email a banker might write in a hurry. Click the
          button to ask AI to rewrite it. The output you get is yours — copy it,
          tweak it, send it. This is the kind of small, daily win the rest of the
          course is built around.
        </p>

        <section className="border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] rounded-[3px] p-6 md:p-8 mb-8">
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 mb-3">
            The original email
          </p>
          <pre className="font-mono text-sm text-[color:var(--color-ink)] leading-relaxed whitespace-pre-wrap">
            {SAMPLE_INPUT}
          </pre>
        </section>

        {phase === 'idle' && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={runPrompt}
              className="inline-block px-10 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
            >
              Try this with AI
            </button>
          </div>
        )}

        {phase !== 'idle' && (
          <section
            ref={outputRef}
            className="border border-[color:var(--color-terra)]/30 bg-[color:var(--color-linen)] rounded-[3px] p-6 md:p-8 mb-8"
            aria-live="polite"
          >
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
              The AI rewrite
            </p>
            {phase === 'streaming' && output.length === 0 && (
              <p className="font-mono text-sm text-[color:var(--color-slate)]">
                AI is thinking…
              </p>
            )}
            {output.length > 0 && (
              <pre className="font-mono text-sm text-[color:var(--color-ink)] leading-relaxed whitespace-pre-wrap">
                {output}
              </pre>
            )}
            {phase === 'error' && errorMessage && (
              <p className="font-mono text-sm text-[color:var(--color-error)] mt-3" role="alert">
                {errorMessage}
              </p>
            )}
          </section>
        )}

        {phase === 'done' && (
          <div className="text-center space-y-5">
            <p className="font-serif text-2xl text-[color:var(--color-ink)] leading-tight max-w-2xl mx-auto">
              That is the floor. Every module from here gives you one of these — a
              specific banker workflow you can use the day you learn it.
            </p>
            <button
              ref={continueRef}
              type="button"
              onClick={onContinue}
              className="inline-block px-10 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
            >
              Continue to your onboarding survey →
            </button>
          </div>
        )}

        {phase === 'error' && (
          <div className="text-center space-y-4">
            <p className="text-sm text-[color:var(--color-ink)]/70 max-w-md mx-auto">
              The AI sandbox didn&rsquo;t respond this time. Try again, or skip
              the welcome and continue to your survey.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={runPrompt}
                className="inline-block px-8 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={onContinue}
                className="font-serif-sc text-xs uppercase tracking-[0.18em] text-[color:var(--color-ink)]/70 hover:text-[color:var(--color-terra)] transition-colors"
              >
                Skip to survey →
              </button>
            </div>
          </div>
        )}

        {phase === 'idle' && (
          <p className="text-center text-xs text-[color:var(--color-slate)] mt-6">
            <button
              type="button"
              onClick={onContinue}
              className="font-serif-sc uppercase tracking-[0.18em] text-[color:var(--color-ink)]/55 hover:text-[color:var(--color-terra)] transition-colors"
            >
              Skip welcome and go to survey →
            </button>
          </p>
        )}
      </div>
    </main>
  );
}
