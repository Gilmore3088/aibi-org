# Persona wave

100 synthetic buyers and learners walk the site on random, goal-weighted paths.
Playwright records what each one experiences: JS errors, failed requests, dead
ends, how many clicks and seconds it takes to reach something valuable, and
what value was actually delivered. The course gets the closest look: every
module's Understand → Try → Build → Save loop is played the way a learner would.

This is a standalone Node script (not a `*.spec.ts`), so `npm run e2e` never
picks it up.

## Run

```bash
# 1. Start the app with the course gate open (dev-only bypass).
SKIP_ENROLLMENT_GATE=true SKIP_RESEND=true SKIP_MAILERLITE=true npm run dev

# 2. Run the wave (another terminal).
npm run e2e:persona-wave

# Subsets / tuning
WAVE_ONLY=P001,P014 npm run e2e:persona-wave
WAVE_LIMIT=10 WAVE_CONCURRENCY=2 npm run e2e:persona-wave
WAVE_BASE_URL=https://<preview>.vercel.app npm run e2e:persona-wave
```

| Env | Default | Meaning |
|---|---|---|
| `WAVE_BASE_URL` | `http://localhost:3000` | Site under test |
| `WAVE_SEED` | `20260930` | Same seed ⇒ same 100 personas, so waves compare row-for-row |
| `WAVE_CONCURRENCY` | `4` | Parallel browser contexts |
| `WAVE_ONLY` / `WAVE_LIMIT` | — | Run a subset |
| `WAVE_SLOW_MS` | `5000` | Page settle time counted as "slow" (use ~8000 on `next dev`) |
| `WAVE_PREWARM` | `true` | Hit every route once first so dev compile time isn't billed to personas |
| `WAVE_OUT` | `e2e/persona-wave/out/<timestamp>` | Output directory (gitignored) |
| `WAVE_VERCEL_BYPASS` | — | Vercel "Protection Bypass for Automation" secret, for a preview behind deployment protection |
| `WAVE_CHROMIUM_PATH` | `/opt/pw-browsers/chromium` if present | Browser binary |

Output: `report.md` (read this), `summary.json`, `results.json` (every
persona's full timeline), `shots/` (a screenshot at each friction point).
Re-render a report without re-running: `node e2e/persona-wave/report.mjs <out-dir>`.

## Personas

`personas.mjs` builds 100 personas from institution type × role × temperament
× device × traffic source. The traffic source decides the landing page. Journey
mix is a fixed quota, and 40 of 100 personas are course learners:

| Journey | n | What they try to do |
|---|---|---|
| course-sampler / quitter / steady / completer | 10 each | Work 1–2, 3–5, 6–12, or all 18 modules (+ certificate) |
| course-shopper | 8 | Evaluate the course and buy it |
| free-assessment | 14 | Take the 12-question assessment |
| assessment-to-indepth | 8 | Free assessment, then buy the $99 In-Depth |
| resource-hunter | 10 | Find and download a template |
| practice-tinkerer | 5 | Run a prompt in the practice sandbox |
| institution-buyer | 5 | Send a team/institution inquiry |
| pricing-skeptic | 5 | Compare pricing and ROI, maybe buy |
| cert-verifier | 2 | Verify a certificate ID |
| explorer | 3 | Random walk |

Each persona also has a **curiosity** (chance of wandering off-goal), a
**click budget**, and a **frustration tolerance**. Dead ends and friction add
frustration; past the tolerance, the persona rage-quits and the report records why.

## What gets measured

- **Errors**: uncaught JS exceptions, console errors, and same-origin HTTP ≥ 400
  (pages and API calls, response body captured).
- **Dead ends** (severity 1): error/404 pages, near-empty pages, pages with no
  forward link or button outside header/footer, missing primary CTAs, actions
  that produce nothing observable.
- **Friction** (0.25–0.5): having to type a URL because no link existed, slow
  pages, covered/unclickable controls, widgets that can't be finished.
- **Click-to-value**: clicks and seconds to the first value moment
  (`assessment_score`, `resource_download`, `practice_output`,
  `inquiry_submitted`, `checkout_reached`, `module_content`, …).
- **Value index**: weighted sum of every value moment reached (weights in
  `VALUE_WEIGHTS`, `run-wave.mjs`).
- **Experience score** (0–100): starts at 100, minus product dead ends, JS
  exceptions, failing APIs, slow pages, and typed-URL fallbacks.
- **Course value delivered**, per module: words of teaching content, whether
  the Try activity reached its completion counter, Build fields completed,
  save API status, AiBI Lab run status, time, and clicks.

## Running against a configured preview (the real test)

Local runs can't test checkout, inquiries, the AiBI Lab, certificates, resume
links, support requests, quick wins, or accounts, because they need keys.
To test them:

1. Deploy the branch to a Vercel **preview**. `VERCEL_ENV` must be `preview`,
   never `production`. Set these in Vercel → Settings → Environment
   Variables, **Preview** scope:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
     `SUPABASE_SERVICE_ROLE_KEY`: a non-production project
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and the price IDs
     (`STRIPE_FOUNDATION_PRICE_ID`, `STRIPE_INDEPTH_PRICE_ID`, and the
     institution variants): **test mode** keys and prices, with the webhook
     pointed at the preview
   - `OPENAI_API_KEY` and/or `ANTHROPIC_API_KEY`
   - `RESEND_API_KEY`, sending to a test domain; `SKIP_MAILERLITE=true` is
     fine on preview
   - `PREVIEW_AUTH_BYPASS=true`, so the course opens without a purchase.
     Checkout still exercises Stripe test mode.
2. Run all three waves from a machine that can reach the preview:
   ```bash
   export WAVE_BASE_URL=https://<preview>.vercel.app WAVE_SLOW_MS=5000 WAVE_PREWARM=false
   npm run e2e:persona-wave                        # wave 1, core journeys
   WAVE_SET=features npm run e2e:persona-wave      # wave 2, features
   WAVE_SET=coverage npm run e2e:persona-wave      # wave 3, remaining pages
   ```
3. Every row still tagged `env` is now a real bug. Done means 0 rage-quits,
   every goal-directed persona reaching value, and 0 product dead ends.

## Reading results honestly

The default local run has **no Supabase, Stripe, OpenAI/Anthropic, or outbound
network**. Anything that depends on them is tagged **env** in the report
(Stripe checkout 503, inquiry 502, resource download 503, lab 401 under the
enrollment bypass, Google Fonts). Treat env rows as "untested here", not "works"
or "broken". Point `WAVE_BASE_URL` at a configured preview to exercise them.

Under `SKIP_ENROLLMENT_GATE` every visitor is an enrolled learner with all
modules unlocked and marked complete. So the course-shopper purchase page
forwards into the course (reported as `bypass_enrolled_redirect`, env), and
"Saved" badges in the Save step reflect the bypass, not the learner's actions.
Artifact saves go through `/api/toolbox/save`, which accepts bypass saves
locally without writing to a database.
