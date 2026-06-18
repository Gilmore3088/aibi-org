import type { ReactNode } from 'react';

export interface ArticleVisualSummaryItem {
  readonly label: string;
  readonly body: ReactNode;
}

export function ArticleVisualSummary({
  eyebrow,
  title,
  items,
  metric,
}: {
  readonly eyebrow: string;
  readonly title: ReactNode;
  readonly items: readonly ArticleVisualSummaryItem[];
  readonly metric?: { readonly value: string; readonly label: string };
}) {
  return (
    <aside className="mk-proof-summary" aria-label={eyebrow}>
      <div className="mk-proof-summary-main">
        <p className="mk-proof-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <div className="mk-proof-summary-items">
        {metric && (
          <div className="mk-proof-metric">
            <span>{metric.value}</span>
            <p>{metric.label}</p>
          </div>
        )}
        {items.map((item) => (
          <div key={item.label} className="mk-proof-summary-item">
            <p className="mk-proof-item-label">{item.label}</p>
            <div>{item.body}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export interface RiskMatrixRow {
  readonly label: string;
  readonly risk: ReactNode;
  readonly action: ReactNode;
  readonly meta?: string;
  readonly tone?: 'high' | 'med' | 'low';
}

export function RiskMatrix({
  eyebrow,
  title,
  rows,
}: {
  readonly eyebrow: string;
  readonly title: ReactNode;
  readonly rows: readonly RiskMatrixRow[];
}) {
  return (
    <section className="mk-risk-matrix" aria-label={eyebrow}>
      <div className="mk-risk-matrix-head">
        <p className="mk-proof-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <div className="mk-risk-matrix-grid">
        {rows.map((row, idx) => (
          <article key={row.label} className="mk-risk-row">
            <div className="mk-risk-row-num">{String(idx + 1).padStart(2, '0')}</div>
            <div>
              <h3>{row.label}</h3>
              {row.meta && <p className="mk-risk-row-meta">{row.meta}</p>}
            </div>
            <div className="mk-risk-row-cell">
              <span className={`mk-risk is-${row.tone ?? 'med'}`}>Risk</span>
              <p>{row.risk}</p>
            </div>
            <div className="mk-risk-row-cell">
              <span className="mk-risk is-low">Action</span>
              <p>{row.action}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export interface DocumentPreviewSection {
  readonly heading: string;
  readonly lines: readonly ReactNode[];
}

export function DocumentPreview({
  eyebrow,
  title,
  dek,
  sections,
  aside,
}: {
  readonly eyebrow: string;
  readonly title: ReactNode;
  readonly dek?: ReactNode;
  readonly sections: readonly DocumentPreviewSection[];
  readonly aside?: ReactNode;
}) {
  return (
    <section className="mk-document-preview" aria-label={eyebrow}>
      <div className="mk-document-sheet">
        <div className="mk-document-sheet-head">
          <p className="mk-proof-eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          {dek && <p>{dek}</p>}
        </div>
        <div className="mk-document-sections">
          {sections.map((section, idx) => (
            <section key={section.heading} className="mk-document-section">
              <div className="mk-document-section-num">
                {String(idx + 1).padStart(2, '0')}
              </div>
              <div>
                <h3>{section.heading}</h3>
                <ul>
                  {section.lines.map((line, lineIdx) => (
                    <li key={`${section.heading}-${lineIdx}`}>{line}</li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </div>
      {aside && <aside className="mk-document-aside">{aside}</aside>}
    </section>
  );
}

export interface WorkflowMapStep {
  readonly step: string;
  readonly title: string;
  readonly body: ReactNode;
  readonly artifact?: string;
}

export function WorkflowMap({
  eyebrow,
  title,
  steps,
}: {
  readonly eyebrow: string;
  readonly title: ReactNode;
  readonly steps: readonly WorkflowMapStep[];
}) {
  return (
    <section className="mk-workflow-map" aria-label={eyebrow}>
      <div className="mk-workflow-head">
        <p className="mk-proof-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <ol className="mk-workflow-steps">
        {steps.map((step) => (
          <li key={step.step}>
            <span className="mk-workflow-step-num">{step.step}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
            {step.artifact && (
              <div className="mk-workflow-artifact">
                <span>Artifact</span>
                {step.artifact}
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

export interface FAQAccordionItem {
  readonly q: string;
  readonly a: ReactNode;
}

export interface FAQAccordionGroup {
  readonly kicker: string;
  readonly heading: ReactNode;
  readonly items: readonly FAQAccordionItem[];
}

export function FAQAccordion({ groups }: { readonly groups: readonly FAQAccordionGroup[] }) {
  return (
    <div className="mk-faq-accordion">
      {groups.map((group) => (
        <section key={group.kicker} className="mk-faq-group">
          <div className="mk-faq-group-head">
            <p className="mk-proof-eyebrow">{group.kicker}</p>
            <h2>{group.heading}</h2>
          </div>
          <div className="mk-faq-list">
            {group.items.map((item, idx) => (
              <details key={item.q} className="mk-faq-item" open={idx === 0}>
                <summary>{item.q}</summary>
                <div className="mk-faq-answer">{item.a}</div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
