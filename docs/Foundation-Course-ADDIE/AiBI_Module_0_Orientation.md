# Module 0 — Orientation *(detailed curriculum)*
### AiBI Foundation Course · "We turn your bankers into your builders."

| | |
|---|---|
| **Tier** | Free |
| **Lessons** | 2 (both video) |
| **Total runtime** | ~15 min |
| **Sandbox** | None (first sandbox is Lesson 2.3) |
| **Module takeaway** | **Data Discipline Card** (Toolbox artifact, produced in 0.2) |
| **Module objective** | The learner can navigate the course, understands the free/paid structure and the Toolbox, has selected their role track, and can state the one data rule that governs everything that follows. |

**How to read this spec (the rail).** Every lesson is written as **Hook → Teach → Do → Take → Check**. Each beat carries two layers, per your "both layered" choice:
- **SCRIPT (verbatim)** — record-ready narration, word-for-word.
- **PRODUCTION** — on-screen elements, b-roll/graphics, interaction, and timing.

Branched lessons render all 5 role tracks. (M0 has no *branched* lesson, but 0.2's "Do" and the Data Discipline Card include full per-track content, since data discipline is role-specific.)

---

## Lesson 0.1 — How this course works + your Toolbox
**Video · ~7 min · Free**
**Objective:** *Understand* how the course is structured, what the Toolbox is, and *select* your role track.

| Beat | Time |
|---|---|
| Hook | 0:00–0:35 |
| Teach | 0:35–4:30 |
| Do (track select) | 4:30–6:00 |
| Take + Check | 6:00–7:00 |

### HOOK
**SCRIPT (verbatim):**
> "If you've been hearing about AI for the last couple of years and feeling somewhere between *curious* and *quietly nervous* — you're in the right room. You don't need to be technical. You don't need to have used any of this before. By the end of this course, you won't just understand generative AI — you'll have *built* something with it that's useful to your actual job. Let's start with how this works."

**PRODUCTION:** Warm open on presenter or clean title card. On-screen: the line *"From 'I've heard of it' → 'I built it.'"* Keep it calm and human — this beat exists to lower the temperature.

### TEACH
**SCRIPT (verbatim):**
> "Three things to know before we go anywhere.
>
> **First, how it's built.** Six short modules. No lesson is longer than fifteen minutes, so you can do this between meetings. We start simple — what this stuff even *is* — and each module asks a little more of you, until you're framing a problem and building a working prototype. You don't skip ahead; each step earns the next.
>
> **Second, the Toolbox — and this is the part that makes this course different.** In most training you walk away with a certificate and a vague feeling. Here, you walk away with *tools you actually use*. Every lesson, you'll create something real — a prompt, a reusable skill, eventually a small app — and it gets saved to your Toolbox. By the end you've got a kit you can open on Monday morning and put to work. The course's real output isn't a badge. It's the Toolbox.
>
> **Third, what's free and what's not — because I'd rather just tell you.** The first four modules, including this one, are free. That's where you learn to *use* AI well. After Module 3 there's a gate. Beyond it, you learn to *build* — and that part is paid. There's one small catch even in the free part: to *keep* what you make, you'll give us an email at the gate, or you'll upgrade. Nothing saves anonymously. That's it. No surprises.
>
> Last thing before you start: this course adapts to your role. A compliance officer and a teller and a CIO should not get the same examples — so pick your track, and the hands-on parts will speak your language."

**PRODUCTION:**
- Animated course map: 6 module tiles, M0–M3 marked *Free* (emerald), gate marker, M4–M5 marked *Paid* (bronze). Reuse the overview's visual language.
- Toolbox motif: an empty kit that fills with icons (prompt, skill, PRD, prototype) as the modules name them.
- Simple "Free → Gate → Paid" strip with the email/pay note.
- Transition into the track picker.

### DO — Select your track
**SCRIPT (verbatim):**
> "Pick the one that's closest to your day. You can change it any time."

**PRODUCTION (interaction):** Five large tappable cards. If the learner arrived from the Readiness Assessment, their track is **pre-selected** (badge: *"Set from your assessment — change if you like"*).
1. **Risk & Compliance**
2. **Customer-Facing** (frontline, retail, lending)
3. **Back-Office Process** (operations, marketing)
4. **Technical** (IT)
5. **Leadership**

Selection writes `profile.track` `[Supabase]`; drives every branched lesson downstream.

### TAKE — Your Course Roadmap
A light, personalized one-pager generated from the choice: their track, the six modules, what's free vs. paid, and the list of Toolbox items they'll build. (Setup artifact; the first *formal* Toolbox artifact comes in 0.2.)

### CHECK
1. *How long is the longest lesson?* → **15 minutes or less.**
2. *What do you have to do to keep something you create?* → **Give an email at the gate, or upgrade — nothing saves anonymously.**
3. *Can you change your track later?* → **Yes, any time.**

---

## Lesson 0.2 — The one rule that matters: data discipline
**Video · ~8 min · Free**
**Objective:** *State* the data-discipline rule and *identify* what counts as off-limits in your own role.

| Beat | Time |
|---|---|
| Hook | 0:00–0:35 |
| Teach | 0:35–5:00 |
| Do (off-limits in your world) | 5:00–7:00 |
| Take + Check | 7:00–8:00 |

### HOOK
**SCRIPT (verbatim):**
> "Before you touch a single AI tool, there's one rule. Just one. Get this right, and everything else in this course is safe to explore — you can be as bold and curious as you want. Get it wrong, and it's the kind of mistake that ends up in an exam finding. So let's make it simple and make it stick."

**PRODUCTION:** Single bold card: *"One rule."* Tone is serious-but-calm — this is the guardrail that *enables* boldness, not a scolding.

### TEACH
**SCRIPT (verbatim):**
> "Here's the rule: **never put customer or confidential data into an AI tool.** No names tied to accounts. No account numbers, card numbers, or Social Security numbers. No customer financials. And nothing material that isn't public yet. If you'd be uncomfortable reading it aloud in a crowded elevator, it doesn't go in.
>
> Why so strict? Because once you paste something into a tool, you've handed it to a system you don't control. Depending on the tool, that text can be stored, reviewed, or used in ways you can't take back. For a bank, that's not just awkward — it's a regulatory and reputational problem. Consumer chat apps and enterprise tools handle your data differently, and most people can't tell which is which in the moment. So we don't gamble. We use one habit that works everywhere.
>
> And here's the part people miss: **this rule almost never stops you from getting the help you want.** You just describe the *situation* instead of the *person*. Watch.
>
> Don't type: *'Customer Jane Doe, account 4471, balance twelve hundred dollars, is furious about an overdraft fee.'*
>
> Type: *'A customer is upset about an overdraft fee and feels it was unfair. Help me draft a calm, empathetic reply that explains the fee and offers next steps.'*
>
> Same help. Zero risk. That move — **describe the situation, not the person** — is one you'll use constantly.
>
> One more thing. Inside *this* course, our practice sandbox is built so you literally *can't* paste sensitive data — we've put guardrails on it. But out in the real tools, on your own, there are no guardrails. So this habit is the thing that keeps you safe when the training wheels come off."

**PRODUCTION:**
- On-screen list builds as narrated: *names + accounts · account / card / SSN numbers · customer financials · material non-public info.* End line: *"If you wouldn't say it in a crowded elevator, it doesn't go in."*
- Side-by-side "Don't / Do" cards for the overdraft example; highlight the swap. Pull-quote: **"Describe the situation, not the person."**
- Brief icon note on the course sandbox guardrail vs. real tools.

### DO — Off-limits in your world *(all 5 tracks)*
**SCRIPT (verbatim):**
> "Now make it concrete for *your* job. Here's what's off-limits in your world — and a quick gut-check."

**PRODUCTION (interaction):** Render the block for the learner's selected track. Show the role's "off-limits" list, then a 4-item quick sort: *Safe to share* vs. *Anonymize first*. Immediate feedback.

**Risk & Compliance**
- *Off-limits:* exam findings, MRAs/MRIAs, SAR/BSA filings, audit workpapers, complaint records with identifiers, anything marked confidential or privileged.
- *Sort items:* (a) a public CFPB rule summary — **safe**; (b) an internal exam finding — **anonymize/never**; (c) a SAR narrative — **never**; (d) "summarize the general requirements of Reg E" — **safe**.

**Customer-Facing** (frontline, retail, lending)
- *Off-limits:* account/card numbers, SSNs, balances tied to a name, loan application details, income/employment data, anything from a credit report.
- *Sort items:* (a) "draft a friendly explanation of how overdraft fees work" — **safe**; (b) a member's account number + balance — **never**; (c) a scanned loan app — **never**; (d) a generic objection-handling script request — **safe**.

**Back-Office Process** (operations, marketing)
- *Off-limits:* customer lists, transaction files, non-public internal financials, employee PII, contact data for campaigns.
- *Sort items:* (a) "rewrite this internal process memo for clarity" (no customer data) — **safe**; (b) a customer export CSV — **never**; (c) "write a press release about our new mobile app" (public info) — **safe**; (d) a list of cardholders for a mailer — **anonymize/never**.

**Technical** (IT)
- *Off-limits:* credentials, passwords, API keys, system logs containing customer data, network/security configs, source code with secrets, PII in database exports.
- *Sort items:* (a) "explain this generic error message" — **safe**; (b) a log snippet with customer PII — **anonymize/never**; (c) a config file with live keys — **never**; (d) "outline a checklist for evaluating an AI vendor" — **safe**.

**Leadership**
- *Off-limits:* board materials, M&A or strategic plans, earnings before release (MNPI), personnel/HR matters, confidential financials.
- *Sort items:* (a) "summarize public trends in community banking" — **safe**; (b) pre-release earnings — **never**; (c) a confidential board deck — **never**; (d) "help me frame talking points on AI strategy" (no confidential specifics) — **safe**.

### TAKE — The Data Discipline Card *(Toolbox artifact)*
Saved to the Toolbox; printable. Renders the universal rule + the anonymize move + the learner's role-specific off-limits list. Full template below.

### CHECK
1. *Which can go into a public AI tool?* → **An anonymized situation ("a customer is upset about a fee").** Not raw account data.
2. *What's the fix when you need to use real details?* → **Describe the situation, not the person — anonymize or generalize.**
3. *True/False: this course's sandbox will stop you from pasting an account number.* → **True (but real tools won't — the habit is yours).**

