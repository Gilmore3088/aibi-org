'use client';

import Link from 'next/link';
import { SiteHeader, Button, ArrowGlyph, StickyMobileCta } from '@/components/mockup';
import { AxHero, AxSection, AxWindow } from '@/components/ax';
import { InventoryPreview } from '@/components/ax/InventoryPreview';
import { AdvisorsStrip } from '@/components/sections/AdvisorsStrip';
import { TeamLeadForm } from '@/components/inquiry/TeamLeadForm';

// For Institutions — AI-native rebuild. The page shows what an institution
// actually ends up holding (the inventory workbook, the SOP builder) rather
// than an illustrative dashboard. Rollout details sit behind a disclosure so
// the page scans in seconds.

const PRIMARY_ENTRY_PATH = '/assessment/take';
const TEAM_INQUIRY_ANCHOR = '#team-inquiry';
const CONFIGURED_BRIEFING_URL =
  process.env.NEXT_PUBLIC_EXECUTIVE_BRIEFING_URL || process.env.NEXT_PUBLIC_CALENDLY_URL;
const BRIEFING_URL =
  CONFIGURED_BRIEFING_URL && CONFIGURED_BRIEFING_URL.trim()
    ? CONFIGURED_BRIEFING_URL
    : TEAM_INQUIRY_ANCHOR;

const PIPELINE = [
  { n: '01', name: 'Assess', output: 'readiness snapshot', p: 'Every employee takes the assessment. Department breakdowns show where the gaps live.' },
  { n: '02', name: 'Train', output: 'Foundation Packet', p: 'Foundation seats by role, with a coached cohort for the people who need depth.' },
  { n: '03', name: 'Document', output: 'AI-Use-Case-Inventory.xlsx', p: 'Every AI workflow gets a row: data class, risk tier, named reviewer, evidence.' },
  { n: '04', name: 'Govern', output: 'AI-Workflow-SOP-Builder.docx', p: 'Repeatable workflows get an SOP before they become team practice.' },
  { n: '05', name: 'Operate', output: 're-review triggers', p: 'Admin handoff, support path, and reporting cadence agreed before launch.' },
] as const;

interface RolloutOption {
  readonly lab: string;
  readonly title: string;
  readonly scale: string;
  readonly p: readonly string[];
  readonly items: readonly string[];
  readonly cta: string;
  readonly href: string;
  readonly gold?: boolean;
}

const ROLLOUT_OPTIONS: readonly RolloutOption[] = [
  {
    lab: 'PMO scope',
    title: 'PMO project plan',
    scale: '90 days · milestones and owners',
    p: ['For project managers who need a concrete rollout plan before coordinating leaders, department owners, and support handoffs.'],
    items: [
      '90-day workplan with milestones and dependencies',
      'Named sponsor, rollout owner, support owner, and reporting cadence',
      'One-business-day response SLA and first-call agenda',
    ],
    cta: 'Scope project plan',
    href: TEAM_INQUIRY_ANCHOR,
  },
  {
    lab: 'L&D rollout',
    title: 'Cohort pilot / L&D rollout',
    scale: 'Pilot · launch packet, scoped first',
    p: ['For training, HR, or L&D owners who need a concrete cohort path before asking managers to assign seats.'],
    items: [
      'Cohort launch plan and owner handoff',
      'Manager kickoff email and participant invite copy',
      'Completion tracker and aggregate report handoff',
    ],
    cta: 'Plan cohort pilot',
    href: TEAM_INQUIRY_ANCHOR,
  },
  {
    lab: 'Assisted team diagnostic',
    title: 'Team Assessment',
    scale: '10+ seats · scoped before checkout',
    p: [
      'Run the 48-question team assessment after we confirm cohort setup, privacy thresholds, reporting owner, and support path.',
    ],
    items: ['Shared participant link', 'Department and role breakdowns', 'Print-ready team report'],
    cta: 'Request assisted rollout',
    href: TEAM_INQUIRY_ANCHOR,
  },
  {
    lab: '$199/seat',
    title: 'Institution Seats',
    scale: '10+ seats · scoped by cohort',
    p: ['Request Foundation Course seats in bulk. We confirm assignment, reporting, invoicing, and support before quoting the cohort.'],
    items: [
      '$199/seat at 10 or more seats — larger cohorts scoped individually',
      'Enrollment handoff scoped up front',
      'SSO and invoicing discussed before rollout',
    ],
    cta: 'Request course seats',
    href: TEAM_INQUIRY_ANCHOR,
  },
  {
    lab: 'Briefing',
    title: 'Executive Briefing',
    scale: 'Custom · contact for engagement',
    p: ['A short leadership session to pressure-test readiness, data boundaries, and the first credible rollout path.'],
    items: [
      'Assessment and course path review',
      'Data handling and support questions',
      'Next-step recommendation by cohort size',
    ],
    cta: 'Book executive briefing',
    href: BRIEFING_URL,
    gold: true,
  },
  {
    lab: 'Partner channel',
    title: 'Partner / association rollout',
    scale: 'Multi-institution · scoped by partner',
    p: [
      "For bankers' banks, banking associations, and service providers introducing AI readiness across member or client institutions.",
    ],
    items: [
      'Named partner audience and launch channel',
      'Member-facing briefing and assessment path',
      'Cohort reporting boundaries scoped up front',
    ],
    cta: 'Scope partner rollout',
    href: TEAM_INQUIRY_ANCHOR,
  },
];

