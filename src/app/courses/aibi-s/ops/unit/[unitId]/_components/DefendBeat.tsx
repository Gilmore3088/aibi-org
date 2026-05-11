'use client';

import { useState } from 'react';
import type { DefendBeatContent, ChatTurn, RubricScore } from '@/lib/aibi-s/types';
import { PersonaMemo } from './PersonaMemo';
import { RebuttalEditor } from './RebuttalEditor';
import { PersonaChat } from './PersonaChat';
import { RubricScore as RubricScoreView } from './RubricScore';
import { FrameworkHooks } from './FrameworkHooks';

type Phase = 'memo' | 'rebuttal' | 'chat' | 'grading' | 'scored';

export function DefendBeat({
  beat,
  rebuttal,
  onRebuttalChange,
  turns,
  onAppendTurn,
  score,
  onScore,
  onAdvance,
}: {
  readonly beat: DefendBeatContent;
  readonly rebuttal: string;
  readonly onRebuttalChange: (v: string) => void;
  readonly turns: readonly ChatTurn[];
  readonly onAppendTurn: (t: ChatTurn) => void;
  readonly score: RubricScore | null;
  readonly onScore: (s: RubricScore) => void;
  readonly onAdvance: () => void;
}) {
  const [phase, setPhase] = useState<Phase>(score ? 'scored' : 'memo');
  const [err, setErr] = useState<string | null>(null);

  async function requestGrade() {
    setPhase('grading');
    setErr(null);
    try {
      const resp = await fetch('/api/aibi-s/grade', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ unitId: '1.1', trackCode: 'ops', rebuttal, turns }),
      });
      if (!resp.ok) throw new Error((await resp.json()).error ?? 'Grading failed');
      const s = (await resp.json()) as RubricScore;
      onScore(s);
      setPhase('scored');
    } catch (e) {
      setErr((e as Error).message);
      setPhase('chat');
    }
  }

  return (
    <section className="space-y-6">
      <FrameworkHooks hooks={beat.hooks} />
      <h2 className="font-serif text-3xl">Defend</h2>
      <PersonaMemo persona={beat.persona} />

      {phase === 'memo' && (
        <button
          onClick={() => setPhase('rebuttal')}
          className="px-6 py-3 bg-[color:var(--color-cobalt)] text-white rounded"
        >
          Write my rebuttal
        </button>
      )}

      {(phase === 'rebuttal' || phase === 'chat' || phase === 'grading' || phase === 'scored') && (
        <RebuttalEditor
          value={rebuttal}
          onChange={onRebuttalChange}
          onSubmit={() => setPhase('chat')}
          submitted={phase !== 'rebuttal'}
        />
      )}

      {(phase === 'chat' || phase === 'grading' || phase === 'scored') && (
        <PersonaChat
          persona={beat.persona}
          rebuttal={rebuttal}
          turns={turns}
          onAppend={onAppendTurn}
          onGrade={requestGrade}
        />
      )}

      {phase === 'grading' && <p className="text-[color:var(--color-slate)]">Grading your defense…</p>}

      {err && <p className="text-[color:var(--color-error)]">{err}</p>}

      {phase === 'scored' && score && (
        <RubricScoreView rubric={beat.persona.rubric} score={score} onContinue={onAdvance} />
      )}
    </section>
  );
}
