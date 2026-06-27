# Admin User Guide

Reviewed against the codebase on June 25, 2026.

This guide is for the site administrator or operator of The AI Banking Institute. It explains how to manage the site day to day, where the important data lives, how resources are maintained, how course work is governed, and which systems are authoritative for money, access, email, and learner records.

Scope: this guide is based on the local repository and existing operational docs. It does not include a live production data audit or an authenticated walkthrough of the production admin UI.

The site does not currently have a full in-browser content management system. Most operational work happens in the admin pages, Supabase, Stripe, Resend, MailerLite, Vercel, and this repository.

## 1. Site Map For Admins

### Public product paths

| Area | Route | Purpose |
| --- | --- | --- |
| Home | `/` | Main public entry point |
| Free assessment | `/assessment` | Public 12-question readiness assessment |
| In-Depth Assessment | `/assessment/in-depth` | Paid 48-question assessment |
| In-Depth purchase return | `/assessment/in-depth/purchased` | Stripe success return |
| Foundation course landing | `/courses/foundation` | Public course sales/overview page |
| Foundation purchase | `/courses/foundation/program/purchase` | Stripe checkout entry |
| Foundation purchase return | `/courses/foundation/program/purchased` | Stripe success return |
| Foundation course app | `/courses/foundation/program` | Authenticated learner area |
| Resource library | `/resources` | Free and gated resource library |
| Resource templates | `/resources/templates/[slug]` | Browser-rendered templates |
| Certificate verification | `/verify/[certificateId]` | Public certificate lookup |
| Purchase support | `/support/purchase-help` | Public buyer help intake |
| Team assessment | `/team-assessment` | Team assessment entry point. Keep self-serve gated until hardened. |

### Admin paths

| Area | Route | Who can access | What it is for |
| --- | --- | --- | --- |
| Operator dashboard | `/admin` | Support admins with trusted device | Launch counters, support summary, buyer lookup, funnel summary if also funnel admin |
| Funnel dashboard | `/admin/funnel` | Funnel admins | Known-contact funnel reporting, stage distribution, resource download reporting |
| Support queue | `/admin/support` | Support admins with trusted device | Case queue, support metrics, SLA triage |
| Buyer search | `/admin/support/search` | Support admins with trusted device | Search by buyer email or Stripe Checkout Session ID |
| Case detail | `/admin/support/cases/[caseId]` | Support admins with trusted device | Case timeline, status, notes, access email, refund workflow notes |
| Toolbox usage | `/admin/toolbox-usage` | Funnel admins | Public AI playground usage, cost, rate limits, error monitoring |
| Support CSV | `/admin/support/export.csv?range=30d` | Support admins with trusted device | Support export for 7, 30, or 90 day ranges |

There is no current `/admin/reviewer` queue. The current Foundation final packet flow auto-approves once the learner has completed all modules and submitted the required final packet.

## 2. Admin Access

Admin access is intentionally fail-closed.

### Required access pieces

1. A real Supabase auth session.
2. The admin email must be listed in the correct environment variable.
3. Support admin pages require a trusted device confirmation.

| Admin function | Environment variable |
| --- | --- |
| Funnel dashboard and toolbox usage | `FUNNEL_ADMIN_EMAILS` |
| Support queue, buyer search, support export, operator dashboard | `ADMIN_SUPPORT_EMAILS` |

Emails are canonicalized before comparison. The app does not allow preview bypass for admin pages that expose paid buyer or PII data.

### Login flow

1. Visit `/admin`.
2. If not signed in, the app redirects to `/auth/login?next=/admin`.
3. Sign in with the admin email.
4. For support admin tools, complete trusted device confirmation if prompted.
5. If the email is not allowlisted, the route returns a 404 instead of exposing admin details.

### Adding or removing an admin

1. Update the relevant environment variable in the production hosting environment.
2. Redeploy or restart the app if required by the hosting platform.
3. Have the admin sign in with that exact email.
4. For support access, verify the trusted device step.

Do not set preview or test bypass flags in production. In particular, do not use `PREVIEW_AUTH_BYPASS`, `SKIP_ENROLLMENT_GATE`, `SKIP_CRON_AUTH`, or other local bypass flags in production.

