// Sandbox config map for all AiBI-Foundation modules
// Used by [module]/page.tsx to conditionally render AIPracticeSandbox

import type { SandboxConfig } from '@/lib/sandbox/types';
import { module1SandboxConfig } from './module-1/config';
import { module2SandboxConfig } from './module-2/config';
import { module3SandboxConfig } from './module-3/config';
import { module4SandboxConfig } from './module-4/config';
import { module6SandboxConfig } from './module-6/config';
import { module8SandboxConfig } from './module-8/config';
import { module9SandboxConfig } from './module-9/config';
import { module10SandboxConfig } from './module-10/config';
import { module11SandboxConfig } from './module-11/config';
import { module18SandboxConfig } from './module-18/config';

function withSourceModule(config: SandboxConfig, sourceModuleNumber: number): SandboxConfig {
  return {
    ...config,
    sampleData: config.sampleData.map((data) => ({
      ...data,
      sourceModuleNumber,
    })),
  };
}

// Each module's practice lab loads the sample data of the source module named
// here. Assignments are by topical fit, not module order:
//  - M3 (CORE prompt) uses the module-3 CORE prompt-card scenarios.
//  - M7 (Review AI Output) uses the module-2 AI claim-review packet — a set of
//    AI claims to mark verified / unsupported / wrong, which is exactly M7's task.
//  - M13 (Build a Reusable Skill) intentionally has NO lab here: no existing
//    sandbox teaches skill assembly, so it falls back to the generic lab brief
//    rather than borrowing module-7's off-topic tool-choice data. A bespoke
//    module-13 skill sandbox is a follow-up content task.
export const SANDBOX_CONFIGS: Partial<Record<number, SandboxConfig>> = {
  2: withSourceModule(module1SandboxConfig, 1),
  3: withSourceModule(module3SandboxConfig, 3),
  4: withSourceModule(module3SandboxConfig, 3),
  5: withSourceModule(module4SandboxConfig, 4),
  7: withSourceModule(module2SandboxConfig, 2),
  8: withSourceModule(module6SandboxConfig, 6),
  9: withSourceModule(module11SandboxConfig, 11),
  11: withSourceModule(module10SandboxConfig, 10),
  12: withSourceModule(module9SandboxConfig, 9),
  14: withSourceModule(module8SandboxConfig, 8),
  // M15 (Set the Human Review Gate) previously had no lab — an empty Try phase.
  // Reuse the safe-use scenarios so learners practice classifying where AI work
  // must pause for human review on real cases.
  15: withSourceModule(module9SandboxConfig, 9),
  18: withSourceModule(module18SandboxConfig, 18),
};
