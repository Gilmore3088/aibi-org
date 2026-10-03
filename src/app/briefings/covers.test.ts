import { describe, expect, it } from 'vitest';
import { LEGACY_ESSAYS } from '@content/essays/_lib/registry';
import { COVER_FIGURES } from './covers';

describe('briefing card covers', () => {
  it('only quote figures and captions that appear in the piece’s own dek', () => {
    for (const [slug, cover] of Object.entries(COVER_FIGURES)) {
      const essay = LEGACY_ESSAYS.find((e) => e.slug === slug);
      expect(essay, slug).toBeTruthy();
      const dek = (essay?.dek ?? '').toLowerCase();
      expect(dek, slug).toContain(cover.figure.toLowerCase());
      expect(dek, slug).toContain(cover.caption.toLowerCase());
    }
  });
});
