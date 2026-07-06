import type { CSSProperties } from 'react';
import { PillarTag } from '@/components/lms';
import type { LMSPillar } from '@/components/lms';
import type { ModuleStatus } from '../../_lib/courseProgress';

const FONT_STACK = 'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const KICKER_STYLE: CSSProperties = {
  fontFamily: FONT_STACK,
  fontSize: '0.6875rem',
  fontWeight: 800,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
};

const BUILDER_PATH_BY_MODULE: Record<number, {
  readonly builder: string;
  readonly savedAs: string;
  readonly reusableAs: string;
}> = {
  1: { builder: 'Limits Card Builder', savedAs: 'AI limits card', reusableAs: 'draft/check/decide rule' },
  2: { builder: 'Rewrite Prompt Builder', savedAs: 'rewritten message', reusableAs: 'internal message prompt' },
  3: { builder: 'CORE Prompt Builder', savedAs: 'CORE prompt card', reusableAs: 'reusable prompt structure' },
  4: { builder: 'First Prompt Builder', savedAs: 'first prompt card', reusableAs: 'prompt structure' },
  5: { builder: 'Context Block Builder', savedAs: 'safe context block', reusableAs: 'role context template' },
  6: { builder: 'Output Format Builder', savedAs: 'output template', reusableAs: 'reviewable response format' },
  7: { builder: 'Review Checklist Builder', savedAs: 'AI review checklist', reusableAs: 'review routine' },
  8: { builder: 'Source-Grounded Prompt Builder', savedAs: 'source-grounded prompt', reusableAs: 'document review prompt' },
  9: { builder: 'Prompt Template Builder', savedAs: 'prompt template', reusableAs: 'saved prompt asset' },
  10: { builder: 'Role Prompt Builder', savedAs: 'role prompt card', reusableAs: 'role-specific prompt' },
  11: { builder: 'Use-Case Builder', savedAs: 'use-case card', reusableAs: 'use-case intake template' },
  12: { builder: 'Safe-Use Checklist Builder', savedAs: 'safe-use checklist', reusableAs: 'data boundary template' },
  13: { builder: 'Skill Template Builder', savedAs: 'skill template', reusableAs: 'reusable skill pattern' },
  14: { builder: 'Workflow Map Builder', savedAs: 'workflow map', reusableAs: 'automation-readiness map' },
  15: { builder: 'Review Gate Builder', savedAs: 'human review gate card', reusableAs: 'pre-impact review gate' },
  16: { builder: 'Evidence Note Builder', savedAs: 'AI evidence note', reusableAs: 'review proof template' },
  17: { builder: 'Workflow Kit Builder', savedAs: 'workflow kit', reusableAs: 'team-ready workflow asset' },
  18: { builder: 'Packet Review Builder', savedAs: 'packet summary', reusableAs: 'manager-ready packet' },
};

interface ModuleHeaderCardProps {
  readonly moduleNumber: number;
  readonly titleMain: string;
  readonly titleTail: string | null;
  readonly keyOutput: string;
  readonly goalLine: string;
  readonly estimatedMinutes: number;
  readonly pillarId: LMSPillar['id'];
  readonly status: ModuleStatus;
  readonly statusLabel: string;
  readonly hasLab?: boolean;
  readonly learningPlan?: {
    readonly artifact: string;
    readonly recall: string;
    readonly practice: string;
    readonly feedback: string;
    readonly transfer: string;
  };
}

