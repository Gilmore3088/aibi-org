'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  LedgerEyebrow,
  LedgerH1,
  LedgerLede,
  LedgerSurface,
} from '@/components/ledger';
import { CHECKLIST, TOTAL_ITEMS, VISUAL_CHECKLIST } from './data';
import { NoteEditor } from './NoteEditor';
import {
  approximateBytes,
  clearStore,
  loadStore,
  saveStore,
  type ItemState,
  type Photo,
  type StoreShape,
} from './storage';

type Filter = 'all' | 'unchecked' | 'checked' | 'has-notes';

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export default function RedesignChecklistPage(): JSX.Element {
  const [store, setStore] = useState<StoreShape>({});
  const [filter, setFilter] = useState<Filter>('all');
  const [hydrated, setHydrated] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setStore(loadStore());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      saveStore(store);
      setSaveError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'save-failed';
      setSaveError(
        /quota/i.test(msg)
          ? 'localStorage is full. Delete a photo or reset to free space.'
          : msg,
      );
    }
  }, [store, hydrated]);

  // Close lightbox on Escape
  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const total = TOTAL_ITEMS;
  const done = useMemo(
    () => Object.values(store).filter((s) => s.checked).length,
    [store],
  );
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const storageBytes = useMemo(() => approximateBytes(store), [store]);

  function updateItem(path: string, next: ItemState) {
    setStore((prev) => {
      const merged = { ...prev };
      // Drop the entry entirely when nothing meaningful is set, to keep
      // localStorage tidy.
      const empty =
        !next.checked &&
        !next.note &&
        (!next.photos || next.photos.length === 0);
      if (empty) {
        delete merged[path];
      } else {
        merged[path] = next;
      }
      return merged;
    });
  }

  function toggleCheck(path: string) {
    const cur = store[path] ?? {};
    updateItem(path, { ...cur, checked: !cur.checked });
  }

  function toggleExpand(path: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  function resetAll() {
    if (
      window.confirm(
        'Reset every checkbox, note, and photo? This cannot be undone.',
      )
    ) {
      clearStore();
      setStore({});
      setExpanded(new Set());
    }
  }

  return (
    <LedgerSurface
      brandHref="/"
      headerRight={
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            fontWeight: 600,
          }}
        >
          {done} / {total} · {pct}%
        </span>
      }
    >
      <div style={{ width: '100%', maxWidth: 920, display: 'flex', flexDirection: 'column', gap: 32 }}>
        <header
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            paddingBottom: 24,
            borderBottom: '3px double var(--ink)',
          }}
        >
          <LedgerEyebrow>Internal · QA</LedgerEyebrow>
          <LedgerH1>Redesign <em>checklist.</em></LedgerH1>
          <LedgerLede>
            Walk every page. Check it off when it looks right. Click a row to
            add notes or paste screenshots. Everything saves to your browser;
            nothing leaves this machine.
          </LedgerLede>
        </header>

        {/* Progress + meta */}
        <div>
          <div style={{ height: 4, background: 'var(--rule)', position: 'relative', overflow: 'hidden' }}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                width: `${pct}%`,
                background: 'var(--terra)',
                transition: 'width 0.25s ease-out',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: 16,
              marginTop: 10,
              fontFamily: 'var(--mono)',
              fontSize: 10.5,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              fontWeight: 600,
            }}
          >
            <span>Progress · {formatBytes(storageBytes)} stored</span>
            <button
              type="button"
              onClick={resetAll}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                font: 'inherit',
                letterSpacing: 'inherit',
                textTransform: 'inherit',
                color: 'var(--weak)',
              }}
            >
              Reset all
            </button>
          </div>
        </div>

        {saveError && (
          <div
            role="alert"
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 13.5,
              padding: '10px 14px',
              background: 'rgba(142, 59, 42, 0.08)',
              border: '1px solid rgba(142, 59, 42, 0.25)',
              color: 'var(--weak)',
            }}
          >
            {saveError}
          </div>
        )}

        {/* Filter */}
        <div className="ledger-toggle" role="tablist" aria-label="Filter items">
          {(['all', 'unchecked', 'checked', 'has-notes'] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === 'all'
                ? 'All'
                : f === 'unchecked'
                  ? 'Unchecked'
                  : f === 'checked'
                    ? 'Checked'
                    : 'With notes'}
            </button>
          ))}
        </div>

        {/* Categories */}
        {CHECKLIST.map((cat) => {
          const visibleItems = cat.items.filter((item) => {
            const s = store[item.path] ?? {};
            const isChecked = !!s.checked;
            const hasNote = !!s.note || (s.photos?.length ?? 0) > 0;
            if (filter === 'all') return true;
            if (filter === 'unchecked') return !isChecked;
            if (filter === 'checked') return isChecked;
            if (filter === 'has-notes') return hasNote;
            return true;
          });
          if (visibleItems.length === 0) return null;

          const catDone = cat.items.filter((i) => store[i.path]?.checked).length;
          const catTotal = cat.items.length;

          return (
            <section key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <header
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 16,
                  paddingBottom: 12,
                  borderBottom: '1px solid var(--rule-strong)',
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontFamily: 'var(--serif)',
                    fontSize: 26,
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    color: 'var(--ink)',
                  }}
                >
                  {cat.title}
                </h2>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontFamily: 'var(--mono)',
                    fontSize: 10.5,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color:
                      catDone === catTotal && catTotal > 0
                        ? 'var(--terra)'
                        : 'var(--muted)',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {catDone} / {catTotal}
                </span>
              </header>
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--serif)',
                  fontStyle: 'italic',
                  fontSize: 15,
                  color: 'var(--muted)',
                  lineHeight: 1.5,
                }}
              >
                {cat.description}
              </p>

              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '8px 0 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  background: 'var(--paper)',
                  border: '1px solid var(--rule)',
                }}
              >
                {visibleItems.map((item) => {
                  const s = store[item.path] ?? {};
                  const isChecked = !!s.checked;
                  const isExpanded = expanded.has(item.path);
                  const hasContent = !!s.note || (s.photos?.length ?? 0) > 0;
                  const itemId = `cb-${item.path.replace(/[^a-z0-9]/gi, '-')}`;

                  return (
                    <li
                      key={item.path}
                      style={{
                        borderTop: '1px solid var(--rule)',
                        background: isChecked ? 'var(--bg)' : 'transparent',
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'auto 1fr auto auto',
                          gap: 14,
                          alignItems: 'baseline',
                          padding: '14px 18px',
                        }}
                      >
                        <input
                          id={itemId}
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCheck(item.path)}
                          style={{
                            width: 16,
                            height: 16,
                            accentColor: 'var(--terra)',
                            cursor: 'pointer',
                            marginTop: 4,
                          }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <a
                            href={item.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontFamily: 'var(--mono)',
                              fontSize: 13,
                              color: isChecked ? 'var(--muted)' : 'var(--ink)',
                              textDecoration: isChecked ? 'line-through' : 'none',
                              letterSpacing: '0.01em',
                              fontWeight: 500,
                              alignSelf: 'flex-start',
                            }}
                          >
                            {item.label ?? item.path} ↗
                          </a>
                          {item.note && (
                            <span
                              style={{
                                fontFamily: 'var(--serif)',
                                fontStyle: 'italic',
                                fontSize: 13.5,
                                color: 'var(--muted)',
                                lineHeight: 1.4,
                              }}
                            >
                              {item.note}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.path)}
                          aria-expanded={isExpanded}
                          aria-label={
                            isExpanded
                              ? `Hide notes for ${item.path}`
                              : `Add notes for ${item.path}`
                          }
                          style={{
                            background: hasContent ? 'var(--accent-soft, rgba(181,134,42,0.1))' : 'transparent',
                            border: '1px solid var(--rule-strong)',
                            padding: '6px 10px',
                            fontFamily: 'var(--mono)',
                            fontSize: 9.5,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: hasContent ? 'var(--terra)' : 'var(--ink-2)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            alignSelf: 'center',
                          }}
                        >
                          {hasContent
                            ? `Notes${(s.photos?.length ?? 0) > 0 ? ` · ${s.photos!.length}📎` : ''}`
                            : '+ Note'}
                        </button>
                        <span
                          aria-hidden="true"
                          style={{
                            fontFamily: 'var(--mono)',
                            fontSize: 9.5,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: isChecked ? 'var(--terra)' : 'var(--soft)',
                            fontWeight: 600,
                            alignSelf: 'center',
                            minWidth: 50,
                            textAlign: 'right',
                          }}
                        >
                          {isChecked ? '✓ done' : '·'}
                        </span>
                      </div>
                      {isExpanded && (
                        <NoteEditor
                          itemPath={item.path}
                          state={s}
                          onUpdate={(next) => updateItem(item.path, next)}
                          onLightbox={setLightbox}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        {/* What to look for */}
        <section
          style={{
            marginTop: 16,
            padding: '24px 28px',
            background: 'var(--tape)',
            borderLeft: '3px solid var(--terra)',
          }}
        >
          <h2
            style={{
              margin: '0 0 12px',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--terra)',
              fontWeight: 700,
            }}
          >
            What to look for
          </h2>
          <ul
            style={{
              margin: 0,
              paddingLeft: 20,
              fontFamily: 'var(--serif)',
              fontSize: 15.5,
              lineHeight: 1.55,
              color: 'var(--ink-2)',
            }}
          >
            {VISUAL_CHECKLIST.map((rule) => (
              <li key={rule} style={{ marginBottom: 6 }}>
                {rule}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Lightbox overlay */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo preview"
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(14, 27, 45, 0.85)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            cursor: 'zoom-out',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.dataUrl}
            alt={lightbox.name ?? 'Screenshot'}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(null);
            }}
            aria-label="Close preview"
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              background: 'var(--paper)',
              color: 'var(--ink)',
              border: 'none',
              padding: '10px 16px',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close · esc
          </button>
        </div>
      )}
    </LedgerSurface>
  );
}
