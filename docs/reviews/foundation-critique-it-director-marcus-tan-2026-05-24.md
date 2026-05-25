# Foundation Course Critique — Marcus Tan, Director of IT/InfoSec, Lakeside Community Bank ($680M)

**Reviewer profile:** 14 yrs financial-services IT · CISSP/CISM · runs 6-person team · technical, can read code · 38
**Reviewed:** all 24 lessons + gate · sandbox source · 2026-05-24
**Methodology:** Walked every lesson (DB query + HTTP fetch), pulled the `technical` track variants from `addie.lesson_track_variants`, audited the sandbox claims in `src/lib/sandbox/pii-scanner.ts`, `src/lib/sandbox/injection-filter.ts`, `src/app/api/sandbox/chat/route.ts`, and `sandbox-service/src/exercises/piiCheck.ts`. Curled selected pages to confirm rendering and gate copy.

## Headline (3 bullets)

- **Strong on the one thing it had to get right:** the data-discipline rule (M0.2) is correctly framed, the *technical* track variant correctly extends "PII" to credentials/logs/diagrams/configs, and the no-personal-hotspot guidance in M2.1 is exactly the AUP-aligned answer I want my staff to internalize. This is the first AI training I've seen that doesn't accidentally coach people around our controls.
- **The "injection-resistant sandbox" security claim does not survive a code read.** The `/api/sandbox/chat` endpoint accepts the system prompt from the client body (`src/app/api/sandbox/chat/route.ts:102, 189`). Any caller — including a learner with browser devtools — can rewrite it. The PII regex is also weaker than the page copy implies. Calling this "training-appropriate guardrails" is fair; calling it the technical justification for relaxing data discipline is not, and the lessons should not lean on it.
- **M5 ships my biggest open risk straight to my non-technical staff with one warning line.** The course tells learners to "build a prototype" in Lovable / Replit Agents / Claude Code / v0 with no TPRM framing on the four tools themselves, no honest discussion of what "prototype URL" means (it's a live deployed app on a vendor I haven't reviewed), and no IT-handoff guidance. The "synthetic data only" warning is correct but load-bearing — and it's one bullet.

## What works (with lesson IDs and code refs)

**M0.2 — single-rule framing is the right shape.** The "Describe the situation, not the person" save card is the line I want printed on a monitor. The bad/good case pair (`Customer Jane Doe, account 4471…` vs the anonymised version) is exactly the pattern my DLP flags in Microsoft Purview, so the course's mental model matches the control my staff will hit. The *technical* track variant (`lesson_track_variants` row for `m0.2`) correctly broadens the off-limits list to credentials, API keys, connection strings, network diagrams, firewall rules, and DB exports — and the "five-line reproducer, never the prod log" pattern is a real engineering norm, not a sales line. This is the strongest single lesson in the course.

**M1.1 — predictive-token-engine framing is honest.** Naming "training cutoff · no live knowledge · hallucination as a property" up front means a learner doesn't leave M1 thinking the model "knows" anything. That's exactly the mental model I need staff to hold before they touch a tool. The "Read every output like a loan file" line is the right tone.

**M2.1 — the SSO and firewall-routing call-outs are pitch-perfect.** "Personal hotspots and emailed files turn a learning question into a data-loss incident" and "the block is a signal, not a puzzle" are sentences I will quote verbatim in our AUP refresher. The SSO-button tripwire — "Continue with [institution]" wires the account to your employer — is the kind of detail every vendor demo glosses over. I've seen staff click that button on a personal device and not understand what they did.

**M3.4 — "Spot the violation" is the strongest exercise.** Twelve scenarios, with the borderline-with-a-fix category, trains the second look. The warning "Passing data-discipline does not make a use case safe… asking a public tool to draft a press release about a non-public product launch passes PII rules and still violates MNPI" is genuinely sophisticated. Most AI training conflates PII with confidentiality; this one doesn't.

