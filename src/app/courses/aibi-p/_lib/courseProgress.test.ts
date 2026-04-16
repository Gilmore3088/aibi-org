// Unit tests for courseProgress.ts — runnable via: npx tsx src/app/courses/aibi-p/_lib/courseProgress.test.ts
// No test framework installed; uses a lightweight assert-and-throw pattern.

import { canAccessModule, getModuleStatus, getPillarStatus } from './courseProgress';
import type { Module, Pillar } from '@content/courses/aibi-p';

// ---------------------------------------------------------------------------
// Minimal test harness
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}`);
    failed++;
  }
}

function suite(name: string, fn: () => void): void {
  console.log(`\n${name}`);
  fn();
}

// ---------------------------------------------------------------------------
// Minimal module fixtures for getPillarStatus tests
// ---------------------------------------------------------------------------

function makeModule(number: number, pillar: Pillar): Module {
  return {
    id: `m${number}`,
    number,
    pillar,
    title: `Module ${number}`,
    estimatedMinutes: 30,
    keyOutput: 'output',
    sections: [],
    activities: [],
  };
}

const AWARENESS_MODULES: Module[] = [makeModule(1, 'awareness'), makeModule(2, 'awareness')];
const UNDERSTANDING_MODULES: Module[] = [makeModule(3, 'understanding'), makeModule(4, 'understanding')];
const ALL_MODULES: Module[] = [...AWARENESS_MODULES, ...UNDERSTANDING_MODULES];

// ---------------------------------------------------------------------------
// canAccessModule
// ---------------------------------------------------------------------------

suite('canAccessModule', () => {
  assert(canAccessModule(1, []) === true, 'module 1 always accessible when enrolled (empty completed)');
  assert(canAccessModule(1, [1, 2, 3]) === true, 'module 1 always accessible when other modules completed');
  assert(canAccessModule(2, []) === false, 'module 2 locked when module 1 not completed');
  assert(canAccessModule(2, [1]) === true, 'module 2 accessible when module 1 completed');
  assert(canAccessModule(3, [1, 2]) === true, 'module 3 accessible when modules 1 and 2 completed');
  assert(canAccessModule(3, [1]) === false, 'module 3 locked when module 2 missing');
  assert(canAccessModule(3, [2]) === false, 'module 3 locked when module 1 missing (even if 2 present)');
  assert(canAccessModule(5, [1, 2, 3, 4]) === true, 'module 5 accessible when all prior completed');
  assert(canAccessModule(5, [1, 2, 4]) === false, 'module 5 locked when module 3 missing (gap)');
  assert(canAccessModule(9, [1, 2, 3, 4, 5, 6, 7, 8]) === true, 'module 9 accessible when all prior completed');
  assert(canAccessModule(9, [1, 2, 3, 4, 5, 6, 7]) === false, 'module 9 locked when module 8 missing');
});

// ---------------------------------------------------------------------------
// getModuleStatus
// ---------------------------------------------------------------------------

suite('getModuleStatus', () => {
  assert(getModuleStatus(1, [1, 2], 3) === 'completed', 'module in completedModules → completed');
  assert(getModuleStatus(2, [1, 2], 3) === 'completed', 'module 2 in completedModules → completed');
  assert(getModuleStatus(3, [1, 2], 3) === 'current', 'current module → current');
  assert(getModuleStatus(5, [1, 2], 3) === 'locked', 'module beyond current → locked');
  assert(getModuleStatus(1, [], 1) === 'current', 'module 1 is current when nothing completed');
  assert(getModuleStatus(2, [], 1) === 'locked', 'module 2 locked when nothing completed');
  assert(getModuleStatus(9, [1, 2, 3, 4, 5, 6, 7, 8, 9], 9) === 'completed', 'module 9 completed when in array');
});

// ---------------------------------------------------------------------------
// getPillarStatus
// ---------------------------------------------------------------------------

suite('getPillarStatus', () => {
  // All awareness modules completed
  assert(
    getPillarStatus('awareness', ALL_MODULES, [1, 2]) === 'completed',
    'pillar completed when all its modules are in completedModules',
  );

  // One awareness module completed, one not
  assert(
    getPillarStatus('awareness', ALL_MODULES, [1]) === 'in-progress',
    'pillar in-progress when module 1 is accessible and some completed',
  );

  // No modules completed but module 1 (first of awareness) is accessible
  assert(
    getPillarStatus('awareness', ALL_MODULES, []) === 'in-progress',
    'awareness pillar in-progress when no modules completed (module 1 always accessible)',
  );

  // Understanding pillar: module 3 requires modules 1 and 2 completed
  assert(
    getPillarStatus('understanding', ALL_MODULES, []) === 'locked',
    'understanding pillar locked when no prior modules completed',
  );

  assert(
    getPillarStatus('understanding', ALL_MODULES, [1, 2]) === 'in-progress',
    'understanding pillar in-progress when module 3 is accessible',
  );

  assert(
    getPillarStatus('understanding', ALL_MODULES, [1, 2, 3, 4]) === 'completed',
    'understanding pillar completed when all its modules are done',
  );

  // Empty module list edge case
  assert(
    getPillarStatus('awareness', [], []) === 'locked',
    'pillar with no modules → locked',
  );
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
