/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  SiteHeader,
  Section,
  SectionHead,
  Button,
  ArrowGlyph,
  EyebrowChip,
  CtaBand,
} from '@/components/mockup';

// ---------- Stroke icons (inline SVGs to keep the bundle lean) ----------

type IconProps = { className?: string; size?: number };

const sw = (props: IconProps) => ({
  className: props.className,
  width: props.size,
  height: props.size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

const LockKeyholeIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <circle cx="12" cy="16" r="1" />
    <rect x="3" y="10" width="18" height="12" rx="2" />
    <path d="M7 10V7a5 5 0 0 1 9.33-2.5" />
  </svg>
);
const ZapIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const CheckSquareIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);
const BarsIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);
const LayersIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
const PlayCircleIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
);
const FlaskIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M10 2v7.31" />
    <path d="M14 9.3V2" />
    <path d="M8.5 2h7" />
    <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
  </svg>
);
const ToolboxStackIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <polyline points="22 19 12 24 2 19" />
    <polyline points="22 12 12 17 2 12" />
    <polygon points="12 2 22 7 12 12 2 7" />
  </svg>
);
const CheckIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const GitMergeIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <circle cx="6" cy="19" r="3" />
    <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
    <circle cx="18" cy="5" r="3" />
  </svg>
);
const FileIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const TargetIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const ShieldIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const ChevronRightIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const DownloadIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const SlidersIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <line x1="21" y1="4" x2="14" y2="4" />
    <line x1="10" y1="4" x2="3" y2="4" />
    <line x1="21" y1="12" x2="12" y2="12" />
    <line x1="8" y1="12" x2="3" y2="12" />
    <line x1="21" y1="20" x2="16" y2="20" />
    <line x1="12" y1="20" x2="3" y2="20" />
    <line x1="14" y1="2" x2="14" y2="6" />
    <line x1="8" y1="10" x2="8" y2="14" />
    <line x1="16" y1="18" x2="16" y2="22" />
  </svg>
);
const StarIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M12 3l1.9 5.8L20 10l-4.6 3.4L17.2 20 12 16.6 6.8 20l1.8-6.6L4 10l6.1-1.2z" />
  </svg>
);
const SaveIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
  </svg>
);
const CheckGlyphIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const SendIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const ChatIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

// ---------- Static data ----------

const HERO_DIMS = [
  { name: 'Governance', level: 'High', pct: 72 },
  { name: 'Tool fluency', level: 'Med', pct: 58 },
  { name: 'Risk awareness', level: 'High', pct: 75 },
  { name: 'Workflow fit', level: 'Med', pct: 55 },
  { name: 'Data judgment', level: 'Low', pct: 42 },
  { name: 'Documentation', level: 'Med', pct: 60 },
  { name: 'Role readiness', level: 'Med', pct: 65 },
  { name: 'Leadership', level: 'High', pct: 80 },
];

type SideKey = 'Assessment' | 'Sandbox' | 'Toolbox';

const HERO_SIDE: Record<
  SideKey,
  { label: string; title: string; score: string; unit: string; icon: typeof CheckSquareIcon; items: string[] }
> = {
  Assessment: {
    label: 'Assessment',
    title: 'Readiness Snapshot',
    score: '62',
    unit: '/100',
    icon: CheckSquareIcon,
    items: ['Governance', 'Tool confidence', 'Workflow fit', 'Risk awareness'],
  },
  Sandbox: {
    label: 'Sandbox',
    title: 'Guided Practice',
    score: '04',
    unit: 'scenarios',
    icon: FlaskIcon,
    items: ['Choose role', 'Use sample data', 'Review output', 'Save skill'],
  },
  Toolbox: {
    label: 'Toolbox',
    title: 'Reusable Assets',
    score: '18',
    unit: 'assets',
    icon: ToolboxStackIcon,
    items: ['Prompt cards', 'Workflow docs', 'Risk checklists', 'Playbooks'],
  },
};

