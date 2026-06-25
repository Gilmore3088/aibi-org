// Map each roster persona to a logged-in ACCOUNT STATE + a seed recipe.
//
// The read-only sweep walked everyone as an anonymous visitor. The
// authenticated sweep must place each persona in the account state their
// roster "completion behavior" implies, then walk the gated experience from
// there. The actual seeding is performed by scripts/lib/seed-bridge.mts using
// the e2e/helpers/seed.ts primitives; this module only decides WHICH recipe a
// persona needs and the parameters for it.

import { FOUNDATION_MODULE_COUNT } from '@content/courses/foundation-program/course-config';

export const ACCOUNT_STATE = Object.freeze({
  ACCOUNT_ONLY: 'account-only',
  FREE_ASSESSMENT: 'free-assessment',
  IN_DEPTH: 'in-depth',
  FOUNDATION_ONBOARDING: 'foundation-onboarding-pending',
  FOUNDATION_EARLY: 'foundation-early',
  FOUNDATION_MID: 'foundation-mid',
  FOUNDATION_COMPLETE: 'foundation-complete',
  UNCONFIRMED: 'unconfirmed',
});

const MID_MODULE = Math.max(2, Math.round(FOUNDATION_MODULE_COUNT / 2));

// Onboarding primary_role must be one of the role-path keys
// (content/courses/foundation-program/role-paths.ts).
const ROLE_KEYS = ['lending', 'operations', 'compliance', 'finance', 'marketing', 'it', 'retail', 'executive'];

export function primaryRoleFor(roleText) {
  const s = (roleText || '').toLowerCase();
  if (/lend|credit|loan/.test(s)) return 'lending';
  if (/bsa|aml|compliance|cco|risk|audit|examiner|counsel/.test(s)) return 'compliance';
  if (/cfo|finance|account|treasur/.test(s)) return 'finance';
  if (/market|brand|content|cmo/.test(s)) return 'marketing';
  if (/\bit\b|cio|ciso|tech|data|engineer|infosec|security/.test(s)) return 'it';
  if (/teller|retail|branch|member service|csr/.test(s)) return 'retail';
  if (/ceo|coo|president|board|founder|exec|chief|officer|director|innovation/.test(s)) return 'executive';
  if (/operation|ops|process/.test(s)) return 'operations';
  return ROLE_KEYS.includes(s) ? s : 'operations';
}

// Decide the account state from the roster's completion behavior (primary
// signal), falling back to journey/goal cues.
export function accountStateFor(persona) {
  const completion = (persona.completion || '').toLowerCase();
  const journey = (persona.journey || '').toLowerCase();
  const goal = (persona.goal || '').toLowerCase();
  const blob = `${completion} ${journey} ${goal}`;

  // Foundation buyers — split by how far they got.
  if (/\$295|foundation|cert/.test(blob) || /buys|enrol/.test(completion)) {
    if (/complete|completes|finish|cert/.test(completion)) return ACCOUNT_STATE.FOUNDATION_COMPLETE;
    if (/abandons? m\s?3|abandons? module 3|abandons? m3|quits? m3/.test(completion)) return ACCOUNT_STATE.FOUNDATION_EARLY;
    if (/never starts?|buys .*never|stalls|idle/.test(completion)) return ACCOUNT_STATE.FOUNDATION_ONBOARDING;
    if (/abandons?|quits?|stuck|mid/.test(completion)) return ACCOUNT_STATE.FOUNDATION_MID;
    if (/cert|certif|module|18 modules|get certified/.test(blob)) return ACCOUNT_STATE.FOUNDATION_COMPLETE;
    return ACCOUNT_STATE.FOUNDATION_EARLY;
  }

  // In-Depth ($99) buyers, incl. refund-seekers (seeded as buyers; refund
  // flow itself is exercised by the payments harness, not the nav walk).
  if (/\$99|in-depth|refund/.test(blob)) return ACCOUNT_STATE.IN_DEPTH;

  // Free assessment takers (gave email / read report / abandoned mid-assess).
  if (/email|report|readiness|free assess|assessment|snapshot/.test(blob)) return ACCOUNT_STATE.FREE_ASSESSMENT;

  // Everyone else who has an account but no product yet.
  return ACCOUNT_STATE.ACCOUNT_ONLY;
}

// The concrete seed recipe for a state. `seed-bridge.mts` reads `kind` to
// decide which helper chain to call; the rest are parameters.
export function seedRecipeFor(persona) {
  const state = accountStateFor(persona);
  const primary_role = primaryRoleFor(persona.role);
  const onboarding = {
    uses_m365: 'yes',
    personal_ai_subscriptions: ['ChatGPT'],
    primary_role,
  };

  switch (state) {
    case ACCOUNT_STATE.UNCONFIRMED:
      return { state, kind: 'unconfirmed' };
    case ACCOUNT_STATE.ACCOUNT_ONLY:
      return { state, kind: 'account-only' };
    case ACCOUNT_STATE.FREE_ASSESSMENT:
      return { state, kind: 'free', readiness: 'free', role: primary_role };
    case ACCOUNT_STATE.IN_DEPTH:
      return { state, kind: 'in-depth', readiness: 'in-depth', role: primary_role };
    case ACCOUNT_STATE.FOUNDATION_ONBOARDING:
      return { state, kind: 'foundation', onboarding: null, currentModule: 0, completedModules: [] };
    case ACCOUNT_STATE.FOUNDATION_EARLY:
      return { state, kind: 'foundation', onboarding, currentModule: 3, completedModules: [1, 2] };
    case ACCOUNT_STATE.FOUNDATION_MID:
      return {
        state,
        kind: 'foundation',
        onboarding,
        currentModule: MID_MODULE,
        completedModules: Array.from({ length: MID_MODULE - 1 }, (_, i) => i + 1),
      };
    case ACCOUNT_STATE.FOUNDATION_COMPLETE:
      return { state, kind: 'foundation', onboarding, allComplete: true };
    default:
      return { state: ACCOUNT_STATE.ACCOUNT_ONLY, kind: 'account-only' };
  }
}

// Distribution summary (for logging / report KPIs).
export function summarizeStates(personas) {
  const counts = {};
  for (const p of personas) {
    const s = accountStateFor(p);
    counts[s] = (counts[s] || 0) + 1;
  }
  return counts;
}
