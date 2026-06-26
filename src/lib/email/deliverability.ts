// Recipient hygiene for batch/cron email jobs.
//
// Seeded persona and E2E fixtures live in the production Supabase project with
// addresses on reserved or placeholder domains (for example
// e2e+persona-7@aibankinginstitute.test). The .test TLD never resolves, so
// every scheduled reminder sent to one of these addresses hard-bounces and
// erodes the Resend sender reputation.
//
// Scheduled jobs that select their own recipients (paid re-engagement, course
// module reminders, abandoned-assessment reminders) must skip these addresses
// before sending. This guard is intentionally NOT applied to transactional
// sends triggered by a real user action (assessment breakdown, resource
// delivery, signup confirmation) — those addresses come from the person in
// front of the form, not from seeded fixtures.

const NON_DELIVERABLE_DOMAINS = new Set([
  'aibankinginstitute.test',
  'example.com',
  'examplebank.com',
]);

/**
 * Returns true when the address belongs to a known non-deliverable test or
 * placeholder domain. Malformed or empty input returns false — upstream
 * callers already guard against missing addresses, and this helper is a
 * blocklist, not an address validator.
 */
export function isNonDeliverableEmail(email: string): boolean {
  const trimmed = email.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf('@');
  if (atIndex <= 0 || atIndex === trimmed.length - 1) return false;
  const domain = trimmed.slice(atIndex + 1);
  return NON_DELIVERABLE_DOMAINS.has(domain);
}
