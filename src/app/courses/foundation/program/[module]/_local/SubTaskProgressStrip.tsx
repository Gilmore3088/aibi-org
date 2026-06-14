'use client';

// Sticky sub-task progress strip — local to the /[module] page.
//
// Replaces the in-page tab nav with a continuous scroll-through. Each
// sub-task pill scrolls to its anchored section. The strip stays
// sticky under the global nav so the learner always knows which
// sub-task they are working on (audit §3, structural change).

import { useEffect, useState } from 'react';

export interface SubTaskItem {
  readonly id: string;          // matches anchor id on its section
  readonly label: string;        // visible label, e.g. "Takeaway"
  readonly minutes: number | null;
  readonly status: 'done' | 'current' | 'pending';
}

interface Props {
  readonly items: readonly SubTaskItem[];
}

const GLYPH: Record<SubTaskItem['status'], string> = {
  done: '▣',
  current: '◐',
  pending: '▢',
};

export function SubTaskProgressStrip({ items }: Props) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

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

  function handleClick(id: string, e: React.MouseEvent) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 160;
    window.scrollTo({ top, behavior: 'smooth' });
    setActiveId(id);
  }

  return (
    <div
      style={{
        position: 'sticky',
        top: 64,
        zIndex: 40,
        background: 'var(--cream)',
        borderBottom: '1px solid var(--ink-a10, rgba(7,26,47,0.10))',
        margin: '0 -36px',
        padding: '10px 36px',
      }}
      aria-label="Module sub-tasks"
    >
      <nav
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {items.map((item, idx) => {
          const isActive = item.id === activeId;
          return (
            <span key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleClick(item.id, e)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 999,
                  background: isActive ? 'var(--ink)' : 'white',
                  color: isActive ? 'var(--gold-soft)' : 'var(--ink)',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--ink)' : 'var(--ink-a10, rgba(7,26,47,0.10))',
                  fontFamily:
                    'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  textDecoration: 'none',
                  transition: 'background-color 120ms ease, color 120ms ease',
                  whiteSpace: 'nowrap',
                }}
                aria-current={isActive ? 'true' : undefined}
              >
                <span
                  aria-hidden="true"
                  style={{
                    fontSize: 14,
                    lineHeight: 1,
                    color:
                      item.status === 'done'
                        ? 'var(--emerald-700)'
                        : isActive
                          ? 'var(--gold)'
                          : 'var(--slate-500)',
                  }}
                >
                  {GLYPH[item.status]}
                </span>
                <span>{item.label}</span>
                {item.minutes !== null && (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: isActive ? 'var(--gold-soft)' : 'var(--slate-500)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    · {item.minutes} min
                  </span>
                )}
              </a>
              {idx < items.length - 1 && (
                <span
                  aria-hidden="true"
                  style={{
                    color: 'var(--slate-400)',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  →
                </span>
              )}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
