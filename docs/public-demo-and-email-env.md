# Public demo, sign-in email & downloads — environment checklist

Why this doc exists: on a **preview deploy** (and on prod if a key is missing)
the `/playground` and `/practice` "Run" buttons show **"The public demo is
temporarily unavailable"**, and "Email me a sign-in link" silently does nothing.
Those are **environment-configuration gaps, not code bugs**. This is the exact
list of what to set and where each value is read.

## What breaks without each variable

| Symptom | Cause | Env var(s) | Read in |
| --- | --- | --- | --- |
| Playground / Practice **"Run" → "temporarily unavailable"** | The public-demo budget guard runs on Supabase and **fails closed** when Supabase isn't reachable, and the model call needs an OpenAI key. | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` | `src/lib/playground/public-budget.ts`, `src/app/api/playground/run/route.ts`, `src/lib/ai-harness/client.ts` |
| **"Email me a sign-in link" / "Resend link"** does nothing | Resend send is **skipped** when the API key is unset (UI still says "a link is on its way"). | `RESEND_API_KEY` (+ optional `RESEND_FROM`, `RESEND_FROM_NAME`) | `src/lib/resend/index.ts` (`sendInline`) |
| Resource **download "temporarily unavailable"** | Free downloads serve the committed file; the route still requires Supabase to be configured. | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | `src/app/api/resources/[slug]/download/route.ts` |
| Email links point at the wrong host | Falls back to `https://www.aibankinginstitute.com`. | `NEXT_PUBLIC_SITE_URL` | `src/lib/resend/index.ts` (`siteUrl()`) |

## The public demo specifically (`/playground`, `/practice`)

The public demo is hardcoded to **OpenAI `gpt-4o-mini`** (a cheap model chosen
for the capped free demo — see `PUBLIC_PLAYGROUND_PROVIDER` / `_MODEL` in
`src/lib/playground/public-budget.ts`). It needs **all three**:

1. `OPENAI_API_KEY` — the model call.
2. `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — the per-IP /
   per-day / daily-budget guard (fails closed → "temporarily unavailable" when
   Supabase is unreachable).

Optional tuning (have sane defaults):
`PUBLIC_PLAYGROUND_PER_IP_PER_MINUTE`, `PUBLIC_PLAYGROUND_PER_IP_PER_DAY`,
`PUBLIC_PLAYGROUND_DAILY_CAP_CENTS`.

## Action checklist (Vercel → Project → Settings → Environment Variables)

- [ ] **Preview** scope: set `OPENAI_API_KEY`, `RESEND_API_KEY`,
      `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
      `NEXT_PUBLIC_SITE_URL`. (Preview deploys are where this was observed broken.)
- [ ] **Production** scope: confirm the same five are present. **If
      `OPENAI_API_KEY` is missing in production, the public demo is dead in
      production too** — verify by clicking Run on the live site.
- [ ] Never set `SKIP_RESEND=true` or `SKIP_MAILERLITE=true` in production
      (the build already guards `SKIP_MAILERLITE` — see `next.config.mjs`).

## Resilience note

Even with the keys set, the capped demo can hit its daily budget. The UI now
**falls back to a clearly-labeled sample output** instead of a dead error box,
so the page never looks broken — but live runs still require the vars above.
