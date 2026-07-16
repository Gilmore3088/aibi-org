'use client';

import { useState } from 'react';

export function TypedConfirmGate(props: {
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}) {
  const [typed, setTyped] = useState('');
  const REQUIRED = 'I confirm this is fabricated data';
  const matches = typed.trim().toLowerCase() === REQUIRED.toLowerCase();
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pii-confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--ink)]/40 px-4"
    >
      <div className="w-full max-w-lg border border-[color:var(--ink)]/15 bg-white p-6">
        <p className="text-[0.625rem] uppercase tracking-widest text-[color:var(--ink)]">
          Sandbox confirmation
        </p>
        <h3
          id="pii-confirm-title"
          className="mt-2 text-2xl leading-tight text-[color:var(--ink)]"
        >
          Before your first run this session
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--slate-500)]">
          The AiBI Lab sends your input to a third-party model provider.
          Real member data, account numbers, or institution-confidential
          material must never leave your institution this way. Confirm you
          are using fabricated data by typing the phrase below.
        </p>
        <p id="pii-confirm-phrase" className="mt-4 text-xs text-[color:var(--ink)]">
          {REQUIRED}
        </p>
        <input
          type="text"
          aria-label="Confirmation phrase"
          aria-describedby="pii-confirm-phrase"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="Type the phrase exactly"
          className="mt-2 w-full border border-[color:var(--ink)]/20 bg-white px-3 py-2 text-sm focus:border-[color:var(--gold-deep)] focus:outline-none"
          autoFocus
        />
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={props.onCancel}
            className="text-[0.625rem] uppercase tracking-widest text-[color:var(--slate-500)] hover:text-[color:var(--ink)]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!matches}
            onClick={props.onConfirm}
            className="bg-[color:var(--gold-deep)] px-4 py-2 text-[0.625rem] uppercase tracking-widest text-[color:var(--cream)] disabled:opacity-40"
          >
            Confirm &amp; run
          </button>
        </div>
      </div>
    </div>
  );
}
