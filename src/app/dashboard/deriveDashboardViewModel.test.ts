import { describe, expect, it } from 'vitest';

import { modules } from '@content/courses/foundation-program';
import {
  deriveDashboardViewModel,
  resolveGreetingName,
  type AssessmentsState,
  type DashboardArtifact,
  type LearnerDashboardState,
  type ReadinessSnapshot,
  type ToolboxAccessState,
} from './deriveDashboardViewModel';

const currentRep = { id: 'rep-001', title: 'Credit memo review' };

const freeSnapshot: ReadinessSnapshot = {
  score: 34,
  maxScore: 48,
  tierId: 'ready-to-scale',
  tierLabel: 'Ready to Scale',
  isInDepth: false,
  takenAt: '2026-06-01T12:00:00.000Z',
};

const inDepthSnapshot: ReadinessSnapshot = {
  score: 144,
  maxScore: 192,
  tierId: 'building-momentum',
  tierLabel: 'Building Momentum',
  isInDepth: true,
  takenAt: '2026-06-02T12:00:00.000Z',
};

function assessments(partial: Partial<AssessmentsState> = {}): AssessmentsState {
  return {
    displayName: '',
    snapshot: null,
    inDepth: null,
    ...partial,
  };
}

function toolbox(partial: Partial<ToolboxAccessState> = {}): ToolboxAccessState {
  return {
    entitled: false,
    tier: null,
    ...partial,
  };
}

function artifact(partial: Partial<DashboardArtifact> = {}): DashboardArtifact {
  return {
    id: 'artifact-1',
    title: 'Artifact 1',
    description: 'Test artifact',
    moduleNumber: 1,
    status: 'available',
    updatedAt: null,
    ...partial,
  };
}

function learner(partial: Partial<LearnerDashboardState> = {}): LearnerDashboardState {
  return {
    email: 'learner@example.com',
    enrollment: null,
    certificate: null,
    practice: {
      completedRepIds: [],
      completedCount: 0,
    },
    prompts: {
      savedPromptIds: [],
      savedCount: 0,
    },
    artifacts: [],
    ...partial,
  };
}