export default function ForInstitutionsPage() {
  return (
    <div className="mockup-scope ax-page">
      <SiteHeader activePath="/for-institutions" cta={{ label: 'Take assessment', href: PRIMARY_ENTRY_PATH }} />
      <main>

      <AxHero
        cmd="rollout --institution community-bank --seats 10+"
        title={
          <>
            Find the gaps. <span className="ax-gold">Train the team.</span>
          </>
        }
        lede="Start with a free readiness baseline. Then pick the rollout that fits your team."
        actions={
          <>
            <Button variant="gold" size="lg" href={PRIMARY_ENTRY_PATH}>
              Take the free assessment <ArrowGlyph />
            </Button>
            <Button variant="ghost-dark" size="lg" href={BRIEFING_URL}>
              Book executive briefing
            </Button>
          </>
        }
      />

      {/* What an institution ends up holding */}
      <AxSection
        light
        id="files"
        kicker="What you end up holding"
        title="What your team receives."
        lede="Real files from the Governance Starter Kit: one inventory row and one SOP per AI workflow."
      >
        <div className="ax-files">
          <InventoryPreview />
          <AxWindow title="AI-Workflow-SOP-Builder.docx" meta="Governance Starter Kit">
            <dl className="ax-doc-fields">
              <div><dt>Workflow name</dt><dd>AI-assisted meeting-summary draft for internal projects</dd></div>
              <div><dt>Workflow owner</dt><dd>Named accountable business owner.</dd></div>
              <div><dt>Allowed inputs</dt><dd>List only data approved for this workflow.</dd></div>
              <div><dt>Human reviewer</dt><dd>Name role, not just department.</dd></div>
              <div><dt>Re-review trigger</dt><dd>Tool change, policy change, data change, complaint, incident</dd></div>
            </dl>
          </AxWindow>
        </div>
        <p className="ax-files-link">
          <Link href="/resources#starter-kits" className="ax-link-mono">
            download the governance starter kit →
          </Link>
        </p>
      </AxSection>

      {/* Five steps, each with its output */}
      <AxSection
        id="pipeline"
        kicker="How institutions work with us"
        title="How we work with institutions."
      >
        <ol className="ax-pipeline">
          {PIPELINE.map((s, i) => (
            <li key={s.n} className={i === 0 ? 'is-first' : undefined}>
              <span className="ax-pipeline-node" aria-hidden="true" />
              <span className="ax-k">{s.n}</span>
              <h3 title={s.p}>{s.name}</h3>
              <span className="ax-pipeline-out">→ {s.output}</span>
            </li>
          ))}
        </ol>
      </AxSection>

      {/* Six rollout options */}
      <AxSection light id="engagement" kicker="How to engage" title="Pick a rollout.">
        <div className="ax-rollouts">
          {ROLLOUT_OPTIONS.map((o) => (
            <article key={o.title} className={`ax-rollout${o.gold ? ' is-featured' : ''}`}>
              <span className="ax-k ax-gold">{o.lab}</span>
              <h3>{o.title}</h3>
              <span className="ax-option-scale">{o.scale}</span>
              <details className="ax-rollout-more">
                <summary>What&rsquo;s included</summary>
                {o.p.map((para) => (
                  <p key={para}>{para}</p>
                ))}
                {o.title === 'Team Assessment' && (
                  <p>
                    Forward the <Link href="/security/it-approval">IT review packet</Link> before seats are assigned.
                  </p>
                )}
                <ul className="ax-checklist">
                  {o.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </details>
              <Link href={o.href} className="ax-tier-cta">
                {o.cta} <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </AxSection>

      {/* Executive briefing */}
      <AxSection id="briefing">
        <AxWindow title="executive-briefing" meta="free · 30 minutes">
          <div className="ax-briefing">
            <div>
              <h2 className="ax-display">Start with an Executive Briefing.</h2>
              <p className="ax-muted">Thirty minutes with your leadership team. Free.</p>
              <Button variant="gold" size="lg" href={BRIEFING_URL}>
                Book executive briefing <ArrowGlyph />
              </Button>
            </div>
            <ul className="ax-checklist">
              <li>Demo using your sanitized inputs or comparable public examples</li>
              <li>Priority and risk discussion scoped to your asset class</li>
              <li>90-day rollout plan tailored to your shape</li>
              <li>Pricing for your headcount &amp; departments</li>
            </ul>
          </div>
        </AxWindow>
      </AxSection>

      <AxSection light id="team-inquiry-section">
        <TeamLeadForm
          id="team-inquiry"
          title="Send the team request before checkout."
          description="Briefing, team assessment, seats, an L&D cohort pilot, a PMO project plan, or a partner rollout across member or client institutions."
          defaultType="cohort-pilot-request"
        />
      </AxSection>

      <AdvisorsStrip />

      <section className="ax-section ax-close">
        <div className="mk-container">
          <h2 className="ax-display">
            Your baseline costs <span className="ax-gold">nothing</span>.
          </h2>
          <div className="ax-actions">
            <Button variant="gold" size="lg" href={PRIMARY_ENTRY_PATH}>
              Take the free assessment <ArrowGlyph />
            </Button>
          </div>
        </div>
      </section>

      </main>
      <StickyMobileCta label="Take the free assessment" href={PRIMARY_ENTRY_PATH} source="institutions-sticky" />
    </div>
  );
}
