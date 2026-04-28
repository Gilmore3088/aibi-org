'use client';

// ROICalculatorBody — inputs + result block with no surrounding chrome.
// Used by the homepage ROICalculator and by the standalone workbook page
// at /for-institutions/samples/efficiency-ratio-workbook. The math matches
// the calcROI() spec in CLAUDE.md.

import { useMemo, useState } from 'react';

function calcROI(inputs: {
  fte: number;
  costPerFTE: number;
  loHours: number;
  hiHours: number;
}): {
  readonly mid: number;
  readonly low: number;
  readonly high: number;
  readonly hoursPerYear: number;
  readonly payrollRecaptured: string;
} {
  const { fte, costPerFTE, loHours, hiHours } = inputs;
  const hourlyRate = costPerFTE / 2080;
  const midHours = (loHours + hiHours) / 2;
  const totalPayroll = fte * costPerFTE;
  const midAnnual = fte * midHours * hourlyRate * 50;
  return {
    mid: midAnnual,
    low: fte * loHours * hourlyRate * 50,
    high: fte * hiHours * hourlyRate * 50,
    hoursPerYear: Math.round(fte * midHours * 50),
    payrollRecaptured:
      totalPayroll > 0 ? ((midAnnual / totalPayroll) * 100).toFixed(1) : '0.0',
  };
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ??
  'https://calendly.com/aibi/executive-briefing';

interface ROICalculatorBodyProps {
  readonly ctaLabel?: string;
  readonly ctaHref?: string;
}

export function ROICalculatorBody({
  ctaLabel = 'Request Executive Briefing',
  ctaHref = CALENDLY_URL,
}: ROICalculatorBodyProps = {}) {
  const [fte, setFte] = useState(50);
  const [costPerFTE, setCostPerFTE] = useState(85_000);
  const [loHours, setLoHours] = useState(2);
  const [hiHours, setHiHours] = useState(5);

  const result = useMemo(
    () => calcROI({ fte, costPerFTE, loHours, hiHours }),
    [fte, costPerFTE, loHours, hiHours]
  );

  return (
    <div className="border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-8 md:p-10">
      <div className="space-y-6">
        <Slider
          label="Full-time employees"
          value={fte}
          min={5}
          max={500}
          step={5}
          onChange={setFte}
          display={formatNumber(fte)}
        />
        <Slider
          label="Loaded cost per FTE"
          value={costPerFTE}
          min={40_000}
          max={200_000}
          step={5_000}
          onChange={setCostPerFTE}
          display={formatCurrency(costPerFTE)}
        />
        <Slider
          label="Hours automatable per FTE per week — low"
          value={loHours}
          min={0}
          max={20}
          step={1}
          onChange={setLoHours}
          display={`${loHours} hrs`}
        />
        <Slider
          label="Hours automatable per FTE per week — high"
          value={hiHours}
          min={0}
          max={20}
          step={1}
          onChange={setHiHours}
          display={`${hiHours} hrs`}
        />
      </div>

      <div className="mt-10 pt-8 border-t border-[color:var(--color-ink)]/10">
        <p className="font-serif-sc text-[11px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/70 mb-3">
          Estimated annual labor hours recaptured
        </p>
        <p className="font-mono text-5xl md:text-6xl text-[color:var(--color-terra)] leading-none tabular-nums">
          {formatCurrency(result.mid)}
        </p>
        <p className="font-mono text-xs text-[color:var(--color-ink)]/70 mt-3 leading-snug">
          Range: {formatCurrency(result.low)} &ndash; {formatCurrency(result.high)} &middot;{' '}
          {formatNumber(result.hoursPerYear)} hours/year &middot;{' '}
          ~{result.payrollRecaptured}% of payroll
        </p>
        <a
          href={ctaHref}
          target={ctaHref.startsWith('http') ? '_blank' : undefined}
          rel={ctaHref.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="mt-6 inline-block px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
        >
          {ctaLabel}
        </a>
      </div>
    </div>
  );
}

interface SliderProps {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly onChange: (value: number) => void;
  readonly display: string;
}

function Slider({ label, value, min, max, step, onChange, display }: SliderProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70">
          {label}
        </label>
        <span className="font-mono text-base text-[color:var(--color-ink)]">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[color:var(--color-terra)]"
      />
    </div>
  );
}
