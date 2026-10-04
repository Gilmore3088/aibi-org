import { describe, expect, it } from 'vitest';
import sitemap from './sitemap';

describe('sitemap', () => {
  it('includes the consolidated pricing page', async () => {
    expect((await sitemap()).some((entry) => entry.url.endsWith('/pricing'))).toBe(true);
  });

  it('includes the prompting foundation builder', async () => {
    expect(
      (await sitemap()).some((entry) => entry.url.endsWith('/resources/prompting-foundation')),
    ).toBe(true);
  });

  it('includes the briefings index', async () => {
    expect((await sitemap()).some((entry) => entry.url.endsWith('/briefings'))).toBe(true);
  });

  it('includes every published briefing with its publish date', async () => {
    const entries = await sitemap();
    const { listAllBriefings } = await import('@content/briefings/_lib/registry');
    const briefings = (await listAllBriefings()).filter((b) => b.href.startsWith('/briefings/'));
    expect(briefings.length).toBeGreaterThan(0);
    for (const b of briefings) {
      const entry = entries.find((e) => e.url.endsWith(b.href));
      expect(entry, `missing sitemap entry for ${b.href}`).toBeDefined();
      expect((entry!.lastModified as Date).toISOString().slice(0, 10)).toBe(b.date);
    }
  });

  it('does not duplicate legacy essay URLs', async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('does not stamp the build time on lastmod, so dates stay stable between deploys', async () => {
    const entries = await sitemap();
    const home = entries.find((e) => e.url.endsWith('.com/') || e.url.endsWith('.com'));
    expect(home).toBeDefined();
    const age = Date.now() - (home!.lastModified as Date).getTime();
    // A fixed review date is at least a few seconds old on any run; a build-time
    // stamp would be ~0. Guards against reverting to `new Date()`.
    expect(age).toBeGreaterThan(60_000);
  });
});
