'use client';

import { useState } from 'react';
import type {
  FoundationLabBrief,
  FoundationRoleTransfer,
  FoundationWorkedExample,
} from '@content/courses/foundation-program/lab-first';
import { KnowledgeCheck } from '../KnowledgeCheck';
import { FONT_INTER, eyebrowStyle } from './shared';
import { ReadinessCheckPanel } from './ReadinessCheckPanel';
import { RoleTransferPanel } from './RoleTransferPanel';
import { SelfExplanationPanel, WorkedExamplePanel } from './WorkedExamplePanel';

export function PracticeCoachPanel({
  brief,
  workedExample,
  roleTransfer,
  moduleNumber,
}: {
  readonly brief: FoundationLabBrief;
  readonly workedExample: FoundationWorkedExample | undefined;
  readonly roleTransfer: FoundationRoleTransfer | undefined;
  readonly moduleNumber: number;
}) {
  type CoachTab = {
    readonly id: string;
    readonly label: string;
    readonly cue: string;
  };
  const tabs: readonly CoachTab[] = [
    { id: 'decide', label: 'Decide', cue: 'Make one safe-use decision before seeing the worked example.' },
    ...(workedExample
      ? [
          { id: 'contrast', label: 'Contrast', cue: 'Now study one weak-vs-strong example and compare it to your decision.' },
          { id: 'explain', label: 'Explain', cue: 'Name why the stronger version works so the rule sticks.' },
        ]
      : []),
    ...(roleTransfer
      ? [{ id: 'transfer', label: 'Use at work', cue: 'Connect the pattern to work from your role.' }]
      : []),
    { id: 'ready', label: 'Ready', cue: 'Check whether you can produce the artifact without rereading.' },
  ];
  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);
  const [visitedTabs, setVisitedTabs] = useState<ReadonlySet<string>>(() => new Set([tabs[0].id]));
  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === active.id));
  const previousTab = activeIndex > 0 ? tabs[activeIndex - 1] : undefined;
  const nextTab = activeIndex < tabs.length - 1 ? tabs[activeIndex + 1] : undefined;
  const visitedCount = tabs.filter((tab) => visitedTabs.has(tab.id)).length;

  function openTab(tabId: string) {
    setActiveTab(tabId);
    setVisitedTabs((previous) => {
      const next = new Set(previous);
      next.add(tabId);
      return next;
    });
  }

  return (
    <section
      aria-labelledby={`m${moduleNumber}-practice-coach-heading`}
      data-testid="foundation-practice-coach"
      style={{
        display: 'grid',
        gap: 12,
      }}
    >
      <div
        style={{
          border: '1px solid var(--ink-a10)',
          borderRadius: 18,
          background: 'var(--cream)',
          padding: '18px clamp(20px, 2.6vw, 26px)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 0.72fr) minmax(320px, 0.28fr)',
          gap: 18,
          alignItems: 'end',
        }}
        className="foundation-practice-coach__header"
      >
        <div>
          <p style={{ ...eyebrowStyle, marginBottom: 8 }}>Practice coach</p>
          <h3
            id={`m${moduleNumber}-practice-coach-heading`}
            style={{
              margin: 0,
              color: 'var(--ink)',
              fontSize: 'clamp(1.3125rem, 2vw, 1.75rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              fontWeight: 850,
            }}
          >
            Make a decision, compare the example, then use the lab.
          </h3>
        </div>
        <div
          role="tablist"
          aria-label="Practice coach views"
          className="foundation-practice-coach__tabs"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
            gap: 8,
          }}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === active.id;
            const isVisited = visitedTabs.has(tab.id);
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`m${moduleNumber}-coach-${tab.id}`}
                id={`m${moduleNumber}-coach-${tab.id}-tab`}
                onClick={() => openTab(tab.id)}
                style={{
                  border: '1px solid',
                  borderColor: isActive ? 'var(--ink)' : 'var(--ink-a10)',
                  borderRadius: 12,
                  background: isActive ? 'var(--ink)' : isVisited ? 'var(--cream)' : '#fff',
                  color: isActive ? '#fff' : 'var(--ink)',
                  padding: '11px 10px',
                  minHeight: 44,
                  fontFamily: FONT_INTER,
                  fontSize: '0.8125rem',
                  lineHeight: 1.15,
                  fontWeight: 850,
                  cursor: 'pointer',
                  boxShadow: isVisited && !isActive ? 'inset 0 -3px 0 var(--gold-a20)' : 'none',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="foundation-practice-coach__cue"
        aria-live="polite"
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto minmax(0, 1fr) auto',
          gap: 12,
          alignItems: 'center',
          border: '1px solid var(--ink-a10)',
          borderRadius: 16,
          background: '#fff',
          padding: '12px 14px',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 32,
            padding: '0 11px',
            borderRadius: 999,
            background: 'var(--ink)',
            color: '#fff',
            fontSize: '0.625rem',
            fontWeight: 900,
            letterSpacing: '0.13em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          Rep {activeIndex + 1}/{tabs.length}
        </span>
        <p style={{ margin: 0, color: 'var(--ink)', fontSize: '0.875rem', lineHeight: 1.35, fontWeight: 760 }}>
          {active.cue}
        </p>
        <span
          style={{
            color: 'var(--slate-500)',
            fontSize: '0.625rem',
            fontWeight: 850,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {visitedCount}/{tabs.length} opened
        </span>
      </div>

      <div
        id={`m${moduleNumber}-coach-${active.id}`}
        role="tabpanel"
        aria-labelledby={`m${moduleNumber}-coach-${active.id}-tab`}
      >
        {active.id === 'contrast' && workedExample ? (
          <WorkedExamplePanel example={workedExample} moduleNumber={moduleNumber} />
        ) : null}
        {active.id === 'explain' && workedExample ? (
          <SelfExplanationPanel brief={brief} example={workedExample} moduleNumber={moduleNumber} />
        ) : null}
        {active.id === 'decide' ? (
          <section data-testid="foundation-decision-drill">
            <KnowledgeCheck
              kicker="Decision drill"
              prompt={brief.decisionDrill.prompt}
              options={brief.decisionDrill.options}
              transferCue={brief.learningLoop.transferPrompt}
              nextHref="#st-sandbox"
            />
          </section>
        ) : null}
        {active.id === 'transfer' && roleTransfer ? (
          <RoleTransferPanel transfer={roleTransfer} moduleNumber={moduleNumber} />
        ) : null}
        {active.id === 'ready' ? (
          <ReadinessCheckPanel brief={brief} moduleNumber={moduleNumber} />
        ) : null}
      </div>

      <div
        className="foundation-practice-coach__footer"
        aria-label="Practice coach progress"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: 12,
          alignItems: 'center',
          border: '1px solid var(--ink-a10)',
          borderRadius: 16,
          background: '#fff',
          padding: '12px 14px',
        }}
      >
        <p
          aria-live="polite"
          style={{
            margin: 0,
            color: 'var(--slate-500)',
            fontSize: '0.875rem',
            lineHeight: 1.3,
            fontWeight: 750,
          }}
        >
          Step {activeIndex + 1} of {tabs.length} · {visitedCount}/{tabs.length} opened
        </p>
        <div
          className="foundation-practice-coach__footer-actions"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          {previousTab ? (
            <button
              type="button"
              onClick={() => openTab(previousTab.id)}
              style={{
                minHeight: 44,
                border: '1px solid var(--ink-a10)',
                borderRadius: 12,
                background: 'var(--cream)',
                color: 'var(--ink)',
                padding: '0 16px',
                fontFamily: FONT_INTER,
                fontSize: '0.875rem',
                lineHeight: 1.1,
                fontWeight: 850,
                cursor: 'pointer',
              }}
            >
              Back
            </button>
          ) : null}
          {nextTab ? (
            <button
              type="button"
              onClick={() => openTab(nextTab.id)}
              style={{
                minHeight: 44,
                border: '1px solid var(--ink)',
                borderRadius: 12,
                background: 'var(--ink)',
                color: '#fff',
                padding: '0 18px',
                fontFamily: FONT_INTER,
                fontSize: '0.875rem',
                lineHeight: 1.1,
                fontWeight: 850,
                cursor: 'pointer',
              }}
            >
              Next: {nextTab.label}
            </button>
          ) : (
            <a
              href="#st-sandbox"
              style={{
                minHeight: 44,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--ink)',
                borderRadius: 12,
                background: 'var(--ink)',
                color: '#fff',
                padding: '0 18px',
                fontFamily: FONT_INTER,
                fontSize: '0.875rem',
                lineHeight: 1.1,
                fontWeight: 850,
                textDecoration: 'none',
              }}
            >
              Open AiBI Lab
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
