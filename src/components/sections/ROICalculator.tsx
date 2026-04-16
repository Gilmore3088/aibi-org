'use client';

import { useMemo, useState } from 'react';

// ROI calculator — matches calcROI() spec in CLAUDE.md.
// Client-side only. No server calls. Results are instant.

interface ROIResult {
  readonly mid: number;
  readonly low: number;
  readonly high: number;
  readonly hoursPerYear: number;
  readonly efficiencyPoints: string;
}

function calcROI(inputs: {
  fte: number;
  costPerFTE: number;
  loHours: number;
  hiHours: number;
}): ROIResult {
  const { fte, costPerFTE, loHours, hiHours } = inputs;
  const hourlyRate = costPerFTE / 2080;
  const midHours = (loHours + hiHours) / 2;
  const totalPayroll = fte * costPerFTE;
  return {
    mid: fte * midHours * hourlyRate * 50,
    low: fte * loHours * hourlyRate * 50,
    high: fte * hiHours * hourlyRate * 50,
    hoursPerYear: Math.round(fte * midHours * 50),
    efficiencyPoints:
      totalPayroll > 0
        ? (((fte * midHours * hourlyRate * 50) / totalPayroll) * 100).toFixed(1)
        : '0.0',
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

export function ROICalculator() {
  const [fte, setFte] = useState(50);
  const [costPerFTE, setCostPerFTE] = useState(85_000);
  const [loHours, setLoHours] = useState(2);
  const [hiHours, setHiHours] = useState(5);

  const result = useMemo(
    () => calcROI({ fte, costPerFTE, loHours, hiHours }),
    [fte, costPerFTE, loHours, hiHours]
  );

  return (
    <section
      id="roi-calculator"
      className="px-6 py-20 md:py-28 bg-[color:var(--color-linen)]"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
            ROI Model
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] max-w-3xl mx-auto leading-tight">
            Run your own numbers.
          </h2>
          <p className="text-lg text-[color:var(--color-ink)]/70 max-w-2xl mx-auto mt-5 leading-relaxed">
            The community bank median efficiency ratio is ~65% (FDIC CEIC data).
            Top-performing peers operate in the mid-50s. An 8–12 point gap is
            the prize. The math below is how AiBI engagements move it.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8 md:gap-12">
          {/* Left: benchmark context */}
          <div className="md:col-span-2 space-y-6">
            <div className="border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 mb-3">
                FDIC benchmark
              </p>
              <dl className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <dt className="text-sm text-[color:var(--color-ink)]/80">
                    Community bank median
                  </dt>
                  <dd className="font-mono text-lg text-[color:var(--color-ink)]">~65%</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-sm text-[color:var(--color-ink)]/80">
                    Industry-wide (Q4 2024)
                  </dt>
                  <dd className="font-mono text-lg text-[color:var(--color-ink)]">~55.7%</dd>
                </div>
                <div className="flex items-baseline justify-between pt-3 border-t border-[color:var(--color-ink)]/10">
                  <dt className="text-sm font-medium text-[color:var(--color-ink)]">
                    The gap
                  </dt>
                  <dd className="font-mono text-lg text-[color:var(--color-terra)]">8–12 pp</dd>
                </div>
              </dl>
              <p className="font-mono text-[10px] text-[color:var(--color-ink)]/40 mt-4">
                Source: FDIC Quarterly Banking Profile &middot; CEIC 1992–2025
              </p>
            </div>
            <p className="text-sm text-[color:var(--color-ink)]/70 leading-relaxed">
              Closing that gap is not a technology problem. It is a labor
              reallocation problem. The calculator below estimates how much of
              that gap AI automation can recover inside your institution.
            </p>
          </div>

          {/* Right: calculator */}
          <div className="md:col-span-3 border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-8 md:p-10">
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
              <p className="font-serif-sc text-[11px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/60 mb-3">
                Estimated annual NIE reduction
              </p>
              <p className="font-mono text-5xl md:text-6xl text-[color:var(--color-terra)] leading-none tabular-nums">
                {formatCurrency(result.mid)}
              </p>
              <p className="font-mono text-xs text-[color:var(--color-ink)]/60 mt-3">
                Range: {formatCurrency(result.low)} &ndash; {formatCurrency(result.high)} &middot;{' '}
                {formatNumber(result.hoursPerYear)} hours/year &middot;{' '}
                ~{result.efficiencyPoints} efficiency points
              </p>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans font-medium tracking-wide hover:bg-[color:var(--color-terra-light)] transition-colors"
              >
                Request Executive Briefing
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
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
        <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60">
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
