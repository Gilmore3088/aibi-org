'use client';

// /courses/foundation/gallery — anonymized learner-artifact gallery (client).
//
// Filter chips were added 2026-05-28 per the desktop audit: at 6,948px the
// gallery was "too long for a gallery — should support scanning, filtering,
// and selection". The chips filter by artifactType; "All" is the default.

import { useState } from 'react';
import { MockupShell } from '@/components/mockup';

interface Artifact {
  readonly module: number;
  readonly title: string;
  readonly role: string;
  readonly artifactType: string;
  readonly body: React.ReactNode;
}

const ARTIFACTS: readonly Artifact[] = [
  {
    module: 1,
    title: 'Rewritten internal email — branch coverage update',
    role: 'Branch Manager',
    artifactType: 'Email starter',
    body: (
      <pre className="gallery-pre">
{`Subject: Branch X coverage Wed–Fri — action needed by EOD Mon

Action: Sign up for one shift on the attached coverage sheet.
Deadline: End of day Monday.
Why: Two tellers out on leave; lobby coverage gap 10a–2p Wed–Fri.

If you can't cover, reply to me directly with your role — I will pair
remaining gaps with float staff. Do not paste customer names in any
reply; lobby logistics only.

— Branch Manager X`}
      </pre>
    ),
  },
  {
    module: 2,
    title: 'AI claim review — vendor presentation summary',
    role: 'Compliance Officer',
    artifactType: 'Hallucination check',
    body: (
      <pre className="gallery-pre">
{`Vendor claim: "Our LLM is 99.4% accurate at AML alert triage."
Source provided: internal vendor whitepaper, no peer review.

REVIEW
✓ Number cited (99.4%) — flagged for verification, no source link
✗ "AML alert triage" — vendor did not define the alert population
✗ "Accuracy" — no precision/recall split, can't infer false-negative rate
✓ Whitepaper — internal, not third-party audited

VERDICT
Treat as marketing material. Do not pass to AML team without:
  (a) named dataset description
  (b) precision + recall (not just accuracy)
  (c) sample of false negatives reviewed by your BSA officer`}
      </pre>
    ),
  },
  {
    module: 3,
    title: 'Prompt strategy cheat sheet — adverse action letter',
    role: 'Lending Operations',
    artifactType: 'Prompt template',
    body: (
      <pre className="gallery-pre">
{`[ROLE] You are an experienced credit analyst at a community bank.
[INPUT] Loan application denial code: {DENIAL_CODE}
        Borrower file summary (sanitized): {SUMMARY}
        Institution adverse-action standard: {INTERNAL_STANDARD}
[TASK]
  1. Write a 120-word adverse-action notice in plain English.
  2. Cite the FCRA-required disclosures inline.
  3. Use neutral, non-blaming language.
[CONSTRAINTS]
  - Never invent denial reasons not in the input.
  - Never reference race, age, marital status, source of income, or
    other protected characteristics.
  - Include the reviewer's name + date on the second line.
[REVIEW]
  Compliance officer signs off before mailing.`}
      </pre>
    ),
  },
  {
    module: 4,
    title: 'AI Work Profile — Credit Analyst',
    role: 'Credit Analyst',
    artifactType: 'Workbench Pack section',
    body: (
      <pre className="gallery-pre">
{`Role: Credit Analyst II
Daily AI uses (sanitized inputs only):
  - Adverse-action letter drafts (FCRA flow)
  - Loan committee memo summaries
  - Member-facing rate explanations

Tools approved by IT: Claude (Anthropic), Gemini (Google Workspace)
Tools NOT approved: ChatGPT (personal accounts), Notion AI

Data classification:
  GREEN — public rate sheets, regulatory text, internal SOPs
  YELLOW — sanitized loan summaries (names redacted, amounts ranged)
  RED — full borrower files, credit reports, SSN/TIN, account numbers

Review checkpoint:
  Every AI-assisted artifact is reviewed by my supervisor before it
  leaves my desk. Logged in our shared review register.`}
      </pre>
    ),
  },
  {
    module: 5,
    title: 'Project Brief — Reg E disclosure refresh',
    role: 'Compliance Manager',
    artifactType: 'Project Brief',
    body: (
      <pre className="gallery-pre">
{`Project: Reg E disclosure refresh — Q3 cycle
Audience: All checking-account holders
Source context: 2026 Reg E updates + our current disclosure language
Output format: Updated disclosure document, redline against current,
               plain-English summary for member service reps

Constraints:
  - Match our institution's voice (formal, no marketing language)
  - Cite the specific Reg E section for each change
  - Flag any change that requires committee approval

Review step:
  Draft → Compliance Officer redline → Legal sign-off → Board ratify
  before member-facing distribution.`}
      </pre>
    ),
  },
  {
    module: 9,
    title: 'Data Handling Card — sample Monday',
    role: 'Member Service Rep',
    artifactType: 'Sanitization card',
    body: (
      <pre className="gallery-pre">
{`Today's data I might paste:

  Member Q's complaint email about overdraft fee
    -> NO. Contains name + account ref. Sanitize first:
       remove name, keep complaint shape, paste sanitized version.

  Our overdraft policy text from intranet
    -> YES (Green). Public-equivalent internal SOP.

  Three sample call-center scripts for a coaching exercise
    -> YES (Green). No customer data, no PII.

  Yesterday's branch deposit total + breakdown
    -> NO. Operational data above member-aggregate; treat as Yellow
       and discuss with my supervisor before any AI use.

ESCALATE TO: BSA Officer for anything related to suspicious activity,
            Legal for anything member-litigation adjacent.`}
      </pre>
    ),
  },
  {
    module: 10,
    title: 'Role Use-Case Card — BSA Analyst',
    role: 'BSA / AML Analyst',
    artifactType: 'Role play',
    body: (
      <pre className="gallery-pre">
{`My three weekly AI-assisted tasks:

  1. SAR narrative first draft (from sanitized typology + timeline)
     - Tool: Claude
     - Review: my supervisor + BSA Officer before filing
     - Time saved: ~25 min per SAR

  2. CDD baseline drift check (compare current vs prior period)
     - Tool: Gemini
     - Review: my own verification against source records
     - Time saved: ~15 min per check

  3. Structuring pattern summary (turn raw notes into clean prose)
     - Tool: Claude
     - Review: BSA Officer
     - Time saved: ~20 min per pattern

Never use AI for: customer-facing communications, examiner work product
that hasn't been reviewed, anything with the customer's actual identity
attached to the artifact.`}
      </pre>
    ),
  },
  {
    module: 11,
    title: 'Personal prompt card — Loan committee memo',
    role: 'Senior Lender',
    artifactType: 'Saved prompt',
    body: (
      <pre className="gallery-pre">
{`Title: Loan committee memo — initial summary
When to use it: After credit analysis is complete; before formal committee
What to paste: Sanitized credit summary (no borrower name, no full SSN)
What NOT to paste: Full borrower file, credit reports, examiner letters

Prompt:
  [ROLE] You are a senior commercial lender at a community bank
  preparing a memo for the loan committee.
  [INPUT] Sanitized credit summary: {SUMMARY}
          Loan amount range: {RANGE}
          Industry: {INDUSTRY}
  [TASK] Draft a 250-word committee memo with:
    - One-sentence recommendation
    - Three strongest points supporting it
    - Two risks the committee should weigh
    - Specific policy exceptions requested (if any)
  [REVIEW] My credit officer reviews before committee.

Example output (sanitized):
  Recommended: approve $500K-$750K LOC for a regional plumbing
  contractor with 12-year operating history and 1.8x debt-service
  coverage...

Safety notes:
  - Never include borrower name in prompt or output
  - Verify dollar ranges manually before committee
  - Refresh once per quarter against current policy`}
      </pre>
    ),
  },
];

