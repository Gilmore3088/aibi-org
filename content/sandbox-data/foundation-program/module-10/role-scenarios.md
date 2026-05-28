# Role Use-Case Scenarios — One AI use case per role

> Draft. Each scenario names the green / yellow / red version of the same task
> so the learner can see which one they should actually build today.

---

## Retail / Branch

**Use case:** Draft the response template for routine fee-waiver requests.

- **GREEN** — Draft a reusable template (no real member details) the
  retail manager reviews and approves. The branch tellers then fill in
  member name + specific fee inside the bank, never inside a prompt.
- **YELLOW** — Use a sanitized version of a real request (names redacted,
  amounts ranged) to refine the template. Retail manager reviews each
  output before the template is used at the counter.
- **RED** — Paste a full member complaint email (name, account, transaction
  history) into a public AI tool to draft a personalized response.

**Review owner:** Retail manager (template approval) + every teller using
it (per-use sanitization check).

---

## Lending

**Use case:** Generate the first draft of a credit memo prose section
from sanitized financial highlights.

- **GREEN** — Use placeholder financials and your bank's policy text to
  build a reusable memo template. Senior credit reviews before save.
- **YELLOW** — Use sanitized borrower-side data (industry, range of
  request, sanitized cash-flow shape) to draft a specific memo. The
  senior credit officer reviews every output before the memo reaches
  committee.
- **RED** — Paste a full borrower file (name, EIN, full financials,
  guarantor PII) into a public AI tool to "speed up" the memo.

**Review owner:** Senior credit officer for every memo before committee.

---

## Operations

**Use case:** Turn raw ALCO meeting notes into a structured one-page
summary for the executive team.

- **GREEN** — Sanitized meeting notes (no specific member or counterparty
  detail). Operations manager reviews the summary before forwarding.
- **YELLOW** — Notes that include interest-rate sensitivity scenarios
  using sanitized portfolio shapes. Operations manager + CFO review.
- **RED** — Verbatim notes including specific counterparty names,
  unhedged exposures, or non-public ALCO decisions pasted into a public
  tool.

**Review owner:** Operations manager (first pass) + CFO (final).

---

## Compliance

**Use case:** Run a draft policy through an AI tool to identify
sections that may not align with current regulatory guidance.

- **GREEN** — Public regulatory text + your draft policy (no member or
  examiner-confidential data). Compliance officer reviews the gap list.
- **YELLOW** — A redlined version of a current policy where the redlines
  reference internal incidents in sanitized form. Compliance officer +
  Legal review.
- **RED** — Paste examiner letters, board-confidential memos, or
  member-specific compliance incidents into a public tool.

**Review owner:** Compliance officer + Legal counsel for any policy that
will be adopted institution-wide.

---

## Finance

**Use case:** Convert the bullet notes from a monthly variance review
into a structured variance memo for the CFO.

- **GREEN** — Bullet notes with sanitized account categories and ranges
  (no specific account numbers, no specific member names). CFO reviews
  before distribution.
- **YELLOW** — Bullet notes with bank-aggregate ratios (NIM, efficiency
  ratio, loan-loss provision) that are not yet public. CFO reviews;
  Audit Committee chair signs off if quarterly.
- **RED** — Pre-release earnings data, board-level loan-loss provision
  decisions, or examination-related capital figures.

**Review owner:** CFO for every memo before it leaves Finance.

---

## Executive

**Use case:** Draft talking points for the next board meeting from your
own notes on the institution's AI initiative.

- **GREEN** — Your own outline notes about the AI initiative, no member
  data, no examiner correspondence. Board chair pre-reviews the talking
  points (good practice anyway).
- **YELLOW** — Your notes plus sanitized examples from the institution's
  AiBI-Foundation learners. Board chair reviews.
- **RED** — Specific examiner findings, board-confidential strategic
  decisions, or competitor non-public information in a public tool.

**Review owner:** Board chair (or designated board liaison) for the
final talking-points document.
