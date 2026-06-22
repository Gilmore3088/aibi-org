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

const TEAM_ASSESSMENT_PATH = '/assessment/team';
const PRICING_PATH = '#engagement';
const BRIEFING_MAILTO =
  'mailto:hello@aibankinginstitute.com?subject=Executive%20Briefing%20request%20%E2%80%94%20for%20institutions';
const COURSE_SEATS_MAILTO =
  'mailto:hello@aibankinginstitute.com?subject=Foundation%20course%20seat%20pricing';

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
    ctaHref: '/assessment',
    ctaLabel: 'Take the assessment',
    ctaVariant: 'ink' as const,
  },
  {
    scale: 'Per-banker',
    name: 'AiBI-Foundation course',
    tagline: 'Self-paced, scored on reviewed work.',
    included: [
      'Eighteen bite-sized self-paced modules',
      'Eighteen reviewed AI artifacts per practitioner',
      '$295 individual · $199/seat at 10+ · lifetime access',
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
      '10-seat coached cohort over eight weeks',
      'Institutional readiness baseline + post-engagement diagnostic',
      'Aggregate dashboard for your champion',
    ],
    ctaHref: TEAM_ASSESSMENT_PATH,
    ctaLabel: 'Start team assessment',
    ctaVariant: 'gold' as const,
  },
];

