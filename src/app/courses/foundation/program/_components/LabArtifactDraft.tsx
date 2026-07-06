'use client';

import { useEffect, useState } from 'react';

interface LabDraftPayload {
  readonly moduleId: string;
  readonly moduleNumber: number;
  readonly model: string;
  readonly dataset: string;
  readonly savedAt: string;
  readonly reviewChecklist?: readonly string[];
  readonly content: string;
}

interface LabArtifactDraftProps {
  readonly moduleId: string;
  readonly artifactLabel: string;
  readonly feedbackCue?: string;
}

const editLensOptions = [
  {
    id: 'keep',
    label: 'Keep',
    body: 'Name the part that is useful enough to carry forward.',
  },
  {
    id: 'change',
    label: 'Change',
    body: 'Name what needs your words, structure, or banking context.',
  },
  {
    id: 'verify',
    label: 'Verify',
    body: 'Name the fact, source, or boundary to check before reuse.',
  },
] as const;

type EditLensId = (typeof editLensOptions)[number]['id'];

function isLabDraftPayload(value: unknown): value is LabDraftPayload {
  if (typeof value !== 'object' || value === null) return false;
  const draft = value as Record<string, unknown>;
  return (
    typeof draft.moduleId === 'string' &&
    typeof draft.moduleNumber === 'number' &&
    typeof draft.model === 'string' &&
    typeof draft.dataset === 'string' &&
    typeof draft.savedAt === 'string' &&
    (draft.reviewChecklist === undefined ||
      (Array.isArray(draft.reviewChecklist) &&
        draft.reviewChecklist.every((item) => typeof item === 'string'))) &&
    typeof draft.content === 'string'
  );
}