export default function FoundationGalleryClient() {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  // Build chip set from data — no hand-curated list to drift.
  const filterOptions = ['All', ...Array.from(new Set(ARTIFACTS.map((a) => a.artifactType)))];
  const visibleArtifacts =
    activeFilter === 'All' ? ARTIFACTS : ARTIFACTS.filter((a) => a.artifactType === activeFilter);

  return (
    <>
      <MockupShell
        activePath="/courses"
        eyebrow="Gallery · AiBI-Foundation artifacts"
        title={<>The work, not the slides.</>}
        lede="A representative sample of what AiBI-Foundation learners actually produce. Every example below is synthetic — names invented, amounts ranged, no real customer data — but the structure matches what a banker turns in for review. Built to give you a concrete sense of the artifacts before you enroll."
        heroActions={[
          {
            label: 'Enroll · $295',
            href: '/courses/foundation/program/purchase',
            variant: 'gold',
          },
          { label: 'See the curriculum', href: '/courses', variant: 'ghost-dark' },
        ]}
        sections={[
          // Filter strip rendered as a synthetic first "section" so it inherits
          // the page chrome + container without restructuring MockupShell.
          {
            kicker: 'Filter',
            heading: <>Browse by artifact type.</>,
            lede: (
              <div className="mk-gallery-filters" role="tablist" aria-label="Filter gallery by artifact type">
                {filterOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    role="tab"
                    aria-selected={activeFilter === opt}
                    className={`mk-gallery-chip${activeFilter === opt ? ' is-active' : ''}`}
                    onClick={() => setActiveFilter(opt)}
                  >
                    {opt}
                    {opt !== 'All' && (
                      <span className="mk-gallery-chip-count">
                        {' '}
                        ({ARTIFACTS.filter((a) => a.artifactType === opt).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ),
            surface: 'white' as const,
          },
          ...visibleArtifacts.map((a, i) => ({
          kicker: `Module ${a.module} · ${a.artifactType}`,
          heading: <>{a.title}</>,
          lede: (
            <>
              <p
                style={{
                  fontSize: 13,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--slate-500)',
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                Synthetic example · {a.role}
              </p>
              {a.body}
            </>
          ),
          ...(i % 2 === 1 ? { surface: 'white' as const } : {}),
          })),
        ]}
        ctaBand={{
          kicker: 'See yours next',
          heading: <>Walk away with eighteen artifacts of your own.</>,
          body: (
            <>
              Eighteen bite-sized modules, each ending in a reviewable artifact
              you keep. These examples show how the course moves from AI basics
              into reusable prompts, skills, and workflows. Current individual
              enrollment is one $295 purchase.
            </>
          ),
          actions: [
            {
              label: 'Enroll · $295',
              href: '/courses/foundation/program/purchase',
              variant: 'gold',
            },
            { label: 'See the curriculum', href: '/courses', variant: 'ghost-dark' },
          ],
        }}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .gallery-pre {
          font-family: ui-monospace, "SF Mono", Menlo, monospace;
          font-size: 13px;
          line-height: 1.55;
          background: rgba(7, 26, 47, 0.04);
          border-left: 3px solid var(--gold);
          padding: 20px 22px;
          border-radius: 4px;
          overflow-x: auto;
          white-space: pre-wrap;
          color: var(--ink);
          margin: 0;
        }
      `,
        }}
      />
    </>
  );
}
