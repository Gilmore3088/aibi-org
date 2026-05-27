// Minimal valid CourseConfig.
//
// Two jobs:
//   1. Copy-paste starter for new courses. Strip the comments, change
//      the slug, brand, sections, and modules, and you have a working
//      course config.
//   2. Contract regression guard. If anyone changes CourseConfig in a
//      way that breaks this file's typing, CI surfaces it immediately.
//
// This file is imported by `example-course.test.ts` to assert that
// `resolveCourseView` accepts it. Keep it minimal — additions here
// imply they're now required of every course.

import type { CourseConfig } from '../types';

export const exampleCourseConfig: CourseConfig = {
  slug: 'example',
  dbProductKey: 'example',
  brand: {
    name: 'Example Course',
    shortCode: 'Example',
    wordmark: 'EXAMPLE',
    accentColorVar: 'var(--gold)',
  },
  terminology: {
    itemLabel: 'Module',
    sectionLabel: 'Section',
  },
  promise: 'A minimal CourseConfig that proves the harness contract.',
  audience: 'Maintainers and copy-paste-starter users.',
  sections: [
    { id: 'intro', label: 'Introduction' },
    { id: 'core', label: 'Core' },
  ],
  modules: [
    {
      id: 'm-01',
      number: 1,
      title: 'Welcome',
      href: '/courses/example/1',
      sectionId: 'intro',
      estimatedMinutes: 10,
      bodyTemplate: 'tabbed',
    },
    {
      id: 'm-02',
      number: 2,
      title: 'Core Concept',
      href: '/courses/example/2',
      sectionId: 'core',
      estimatedMinutes: 20,
      bodyTemplate: 'linear',
    },
    {
      id: 'm-03',
      number: 3,
      title: 'Capstone',
      href: '/courses/example/3',
      sectionId: 'core',
      estimatedMinutes: 30,
      bodyTemplate: 'custom',
      isComingSoon: true,
    },
  ],
};
