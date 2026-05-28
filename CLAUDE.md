# CLAUDE.md — The AI Banking Institute

Project intelligence file for AI-assisted development.

Keep this file operational. It is the control panel, not the whole wiki. Detailed implementation notes belong in linked docs and runbooks.

**Last verified:** 2026-05-27

---

## 1. Session Start Protocol

At the start of every session, before doing any work, ask:

> Which branch should I work on — main or a feature branch?

Then run:

```bash
git worktree list
git status
```

If the working tree is dirty, stop and tell the user what is uncommitted before making changes. Never silently carry dirty changes forward.

Before non-trivial work, read:

```md
Plans/aibi-launch-spec-v2.md
```

If the request conflicts with the launch spec or `DECISIONS.md`, flag it before coding.

Bias toward action after checking the premise. Do not ask unnecessary questions when the next safe step is obvious. Ask the user only when a decision affects scope, risk, production, money, data, or direction.

---

## 2. Non-Negotiable Rules

### Never delete external resources without explicit approval

Never delete, drop, destroy, reset, recreate, or replace external resources without explicit user approval.

This includes:

* Supabase projects, branches, schemas, tables, buckets, policies, auth settings, or data
* Vercel projects, deployments, domains, or environment variables
* Stripe products, prices, checkout flows, webhook endpoints, or customer/payment data
* MailerLite groups, automations, contacts, sequences, or fields
* Resend configuration, verified senders, templates, or logs
* DNS records
* Git branches with unmerged work
* Production data or external system configuration

Deleting and recreating is still deleting.

When requesting approval for a destructive action, use an all-caps warning:

> ⚠️ THIS WILL DELETE THE SUPABASE TABLE AND ALL ITS DATA. PROCEED? (yes/no)

No exceptions.

### Never push production without explicit approval

Never run:

```bash
git push origin main
```

without explicit user approval. Pushing to `main` deploys production.

Feature branch pushes create Vercel previews, but still ask before the first push of a session.

### Never edit Vercel environment variables

The user manages Vercel environment variables in the dashboard. Do not add, remove, or modify them unless explicitly instructed.

### Never stash

Do not use `git stash`. Commit WIP instead:

```bash
git commit -m "WIP: <summary>"
```

### Push back on bad ideas

The user is not a developer. Before implementing a proposed change:

1. Verify the premise.
2. Check whether it is actually a problem.
3. Challenge suggestions that add bugs, risk, or unnecessary complexity.
4. Offer a better alternative when appropriate.

Use plain language. Do not be a yes-man.

### Assessment first

The assessment flow is the primary funnel. Do not introduce regressions to:

* question flow
* scoring
* email capture
* inline report rendering
* mobile completion
* MailerLite / Resend capture path
* Supabase persistence

The free assessment must work on mobile in under 3 minutes.

---

## 3. Source of Truth

Use this table before changing project direction, architecture, launch behavior, or user-facing copy.

| Area                             | Source                          | Status   |
| -------------------------------- | ------------------------------- | -------- |
| Active launch spec               | `Plans/aibi-launch-spec-v2.md`  | Existing |
| Product and direction changes    | `DECISIONS.md`                  | Existing |
| Outstanding work                 | `tasks/MASTER.md`               | Existing |
| Chronological project history    | `CHRONOLOGY.md`                 | Existing |
| Environment variables            | `docs/env-vars.md`              | Existing |
| Assessment implementation        | `docs/assessment.md`            | Planned  |
| Deployment                       | `docs/runbooks/deployment.md`   | Planned  |
| Email / MailerLite / Resend      | `docs/runbooks/email.md`        | Planned  |
| Stripe                           | `docs/runbooks/stripe.md`       | Planned  |
| Analytics                        | `docs/runbooks/analytics.md`    | Planned  |
| LMS / course provisioning        | `docs/runbooks/lms.md`          | Planned  |
| Auth and preview bypass          | `docs/runbooks/auth-preview.md` | Planned  |
| Database and Supabase            | `docs/database.md`              | Planned  |
| Design system                    | `docs/design-system.md`         | Planned  |
| Brand and copy                   | `docs/brand-copy.md`            | Planned  |
| Reference statistics and sources | `docs/reference-sources.md`     | Planned  |

