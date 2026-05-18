// LMS harness — public barrel. Import from '@/lib/lms' for the canonical
// course types and progress helpers. UI components live in
// '@/components/lms'; module body templates in '@/lib/lms/module-body'.

export type {
  CourseSlug,
  CourseBrand,
  CourseTerminology,
  ModuleBodyTemplate,
  CourseSection,
  CourseModule,
  AIFeatureDef,
  AIBudget,
  CrossCourseLink,
  CertificateRequirement,
  CourseConfig,
  CourseProgress,
  ModuleStatus,
  ResolvedCourseModule,
  ResolvedCourseSection,
  ResolvedCourseView,
  TabDef,
} from './types';

export {
  resolveCourseView,
  findModule,
  canAccessModule,
} from './progress';

export {
  progressFromLegacyNumbers,
  getNextModule,
} from './adapters';