---

## Toolbox Artifact — Data Discipline Card (template)
*Renders the learner's track block. Stored as `.md`, exportable/printable.*

```markdown
# 🛡️ Data Discipline Card — AiBI
## The one rule
Never put customer or confidential data into an AI tool.
No names + accounts · no account/card/SSN numbers · no customer financials · no material non-public info.
> If you wouldn't say it aloud in a crowded elevator, it doesn't go in.

## The move that keeps you working
**Describe the situation, not the person.**
- ❌ "Customer Jane Doe, acct 4471, $1,200 balance, furious about an overdraft fee."
- ✅ "A customer is upset about an overdraft fee they feel was unfair — draft a calm, empathetic reply."

## Off-limits in MY world — [TRACK]
[Renders the selected track's list, e.g. Risk & Compliance:]
- Exam findings, MRAs/MRIAs
- SAR/BSA filings, audit workpapers
- Complaint records with identifiers
- Anything marked confidential or privileged

## When in doubt
Anonymize it, generalize it, or don't send it. The help is almost always available without the sensitive details.
```

---

## Module 0 — Production checklist
- [ ] Record 2 video lessons (~7 + ~8 min); **captions + transcript** each `[Supabase storage]`.
- [ ] Build the track-selection interaction (writes `profile.track`).
- [ ] Build the "off-limits in your world" sorter (5 track variants, instant feedback).
- [ ] Author the "Course Roadmap" generator (light) and the **Data Discipline Card** template (all 5 track blocks).
- [ ] Wire the 6 knowledge-check items (3 per lesson) → log results `[Supabase]`.
- [ ] Accessibility pass: keyboard-navigable interactions, contrast, transcripts (WCAG 2.1 AA).
- [ ] Confirm both lessons land ≤15 min including interaction.