## 3. Daily Operating Routine

### Start of day

1. Open `/admin/support`.
2. Check SLA breaches first.
3. Open all urgent or high-priority cases.
4. Use `/admin/support/search` before replying to any paid buyer.
5. Confirm whether any access, email delivery, webhook, or refund issue needs manual action.

### Midday

1. Recheck `/admin/support` for new paid access or refund cases.
2. Review any ops alerts from Resend, webhook delivery, cron jobs, or stranded-buyer detection.
3. Search buyer records for any case with unclear access state.

### End of business day, Pacific time

1. Resolve or update every urgent paid buyer case.
2. Leave an internal note on cases waiting for Stripe, email provider, or engineering follow-up.
3. Export the support CSV if you need an audit trail for the day.

### Weekly funnel review

1. Open `/admin/funnel`.
2. Record scorecard totals and stage distribution.
3. Separate known-contact funnel metrics from anonymous download popularity.
4. Identify one action for the next week: improve a resource, adjust an email nurture, fix a page drop-off, or follow up with buyers.

### After launches, promotions, or email sends

1. Watch `/admin/support` for purchase and access failures.
2. Watch `/admin/funnel` for resource and assessment movement.
3. Watch `/admin/toolbox-usage` for public AI playground cost, errors, rate limits, and abuse.
4. Check Stripe webhooks for failures.
5. Check Resend for transactional email failures.

## 4. Managing Support

Support administration is the most complete admin workflow in the app.

### Support queue

Use `/admin/support` to manage cases. The queue supports filtering by:

- Status
- Category
- Priority
- Search query

Important metrics on the page include:

- Open cases
- SLA breaches
- First response timing
- Resolution timing
- Paid total
- Cases per 10 purchases
- Pending refunds
- Access rescues

### Support statuses

| Status | Meaning |
| --- | --- |
| `new` | New case, no operator response yet |
| `open` | Active operator work |
| `waiting_customer` | Customer needs to reply |
| `waiting_internal` | Waiting on Stripe, email provider, engineering, or manual review |
| `resolved` | Solved without refund |
| `refunded` | Refund completed or recorded |
| `closed_no_action` | No support action required |

### Support categories

| Category | Use when |
| --- | --- |
| `access` | Buyer cannot access paid product |
| `missing_email` | Purchase, magic link, report, or certificate email missing |
| `refund_request` | Buyer asks for refund |
| `failed_payment` | Payment failed or unclear charge state |
| `provisioning_failure` | Stripe completed but enrollment/access did not provision |
| `email_failure` | Resend or MailerLite delivery issue |
| `webhook_error` | Stripe webhook failed or was delayed |
| `team_seats` | Team or institution seat issue |
| `ops_alert` | Internal alert-generated case |
| `other` | Anything else |

### Buyer search

Use `/admin/support/search` for every paid support case. Search by:

- Buyer email
- Stripe Checkout Session ID

The buyer snapshot can show:

- Paid enrollments
- Active entitlements
- Certificates
- Team cohorts
- Purchases and refund eligibility
- Stripe links
- Saved prompts
- Artifacts
- Activity responses
- Refunded sessions
- Profile and work-state warnings

### Case detail page

Use `/admin/support/cases/[caseId]` to:

- Change status and priority
- Add internal timeline notes
- Send an access email
- Record refund approval
- Record refund denial
- Record a manual refund after you complete it in Stripe

The app records the support workflow. It does not issue Stripe refunds itself.

### Access rescue workflow

1. Open the case.
2. Search the buyer by email or Stripe session.
3. Confirm payment and enrollment state.
4. Click "Send access email" from the case action panel.
5. Verify that the timeline records the event.
6. Reply to the buyer from the support inbox.

If the access email still fails, use the buyer search details to decide whether the problem is auth, email delivery, entitlement provisioning, or a payment/webhook issue.

### Refund workflow

1. Open the case.
2. Search the buyer record.
3. Check refund eligibility.
4. If approved, issue the refund manually in Stripe.
5. Return to the case and record the manual refund.
6. Reply to the buyer.

Current policy checks include:

