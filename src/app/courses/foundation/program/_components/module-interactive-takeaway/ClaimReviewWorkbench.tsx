'use client';

import { useState } from 'react';
import type { ClaimVerdict, DraftPayload, ModuleInteractiveTakeawayProps } from './types';
import { saveInteractiveDraft } from './saveInteractiveDraft';

const CLAIM_VERDICTS: readonly ClaimVerdict[] = ['verified', 'unsupported', 'wrong'];

const CLAIM_REVIEW_ITEMS: readonly {
  readonly id: string;
  readonly claim: string;
  readonly expected: ClaimVerdict;
  readonly evidence: string;
}[] = [
  {
    id: 'reg-e-timer',
    claim: 'Covered EFT disputes need an initial investigation response within 10 business days.',
    expected: 'verified',
    evidence: 'The source packet includes the 10-business-day Reg E timer summary.',
  },
  {
    id: 'fee-waiver',
    claim: 'Every duplicate overdraft fee under $50 must be waived automatically.',
    expected: 'wrong',
    evidence: 'The sample fee policy requires manager review; it does not create an automatic waiver.',
  },
  {
    id: 'launch-date',
    claim: 'The updated disclosure goes live on June 1.',
    expected: 'unsupported',
    evidence: 'No launch date appears in the sample source. The date must be verified before reuse.',
  },
] as const;

function verdictLabel(verdict: ClaimVerdict): string {
  if (verdict === 'verified') return 'Verified';
  if (verdict === 'unsupported') return 'Unsupported';
  return 'Wrong';
}

export function UnusedClaimReviewWorkbench({
  moduleId,
  artifactLabel,
}: Pick<ModuleInteractiveTakeawayProps, 'moduleId' | 'artifactLabel'>) {
  const [verdicts, setVerdicts] = useState<Record<string, ClaimVerdict | undefined>>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const reviewed = CLAIM_REVIEW_ITEMS.filter((item) => verdicts[item.id]).length;
  const correct = CLAIM_REVIEW_ITEMS.filter((item) => verdicts[item.id] === item.expected).length;
  const complete = reviewed === CLAIM_REVIEW_ITEMS.length;

  function choose(itemId: string, verdict: ClaimVerdict) {
    setSavedAt(null);
    setVerdicts((current) => ({ ...current, [itemId]: verdict }));
  }

  function save() {
    const saved = new Date().toISOString();
    const rows = CLAIM_REVIEW_ITEMS.map((item) => {
      const selected = verdicts[item.id];
      return `| ${item.claim} | ${selected ? verdictLabel(selected) : 'Not reviewed'} | ${verdictLabel(item.expected)} | ${item.evidence} |`;
    }).join('\n');
    const content = `# AI Claim Review worksheet\n\n| Claim | Learner call | Expected call | Evidence needed |\n| --- | --- | --- | --- |\n${rows}\n\n## Habit to save\nI will treat numbers, dates, names, and policy claims as draft material until the source proves them.`;
    const payload: DraftPayload = {
      moduleId,
      moduleNumber: 2,
      model: 'AiBI claim review workbench',
      dataset: 'AI Claim Review Packet',
      savedAt: saved,
      reviewChecklist: ['Every number is checked', 'Every date is checked', 'Unsupported claims are labeled before reuse'],
      content,
    };
    saveInteractiveDraft(payload);
    setSavedAt(saved);
  }

  return (
    <section className="foundation-interactive-takeaway" data-testid="foundation-claim-review-workbench">
      <div className="foundation-interactive-takeaway__head">
        <div>
          <p className="foundation-interactive-takeaway__eyebrow">Build the verification habit</p>
          <h3>Claim Review Workbench</h3>
          <p>Classify each confident claim before it reaches a memo, board packet, or customer-facing draft.</p>
        </div>
        <span className="foundation-interactive-score">{correct}/{CLAIM_REVIEW_ITEMS.length} clean calls</span>
      </div>

      <div className="foundation-claim-review__workspace">
        {CLAIM_REVIEW_ITEMS.map((item, index) => {
          const selected = verdicts[item.id];
          const isCorrect = selected === item.expected;
          return (
            <div key={item.id} className="foundation-claim-card">
              <p className="foundation-tool-panel__label">Claim {index + 1}</p>
              <h4>{item.claim}</h4>
              <div className="foundation-claim-card__choices" aria-label={`Verdict for claim ${index + 1}`}>
                {CLAIM_VERDICTS.map((verdict) => (
                  <button
                    key={verdict}
                    type="button"
                    aria-pressed={selected === verdict}
                    className="foundation-claim-choice"
                    onClick={() => choose(item.id, verdict)}
                  >
                    {verdictLabel(verdict)}
                  </button>
                ))}
              </div>
              <div
                className={`foundation-tool-panel foundation-tool-panel--${!selected ? 'warn' : isCorrect ? 'good' : 'bad'}`}
              >
                <p className="foundation-tool-panel__label">
                  {!selected ? 'Evidence check' : isCorrect ? 'Good call' : 'Recheck'}
                </p>
                <p>{selected ? item.evidence : 'Pick the claim status, then compare it to the source evidence.'}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="foundation-interactive-takeaway__footer">
        <button type="button" onClick={save} disabled={!complete}>
          {savedAt ? 'Saved to packet draft' : complete ? `Save to ${artifactLabel}` : 'Review all claims to save'}
        </button>
        <p>{complete ? 'The worksheet now shows the evidence habit, not just the answer.' : 'Adult learning starts with the decision before the explanation.'}</p>
      </div>
    </section>
  );
}
