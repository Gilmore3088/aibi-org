import { modules } from '@content/courses/foundation-program';

export interface ReadinessSnapshot {
  readonly score: number;
  readonly maxScore: number;
  readonly tierId: string;
  readonly tierLabel: string;
  readonly isInDepth: boolean;
  readonly takenAt: string | null;
}

export interface AssessmentsState {
  readonly displayName: string;
  readonly snapshot: ReadinessSnapshot | null;
  readonly inDepth: {
    readonly entitled: boolean;
    readonly profileId: string | null;
    readonly hasCompleted: boolean;
    readonly purchasedAt: string | null;
  } | null;
}

export interface DashboardArtifact {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly moduleNumber?: number;
  readonly status: 'available' | 'in-progress' | 'completed' | 'locked';
  readonly updatedAt: string | null;
}

export interface LearnerDashboardState {
  readonly email: string | null;
  readonly enrollment: {
    readonly id: string;
    readonly completedModules: readonly number[];
    readonly currentModule: number;
    readonly enrolledAt: string;
    readonly onboardingAnswers?: unknown;
  } | null;
  readonly certificate: {
    readonly id: string;
    readonly issuedAt: string;
    readonly verifyUrl: string;
  } | null;
  readonly practice: {
    readonly completedRepIds: readonly string[];
    readonly completedCount: number;
  };
  readonly prompts: {
    readonly savedPromptIds: readonly string[];
    readonly savedCount: number;
  };
  readonly artifacts: readonly DashboardArtifact[];
}

export interface ToolboxAccessState {
  readonly entitled: boolean;
  readonly tier: 'starter' | 'full' | null;
}

export interface CurrentPracticeRepSummary {
  readonly id: string;
  readonly title: string;
}

export interface DashboardViewModelInput {
  readonly accountEmail: string | null;
  readonly snapshot: ReadinessSnapshot | null;
  readonly assessments: AssessmentsState | null;
  readonly dashboard: LearnerDashboardState | null;
  readonly toolboxAccess: ToolboxAccessState | null;
  readonly completedRepIds: readonly string[];
  readonly currentRep: CurrentPracticeRepSummary;
}

export interface DashboardViewModel {
  readonly accountEmail: string | null;
  readonly snapshot: ReadinessSnapshot | null;
  readonly currentModuleNumber: number;
  readonly totalModules: number;
  readonly completedModuleCount: number;
  readonly savedPromptCount: number;
  readonly artifacts: readonly DashboardArtifact[];
  readonly completedArtifactCount: number;
  readonly nextArtifact: DashboardArtifact | null;
  readonly toolboxEntitled: boolean;
  readonly toolboxLabel: 'In-Depth access' | 'Foundation access' | 'Paid access';
  readonly workPrimaryHref: string;
  readonly workPrimaryLabel: string;
  readonly stepAccount: boolean;
  readonly stepAssessment: boolean;
  readonly stepRep: boolean;
  readonly stepInDepth: boolean;
  readonly stepEnrolled: boolean;
  readonly stepFirstModule: boolean;
  readonly stepCertificate: boolean;
  readonly certificateId: string | null;
  readonly certificateVerifyUrl: string | null;
  readonly certificateHref: string | null;
  readonly stepsComplete: number;
  readonly totalSteps: number;
  readonly nowIndex: number;
  readonly heroPrimary: {
    readonly href: string;
    readonly label: string;
  };
  readonly heroSecondary: {
    readonly href: string;
    readonly label: string;
  };
  readonly heroLede: string;
}