const SUITE: {
  num: string;
  price: string;
  priceNote?: string;
  title: string;
  icon: typeof CheckSquareIcon;
  body: string;
  outcome: string;
  next: string;
  href: string;
}[] = [
  {
    num: '01',
    price: 'Free',
    title: 'Readiness Assessment',
    icon: CheckSquareIcon,
    body:
      'Twelve questions, three minutes. A score, a tier, and a tailored starter artifact you can take to your team this week.',
    outcome: 'Score, tier, top gap',
    next: 'Start here',
    href: '/assessment',
  },
  {
    num: '02',
    price: '$99',
    priceNote: '$79/seat at 10+ by request',
    title: 'In-Depth Assessment',
    icon: BarsIcon,
    body:
      'You leave with your in-depth score, AI assets you can use immediately, and a playbook to launch your first AI win. Anonymized team rollup included.',
    outcome: 'Role-specific action plan',
    next: 'Go deeper',
    href: '/assessment/in-depth',
  },
  {
    num: '03',
    price: '$295',
    priceNote: '$199/seat at 10+ · Lifetime access',
    title: 'AiBI-Foundation',
    icon: LayersIcon,
    body:
      'Learn how to build the prompts, agents, and AI workflows your daily banking work demands — and earn the AiBI-Foundation credential your examiner respects.',
    outcome: 'Reusable workflows + credential',
    next: 'View the curriculum',
    href: '/courses/foundation',
  },
];

type PBRole = 'Compliance' | 'Retail' | 'Marketing' | 'Operations';
type PBGoal = 'Document AI use safely' | 'Save time on repeat work' | 'Train my team' | 'Build approved workflows';

const PB_RECS: Record<PBRole, { path: string; artifact: string; metric: string; value: string }> = {
  Compliance: { path: 'Maturity Assessment → Foundation Course → Workflow SOP', artifact: 'AI use-case review packet', metric: 'Examiner-ready documentation', value: 'Reduce ambiguity before AI tools touch regulated work.' },
  Retail: { path: 'Free Assessment → Foundation Course → Branch Playbook', artifact: 'Frontline coaching and service recovery kit', metric: 'Faster staff enablement', value: 'Give managers practical tools for coaching and customer scenarios.' },
  Marketing: { path: 'Maturity Assessment → Sandbox → Campaign Review Workflow', artifact: 'AI-assisted campaign checklist', metric: 'Cleaner review cycles', value: 'Move faster without skipping disclosures, review, or brand standards.' },
  Operations: { path: 'Foundation Course → Toolbox → Procedure Skill', artifact: 'Procedure cleanup builder', metric: 'Less rework', value: 'Turn messy process knowledge into repeatable internal assets.' },
};

type RoleKey = 'Compliance' | 'Retail' | 'Marketing';

const ROLES: Record<RoleKey, { title: string; artifact: string; status: string; outputs: string[]; href: string }> = {
  Compliance: { title: 'Compliance', artifact: 'Workflow Review Packet', status: 'Ready with review', outputs: ['AI use-case checklist', 'Examiner-ready SOP', 'Human review log'], href: '/playbooks/compliance' },
  Retail: { title: 'Branch / Retail', artifact: 'Frontline Coaching Kit', status: 'Manager approved', outputs: ['Scenario scripts', 'Job aids', 'Service recovery prompts'], href: '/playbooks/retail' },
  Marketing: { title: 'Marketing', artifact: 'Campaign Review Workspace', status: 'Review required', outputs: ['Draft variations', 'Disclosure checklist', 'Approval workflow'], href: '/playbooks/marketing' },
};

type ScenarioKey = 'Procedure' | 'Complaint' | 'Campaign';

const SCEN: Record<ScenarioKey, { name: string; input: string; output: string; review: string }> = {
  Procedure: { name: 'Procedure Cleanup', input: 'Dense internal procedure', output: 'Frontline job aid', review: 'Manager review' },
  Complaint: { name: 'Complaint Summary', input: 'Sample complaint notes', output: 'Issue summary and next steps', review: 'Compliance review' },
  Campaign: { name: 'Campaign Draft', input: 'Product offer brief', output: 'Email copy and risk flags', review: 'Marketing and compliance' },
};

// ---------- Page ----------

