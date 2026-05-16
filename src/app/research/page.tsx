// /research — The AI Banking Brief.
//
// Editorial research surface ported from the Claude Design Research.html
// prototype (chat: "Research Main Page", 2026-05-13). Closes the visual
// gap with the rest of the Ledger refresh.
//
// V1 ships the frame + hard-coded sample content keyed to the prototype.
// Real essay MDX migration (per Plans/research-page-design-brief.md §10)
// is intentionally deferred — the credibility frame lands first.
//
// Site chrome (SiteNav + SiteFooter) is rendered by the root layout, so
// the prototype's own nav/footer were dropped to avoid duplication.

import type { Metadata } from 'next';
import { listAllEssays } from '@content/essays/_lib/registry';
import { ResearchAnimations } from './_components/ResearchAnimations';
import './research.css';

export const metadata: Metadata = {
  title: 'Research — The AI Banking Brief',
  description:
    'Sourced AI research, field notes, and practical artifacts for community banks and credit unions adopting AI safely. Published fortnightly.',
};

// Ticker items are sourced data points only — every claim cites a named
// publication per CLAUDE.md "Citations Always". When the legacy-essay
// catalog is migrated to MDX, swap these for the latest essay headlines.
const TICKER_ITEMS = [
  { kicker: 'FDIC', text: 'Community-bank median efficiency ratio ~65% · Q4 2024 QBP' },
  { kicker: 'GARTNER', text: '66% of banks discussing AI budget · Bank Director 2024 (via Jack Henry)' },
  { kicker: 'PERSONETICS', text: '84% would switch FIs for AI-driven financial insights · 2025 (via Apiture)' },
  { kicker: 'GAO', text: 'GAO 25-107197 · no AI-specific banking framework yet · May 2025' },
  { kicker: 'MOTLEY FOOL', text: '76% would switch FIs for better digital experience · 2025 (via Apiture)' },
];

