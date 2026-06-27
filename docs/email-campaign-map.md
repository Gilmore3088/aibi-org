# Email Campaign Map

Reviewed against the codebase on June 25, 2026.

This map separates **transactional email** from **MailerLite marketing automation**. That distinction matters because a visitor can be captured in MailerLite without any email going out if the matching MailerLite automation is incomplete, disabled, or not attached to the group they joined.

## Short Answer For Today's Missed Email

If someone "signed up for email" today and nothing went out, the most likely cause is one of these:

1. **They joined a MailerLite group, but the relevant MailerLite automation is not enabled.**
   The launch docs say all four assessment automations existed but were still `enabled: false` and `complete: false`.

2. **They used a lead form that only captures the email and does not send a transactional email.**
   Example: the prompt-card lead form subscribes the person to MailerLite and stores a lead row, but it does not send a Resend email.

3. **They completed the free assessment without marketing opt-in.**
   In that case, the app should still send the immediate Resend assessment-results email, but it will not add them to the MailerLite nurture sequence.

4. **They used a resource/research-library gate where the requested artifact did not resolve to a deliverable resource.**
   The app subscribes them to the assessment group, but the resource-delivery email only sends when the artifact slug resolves.

## Systems

| System | What it does | Admin surface |
| --- | --- | --- |
| Resend | Immediate transactional emails: results, downloads, purchases, support, certificate, reminders | Resend dashboard and Vercel logs |
| MailerLite | Marketing/nurture automations after contacts are added to groups | MailerLite dashboard |
| Supabase | Stores profiles, leads, support, enrollments, certificates | Supabase dashboard and app admin pages |
| Vercel | Runtime logs and environment variables | Vercel dashboard |

## MailerLite Groups

| Group/env var | Who gets added | What should happen |
| --- | --- | --- |
| `MAILERLITE_GROUP_ID_ASSESSMENT` | General assessment/resource/prompt-card leads | Base list membership. No guaranteed email unless an automation is attached to this group. |
| `MAILERLITE_GROUP_ID_STARTING_POINT` | Free-assessment completers with tier `starting-point` and marketing opt-in | Starts Starting Point 3-email automation if enabled. |
| `MAILERLITE_GROUP_ID_EARLY_STAGE` | Free-assessment completers with tier `early-stage` and marketing opt-in | Starts Early Stage 3-email automation if enabled. |
| `MAILERLITE_GROUP_ID_BUILDING_MOMENTUM` | Free-assessment completers with tier `building-momentum` and marketing opt-in | Starts Building Momentum 3-email automation if enabled. |
| `MAILERLITE_GROUP_ID_READY_TO_SCALE` | Free-assessment completers with tier `ready-to-scale` and marketing opt-in | Starts Ready to Scale 3-email automation if enabled. |
| `MAILERLITE_GROUP_ID_PLAYBOOK` | Role playbook requesters | Segmentation list for playbook leads. No campaign is documented as live by default. |

MailerLite calls are best-effort. If the API key or group ID is missing, the app skips the MailerLite side effect instead of failing the signup.

## MailerLite Assessment Nurture Automations

These are the 12 emails in `docs/mailerlite-emails/`.

| Automation | Trigger group | Day | Subject | Source file |
| --- | --- | --- | --- | --- |
| AiBI Assessment - Starting Point | `MAILERLITE_GROUP_ID_STARTING_POINT` | Day 0 | Your assessment result: Starting Point | `docs/mailerlite-emails/01-starting-point-day0.html` |
| AiBI Assessment - Starting Point | `MAILERLITE_GROUP_ID_STARTING_POINT` | Day 3 | A 60-minute pilot you can run this week | `docs/mailerlite-emails/02-starting-point-day3.html` |
| AiBI Assessment - Starting Point | `MAILERLITE_GROUP_ID_STARTING_POINT` | Day 7 | Three board-ready AI numbers | `docs/mailerlite-emails/03-starting-point-day7.html` |
| AiBI Assessment - Early Stage | `MAILERLITE_GROUP_ID_EARLY_STAGE` | Day 0 | Your assessment result: Early Stage | `docs/mailerlite-emails/04-early-stage-day0.html` |
| AiBI Assessment - Early Stage | `MAILERLITE_GROUP_ID_EARLY_STAGE` | Day 3 | The one-page AI governance memo | `docs/mailerlite-emails/05-early-stage-day3.html` |
| AiBI Assessment - Early Stage | `MAILERLITE_GROUP_ID_EARLY_STAGE` | Day 7 | From Early Stage to Building Momentum: the 90-day arc | `docs/mailerlite-emails/06-early-stage-day7.html` |
| AiBI Assessment - Building Momentum | `MAILERLITE_GROUP_ID_BUILDING_MOMENTUM` | Day 0 | Your assessment result: Building Momentum | `docs/mailerlite-emails/07-building-momentum-day0.html` |
| AiBI Assessment - Building Momentum | `MAILERLITE_GROUP_ID_BUILDING_MOMENTUM` | Day 3 | The three rungs of the AI capability ladder | `docs/mailerlite-emails/08-building-momentum-day3.html` |
| AiBI Assessment - Building Momentum | `MAILERLITE_GROUP_ID_BUILDING_MOMENTUM` | Day 7 | The habits of Ready to Scale | `docs/mailerlite-emails/09-building-momentum-day7.html` |
| AiBI Assessment - Ready to Scale | `MAILERLITE_GROUP_ID_READY_TO_SCALE` | Day 0 | Your assessment result: Ready to Scale | `docs/mailerlite-emails/10-ready-to-scale-day0.html` |
| AiBI Assessment - Ready to Scale | `MAILERLITE_GROUP_ID_READY_TO_SCALE` | Day 3 | The institution-wide credential program | `docs/mailerlite-emails/11-ready-to-scale-day3.html` |
| AiBI Assessment - Ready to Scale | `MAILERLITE_GROUP_ID_READY_TO_SCALE` | Day 7 | A standing invitation: Leadership Advisory | `docs/mailerlite-emails/12-ready-to-scale-day7.html` |

