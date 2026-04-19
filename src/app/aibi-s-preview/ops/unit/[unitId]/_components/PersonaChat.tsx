'use client';

import { useState } from 'react';
import type { ChatTurn, DefendBeatPersona } from '../../../../../../../lib/aibi-s/types';
import { canContinueChat } from '../../../../../../../lib/aibi-s/chat-limiter';

export function PersonaChat({
  persona,
  rebuttal,
  turns,
  onAppend,
  onGrade,
}: {
  readonly persona: DefendBeatPersona;
  readonly rebuttal: string;
  readonly turns: readonly ChatTurn[];
  readonly onAppend: (t: ChatTurn) => void;
  readonly onGrade: () => void;
}) {
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const continuation = canContinueChat(turns, persona.maxChatTurns);
  const exhausted = !continuation.allowed;
  const firstPersonaFetchNeeded = turns.length === 0;

  async function fetchPersonaTurn(history: readonly ChatTurn[]) {
    setLoading(true);
    setErr(null);
    try {
      const resp = await fetch('/api/aibi-s/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ unitId: '1.1', trackCode: 'ops', rebuttal, turns: history }),
      });
      if (!resp.ok) throw new Error((await resp.json()).error ?? 'Chat failed');
      const data = (await resp.json()) as { personaTurn: ChatTurn; allowMoreTurns: boolean };
      onAppend(data.personaTurn);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function sendLearnerTurn() {
    if (!draft.trim()) return;
    const t: ChatTurn = { role: 'learner', content: draft, turnIndex: turns.length + 1 };
    onAppend(t);
    setDraft('');
    const next = [...turns, t];
    const c = canContinueChat(next, persona.maxChatTurns);
    if (c.allowed && c.nextRole === 'persona') await fetchPersonaTurn(next);
  }

  return (
    <div className="space-y-4 border rounded p-4">
      <header className="flex items-center justify-between">
        <h3 className="font-semibold">Probe from {persona.displayName}</h3>
        <span className="text-xs text-[color:var(--color-ink)]/60">
          {turns.filter((t) => t.role === 'persona').length} / {persona.maxChatTurns} persona turns
        </span>
      </header>

      <ol className="space-y-3">
        {turns.map((t, i) => (
          <li
            key={i}
            className={`p-3 rounded ${t.role === 'persona'
              ? 'bg-[color:var(--color-cobalt)]/5 border-l-2 border-[color:var(--color-cobalt)]'
              : 'bg-white border-l-2 border-[color:var(--color-ink)]/20'}`}
          >
            <p className="text-xs uppercase tracking-wide mb-1 text-[color:var(--color-ink)]/50">
              {t.role === 'persona' ? persona.displayName : 'You'}
            </p>
            <p className="whitespace-pre-wrap">{t.content}</p>
          </li>
        ))}
      </ol>

      {err && <p className="text-[color:var(--color-error)] text-sm">{err}</p>}

      {firstPersonaFetchNeeded && !loading && (
        <button
          onClick={() => fetchPersonaTurn([])}
          className="px-4 py-2 bg-[color:var(--color-cobalt)] text-white rounded"
        >
          Open the probe
        </button>
      )}

      {!exhausted && turns.length > 0 && continuation.nextRole === 'learner' && !loading && (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            className="w-full p-3 border rounded"
            placeholder="Respond to the question..."
          />
          <button
            disabled={!draft.trim()}
            onClick={sendLearnerTurn}
            className="px-4 py-2 bg-[color:var(--color-cobalt)] text-white rounded disabled:opacity-40"
          >
            Send response
          </button>
        </div>
      )}

      {loading && <p className="text-sm italic">…thinking</p>}

      {exhausted && (
        <button
          onClick={onGrade}
          className="px-6 py-3 bg-[color:var(--color-sage)] text-white rounded"
        >
          Probe complete — grade my defense
        </button>
      )}
    </div>
  );
}
