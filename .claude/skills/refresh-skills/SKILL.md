---
name: refresh-skills
description: Weekly improvement run for the banker skills library (content/skills). Pick the skills most in need, run each against its own test cases, fix what fails or has gone stale, and open one PR for James. Never merges.
---

# Refresh the banker skills

The library is `content/skills/` (122 skills, catalog in `catalog.ts`, standard
in `AUTHORING.md`). Each skill carries `tests`: inputs plus a rubric of what a
passing output must do. This run keeps the library getting better.

## 1. Pick this week's batch (8 skills)

In order, until you have 8:

1. Skills with the most "Not quite" feedback in the last 30 days, if the report
   is available: `node scripts/skills-feedback-report.mjs` (needs
   `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; skip if absent).
   Read the notes; they say what went wrong.
2. Skills whose `reviewBy` is within 30 days.
3. Skills with the oldest `verifiedOn`.

## 2. Test each one

For every test case of the skill:

1. Fill the skill's instructions with the test inputs (`fillPrompt` in
   `src/lib/skills/render.ts` does exactly what a banker's copy does).
2. Carry out the filled instructions yourself, as the model a banker would be
   using, and produce the output.
3. Grade the output against each rubric line: pass or fail, one sentence why.

Also read the skill as a demanding community-bank professional in that role
would: is anything vague, outdated, wrong about a regulation, or missing a
guardrail? Check product names and menus against the vendor's own pages
(Microsoft, Anthropic, OpenAI, Google) when a skill names them.

## 3. Fix

- Fix the instructions so every rubric line passes. Add a test case for any new
  failure mode you found, including from feedback notes.
- Keep names and ids exactly as in `catalog.ts`. Renames go to James as a
  question in the PR, not into the code.
- For each changed skill: `version` + 1, `verifiedOn` = today,
  `reviewBy` = today + 90 days (write the dates out; do not keep using
  `SKILLS_VERIFIED_ON` for a changed skill).
- For each skill that passed unchanged: bump only `verifiedOn` and `reviewBy`.
- Follow AUTHORING.md: no statistics, no unframed SR 11-7, no invented numbers
  presented as fact, synthetic data only.

## 4. Check and open the PR

```
npx vitest run content/skills src/lib/skills src/app/playbooks
npx tsc --noEmit
npm run lint
node scripts/check-claims.mjs
```

All must pass. Open one PR titled `Skills refresh: <date>` with a table:
skill · tests run · failures found · what changed. Label it `skills-refresh`.
Never merge it; James reviews and merges.
