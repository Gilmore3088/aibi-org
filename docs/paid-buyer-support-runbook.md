# Paid buyer support runbook

Use this for paid launch support until support volume proves a different
process is needed.

## Dashboards

### Stripe
- Search by buyer email.
- Confirm payment status, amount, product, Checkout Session id, and refund status.
- Copy the Checkout Session id before opening Supabase.

### Supabase
- `course_enrollments` — confirm `email`, `user_id`, `product`, `stripe_session_id`, and access status.
- `team_assessment_cohorts` — for assisted Team Assessment only: confirm sponsor (`buyer_email`), `seats_purchased`, `public_token`, and `status`.
- `refunded_checkout_sessions` — confirm refunded sessions are recorded before re-running provisioning.
- For an at-a-glance funnel/contact view, see the `/admin/funnel` page and the
  derived views in [funnel reporting](funnel-reporting.md).

### Resend
- Search the buyer email.
- Confirm the purchase email delivered or bounced.
- If bounced, use the access-link recovery macro below and record the failure for follow-up.

## Macros

### Missing purchase email
> **Subject:** Your access link
>
> Hi,
>
> I found your purchase and resent the access path for the same email address
> used at checkout. Open the newest message from The AI Banking Institute and
> use the one-click link.
>
> If your bank gateway blocks the email, reply here and we will give you a
> fallback sign-in path.

### Failed access after purchase
> **Subject:** Access check
>
> Hi,
>
> We found the payment and are checking the enrollment record now. Please
> confirm the email address used at checkout and the page you were trying to
> open.
>
> We will either restore access or refund the purchase if we cannot resolve it.

### Refund request
> **Subject:** Refund request received
>
> Hi,
>
> We received your refund request. The 7-day refund applies when the assessment
> has not been submitted, fewer than two Foundation modules have been completed,
> and no certificate has been issued. Duplicate purchases and unresolved access
> failures are also refundable.
>
> We will confirm eligibility in Stripe and the enrollment record, then reply
> with the outcome.

### Institution seats
> **Subject:** Institution seat request
>
> Hi,
>
> Thanks for the institution seat request. Before we quote or invoice, we need
> headcount, sponsor email, target launch date, whether SSO is required, and who
> will own learner support.
>
> Once those are clear, we can scope pricing, enrollment handoff, and reporting.

## Alert expectations

> **Status: pending.** The ops-alert path below (`OPS_ALERT_WEBHOOK_URL` /
> `OPS_ALERT_EMAIL`, `POST /api/ops/alert-test`) is in active development and is
> **not yet on `main`**. Treat this section as the intended runbook once that
> change ships and the Vercel env destination is configured. Until then, watch
> Stripe's webhook delivery log and Resend's send log directly.

When live: `/api/webhooks/stripe` sends ops alerts for non-2xx webhook outcomes
and failed purchase-email sends when `OPS_ALERT_WEBHOOK_URL` or
`OPS_ALERT_EMAIL` is configured. Check this runbook after every alert before
manually changing access.

Before paid promotion, verify the alert path without breaking Stripe:

```bash
curl -X POST https://www.aibankinginstitute.com/api/ops/alert-test \
  -H "Authorization: Bearer $CRON_SECRET"
```

Expected response: `{"ok":true,"channel":"webhook"}` or
`{"ok":true,"channel":"email"}`. Then confirm the configured channel or inbox
received the synthetic alert.
