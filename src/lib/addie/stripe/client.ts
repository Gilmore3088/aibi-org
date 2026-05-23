// Re-export the existing project Stripe singleton. Auth/payments code
// should import from here so we have a single ADDIE-namespaced surface
// and can swap the underlying client without touching call sites.

export { stripe } from '@/lib/stripe';
