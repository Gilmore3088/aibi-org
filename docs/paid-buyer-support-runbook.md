# Paid Buyer Support Runbook

Use this for paid launch support until support volume proves a different process is needed.

## Owner and SLA

Owner/inbox: `hello@aibankinginstitute.com`.

V1 queue routine:

1. Check `/admin/support` at start of day, midday, and end of business day Pacific time.
2. Check immediately after any planned promotion, email send, or live smoke test.
3. Triage urgent paid-access, duplicate-purchase, refund, webhook, and failed-email cases first.
4. Use `/admin/support/search` on every paid case before replying.
5. Record the first human response in the case timeline before moving a case to `waiting_customer` or `waiting_internal`.

V1 SLA:

| Case type | First response target |
|---|---|
| Paid access failure or charged-without-access | 4 business hours |
| Refund request | 1 business day |
| Duplicate purchase | 1 business day |
| General purchase question | 1 business day |
| Ops alert for provisioning, email, or webhook failure | Treat as urgent until the timeline explains the outcome |

If the queue shows unresolved charged-without-access cases, pause promotion until the root cause is known.

## Dashboards

1. Support Ops
   - Open `/admin/support`.
   - Confirm the case category, SLA status, buyer snapshot, entitlement state, and refund eligibility.
   - Use "Send access email" for access rescue. Use refund decision buttons to record approve/deny/manual refund notes.
   - Use `/admin/support/search` for lookup by buyer email or Checkout Session id.

2. Stripe
   - Search by buyer email.
   - Confirm payment status, amount, product, Checkout Session id, and refund status.
   - Copy the session id before opening Supabase.
   - Process refunds manually only after the support console eligibility check.

3. Supabase
   - `course_enrollments`: confirm `user_email`, `user_id`, `product`, `stripe_session_id`, and access status.
   - `team_assessment_cohorts`: for assisted Team Assessment only, confirm sponsor email, seats, public token, and status.
   - `refunded_checkout_sessions`: confirm refunded sessions are recorded before re-running provisioning.

4. Resend
   - Search the buyer email.
   - Confirm the purchase email delivered or bounced.
   - If bounced, use the access-link recovery macro below and record the failure for follow-up.

## Intake

Buyer support form: `/support/purchase-help`.

The form creates a support case, emails `hello@aibankinginstitute.com`, and sends a generic acknowledgement to the buyer. It does not reveal whether the email has an account or purchase record.

## Access rescue flow

1. Open the case in `/admin/support`.
2. Confirm buyer email and Stripe Checkout Session id when available.
3. Review buyer snapshot: enrollment, entitlement, purchase, refund, and email state.
4. Click "Send access email".
5. Confirm the timeline shows the access-rescue event.
6. Reply from the support inbox using the missing-purchase-email or failed-access macro.
7. If delivery failed or the bank gateway blocks the message, provide the fallback sign-in path.
8. If access cannot be restored, move to refund eligibility review.

## Refund authority flow

The app does not issue Stripe refunds. The support console records eligibility,
decision, and timeline evidence only.

1. Confirm the request is within policy or qualifies as duplicate purchase / unresolved access failure.
2. Review buyer snapshot blockers: submitted assessment, completed Foundation modules, certificate issued, refunded session, and active entitlement state.
3. Open Stripe from the case or buyer snapshot and confirm payment/refund state.
4. Record `refund approved` or `refund denied` in the case timeline.
5. If approved, issue the money movement manually in Stripe.
6. Return to the support case and click "Record manual refund".
7. Send the buyer a human reply confirming the outcome. The webhook does not send a refund email.
8. Confirm access state after full refunds; partial refunds retain access.

## Macros

### Missing Purchase Email

Subject: Your access link

Hi,

I found your purchase and resent the access path for the same email address used at checkout. Open the newest message from The AI Banking Institute and use the one-click link.

If your bank gateway blocks the email, reply here and we will give you a fallback sign-in path.

### Failed Access After Purchase

Subject: Access check

Hi,

We found the payment and are checking the enrollment record now. Please confirm the email address used at checkout and the page you were trying to open.

We will either restore access or refund the purchase if we cannot resolve it.

### Refund Request

Subject: Refund request received

Hi,

We received your refund request. The 7-day refund applies when the assessment has not been submitted, fewer than two Foundation modules have been completed, and no certificate has been issued. Duplicate purchases and unresolved access failures are also refundable.

We will confirm eligibility in Stripe and the enrollment record, then reply with the outcome.

### Institution Seats

Subject: Institution seat request

Hi,

Thanks for the institution seat request. Before we quote or invoice, we need headcount, sponsor email, target launch date, whether SSO is required, and who will own learner support.

Once those are clear, we can scope pricing, enrollment handoff, and reporting.

## Alert Expectations

`/api/webhooks/stripe` sends ops alerts for non-2xx webhook outcomes and failed purchase-email sends when `OPS_ALERT_WEBHOOK_URL` or `OPS_ALERT_EMAIL` is configured. Alerts also create or update `/admin/support` cases. Check the case before manually changing access.

Before paid promotion, verify the alert path without breaking Stripe:

```bash
curl -X POST https://www.aibankinginstitute.com/api/ops/alert-test \
  -H "Authorization: Bearer $CRON_SECRET"
```

Expected response: `{"ok":true,"channel":"webhook"}` or `{"ok":true,"channel":"email"}`. Then confirm the configured channel or inbox received the synthetic alert.
