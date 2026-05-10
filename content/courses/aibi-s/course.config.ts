// AiBI-S course configuration — consumed by the course harness.
// Content (unit-1-1.ts, persona-dept-head-phase-1.ts) lives in ./ops/;
// this file is purely the sidebar/header/navigation structure.

import type { CourseConfig } from '@/lib/course-harness/types';

export const aibiSConfig: CourseConfig = {
  slug: 'aibi-s',
  brand: {
    name: 'Banking AI Specialist',
    shortCode: 'AiBI-S',
    wordmark: 'AiBI-S',
    accentColorVar: 'var(--color-cobalt)',
  },
  terminology: {
    itemLabel: 'Unit',
    sectionLabel: 'Phase',
  },
  sections: [
    {
      id: 'foundation',
      label: 'Phase I — Foundation',
      items: [
        { id: 'u-1.1', number: '1.1', title: 'From Personal Skills to Institutional Assets', href: '/courses/aibi-s/ops/unit/1.1', estimatedMinutes: 45 },
        { id: 'u-1.2', number: '1.2', title: 'Work Decomposition for Banking Workflows',     href: '/courses/aibi-s/ops/unit/1.2', estimatedMinutes: 45 },
      ],
    },
    {
      id: 'first-build',
      label: 'Phase II — First Build',
      items: [
        { id: 'u-2.1', number: '2.1', title: 'Build Your First Departmental Automation',      href: '/courses/aibi-s/ops/unit/2.1', estimatedMinutes: 60 },
        { id: 'u-2.2', number: '2.2', title: 'Measure and Evaluate',                           href: '/courses/aibi-s/ops/unit/2.2', estimatedMinutes: 45 },
      ],
    },
    {
      id: 'scale',
      label: 'Phase III — Scale',
      items: [
        { id: 'u-3.1', number: '3.1', title: 'Build Your Departmental Skill Library',          href: '/courses/aibi-s/ops/unit/3.1', estimatedMinutes: 60 },
        { id: 'u-3.2', number: '3.2', title: 'Capstone and Certification',                     href: '/courses/aibi-s/ops/unit/3.2', estimatedMinutes: 60 },
      ],
    },
  ],
  crossCourseNav: [
    { label: 'AiBI-P', href: '/courses/foundation/program' },
    { label: 'AiBI-L', href: '/courses/aibi-l' },
  ],
  aiFeatures: {
    personaDefense: {
      provider: 'anthropic',
      model: 'claude-opus-4-6',
      maxTokens: 400,
      maxTurns: 3,
      rateLimit: { perLearnerDaily: 50 },
    },
    defenseGrader: {
      provider: 'anthropic',
      model: 'claude-opus-4-6',
      maxTokens: 1000,
      rateLimit: { perLearnerDaily: 20 },
    },
  },
  aiBudget: {
    perCourseDailyCents: 2000,  // $20/day across all AiBI-S learners
  },
};
