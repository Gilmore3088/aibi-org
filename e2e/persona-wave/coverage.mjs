// Wave 3: every page waves 1 and 2 never reached (admin and design-system
// excluded). Each page gets ~3 personas. A page "delivers" when it shows real
// content, or, for pages that need a purchase, a sign-in, or a real ID, when
// it shows a clear message with a way forward. Anything else is a dead end.
//
// Extra step type interpreted by runSteps() in run-wave.mjs:
//   { assess: true }  judge the page: content, clear message + next step, or dead end

const FAKE_UUID = '00000000-0000-4000-8000-000000000000';

const read = (path) => [{ enter: path }, { assess: true }, { click: /./, label: 'primary next step', optional: true, primary: true }];

export const COVERAGE_PAGES = {
  'cov-indepth-access': read('/assessment/in-depth/access'),
  'cov-indepth-purchased': read('/assessment/in-depth/purchased'),
  'cov-indepth-results': read(`/assessment/in-depth/results/${FAKE_UUID}`),
  'cov-indepth-take': read('/assessment/in-depth/take'),
  'cov-results-print': read(`/assessment/results/print/${FAKE_UUID}`),
  'cov-assessment-start': read('/assessment/start'),
  'cov-team-token': read('/assessment/team/not-a-real-token'),
  'cov-team-admin': read(`/assessment/team/admin/${FAKE_UUID}`),
  'cov-team-admin-print': read(`/assessment/team/admin/${FAKE_UUID}/print`),
  'cov-team-purchased': read('/assessment/team/purchased'),
  'cov-team-results': read(`/assessment/team/results/${FAKE_UUID}`),
  'cov-auth-confirm': read('/auth/confirm'),
  'cov-auth-device-pending': read('/auth/confirm-device-pending'),
  'cov-auth-login': [
    { enter: '/auth/login' }, { assess: true },
    { fill: 'form:has(input[type=password])' },
    { submit: /^sign in$/i, api: /\/api\/auth|token|login/, value: 'account_response', label: 'sign in', scope: 'form:has(input[type=password])', uiOk: /unavailable|invalid|incorrect|welcome|signed in|check/i },
  ],
  'cov-auth-reset': read('/auth/reset-password'),
  'cov-courses-foundation': read('/courses/foundation'),
  'cov-foundation-gallery': read('/courses/foundation/gallery'),
  'cov-program-gallery': read('/courses/foundation/program/gallery'),
  'cov-onboarding': [
    { enter: '/courses/foundation/program/onboarding' }, { assess: true },
    { click: /run this prompt/i, label: 'run onboarding prompt', value: 'onboarding_started' },
  ],
  'cov-prompt-library': read('/courses/foundation/program/prompt-library'),
  'cov-course-purchased': read('/courses/foundation/program/purchased'),
  'cov-packet-submit': [
    { enter: '/courses/foundation/program/submit' }, { assess: true },
    { fill: 'form' },
    { submit: /submit|send|review/i, api: /\/api\/courses\/submit/, value: 'packet_submitted', label: 'submit final packet', scope: 'form', uiOk: /unavailable|received|submitted|error|try again/i },
  ],
  'cov-dashboard': read('/dashboard'),
  'cov-dashboard-assessments': read('/dashboard/assessments'),
  'cov-cookbook-recipe': read('/dashboard/toolbox/cookbook/not-a-recipe'),
  'cov-library-skill': read('/dashboard/toolbox/library/not-a-skill'),
  'cov-toolbox-skill': read('/my-toolbox/skills/kyc-refresh-guide'),
  'cov-practice-rep': [
    { enter: '/practice/safe-prompt-conversion' }, { assess: true },
    { fill: 'main, #main-content' },
    { submit: /submit practice rep/i, api: /\/api\/practice-reps/, value: 'practice_rep_submitted', label: 'submit practice rep', uiOk: /nice|good|feedback|score|saved|sign in|unavailable|try again/i },
  ],
  'cov-brief-members': read('/resources/members-will-switch'),
  'cov-brief-skill': read('/resources/the-skill-not-the-prompt'),
  'cov-brief-efficiency': read('/resources/what-your-efficiency-ratio-is-hiding'),
  'cov-verify-id': read('/verify/AIBIP-2026-0000'),
  'cov-verify-print': read('/verify/AIBIP-2026-0000/print'),
  'cov-results-id': read(`/results/${FAKE_UUID}`),
};

const IDS = Object.keys(COVERAGE_PAGES);
// 34 pages: 32 get 3 personas, 2 get 2, for exactly 100.
export const COVERAGE_QUOTAS = IDS.map((journey, i) => ({
  journey,
  count: i < 32 ? 3 : 2,
  label: `Page: ${COVERAGE_PAGES[journey].find((s) => s.enter).enter}`,
}));

// Wave-3 journeys use the same variant-list shape as wave 2.
export const COVERAGE_JOURNEYS = Object.fromEntries(IDS.map((id) => [id, [COVERAGE_PAGES[id]]]));
