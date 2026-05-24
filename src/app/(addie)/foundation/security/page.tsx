// /foundation/security — Security & vendor due-diligence reference page.
//
// Reference material for a community-bank VRM team, not marketing. Strict
// Ledger aesthetic (parchment hero, hairline rules, mono kickers, serif
// headings). Print-friendly so the page reads as a clean handout.
//
// Source spec: docs/Foundation-Course-ADDIE/AiBI_Security_Privacy_Spec.md
// Adjacent specs referenced:
//   - AiBI_Sandbox_Service_Tech_Spec.md §4 (PII pre-flight) + §6 (cost/abuse)
//   - AiBI_Database_Schema_RLS_Spec.md (data model + RLS posture)
//   - AiBI_Auth_Entitlements_Spec.md (auth + cookies + sessions)

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';

export const metadata: Metadata = {
  title: 'Security & vendor due diligence · Foundation Course',
  description:
    'What touches your data, and what does not. The honest security posture of The AI Banking Institute for community-bank vendor review.',
};

const LAST_UPDATED = '2026-05-23';
const SECURITY_CONTACT =
  process.env.SECURITY_CONTACT_EMAIL || 'security@aibankinginstitute.com';

// ---------- Section 2 · Posture summary ----------

interface PostureClaim {
  readonly label: string;
  readonly body: string;
}

const POSTURE: readonly PostureClaim[] = [
  {
    label: 'No customer data touches the model. Ever.',
    body: 'The sandbox bounds learner inputs to allowlisted levers and delimited public-text slots. There is no upload affordance, no integration with a bank core, and no path for member data to reach a model provider.',
  },
  {
    label: 'No training on your data, by contract.',
    body: 'Anthropic, OpenAI, and Google are accessed only through their commercial APIs. API-tier terms do not train on inputs by default. Provider terms are reconfirmed each quarter and published below.',
  },
  {
    label: 'Data lives in your region. Encrypted at rest, TLS in transit.',
    body: 'Supabase Postgres and Storage are hosted in AWS us-east-1, AES-256 at rest by default. TLS 1.2+ is enforced on every hop — Vercel, Supabase, Stripe, and every model provider.',
  },
  {
    label: 'RLS-enforced. Service-role only on the server.',
    body: 'Every learner-data table carries row-level security policies. The Supabase service-role key never ships to the browser; only server routes and Edge Functions touch it.',
  },
];

// ---------- Section 3 · Regulatory alignment ----------

interface RegRow {
  readonly framework: string;
  readonly publisher: string;
  readonly coverage: string;
}

const REGULATORY: readonly RegRow[] = [
  {
    framework: 'SR 11-7 — Model Risk Management',
    publisher: 'Federal Reserve / OCC, 2011',
    coverage:
      'The course teaches the model-risk framing your examiners apply. We are not a model of record; we teach the controls, validation, and documentation discipline you bring to one.',
  },
  {
    framework: 'Interagency TPRM Guidance',
    publisher: 'OCC / FRB / FDIC, June 2023',
    coverage:
      'This page is structured to answer a Tier-1 third-party review on its own. We furnish a SIG Lite response on request and our sub-processor list is published below.',
  },
  {
    framework: 'ECOA / Regulation B',
    publisher: 'CFPB',
    coverage:
      'Prompt patterns taught in the course are fair-lending aware: no protected-class inputs, no proxies, no adverse-action language without an underlying validated model. We teach the discipline; we do not make credit decisions.',
  },
  {
    framework: 'AIEOG AI Lexicon',
    publisher: 'US Treasury · FBIIC · FSSCC, February 2026',
    coverage:
      'Course terminology — hallucination, AI governance, AI use-case inventory, human-in-the-loop, third-party AI risk, explainability — uses the AIEOG definitions verbatim so your governance team and your learners read from the same dictionary.',
  },
  {
    framework: 'GLBA · Safeguards Rule',
    publisher: 'FTC / functional regulators',
    coverage:
      'NPI never leaves your institution because it never enters ours. For any future on-prem or single-tenant deployment we will sign a written information-security program addendum that maps to your Safeguards Rule controls.',
  },
];

// ---------- Section 5 · What we store ----------

interface StoreRow {
  readonly category: string;
  readonly fields: string;
  readonly location: string;
  readonly retention: string;
}

