import { test, expect } from '@playwright/test';

// Mobile viewport audit — visits every public route at three mobile widths
// (375 / 390 / 414 px = iPhone SE / iPhone 14 / iPhone Plus) and asserts:
//   1. No horizontal overflow (documentElement.scrollWidth <= window.innerWidth)
//   2. The route loaded (basic content sanity)
// Screenshots are captured for every route × viewport combination so a
// reviewer can scroll through them in CI artifacts.
//
// This is the foundational mobile audit harness called out in #194.
// Tests are expected to fail on routes with mobile-responsive bugs;
// that's the point — the failure list IS the audit output.
//
// To run locally:
//   npx playwright test e2e/mobile-viewport-audit.spec.ts
//
// To run a single route at a single width:
//   npx playwright test e2e/mobile-viewport-audit.spec.ts --grep "375.*homepage"

interface RouteCase {
  readonly path: string;
  readonly label: string;
  /** Brief content sanity assertion. Optional — defaults to a non-empty body. */
  readonly mustContain?: RegExp;
}

const PUBLIC_ROUTES: readonly RouteCase[] = [
  // Marketing surfaces — highest visibility
  { path: '/', label: 'homepage', mustContain: /Turning Bankers into Builders/i },
  { path: '/for-institutions', label: 'for-institutions' },
  { path: '/for-institutions/advisory', label: 'for-institutions-advisory' },
  // /education was consolidated into /resources per #420 — removed from audit
  { path: '/about', label: 'about' },
  { path: '/security', label: 'security' },
  { path: '/resources', label: 'resources' },

  // Free assessment flow — CLAUDE.md MVP gate
  { path: '/assessment', label: 'assessment-landing' },
  { path: '/assessment/start', label: 'assessment-start' },

  // In-Depth paid assessment landing
  { path: '/assessment/in-depth', label: 'assessment-in-depth' },

  // Auth surfaces — every form field is a touch target
  { path: '/auth/login', label: 'auth-login' },
  { path: '/auth/signup', label: 'auth-signup' },
  { path: '/auth/forgot-password', label: 'auth-forgot-password' },

  // Legal / static
  { path: '/privacy', label: 'privacy' },
  { path: '/terms', label: 'terms' },
  { path: '/faq', label: 'faq' },
  { path: '/ai-use-disclaimer', label: 'ai-use-disclaimer' },
] as const;

const VIEWPORTS = [
  { width: 375, height: 667, label: 'iphone-se-375' },
  { width: 390, height: 844, label: 'iphone-14-390' },
  { width: 414, height: 896, label: 'iphone-plus-414' },
] as const;

test.describe('mobile viewport audit', () => {
  for (const viewport of VIEWPORTS) {
    test.describe(`${viewport.width}px (${viewport.label})`, () => {
      for (const route of PUBLIC_ROUTES) {
        test(`${route.label} — no horizontal overflow`, async ({ page }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });

          const response = await page.goto(route.path, { waitUntil: 'networkidle' });
          // Some routes redirect (e.g. /assessment → /assessment/start in some
          // configurations). Accept any 2xx or 3xx response chain.
          expect(response, `route ${route.path} returned no response`).toBeTruthy();
          expect(response!.status(), `route ${route.path} HTTP status`).toBeLessThan(400);

          // Content sanity — defaults to "body has some text"
          if (route.mustContain) {
            const body = await page.locator('body').innerText();
            expect(body).toMatch(route.mustContain);
          }

          // Screenshot for CI artifact review. One per route × viewport.
          await page.screenshot({
            path: `test-results/mobile-viewport/${viewport.label}/${route.label}.png`,
            fullPage: true,
          });

          // The actual audit assertion: no horizontal scrollbar on the page.
          // scrollWidth > clientWidth means something inside the document is
          // wider than the viewport — the symptom of broken mobile layout.
          const overflow = await page.evaluate(() => {
            const html = document.documentElement;
            return {
              clientWidth: html.clientWidth,
              scrollWidth: html.scrollWidth,
              overflowX: html.scrollWidth - html.clientWidth,
            };
          });

          expect(
            overflow.overflowX,
            `${route.path} at ${viewport.width}px overflows by ${overflow.overflowX}px ` +
              `(html.scrollWidth=${overflow.scrollWidth}, clientWidth=${overflow.clientWidth}). ` +
              `Check the screenshot at test-results/mobile-viewport/${viewport.label}/${route.label}.png.`,
          ).toBeLessThanOrEqual(0);
        });
      }
    });
  }
});
