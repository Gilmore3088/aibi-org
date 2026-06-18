'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { Section, SectionHead } from '@/components/mockup';

type UseCase = {
  readonly title: string;
  readonly desc: string;
  readonly artifact: string;
  readonly risk: 'high' | 'med' | 'low';
};

type Step = {
  readonly step: string;
  readonly title: string;
  readonly desc: string;
  readonly artifact: string;
};

type Asset = {
  readonly name: string;
  readonly type: string;
  readonly statusLabel: string;
  readonly href?: string;
  readonly linkable: boolean;
};

interface PlaybookTabsProps {
  readonly usesHeading: string;
  readonly useCases: readonly UseCase[];
  readonly opKicker: string;
  readonly opHeading: string;
  readonly steps: readonly Step[];
  readonly checklist: readonly string[];
  readonly assets: readonly Asset[];
}

const TABS = ['Use cases', 'Workflow', 'Checklist', 'Assets'] as const;
type Tab = (typeof TABS)[number];

const TAB_IDS: Record<Tab, string> = {
  'Use cases': 'use-cases',
  Workflow: 'workflow',
  Checklist: 'checklist',
  Assets: 'assets',
};

export function PlaybookTabs({
  usesHeading,
  useCases,
  opKicker,
  opHeading,
  steps,
  checklist,
  assets,
}: PlaybookTabsProps) {
  const [active, setActive] = useState<Tab>('Use cases');
  const id = useId();

  return (
    <Section variant="std" surface="cream">
      <div className="mk-pb-tabs">
        <div className="mk-pb-tabs-head">
          <SectionHead
            kicker="Role path"
            heading={<>One playbook. Four working views.</>}
            lede={<>Scan the role map first, then open the view you need.</>}
          />
          <div className="mk-pb-tablist" role="tablist" aria-label="Playbook sections">
            {TABS.map((tab) => (
              <button
                key={tab}
                id={`${id}-${TAB_IDS[tab]}-tab`}
                type="button"
                role="tab"
                aria-selected={active === tab}
                aria-controls={`${id}-${TAB_IDS[tab]}-panel`}
                className={active === tab ? 'is-active' : undefined}
                onClick={() => setActive(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div
          id={`${id}-${TAB_IDS[active]}-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-${TAB_IDS[active]}-tab`}
          className="mk-pb-tabpanel"
        >
          {active === 'Use cases' && (
            <>
              <SectionHead
                kicker="Use-case map"
                heading={<>{usesHeading}</>}
                lede={<>Each row pairs the work, the risk, and the artifact to keep.</>}
              />
              <div className="mk-pb-swimlane">
                {useCases.map((useCase, idx) => (
                  <article key={useCase.title}>
                    <div className="mk-pb-lane-num">{String(idx + 1).padStart(2, '0')}</div>
                    <div>
                      <h3>{useCase.title}</h3>
                      <p>{useCase.desc}</p>
                    </div>
                    <span className={`mk-risk is-${useCase.risk}`}>
                      {useCase.risk.toUpperCase()} risk
                    </span>
                    <div className="mk-pb-lane-artifact">
                      <span>Artifact</span>
                      {useCase.artifact}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {active === 'Workflow' && (
            <>
              <SectionHead kicker={opKicker} heading={<>{opHeading}</>} />
              <ol className="mk-pb-workflow">
                {steps.map((step) => (
                  <li key={step.step}>
                    <span className="mk-pb-lane-num">{step.step}</span>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                    <div className="mk-pb-lane-artifact">
                      <span>Artifact produced</span>
                      {step.artifact}
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}

          {active === 'Checklist' && (
            <>
              <SectionHead kicker="Review checklist" heading={<>Before AI output is used.</>} />
              <div className="mk-pb-check-grid">
                {checklist.map((line) => (
                  <div key={line}>
                    <span aria-hidden="true">✓</span>
                    {line}
                  </div>
                ))}
              </div>
            </>
          )}

          {active === 'Assets' && (
            <>
              <SectionHead
                kicker="Toolbox assets"
                heading={<>The playbook ships real tools.</>}
                lede={<>Open the usable artifacts first. Draft assets stay visible as coming soon.</>}
              />
              <div className="mk-pb-asset-grid">
                {assets.map((asset) => {
                  const body = (
                    <>
                      <span className={`mk-risk is-${asset.linkable ? 'low' : 'med'}`}>
                        {asset.statusLabel}
                      </span>
                      <h3>{asset.name}</h3>
                      <p>{asset.type}</p>
                    </>
                  );
                  return asset.linkable && asset.href ? (
                    <Link key={asset.name} href={asset.href}>
                      {body}
                    </Link>
                  ) : (
                    <div key={asset.name} aria-disabled="true">
                      {body}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </Section>
  );
}
