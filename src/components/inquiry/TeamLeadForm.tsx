'use client';

import { useState, type FormEvent } from 'react';

type InquiryType =
  | 'briefing-request'
  | 'partner-rollout-request'
  | 'cohort-pilot-request'
  | 'project-plan-request'
  | 'team-rollout-request'
  | 'team-assessment-request'
  | 'foundation-seats-request';

interface TeamLeadFormProps {
  readonly id?: string;
  readonly title?: string;
  readonly eyebrow?: string;
  readonly description?: string;
  readonly defaultType?: InquiryType;
  readonly compact?: boolean;
}

const BOOKING_URL = process.env.NEXT_PUBLIC_CALENDLY_URL?.trim() ?? '';

const TRACKS: ReadonlyArray<{ type: InquiryType; label: string }> = [
  { type: 'briefing-request', label: 'Executive briefing' },
  { type: 'partner-rollout-request', label: "Bankers' bank / association partner" },
  { type: 'cohort-pilot-request', label: 'Cohort pilot / L&D rollout' },
  { type: 'project-plan-request', label: 'PMO project plan' },
  { type: 'team-rollout-request', label: 'Assisted rollout' },
  { type: 'team-assessment-request', label: 'Team assessment' },
  { type: 'foundation-seats-request', label: 'Foundation course seats' },
];

export function TeamLeadForm({
  id = 'team-inquiry',
  title = 'Scope an institution rollout.',
  eyebrow = 'Institution inquiry',
  description = 'Tell us what you are trying to buy or evaluate. We will reply within one business day from hello@aibankinginstitute.com.',
  defaultType = 'team-rollout-request',
  compact = false,
}: TeamLeadFormProps): JSX.Element {
  const defaultTrack = TRACKS.find((track) => track.type === defaultType) ?? TRACKS[0];
  const [type, setType] = useState<InquiryType>(defaultTrack.type);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const track = TRACKS.find((option) => option.type === type)?.label ?? defaultTrack.label;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setError('');

    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          institution,
          track,
          notes,
          type,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? 'Could not send the inquiry.');
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Could not send the inquiry.');
    }
  }

  return (
    <section id={id} className={`team-lead-form${compact ? ' is-compact' : ''}`} aria-label={title}>
      <div className="team-lead-copy">
        <p className="team-lead-kicker">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
        <ul>
          <li>Lead capture goes to the support/admin queue.</li>
          <li>Reply target: within one business day.</li>
          <li>Checkout stays assisted until cohort setup is confirmed.</li>
        </ul>
        {BOOKING_URL ? (
          <a className="team-lead-booking" href={BOOKING_URL} target="_blank" rel="noreferrer">
            Book a briefing
          </a>
        ) : null}
      </div>

      <form className="team-lead-fields" onSubmit={handleSubmit}>
        <label>
          <span>Name</span>
          <input
            required
            autoComplete="name"
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label>
          <span>Work email</span>
          <input
            required
            type="email"
            autoComplete="email"
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          <span>Institution</span>
          <input
            required
            autoComplete="organization"
            maxLength={200}
            value={institution}
            onChange={(event) => setInstitution(event.target.value)}
          />
        </label>
        <label>
          <span>What are you scoping?</span>
          <select value={type} onChange={(event) => setType(event.target.value as InquiryType)}>
            {TRACKS.map((option) => (
              <option key={option.type} value={option.type}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="team-lead-full">
          <span>Context</span>
          <textarea
            rows={compact ? 3 : 4}
            maxLength={2000}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Seats, departments, L&D/cohort owner, member/client institutions, timing, or questions for the first call."
          />
        </label>
        <button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending...' : 'Send inquiry'}
        </button>
        {status === 'success' ? (
          <p className="team-lead-success" role="status">
            Received. We will reply within one business day.
          </p>
        ) : null}
        {status === 'error' ? (
          <p className="team-lead-error" role="alert">
            {error}
          </p>
        ) : null}
      </form>

      <style>{`
        .team-lead-form {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(360px, 1.1fr);
          gap: 28px;
          align-items: stretch;
          border: 1px solid var(--ink-a10);
          background: #fff;
          padding: 28px;
          border-radius: 16px;
          box-shadow: 0 18px 56px rgba(7, 26, 47, 0.07);
        }
        .team-lead-form.is-compact {
          grid-template-columns: 1fr;
          gap: 20px;
          padding: 24px;
        }
        .team-lead-copy {
          display: flex;
          min-width: 0;
          flex-direction: column;
        }
        .team-lead-kicker {
          margin: 0 0 10px;
          color: var(--gold-deep);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .team-lead-copy h2 {
          margin: 0;
          color: var(--ink);
          font-size: clamp(28px, 3vw, 44px);
          line-height: 1.02;
          letter-spacing: 0;
        }
        .team-lead-copy p {
          margin: 16px 0 0;
          color: var(--slate-600);
          font-size: 15px;
          line-height: 1.55;
        }
        .team-lead-copy ul {
          display: grid;
          gap: 9px;
          margin: 20px 0 0;
          padding: 18px 0;
          border-top: 1px solid var(--ink-a10);
          border-bottom: 1px solid var(--ink-a10);
          list-style: none;
        }
        .team-lead-copy li {
          display: grid;
          grid-template-columns: 14px 1fr;
          gap: 10px;
          color: var(--ink);
          font-size: 14px;
          line-height: 1.45;
        }
        .team-lead-copy li::before {
          content: "—";
          color: var(--gold-deep);
          font-weight: 900;
        }
        .team-lead-booking {
          display: inline-flex;
          width: fit-content;
          min-height: 44px;
          align-items: center;
          justify-content: center;
          margin-top: 20px;
          border: 1px solid var(--ink);
          color: var(--ink);
          padding: 0 18px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          text-decoration: none;
        }
        .team-lead-fields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          min-width: 0;
        }
        .is-compact .team-lead-fields {
          grid-template-columns: 1fr;
        }
        .team-lead-fields label {
          display: grid;
          gap: 7px;
          min-width: 0;
        }
        .team-lead-fields span {
          color: var(--slate-600);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }
        .team-lead-fields input,
        .team-lead-fields select,
        .team-lead-fields textarea {
          width: 100%;
          min-width: 0;
          border: 1px solid var(--ink-a10);
          background: var(--cream);
          color: var(--ink);
          padding: 13px 12px;
          font: inherit;
          font-size: 15px;
          line-height: 1.3;
        }
        .team-lead-fields textarea {
          resize: vertical;
        }
        .team-lead-full {
          grid-column: 1 / -1;
        }
        .team-lead-fields button {
          min-height: 48px;
          border: 0;
          background: var(--ink);
          color: var(--cream);
          padding: 0 18px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .team-lead-fields button:disabled {
          cursor: wait;
          opacity: 0.65;
        }
        .team-lead-success,
        .team-lead-error {
          align-self: center;
          margin: 0;
          color: #047857;
          font-size: 14px;
          font-weight: 800;
        }
        .team-lead-error {
          color: #9b2226;
        }
        @media (max-width: 860px) {
          .team-lead-form,
          .team-lead-fields {
            grid-template-columns: 1fr;
          }
          .team-lead-form {
            padding: 22px;
            border-radius: 12px;
          }
        }
      `}</style>
    </section>
  );
}
