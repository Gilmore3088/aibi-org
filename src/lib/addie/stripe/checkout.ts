// Stripe Checkout Session factories. Auth Spec §6.1.
//
// All sessions stamp `metadata.addie_product` so the webhook can dispatch
// without re-reading line items. Team checkouts enforce N>=10 server-side.

import { stripe } from './client';
import {
  getAssessmentPriceId,
  getIndividualPriceId,
  getTeamSeatPriceId,
} from './products';

const MIN_TEAM_SEATS = 10;

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.aibankinginstitute.com';
}

function defaultUrls(scope: string): { success_url: string; cancel_url: string } {
  const base = siteUrl().replace(/\/$/, '');
  return {
    success_url: `${base}/checkout/${scope}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/checkout/${scope}/cancel`,
  };
}

export interface IndividualCheckoutArgs {
  readonly email?: string | null;
  readonly success_url?: string;
  readonly cancel_url?: string;
}

export async function createIndividualCheckout(
  args: IndividualCheckoutArgs,
): Promise<{ url: string; id: string }> {
  const urls = {
    success_url: args.success_url ?? defaultUrls('individual').success_url,
    cancel_url: args.cancel_url ?? defaultUrls('individual').cancel_url,
  };
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: getIndividualPriceId(), quantity: 1 }],
    customer_email: args.email ?? undefined,
    allow_promotion_codes: true,
    metadata: {
      addie_product: 'foundation_individual',
    },
    ...urls,
  });
  if (!session.url) throw new Error('Stripe did not return a checkout URL.');
  return { url: session.url, id: session.id };
}

export interface TeamCheckoutArgs {
  readonly seats: number;
  readonly email: string;
  readonly team_name: string;
  readonly success_url?: string;
  readonly cancel_url?: string;
}

export async function createTeamCheckout(
  args: TeamCheckoutArgs,
): Promise<{ url: string; id: string }> {
  if (!Number.isInteger(args.seats) || args.seats < MIN_TEAM_SEATS) {
    throw new Error(`Team purchase requires at least ${MIN_TEAM_SEATS} seats.`);
  }
  const urls = {
    success_url: args.success_url ?? defaultUrls('team').success_url,
    cancel_url: args.cancel_url ?? defaultUrls('team').cancel_url,
  };
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: getTeamSeatPriceId(), quantity: args.seats }],
    customer_email: args.email,
    allow_promotion_codes: true,
    metadata: {
      addie_product: 'foundation_team_seat',
      addie_team_name: args.team_name,
      addie_team_seats: String(args.seats),
    },
    ...urls,
  });
  if (!session.url) throw new Error('Stripe did not return a checkout URL.');
  return { url: session.url, id: session.id };
}

export interface AssessmentCheckoutArgs {
  readonly email?: string | null;
  readonly success_url?: string;
  readonly cancel_url?: string;
}

export async function createAssessmentCheckout(
  args: AssessmentCheckoutArgs,
): Promise<{ url: string; id: string }> {
  const urls = {
    success_url: args.success_url ?? defaultUrls('assessment').success_url,
    cancel_url: args.cancel_url ?? defaultUrls('assessment').cancel_url,
  };
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: getAssessmentPriceId(), quantity: 1 }],
    customer_email: args.email ?? undefined,
    allow_promotion_codes: true,
    metadata: {
      addie_product: 'assessment_in_depth',
    },
    ...urls,
  });
  if (!session.url) throw new Error('Stripe did not return a checkout URL.');
  return { url: session.url, id: session.id };
}

export { MIN_TEAM_SEATS };
