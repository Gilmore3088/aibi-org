'use client';

// Sticky sub-task progress strip — local to the /[module] page.
//
// Mirrors the focused phase workspace. Each pill selects the relevant module
// phase and updates the hash so older section links keep working.

import { useEffect, useState } from 'react';

export interface SubTaskItem {
  readonly id: string;          // matches anchor id on its section
  readonly label: string;        // visible label, e.g. "Takeaway"
  readonly minutes: number | null;
  readonly status: 'done' | 'current' | 'pending';
  readonly verb?: string;
  readonly detail?: string;
  readonly mobileLabel?: string;
}

interface Props {
  readonly items: readonly SubTaskItem[];
}

const GLYPH: Record<SubTaskItem['status'], string> = {
  done: '▣',
  current: '◐',
  pending: '▢',
};

const STEP_COPY: Record<string, { readonly verb: string; readonly detail: string }> = {
  Understand: {
    verb: 'Understand',
    detail: 'Preview the artifact and model.',
  },
  Try: {
    verb: 'Try',
    detail: 'Run sample banking data.',
  },
  Build: {
    verb: 'Build',
    detail: 'Save inspected work.',
  },
  Save: {
    verb: 'Save',
    detail: 'Carry the asset forward.',
  },
};

function mobileLabel(label: string): string {
  return label;
}

function stepCopy(item: SubTaskItem): { readonly verb: string; readonly detail: string } {
  const fallback = STEP_COPY[item.label] ?? { verb: item.label, detail: 'Complete this step.' };
  return {
    verb: item.verb ?? fallback.verb,
    detail: item.detail ?? fallback.detail,
  };
}

