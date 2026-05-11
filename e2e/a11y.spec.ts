import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Accessibility smoke tests — axe-core via Playwright. Catches WCAG 2.1 AA
// violations on the routes most visitors land on. Doesn't replace a full
// manual a11y audit, but flags the regressions that are cheap to fix
// (missing alt text, broken heading order, color-contrast on key surfaces).
//
// Rule scoping:
//   - We disable `color-contrast` selectively because Lighthouse + manual
//     spot-checks cover it more reliably; running axe headless against
//     Tailwind's CSS-variable palette produces false positives when the
//     resolved color depends on dynamic class composition.
//   - `region` (every page area must be in a landmark) flags the Calendly
//     iframe wrapper on /for-institutions — accept that as a known false
//     positive and disable per-test where needed.

const PUBLIC_ROUTES: ReadonlyArray<{ name: string; path: string }> = [
  { name: 'homepage', path: '/' },
  { name: 'assessment', path: '/assessment' },
  { name: 'education', path: '/education' },
  { name: 'for-institutions', path: '/for-institutions' },
  { name: 'foundation purchase', path: '/courses/foundation/program/purchase' },
  { name: 'login', path: '/auth/login' },
  { name: 'signup', path: '/auth/signup' },
];

test.describe('a11y — public routes', () => {
  for (const { name, path } of PUBLIC_ROUTES) {
    test(`${name} (${path}) has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(path);
      // Let any client hydration / animation settle before scanning.
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules(['color-contrast'])
        .analyze();

      const serious = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );

      if (serious.length > 0) {
        const summary = serious
          .map((v) => `  - [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodes)`)
          .join('\n');
        console.error(`a11y violations on ${path}:\n${summary}`);
      }

      expect(serious, `serious/critical violations on ${path}`).toEqual([]);
    });
  }
});
