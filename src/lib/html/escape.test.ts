import { describe, expect, it } from 'vitest';
import { escapeHtml } from './escape';

describe('escapeHtml', () => {
  it('escapes all five HTML-significant characters', () => {
    expect(escapeHtml(`<script>alert("x") & 'y'</script>`)).toBe(
      '&lt;script&gt;alert(&quot;x&quot;) &amp; &#39;y&#39;&lt;/script&gt;',
    );
  });
  it('escapes ampersand first (no double-escape)', () => {
    expect(escapeHtml('&lt;')).toBe('&amp;lt;');
  });
});
