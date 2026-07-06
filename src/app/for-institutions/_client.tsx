/* eslint-disable react/no-unescaped-entities */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  SiteHeader,
  Section,
  SectionHead,
  Button,
  CtaBand,
  StickyMobileCta,
} from '@/components/mockup';
import { AdvisorsStrip } from '@/components/sections/AdvisorsStrip';
import { TrustAnchor } from '@/components/sections/TrustAnchor';
import { TeamLeadForm } from '@/components/inquiry/TeamLeadForm';

type IconProps = { className?: string; size?: number };
const sw = (p: IconProps) => ({
  className: p.className,
  width: p.size,
  height: p.size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

const BarsIcon = (p: IconProps) => (<svg {...sw(p)}><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>);
const ArrowR = (p: IconProps) => (<svg {...sw(p)}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);
const TargetIcon = (p: IconProps) => (<svg {...sw(p)}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>);
const LayersIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /></svg>);
const FileIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>);
const LockIcon = (p: IconProps) => (<svg {...sw(p)}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
const NetworkIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M20 7h-9M14 17H5" /><circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" /></svg>);
const ShieldIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>);
const UsersIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>);
const SendIcon = (p: IconProps) => (<svg {...sw(p)}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>);
const StarIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M12 3l1.9 5.8L20 10l-4.6 3.4L17.2 20 12 16.6 6.8 20l1.8-6.6L4 10l6.1-1.2z" /></svg>);
const ChatIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>);
const CheckIcon = (p: IconProps) => (<svg {...sw(p)}><polyline points="20 6 9 17 4 12" /></svg>);

