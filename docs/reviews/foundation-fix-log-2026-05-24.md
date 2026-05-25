# Foundation Course — Remediation Log · 2026-05-24

**Branch:** `feature/addie-v1` · worktree `.worktrees/addie-v1`
**Inputs:** five-persona critique (`foundation-critique-synthesis-2026-05-24.html`) + Pair 1 UX×ID critique (`foundation-pair1-cogload-id-2026-05-24.md`)
**Status at end of session:** 10 of 19 Round-1 findings fixed in code/content + DB; Round-1 sandbox blocker closed; new Pair 1 findings surfaced and queued.

---

## Round 1 — fixes landed

### F1 + F18 · sandbox lockdown + PII scanner hardening · **DONE**

**Code:**
- `src/app/api/sandbox/chat/route.ts` — removed `'foundation'` from `VALID_PRODUCTS`; foundation lessons now physically cannot reach the client-supplied-systemPrompt endpoint. They route through `/api/sandbox/run` and `/ab` (server-assembled prompts).
- Added `MAX_SYSTEM_PROMPT_LENGTH = 8000` cap and `SYSTEM_PROMPT_OVERRIDE_PATTERNS` regex set (ignore-previous-instructions, role-hijack, `<|im_start|>system`, `system:` overrides). Defence in depth for the remaining legacy AiBI-P / AiBI-S / AiBI-L surfaces.
- `src/lib/sandbox/pii-scanner.ts` — spaced + dotted SSN detection added (`XXX XX XXXX`, `XXX.XX.XXXX`); new `detectPAN` with Luhn checksum for 13–19-digit credit-card numbers (handles `4242 4242 4242 4242`, `4242-4242-4242-4242`, `4242424242424242` formats).

**Content (live DB + seeds):**
- M2.3 `[warn]` rewritten: now enumerates what the regex catches (formatted SSNs, account-number runs, Luhn-valid payment cards, emails, phones, DOB-in-context) and explicitly disclaims name detection.
- M4.2 `[warn]` rewritten with the same accurate enumeration + "Names, free-text descriptions of real members, and paraphrased SAR content are not detected by regex."

### F2 · institutional approval gates · **DONE**

Three lessons now acknowledge that "public" ≠ "free to paste":
- M0.2 — new `[warn]` after the case_good cards. "Your bank may route public regulator guidance, supervisory correspondence, or vendor proposals through a controlled channel before they leave its environment."
- M2.3 — `[warn]` after the third case_good. "'Public' is the floor, not the ceiling." Names CCO / audit / model-risk as the right approval channels.
- M3.1 — appended to the existing context-pasting `[warn]`. "Even 'public' context… may need to clear your institutional approval channel before it leaves your environment."

### F3 · SR 11-7 / TPRM / AIEOG thread inside lessons · **DONE**

- M4.1 — new `[case:good]` "A recurring Skill against rule text is a model under SR 11-7" with the four-field artifact metadata (name, version, intended use, reviewer). Adds the explicit `[tip]` listing the three regulator anchors with first-use definitions.
- M5.1 — new `[case:good]` "The regulator framework that already covers this" — SR 11-7 + Interagency TPRM Guidance (June 2023) + OCC Bulletin 2023-17 + AIEOG Lexicon.

### F5 · M5.4 blast-radius matrix · **DONE**

Inline markdown table (tool × output × runtime × hands-on-real-systems × IT-handoff line) covering v0 (lowest blast) → Lovable → Replit Agents → Claude Code (highest blast). Followed by a `[warn]` requiring an IT-director ping before any non-synthetic data leaves the prototype. Production block updates the launcher to inherit a blast-radius badge into the saved Toolbox artifact.

### F7 · honest timing · **DONE**

- M0.1 stat card: `6 · 24 · <15m` → `6 · 24 · 8–25m`. Body now reads: "Most lessons fit between meetings (8–15 min). A handful of working lessons (M3.2 sandbox, M3.5 prompt pack, M5.3 problem framing) run 20–25 min because you actually build something."
- M0.1 knowledge check rewritten: correct answer is now "8–25 minutes — most fit between meetings; the build lessons run longer."

### F10 · verification discipline · **DONE**

M3.4 closes with a new `[case:good]` carrying a three-rule protocol: (1) every numeric/citation/statute checked against the named source before it leaves your desk; (2) every name/role/date confirmed against system-of-record (not another LLM); (3) source noted on the artifact (URL, document, retrieval date). Framed as SR 11-7's outcomes analysis + ongoing monitoring applied at artifact level. Plus a `[tip]` distinguishing load-bearing from decorative claims.

### F11 · Workbench Pack ghost · **DONE**

Stripped from M5.1 case_good and M5.5 closing artifact list. M5.1 now references "Module 4 Toolbox holds your saved Skills (m4.2 first one, m4.3 role-specific, m4.4 source-aware)." M5.5 closing list: "Data Discipline Card, AI Toolkit Map, First Conversation, Starter Prompt Pack, three saved Skills in your Toolbox (M4.2–M4.4), Problem Backlog, PRD, prototype URL." No more orphan artifact.

### F13 · institutional brief for leaders · **DONE**

