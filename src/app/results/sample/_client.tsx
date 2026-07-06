/* eslint-disable react/no-unescaped-entities */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  SiteHeader,
  Section,
  Button,
  CtaBand,
} from '@/components/mockup';

// ---------- Icons ----------

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

const DownloadIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const ArrowR = (p: IconProps) => (
  <svg {...sw(p)}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const CheckCircleIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M9 12l2 2 4-4" />
    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.04 0 3.92.68 5.43 1.83" />
  </svg>
);
const TargetIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const FileIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const BarsIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);
const InboxIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const StarIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M12 3l1.9 5.8L20 10l-4.6 3.4L17.2 20 12 16.6 6.8 20l1.8-6.6L4 10l6.1-1.2z" />
  </svg>
);
const CheckSquareIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);
const ShieldIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const RectIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M6 12h4M14 12h4" />
  </svg>
);
const MailIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22 6 12 13 2 6" />
  </svg>
);
const UsersIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
  </svg>
);

// ---------- Data ----------

const DIMENSIONS = [
  { label: 'Tool fluency', score: 68, note: 'Can use common AI tools, but needs stronger tool selection judgment.' },
  { label: 'Data judgment', score: 72, note: 'Understands sensitive data concerns and needs repeatable rules.' },
  { label: 'Documentation', score: 44, note: 'Biggest gap. AI-supported work is not yet easy to review or evidence.' },
  { label: 'Human review', score: 58, note: 'Review happens, but criteria and ownership need to be clearer.' },
  { label: 'Repeatability', score: 52, note: 'Some saved prompts, but not yet governed skills or workflows.' },
];

function band(score: number) {
  if (score >= 76) return { label: 'Strong', cls: 'is-strong' };
  if (score >= 56) return { label: 'Developing', cls: 'is-dev' };
  return { label: 'Needs structure', cls: 'is-early' };
}

// ---------- Page ----------

