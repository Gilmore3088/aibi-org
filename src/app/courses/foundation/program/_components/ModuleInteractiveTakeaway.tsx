'use client';

import { INTER_STACK as FONT_STACK } from '@/lib/ui/fonts';
import { MicroModuleTakeawayBuilder } from './module-interactive-takeaway/MicroModuleTakeawayBuilder';
import type { ModuleInteractiveTakeawayProps } from './module-interactive-takeaway/types';

export function ModuleInteractiveTakeaway({
  moduleNumber,
  moduleId,
  artifactLabel,
}: ModuleInteractiveTakeawayProps) {
  return (
    <MicroModuleTakeawayBuilder
      moduleNumber={moduleNumber}
      moduleId={moduleId}
      artifactLabel={artifactLabel}
    />
  );
}

export function ModuleInteractiveTakeawayStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          .foundation-interactive-takeaway {
            display: grid;
            gap: 18px;
            margin: 0 0 18px;
            border: 1px solid var(--ink-a10);
            border-radius: 18px;
            background: #fff;
            box-shadow: var(--shadow-soft);
            overflow: hidden;
            font-family: ${FONT_STACK};
          }
          .foundation-interactive-takeaway__head {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 18px;
            align-items: start;
            padding: clamp(18px, 2.4vw, 24px);
            background: var(--cream-2);
            border-bottom: 1px solid var(--ink-a10);
          }
          .foundation-interactive-takeaway__head h3 {
            margin: 0;
            color: var(--ink);
            font-size: clamp(24px, 2.4vw, 34px);
            line-height: 1.05;
            font-weight: 850;
            letter-spacing: 0;
          }
          .foundation-interactive-takeaway__head p:last-child {
            margin: 8px 0 0;
            color: var(--slate-600);
            font-size: 15px;
            line-height: 1.45;
            font-weight: 650;
            max-width: 62ch;
          }
          .foundation-interactive-takeaway__eyebrow,
          .foundation-tool-panel__label {
            margin: 0 0 8px;
            color: var(--gold-deep);
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.17em;
            text-transform: uppercase;
          }
          .foundation-interactive-score,
          .foundation-safety-verdict {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 38px;
            border-radius: 999px;
            padding: 0 14px;
            background: var(--ink);
            color: #fff;
            font-size: 12px;
            font-weight: 850;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            white-space: nowrap;
          }
          .foundation-core-builder__workspace,
          .foundation-safety-check__workspace {
            display: grid;
            grid-template-columns: minmax(260px, 0.38fr) minmax(0, 0.62fr);
            gap: 18px;
            padding: 0 clamp(18px, 2.4vw, 24px);
          }
          .foundation-email-rewrite__workspace {
            display: grid;
            grid-template-columns: minmax(220px, 0.28fr) minmax(240px, 0.32fr) minmax(0, 0.4fr);
            gap: 14px;
            padding: 0 clamp(18px, 2.4vw, 24px);
          }
          .foundation-claim-review__workspace {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
            padding: 0 clamp(18px, 2.4vw, 24px);
          }
          .foundation-tool-choice__workspace {
            display: grid;
            grid-template-columns: minmax(230px, 0.34fr) minmax(0, 0.66fr);
            gap: 16px;
            padding: 0 clamp(18px, 2.4vw, 24px);
          }
          .foundation-structured-builder__workspace {
            display: grid;
            grid-template-columns: minmax(220px, 0.28fr) minmax(240px, 0.32fr) minmax(0, 0.4fr);
            gap: 14px;
            padding: 0 clamp(18px, 2.4vw, 24px);
          }
          .foundation-structured-builder__moves {
            display: grid;
            gap: 10px;
            align-content: start;
          }
          .foundation-structured-preview-list {
            display: grid;
            gap: 9px;
            margin: 0;
            padding: 0;
            list-style: none;
          }
          .foundation-structured-preview-list li {
            display: grid;
            gap: 3px;
            border: 1px solid var(--ink-a10);
            border-radius: 12px;
            background: #fff;
            padding: 10px 12px;
          }
          .foundation-structured-preview-list li[data-active="false"] {
            background: var(--cream);
            opacity: 0.78;
          }
          .foundation-structured-preview-list strong {
            color: var(--ink);
            font-size: 13px;
            line-height: 1.22;
            font-weight: 850;
          }
          .foundation-structured-preview-list span {
            color: var(--slate-600);
            font-size: 12.5px;
            line-height: 1.35;
            font-weight: 650;
          }
          .foundation-tool-choice__queue {
            display: grid;
            gap: 9px;
            align-content: start;
          }
          .foundation-tool-choice__queue-item {
            display: grid;
            grid-template-columns: 34px minmax(0, 1fr);
            gap: 10px;
            align-items: start;
            border: 1px solid var(--ink-a10);
            border-radius: 14px;
            background: #fff;
            padding: 11px 12px;
            color: var(--ink);
            text-align: left;
            cursor: pointer;
            font-family: ${FONT_STACK};
          }
          .foundation-tool-choice__queue-item[aria-pressed="true"] {
            border-color: var(--ink);
            background: var(--ink);
            color: #fff;
          }
          .foundation-tool-choice__queue-item span {
            display: grid;
            width: 30px;
            height: 30px;
            place-items: center;
            border-radius: 999px;
            background: var(--cream);
            color: var(--gold-deep);
            font-size: 11px;
            font-weight: 900;
          }
          .foundation-tool-choice__queue-item[aria-pressed="true"] span {
            background: var(--gold);
            color: var(--ink);
          }
          .foundation-tool-choice__queue-item strong {
            color: inherit;
            font-size: 13px;
            line-height: 1.25;
            font-weight: 850;
          }
          .foundation-tool-choice__queue-item small {
            grid-column: 2;
            color: inherit;
            opacity: 0.72;
            font-size: 11px;
            line-height: 1.2;
            font-weight: 750;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
          .foundation-tool-choice__decision {
            display: grid;
            gap: 12px;
            align-content: start;
          }
          .foundation-tool-choice__decision h4 {
            margin: 0;
            color: var(--ink);
            font-size: clamp(22px, 2vw, 30px);
            line-height: 1.08;
            font-weight: 850;
            letter-spacing: 0;
          }
          .foundation-tool-choice__options {
            display: grid;
            grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.75fr);
            gap: 12px;
          }
          .foundation-tool-choice__button-grid {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 7px;
          }
          .foundation-tool-choice__button-grid--zones {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .foundation-core-builder__toggles {
            display: grid;
            gap: 10px;
          }
          .foundation-core-toggle,
          .foundation-takeaway-toggle {
            display: grid;
            gap: 6px;
            border: 1px solid var(--ink-a10);
            border-radius: 14px;
            background: var(--cream);
            padding: 13px 14px;
            text-align: left;
            color: var(--ink);
            cursor: pointer;
            font-family: ${FONT_STACK};
          }
          .foundation-core-toggle[aria-pressed="true"],
          .foundation-takeaway-toggle[aria-pressed="true"] {
            background: var(--ink);
            color: #fff;
            border-color: var(--ink);
          }
          .foundation-core-toggle span,
          .foundation-takeaway-toggle span {
            font-size: 14px;
            font-weight: 850;
            line-height: 1.2;
          }
          .foundation-core-toggle small,
          .foundation-takeaway-toggle small {
            color: inherit;
            opacity: 0.76;
            font-size: 12px;
            line-height: 1.35;
            font-weight: 650;
          }
          .foundation-takeaway-move-grid {
            display: grid;
            gap: 10px;
          }
          .foundation-core-builder__preview {
            display: grid;
            gap: 12px;
          }
          .foundation-tool-panel {
            border: 1px solid var(--ink-a10);
            border-radius: 16px;
            background: #fff;
            padding: 16px;
            color: var(--ink);
          }
          .foundation-tool-panel pre {
            white-space: pre-wrap;
            margin: 0;
            color: var(--ink);
            font-family: ${FONT_STACK};
            font-size: 14px;
            line-height: 1.5;
            font-weight: 700;
          }
          .foundation-claim-card {
            display: grid;
            gap: 12px;
            border: 1px solid var(--ink-a10);
            border-radius: 16px;
            background: #fff;
            padding: 16px;
            min-width: 0;
          }
          .foundation-claim-card h4 {
            margin: 0;
            color: var(--ink);
            font-size: 17px;
            line-height: 1.25;
            font-weight: 850;
            letter-spacing: 0;
          }
          .foundation-claim-card__choices {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 7px;
          }
          .foundation-claim-choice {
            min-height: 38px;
            border: 1px solid var(--ink-a10);
            border-radius: 10px;
            background: var(--cream);
            color: var(--ink);
            font-family: ${FONT_STACK};
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            cursor: pointer;
          }
          .foundation-claim-choice[aria-pressed="true"] {
            background: var(--ink);
            color: #fff;
            border-color: var(--ink);
          }
          .foundation-tool-panel > p:last-child,
          .foundation-safety-rewrite p:last-child,
          .foundation-safety-scan-text {
            margin: 0;
            color: var(--ink);
            font-size: 15px;
            line-height: 1.55;
            font-weight: 680;
          }
          .foundation-tool-panel--good {
            border-color: rgba(4, 120, 87, 0.36);
            background: #ecfdf5;
          }
          .foundation-tool-panel--warn {
            border-color: var(--gold-a40);
            background: var(--cream);
          }
          .foundation-tool-panel--bad {
            border-color: rgba(185, 28, 28, 0.2);
            background: #fff7f7;
          }
          .foundation-interactive-takeaway--micro {
            border-radius: 16px;
          }
          .foundation-micro-builder {
            display: grid;
            grid-template-columns: minmax(0, 1.05fr) minmax(280px, 0.95fr);
            gap: 16px;
            padding: 0 clamp(18px, 2.4vw, 24px);
          }
          .foundation-micro-builder__steps {
            display: grid;
            gap: 10px;
          }
          .foundation-micro-builder__steps button {
            display: grid;
            grid-template-columns: 92px minmax(0, 1fr);
            gap: 14px;
            align-items: start;
            width: 100%;
            min-height: 70px;
            text-align: left;
            border: 1px solid var(--ink-a10);
            border-radius: 14px;
            background: var(--cream);
            padding: 14px;
            color: var(--ink);
            font-family: ${FONT_STACK};
            cursor: pointer;
          }
          .foundation-micro-builder__steps button.is-active {
            border-color: var(--gold);
            background: var(--gold-a10);
          }
          .foundation-micro-builder__steps button span,
          .foundation-micro-builder__preview > div span,
          .foundation-micro-builder__preview li span {
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--gold-deep);
          }
          .foundation-micro-builder__steps button strong {
            font-size: 15px;
            line-height: 1.4;
            font-weight: 760;
            color: var(--ink);
          }
          .foundation-micro-builder__preview {
            display: grid;
            align-content: start;
            gap: 12px;
            border: 1px solid var(--ink-a10);
            border-radius: 16px;
            background: #fff;
            padding: 18px;
          }
          .foundation-micro-builder__preview h4 {
            margin: 0;
            font-size: clamp(20px, 2vw, 26px);
            line-height: 1.1;
            color: var(--ink);
            letter-spacing: 0;
          }
          .foundation-micro-builder__preview p {
            margin: 0;
            color: var(--slate-600);
            font-size: 15px;
            line-height: 1.5;
            font-weight: 620;
          }
          .foundation-micro-builder__preview ul {
            display: grid;
            gap: 10px;
            padding: 0;
            margin: 0;
            list-style: none;
          }
          .foundation-micro-builder__preview li,
          .foundation-micro-builder__preview > div {
            display: grid;
            gap: 5px;
            border-top: 1px solid var(--ink-a10);
            padding-top: 10px;
            color: var(--ink);
            font-size: 14px;
            line-height: 1.45;
            font-weight: 680;
          }
          .foundation-interactive-takeaway__footer {
            display: grid;
            grid-template-columns: auto minmax(0, 1fr);
            gap: 14px;
            align-items: center;
            padding: 0 clamp(18px, 2.4vw, 24px) clamp(18px, 2.4vw, 24px);
          }
          .foundation-interactive-takeaway__footer button {
            min-height: 44px;
            border: 1px solid var(--ink);
            border-radius: 12px;
            background: var(--ink);
            color: #fff;
            padding: 0 18px;
            font-family: ${FONT_STACK};
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            cursor: pointer;
          }
          .foundation-interactive-takeaway__footer button:disabled {
            border-color: var(--ink-a10);
            background: var(--slate-100);
            color: var(--slate-500);
            cursor: not-allowed;
          }
          .foundation-interactive-takeaway__footer p {
            margin: 0;
            color: var(--slate-600);
            font-size: 13px;
            line-height: 1.4;
            font-weight: 650;
          }
          .foundation-safety-check__samples {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            padding: 0 clamp(18px, 2.4vw, 24px);
          }
          .foundation-safety-check__samples button {
            border: 1px solid var(--ink-a10);
            border-radius: 999px;
            background: var(--cream);
            color: var(--ink);
            padding: 9px 13px;
            font-family: ${FONT_STACK};
            font-size: 12px;
            font-weight: 800;
            cursor: pointer;
          }
          .foundation-safety-check__input {
            display: grid;
            gap: 8px;
          }
          .foundation-safety-check__input span {
            color: var(--gold-deep);
            font-size: 11px;
            font-weight: 850;
            letter-spacing: 0.17em;
            text-transform: uppercase;
          }
          .foundation-safety-check__input textarea {
            width: 100%;
            resize: vertical;
            border: 1px solid var(--ink-a10);
            border-radius: 16px;
            background: #fff;
            color: var(--ink);
            padding: 14px;
            font-family: ${FONT_STACK};
            font-size: 15px;
            line-height: 1.5;
            outline-color: var(--gold-deep);
          }
          .foundation-safety-verdict--green {
            background: #047857;
          }
          .foundation-safety-verdict--yellow {
            background: var(--gold);
            color: var(--ink);
          }
          .foundation-safety-verdict--red {
            background: #991b1b;
          }
          .foundation-safety-highlight {
            border-radius: 5px;
            padding: 1px 3px;
            font-weight: 850;
          }
          .foundation-safety-highlight--pii {
            background: #fee2e2;
            color: #7f1d1d;
          }
          .foundation-safety-highlight--action {
            background: #fef3c7;
            color: #713f12;
          }
          .foundation-safety-highlight--send {
            background: #dbeafe;
            color: #1e3a8a;
          }
          .foundation-safety-issues {
            display: grid;
            gap: 8px;
            margin: 14px 0;
          }
          .foundation-safety-issues div {
            display: grid;
            gap: 3px;
            border: 1px solid var(--ink-a10);
            border-radius: 12px;
            background: var(--cream-2);
            padding: 10px 12px;
          }
          .foundation-safety-issues strong {
            color: var(--ink);
            font-size: 13px;
            line-height: 1.25;
          }
          .foundation-safety-issues span {
            color: var(--slate-600);
            font-size: 12px;
            line-height: 1.35;
            font-weight: 650;
          }
          .foundation-safety-rewrite {
            border-top: 1px solid var(--ink-a10);
            padding-top: 13px;
          }
          @media (max-width: 860px) {
            .foundation-interactive-takeaway__head,
            .foundation-core-builder__workspace,
            .foundation-email-rewrite__workspace,
            .foundation-claim-review__workspace,
            .foundation-tool-choice__workspace,
            .foundation-structured-builder__workspace,
            .foundation-micro-builder,
            .foundation-safety-check__workspace,
            .foundation-interactive-takeaway__footer {
              grid-template-columns: 1fr;
            }
            .foundation-micro-builder__steps button {
              grid-template-columns: 1fr;
            }
            .foundation-tool-choice__options,
            .foundation-tool-choice__button-grid {
              grid-template-columns: 1fr;
            }
            .foundation-interactive-score,
            .foundation-safety-verdict {
              justify-self: start;
            }
            .foundation-interactive-takeaway__footer button {
              width: 100%;
            }
          }
        `,
      }}
    />
  );
}
