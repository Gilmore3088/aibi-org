import { defineConfig, devices } from '@playwright/test';

// Magic-link dance e2e tests for the In-Depth Assessment.
// Seeds DB rows directly via service role; does not exercise Stripe
// checkout or Resend email delivery. Run locally before merging UI
// changes to /assessment/in-depth/take or /results/in-depth/[id].
//
// Usage: npm run test:e2e

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
