/* eslint-disable react/no-unescaped-entities */
'use client';

import { useEffect, useRef, useState } from 'react';
import {
  SiteHeader,
  Section,
  SectionHead,
  Button,
  EyebrowChip,
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

const FlaskIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M10 2v7.31" />
    <path d="M14 9.3V2" />
    <path d="M8.5 2h7" />
    <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
  </svg>
);
const ArrowR = (p: IconProps) => (
  <svg {...sw(p)}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const PlayIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const SaveIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
const CheckIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const UsersIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
  </svg>
);
const ChatIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const SearchCheckIcon = (p: IconProps) => (
  <svg {...sw(p)}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <polyline points="9 12 11 14 14 9" />
  </svg>
);
const ShieldIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>);
const SendIcon = (p: IconProps) => (<svg {...sw(p)}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>);
const ClockIcon = (p: IconProps) => (<svg {...sw(p)}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
const FileIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>);
const StarIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M12 3l1.9 5.8L20 10l-4.6 3.4L17.2 20 12 16.6 6.8 20l1.8-6.6L4 10l6.1-1.2z" /></svg>);

// ---------- Workbench scenarios ----------

type WBKey = 'procedure' | 'complaint' | 'campaign';

const WB: Record<WBKey, { title: string; input: string; output: string; outLabel: string }> = {
  procedure: {
    title: 'Procedure Cleanup · Compliance',
    input:
      'All KYC refresh requests for accounts opened prior to 2022 shall undergo a documentation review per BSA §1020.220, including but not limited to government-issued ID, secondary address verification, and any updated beneficial ownership disclosures for legal entity customers as required under FinCEN\'s CDD rule...',
    output:
      "**KYC Refresh: Quick Guide**\n\nFor accounts opened before 2022, collect three items:\n  1. Government-issued ID\n  2. Secondary address proof\n  3. For business accounts, updated beneficial-ownership info\n\n**If unsure:** route to Compliance review before continuing.",
    outLabel: 'Output · frontline job aid',
  },
  complaint: {
    title: 'Complaint Summary · Compliance',
    input:
      "Member called 03/14 — frustrated about a 5-day hold on a $4,200 mobile deposit. Says she was told 'just a couple days' at the branch. Hold released on 03/19 but she missed a car payment. Wants the late fee reimbursed and an explanation of when holds apply.",
    output:
      '**Member Complaint — Summary**\n\n• Issue: 5-day hold on $4,200 mobile deposit caused a missed car payment.\n• Member expectation: ~2 days, as stated at branch.\n• Resolution requested: late-fee reimbursement + clear hold policy explanation.\n\n**Next steps:** verify late fee, document branch-script gap for retraining, route to Member Services for outreach.',
    outLabel: 'Output · summary + next steps',
  },
  campaign: {
    title: 'Campaign Draft · Marketing',
    input:
      'New 4.5% APY high-yield savings account, FDIC insured, no minimum balance, limited-time intro rate for 6 months then 3.8% APY. Target: existing checking customers.',
    output:
      '**Subject:** Earn 4.5% on your savings — start in two minutes\n\nYou already trust us with your checking. Now put your savings to work at **4.5% APY** for the first 6 months — no minimums, no hidden fees, FDIC insured.\n\n→ Open in two minutes\n\nDisclosure: Intro rate of 4.5% APY for first 6 months. Standard rate (currently 3.8% APY) applies thereafter. FDIC insured to applicable limits.',
    outLabel: 'Output · email + disclosure flag',
  },
};

