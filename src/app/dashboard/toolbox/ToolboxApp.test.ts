import { describe, expect, it } from 'vitest';
import { tabsForTier } from './ToolboxApp';

describe('Toolbox tab access', () => {
  it('gives In-Depth paid access the same build/run surfaces as Foundation access', () => {
    const starterTabs = tabsForTier('starter').map((tab) => tab.id);
    const fullTabs = tabsForTier('full').map((tab) => tab.id);

    expect(starterTabs).toEqual(['guide', 'library', 'build', 'playground', 'toolbox']);
    expect(starterTabs).toEqual(fullTabs);
  });
});