**M5.1 — agent framing is honest.** "Step 1 decides. Step 2 acts. Step 3 checks. Step 4 loops or stops. Inside that loop the agent takes actions — reads, writes, calls APIs — without asking. Today's agents drift, invent plausible-wrong steps, occasionally act outside the loop." This is the rare AI course that doesn't oversell agents to bankers. The closing line — "Drafts are not deployments. Do not put a draft in front of a member, connect it to a system of record, or give it permission to move money" — is the line I would have inserted myself.

**Technical track variant in M1.3.** The audio script names the three real wins (code partner, vendor evaluator, documentarian) and ends on "no credentials, no production data, no customer records in a public tool. Ever." This matches what I actually want my team doing.

## What's weak — gaps for IT/security staff

**1. No discussion of logging, audit trails, or eDiscovery.** Nothing in the course tells a banker that the consumer Claude/ChatGPT/Gemini account they're using has its own retention policy, its own subpoena surface, and its own data-export pathway that does not flow through our M365 retention rules. For an examiner asking "where did this draft originate?", the answer "Jane's personal ChatGPT account" is a finding. The course should add a one-liner: *the conversation history exists, it lives at the vendor, and it survives you closing the tab.* I'd want this in M2.2 next to the "embedded copilot" family, where licensing/tenant settings already get a mention.

**2. M2.1 acknowledges "ask which tool is sanctioned" but never acknowledges that IT may say "none."** I've said exactly that to ~30 staff over the last 18 months. The course implicitly assumes "yes gives you the right tool, no gives you cover to learn on personal accounts." Personal accounts on a personal device, on a personal network, with no work material — fine. The wording is close enough to that line that I don't think it crosses, but it should make the line explicit. A `[warn]` card after the M2.1 firewall-routing case: *"No sanctioned tool yet" is not permission to use a personal account for work material. Practice on the public material from this course; bring the work back when IT clears a tool.*

**3. Vendor / 3rd-party risk is named once (M1.3 technical variant: "Interagency TPRM Guidance"), then dropped.** M2.2 lists Claude, ChatGPT, Gemini, Copilot, NotebookLM, Perplexity, Lovable, Replit Agents, v0, Cursor, Claude Code, Stitch, M365 Copilot, Workspace Gemini, Zoom AI by name. Zero of them are framed as third-party vendors with data flows my Vendor Manager has to onboard. For a CISSP-trained reviewer this is the largest curriculum gap: the course treats the *individual user's* data discipline as the entire control surface, but the institutional control surface is a TPRM record per vendor, a DPA, sub-processor disclosure, US-data-residency assertion, model-training-opt-out flag, and a breach-notification clause. Module 5's "Vendor DD checklist generator" skill (technical track) is the closest the course gets, and it's framed as a *prompt-engineering* exercise rather than as a checklist that should ship with the Interagency TPRM Guidance categories pre-populated. The skill saves something useful; the course never names what should be on it.

