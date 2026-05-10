# Single Prompt Card — Template

Use this six-field template for every prompt in your library. The discipline matters more than the elegance.

---

## 1. Name

Three to five words. Plain English. No jargon, no acronyms, no version numbers.

> _Examples: "Meeting summary — internal committee" (good). "Promptv2-Final" (bad). "ALCO summarizer" (acronym — bad)._

**Your prompt name:** [_______________]

---

## 2. When to use it

One or two sentences. Who runs this prompt, when, and what trigger event makes them remember to use it.

> _Example: "After any internal committee meeting where the secretary needs a one-page action register from the meeting notes. Use within 24 hours of the meeting."_

**Your description:** [_______________]

---

## 3. The prompt

The actual text. Use {placeholders} for variable inputs. Be specific about format expectations.

A good banking prompt structure:

```
You are a [role] assistant for a community bank.

[Context: 1-2 sentences about what the AI is being given]

[Input goes here: {variable_input}]

Produce [output specification]:

1. [Numbered list of expected output sections]
2. [...]

Tone: [explicit tone direction — factual, warm, skeptical, etc.]

[Closing constraints: word limit, what to do if input is unclear, what to escalate]
```

**Your prompt:** [_______________]

---

## 4. What-not-to-paste

Bullets. Never blank. The cost of leaving this empty is a teller pasting customer PII into a public chat tool.

Standard items every prompt should include:

- Customer PII (name, account, balance, SSN, address, email)
- Internal financial figures pre-board-approval
- Examination findings or regulator correspondence
- Personnel matters (compensation, performance, hiring)
- Vendor contract terms

Add prompt-specific items based on what this particular prompt invites you to paste.

**Your what-not-to-paste rules:**
- [_______________]
- [_______________]
- [_______________]

---

## 5. Verified example output

You ran this prompt at least once with real (sanitized) input and verified the output by hand. Note what worked, what you corrected, and any issues observed.

> _Example: "Used for the March 2026 ALCO meeting. Output produced a clean one-page summary; the secretary verified all action items matched her notes before circulating. No fabrication detected."_

**Your verification note:** [_______________]

---

## 6. Last reviewed date

The date you last verified this prompt still produces good output. Re-test every 6 months minimum.

**Last reviewed:** [YYYY-MM-DD]
**Next review:** [YYYY-MM-DD — six months from last review]
