'use client';

// /courses/foundation/gallery — what learners build, one document at a time.
//
// Pick a document on the left; read it in the window on the right. The first
// three are the real course builds (modules 1–3), pulled from the course data
// so they cannot drift. The rest are synthetic examples: names invented,
// amounts ranged, no customer data.

import { useState } from 'react';
import { ArrowGlyph, Button, SiteHeader } from '@/components/mockup';
import { AxHero } from '@/components/ax';
import { FOUNDATION_MICRO_MODULES } from '@content/courses/foundation-program/micro-modules';

interface GalleryDoc {
  readonly id: string;
  readonly title: string;
  readonly role: string;
  readonly kind: string;
  /** Set for the course's own builds. */
  readonly module?: number;
  readonly body: string;
}

const COURSE_BUILDS: readonly GalleryDoc[] = FOUNDATION_MICRO_MODULES.filter((m) => m.build).map((m) => ({
  id: `m${m.number}`,
  title: m.keyOutput,
  role: 'Any role',
  kind: 'Course build',
  module: m.number,
  body: m.build!.prompt,
}));

const EXAMPLES: readonly GalleryDoc[] = [
  {
    id: 'email',
    title: 'Branch coverage email',
    role: 'Branch manager',
    kind: 'Rewritten message',
    body: `Subject: Branch X coverage Wed–Fri — action needed by EOD Mon

Action: Sign up for one shift on the attached coverage sheet.
Deadline: End of day Monday.
Why: Two tellers out on leave; lobby coverage gap 10a–2p Wed–Fri.

If you can't cover, reply to me directly with your role. I will pair
remaining gaps with float staff. Lobby logistics only; no customer
names in replies.

— Branch Manager X`,
  },
  {
    id: 'claim-review',
    title: 'Vendor claim review',
    role: 'Compliance officer',
    kind: 'Claim check',
    body: `Vendor claim: "Our model is nearly perfect at AML alert triage."
Source provided: internal vendor whitepaper, no peer review.

REVIEW
✗ "Nearly perfect" — no measure named, no source
✗ "AML alert triage" — the alert population is not defined
✗ No split between missed alerts and false alarms
✗ Whitepaper is the vendor's own, not independently audited

VERDICT
Treat as marketing material. Do not pass to the AML team without:
  (a) a description of the data it was tested on
  (b) missed-alert and false-alarm rates, reported separately
  (c) a sample of missed alerts reviewed by your BSA officer`,
  },
  {
    id: 'adverse-action',
    title: 'Adverse action notice prompt',
    role: 'Lending operations',
    kind: 'Prompt template',
    body: `[CONTEXT] You are an experienced credit analyst at a community bank.
  The notice goes to a declined applicant.
[OBJECTIVE] Draft a plain-English adverse-action notice under 120 words
  that includes the disclosures our standard requires.
[RESOURCES] Use only:
  Denial code: {DENIAL_CODE}
  Sanitized file summary: {SUMMARY}
  Our adverse-action standard: {INTERNAL_STANDARD}
[EXPECTATIONS]
  - Neutral, non-blaming language.
  - Never invent denial reasons that are not in the input.
  - Never reference race, age, marital status, source of income,
    or any other protected characteristic.
  - Compliance officer signs off before mailing.`,
  },
  {
    id: 'work-profile',
    title: 'AI work profile',
    role: 'Credit analyst',
    kind: 'Role profile',
    body: `Role: Credit Analyst II
Daily AI uses (sanitized inputs only):
  - Adverse-action letter drafts
  - Loan committee memo summaries
  - Member-facing rate explanations

Tools approved by IT: [your approved tools]
Tools not approved: personal AI accounts

Data classification:
  GREEN  — public rate sheets, regulatory text, internal SOPs
  YELLOW — sanitized loan summaries (names removed, amounts ranged)
  RED    — full borrower files, credit reports, SSN/TIN, account numbers

Review checkpoint:
  My supervisor reviews every AI-assisted draft before it leaves my desk.`,
  },
  {
    id: 'paste-check',
    title: 'Before-I-paste check',
    role: 'Member service rep',
    kind: 'Data-safety card',
    body: `Today's data I might paste:

  Member complaint email about an overdraft fee
    -> NO. Contains a name and an account reference.
       Remove both, keep the shape of the complaint.

  Our overdraft policy text from the intranet
    -> YES. Internal procedure, no customer data.

  Three sample call scripts for coaching
    -> YES. No customer data.

  Yesterday's branch deposit totals
    -> ASK FIRST. Check with my supervisor before any AI use.

Escalate to: BSA officer for anything suspicious-activity related;
Legal for anything near member litigation.`,
  },
  {
    id: 'bsa-tasks',
    title: 'Weekly AI tasks',
    role: 'BSA / AML analyst',
    kind: 'Use-case card',
    body: `My three weekly AI-assisted tasks:

  1. SAR narrative first draft (from a sanitized timeline)
     - Review: my supervisor and the BSA officer before filing

  2. Customer due diligence comparison, current vs prior period
     - Review: my own check against source records

  3. Structuring pattern summary (raw notes into clean prose)
     - Review: BSA officer

Never use AI for: customer-facing messages, examiner work product
that has not been reviewed, or anything with a customer's identity.`,
  },
  {
    id: 'committee-memo',
    title: 'Loan committee memo prompt',
    role: 'Senior lender',
    kind: 'Saved prompt',
    body: `When to use it: after credit analysis, before formal committee
What to paste: sanitized credit summary (no borrower name, no SSN)
What not to paste: full borrower file, credit reports, examiner letters

[CONTEXT] You are a senior commercial lender at a community bank
preparing a memo for the loan committee.
[OBJECTIVE] Draft a 250-word committee memo.
[RESOURCES] Use only:
  Sanitized credit summary: {SUMMARY}
  Loan amount range: {RANGE}
  Industry: {INDUSTRY}
[EXPECTATIONS] Include:
  - A one-sentence recommendation
  - The three strongest supporting points
  - Two risks the committee should weigh
  - Any policy exceptions requested
  My credit officer reviews before committee.`,
  },
];

