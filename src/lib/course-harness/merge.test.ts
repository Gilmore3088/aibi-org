import { describe, it, expect } from 'vitest';
import { mergeProgress } from './merge';
import type { CourseConfig, CourseProgress } from './types';

const fixture: CourseConfig = {
  slug: 'test',
  brand: { name: 'Test', shortCode: 'T', wordmark: 'T', accentColorVar: 'var(--x)' },
  terminology: { itemLabel: 'Unit', sectionLabel: 'Phase' },
  sections: [
    {
      id: 's1',
      label: 'Phase 1',
      items: [
        { id: 'i-1.1', number: '1.1', title: 'A', href: '/a' },
        { id: 'i-1.2', number: '1.2', title: 'B', href: '/b', isComingSoon: true },
      ],
    },
    {
      id: 's2',
      label: 'Phase 2',
      items: [
        { id: 'i-2.1', number: '2.1', title: 'C', href: '/c' },
      ],
    },
  ],
};

describe('mergeProgress', () => {
  it('null progress locks every non-coming-soon item', () => {
    const view = mergeProgress(fixture, null);
    expect(view.sections[0].items[0].status).toBe('locked');
    expect(view.sections[0].items[1].status).toBe('coming-soon');
    expect(view.sections[1].items[0].status).toBe('locked');
    expect(view.currentItem).toBeNull();
    expect(view.completedCount).toBe(0);
    expect(view.totalItemCount).toBe(2); // excludes 1.2 (coming-soon)
  });

  it('completed items surface as completed', () => {
    const progress: CourseProgress = { completedItemIds: ['i-1.1'], currentItemId: 'i-2.1' };
    const view = mergeProgress(fixture, progress);
    expect(view.sections[0].items[0].status).toBe('completed');
    expect(view.sections[1].items[0].status).toBe('current');
    expect(view.currentItem?.id).toBe('i-2.1');
    expect(view.completedCount).toBe(1);
  });

  it('coming-soon overrides completed/current', () => {
    const progress: CourseProgress = { completedItemIds: ['i-1.2'], currentItemId: 'i-1.2' };
    const view = mergeProgress(fixture, progress);
    expect(view.sections[0].items[1].status).toBe('coming-soon');
  });

  it('totalItemCount excludes coming-soon items', () => {
    const view = mergeProgress(fixture, null);
    expect(view.totalItemCount).toBe(2);
  });

  it('locked items stay locked when not current or completed', () => {
    const progress: CourseProgress = { completedItemIds: [], currentItemId: 'i-1.1' };
    const view = mergeProgress(fixture, progress);
    expect(view.sections[0].items[0].status).toBe('current');
    expect(view.sections[1].items[0].status).toBe('locked');
  });
});
