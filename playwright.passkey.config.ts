// One-off Playwright config for the passkey E2E test — uses an
// externally-managed dev server (so the test runner doesn't try to
// start its own on port 3000 when ports are squatted). Run with:
//   PLAYWRIGHT_BASE_URL=http://localhost:3002 \
//     npx playwright test --config=playwright.passkey.config.ts

import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'passkey-flow.spec.ts',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // No webServer block — dev server is started outside the test.
});
