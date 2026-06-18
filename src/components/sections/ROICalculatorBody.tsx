'use client';

// ROICalculatorBody — inputs + result block with no surrounding chrome.
// Used by the homepage ROICalculator and by the standalone workbook page
// at /for-institutions/samples/efficiency-ratio-workbook. The math matches
// the calcROI() spec in CLAUDE.md.

import { useMemo, useState } from 'react';
import { trackBriefingBooked } from '@/lib/analytics/events';
import type { BriefingSource } from '@/components/analytics/BriefingButton';

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
  'mailto:hello@aibankinginstitute.com?subject=Executive%20Briefing%20%E2%80%94%20ROI%20Calculator%20follow-up';

interface ROICalculatorBodyProps {
  readonly ctaLabel?: string;
  readonly ctaHref?: string;
  // Surface the calculator is rendered on — feeds the briefing_booked
  // analytics event so we can attribute briefings to the originating page.
  readonly briefingSource?: BriefingSource;
}

export function ROICalculatorBody({
  ctaLabel = 'Request Executive Briefing',
  ctaHref = CALENDLY_URL,
  briefingSource = 'home',
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
    <div className="mk-roi-calculator">
      <div className="mk-roi-controls">
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

      <div className="mk-roi-result">
        <p className="mk-roi-result-label">
          Estimated annual value recaptured
        </p>
        <p className="mk-roi-result-value">
          {formatCurrency(result.mid)}
        </p>
        <p className="mk-roi-result-meta">
          Range: {formatCurrency(result.low)} &ndash; {formatCurrency(result.high)} &middot;{' '}
          {formatNumber(result.hoursPerYear)} hours/year &middot;{' '}
          ~{result.payrollRecaptured}% of payroll
        </p>
        <a
          href={ctaHref}
          target={ctaHref.startsWith('http') ? '_blank' : undefined}
          rel={ctaHref.startsWith('http') ? 'noopener noreferrer' : undefined}
          onClick={
            ctaHref.startsWith('http')
              ? () => trackBriefingBooked({ source: briefingSource })
              : undefined
          }
          className="mk-roi-result-cta"
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
  const inputId = `roi-slider-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <div className="mk-roi-slider">
      <div className="mk-roi-slider-head">
        <label
          htmlFor={inputId}
          className="mk-roi-slider-label"
        >
          {label}
        </label>
        <span className="mk-roi-slider-value" aria-hidden="true">
          {display}
        </span>
      </div>
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={display}
        className="mk-roi-range"
      />
    </div>
  );
}
