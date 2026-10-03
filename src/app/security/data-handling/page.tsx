import type { Metadata } from 'next';
import { ArrowGlyph, Button, SiteHeader } from '@/components/mockup';
import { AxHero, AxSection, AxWindow } from '@/components/ax';
import { BRAND } from '@content/copy';

export const metadata: Metadata = {
  title: 'LLM Data Handling — The AI Banking Institute',
  description:
    'How AiBI course labs and Toolbox features handle prompts, AI providers, PII checks, usage logs, and saved artifacts.',
  alternates: { canonical: '/security/data-handling' },
};

const REVIEW_DATE = 'June 23, 2026';

const NEVER_ENTER = [
  { title: 'Customer or member PII', detail: 'Account numbers, SSNs, dates of birth, addresses, phone numbers.' },
  { title: 'Confidential bank material', detail: 'Non-public exam material, credentials, secrets, internal system details, vendor records.' },
  { title: 'Case files', detail: 'Unredacted complaints, loan files, BSA/AML cases, transaction records.' },
  { title: 'Anything not approved', detail: 'If your institution has not approved the tool and use case, it does not go in.' },
] as const;

const FLOW = [
  { k: '01', title: 'Learner prompt', note: 'Synthetic or redacted practice data. No customer records needed.' },
  { k: '02', title: 'Server check', note: 'Common PII patterns and prompt injection are blocked before any model sees them.' },
  { k: '03', title: 'Provider, paid API', note: 'Anthropic, OpenAI or Google Gemini, depending on the feature.' },
  { k: '04', title: 'Draft back to the learner', note: 'A person reviews it before it is used.' },
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

export default function DataHandlingPage() {
  return (
    <div className="mockup-scope ax-page">
      <SiteHeader activePath="/security" />

      <AxHero
        cmd="security --data-handling"
        title="What happens when a learner uses AI."
        lede="The data posture for AiBI Lab and Toolbox, written for IT, InfoSec, risk and compliance. It does not replace your institution's AI policy."
        actions={
          <>
            <Button variant="gold" size="lg" href="/security/it-approval">
              IT review packet <ArrowGlyph />
            </Button>
            <Button variant="ghost-dark" size="lg" href="/security">
              Security overview
            </Button>
          </>
        }
        aside={
          <AxWindow title="one AI request" meta="data flow">
            <ol className="dh-flow">
              {FLOW.map((step) => (
                <li key={step.k}>
                  <span className="dh-flow-k">{step.k}</span>
                  <span>
                    <strong>{step.title}</strong>
                    <span>{step.note}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="dh-flow-log">Usage log: metadata only. No prompt text, no matched PII values.</p>
          </AxWindow>
        }
      />

      <main>
        <AxSection light id="never" kicker="Never paste" title="The course never needs customer data.">
          <ul className="dh-never">
            {NEVER_ENTER.map((item) => (
              <li key={item.title}>
                <span className="dh-x" aria-hidden="true">✕</span>
                <span>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </AxSection>

        <AxSection id="providers" kicker={`Provider terms · checked ${REVIEW_DATE}`} title="Paid API paths only.">
          <div className="dh-providers">
            {PROVIDERS.map((provider) => (
              <a key={provider.name} className="dh-provider" href={provider.href}>
                <span className="ax-k ax-gold">{provider.tier}</span>
                <strong>{provider.name}</strong>
                <span>{provider.stance}</span>
                <span className="dh-provider-link">
                  Provider terms <span aria-hidden="true">→</span>
                </span>
              </a>
            ))}
          </div>
        </AxSection>

        <AxSection light id="posture" kicker="AiBI operating posture" title="What we keep, and for how long.">
          <div className="dh-posture">
            <div data-testid="retention-table" className="dh-table">
              <table>
                <caption>Retention at a glance</caption>
                <thead>
                  <tr>
                    <th scope="col">Record</th>
                    <th scope="col">How long it is kept</th>
                  </tr>
                </thead>
                <tbody>
                  {RETENTION_ROWS.map((row) => (
                    <tr key={row.record}>
                      <th scope="row">{row.record}</th>
                      <td>{row.window}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="dh-details">
              {OPERATING_POSTURE.map((item) => (
                <details key={item.title}>
                  <summary>{item.title}</summary>
                  <p>{item.body}</p>
                </details>
              ))}
            </div>
          </div>
        </AxSection>
      </main>

      <section className="ax-section ax-light is-paper ax-close">
        <div className="mk-container">
          <h2 className="ax-display">
            Need a direct answer for <span className="ax-gold">IT or risk?</span>
          </h2>
          <p className="ax-muted">Email {BRAND.emails.contact}. For rollouts, we scope the tool path and data boundary before seats are assigned.</p>
          <div className="ax-actions" style={{ justifyContent: 'center' }}>
            <Button variant="gold" size="lg" href="/security/it-approval">
              IT review packet
            </Button>
            <Button variant="ghost-dark" size="lg" href="/for-institutions">
              For institutions
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