function renderMarkup(s: string) {
  return s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

// ---------- Page ----------

export default function PlaygroundPage() {
  const [wbKey, setWbKey] = useState<WBKey>('procedure');
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [outputHtml, setOutputHtml] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function load(k: WBKey) {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setWbKey(k);
    setHasRun(false);
    setRunning(false);
    setOutputHtml('');
    setTags([]);
    setSaved(false);
  }

  function run() {
    if (running) return;
    setRunning(true);
    setSaved(false);
    const full = WB[wbKey].output;
    let i = 0;
    setOutputHtml('');
    const speed = Math.max(8, Math.min(20, Math.floor(1400 / full.length)));
    timerRef.current = setInterval(() => {
      if (i >= full.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setRunning(false);
        setHasRun(true);
        setOutputHtml(renderMarkup(full));
        return;
      }
      setOutputHtml((prev) => prev + full[i]);
      i++;
    }, speed);
  }

  function toggleTag(t: string) {
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  }

  function save() {
    if (!hasRun) return;
    setSaved(true);
  }

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  const d = WB[wbKey];

  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/playground" cta={{ label: 'Try a Scenario', href: '/practice' }} />

      {/* HERO */}
      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <EyebrowChip icon={<FlaskIcon className="mk-ic" />}>
              Sandbox · Realistic synthetic data · Always safe
            </EyebrowChip>
            <h1>A safe practice field for real banking work.</h1>
            <p className="mk-lede">
              Run a realistic scenario, compare model outputs, apply your review checklist, and
              save the work as a prompt. No real customer data ever touches a model.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="/practice">
                Try a Scenario <ArrowR className="mk-ic" />
              </Button>
              <Button variant="ghost-dark" size="lg" href="#workbench">
                See the Workbench
              </Button>
            </div>
          </div>

          {/* Workbench preview */}
          <div className="mk-wb" id="workbench">
            <div className="mk-head">
              <div>
                <div className="mk-k">Sandbox · Try a scenario</div>
                <div className="mk-t">{d.title}</div>
              </div>
              <span className="mk-pill">Safe sample data</span>
            </div>
            <div className="mk-wb-pills">
              {(['procedure', 'complaint', 'campaign'] as WBKey[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => load(k)}
                  className={`mk-wb-pill${wbKey === k ? ' is-active' : ''}`}
                >
                  {k === 'procedure' && 'Procedure Cleanup'}
                  {k === 'complaint' && 'Complaint Summary'}
                  {k === 'campaign' && 'Campaign Draft'}
                </button>
              ))}
            </div>
            <div className="mk-grid">
              <div className="mk-left">
                <div className="mk-k">Input · synthetic data</div>
                <div className="mk-input">{d.input}</div>
              </div>
              <div className="mk-right">
                <div className="mk-k">{hasRun ? d.outLabel : 'Output · ready to run'}</div>
                <div className={`mk-out${running ? ' is-running' : ''}`}>
                  {outputHtml ? (
                    <span dangerouslySetInnerHTML={{ __html: outputHtml }} />
                  ) : (
                    <span className="mk-hint">
                      Click <strong>Run</strong> to generate sample output.
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mk-actions">
              <div className="mk-lhs">
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--slate-500)',
                    marginRight: 4,
                  }}
                >
                  Review tags:
                </span>
                {['accurate', 'risk', 'tone'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={`mk-wb-tag${tags.includes(t) ? ' is-active' : ''}`}
                  >
                    {t === 'accurate' && 'Accurate'}
                    {t === 'risk' && 'Risk-aware'}
                    {t === 'tone' && 'Tone'}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="ghost-light" onClick={run} disabled={running}>
                  <PlayIcon className="mk-ic" />
                  Run
                </Button>
                <Button variant="ink" onClick={save} disabled={!hasRun || saved}>
                  {saved ? <CheckIcon className="mk-ic" /> : <SaveIcon className="mk-ic" />}
                  {saved ? 'Saved' : 'Save to Toolbox'}
                </Button>
              </div>
            </div>
            <div className={`mk-wb-toast${saved ? ' is-shown' : ''}`}>
              <CheckIcon className="mk-ic" />
              Saved to your Toolbox.
            </div>
          </div>
        </div>
      </section>

      {/* 4-STEP FLOW */}
      <Section variant="std">
        <SectionHead kicker="The flow" heading={<>Four steps. Each one ends with something saved.</>} />
        <div className="mk-steps-strip">
          <div>
            <span className="mk-pic"><UsersIcon size={24} /></span>
            <div className="mk-n">Step 1</div>
            <h3>Choose</h3>
            <p>Pick role and scenario. We provide realistic synthetic material.</p>
          </div>
          <div>
            <span className="mk-pic"><ChatIcon size={24} /></span>
            <div className="mk-n">Step 2</div>
            <h3>Practice</h3>
            <p>Prompt with sample data. Compare outputs from different models.</p>
          </div>
          <div>
            <span className="mk-pic"><SearchCheckIcon size={24} /></span>
            <div className="mk-n">Step 3</div>
            <h3>Review</h3>
            <p>Run the accuracy + risk checklist. Tag what's good, flag what isn't.</p>
          </div>
          <div>
            <span className="mk-pic"><SaveIcon size={24} /></span>
            <div className="mk-n">Step 4</div>
            <h3>Save</h3>
            <p>Promote to a reusable prompt. Goes into your Toolbox.</p>
          </div>
        </div>
      </Section>

      {/* SCENARIO LIBRARY */}
      <Section variant="std" surface="white">
        <SectionHead
          kicker="Scenario library"
          heading={<>Eighteen realistic scenarios. More added monthly.</>}
          lede={
            <>
              Every scenario uses synthetic data — never real customer material. Each one teaches
              a specific judgment call.
            </>
          }
        />
        <div className="mk-scen-grid">
          {[
            { icon: ShieldIcon, role: 'Compliance', title: 'Procedure Cleanup', desc: 'Take a dense internal procedure and turn it into a frontline job aid without losing the legal meaning.', time: '~12 min', tags: '3 review tags' },
            { icon: ChatIcon, role: 'Compliance', title: 'Complaint Summary', desc: "Read a member's complaint notes and produce a one-page summary with proposed next steps.", time: '~10 min', tags: '4 review tags' },
            { icon: SendIcon, role: 'Marketing', title: 'Campaign Draft', desc: 'Generate three email variations for a product offer with disclosure flags surfaced automatically.', time: '~15 min', tags: '5 review tags' },
            { icon: ClockIcon, role: 'Branch / Retail', title: 'Service Recovery', desc: 'Member arrives upset about a hold. Generate a coaching script for the frontline.', time: '~8 min', tags: '3 review tags' },
            { icon: FileIcon, role: 'Lending', title: 'Adverse Action Letter', desc: 'Draft an ECOA-compliant decline letter from a denial decision summary.', time: '~14 min', tags: '5 review tags' },
            { icon: StarIcon, role: 'Operations', title: 'Incident Runbook', desc: 'Transform a Slack thread into a structured incident runbook with owner + escalation path.', time: '~16 min', tags: '4 review tags' },
          ].map(({ icon: Icon, role, title, desc, time, tags }) => (
            <a key={title} className="mk-scen" href="/practice">
              <div className="mk-top">
                <span className="mk-pic"><Icon size={20} /></span>
                <span className="mk-role">{role}</span>
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <div className="mk-meta">
                <span>{time}</span>
                <span>{tags}</span>
              </div>
            </a>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Button variant="ink" size="lg" href="/practice">
            Browse all 18 scenarios <ArrowR className="mk-ic" />
          </Button>
        </div>
      </Section>

      {/* SAVE TO TOOLBOX */}
      <Section variant="std">
        <div className="mk-save">
          <div>
            <div className="mk-k">Save / build</div>
            <h3>Practice once. Use forever.</h3>
            <p>
              Anything useful that you produce in the Sandbox can be promoted to your Toolbox as a
              saved prompt — with the same review tags and best-practice craft. Your team can copy
              from it; your manager can review it; the examiner can see it.
            </p>
            <Button variant="ink" size="lg" href="/my-toolbox">
              See the Toolbox <ArrowR className="mk-ic" />
            </Button>
          </div>
          <div className="mk-saved">
            <div className="mk-top">
              <div className="mk-k">Your Toolbox · recent</div>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--slate-500)',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                3 of 18
              </span>
            </div>
            <div className="mk-item">
              <ChatIcon size={20} />
              <div className="mk-nm">KYC frontline guide</div>
              <div className="mk-meta">Just saved</div>
            </div>
            <div className="mk-item">
              <FileIcon size={20} />
              <div className="mk-nm">Complaint summary template</div>
              <div className="mk-meta">3 days ago</div>
            </div>
            <div className="mk-item">
              <SendIcon size={20} />
              <div className="mk-nm">Email disclosure check</div>
              <div className="mk-meta">1 week ago</div>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <CtaBand
        kicker="Sandbox"
        heading={<>Less lecture. More reps.</>}
        body={
          <>
            The fastest way to learn what AI can do in a regulated environment is to use it in one
            — safely.
          </>
        }
        actions={[
          { label: 'Try a Scenario', href: '/practice', variant: 'gold' },
          { label: 'Compare with a Demo', href: '#workbench', variant: 'ghost-dark' },
        ]}
      />
    </div>
  );
}
