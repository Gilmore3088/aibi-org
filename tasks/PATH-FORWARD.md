# Path Forward — consolidated work plan

Living document. Synthesizes [`launch-checklist.md`](./launch-checklist.md)
(520 open items), [`aibi-p-to-foundation-deploy-checklist.md`](./aibi-p-to-foundation-deploy-checklist.md)
(14 open), [`todo.md`](./todo.md) (52 open), this session's findings,
and [`MASTER.md`](./MASTER.md). The other files stay authoritative for
their domain; this one tells you what to attack next.

Tag legend:
- 🤖 **Autonomous** — I can do this without you
- 🔒 **You-only** — needs your dashboard / approval / decision
- 🤝 **Collaborative** — I can build it, you sign off / push

---

## Wave 1 — Autonomous, doing now

| ID | Task | Source | Output |
|----|------|--------|--------|
| W1.1 | 🤖 Rework `/assessment/in-depth` hero: paid as primary CTA, free as secondary | Session #23 (your request) | Code change |
| W1.2 | 🤖 Add Playwright e2e test locking in the course-route gate fix | Auth audit Finding 1 | New test in `e2e/auth.spec.ts` |
| W1.3 | 🤖 Banned-word sweep: scan codebase for the strings CLAUDE.md says must never appear | Launch §11 (brand audit) | Audit report + fixes if found |
| W1.4 | 🤖 Mark launch-checklist items completed by this session's work | Session bookkeeping | `tasks/launch-checklist.md` edits |
| W1.5 | 🤖 Run accessibility audit on the four key routes | Launch §12 | Axe report → `docs/reviews/` |

Estimated time: ~30–45 minutes total. Commit + push at the end.

---

## Wave 2 — Autonomous, next session

(Larger items I can do but won't fit this session.)

| ID | Task | Source |
|----|------|--------|
| W2.1 | 🤖 Build out the Playwright e2e test suite for §3 (auth flows §3.42–§3.87) — currently most are seeded tests gated on Supabase env | Launch §3 |
| W2.2 | 🤖 Lift the `/assessment/in-depth` PurchaseButton into the hero region so the primary CTA is the actual Stripe button, not just a link | Polish |
| W2.3 | 🤖 §13 Performance audit: run Lighthouse against the 5 marquee routes, file findings to `docs/reviews/perf-YYYY-MM-DD.md` | Launch §13 |
| W2.4 | 🤖 §14 SEO: verify `robots.txt`, `sitemap.xml`, canonical tags, OG image fallbacks | Launch §14 |
| W2.5 | 🤖 §16 Security audit: review API rate limiting, webhook signature verification, RLS coverage | Launch §16 |
| W2.6 | 🤖 §17 LMS reskin cleanup — code-level, see launch-checklist §17 for the punch list | Launch §17 |
| W2.7 | 🤖 §18 Bug fixes — code-level work tracked in launch-checklist §18 | Launch §18 |
| W2.8 | 🤖 §19 Mobile + cross-browser testing (Playwright multi-project run) | Launch §19 |

---

## User-blocked — needs you

| ID | Task | Why you-only |
|----|------|--------------|
| U.1 | 🔒 Pull Supabase env keys to `.env.local` | High-privilege creds; auto-mode denies writing service-role keys. Command in task #25. |
| U.2 | 🔒 Rotate `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `MAILERLITE_API_KEY` and mark Sensitive in Vercel | Launch §1.5–§1.8 |
| U.3 | 🔒 Verify Vercel project env vars match expected names (`vercel env ls`) | Launch §1.9 |
| U.4 | 🔒 DNS verification — apex, www, SSL on `aibankinginstitute.com` + `.org` redirect | Launch §1.11–§1.14 |
| U.5 | 🔒 Enable Vercel password protection on preview if you want to hide previews from indexing | Launch §1.17 |
| U.6 | 🔒 Supabase Auth: fix all 4 email templates (`{{ .RedirectTo }}` pattern) per 2026-05-10 handoff | Launch §2.23–§2.26 |
| U.7 | 🔒 Stripe dashboard — update product display names + descriptions to AiBI-Foundation naming | AiBI-P rename §6 |
| U.8 | 🔒 MailerLite — update automation copy to new naming | AiBI-P rename §9 |
| U.9 | 🔒 Resend — update 5 email template bodies | AiBI-P rename §8 |
| U.10 | 🔒 Decide on `Plans/aibi-docs/` mid-session drop — promote to new structure, leave gitignored, or remove | Cleanup |
| U.11 | 🔒 Branch hygiene: `design-2.0` is 90 ahead of origin; `feature/brand-refresh` is 37 behind. Push, rebase, or delete? | Drift |

---

## Collaborative — I build, you push / sign off

| ID | Task | Why collaborative |
|----|------|--------------------|
| C.1 | 🤝 §9 Email/transactional E2E tests — I write the test code, you verify the emails actually deliver | Needs your inbox |
| C.2 | 🤝 §15 Analytics + observability — I add the event-firing code; you set up the dashboard | Needs Plausible/etc. config |
| C.3 | 🤝 §4–§8 E2E coverage (free assessment, in-depth, course purchase, modules, exam, certificate) — I can write the tests but they need Supabase env (U.1) to run | Blocked on U.1 |
| C.4 | 🤝 Any push to `main` | Per CLAUDE.md: production push requires your approval every time |

---

## Initiative groupings

For when you want to see all of one thing at once.

### Launch (the §1–§20 punch list)

The whole 520-item list in [`launch-checklist.md`](./launch-checklist.md).
Biggest unblocking ratio: **§2 Supabase Auth template fixes (U.6)** —
~15 minutes of your dashboard time, unblocks the whole signup/login
email flow.

### AiBI-P → AiBI-Foundation rollout

Code is shipped. 14 dashboard items remain in
[`aibi-p-to-foundation-deploy-checklist.md`](./aibi-p-to-foundation-deploy-checklist.md):
Stripe display names, Resend bodies, MailerLite copy. All U.7–U.9.

### Phase 2 (post-launch backlog)

52 items in [`todo.md`](./todo.md). Supabase persistence for assessment,
Stripe checkout wiring (most shipped already), sandbox provider expansion
(OpenAI + Gemini), AiBI-S/L tabbed layouts, recharts integration, PDF
export. All autonomous (W2-equivalent) but post-launch priority.

### Brand refresh

`docs/brand-refresh-2026-05-09/MERGE-ROADMAP.md` — 5-phase Ledger rollout.
Active. Some autonomous, some you-only (Figma source updates).

---

## Update protocol

After each work session, append a "Done" entry under the relevant wave
or initiative. Don't delete completed lines — strike them with `~~text~~`
or move to a "Completed in this session" log at the bottom so the
audit trail is preserved.

When something new comes up (idea, bug, gap), append it to either Wave
2, User-blocked, or Initiative groupings. If unsure where it fits,
drop it under "## Triage" at the bottom and decide later.