export function SubTaskProgressStrip({ items }: Props) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const activeItem = items.find((item) => item.id === activeId) ?? items[0] ?? null;
  const activeCopy = activeItem ? stepCopy(activeItem) : null;

  // Track which section is in view to highlight the active pill.
  useEffect(() => {
    const ids = items.map((i) => i.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      {
        rootMargin: '-180px 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    function syncActivePhase(event: Event) {
      const detail = (event as CustomEvent<{ id?: string }>).detail;
      if (detail?.id && items.some((item) => item.id === detail.id)) {
        setActiveId(detail.id);
      }
    }

    window.addEventListener('foundation-module-phase-active', syncActivePhase);
    return () => window.removeEventListener('foundation-module-phase-active', syncActivePhase);
  }, [items]);

  function handleClick(id: string, e: React.MouseEvent) {
    e.preventDefault();
    window.dispatchEvent(
      new CustomEvent('foundation-module-phase-select', {
        detail: { id, hash: `#${id}` },
      }),
    );
    if (window.location.hash !== `#${id}`) {
      window.history.replaceState(null, '', `#${id}`);
    }
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 160;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setActiveId(id);
  }

  return (
    <div
      className="foundation-subtask-strip"
      data-testid="foundation-subtask-strip"
      style={{
        position: 'sticky',
        top: 64,
        zIndex: 40,
        background: 'rgba(247, 243, 234, 0.96)',
        borderBlock: '1px solid var(--ink-a10, rgba(7,26,47,0.10))',
        margin: '0 -36px',
        padding: '12px 36px',
        backdropFilter: 'blur(16px)',
      }}
      aria-label="Module sub-tasks"
    >
      <div
        className="foundation-subtask-inner"
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(210px, 0.28fr) minmax(0, 1fr)',
          gap: 14,
          alignItems: 'center',
        }}
      >
        <div className="foundation-subtask-now">
          <p
            style={{
              margin: 0,
              color: 'var(--gold-deep)',
              fontSize: '0.625rem',
              fontWeight: 850,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Learning loop
          </p>
          <p
            style={{
              margin: '4px 0 0',
              color: 'var(--ink)',
              fontSize: '0.9375rem',
              lineHeight: 1.25,
              fontWeight: 850,
            }}
          >
            {activeCopy ? `${activeCopy.verb}: ${activeCopy.detail}` : 'Build, test, and save one artifact.'}
          </p>
        </div>

        <nav
          className="foundation-subtask-nav"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
            gap: 8,
            alignItems: 'stretch',
          }}
        >
          {items.map((item, idx) => {
            const isActive = item.id === activeId;
            const copy = stepCopy(item);
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleClick(item.id, e)}
                className="foundation-subtask-link"
                aria-label={`${item.label}${item.minutes !== null ? `, ${item.minutes} minutes` : ''}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '34px minmax(0, 1fr)',
                  gap: 10,
                  alignItems: 'center',
                  minHeight: 66,
                  padding: '10px 12px',
                  borderRadius: 16,
                  background: isActive ? 'var(--ink)' : 'white',
                  color: isActive ? '#fff' : 'var(--ink)',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--ink)' : 'var(--ink-a10, rgba(7,26,47,0.10))',
                  fontFamily:
                    'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
                  textDecoration: 'none',
                  transition: 'background-color 120ms ease, color 120ms ease, border-color 120ms ease',
                  minWidth: 0,
                }}
                aria-current={isActive ? 'step' : undefined}
              >
                <span
                  className="foundation-subtask-number"
                  aria-hidden="true"
                  style={{
                    display: 'grid',
                    width: 34,
                    height: 34,
                    placeItems: 'center',
                    borderRadius: 999,
                    background: isActive ? 'var(--gold)' : 'var(--cream)',
                    color: isActive ? 'var(--ink)' : 'var(--gold-deep)',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="foundation-subtask-copy" style={{ minWidth: 0 }}>
                  <span
                    className="foundation-subtask-verb"
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      lineHeight: 1.05,
                      fontWeight: 900,
                      letterSpacing: '0.13em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {copy.verb}
                  </span>
                  <span
                    className="foundation-subtask-label foundation-subtask-label--desktop"
                    style={{
                      display: 'block',
                      marginTop: 4,
                      color: isActive ? 'rgba(255,255,255,0.74)' : 'var(--slate-600)',
                      fontSize: '0.7813rem',
                      lineHeight: 1.25,
                      fontWeight: 700,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {copy.detail}
                  </span>
                  <span className="foundation-subtask-label foundation-subtask-label--mobile" aria-hidden="true">
                    {item.mobileLabel ?? mobileLabel(item.label)}
                  </span>
                  <span
                    className="foundation-subtask-status"
                    aria-hidden="true"
                    style={{
                      display: 'none',
                    }}
                  >
                    {GLYPH[item.status]}
                  </span>
                  {item.minutes !== null && (
                  <span
                    className="foundation-subtask-minutes"
                    style={{
                      display: 'block',
                      marginTop: 3,
                      fontSize: '0.8125rem',
                      lineHeight: 1.1,
                      fontWeight: 750,
                      color: isActive ? 'var(--gold-soft)' : 'var(--slate-500)',
                    }}
                  >
                    {item.minutes} min
                  </span>
                  )}
                </span>
              </a>
            );
          })}
        </nav>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (min-width: 901px) and (max-width: 1180px) {
              .foundation-subtask-inner {
                grid-template-columns: 1fr !important;
                gap: 10px !important;
              }
              .foundation-subtask-now {
                display: flex !important;
                align-items: baseline !important;
                justify-content: space-between !important;
                gap: 16px !important;
              }
              .foundation-subtask-now > p:last-child {
                margin-top: 0 !important;
                text-align: right !important;
              }
            }
            @media (max-width: 900px) {
              .foundation-subtask-strip {
                position: static !important;
                margin: 0 !important;
                padding: 4px 0 2px !important;
                background: transparent !important;
                border: none !important;
                backdrop-filter: none !important;
              }
              .foundation-subtask-inner {
                grid-template-columns: 1fr !important;
                gap: 8px !important;
              }
              .foundation-subtask-now {
                border: 1px solid var(--ink-a10, rgba(7,26,47,0.10)) !important;
                border-radius: 16px !important;
                background: white !important;
                padding: 11px 13px !important;
              }
              .foundation-subtask-nav {
                display: grid !important;
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                gap: 8px !important;
                align-items: stretch !important;
                overflow: visible !important;
                padding: 0 !important;
                border: none !important;
                border-radius: 0 !important;
                background: transparent !important;
                scrollbar-width: none !important;
              }
              .foundation-subtask-nav::-webkit-scrollbar {
                display: none !important;
              }
              .foundation-subtask-link {
                min-width: 0 !important;
                min-height: 76px !important;
                grid-template-columns: 1fr !important;
                align-content: start !important;
                padding: 10px 11px !important;
                border-radius: 14px !important;
                gap: 7px !important;
                text-align: left !important;
                border-color: var(--ink-a10, rgba(7,26,47,0.10)) !important;
                box-shadow: none !important;
              }
              .foundation-subtask-number {
                width: 26px !important;
                height: 26px !important;
                font-size: 10px !important;
              }
              .foundation-subtask-verb {
                font-size: 10.5px !important;
                letter-spacing: 0.1em !important;
              }
              .foundation-subtask-label {
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
              }
              .foundation-subtask-label--desktop {
                display: none !important;
              }
              .foundation-subtask-label--mobile {
                display: inline !important;
                margin-top: 3px !important;
                color: inherit !important;
                font-size: 12px !important;
                line-height: 1.1 !important;
                font-weight: 800 !important;
              }
              .foundation-subtask-minutes {
                display: none !important;
              }
            }
            @media (max-width: 390px) {
              .foundation-subtask-nav {
                gap: 6px !important;
              }
              .foundation-subtask-link {
                padding-inline: 10px !important;
              }
            }
            @media (min-width: 901px) {
              .foundation-subtask-label--mobile {
                display: none !important;
              }
            }
          `,
        }}
      />
    </div>
  );
}
