// Contract test for the example CourseConfig.
//
// If you broke this, you almost certainly changed CourseConfig in a way
// that requires updating example-course.config.ts (and probably the
// README's copy-paste snippet too). Update the example to match the
// new contract; do not relax the test.

import { describe, it, expect } from 'vitest';
import { resolveCourseView, findModule, canAccessModule } from '../progress';
import { exampleCourseConfig } from './example-course.config';

describe('example CourseConfig (contract test)', () => {
  it('compiles and resolves with null progress (anonymous learner)', () => {
    const view = resolveCourseView(exampleCourseConfig, null);

    expect(view.config.slug).toBe('example');
    expect(view.modules).toHaveLength(3);
    expect(view.sections).toHaveLength(2);
    expect(view.currentModule).toBeNull();
    expect(view.completedCount).toBe(0);

    // Two modules count toward total; the third is coming-soon
    expect(view.totalModuleCount).toBe(2);
  });

  it('resolves a typical mid-progress state', () => {
    const view = resolveCourseView(exampleCourseConfig, {
      completedModuleIds: ['m-01'],
      currentModuleId: 'm-02',
    });

    expect(view.modules[0].status).toBe('completed');
    expect(view.modules[1].status).toBe('current');
    expect(view.modules[2].status).toBe('coming-soon');
    expect(view.currentModule?.id).toBe('m-02');
  });

  it('groups modules into their declared sections', () => {
    const view = resolveCourseView(exampleCourseConfig, null);
    expect(view.sections[0].id).toBe('intro');
    expect(view.sections[0].modules.map((m) => m.id)).toEqual(['m-01']);
    expect(view.sections[1].modules.map((m) => m.id)).toEqual(['m-02', 'm-03']);
  });

  it('supports lookup by id and by stringified number', () => {
    const view = resolveCourseView(exampleCourseConfig, null);
    expect(findModule(view, 'm-02')?.title).toBe('Core Concept');
    expect(findModule(view, '3')?.title).toBe('Capstone');
  });

  it('gates access correctly', () => {
    const view = resolveCourseView(exampleCourseConfig, {
      completedModuleIds: ['m-01'],
      currentModuleId: 'm-02',
    });
    expect(canAccessModule(view, 'm-01')).toBe(true);   // completed
    expect(canAccessModule(view, 'm-02')).toBe(true);   // current
    expect(canAccessModule(view, 'm-03')).toBe(false);  // coming-soon
  });

  it('declares all three body templates in use across the example', () => {
    // Catches accidental removal of a template option from the type union.
    const templates = exampleCourseConfig.modules.map((m) => m.bodyTemplate);
    expect(templates).toContain('tabbed');
    expect(templates).toContain('linear');
    expect(templates).toContain('custom');
  });
});
