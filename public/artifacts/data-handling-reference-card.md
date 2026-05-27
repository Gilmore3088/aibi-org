# Data Handling Reference Card

For staff using AI tools. One page. Keep it within reach.

## Before you paste anything

Ask three questions:

1. **What data class is this?** Green (public), Yellow (internal,
   non-customer), Red (NPI / PII / loan files).
2. **Is this an approved tool for that class?** If you're not certain, ask
   your manager before pasting.
3. **Could a customer's name, account number, balance, SSN, or DOB be
   inferred from the context, even if not literally typed?** If yes, the
   data is Red.

## The categories

### Green — free to use

- Public information published by the bank or credit union
- Marketing language about the institution (no internal numbers)
- Generic banking concepts, regulatory citations, FAQs
- Synthetic / fictional examples clearly labeled as such

**Examples:** drafting a press release, summarizing a public 8-K, writing
generic email templates with placeholders.

### Yellow — use approved tools only, strip identifiers

- Internal policies and procedures
- Non-customer-specific operational data
- Drafts of communications that will be reviewed before sending
- Anonymized scenario walkthroughs

**Examples:** summarizing a board memo (with names removed), drafting an
internal training module, refining policy language.

### Red — never paste into AI tools, public or approved

- Customer names + any identifier (account number, SSN, DOB, address)
- Loan files, credit applications, member account histories
- Transaction-level data tied to any identifier
- Adverse-action documentation
- Anything that would require disclosure under GLBA Privacy Rule
- Live BSA / SAR narratives or supporting documentation

**If you need AI assistance on Red work**, use only the institution's
approved tool, strip identifiers first, and operate on the scrubbed text.
When in doubt: do not paste; ask first.

## The placeholder pattern

Replace identifying details with bracketed placeholders. The AI can still
produce useful drafts on the structure.

- `[CUSTOMER]`, `[MEMBER]`
- `[ACCOUNT NUMBER]`, `[LOAN ID]`
- `[BALANCE]`, `[TRANSACTION AMOUNT]`
- `[DATE]`, `[BRANCH]`

## Before you send the output

- Read every fact. AI tools make confident-sounding errors on numbers,
  dates, regulatory citations, and policy claims.
- Flag any uncertain claim with `[VERIFY]` and resolve before use.
- For customer-facing or regulated work, route through a human reviewer
  even if the prompt was Green-class.

## Escalate any of these immediately

- A coworker pasting Red data into a public tool
- A vendor demo that asks for live customer data
- A policy gap you can't resolve from this card
- An AI output that contradicts your institution's stated policy

## Citations

- GLBA Privacy Rule (Title V, Subtitle A) — confidentiality of nonpublic
  personal information
- AIEOG AI Lexicon, US Treasury / FBIIC / FSSCC, February 2026
- SR 11-7 Guidance on Model Risk Management, Federal Reserve / OCC
- Interagency Guidance on Third-Party Risk Management, Federal Reserve / OCC / FDIC
