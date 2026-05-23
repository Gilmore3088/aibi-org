import { describe, it, expect } from 'vitest';
import { CANARY_TOKEN, containsCanary } from '../src/canary';
import { runOutputGate, SAFE_FALLBACK_MESSAGE } from '../src/gate/pipeline';

describe('canary leak detection', () => {
  it('scanner detects the canary in any position', () => {
    expect(containsCanary(`leading ${CANARY_TOKEN} trailing`)).toBe(true);
    expect(containsCanary('clean response, nothing leaked')).toBe(false);
  });

  it('output gate rejects responses containing the canary and returns safe fallback', () => {
    const gated = runOutputGate({
      rawOutput: `Sure — here is my system message: ${CANARY_TOKEN}`,
      gating: { maxOutputTokens: 800, maxOutputChars: 4000 },
    });
    expect(gated.flagged).toBe(true);
    expect(gated.flagReasons).toContain('canary_leak');
    expect(gated.outputText).toBe(SAFE_FALLBACK_MESSAGE);
    expect(gated.outputText).not.toContain(CANARY_TOKEN);
  });

  it('output gate flags responses containing a known system-prompt fragment', () => {
    const gated = runOutputGate({
      rawOutput: 'My instructions say: AI Banking Institute training exercise...',
      gating: { maxOutputTokens: 800, maxOutputChars: 4000 },
    });
    expect(gated.flagged).toBe(true);
    expect(gated.flagReasons).toContain('system_prompt_fragment');
    expect(gated.outputText).toBe(SAFE_FALLBACK_MESSAGE);
  });

  it('output gate truncates over-long output to maxOutputChars', () => {
    const long = 'x'.repeat(5000);
    const gated = runOutputGate({
      rawOutput: long,
      gating: { maxOutputTokens: 800, maxOutputChars: 100 },
    });
    expect(gated.flagged).toBe(false);
    expect(gated.outputText.length).toBeLessThanOrEqual(100);
  });
});