**4. The sandbox PII regex is weaker than the page copy implies.** Per `src/lib/sandbox/pii-scanner.ts`:
- SSN detection requires either the dashed `XXX-XX-XXXX` form OR exactly 9 contiguous digits with no surrounding digits. `123 45 6789` (spaces) passes through. `1234567890` (10 digits with the SSN embedded plus a trailing 0) passes through.
- Account-number detection skips 4-digit and 8-digit "plausible year" strings — so `20240115` looks like a date but `20239876` does not; the guard is `slice(0,4)` only.
- Phone detection requires separators; ten contiguous digits don't trip it (10 digits will trip account, but the *message shown* says "appears to contain an account number," not "phone").
- There is no card-PAN/Luhn check in this scanner. (The *separate* `sandbox-service/src/exercises/piiCheck.ts` has Luhn + ABA, but it's only used by `/api/sandbox/run` and `/ab` — not by the `/api/sandbox/chat` path that M2.3 and M3.x lessons actually call.)

The M0.2 copy is careful — "This course's sandbox blocks sensitive paste. Real tools do not. The habit is what keeps you safe when the training wheels come off." That framing is honest. But M2.3 promises "The sandbox blocks paste of account-number / SSN / full-name patterns" — there is no full-name detector in either file. I would soften M2.3 to: *"The sandbox blocks the most common digit-pattern paste mistakes — SSNs, account numbers, phone numbers, emails. It does not detect names. Outside this course nothing catches any of it for you."*

**5. The "injection-resistant" claim from CLAUDE.md branch scope does not hold for `/api/sandbox/chat`.** `src/app/api/sandbox/chat/route.ts` accepts `systemPrompt` as a string from the request body and passes it directly into `streamClaude(systemPrompt, messages)` (line 189). Any client can rewrite it; the server validates only that it's a non-empty string. The injection filter in `src/lib/sandbox/injection-filter.ts` scans the latest *user* message for "ignore previous instructions" / "DAN" / "you are now" / 3+ pipes etc., but it does not protect the system prompt itself, and it doesn't scan *prior* user messages in the same conversation. A learner who pastes "ignore previous instructions" in turn 1 and then sends a normal message in turn 2 will skate through. This may be acceptable for a *training* sandbox — there's nothing sensitive behind the prompt to protect — but the security claim shouldn't be relied on in lesson copy, and an IT director reading the lesson copy is going to assume there's more behind it than there is.

The `/api/sandbox/run` and `/api/sandbox/ab` paths look better (server-side system prompt assembly in `sandbox-service`, Luhn/ABA in `piiCheck.ts`). The split between the two paths is not visible to the learner. Document it for ops, or unify on the stronger path.

**6. M5.2/M5.4 prototyping is the largest IT-risk surface and gets one bullet.** M5.2 lists Lovable, Replit Agents, Claude Code, v0 as the four prototyping tools. The lesson body doesn't differentiate their blast radii:
- **Lovable** generates a Vercel/Netlify-hosted React app from a brief. The app runs publicly. If a learner pastes "synthetic" data that turns out to be a lightly-changed real complaint, that complaint is now indexable.
- **Replit Agents** has shell access in a dev container. That's a different blast radius — it can install packages, run shell commands, and reach the public internet from a real VM. A staffer who tells it "go grab the latest from this S3 bucket" can move data without realizing it.
- **Claude Code** runs locally on the staffer's machine with their filesystem and shell. If the learner is on a corp laptop and runs Claude Code with project context that includes a checked-out repo, the model sees that repo. Worse, it can edit files.
- **v0** is a React UI mockup generator with no execution — lowest risk of the four.

None of this is in the course. The "synthetic data only" warning is the right *principle*, but the principle is doing all the work, and a non-technical staffer reading M5.2/M5.4 will not understand that running Claude Code on their work laptop is materially different from clicking around Lovable in a browser. Recommendation: a single matrix card on M5.4 — *tool · what it produces · where it runs · what it can reach* — separating "browser-only mockup" from "agent with shell access on your machine" from "agent in a remote VM that can hit the internet."

And the close: "You shipped a prototype. That is the bridge from banker to builder." For my staff this is the moment I want a sentence reading *"Before you show this to anyone at the bank, send the URL to IT. Prototype is a status, not a deployment."* Today it reads as a victory lap.

**7. The course never mentions IT-managed eval / audit logs for the staffer's own AI use.** If I'm going to support 140 FTE using consumer AI tools for a quarter while we onboard a sanctioned tool, the one thing I want them all doing is keeping a personal log of what they used AI for and what they checked. M2.4 gets close ("where AI fits in your week") but frames it as a *productivity* worksheet rather than an *audit-trail* worksheet. Adding a "what would I tell an examiner I used this for" field would close the loop.

## Security claims audit (sandbox, providers, paste-guards)

| Claim (lesson) | Reality (code) | Verdict |
|---|---|---|
| "sandbox talks to the same Anthropic model as claude.ai" (M2.3) | `streamClaude` in `src/lib/sandbox/providers/claude.ts` | Plausible — accept |
| "The sandbox blocks paste of account-number / SSN / full-name patterns" (M2.3 warn) | `pii-scanner.ts`: account, SSN, email, phone, DOB-with-keyword. **No name detection.** | Inaccurate — soften copy |
| "injection-resistant" (CLAUDE.md branch-scope claim about the sandbox) | Filter scans only the *latest user message*, allowlist is liberal, system prompt is client-supplied on `/api/sandbox/chat` | Overstated — claim should be "input-scanned" not "injection-resistant" |
| "PII screen as the sandbox" rejects "real names + account numbers, full SSNs, draft SAR narratives" before the model sees them (M4.2 warn) | No name detector and no SAR-narrative detector exist; account/SSN detection works on common shapes only | Inaccurate — names/narratives are not rejected. Same softening applies. |
| "training-appropriate guardrails" (M2.3) | Fair characterisation of what's actually shipped | Accept |

The honest framing is: *the sandbox blocks the most common digit-paste mistakes and the most common jailbreak phrasings. Treat that as a learner's seat belt, not as a vendor SOC 2 control.*

## UX findings

**Match between system and real world.** Mostly good. "Assistant / Skill / Agent" in M5.1 matches Anthropic's marketing terminology and Cornerstone's playbook. "Construction crew" for the Lovable/Replit family is a friendly metaphor that survives mapping to "code-gen agent" in vendor docs. **Gap:** no lesson links to canonical Anthropic / OpenAI / Gemini documentation — not even a "Where to go next" footnote in M5.5. A technical learner who finishes the course and wants the real API docs has to Google. One footnote per tool family in M2.2 would close this.

**Expert vs novice paths.** No acceleration. M1.1's "predictive token engine" lesson assumes zero prior knowledge; there's no "I know what tokens are, skip ahead" path. For me personally — and for any of my 6 staff — M0–M2 is 70 minutes I don't need. A `Skip if you've used the Anthropic API` button on each video lesson, gated to track=technical, would be the right affordance. Today the track-picker only swaps content on the four branched lessons; modality and depth don't change.

**Error prevention.** The sandbox PII block + the M3.4 violation drill teach the right habits. The lesson copy is not careful enough about what real tools *don't* catch. M2.3 says "outside this course no public tool catches that for you" — true, but a paragraph in M0.2 or M2.3 listing what M365 Purview / CASB / DLP *does* catch on a sanctioned tenant would help an IT-supported learner understand which protections their actual workplace already has. Right now the course implies "you're on your own" — for unsanctioned tools, yes; for our sanctioned Copilot tenant, no.

**Documentation & references.** Weak. The course cites SR 11-7, Interagency TPRM Guidance, ECOA/Reg B, AIEOG AI Lexicon, FDIC stats by name — credibility-positive — but does not link to them, and does not link to a single vendor doc. A reference appendix in M5.5 (or a "Further reading" section per lesson) would land well for technical learners. Today the artifact list in M5.5 is the closing flourish, and that's where I'd add a "Canonical references" block.

**Mental model.** Solid. M1.1's three-property framing is the best mental-model lesson. The "context window" is *not* explicitly named anywhere I saw, though — for a technical learner that's a gap because it shows up in every API doc. Worth one paragraph in M3.1 or M3.3: *"Context is the model's working memory for this conversation; it doesn't persist between conversations unless you re-paste it."*

**System architecture transparency.** None. A technical learner hitting "send" in the sandbox sees a streamed response and has no visibility into: which model, which provider, what system prompt, how the message was scanned. For my staff this isn't critical, but for me as the IT director evaluating whether to allow this tool — yes, it matters, and a footer reading *"Powered by Anthropic claude-3-5-sonnet · scanned for PII patterns · system prompt fixed per lesson"* would buy goodwill and shorten the conversation with my CISO peer.

**Accessibility / browser compatibility.** Did not run a multi-browser test in this session (curl-only). The page sizes are reasonable (M2.3 is 131KB which is fine). Recommend a Safari + Edge pass before launch — the M3.4 sortable-matrix drill in particular sounds like the kind of thing that breaks on Safari touch events.

## Track variants (technical) — does the role lens hold for IT?

Five rows: `m0.2`, `m1.3`, `m2.4`, `m3.5`, `m4.3`. They are good — better than the rest of the course on the IT lens — but they're also the only places the course leans into the technical voice. **The non-branched lessons (M1.1, M1.2, M1.4, M2.1, M2.2, M2.3, M3.1, M3.2, M3.3, M3.4, M4.1, M4.2, M4.4, M5.1, M5.2, M5.3, M5.4, M5.5) all read the same regardless of track.** For me, the friction is the customer-facing examples — "draft a calm reply to an upset member" — that show up in 8 of the 24 lessons. An IT staffer doesn't draft member replies. The non-branched lessons should have at least *one* track-aware example, even if it's just swapping the closing example to match the picked track.

The M4.3 technical variant is the best track-specific lesson: a vendor-DD-checklist skill is a real artifact my team would use weekly. That should be the model for every track-variant — *one named, kept artifact that survives the course.*

## Gate experience

Curled `/foundation/gate` (HTTP 200, 55KB). Copy includes "Pay" / "$295" / "Email" / "Decline" / "$99" — three-way gate is present and the pricing matches the canonical spec. The "save anything = give us an email" rule from M0.1 is honest and well-framed; a paying-banker reads it as fair exchange, not as extraction. **For IT:** the gate is a reasonable hard stop for the institution. I would not have my staff continue into M4/M5 on personal email; if Lakeside is paying, the email on the gate should be the work email and the team SKU is the right purchase. The course should say this explicitly at the gate: a one-liner *"If your institution may pay, use your work email here so the next page offers the team option."* Today the gate language is generic.

## Paid modules (M4 + M5) — would you let staff complete M5 without IT oversight?

**M4: yes.** Skills as "saved prompts with locked choices and named slots" is a useful abstraction that does not change the blast radius. The PII screen in M4.2 ("rejects real names + account numbers, full SSNs, draft SAR narratives") needs the rewrite above — but the framing of *bounded scope as a feature* is correct and exactly the line I'd want my staff repeating to a vendor pitching them an agent. Skills are reversible, they don't spawn infrastructure, and they live in the same sandbox the learner has been using since M2.3.

**M5: not without an IT sit-down first.** Three reasons:
1. M5.4 ships my staff to four different vendors I have not done TPRM on. Lovable, Replit, v0, and Claude Code are real products my Vendor Manager would need to onboard before I'd authorize an account.
2. The "synthetic data" guidance is the entire control. One bullet is not enough. If a staffer's "synthetic" complaint is just their real Tuesday complaint with names changed, the underlying complaint pattern is still institutional information. The course should add a *minimum-distance* rule: *"Synthetic means invented from scratch. If you can recognize the real case it's based on, it's not synthetic."*
3. The "shipped a prototype" framing implies a deployable thing exists at the end. For me to authorize a staffer to point a stakeholder at a `lovable.app` URL, I need a deploy-review step that the course does not contain. A `[warn]` card on M5.4 — *"A prototype URL is a live deployed app on a third-party vendor. Treat the URL as you would treat a draft press release: cleared by IT before it leaves your laptop"* — would close this for me.

If those three changes were made, I'd let staff complete M5. As-is, I'd ask them to stop at the gate and bring me the PRD instead.

## Verdict

**Recommend for purchase with three conditions.** The course is the best banker-targeted AI training I've read on data discipline (M0.2 alone is worth the entry price) and the only one that doesn't oversell agents. For Lakeside's 140 FTE I'd buy the team SKU contingent on:

1. **Sandbox-claim copy fixed.** M2.3 and M4.2 warnings rewritten to reflect what the regex actually catches (digits, not names). The CLAUDE.md "injection-resistant" claim should not appear in any learner-facing copy.
2. **M5 risk-framing strengthened.** A tool-blast-radius matrix in M5.4 (Lovable vs Replit Agents vs Claude Code vs v0), a stronger "synthetic data" definition, and an explicit IT-handoff line before the "shipped a prototype" close.
3. **TPRM thread added.** One sidebar per tool family in M2.2 — "what your bank's vendor manager would need to onboard this" — and a Module-5-supplement vendor-DD checklist that ships pre-populated with the Interagency TPRM Guidance categories rather than asking the learner to prompt them out of a model.

None of those are content rewrites. They're 6–8 callouts and one matrix card. Get them in and this becomes the AI training I recommend to my peers at CBA and ICBA — and the one I'd send my own CEO through before the next "we need an AI strategy" conversation.

— *Marcus Tan, Director of IT/InfoSec, Lakeside Community Bank*
