# Open Questions

What's still unresolved across the AiBI build. Prune weekly. When something
gets decided, move it to `decisions-log.md` and delete from this file.

Each open question has a status:

- **Blocking** — Phase 1 can't start without this
- **Needed soon** — required before a specific upcoming phase
- **Backlog** — worth a decision eventually, not urgent

---

## Blocking

### Authoring workstream owner for V1 framework content

The implementation plan estimates 25,000–35,000 words for V1 of both frameworks
combined. This cannot be drafted purely by AI — banker-specific examples and
citations require human authorship and review. Before Phase 2 starts, decide:

- Founder authors V1 directly with AI drafting assistance, OR
- Engage a banker-experienced ghostwriter / fellow, OR
- Commission a content agency that specializes in regulated-industry writing

**Cost of waiting:** Engineering Phase 2 stalls waiting on copy. Phase 1
(infrastructure) can ship without content, but framework launch can't happen
until authoring is committed.

---

## Needed soon (before Phase 2)

### V1 launch date target

Implementation plan is 13 weeks for Phases 1–6. Pick a target launch date so
Phases can be scheduled backward. Trade-off: a public-facing date creates
useful pressure but a missed one creates credibility risk. Consider a "soft
launch" date (Standards section visible to logged-in admins only) and a
"public launch" date 2–4 weeks later.

### Content review process for V1

When a framework section draft is complete, who reviews before it ships?
Options:

1. Founder self-reviews only (fastest, lowest credibility)
2. Founder + 1–2 trusted community-bank practitioners (faster than a board,
   meaningful banker validation)
3. Soft-launch Standards Board: 3–5 named reviewers credited on V1 (most
   credible, slowest to assemble)

Option 2 is the realistic middle ground for V1, with Option 3 as the V2 goal.

---

## Needed soon (before Phase 5 — cross-linking sweep)

### Where else on the site should link to Standards

Phase 5 audits every existing page that should reference the new Standards
section. The plan lists the obvious touchpoints (assessment results, Foundation
pages, In-Depth pages, Advisory page, About page). What's missing? Specifically:

- Email templates (transactional + marketing) — do they reference the
  Foundation cert anywhere that should now read "certifies you at Capable on
  the Banker AI Fluency Rubric"?
- Stripe product descriptions — do they need updating to reference the rubric?
- Certificate PDFs — should the AiBI-Foundation completion certificate cite
  the rubric and the certified level?
- LinkedIn profile (AiBI brand) — should the company description reference the
  Standards as the institute's contribution?

Build a complete list before Phase 5 starts so the audit is exhaustive.

---

## Backlog (not blocking, decide later)

### Standards Board V1 composition

The Standards Board page is published in Phase 4. V1 acknowledges this is
founder-led and the Board is being recruited. Pre-recruit before launch, or
genuinely launch with founder-only and recruit publicly afterward?

Trade-off: pre-recruited Board adds immediate credibility but founder-only with
visible recruitment signals authentic institutional growth.

### Glossary depth for V1

V1 estimate is 20–30 terms. Some terms are obvious (Capable, Embedded, Leading,
Rewired). Others are judgment calls — do we define "model risk," "examiner
readiness," "tech muscle," "agent capacity," "vendor diligence" in the
glossary? Each definition is real work but each becomes inbound traffic from
external citations.

Decision can wait until Phase 4 authoring begins. Default: define liberally
in V1 (closer to 30 terms); prune in V2 if any never get cited externally.

### OG image generation strategy

Implementation plan calls for dynamic OG images via `opengraph-image.tsx` at
each Standards route. Alternative: hand-author 8–10 static images that cover
every Standards page type. Static is faster to V1; dynamic scales better as
more glossary terms and version histories appear.

Default: static images for V1, migrate to dynamic when glossary exceeds 30
terms or annual reports launch.

### Assessment scoring rewrite

The free and In-Depth assessments currently output scores not mapped to the
rubric. Rewriting them to position respondents on the framework is Phase 7+
work — explicitly out of scope for the Standards launch.

But: every assessment taken before the rewrite is data that won't have
rubric mappings. Decide whether to:

1. Pause assessment taking until rewrite is done (revenue impact)
2. Take assessments as-is and retroactively map after rewrite (data quality
   risk)
3. Add a temporary banner: "Your score will be mapped to the new Banker AI
   Fluency Rubric in [date]" (lowest risk, sets expectation)

Option 3 is the realistic answer. Plan to add the banner when Standards
launches and the rewrite begins.

### Translation / accessibility for non-English bankers

Some U.S. community banks serve Spanish-language customer bases. Should V1
of the Standards include Spanish translation? Probably not for launch
(adds complexity, delays). Backlog item for V2 or V3 once English V1 is
established.

### Annual report cadence and authorship

First *State of Banker AI Fluency* report is Phase 11 (month 6+). Open
questions:

- Calendar year, fiscal year, or AiBI anniversary timing?
- Authored by founder, by AiBI research team (doesn't exist yet), or
  by Standards Board?
- Distribution: free PDF, gated email capture, or paid premium edition?

Decide closer to Phase 11.

---

## How to use this file

1. **Weekly review** — open every Friday, mark what got decided, move those
   to `decisions-log.md`, delete from here.
2. **Pre-phase review** — before kicking off any new phase, scan this file
   for anything tagged "Needed soon" relevant to that phase.
3. **Adding a question** — add at the bottom of the relevant section
   (Blocking / Needed soon / Backlog) with a short paragraph stating the
   question and the trade-offs.

If a question sits in "Backlog" for more than 90 days untouched, force a
decision or delete it. Stale open questions are noise.