const DOCS: readonly GalleryDoc[] = [...COURSE_BUILDS, ...EXAMPLES];

export default function FoundationGalleryClient() {
  const [activeId, setActiveId] = useState(DOCS[0]?.id);
  const active = DOCS.find((d) => d.id === activeId) ?? DOCS[0];

  return (
    <div className="mockup-scope ax-page">
      <SiteHeader activePath="/courses" cta={{ label: 'Enroll · $295', href: '/courses/foundation/program/purchase' }} />

      <AxHero
        cmd="courses/foundation --gallery"
        title="What learners build."
        lede="Pick a document. Every example is synthetic: invented names, no customer data."
        actions={
          <Button variant="gold" size="lg" href="/courses/foundation/preview">
            Build module 1 free <ArrowGlyph />
          </Button>
        }
      />

      <main>
        <section className="ax-section ax-light" aria-label="Gallery">
          <div className="mk-container gl">
            <div className="gl-list" role="tablist" aria-label="Documents" aria-orientation="vertical">
              {DOCS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  role="tab"
                  id={`gl-tab-${d.id}`}
                  aria-selected={d.id === active.id}
                  aria-controls="gl-doc"
                  className={d.id === active.id ? 'is-on' : undefined}
                  onClick={() => setActiveId(d.id)}
                >
                  <span className="gl-kind">{d.module ? `Module ${d.module}` : d.kind}</span>
                  <span className="gl-title">{d.title}</span>
                  <span className="gl-role">{d.role}</span>
                </button>
              ))}
            </div>

            <article className="gl-doc" id="gl-doc" role="tabpanel" aria-labelledby={`gl-tab-${active.id}`}>
              <header className="gl-doc-bar">
                <span>{active.title}</span>
                <span>{active.module ? 'From the course' : `Synthetic · ${active.role}`}</span>
              </header>
              <pre key={active.id}>{active.body}</pre>
            </article>
          </div>
        </section>
      </main>

      <section className="ax-section ax-light is-paper ax-close">
        <div className="mk-container">
          <h2 className="ax-display">
            Eighteen modules. <span className="ax-gold">Build your own.</span>
          </h2>
          <div className="ax-actions" style={{ justifyContent: 'center' }}>
            <Button variant="gold" size="lg" href="/courses/foundation/program/purchase">
              Enroll · $295
            </Button>
            <Button variant="ghost-dark" size="lg" href="/courses">
              See the course
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
