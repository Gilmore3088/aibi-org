import { describe, expect, it } from 'vitest';
import { listAllBriefings, loadBriefing } from './registry';
import { LEGACY_ESSAYS } from '@content/essays/_lib/registry';

describe('briefings registry', () => {
  it('discovers MDX briefings from the filesystem', async () => {
    const all = await listAllBriefings();
    const mdx = all.filter((b) => b.href.startsWith('/briefings/'));
    expect(mdx.length).toBeGreaterThan(0);
  });

  it('includes every legacy essay at its /resources URL', async () => {
    const all = await listAllBriefings();
    for (const legacy of LEGACY_ESSAYS) {
      expect(all.some((b) => b.href === legacy.legacyHref)).toBe(true);
    }
  });

  it('sorts newest-first by date', async () => {
    const all = await listAllBriefings();
    const dates = all.map((b) => b.date);
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
  });

  it('loads a briefing module by slug with matching meta', async () => {
    const all = await listAllBriefings();
    const first = all.find((b) => b.href.startsWith('/briefings/'))!;
    const mod = await loadBriefing(first.slug);
    expect(mod).not.toBeNull();
    expect(mod!.meta.slug).toBe(first.slug);
    expect(typeof mod!.default).toBe('function');
  });

  it('returns null for unknown slugs', async () => {
    expect(await loadBriefing('definitely-not-a-briefing')).toBeNull();
  });

  it('every briefing meta is complete and tiered', async () => {
    const all = await listAllBriefings();
    for (const b of all.filter((x) => x.href.startsWith('/briefings/'))) {
      expect(b.title.length).toBeGreaterThan(0);
      expect(b.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(b.readMinutes).toBeGreaterThan(0);
      expect(['pulse', 'deep-dive']).toContain(b.tier);
    }
  });
});
