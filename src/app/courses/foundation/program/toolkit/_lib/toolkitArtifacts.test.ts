import { describe, expect, it } from 'vitest';
import { FOUNDATION_MODULE_COUNT } from '@content/courses/foundation-program';
import { buildArtifacts } from './toolkitArtifacts';

function buildTestArtifacts(completedModules: readonly number[]) {
  return buildArtifacts({
    inventoryResponse: undefined,
    completedModules,
    courseComplete: completedModules.length >= FOUNDATION_MODULE_COUNT,
    enrollmentId: 'enrollment-test',
    daysAgo: (n) => new Date(Date.UTC(2026, 0, Math.max(1, 18 - n))).toISOString(),
  });
}

describe('toolkitArtifacts', () => {
  it('creates one Foundation Packet slot per module', () => {
    const artifacts = buildTestArtifacts([]);

    expect(artifacts).toHaveLength(FOUNDATION_MODULE_COUNT);
    expect(artifacts.map((artifact) => artifact.module)).toEqual(
      Array.from({ length: FOUNDATION_MODULE_COUNT }, (_, index) => index + 1),
    );
  });

  it('uses module 18 as the final packet download only when the course is complete', () => {
    const incomplete = buildTestArtifacts(Array.from({ length: 17 }, (_, index) => index + 1));
    const incompleteFinal = incomplete.find((artifact) => artifact.module === 18);
    expect(incompleteFinal?.action.kind).toBe('pending');

    const complete = buildTestArtifacts(Array.from({ length: 18 }, (_, index) => index + 1));
    const completeFinal = complete.find((artifact) => artifact.module === 18);
    expect(completeFinal?.title).toBe('Foundation Packet Summary');
    expect(completeFinal?.type).toBe('report');
    expect(completeFinal?.action.kind).toBe('download-report');
  });

  it('labels later-module artifacts as skills, workflows, evidence, and packet outputs', () => {
    const artifacts = buildTestArtifacts(Array.from({ length: 18 }, (_, index) => index + 1));
    const byModule = new Map(artifacts.map((artifact) => [artifact.module, artifact]));

    expect(byModule.get(13)?.typeLabel).toBe('Reusable skill');
    expect(byModule.get(15)?.typeLabel).toBe('Workflow artifact');
    expect(byModule.get(16)?.typeLabel).toBe('Evidence artifact');
    expect(byModule.get(18)?.typeLabel).toBe('Foundation packet');
  });

  it('carries a day-job transfer cue for every packet artifact', () => {
    const artifacts = buildTestArtifacts(Array.from({ length: 18 }, (_, index) => index + 1));

    for (const artifact of artifacts) {
      expect(artifact.transferMove, `module ${artifact.module} transfer cue`).toMatch(/\S/);
      expect(artifact.transferMove?.split(/\s+/).length, `module ${artifact.module} transfer cue words`).toBeLessThanOrEqual(24);
    }
  });
});
