# Persona Remediation + Verification Report — 2026-06-24

Branch `feat/persona-remediation-wave1` (8 commits over main). Compares this round against the 20/50/100-persona reviews. See `remediation.html` for the visual version, `01-consolidation.md` for the pre-remediation ledger.

## Verdict
The prior reviews scored an older codebase; the bottom-of-funnel was already largely built. This round = small real bug-fixes + the real tests that prove the flows. 6 fixes integrated, tsc clean, 634/634 unit pass, 447 no-seed e2e pass, fixed-build sweep 0/100 issues.

## STALE / RESOLVED (prior findings now closed)
| Finding | From | What changed / how verified |
|---|---|---|
| Certificate issuance chain | 100-persona GAP1 (P0) | Chain was already implemented on main (review_status set in 3 places, idempotent issuance, PDF via Puppeteer — NOT @react-pdf). Removed the dead @react-pdf cert component; added unit + tracing-guard tests. Seeded end-to-end e2e written but blocked locally (see env item). |
| Gated PDF downloads (500) | 100-persona GAP6 (P0) | PR #517 static-PDF fix PROVEN: e2e asserts /api/prompt-cards/download and /api/guides/safe-ai-use both return valid %PDF bytes (in the 447-pass run). Audit: zero live @react-pdf renderToBuffer calls remain in src/ — the production "@react-pdf 500" launch blocker is eliminated. |
| Retention loop + token bug | 100-persona GAP3 (P0) | Loop was already built (crons + cross-device resume). Fixed a real bug: the abandoned-assessment cron rotated a draft token and silently invalidated the first emailed resume link — now guarded and unit-tested. |
| Paid-buyer login stranding | 100-persona GAP2 (P0) | Happy path works (auto-trust on magic-link). Fixed the dead resend on /auth/confirm-device-pending by surfacing #517's sessionless recovery forms and forwarding the real destination. Auth-recovery e2e PASSED in a real browser with real Supabase. |
| "Fake" interactive demos | 100-persona GAP5 (P1) | Already wired to live, rate-limited AI by de73600f (caps + PII filters); the "Enrolled-only" mislabel and dead files were already gone. Removed residual dead canned-output strings and added a run-route gate e2e. Provider choice pending owner (see outstanding). |
| /resources hydration (React #418) | Live sweep (NEW last round) | Root-caused to the GLOBAL layout deriving chrome from the x-pathname request header (non-deterministic across SSR vs RSC). Fixed by deriving chrome from usePathname() in a client LayoutChrome. Proven by an e2e soft-navigation test AND a clean 0/100 local persona sweep. |
| Foundation purchase dead-ends | 20-persona P2/P17 | Zero dead-ends across both the production and local 100-persona sweeps (the 20-persona sweep had 3 here). |
| "Deploy-pending" pages now live | 20/100-persona | /pricing, /security/data-handling, /security/it-approval, /about, /verify all confirmed reachable in the production sweep coverage. |

## OUTSTANDING (mostly owner, not code)
| Item | Type | From | Note |
|---|---|---|---|
| Live-money smoke tests | OWNER | 20/50 | Real Stripe checkout -> webhook -> entitlement -> refund must be run with real money. Cannot be automated safely. |
| MailerLite nurture activation | OWNER | 20/50/100 | Paste/seed/domain-auth/enable the automations in your MailerLite dashboard. No code can do this. |
| Rotate exposed STRIPE_SECRET_KEY | OWNER | 20 | Security: rotate the previously exposed live key in Stripe + Vercel. |
| Physical iPhone/Safari QA | OWNER | 20/50 | Emulated mobile passes; a real-device pass is still needed. |
| Named advisors / public proof | OWNER | 20/50 | Approve named people, quotes, or logos for the credibility surfaces. |
| Legal / counsel signoff | OWNER | 50 | Privacy + terms need counsel review. |
| Demo AI provider choice | OWNER JUDGMENT | NEW | The public playground calls OpenAI gpt-4o-mini; you named the Anthropic key. Decide which, and I will switch it. |
| Auth email deliverability (SPF/DKIM/DMARC) | OWNER | GAP2 owner-half | The code recovery path is fixed; bank-gateway deliverability of the magic link is an email-auth/allowlisting task. |
| Local SUPABASE_SERVICE_ROLE_KEY | ENV | NEW | Your local .env.local holds a 39-char placeholder (the real ~200-char key lives in Vercel). Add the real key to .env.local to run the seeded certificate + assessment-resume e2e against real Supabase. |
| Abandoned-cron re-nudge policy | OWNER DECISION | 100 | Should the abandoned cron re-nudge drafts that already had a resume link emailed? If yes it needs a reusable token (a schema change), split out separately. |
| Wave-2 P1/P2 cleanups | DEFERRED | 100 | Mostly already addressed (need only regression guards). The "delete SiteNav/SiteFooter" item is now MOOT — the hydration fix renders them as layout slots, so deleting them would break the chrome. |

## NEW (surfaced this round)
| Item | Status | Detail |
|---|---|---|
| e2e used networkidle on dev | FIXED | The new resume specs called waitForLoadState(networkidle), which never settles on a Next dev server (HMR socket) and hung to the 30s timeout despite correct rendering. Removed. |
| Cert e2e 30s timeout too short | FIXED | A cold dev compile + first Chromium PDF launch exceeds 30s; raised to 120s. |
| Integration type + path bugs | FIXED | The retention change made last_sent_at required (existing fixture updated); the cert guard used import.meta.url which is not a file:// URL under vitest (resolve from cwd instead). |
| .env.local service-role placeholder | SURFACED | Discovered while wiring the seeded e2e — see the ENV outstanding item. |

## Verification detail
- Unit: 634/634 pass (162 files); tsc clean.
- e2e no-seed (real browser): 447 pass (incl. /resources hydration soft-nav + gated PDF byte checks).
- e2e seeded (real Supabase): auth-recovery PASS; resume malformed/unknown PASS; saved-draft + certificate chain blocked by local placeholder service-role key (unit-verified).
- Persona sweep (fixed local build): 100 personas, 0 broken / 0 dead-ends / 0 JS-error pages (prod sweep's /resources #418 gone).

## To ship
On `feat/persona-remediation-wave1` (not merged/deployed). Order: decide demo provider -> optionally add real service-role key + run seeded flows -> merge to main -> owner checklist.