- Refund window
- Whether the assessment was submitted
- Number of completed modules
- Whether a certificate was issued
- Duplicate purchase state
- Unresolved access failures

Full Stripe refunds revoke access through the webhook flow. Partial refunds retain access.

## 5. Managing Resources

The resource library is source-controlled. The admin dashboard reports resource usage, but it does not edit resources.

### Where resource files live

| Purpose | Location |
| --- | --- |
| Resource manifest | `src/lib/resources/freeResources.manifest.json` |
| Manifest accessor and validation | `src/lib/resources/freeResources.ts` |
| Public resource page presentation data | `src/app/resources/data.ts` |
| Download catalog | `src/lib/resources/downloadCatalog.ts` |
| Resource KPI labels and categories | `src/lib/resources/resourceMeta.ts` |
| Downloadable files | `public/downloads` |
| Source HTML for Word-style documents | `public/downloads/source` |
| Large print PDFs | `public/downloads/large-print` |
| Static markdown artifacts | `public/artifacts` |
| Template index | `src/app/resources/templates/templateIndex.ts` |
| Template body data | `src/app/resources/templates/data.ts` |
| Role playbook presentation data | `src/app/playbooks/data.ts` |

### How downloads work

Most download links go through:

`/api/resources/[slug]/download`

The download API:

1. Looks up the resource by slug.
2. Checks whether the resource is free, email-gated, paid, planned, archived, or source-only.
3. Checks authentication and active entitlement for gated paid resources.
4. Creates a signed Supabase Storage URL when storage is configured.
5. Falls back to `public/downloads` for free resources if storage is unavailable.
6. Logs the download to `resource_downloads`.

For paid resources, storage must be available. Paid downloads should not fall back to public files.

### Resource gate policies

| Gate policy | Meaning |
| --- | --- |
| `free` | Public download |
| `free-email-gated` | Public, but email attribution can be captured |
| `paid-entitlement` | Requires logged-in user with active entitlement |
| `planned` | Not downloadable yet |
| `source-only` | Internal source material only |

### Resource statuses

| Status | Meaning |
| --- | --- |
| `public` | Visible and active |
| `planned` | Future item |
| `archived` | Kept for history, not promoted |

### Adding a normal downloadable resource

1. Add the file to `public/downloads`.
2. Add or update the manifest entry in `src/lib/resources/freeResources.manifest.json`.
3. Set `slug`, `title`, `description`, `category`, `status`, `gatePolicy`, `tierRequired`, `download`, `canonicalRoute`, and `visibleSurfaces`.
4. If the resource belongs in a starter kit or bundle, set `zipMembership`.
5. Add presentation metadata in `src/app/resources/data.ts` if it needs a card, kit placement, role placement, or custom callout.
6. Add labels or category metadata in `src/lib/resources/resourceMeta.ts` if the funnel dashboard should display friendly names.
7. If Supabase Storage is the production source, upload the file to the private `resources` bucket and ensure the `resources` table row points to it.
8. Run the resource audit.

Recommended checks:

```bash
npm run audit:resources
npm test -- src/lib/resources/freeResources.test.ts src/app/resources/data.test.ts
```

### Adding a browser-rendered template

1. Add the slug to `TemplateSlug` and `TEMPLATE_INDEX` in `src/app/resources/templates/templateIndex.ts`.
2. Add the full template body to `src/app/resources/templates/data.ts`.
3. Add the resource manifest entry.
4. Add the public presentation data in `src/app/resources/data.ts`.
5. Verify the template page at `/resources/templates/[slug]`.
6. Verify the Word export route if applicable:

`/api/resources/templates/[slug]/word`

### Adding a role playbook

1. Add the playbook resource to the manifest with a slug ending in `-playbook`.
2. Add or update role presentation data in `src/app/playbooks/data.ts`.
3. Confirm that the route and resource card use the expected role, title, and category.
4. Run the resource audit and the resource page tests.

### Removing or hiding a resource

Prefer changing status instead of deleting history.

1. Set `status` to `archived` or `planned`.
2. Remove the surface from `visibleSurfaces` if it should disappear from the library.
3. Keep old files if they are referenced by previous emails, support cases, or analytics.
4. Do not delete `resource_downloads` rows. They are historical reporting data.

