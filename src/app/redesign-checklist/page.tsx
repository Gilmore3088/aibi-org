'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  LedgerEyebrow,
  LedgerH1,
  LedgerLede,
  LedgerSurface,
} from '@/components/ledger';
import { CHECKLIST, TOTAL_ITEMS, VISUAL_CHECKLIST } from './data';

const STORAGE_KEY = 'aibi-redesign-checklist-v1';

type Filter = 'all' | 'unchecked' | 'checked';

export default function RedesignChecklistPage(): JSX.Element {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<Filter>('all');
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setChecked(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {
      /* ignore */
    }
  }, [checked, hydrated]);

  const total = TOTAL_ITEMS;
  const done = useMemo(
    () => Object.values(checked).filter(Boolean).length,
    [checked],
  );
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  function toggle(path: string) {
    setChecked((prev) => ({ ...prev, [path]: !prev[path] }));
  }

  function resetAll() {
    if (window.confirm('Reset every checkbox?')) setChecked({});
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
      <div
        style={{
          width: '100%',
          maxWidth: 920,
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}
      >
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
          <LedgerH1>
            Redesign <em>checklist.</em>
          </LedgerH1>
          <LedgerLede>
            Walk every page. Check it off when it looks right. State is saved
            in your browser; nothing leaves this machine.
          </LedgerLede>
        </header>

        {/* Progress bar */}
        <div>
          <div
            style={{
              height: 4,
              background: 'var(--rule)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
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
              marginTop: 10,
              fontFamily: 'var(--mono)',
              fontSize: 10.5,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              fontWeight: 600,
            }}
          >
            <span>Progress</span>
            <button
              type="button"
              onClick={resetAll}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                letterSpacing: 'inherit',
                textTransform: 'inherit',
                fontWeight: 'inherit',
                color: 'var(--weak)',
              }}
            >
              Reset all
            </button>
          </div>
        </div>

        {/* Filter toggle */}
        <div className="ledger-toggle" role="tablist" aria-label="Filter items">
          {(['all', 'unchecked', 'checked'] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'unchecked' ? 'Unchecked' : 'Checked'}
            </button>
          ))}
        </div>

        {/* Categories */}
        {CHECKLIST.map((cat) => {
          const visibleItems = cat.items.filter((item) => {
            if (filter === 'all') return true;
            const isChecked = !!checked[item.path];
            return filter === 'checked' ? isChecked : !isChecked;
          });
          if (visibleItems.length === 0) return null;

          const catDone = cat.items.filter((i) => checked[i.path]).length;
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
                    color: catDone === catTotal && catTotal > 0 ? 'var(--terra)' : 'var(--muted)',
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
                  const isChecked = !!checked[item.path];
                  const itemId = `cb-${item.path.replace(/[^a-z0-9]/gi, '-')}`;
                  return (
                    <li
                      key={item.path}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr auto',
                        gap: 14,
                        alignItems: 'baseline',
                        padding: '14px 18px',
                        borderTop: '1px solid var(--rule)',
                        background: isChecked ? 'var(--bg)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                    >
                      <input
                        id={itemId}
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(item.path)}
                        style={{
                          width: 16,
                          height: 16,
                          accentColor: 'var(--terra)',
                          cursor: 'pointer',
                          marginTop: 4,
                        }}
                      />
                      <label
                        htmlFor={itemId}
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                        }}
                      >
                        <a
                          href={item.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            fontFamily: 'var(--mono)',
                            fontSize: 13,
                            color: isChecked ? 'var(--muted)' : 'var(--ink)',
                            textDecoration: isChecked ? 'line-through' : 'none',
                            borderBottom: isChecked ? 'none' : '1px solid transparent',
                            transition: 'color 0.15s, border-color 0.15s',
                            letterSpacing: '0.01em',
                            fontWeight: 500,
                          }}
                          onMouseEnter={(e) => {
                            if (!isChecked) (e.currentTarget.style.color = 'var(--terra)');
                            (e.currentTarget.style.borderColor = 'var(--terra)');
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = isChecked
                              ? 'var(--muted)'
                              : 'var(--ink)';
                            e.currentTarget.style.borderColor = 'transparent';
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
                      </label>
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
                        }}
                      >
                        {isChecked ? '✓ done' : '·'}
                      </span>
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
          <ul style={{ margin: 0, paddingLeft: 20, fontFamily: 'var(--serif)', fontSize: 15.5, lineHeight: 1.55, color: 'var(--ink-2)' }}>
            {VISUAL_CHECKLIST.map((rule) => (
              <li key={rule} style={{ marginBottom: 6 }}>
                {rule}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </LedgerSurface>
  );
}
