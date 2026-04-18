// Sandbox config map for all AiBI-P modules
// Used by [module]/page.tsx to conditionally render AIPracticeSandbox

import type { SandboxConfig } from '@/lib/sandbox/types';
import { module1SandboxConfig } from './module-1/config';
import { module2SandboxConfig } from './module-2/config';
import { module3SandboxConfig } from './module-3/config';
import { module4SandboxConfig } from './module-4/config';
import { module5SandboxConfig } from './module-5/config';
import { module6SandboxConfig } from './module-6/config';
import { module7SandboxConfig } from './module-7/config';
import { module8SandboxConfig } from './module-8/config';
import { module9SandboxConfig } from './module-9/config';

export const SANDBOX_CONFIGS: Partial<Record<number, SandboxConfig>> = {
  1: module1SandboxConfig,
  2: module2SandboxConfig,
  3: module3SandboxConfig,
  4: module4SandboxConfig,
  5: module5SandboxConfig,
  6: module6SandboxConfig,
  7: module7SandboxConfig,
  8: module8SandboxConfig,
  9: module9SandboxConfig,
};