If a source is marked **Planned**, do not assume it exists. Either keep the relevant pattern from this file, inspect the code, or create the runbook as part of the task if the user approves.

---

## 4. Current State Snapshot

**Last verified:** 2026-05-27

| Item                        | Current value                                                  | Source / note                  |
| --------------------------- | -------------------------------------------------------------- | ------------------------------ |
| Active launch spec          | `Plans/aibi-launch-spec-v2.md`                                 | Update if launch spec changes  |
| Design system               | Mockup system                                                  | Ledger fully retired           |
| Free assessment version     | `content/assessments/v3/`                                      | 12 flat questions              |
| Free assessment score range | 12–48 raw                                                      | 12 questions × 1–4             |
| Free assessment dimensions  | 12 readiness dimensions                                        | Free funnel only               |
| In-Depth Assessment version | v2                                                             | 48-question pool               |
| In-Depth score range        | 48–192 raw                                                     | 48 questions × 1–4             |
| In-Depth dimensions         | 8 dimensions                                                   | Paid report                    |
| Free assessment price       | Free                                                           | Primary lead magnet            |
| In-Depth Assessment price   | $99                                                            | Paid report                    |
| Foundation course price     | $295                                                           | Individual enrollment          |
| Primary funnel              | assessment → email capture → inline report → briefing / course | Highest priority               |
| Email stack                 | MailerLite + Resend                                            | ConvertKit retired             |
| Email use                   | Report delivery only                                           | No active newsletter cadence   |
| Newsletter                  | None active                                                    | Brief framing retired 2026-05-27 |
| Course format               | Self-paced, no cohorts                                         | All credentials self-paced     |
| CRM                         | None                                                           | HubSpot removed                |
| LMS                         | In-house                                                       | Supabase gated                 |
| Staging                     | None                                                           | Vercel Preview is test surface |

When any value changes, update this table and `DECISIONS.md` if it reflects a direction change.

---

## 5. Product Summary

The AI Banking Institute is an education-first AI proficiency company for community banks and credit unions.

The website is the sales funnel.

Every technical and UX decision should support:

```text
assessment completion → email capture → useful report → briefing booking / course purchase
```

Primary products:

* Free AI Readiness Assessment
* In-Depth Assessment, $99
* AiBI-Foundation course, $295
* AiBI-S specialist credentials, later phase
* AiBI-L leadership credential, later phase
* Leadership Advisory / Executive Briefing for institutional opportunities

Use the full name in prose:

```text
The AI Banking Institute
```

Use `AiBI` mainly for credential codes and the brand mark:

```text
AiBI-Foundation
AiBI-S
AiBI-L
```

Do not write `AiBI helps...` in body copy. Use `The AI Banking Institute helps...` or `the Institute`.

---

## 6. Architecture Summary

* Framework: Next.js 14, App Router
* Language: TypeScript strict mode
* Styling: Tailwind CSS + mockup tokens
* Hosting: Vercel
* Database / Auth: Supabase Postgres + RLS
* Payments: Stripe
* Email: MailerLite + Resend
* Scheduling: Calendly
* Analytics: `@vercel/analytics` + Plausible during transition
* LMS: in-house, not Kajabi, not Zapier, not third-party LMS

Prefer server components. Use `'use client'` only when interactivity is required.

Side effects belong in `lib/`, not directly in components.

---

## 7. Git and Worktree Rules

Primary repo:

```bash
~/Projects/TheAiBankingInstitute
```

Main branch lives in:

```bash
~/Projects/TheAiBankingInstitute
```

Feature worktrees live under:

```bash
~/Projects/TheAiBankingInstitute/.worktrees/<feature>
```

The main working directory stays on `main` because it is the stable home base for plans, CLAUDE.md, `.env.local`, and production-oriented project state. Do not switch it to a feature branch.

Never create sibling worktrees in `~/Projects`.

### Create a feature worktree

```bash
cd ~/Projects/TheAiBankingInstitute
git worktree add .worktrees/<name> -b feature/<name> main
ln -s ~/Projects/TheAiBankingInstitute/.env.local .worktrees/<name>/.env.local
cd .worktrees/<name> && npm install
```

### Remove a feature worktree after merge

