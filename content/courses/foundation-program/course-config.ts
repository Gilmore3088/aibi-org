import type { CourseConfig, CourseModule } from '@/types/lms';
import { modules } from './modules';
import {
  AIBI_P_ARTIFACTS,
  AIBI_P_CERTIFICATE_REQUIREMENTS,
  AIBI_P_PRACTICE_REPS,
} from '@content/practice-reps/foundation-program';

const PHASE_BY_MODULE: Record<number, CourseModule['phase']> = {
  1: 'understand',
  2: 'understand',
  3: 'daily-workflows',
  4: 'safe-use',
  5: 'understand',
  6: 'daily-workflows',
  7: 'daily-workflows',
  8: 'role-application',
  9: 'safe-use',
  10: 'role-application',
  11: 'daily-workflows',
  12: 'credential',
};

export const aibiPReusableModules: readonly CourseModule[] = modules.map((mod) => {
  const practice = AIBI_P_PRACTICE_REPS.find((rep) => rep.moduleNumber === mod.number) ??
    AIBI_P_PRACTICE_REPS[0];
  const artifact = AIBI_P_ARTIFACTS.find((item) => item.moduleNumber === mod.number);
  const firstActivity = mod.activities[0];

  return {
    id: mod.id,
    number: mod.number,
    title: mod.title,
    phase: PHASE_BY_MODULE[mod.number] ?? 'daily-workflows',
    estimatedMinutes: mod.estimatedMinutes,
    keyOutput: mod.keyOutput,
    learnerOutcome: `Use AI more safely and practically for ${mod.keyOutput.toLowerCase()}.`,
    learn: mod.sections.map((section) => section.title),
    practice,
    apply: {
      id: firstActivity?.id ?? `m${mod.number}-complete`,
      kind: firstActivity?.type === 'drill'
        ? 'drill'
        : firstActivity?.type === 'builder'
          ? 'builder'
          : artifact
            ? 'artifact'
            : 'reflection',
      title: firstActivity?.title ?? `Complete Module ${mod.number}`,
      description: firstActivity?.description ?? mod.keyOutput,
      artifactId: artifact?.id,
      countsTowardCertificate: true,
    },
  };
});

export const foundationProgramCourseConfig: CourseConfig = {
  id: 'aibi-p',
  title: 'Banking AI Practitioner',
  shortTitle: 'AiBI-Foundation',
  promise:
    'Help every community banking employee use AI safely, confidently, and practically in daily work.',
  audience: 'Community bank and credit union employees',
  estimatedMinutes: modules.reduce((total, mod) => total + mod.estimatedMinutes, 0),
  modules: aibiPReusableModules,
  practiceReps: AIBI_P_PRACTICE_REPS,
  artifacts: AIBI_P_ARTIFACTS,
  certificateRequirements: AIBI_P_CERTIFICATE_REQUIREMENTS,
};
