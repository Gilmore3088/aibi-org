import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CORE_PART_LIST, CORE_PARTS, OLDER_LABEL_NOTE } from './core';

// Guard: the site teaches one prompt framework, CORE. This scans every
// surface a visitor or learner can reach and fails on another framework's
// name or part list. See docs/prompt-framework-consistency-plan.md.

const ROOT = join(__dirname, '..', '..');
const SCAN = ['src', 'content', 'public/downloads/source', 'docs/mailerlite-emails'];
const SKIP = [
  /node_modules/,
  /\.test\.tsx?$/,
  // Time-fixed teaching samples: never edited (CLAUDE.md). The module pages
  // that use them show OLDER_LABEL_NOTE instead.
  /^content\/sandbox-data\//,
  /^content\/frameworks\/core\.ts$/,
];
const RULES: readonly [string, RegExp][] = [
  ['RTFC', /\bRTFC\b/],
  ['Banker Prompt Formula', /Banker Prompt Formula/i],
  // A list that runs role -> task -> another framework term is a competing
  // part list. "Role/task:" as a field label on its own is not.
  ['role/task part list', /\brole\b[^.\n]{0,15}\btask\b[^.\n]{0,40}\b(format|constraints?|context|source|inputs|audience)\b/i],
];

// Files still being migrated. Each plan step removes its entries; the list
// must be empty when the work is done (step 7).
const PENDING = new Set<string>([
  'content/assessments/v2/starter-artifacts.ts',
  'content/courses/foundation-program/micro-modules.ts',
  'content/courses/foundation-program/module-3-activities.ts',
  'content/courses/foundation-program/prompt-library.ts',
  'content/courses/foundation-program/skill-pedagogy-reference.md',
  'content/curriculum/skills.ts',
  'content/exams/foundation-program/questions.ts',
  'content/practice-reps/foundation-program.ts',
  'public/downloads/source/banker-prompt-formula-card.html',
  'public/downloads/source/safe-ai-use-checklist.html',
  'src/app/certifications/exam/foundation/_components/ExamRunner.tsx',
  'src/app/courses/foundation/program/_lib/strategyDrillData.ts',
  'src/app/courses/foundation/program/quick-wins/_components/WinsForm.tsx',
  'src/app/prompt-cards/PromptCardsExperience.tsx',
  'src/app/resources/the-skill-not-the-prompt/page.tsx',
  'src/components/home/HomeSections.tsx',
  'src/content/prompt-cards/cards.ts',
  'src/lib/pdf/transformation-report.ts',
  'src/lib/resources/freeResources.manifest.json',
]);

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return files(full);
    return /\.(tsx?|mdx?|json|html)$/.test(name) ? [full] : [];
  });
}

function violations(): Map<string, string[]> {
  const found = new Map<string, string[]>();
  for (const dir of SCAN) {
    let list: string[];
    try {
      list = files(join(ROOT, dir));
    } catch {
      continue;
    }
    for (const full of list) {
      const rel = relative(ROOT, full).split('\\').join('/');
      if (SKIP.some((re) => re.test(rel))) continue;
      const lines = readFileSync(full, 'utf8').split('\n');
      const hits = lines.flatMap((line, i) =>
        RULES.filter(([, re]) => re.test(line)).map(([name]) => `${name} (line ${i + 1})`),
      );
      if (hits.length) found.set(rel, hits);
    }
  }
  return found;
}

describe('CORE is the only prompt framework', () => {
  it('defines four parts in a fixed order', () => {
    expect(CORE_PARTS.map((p) => p.key)).toEqual(['context', 'objective', 'resources', 'expectations']);
    expect(CORE_PART_LIST).toBe('Context, Objective, Resources, Expectations');
  });

  it('maps every older label onto a CORE part', () => {
    const absorbed = CORE_PARTS.flatMap((p) => p.absorbs).join(' ');
    for (const older of ['Role', 'Task', 'Source', 'Format', 'Constraints', 'Review']) {
      expect(absorbed).toContain(older);
    }
    expect(OLDER_LABEL_NOTE).toMatch(/Role as Context, Task as Objective/);
  });

  const found = violations();

  it('names no other framework outside the files still being migrated', () => {
    const unexpected = [...found].filter(([file]) => !PENDING.has(file)).map(([file, hits]) => `${file}: ${hits.join(', ')}`);
    expect(unexpected).toEqual([]);
  });

  it('keeps the pending list honest (remove a file once it is clean)', () => {
    const clean = [...PENDING].filter((file) => !found.has(file));
    expect(clean).toEqual([]);
  });
});