### Reading resource metrics

Use `/admin/funnel`.

There are two different kinds of resource metrics:

- Known-contact scorecard metrics: better for lead quality.
- Raw download popularity metrics: useful for seeing what content attracts clicks, but includes anonymous, repeat, test, and seed traffic.

Do not treat raw download totals as qualified leads.

### Troubleshooting resource downloads

| Symptom | Check |
| --- | --- |
| Free download fails | Confirm manifest path and file in `public/downloads` |
| Paid download fails | Confirm active entitlement and Supabase Storage object |
| Download logs missing | Confirm service-role key and `resource_downloads` table access |
| Wrong card text | Check `src/app/resources/data.ts` |
| Wrong funnel label | Check `src/lib/resources/resourceMeta.ts` |
| Template export broken | Check `src/app/resources/templates/data.ts` and route-specific Word export |

## 6. Managing Course Work

The Foundation course is managed through code and database records. There is no admin course editor in the app today.

### Current Foundation product

| Item | Current value |
| --- | --- |
| Public course | Foundation |
| Public designation | `AiBI-Foundation` |
| Current module count | 18 micro-modules |
| Individual price | $295 |
| Institution seat price | $199 per seat, minimum 10, assisted/deferred |
| Legacy DB product key | `aibi-p` |
| Canonical product key | `foundation` |

Current public and admin docs should say 18 modules. Historical planning or review files may mention older 9-module or 12-module versions only as archive context.

### Course content source files

| Purpose | Location |
| --- | --- |
| Course configuration | `content/courses/foundation-program/course-config.ts` |
| Module list builder | `content/courses/foundation-program/modules.ts` |
| Micro-module authoring source | `content/courses/foundation-program/micro-modules.ts` |
| Apply activities and artifact templates | `content/courses/foundation-program/module-activities.ts` |
| Prompt library authoring source | `content/courses/foundation-program/prompt-library.ts` |
| Practice and certificate requirements | `content/practice-reps/foundation-program.ts` |
| Course app routes | `src/app/courses/foundation/program` |

### What each module contains

Each micro-module can define:

- Module number
- ID and title
- Pillar
- Estimated minutes
- Key output
- Mission
- Plain-language concept
- Banking guardrail
- Guidance source
- Try task
- Build task
- Save-artifact prompt
- Visual model
- Review checklist
- Quality signals
- Weak and strong examples
- Transfer move
- Proof to save
- Reference

### Course access flow

1. Buyer purchases through Stripe.
2. Stripe webhook receives `checkout.session.completed`.
3. The app provisions a `course_enrollments` row.
4. Entitlements are synchronized.
5. Buyer receives a purchase/access email.
6. Learner signs in.
7. Learner completes onboarding if `onboarding_answers` is empty.
8. Learner starts module 1.

The course layout blocks access unless the user has:

- A Supabase auth session
- Trusted device where required
- A valid enrollment
- Completed onboarding

### Learner progress

Learner progress is sequential.

- Module 1 is always available to an enrolled learner.
- Module N requires all previous modules to be complete.
- Saving progress appends the module number to `completed_modules`.
- The app advances `current_module` until the final module.

Important API routes:

| Route | Purpose |
| --- | --- |
| `POST /api/courses/save-onboarding` | Save onboarding answers |
| `POST /api/courses/submit-activity` | Save module Apply activity |
| `GET /api/courses/activity-response` | Read saved activity response |
| `POST /api/courses/save-progress` | Mark current module complete |
| `GET /api/courses/generate-module-artifact?module=N` | Generate learner artifact markdown |
| `POST /api/courses/save-post-assessment` | Save post-course assessment |
| `POST /api/courses/submit-work-product` | Submit final work packet |
| `POST /api/courses/generate-certificate` | Generate certificate PDF |

### Activity responses and artifacts

Each module has an Apply activity. The app validates required fields and minimum lengths before inserting into `activity_responses`.

When an activity has an artifact ID, the app also writes to `user_artifacts`.

Module artifact downloads are generated from the saved response plus the artifact template. They are returned as `.md` files.

### Final packet and certification