export default function HomePage() {
  const [sideKey, setSideKey] = useState<SideKey>('Assessment');
  const [pbRole, setPbRole] = useState<PBRole>('Compliance');
  const [pbGoal, setPbGoal] = useState<PBGoal>('Document AI use safely');
  const [roleKey, setRoleKey] = useState<RoleKey>('Compliance');
  const [scenKey, setScenKey] = useState<ScenarioKey>('Procedure');
  const [saved, setSaved] = useState(false);
  const [savedRows, setSavedRows] = useState<{ name: string; meta: string; isNew?: boolean }[]>([
    { name: 'KYC frontline guide', meta: 'Compliance · 2 days ago' },
    { name: 'Complaint summary template', meta: 'Compliance · 3 days ago' },
    { name: 'Email disclosure check', meta: 'Marketing · 1 week ago' },
  ]);

  function handleSave() {
    if (saved) return;
    setSaved(true);
    setSavedRows((prev) => [
      { name: 'Procedure Cleanup Prompt', meta: 'Operations · Just saved', isNew: true },
      ...prev.map((r) => ({ ...r, isNew: false })),
    ]);
  }

  const side = HERO_SIDE[sideKey];
  const SideIcon = side.icon;
  const pb = PB_RECS[pbRole];
  const role = ROLES[roleKey];
  const scen = SCEN[scenKey];

  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/" />

      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <EyebrowChip icon={<LockKeyholeIcon className="mk-ic" />}>
              Built for banks, credit unions, and regulated teams
            </EyebrowChip>
            <h1>Train people to use AI without losing control.</h1>
            <p className="mk-lede">
              Independent AI assessment and education for community banks and credit unions.
              Assess readiness, practice safely, and turn useful prompts into documented workflows
              your examiner respects. <strong>No software seats. No vendor lock-in.</strong>
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="/assessment">
                Take the assessment <ArrowGlyph />
              </Button>
              <Button variant="ghost-dark" size="lg" href="/courses/foundation">
                View the curriculum
              </Button>
            </div>
          </div>
          <HeroReportCard />
        </div>
      </section>

      <Section variant="std">
        <SectionHead
          kicker="How the Institute works"
          heading={<>One place to start. Three things you walk out with.</>}
          lede={
            <>
              Every learner enters the same way: take an assessment, practice in a scenario, or pull a tool from the toolbox. Click a tab to see what each one ships.
            </>
          }
        />
        <div className="mk-pp">
          <div className="mk-hp-card">
            <div className="mk-head">
              <div>
                <div className="mk-k">Inside the Institute</div>
                <div className="mk-t">Where each learner begins</div>
              </div>
              <PlayCircleIcon className="mk-ic-lg" size={32} />
            </div>
            <div className="mk-body">
              <div className="mk-product-grid">
                {[
                  { icon: CheckSquareIcon, title: 'Readiness Assessment', meta: '3 min' },
                  { icon: BarsIcon, title: 'Maturity Assessment', meta: '48 questions' },
                  { icon: LayersIcon, title: 'Foundation Course', meta: 'Course + toolbox' },
                ].map(({ icon: Icon, title, meta }) => (
                  <div key={title} className="mk-pcard">
                    <span className="mk-pic">
                      <Icon className="mk-ic-lg" size={20} />
                    </span>
                    <div className="mk-pt">{title}</div>
                    <div className="mk-pm">{meta}</div>
                  </div>
                ))}
              </div>
              <div className="mk-path-row">
                <div className="mk-k">Learner Path</div>
                <div className="mk-t">Assess → Practice → Build</div>
                <div className="mk-path-tabs">
                  {(['Assessment', 'Sandbox', 'Toolbox'] as SideKey[]).map((k) => (
                    <button key={k} onClick={() => setSideKey(k)} className={sideKey === k ? 'is-active' : ''}>
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mk-hp-side">
            <span className="mk-pic">
              <SideIcon className="mk-ic-lg" size={24} />
            </span>
            <div className="mk-k">{side.label}</div>
            <h3>{side.title}</h3>
            <div className="mk-score">
              <div className="mk-v">{side.score}</div>
              <div className="mk-u">{side.unit}</div>
            </div>
            <div className="mk-items">
              {side.items.map((item) => (
                <div key={item} className="mk-item">
                  <CheckIcon size={16} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section variant="std">
        <SectionHead kicker="Product Suite" heading={<>A clear path from interest to implementation.</>} />
        <div className="mk-suite">
          {SUITE.map(({ num, price, priceNote, title, icon: Icon, body, outcome, next, href }) => (
            <Link key={num} className="mk-scard" href={href} aria-label={title}>
              <div className="mk-top-rule" />
              <div className="mk-body">
                <div className="mk-row">
                  <span className="mk-pic">
                    <Icon className="mk-ic-lg" size={20} />
                  </span>
                  <span className="mk-num">{num}</span>
                </div>
                <div className="mk-lbl">{price}</div>
                {priceNote && (
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--slate-500)',
                      fontWeight: 500,
                      letterSpacing: '0.02em',
                      marginTop: 2,
                    }}
                  >
                    {priceNote}
                  </div>
                )}
                <h3>{title}</h3>
                <p
                  style={{
                    marginTop: 12,
                    color: 'var(--slate-600)',
                    fontSize: 15,
                    lineHeight: 1.55,
                  }}
                >
                  {body}
                </p>
                <div className="mk-infobox">
                  <div className="mk-k">Outcome</div>
                  <div className="mk-v">{outcome}</div>
                </div>
                <div className="mk-infobox mk-line">
                  <div className="mk-k">Next action</div>
                  <div className="mk-v">{next}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <section className="mk-pb">
        <div className="mk-container mk-pb-grid">
          <div>
            <div style={{ color: 'var(--gold-soft)', fontSize: 14, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Interactive Guidance
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', fontWeight: 600, margin: '8px 0 0', lineHeight: 1.08, letterSpacing: '-0.015em' }}>
              Find your next best step.
            </h2>
            <p className="mk-lede">Select a role and goal to see the path, artifact, and business value.</p>
          </div>
          <div className="mk-pb-card">
            <div className="mk-pb-grid-inner">
              <div className="mk-pb-controls">
                <div className="mk-opt-group">
                  <div className="mk-lab">Role</div>
                  <div className="mk-opt-list">
                    {(Object.keys(PB_RECS) as PBRole[]).map((r) => (
                      <button key={r} onClick={() => setPbRole(r)} className={pbRole === r ? 'is-active' : ''}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mk-opt-group">
                  <div className="mk-lab">Goal</div>
                  <div className="mk-opt-list mk-gold">
                    {(['Document AI use safely', 'Save time on repeat work', 'Train my team', 'Build approved workflows'] as PBGoal[]).map((g) => (
                      <button key={g} onClick={() => setPbGoal(g)} className={pbGoal === g ? 'is-active' : ''}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mk-pb-rx">
                <div className="mk-rxhead">
                  <div>
                    <div className="mk-k">Recommended Path</div>
                    <div className="mk-t">{pbRole} · {pbGoal}</div>
                  </div>
                  <GitMergeIcon className="mk-ic-lg" size={32} />
                </div>
                <div className="mk-infobox">
                  <div className="mk-k">Path</div>
                  <div className="mk-v">{pb.path}</div>
                </div>
                <div className="mk-pair">
                  <div className="mk-iconbox">
                    <FileIcon size={24} />
                    <div className="mk-k" style={{ color: 'var(--slate-500)', fontSize: 14 }}>Artifact</div>
                    <div className="mk-v" style={{ marginTop: 4, fontWeight: 600 }}>{pb.artifact}</div>
                  </div>
                  <div className="mk-iconbox">
                    <TargetIcon size={24} />
                    <div className="mk-k" style={{ color: 'var(--slate-500)', fontSize: 14 }}>Value signal</div>
                    <div className="mk-v" style={{ marginTop: 4, fontWeight: 600 }}>{pb.metric}</div>
                  </div>
                </div>
                <div className="mk-why">
                  <div className="mk-k">Why it matters</div>
                  <div className="mk-v">{pb.value}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section variant="std" surface="white">
        <div className="mk-role-grid">
          <div>
            <SectionHead
              kicker="Role Previews"
              heading={<>Show the artifact. Then teach the skill.</>}
              lede={<>Learners see the practical output before the lesson begins.</>}
            />
            <div className="mk-role-tabs">
              {(Object.keys(ROLES) as RoleKey[]).map((r) => (
                <button key={r} onClick={() => setRoleKey(r)} className={roleKey === r ? 'is-active' : ''}>
                  {ROLES[r].title}
                </button>
              ))}
            </div>
          </div>
          <div className="mk-role-card">
            <div className="mk-role-grid-inner">
              <div className="mk-role-left">
                <span className="mk-pic">
                  <ShieldIcon size={28} />
                </span>
                <div className="mk-k">{role.title}</div>
                <h3>{role.artifact}</h3>
                <div className="mk-mini">
                  <div className="mk-top">
                    <div className="mk-k">Artifact Preview</div>
                    <div className="mk-n">{role.artifact}</div>
                  </div>
                  <div className="mk-row">
                    <div className="mk-cell mk-key">Owner</div>
                    <div className="mk-cell mk-val">Department lead</div>
                  </div>
                  <div className="mk-row">
                    <div className="mk-cell mk-key">Status</div>
                    <div className="mk-cell mk-status">{role.status}</div>
                  </div>
                  <div className="mk-row">
                    <div className="mk-cell mk-key">Review</div>
                    <div className="mk-cell mk-val">Human approval</div>
                  </div>
                </div>
              </div>
              <div className="mk-role-right">
                <div className="mk-k">Outputs</div>
                <div className="mk-out-list">
                  {role.outputs.map((o) => (
                    <div key={o} className="mk-out-row">
                      <div className="mk-ll">
                        <FileIcon size={20} />
                        {o}
                      </div>
                      <ChevronRightIcon size={16} className="mk-ic" />
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 24 }}>
                  <Button variant="ink" href={role.href}>
                    View sample artifact <DownloadIcon size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section variant="std">
        <div className="mk-sb-grid">
          <div className="mk-sb-card">
            <div className="mk-sb-head">
              <div>
                <div className="mk-k">Sandbox</div>
                <div className="mk-t">Practice Lab</div>
              </div>
              <FlaskIcon className="mk-ic-lg" size={32} />
            </div>
            <div className="mk-sb-steps">
              <div><div className="mk-n">Pick role</div><div className="mk-d">Step 1</div></div>
              <div><div className="mk-n">Load scenario</div><div className="mk-d">Step 2</div></div>
              <div><div className="mk-n">Review result</div><div className="mk-d">Step 3</div></div>
              <div><div className="mk-n">Save asset</div><div className="mk-d">Step 4</div></div>
            </div>
            <div className="mk-sb-body">
              <div className="mk-sb-pills">
                {(['Procedure', 'Complaint', 'Campaign'] as ScenarioKey[]).map((k) => (
                  <button key={k} onClick={() => setScenKey(k)} className={scenKey === k ? 'is-active' : ''}>
                    {k === 'Procedure' && 'Procedure Cleanup'}
                    {k === 'Complaint' && 'Complaint Summary'}
                    {k === 'Campaign' && 'Campaign Draft'}
                  </button>
                ))}
              </div>
              <div className="mk-sb-scenario">
                <div className="mk-stop">
                  <div style={{ fontWeight: 600 }}>Scenario: <span>{scen.name}</span></div>
                  <span className="mk-badge">Safe sample data</span>
                </div>
                <div className="mk-sb-fields">
                  <div className="mk-sb-field"><div className="mk-k">Input</div><div className="mk-v">{scen.input}</div></div>
                  <div className="mk-sb-field"><div className="mk-k">Output</div><div className="mk-v">{scen.output}</div></div>
                  <div className="mk-sb-field mk-gold"><div className="mk-k">Review</div><div className="mk-v">{scen.review}</div></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mk-sb-right">
            <SectionHead kicker="Less lecture. More reps." heading={<>A controlled place to test, compare, and improve.</>} />
            <div className="mk-grid">
              <div className="mk-sb-feat"><ChatIcon size={24} /><div className="mk-f">Sample banking scenarios</div></div>
              <div className="mk-sb-feat"><ShieldIcon size={24} /><div className="mk-f">Output review checklists</div></div>
              <div className="mk-sb-feat"><SlidersIcon size={24} /><div className="mk-f">Prompt comparison</div></div>
              <div className="mk-sb-feat"><StarIcon size={24} /><div className="mk-f">Saveable skills</div></div>
            </div>
          </div>
        </div>
      </Section>

      <Section variant="std">
        <SectionHead
          kicker="Save to Toolbox"
          heading={<>Useful work becomes a reusable asset.</>}
          lede={<>Anything that runs in the Sandbox can be saved as a prompt and added to your Toolbox — with the review tags and craft baked in.</>}
        />
        <div className="mk-stb">
          <div className="mk-stb-card">
            <div className="mk-stb-top">
              <span className="mk-lab">Sandbox Output · Compliance</span>
              <span className="mk-ic-pill"><CheckGlyphIcon size={16} />Reviewed</span>
            </div>
            <h3 className="mk-stb-title">Procedure Cleanup Prompt</h3>
            <div className="mk-stb-body">
              <div className="mk-stb-label">Prompt</div>
              <div className="mk-stb-prompt">
                Rewrite this internal procedure as a frontline job aid. Use plain language, numbered steps, risk notes, and a manager review checklist.
              </div>
            </div>
            <div className="mk-stb-meta">
              <div className="mk-stb-cell"><div className="mk-k">Type</div><div className="mk-v">Prompt</div></div>
              <div className="mk-stb-cell"><div className="mk-k">Role</div><div className="mk-v">Operations</div></div>
              <div className="mk-stb-cell mk-gold"><div className="mk-k">Review</div><div className="mk-v">Manager</div></div>
            </div>
            <button type="button" className={`mk-btn-save${saved ? ' is-saved' : ''}`} onClick={handleSave}>
              <SaveIcon size={16} />
              <span>{saved ? 'Saved to Toolbox' : 'Save to Toolbox'}</span>
            </button>
            <div className={`mk-stb-toast${saved ? ' is-shown' : ''}`}>
              <CheckGlyphIcon size={16} />
              Saved. This asset now appears in your Toolbox.
            </div>
          </div>

          <div className="mk-stb-tb">
            <div className="mk-stb-tb-head">
              <span className="mk-lab">Your Toolbox · live</span>
              <span className="mk-cnt">{savedRows.length} prompts</span>
            </div>
            <div className="mk-stb-tb-list">
              {savedRows.map((row, i) => (
                <div key={`${row.name}-${i}`} className={`mk-stb-row${row.isNew ? ' is-new' : ''}`}>
                  {row.isNew ? <ToolboxStackIcon size={20} /> : i % 2 === 0 ? <FileIcon size={20} /> : <SendIcon size={20} />}
                  <div>
                    <div className="mk-nm">{row.name}</div>
                    <div className="mk-meta">{row.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <CtaBand
        heading={<>Build confidence. Keep control.</>}
        body={<>A practical path for financial professionals to assess, train, practice, and document AI-supported work.</>}
        actions={[
          { label: 'Take the assessment', href: '/assessment', variant: 'gold' },
          { label: 'Preview Toolbox', href: '/my-toolbox', variant: 'ghost-dark' },
        ]}
      />
    </div>
  );
}

function HeroReportCard() {
  return (
    <div className="mk-hreport">
      <div className="mk-hreport-left">
        <div className="mk-k">Sample report</div>
        <div className="mk-v">62</div>
        <div className="mk-u">/ 100 readiness</div>
        <div className="mk-tier">
          <ZapIcon size={16} />
          Building Momentum
        </div>
      </div>
      <div className="mk-hreport-right">
        <div className="mk-k">8 Dimensions</div>
        <div className="mk-hdims">
          {HERO_DIMS.map((d) => (
            <div key={d.name} className="mk-hdim">
              <div className="mk-row">
                <span className="mk-nm">{d.name}</span>
                <span className="mk-lv">{d.level}</span>
              </div>
              <div className="mk-bar">
                <div className="mk-fill" style={{ width: `${d.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