const STORE: readonly StoreRow[] = [
  {
    category: 'Account',
    fields:
      'Email, hashed password (Supabase Auth), display name, role track, marketing opt-in flag.',
    location: 'Supabase Auth + learner_profiles',
    retention: 'Active while account is active; 24-month inactivity prompts deletion-or-reaffirm.',
  },
  {
    category: 'Course progress',
    fields:
      'Lesson views, knowledge-check results, module completion, last-position bookmark.',
    location: 'Supabase: lesson_progress, knowledge_check_results',
    retention: 'Retained with the account.',
  },
  {
    category: 'Toolbox artifacts',
    fields: 'Markdown bodies you author, version history, item metadata.',
    location: 'Supabase: toolbox_items, toolbox_item_versions, Storage bucket',
    retention: 'Retained with the account; full export at /account/export.',
  },
  {
    category: 'Sandbox runs',
    fields:
      'Exercise id, lever choices, prompt, response, provider, token count, latency. No free-text customer data — bounded inputs only.',
    location: 'Supabase: sandbox_sessions',
    retention: '30 days at full fidelity, then aggregated daily and raw rows deleted.',
  },
  {
    category: 'Events',
    fields: 'Pageviews, lesson_start, lesson_complete, gate_decision, save events.',
    location: 'Supabase: events',
    retention: '24 months detailed; aggregated annually thereafter.',
  },
  {
    category: 'Payment',
    fields: 'Stripe customer id, session id, subscription id only.',
    location: 'Stripe (PCI Level 1) — we hold the references, not the card.',
    retention: 'Per Stripe terms; we keep the reference for the life of the account.',
  },
];

const NOT_STORED: readonly string[] = [
  'Payment-card numbers — Stripe holds those, we never see them.',
  'Bank customer or member data — we will not accept it; the sandbox blocks it.',
  'Account, routing, SSN, or card-shaped numbers — blocked at the API boundary.',
  'Audio or video of you.',
  'IP addresses in plaintext — hashed with TOOLBOX_IP_HASH_SALT for rate limiting only.',
];

// ---------- Section 6 · Sub-processors ----------

interface SubproRow {
  readonly name: string;
  readonly purpose: string;
  readonly region: string;
  readonly dpa: string;
}

const SUBPROCESSORS: readonly SubproRow[] = [
  {
    name: 'Supabase',
    purpose: 'Database, authentication, file storage',
    region: 'US — AWS us-east-1',
    dpa: 'https://supabase.com/legal/dpa',
  },
  {
    name: 'Vercel',
    purpose: 'Application hosting and edge delivery',
    region: 'Global edge; data layer pinned to US',
    dpa: 'https://vercel.com/legal/dpa',
  },
  {
    name: 'Anthropic',
    purpose: 'Claude model provider (default)',
    region: 'US',
    dpa: 'https://www.anthropic.com/legal/commercial-terms',
  },
  {
    name: 'OpenAI',
    purpose: 'GPT model provider (optional, learner-switchable)',
    region: 'US',
    dpa: 'https://openai.com/policies/data-processing-addendum',
  },
  {
    name: 'Google',
    purpose: 'Gemini model provider (optional, learner-switchable)',
    region: 'US',
    dpa: 'https://cloud.google.com/terms/data-processing-addendum',
  },
  {
    name: 'Stripe',
    purpose: 'Payments — PCI Level 1',
    region: 'US',
    dpa: 'https://stripe.com/legal/dpa',
  },
  {
    name: 'MailerLite',
    purpose: 'Marketing email lists and sequences (opt-in only)',
    region: 'US / EU',
    dpa: 'https://www.mailerlite.com/legal/data-processing-agreement',
  },
  {
    name: 'Resend',
    purpose: 'Transactional email (receipts, password reset, exports)',
    region: 'US',
    dpa: 'https://resend.com/legal/dpa',
  },
];

// ---------- Section 7 · Provider data-handling stance ----------

interface ProviderRow {
  readonly provider: string;
  readonly trains: string;
  readonly retention: string;
  readonly region: string;
  readonly link: string;
}

const PROVIDERS: readonly ProviderRow[] = [
  {
    provider: 'Anthropic (Claude)',
    trains: 'No — commercial-API tier is not used to train Anthropic models.',
    retention: 'Up to 30 days for abuse and trust-and-safety monitoring, then deleted.',
    region: 'US',
    link: 'https://www.anthropic.com/legal/commercial-terms',
  },
  {
    provider: 'OpenAI (GPT)',
    trains: 'No — API inputs and outputs are not used to train OpenAI models by default.',
    retention: 'Up to 30 days for abuse monitoring; zero-retention available on request.',
    region: 'US',
    link: 'https://openai.com/policies/api-data-usage-policies',
  },
  {
    provider: 'Google (Gemini)',
    trains: 'No — paid Gemini API tier is not used to train Google models.',
    retention: 'Per Google AI for Developers tier; cached for the tier-stated window then deleted.',
    region: 'US',
    link: 'https://ai.google.dev/gemini-api/terms',
  },
];

