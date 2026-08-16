'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { PdfDownloadButton } from '../PdfDownloadButton';
import {
  formatRoiCurrency,
  formatRoiNumber,
  type RoiAssessmentContext,
} from '@/lib/roi/assessment-context';

export function RoiContextPanel({
  roiContext,
}: {
  readonly roiContext: RoiAssessmentContext;
}) {
  return (
    <section className="rounded-[24px] border border-[color:var(--gold)]/35 bg-white p-5 md:p-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
            Your ROI scenario
          </p>
          <h2 className="mt-2 text-[1.5rem] md:text-[2rem] font-semibold leading-tight text-[color:var(--ink)]">
            Keep the value model attached to the readiness work.
          </h2>
          <p className="mt-3 text-[1rem] md:text-[1.0625rem] leading-[1.65] text-[color:var(--slate-600)] max-w-3xl">
            You modeled {formatRoiNumber(roiContext.fte)} employees at{' '}
            {formatRoiCurrency(roiContext.costPerFTE)} loaded cost and{' '}
            {roiContext.loHours}-{roiContext.hiHours} hours per week. The
            assessment below points to the first workflow discipline to improve
            before treating the estimate as achievable.
          </p>
        </div>
        <div className="rounded-[18px] bg-[color:var(--cream)] border border-[color:var(--ink-a10)] p-4 min-w-[240px]">
          <p className="text-[0.6875rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
            Estimated annual capacity
          </p>
          <p className="mt-2 text-[2rem] font-bold tabular-nums text-[color:var(--ink)]">
            {formatRoiCurrency(roiContext.mid)}
          </p>
          <p className="mt-2 text-[0.8125rem] leading-[1.55] text-[color:var(--slate-600)]">
            Range {formatRoiCurrency(roiContext.low)}-{formatRoiCurrency(roiContext.high)} ·{' '}
            {formatRoiNumber(roiContext.hoursPerYear)} hours/year · ~
            {roiContext.payrollRecaptured}% of payroll.
          </p>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- */

export function ResultPrintStyles() {
  return (
    <style jsx global>{`
      @media print {
        @page {
          size: letter;
          margin: 0.55in;
        }

        body {
          background: #ffffff !important;
        }

        main {
          background: #ffffff !important;
          padding: 0 !important;
        }

        [data-print-hide='true'] {
          display: none !important;
        }
      }
    `}</style>
  );
}

export function QuickActionStrip({
  matchedPlaybookPath,
  profileId,
}: {
  readonly matchedPlaybookPath: string;
  readonly profileId: string | null;
}) {
  return (
    <section
      id="download-report"
      className="grid gap-4 rounded-[26px] border border-[color:var(--ink-a10)] bg-white p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6"
      style={{ boxShadow: 'var(--shadow-soft)' }}
      data-print-hide="true"
      aria-label="Recommended next actions"
    >
      <div>
        <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
          Start here
        </p>
        <h2 className="mt-2 text-[1.5rem] md:text-[1.875rem] font-semibold leading-tight text-[color:var(--ink)]">
          Turn the snapshot into one visible next move.
        </h2>
      </div>
      <div className="flex flex-wrap gap-2 md:justify-end">
        <ResultActionLink href={matchedPlaybookPath} variant="ink">
          Open role playbook
        </ResultActionLink>
        {profileId ? (
          <PdfDownloadButton
            profileId={profileId}
            compact
            label="Download report"
          />
        ) : (
          <PrintReportButton compact label="Print report" />
        )}
        <ResultActionLink href="/assessment/in-depth" variant="gold">
          Get 90-day playbook
        </ResultActionLink>
      </div>
    </section>
  );
}

export function PrintReportButton({
  compact = false,
  label,
}: {
  readonly compact?: boolean;
  readonly label: string;
}) {
  const classes = compact
    ? 'inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--ink-a15)] bg-white px-5 py-2.5 text-[0.875rem] font-bold text-[color:var(--ink)] transition-colors hover:bg-[color:var(--cream)]'
    : 'inline-flex min-h-11 items-center justify-center rounded-xl border border-[color:var(--ink-a15)] bg-white px-6 py-3 font-sans text-[0.875rem] font-semibold uppercase tracking-[1.2px] text-[color:var(--ink)] transition-colors hover:bg-[color:var(--cream)]';

  return (
    <button
      type="button"
      data-print-hide="true"
      className={classes}
      onClick={() => window.print()}
    >
      {label}
    </button>
  );
}

export function ResultActionLink({
  href,
  variant,
  fullWidth = false,
  children,
}: {
  readonly href: string;
  readonly variant: 'ink' | 'gold';
  readonly fullWidth?: boolean;
  readonly children: ReactNode;
}) {
  const classes =
    variant === 'ink'
      ? 'bg-[color:var(--ink)] !text-white hover:bg-[color:var(--ink)]/90'
      : 'bg-[color:var(--gold)] !text-[color:var(--ink)] hover:bg-[color:var(--gold-2)]';

  return (
    <Link
      href={href}
      className={`${fullWidth ? 'flex w-full' : 'inline-flex'} min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-center text-[0.875rem] font-bold no-underline transition-colors ${classes}`}
    >
      {children}
    </Link>
  );
}

export function MiniCard({ label, items }: { readonly label: string; readonly items: readonly string[] }) {
  return (
    <div className="bg-[color:var(--cream)] border border-[color:var(--ink-a10)] rounded-[20px] p-5 md:p-6">
      <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
        {label}
      </p>
      <ul className="mt-4 space-y-2 text-[1rem] md:text-[1.0625rem] leading-[1.65] text-[color:var(--slate-700)]">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function TakeawayNum({ n }: { readonly n: number }) {
  return (
    <span className="inline-grid place-items-center w-10 h-10 rounded-[12px] bg-[color:var(--cream)] text-[color:var(--gold-deep)] font-bold text-[0.9375rem]">
      {n}
    </span>
  );
}

export function PartialLockedPhase({
  label,
  title,
  visibleItem,
  lockedItems,
}: {
  readonly label: string;
  readonly title: string;
  readonly visibleItem: string;
  readonly lockedItems: readonly string[];
}) {
  return (
    <div
      className="flex h-full flex-col bg-white border border-[color:var(--ink-a10)] rounded-[24px] p-6 md:p-7"
      style={{ boxShadow: 'var(--shadow-soft)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.75rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--gold-deep)]">
            {label}
          </p>
          <h3 className="mt-3 text-[1.4375rem] font-semibold text-[color:var(--ink)]">
            {title}
          </h3>
        </div>
        <span className="shrink-0 rounded-full border border-[color:var(--ink-a10)] px-3 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[color:var(--slate-500)]">
          Paid
        </span>
      </div>
      <div className="mt-5 bg-[color:var(--cream)] border border-[color:var(--ink-a10)] rounded-[16px] p-4">
        <p className="text-[0.6875rem] uppercase tracking-[0.16em] font-semibold text-[color:var(--gold-deep)]">
          Preview
        </p>
        <p className="text-[1rem] md:text-[1.0625rem] font-semibold text-[color:var(--ink)] leading-[1.5]">
          {visibleItem}
        </p>
      </div>
      <ul className="mt-4 space-y-2.5 text-[0.9375rem] leading-[1.55] text-[color:var(--slate-600)]">
        {lockedItems.map((item, i) => (
          <li key={i} className="flex items-center gap-3 rounded-[14px] border border-[color:var(--ink-a10)] bg-white px-3.5 py-3">
            <span className="rounded-full bg-[color:var(--cream)] px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-[color:var(--gold-deep)]">
              Locked
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto bg-[color:var(--ink)] !text-white rounded-[16px] p-4 text-center">
        <p className="text-[1rem] font-semibold !text-white">Detailed in the In-Depth</p>
        <p className="mt-1.5 text-[0.875rem] !text-white/75">The 8-dimension diagnostic carries this through with deployment specifics.</p>
      </div>
    </div>
  );
}

export function PlaybookCard({
  tag,
  title,
  body,
  href,
  highlight,
}: {
  readonly tag: string;
  readonly title: string;
  readonly body: string;
  readonly href: string;
  readonly highlight?: boolean;
}) {
  return (
    <a
      href={href}
      className={`block bg-white rounded-[20px] p-5 md:p-6 transition-colors hover:bg-[color:var(--cream)] ${
        highlight
          ? 'border-2 border-[color:var(--gold)] shadow-[0_0_0_4px_rgba(200,162,74,0.12)]'
          : 'border border-[color:var(--ink-a10)]'
      }`}
    >
      <span className="inline-flex rounded-full bg-[color:var(--cream)] px-3 py-1.5 text-[0.75rem] font-bold text-[color:var(--gold-deep)] uppercase tracking-[0.1em]">
        {tag}
      </span>
      <h3 className="mt-4 text-[1.3125rem] font-semibold text-[color:var(--ink)]">{title}</h3>
      <p className="mt-2 text-[1rem] text-[color:var(--slate-600)] leading-[1.6]">{body}</p>
    </a>
  );
}
