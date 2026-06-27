import type { Page, FrameLocator } from '@playwright/test';

/**
 * Stripe test cards (test mode only). Never use with a live-mode key.
 *   success  — 4242…  approves immediately
 *   decline  — 4000 0000 0000 0002  generic_decline
 *   threeDS  — 4000 0025 0000 3155  requires 3DS authentication
 */
export const STRIPE_TEST_CARDS = {
  success: '4242 4242 4242 4242',
  decline: '4000 0000 0000 0002',
  threeDS: '4000 0025 0000 3155',
} as const;

export interface StripeCardInput {
  readonly number: string;
  readonly exp: string;
  readonly cvc: string;
  readonly name: string;
  readonly postal: string;
  readonly email: string;
}

export function defaultCard(email: string, number: string = STRIPE_TEST_CARDS.success): StripeCardInput {
  return { number, exp: '12 / 30', cvc: '123', name: 'James Gilmore', postal: '98127', email };
}

/** Locate a Stripe Elements iframe by its element-name attribute. */
function findStripeFrame(
  page: Page,
  kind: 'cardNumber' | 'cardExpiry' | 'cardCvc' | 'postalCode',
): FrameLocator {
  return page.frameLocator(`iframe[title*="${kind}" i], iframe[name*="${kind}" i]`);
}

/** Fill Stripe's hosted Checkout form with the given card. Idempotent fills. */
export async function fillStripeCheckout(page: Page, card: StripeCardInput): Promise<void> {
  const emailField = page.locator('input[type="email"]').first();
  if (await emailField.isVisible().catch(() => false)) {
    await emailField.fill(card.email);
  }

  await findStripeFrame(page, 'cardNumber')
    .locator('input[name="cardnumber"], input[autocomplete="cc-number"]')
    .fill(card.number);
  await findStripeFrame(page, 'cardExpiry')
    .locator('input[name="exp-date"], input[autocomplete="cc-exp"]')
    .fill(card.exp);
  await findStripeFrame(page, 'cardCvc')
    .locator('input[name="cvc"], input[autocomplete="cc-csc"]')
    .fill(card.cvc);

  const nameField = page.locator('input[name="billingName"], input[autocomplete="cc-name"]').first();
  if (await nameField.isVisible().catch(() => false)) {
    await nameField.fill(card.name);
  }

  const topLevelPostal = page
    .locator('input[name="billingPostalCode"], input[autocomplete="postal-code"]')
    .first();
  if (await topLevelPostal.isVisible().catch(() => false)) {
    await topLevelPostal.fill(card.postal);
  } else {
    const postalInput = findStripeFrame(page, 'postalCode').locator(
      'input[name="postal"], input[autocomplete="postal-code"]',
    );
    if (await postalInput.isVisible().catch(() => false)) {
      await postalInput.fill(card.postal);
    }
  }
}

/** Guard: throw if the configured Stripe key is a live-mode key. */
export function assertNotLiveStripeKey(): void {
  const key = process.env.STRIPE_SECRET_KEY ?? '';
  if (key.startsWith('sk_live_') || key.startsWith('rk_live_')) {
    throw new Error(
      'Refusing to run payment tests against a LIVE Stripe key. Use a test-mode (sk_test_) key.',
    );
  }
}
