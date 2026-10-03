import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SKILL_EXCERPT } from './HowItWorks';

// The Build panel shows a terminal reading a real skill file. These checks
// keep that excerpt honest: every line must still exist in the source file,
// and every file in the `ls` output must exist in the skill-templates folder.
const SKILLS_DIR = join(process.cwd(), 'public', 'artifacts', 'skill-templates');

describe('SKILL_EXCERPT', () => {
  const source = readFileSync(join(SKILLS_DIR, 'exception-report.md'), 'utf8');

  it('quotes exception-report.md verbatim', () => {
    for (const line of SKILL_EXCERPT) {
      if (line.kind === 'cmd' || (line.kind === 'out' && line.text.endsWith('.md'))) continue;
      expect(source, `missing: ${line.text}`).toContain(line.text);
    }
  });

  it('lists only skill files that exist', () => {
    const listed = SKILL_EXCERPT.filter((l) => l.kind === 'out' && l.text.trim().endsWith('.md'))
      .flatMap((l) => l.text.trim().split(/\s+/));
    expect(listed.length).toBeGreaterThan(0);
    for (const file of listed) {
      expect(existsSync(join(SKILLS_DIR, file)), `${file} should exist`).toBe(true);
    }
  });
});