export default function ForInstitutionsPage() {
  // Mobile accordion state — index of open tier (-1 = all closed)
  const [openTier, setOpenTier] = useState<number>(-1);
  // Mobile dashboard modal state
  const [dashModalOpen, setDashModalOpen] = useState(false);

  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/for-institutions" cta={{ label: 'Team assessment', href: TEAM_ASSESSMENT_PATH }} />

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
                fontSize: 12,
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
              Cohort assessment, department dashboard, and Foundation seats for banks and credit unions.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href={PRICING_PATH}>
                See team options <ArrowR className="mk-ic" />
              </Button>
              <Button variant="ghost-dark" size="lg" href={TEAM_ASSESSMENT_PATH}>
                Team assessment
              </Button>
            </div>
          </div>

          {/* Mobile-only: compact metric summary */}
          <div className="mk-dash-mobile-summary" aria-label="Sample institution dashboard">
            <div className="mk-dash-mobile-header">
              <div>
                <div className="mk-dash-mobile-title">Institution Dashboard</div>
                <div className="mk-dash-mobile-sub">First National · Sample</div>
              </div>
              <BarsIcon size={24} />
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
                <div className="mk-t">First National · Sample</div>
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
                  fontSize: 11,
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
              Free diagnostic, per-banker enrollment, or institution-wide rollout. Each
              ends with reviewed work product — not a policy doc nobody reads.
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
                  fontSize: 12,
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
                  fontSize: 24,
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
                  fontSize: 15,
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
                      fontSize: 14,
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
          heading={<>Assess. Train. Document. Govern. Consult.</>}
          lede={<>Five steps, in order. We don't do the policy doc. We do the work that lets you write a credible policy doc later.</>}
        />
        <div className="mk-chain">
          {[
            { icon: TargetIcon, num: '01 · Assess', h: 'Baseline your readiness', p: 'Every employee takes the assessment. Org and department breakdowns surface where the readiness gaps live.' },
            { icon: LayersIcon, num: '02 · Train', h: 'Close the skill gaps by role', p: 'Assign Foundation course seats by role. Pair the institutional rollout with a coached cohort for the people who need depth.' },
            { icon: FileIcon, num: '03 · Document', h: 'Build your AI use-case record', p: 'Workbench Packs and Toolbox artifacts become your AI use-case inventory — review-ready from day one.' },
            { icon: LockIcon, num: '04 · Govern', h: 'Establish approval and data rules', p: 'Approval rituals and data rules reinforced through the same artifacts staff already use day to day.' },
            { icon: NetworkIcon, num: '05 · Consult', h: 'Engage ongoing advisory', p: 'Optional Leadership Advisory — a fractional Chief AI Officer for institutions running real cohorts.' },
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
            Open the paid team assessment →
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
              Bring your leadership team. We walk through the assessment, the dashboard, and what
              a 90-day rollout looks like at an institution your size. No slides, no sales pitch.
            </p>
            <Button
              variant="gold"
              size="lg"
              href={BRIEFING_MAILTO}
            >
              Request a briefing <ArrowR className="mk-ic" />
            </Button>
          </div>
          <ul>
            <li><CheckIcon className="mk-ic" />Demo on real institution data (yours or comparable)</li>
            <li><CheckIcon className="mk-ic" />FDIC peer comparison for your asset class</li>
            <li><CheckIcon className="mk-ic" />90-day rollout plan tailored to your shape</li>
            <li><CheckIcon className="mk-ic" />Pricing for your headcount & departments</li>
          </ul>
        </div>
      </Section>


      {/* PRICING / ADVISORY */}
      <Section id="engagement" variant="std" surface="white">
        <SectionHead
          kicker="How to engage"
          heading={<>Enrollment &amp; advisory.</>}
          lede={
            <>
              Self-serve seat blocks for institutions buying in volume, and a hands-on Leadership
              Advisory for institutions running a coached cohort. Organizational Rollout pricing is
              discussed in your Executive Briefing.
            </>
          }
        />
        <div className="mk-contact-grid">
          <div className="mk-ccard">
            <div className="mk-lab">Paid team diagnostic</div>
            <h3>Team Assessment</h3>
            <div className="mk-price">
              <div className="mk-v">10+</div>
              <div className="mk-u">seats · secure checkout</div>
            </div>
            <p>
              Buy the 48-question team assessment. Each participant receives a personal
              report; admins get the aggregate team dashboard after 10 completions.
            </p>
            <ul>
              <li><CheckIcon className="mk-ic" />Shared participant link</li>
              <li><CheckIcon className="mk-ic" />Department and role breakdowns</li>
              <li><CheckIcon className="mk-ic" />Print-ready team report</li>
            </ul>
            <Button variant="gold" size="lg" href={TEAM_ASSESSMENT_PATH}>
              Start team assessment <ArrowR className="mk-ic" />
            </Button>
          </div>
          <div className="mk-ccard">
            <div className="mk-lab">Self-serve</div>
            <h3>Institution Seats</h3>
            <div className="mk-price">
              <div className="mk-v">$199</div>
              <div className="mk-u">/ seat at 10+ · volume pricing</div>
            </div>
            <p>
              Buy Foundation Course seats in bulk. Admin dashboard. Assessment aggregated to org
              level. Toolbox shared across staff.
            </p>
            <ul>
              <li><CheckIcon className="mk-ic" />Volume discount from 10 seats</li>
              <li><CheckIcon className="mk-ic" />Admin assigns & tracks training</li>
              <li><CheckIcon className="mk-ic" />SSO available at 25+ seats</li>
            </ul>
            <Button variant="ink" size="lg" href={COURSE_SEATS_MAILTO}>
              Request course seats <ArrowR className="mk-ic" />
            </Button>
          </div>
          <div className="mk-ccard">
            <div className="mk-lab">Hands-on</div>
            <h3>Leadership Advisory</h3>
            <div className="mk-price">
              <div className="mk-v">Custom</div>
              <div className="mk-u">/ contact for engagement</div>
            </div>
            <p>
              Fractional Chief AI Officer. Quarterly working sessions with leadership, monthly
              cohort reviews, review-ready documentation throughout.
            </p>
            <ul>
              <li><CheckIcon className="mk-ic" />Includes all course + toolbox access</li>
              <li><CheckIcon className="mk-ic" />Custom playbooks for your institution</li>
              <li><CheckIcon className="mk-ic" />Direct line to founder</li>
            </ul>
            <Button
              variant="gold"
              size="lg"
              href={BRIEFING_MAILTO}
            >
              Request a briefing <ArrowR className="mk-ic" />
            </Button>
          </div>
        </div>
      </Section>

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
          { label: 'Team assessment', href: TEAM_ASSESSMENT_PATH, variant: 'ghost-dark' },
        ]}
      />

      <StickyMobileCta
        label="Team assessment"
        href={TEAM_ASSESSMENT_PATH}
        source="institutions-sticky"
      />
    </div>
  );
}