export function ModuleHeaderCard({
  moduleNumber,
  titleMain,
  titleTail,
  keyOutput,
  goalLine,
  estimatedMinutes,
  pillarId,
  status,
  statusLabel,
}: ModuleHeaderCardProps) {
  const builderPath = BUILDER_PATH_BY_MODULE[moduleNumber] ?? {
    builder: 'Artifact Builder',
    savedAs: keyOutput,
    reusableAs: 'reusable template',
  };

  const moduleTitle = titleTail ? `${titleMain} — ${titleTail}` : titleMain;
  const statusColor = status === 'locked' ? 'var(--slate-500)' : 'var(--gold-deep)';

  return (
    <header
      className="foundation-module-hero"
      style={{
        background: '#fff',
        border: '1px solid var(--ink-a10)',
        borderRadius: 22,
        boxShadow: '0 18px 45px rgba(14, 27, 45, 0.10)',
        fontFamily: FONT_STACK,
        overflow: 'hidden',
      }}
    >
      <div
        className="foundation-module-hero__body"
        style={{
          display: 'grid',
          gap: 22,
          padding: 'clamp(24px, 3vw, 38px)',
        }}
      >
        <div
          className="foundation-module-hero__meta-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <PillarTag pillarId={pillarId} />
            <span
              className="foundation-module-hero__module-label"
              style={{
                ...KICKER_STYLE,
                color: 'var(--slate-600)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <span>Module {String(moduleNumber).padStart(2, '0')}</span>
              <span className="foundation-module-hero__module-title-part"> · {moduleTitle}</span>
            </span>
          </div>
          <span
            className="foundation-module-hero__status"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: statusColor,
              fontSize: '0.6875rem',
              fontWeight: 850,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: status === 'locked' ? 'transparent' : 'var(--gold)',
                border: status === 'locked' ? '1.5px solid var(--slate-400)' : 'none',
                boxShadow: status === 'current' ? '0 0 0 4px var(--gold-a20)' : 'none',
              }}
            />
            {statusLabel}
          </span>
        </div>

        <div
          className="foundation-module-hero__main"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 0.68fr) minmax(260px, 0.32fr)',
            gap: 'clamp(22px, 4vw, 48px)',
            alignItems: 'end',
          }}
        >
          <div>
            <p style={{ ...KICKER_STYLE, margin: '0 0 8px' }}>You will build</p>
            <h1
              className="foundation-module-hero__title"
              style={{
                margin: 0,
                color: 'var(--ink)',
                fontSize: 'clamp(2.25rem, 5vw, 4rem)',
                fontWeight: 850,
                letterSpacing: '-0.04em',
                lineHeight: 0.98,
              }}
            >
              {keyOutput}
            </h1>
            <p
              className="foundation-module-hero__goal"
              style={{
                margin: '14px 0 0',
                maxWidth: 720,
                color: 'var(--slate-600)',
                fontSize: '1.125rem',
                fontWeight: 520,
                lineHeight: 1.5,
              }}
            >
              {goalLine}
            </p>
          </div>

          <dl
            className="foundation-module-hero__facts"
            aria-label="Module facts"
            style={{
              display: 'grid',
              gap: 0,
              margin: 0,
              borderBlock: '1px solid var(--ink-a10)',
            }}
          >
            {[
              ['Time', `${estimatedMinutes} min`],
              ['Build', builderPath.builder],
              ['Save', builderPath.savedAs],
            ].map(([label, value]) => (
              <div
                key={label}
                data-module-fact={label.toLowerCase()}
                className="foundation-module-hero__fact"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '74px minmax(0, 1fr)',
                  gap: 14,
                  padding: '12px 0',
                  borderTop: label === 'Time' ? 'none' : '1px solid var(--ink-a10)',
                }}
              >
                <dt
                  style={{
                    color: 'var(--gold-deep)',
                    fontSize: '0.625rem',
                    fontWeight: 900,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                  }}
                >
                  {label}
                </dt>
                <dd
                  style={{
                    margin: 0,
                    color: 'var(--ink)',
                    fontSize: '0.875rem',
                    fontWeight: 780,
                    lineHeight: 1.25,
                  }}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div
        className="foundation-module-hero__footer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '16px clamp(24px, 3vw, 38px)',
          background: 'var(--cream-2)',
          borderTop: '1px solid var(--ink-a10)',
        }}
      >
        <a
          href="#st-takeaway"
          className="foundation-module-hero__cta"
          style={{
            display: 'inline-flex',
            minHeight: 42,
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
            borderRadius: 12,
            background: 'var(--ink)',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 850,
            letterSpacing: '0.13em',
            textDecoration: 'none',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          Start
        </a>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 980px) {
              .foundation-module-hero__main {
                grid-template-columns: 1fr !important;
              }
              .foundation-module-hero__facts {
                max-width: none !important;
              }
            }
            @media (max-width: 640px) {
              .foundation-module-hero {
                border-radius: 16px !important;
                box-shadow: 0 10px 24px rgba(14, 27, 45, 0.10) !important;
                position: relative !important;
              }
              .foundation-module-hero__body {
                gap: 11px !important;
                padding: 14px 16px 16px !important;
              }
              .foundation-module-hero__meta-row {
                align-items: flex-start !important;
                padding-right: 106px !important;
              }
              .foundation-module-hero__meta-row > div {
                width: 100% !important;
              }
              .foundation-module-hero__status {
                display: none !important;
              }
              .foundation-module-hero__meta-row [class*="pillar"] {
                display: none !important;
              }
              .foundation-module-hero__module-label {
                white-space: normal !important;
                line-height: 1.25 !important;
                font-size: 10px !important;
                letter-spacing: 0.14em !important;
              }
              .foundation-module-hero__module-title-part {
                display: none !important;
              }
              .foundation-module-hero__title {
                font-size: clamp(28px, 8.8vw, 39px) !important;
                line-height: 1.02 !important;
              }
              .foundation-module-hero__goal {
                font-size: 15.5px !important;
                line-height: 1.42 !important;
                margin-top: 8px !important;
              }
              .foundation-module-hero__facts {
                display: grid !important;
                grid-template-columns: 1fr !important;
                gap: 0 !important;
                border-block: 1px solid var(--ink-a10) !important;
              }
              .foundation-module-hero__fact {
                display: grid !important;
                grid-template-columns: 72px minmax(0, 1fr) !important;
                gap: 10px !important;
                align-items: baseline !important;
                min-width: 0 !important;
                padding: 8px 0 !important;
                border: none !important;
                border-top: 1px solid var(--ink-a10) !important;
                border-radius: 0 !important;
                background: transparent !important;
              }
              .foundation-module-hero__fact:first-child {
                border-top: none !important;
              }
              .foundation-module-hero__fact[data-module-fact="save"] {
                display: none !important;
              }
              .foundation-module-hero__fact dt {
                font-size: 9px !important;
                letter-spacing: 0.12em !important;
              }
              .foundation-module-hero__fact dd {
                font-size: 13px !important;
                line-height: 1.22 !important;
              }
              .foundation-module-hero__footer {
                position: absolute !important;
                top: 13px !important;
                right: 16px !important;
                display: block !important;
                padding: 0 !important;
                background: transparent !important;
                border-top: none !important;
              }
              .foundation-module-hero__cta {
                width: auto !important;
                min-height: 34px !important;
                padding: 0 12px !important;
                border-radius: 10px !important;
                font-size: 10px !important;
                letter-spacing: 0.12em !important;
              }
            }
          `,
        }}
      />
    </header>
  );
}