describe('deriveDashboardViewModel lifecycle personas', () => {
  it('persona 1: account-only user starts at the free assessment', () => {
    const model = deriveDashboardViewModel({
      accountEmail: 'account@example.com',
      assessments: null,
      completedRepIds: [],
      currentRep,
      dashboard: null,
      snapshot: null,
      toolboxAccess: null,
    });

    expect(model.stepsComplete).toBe(1);
    expect(model.nowIndex).toBe(1);
    expect(model.heroPrimary).toEqual({
      href: '/assessment/take',
      label: 'Take the free assessment',
    });
    expect(model.workPrimaryHref).toBe('/resources');
    expect(model.toolboxEntitled).toBe(false);
    expect(model.toolboxLabel).toBe('Paid access');
  });

  it('persona 2: free assessment user is routed to In-Depth', () => {
    const model = deriveDashboardViewModel({
      accountEmail: 'free@example.com',
      assessments: assessments({ snapshot: freeSnapshot }),
      completedRepIds: [],
      currentRep,
      dashboard: null,
      snapshot: freeSnapshot,
      toolboxAccess: null,
    });

    expect(model.stepsComplete).toBe(2);
    expect(model.stepAssessment).toBe(true);
    expect(model.heroPrimary).toEqual({
      href: '/assessment/in-depth',
      label: 'Take In-Depth · $99',
    });
    expect(model.heroLede).toContain('You scored 34/48');
  });

  it('persona 3: In-Depth buyer sees starter Toolbox access and assessment CTA', () => {
    const model = deriveDashboardViewModel({
      accountEmail: 'buyer@example.com',
      assessments: assessments({
        inDepth: {
          entitled: true,
          profileId: null,
          hasCompleted: false,
          purchasedAt: '2026-06-02T12:00:00.000Z',
        },
      }),
      completedRepIds: [],
      currentRep,
      dashboard: null,
      snapshot: null,
      toolboxAccess: toolbox({ entitled: true, tier: 'starter' }),
    });

    expect(model.heroPrimary.href).toBe('/assessment/in-depth/take');
    expect(model.heroPrimary.label).toBe('Take your In-Depth assessment');
    expect(model.toolboxEntitled).toBe(true);
    expect(model.toolboxLabel).toBe('In-Depth access');
    expect(model.workPrimaryHref).toBe('/dashboard/toolbox');
    expect(model.stepsComplete).toBe(1);
  });

  it('persona 4: completed In-Depth user is routed to their Briefing', () => {
    const model = deriveDashboardViewModel({
      accountEmail: 'completed@example.com',
      assessments: assessments({
        snapshot: inDepthSnapshot,
        inDepth: {
          entitled: true,
          profileId: 'profile-123',
          hasCompleted: true,
          purchasedAt: '2026-06-02T12:00:00.000Z',
        },
      }),
      completedRepIds: [],
      currentRep,
      dashboard: null,
      snapshot: inDepthSnapshot,
      toolboxAccess: toolbox({ entitled: true, tier: 'starter' }),
    });

    expect(model.stepsComplete).toBe(3);
    expect(model.stepInDepth).toBe(true);
    expect(model.heroPrimary).toEqual({
      href: '/assessment/in-depth/results/profile-123',
      label: 'View your Briefing',
    });
  });

  it('persona 5: Foundation learner resumes course work and sees artifacts', () => {
    const dashboard = learner({
      enrollment: {
        id: 'enrollment-1',
        completedModules: [1, 2, 3, 4, 5, 6],
        currentModule: 7,
        enrolledAt: '2026-06-03T12:00:00.000Z',
      },
      practice: {
        completedRepIds: ['rep-001', 'rep-002'],
        completedCount: 2,
      },
      prompts: {
        savedPromptIds: ['credit-memo-drafter', 'exam-prep'],
        savedCount: 2,
      },
      artifacts: [
        artifact({ id: 'first-prompt-template', title: 'First Prompt Template', status: 'completed' }),
        artifact({ id: 'prompt-strategy-cheat-sheet', title: 'Prompt Strategy Cheat Sheet', status: 'completed' }),
        artifact({ id: 'safe-ai-use-checklist', title: 'Safe AI Use Checklist', status: 'in-progress' }),
      ],
    });

    const model = deriveDashboardViewModel({
      accountEmail: 'learner@example.com',
      assessments: assessments({ snapshot: freeSnapshot }),
      completedRepIds: dashboard.practice.completedRepIds,
      currentRep,
      dashboard,
      snapshot: freeSnapshot,
      toolboxAccess: toolbox({ entitled: true, tier: 'full' }),
    });

    expect(model.stepsComplete).toBe(5);
    expect(model.heroPrimary).toEqual({
      href: '/courses/foundation/program/7',
      label: 'Continue Module 7',
    });
    expect(model.workPrimaryHref).toBe('/courses/foundation/program/7');
    expect(model.completedModuleCount).toBe(6);
    expect(model.savedPromptCount).toBe(2);
    expect(model.toolboxLabel).toBe('Foundation access');
    expect(model.completedArtifactCount).toBe(2);
    expect(model.nextArtifact?.title).toBe('Safe AI Use Checklist');
  });

  it('does not mark the certificate step verified from module count alone', () => {
    const dashboard = learner({
      enrollment: {
        id: 'enrollment-1',
        completedModules: modules.map((module) => module.number),
        currentModule: modules.length,
        enrolledAt: '2026-06-03T12:00:00.000Z',
      },
    });

    const model = deriveDashboardViewModel({
      accountEmail: 'learner@example.com',
      assessments: assessments({ snapshot: freeSnapshot }),
      completedRepIds: [],
      currentRep,
      dashboard,
      snapshot: freeSnapshot,
      toolboxAccess: toolbox({ entitled: true, tier: 'full' }),
    });

    expect(model.completedModuleCount).toBe(modules.length);
    expect(model.stepCertificate).toBe(false);
    expect(model.certificateId).toBeNull();
    expect(model.certificateHref).toBeNull();
    expect(model.stepsComplete).toBe(4);
  });

  it('marks the certificate step verified only when a certificate row exists', () => {
    const dashboard = learner({
      enrollment: {
        id: 'enrollment-1',
        completedModules: modules.map((module) => module.number),
        currentModule: modules.length,
        enrolledAt: '2026-06-03T12:00:00.000Z',
      },
      certificate: {
        id: 'AIBIP-2026-ABC234',
        issuedAt: '2026-06-23T12:00:00.000Z',
        verifyUrl: '/verify/AIBIP-2026-ABC234',
      },
    });

    const model = deriveDashboardViewModel({
      accountEmail: 'learner@example.com',
      assessments: assessments({ snapshot: freeSnapshot }),
      completedRepIds: [],
      currentRep,
      dashboard,
      snapshot: freeSnapshot,
      toolboxAccess: toolbox({ entitled: true, tier: 'full' }),
    });

    expect(model.stepCertificate).toBe(true);
    expect(model.certificateId).toBe('AIBIP-2026-ABC234');
    expect(model.certificateVerifyUrl).toBe('/verify/AIBIP-2026-ABC234');
    expect(model.certificateHref).toBe('/courses/foundation/program/certificate');
    expect(model.stepsComplete).toBe(5);
  });
});

describe('resolveGreetingName', () => {
  it('does not turn usernames with digits into names', () => {
    expect(resolveGreetingName('', 'jlgilmore2@example.com')).toBe('');
  });
});