// Essay category → tile color key. Legacy registry uses prose labels;
// we map them to the design-system swatches defined in research.css.
const CAT_MAP: Record<string, { readonly key: string; readonly label: string }> = {
  Governance: { key: 'gov', label: 'Governance' },
  'Risk & controls': { key: 'risk', label: 'Risk & Controls' },
  'Foundations work': { key: 'train', label: 'Training & Skills' },
  'Member impact': { key: 'mbr', label: 'Member Impact' },
  'Examiner trends': { key: 'exam', label: 'Examiner Trends' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

function BriefMark({ cat }: { cat: string }) {
  const stroke = '#0E1B2D';
  const gold = '#B5862A';
  switch (cat) {
    case 'gov':
      return (
        <svg viewBox="0 0 64 64" fill="none" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <line x1="32" y1="10" x2="32" y2="40" />
          <rect x="22" y="40" width="20" height="8" fill="rgba(181,134,42,0.18)" />
          <rect x="14" y="52" width="36" height="3" fill={gold} stroke="none" />
          <line x1="20" y1="18" x2="44" y2="18" />
        </svg>
      );
    case 'risk':
      return (
        <svg viewBox="0 0 64 64" fill="none" stroke={stroke} strokeWidth={1.6}>
          <circle cx="32" cy="32" r="16" />
          <circle cx="32" cy="32" r="9" />
          <circle cx="32" cy="32" r="3" fill={gold} stroke="none" />
          <line x1="32" y1="6" x2="32" y2="14" strokeLinecap="round" />
          <line x1="32" y1="50" x2="32" y2="58" strokeLinecap="round" />
          <line x1="6" y1="32" x2="14" y2="32" strokeLinecap="round" />
          <line x1="50" y1="32" x2="58" y2="32" strokeLinecap="round" />
        </svg>
      );
    case 'train':
      return (
        <svg viewBox="0 0 64 64" fill="none" stroke={stroke} strokeWidth={1.6} strokeLinejoin="round">
          <path d="M10 16 L32 22 L54 16 L54 48 L32 42 L10 48 Z" fill="rgba(181,134,42,0.10)" />
          <line x1="32" y1="22" x2="32" y2="42" />
          <line x1="16" y1="22" x2="28" y2="22" strokeWidth={1} opacity={0.5} />
          <line x1="16" y1="28" x2="28" y2="28" strokeWidth={1} opacity={0.5} />
          <line x1="36" y1="22" x2="48" y2="22" strokeWidth={1} opacity={0.5} />
          <line x1="36" y1="28" x2="48" y2="28" strokeWidth={1} opacity={0.5} />
        </svg>
      );
    case 'ops':
      return (
        <svg viewBox="0 0 64 64" fill="none" stroke={stroke} strokeWidth={1.6}>
          <rect x="14" y="14" width="36" height="8" />
          <rect x="14" y="28" width="28" height="8" fill="rgba(181,134,42,0.20)" stroke={stroke} />
          <rect x="14" y="42" width="32" height="8" />
        </svg>
      );
    case 'mbr':
      return (
        <svg viewBox="0 0 64 64" fill="none" stroke={stroke} strokeWidth={1.6}>
          <circle cx="24" cy="32" r="13" />
          <circle cx="40" cy="32" r="13" fill="rgba(181,134,42,0.12)" />
        </svg>
      );
    case 'exam':
      return (
        <svg viewBox="0 0 64 64" fill="none" stroke={stroke} strokeWidth={1.6} strokeLinecap="round">
          <circle cx="26" cy="26" r="14" fill="rgba(181,134,42,0.10)" />
          <line x1="36" y1="36" x2="50" y2="50" strokeWidth={3} />
          <line x1="20" y1="26" x2="32" y2="26" strokeWidth={1} opacity={0.5} />
          <line x1="26" y1="20" x2="26" y2="32" strokeWidth={1} opacity={0.5} />
        </svg>
      );
    case 'art':
      return (
        <svg viewBox="0 0 64 64" fill="none" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 14 L26 22 L18 30 L10 22 Z" fill="rgba(181,134,42,0.18)" />
          <line x1="24" y1="28" x2="50" y2="54" strokeWidth={3} />
          <line x1="44" y1="14" x2="54" y2="24" strokeWidth={1} opacity={0.5} />
        </svg>
      );
    case 'signals':
      return (
        <svg viewBox="0 0 64 64" fill="none" stroke={stroke} strokeWidth={1.6}>
          <rect x="12" y="40" width="8" height="14" />
          <rect x="24" y="30" width="8" height="24" />
          <rect x="36" y="20" width="8" height="34" fill="rgba(181,134,42,0.20)" />
          <rect x="48" y="10" width="8" height="44" fill={gold} stroke="none" />
        </svg>
      );
    default:
      return null;
  }
}

type RoleKind = 'exec' | 'risk' | 'ops' | 'it';

function RoleIllust({ kind }: { kind: RoleKind }) {
  const stroke = '#0E1B2D';
  const gold = '#B5862A';
  const paper = '#F4F1E7';
  if (kind === 'exec')
    return (
      <svg viewBox="0 0 160 140" fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="50" y="20" width="60" height="68" fill="rgba(181,134,42,0.10)" />
        <line x1="62" y1="26" x2="98" y2="26" />
        <line x1="62" y1="36" x2="98" y2="36" />
        <line x1="62" y1="46" x2="98" y2="46" />
        <line x1="62" y1="56" x2="98" y2="56" />
        <line x1="62" y1="66" x2="98" y2="66" />
        <line x1="62" y1="76" x2="98" y2="76" />
        <path d="M42 88 L118 88 L118 100 L42 100 Z" fill={paper} />
        <line x1="50" y1="100" x2="50" y2="124" />
        <line x1="110" y1="100" x2="110" y2="124" />
        <line x1="48" y1="124" x2="112" y2="124" />
        <circle cx="80" cy="14" r="4" fill={gold} stroke="none" />
        <line x1="80" y1="18" x2="80" y2="22" />
      </svg>
    );
  if (kind === 'risk')
    return (
      <svg viewBox="0 0 160 140" fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <line x1="80" y1="14" x2="80" y2="110" />
        <line x1="30" y1="36" x2="130" y2="36" />
        <line x1="30" y1="36" x2="20" y2="62" />
        <line x1="30" y1="36" x2="40" y2="62" />
        <path d="M14 62 L46 62 L40 76 L20 76 Z" fill="rgba(181,134,42,0.18)" />
        <line x1="130" y1="36" x2="120" y2="68" />
        <line x1="130" y1="36" x2="140" y2="68" />
        <path d="M114 68 L146 68 L140 82 L120 82 Z" fill="rgba(181,134,42,0.10)" />
        <line x1="62" y1="110" x2="98" y2="110" />
        <line x1="58" y1="118" x2="102" y2="118" />
        <circle cx="80" cy="14" r="3" fill={gold} stroke="none" />
        <circle cx="26" cy="56" r="3" fill="none" />
        <circle cx="34" cy="56" r="3" fill="none" />
      </svg>
    );
  if (kind === 'ops')
    return (
      <svg viewBox="0 0 160 140" fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="62" cy="70" r="26" fill="rgba(181,134,42,0.10)" />
        <circle cx="62" cy="70" r="6" fill={gold} stroke="none" />
        <g>
          <line x1="62" y1="38" x2="62" y2="44" />
          <line x1="62" y1="96" x2="62" y2="102" />
          <line x1="30" y1="70" x2="36" y2="70" />
          <line x1="88" y1="70" x2="94" y2="70" />
          <line x1="39" y1="47" x2="43" y2="51" />
          <line x1="81" y1="89" x2="85" y2="93" />
          <line x1="39" y1="93" x2="43" y2="89" />
          <line x1="81" y1="51" x2="85" y2="47" />
        </g>
        <circle cx="116" cy="46" r="14" />
        <circle cx="116" cy="46" r="3" fill={stroke} stroke="none" />
        <g>
          <line x1="116" y1="28" x2="116" y2="32" />
          <line x1="116" y1="60" x2="116" y2="64" />
          <line x1="98" y1="46" x2="102" y2="46" />
          <line x1="130" y1="46" x2="134" y2="46" />
        </g>
        <path d="M88 70 Q 105 60 102 46" opacity={0.4} strokeDasharray="3 3" />
      </svg>
    );
  return (
    <svg viewBox="0 0 160 140" fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M80 14 L120 28 L120 64 C 120 90 102 110 80 122 C 58 110 40 90 40 64 L40 28 Z" fill="rgba(181,134,42,0.10)" />
      <circle cx="80" cy="60" r="6" />
      <path d="M80 66 L80 80" />
      <path d="M75 75 L85 75" />
      <circle cx="56" cy="36" r="2.5" fill={gold} stroke="none" />
      <circle cx="80" cy="30" r="2.5" fill={gold} stroke="none" />
      <circle cx="104" cy="36" r="2.5" fill={gold} stroke="none" />
      <line x1="56" y1="36" x2="80" y2="30" opacity={0.4} />
      <line x1="80" y1="30" x2="104" y2="36" opacity={0.4} />
      <circle cx="64" cy="96" r="2" fill="none" />
      <circle cx="96" cy="96" r="2" fill="none" />
      <line x1="66" y1="96" x2="94" y2="96" opacity={0.4} />
    </svg>
  );
}

interface SealMeta {
  readonly id: string;
  readonly initials: string;
  readonly sub: string;
  readonly nm: string;
  readonly subline: string;
  readonly means: string;
  readonly status: string;
  readonly curveLabel: string;
  readonly smallInitials?: boolean;
}

// Regulatory references are sourced (CLAUDE.md "Reference Documents").
// Operating translations are plain-English paraphrases — not legal advice
// and not statistical claims. Verifiable status timestamps removed: we'll
// add them back when an authoritative tracking source is wired up.
const SEALS: readonly SealMeta[] = [
  { id: 'sr', initials: 'SR', sub: '11-7', curveLabel: 'SUPERVISION · REGULATION', nm: 'SR 11-7', subline: 'Federal Reserve · OCC · 2011', means: 'Define "model" broadly. Inventory before exam.', status: 'Read the guidance' },
  { id: 'tp', initials: 'TP', sub: 'RM', curveLabel: 'INTERAGENCY · TPRM', nm: 'Interagency TPRM', subline: 'OCC · FRB · FDIC · 2023', means: "Vendor's AI is your model. You inherit the risk.", status: 'Read the guidance' },
  { id: 'ff', initials: 'FF', sub: 'IT', curveLabel: 'FFIEC · IT HANDBOOK', nm: 'FFIEC IT Handbook', subline: 'Architecture · Operations · 2021', means: 'Treat AI like any other production system.', status: 'Read the guidance' },
  { id: 'ai', initials: 'AI', sub: 'EOG', curveLabel: 'AIEOG · AI LEXICON', nm: 'AIEOG AI Lexicon', subline: 'Treasury · FBIIC · FSSCC · Feb 2026', means: 'Use the official definitions: hallucination, HITL, AI inventory.', status: 'Read the lexicon' },
  { id: 'cf', initials: 'EC', sub: 'OA', curveLabel: 'ECOA · REG B · CFPB', nm: 'ECOA / Reg B', subline: 'CFPB · ongoing', means: 'Disparate-impact testing on any model influencing credit.', status: 'Read the guidance' },
  { id: 'gl', initials: 'GL', sub: 'BA', curveLabel: 'GLBA · SAFEGUARDS RULE', nm: 'GLBA Safeguards', subline: '16 CFR 314 · final rule 2023', means: 'Encryption, access controls, incident response for NPI.', status: 'Read the guidance', smallInitials: true },
];

function Seal({ meta }: { meta: SealMeta }) {
  return (
    <svg viewBox="0 0 100 100">
      <defs>
        <path id={`${meta.id}-curve`} d="M 50,50 m -40,0 a 40,40 0 1,1 80,0" />
      </defs>
      <circle cx="50" cy="50" r="46" fill="#F4F1E7" stroke="#0E1B2D" strokeWidth={1.4} />
      <circle cx="50" cy="50" r="38" fill="none" stroke="#A8AEBE" strokeWidth={0.6} />
      <circle cx="50" cy="50" r="32" fill="none" stroke="#A8AEBE" strokeWidth={0.4} />
      <text fontFamily="JetBrains Mono,monospace" fontSize="5" letterSpacing={2} fill="#5C6B82" fontWeight={600}>
        <textPath href={`#${meta.id}-curve`} startOffset="50%" textAnchor="middle">
          {meta.curveLabel}
        </textPath>
      </text>
      <text x="50" y="48" textAnchor="middle" fontFamily="Newsreader,serif" fontStyle="italic" fontSize={meta.smallInitials ? 20 : 22} fill="#B5862A" fontWeight={500}>
        {meta.initials}
      </text>
      <text x="50" y="64" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="9" fill="#0E1B2D" letterSpacing={1.5} fontWeight={600}>
        {meta.sub}
      </text>
      <circle cx="22" cy="50" r="2" fill="#B5862A" />
      <circle cx="78" cy="50" r="2" fill="#B5862A" />
    </svg>
  );
}

function revealDelay(i: number): string {
  const mod = i % 4;
  if (mod === 1) return ' r-2';
  if (mod === 2) return ' r-3';
  if (mod === 3) return ' r-4';
  return '';
}

// Real Gartner Peer Community findings cited in Jack Henry's
// "Getting Started in AI" (2025). Source for these four bars sits in
// CLAUDE.md "Sourced Statistics for Copy".
const GARTNER_BARS = [
  { pct: 66, label: 'Discussing AI budget', kicker: 'Bank Director 2024' },
  { pct: 57, label: 'Struggle with AI skill gaps', kicker: 'Gartner Peer Community' },
  { pct: 55, label: 'No AI governance framework yet', kicker: 'Gartner Peer Community' },
  { pct: 48, label: 'Lack clarity on AI business impact', kicker: 'Gartner Peer Community' },
];

export default async function ResearchPage() {
  // Pull from the real essay registry; falls back gracefully when empty.
  const essays = await listAllEssays();
  const featured = essays[0] ?? null;
  const indexEssays = essays.slice(0, 8);

  return (
    <div className="aibi-research">
      <ResearchAnimations />

      {/* FOLIO */}
      <div className="strip">
        <div className="ar-container row">
          <div><span>The AI Banking Brief</span></div>
        </div>
      </div>

      {/* TICKER */}
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i}>
              <b>{item.kicker}</b>
              <span className="dot" />
              {item.text}
            </span>
          ))}
        </div>
      </div>

      {/* COVER */}
      <section className="cover">
        <div className="ar-container">
          <div className="cover-grid">
            <div>
              <h1>The AI <em>Banking</em> Brief.</h1>
              <p className="lede">
                Independent AI research for community banks and credit unions.
                Sourced, examiner-aware, free.
              </p>
              <div className="ctas">
                <a href="/assessment/start" className="btn btn-primary">
                  Take the assessment <span className="arrow">→</span>
                </a>
                <a href="#subscribe" className="btn btn-ghost">
                  Subscribe <span className="arrow">→</span>
                </a>
              </div>
            </div>

            <div className="cover-chart">
              <div className="cc-head">
                <div className="ttl">
                  The state of AI <em>at the desk,</em> in four numbers.
                </div>
                <div className="fig">
                  Fig. 01
                  <small>Gartner · Bank Director · 2024</small>
                </div>
              </div>
              <div className="cc-svg">
                <svg
                  viewBox="0 0 600 260"
                  id="coverChart"
                  role="img"
                  aria-label="Four-bar chart of bank AI readiness: 66% discussing AI budget, 57% struggle with skill gaps, 55% no governance framework, 48% lack business-impact clarity. Sources: Bank Director 2024 and Gartner Peer Community."
                >
                  <g className="axis">
                    <line x1="40" y1="40" x2="560" y2="40" />
                    <line x1="40" y1="100" x2="560" y2="100" />
                    <line x1="40" y1="160" x2="560" y2="160" />
                    <line className="base" x1="40" y1="220" x2="560" y2="220" />
                    <text x="32" y="44" textAnchor="end">100</text>
                    <text x="32" y="104" textAnchor="end">75</text>
                    <text x="32" y="164" textAnchor="end">50</text>
                    <text x="32" y="224" textAnchor="end">25</text>
                  </g>
                  {GARTNER_BARS.map((b, i) => {
                    const xCenter = 95 + i * 130;
                    const barW = 78;
                    const barX = xCenter - barW / 2;
                    const barH = (b.pct / 100) * 180;
                    const barY = 220 - barH;
                    return (
                      <g key={b.label}>
                        <rect
                          x={barX}
                          y={barY}
                          width={barW}
                          height={barH}
                          fill="var(--ar-terra)"
                          opacity={0.85}
                        />
                        <text
                          x={xCenter}
                          y={barY - 8}
                          textAnchor="middle"
                          fontFamily="var(--ar-serif)"
                          fontStyle="italic"
                          fontSize={26}
                          fill="var(--ar-terra-2)"
                          fontWeight={500}
                        >
                          {b.pct}%
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="cc-labels">
                {GARTNER_BARS.map((b) => (
                  <div key={b.label} className="cc-label">
                    <span className="cc-label-text">{b.label}</span>
                    <span className="cc-label-src">{b.kicker}</span>
                  </div>
                ))}
              </div>
              <div className="ccfooter">
                <div className="legend">
                  <span><span className="swatch top" />% reporting</span>
                </div>
                <div>Source · Jack Henry &quot;Getting Started in AI&quot; · 2025</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="chapter">
        <div className="ar-container">
          <div className="ch-head reveal">
            <div className="left">
              <h2>The <em>cover</em> story.</h2>
            </div>
          </div>

          {featured ? (
            <article className="feat reveal">
              <div className="mark-col">
                <div className="badge">
                  Latest brief
                  <b>{formatDate(featured.date)}</b>
                  {featured.category}
                </div>
                <div className="meta">
                  <b>{featured.readMinutes} min read</b>
                  <br />
                  By {featured.author}
                </div>
              </div>
              <div className="body">
                <h3>{featured.title}</h3>
                {featured.dek && (
                  <p
                    style={{
                      fontFamily: 'var(--ar-serif)',
                      fontStyle: 'italic',
                      fontSize: 19,
                      lineHeight: 1.45,
                      color: 'var(--ar-ink-2)',
                      margin: 0,
                      maxWidth: '52ch',
                    }}
                  >
                    {featured.dek}
                  </p>
                )}
                <div className="read">
                  <a href={featured.href}>Read the full brief →</a>
                  <div className="by">By <b>{featured.author}</b></div>
                </div>
              </div>
            </article>
          ) : (
            <p style={{ fontFamily: 'var(--ar-serif)', fontStyle: 'italic', color: 'var(--ar-muted)' }}>
              The next brief is being filed.
            </p>
          )}
        </div>
      </section>

      {/* INDEX */}
      <section className="chapter shaded">
        <div className="ar-container">
          <div className="ch-head reveal">
            <div className="left">
              <h2>Every <em>brief</em> on one page.</h2>
            </div>
          </div>

          <div className="idx-grid">
            {indexEssays.map((e, i) => {
              const cat = CAT_MAP[e.category] ?? { key: 'signals', label: e.category };
              return (
                <a
                  key={e.slug}
                  className={`idx reveal${revealDelay(i)}`}
                  data-cat={cat.key}
                  href={e.href}
                >
                  <div className="row1">
                    <div className="mark"><BriefMark cat={cat.key} /></div>
                    <div className="num">{formatDate(e.date)}</div>
                  </div>
                  <div className="cat">{cat.label}</div>
                  <h4>{e.title}</h4>
                  <div className="foot">
                    <span>Brief</span>
                    <span>{e.readMinutes} min</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* BY ROLE */}
      <section className="chapter">
        <div className="ar-container">
          <div className="ch-head reveal">
            <div className="left">
              <h2>Find your <em>seat.</em></h2>
            </div>
          </div>

          <div className="roles">
            <a className="role reveal" href="#subscribe">
              <div className="illust"><RoleIllust kind="exec" /></div>
              <div className="num">Role 01 <em>i.</em></div>
              <h3>For the <em>executive</em> seat.</h3>
              <div className="titles">CEO · President · Board chair</div>
              <div className="cta"><b>See briefs</b><span className="arrow">→</span></div>
            </a>
            <a className="role reveal r-2" href="#subscribe">
              <div className="illust"><RoleIllust kind="risk" /></div>
              <div className="num">Role 02 <em>ii.</em></div>
              <h3>For <em>risk</em> &amp; compliance.</h3>
              <div className="titles">CRO · Compliance · Audit</div>
              <div className="cta"><b>See briefs</b><span className="arrow">→</span></div>
            </a>
            <a className="role reveal r-3" href="#subscribe">
              <div className="illust"><RoleIllust kind="ops" /></div>
              <div className="num">Role 03 <em>iii.</em></div>
              <h3>For <em>operators</em> &amp; trainers.</h3>
              <div className="titles">COO · Training · HR · Dept. heads</div>
              <div className="cta"><b>See briefs</b><span className="arrow">→</span></div>
            </a>
            <a className="role reveal r-4" href="#subscribe">
              <div className="illust"><RoleIllust kind="it" /></div>
              <div className="num">Role 04 <em>iv.</em></div>
              <h3>For <em>IT</em> &amp; security.</h3>
              <div className="titles">CIO · CISO · IT security · Data</div>
              <div className="cta"><b>See briefs</b><span className="arrow">→</span></div>
            </a>
          </div>
        </div>
      </section>

      {/* TOOLKIT */}
      <section className="chapter shaded">
        <div className="ar-container">
          <div className="ch-head reveal">
            <div className="left">
              <h2>Templates built for <em>regulated</em> desks.</h2>
            </div>
          </div>

          <div className="toolkit">
            <article className="art reveal">
              <div className="preview">
                <span className="tape">Forthcoming</span>
                <svg viewBox="0 0 320 180">
                  <rect width="320" height="180" fill="#EDE8DA" />
                  <g transform="translate(40 32)">
                    <rect x="0" y="0" width="240" height="116" fill="#F4F1E7" stroke="#0E1B2D" strokeWidth={1.4} />
                    <rect x="0" y="0" width="240" height="14" fill="#0E1B2D" />
                    <line x1="14" y1="32" x2="226" y2="32" stroke="#B5862A" strokeWidth={1} />
                    <line x1="14" y1="46" x2="180" y2="46" stroke="#0E1B2D" strokeWidth={0.6} />
                    <line x1="14" y1="58" x2="200" y2="58" stroke="#0E1B2D" strokeWidth={0.6} />
                    <line x1="14" y1="70" x2="170" y2="70" stroke="#0E1B2D" strokeWidth={0.6} />
                    <line x1="14" y1="82" x2="190" y2="82" stroke="#0E1B2D" strokeWidth={0.6} />
                    <rect x="14" y="92" width="60" height="14" fill="none" stroke="#B5862A" strokeWidth={1} />
                    <rect x="80" y="92" width="60" height="14" fill="none" stroke="#B5862A" strokeWidth={1} />
                    <rect x="146" y="92" width="60" height="14" fill="none" stroke="#B5862A" strokeWidth={1} />
                  </g>
                </svg>
              </div>
              <div className="body">
                <span className="cat">Inventory</span>
                <h4>AI use-case <em>inventory.</em></h4>
              </div>
              <div className="meta">
                <span>Q3 2026</span>
                <span className="gate">Forthcoming</span>
              </div>
              <a className="dl" href="#subscribe">Notify me <span className="arrow">→</span></a>
            </article>

            <article className="art reveal r-2">
              <div className="preview">
                <span className="tape">Forthcoming</span>
                <svg viewBox="0 0 320 180">
                  <rect width="320" height="180" fill="#EDE8DA" />
                  <g transform="translate(80 28)">
                    <rect x="0" y="0" width="160" height="124" fill="#F4F1E7" stroke="#0E1B2D" strokeWidth={1.4} rx={2} />
                    <rect x="0" y="0" width="160" height="22" fill="#B5862A" />
                    <text x="80" y="16" textAnchor="middle" fontFamily="ui-monospace" fontSize="9" fill="#F4F1E7" letterSpacing={2}>ACCEPTABLE USE</text>
                    <line x1="14" y1="38" x2="146" y2="38" stroke="#0E1B2D" strokeWidth={0.6} />
                    <line x1="14" y1="50" x2="120" y2="50" stroke="#0E1B2D" strokeWidth={0.6} />
                    <line x1="14" y1="62" x2="146" y2="62" stroke="#0E1B2D" strokeWidth={0.6} />
                    <line x1="14" y1="74" x2="100" y2="74" stroke="#0E1B2D" strokeWidth={0.6} />
                    <line x1="14" y1="86" x2="138" y2="86" stroke="#0E1B2D" strokeWidth={0.6} />
                    <rect x="14" y="100" width="132" height="14" fill="#0E1B2D" />
                    <text x="80" y="110" textAnchor="middle" fontFamily="ui-monospace" fontSize="7" fill="#F4F1E7" letterSpacing={1.5}>WALLET · LANYARD · DESK</text>
                  </g>
                </svg>
              </div>
              <div className="body">
                <span className="cat">Frontline</span>
                <h4><em>Acceptable use</em> card.</h4>
              </div>
              <div className="meta">
                <span>Q3 2026</span>
                <span className="gate">Forthcoming</span>
              </div>
              <a className="dl" href="#subscribe">Notify me <span className="arrow">→</span></a>
            </article>

            <article className="art reveal r-3">
              <div className="preview">
                <span className="tape">Forthcoming</span>
                <svg viewBox="0 0 320 180">
                  <rect width="320" height="180" fill="#EDE8DA" />
                  <g transform="translate(50 28)">
                    <rect x="0" y="0" width="220" height="124" fill="#F4F1E7" stroke="#0E1B2D" strokeWidth={1.4} />
                    <line x1="0" y1="20" x2="220" y2="20" stroke="#0E1B2D" strokeWidth={0.6} />
                    <text x="14" y="14" fontFamily="ui-monospace" fontSize="7" fill="#5C6B82" letterSpacing={1.5}>VENDOR AI REVIEW</text>
                    <rect x="14" y="30" width="8" height="8" fill="none" stroke="#0E1B2D" strokeWidth={0.8} />
                    <line x1="28" y1="36" x2="180" y2="36" stroke="#0E1B2D" strokeWidth={0.6} />
                    <rect x="14" y="46" width="8" height="8" fill="#B5862A" stroke="#B5862A" strokeWidth={0.8} />
                    <line x1="28" y1="52" x2="200" y2="52" stroke="#0E1B2D" strokeWidth={0.6} />
                    <rect x="14" y="62" width="8" height="8" fill="#B5862A" stroke="#B5862A" strokeWidth={0.8} />
                    <line x1="28" y1="68" x2="160" y2="68" stroke="#0E1B2D" strokeWidth={0.6} />
                    <rect x="14" y="78" width="8" height="8" fill="none" stroke="#0E1B2D" strokeWidth={0.8} />
                    <line x1="28" y1="84" x2="190" y2="84" stroke="#0E1B2D" strokeWidth={0.6} />
                    <rect x="14" y="94" width="8" height="8" fill="none" stroke="#0E1B2D" strokeWidth={0.8} />
                    <line x1="28" y1="100" x2="170" y2="100" stroke="#0E1B2D" strokeWidth={0.6} />
                    <line x1="14" y1="114" x2="206" y2="114" stroke="#B5862A" strokeWidth={1} />
                  </g>
                </svg>
              </div>
              <div className="body">
                <span className="cat">Third-party</span>
                <h4>Vendor AI <em>review.</em></h4>
              </div>
              <div className="meta">
                <span>Q3 2026</span>
                <span className="gate">Forthcoming</span>
              </div>
              <a className="dl" href="#subscribe">Notify me <span className="arrow">→</span></a>
            </article>

            <article className="art reveal r-4">
              <div className="preview">
                <span className="tape">Forthcoming</span>
                <svg viewBox="0 0 320 180">
                  <rect width="320" height="180" fill="#EDE8DA" />
                  <g transform="translate(60 26)">
                    <rect x="0" y="0" width="200" height="128" fill="#F4F1E7" stroke="#0E1B2D" strokeWidth={1.4} />
                    <rect x="0" y="0" width="200" height="6" fill="#0E1B2D" />
                    <rect x="0" y="10" width="200" height="6" fill="#B5862A" />
                    <text x="100" y="32" textAnchor="middle" fontFamily="Georgia" fontStyle="italic" fontSize="14" fill="#0E1B2D">Board briefing</text>
                    <line x1="20" y1="42" x2="180" y2="42" stroke="#0E1B2D" strokeWidth={0.4} />
                    <line x1="20" y1="56" x2="180" y2="56" stroke="#0E1B2D" strokeWidth={0.4} />
                    <text x="20" y="76" fontFamily="ui-monospace" fontSize="7" fill="#B5862A" letterSpacing={1.5}>I.</text>
                    <line x1="34" y1="74" x2="170" y2="74" stroke="#0E1B2D" strokeWidth={0.5} />
                    <text x="20" y="92" fontFamily="ui-monospace" fontSize="7" fill="#B5862A" letterSpacing={1.5}>II.</text>
                    <line x1="34" y1="90" x2="160" y2="90" stroke="#0E1B2D" strokeWidth={0.5} />
                    <text x="20" y="108" fontFamily="ui-monospace" fontSize="7" fill="#B5862A" letterSpacing={1.5}>III.</text>
                    <line x1="34" y1="106" x2="174" y2="106" stroke="#0E1B2D" strokeWidth={0.5} />
                  </g>
                </svg>
              </div>
              <div className="body">
                <span className="cat">Board</span>
                <h4><em>Board briefing</em> outline.</h4>
              </div>
              <div className="meta">
                <span>Q3 2026</span>
                <span className="gate">Forthcoming</span>
              </div>
              <a className="dl" href="#subscribe">Notify me <span className="arrow">→</span></a>
            </article>

            <article className="art reveal">
              <div className="preview">
                <span className="tape">Forthcoming</span>
                <svg viewBox="0 0 320 180">
                  <rect width="320" height="180" fill="#EDE8DA" />
                  <g transform="translate(50 26)">
                    <rect x="0" y="0" width="220" height="128" fill="#F4F1E7" stroke="#0E1B2D" strokeWidth={1.4} />
                    <text x="14" y="20" fontFamily="ui-monospace" fontSize="8" fill="#5C6B82" letterSpacing={2}>DEPT · AI READINESS</text>
                    <line x1="14" y1="26" x2="206" y2="26" stroke="#0E1B2D" strokeWidth={0.6} />
                    <g fontFamily="ui-monospace" fontSize="7" fill="#0E1B2D">
                      <text x="14" y="42">LENDING</text>
                      <rect x="100" y="35" width="90" height="8" fill="#EDE8DA" stroke="#0E1B2D" strokeWidth={0.4} />
                      <rect x="100" y="35" width="68" height="8" fill="#B5862A" />
                      <text x="14" y="58">RETAIL</text>
                      <rect x="100" y="51" width="90" height="8" fill="#EDE8DA" stroke="#0E1B2D" strokeWidth={0.4} />
                      <rect x="100" y="51" width="42" height="8" fill="#B5862A" />
                      <text x="14" y="74">OPERATIONS</text>
                      <rect x="100" y="67" width="90" height="8" fill="#EDE8DA" stroke="#0E1B2D" strokeWidth={0.4} />
                      <rect x="100" y="67" width="54" height="8" fill="#B5862A" />
                      <text x="14" y="90">COMPLIANCE</text>
                      <rect x="100" y="83" width="90" height="8" fill="#EDE8DA" stroke="#0E1B2D" strokeWidth={0.4} />
                      <rect x="100" y="83" width="76" height="8" fill="#B5862A" />
                      <text x="14" y="106">MARKETING</text>
                      <rect x="100" y="99" width="90" height="8" fill="#EDE8DA" stroke="#0E1B2D" strokeWidth={0.4} />
                      <rect x="100" y="99" width="36" height="8" fill="#B5862A" />
                    </g>
                  </g>
                </svg>
              </div>
              <div className="body">
                <span className="cat">Diagnostic</span>
                <h4>Department <em>readiness</em> sheet.</h4>
              </div>
              <div className="meta">
                <span>Q3 2026</span>
                <span className="gate">Forthcoming</span>
              </div>
              <a className="dl" href="#subscribe">Notify me <span className="arrow">→</span></a>
            </article>

            <article className="art reveal r-2">
              <div className="preview">
                <span className="tape">Forthcoming</span>
                <svg viewBox="0 0 320 180">
                  <rect width="320" height="180" fill="#EDE8DA" />
                  <g transform="translate(70 28)">
                    <rect x="0" y="0" width="180" height="124" fill="#F4F1E7" stroke="#0E1B2D" strokeWidth={1.4} />
                    <text x="14" y="20" fontFamily="ui-monospace" fontSize="8" fill="#5C6B82" letterSpacing={2}>PROMPT RISK · REVIEW</text>
                    <line x1="14" y1="26" x2="166" y2="26" stroke="#B5862A" strokeWidth={1} />
                    <g fontFamily="ui-monospace" fontSize="7" fill="#0E1B2D">
                      <circle cx="20" cy="42" r="3" fill="#B5862A" />
                      <text x="30" y="45">Member data present?</text>
                      <circle cx="20" cy="58" r="3" fill="#B5862A" />
                      <text x="30" y="61">Auto-action downstream?</text>
                      <circle cx="20" cy="74" r="3" fill="#B5862A" />
                      <text x="30" y="77">Reversible if wrong?</text>
                      <circle cx="20" cy="90" r="3" fill="none" stroke="#0E1B2D" strokeWidth={0.6} />
                      <text x="30" y="93">Logged &amp; reviewable?</text>
                      <circle cx="20" cy="106" r="3" fill="none" stroke="#0E1B2D" strokeWidth={0.6} />
                      <text x="30" y="109">Disclosed to member?</text>
                    </g>
                  </g>
                </svg>
              </div>
              <div className="body">
                <span className="cat">Day-to-day</span>
                <h4>Prompt <em>risk review.</em></h4>
              </div>
              <div className="meta">
                <span>Q3 2026</span>
                <span className="gate">Forthcoming</span>
              </div>
              <a className="dl" href="#subscribe">Notify me <span className="arrow">→</span></a>
            </article>
          </div>
        </div>
      </section>

      {/* REGULATORY GALLERY */}
      <section className="chapter">
        <div className="ar-container">
          <div className="ch-head reveal">
            <div className="left">
              <h2>The <em>guidance,</em> at a glance.</h2>
            </div>
          </div>

          <div className="gallery">
            {SEALS.map((s, i) => (
              <div key={s.id} className={`seal-card reveal${revealDelay(i)}`}>
                <div className="seal" aria-hidden="true"><Seal meta={s} /></div>
                <div className="nm">{s.nm}</div>
                <div className="sub">{s.subline}</div>
                <div className="means">{s.means}</div>
                <div className="status">{s.status}</div>
              </div>
            ))}
          </div>

          <p
            style={{
              fontFamily: 'var(--ar-mono)',
              fontSize: '10px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--ar-muted)',
              fontWeight: 500,
              textAlign: 'center',
              marginTop: 28,
              maxWidth: '64ch',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.6,
            }}
          >
            Educational analysis, not legal or regulatory advice. Cite the originals in your filings.
          </p>
        </div>
      </section>

      {/* LADDER */}
      <section className="chapter ladder-band">
        <div className="ar-container">
          <div className="ch-head reveal">
            <div className="left">
              <h2>From reading to <em>readiness.</em></h2>
            </div>
          </div>

          <div className="ladder">
            <div className="lad reveal">
              <span className="stepmark" aria-hidden="true">I.</span>
              <div className="step"><span>Step 01</span><b>Free</b></div>
              <h4>The <em>readiness</em> assessment.</h4>
              <p>Twelve questions, three minutes. A scored snapshot before you spend.</p>
              <a className="lcta" href="/assessment/start">Start the assessment <span className="arrow">→</span></a>
            </div>
            <div className="lad reveal r-2">
              <span className="stepmark" aria-hidden="true">II.</span>
              <div className="step"><span>Step 02</span><b>$99</b></div>
              <h4>The <em>in-depth</em> diagnostic.</h4>
              <p>Forty-eight calibrated questions across eight dimensions. A consulting-grade Briefing keyed to your weakest area.</p>
              <a className="lcta" href="/assessment/in-depth">See the In-Depth <span className="arrow">→</span></a>
            </div>
            <div className="lad reveal r-3">
              <span className="stepmark" aria-hidden="true">III.</span>
              <div className="step"><span>Step 03</span><b>$295</b></div>
              <h4>AiBI&ndash;<em>Foundation.</em></h4>
              <p>Twelve self-paced modules. Practice reps, artifact templates, the prompt library, and the credential.</p>
              <a className="lcta" href="/courses/foundation/program">View the syllabus <span className="arrow">→</span></a>
            </div>
          </div>
        </div>
      </section>

      {/* SUBSCRIBE */}
      <section className="sub" id="subscribe">
        <div className="ar-container">
          <div className="sub-card reveal">
            <div>
              <h3>Get the <em>Brief.</em></h3>
              <p>Fortnightly research. No hype. No generic AI news. Delivered Tuesday.</p>
            </div>
            <div>
              <form action="/api/capture-email" method="POST">
                <input type="email" name="email" placeholder="you@yourbank.com" aria-label="Email" required />
                <input type="hidden" name="source" value="research-brief" />
                <button type="submit">Subscribe</button>
              </form>
              <div className="terms">
                <span>No tracking pixels</span>
                <span>One-click unsubscribe</span>
                <span>Fortnightly · Tuesday</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