export function resolveGreetingName(apiName: string, email: string | undefined): string {
  if (apiName.trim().length > 0) return apiName.trim();
  if (!email) return '';
  const local = email.split('@')[0] ?? '';
  const first = local.split(/[._-]/)[0] ?? local;
  if (first.length === 0 || first.length > 24 || !/^[a-zA-Z]+$/.test(first)) {
    return '';
  }
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

export function deriveDashboardViewModel(input: DashboardViewModelInput): DashboardViewModel {
  const {
    accountEmail,
    assessments,
    completedRepIds,
    currentRep,
    dashboard,
    snapshot,
    toolboxAccess,
  } = input;

  const stepAccount = Boolean(accountEmail);
  const stepAssessment = Boolean(snapshot);
  const stepRep = completedRepIds.length > 0;
  const stepInDepth = Boolean(assessments?.inDepth?.hasCompleted);
  const stepEnrolled = Boolean(dashboard?.enrollment);
  const completedModuleCount = dashboard?.enrollment?.completedModules.length ?? 0;
  const stepFirstModule = completedModuleCount > 0;
  const totalModules = modules.length;
  const certificateId = dashboard?.certificate?.id ?? null;
  const certificateVerifyUrl = dashboard?.certificate?.verifyUrl ?? null;
  const stepCertificate = Boolean(certificateId);
  // Foundation completers (a certificate has been issued) get a direct link to
  // their in-program certificate page. The journey-step link points at the
  // public verify URL, leaving the certificate page unreachable from the
  // dashboard otherwise.
  const certificateHref = stepCertificate ? '/courses/foundation/program/certificate' : null;
  const savedPromptCount = dashboard?.prompts.savedCount ?? 0;
  const artifacts = dashboard?.artifacts ?? [];
  const completedArtifactCount = artifacts.filter((artifact) => artifact.status === 'completed').length;
  const nextArtifact =
    artifacts.find((artifact) => artifact.status === 'in-progress') ??
    artifacts.find((artifact) => artifact.status === 'available') ??
    null;
  const currentModuleNumber = dashboard?.enrollment?.currentModule ?? 1;
  const toolboxEntitled = Boolean(toolboxAccess?.entitled);
  const toolboxLabel = toolboxAccess?.tier === 'starter'
    ? 'In-Depth access'
    : toolboxAccess?.tier === 'full'
      ? 'Foundation access'
      : 'Paid access';
  const workPrimaryHref = stepEnrolled
    ? `/courses/foundation/program/${currentModuleNumber}`
    : toolboxEntitled
      ? '/dashboard/toolbox'
      : '/resources';
  const workPrimaryLabel = stepEnrolled
    ? `Continue Module ${currentModuleNumber}`
    : toolboxEntitled
      ? 'Open Toolbox'
      : 'Browse resources';

  const stepsDone = [
    stepAccount,
    stepAssessment,
    stepRep,
    stepInDepth,
    stepEnrolled,
    stepFirstModule,
    stepCertificate,
  ];
  const stepsComplete = stepsDone.filter(Boolean).length;
  const totalSteps = stepsDone.length;
  const nowIndex = stepsDone.findIndex((done) => !done);

  let heroPrimary: DashboardViewModel['heroPrimary'];
  let heroSecondary: DashboardViewModel['heroSecondary'];
  let heroLede: string;
  const profileIdForBriefing = assessments?.inDepth?.profileId;

  if (stepEnrolled) {
    const cur = modules.find((module) => module.number === currentModuleNumber) ?? modules[0]!;
    heroPrimary = { href: `/courses/foundation/program/${cur.number}`, label: `Continue Module ${cur.number}` };
    heroSecondary = { href: `/practice/${currentRep.id}`, label: "Today's rep" };
    heroLede =
      `Pick up where you left off in ${cur.title}. Practice reps are your shortest path between modules — six minutes, banker-safe.`;
  } else if (stepInDepth) {
    heroPrimary = profileIdForBriefing
      ? { href: `/assessment/in-depth/results/${profileIdForBriefing}`, label: 'View your Briefing' }
      : { href: '/courses/foundation/program/purchase', label: 'Enroll · $295' };
    heroSecondary = { href: '/courses/foundation/program/purchase', label: 'Enroll · $295' };
    heroLede =
      'Your In-Depth Briefing is filed. The next move is to turn the diagnosis into operating capability — Foundation is the course that does that.';
  } else if (assessments?.inDepth?.entitled) {
    heroPrimary = { href: '/assessment/in-depth/take', label: 'Take your In-Depth assessment' };
    heroSecondary = { href: `/practice/${currentRep.id}`, label: "Try today's rep" };
    heroLede =
      'Your In-Depth Assessment is ready. Forty-eight questions across eight dimensions — about twelve minutes — for a personalized Briefing and ninety-day action register.';
  } else if (stepAssessment) {
    heroPrimary = { href: '/assessment/in-depth', label: 'Take In-Depth · $99' };
    heroSecondary = { href: '/courses/foundation/program', label: 'Preview Foundation' };
    heroLede = snapshot
      ? `You scored ${snapshot.score}/${snapshot.maxScore} — ${snapshot.tierLabel}. The In-Depth Assessment goes from a three-minute scan to a forty-eight-question diagnostic with peer-band comparison and a ninety-day playbook.`
      : 'Go deeper with the In-Depth Assessment — forty-eight questions, peer-band comparison, and a starting playbook keyed to your weakest area.';
  } else {
    heroPrimary = { href: '/assessment/take', label: 'Take the free assessment' };
    heroSecondary = { href: '/courses/foundation/program', label: 'Preview Foundation' };
    heroLede =
      "Start with a three-minute readiness check. You'll get your score, your strongest area, your weakest area, and the recommended next step.";
  }

  return {
    accountEmail,
    artifacts,
    completedArtifactCount,
    completedModuleCount,
    currentModuleNumber,
    heroLede,
    heroPrimary,
    heroSecondary,
    nextArtifact,
    nowIndex,
    savedPromptCount,
    snapshot,
    stepAccount,
    stepAssessment,
    stepCertificate,
    certificateId,
    certificateVerifyUrl,
    certificateHref,
    stepEnrolled,
    stepFirstModule,
    stepInDepth,
    stepRep,
    stepsComplete,
    toolboxEntitled,
    toolboxLabel,
    totalModules,
    totalSteps,
    workPrimaryHref,
    workPrimaryLabel,
  };
}
