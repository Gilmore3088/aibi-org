# Comprehensive Prioritized Persona Audit — 2026-06-23

Built from the live 100-persona production sweep (100 personas, 750 steps, 47 pages, 0 broken / 0 dead-ends / 1 JS-error page) cross-referenced with the 20/50/100 reasoning audits. See `01-consolidation.md` for the full complete-vs-not ledger and `index.html` for the visual report.

## Verdict
Building largely done; production proof not. Top/mid-funnel nav is healthy and several prior "deploy-pending" fixes are confirmed live. Open risk is entirely below the nav layer.

## Confirmed live this run (prior gaps now closed in prod)
- **Foundation purchase page no longer a dead-end** — 0 dead-ends across 750 steps; the 20-persona sweep had 3 here (closes: 20-persona P2/P17)
- **/pricing page exists & is linked** — reached 29× via real links (closes: 100-persona P1 ("no /pricing page"))
- **/security/data-handling deployed** — reached 19× (closes: 20-persona P6 (was "deploy pending"))
- **/security/it-approval deployed** — reached 18× (closes: 20-persona P16 (was "deploy pending"))
- **/about restored & live** — reached 39× (closes: 20-persona P5 (was "deploy pending"))
- **Certificate verify surface live** — /verify 19×, /certifications 16× (closes: 100-persona GAP1 (verify half))
- **$99 In-Depth reachable in prod** — /assessment/in-depth reached 25× (closes: 20-persona P12 / 100-persona)
- **Top/mid-funnel navigation integrity** — 0 broken links, 0 4xx across 100 personas (closes: —)

## Findings by priority
Repeat column: a named prior audit = holdover; `NEW` = first surfaced by this live sweep.

### P0 — Critical
| ID | Finding | Sev | Status | Repeat | Impact |
|---|---|---|---|---|---|
| P0-1 | Certificate unreachable + cert PDF | Critical | Local — prod unverified | 100-persona GAP1 | A paying $295 completer cannot obtain the credential — the entire course payoff fails. Drives refunds and reputational damage with the exact buyers most likely to refer. |
| P0-2 | Paid buyers stranded at login | Critical | Local — prod unverified | 100-persona GAP2 | Buyers who pay cannot get in: passwordless account + a single magic-link that bank email gateways filter. Silent revenue loss and support load right after the sale. |
| P0-3 | Live-money smoke tests never run | Critical | Outstanding | 20-persona P15 + 50-persona F4 | The entire paid funnel — checkout → webhook → entitlement → refund — is unproven end-to-end with real money. A single broken link in that chain means paid customers get nothing. |
| P0-4 | MailerLite nurture not activated | Critical | Outstanding | 20-persona P0-3 + 50-persona + 100-persona GAP3 | Every captured email gets zero follow-up. The core conversion mechanism (assessment → nurture → $99 → $295) is dead on arrival; the funnel leaks at its most valuable point. |
| P0-5 | Exposed STRIPE_SECRET_KEY not rotated | Critical | Outstanding | 20-persona (remaining gates) | A live Stripe secret key was exposed and not rotated — direct financial and security risk. |
| P0-6 | Email-gated downloads 500 | Critical | Local — prod unverified | 100-persona GAP6 | Lead magnets (Prompt Cards, Safe-AI Guide) fail after the visitor gives their email — a broken promise at the exact moment of trust, losing both the lead and the credibility. |
| P0-7 | No retention / recovery loop | Critical | Local — prod unverified | 100-persona GAP3 | Abandoners, idle buyers, and quitters are never re-contacted, and the free assessment will not resume cross-device. The roster’s many "abandons mid-assessment" / "buys, never starts" personas are permanently lost. |
| P0-8 | Team checkout is a mailto (self-serve dark) | High | Deferred (owner) | 100-persona GAP4 + 20-persona P10 + 50-persona | Institutional buyers — the highest-LTV segment — have no self-serve path and must email. Intentional for now, but it caps the team funnel until hardened. |

### P1 — High
| ID | Finding | Sev | Status | Repeat | Impact |
|---|---|---|---|---|---|
| P1-1 | Interactive demos are canned mockups | High | Local — prod unverified | 100-persona GAP5 | High-intent evaluators who open /playground or /practice see fake output; /practice is mislabeled "Enrolled-only". Erodes credibility with the personas most likely to buy. |
| P1-2 | /resources hydration error (React #418) | High | Outstanding | NEW | Intermittent client/server hydration mismatch on the resources hub — a primary lead-gen page reached 31× in this run. Can cause content flicker or broken interactivity for a slice of visitors. |
| P1-3 | Physical iPhone/Safari QA not run | High | Outstanding | 20-persona P9/P18 + 50-persona F3 | Mobile is the primary assessment surface; real-device CTA reachability is still unproven (emulation only). |
| P1-4 | Thin public proof / no named advisors | High | Local — prod unverified | 20-persona P5/P19 + 50-persona F2 | A credentialing organization with no named people, quotes, or logos has a trust gap with skeptical buyers (a large share of the roster). |
| P1-5 | Legal / counsel signoff on privacy & terms | High | Outstanding | 50-persona (#21/#40) | Privacy and terms have not had counsel review — legal exposure at launch. |
| P1-6 | $99 discoverability / offer ladder | Medium | Local — prod unverified | 20-persona P12 + 100-persona | The $99 In-Depth is the funnel’s mid-step; weak nav discoverability throttles the climb from free to $295. |
| P1-7 | Support ops SLA / refund authority | Medium | Local — prod unverified | 20-persona P20 + 50-persona F1 | Paid-buyer issues lack a defined resolution path, SLA, and refund authority — slow recovery for stranded buyers. |

### P2 — Medium / Low
| ID | Finding | Sev | Status | Repeat | Impact |
|---|---|---|---|---|---|
| P2-1 | Two nav systems / dead legacy chrome | Medium | Local — prod unverified | 100-persona P1 | Divergent navigation and a dead "About" link in legacy chrome create inconsistent wayfinding. |
| P2-2 | Module 3 difficulty cliff | Medium | Local — prod unverified | 100-persona P1 | A 60-char gate in Module 3 is where course personas quit; hurts completion (and thus certificate revenue). |
| P2-3 | Forced marketing opt-in / no "no-thanks" lane | Low | Local — prod unverified | 100-persona P1 | EmailGate forces marketingOptIn:true — a consent/trust smell for privacy-skeptic personas. |
| P2-4 | Hygiene fixes (raw-email logs, signOut cookie, dead code) | Low | Done | 100-persona P2 | PII in logs, a trusted-device cookie surviving signOut, and dead modules — small but real. |

## The one live defect
- **React #418 hydration mismatch on /resources** (persona P005-overwhelmed-compliance-chief) — intermittent (1/31 visits). Status: **NEW**.

## Scope
Read-only nav sweep: GET only, no forms/checkout/auth/api. Proves navigation health and reachability; cannot exercise the six bottom-of-funnel P0s — those need targeted production verification.
