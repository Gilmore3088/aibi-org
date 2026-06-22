'use client';

import { useState } from 'react';

const STATUSES = [
  'new',
  'open',
  'waiting_customer',
  'waiting_internal',
  'resolved',
  'refunded',
  'closed_no_action',
] as const;

const PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;

export function CaseActions({
  caseId,
  initialStatus,
  initialPriority,
}: {
  readonly caseId: string;
  readonly initialStatus: string;
  readonly initialPriority: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState(initialPriority);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function request(path: string, init: RequestInit) {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(path, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init.headers ?? {}),
        },
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Request failed (${response.status})`);
      }
      setMessage('Saved.');
      window.setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setBusy(false);
    }
  }

  async function recordManualRefund() {
    setBusy(true);
    setMessage(null);
    try {
      const eventResponse = await fetch(`/api/admin/support/cases/${caseId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'refund_manually_issued',
          message: 'Refund was issued manually in Stripe.',
        }),
      });
      if (!eventResponse.ok) throw new Error('Could not record refund event.');

      const patchResponse = await fetch(`/api/admin/support/cases/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'refunded',
          message: 'Manual refund recorded after Stripe processing.',
        }),
      });
      if (!patchResponse.ok) throw new Error('Could not update case status.');

      setMessage('Saved.');
      window.setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="support-actions">
      <div className="support-actions__row">
        <label>
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {STATUSES.map((item) => (
              <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Priority</span>
          <select value={priority} onChange={(event) => setPriority(event.target.value)}>
            {PRIORITIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            request(`/api/admin/support/cases/${caseId}`, {
              method: 'PATCH',
              body: JSON.stringify({ status, priority }),
            })
          }
        >
          Save state
        </button>
      </div>

      <label className="support-actions__note">
        <span>Timeline note</span>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} />
      </label>
      <div className="support-actions__row">
        <button
          type="button"
          disabled={busy || note.trim().length === 0}
          onClick={() =>
            request(`/api/admin/support/cases/${caseId}/events`, {
              method: 'POST',
              body: JSON.stringify({ eventType: 'admin_note', message: note }),
            })
          }
        >
          Add note
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            request(`/api/admin/support/cases/${caseId}/send-access`, {
              method: 'POST',
              body: JSON.stringify({}),
            })
          }
        >
          Send access email
        </button>
      </div>

      <div className="support-actions__row">
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            request(`/api/admin/support/cases/${caseId}/events`, {
              method: 'POST',
              body: JSON.stringify({
                eventType: 'refund_approved',
                message: 'Refund approved for manual processing in Stripe.',
              }),
            })
          }
        >
          Record refund approved
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            request(`/api/admin/support/cases/${caseId}/events`, {
              method: 'POST',
              body: JSON.stringify({
                eventType: 'refund_denied',
                message: 'Refund denied after eligibility review.',
              }),
            })
          }
        >
          Record refund denied
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={recordManualRefund}
        >
          Record manual refund
        </button>
      </div>
      {message ? <p className="support-actions__message">{message}</p> : null}
    </div>
  );
}