Current behavior:

1. Learner must complete all modules.
2. Learner submits the final work packet.
3. The app validates required fields and optional uploaded work product path.
4. The submission is auto-approved.
5. The app issues a certificate.
6. Learner can download the certificate.
7. Public verification works at `/verify/[certificateId]`.

There is no active human reviewer queue in the current code. If you later want human review, scope it as a new feature with reviewer roles, queue states, SLA rules, certificate gating, and audit history.

### Updating a course module

1. Edit the micro-module source in `content/courses/foundation-program/micro-modules.ts`.
2. If the activity changes, edit `content/courses/foundation-program/module-activities.ts`.
3. If prompt-library content changes, edit `content/courses/foundation-program/prompt-library.ts`.
4. If runtime prompt-library records must change, add a Supabase migration for `toolbox_library_skills` or related tables.
5. Run the course schema check.

Recommended checks:

```bash
npm run check:course-schema
npm test -- src/app/courses/foundation/program
```

Adjust the exact test path if the test suite names change.

### Adding or removing modules

Changing module count has database, UI, progress, and certificate implications. Treat it as an engineering change, not a content-only edit.

Before changing module count, check:

- `FOUNDATION_MODULE_COUNT`
- Module definitions
- Activity definitions
- Progress rules
- Tests
- Database constraints on `activity_responses.module_number`
- Existing learner records
- Certificate requirements
- Marketing copy
- Docs and pricing pages

The database has already been migrated for the current 18-module structure. Do not assume old 9-module constraints still match production.

### Unblocking a learner

Use this order:

1. Open `/admin/support/search`.
2. Search by email or Stripe session.
3. Confirm enrollment exists.
4. Confirm entitlement exists.
5. Confirm auth user exists and email matches.
6. Confirm onboarding state.
7. Confirm `current_module` and `completed_modules`.
8. Check `activity_responses` for the blocked module.
9. Send access email if the problem is sign-in.
10. Escalate to a direct Supabase fix only if the admin UI cannot resolve the issue.

Direct database edits should be rare and documented in a support case note.

## 7. Managing Data

Different systems are authoritative for different facts.

### Source-of-truth map

| Data | Authoritative system |
| --- | --- |
| Money, charges, refunds | Stripe |
| User authentication | Supabase Auth |
| Paid enrollment rows | Supabase `course_enrollments` |
| Access rights | Supabase `entitlements` |
| Course progress | Supabase course tables |
| Certificates | Supabase `certificates` plus generated PDF route |
| Public resource catalog | Repository manifest and resource files |
| Resource download history | Supabase `resource_downloads` |
| Support cases | Supabase `support_cases` and `support_case_events` |
| Transactional email | Resend |
| Marketing nurture | MailerLite |
| Traffic analytics | Vercel Analytics or Plausible |
| Cron job configuration | Vercel plus `vercel.json` |
| Environment secrets | Hosting environment |

### Core Supabase tables

| Area | Tables |
| --- | --- |
| Assessments | `user_profiles`, `assessment_drafts`, `team_assessment_cohorts`, `team_assessment_responses` |
| Resources and leads | `resource_downloads`, `resources`, `prompt_card_leads`, `email_capture_log` |
| Course | `course_enrollments`, `institution_enrollments`, `activity_responses`, `work_submissions`, `certificates`, `practice_rep_completions`, `saved_prompts`, `user_artifacts`, `quick_wins` |
| Access | `entitlements`, Supabase `auth.users` |
| Support | `support_cases`, `support_case_events`, `support_intake_log` |
| Payments and refunds | `refunded_checkout_sessions`, Stripe records |
| AI/toolbox | `toolbox_library_skills`, `toolbox_library_skill_versions`, `toolbox_recipes`, `ai_usage_log` |
| Operations | `rate_limits`, `paid_reengagement_events` |

### Data you should not edit casually

Do not casually edit:

- Stripe IDs
- `stripe_session_id`
- Entitlement rows
- Certificate IDs
- Webhook-derived records
- Refund records
- Support timeline events
- Auth user IDs

If data must be corrected, create or update a support case note explaining:

- What was wrong
- What was changed
- Why it was safe
- Which external system was checked first

