import { describe, expect, it } from 'vitest';
import sitemap from './sitemap';

describe('sitemap', () => {
  it('includes the consolidated pricing page', () => {
    expect(sitemap().some((entry) => entry.url.endsWith('/pricing'))).toBe(true);
  });
});
