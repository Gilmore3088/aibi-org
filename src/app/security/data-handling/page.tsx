import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { MockupShell } from '@/components/mockup';
import { BRAND } from '@content/copy';

export const metadata: Metadata = {
  title: 'LLM Data Handling — The AI Banking Institute',
  description:
    'How AiBI course labs and Toolbox features handle prompts, AI providers, PII checks, usage logs, and saved artifacts.',
  alternates: { canonical: '/security/data-handling' },
};

const REVIEW_DATE = 'June 23, 2026';

const DATA_FLOW = [
  {
    title: 'Practice data',
    body:
      'Public previews and course examples use synthetic or sanitized banking scenarios. The course does not require customer records to complete the labs.',
  },
  {
    title: 'Provider calls',
    body:
      'When AiBI Lab or Toolbox runs an AI response, the prompt, system instructions, and conversation context are sent to the selected provider for that response.',
  },
  {
    title: 'Blocked inputs',
    body:
      'Server-side checks block common PII patterns and prompt-injection attempts before a request reaches a model. Injection blocks cannot be overridden.',
  },
  {
    title: 'Stored records',
    body:
      'The app stores account data, assessment responses, course progress, saved artifacts, support cases, and usage metadata needed to operate the product.',
  },
] as const;

const NEVER_ENTER = [
  'Customer or member PII, account numbers, SSNs, dates of birth, addresses, or phone numbers.',
  'Non-public examination material, credentials, secrets, internal system details, or confidential vendor records.',
  'Unredacted complaints, loan files, BSA/AML case files, or transaction records from your institution.',
  'Anything your institution has not approved for the selected AI tool and use case.',
] as const;

const PROVIDERS = [
  {
    name: 'Anthropic',
    tier: 'Commercial API',
    stance:
      'Commercial terms state that Anthropic may not train models on Customer Content from the Services.',
    href: 'https://www.anthropic.com/legal/commercial-terms',
  },
  {
    name: 'OpenAI',
    tier: 'API Platform',
    stance:
      'OpenAI states API inputs and outputs are not used to train models by default and may be retained up to 30 days for service and abuse monitoring, except where a different endpoint or feature applies.',
    href: 'https://openai.com/enterprise-privacy/',
  },
  {
    name: 'Google Gemini',
    tier: 'Gemini API paid services',
    stance:
      'Google states paid Gemini API prompts and responses are not used to improve products; prompts and responses may be logged for a limited period for safety, security, and required disclosures.',
    href: 'https://ai.google.dev/gemini-api/terms',
  },
] as const;

const RETENTION_ROWS = [
  {
    record: 'Assessment resume drafts',
    window: 'Deleted after 30 days',
  },
  {
    record: 'Raw prompt text in AI usage logs',
    window: 'Never stored — metadata only',
  },
  {
    record: 'OpenAI API inputs and outputs',
    window: 'Retained by OpenAI up to 30 days for abuse monitoring, then deleted (per provider terms)',
  },
  {
    record: 'Account, assessment, enrollment, certificate, saved-artifact, support, and payment records',
    window: 'Kept while needed to provide the product, operate support, handle disputes, and satisfy tax or legal obligations',
  },
  {
    record: 'Institution rollouts',
    window: 'Stricter retention or deletion expectations can be defined before seats are assigned',
  },
] as const;

const OPERATING_POSTURE = [
  {
    title: 'Usage and PII audit logs',
    body:
      'AI usage logs store user id or hashed IP, feature, provider/model, token and cost totals, status/error state, timestamps, and non-content PII flag/override metadata when applicable. They intentionally do not store raw prompt text or matched PII values.',
  },
  {
    title: 'Subprocessors and residency',
    body:
      'Core application data is stored in Supabase and Vercel-hosted application infrastructure. Email is sent through Resend. Payments run through Stripe. Model requests may route to Anthropic, OpenAI, or Google Gemini depending on the feature and model selected. Residency follows those providers and configured services; AiBI does not currently offer a self-serve single-region residency guarantee.',
  },
  {
    title: 'DPA and SOC 2 posture',
    body:
      'AiBI does not currently claim SOC 2, ISO 27001, FedRAMP, GLBA, or other third-party security certification status. For institution rollouts, request a security packet or DPA review before seats are assigned; provider SOC 2 reports should not be treated as AiBI certification.',
  },
  {
    title: 'PII warning overrides',
    body:
      'Paid Toolbox flows may let a learner confirm that a PII warning is from fabricated sample data and send anyway. Prompt-injection blocks cannot be overridden. A confirmed send records non-content audit metadata; it does not store the prompt text or matched value in the usage log.',
  },
] as const;

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 12,
};

const cardStyle: CSSProperties = {
  background: '#fff',
  border: '1px solid var(--slate-200)',
  borderRadius: 'var(--r-lg)',
  padding: '16px 18px',
  boxShadow: 'var(--shadow-soft)',
};

const cardTitleStyle: CSSProperties = {
  display: 'block',
  color: 'var(--ink)',
  fontSize: '0.875rem',
  fontWeight: 800,
  lineHeight: 1.35,
};

const cardBodyStyle: CSSProperties = {
  margin: '8px 0 0',
  color: 'var(--slate-600)',
  fontSize: '0.8125rem',
  fontWeight: 500,
  lineHeight: 1.45,
};

