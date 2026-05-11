import { LedgerArticle } from '@/components/ledger';

export const metadata = {
  title: 'AI Use Disclaimer | The AI Banking Institute',
};

export default function AIUseDisclaimerPage() {
  return (
    <LedgerArticle eyebrow="AI Use" title={<>AI use <em>disclaimer.</em></>}>
      <p>
        AI outputs can be incomplete, inaccurate, fabricated, biased, or
        inappropriate for regulated banking use. Every output should be reviewed
        by a qualified human before use.
      </p>

      <div
        style={{
          borderLeft: '2px solid var(--terra)',
          paddingLeft: 22,
          margin: '1.6em 0',
        }}
      >
        <h2 style={{ marginTop: 0 }}>The SAFE rule</h2>
        <ul>
          <li>
            <strong>S</strong>trip sensitive data before prompting.
          </li>
          <li>
            <strong>A</strong>sk clearly with role, task, format, and
            constraints.
          </li>
          <li>
            <strong>F</strong>act-check claims, citations, numbers, and policy
            language.
          </li>
          <li>
            <strong>E</strong>scalate credit, legal, compliance, PII, and
            customer-impacting decisions.
          </li>
        </ul>
      </div>

      <p>
        Do not paste customer PII, account numbers, customer financial records,
        credit decision details, SAR-related information, legal conclusions, or
        highly restricted institution data into public AI tools.
      </p>
    </LedgerArticle>
  );
}