```bash
cd ~/Projects/TheAiBankingInstitute
git worktree remove .worktrees/<name>
```

Only remove worktrees after confirming the work is merged or no longer needed.

### Old branch warning

If a branch is more than 50 commits behind `main` and touches files that moved during page splits, assessment rewrites, design-system ports, or route refactors, prefer cherry-picking the valuable commits over rebasing the whole branch. Rebase only when you have inspected the diff and understand the conflicts.

---

## 8. Development Commands

Run commands in the relevant worktree.

| Task           | Command                          |
| -------------- | -------------------------------- |
| Dev server     | `npm run dev`                    |
| Build          | `npm run build`                  |
| Type check     | `npx tsc --noEmit`               |
| Lint           | `npm run lint`                   |
| List worktrees | `git worktree list`              |
| Check status   | `git status`                     |
| Secret scan    | `npx gitleaks detect --source .` |

Preview deployment happens when a feature branch is pushed to GitHub. Production deployment happens when `main` is pushed.

---

## 9. Deployment Rules

There are two environments:

### Preview

* Any non-main branch pushed to GitHub
* Vercel auto-builds a unique preview URL
* Uses Vercel Preview environment scope
* Same Supabase project as production by design
* Preview side effects must be suppressed with `SKIP_*` flags

### Production

* `aibankinginstitute.com`
* Deploys from `main`
* Uses live keys
* Never push `main` without explicit approval

Do not create a staging environment unless the user explicitly decides to add one.

---

## 10. Environment Variables

Authoritative list:

```md
docs/env-vars.md
```

Before changing code that reads environment variables, check that file.

Important rules:

* `.env.local` is never committed
* Vercel env vars are managed by the user
* `SKIP_MAILERLITE`, `SKIP_RESEND`, `SKIP_PDF_GENERATION`, and similar flags are preview/local only
* `SKIP_CRON_AUTH=true` must never be set in production
* `next.config` should fail production builds if unsafe skip flags leak into production

---

## 11. Assessment Rules

The assessment is the most important feature.

### Free assessment

* Current version: v3
* 12 questions
* 12–48 raw score range
* Must work on mobile in under 3 minutes
* One question per view on mobile
* Email capture gates the full readiness report
* After email submission, the full report renders inline immediately
* Do not use a “check your inbox” wait state as the primary completion state

### Free assessment tier logic

Tier ids should remain stable for downstream consumers.

```ts
const getTierV3 = (total: number) => {
  if (total >= 41) return { id: 'ready-to-scale', label: 'Ready to Scale' };      // 41–48
  if (total >= 33) return { id: 'building-momentum', label: 'Building Momentum' }; // 33–40
  if (total >= 23) return { id: 'early-stage', label: 'Early Stage' };            // 23–32
  return { id: 'starting-point', label: 'Starting Point' };                       // 12–22
};
```

### Required persistence

The assessment must preserve progress in `sessionStorage` during the question flow and clear it after email capture.

```ts
useEffect(() => {
  if (answers.length > 0) {
    sessionStorage.setItem('aibi-assessment', JSON.stringify({ answers, currentQuestion }));
  }
}, [answers, currentQuestion]);

useEffect(() => {
  const saved = sessionStorage.getItem('aibi-assessment');
  if (saved) {
    const { answers: a, currentQuestion: q } = JSON.parse(saved);
    setAnswers(a);
    setCurrentQuestion(q);
  }
}, []);

sessionStorage.removeItem('aibi-assessment');
```

### Capture flow

The `/api/capture-email` path should:

1. validate input
2. rate-limit request
3. persist assessment response to Supabase
4. route contact to MailerLite group / tier
5. send transactional result through Resend
6. suppress external side effects in preview/local when `SKIP_*` flags are true

### In-depth assessment

* Current version: v2
* 48-question pool
* eight dimensions
* paid flow, $99
* report should include role-specific plan, dimension scores, 30/60/90 roadmap, sample prompts, and artifact plan

---

## 12. Load-Bearing Technical Patterns

Keep these inline until the planned runbooks exist.

### Rate limit public capture endpoint

Public endpoints without rate limits are spam targets.

```ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 h'),
});

const { success } = await ratelimit.limit(req.ip ?? 'anonymous');
if (!success) {
  return Response.json({ error: 'Too many requests' }, { status: 429 });
}
```

### Verify Stripe webhook signatures

Never process unverified webhook events.

```ts
const sig = req.headers.get('stripe-signature')!;
const event = stripe.webhooks.constructEvent(
  body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

### RLS performance pattern

Wrap `auth.uid()` in `select` and index policy columns.

```sql
CREATE POLICY "Users read own data" ON my_table
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE INDEX idx_my_table_user_id ON my_table(user_id);
```

### Plausible deferred queue pattern

Never call `window.plausible()` directly unless the deferred queue is installed.

```ts
if (typeof window !== 'undefined') {
  window.plausible = window.plausible || function() {
    (window.plausible.q = window.plausible.q || []).push(arguments);
  };
}

window.plausible('assessment_complete', { props: { tier, score } });
```

### Preview side-effect suppression

MailerLite and Resend have no true sandbox. Suppress live calls in local/preview.

```ts
if (process.env.SKIP_MAILERLITE !== 'true') {
  // MailerLite call
}

if (process.env.SKIP_RESEND !== 'true') {
  // Resend call
}
```

---

## 13. Stripe, Supabase, Email, and Analytics Rules

### Stripe

Stripe product and price changes require explicit user approval.

Course enrollment chain:

```text
Stripe payment.success webhook
→ verify signature
→ insert course_enrollments row in Supabase
→ tag MailerLite contact
→ user logs in with Supabase Auth
→ course page checks enrollment
```

### Supabase

Use the project Supabase helper/client from existing repo utilities. Do not create random Supabase clients in components.

Use the project migration workflow for schema changes.

RLS required on user-facing tables.

### MailerLite + Resend

Do not reintroduce ConvertKit. Some function names may still contain legacy “convertkit” wording, but the backend is MailerLite.

Do not reintroduce HubSpot unless there is a new explicit decision.

### Analytics

Custom events include:

* `assessment_start`
* `assessment_complete`
* `email_captured`
* `briefing_booked`
* `purchase_initiated`

---

## 14. Design System Rules

The current design system is the mockup system.

Do not reintroduce Ledger.

Canonical design references:

```text
public/sketches/mockup.html
public/sketches/_mockup.css
src/styles/tokens-mockup.css
```

Design summary:

* Modern editorial-meets-software
* Dark navy hero
* Warm cream page surface
* Gold as focused accent only
* Rounded card-based layout
* Generous whitespace
* Restrained shadows
* Interactive previews over static screenshots

Color rules:

* Use tokens from `tokens-mockup.css`
* Do not hardcode new hex values
* Gold on cream is not body text; use it for metadata/kickers only
* Emerald is only for success/saved states
* No terra, sage, cobalt, oxblood, or old pillar colors

Voice rules:

* Editorial-first, promotional-never
* Lead with the artifact, not the tool
* Specific over clever
* No exclamation points
* No emoji
* No “AI-powered” badges
* Avoid hype words like supercharge, unlock, revolutionize, synergy, and leverage

---

## 15. Copy and Citation Rules

No unsourced statistics in user-facing copy.

Every statistic must have a named source and year.

Do not use banned or retired language:

| Do not use              | Use instead                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------- |
| FFIEC-aware training    | Aligned with SR 11-7, Interagency TPRM Guidance, ECOA/Reg B, and the AIEOG AI Lexicon |
| AiBI-Practitioner       | AiBI-Foundation                                                                       |
| AiBI-P                  | AiBI-Foundation                                                                       |
| Banking AI Practitioner | AiBI-Foundation                                                                       |
| AiBi / AIBI             | AiBI                                                                                  |
| AI-powered              | AI-assisted, AI-supported, or omit                                                    |
| credential your examiner respects | credential aligned with SR 11-7, TPRM, ECOA/Reg B, and AIEOG (until a named examiner quote validates the claim) |
| Subscribe to the Brief / AI Banking Brief | omit — newsletter retired 2026-05-27, no active cadence                  |
| Start [Role] Path       | Enroll in AiBI-Foundation (until role-specific paths exist)                           |

---

## 16. Page Route Summary

| Route                           | Purpose                                               |
| ------------------------------- | ----------------------------------------------------- |
| `/`                             | Homepage and primary marketing funnel                 |
| `/assessment`                   | Free readiness assessment                             |
| `/assessment/in-depth`          | Paid $99 assessment flow                              |
| `/courses/foundation/program/*` | AiBI-Foundation LMS interior                          |
| `/dashboard`                    | Signed-in learner dashboard                           |
| `/my-toolbox`                   | Saved prompts, skills, playbooks, and assets          |
| `/playground` or `/practice`    | AI sandbox / practice environment                     |
| `/resources`                    | Public downloads library (playbooks, cheatsheets, templates) |
| `/security`                     | Security pillar / guide download                      |
| `/certifications`               | Certification inquiry page, not Stripe CTA in Phase 1 |
| `/services` or `/teams`         | Institutional / advisory / briefing flow              |
| `/api/capture-email`            | Assessment capture endpoint                           |
| `/api/create-checkout`          | Stripe checkout creation                              |
| `/api/webhooks/stripe`          | Stripe webhook handling                               |

If route details change, update the appropriate plan or decision file.

---

## 17. MVP Launch Gate

The post-conference email should not go out until the launch gate is complete.

Minimum launch gate:

* DNS live and SSL active
* Home page renders correctly on desktop and mobile
* Free assessment works end-to-end on iPhone Safari in under 3 minutes
* Email capture gates full report
* Inline report renders immediately after capture
* `sessionStorage` persistence works during assessment
* `/api/capture-email` rate limiting active
* MailerLite assessment group configured (no newsletter group — newsletter retired 2026-05-27)
* Resend verified sender tested
* Calendly Executive Briefing link works on iPhone Safari
* Services / Teams page live
* Certifications page has inquiry form only, no broken Stripe CTA
* Analytics events firing
* 404 page exists
* `npm run build` passes
* `npx tsc --noEmit` passes
* `npm run lint` passes
* `FFIEC-aware` does not appear in deployed copy
* all public statistics have named source citations

---

## 18. Implementation Workflow

### Plan mode

Use plan mode before non-trivial work involving:

* 3+ steps
* architecture changes
* auth
* payments
* email
* database
* assessment flow
* production deployment
* design system changes

For clear one-line bug fixes, fix directly.

If work goes sideways, stop and re-plan.

### Before implementation

1. Confirm branch / worktree
2. Read relevant source docs
3. Check current code before assuming
4. Identify the smallest safe change
5. Warn about conflicts or risks

### After implementation

Run, as relevant:

```bash
npm run build
npx tsc --noEmit
npm run lint
npx gitleaks detect --source .
```

For larger changes, run review passes:

1. DRY / simplicity review
2. security review
3. regression review, especially assessment, email capture, Stripe, Calendly, and auth

Update task files, handoffs, or decisions as needed.

---

## 19. Documentation Rules

Use the repo structure consistently.

| New item                | Location                                       |
| ----------------------- | ---------------------------------------------- |
| New plan                | `Plans/<slug>.md`                              |
| New task checklist      | `tasks/<slug>.md`                              |
| New handoff             | `docs/handoffs/<type>-YYYY-MM-DD[-context].md` |
| New review              | `docs/reviews/<scope>-audit-YYYY-MM-DD.md`     |
| New idea                | `Plans/_ideas/<slug>.md`                       |
| New decision / override | `DECISIONS.md`                                 |

When creating a plan, also create or update the matching task file and indexes:

```text
Plans/<slug>.md
tasks/<slug>.md
tasks/MASTER.md
CHRONOLOGY.md
```

Folder READMEs define local rules. Read them before adding files to that folder.

---

## 20. Security Baseline

* Never hardcode secrets
* Validate API inputs
* Verify Stripe webhook signatures
* Use RLS for user-owned data
* Do not leak service role keys to client code
* Prefer server components
* Keep client components small
* Use approved Supabase helpers
* Scan for secrets before commits
* Treat public endpoints as spam targets
* Rate-limit `/api/capture-email`

---

## 21. Final Reminder

When choosing between more code and clearer product behavior, choose clearer product behavior.

The goal is to make The AI Banking Institute convert, teach, and prove value through usable artifacts.