### Test and internal data exclusions

The funnel/admin dashboards exclude known test data through environment configuration and default patterns.

Important variables:

- `ADMIN_DASHBOARD_EXCLUDED_EMAILS`
- `ADMIN_DASHBOARD_EXCLUDED_EMAIL_PATTERNS`

Default exclusions include test/example domains such as:

- `*@aibankinginstitute.test`
- `*@example.test`
- `*@example.com`

Gmail dot and plus variants are canonicalized for exact exclusions.

### Privacy and PII

The app uses hashed IPs for rate limits and usage logs where possible. Public AI usage logs store hashed IP data, not raw IP addresses.

Operational rules:

- Do not export buyer data unless there is a clear support or audit reason.
- Prefer support CSV exports over ad hoc table dumps.
- Do not paste assessment answers, buyer records, or support timelines into public tools.
- For AI/toolbox monitoring, use the admin page and aggregate logs.
- Keep service-role keys restricted to server environments.

## 8. Payments, Provisioning, And Access

Stripe is authoritative for money. Supabase is authoritative for app access after webhook provisioning.

### Products

| Product | Stripe/API path | Access created |
| --- | --- | --- |
| Free assessment | No Stripe | `user_profiles` assessment data |
| In-Depth Assessment | `/api/checkout/in-depth` | Enrollment and entitlement for `in-depth-assessment` |
| Foundation Course | `/api/create-checkout` | Enrollment and entitlement for `foundation` / legacy `aibi-p` |
| Institution Foundation | Assisted/deferred | `institution_enrollments` when enabled |
| Team Assessment | Assisted or flag-gated | Team cohort records |

### Webhook behavior

Stripe sends events to:

`/api/webhooks/stripe`

Important events:

| Event | Behavior |
| --- | --- |
| `checkout.session.completed` | Provisions enrollment, entitlement, and purchase email |
| `charge.refunded` | Full refunds revoke access; partial refunds retain access |
| `payment_intent.payment_failed` | Logs failure and analytics |
| `payment_intent.succeeded` | Acknowledges successful payment intent |

### Common payment issues

| Problem | Where to check |
| --- | --- |
| Buyer paid but has no access | Stripe session, webhook logs, `/admin/support/search`, `course_enrollments`, `entitlements` |
| Buyer did not get email | Resend logs, support case timeline, send access email action |
| Duplicate purchase | Stripe customer/session history, buyer search, support case |
| Refund request | Buyer search refund panel, Stripe dashboard, support case |
| Access remains after full refund | Stripe webhook delivery, `refunded_checkout_sessions`, `course_enrollments`, `entitlements` |

## 9. Email, Automations, And Cron Jobs

### Email systems

| System | Purpose |
| --- | --- |
| Resend | Transactional email: purchases, access, assessment results, certificates, support replies/acks, paid reengagement |
| MailerLite | Marketing and nurture sequences |

Transactional email should not depend on marketing opt-in. Marketing/nurture email should respect opt-in and MailerLite list state.

### MailerLite state

The code can subscribe/update contacts and fields, but automation email bodies may still require manual setup inside MailerLite. Confirm the MailerLite automations are enabled before depending on them for launch.

### Cron jobs

Configured in `vercel.json`:

| Route | Schedule | Purpose |
| --- | --- | --- |
| `/api/assessment/pdf/cron-cleanup` | Daily | Clean generated assessment PDFs |
| `/api/cron/cleanup-rate-limits` | Daily | Remove old rate-limit rows |
| `/api/cron/stranded-buyers` | Daily | Find paid buyers who did not complete access |
| `/api/cron/assessment-abandoned` | Daily | Send assessment resume reminders |
| `/api/cron/paid-reengagement` | Daily | Send transactional paid learner reminders |

Cron routes require:

`Authorization: Bearer $CRON_SECRET`

Do not disable cron authentication in production.

### Ops alert test

Use this after changing alert environment variables:

```bash
curl -X POST https://www.aibankinginstitute.com/api/ops/alert-test \
  -H "Authorization: Bearer $CRON_SECRET"
```

Expected response:

```json
{"ok":true,"channel":"webhook"}
```

