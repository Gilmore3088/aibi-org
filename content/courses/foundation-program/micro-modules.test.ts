import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FOUNDATION_MICRO_MODULES } from './micro-modules';

describe('Foundation micro-module ladder', () => {
  it('keeps all 18 module outputs distinct', () => {
    const outputs = FOUNDATION_MICRO_MODULES.map((module) => module.keyOutput);
    expect(new Set(outputs).size).toBe(outputs.length);
  });

  it('keeps every module inside the advertised per-module minutes band', () => {
    // The public duration label derives its per-module range from these
    // values; a module outside 10–15 minutes silently breaks the promise.
    for (const module of FOUNDATION_MICRO_MODULES) {
      expect(
        module.estimatedMinutes,
        `module ${module.number} estimatedMinutes`,
      ).toBeGreaterThanOrEqual(10);
      expect(
        module.estimatedMinutes,
        `module ${module.number} estimatedMinutes`,
      ).toBeLessThanOrEqual(15);
    }
  });

  it('separates prompt, template, skill, workflow kit, and packet concepts', () => {
    const byNumber = new Map(FOUNDATION_MICRO_MODULES.map((module) => [module.number, module]));

    // M4 applies the CORE method (from M3) to the learner's own recurring task.
    expect(byNumber.get(4)?.plainLanguageConcept).toContain('your own role');
    expect(byNumber.get(9)?.plainLanguageConcept).toContain('named reusable asset');
    expect(byNumber.get(13)?.plainLanguageConcept).toContain('not just a prompt');
    expect(byNumber.get(17)?.plainLanguageConcept).toContain('workflow kit');
    expect(byNumber.get(18)?.plainLanguageConcept).toContain('packet proves');
  });

  it('requires every module to create a practical day-job transfer move', () => {
    for (const module of FOUNDATION_MICRO_MODULES) {
      expect(module.transferMove, `module ${module.number} transfer move`).toMatch(
        /\b(use|run|take|paste|save|map|add|attach|ask)\b/i,
      );
      expect(module.transferMove.length, `module ${module.number} transfer move length`).toBeLessThanOrEqual(120);
    }
  });

  it('keeps the evidence module manager-readable for frontline learners', () => {
    const module16 = FOUNDATION_MICRO_MODULES.find((module) => module.number === 16);

    expect(module16?.mission).toContain('manager');
    expect(module16?.plainLanguageConcept).toContain('short receipt');
    expect(module16?.qualitySignals).toContain('Manager-ready');
    expect(module16?.transferMove).toContain('show a manager');
  });

  it('keeps every build dated and inside its review window', () => {
    // Build steps name real tools, and tools change. A build past its
    // reviewBy date fails CI until someone re-checks it against the tools.
    const today = new Date().toISOString().slice(0, 10);
    const builds = FOUNDATION_MICRO_MODULES.filter((module) => module.build);
    // Every module ends with a working tool.
    expect(builds.length).toBe(FOUNDATION_MICRO_MODULES.length);
    for (const mod of builds) {
      const build = mod.build!;
      expect(build.verifiedOn, `module ${mod.number} verifiedOn`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(build.reviewBy, `module ${mod.number} reviewBy`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(build.reviewBy > today, `module ${mod.number} build review is overdue (${build.reviewBy})`).toBe(true);
      expect(build.prompt.length, `module ${mod.number} prompt`).toBeGreaterThan(80);
      expect(build.doneWhen, `module ${mod.number} doneWhen`).toMatch(/\S/);
      // Shown as three short steps: keep every learner-facing line short.
      expect(build.highlights.length, `module ${mod.number} highlights`).toBeLessThanOrEqual(4);
      expect(build.tests.length, `module ${mod.number} tests`).toBeGreaterThanOrEqual(1);
      expect(build.toolPaths.map((p) => p.tool)).toEqual(['ChatGPT', 'Claude', 'Gemini', 'Copilot']);
      for (const line of [build.youWillHave, build.beforeYouStart, build.check, build.doneWhen]) {
        expect(line.split(/\s+/).length, `module ${mod.number}: "${line}"`).toBeLessThanOrEqual(22);
      }
    }
  });

  it('keeps the simulated role audit tied to the 18-module source', () => {
    const script = readFileSync(
      resolve(process.cwd(), 'scripts/foundation-course-simulated-role-audit.mjs'),
      'utf8',
    );

    expect(script).toContain('micro-modules.ts');
    expect(script).toContain('courseModuleCount');
    expect(script).not.toMatch(/current 12-module|all 12 artifacts|length:\s*12/);
  });
});
