"use client";

/**
 * <ROIDossier> — editorial ROI section for the design-2.0 system.
 *
 * Replaces the homepage ROICalculator with an annual-report dossier
 * treatment: editorial sidebar on the left (what this models, what this is
 * not, sourced assumption), input + result tableau on the right.
 *
 * Result tableau is a 3-cell hairline-ruled plate showing low / mid / high
 * annual value with mono tabular numbers — the IBISWorld "industry forecast"
 * pattern, applied to a single institution's scenario.
 *
 * Math is preserved verbatim from ROICalculatorBody. Only the chrome changed.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Section } from "@/components/system/Section";
import { SectionHeader } from "@/components/system/SectionHeader";

interface ROIInputs {
  readonly fte: number;
  readonly costPerFTE: number;
  readonly loHours: number;
  readonly hiHours: number;
}

function calcROI(inputs: ROIInputs) {
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
      totalPayroll > 0 ? ((midAnnual / totalPayroll) * 100).toFixed(1) : "0.0",
  };
}

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const fmtNumber = (n: number) => new Intl.NumberFormat("en-US").format(n);

interface RangeFieldProps {
  readonly label: string;
  readonly value: number;
  readonly displayValue: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly onChange: (n: number) => void;
}

function RangeField({
  label,
  value,
  displayValue,
  min,
  max,
  step,
  onChange,
}: RangeFieldProps) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-s2">
        <span className="font-mono text-label-md uppercase tracking-widest text-slate">
          {label}
        </span>
        <span className="font-mono tabular-nums text-mono-md text-ink">
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-[2px] appearance-none bg-hairline accent-terra cursor-pointer"
      />
    </label>
  );
}

export function ROIDossier() {
  const [fte, setFte] = useState(50);
  const [costPerFTE, setCostPerFTE] = useState(85_000);
  const [loHours, setLoHours] = useState(2);
  const [hiHours, setHiHours] = useState(5);

  const result = useMemo(
    () => calcROI({ fte, costPerFTE, loHours, hiHours }),
    [fte, costPerFTE, loHours, hiHours]
  );

  return (
    <Section variant="parch" padding="default" id="roi-dossier">
      <SectionHeader
        number="02"
        label="Modeled value"
        title="Run your own numbers."
        subtitle="Not a forecast. A frame for the conversation with your CFO."
      />

      <div className="mt-s8 grid lg:grid-cols-[0.85fr_1.15fr] gap-s10 lg:gap-s12 items-start">
        {/* LEFT — editorial sidebar */}
        <aside className="space-y-s6">
          <div className="border-l-2 border-l-terra pl-s5">
            <p className="font-mono text-label-md uppercase tracking-widest text-terra mb-s2">
              What this models
            </p>
            <ul className="text-body-sm leading-relaxed text-ink/85 space-y-s2">
              <li>Total full-time employees that would use AI tools.</li>
              <li>Their fully-loaded annual cost (salary + benefits + overhead).</li>
              <li>
                A conservative range of weekly hours an AI-fluent practitioner
                recovers from drafting, summarizing, and decision support.
              </li>
            </ul>
          </div>

          <div className="border-l-2 border-l-slate pl-s5">
            <p className="font-mono text-label-md uppercase tracking-widest text-slate mb-s2">
              What this is not
            </p>
            <p className="text-body-sm leading-relaxed text-ink/75">
              A promise. A forecast. A floor. The range is conservative; the
              practitioner-level capability is what closes it. We publish the math
              so your CFO can run it themselves.
            </p>
          </div>

          <p className="font-serif italic text-body-md text-slate leading-relaxed pt-s4 border-t border-hairline">
            &ldquo;The five-minute rule recovers thirty to sixty minutes of writing
            time per banker, per week, with no change to quality.&rdquo;
            <span className="block font-sans not-italic font-mono text-label-sm uppercase tracking-widest text-dust mt-s3">
              From Module 01 · the practitioner habit
            </span>
          </p>
        </aside>

        {/* RIGHT — inputs + result tableau */}
        <div>
          {/* Inputs panel */}
          <div className="bg-linen border border-hairline">
            <div className="px-s6 py-s4 border-b border-hairline flex items-baseline justify-between">
              <p className="font-mono text-label-md uppercase tracking-widest text-slate">
                Your inputs
              </p>
              <p className="font-mono text-label-sm uppercase tracking-widest text-dust">
                drag to adjust
              </p>
            </div>
            <div className="p-s6 space-y-s5">
              <RangeField
                label="Full-time employees"
                value={fte}
                displayValue={fmtNumber(fte)}
                min={1}
                max={500}
                step={1}
                onChange={setFte}
              />
              <RangeField
                label="Loaded cost per FTE"
                value={costPerFTE}
                displayValue={fmtCurrency(costPerFTE)}
                min={40_000}
                max={250_000}
                step={5_000}
                onChange={setCostPerFTE}
              />
              <div className="grid grid-cols-2 gap-s5">
                <RangeField
                  label="Hours / week — low"
                  value={loHours}
                  displayValue={`${loHours} hrs`}
                  min={0}
                  max={10}
                  step={1}
                  onChange={(n) => {
                    setLoHours(n);
                    if (n > hiHours) setHiHours(n);
                  }}
                />
                <RangeField
                  label="Hours / week — high"
                  value={hiHours}
                  displayValue={`${hiHours} hrs`}
                  min={0}
                  max={20}
                  step={1}
                  onChange={(n) => {
                    setHiHours(n);
                    if (n < loHours) setLoHours(n);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Result tableau — IBISWorld 3-column forecast plate */}
          <div className="mt-s6 border border-strong bg-linen">
            <div className="px-s6 py-s3 border-b border-strong flex items-baseline justify-between bg-parch-dark">
              <p className="font-mono text-label-md uppercase tracking-widest text-ink">
                Annual labor value · modeled scenario
              </p>
              <p className="font-mono text-label-sm uppercase tracking-widest text-slate">
                ~{result.payrollRecaptured}% of payroll
              </p>
            </div>
            <div className="grid grid-cols-3">
              <ResultCell
                label="Conservative"
                amount={result.low}
                tone="muted"
              />
              <ResultCell
                label="Mid case"
                amount={result.mid}
                tone="primary"
              />
              <ResultCell label="Optimistic" amount={result.high} tone="muted" />
            </div>
            <div className="px-s6 py-s3 border-t border-hairline flex items-baseline justify-between text-body-sm">
              <span className="font-mono text-label-sm uppercase tracking-widest text-slate">
                Hours / year recaptured
              </span>
              <span className="font-mono tabular-nums text-mono-md text-ink">
                {fmtNumber(result.hoursPerYear)}
              </span>
            </div>
            <div className="px-s6 py-s3 border-t border-hairline flex items-baseline justify-between text-body-sm">
              <span className="font-mono text-label-sm uppercase tracking-widest text-slate">
                Per banker, per week
              </span>
              <span className="font-mono tabular-nums text-mono-md text-ink">
                ~{((loHours + hiHours) / 2).toFixed(1)} hrs
              </span>
            </div>
          </div>

          {/* Footer — sourced assumptions + CTA */}
          <div className="mt-s6 grid sm:grid-cols-[1fr_auto] items-end gap-s6">
            <p className="font-mono text-label-sm uppercase tracking-widest text-dust leading-relaxed">
              50 working weeks · 2,080 hours / FTE / year · hourly rate derived
              from loaded cost. Range bounded by user-chosen low / high inputs.
            </p>
            <Link
              href="/assessment/start"
              className="inline-block font-sans text-mono-sm font-medium uppercase tracking-wider rounded-sharp bg-terra text-linen px-s7 py-s4 hover:bg-terra-light transition-colors duration-fast whitespace-nowrap"
            >
              Take the Assessment →
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}

interface ResultCellProps {
  readonly label: string;
  readonly amount: number;
  readonly tone: "muted" | "primary";
}

function ResultCell({ label, amount, tone }: ResultCellProps) {
  const isPrimary = tone === "primary";
  return (
    <div
      className={cn(
        "p-s5 border-l border-hairline first:border-l-0",
        isPrimary && "bg-parch"
      )}
    >
      <p
        className={cn(
          "font-mono text-label-sm uppercase tracking-widest mb-s2",
          isPrimary ? "text-terra" : "text-slate"
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "font-mono tabular-nums leading-none transition-all duration-fast",
          isPrimary
            ? "text-display-md md:text-display-lg text-ink"
            : "text-display-sm md:text-display-md text-ink/70"
        )}
      >
        {fmtCurrency(amount)}
      </p>
    </div>
  );
}
