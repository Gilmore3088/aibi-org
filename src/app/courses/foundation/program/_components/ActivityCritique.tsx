'use client';

// AI critique panel shown next to the Apply activity inside a module page.
//
// The learner pastes their practice response, clicks "Get critique" — the
// browser hits /api/courses/critique-activity → Claude → a structured
// JSON object with what was strong, what to revise, and a one-paragraph
// reference rewrite. The learner reads it inline; no email round-trip.

import { useState } from 'react';

interface CritiquePayload {
  readonly strong: readonly string[];
  readonly revise: readonly string[];
  readonly rewrite: string;
}

interface ActivityCritiqueProps {
  readonly moduleNumber: number;
  /** Current value of the learner's free-text response — supplied by the
   * parent so we don't need to find the textarea via DOM. */
  readonly responseValue: string;
}

const INK = '#071A2F';
const GOLD = '#C8A24A';
const GOLD_DEEP = '#9A7A2F';
const LINE = 'rgba(7,26,47,.12)';
const SLATE = '#475569';
const CREAM_2 = '#EFE7D7';

export function ActivityCritique({ moduleNumber, responseValue }: ActivityCritiqueProps) {
  type Status =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'ready'; data: CritiquePayload }
    | { status: 'error'; message: string };
  const [state, setState] = useState<Status>({ status: 'idle' });

  const tooShort = responseValue.trim().length < 20;

  async function fetchCritique() {
    setState({ status: 'loading' });
    try {
      const res = await fetch('/api/courses/critique-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleNumber, response: responseValue }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        strong?: string[];
        revise?: string[];
        rewrite?: string;
      };
      if (!res.ok) {
        setState({
          status: 'error',
          message: body.error ?? `Request failed (${res.status}).`,
        });
        return;
      }
      if (!body.strong || !body.revise || !body.rewrite) {
        setState({ status: 'error', message: 'Malformed response.' });
        return;
      }
      setState({
        status: 'ready',
        data: { strong: body.strong, revise: body.revise, rewrite: body.rewrite },
      });
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Network error.',
      });
    }
  }

  return (
    <div
      style={{
        marginTop: 18,
        background: 'white',
        border: `1px solid ${LINE}`,
        borderRadius: 16,
        padding: 18,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              color: GOLD_DEEP,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              fontSize: 10,
              fontWeight: 800,
            }}
          >
            AI critique · optional
          </div>
          <p
            style={{
              fontSize: 14,
              color: SLATE,
              margin: '6px 0 0',
              lineHeight: 1.5,
            }}
          >
            Get one round of structured feedback on your response. What worked,
            what to revise, and a reference rewrite you can compare against.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchCritique}
          disabled={tooShort || state.status === 'loading'}
          style={{
            background: tooShort ? '#E2E8F0' : GOLD,
            color: tooShort ? '#94A3B8' : INK,
            border: 0,
            borderRadius: 12,
            padding: '12px 18px',
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: tooShort ? 'not-allowed' : 'pointer',
          }}
        >
          {state.status === 'loading'
            ? 'Reviewing…'
            : tooShort
              ? 'Write at least 20 chars first'
              : 'Get critique'}
        </button>
      </div>

      {state.status === 'error' && (
        <div
          style={{
            marginTop: 14,
            color: '#912018',
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {state.message}
        </div>
      )}

      {state.status === 'ready' && (
        <div style={{ marginTop: 18, display: 'grid', gap: 14 }}>
          <Block
            kicker="Strong"
            kickerColor="#05603A"
            items={state.data.strong}
            background="#F0FDF8"
            border="#A6F4C5"
          />
          <Block
            kicker="Revise"
            kickerColor="#93370D"
            items={state.data.revise}
            background="#FFF8E8"
            border="rgba(200,162,74,.45)"
          />
          <div
            style={{
              background: CREAM_2,
              border: `1px solid ${LINE}`,
              borderRadius: 14,
              padding: 16,
            }}
          >
            <div
              style={{
                color: GOLD_DEEP,
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              Reference rewrite
            </div>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: 15,
                color: INK,
                lineHeight: 1.65,
              }}
            >
              {state.data.rewrite}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Block({
  kicker,
  kickerColor,
  items,
  background,
  border,
}: {
  kicker: string;
  kickerColor: string;
  items: readonly string[];
  background: string;
  border: string;
}) {
  return (
    <div
      style={{
        background,
        border: `1px solid ${border}`,
        borderRadius: 14,
        padding: 16,
      }}
    >
      <div
        style={{
          color: kickerColor,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          fontSize: 10,
          fontWeight: 800,
        }}
      >
        {kicker}
      </div>
      <ul
        style={{
          margin: '8px 0 0',
          paddingLeft: 20,
          color: INK,
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        {items.map((it, i) => (
          <li key={i} style={{ marginBottom: 4 }}>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
