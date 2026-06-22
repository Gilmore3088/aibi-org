import { afterEach, describe, expect, it } from 'vitest';
import {
  isTeamAssessmentSelfServeEnabled,
  TEAM_ASSESSMENT_SELF_SERVE_FLAG,
} from './self-serve';

const originalValue = process.env[TEAM_ASSESSMENT_SELF_SERVE_FLAG];

afterEach(() => {
  if (originalValue === undefined) {
    delete process.env[TEAM_ASSESSMENT_SELF_SERVE_FLAG];
  } else {
    process.env[TEAM_ASSESSMENT_SELF_SERVE_FLAG] = originalValue;
  }
});

describe('Team Assessment self-serve gate', () => {
  it('defaults to assisted rollout', () => {
    delete process.env[TEAM_ASSESSMENT_SELF_SERVE_FLAG];

    expect(isTeamAssessmentSelfServeEnabled()).toBe(false);
  });

  it('requires an explicit true flag for checkout', () => {
    process.env[TEAM_ASSESSMENT_SELF_SERVE_FLAG] = 'true';

    expect(isTeamAssessmentSelfServeEnabled()).toBe(true);
  });

  it('does not enable checkout for other truthy-looking values', () => {
    process.env[TEAM_ASSESSMENT_SELF_SERVE_FLAG] = '1';

    expect(isTeamAssessmentSelfServeEnabled()).toBe(false);
  });
});