// ---------- helpers ----------

function SectionHead({
  kicker,
  title,
  lede,
}: {
  readonly kicker: string;
  readonly title: string;
  readonly lede?: string;
}) {
  return (
    <header className="mb-8">
      <KickerLabel tone="accent">{kicker}</KickerLabel>
      <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-[var(--ledger-ink)] leading-tight">
        {title}
      </h2>
      {lede ? (
        <p className="mt-3 max-w-3xl text-[var(--ledger-ink-2)] leading-relaxed">{lede}</p>
      ) : null}
    </header>
  );
}

function HairlineSection({
  id,
  children,
  tone = 'bg',
}: {
  readonly id: string;
  readonly children: ReactNode;
  readonly tone?: 'bg' | 'paper';
}) {
  const bg = tone === 'paper' ? 'bg-[var(--ledger-paper)]' : 'bg-[var(--ledger-bg)]';
  return (
    <section
      id={id}
      className={`${bg} border-t border-[var(--ledger-rule)]`}
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14 sm:py-16">{children}</div>
    </section>
  );
}

// Inline data-flow SVG diagram. Kept dependency-free, accessible via title +
// desc, monochrome on the parchment field. Roman text (italics retired).
function DataFlowDiagram() {
  return (
    <svg
      role="img"
      aria-labelledby="dataflow-title dataflow-desc"
      viewBox="0 0 880 220"
      className="w-full h-auto border border-[var(--ledger-rule)] rounded-[3px] bg-[var(--ledger-paper)]"
    >
      <title id="dataflow-title">Data flow diagram</title>
      <desc id="dataflow-desc">
        A learner request travels from browser, to the application API, through a PII pre-flight check,
        to the sandbox service, then to the chosen model provider, and the response returns the same
        way. No path connects to a bank core or member data.
      </desc>
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#0E1B2D" />
        </marker>
      </defs>
      {[
        { x: 20, label: 'Learner', sub: 'Browser' },
        { x: 190, label: 'App API', sub: 'Next.js' },
        { x: 360, label: 'PII pre-flight', sub: 'Regex + entropy' },
        { x: 530, label: 'Sandbox', sub: 'Bounded prompt' },
        { x: 700, label: 'Model', sub: 'Anthropic / OpenAI / Google' },
      ].map((node) => (
        <g key={node.label}>
          <rect
            x={node.x}
            y={70}
            width={160}
            height={80}
            rx={3}
            ry={3}
            fill="#F4F1E7"
            stroke="#0E1B2D"
            strokeWidth={1}
          />
          <text
            x={node.x + 80}
            y={102}
            textAnchor="middle"
            fontFamily="Newsreader, Georgia, serif"
            fontSize={16}
            fill="#0E1B2D"
            fontStyle="normal"
          >
            {node.label}
          </text>
          <text
            x={node.x + 80}
            y={124}
            textAnchor="middle"
            fontFamily="JetBrains Mono, ui-monospace, monospace"
            fontSize={10}
            fill="#4F5C6E"
            letterSpacing="1.6"
            fontStyle="normal"
          >
            {node.sub.toUpperCase()}
          </text>
        </g>
      ))}
      {/* Arrows between boxes */}
      {[
        { x1: 180, x2: 190 },
        { x1: 350, x2: 360 },
        { x1: 520, x2: 530 },
        { x1: 690, x2: 700 },
      ].map((edge) => (
        <line
          key={edge.x1}
          x1={edge.x1}
          y1={110}
          x2={edge.x2}
          y2={110}
          stroke="#0E1B2D"
          strokeWidth={1}
          markerEnd="url(#arrow)"
        />
      ))}
      {/* Bottom annotation: no bank core */}
      <text
        x={440}
        y={195}
        textAnchor="middle"
        fontFamily="JetBrains Mono, ui-monospace, monospace"
        fontSize={11}
        letterSpacing="1.6"
        fill="#4F5C6E"
        fontStyle="normal"
      >
        NO PATH TO BANK CORE · NO PATH TO MEMBER DATA
      </text>
      <text
        x={440}
        y={32}
        textAnchor="middle"
        fontFamily="Newsreader, Georgia, serif"
        fontSize={14}
        fill="#0E1B2D"
        fontStyle="normal"
      >
        Request and response travel the same path. Nothing branches into customer systems.
      </text>
    </svg>
  );
}