const ChevronDownIcon = (p: IconProps) => (
  <svg {...sw(p)}><polyline points="6 9 12 15 18 9" /></svg>
);
const XIcon = (p: IconProps) => (
  <svg {...sw(p)}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

const PRIMARY_ENTRY_PATH = '/assessment/take';
const TEAM_ASSESSMENT_PATH = '/assessment/team';
const TEAM_INQUIRY_ANCHOR = '#team-inquiry';
const CONFIGURED_BRIEFING_URL =
  process.env.NEXT_PUBLIC_EXECUTIVE_BRIEFING_URL || process.env.NEXT_PUBLIC_CALENDLY_URL;
const BRIEFING_URL =
  CONFIGURED_BRIEFING_URL && CONFIGURED_BRIEFING_URL.trim()
    ? CONFIGURED_BRIEFING_URL
    : TEAM_INQUIRY_ANCHOR;

const TIERS = [
  {
    scale: 'Free · diagnostic',
    name: 'Readiness Assessment',
    tagline: 'Twelve questions, three minutes — see where you stand.',
    included: [
      'Your readiness score and tier',
      'The dimension dragging you down',
      'A starter artifact you can take to your team this week',
    ],
    ctaHref: PRIMARY_ENTRY_PATH,
    ctaLabel: 'Take the assessment',
    ctaVariant: 'gold' as const,
  },
  {
    scale: 'Per-banker',
    name: 'AiBI-Foundation course',
    tagline: 'Self-paced, scored on reviewed work.',
    included: [
      'Eighteen bite-sized self-paced modules',
      'Eighteen reviewed AI artifacts per practitioner',
      '$295 individual · $199/seat at 10+',
    ],
    ctaHref: '/courses',
    ctaLabel: 'View the curriculum',
    ctaVariant: 'ink' as const,
  },
  {
    scale: 'Institution-wide',
    name: 'Organizational Rollout',
    tagline: 'A coached cohort, an aggregate dashboard, a defensible posture.',
    included: [
      '10+ seat assisted cohort planning',
      'Institutional readiness baseline + post-engagement diagnostic',
      'Aggregate dashboard after privacy thresholds are confirmed',
    ],
    ctaHref: TEAM_INQUIRY_ANCHOR,
    ctaLabel: 'Request rollout',
    ctaVariant: 'ink' as const,
  },
];

export default function ForInstitutionsPage() {
  // Mobile accordion state — index of open tier (-1 = all closed)
  const [openTier, setOpenTier] = useState<number>(-1);
  // Mobile dashboard modal state
  const [dashModalOpen, setDashModalOpen] = useState(false);

  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/for-institutions" cta={{ label: 'Take assessment', href: PRIMARY_ENTRY_PATH }} />

      {/* HERO */}
      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <p
              style={{
                margin: '0 0 14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--gold-soft)',
              }}
            >
              For institutions
            </p>
            <h1>Find the gaps. Train the team.</h1>
            <p className="mk-lede">
              Start with a readiness baseline, then decide whether your team needs Foundation seats,
              an L&D-led cohort pilot, a PMO project plan, a partner rollout, or a scoped briefing.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href={PRIMARY_ENTRY_PATH}>
                Take the free assessment <ArrowR className="mk-ic" />
              </Button>
              <Button variant="ghost-dark" size="lg" href={BRIEFING_URL}>
                Book executive briefing
              </Button>
              <Button variant="ghost-dark" size="lg" href="#engagement">
                See enrollment options
              </Button>
            </div>
          </div>

          {/* Mobile-only: compact metric summary */}
          <div className="mk-dash-mobile-summary" aria-label="Illustrative sample institution dashboard">
            <div className="mk-dash-mobile-header">
              <div>
                <div className="mk-dash-mobile-title">Institution Dashboard</div>
                <div className="mk-dash-mobile-sub">First National · illustrative sample</div>
              </div>
              <BarsIcon size={24} />
            </div>
            <div
              style={{
                display: 'inline-flex',
                margin: '10px 0 0',
                border: '1px solid rgba(148, 118, 63, .32)',
                borderRadius: 999,
                padding: '4px 8px',
                color: 'var(--gold-deep)',
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Mock data preview
            </div>
            <div className="mk-dash-mobile-metric">
              <div>
                <div className="mk-dash-mobile-score">
                  67<span className="mk-dash-mobile-score-unit">/100</span>
                </div>
              </div>
              <div>
                <div className="mk-dash-mobile-dept-label">Compliance readiness</div>
                <div className="mk-dash-mobile-dept-sub">Highest-scoring department · 18 staff</div>
              </div>
            </div>
            <button
              className="mk-dash-modal-trigger"
              onClick={() => setDashModalOpen(true)}
              aria-label="See the full institution dashboard"
            >
              See the full dashboard <ArrowR className="mk-ic" />
            </button>
          </div>

          {/* Modal overlay (mobile only) */}
          <div
            className={`mk-dash-modal-overlay${dashModalOpen ? ' is-open' : ''}`}
            onClick={() => setDashModalOpen(false)}
            aria-hidden="true"
          />

          {/* Desktop full chart (always visible on desktop; modal on mobile) */}
          <div className={`mk-dash${dashModalOpen ? ' is-modal-open' : ''}`} style={{ position: 'relative' }}>
            {dashModalOpen && (
              <button
                className="mk-dash-modal-close"
                onClick={() => setDashModalOpen(false)}
                aria-label="Close dashboard"
              >
                <XIcon size={16} />
              </button>
            )}
            <div className="mk-head">
              <div>
                <div className="mk-k">Institution Dashboard</div>
                <div className="mk-t">First National · illustrative sample</div>
                <div
                  style={{
                    marginTop: 6,
                    color: 'var(--slate-500)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  Mock cohort data for preview only.
                </div>
              </div>
              <BarsIcon size={32} />
            </div>
            <div className="mk-body">
              <div className="mk-topline">
                <div>
                  <div className="mk-k">Assessed</div>
                  <div className="mk-v">124</div>
                  <div className="mk-u">of 142 staff</div>
                </div>
                <div>
                  <div className="mk-k">Org score</div>
                  <div className="mk-v">61</div>
                  <div className="mk-u">/ 100 readiness</div>
                </div>
                <div>
                  <div className="mk-k">Trained</div>
                  <div className="mk-v">38</div>
                  <div className="mk-u">Foundation done</div>
                </div>
              </div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--gold-deep)',
                  marginBottom: 12,
                }}
              >
                Training focus by department
              </div>
              <div className="mk-dept">
                {[
                  ['Compliance', 'High', 72],
                  ['Retail', 'Med', 58],
                  ['Marketing', 'Med', 64],
                  ['Operations', 'Low', 49],
                ].map(([nm, level, pct]) => (
                  <div key={nm as string} className="mk-d-row">
                    <div className="mk-top">
                      <div className="mk-nm">{nm}</div>
                      <div className="mk-vv">
                        {pct} / {level}
                      </div>
                    </div>
                    <div className="mk-bar">
                      <div className="mk-fill" style={{ width: `${pct as number}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THREE WAYS TO BUILD */}
      <Section variant="std" surface="white">
        <SectionHead
          kicker="Engagement"
          heading={<>Three ways to build.</>}
          lede={
            <>
              Start with the free diagnostic. Use the result to decide whether the next
              move is individual enrollment, volume seats, or an assisted rollout.
            </>
          }
        />

        {/* Desktop: card grid (hidden on mobile via CSS) */}
        <div
          className="mk-tier-grid-desktop"
          style={{
            display: 'grid',
            gap: 20,
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            marginTop: 32,
          }}
        >
          {TIERS.map((tier) => (
            <article
              key={tier.name}
              style={{
                background: 'var(--cream)',
                border: '1px solid var(--ink-a10)',
                borderRadius: 16,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <p
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--gold-deep)',
                  margin: '0 0 12px',
                }}
              >
                {tier.scale}
              </p>
              <h3
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: 'var(--ink)',
                  margin: '0 0 8px',
                }}
              >
                {tier.name}
              </h3>
              <p
                style={{
                  fontSize: '0.9375rem',
                  lineHeight: 1.55,
                  color: 'var(--slate-600)',
                  margin: '0 0 16px',
                }}
              >
                {tier.tagline}
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  padding: '16px 0',
                  margin: '0 0 20px',
                  borderTop: '1px solid var(--ink-a10)',
                  borderBottom: '1px solid var(--ink-a10)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {tier.included.map((item) => (
                  <li
                    key={item}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '14px 1fr',
                      gap: 10,
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      color: 'var(--ink)',
                    }}
                  >
                    <span aria-hidden="true" style={{ color: 'var(--gold-deep)', fontWeight: 700 }}>
                      —
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 'auto' }}>
                <Button variant={tier.ctaVariant} size="md" href={tier.ctaHref}>
                  {tier.ctaLabel}
                </Button>
              </div>
            </article>
          ))}
        </div>

        {/* Mobile: accordion list (hidden on desktop via CSS) */}
        <div className="mk-tier-accordion-list" style={{ marginTop: 24 }} aria-label="Engagement options">
          {TIERS.map((tier, idx) => {
            const isOpen = openTier === idx;
            const triggerId = `tier-trigger-${idx}`;
            const bodyId = `tier-body-${idx}`;
            return (
              <div key={tier.name} className="mk-tier-accordion">
                <button
                  id={triggerId}
                  className="mk-tier-trigger"
                  aria-expanded={isOpen}
                  aria-controls={bodyId}
                  onClick={() => setOpenTier(isOpen ? -1 : idx)}
                >
                  <div className="mk-tier-trigger-label">
                    <span className="mk-tier-trigger-scale">{tier.scale}</span>
                    <span className="mk-tier-trigger-name">{tier.name}</span>
                  </div>
                  <ChevronDownIcon
                    size={20}
                    className={`mk-tier-chevron${isOpen ? ' is-open' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div
                    id={bodyId}
                    role="region"
                    aria-labelledby={triggerId}
                    className="mk-tier-body"
                  >
                    <p className="mk-tier-tagline">{tier.tagline}</p>
                    <ul className="mk-tier-list">
                      {tier.included.map((item) => (
                        <li key={item}>
                          <span aria-hidden="true">—</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant={tier.ctaVariant} size="md" href={tier.ctaHref}>
                      {tier.ctaLabel}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* 5-STEP CHAIN */}
      <Section variant="std">
        <SectionHead
          kicker="How institutions work with us"
          heading={<>Assess. Train. Document. Govern. Operate.</>}
          lede={<>Five steps, in order. We don't sell a policy shortcut. We help the team produce reviewable work before you scale it.</>}
        />
        <div className="mk-chain">
          {[
            { icon: TargetIcon, num: '01 · Assess', h: 'Baseline your readiness', p: 'Every employee takes the assessment. Org and department breakdowns surface where the readiness gaps live.' },
            { icon: LayersIcon, num: '02 · Train', h: 'Close the skill gaps by role', p: 'Assign Foundation course seats by role. Pair the institutional rollout with a coached cohort for the people who need depth.' },
            { icon: FileIcon, num: '03 · Document', h: 'Build your AI use-case record', p: 'Workbench Packs and Toolbox artifacts become your AI use-case inventory — review-ready from day one.' },
            { icon: LockIcon, num: '04 · Govern', h: 'Establish approval and data rules', p: 'Approval rituals and data rules reinforced through the same artifacts staff already use day to day.' },
            { icon: NetworkIcon, num: '05 · Operate', h: 'Move through assisted rollout', p: 'When the cohort is ready, we agree on admin handoff, support path, and reporting cadence before launch.' },
          ].map(({ icon: Icon, num, h, p }) => (
            <div key={num} className="mk-step">
              <span className="mk-pic">
                <Icon size={24} />
              </span>
              <div className="mk-num">{num}</div>
              <h3>{h}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* DEPARTMENT BREAKDOWN */}
      <Section variant="std" surface="white">
        <SectionHead
          kicker="What the dashboard shows"
          heading={<>Readiness, by department, in plain language.</>}
          lede={<>You see exactly which teams are ready to use AI safely, which need training, and which need both — without policy theater.</>}
        />
        <div className="mk-by-dept">
          <div className="mk-dept-grid">
            {[
              { icon: ShieldIcon, nm: 'Compliance', ct: '18 staff', score: 72, pill: 'is-hi', label: 'Ready' },
              { icon: UsersIcon, nm: 'Retail / Branch', ct: '64 staff', score: 58, pill: 'is-me', label: 'Training needed' },
              { icon: SendIcon, nm: 'Marketing', ct: '8 staff', score: 64, pill: 'is-me', label: 'Training needed' },
              { icon: StarIcon, nm: 'Operations', ct: '22 staff', score: 49, pill: 'is-lo', label: 'High risk gap' },
              { icon: FileIcon, nm: 'Lending', ct: '16 staff', score: 66, pill: 'is-me', label: 'Training needed' },
              { icon: ChatIcon, nm: 'Leadership', ct: '14 staff', score: 78, pill: 'is-hi', label: 'Ready' },
            ].map(({ icon: Icon, nm, ct, score, pill, label }) => (
              <div key={nm} className="mk-dpt">
                <div className="mk-lhs">
                  <span className="mk-pic">
                    <Icon size={18} />
                  </span>
                  <div>
                    <div className="mk-nm">{nm}</div>
                    <div className="mk-ct">{ct}</div>
                  </div>
                </div>
                <span className={`mk-pill ${pill}`}>{label}</span>
                <div className="mk-score">{score}</div>
              </div>
            ))}
          </div>
          {/* Mobile-only: link to the live dashboard demo since the grid above
              gets visually compressed to ~80px-tall cards on a phone. */}
          <Link className="mk-dept-mobile-link" href={TEAM_ASSESSMENT_PATH}>
            View the assisted team assessment →
          </Link>
        </div>
      </Section>

      {/* BRIEFING */}
      <Section variant="std">
        <div className="mk-briefing">
          <div>
            <div className="mk-k">Free · 30 minutes</div>
            <h3>Start with an Executive Briefing.</h3>
            <p>
              Bring your leadership team. We walk through the assessment, the dashboard preview,
              and what a 90-day rollout would require at an institution your size.
            </p>
            <Button
              variant="gold"
              size="lg"
              href={BRIEFING_URL}
            >
              Book executive briefing <ArrowR className="mk-ic" />
            </Button>
          </div>
          <ul>
            <li><CheckIcon className="mk-ic" />Demo using your sanitized inputs or comparable public examples</li>
            <li><CheckIcon className="mk-ic" />Peer-context discussion for your asset class</li>
            <li><CheckIcon className="mk-ic" />90-day rollout plan tailored to your shape</li>
            <li><CheckIcon className="mk-ic" />Pricing for your headcount & departments</li>
          </ul>
        </div>
      </Section>

      <Section id="team-inquiry-section" variant="std">
        <TeamLeadForm
          id="team-inquiry"
          title="Send the team request before checkout."
          description="Use this when you want an Executive Briefing, Team Assessment rollout, Foundation seats for multiple staff, an L&D cohort pilot, a PMO project plan, or a partner rollout across member or client institutions. The request goes to hello@aibankinginstitute.com and the support/admin queue."
          defaultType="cohort-pilot-request"
        />
      </Section>


      {/* PRICING / ADVISORY */}
      <Section id="engagement" variant="std" surface="white">
        <SectionHead
          kicker="How to engage"
          heading={<>Enrollment &amp; assisted rollout.</>}
          lede={
            <>
              Individual enrollment is self-serve. Volume seats, dashboards, and Team Assessment
              rollouts are scoped with us first so reporting, support, and privacy thresholds are
              agreed before purchase.
            </>
          }
        />
        <div className="mk-contact-grid">
          <div className="mk-ccard">
            <div className="mk-lab">PMO scope</div>
            <h3>PMO project plan</h3>
            <div className="mk-price">
              <div className="mk-v">90</div>
              <div className="mk-u">days · milestones and owners</div>
            </div>
            <p>
              For project managers who need a concrete rollout plan before
              coordinating leaders, department owners, and support handoffs.
            </p>
            <ul>
              <li><CheckIcon className="mk-ic" />90-day workplan with milestones and dependencies</li>
              <li><CheckIcon className="mk-ic" />Named sponsor, rollout owner, support owner, and reporting cadence</li>
              <li><CheckIcon className="mk-ic" />One-business-day response SLA and first-call agenda</li>
            </ul>
            <Button variant="ink" size="lg" href={TEAM_INQUIRY_ANCHOR}>
              Scope project plan <ArrowR className="mk-ic" />
            </Button>
          </div>
          <div className="mk-ccard">
            <div className="mk-lab">L&D rollout</div>
            <h3>Cohort pilot / L&D rollout</h3>
            <div className="mk-price">
              <div className="mk-v">Pilot</div>
              <div className="mk-u">launch packet · scoped first</div>
            </div>
            <p>
              For training, HR, or L&D owners who need a concrete cohort path
              before asking managers to assign seats.
            </p>
            <ul>
              <li><CheckIcon className="mk-ic" />Cohort launch plan and owner handoff</li>
              <li><CheckIcon className="mk-ic" />Manager kickoff email and participant invite copy</li>
              <li><CheckIcon className="mk-ic" />Completion tracker and aggregate report handoff</li>
            </ul>
            <Button variant="ink" size="lg" href={TEAM_INQUIRY_ANCHOR}>
              Plan cohort pilot <ArrowR className="mk-ic" />
            </Button>
          </div>
          <div className="mk-ccard">
            <div className="mk-lab">Assisted team diagnostic</div>
            <h3>Team Assessment</h3>
            <div className="mk-price">
              <div className="mk-v">10+</div>
              <div className="mk-u">seats · scoped before checkout</div>
            </div>
            <p>
              Run the 48-question team assessment after we confirm cohort setup,
              privacy thresholds, reporting owner, and support path.
            </p>
            <p>
              Forward the{' '}
              <Link href="/security/it-approval">
                IT review packet
              </Link>{' '}
              before seats are assigned.
            </p>
            <ul>
              <li><CheckIcon className="mk-ic" />Shared participant link</li>
              <li><CheckIcon className="mk-ic" />Department and role breakdowns</li>
              <li><CheckIcon className="mk-ic" />Print-ready team report</li>
            </ul>
            <Button variant="ink" size="lg" href={TEAM_INQUIRY_ANCHOR}>
              Request assisted rollout <ArrowR className="mk-ic" />
            </Button>
          </div>
          <div className="mk-ccard">
            <div className="mk-lab">$199/seat</div>
            <h3>Institution Seats</h3>
            <div className="mk-price">
              <div className="mk-v">10+</div>
              <div className="mk-u">seats at 10+ · scoped by cohort</div>
            </div>
            <p>
              Request Foundation Course seats in bulk. We confirm assignment, reporting,
              invoicing, and support before quoting the cohort.
            </p>
            <ul>
              <li><CheckIcon className="mk-ic" />$199/seat at 10 or more seats — larger cohorts scoped individually</li>
              <li><CheckIcon className="mk-ic" />Enrollment handoff scoped up front</li>
              <li><CheckIcon className="mk-ic" />SSO and invoicing discussed before rollout</li>
            </ul>
            <Button variant="ink" size="lg" href={TEAM_INQUIRY_ANCHOR}>
              Request course seats <ArrowR className="mk-ic" />
            </Button>
          </div>
          <div className="mk-ccard">
            <div className="mk-lab">Briefing</div>
            <h3>Executive Briefing</h3>
            <div className="mk-price">
              <div className="mk-v">Custom</div>
              <div className="mk-u">/ contact for engagement</div>
            </div>
            <p>
              A short leadership session to pressure-test readiness, data boundaries,
              and the first credible rollout path.
            </p>
            <ul>
              <li><CheckIcon className="mk-ic" />Assessment and course path review</li>
              <li><CheckIcon className="mk-ic" />Data handling and support questions</li>
              <li><CheckIcon className="mk-ic" />Next-step recommendation by cohort size</li>
            </ul>
            <Button
              variant="gold"
              size="lg"
              href={BRIEFING_URL}
            >
              Book executive briefing <ArrowR className="mk-ic" />
            </Button>
          </div>
          <div className="mk-ccard">
            <div className="mk-lab">Partner channel</div>
            <h3>Partner / association rollout</h3>
            <div className="mk-price">
              <div className="mk-v">Multi</div>
              <div className="mk-u">institution · scoped by partner</div>
            </div>
            <p>
              For bankers' banks, banking associations, and service providers
              introducing AI readiness across member or client institutions.
            </p>
            <ul>
              <li><CheckIcon className="mk-ic" />Named partner audience and launch channel</li>
              <li><CheckIcon className="mk-ic" />Member-facing briefing and assessment path</li>
              <li><CheckIcon className="mk-ic" />Cohort reporting boundaries scoped up front</li>
            </ul>
            <Button variant="ink" size="lg" href={TEAM_INQUIRY_ANCHOR}>
              Scope partner rollout <ArrowR className="mk-ic" />
            </Button>
          </div>
        </div>
      </Section>

      <TrustAnchor />
      <AdvisorsStrip />

      <CtaBand
        hiddenOnMobile
        kicker="Start with the assessment"
        heading={<>Your baseline costs nothing. Your rollout plan starts there.</>}
        body={
          <>
            Run your team through the free readiness check first — then bring the department
            breakdown to your Executive Briefing.
          </>
        }
        actions={[
          { label: 'Take the free assessment', href: '/assessment/take', variant: 'gold' },
          { label: 'Book briefing', href: BRIEFING_URL, variant: 'ghost-dark' },
        ]}
      />

      <StickyMobileCta
        label="Take the free assessment"
        href={PRIMARY_ENTRY_PATH}
        source="institutions-sticky"
      />
    </div>
  );
}
