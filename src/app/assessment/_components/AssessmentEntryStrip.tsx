'use client';

// Audit A23 + A27 (2026-05-24): one strip at the top of the free
// assessment that addresses both Pair 3 (Lena) + Free-Assessment
// persona findings. A23 — five abbreviations the questions use, each
// with a plain-English gloss revealed on hover/focus via native
// <abbr>. A27 — an optional one-line role pick so the report can
// frame results in the language of the learner's role. Both are
// dismissible — the entry should not feel gated.

import { useEffect, useState } from 'react';
import { ROLES, ROLE_META, type Role } from '@content/assessments/v2/role';
import { loadAssessment, saveAssessment } from '../_lib/assessment-storage';

const GLOSSARY = [
  { term: 'SR 11-7', gloss: 'Federal Reserve / OCC guidance on Model Risk Management (2011).' },
  { term: 'TPRM',    gloss: 'Third-Party Risk Management — vendor due diligence framework.' },
  { term: 'ECOA / Reg B', gloss: 'Equal Credit Opportunity Act + Regulation B: anti-discrimination in credit.' },
  { term: 'MRM',     gloss: 'Model Risk Management — inventory, validation, and ongoing monitoring of any model in business decisions.' },
  { term: 'LMS',     gloss: 'Learning Management System — the platform tracking course completion and credentials.' },
];

const ROLE_KEY = 'aibi-assessment-role';

export function AssessmentEntryStrip() {
  const [role, setRole] = useState<Role | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [glossOpen, setGlossOpen] = useState(false);

  useEffect(() => {
    const saved = loadAssessment<string>(ROLE_KEY);
    if (saved === 'dismissed') {
      setDismissed(true);
    } else if (saved) {
      // Stored value is either a Role string or null; we parse defensively
      // by checking membership.
      if (ROLES.includes(saved as Role)) {
        setRole(saved as Role);
      }
    }
    setHydrated(true);
  }, []);

  function pickRole(r: Role | null) {
    setRole(r);
    saveAssessment(ROLE_KEY, r ?? '');
  }

  function dismiss() {
    setDismissed(true);
    saveAssessment(ROLE_KEY, 'dismissed');
  }

  if (!hydrated) return null;
  if (dismissed) return null;

  return (
    <aside
      aria-labelledby="entry-strip-label"
      className="mx-auto max-w-2xl px-6 pt-6"
    >
      <div className="border border-[color:var(--ledger-rule-strong)] bg-[color:var(--ledger-paper)] rounded-[3px] p-4 sm:p-5">
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h2
            id="entry-strip-label"
            className="font-mono uppercase tracking-[0.18em] text-[10px] text-[color:var(--ledger-accent)] font-semibold"
          >
            Before you start — two quick optional bits
          </h2>
          <button
            type="button"
            onClick={dismiss}
            className="font-mono uppercase tracking-[0.16em] text-[10px] text-[color:var(--ledger-muted)] hover:text-[color:var(--ledger-ink)]"
            aria-label="Dismiss the entry strip"
          >
            Skip
          </button>
        </div>

        {/* A27 — optional role pick */}
        <div className="mb-4">
          <p className="text-[13px] text-[color:var(--ledger-ink-2)] mb-2 leading-snug">
            What is your role? Tells us how to frame the report — you can change it later.
            {role ? (
              <>
                {' '}<span className="font-mono text-[12px] text-[color:var(--ledger-ink)]">{ROLE_META[role].label}</span> selected.
              </>
            ) : null}
          </p>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => pickRole(role === r ? null : r)}
                aria-pressed={role === r}
                className={
                  'font-mono uppercase tracking-[0.14em] text-[10px] px-2 py-1 rounded-[2px] border transition-colors ' +
                  (role === r
                    ? 'bg-[color:var(--ledger-ink)] text-[color:var(--ledger-paper)] border-[color:var(--ledger-ink)]'
                    : 'bg-[color:var(--ledger-bg)] text-[color:var(--ledger-ink)] border-[color:var(--ledger-rule-strong)] hover:border-[color:var(--ledger-ink)]')
                }
              >
                {ROLE_META[r].label}
              </button>
            ))}
          </div>
        </div>

        {/* A23 — glossary strip */}
        <div className="pt-3 border-t border-[color:var(--ledger-rule)]">
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <p className="font-mono uppercase tracking-[0.18em] text-[9.5px] text-[color:var(--ledger-muted)] font-semibold">
              Acronyms you may see — hover or focus any term
            </p>
            <button
              type="button"
              onClick={() => setGlossOpen((v) => !v)}
              aria-expanded={glossOpen}
              aria-controls="entry-glossary-expanded"
              className="font-mono uppercase tracking-[0.16em] text-[9.5px] text-[color:var(--ledger-accent)] hover:text-[color:var(--ledger-ink)]"
            >
              {glossOpen ? 'Hide list' : 'Show list'}
            </button>
          </div>
          <p className="text-[12.5px] text-[color:var(--ledger-ink-2)] leading-relaxed">
            {GLOSSARY.map((g, i) => (
              <span key={g.term}>
                {/* A23 rework (Wave D critique): <abbr> alone is not
                    focusable, so keyboard / touch users could not reach
                    the gloss. tabIndex={0} puts it in the tab order;
                    aria-label provides the same gloss to screen readers
                    on focus (title alone is unreliable in SR contexts). */}
                <abbr
                  title={g.gloss}
                  aria-label={`${g.term} — ${g.gloss}`}
                  tabIndex={0}
                  className="font-mono uppercase tracking-[0.04em] no-underline border-b border-dotted border-[color:var(--ledger-accent)] cursor-help text-[color:var(--ledger-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ledger-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ledger-paper)] rounded-[1px]"
                >
                  {g.term}
                </abbr>
                {i < GLOSSARY.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </p>
          {/* Touch-user / no-hover fallback — explicit definitions list
              keyed by id, reachable via the Show list expander above. */}
          {glossOpen ? (
            <dl
              id="entry-glossary-expanded"
              className="mt-3 grid gap-1.5 text-[12.5px]"
            >
              {GLOSSARY.map((g) => (
                <div key={g.term} className="grid grid-cols-[110px_1fr] gap-2 items-baseline">
                  <dt className="font-mono uppercase tracking-[0.08em] text-[color:var(--ledger-ink)]">
                    {g.term}
                  </dt>
                  <dd className="text-[color:var(--ledger-ink-2)] leading-snug m-0">
                    {g.gloss}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
