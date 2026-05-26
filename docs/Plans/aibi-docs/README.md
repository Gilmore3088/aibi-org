# AiBI Documentation

This is the canonical documentation set for **The AI Banking Institute (AiBI)** —
its strategy, architecture, brand, and the in-progress build of the Standards
section.

If you're opening this cold, start here.

---

## What AiBI is

AiBI is a banker-facing institute that publishes canonical frameworks for AI
fluency and transformation in community banks and credit unions, certifies
individual practitioners against those frameworks, and engages institutions
through advisory.

Two audiences:

- **Individual bankers** — buy the free assessment, the In-Depth assessment,
  and the AiBI-Foundation / AiBI-S / AiBI-L certifications
- **Institutions** — buy team In-Depth licenses and Leadership Advisory

Two published frameworks (in progress):

- **Banker AI Fluency Rubric** — individual diagnostic (4 components × 4 levels)
- **Banker AI Transformation Framework** — institutional diagnostic (6 dimensions × 4 levels)

---

## How these docs are organized

```
docs/
├── README.md                                 ← this file
├── institute-overview.md                     ← strategic story, two-track architecture
├── decisions-log.md                          ← what's been decided and when
├── open-questions.md                         ← what's still unresolved
├── standards-implementation-plan.md          ← the build plan for the Standards section
│
├── standards/
│   ├── fluency-rubric-spec.md                ← V1 spec for authoring the Rubric
│   ├── transformation-framework-spec.md      ← V1 spec for authoring the Framework
│   └── publication-standards.md              ← license, versioning, citation rigor
│
├── runbooks/
│   ├── pr-review-merge-closeout.md           ← the merge/cleanup pattern
│   └── content-authoring-guide.md            ← how to write for the Standards section
│
└── brand/
    └── brand-guide.md                        ← the Ledger design system + voice rules
```

## Where to start by role

**I'm a developer picking up the Standards section build.**
→ Read `institute-overview.md`, then `standards-implementation-plan.md`,
  then `brand/brand-guide.md`. The decisions log will spare you from
  re-debating settled questions.

**I'm authoring the Fluency Rubric or Transformation Framework content.**
→ Read `standards/fluency-rubric-spec.md` or `standards/transformation-framework-spec.md`,
  then `runbooks/content-authoring-guide.md`, then `brand/brand-guide.md` for voice.

**I'm reviewing a PR.**
→ `runbooks/pr-review-merge-closeout.md`.

**I want to understand the strategy.**
→ `institute-overview.md`.

**I want to see what's been decided so I don't re-debate it.**
→ `decisions-log.md`.

**I want to see what's still open.**
→ `open-questions.md`.

---

## Existing canonical sources elsewhere in the repo

These docs reference but do not duplicate:

- `CLAUDE.md` (repo root) — project intelligence, critical rules, runtime details
- `DECISIONS.md` (repo root) — irreversible architectural decisions log
- `src/styles/tokens-ledger.css` — the live brand token contract
- `docs/brand-refresh-2026-05-09/` — the canonical Ledger brand bundle

When `brand/brand-guide.md` and `CLAUDE.md § Design Context` disagree, the
brand-guide is canonical for brand. When this README and `CLAUDE.md` disagree
on project rules, `CLAUDE.md` wins.

---

## Cadence

- **Decisions log** — append-only. New entries on every architectural call.
- **Open questions** — pruned weekly. Items move to decisions-log once resolved.
- **Implementation plan** — phased; check off acceptance criteria as phases ship.
- **Framework specs** — stable through V1, revised at version bumps.
- **Runbooks** — revised when the pattern they describe breaks.
- **Brand guide** — revised through the brand-evolution proposal process (see brand-guide).

Last set built: 2026-05-17.
