'use client';

import { useMemo, useState } from 'react';

// ROI calculator — matches calcROI() spec in CLAUDE.md.
// Client-side only. No server calls. Results are instant.

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
      className="px-6 py-14 md:py-20 bg-[color:var(--color-linen)]"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
            ROI Model
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] max-w-3xl mx-auto leading-tight">
            Run your own numbers.
          </h2>
          <p className="text-lg text-[color:var(--color-ink)]/70 max-w-2xl mx-auto mt-5 leading-relaxed">
            This calculator estimates the annual dollar value of staff hours
            that AI automation can recapture inside your institution. It is
            the starting point for every engagement The AI Banking Institute
            runs &mdash; the labor reallocation math that every other outcome
            follows from.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8 md:gap-12">
          {/* Left: benchmark context */}
          <div className="md:col-span-2 space-y-6">
            <div className="border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-6">
              <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-3">
                Industry context
              </p>
              <dl className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <dt className="text-sm text-[color:var(--color-ink)]/80">
                    Community bank median efficiency ratio
                  </dt>
                  <dd className="font-mono text-lg text-[color:var(--color-ink)] tabular-nums">~65%</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-sm text-[color:var(--color-ink)]/80">
                    Industry-wide (Q4 2024)
                  </dt>
                  <dd className="font-mono text-lg text-[color:var(--color-ink)] tabular-nums">~55.7%</dd>
                </div>
              </dl>
              <p className="font-mono text-[10px] text-[color:var(--color-slate)] mt-4 leading-snug">
                Source: FDIC Quarterly Banking Profile &middot; CEIC 1992&ndash;2025
              </p>
            </div>
            <p className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed">
              Top-performing peers run 8&ndash;12 percentage points below the
              community bank median. Closing that gap is not a technology
              problem. It is a labor reallocation problem &mdash; which is
              exactly what the calculator on the right quantifies.
            </p>
            <p className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed">
              The result is not a projected efficiency ratio change. It is the
              annual dollar value of the hours AI can give back to your staff,
              based on your inputs. The efficiency ratio improvement follows
              from how those recaptured hours are then reinvested.
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
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
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
