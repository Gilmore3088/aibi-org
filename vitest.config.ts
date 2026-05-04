import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: [
      'lib/**/*.test.ts',
      'lib/**/*.test.tsx',
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'content/**/*.test.ts',
    ],
    exclude: [
      // Pre-existing tests that import 'node:test' (Node's built-in runner,
      // not vitest). Were silently excluded by the prior `lib/**`-only include
      // pattern; preserve that exclusion here.
      '**/node_modules/**',
      'src/app/api/webhooks/stripe/route.test.ts',
    ],
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@content': path.resolve(__dirname, './content'),
    },
  },
});
