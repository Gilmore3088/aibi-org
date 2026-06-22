import { defineConfig, devices } from '@playwright/test';
import { loadEnvConfig } from '@next/env';

// Load .env.local before any test-config evaluation. Next.js does this
// automatically for the dev server; Playwright runs as a separate Node
// process so it would otherwise see only the inherited shell env. The
// seed helpers (e2e/helpers/seed.ts) need SUPABASE_SERVICE_ROLE_KEY +
// NEXT_PUBLIC_SUPABASE_URL — without this, every logged-in test fails
// with a seed-helper "env not set" error.
loadEnvConfig(process.cwd());

// Base URL precedence: explicit override → Vercel preview → localhost.
// CI sets PLAYWRIGHT_BASE_URL to the preview deployment URL; local dev
// uses the implicit fallback.
const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

// `webServer` only starts when running against localhost. Against a preview
// URL we assume the deployment is already up.
const useLocalServer =
  BASE_URL.startsWith('http://localhost') && process.env.PLAYWRIGHT_SKIP_WEB_SERVER !== 'true';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // The brand requires no-emoji UI. If a test ever fails because an
    // emoji landed in a deployed surface, that's a real bug — flag it.
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
  ],

  webServer: useLocalServer
    ? {
      // The e2e workflow (.github/workflows/e2e.yml) starts a production
      // server BEFORE the playwright step in CI, so we always reuse that
      // existing server. Local dev still auto-spins a dev server when
      // nothing is on the port. SKIP_ENROLLMENT_GATE is dev-only and lets
      // local E2E inspect the paid course UI without production auth state.
      command: 'SKIP_ENROLLMENT_GATE=true npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000,
      }
    : undefined,
});