function DataFlowGrid() {
  return (
    <div style={gridStyle}>
      {DATA_FLOW.map((item) => (
        <div key={item.title} style={cardStyle}>
          <strong style={cardTitleStyle}>{item.title}</strong>
          <p style={cardBodyStyle}>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function NeverEnterList() {
  return (
    <div style={gridStyle}>
      {NEVER_ENTER.map((item) => (
        <div key={item} style={cardStyle}>{item}</div>
      ))}
    </div>
  );
}

function ProviderGrid() {
  return (
    <div style={gridStyle}>
      {PROVIDERS.map((provider) => (
        <div key={provider.name} style={cardStyle}>
          <strong style={cardTitleStyle}>{provider.name}</strong>
          <p style={cardBodyStyle}>{provider.tier}</p>
          <p style={cardBodyStyle}>{provider.stance}</p>
          <p style={cardBodyStyle}>
            <a href={provider.href} style={{ color: 'var(--gold-deep)', fontWeight: 800 }}>
              Provider terms
            </a>
          </p>
        </div>
      ))}
    </div>
  );
}

function RetentionTable() {
  return (
    <div
      data-testid="retention-table"
      style={{ ...cardStyle, padding: 0, overflowX: 'auto', marginBottom: 12 }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.8125rem',
          lineHeight: 1.45,
        }}
      >
        <caption
          style={{
            textAlign: 'left',
            padding: '14px 18px 0',
            color: 'var(--ink)',
            fontSize: '0.875rem',
            fontWeight: 800,
          }}
        >
          Retention at a glance
        </caption>
        <thead>
          <tr>
            <th scope="col" style={{ textAlign: 'left', padding: '12px 18px 8px', color: 'var(--slate-500)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Record
            </th>
            <th scope="col" style={{ textAlign: 'left', padding: '12px 18px 8px', color: 'var(--slate-500)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              How long it is kept
            </th>
          </tr>
        </thead>
        <tbody>
          {RETENTION_ROWS.map((row) => (
            <tr key={row.record} style={{ borderTop: '1px solid var(--slate-200)' }}>
              <th scope="row" style={{ textAlign: 'left', padding: '10px 18px', color: 'var(--ink)', fontWeight: 700, verticalAlign: 'top' }}>
                {row.record}
              </th>
              <td style={{ padding: '10px 18px', color: 'var(--slate-600)', fontWeight: 500, verticalAlign: 'top' }}>
                {row.window}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OperatingPostureGrid() {
  return (
    <div style={gridStyle}>
      {OPERATING_POSTURE.map((item) => (
        <div key={item.title} style={cardStyle}>
          <strong style={cardTitleStyle}>{item.title}</strong>
          <p style={cardBodyStyle}>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

export default function DataHandlingPage() {
  return (
    <MockupShell
      activePath="/security"
      eyebrow="Security · Data handling"
      title={<>What happens when a learner uses AI.</>}
      lede={
        <>
          This is the plain-language data posture for AiBI Lab and Toolbox
          features. It is not a replacement for your institution&apos;s AI policy;
          it tells IT, InfoSec, risk, and compliance what the product is designed
          to do.
        </>
      }
      heroActions={[
        { label: 'View security page', href: '/security', variant: 'gold' },
        { label: 'IT review packet', href: '/security/it-approval', variant: 'ghost-dark' },
      ]}
      sections={[
        {
          kicker: 'Product posture',
          heading: <>Synthetic-first practice. Provider calls only when AI runs.</>,
          lede: (
            <>
              Static pages, previews, and course reading do not call AI models.
              AI calls occur only inside authenticated lab or Toolbox actions that
              run a model response.
            </>
          ),
          body: <DataFlowGrid />,
        },
        {
          kicker: 'Do not enter',
          heading: <>The course is designed so customer data is not needed.</>,
          lede: (
            <>
              Learners should use sample facts, redacted facts, or institution-approved
              non-sensitive inputs. The product adds server checks, but those checks are
              not a substitute for institutional data-classification rules.
            </>
          ),
          body: <NeverEnterList />,
          surface: 'white',
        },
        {
          kicker: 'Provider stance',
          heading: <>Provider terms are reviewed, but the safest rule is still no PII.</>,
          lede: (
            <>
              AiBI uses paid API paths for learner-facing model calls. Provider
              terms were last checked on {REVIEW_DATE}; terms can change, so this
              page is a control surface, not a permanent guarantee.
            </>
          ),
          body: <ProviderGrid />,
        },
        {
          kicker: 'AiBI operating posture',
          heading: <>Retention, subprocessors, residency, and override handling.</>,
          lede: (
            <>
              Formal due diligence should separate provider terms from AiBI&apos;s
              own operating posture. These are the current boundaries reviewers
              should use before approving an institution rollout.
            </>
          ),
          body: (
            <>
              <RetentionTable />
              <OperatingPostureGrid />
            </>
          ),
          surface: 'white',
        },
        {
          kicker: 'Human review',
          heading: <>AI output is a draft until a banker owns it.</>,
          lede: (
            <>
              The course teaches named human review before an output affects a
              customer, control, report, filing, disclosure, policy, or regulated
              decision. Saved artifacts should document the tool, input boundary,
              reviewer, and reuse rule.
            </>
          ),
          surface: 'white',
        },
      ]}
      ctaBand={{
        heading: <>Need a direct answer for IT or risk?</>,
        body: (
          <>
            Email {BRAND.emails.contact}. For institution rollouts, the Institute can
            scope the approved tool path and data boundary before seats are assigned.
          </>
        ),
        actions: [
          { label: 'IT review packet', href: '/security/it-approval', variant: 'gold' },
          { label: 'For institutions', href: '/for-institutions', variant: 'ghost-dark' },
        ],
      }}
    />
  );
}
