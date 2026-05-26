/* eslint-disable react/no-unescaped-entities */
'use client';

import { useMemo, useState } from 'react';
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

const RectIcon = (p: IconProps) => (<svg {...sw(p)}><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 12h4M14 12h4" /></svg>);
const SaveIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /></svg>);
const CopyIcon = (p: IconProps) => (<svg {...sw(p)}><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>);
const DownloadIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>);
const CheckCircleIcon = (p: IconProps) => (<svg {...sw(p)}><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></svg>);
const ShieldIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>);
const CheckIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>);
const HistoryIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M3 12a9 9 0 1 0 9-9" /><polyline points="3 4 3 12 11 12" /></svg>);

const ROLES = ['Compliance', 'Retail', 'Marketing', 'Lending', 'Operations'] as const;
type RoleT = (typeof ROLES)[number];
const RISKS = ['Low', 'Medium', 'High'] as const;
type RiskT = (typeof RISKS)[number];
const STATUSES = ['Draft', 'In review', 'Approved'] as const;
type StatusT = (typeof STATUSES)[number];

type Tab = 'Output' | 'Markdown' | 'Versions';

export default function SkillBuilderPage() {
  const [role, setRole] = useState<RoleT>('Compliance');
  const [risk, setRisk] = useState<RiskT>('Medium');
  const [status, setStatus] = useState<StatusT>('Draft');
  const [name, setName] = useState('KYC Refresh Frontline Guide');
  const [purpose, setPurpose] = useState('Turn a dense KYC procedure into a one-page frontline guide.');
  const [inputs, setInputs] = useState('Source procedure text\nTarget audience');
  const [outputs, setOutputs] = useState('Frontline guide\nEscalation triggers\nReview tags');
  const [guardrails, setGuardrails] = useState('Flag any phrase that loses legal meaning when simplified.\nDo not infer policy that is not in the source.');
  const [tab, setTab] = useState<Tab>('Output');
  const [copied, setCopied] = useState(false);

  const completeness = useMemo(() => {
    let n = 0;
    if (name.trim()) n += 20;
    if (purpose.trim()) n += 20;
    if (inputs.trim()) n += 20;
    if (outputs.trim()) n += 20;
    if (guardrails.trim()) n += 20;
    return n;
  }, [name, purpose, inputs, outputs, guardrails]);

  const markdown = useMemo(
    () =>
      `# ${name || 'Untitled Skill'}

**Role:** ${role}
**Risk:** ${risk}
**Status:** ${status}

## Purpose
${purpose}

## Inputs
${inputs
  .split('\n')
  .filter(Boolean)
  .map((l) => `- ${l}`)
  .join('\n')}

## Outputs
${outputs
  .split('\n')
  .filter(Boolean)
  .map((l) => `- ${l}`)
  .join('\n')}

## Guardrails
${guardrails
  .split('\n')
  .filter(Boolean)
  .map((l) => `- ${l}`)
  .join('\n')}
`,
    [name, role, risk, status, purpose, inputs, outputs, guardrails],
  );

  async function copyMd() {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(markdown);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function downloadMd() {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(name || 'skill').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

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
            <EyebrowChip icon={<RectIcon className="mk-ic" />}>Toolbox Tool · Skill Builder</EyebrowChip>
            <h1>Turn a good prompt into a governed skill.</h1>
            <p className="mk-lede">
              Build, review, version, copy, download, and save a reusable AI skill as a Markdown
              asset in your Toolbox.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="/practice">
                <SaveIcon className="mk-ic" />
                Save Skill
              </Button>
              <Button variant="ghost-dark" size="lg" onClick={copyMd}>
                <CopyIcon className="mk-ic" />
                {copied ? 'Copied!' : 'Copy Markdown'}
              </Button>
            </div>
          </div>

          <div className="mk-snap">
            <div className="mk-head">
              <div className="mk-k">Builder Snapshot</div>
              <div className="mk-t">Build → Review → Save → Version</div>
            </div>
            <div className="mk-stats">
              <div className="mk-stat">
                <CheckCircleIcon size={24} />
                <div className="mk-l">Completeness</div>
                <div className="mk-v">{completeness}%</div>
              </div>
              <div className="mk-stat">
                <ShieldIcon size={24} />
                <div className="mk-l">Risk</div>
                <div className="mk-v">{risk}</div>
              </div>
              <div className="mk-stat">
                <CheckIcon size={24} />
                <div className="mk-l">Status</div>
                <div className="mk-v">{status}</div>
              </div>
              <div className="mk-stat">
                <HistoryIcon size={24} />
                <div className="mk-l">Versions</div>
                <div className="mk-v">1</div>
              </div>
            </div>
            <div className="mk-bar-wrap">
              <div className="mk-bar">
                <div className="mk-fill" style={{ width: `${completeness}%` }} />
              </div>
              <div className="mk-pills">
                <div className="mk-pill-st is-on">
                  <span className="mk-mark">✓</span>Signed-in save
                </div>
                <div className={`mk-pill-st ${completeness === 100 ? 'is-on' : 'is-off'}`}>
                  <span className="mk-mark">{completeness === 100 ? '✓' : '—'}</span>
                  Ready to save
                </div>
                <div className={`mk-pill-st ${copied ? 'is-on' : 'is-off'}`}>
                  <span className="mk-mark">{copied ? '✓' : '—'}</span>Copied
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section variant="std" contained={false} style={{ background: 'var(--cream)' }}>
        <div className="mk-container mk-builder">
          <div className="mk-col">
            <div className="mk-panel">
              <div className="mk-panel-head">
                <div className="mk-k">Define the skill</div>
                <h3>Role, risk, and inputs</h3>
              </div>
              <div className="mk-panel-body">
                <div className="mk-og-row">
                  <div className="mk-opt-g is-compact">
                    <div className="mk-lab">Role</div>
                    <div className="mk-list">
                      {ROLES.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={role === r ? 'is-active' : ''}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mk-opt-g is-compact is-gold">
                    <div className="mk-lab">Risk</div>
                    <div className="mk-list">
                      {RISKS.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRisk(r)}
                          className={risk === r ? 'is-active' : ''}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mk-opt-g is-compact">
                    <div className="mk-lab">Status</div>
                    <div className="mk-list">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatus(s)}
                          className={status === s ? 'is-active' : ''}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mk-og-rule" />
                <div className="mk-form-field">
                  <label htmlFor="sb-name">Skill name</label>
                  <input id="sb-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="mk-form-field">
                  <label htmlFor="sb-purpose">Purpose</label>
                  <textarea
                    id="sb-purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                </div>
                <div className="mk-form-field">
                  <label htmlFor="sb-inputs">Inputs (one per line)</label>
                  <textarea id="sb-inputs" value={inputs} onChange={(e) => setInputs(e.target.value)} />
                </div>
                <div className="mk-form-field">
                  <label htmlFor="sb-outputs">Outputs (one per line)</label>
                  <textarea
                    id="sb-outputs"
                    value={outputs}
                    onChange={(e) => setOutputs(e.target.value)}
                  />
                </div>
                <div className="mk-form-field">
                  <label htmlFor="sb-guardrails">Guardrails (one per line)</label>
                  <textarea
                    id="sb-guardrails"
                    value={guardrails}
                    onChange={(e) => setGuardrails(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mk-col">
            <div className="mk-comp-ribbon">
              <div className="mk-cr-score">
                <div>
                  <span className="mk-cr-num">{completeness}</span>
                  <span className="mk-cr-of">/100</span>
                </div>
                <div className="mk-cr-bar">
                  <div className="mk-cr-fill" style={{ width: `${completeness}%` }} />
                </div>
              </div>
              <div className="mk-cr-rec">
                <div className="mk-cr-title">Companion recommendation</div>
                <div className="mk-cr-body">
                  {completeness === 100
                    ? 'Ready for human review. Save a version before distribution.'
                    : 'Fill in the remaining fields to reach 100% completeness.'}
                </div>
              </div>
              {completeness === 100 && <div className="mk-cr-ready">✓ Ready to save</div>}
            </div>

            <div className="mk-panel is-shadowed">
              <div className="mk-mp-tabs">
                <div className="mk-left">
                  {(['Output', 'Markdown', 'Versions'] as Tab[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className={`mk-mp-tab${tab === t ? ' is-active' : ''}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="mk-mp-actions">
                  <Button variant="ghost-light" onClick={copyMd}>
                    <CopyIcon className="mk-ic" />
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button variant="ghost-light" onClick={downloadMd}>
                    <DownloadIcon className="mk-ic" />
                    .md
                  </Button>
                </div>
              </div>
              <div className="mk-mp-pane">
                {tab === 'Output' && (
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{name || 'Untitled Skill'}</h3>
                    <p style={{ color: 'var(--slate-600)', marginTop: 8 }}>{purpose}</p>
                  </div>
                )}
                {tab === 'Markdown' && <pre>{markdown}</pre>}
                {tab === 'Versions' && (
                  <div>
                    <button type="button" className="mk-ver-btn is-active">
                      <div className="mk-top">
                        <span className="mk-name">v1 · Current draft</span>
                        <span className="mk-vmeta">{status}</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Section>

      <CtaBand
        kicker="Skill Builder"
        heading={<>From prompt to governed skill, in one screen.</>}
        body={
          <>
            The Skill Builder is one of seven tools that ship in the Toolbox. Build something
            today, save it tonight, ship it Monday.
          </>
        }
        actions={[
          { label: 'Browse the Toolbox', href: '/my-toolbox', variant: 'gold' },
          { label: 'Take the Course', href: '/courses', variant: 'ghost-dark' },
        ]}
      />
    </div>
  );
}
