import { describe, it, expect } from 'vitest';
import { findItem, findSectionOf } from './lookup';
import type { ResolvedCourseView } from './types';

const VIEW: ResolvedCourseView = {
  config: {
    slug: 'test',
    brand: { name: 'Test', shortCode: 'T', wordmark: 'Test', accentColorVar: 'var(--color-terra)' },
    terminology: { itemLabel: 'Unit', sectionLabel: 'Phase' },
    sections: [],
  },
  sections: [
    {
      id: 'phase-1',
      label: 'Phase 1',
      items: [
        { id: 'u-1.1', number: '1.1', title: 'Intro', href: '/test/1.1', status: 'completed' },
        { id: 'u-1.2', number: '1.2', title: 'Deep Dive', href: '/test/1.2', status: 'current' },
      ],
    },
    {
      id: 'phase-2',
      label: 'Phase 2',
      items: [
        { id: 'u-2.1', number: '2.1', title: 'Advanced', href: '/test/2.1', status: 'locked' },
      ],
    },
  ],
  currentItem: null,
  completedCount: 1,
  totalItemCount: 3,
};

describe('findItem', () => {
  it('returns the item when it exists in a section', () => {
    const result = findItem(VIEW, 'u-1.2');
    expect(result).not.toBeNull();
    expect(result?.title).toBe('Deep Dive');
  });

  it('returns null when item id does not exist', () => {
    expect(findItem(VIEW, 'u-9.9')).toBeNull();
  });

  it('finds items in later sections', () => {
    const result = findItem(VIEW, 'u-2.1');
    expect(result?.id).toBe('u-2.1');
  });
});

describe('findSectionOf', () => {
  it('returns the containing section for a known item', () => {
    const result = findSectionOf(VIEW, 'u-2.1');
    expect(result?.id).toBe('phase-2');
  });

  it('returns null when item id does not exist', () => {
    expect(findSectionOf(VIEW, 'u-9.9')).toBeNull();
  });
});
