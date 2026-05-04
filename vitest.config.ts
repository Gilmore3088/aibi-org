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
    ],
    // Exclude tests using Node's built-in test runner (not vitest). These
    // were authored against `node --test` and need migration before they
    // can run here. Tracked as a separate cleanup concern.
    exclude: [
      '**/node_modules/**',
      '**/.next/**',
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
