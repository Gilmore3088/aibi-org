'use client';

import {
  FOUNDATION_FINAL_MODULE_NUMBER,
  getArtifactFirst,
  type Section,
} from '@content/courses/foundation-program';
import {
  getFoundationLabBrief,
  getFoundationRoleTransfer,
  getFoundationWorkedExample,
} from '@content/courses/foundation-program/lab-first';
import { MarkdownRenderer } from '@/components/lms/MarkdownRenderer';
import type { LearnerRole } from '@/types/course';
import { FONT_INTER, eyebrowStyle } from './learn-section/shared';
import { StepNumber } from './learn-section/StepNumber';
import { MemoryCardPanel } from './learn-section/MemoryCardPanel';
import { PacketContinuityPanel } from './learn-section/PacketContinuityPanel';
import { PracticeCoachPanel } from './learn-section/PracticeCoachPanel';
import { QualityGatePanel } from './learn-section/QualityGatePanel';
import { RetrievalWarmupPanel } from './learn-section/RetrievalPanels';
import { SpacedReviewPanel } from './learn-section/SpacedReviewPanel';

interface LearnSectionProps {
  readonly sections: readonly Section[];
  readonly keyTakeaways?: readonly string[];
  readonly moduleNumber: number;
  readonly learnerRole?: LearnerRole;
  /**
   * 'preview' renders the same Understand content on the public Module 1
   * preview: no in-course anchors (the lab/submit tabs don't exist there)
   * and the reference drawer starts open so visitors see real material.
   */
  readonly variant?: 'course' | 'preview';
}

function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function totalReferenceMinutes(sections: readonly Section[]): number {
  return sections.reduce((sum, section) => {
    const subsectionText = section.subsections?.map((sub) => sub.content).join(' ') ?? '';
    return sum + estimateReadingTime(`${section.content} ${subsectionText}`);
  }, 0);
}

