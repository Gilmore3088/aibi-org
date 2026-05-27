'use client';

// WelcomeFirstPrompt — first-prompt-in-90-seconds onboarding moment.
// A new banker hits this BEFORE the survey. They run one pre-filled prompt,
// see real AI output, and then continue to the survey. The point is to win
// the next ten minutes of attention with one tangible result.
//
// Audit ref: H12 — onboarding was a survey-first wall. Value before form.
//
// 2026-05-27: ported to mockup design system (Inter, ink/cream/gold).

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';

interface WelcomeFirstPromptProps {
  readonly onContinue: () => void;
}

const INTER_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const MONO_STACK =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

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

const eyebrowStyle: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

const primaryButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  padding: '14px 32px',
  borderRadius: 12,
  background: 'var(--ink)',
  color: 'var(--cream)',
  fontFamily: INTER_STACK,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  border: '1px solid var(--ink)',
  cursor: 'pointer',
  transition: 'background var(--t-fast) var(--ease)',
};

const linkButtonStyle: CSSProperties = {
  fontFamily: INTER_STACK,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '8px 4px',
};

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
    <main
      style={{ background: 'var(--cream)', minHeight: '100vh' }}
      className="px-6 py-12 md:py-20"
    >
      <div className="max-w-3xl mx-auto">
        <p style={{ ...eyebrowStyle, marginBottom: 14 }}>
          Your first AI win — under 90 seconds
        </p>
        <h1
          style={{
            fontFamily: INTER_STACK,
            fontSize: 44,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            margin: 0,
            marginBottom: 18,
          }}
          className="md:text-5xl"
        >
          Before the survey, see what AI can do for you.
        </h1>
        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 16,
            fontWeight: 400,
            lineHeight: 1.6,
            color: 'var(--slate-600)',
            margin: 0,
            marginBottom: 36,
            maxWidth: 640,
          }}
        >
          Below is a real internal email a banker might write in a hurry. Click the
          button to ask AI to rewrite it. The output you get is yours — copy it,
          tweak it, send it. This is the kind of small, daily win the rest of the
          course is built around.
        </p>

        <section
          style={{
            padding: 28,
            borderRadius: 16,
            background: 'var(--cream-2)',
            border: '1px solid var(--ink-a10)',
            marginBottom: 28,
          }}
        >
          <p style={{ ...eyebrowStyle, marginBottom: 12 }}>The original email</p>
          <pre
            style={{
              fontFamily: MONO_STACK,
              fontSize: 13,
              color: 'var(--ink)',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              margin: 0,
            }}
          >
            {SAMPLE_INPUT}
          </pre>
        </section>

        {phase === 'idle' && (
          <div className="flex justify-center">
            <button type="button" onClick={runPrompt} style={primaryButtonStyle}>
              Try this with AI
            </button>
          </div>
        )}

        {phase !== 'idle' && (
          <section
            ref={outputRef}
            style={{
              padding: 28,
              borderRadius: 16,
              background: '#FFFFFF',
              border: '1px solid var(--gold)',
              boxShadow: 'var(--shadow-soft)',
              marginBottom: 28,
            }}
            aria-live="polite"
          >
            <p style={{ ...eyebrowStyle, marginBottom: 12 }}>The AI rewrite</p>
            {phase === 'streaming' && output.length === 0 && (
              <p
                style={{
                  fontFamily: MONO_STACK,
                  fontSize: 13,
                  color: 'var(--slate-500)',
                  margin: 0,
                }}
              >
                AI is thinking…
              </p>
            )}
            {output.length > 0 && (
              <pre
                style={{
                  fontFamily: MONO_STACK,
                  fontSize: 13,
                  color: 'var(--ink)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  margin: 0,
                }}
              >
                {output}
              </pre>
            )}
            {phase === 'error' && errorMessage && (
              <p
                style={{
                  fontFamily: INTER_STACK,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--gold-deep)',
                  marginTop: 12,
                  margin: 0,
                }}
                role="alert"
              >
                {errorMessage}
              </p>
            )}
          </section>
        )}

        {phase === 'done' && (
          <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'center' }}>
            <p
              style={{
                fontFamily: INTER_STACK,
                fontSize: 22,
                fontWeight: 600,
                lineHeight: 1.35,
                letterSpacing: '-0.01em',
                color: 'var(--ink)',
                maxWidth: 640,
                margin: 0,
              }}
            >
              That is the floor. Every module from here gives you one of these — a
              specific banker workflow you can use the day you learn it.
            </p>
            <button
              ref={continueRef}
              type="button"
              onClick={onContinue}
              style={primaryButtonStyle}
            >
              Continue to your onboarding survey →
            </button>
          </div>
        )}

        {phase === 'error' && (
          <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
            <p
              style={{
                fontFamily: INTER_STACK,
                fontSize: 14,
                color: 'var(--slate-600)',
                maxWidth: 480,
                margin: 0,
              }}
            >
              The AI sandbox didn&rsquo;t respond this time. Try again, or skip
              the welcome and continue to your survey.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
              <button type="button" onClick={runPrompt} style={primaryButtonStyle}>
                Try again
              </button>
              <button type="button" onClick={onContinue} style={linkButtonStyle}>
                Skip to survey →
              </button>
            </div>
          </div>
        )}

        {phase === 'idle' && (
          <p className="text-center" style={{ marginTop: 22 }}>
            <button type="button" onClick={onContinue} style={linkButtonStyle}>
              Skip welcome and go to survey →
            </button>
          </p>
        )}
      </div>
    </main>
  );
}
