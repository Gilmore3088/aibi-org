/* eslint-disable react/no-unescaped-entities */
'use client';

import { useMemo, useState } from 'react';
import {
  SiteHeader,
  Section,
  SectionHead,
  Button,
  EyebrowChip,
  CtaBand,
} from '@/components/mockup';

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

const StackIcon = (p: IconProps) => (<svg {...sw(p)}><polyline points="22 12 12 17 2 12" /><polygon points="12 2 22 7 12 12 2 7" /></svg>);
const ArrowR = (p: IconProps) => (<svg {...sw(p)}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);
const ChatIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
const FileIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>);
const ShieldIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>);
const InboxIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>);
const SettingsIcon = (p: IconProps) => (<svg {...sw(p)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33" /></svg>);
const BadgeIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M9 12l2 2 4-4" /><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.04 0 3.92.68 5.43 1.83" /></svg>);
const UsersIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>);
const SendIcon = (p: IconProps) => (<svg {...sw(p)}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>);
const SearchIcon = (p: IconProps) => (<svg {...sw(p)}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const LockIcon = (p: IconProps) => (<svg {...sw(p)}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
const CopyIcon = (p: IconProps) => (<svg {...sw(p)}><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>);

type Role = 'All' | 'Compliance' | 'Retail' | 'Marketing' | 'Lending' | 'Operations';
const ROLES: Role[] = ['All', 'Compliance', 'Retail', 'Marketing', 'Lending', 'Operations'];
const FILTER_MAP: Record<Role, string[] | null> = {
  All: null,
  Compliance: ['Compliance'],
  Retail: ['Retail', 'Branch / Retail'],
  Marketing: ['Marketing'],
  Lending: ['Lending'],
  Operations: ['Operations'],
};
const ALWAYS_VISIBLE = new Set(['All roles', 'Skill', 'Reference', 'Tool', 'Leadership']);

const CATEGORIES: { icon: typeof ChatIcon; ct: string; title: string; desc: string; items: [string, string][] }[] = [
  { icon: ChatIcon, ct: '6 prompts', title: 'Prompt Library', desc: 'Reusable banking prompts by role and task. Each one has tested craft and a review checklist baked in.', items: [['KYC frontline guide', 'Compliance'], ['Adverse action letter', 'Lending'], ['Complaint summary', 'Compliance']] },
  { icon: FileIcon, ct: '4 SOPs', title: 'Workflow SOPs', desc: 'Input, tool, output, review, and retention — the workflow document examiners actually look at.', items: [['Email triage workflow', 'All roles'], ['Document Q&A workflow', 'Compliance'], ['Memo draft workflow', 'Leadership']] },
  { icon: ShieldIcon, ct: '3 lists', title: 'Risk Checklists', desc: 'Guardrails for safe use and escalation. Specific to the use case, not generic AI principles.', items: [['PII handling', 'All roles'], ['Disclosure review', 'Marketing'], ['Fair lending', 'Lending']] },
  { icon: InboxIcon, ct: '4 books', title: 'Role Playbooks', desc: 'End-to-end examples for compliance, retail, marketing, and lending. Real scenarios, real artifacts.', items: [['Compliance playbook', 'Compliance'], ['Branch playbook', 'Retail'], ['Marketing playbook', 'Marketing']] },
  { icon: SettingsIcon, ct: '3 builders', title: 'Skill Builders', desc: 'Turn one-off prompts into reusable tools with structured inputs and named outputs.', items: [['Skill Builder tool', 'Tool'], ['Procedure cleaner', 'Skill'], ['Disclosure auditor', 'Skill']] },
  { icon: BadgeIcon, ct: '2 cards', title: 'Reference Cards', desc: 'Short summaries of rules and standards. The one-pagers you wish your compliance team would write.', items: [['SR 11-7 in 1 page', 'Reference'], ['AIEOG Lexicon', 'Reference']] },
];

const PROMPT_BODY = `[ROLE] You are a community bank compliance officer producing a one-page frontline guide for tellers.

[INPUT] Source procedure: {{procedure_text}}
Target audience: {{audience}}

[TASK]
1. Identify the three most common scenarios a teller will encounter.
2. For each scenario, write a single-sentence instruction in plain English.
3. List the exact triggers that should escalate to compliance.

[FORMAT]
- Title: "{{topic}}: Quick Guide"
- Three numbered scenarios, each 1–2 sentences
- "Escalate if:" section with up to four triggers

[REVIEW]
- Flag any phrase that loses legal meaning when simplified.
- Flag any escalation trigger that isn't in the source procedure.
- Append a review tag at the bottom: "Reviewed by [name] on [date]"`;

const PLAYBOOKS: { slug: string; icon: typeof ShieldIcon; title: string; desc: string }[] = [
  { slug: 'compliance', icon: ShieldIcon, title: 'Compliance', desc: 'Procedure cleanup, audit prep, exam-ready summaries.' },
  { slug: 'retail', icon: UsersIcon, title: 'Branch / Retail', desc: 'Coaching scripts, service recovery, frontline reference cards.' },
  { slug: 'marketing', icon: SendIcon, title: 'Marketing', desc: 'Campaign drafts, disclosure flags, brand-safe variations.' },
  { slug: 'lending', icon: FileIcon, title: 'Lending', desc: 'Adverse-action tuner, denial summaries, fair-lending checks.' },
  { slug: 'bsa-aml', icon: SearchIcon, title: 'BSA / AML', desc: 'SAR decision tree, structuring patterns, CDD baseline drift.' },
  { slug: 'infosec', icon: LockIcon, title: 'IT / InfoSec', desc: 'Data classification matrix, allowed-tools verdicts, NPI rules.' },
];

export default function ToolboxPage() {
  const [role, setRole] = useState<Role>('All');
  const [copied, setCopied] = useState(false);

  const matchList = FILTER_MAP[role];

  const visibleByCat = useMemo(
    () =>
      CATEGORIES.map((cat) => {
        const visible = cat.items.map(([nm, meta]) => {
          const show = !matchList || matchList.includes(meta) || ALWAYS_VISIBLE.has(meta);
          return { nm, meta, show };
        });
        return { visible, anyVisible: visible.some((v) => v.show) };
      }),
    [matchList],
  );

  async function copyPrompt() {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(PROMPT_BODY);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/my-toolbox" cta={{ label: 'Browse Toolbox', href: '#categories' }} />

      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <EyebrowChip icon={<StackIcon className="mk-ic" />}>
              Toolbox preview · 18 sample assets · Demo
            </EyebrowChip>
            <h1>A working kit, not a PDF graveyard.</h1>
            <p className="mk-lede">
              A preview of what your AiBI-Foundation Toolbox holds — substantive prompts,
              workflow SOPs, risk checklists, role playbooks, and saved skills. Built to use,
              not to read. <strong>Enroll in the AiBI-Foundation course to open
              your live Toolbox</strong> with your own saved assets.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="/courses/foundation/program/purchase">
                Enroll · $295 <ArrowR className="mk-ic" />
              </Button>
              <Button variant="ghost-dark" size="lg" href="#categories">
                Browse the preview
              </Button>
            </div>
          </div>

          <div className="mk-grid-prev">
            <div className="mk-head">
              <div>
                <div className="mk-k">Categories</div>
                <div className="mk-t">Six pillars · 18 assets</div>
              </div>
              <StackIcon size={32} />
            </div>
            <div className="mk-body">
              {[
                { icon: ChatIcon, nm: 'Prompt Library', ct: '6 prompts' },
                { icon: FileIcon, nm: 'Workflow SOPs', ct: '4 SOPs' },
                { icon: ShieldIcon, nm: 'Risk Checklists', ct: '3 lists' },
                { icon: InboxIcon, nm: 'Role Playbooks', ct: '4 books' },
              ].map(({ icon: Icon, nm, ct }) => (
                <div key={nm} className="mk-cell">
                  <Icon size={24} />
                  <div className="mk-nm">{nm}</div>
                  <div className="mk-ct">{ct}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Section variant="std" id="categories">
        <SectionHead
          kicker="Six categories"
          heading={<>Everything bankers need. Nothing they don't.</>}
          lede={<>Every asset is a working artifact — not a PDF, not a slide deck. Tagged by role, ready to copy.</>}
        />

        <div className="mk-role-filter" role="tablist">
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--slate-500)', marginRight: 6 }}>Filter by role:</span>
          {ROLES.map((r) => (
            <button key={r} type="button" onClick={() => setRole(r)} className={`mk-rf${role === r ? ' is-active' : ''}`}>
              {r === 'Retail' ? 'Branch / Retail' : r}
            </button>
          ))}
        </div>

        <div className="mk-cats">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            const { visible, anyVisible } = visibleByCat[idx];
            return (
              <div key={cat.title} className={`mk-cat${!anyVisible ? ' is-dim' : ''}`}>
                <div className="mk-bar" />
                <div className="mk-body">
                  <div className="mk-top">
                    <span className="mk-pic"><Icon size={24} /></span>
                    <span className="mk-ct">{cat.ct}</span>
                  </div>
                  <h3>{cat.title}</h3>
                  <p>{cat.desc}</p>
                  <div className="mk-items">
                    {visible.map((v) => (
                      <div key={v.nm} className={`mk-item${!v.show ? ' is-hidden' : ''}`}>
                        <span className="mk-nm">{v.nm}</span>
                        <span className="mk-meta">{v.meta}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section variant="std" surface="white" id="sample-prompt">
        <SectionHead
          kicker="Inside a prompt"
          heading={<>Every prompt is a fully-built artifact.</>}
          lede={<>Not a one-liner. Multi-field, reviewable, copy-pastable, with the craft baked in.</>}
        />

        <div className="mk-pcard-detail">
          <div className="mk-meta-pane">
            <div className="mk-k">Prompt · v2</div>
            <h3>KYC Refresh: Frontline Guide</h3>
            <div className="mk-badges">
              <span className="mk-badge mk-gold">Compliance</span>
              <span className="mk-badge">All roles</span>
              <span className="mk-badge">SR 11-7 aware</span>
            </div>
            <div className="mk-field"><div className="mk-k">Use case</div><div className="mk-v">Turn a dense KYC procedure into a one-page frontline guide</div></div>
            <div className="mk-field"><div className="mk-k">Inputs</div><div className="mk-v">Source procedure text · target audience</div></div>
            <div className="mk-field"><div className="mk-k">Outputs</div><div className="mk-v">Frontline guide · escalation triggers · review tags</div></div>
            <div className="mk-field"><div className="mk-k">Review checklist</div><div className="mk-v">3 items · examiner-ready</div></div>
          </div>
          <div className="mk-prompt-pane">
            <div className="mk-top">
              <div className="mk-k">Prompt body</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="ghost-light" onClick={copyPrompt}>
                  <CopyIcon className="mk-ic" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </Button>
                <Button variant="ink" href="/practice">
                  Use in Sandbox <ArrowR className="mk-ic" />
                </Button>
              </div>
            </div>
            <pre className="mk-prompt-body">{PROMPT_BODY}</pre>
            <div className="mk-actions">
              <div className="mk-meta-text">Last reviewed: 2026-04-18 · Reviewer: Lisa M.</div>
              <a className="mk-link" href="/my-toolbox/skills/kyc-refresh-guide">
                View 3 saved variations <ArrowR className="mk-ic" />
              </a>
            </div>
          </div>
        </div>
      </Section>

      <Section variant="std">
        <SectionHead
          kicker="By role"
          heading={<>Built-in playbooks for the people who actually have to use this.</>}
        />
        <div className="mk-playbooks">
          {PLAYBOOKS.map(({ slug, icon: Icon, title, desc }) => (
            <a key={slug} className="mk-pb" href={`/playbooks/${slug}`}>
              <span className="mk-pic"><Icon size={24} /></span>
              <h3>{title}</h3>
              <p>{desc}</p>
              <div className="mk-count">Open playbook →</div>
            </a>
          ))}
        </div>
      </Section>

      <CtaBand
        kicker="Toolbox"
        heading={<>The work product, not the white paper.</>}
        body={<>Every prompt is reviewed, tagged, and ready to ship. Comes free with the Foundation Course — or buy standalone access.</>}
        actions={[
          { label: 'Get with the Course · $295', href: '/courses/foundation', variant: 'gold' },
          { label: 'Toolbox-only access', href: '/for-institutions', variant: 'ghost-dark' },
        ]}
      />
    </div>
  );
}
