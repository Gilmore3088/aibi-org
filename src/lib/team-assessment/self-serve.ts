export const TEAM_ASSESSMENT_SELF_SERVE_FLAG = 'ENABLE_TEAM_ASSESSMENT_SELF_SERVE_CHECKOUT';

export function isTeamAssessmentSelfServeEnabled(): boolean {
  return process.env[TEAM_ASSESSMENT_SELF_SERVE_FLAG] === 'true';
}
