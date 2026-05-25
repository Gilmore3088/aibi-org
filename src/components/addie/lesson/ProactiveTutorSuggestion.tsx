'use client';

// ProactiveTutorSuggestion — pattern-detection scaffold for the tutor.
//
// Per the Transformation Vision: the tutor should evolve from "ask about
// this lesson" to "I noticed you saved three prompts about overdraft
// letters — want me to combine them into a Skill?" That is the moment
// the platform feels alive: it spots a pattern across the learner's
// saved artifacts and offers a next move.
//
// v1 detection: reads /api/addie/toolbox/items, runs three simple pattern
// detectors over the titles + types:
//   1. Three or more starter_prompt_pack / first_conversation items
//      sharing a banking keyword (overdraft, hold, complaint, vendor,
//      regulation) → "combine into a Skill" suggestion (links to M4.2).
//   2. Two or more skills saved + no prototypes → "frame a problem"
//      suggestion (links to M5.2).
//   3. PRD saved + no prototype URL after 24 hours → "ship the prototype"
//      suggestion (links to M5.4).
//
// Render: a single quiet card docked above the ToolboxAccumulation widget.
// Renders nothing when no pattern matches. Dismissed suggestions are
// remembered in localStorage so the same nudge doesn't fire repeatedly.

import { useCallback, useEffect, useState } from 'react';

interface ToolboxItem {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly created_at: string;
}

interface Suggestion {
  readonly id: string;          // stable key for dismissal memory
  readonly kicker: string;
  readonly body: string;
  readonly cta: string;
  readonly href: string;
}

const DISMISSED_KEY = 'aibi:tutor-suggestions-dismissed';

const BANKING_KEYWORDS: ReadonlyArray<{ key: string; re: RegExp }> = [
  { key: 'overdraft',    re: /\b(overdraft|nsf|insufficient)\b/i },
  { key: 'hold',         re: /\b(hold|funds availability|reg cc)\b/i },
  { key: 'complaint',    re: /\b(complaint|dispute|fee dispute)\b/i },
  { key: 'vendor',       re: /\b(vendor|tprm|due diligence)\b/i },
  { key: 'regulation',   re: /\b(reg e|reg dd|reg z|reg b|cfpb|fdic|sr 11-7|interagency)\b/i },
];

function detectKeywordCluster(items: ToolboxItem[]): Suggestion | null {
  const prompts = items.filter(
    (i) => i.type === 'starter_prompt_pack' || i.type === 'first_conversation',
  );
  if (prompts.length < 3) return null;
  for (const kw of BANKING_KEYWORDS) {
    const hits = prompts.filter((p) => kw.re.test(p.title));
    if (hits.length >= 3) {
      return {
        id: `cluster-${kw.key}`,
        kicker: 'Pattern detected',
        body: `You have ${hits.length} prompts about ${kw.key}. Combining them into a single Skill makes the workflow reusable in 30 seconds.`,
        cta: 'Build the Skill →',
        href: '/foundation/m4/m4.2',
      };
    }
  }
  return null;
}

function detectSkillsNoPrototype(items: ToolboxItem[]): Suggestion | null {
  const skills = items.filter((i) => i.type === 'skill');
  const prototypes = items.filter((i) => i.type === 'prototype');
  if (skills.length >= 2 && prototypes.length === 0) {
    return {
      id: 'skills-no-proto',
      kicker: 'Next move',
      body: `You have ${skills.length} working skills saved. Pick one real problem from your week, frame it, and ship a prototype on Friday.`,
      cta: 'Frame a problem →',
      href: '/foundation/m5/m5.2',
    };
  }
  return null;
}

function detectPrdNoPrototype(items: ToolboxItem[]): Suggestion | null {
  const prd = items.find((i) => i.type === 'prd');
  const prototypes = items.filter((i) => i.type === 'prototype');
  if (!prd || prototypes.length > 0) return null;
  const prdAge = Date.now() - new Date(prd.created_at).getTime();
  if (prdAge < 24 * 60 * 60 * 1000) return null;
  return {
    id: 'prd-no-proto',
    kicker: 'Pick this up',
    body: 'Your PRD has been waiting more than a day. The hardest part is opening the prototyping tool — paste the PRD and iterate for an hour.',
    cta: 'Ship the prototype →',
    href: '/foundation/m5/m5.4',
  };
}

function readDismissed(): Set<string> {
  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function writeDismissed(set: Set<string>): void {
  try {
    window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // localStorage may be unavailable (privacy mode, etc.) — silent skip.
  }
}

export function ProactiveTutorSuggestion() {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/addie/toolbox/items', { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as { items?: ToolboxItem[] };
      const items = data.items ?? [];
      if (items.length === 0) return;
      const dismissed = readDismissed();
      const detectors = [detectKeywordCluster, detectSkillsNoPrototype, detectPrdNoPrototype];
      for (const detector of detectors) {
        const s = detector(items);
        if (s && !dismissed.has(s.id)) {
          setSuggestion(s);
          return;
        }
      }
    } catch {
      // Silent — suggestion surface; never blocks.
    }
  }, []);

  useEffect(() => {
    void load();
    const onSaved = () => void load();
    window.addEventListener('aibi:artifact-saved', onSaved);
    return () => window.removeEventListener('aibi:artifact-saved', onSaved);
  }, [load]);

  const dismiss = useCallback(() => {
    if (!suggestion) return;
    const dismissed = readDismissed();
    dismissed.add(suggestion.id);
    writeDismissed(dismissed);
    setSuggestion(null);
  }, [suggestion]);

  if (!suggestion) return null;

  return (
    <aside
      className="my-6 rounded-[4px] border border-[var(--ledger-rule)] bg-[color-mix(in_srgb,var(--ledger-accent)_5%,var(--ledger-paper))] px-5 py-4 relative"
      aria-label="Tutor suggestion"
    >
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <div className="font-mono uppercase tracking-[0.18em] text-[0.6rem] text-[var(--ledger-accent)]">
          {suggestion.kicker}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="font-mono uppercase tracking-[0.14em] text-[0.55rem] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)]"
          aria-label="Dismiss this suggestion"
        >
          Dismiss
        </button>
      </div>
      <p className="font-serif text-[0.95rem] leading-snug text-[var(--ledger-ink)]">
        {suggestion.body}
      </p>
      <a
        href={suggestion.href}
        className="mt-3 inline-block font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-ink)] border-b border-[var(--ledger-accent)] pb-px hover:text-[var(--ledger-accent)]"
      >
        {suggestion.cta}
      </a>
    </aside>
  );
}