The channel may be email if webhook alerts are not configured.

## 10. Toolbox And AI Usage

There are two AI usage surfaces:

| Surface | Route/API | Access |
| --- | --- | --- |
| Public playground | `/api/playground/run` | Public, rate-limited |
| Paid toolbox/course AI | `/api/toolbox/run`, `/api/sandbox/chat` | Requires paid entitlement |

Use `/admin/toolbox-usage` to monitor public playground usage. It shows:

- Calls
- Successes
- Rate limits
- Errors
- Unique IP hashes
- Cost
- Token usage
- Top IP hashes
- Daily trends
- Recent rows

Watch for:

- Sudden cost spikes
- Repeated errors
- Many requests from one IP hash
- Rate-limit pressure
- PII flags

Important environment variable:

`TOOLBOX_IP_HASH_SALT`

Keep it stable and secret. Rotating it changes the meaning of historical IP hashes.

## 11. Team And Institution Workflows

Institution and team workflows exist in the codebase, but self-serve team checkout should remain off until the hardening work is complete.

Important flag:

`ENABLE_TEAM_ASSESSMENT_SELF_SERVE_CHECKOUT`

Keep this off in production unless the team assessment self-serve flow has been deliberately launched.

Team assessment data lives separately from individual assessment profiles so team reports do not overwrite individual user history.

Important tables:

- `team_assessment_cohorts`
- `team_assessment_responses`

Institution Foundation purchases use:

- `institution_enrollments`

## 12. Environment Variables To Know

Core production variables include:

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Public Supabase browser key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only privileged Supabase key |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |
| `STRIPE_FOUNDATION_PRICE_ID` | Foundation individual price |
| `STRIPE_INDEPTH_PRICE_ID` | In-Depth Assessment price |
| `RESEND_API_KEY` | Transactional email |
| `MAILERLITE_API_KEY` | Marketing email |
| `ANTHROPIC_API_KEY` | AI/toolbox provider key |
| `CRON_SECRET` | Cron route authorization |
| `TOOLBOX_IP_HASH_SALT` | IP hash salt for toolbox logs |
| `ADMIN_SUPPORT_EMAILS` | Support admin allowlist |
| `FUNNEL_ADMIN_EMAILS` | Funnel admin allowlist |
| `OPS_ALERT_WEBHOOK_URL` | Ops alert webhook |
| `OPS_ALERT_EMAIL` | Ops alert email fallback |

Important spelling:

Use `STRIPE_INDEPTH_PRICE_ID`, not `STRIPE_IN_DEPTH_PRICE_ID`.

## 13. Deployment And Release Checklist

Before deploying admin, resource, course, payment, or email changes:

1. Confirm the worktree changes are intentional.
2. Run relevant tests.
3. Run environment audit if env vars changed.
4. Run resource audit if resources changed.
5. Run course schema check if course content changed.
6. Deploy to preview.
7. Smoke-test critical routes.
8. Deploy to production.
9. Check Stripe webhook delivery if payments were touched.
10. Check Resend if transactional email was touched.
11. Check `/admin/support` and `/admin/funnel` after deployment.

Useful commands:

```bash
npm run audit:env
npm run audit:env:production
npm run audit:secrets
npm run audit:resources
npm run check:course-schema
npm test
npm run build
```

## 14. Troubleshooting Guide

### Buyer paid but cannot access Foundation

1. Search buyer in `/admin/support/search`.
2. Check Stripe session status.
3. Check `course_enrollments`.
4. Check `entitlements`.
5. Check Supabase auth user.
6. Send access email from the case page.
7. If no enrollment exists, check Stripe webhook delivery.
8. If webhook failed, replay from Stripe after confirming the code/environment issue is fixed.

### Learner is stuck on a module

1. Search buyer in `/admin/support/search`.
2. Confirm `current_module`.
3. Confirm all previous modules are in `completed_modules`.
4. Check whether the current module activity response exists.
5. Confirm the learner is not blocked by onboarding.
6. Document any manual correction in a support case.

### Certificate missing

