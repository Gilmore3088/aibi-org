'use client';

import { useCallback, useRef, useState } from 'react';
import { INK } from '@/lib/brand/colors';
import { SLATE, LINE, pageStyle, sectionPad } from './constants';
import { Label } from './primitives';

export function NotesSection({
  profileId,
  initialNotes,
}: {
  profileId: string;
  initialNotes: string | null;
}): JSX.Element {
  const [notes, setNotes] = useState<string>(initialNotes ?? '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback(
    (text: string) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(async () => {
        setSaveStatus('saving');
        try {
          const res = await fetch('/api/assessment/in-depth/notes', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profileId, notes: text }),
          });
          setSaveStatus(res.ok ? 'saved' : 'error');
        } catch {
          setSaveStatus('error');
        }
      }, 1500);
    },
    [profileId],
  );

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setNotes(value);
    setSaveStatus('idle');
    persist(value);
  }

  const statusLabel =
    saveStatus === 'saving' ? 'Saving…' :
    saveStatus === 'saved' ? 'Saved' :
    saveStatus === 'error' ? 'Could not save — check your connection.' :
    null;

  return (
    <section id="notes" style={pageStyle}>
      <div style={sectionPad}>
        <Label>My Notes</Label>
        <h2
          style={{
            fontSize: 'clamp(1.75rem, 2.6vw, 2.375rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            margin: '6px 0 10px',
            fontWeight: 800,
          }}
        >
          Personal follow-up notes.
        </h2>
        <p style={{ color: SLATE, lineHeight: 1.58, marginBottom: 20 }}>
          Capture your own action items, commitments, and context. Notes auto-save
          and are private to this link.
        </p>
        <textarea
          value={notes}
          onChange={handleChange}
          placeholder="Write your follow-up notes here…"
          rows={10}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            border: `1px solid ${LINE}`,
            borderRadius: 14,
            padding: '16px 18px',
            fontSize: '1rem',
            lineHeight: 1.6,
            color: INK,
            background: 'white',
            resize: 'vertical',
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
        {statusLabel && (
          <p
            style={{
              marginTop: 8,
              fontSize: '0.8125rem',
              color: saveStatus === 'error' ? '#C0392B' : SLATE,
            }}
          >
            {statusLabel}
          </p>
        )}
      </div>
    </section>
  );
}
