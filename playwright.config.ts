import { defineConfig, devices } from '@playwright/test';
import { loadEnvConfig } from '@next/env';

// Playwright forces colored output for its workers. Keeping NO_COLOR in the
// inherited desktop shell at the same time makes every worker emit a warning.
delete process.env.NO_COLOR;

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

const localServerAssignments = [
  process.env.E2E_COURSE_PREVIEW === 'true'
    ? 'SKIP_ENROLLMENT_GATE=true'
    : 'SKIP_ENROLLMENT_GATE=',
  process.env.E2E_ALLOW_EXTERNAL_SIDE_EFFECTS === 'true'
    ? ''
    : 'SKIP_RESEND=true SKIP_MAILERLITE=true RESEND_API_KEY= MAILERLITE_API_KEY= OPS_ALERT_EMAIL= OPS_ALERT_WEBHOOK_URL=',
  process.env.E2E_ALLOW_PRODUCTION_SUPABASE === 'true'
    ? ''
    : 'SKIP_SUPABASE_PROFILES=true SUPABASE_SERVICE_ROLE_KEY=',
  process.env.E2E_STRIPE_ROUNDTRIP === 'true'
    ? ''
    : 'STRIPE_SECRET_KEY= STRIPE_WEBHOOK_SECRET= STRIPE_WEBHOOK_SECRET_TEST=',
]
  .filter(Boolean)
  .join(' ');

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
      // Local test servers are isolated from configured production providers
      // unless an operator explicitly enables the corresponding opt-in. CI
      // starts its own production server before Playwright and reuses it.
      command: `${localServerAssignments} npm run dev`,
        url: 'http://localhost:3000',
        reuseExistingServer: Boolean(process.env.CI),
        timeout: 120_000,
      }
    : undefined,
});
