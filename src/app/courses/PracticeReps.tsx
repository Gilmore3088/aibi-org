'use client';

import { useState } from 'react';
import { Monogram } from '@/components/brand';
import { getPracticeRepById } from '@content/practice-reps/foundation-program';
import type { PracticeRep } from '@/types/lms';

// Four real Foundation practice reps, switchable. Each shows exactly what the
// learner sees: the scenario, the constraints, the starter prompt, and the
// course's own model answer — rendered as an AI session, not described.

const REP_IDS = ['rewrite-for-clarity', 'spot-the-hallucination', 'classify-the-ai-use-case', 'customer-complaint-response'] as const;

export function PracticeReps() {
  const reps = REP_IDS.map((id) => getPracticeRepById(id)).filter((r): r is PracticeRep => Boolean(r));
  const [active, setActive] = useState(0);
  const rep = reps[active];
  if (!rep) return null;

  return (
    <div className="ax-reps">
      <div className="ax-toggles ax-reps-tabs" role="tablist" aria-label="Practice reps">
        {reps.map((r, i) => (
          <button
            key={r.id}
            id={`rep-tab-${r.id}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls="rep-panel"
            onClick={() => setActive(i)}
          >
            m{String(r.moduleNumber ?? 0).padStart(2, '0')} · {r.title.toLowerCase()}
          </button>
        ))}
      </div>

      <div id="rep-panel" role="tabpanel" aria-labelledby={`rep-tab-${rep.id}`} className="ax-reps-panel">
        <div className="ax-reps-brief">
          <p className="ax-k ax-gold">
            Module {rep.moduleNumber} · {rep.timeEstimateMinutes} min · {rep.safetyLevel} data
          </p>
          <h3>{rep.title}</h3>
          <p className="ax-muted">{rep.scenario}</p>
          <ul className="ax-checklist">
            {rep.constraints.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <div className="hm-session ax-reps-session">
          <div className="hm-session-bar">
            <span className="hm-session-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>Approved AI tool · practice sandbox</span>
            <span className="hm-session-tag">synthetic data</span>
          </div>
          <div className="hm-session-body">
            <p className="hm-msg hm-msg-user">{rep.starterPrompt}</p>
            <div className="hm-msg hm-msg-ai">
              <span className="hm-ai-badge" aria-hidden="true">
                <Monogram tone="light" />
              </span>
              <p>{rep.modelAnswer}</p>
            </div>
          </div>
          <p className="hm-session-foot">Starter prompt and model answer from the Foundation course.</p>
        </div>
      </div>
    </div>
  );
}
