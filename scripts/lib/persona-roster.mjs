// Shared persona-roster parsing + intent mapping.
//
// Extracted from scripts/persona-sweep-100.mjs so the read-only pre-login
// sweep and the new authenticated post-login sweep walk the SAME 100-persona
// roster (docs/persona-audit-2026-06-23/01-persona-roster.md) and never drift.
//
// Pure, dependency-free: parsing + deterministic helpers only. Browser/auth
// concerns (SKIP lists, cookie injection) stay in the individual sweep scripts.

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export const DEFAULT_ROSTER_MD = resolve(
  process.cwd(),
  'docs/persona-audit-2026-06-23/01-persona-roster.md',
);

// mulberry32 seeded PRNG — reproducible per persona, varies by index.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Parse the roster markdown table into structured rows.
// Columns: | # | Archetype | FI type & size | Role | Personality | Source | Goal | Journey | Completion |
export async function loadRoster(rosterPath = DEFAULT_ROSTER_MD) {
  const md = await readFile(rosterPath, 'utf8');
  const rows = [];
  for (const line of md.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.split('|').map((c) => c.trim());
    if (!/^\d+$/.test(cells[1] || '')) continue; // skip header + separator
    rows.push({
      n: Number(cells[1]),
      archetype: cells[2],
      fiType: cells[3],
      role: cells[4],
      personality: cells[5],
      source: cells[6],
      goal: cells[7],
      journey: cells[8],
      completion: cells[9],
    });
  }
  return rows;
}

// Where each persona's journey implies they start (pre-login surface).
export function startFor(journey) {
  const j = (journey || '').toLowerCase();
  const first = j.split('→')[0].trim();
  if (/re-?login/.test(j)) return '/courses/foundation/program/purchase';
  if (/re-?enter|resume/.test(j)) return '/assessment';
  if (first.includes('roi')) return '/';
  if (first.includes('home') || first.includes('lands home')) return '/';
  if (first.includes('free')) return '/assessment';
  if (first.includes('resources')) return '/resources';
  if (first.includes('security')) return '/security';
  if (first.includes('foundation')) return '/courses/foundation/program/purchase';
  if (first.includes('verify')) return '/certifications';
  if (first.includes('team')) return '/assessment/team';
  if (first.includes('pricing')) return '/';
  if (first.includes('$99')) return '/assessment/in-depth';
  if (first.includes('$295')) return '/courses/foundation/program/purchase';
  return '/';
}

// Intent keywords used to bias the seeded random walk toward links a persona
// with this goal/role/journey would plausibly click.
export function keywordsFor(goal, role, journey) {
  const s = `${goal} ${role} ${journey}`.toLowerCase();
  const kw = new Set();
  const add = (...xs) => xs.forEach((x) => kw.add(x));
  if (/ready/.test(s)) add('assessment', 'readiness', 'report', 'score');
  if (/cert|certif/.test(s)) add('certificate', 'foundation', 'course', 'module');
  if (/template|artifact|exam|policy/.test(s)) add('template', 'resource', 'download', 'policy', 'guide');
  if (/roi|compar|pricing|cost/.test(s)) add('roi', 'pricing', 'foundation', 'cost');
  if (/team|cohort|whole team|pilot|upskill team/.test(s)) add('team', 'institution', 'cohort', 'seats');
  if (/refund|money back/.test(s)) add('refund', 'support', 'help');
  if (/verify/.test(s)) add('verify', 'certificate', 'credential');
  if (/playground|practice|sandbox|\btry\b|tool/.test(s)) add('playground', 'practice', 'tool', 'sandbox');
  if (/data handling|\bvet\b|security/.test(s)) add('security', 'data', 'privacy', 'guide');
  if (/brows/.test(s)) add('resource', 'about', 'education');
  if (/compliance|bsa|aml|audit|risk|examiner|counsel|cco/.test(s)) add('compliance', 'risk', 'governance');
  if (/lend|credit/.test(s)) add('lending', 'credit');
  if (/hr|l&d|training/.test(s)) add('education', 'course', 'foundation', 'cohort');
  if (/ceo|cfo|coo|president|board|cro|cio|ciso|cmo|chro|strateg/.test(s)) add('about', 'roi', 'institutions');
  if (kw.size === 0) add('assessment', 'education', 'resource');
  return [...kw];
}

// Desktop vs mobile, inferred from personality / journey cues.
export function deviceFor(personality, journey) {
  const s = `${personality} ${journey}`.toLowerCase();
  return /mobile|\(mobile\)|on (the )?phone/.test(s) ? 'mobile' : 'desktop';
}

// Stable persona id: P001-curious-ceo
export function personaId(n, archetype) {
  return `P${String(n).padStart(3, '0')}-${archetype
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`;
}

// Build the full persona descriptor list the sweeps iterate over.
export function buildPersonas(roster, { stepsMin = 6, stepsMax = 9 } = {}) {
  return roster.map((r, i) => ({
    id: personaId(r.n, r.archetype),
    n: r.n,
    archetype: r.archetype,
    role: r.role,
    fiType: r.fiType,
    personality: r.personality,
    source: r.source,
    goal: r.goal,
    journey: r.journey,
    completion: r.completion,
    start: startFor(r.journey),
    keywords: keywordsFor(r.goal, r.role, r.journey),
    device: deviceFor(r.personality, r.journey),
    steps: stepsMin + (i % (stepsMax - stepsMin + 1)),
    seed: 100000 + i * 101,
  }));
}
