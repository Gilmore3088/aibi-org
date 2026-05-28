/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import {
  SiteHeader,
  Section,
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
const ShieldIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>);
const CheckIcon = (p: IconProps) => (<svg {...sw(p)}><polyline points="20 6 9 17 4 12" /></svg>);
const UsersIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>);
const HistoryIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M3 12a9 9 0 1 0 9-9" /><polyline points="3 4 3 12 11 12" /></svg>);
const FileIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>);

type VersionKey = 'v3' | 'v2' | 'v1';
const VERSIONS: { key: VersionKey; name: string; status: string; date: string; note: string }[] = [
  { key: 'v3', name: 'v3 · Current', status: 'Approved', date: '2026-05-22', note: 'Added escalation triggers + reviewer tag.' },
  { key: 'v2', name: 'v2', status: 'Approved', date: '2026-05-18', note: 'Trimmed legal-language redundancy.' },
  { key: 'v1', name: 'v1', status: 'Draft', date: '2026-05-12', note: 'Initial build from procedure SOP.' },
];

// Next 14 client-component params are a plain object — Promise + React.use()
// is Next 15 / React 19 syntax. Using it here threw "use is not a function"
// on every render and returned 500 for any slug. Issue #312.
export default function SavedSkillPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [version, setVersion] = useState<VersionKey>('v3');
  const active = VERSIONS.find((v) => v.key === version) ?? VERSIONS[0];

  const niceName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/my-toolbox" cta={{ label: 'Browse Toolbox', href: '/my-toolbox' }} />

      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <EyebrowChip icon={<StackIcon className="mk-ic" />}>Saved Skill · Toolbox</EyebrowChip>
            <h1>{niceName}</h1>
            <p className="mk-lede">
              A versioned, reviewable skill in your Toolbox. Open the Markdown, run it in the
              Sandbox, or push a new version.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="/practice">
                Run in Sandbox <ArrowR className="mk-ic" />
              </Button>
              <Button variant="ghost-dark" size="lg" href="/my-toolbox/skill-builder">
                Edit in Builder
              </Button>
            </div>
          </div>

          <div className="mk-ssh">
            <div className="mk-head">
              <div className="mk-k">Saved Skill</div>
              <div className="mk-t">{niceName}</div>
            </div>
            <div className="mk-stats">
              <div className="mk-stat">
                <UsersIcon size={24} />
                <div className="mk-l">Role</div>
                <div className="mk-v">Compliance</div>
              </div>
              <div className="mk-stat">
                <ShieldIcon size={24} />
                <div className="mk-l">Risk</div>
                <div className="mk-v">Medium</div>
              </div>
              <div className="mk-stat">
                <CheckIcon size={24} />
                <div className="mk-l">Status</div>
                <div className="mk-v">{active.status}</div>
              </div>
              <div className="mk-stat">
                <HistoryIcon size={24} />
                <div className="mk-l">Versions</div>
                <div className="mk-v">{VERSIONS.length}</div>
              </div>
            </div>
            <div className="mk-purpose">
              <div className="mk-box">
                <div className="mk-l">Purpose</div>
                <div className="mk-v">
                  Turn a dense KYC procedure into a one-page frontline guide with escalation
                  triggers and a review tag.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section variant="std" contained={false} style={{ background: 'var(--cream)' }}>
        <div className="mk-container mk-ss-body">
          <div className="mk-col">
            <div className="mk-panel">
              <div className="mk-panel-head"><div className="mk-k">Allowed Inputs</div></div>
              <div className="mk-panel-body">
                <div className="mk-crow"><CheckIcon size={16} /><div className="mk-t">Source procedure text (no customer data)</div></div>
                <div className="mk-crow"><CheckIcon size={16} /><div className="mk-t">Target audience descriptor</div></div>
                <div className="mk-crow"><CheckIcon size={16} /><div className="mk-t">Effective date</div></div>
              </div>
            </div>

            <div className="mk-panel">
              <div className="mk-panel-head"><div className="mk-k">Guardrails</div></div>
              <div className="mk-panel-body">
                <div className="mk-crow"><ShieldIcon size={16} /><div className="mk-t">Flag phrases that lose legal meaning when simplified.</div></div>
                <div className="mk-crow"><ShieldIcon size={16} /><div className="mk-t">Do not infer escalation triggers not in source.</div></div>
                <div className="mk-crow"><ShieldIcon size={16} /><div className="mk-t">Append reviewer name + date.</div></div>
              </div>
            </div>

            <div className="mk-panel">
              <div className="mk-panel-head"><div className="mk-k">Versions</div></div>
              <div className="mk-panel-body">
                {VERSIONS.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => setVersion(v.key)}
                    className={`mk-ver-btn${version === v.key ? ' is-active' : ''}`}
                  >
                    <div className="mk-top">
                      <span className="mk-name">{v.name}</span>
                      <span className="mk-vmeta">{v.status}</span>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>{v.date}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mk-col">
            <div className="mk-panel is-shadowed">
              <div className="mk-panel-head">
                <div className="mk-k">{active.name} · {active.date}</div>
                <h3>Version notes</h3>
              </div>
              <div className="mk-panel-body">
                <p style={{ color: 'var(--slate-600)', margin: 0 }}>{active.note}</p>
                <div className="mk-og-rule" />
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 12px' }}>Prompt body</h3>
                <pre
                  style={{
                    background: 'var(--ink)',
                    color: '#f9f6ef',
                    borderRadius: 'var(--r-md)',
                    padding: 24,
                    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                    fontSize: 13,
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                  }}
                >
                  {`[ROLE] Community bank compliance officer producing a frontline guide.

[INPUT] Source procedure: {{procedure_text}}
Target audience: {{audience}}

[TASK]
1. Identify the three most common scenarios.
2. Write a one-sentence instruction in plain English for each.
3. List explicit escalation triggers.

[FORMAT]
- Title: "{{topic}}: Quick Guide"
- Three numbered scenarios
- "Escalate if:" section

[REVIEW]
- Flag legal-meaning loss.
- Add: Reviewed by [name] on [date]`}
                </pre>
              </div>
            </div>

            <div className="mk-panel">
              <div className="mk-panel-head"><div className="mk-k">Related Assets</div></div>
              <div className="mk-panel-body">
                <div className="mk-crow">
                  <FileIcon size={16} />
                  <div className="mk-t">Workflow SOP — Procedure cleanup workflow</div>
                </div>
                <div className="mk-crow">
                  <FileIcon size={16} />
                  <div className="mk-t">Risk Checklist — Disclosure review</div>
                </div>
                <div className="mk-crow">
                  <FileIcon size={16} />
                  <div className="mk-t">Reference Card — SR 11-7 in 1 page</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <CtaBand
        kicker="Saved Skill"
        heading={<>One source of truth for the prompt.</>}
        body={
          <>
            Saved skills live in your Toolbox with a full version history, reviewer tags, and a
            one-click run from the Sandbox.
          </>
        }
        actions={[
          { label: 'Run in Sandbox', href: '/practice', variant: 'gold' },
          { label: 'Edit in Builder', href: '/my-toolbox/skill-builder', variant: 'ghost-dark' },
        ]}
      />
    </div>
  );
}
