// Per-account-state "value moment" registry.
//
// The user's core question: "How many times does a customer need to click
// before they get something of VALUE?" That only has meaning if we define
// value per state. A value moment is the first page/affordance where a
// logged-in persona of a given state receives the thing they came for.
//
// Each moment is detected by a URL pattern (required) plus an optional text
// signal (a substring that must be visible in the page body). The auth sweep
// records the step index at which the FIRST matching moment is reached =
// clicks-to-value. Locators mirror the ones proven in
// e2e/dashboard-personas.spec.ts and e2e/course-enrolled.spec.ts.

import { ACCOUNT_STATE } from './account-states.mjs';

/** @typedef {{ id: string, label: string, urlRe: RegExp, textRe?: RegExp }} ValueMoment */

/** @type {Record<string, ValueMoment[]>} */
export const VALUE_MOMENTS = {
  [ACCOUNT_STATE.ACCOUNT_ONLY]: [
    { id: 'dash-first-step', label: 'Dashboard first-step CTA', urlRe: /\/dashboard(\/|$|\?)/, textRe: /take the free assessment|welcome in|your path/i },
    { id: 'free-assess-start', label: 'Started free assessment', urlRe: /\/assessment(\/take)?(\/|$|\?)/, textRe: /question|begin|start/i },
  ],
  [ACCOUNT_STATE.FREE_ASSESSMENT]: [
    { id: 'readiness-snapshot', label: 'Readiness snapshot visible', urlRe: /\/dashboard(\/|$|\?)/, textRe: /free readiness scan|ready to scale|readiness/i },
    { id: 'indepth-upsell', label: 'In-Depth upsell reached', urlRe: /\/assessment\/in-depth(\/|$|\?)/, textRe: /\$99|in-?depth/i },
  ],
  [ACCOUNT_STATE.IN_DEPTH]: [
    { id: 'indepth-take', label: 'In-Depth assessment open', urlRe: /\/assessment\/in-depth\/(take|results)/, textRe: /question|briefing|your results|action plan/i },
    { id: 'indepth-briefing', label: 'In-Depth briefing on dashboard', urlRe: /\/dashboard(\/|$|\?)/, textRe: /in-?depth briefing|your briefing is ready|take your in-?depth/i },
    { id: 'toolbox-starter', label: 'Starter Toolbox reached', urlRe: /\/dashboard\/toolbox(\/|$|\?)/, textRe: /toolbox|prompt|skill/i },
  ],
  [ACCOUNT_STATE.FOUNDATION_ONBOARDING]: [
    { id: 'onboarding', label: 'Onboarding reached', urlRe: /\/onboarding(\/|$|\?)/, textRe: /role|get started|tell us/i },
    { id: 'course-home', label: 'Course home reached', urlRe: /\/courses\/foundation\/program(\/|$|\?)/, textRe: /module|pillar|continue/i },
  ],
  [ACCOUNT_STATE.FOUNDATION_EARLY]: [
    { id: 'current-module', label: 'Current module open', urlRe: /\/courses\/foundation\/program\/\d+/, textRe: /understand|build|save|module/i },
    { id: 'course-home', label: 'Course home / resume bar', urlRe: /\/courses\/foundation\/program(\/|$|\?)/, textRe: /continue module|module \d|complete/i },
  ],
  [ACCOUNT_STATE.FOUNDATION_MID]: [
    { id: 'current-module', label: 'Current module open', urlRe: /\/courses\/foundation\/program\/\d+/, textRe: /understand|build|save|module/i },
    { id: 'course-home', label: 'Course home / resume bar', urlRe: /\/courses\/foundation\/program(\/|$|\?)/, textRe: /continue module|module \d|complete/i },
  ],
  [ACCOUNT_STATE.FOUNDATION_COMPLETE]: [
    { id: 'certificate', label: 'Certificate page reached', urlRe: /\/courses\/foundation\/program\/certificate/, textRe: /credential|certificate|congratulations|aibi-p/i },
    { id: 'submit', label: 'Final packet submit reached', urlRe: /\/courses\/foundation\/program\/submit/, textRe: /submit|packet|rubric/i },
    { id: 'post-assessment', label: 'Post-assessment reached', urlRe: /\/courses\/foundation\/program\/post-assessment/, textRe: /measure your growth|post|assessment/i },
  ],
  [ACCOUNT_STATE.UNCONFIRMED]: [
    { id: 'confirm-pending', label: 'Confirm-device / email-pending screen', urlRe: /\/auth\/(confirm|confirm-device-pending)/, textRe: /confirm|check your (inbox|email)/i },
  ],
};

// The single canonical "primary" value moment per state — the one whose
// clicks-to-value matters most for the efficiency report.
export const PRIMARY_VALUE_MOMENT = {
  [ACCOUNT_STATE.ACCOUNT_ONLY]: 'dash-first-step',
  [ACCOUNT_STATE.FREE_ASSESSMENT]: 'readiness-snapshot',
  [ACCOUNT_STATE.IN_DEPTH]: 'indepth-take',
  [ACCOUNT_STATE.FOUNDATION_ONBOARDING]: 'course-home',
  [ACCOUNT_STATE.FOUNDATION_EARLY]: 'current-module',
  [ACCOUNT_STATE.FOUNDATION_MID]: 'current-module',
  [ACCOUNT_STATE.FOUNDATION_COMPLETE]: 'certificate',
  [ACCOUNT_STATE.UNCONFIRMED]: 'confirm-pending',
};

export function momentsForState(state) {
  return VALUE_MOMENTS[state] || [];
}

// Given a URL path + visible body text, return the first matching value moment
// for this state (or null). bodyText may be '' if not captured.
export function matchValueMoment(state, path, bodyText = '') {
  for (const m of momentsForState(state)) {
    if (!m.urlRe.test(path)) continue;
    if (m.textRe && bodyText && !m.textRe.test(bodyText)) continue;
    return m;
  }
  return null;
}
