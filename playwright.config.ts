import { defineConfig, devices } from '@playwright/test';

// Base URL precedence: explicit override → Vercel preview → localhost.
// CI sets PLAYWRIGHT_BASE_URL to the preview deployment URL; local dev
// uses the implicit fallback.
const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

// `webServer` only starts when running against localhost. Against a preview
// URL we assume the deployment is already up.
const useLocalServer = BASE_URL.startsWith('http://localhost');

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
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined,
});
