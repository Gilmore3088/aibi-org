// Legacy named export kept for compatibility. The canonical course now comes
// from the 18-module micro-module source in modules.ts.

import type { Module } from './types';
import { getModuleByNumber } from './modules';

const canonicalModule12 = getModuleByNumber(12);

if (!canonicalModule12) {
  throw new Error('AiBI-Foundation module 12 is missing from the canonical module map.');
}

export const module12: Module = canonicalModule12;
