// tsx bridge to the canonical e2e seeding primitives.
//
// scripts/*.mjs sweeps run under `tsx` so they can import the TypeScript
// seed helpers directly — keeping seeding SINGLE-SOURCE (e2e/helpers/seed.ts)
// instead of re-implementing Supabase writes in a second place. This module
// translates an account-state recipe (scripts/lib/account-states.mjs ->
// seedRecipeFor) into the concrete helper chain, and exposes cleanup.
//
// All of this is gated by E2E_ALLOW_PRODUCTION_SUPABASE=true inside seed.ts
// and uses .test-TLD emails, so it is safe-by-construction against prod.

import {
  seedConfirmedUser,
  seedUnconfirmedUser,
  grantTrustedDevice,
  grantFoundationEnrollment,
  grantInDepthAccess,
  setOnboardingAnswers,
  setFoundationProgress,
  markAllModulesComplete,
  seedReadinessProfile,
  cleanupSeededUser,
  cleanupAllSeededUsers,
  type SeededUser,
} from '../../e2e/helpers/seed';
import type { OnboardingAnswers } from '../../src/types/course';

export {
  cleanupSeededUser,
  cleanupAllSeededUsers,
};

export interface TrustedDeviceCookie {
  readonly cookieName: string;
  readonly cookieToken: string;
  readonly expiresAtIso: string;
}

export interface SeededPersona {
  readonly user: SeededUser;
  readonly trustedDevice: TrustedDeviceCookie | null;
  readonly state: string;
}

export interface SeedRecipe {
  readonly state: string;
  readonly kind: 'unconfirmed' | 'account-only' | 'free' | 'in-depth' | 'foundation';
  readonly readiness?: 'free' | 'in-depth';
  readonly role?: string;
  readonly onboarding?: OnboardingAnswers | null;
  readonly currentModule?: number;
  readonly completedModules?: readonly number[];
  readonly allComplete?: boolean;
}

/**
 * Seed a single persona to the account state its recipe describes and return
 * everything the Playwright walk needs to start authenticated.
 */
export async function seedPersona(recipe: SeedRecipe): Promise<SeededPersona> {
  if (recipe.kind === 'unconfirmed') {
    const user = await seedUnconfirmedUser();
    return { user, trustedDevice: null, state: recipe.state };
  }

  const user = await seedConfirmedUser();

  if (recipe.kind === 'free') {
    await seedReadinessProfile({ userId: user.id, email: user.email, kind: 'free', role: recipe.role });
  } else if (recipe.kind === 'in-depth') {
    await grantInDepthAccess(user.id, user.email);
    await seedReadinessProfile({ userId: user.id, email: user.email, kind: 'in-depth', role: recipe.role });
  } else if (recipe.kind === 'foundation') {
    await grantFoundationEnrollment(user.id, user.email);
    if (recipe.onboarding) {
      await setOnboardingAnswers(user.id, recipe.onboarding);
    }
    if (recipe.allComplete) {
      await markAllModulesComplete(user.id);
    } else if (recipe.currentModule != null) {
      await setFoundationProgress({
        userId: user.id,
        currentModule: recipe.currentModule,
        completedModules: recipe.completedModules ?? [],
      });
    }
  }

  const trustedDevice = await grantTrustedDevice(user.id);
  return { user, trustedDevice, state: recipe.state };
}