Required MailerLite state before relying on these:

1. All four automations exist.
2. All four are complete.
3. All four are enabled.
4. Each automation has 3 email steps.
5. Each automation trigger is "subscriber joins group" for the matching tier group.
6. The sending domain is authenticated.
7. One seed test per tier confirms `{$score}` and `{$profile_id}` resolve.

## Signup Path Map

### 1. Free assessment email gate

| Item | Behavior |
| --- | --- |
| API | `POST /api/capture-email` with score, tier, answers, and dimension breakdown |
| Immediate Resend email | Yes, when `version` is `v2` or `v3` and `dimensionBreakdown` is present |
| Resend subject | `Your AI readiness score - [Tier Label]` |
| MailerLite base group | Yes, only when `marketingOptIn === true` |
| MailerLite tier group | Yes, only when `marketingOptIn === true` and tier is valid |
| MailerLite campaign email | Only if the matching tier automation is complete and enabled |

If this person completed the free assessment and did not receive the Resend results email, check Resend and Vercel logs first.

### 2. Research/resource email gate

| Item | Behavior |
| --- | --- |
| API | `POST /api/capture-email` without score, with `lead_source` and optional `requested_artifact` |
| Immediate Resend email | Yes, but only if `requested_artifact` resolves to a deliverable free resource |
| Resend subject | `Your download: [Resource Title]` |
| MailerLite base group | Yes |
| MailerLite tier group | No |
| MailerLite campaign email | Not guaranteed. This path does not enter a tier automation. |

If this person only entered an email to unlock a general resource and no deliverable was resolved, no email would go out.

### 3. Prompt-card lead form

| Item | Behavior |
| --- | --- |
| API | `POST /api/prompt-cards/lead` |
| Immediate Resend email | No |
| Supabase row | Yes, `prompt_card_leads` |
| MailerLite base group | Yes |
| MailerLite tier group | No |
| MailerLite campaign email | Not guaranteed. This path does not enter a tier automation. |

If today's person used the prompt-card form, your direct email was necessary under the current behavior.

### 4. Inquiry form

| Inquiry type | Immediate email to visitor | MailerLite |
| --- | --- | --- |
| `guide-request` | Resource delivery via Resend | No playbook group |
| `playbook-request` | Resource delivery via Resend | Adds to playbook group |
| `certification-inquiry` | Inquiry acknowledgement via Resend | No |
| `briefing-request` | Inquiry acknowledgement via Resend | No |
| `partner-rollout-request` | Inquiry acknowledgement via Resend and support case | No |
| `cohort-pilot-request` | Inquiry acknowledgement via Resend and support case | No |
| `project-plan-request` | Inquiry acknowledgement via Resend and support case | No |
| `team-rollout-request` | Inquiry acknowledgement via Resend and support case | No |
| `team-assessment-request` | Inquiry acknowledgement via Resend and support case | No |
| `foundation-seats-request` | Inquiry acknowledgement via Resend and support case | No |

## Debug Checklist For A Missed Email

Use the visitor email and approximate timestamp.

1. Identify which form they used:
   - Free assessment result gate
   - Resource/research gate
   - Prompt-card lead form
   - Inquiry form
   - Purchase/support flow

2. Check Resend:
   - Look for the visitor email.
   - Look for tags such as `[resend:assessment-results-breakdown]`, `[resend:resource-delivery]`, or `[resend:inquiry-ack]`.
   - If Resend has no record, check Vercel logs for the route.

3. Check Vercel logs:
   - `/api/capture-email`: look for `firing sendAssessmentBreakdown`, `email-send guard rejected`, `resend skip`, or `mailerlite skip`.
   - `/api/prompt-cards/lead`: this route has no Resend send.
   - `/api/inquiry`: look for `resource delivery skip` or `resend skip`.

4. Check MailerLite:
   - Confirm the subscriber exists.
   - Confirm which group they joined.
   - If they joined only `MAILERLITE_GROUP_ID_ASSESSMENT`, do not expect a tier nurture email.
   - If they joined a tier group, confirm that exact tier automation is complete and enabled.

5. Check environment:
   - `MAILERLITE_API_KEY`
   - `MAILERLITE_GROUP_ID_ASSESSMENT`
   - `MAILERLITE_GROUP_ID_STARTING_POINT`
   - `MAILERLITE_GROUP_ID_EARLY_STAGE`
   - `MAILERLITE_GROUP_ID_BUILDING_MOMENTUM`
   - `MAILERLITE_GROUP_ID_READY_TO_SCALE`
   - `MAILERLITE_GROUP_ID_PLAYBOOK`
   - `RESEND_API_KEY`
   - `SKIP_MAILERLITE` must not be `true` in production.

## Recommended Fixes Before Launch

1. Finish and enable the four MailerLite tier automations.
2. Decide whether prompt-card leads should receive an immediate Resend email. Current code does not send one.
3. Decide whether general `MAILERLITE_GROUP_ID_ASSESSMENT` should have its own welcome email. Current tier nurture requires tier-specific groups.
4. Add a simple operator habit: after every live signup smoke test, check Resend first, then MailerLite subscriber/group membership.
5. During the first pilot, personally email anyone who signs up through a path that does not yet have an immediate transactional email.