1. Confirm all modules are complete.
2. Confirm final packet submission exists in `work_submissions`.
3. Confirm `review_status` is approved.
4. Check `certificates` for existing row.
5. Check Resend for certificate email.
6. Have learner revisit the certificate page or use the certificate API after approval state is correct.

### Resource link fails

1. Check the resource manifest slug.
2. Check the file path in `public/downloads` or Supabase Storage.
3. Check gate policy and required entitlement.
4. Check whether the resource is `planned` or `archived`.
5. Check server logs for signed URL or storage errors.

### Funnel numbers look wrong

1. Confirm test data exclusions.
2. Separate known-contact scorecard metrics from raw resource download totals.
3. Check whether the contact used a plus-address or alternate email.
4. Confirm the source event exists in the relevant table.
5. Check whether the views/migrations are applied in production.

### Admin cannot log in

1. Confirm the email is in the correct allowlist variable.
2. Confirm they are using the same email in Supabase auth.
3. Confirm production env vars are deployed.
4. For support pages, complete trusted device confirmation.
5. Check whether they need both `ADMIN_SUPPORT_EMAILS` and `FUNNEL_ADMIN_EMAILS`.

## 15. Resolved Notes And Operating Boundaries

The stale admin references found during this review have been corrected in the current README and code comments:

1. `/admin/reviewer` is no longer documented as an available admin route.
2. `REVIEWER_EMAILS` is no longer documented as an admin environment variable.
3. A stale "9-module course map" code comment has been updated to match the current 18-module Foundation course.

The remaining items are operating boundaries to manage intentionally, not runtime bugs:

1. **Resources:** there is no browser CMS. Manage resources through the manifest, files, tests, and deployment workflow described in section 5. Add a CMS only after defining versioning, approval, entitlement, and audit requirements.
2. **Course content:** there is no browser course editor. Manage modules, activities, prompts, and artifact templates through the course source files described in section 6. Add an editor only after defining author roles, schema validation, preview, rollback, and learner-impact rules.
3. **Foundation certification:** final packet submission currently auto-approves after all modules are complete. If human review becomes a product requirement, treat it as a new reviewed-certification feature, not a small admin toggle.
4. **Refunds:** the app should continue to record refund decisions and support history, while Stripe remains the system that moves money.
5. **Team assessment self-serve:** keep `ENABLE_TEAM_ASSESSMENT_SELF_SERVE_CHECKOUT` off until production-like cohort QA and owner approval are complete.
6. **MailerLite:** treat automation body setup as an external launch checklist item. The app can sync contacts and fields, but MailerLite email-body editing still belongs in the MailerLite dashboard unless a future API-supported authoring flow is built.

## 16. Quick Reference

### Best admin pages

| Need | Use |
| --- | --- |
| See launch state | `/admin` |
| Triage buyer issues | `/admin/support` |
| Search a buyer | `/admin/support/search` |
| Work a case | `/admin/support/cases/[caseId]` |
| Read funnel state | `/admin/funnel` |
| Monitor public AI usage | `/admin/toolbox-usage` |
| Export support cases | `/admin/support/export.csv?range=30d` |

### Best external systems

| Need | Use |
| --- | --- |
| Refund or inspect payment | Stripe |
| Inspect database record | Supabase |
| Inspect sign-in user | Supabase Auth |
| Inspect transactional email | Resend |
| Inspect marketing automation | MailerLite |
| Inspect deploy/env/cron | Vercel |
| Inspect anonymous traffic | Vercel Analytics or Plausible |

### Best repository files

| Need | File |
| --- | --- |
| Resource catalog | `src/lib/resources/freeResources.manifest.json` |
| Resource page content | `src/app/resources/data.ts` |
| Template content | `src/app/resources/templates/data.ts` |
| Course modules | `content/courses/foundation-program/micro-modules.ts` |
| Course activities | `content/courses/foundation-program/module-activities.ts` |
| Course config | `content/courses/foundation-program/course-config.ts` |
| Prompt library source | `content/courses/foundation-program/prompt-library.ts` |
| Environment docs | `docs/env-vars.md` |
| Funnel reporting docs | `docs/funnel-reporting.md` |
| Support runbook | `docs/paid-buyer-support-runbook.md` |
| Stripe product docs | `docs/stripe-products.md` |
