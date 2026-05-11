'use client';

import { useEffect, useRef, useState } from 'react';

import {
  fileToCompressedDataUrl,
  makePhotoId,
  type ItemState,
  type Photo,
} from './storage';

interface NoteEditorProps {
  readonly itemPath: string;
  readonly state: ItemState;
  readonly onUpdate: (next: ItemState) => void;
  readonly onLightbox: (photo: Photo) => void;
}

export function NoteEditor({ itemPath, state, onUpdate, onLightbox }: NoteEditorProps) {
  const [note, setNote] = useState(state.note ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keep local note in sync if the parent state changes (e.g. reset)
  useEffect(() => {
    setNote(state.note ?? '');
  }, [state.note]);

  // Debounced persistence of note text — don't write to localStorage on
  // every keystroke; wait for a 350ms pause.
  useEffect(() => {
    if ((state.note ?? '') === note) return;
    const t = setTimeout(() => {
      onUpdate({ ...state, note: note.trim() ? note : undefined });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note]);

  // Paste handler — Cmd+V an image directly into the textarea.
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      const arr = Array.from(items);
      for (const item of arr) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            void addFiles([file]);
            return;
          }
        }
      }
    }
    ta.addEventListener('paste', onPaste);
    return () => ta.removeEventListener('paste', onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  async function addFiles(files: File[]) {
    setBusy(true);
    setError(null);
    try {
      const newPhotos: Photo[] = [];
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const dataUrl = await fileToCompressedDataUrl(file);
        newPhotos.push({
          id: makePhotoId(),
          dataUrl,
          addedAt: Date.now(),
          name: file.name,
        });
      }
      if (newPhotos.length === 0) {
        setError('No image files in selection.');
        return;
      }
      onUpdate({
        ...state,
        photos: [...(state.photos ?? []), ...newPhotos],
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'add-failed';
      if (msg === 'QuotaExceededError' || /quota/i.test(msg)) {
        setError(
          'localStorage full — delete older photos or reset the page to free space.',
        );
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  function deletePhoto(id: string) {
    onUpdate({
      ...state,
      photos: (state.photos ?? []).filter((p) => p.id !== id),
    });
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '14px 18px 18px',
        borderTop: '1px dashed var(--rule-strong)',
        background: 'var(--bg)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label
          htmlFor={`note-${itemPath}`}
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 9.5,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            fontWeight: 600,
          }}
        >
          Note
        </label>
        <textarea
          id={`note-${itemPath}`}
          ref={textareaRef}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Type a note. Cmd+V to paste a screenshot."
          rows={3}
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 14.5,
            lineHeight: 1.5,
            color: 'var(--ink)',
            padding: '10px 12px',
            border: '1px solid var(--rule-strong)',
            background: 'var(--paper)',
            outline: 'none',
            resize: 'vertical',
            minHeight: 64,
          }}
        />
      </div>

      {error && (
        <div
          role="alert"
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 13,
            padding: '8px 12px',
            background: 'rgba(142, 59, 42, 0.08)',
            border: '1px solid rgba(142, 59, 42, 0.25)',
            color: 'var(--weak)',
          }}
        >
          {error}
        </div>
      )}

      {state.photos && state.photos.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 8,
          }}
        >
          {state.photos.map((photo) => (
            <div
              key={photo.id}
              style={{
                position: 'relative',
                background: 'var(--paper)',
                border: '1px solid var(--rule-strong)',
                aspectRatio: '4 / 3',
                overflow: 'hidden',
                cursor: 'zoom-in',
              }}
              onClick={() => onLightbox(photo)}
              title={photo.name ?? 'Click to enlarge'}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.dataUrl}
                alt={photo.name ?? 'Screenshot'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Delete this photo?')) deletePhoto(photo.id);
                }}
                aria-label="Delete photo"
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  background: 'rgba(14, 27, 45, 0.78)',
                  color: 'var(--paper)',
                  border: 'none',
                  width: 22,
                  height: 22,
                  borderRadius: 2,
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length > 0) void addFiles(files);
            e.currentTarget.value = '';
          }}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
          className="ledger-btn ledger-btn--ghost"
          style={{ padding: '8px 14px', fontSize: 10 }}
        >
          {busy ? 'Adding…' : '+ Add photos'}
        </button>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 9.5,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--soft)',
            fontWeight: 600,
          }}
        >
          Or paste a screenshot directly into the note field
        </span>
      </div>
    </div>
  );
}
