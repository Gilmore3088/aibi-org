// Sandbox config map for all AiBI-Foundation modules
// Used by [module]/page.tsx to conditionally render AIPracticeSandbox

import type { SandboxConfig } from '@/lib/sandbox/types';
import { module1SandboxConfig } from './module-1/config';
import { module2SandboxConfig } from './module-2/config';
import { module3SandboxConfig } from './module-3/config';
import { module4SandboxConfig } from './module-4/config';
import { module6SandboxConfig } from './module-6/config';
import { module7SandboxConfig } from './module-7/config';
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

export const SANDBOX_CONFIGS: Partial<Record<number, SandboxConfig>> = {
  2: withSourceModule(module1SandboxConfig, 1),
  3: withSourceModule(module2SandboxConfig, 2),
  4: withSourceModule(module3SandboxConfig, 3),
  5: withSourceModule(module4SandboxConfig, 4),
  8: withSourceModule(module6SandboxConfig, 6),
  9: withSourceModule(module11SandboxConfig, 11),
  11: withSourceModule(module10SandboxConfig, 10),
  12: withSourceModule(module9SandboxConfig, 9),
  13: withSourceModule(module7SandboxConfig, 7),
  14: withSourceModule(module8SandboxConfig, 8),
  18: withSourceModule(module18SandboxConfig, 18),
};
