import { describe, expect, it } from 'vitest';
import { DIMENSION_LABELS } from '@content/assessments/v4/types';
import { listGuides, loadGuide } from './registry';

describe('guides registry', () => {
  it('discovers MDX guides from the filesystem', async () => {
    const guides = await listGuides();
    expect(guides.length).toBeGreaterThan(0);
  });

  it('loads a guide by slug with a renderable body', async () => {
    const [first] = await listGuides();
    const mod = await loadGuide(first.slug);
    expect(mod?.meta.slug).toBe(first.slug);
    expect(typeof mod?.default).toBe('function');
  });

  it('returns null for unknown or malformed slugs', async () => {
    expect(await loadGuide('definitely-not-a-guide')).toBeNull();
    expect(await loadGuide('../briefings/_lib/registry')).toBeNull();
  });

  it('every guide meets the SEO and conversion contract', async () => {
    const guides = await listGuides();
    const slugs = new Set(guides.map((g) => g.slug));
    for (const g of guides) {
      // Slug and dimension
      expect(g.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(Object.keys(DIMENSION_LABELS)).toContain(g.dimension);
      // Search snippet lengths
      expect(g.seoTitle.length, `${g.slug} seoTitle`).toBeLessThanOrEqual(65);
      expect(g.description.length, `${g.slug} description`).toBeGreaterThanOrEqual(70);
      expect(g.description.length, `${g.slug} description`).toBeLessThanOrEqual(170);
      expect(g.query.length).toBeGreaterThan(0);
      // Freshness + reading time
      expect(g.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(g.readMinutes).toBeGreaterThan(0);
      // FAQ powers FAQPage JSON-LD
      expect(g.faqs.length, `${g.slug} faqs`).toBeGreaterThanOrEqual(3);
      for (const f of g.faqs) {
        expect(f.q.endsWith('?'), `${g.slug}: "${f.q}"`).toBe(true);
        expect(f.a.length).toBeGreaterThan(40);
      }
      // Internal linking resolves and never self-links
      expect(g.related.length, `${g.slug} related`).toBeGreaterThanOrEqual(2);
      for (const r of g.related) {
        expect(slugs.has(r), `${g.slug} → missing related "${r}"`).toBe(true);
        expect(r).not.toBe(g.slug);
      }
      // Primary sources
      expect(g.sources.length, `${g.slug} sources`).toBeGreaterThan(0);
    }
  });

  it('targets a distinct query per guide (no cannibalization)', async () => {
    const guides = await listGuides();
    const queries = guides.map((g) => g.query.toLowerCase());
    expect(new Set(queries).size).toBe(queries.length);
  });
});