export function LabArtifactDraft({ moduleId, artifactLabel, feedbackCue }: LabArtifactDraftProps) {
  const [draft, setDraft] = useState<LabDraftPayload | null>(null);
  const [copied, setCopied] = useState(false);
  const [checkedTransfer, setCheckedTransfer] = useState<string[]>([]);
  const [selectedLens, setSelectedLens] = useState<EditLensId>('change');
  const [editNote, setEditNote] = useState('');

  useEffect(() => {
    const key = `foundation-lab-draft-${moduleId}`;

    function readDraft() {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) {
          setDraft(null);
          return;
        }
        const parsed = JSON.parse(raw) as unknown;
        setDraft(isLabDraftPayload(parsed) ? parsed : null);
      } catch {
        setDraft(null);
      }
    }

    function handleUpdate(event: Event) {
      const custom = event as CustomEvent<unknown>;
      if (isLabDraftPayload(custom.detail) && custom.detail.moduleId === moduleId) {
        setDraft(custom.detail);
      } else {
        readDraft();
      }
    }

    readDraft();
    window.addEventListener('foundation-lab-draft-updated', handleUpdate);
    window.addEventListener('storage', readDraft);
    return () => {
      window.removeEventListener('foundation-lab-draft-updated', handleUpdate);
      window.removeEventListener('storage', readDraft);
    };
  }, [moduleId]);

  useEffect(() => {
    try {
      const savedLens = localStorage.getItem(`foundation-lab-edit-lens-${moduleId}`);
      const savedNote = localStorage.getItem(`foundation-lab-edit-note-${moduleId}`);
      if (savedLens && editLensOptions.some((option) => option.id === savedLens)) {
        setSelectedLens(savedLens as EditLensId);
      }
      setEditNote(savedNote ?? '');
    } catch {
      setSelectedLens('change');
      setEditNote('');
    }
  }, [moduleId]);

  if (!draft) return null;

  async function copyDraft() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const savedTime = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(draft.savedAt));
  const evidenceItems = [
    {
      label: 'Source',
      body: draft.dataset,
    },
    {
      label: 'AI work',
      body: `${draft.model} output saved ${savedTime}`,
    },
    {
      label: 'Review',
      body: draft.reviewChecklist?.length
        ? `${draft.reviewChecklist.length} checks confirmed`
        : feedbackCue ?? 'Add the judgment note before submitting.',
    },
  ] as const;
  const transferMoves = [
    {
      id: 'source',
      label: 'Keep source visible',
      body: `Use ${draft.dataset} as the source trail.`,
    },
    {
      id: 'edit',
      label: 'Edit into the artifact',
      body: `Shape the output into ${artifactLabel}.`,
    },
    {
      id: 'review',
      label: 'Add judgment',
      body: feedbackCue ?? 'Add the human review note before submitting.',
    },
  ] as const;

  function toggleTransfer(id: string) {
    setCheckedTransfer((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function chooseLens(id: EditLensId) {
    setSelectedLens(id);
    try {
      localStorage.setItem(`foundation-lab-edit-lens-${moduleId}`, id);
    } catch {
      // Local persistence is a convenience; the draft workflow still works.
    }
  }

  function updateEditNote(value: string) {
    setEditNote(value);
    try {
      localStorage.setItem(`foundation-lab-edit-note-${moduleId}`, value);
    } catch {
      // Local persistence is a convenience; the draft workflow still works.
    }
  }

  const activeLens = editLensOptions.find((option) => option.id === selectedLens) ?? editLensOptions[1];
  const editDecisionReady = editNote.trim().length >= 12;

  return (
    <aside
      aria-label="Saved lab draft"
      className="foundation-lab-draft"
      style={{
        marginBottom: 22,
        border: '1px solid var(--gold-a40)',
        background: '#fff',
        borderRadius: 18,
        overflow: 'hidden',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div
        className="foundation-lab-draft__header"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: 16,
          alignItems: 'start',
          padding: 20,
          background: 'var(--cream-2)',
          borderBottom: '1px solid var(--ink-a10)',
        }}
      >
        <div>
          <p
            style={{
              margin: '0 0 6px',
              color: 'var(--gold-deep)',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Lab evidence ready
          </p>
          <h3
            style={{
              margin: 0,
              color: 'var(--ink)',
              fontSize: '1.25rem',
              lineHeight: 1.2,
              fontWeight: 800,
              letterSpacing: '-0.01em',
            }}
          >
            Carry this into {artifactLabel}.
          </h3>
          <p style={{ margin: '8px 0 0', color: 'var(--slate-600)', fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 650 }}>
            Use the lab output as raw material. Your submitted artifact still needs source context, edits, and a human review note.
          </p>
        </div>
        <button
          type="button"
          onClick={copyDraft}
          className="foundation-lab-draft__copy"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '0 0 auto',
            border: '1px solid var(--ink-a10)',
            background: '#fff',
            color: 'var(--ink)',
            borderRadius: 12,
            padding: '10px 14px',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          {copied ? 'Copied' : 'Copy draft'}
        </button>
      </div>

      <div
        className="foundation-lab-draft__evidence"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 0,
        }}
      >
        {evidenceItems.map((item, index) => (
          <div
            key={item.label}
            className="foundation-lab-draft__evidence-item"
            style={{
              padding: '16px 18px',
              borderLeft: index === 0 ? 'none' : '1px solid var(--ink-a10)',
            }}
          >
            <p
              style={{
                margin: '0 0 7px',
                color: 'var(--gold-deep)',
                fontSize: '0.625rem',
                fontWeight: 850,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              {item.label}
            </p>
            <p style={{ margin: 0, color: 'var(--ink)', fontSize: '0.8125rem', lineHeight: 1.4, fontWeight: 750 }}>
              {item.body}
            </p>
          </div>
        ))}
      </div>

      <section
        className="foundation-lab-draft__edit-lens"
        aria-labelledby={`lab-draft-edit-lens-${moduleId}`}
        style={{
          display: 'grid',
          gap: 12,
          padding: '16px 18px',
          borderTop: '1px solid var(--ink-a10)',
          background: '#fff',
        }}
      >
        <div
          className="foundation-lab-draft__edit-head"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(220px, 0.34fr)',
            gap: 14,
            alignItems: 'end',
          }}
        >
          <div>
            <p
              style={{
                margin: '0 0 5px',
                color: 'var(--gold-deep)',
                fontSize: '0.625rem',
                fontWeight: 850,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              Human edit lens
            </p>
            <h4
              id={`lab-draft-edit-lens-${moduleId}`}
              style={{
                margin: 0,
                color: 'var(--ink)',
                fontSize: '1rem',
                lineHeight: 1.2,
                fontWeight: 850,
              }}
            >
              Decide what the AI output needs from you.
            </h4>
          </div>
          <p
            aria-live="polite"
            style={{
              margin: 0,
              color: 'var(--slate-600)',
              fontSize: '0.8125rem',
              lineHeight: 1.35,
              fontWeight: 700,
            }}
          >
            {activeLens.body}
          </p>
        </div>

        <div
          className="foundation-lab-draft__edit-options"
          role="group"
          aria-label="Choose the human edit lens"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${editLensOptions.length}, minmax(0, 1fr))`,
            gap: 8,
          }}
        >
          {editLensOptions.map((option) => {
            const selected = option.id === selectedLens;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => chooseLens(option.id)}
                style={{
                  minHeight: 44,
                  border: '1px solid',
                  borderColor: selected ? 'var(--ink)' : 'var(--ink-a10)',
                  borderRadius: 12,
                  background: selected ? 'var(--ink)' : 'var(--cream)',
                  color: selected ? '#fff' : 'var(--ink)',
                  padding: '0 12px',
                  cursor: 'pointer',
                  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 850,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <label style={{ display: 'block' }}>
          <span
            style={{
              display: 'block',
              marginBottom: 6,
              color: 'var(--slate-500)',
              fontSize: '0.625rem',
              fontWeight: 850,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            Edit decision
          </span>
          <textarea
            value={editNote}
            onChange={(event) => updateEditNote(event.target.value)}
            rows={2}
            placeholder="Example: I will keep the structure, rewrite the customer-facing language, and verify every date before saving."
            style={{
              width: '100%',
              resize: 'vertical',
              border: '1px solid var(--ink-a10)',
              borderRadius: 12,
              background: 'var(--cream)',
              padding: '11px 12px',
              color: 'var(--ink)',
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              fontSize: '0.875rem',
              lineHeight: 1.45,
              outlineColor: 'var(--gold-deep)',
            }}
          />
        </label>
      </section>

      <section
        className="foundation-lab-draft__transfer"
        aria-label="Move lab output into the submitted artifact"
        style={{
          display: 'grid',
          gap: 12,
          padding: '16px 18px',
          borderTop: '1px solid var(--ink-a10)',
          background: 'var(--cream)',
        }}
      >
        <div
          className="foundation-lab-draft__transfer-head"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <div>
            <p
              style={{
                margin: '0 0 5px',
                color: 'var(--gold-deep)',
                fontSize: '0.625rem',
                fontWeight: 850,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              Build checklist
            </p>
            <p style={{ margin: 0, color: 'var(--ink)', fontSize: '0.9375rem', lineHeight: 1.3, fontWeight: 820 }}>
              Convert the lab output into human-reviewed work.
            </p>
          </div>
          <span
            aria-live="polite"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 34,
              padding: '0 12px',
              borderRadius: 999,
              background: '#fff',
              border: '1px solid var(--ink-a10)',
              color: 'var(--ink)',
              fontSize: '0.6875rem',
              fontWeight: 850,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {editDecisionReady
              ? `${checkedTransfer.length}/${transferMoves.length} ready`
              : 'Edit decision first'}
          </span>
        </div>

        <div
          className="foundation-lab-draft__transfer-grid"
          role="group"
          aria-label="Artifact transfer checks"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${transferMoves.length}, minmax(0, 1fr))`,
            gap: 8,
          }}
        >
          {transferMoves.map((move) => {
            const selected = checkedTransfer.includes(move.id);
            return (
              <button
                key={move.id}
                type="button"
                onClick={() => toggleTransfer(move.id)}
                aria-pressed={selected}
                disabled={!editDecisionReady}
                style={{
                  minHeight: 78,
                  display: 'grid',
                  gridTemplateColumns: '24px minmax(0, 1fr)',
                  gap: 9,
                  alignItems: 'start',
                  textAlign: 'left',
                  border: '1px solid',
                  borderColor: selected ? 'var(--gold)' : 'var(--ink-a10)',
                  borderRadius: 12,
                  background: selected ? '#fff' : 'var(--cream-2)',
                  padding: '12px',
                  cursor: editDecisionReady ? 'pointer' : 'not-allowed',
                  opacity: editDecisionReady ? 1 : 0.55,
                  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 22,
                    height: 22,
                    borderRadius: 7,
                    border: '1px solid var(--gold)',
                    background: selected ? 'var(--gold)' : '#fff',
                    color: 'var(--ink)',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  {selected ? '✓' : ''}
                </span>
                <span style={{ display: 'grid', gap: 4, minWidth: 0 }}>
                  <span
                    style={{
                      color: 'var(--ink)',
                      fontSize: '0.8125rem',
                      lineHeight: 1.2,
                      fontWeight: 850,
                    }}
                  >
                    {move.label}
                  </span>
                  <span
                    style={{
                      color: 'var(--slate-600)',
                      fontSize: '0.75rem',
                      lineHeight: 1.3,
                      fontWeight: 650,
                    }}
                  >
                    {move.body}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {draft.reviewChecklist?.length ? (
        <div
          className="foundation-lab-draft__checks"
          aria-label="Confirmed lab review checks"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 10,
            padding: '14px 18px 18px',
            borderTop: '1px solid var(--ink-a10)',
            background: '#fff',
          }}
        >
          {draft.reviewChecklist.map((item) => (
            <div
              key={item}
              style={{
                display: 'grid',
                gridTemplateColumns: '22px minmax(0, 1fr)',
                gap: 9,
                alignItems: 'start',
                padding: '10px 12px',
                border: '1px solid var(--ink-a10)',
                borderRadius: 12,
                background: 'var(--cream)',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  background: 'var(--gold)',
                  color: 'var(--ink)',
                  fontSize: '0.6875rem',
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                ✓
              </span>
              <span style={{ color: 'var(--ink)', fontSize: '0.8125rem', lineHeight: 1.28, fontWeight: 750 }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <details className="foundation-lab-draft__preview">
        <summary
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '14px 18px',
            borderTop: '1px solid var(--ink-a10)',
            cursor: 'pointer',
            listStyle: 'none',
          }}
        >
          <span
            style={{
              color: 'var(--slate-500)',
              fontSize: '0.6875rem',
              fontWeight: 850,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            Optional preview
          </span>
          <span style={{ color: 'var(--ink)', fontSize: '0.8125rem', fontWeight: 850 }}>
            View draft output
          </span>
        </summary>
        <pre
          style={{
            margin: 0,
            maxHeight: 260,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            borderTop: '1px solid var(--ink-a10)',
            background: 'var(--cream)',
            padding: 16,
            color: 'var(--ink)',
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            fontSize: '0.875rem',
            lineHeight: 1.55,
          }}
        >
          {draft.content}
        </pre>
      </details>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .foundation-lab-draft__preview summary::-webkit-details-marker {
              display: none;
            }
            @media (max-width: 760px) {
              .foundation-lab-draft {
                border-radius: 16px !important;
                box-shadow: none !important;
              }
              .foundation-lab-draft__header {
                grid-template-columns: 1fr !important;
                padding: 16px !important;
              }
              .foundation-lab-draft__copy {
                width: 100% !important;
                justify-content: center !important;
              }
              .foundation-lab-draft__evidence {
                grid-template-columns: 1fr !important;
              }
              .foundation-lab-draft__checks {
                grid-template-columns: 1fr !important;
                padding: 12px !important;
                gap: 8px !important;
              }
              .foundation-lab-draft__edit-lens {
                padding: 12px !important;
              }
              .foundation-lab-draft__edit-head,
              .foundation-lab-draft__edit-options {
                grid-template-columns: 1fr !important;
              }
              .foundation-lab-draft__transfer {
                padding: 12px !important;
              }
              .foundation-lab-draft__transfer-head {
                grid-template-columns: 1fr !important;
                gap: 8px !important;
              }
              .foundation-lab-draft__transfer-grid {
                grid-template-columns: 1fr !important;
                gap: 8px !important;
              }
              .foundation-lab-draft__evidence-item {
                border-left: none !important;
                border-top: 1px solid var(--ink-a10) !important;
                padding: 14px 16px !important;
              }
              .foundation-lab-draft__evidence-item:first-child {
                border-top: none !important;
              }
              .foundation-lab-draft__preview summary {
                padding: 12px 16px !important;
              }
            }
          `,
        }}
      />
    </aside>
  );
}
