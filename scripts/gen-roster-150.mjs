// Generate a 150-persona roster for the massive persona audit.
//
// Reads the canonical 100-persona roster (docs/persona-audit-2026-06-23/
// 01-persona-roster.md) verbatim and APPENDS 50 deterministic foundation-
// weighted personas (n=101..150) so the authenticated sweep lands >=50% of
// personas in foundation course states. Writes a NEW file — never overwrites
// the 100-roster.
//
// State targets for the 50 appended rows (verified against accountStateFor):
//   15 foundation-complete · 15 foundation-mid · 10 foundation-early ·
//   10 foundation-onboarding-pending.
// Combined with the existing 38 foundation personas that puts ~88/150 (~59%)
// in foundation states.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

const SRC = resolve(process.cwd(), 'docs/persona-audit-2026-06-23/01-persona-roster.md');
const OUT = resolve(process.cwd(), 'docs/persona-audit-2026-06-25/01-persona-roster-150.md');

// Roles chosen so primaryRoleFor() spreads across the full profile-role set
// (lending-credit, compliance-risk, retail-branch, other, marketing-product,
// it-infosec, operations, executive).
const ROLES = [
  'Chief Lending Officer',
  'BSA/AML Officer',
  'Retail Branch Manager',
  'CFO',
  'Marketing Director',
  'CIO',
  'Core Operations Lead',
  'CEO',
];

const FIS = [
  'Community bank <$250M',
  'CB $250M-$1B',
  'CB $1B-$10B',
  'CU small',
  'CU $1B-$5B',
  'De novo bank <$150M',
];

const SOURCES = ['Conference booth', 'Google', 'LinkedIn', 'Board fwd link', 'Peer referral', 'Email drip'];

// state -> { archetype, completion, goal, journey } building blocks.
// completion strings are crafted to hit the intended accountStateFor branch.
const STATES = [
  {
    key: 'complete',
    count: 15,
    archetype: 'Foundation Completer',
    completion: 'Buys $295 Foundation, completes all 18 modules, gets certified',
    goal: 'Get Foundation certified',
    journey: 'Home→Foundation→purchase→cert',
  },
  {
    key: 'mid',
    count: 15,
    archetype: 'Mid-Course Staller',
    completion: 'Enrolls in $295 Foundation, gets stuck mid-course',
    goal: 'Upskill on AI safely',
    journey: 'Home→Foundation→purchase→course',
  },
  {
    key: 'early',
    count: 10,
    archetype: 'Early Abandoner',
    completion: 'Buys $295 Foundation, abandons m3',
    goal: 'Upskill on AI safely',
    journey: 'Home→Foundation→purchase→course',
  },
  {
    key: 'onboarding',
    count: 10,
    archetype: 'Onboarding Idler',
    completion: 'Buys $295 Foundation but never starts; stalls at onboarding',
    goal: 'Upskill on AI safely',
    journey: 'Home→Foundation→purchase',
  },
];

function row(n, idx, st) {
  const role = ROLES[idx % ROLES.length];
  const fi = FIS[idx % FIS.length];
  const source = SOURCES[idx % SOURCES.length];
  const mobile = idx % 3 === 0; // ~1/3 on mobile
  const personality = mobile
    ? 'Practical, time-pressed (mobile)'
    : ['Skeptic, ROI-driven', 'Eager early-adopter', 'Box-checker', 'Curious, low tech'][idx % 4];
  const journey = mobile ? `${st.journey} (mobile)` : st.journey;
  const archetype = `${st.archetype} — ${role}`;
  return `| ${n} | ${archetype} | ${fi} | ${role} | ${personality} | ${source} | ${st.goal} | ${journey} | ${st.completion} |`;
}

async function main() {
  const base = (await readFile(SRC, 'utf8')).replace(/\s*$/, '');
  const rows = [];
  let n = 101;
  let idx = 0;
  for (const st of STATES) {
    for (let k = 0; k < st.count; k += 1) {
      rows.push(row(n, idx, st));
      n += 1;
      idx += 1;
    }
  }
  const out = `${base}\n${rows.join('\n')}\n`;
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, out);
  console.log(`wrote ${OUT} (+${rows.length} rows, last n=${n - 1})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
