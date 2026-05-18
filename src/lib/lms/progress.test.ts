import { describe, it, expect } from 'vitest';
import type { CourseConfig } from './types';
import { resolveCourseView, findModule, canAccessModule } from './progress';

const sampleConfig: CourseConfig = {
  slug: 'sample',
  dbProductKey: 'sample',
  brand: {
    name: 'Sample Course',
    shortCode: 'Sample',
    wordmark: 'SAMPLE',
    accentColorVar: 'var(--ledger-accent)',
  },
  terminology: { itemLabel: 'Module', sectionLabel: 'Section' },
  promise: 'Test the harness contract.',
  audience: 'Tests',
  sections: [
    { id: 'a', label: 'Section A' },
    { id: 'b', label: 'Section B' },
  ],
  modules: [
    { id: 'm-1', number: 1, title: 'One',   href: '/x/1', sectionId: 'a', estimatedMinutes: 10, bodyTemplate: 'tabbed' },
    { id: 'm-2', number: 2, title: 'Two',   href: '/x/2', sectionId: 'a', estimatedMinutes: 15, bodyTemplate: 'tabbed' },
    { id: 'm-3', number: 3, title: 'Three', href: '/x/3', sectionId: 'b', estimatedMinutes: 20, bodyTemplate: 'linear' },
    { id: 'm-4', number: 4, title: 'Four',  href: '/x/4', sectionId: 'b', estimatedMinutes: 25, bodyTemplate: 'custom', isComingSoon: true },
  ],
};

describe('resolveCourseView', () => {
  it('locks everything when progress is null (anonymous)', () => {
    const view = resolveCourseView(sampleConfig, null);
    expect(view.modules.map((m) => m.status)).toEqual(['locked', 'locked', 'locked', 'coming-soon']);
    expect(view.currentModule).toBeNull();
    expect(view.completedCount).toBe(0);
    expect(view.totalModuleCount).toBe(3);
  });

  it('marks completed + current + locked correctly', () => {
    const view = resolveCourseView(sampleConfig, {
      completedModuleIds: ['m-1'],
      currentModuleId: 'm-2',
    });
    expect(view.modules[0].status).toBe('completed');
    expect(view.modules[1].status).toBe('current');
    expect(view.modules[2].status).toBe('locked');
    expect(view.modules[3].status).toBe('coming-soon');
    expect(view.currentModule?.id).toBe('m-2');
    expect(view.completedCount).toBe(1);
  });

  it('groups modules into sections, preserving order', () => {
    const view = resolveCourseView(sampleConfig, null);
    expect(view.sections).toHaveLength(2);
    expect(view.sections[0].modules.map((m) => m.id)).toEqual(['m-1', 'm-2']);
    expect(view.sections[1].modules.map((m) => m.id)).toEqual(['m-3', 'm-4']);
  });

  it('coming-soon survives even with progress', () => {
    const view = resolveCourseView(sampleConfig, {
      completedModuleIds: ['m-1', 'm-4'],   // even if claimed complete
      currentModuleId: 'm-2',
    });
    expect(view.modules[3].status).toBe('coming-soon');
  });
});

describe('findModule', () => {
  it('finds by id', () => {
    const view = resolveCourseView(sampleConfig, null);
    expect(findModule(view, 'm-2')?.title).toBe('Two');
  });
  it('finds by stringified number', () => {
    const view = resolveCourseView(sampleConfig, null);
    expect(findModule(view, '3')?.title).toBe('Three');
  });
  it('returns null for unknown', () => {
    const view = resolveCourseView(sampleConfig, null);
    expect(findModule(view, 'm-999')).toBeNull();
  });
});

describe('canAccessModule', () => {
  it('allows current and completed', () => {
    const view = resolveCourseView(sampleConfig, {
      completedModuleIds: ['m-1'],
      currentModuleId: 'm-2',
    });
    expect(canAccessModule(view, 'm-1')).toBe(true);
    expect(canAccessModule(view, 'm-2')).toBe(true);
  });
  it('denies locked', () => {
    const view = resolveCourseView(sampleConfig, {
      completedModuleIds: ['m-1'],
      currentModuleId: 'm-2',
    });
    expect(canAccessModule(view, 'm-3')).toBe(false);
  });
  it('denies coming-soon', () => {
    const view = resolveCourseView(sampleConfig, {
      completedModuleIds: ['m-1', 'm-4'],
      currentModuleId: 'm-2',
    });
    expect(canAccessModule(view, 'm-4')).toBe(false);
  });
});