export default function ResultsPage() {
  const [animated, setAnimated] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  // Animate bars on mount.
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
    setTimeout(() => setSent(false), 4500);
  }

  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/assessment" cta={{ label: 'Take the assessment', href: '/assessment' }} />

      {/* SAMPLE STRIP — top banner makes the demo nature unmistakable */}
      <div
        role="note"
        style={{
          background: 'var(--gold)',
          color: 'var(--ink)',
          padding: '12px 24px',
          textAlign: 'center',
          fontSize: '0.875rem',
          fontWeight: 600,
          letterSpacing: '0.02em',
        }}
      >
        <strong style={{ letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          Sample report
        </strong>{' '}
        — illustrative data only. Your real readiness report renders inline after you{' '}
        <a
          href="/assessment"
          style={{ color: 'var(--ink)', textDecoration: 'underline', fontWeight: 700 }}
        >
          take the 12-question assessment
        </a>
        .
      </div>

      {/* HERO */}
      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <h1>Preview the free readiness report.</h1>
            <p className="mk-lede">
              See the score, tier, top gap, and recommended next step before taking the
              12-question scan.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="/assessment">
                Take the free assessment <ArrowR className="mk-ic" />
              </Button>
              <Button
                variant="ghost-dark"
                size="lg"
                href="/api/resources/sample-readiness-report/download"
              >
                <DownloadIcon className="mk-ic" />
                Download sample (PDF)
              </Button>
            </div>
          </div>

          <div className="mk-rcard">
            <div className="mk-grid">
              <div className="mk-left">
                <div className="mk-k">Readiness Score</div>
                <div className="mk-v">62</div>
                <div className="mk-u">/ 100</div>
                <div className="mk-tier-box">
                  <div className="mk-l">Maturity level</div>
                  <div className="mk-t">Structured Beginner</div>
                </div>
              </div>
              <div className="mk-right">
                <div className="mk-k">Recommended Path</div>
                <h3>Build your first reviewed workflow.</h3>
                <div className="mk-mrow">
                  <CheckCircleIcon className="mk-ic-lg" size={20} />
                  <div>
                    <div className="mk-lk">Role</div>
                    <div className="mk-vv">Compliance</div>
                  </div>
                </div>
                <div className="mk-mrow">
                  <TargetIcon className="mk-ic-lg" size={20} />
                  <div>
                    <div className="mk-lk">Top gap</div>
                    <div className="mk-vv">Workflow documentation</div>
                  </div>
                </div>
                <div className="mk-mrow">
                  <FileIcon className="mk-ic-lg" size={20} />
                  <div>
                    <div className="mk-lk">Artifact</div>
                    <div className="mk-vv">AI use-case review packet</div>
                  </div>
                </div>
                <div className="mk-path">
                  <div className="mk-l">Path</div>
                  <div className="mk-v">Foundation Course → Workflow SOP → AI Use-Case Checklist</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIMENSION BREAKDOWN */}
      <Section variant="std">
        <div className="mk-dim-head">
          <div className="mk-section-head" style={{ marginBottom: 0 }}>
            <div className="k">Dimension Breakdown</div>
            <h2 style={{ marginTop: 8 }}>Where you are ready, and where structure is needed.</h2>
          </div>
          <p className="mk-lede-l">
            Your score suggests the next step is not more AI theory. It's turning usage into
            reviewed, repeatable workflows.
          </p>
        </div>
        <div className="mk-dim-grid">
          {DIMENSIONS.map((d) => {
            const b = band(d.score);
            return (
              <div key={d.label} className="mk-dim-card">
                <div className="mk-top">
                  <BarsIcon className="mk-ic-lg" size={20} />
                  <span className={`mk-dim-badge ${b.cls}`}>{b.label}</span>
                </div>
                <h3>{d.label}</h3>
                <div className="mk-bar">
                  <div className="mk-fill" style={{ width: animated ? `${d.score}%` : '0%' }} />
                </div>
                <div className="mk-pct">{d.score}/100</div>
                <div className="mk-note">{d.note}</div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* NEXT STEPS */}
      <Section variant="std" surface="white">
        <div className="mk-next-head">
          <div className="mk-section-head" style={{ marginBottom: 0 }}>
            <div className="k">Next Steps</div>
            <h2 style={{ marginTop: 8 }}>A practical path, not a vague score.</h2>
            <p className="mk-desc">
              The result should immediately tell you what to do, what you'll build, and why it
              matters.
            </p>
          </div>
          <div className="mk-next-grid">
            <div className="mk-next-card">
              <InboxIcon className="mk-ic-xl" size={24} />
              <h3>Take Foundation Course</h3>
              <span
                style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--gold-deep)',
                  margin: '2px 0 6px',
                }}
              >
                Self-serve &middot; enroll now
              </span>
              <p>Learn the prompt, skill, workflow, and review model.</p>
              <Link className="mk-link" href="/courses/foundation">
                Start course <ArrowR className="mk-ic" />
              </Link>
            </div>
            <div className="mk-next-card">
              <FileIcon className="mk-ic-xl" size={24} />
              <h3>Build Workflow SOP</h3>
              <p>Document tool, data, output, review owner, and retention rule.</p>
              <Link className="mk-link" href="/my-toolbox/skill-builder">
                Preview SOP <ArrowR className="mk-ic" />
              </Link>
            </div>
            <div className="mk-next-card">
              <StarIcon className="mk-ic-xl" size={24} />
              <h3>Practice in Sandbox</h3>
              <p>Use a safe compliance scenario before applying AI to real work.</p>
              <Link className="mk-link" href="/practice">
                Open sandbox <ArrowR className="mk-ic" />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* ARTIFACTS + EMAIL + TEAM */}
      <Section variant="std">
        <div className="mk-art-grid">
          <div className="mk-art-card">
            <div className="mk-art-head">
              <div className="mk-k">Recommended Artifacts</div>
              <div className="mk-t">What you should build next</div>
            </div>
            <div className="mk-art-body">
              {[
                { icon: CheckSquareIcon, name: 'AI Use-Case Checklist', type: 'Checklist' },
                { icon: FileIcon, name: 'Workflow SOP Template', type: 'Template' },
                { icon: ShieldIcon, name: 'Human Review Log', type: 'Review' },
                { icon: RectIcon, name: 'Compliance Skill Builder', type: 'Tool' },
              ].map(({ icon: Icon, name, type }) => (
                <div key={name} className="mk-art-cell">
                  <Icon className="mk-ic-xl" size={24} />
                  <div className="mk-nm">{name}</div>
                  <div className="mk-ty">{type}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mk-side-col">
            <div className="mk-email-card">
              <div className="mk-head">
                <MailIcon className="mk-ic-xl" size={24} />
                <div>
                  <h3>Send the full summary</h3>
                  <p>
                    Get the score, dimension breakdown, recommended path, and next-step artifacts
                    as a PDF.
                  </p>
                </div>
              </div>
              <form className="mk-email-form" onSubmit={submitEmail}>
                <input
                  type="email"
                  placeholder="you@institution.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="mk-btn mk-btn-gold">
                  {sent ? '✓ Sent' : 'Send PDF'}
                </button>
              </form>
              <div className={`mk-email-toast${sent ? ' is-shown' : ''}`}>
                ✓ Summary on its way. Check your inbox in a minute.
              </div>
            </div>

            <div className="mk-team-card">
              <div className="mk-k">Team Signal</div>
              <h3>Could this become a department opportunity?</h3>
              <span
                style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--slate-500)',
                  margin: '0 0 10px',
                }}
              >
                Sales-led &middot; by request
              </span>
              {[
                'Multiple learners with low documentation scores',
                'Departments using AI without common review steps',
                'Need for role-based training rollout',
                'Opportunity to standardize approved workflows',
              ].map((line) => (
                <div key={line} className="mk-sig">
                  <UsersIcon className="mk-ic-lg" size={20} />
                  <div className="mk-t">{line}</div>
                </div>
              ))}
              <div style={{ marginTop: 16 }}>
                <Button variant="ghost-light" href="/for-institutions">
                  Explore Team Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <CtaBand
        kicker="Recommended next step"
        heading={<>Start with documentation. Leave with reviewed workflows.</>}
        body={
          <>
            The Foundation Course helps you turn AI awareness into prompts, skills, SOPs,
            checklists, and sandbox-tested workflows.
          </>
        }
        actions={[
          { label: 'Start Foundation Course', href: '/courses/foundation', variant: 'gold' },
          { label: 'Preview Toolbox', href: '/my-toolbox', variant: 'ghost-dark' },
        ]}
      />
    </div>
  );
}