M5.5 has a new `[case:good]` defining the **AI Governance One-Pager** as the leadership-track institutional artifact:
1. Scope (use cases sanctioned)
2. Off-limits (data-discipline rule + SR 11-7 + Interagency TPRM Guidance + AIEOG)
3. Vendor list (every AI provider with TPRM status)
4. Roles (who decides scope / reviews outputs / briefs the board)
5. Risk-appetite statement
6. Review cadence (quarterly, named owner)

Production block specifies it renders as a downloadable artifact card for the leadership track and pre-fills Scope / Off-limits / Roles from Problem Backlog + PRD.

### F19 · "what can go wrong by department" · **DONE**

M3.5 (last free lesson, just before the gate) ends with a new `[case:bad]` carrying five departmental worst-case scenarios — Lending (ECOA on invented citation), Front-line (audit trail), Back-office (campaign list as customer-data export), IT (Replit Agent connecting to core without TPRM), Leadership (MNPI in vendor training pipeline). Closes: "Every one of these is fixed by Module 0's rule and Module 3.4's verification protocol. The gate is not a test of AI literacy. It is a check that you walked the rule out of the room."

---

## Round 1 — deferred (not yet fixed)

| ID | Finding | Why deferred |
|---|---|---|
| F4 | M4 → M5 scaffolding cliff | Requires either a new transitional lesson or a substantial M5.1 expansion — bigger than a seed-tweak. |
| F6 | First-use glossary (SR 11-7, MNPI, OCC, few-shot, chain-of-thought, PRD) | Cross-cutting UI work — needs a glossary component + first-use detection across lesson bodies. |
| F8 | Working Skill version metadata | Partly addressed via F3 (artifact metadata fields named) but the M4.* artifact UI does not yet render version / approver / use-boundary fields. |
| F9 | Concept-stability — six near-synonyms in circulation | Partly tightened (Workbench Pack removed, "Skill Template / saved Skills" consolidated). Full vocabulary audit deferred. |
| F12 | M0 onboarding still (30-sec annotated screenshot) | Asset production — needs a screenshot capture pass. |
| F14 | Leadership track thin (5 of 24 branched) | Requires new track-variant rows on M1, M2, M4 lessons. |
| F15 | Back-office track misses Excel / Copilot-in-Excel | New content. |
| F16 | customer_facing track misses denial letters + collections | New content. |
| F17 | TPRM thread on M2.2 | Partly addressed via F3 (M4.1 + M5.1 carry the thread). M2.2 vendor list still needs a brief TPRM frame. |

---

## Round 2 (Pair 1) — new findings, queued

### P1.1 · M3.2 is the course's worst cognitive-load offender · **CRITICAL**

Six new constructs on one screen (three levers, diff-highlight UI, slot-machine warning, no-save rule) with the only formative check being "notice." Sweller's Cognitive Load Theory predicts working-memory overflow for the target reader.

**Proposed fix:** split the A/B sandbox into two lessons OR kill the diff-highlight panel and sequence the three levers with progressive disclosure.

### P1.2 · No enabling objectives anywhere in body_md · **HIGH**

Every lesson opens with a lede (good editorial voice) but none with a Bloom-verb objective. Wiggins/McTighe backward design needs the evidence tier (what will the learner do to prove they got it) which the knowledge checks half-fill.

**Proposed fix:** add a one-line `## Objective` block at the top of every lesson body, using Bloom verbs that match the KC level. ~24 lines of writing, course-wide.

### P1.3 · The gate is a surprise · **HIGH**

Foreshadowed once in M0.1, silent until M3.5. After 12 lessons of "we would rather just tell you" voice, a three-way fork (Pay $295 / Email / $99 assessment) presented as parallel decisions violates Nielsen #1 (visibility of system status) and Hick's law on cost-shape parity.

**Proposed fix (queued for Round 2 fixes below):** add gate-approaching reminders at M3.1 close, M3.3 close, M3.4 close. Tone the three-way fork down so it's not perceived as three equal decisions.

### P1.4 · M3.5 and M5.3 are ~2× under-timed · **HIGH**

15-min lessons asking for 25–40 min of real work product. M3.5 is the conversion finale; abandonment risk is highest exactly there.

**Proposed fix (queued for Round 2 fixes below):** update duration_min to 25 for M3.5 and 25–30 for M5.3; adjust body framing to set the expectation honestly.

### P1.5 · Knowledge checks under-test Apply/Analyze · **HIGH**

55 checks across 24 lessons skew ~75% Remember/Understand; the four that hit Apply (m0.2/Q3, m1.4/Q2, m3.3/Q3, m4.4/Q2) are also the four that *teach* by checking.

**Proposed fix:** rebalance toward 50/50; rewrite meta-UI questions (m1.2/Q2 — questions about the course itself) out of the bank.

---

## Round 2 — fixes landing this session

(Sandbox/PII work in Round 1 is already deployed; below are the two surgical Pair-1 content fixes.)

- P1.3 — gate foreshadowing beats at M3.1, M3.3, M3.4 close (next).
- P1.4 — M3.5 + M5.3 timing honesty (next).
