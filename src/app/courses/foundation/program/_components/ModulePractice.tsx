'use client';

// Embedded practice panel inside a module page. The learner picks a
// scenario, hits Run, and Claude streams a response right under the
// module body — no toolbox round-trip required. This is the "C" piece
// of robust interactive course steps: every module has an inline LLM
// loop tied to its own outcome.

import { useState } from 'react';

export interface ModulePracticeScenario {
  readonly id: string;
  readonly label: string;
  readonly userPrompt: string;
}

export interface ModulePracticeProps {
  readonly moduleNumber: number;
  readonly moduleTitle: string;
  readonly systemPrompt: string;
  readonly scenarios: readonly ModulePracticeScenario[];
}

const INK = '#071A2F';
const GOLD = '#C8A24A';
const GOLD_DEEP = '#9A7A2F';
const GOLD_SOFT = '#E6D39B';
const LINE = 'rgba(7,26,47,.12)';
const SLATE = '#475569';

export function ModulePractice({
  moduleNumber,
  moduleTitle,
  systemPrompt,
  scenarios,
}: ModulePracticeProps) {
  const [pickedId, setPickedId] = useState<string>(scenarios[0]?.id ?? '');
  const picked = scenarios.find((s) => s.id === pickedId) ?? scenarios[0];
  type State =
    | { status: 'idle' }
    | { status: 'running'; partial: string }
    | { status: 'done'; output: string }
    | { status: 'error'; message: string };
  const [state, setState] = useState<State>({ status: 'idle' });

  async function run() {
    if (!picked) return;
    setState({ status: 'running', partial: '' });
    try {
      const res = await fetch('/api/sandbox/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'claude',
          product: 'foundation',
          moduleId: `m${moduleNumber}`,
          systemPrompt,
          messages: [{ role: 'user', content: picked.userPrompt }],
        }),
      });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        setState({
          status: 'error',
          message:
            (body as { error?: string }).error ?? `Run failed (${res.status}).`,
        });
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setState({ status: 'running', partial: acc });
      }
      setState({ status: 'done', output: acc.trim() || '(no output)' });
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Network error.',
      });
    }
  }

  if (scenarios.length === 0) return null;

  return (
    <div
      style={{
        background: 'white',
        border: `1px solid ${LINE}`,
        borderRadius: 18,
        padding: 22,
        margin: '32px 0',
      }}
    >
      <div
        style={{
          color: GOLD_DEEP,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          fontSize: 12,
          fontWeight: 800,
        }}
      >
        Practice · {moduleTitle}
      </div>
      <p
        style={{
          color: SLATE,
          fontSize: 16,
          lineHeight: 1.6,
          margin: '8px 0 16px',
        }}
      >
        Pick a scenario, watch the response stream. This is the same model
        path the Toolbox uses — anything that works here, you can save and
        reuse.
      </p>

      <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
        {scenarios.map((s) => (
          <label
            key={s.id}
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              background: pickedId === s.id ? '#FFF8E8' : 'white',
              border: `1px solid ${pickedId === s.id ? GOLD : LINE}`,
              borderRadius: 12,
              padding: '10px 12px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 16,
              color: INK,
            }}
          >
            <input
              type="radio"
              name={`practice-${moduleNumber}`}
              value={s.id}
              checked={pickedId === s.id}
              onChange={() => setPickedId(s.id)}
              style={{ marginTop: 4 }}
            />
            <span>{s.label}</span>
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={run}
        disabled={state.status === 'running'}
        style={{
          background: GOLD,
          color: INK,
          border: 0,
          borderRadius: 12,
          padding: '12px 18px',
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          cursor: state.status === 'running' ? 'wait' : 'pointer',
        }}
      >
        {state.status === 'running' ? 'Running…' : 'Run this scenario'}
      </button>

      {(state.status === 'running' || state.status === 'done') && (
        <pre
          style={{
            marginTop: 16,
            background: INK,
            color: GOLD_SOFT,
            borderRadius: 16,
            padding: 18,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 16,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            overflowX: 'auto',
            maxHeight: 380,
            overflowY: 'auto',
          }}
        >
          {state.status === 'running' ? state.partial + '▍' : state.output}
        </pre>
      )}

      {state.status === 'error' && (
        <div
          style={{
            marginTop: 16,
            color: '#912018',
            fontSize: 16,
            lineHeight: 1.6,
          }}
        >
          {state.message}
        </div>
      )}
    </div>
  );
}
