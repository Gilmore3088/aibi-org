import { describe, it, expect } from 'vitest';
import { brandMarkdownArtifact } from './brandArtifact';

describe('brandMarkdownArtifact', () => {
  it('prepends the AiBI masthead and appends the attribution footer', () => {
    const out = brandMarkdownArtifact('# My Artifact\n\nBody text.');
    expect(out.startsWith('> **The AI Banking Institute**')).toBe(true);
    expect(out).toContain('AIBankingInstitute.com');
    expect(out).toContain('Turning Bankers into Builders.');
    // The original body and its title are preserved.
    expect(out).toContain('# My Artifact');
    expect(out).toContain('Body text.');
  });
});