// ---------- page ----------

export default function FoundationSecurityPage() {
  return (
    <main className="addie-security-doc">
      {/* Hero — parchment, reference posture (not marketing) */}
      <section className="bg-[var(--ledger-paper)] border-b border-[var(--ledger-rule)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14 sm:py-20">
          <KickerLabel tone="accent">Security &amp; vendor due diligence</KickerLabel>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-[var(--ledger-ink)]">
            What touches your data,
            <br />
            and what does not.
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-[var(--ledger-ink-2)] leading-relaxed">
            The Foundation Course is a teaching environment, not a banking system. No customer data
            touches a model. No bank-core integration exists. This page is the honest, written
            posture your vendor-risk team can read, print, and forward to compliance.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--ledger-muted)]">
            <span>Last updated · {LAST_UPDATED}</span>
            <span className="hidden sm:inline" aria-hidden>·</span>
            <span>Contact · {SECURITY_CONTACT}</span>
            <span className="hidden sm:inline" aria-hidden>·</span>
            <a
              href="#downloads"
              className="underline underline-offset-4 hover:text-[var(--ledger-ink)]"
            >
              Vendor questionnaire
            </a>
          </div>
        </div>
      </section>

      {/* 2 · Posture summary */}
      <HairlineSection id="posture" tone="bg">
        <SectionHead
          kicker="Posture summary"
          title="The shape of our security posture."
          lede="Four claims, written plainly. The detail tables below each claim either back it up or admit the residual risk."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {POSTURE.map((claim) => (
            <article
              key={claim.label}
              className="bg-[var(--ledger-paper)] border border-[var(--ledger-rule)] rounded-[3px] p-6"
            >
              <h3 className="font-serif text-xl text-[var(--ledger-ink)] leading-snug">
                {claim.label}
              </h3>
              <p className="mt-3 text-sm text-[var(--ledger-ink-2)] leading-relaxed">
                {claim.body}
              </p>
            </article>
          ))}
        </div>
      </HairlineSection>

      {/* 3 · Regulatory alignment */}
      <HairlineSection id="regulatory" tone="paper">
        <SectionHead
          kicker="Sourced regulatory alignment"
          title="The frameworks we read against."
          lede="Aligned with SR 11-7, Interagency TPRM Guidance, ECOA/Reg B, and the AIEOG AI Lexicon. We map to each by name, not by inference."
        />
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[640px] text-left border-collapse">
            <thead>
              <tr>
                <th scope="col" className="px-4 py-3 font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)] w-1/4">Framework</th>
                <th scope="col" className="px-4 py-3 font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)] w-1/4">Publisher</th>
                <th scope="col" className="px-4 py-3 font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">How it applies</th>
              </tr>
            </thead>
            <tbody>
              {REGULATORY.map((r) => (
                <tr key={r.framework} className="align-top">
                  <th scope="row" className="px-4 py-4 border-t border-[var(--ledger-rule)] font-serif text-base text-[var(--ledger-ink)]">
                    {r.framework}
                  </th>
                  <td className="px-4 py-4 border-t border-[var(--ledger-rule)] font-mono text-xs text-[var(--ledger-muted)] uppercase tracking-[0.12em]">
                    {r.publisher}
                  </td>
                  <td className="px-4 py-4 border-t border-[var(--ledger-rule)] text-sm text-[var(--ledger-ink-2)] leading-relaxed">
                    {r.coverage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HairlineSection>

      {/* 4 · Data flow */}
      <HairlineSection id="data-flow" tone="bg">
        <SectionHead
          kicker="Data flow"
          title="Where a request goes, and where it does not."
          lede="A learner request travels from the browser to a Next.js API route, through a PII pre-flight check, to the sandbox service, and on to the chosen model provider. The response retraces the path. No path connects to a bank core, a member system, or any institution-held data."
        />
        <DataFlowDiagram />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 text-sm text-[var(--ledger-ink-2)] leading-relaxed">
          <li className="border-l-2 border-[var(--ledger-accent)] pl-4">
            <strong className="font-serif text-base text-[var(--ledger-ink)] block mb-1">
              PII pre-flight at the API boundary.
            </strong>
            Regex plus entropy scan rejects strings that look like SSNs, account or routing numbers,
            payment-card patterns, or full name plus date of birth. The request never reaches a
            provider when the check trips.
          </li>
          <li className="border-l-2 border-[var(--ledger-accent)] pl-4">
            <strong className="font-serif text-base text-[var(--ledger-ink)] block mb-1">
              Allowlisted preset prompts, bounded data slots.
            </strong>
            Learners cannot type free-form into the model. They pick from preset exercises and fill
            a small number of delimited public-text slots. The system preamble treats slot content
            as untrusted material, never as instructions.
          </li>
        </ul>
      </HairlineSection>

      {/* 5 · What we store */}
      <HairlineSection id="data-we-hold" tone="paper">
        <SectionHead
          kicker="What we store"
          title="Every category we hold, named."
          lede="If a future feature would add a new category, this table updates before the feature ships."
        />
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[720px] text-left border-collapse">
            <thead>
              <tr>
                <th scope="col" className="px-4 py-3 font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">Category</th>
                <th scope="col" className="px-4 py-3 font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">Fields</th>
                <th scope="col" className="px-4 py-3 font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">Location</th>
                <th scope="col" className="px-4 py-3 font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">Retention</th>
              </tr>
            </thead>
            <tbody>
              {STORE.map((r) => (
                <tr key={r.category} className="align-top">
                  <th scope="row" className="px-4 py-4 border-t border-[var(--ledger-rule)] font-serif text-base text-[var(--ledger-ink)]">
                    {r.category}
                  </th>
                  <td className="px-4 py-4 border-t border-[var(--ledger-rule)] text-sm text-[var(--ledger-ink-2)] leading-relaxed">
                    {r.fields}
                  </td>
                  <td className="px-4 py-4 border-t border-[var(--ledger-rule)] text-xs font-mono text-[var(--ledger-muted)] leading-relaxed">
                    {r.location}
                  </td>
                  <td className="px-4 py-4 border-t border-[var(--ledger-rule)] text-sm text-[var(--ledger-ink-2)] leading-relaxed">
                    {r.retention}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 border border-[var(--ledger-rule)] bg-[var(--ledger-tape)] rounded-[3px] p-6">
          <KickerLabel tone="ink">What we do not store</KickerLabel>
          <ul className="mt-3 space-y-2 text-sm text-[var(--ledger-ink-2)] leading-relaxed">
            {NOT_STORED.map((line) => (
              <li key={line} className="flex gap-3">
                <span aria-hidden className="text-[var(--ledger-accent)] font-mono">×</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </HairlineSection>

      {/* 6 · Sub-processors */}
      <HairlineSection id="sub-processors" tone="bg">
        <SectionHead
          kicker="Sub-processors"
          title="Every third party that touches your data."
          lede="Named, scoped, regioned, and linked to the data-processing agreement. This list updates before a new sub-processor goes live."
        />
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[720px] text-left border-collapse">
            <thead>
              <tr>
                <th scope="col" className="px-4 py-3 font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">Name</th>
                <th scope="col" className="px-4 py-3 font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">Purpose</th>
                <th scope="col" className="px-4 py-3 font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">Region</th>
                <th scope="col" className="px-4 py-3 font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">DPA</th>
              </tr>
            </thead>
            <tbody>
              {SUBPROCESSORS.map((s) => (
                <tr key={s.name} className="align-top">
                  <th scope="row" className="px-4 py-4 border-t border-[var(--ledger-rule)] font-serif text-base text-[var(--ledger-ink)]">
                    {s.name}
                  </th>
                  <td className="px-4 py-4 border-t border-[var(--ledger-rule)] text-sm text-[var(--ledger-ink-2)] leading-relaxed">
                    {s.purpose}
                  </td>
                  <td className="px-4 py-4 border-t border-[var(--ledger-rule)] text-xs font-mono text-[var(--ledger-muted)] uppercase tracking-[0.12em]">
                    {s.region}
                  </td>
                  <td className="px-4 py-4 border-t border-[var(--ledger-rule)] text-sm">
                    <a
                      href={s.dpa}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[var(--ledger-ink)] underline underline-offset-4 hover:text-[var(--ledger-accent)] break-words"
                    >
                      View DPA
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HairlineSection>

      {/* 7 · Provider data-handling stance */}
      <HairlineSection id="provider-stance" tone="paper">
        <SectionHead
          kicker="Provider data-handling stance"
          title="What the model providers do, and do not do."
          lede="Confirmed quarterly against each provider's published commercial-API terms. If a provider's terms change adversely, the gateway can switch defaults."
        />
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[720px] text-left border-collapse">
            <thead>
              <tr>
                <th scope="col" className="px-4 py-3 font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">Provider</th>
                <th scope="col" className="px-4 py-3 font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">Trains on prompts?</th>
                <th scope="col" className="px-4 py-3 font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">Retention</th>
                <th scope="col" className="px-4 py-3 font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">Region</th>
                <th scope="col" className="px-4 py-3 font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">Policy</th>
              </tr>
            </thead>
            <tbody>
              {PROVIDERS.map((p) => (
                <tr key={p.provider} className="align-top">
                  <th scope="row" className="px-4 py-4 border-t border-[var(--ledger-rule)] font-serif text-base text-[var(--ledger-ink)]">
                    {p.provider}
                  </th>
                  <td className="px-4 py-4 border-t border-[var(--ledger-rule)] text-sm text-[var(--ledger-ink-2)] leading-relaxed">
                    {p.trains}
                  </td>
                  <td className="px-4 py-4 border-t border-[var(--ledger-rule)] text-sm text-[var(--ledger-ink-2)] leading-relaxed">
                    {p.retention}
                  </td>
                  <td className="px-4 py-4 border-t border-[var(--ledger-rule)] text-xs font-mono text-[var(--ledger-muted)] uppercase tracking-[0.12em]">
                    {p.region}
                  </td>
                  <td className="px-4 py-4 border-t border-[var(--ledger-rule)] text-sm">
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[var(--ledger-ink)] underline underline-offset-4 hover:text-[var(--ledger-accent)] break-words"
                    >
                      Read terms
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HairlineSection>

      {/* 8 · Auth + sessions */}
      <HairlineSection id="auth" tone="bg">
        <SectionHead
          kicker="Authentication and sessions"
          title="How a learner stays signed in, safely."
          lede="Supabase Auth handles credentials. Our application layer adds CSRF resistance, session rotation, and a signed anonymous session for pre-account state."
        />
        <ul className="grid gap-4 sm:grid-cols-2 text-sm text-[var(--ledger-ink-2)] leading-relaxed">
          {[
            ['Credentials', 'Supabase Auth — email and password with a configurable minimum strength, rate-limited login, and password-reset via signed email link.'],
            ['Session cookies', 'httpOnly, Secure, SameSite=Lax. Never accessible to client JavaScript.'],
            ['Anonymous session', 'Signed HMAC-SHA256 cookie identifies a pre-account learner so progress is not lost at sign-up. Rotated on identity-bind.'],
            ['CSRF posture', 'SameSite=Lax cookies plus origin checks on every mutation route. No cross-site form posts accepted.'],
            ['Session lifetime', '30-day sliding window. Activity refreshes the cookie; inactivity expires it.'],
            ['Service-role key', 'Server-only. Never bundled. Marked Sensitive in Vercel and gitleaks-checked pre-commit.'],
          ].map(([h, body]) => (
            <li key={h} className="border-l-2 border-[var(--ledger-rule-strong)] pl-4">
              <strong className="font-serif text-base text-[var(--ledger-ink)] block mb-1">{h}</strong>
              {body}
            </li>
          ))}
        </ul>
      </HairlineSection>

      {/* 9 · Encryption */}
      <HairlineSection id="encryption" tone="paper">
        <SectionHead
          kicker="Encryption"
          title="At rest and in transit."
        />
        <div className="grid gap-4 sm:grid-cols-3 text-sm text-[var(--ledger-ink-2)] leading-relaxed">
          <article className="border border-[var(--ledger-rule)] bg-[var(--ledger-bg)] rounded-[3px] p-5">
            <KickerLabel tone="muted">At rest</KickerLabel>
            <p className="mt-2">AES-256 by default on Supabase Postgres and Storage. Bucket-level encryption on every Storage bucket.</p>
          </article>
          <article className="border border-[var(--ledger-rule)] bg-[var(--ledger-bg)] rounded-[3px] p-5">
            <KickerLabel tone="muted">In transit</KickerLabel>
            <p className="mt-2">TLS 1.2 or newer enforced at Vercel, Supabase, Stripe, and every model provider. No HTTP fallback exists.</p>
          </article>
          <article className="border border-[var(--ledger-rule)] bg-[var(--ledger-bg)] rounded-[3px] p-5">
            <KickerLabel tone="muted">Backups</KickerLabel>
            <p className="mt-2">Daily encrypted database backups, 30-day retention, restorable to a point in time within the window.</p>
          </article>
        </div>
      </HairlineSection>

      {/* 10 · Incident response */}
      <HairlineSection id="incident" tone="bg">
        <SectionHead
          kicker="Incident response"
          title="How we behave when something goes wrong."
        />
        <ol className="space-y-3 text-sm text-[var(--ledger-ink-2)] leading-relaxed list-decimal pl-5">
          <li><strong className="font-serif text-base text-[var(--ledger-ink)]">Detect.</strong> Page on alert or report received at <a href={`mailto:${SECURITY_CONTACT}`} className="text-[var(--ledger-ink)] underline underline-offset-4 hover:text-[var(--ledger-accent)]">{SECURITY_CONTACT}</a>.</li>
          <li><strong className="font-serif text-base text-[var(--ledger-ink)]">Contain.</strong> Disable the affected surface via feature flag, rotate keys if exposed, revoke tokens.</li>
          <li><strong className="font-serif text-base text-[var(--ledger-ink)]">Assess blast radius.</strong> What data, whose, for how long. The structural no-customer-data guarantee bounds this.</li>
          <li><strong className="font-serif text-base text-[var(--ledger-ink)]">Notify.</strong> Affected learners within 72 hours of discovery, per GDPR. Institutions affected by a confirmed breach receive direct notice from the founder.</li>
          <li><strong className="font-serif text-base text-[var(--ledger-ink)]">Fix.</strong> Code, configuration, or process. Update the security test suite with the regression.</li>
          <li><strong className="font-serif text-base text-[var(--ledger-ink)]">Postmortem.</strong> Written, blameless, posted to the incidents log within ten business days.</li>
        </ol>
        <p className="mt-6 text-sm text-[var(--ledger-muted)] leading-relaxed">
          Operating footprint disclosure: the Institute is currently a small team with a single
          founder-operator on call. We treat that as a constraint to design around, not to hide.
          Pager rotation expands as the team grows.
        </p>
      </HairlineSection>

      {/* 11 · Pen test + audit posture */}
      <HairlineSection id="audit" tone="paper">
        <SectionHead
          kicker="Pen test and audit posture"
          title="Where we are today, written honestly."
        />
        <div className="grid gap-4 sm:grid-cols-2 text-sm text-[var(--ledger-ink-2)] leading-relaxed">
          <article className="border border-[var(--ledger-rule)] bg-[var(--ledger-bg)] rounded-[3px] p-5">
            <KickerLabel tone="muted">Penetration testing</KickerLabel>
            <p className="mt-2">
              Pre-pilot. A third-party penetration test is scheduled on the sandbox surface
              before we open anonymous sandbox access at scale. Findings will be closed or
              documented as accepted residuals before the test report is published.
            </p>
          </article>
          <article className="border border-[var(--ledger-rule)] bg-[var(--ledger-bg)] rounded-[3px] p-5">
            <KickerLabel tone="muted">SOC 2</KickerLabel>
            <p className="mt-2">
              Not in scope today. Stretch goal is SOC 2 Type II within 12 months of pilot.
              Until then we publish this page, the SIG Lite response on request, and the
              sub-processor list above so a buyer can run their own review.
            </p>
          </article>
          <article className="border border-[var(--ledger-rule)] bg-[var(--ledger-bg)] rounded-[3px] p-5">
            <KickerLabel tone="muted">Adversarial red team</KickerLabel>
            <p className="mt-2">
              Quarterly internal red team against the sandbox: prompt-injection extraction,
              cross-tenant probing, rate-limit evasion, provider-switch attacks. Annual
              external red team once pilot traffic warrants it.
            </p>
          </article>
          <article className="border border-[var(--ledger-rule)] bg-[var(--ledger-bg)] rounded-[3px] p-5">
            <KickerLabel tone="muted">Vulnerability management</KickerLabel>
            <p className="mt-2">
              <code className="font-mono text-xs">npm audit</code> runs in CI on every pull
              request. Quarterly dependency review. Major versions pinned. Critical advisories
              patched within seven days.
            </p>
          </article>
        </div>
      </HairlineSection>

      {/* 12 · What we are not */}
      <HairlineSection id="not" tone="bg">
        <SectionHead
          kicker="Boundaries"
          title="What we are not."
          lede="A list as important as the posture summary. It tells you the questions your VRM team does not need to ask."
        />
        <ul className="grid gap-3 sm:grid-cols-2 text-sm text-[var(--ledger-ink-2)] leading-relaxed">
          {[
            'We are not a system of record. No general ledger, no core, no member system of any kind.',
            'We are not a model provider. We use Anthropic, OpenAI, and Google through their commercial APIs.',
            'We do not hold your bank customer data. We will not accept it; the sandbox blocks it.',
            'We are not a vendor-of-record for any production banking workflow. We are an educational product.',
          ].map((line) => (
            <li
              key={line}
              className="border-l-2 border-[var(--ledger-ink)] bg-[var(--ledger-paper)] p-4 rounded-[3px]"
            >
              {line}
            </li>
          ))}
        </ul>
      </HairlineSection>

      {/* 13 · Downloads */}
      <HairlineSection id="downloads" tone="paper">
        <SectionHead
          kicker="Downloads"
          title="For your vendor file."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="/foundation/security/vendor-questionnaire.pdf"
            className="block border border-[var(--ledger-rule)] bg-[var(--ledger-bg)] rounded-[3px] p-6 hover:border-[var(--ledger-rule-strong)] transition-colors duration-[120ms]"
          >
            <KickerLabel tone="accent">PDF · placeholder</KickerLabel>
            <h3 className="mt-2 font-serif text-xl text-[var(--ledger-ink)]">
              Vendor questionnaire (this page, printable)
            </h3>
            <p className="mt-2 text-sm text-[var(--ledger-ink-2)] leading-relaxed">
              A printable PDF of this entire page, formatted for the binder your compliance team
              keeps. Hosted at <code className="font-mono text-xs">/foundation/security/vendor-questionnaire.pdf</code>.
            </p>
          </a>
          <a
            href={`mailto:${SECURITY_CONTACT}?subject=SIG%20Lite%20request%20%E2%80%94%20The%20AI%20Banking%20Institute`}
            className="block border border-[var(--ledger-rule)] bg-[var(--ledger-bg)] rounded-[3px] p-6 hover:border-[var(--ledger-rule-strong)] transition-colors duration-[120ms]"
          >
            <KickerLabel tone="accent">Email request</KickerLabel>
            <h3 className="mt-2 font-serif text-xl text-[var(--ledger-ink)]">
              Request our SIG Lite response
            </h3>
            <p className="mt-2 text-sm text-[var(--ledger-ink-2)] leading-relaxed">
              We return a completed SIG Lite within two business days. Email{' '}
              <span className="font-mono text-xs">{SECURITY_CONTACT}</span> with your institution
              name and a brief note about the use case under review.
            </p>
          </a>
        </div>
      </HairlineSection>

      {/* 14 · Last updated + contact */}
      <section
        className="border-t border-[var(--ledger-rule)] bg-[var(--ledger-bg)]"
        aria-label="Document metadata"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm">
          <p className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">
            Last updated · {LAST_UPDATED}
          </p>
          <p className="text-[var(--ledger-ink-2)]">
            Questions:{' '}
            <a
              href={`mailto:${SECURITY_CONTACT}`}
              className="text-[var(--ledger-ink)] underline underline-offset-4 hover:text-[var(--ledger-accent)]"
            >
              {SECURITY_CONTACT}
            </a>
          </p>
        </div>
      </section>

      {/* Print-friendliness — print as a clean handout. Hairlines collapse,
          backgrounds drop, tables avoid mid-row breaks. */}
      <style>{`
        @media print {
          .addie-security-doc { background: #ffffff !important; color: #000000 !important; }
          .addie-security-doc section { background: #ffffff !important; border-color: #000000 !important; padding-top: 1rem !important; padding-bottom: 1rem !important; }
          .addie-security-doc article { background: #ffffff !important; border-color: #000000 !important; }
          .addie-security-doc table { page-break-inside: avoid; }
          .addie-security-doc tr, .addie-security-doc li { page-break-inside: avoid; }
          .addie-security-doc h1 { font-size: 24pt !important; }
          .addie-security-doc h2 { font-size: 16pt !important; page-break-after: avoid; }
          .addie-security-doc h3 { page-break-after: avoid; }
          .addie-security-doc a { color: #000000 !important; text-decoration: underline; }
          .addie-security-doc svg { max-width: 100% !important; }
        }
      `}</style>
    </main>
  );
}