function stripMarkdownForPreview(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function previewText(content: string, maxLength = 150): string {
  const firstParagraph =
    content
      .split(/\n{2,}/)
      .map(stripMarkdownForPreview)
      .find(Boolean) ?? stripMarkdownForPreview(content);

  if (firstParagraph.length <= maxLength) {
    return firstParagraph;
  }

  const truncated = firstParagraph.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${truncated.slice(0, lastSpace > 80 ? lastSpace : maxLength).trim()}...`;
}

export function LearnSection({
  sections,
  keyTakeaways,
  moduleNumber,
  learnerRole = 'other',
  variant = 'course',
}: LearnSectionProps) {
  const isPreview = variant === 'preview';
  const brief = getFoundationLabBrief(moduleNumber);
  const currentArtifact = getArtifactFirst(moduleNumber);
  const previousArtifact = moduleNumber > 1 ? getArtifactFirst(moduleNumber - 1) : undefined;
  const olderArtifact = moduleNumber > 2 ? getArtifactFirst(moduleNumber - 2) : undefined;
  const nextArtifact =
    moduleNumber < FOUNDATION_FINAL_MODULE_NUMBER
      ? getArtifactFirst(moduleNumber + 1)
      : undefined;
  const previousBrief = moduleNumber > 1 ? getFoundationLabBrief(moduleNumber - 1) : undefined;
  const olderBrief = moduleNumber > 2 ? getFoundationLabBrief(moduleNumber - 2) : undefined;
  const workedExample = getFoundationWorkedExample(moduleNumber);
  const roleTransfer = getFoundationRoleTransfer(moduleNumber, learnerRole);
  const minutes = totalReferenceMinutes(sections);

  if (!brief) {
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        {sections.map((section) => (
          <details
            key={section.id}
            style={{
              border: '1px solid var(--ink-a10)',
              borderRadius: 16,
              background: 'var(--cream)',
              overflow: 'hidden',
            }}
          >
            <summary
              style={{
                padding: '18px 22px',
                cursor: 'pointer',
                fontFamily: FONT_INTER,
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'var(--ink)',
              }}
            >
              {section.title}
            </summary>
            <div style={{ padding: '0 24px 24px' }}>
              <MarkdownRenderer content={section.content} />
            </div>
          </details>
        ))}
      </div>
    );
  }

  const understandItems = [
    {
      label: 'Guardrail',
      body: currentArtifact?.mustProve ?? brief.qualitySignals[0],
    },
    {
      label: 'Model',
      body: brief.visualModel.join(' -> '),
    },
  ] as const;

  if (moduleNumber > 0) {
    return (
      <div style={{ display: 'grid', gap: 12, fontFamily: FONT_INTER }}>
        <section
          aria-labelledby={`m${moduleNumber}-guided-understand-heading`}
          data-testid="foundation-guided-understand"
          className="foundation-guided-understand"
          style={{
            border: '1px solid var(--ink-a10)',
            borderRadius: 18,
            background: '#fff',
            boxShadow: 'var(--shadow-soft)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              gap: 18,
              alignItems: 'center',
              padding: 'clamp(18px, 2.6vw, 26px)',
            }}
            className="foundation-guided-understand__brief"
          >
            <div>
              <p style={{ ...eyebrowStyle, marginBottom: 8 }}>Start with this</p>
              <h3
                id={`m${moduleNumber}-guided-understand-heading`}
                style={{
                  margin: 0,
                  color: 'var(--ink)',
                  fontSize: 'clamp(1.5rem, 2.4vw, 2.125rem)',
                  lineHeight: 1.08,
                  letterSpacing: '-0.02em',
                  fontWeight: 875,
                }}
              >
                {brief.concept}
              </h3>
            </div>
            {!isPreview && (
              <a
                href="#st-sandbox"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 44,
                  borderRadius: 12,
                  background: 'var(--ink)',
                  color: '#fff',
                  padding: '0 16px',
                  textDecoration: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 875,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                Try it
              </a>
            )}
          </div>

          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${understandItems.length}, minmax(0, 1fr))`,
              gap: 0,
              margin: 0,
              borderTop: '1px solid var(--ink-a10)',
              background: 'var(--cream-2)',
            }}
            className="foundation-guided-understand__facts"
          >
            {understandItems.map((item, index) => (
              <div
                key={item.label}
                style={{
                  padding: '16px 18px',
                  borderLeft: index === 0 ? 'none' : '1px solid var(--ink-a10)',
                }}
              >
                <dt style={{ ...eyebrowStyle, color: index === 0 ? 'var(--gold-deep)' : 'var(--slate-500)', marginBottom: 7 }}>
                  {item.label}
                </dt>
                <dd
                  style={{
                    margin: 0,
                    color: 'var(--ink)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.42,
                    fontWeight: 730,
                  }}
                >
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: workedExample ? 'minmax(0, 1fr) minmax(0, 1fr)' : '1fr',
            gap: 10,
          }}
          className="foundation-guided-understand__drawers"
        >
          {workedExample && (
            <details
              data-testid="foundation-quick-example"
              open
              style={{
                border: '1px solid var(--ink-a10)',
                borderRadius: 14,
                background: 'var(--cream)',
                overflow: 'hidden',
              }}
            >
              <summary
                style={{
                  padding: '15px 18px',
                  cursor: 'pointer',
                  listStyle: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  alignItems: 'baseline',
                }}
              >
                <span style={{ ...eyebrowStyle }}>Example</span>
                <span style={{ color: 'var(--ink)', fontSize: '0.875rem', lineHeight: 1.3, fontWeight: 850 }}>
                  Weak vs. better
                </span>
              </summary>
              <div style={{ borderTop: '1px solid var(--ink-a10)', padding: 18, background: '#fff' }}>
                <p style={{ margin: 0, color: 'var(--slate-600)', fontSize: '0.875rem', lineHeight: 1.45, fontWeight: 650 }}>
                  <strong>{workedExample.weakLabel}:</strong> {workedExample.weak}
                </p>
                <p style={{ margin: '12px 0 0', color: 'var(--ink)', fontSize: '0.875rem', lineHeight: 1.45, fontWeight: 740 }}>
                  <strong>{workedExample.strongLabel}:</strong> {workedExample.strong}
                </p>
              </div>
            </details>
          )}

          <details
            id={`m${moduleNumber}-reference-drawer`}
            data-testid="foundation-reference-drawer"
            className="foundation-reference-drawer"
            open={isPreview || undefined}
            style={{
              border: '1px solid var(--ink-a10)',
              borderRadius: 14,
              background: 'var(--cream)',
              overflow: 'hidden',
            }}
          >
            <summary
              className="foundation-reference-summary"
              style={{
                padding: '15px 18px',
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 12,
                cursor: 'pointer',
                listStyle: 'none',
              }}
            >
              <span style={{ ...eyebrowStyle }}>Reference</span>
              <span style={{ color: 'var(--slate-500)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {minutes} min optional
              </span>
            </summary>
            <div
              data-testid="foundation-reference-map"
              className="foundation-reference-map"
              style={{
                display: 'grid',
                gap: 10,
                borderTop: '1px solid var(--ink-a10)',
                padding: 14,
                background: '#fff',
              }}
            >
              {keyTakeaways && keyTakeaways.length > 0 && (
                <ul style={{ display: 'grid', gap: 7, margin: 0, padding: 0, listStyle: 'none' }}>
                  {keyTakeaways.slice(0, 3).map((item) => (
                    <li key={item} style={{ color: 'var(--ink)', fontSize: '0.875rem', lineHeight: 1.4, fontWeight: 700 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {sections.map((section) => (
                <details
                  key={section.id}
                  style={{
                    borderTop: '1px solid var(--ink-a10)',
                    paddingTop: 10,
                  }}
                >
                  <summary
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1fr) auto',
                      alignItems: 'center',
                      gap: 12,
                      cursor: 'pointer',
                      color: 'var(--ink)',
                      fontSize: '0.9375rem',
                      fontWeight: 850,
                      lineHeight: 1.25,
                    }}
                  >
                    <span>{section.title}</span>
                    <span style={{ color: 'var(--slate-500)', fontSize: '0.6875rem', fontWeight: 850, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      Open
                    </span>
                  </summary>
                  <div style={{ padding: '10px 0 4px' }}>
                    <MarkdownRenderer content={section.content} />
                    {section.tryThis && (
                      <p style={{ margin: '12px 0 0', color: 'var(--ink)', fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 750 }}>
                        Try: {section.tryThis}
                      </p>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </details>
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
              .foundation-guided-understand summary::-webkit-details-marker,
              .foundation-guided-understand__drawers summary::-webkit-details-marker {
                display: none;
              }
              .foundation-guided-understand {
                box-shadow: none !important;
              }
              @media (max-width: 760px) {
                .foundation-guided-understand__brief,
                .foundation-guided-understand__facts,
                .foundation-guided-understand__drawers {
                  grid-template-columns: 1fr !important;
                }
                .foundation-guided-understand__brief a {
                  width: 100% !important;
                }
                .foundation-guided-understand__facts > div {
                  border-left: none !important;
                  border-top: 1px solid var(--ink-a10) !important;
                }
                .foundation-guided-understand__facts > div:first-child {
                  border-top: none !important;
                }
              }
            `,
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 22, fontFamily: FONT_INTER }}>
      <RetrievalWarmupPanel brief={brief} moduleNumber={moduleNumber} />

      {moduleNumber > 1 ? (
        <SpacedReviewPanel
          currentBrief={brief}
          previous={previousArtifact}
          older={olderArtifact}
          previousBrief={previousBrief}
          olderBrief={olderBrief}
          moduleNumber={moduleNumber}
        />
      ) : null}

      <section
        aria-labelledby={`m${moduleNumber}-lab-first-heading`}
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 0.32fr) minmax(0, 1fr)',
          gap: 0,
          border: '1px solid var(--ink-a10)',
          borderRadius: 18,
          overflow: 'hidden',
          background: '#fff',
          boxShadow: 'var(--shadow-soft)',
        }}
        className="foundation-lab-brief"
      >
        <div className="foundation-lab-brief__task" style={{ padding: 'clamp(18px, 2.4vw, 24px)' }}>
          <p style={{ ...eyebrowStyle, marginBottom: 10 }}>Compare model</p>
          <h3
            className="foundation-lab-brief__title"
            id={`m${moduleNumber}-lab-first-heading`}
            style={{
              margin: '0 0 10px',
              color: 'var(--ink)',
              fontSize: 'clamp(1.3125rem, 2vw, 1.75rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              fontWeight: 850,
            }}
          >
            Check your answer against the sequence.
          </h3>
          <p
            style={{
              margin: '0 0 16px',
              color: 'var(--slate-600)',
              fontSize: '0.875rem',
              lineHeight: 1.45,
              fontWeight: 650,
            }}
          >
            Use the model to spot what you missed, then practice with the sample banking data.
          </p>

          <div
            className="foundation-lab-brief__actions"
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              alignItems: 'center',
              marginBottom: 18,
            }}
          >
            <a
              href="#st-sandbox"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 42,
                padding: '10px 16px',
                borderRadius: 999,
                background: 'var(--ink)',
                color: '#fff',
                fontFamily: FONT_INTER,
                fontSize: '0.8125rem',
                fontWeight: 850,
                textDecoration: 'none',
              }}
            >
              Open AiBI Lab
            </a>
            <a
              href="#st-submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 42,
                padding: '10px 16px',
                borderRadius: 999,
                border: '1px solid var(--ink-a10)',
                background: 'var(--cream)',
                color: 'var(--ink)',
                fontFamily: FONT_INTER,
                fontSize: '0.8125rem',
                fontWeight: 850,
                textDecoration: 'none',
              }}
            >
              Submit artifact
            </a>
          </div>
        </div>

        <div
          className="foundation-lab-brief__model"
          style={{
            background: 'var(--cream-2)',
            borderLeft: '1px solid var(--ink-a10)',
            padding: 'clamp(18px, 2.4vw, 24px)',
            display: 'grid',
            alignContent: 'center',
          }}
        >
          <ol
            className="foundation-lab-brief__model-list"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(104px, 1fr))',
              gap: 10,
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {brief.visualModel.map((item, index) => (
              <li
                key={item}
                className="foundation-lab-brief__model-step"
                style={{
                  display: 'grid',
                  gap: 10,
                  alignItems: 'start',
                  padding: '13px 14px',
                  border: '1px solid var(--ink-a10)',
                  borderRadius: 14,
                  background: '#fff',
                  minHeight: 112,
                }}
              >
                <StepNumber index={index} />
                <span style={{ color: 'var(--ink)', fontSize: '0.9375rem', fontWeight: 800, lineHeight: 1.25 }}>
                  {item}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <PracticeCoachPanel
        brief={brief}
        workedExample={workedExample}
        roleTransfer={roleTransfer}
        moduleNumber={moduleNumber}
      />

      <details
        data-testid="foundation-optional-study-aids"
        className="foundation-optional-study-aids"
        style={{
          border: '1px solid var(--ink-a10)',
          borderRadius: 18,
          background: 'var(--cream)',
          overflow: 'hidden',
        }}
      >
        <summary
          style={{
            padding: '16px clamp(18px, 2.4vw, 24px)',
            display: 'flex',
            gap: 14,
            alignItems: 'baseline',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            cursor: 'pointer',
            listStyle: 'none',
          }}
        >
          <div>
            <p className="foundation-drawer-kicker" style={{ ...eyebrowStyle, marginBottom: 6 }}>Optional support</p>
            <h3
              className="foundation-drawer-title"
              style={{
                margin: 0,
                color: 'var(--ink)',
                fontSize: 'clamp(1.1875rem, 1.8vw, 1.5rem)',
                lineHeight: 1.12,
                letterSpacing: '-0.01em',
                fontWeight: 850,
              }}
            >
              Memory card, packet context, and rubric.
            </h3>
          </div>
          <span
            style={{
              color: 'var(--slate-500)',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            Support
          </span>
        </summary>
        <div
          style={{
            display: 'grid',
            gap: 12,
            borderTop: '1px solid var(--ink-a10)',
            padding: '14px clamp(14px, 2vw, 18px) 18px',
          }}
        >
          <MemoryCardPanel
            brief={brief}
            current={currentArtifact}
            moduleNumber={moduleNumber}
          />
          <PacketContinuityPanel
            current={currentArtifact}
            previous={previousArtifact}
            next={nextArtifact}
            moduleNumber={moduleNumber}
          />
          <QualityGatePanel brief={brief} keyTakeaways={keyTakeaways} moduleNumber={moduleNumber} />
        </div>
      </details>

      <section aria-labelledby={`m${moduleNumber}-reference-heading`}>
        <details
          id={`m${moduleNumber}-reference-drawer`}
          data-testid="foundation-reference-drawer"
          className="foundation-reference-drawer"
          style={{
            border: '1px solid var(--ink-a10)',
            borderRadius: 18,
            background: 'var(--cream)',
            overflow: 'hidden',
          }}
        >
          <summary
            className="foundation-reference-summary"
            style={{
              padding: '16px clamp(18px, 2.4vw, 24px)',
              display: 'flex',
              alignItems: 'baseline',
              gap: 12,
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              cursor: 'pointer',
              listStyle: 'none',
            }}
          >
            <h3
              className="foundation-drawer-title"
              id={`m${moduleNumber}-reference-heading`}
              style={{
                margin: 0,
                color: 'var(--ink)',
                fontSize: 'clamp(1.1875rem, 1.8vw, 1.5rem)',
                lineHeight: 1.2,
                fontWeight: 850,
                letterSpacing: '-0.01em',
              }}
            >
              Reference: {brief.referenceLabel}
            </h3>
            <span style={{ color: 'var(--slate-500)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {minutes} min optional
            </span>
          </summary>

          <div
            style={{
              display: 'grid',
              gap: 10,
              borderTop: '1px solid var(--ink-a10)',
              padding: '14px clamp(14px, 2vw, 18px) 18px',
            }}
          >
            {sections.length > 0 && (
              <div
                data-testid="foundation-reference-map"
                className="foundation-reference-map"
                style={{
                  display: 'grid',
                  gap: 12,
                  border: '1px solid var(--ink-a10)',
                  borderRadius: 16,
                  background: '#fff',
                  padding: '16px clamp(16px, 2vw, 20px)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 16,
                    alignItems: 'baseline',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <p style={{ ...eyebrowStyle, marginBottom: 6 }}>Reference map</p>
                    <h4
                      style={{
                        margin: 0,
                        color: 'var(--ink)',
                        fontSize: 'clamp(1.125rem, 1.6vw, 1.375rem)',
                        lineHeight: 1.15,
                        fontWeight: 850,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      Open only what helps your lab work.
                    </h4>
                  </div>
                  <span
                    style={{
                      color: 'var(--slate-500)',
                      fontSize: '0.75rem',
                      lineHeight: 1.2,
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Targeted study
                  </span>
                </div>

                <ol
                  style={{
                    display: 'grid',
                    gap: 0,
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                  }}
                >
                  {sections.map((section, index) => {
                    const sectionMinutes = estimateReadingTime(
                      `${section.content} ${section.subsections?.map((sub) => sub.content).join(' ') ?? ''}`,
                    );
                    return (
                      <li
                        key={section.id}
                        className="foundation-reference-map__item"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(0, 0.58fr) minmax(220px, 0.42fr)',
                          gap: 18,
                          padding: '14px 0',
                          borderTop: index === 0 ? 'none' : '1px solid var(--ink-a10)',
                        }}
                      >
                        <div>
                          <p style={{ ...eyebrowStyle, color: 'var(--slate-500)', marginBottom: 6 }}>
                            {String(index + 1).padStart(2, '0')} · {sectionMinutes} min
                          </p>
                          <h5
                            style={{
                              margin: '0 0 7px',
                              color: 'var(--ink)',
                              fontSize: '1rem',
                              lineHeight: 1.25,
                              fontWeight: 850,
                            }}
                          >
                            {section.title}
                          </h5>
                          <p style={{ margin: 0, color: 'var(--slate-600)', fontSize: '0.875rem', lineHeight: 1.45, fontWeight: 650 }}>
                            {previewText(section.content)}
                          </p>
                        </div>
                        <div
                          style={{
                            borderLeft: '1px solid var(--ink-a10)',
                            paddingLeft: 18,
                          }}
                          className="foundation-reference-map__practice"
                        >
                          <p style={{ ...eyebrowStyle, color: 'var(--gold-deep)', marginBottom: 6 }}>
                            Practice hook
                          </p>
                          <p style={{ margin: 0, color: 'var(--ink)', fontSize: '0.875rem', lineHeight: 1.45, fontWeight: 750 }}>
                            {section.tryThis
                              ? previewText(section.tryThis, 130)
                              : 'Open if you need more detail before the lab.'}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            {sections.map((section, index) => {
              const sectionMinutes =
                estimateReadingTime(
                  `${section.content} ${section.subsections?.map((sub) => sub.content).join(' ') ?? ''}`,
                );
              return (
                <details
                  key={section.id}
                  style={{
                    border: '1px solid var(--ink-a10)',
                    borderRadius: 16,
                    background: '#fff',
                    overflow: 'hidden',
                  }}
                >
                  <summary
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto minmax(0, 1fr) auto',
                      alignItems: 'center',
                      gap: 12,
                      padding: '16px 20px',
                      cursor: 'pointer',
                      color: 'var(--ink)',
                      fontSize: '1rem',
                      fontWeight: 800,
                      lineHeight: 1.3,
                    }}
                  >
                    <span style={{ color: 'var(--gold-deep)', fontVariantNumeric: 'tabular-nums', fontSize: '0.75rem' }}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>{section.title}</span>
                    <span
                      style={{
                        color: 'var(--slate-500)',
                        fontSize: '0.6875rem',
                        fontWeight: 750,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {sectionMinutes} min
                    </span>
                  </summary>
                  <div style={{ padding: '0 22px 24px', color: 'var(--ink)' }}>
                    <MarkdownRenderer content={section.content} />

                    {section.tryThis && (
                      <aside
                        aria-label="Try this practice prompt"
                        style={{
                          marginTop: 18,
                          borderLeft: '3px solid var(--gold)',
                          background: 'var(--cream-2)',
                          padding: '14px 18px',
                          borderTopRightRadius: 12,
                          borderBottomRightRadius: 12,
                        }}
                      >
                        <p style={{ ...eyebrowStyle, marginBottom: 8 }}>Try this</p>
                        <p style={{ margin: 0, color: 'var(--ink)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                          {section.tryThis}
                        </p>
                      </aside>
                    )}

                    {section.subsections && section.subsections.length > 0 && (
                      <div style={{ marginTop: 24, display: 'grid', gap: 20 }}>
                        {section.subsections.map((sub) => (
                          <section key={sub.id}>
                            <h4 style={{ margin: '0 0 10px', color: 'var(--ink)', fontSize: '1rem', fontWeight: 800 }}>
                              {sub.title}
                            </h4>
                            <MarkdownRenderer content={sub.content} />
                          </section>
                        ))}
                      </div>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        </details>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            [data-testid="foundation-packet-continuity"] summary::-webkit-details-marker {
              display: none;
            }
            [data-testid="foundation-optional-study-aids"] summary::-webkit-details-marker,
            [data-testid="foundation-reference-drawer"] summary::-webkit-details-marker {
              display: none;
            }
            @media (max-width: 640px) {
              .foundation-lab-brief {
                border-radius: 18px !important;
                box-shadow: none !important;
              }
              .foundation-lab-brief__task,
              .foundation-lab-brief__model {
                padding: 16px !important;
              }
              .foundation-lab-brief__title {
                font-size: 25px !important;
                line-height: 1.08 !important;
                margin-bottom: 12px !important;
              }
              .foundation-lab-brief__actions {
                margin: 0 0 12px !important;
                display: grid !important;
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                gap: 8px !important;
              }
              .foundation-lab-brief__actions a {
                min-height: 44px !important;
                padding: 9px 8px !important;
                font-size: 12px !important;
              }
              .foundation-lab-brief__model-list {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                gap: 8px !important;
              }
              .foundation-lab-brief__model-step {
                align-items: flex-start !important;
                gap: 8px !important;
                padding: 10px !important;
                border: 1px solid var(--ink-a10) !important;
                border-radius: 12px !important;
                background: #fff !important;
                min-height: 86px !important;
              }
              .foundation-lab-brief__model-step span:last-child {
                font-size: 13px !important;
                line-height: 1.2 !important;
              }
              .foundation-step-number {
                width: 22px !important;
                height: 22px !important;
                font-size: 10px !important;
              }
              .foundation-retrieval-bridge__label {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                gap: 10px !important;
                padding: 10px 12px !important;
              }
              .foundation-retrieval-bridge__label p {
                font-size: 10px !important;
                letter-spacing: 0.13em !important;
              }
              .foundation-retrieval-bridge__label h3 {
                font-size: 13px !important;
              }
              .foundation-retrieval-bridge__prompt {
                padding: 12px !important;
              }
              .foundation-retrieval-bridge__prompt p:first-child {
                font-size: 10px !important;
                letter-spacing: 0.13em !important;
              }
              .foundation-retrieval-bridge__body {
                display: -webkit-box !important;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
              }
              .foundation-retrieval-bridge__use {
                display: none !important;
              }
              .foundation-optional-study-aids > summary,
              .foundation-reference-drawer > summary {
                padding: 10px 12px !important;
                display: grid !important;
                grid-template-columns: minmax(0, 1fr) auto !important;
                gap: 8px !important;
                align-items: center !important;
              }
              .foundation-optional-study-aids > summary h3,
              .foundation-reference-drawer > summary h3 {
                display: none !important;
              }
              .foundation-reference-map {
                padding: 14px !important;
              }
              .foundation-reference-map__item {
                grid-template-columns: 1fr !important;
                gap: 10px !important;
              }
              .foundation-reference-map__practice {
                border-left: none !important;
                border-top: 1px solid var(--ink-a10) !important;
                padding-left: 0 !important;
                padding-top: 10px !important;
              }
              .foundation-drawer-kicker {
                margin-bottom: 0 !important;
                font-size: 10px !important;
                letter-spacing: 0.13em !important;
              }
              .foundation-reference-summary::before {
                content: 'Reference';
                font-family: ${FONT_INTER};
                font-size: 10px;
                font-weight: 800;
                letter-spacing: 0.13em;
                text-transform: uppercase;
                color: var(--gold-deep);
              }
              .foundation-practice-coach__header {
                padding: 14px !important;
                gap: 12px !important;
              }
              .foundation-practice-coach__header h3 {
                font-size: 18px !important;
                line-height: 1.12 !important;
              }
              .foundation-practice-coach__tabs {
                grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                gap: 6px !important;
              }
              .foundation-practice-coach__tabs button {
                padding: 9px 6px !important;
                font-size: 11px !important;
                border-radius: 10px !important;
              }
              .foundation-practice-coach__cue {
                grid-template-columns: 1fr !important;
                gap: 8px !important;
                padding: 12px !important;
              }
              .foundation-practice-coach__cue > span {
                justify-self: start !important;
              }
              .foundation-practice-coach__footer {
                grid-template-columns: 1fr !important;
                gap: 10px !important;
                padding: 12px !important;
              }
              .foundation-practice-coach__footer-actions {
                justify-content: stretch !important;
              }
              .foundation-practice-coach__footer-actions > * {
                flex: 1 1 100%;
                min-height: 44px !important;
              }
              .foundation-readiness-check__action {
                display: grid !important;
                grid-template-columns: 1fr !important;
              }
              .foundation-readiness-check__action > a,
              .foundation-readiness-check__action > button {
                width: 100% !important;
              }
              .foundation-memory-card {
                grid-template-columns: 1fr !important;
                border-radius: 14px !important;
              }
              .foundation-memory-card__intro,
              .foundation-memory-card__body {
                padding: 16px !important;
              }
              .foundation-memory-card__items {
                grid-template-columns: 1fr !important;
                gap: 8px !important;
              }
              .foundation-memory-card__item {
                min-height: auto !important;
                grid-template-columns: 76px minmax(0, 1fr) !important;
                gap: 8px !important;
                padding: 11px 12px !important;
              }
              .foundation-memory-card__footer {
                grid-template-columns: 1fr !important;
              }
              .foundation-memory-card__footer button {
                width: 100% !important;
              }
              .foundation-spaced-review {
                grid-template-columns: 1fr !important;
                border-radius: 14px !important;
              }
              .foundation-spaced-review__intro,
              .foundation-spaced-review__body {
                padding: 16px !important;
              }
              .foundation-spaced-review__intro {
                border-right: none !important;
                border-bottom: 1px solid var(--ink-a10) !important;
              }
              .foundation-spaced-review__items,
              .foundation-spaced-review__footer {
                grid-template-columns: 1fr !important;
              }
              .foundation-spaced-review__item {
                min-height: auto !important;
              }
              .foundation-spaced-review__footer button {
                width: 100% !important;
              }
              .foundation-retrieval-warmup {
                border-radius: 14px !important;
              }
              .foundation-retrieval-warmup > div:first-child {
                display: none !important;
              }
              .foundation-retrieval-warmup > div:last-child {
                padding: 16px !important;
              }
              .foundation-retrieval-warmup textarea {
                min-height: 68px !important;
              }
            }
            @media (max-width: 900px) {
              .foundation-lab-brief,
              .foundation-practice-coach__header,
              .foundation-continuity__grid,
              .foundation-worked-example__grid,
              .foundation-readiness-check,
              .foundation-readiness-check__buttons,
              .foundation-retrieval-bridge,
              .foundation-role-transfer,
              .foundation-role-transfer__items,
              .foundation-retrieval-warmup,
              .foundation-spaced-review,
              .foundation-spaced-review__items,
              .foundation-spaced-review__footer,
              .foundation-self-explanation,
              .foundation-self-explanation__buttons,
              .foundation-quality-gate,
              .foundation-quality-gate__tabs {
                grid-template-columns: 1fr !important;
              }
              .foundation-practice-coach__footer {
                grid-template-columns: 1fr !important;
              }
              .foundation-practice-coach__tabs {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              }
              .foundation-lab-brief > div:last-child {
                border-left: none !important;
                border-top: 1px solid var(--ink-a10);
              }
              .foundation-continuity__grid > div {
                border-left: none !important;
                border-top: 1px solid var(--ink-a10);
              }
              .foundation-continuity__grid > div:first-child {
                border-top: none !important;
              }
              .foundation-worked-example__grid > div {
                border-left: none !important;
                border-top: 1px solid var(--ink-a10);
              }
              .foundation-worked-example__grid > div:first-child {
                border-top: none !important;
              }
              .foundation-readiness-check > div:last-child {
                border-left: none !important;
                border-top: 1px solid var(--ink-a10);
              }
              .foundation-retrieval-bridge__use {
                border-left: none !important;
                border-top: 1px solid var(--ink-a10) !important;
              }
              .foundation-spaced-review__intro {
                border-right: none !important;
                border-bottom: 1px solid var(--ink-a10) !important;
              }
              .foundation-role-transfer > div:first-child {
                border-right: none !important;
                border-bottom: 1px solid var(--ink-a10);
              }
              .foundation-role-transfer__items > div {
                border-left: none !important;
                border-top: 1px solid var(--ink-a10);
              }
              .foundation-role-transfer__items > div:first-child {
                border-top: none !important;
              }
              .foundation-role-transfer__item {
                grid-template-columns: 1fr !important;
                gap: 8px !important;
              }
              .foundation-self-explanation > div:first-child {
                border-right: none !important;
                border-bottom: 1px solid var(--ink-a10);
              }
              .foundation-quality-gate > div:first-child {
                border-right: none !important;
                border-bottom: 1px solid var(--ink-a10);
              }
            }
          `,
        }}
      />
    </div>
  );
}
