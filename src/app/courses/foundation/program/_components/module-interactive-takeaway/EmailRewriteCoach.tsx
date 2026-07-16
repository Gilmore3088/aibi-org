'use client';

import { useState } from 'react';
import type { DraftPayload, EmailMove, ModuleInteractiveTakeawayProps } from './types';
import { saveInteractiveDraft } from './saveInteractiveDraft';

const EMAIL_RAW_NOTE =
  'Maria at Downtown says account 872399 is still showing the duplicate $35 fee. She emailed again and is upset. Can someone look before the Friday huddle? I think Alex was checking with Ops but I am not sure.';

const EMAIL_MOVES: readonly {
  readonly id: EmailMove;
  readonly label: string;
  readonly short: string;
  readonly missing: string;
}[] = [
  {
    id: 'redact',
    label: 'Strip identifiers',
    short: 'Names and account data become placeholders.',
    missing: 'The draft still exposes customer and account details.',
  },
  {
    id: 'action',
    label: 'Lead with action',
    short: 'The first line says what needs to happen.',
    missing: 'The reader has to infer the task.',
  },
  {
    id: 'owner',
    label: 'Name owner',
    short: 'Alex/Ops is accountable for the next check.',
    missing: 'No one owns the next move.',
  },
  {
    id: 'deadline',
    label: 'Set deadline',
    short: 'Friday huddle becomes the time boundary.',
    missing: 'The task can drift.',
  },
] as const;

function buildEmailDraft(activeMoves: ReadonlySet<EmailMove>): string {
  const has = (move: EmailMove) => activeMoves.has(move);
  const subject = has('action')
    ? 'Subject: Action needed before Friday huddle'
    : 'Subject: Can someone look at this?';
  const opener = has('action')
    ? 'Please confirm whether the duplicate fee has been corrected and what staff should tell the member.'
    : 'The member is upset about the fee issue and needs a response.';
  const protectedLine = has('redact')
    ? 'Protected details: [MEMBER], [ACCOUNT REMOVED], and dollar amount carried only because it is needed for the fee review.'
    : 'Details still exposed: Maria, account 872399, duplicate $35 fee.';
  const owner = has('owner') ? 'Owner: Alex with Ops.' : 'Owner: [VERIFY].';
  const deadline = has('deadline') ? 'Deadline: before the Friday huddle.' : 'Deadline: [VERIFY].';
  const review = has('redact') && has('action')
    ? 'Human review: confirm the fee status in the approved system before any member-facing response.'
    : 'Human review: do not send until identifiers are removed and the action is clear.';

  return [subject, opener, owner, deadline, protectedLine, review].join('\n');
}

export function UnusedEmailRewriteCoach({
  moduleId,
  artifactLabel,
}: Pick<ModuleInteractiveTakeawayProps, 'moduleId' | 'artifactLabel'>) {
  const [activeMoves, setActiveMoves] = useState<ReadonlySet<EmailMove>>(
    () => new Set<EmailMove>(['action']),
  );
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const score = EMAIL_MOVES.filter((move) => activeMoves.has(move.id)).length;
  const complete = score === EMAIL_MOVES.length;
  const draft = buildEmailDraft(activeMoves);

  function toggle(move: EmailMove) {
    setSavedAt(null);
    setActiveMoves((current) => {
      const next = new Set(current);
      if (next.has(move)) {
        next.delete(move);
      } else {
        next.add(move);
      }
      return next;
    });
  }

  function save() {
    const saved = new Date().toISOString();
    const content = `# Action-first email rewrite\n\n## Raw note\n${EMAIL_RAW_NOTE}\n\n## Rewritten draft\n${draft}\n\n## Review note\nClarity score ${score}/4. ${complete ? 'Identifiers are stripped, action, owner, and deadline are visible.' : 'Missing moves must be completed before reuse.'}`;
    const payload: DraftPayload = {
      moduleId,
      moduleNumber: 1,
      model: 'AiBI email rewrite coach',
      dataset: 'Messy Internal Email Drafts',
      savedAt: saved,
      reviewChecklist: ['No customer or account data', 'Action appears in the first two lines', 'Deadline and owner are explicit'],
      content,
    };
    saveInteractiveDraft(payload);
    setSavedAt(saved);
  }

  return (
    <section className="foundation-interactive-takeaway" data-testid="foundation-email-rewrite-coach">
      <div className="foundation-interactive-takeaway__head">
        <div>
          <p className="foundation-interactive-takeaway__eyebrow">Build the first reusable habit</p>
          <h3>Email Rewrite Coach</h3>
          <p>Turn a messy note into a safe internal action request before the general lab opens.</p>
        </div>
        <span className="foundation-interactive-score">Clarity {score}/4</span>
      </div>

      <div className="foundation-email-rewrite__workspace">
        <div className="foundation-tool-panel foundation-tool-panel--bad">
          <p className="foundation-tool-panel__label">Bad way</p>
          <p>{EMAIL_RAW_NOTE}</p>
        </div>

        <div className="foundation-takeaway-move-grid" aria-label="Rewrite moves">
          {EMAIL_MOVES.map((move) => {
            const active = activeMoves.has(move.id);
            return (
              <button
                key={move.id}
                type="button"
                aria-pressed={active}
                className="foundation-takeaway-toggle"
                onClick={() => toggle(move.id)}
              >
                <span>{move.label}</span>
                <small>{active ? move.short : move.missing}</small>
              </button>
            );
          })}
        </div>

        <div className={`foundation-tool-panel foundation-tool-panel--${complete ? 'good' : 'warn'}`}>
          <p className="foundation-tool-panel__label">Rewritten draft</p>
          <pre>{draft}</pre>
        </div>
      </div>

      <div className="foundation-interactive-takeaway__footer">
        <button type="button" onClick={save} disabled={!complete}>
          {savedAt ? 'Saved to packet draft' : complete ? `Save to ${artifactLabel}` : 'Complete the four moves to save'}
        </button>
        <p>{complete ? 'The draft is short, redacted, owned, and deadline-bound.' : 'The tool should make the missing judgment visible.'}</p>
      </div>
    </section>
  );
}
