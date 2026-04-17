'use client';

import { useMemo, useState, useCallback } from 'react';

// AiBI-L Session 3: Department-by-Department ROI Calculator
// Live calculator — no submit button, no server calls.
// All numbers: font-mono tabular-nums. Accent: sage only.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DepartmentRow {
  readonly name: string;
  readonly ftes: number;
  readonly costPerFTE: number;
  readonly automatableHours: number;
}

type Scenario = 'conservative' | 'moderate' | 'aggressive';

const SCENARIO_RATES: Record<Scenario, number> = {
  conservative: 0.02,
  moderate: 0.05,
  aggressive: 0.08,
};

const SCENARIO_LABELS: Record<Scenario, string> = {
  conservative: 'Conservative (2%)',
  moderate: 'Moderate (5%)',
  aggressive: 'Aggressive (8%)',
};

const DEFAULT_DEPARTMENTS: readonly DepartmentRow[] = [
  { name: 'Operations', ftes: 15, costPerFTE: 65_000, automatableHours: 10 },
  { name: 'Lending', ftes: 10, costPerFTE: 65_000, automatableHours: 8 },
  { name: 'Compliance', ftes: 5, costPerFTE: 65_000, automatableHours: 6 },
  { name: 'Finance', ftes: 5, costPerFTE: 65_000, automatableHours: 5 },
  { name: 'Retail', ftes: 20, costPerFTE: 65_000, automatableHours: 4 },
];

const DEFAULT_ADOPTION = [40, 70, 100] as const;

const HOURS_PER_YEAR = 2080;
const WORKING_WEEKS = 50;

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function fmtDollars(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

function fmtPct(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

// ---------------------------------------------------------------------------
// Calculation helpers
// ---------------------------------------------------------------------------

function deptAnnualSavings(
  dept: DepartmentRow,
  adoptionRate: number
): number {
  const hourlyRate = dept.costPerFTE / HOURS_PER_YEAR;
  return dept.ftes * dept.automatableHours * hourlyRate * WORKING_WEEKS * (adoptionRate / 100);
}

function deptHoursReclaimed(dept: DepartmentRow): number {
  return dept.ftes * dept.automatableHours * WORKING_WEEKS;
}

// ---------------------------------------------------------------------------
// Reusable number input
// ---------------------------------------------------------------------------

interface NumberInputProps {
  readonly label: string;
  readonly value: number;
  readonly onChange: (v: number) => void;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly id: string;
}

function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  prefix,
  suffix,
  id,
}: NumberInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9.]/g, '');
      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) {
        onChange(parsed);
      } else if (raw === '') {
        onChange(0);
      }
    },
    [onChange]
  );

  return (
    <div>
      <label
        htmlFor={id}
        className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/70 mb-1"
      >
        {label}
      </label>
      <div className="flex items-center gap-1">
        {prefix && (
          <span className="font-mono text-sm text-[color:var(--color-ink)]/50">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={fmtNumber(value)}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          className="w-full font-mono text-sm tabular-nums text-[color:var(--color-ink)] bg-white border border-[color:var(--color-ink)]/10 px-3 py-2 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:ring-offset-1"
        />
        {suffix && (
          <span className="font-mono text-sm text-[color:var(--color-ink)]/50">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bar chart component
// ---------------------------------------------------------------------------

function SavingsBarChart({
  values,
  labels,
}: {
  readonly values: readonly number[];
  readonly labels: readonly string[];
}) {
  const maxVal = Math.max(...values, 1);

  return (
    <div className="flex items-end gap-3 h-40">
      {values.map((val, i) => {
        const heightPct = Math.max((val / maxVal) * 100, 4);
        return (
          <div key={labels[i]} className="flex-1 flex flex-col items-center gap-2">
            <span className="font-mono text-[10px] tabular-nums text-[color:var(--color-ink)]">
              {fmtDollars(val)}
            </span>
            <div
              className="w-full bg-[color:var(--color-sage)] rounded-[2px] transition-all duration-300"
              style={{ height: `${heightPct}%` }}
              role="img"
              aria-label={`${labels[i]}: ${fmtDollars(val)}`}
            />
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/70">
              {labels[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function EfficiencyComparison({
  current,
  projected,
}: {
  readonly current: number;
  readonly projected: number;
}) {
  // Lower efficiency ratio is better. Scale bars relative to a max of 100%.
  return (
    <div className="flex items-end gap-6 h-32">
      {[
        { label: 'Current', value: current },
        { label: 'Projected', value: projected },
      ].map((item) => (
        <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
          <span className="font-mono text-sm tabular-nums text-[color:var(--color-ink)] font-semibold">
            {fmtPct(item.value)}
          </span>
          <div
            className={`w-full rounded-[2px] transition-all duration-300 ${
              item.label === 'Current'
                ? 'bg-[color:var(--color-ink)]/20'
                : 'bg-[color:var(--color-sage)]'
            }`}
            style={{ height: `${Math.max(item.value, 2)}%` }}
            role="img"
            aria-label={`${item.label} efficiency ratio: ${fmtPct(item.value)}`}
          />
          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/70">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ROICalculator() {
  // Institution baseline
  const [nonInterestExpense, setNonInterestExpense] = useState(12_000_000);
  const [efficiencyRatio, setEfficiencyRatio] = useState(68.0);
  const [totalAssets, setTotalAssets] = useState(250_000_000);

  // Department data
  const [departments, setDepartments] = useState<DepartmentRow[]>(
    [...DEFAULT_DEPARTMENTS]
  );

  // Scenario
  const [scenario, setScenario] = useState<Scenario>('moderate');

  // Adoption rates
  const [adoption, setAdoption] = useState<[number, number, number]>([
    ...DEFAULT_ADOPTION,
  ]);

  // Department update helper
  const updateDept = useCallback(
    (index: number, field: keyof DepartmentRow, value: number) => {
      setDepartments((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Derived calculations
  // ---------------------------------------------------------------------------

  const calculations = useMemo(() => {
    const scenarioRate = SCENARIO_RATES[scenario];

    // Per-department savings for each year
    const deptSavingsByYear = departments.map((dept) =>
      adoption.map((rate) => deptAnnualSavings(dept, rate))
    );

    // Total per year
    const yearTotals = adoption.map((_, yearIdx) =>
      deptSavingsByYear.reduce((sum, deptYears) => sum + deptYears[yearIdx], 0)
    );

    // 3-year cumulative
    const cumulative = yearTotals.reduce((sum, y) => sum + y, 0);

    // Hours reclaimed per year (at full adoption)
    const totalHoursReclaimed = departments.reduce(
      (sum, dept) => sum + deptHoursReclaimed(dept),
      0
    );

    // Efficiency ratio improvement based on scenario
    const expenseReduction = nonInterestExpense * scenarioRate;
    const newNonInterestExpense = nonInterestExpense - expenseReduction;

    // Efficiency ratio = non-interest expense / revenue
    // If current ratio = NIE / revenue, then revenue = NIE / ratio
    const revenue =
      efficiencyRatio > 0 ? nonInterestExpense / (efficiencyRatio / 100) : 0;
    const newEfficiencyRatio =
      revenue > 0 ? (newNonInterestExpense / revenue) * 100 : 0;

    return {
      deptSavingsByYear,
      yearTotals,
      cumulative,
      totalHoursReclaimed,
      newEfficiencyRatio,
      expenseReduction,
    };
  }, [departments, adoption, scenario, nonInterestExpense, efficiencyRatio]);

  return (
    <section
      className="bg-[color:var(--color-parch)] border border-[color:var(--color-sage)]/15 rounded-sm"
      aria-labelledby="roi-calculator-heading"
    >
      {/* Header */}
      <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[color:var(--color-sage)]">
            Interactive Worksheet
          </span>
          <div
            className="h-px flex-1 bg-[color:var(--color-sage)]/15"
            aria-hidden="true"
          />
        </div>
        <h2
          id="roi-calculator-heading"
          className="font-serif text-2xl sm:text-3xl font-bold text-[color:var(--color-ink)] mb-2"
        >
          ROI Calculator
        </h2>
        <p className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed max-w-2xl">
          Enter your institution&apos;s numbers to build a department-by-department
          business case with 3-year projections. All calculations update in
          real time.
        </p>
      </div>

      <div className="px-6 sm:px-10 pb-8 sm:pb-10 space-y-10">
        {/* ----------------------------------------------------------------- */}
        {/* Section 1: Institution Baseline */}
        {/* ----------------------------------------------------------------- */}
        <div>
          <h3 className="font-serif text-lg font-bold text-[color:var(--color-ink)] mb-4">
            Institution Baseline
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <NumberInput
              id="nie"
              label="Annual Non-Interest Expense"
              value={nonInterestExpense}
              onChange={setNonInterestExpense}
              prefix="$"
            />
            <NumberInput
              id="er"
              label="Current Efficiency Ratio"
              value={efficiencyRatio}
              onChange={setEfficiencyRatio}
              suffix="%"
              step={0.1}
            />
            <NumberInput
              id="ta"
              label="Total Assets"
              value={totalAssets}
              onChange={setTotalAssets}
              prefix="$"
            />
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Section 2: Department Breakdown */}
        {/* ----------------------------------------------------------------- */}
        <div>
          <h3 className="font-serif text-lg font-bold text-[color:var(--color-ink)] mb-4">
            Department Breakdown
          </h3>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[color:var(--color-sage)]/15">
                  <th className="font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/60 py-2 pr-4">
                    Department
                  </th>
                  <th className="font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/60 py-2 px-2">
                    FTEs
                  </th>
                  <th className="font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/60 py-2 px-2">
                    Cost / FTE
                  </th>
                  <th className="font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/60 py-2 pl-2">
                    Automatable Hrs/Wk
                  </th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept, i) => (
                  <tr
                    key={dept.name}
                    className="border-b border-[color:var(--color-sage)]/8"
                  >
                    <td className="font-serif text-sm text-[color:var(--color-ink)] py-3 pr-4">
                      {dept.name}
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={fmtNumber(dept.ftes)}
                        onChange={(e) => {
                          const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                          if (!isNaN(v)) updateDept(i, 'ftes', v);
                        }}
                        className="w-20 font-mono text-sm tabular-nums text-[color:var(--color-ink)] bg-white border border-[color:var(--color-ink)]/10 px-2 py-1.5 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:ring-offset-1"
                        aria-label={`${dept.name} FTEs`}
                      />
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm text-[color:var(--color-ink)]/50">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={fmtNumber(dept.costPerFTE)}
                          onChange={(e) => {
                            const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                            if (!isNaN(v)) updateDept(i, 'costPerFTE', v);
                          }}
                          className="w-28 font-mono text-sm tabular-nums text-[color:var(--color-ink)] bg-white border border-[color:var(--color-ink)]/10 px-2 py-1.5 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:ring-offset-1"
                          aria-label={`${dept.name} cost per FTE`}
                        />
                      </div>
                    </td>
                    <td className="py-3 pl-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={dept.automatableHours}
                        onChange={(e) => {
                          const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                          if (!isNaN(v)) updateDept(i, 'automatableHours', v);
                        }}
                        className="w-16 font-mono text-sm tabular-nums text-[color:var(--color-ink)] bg-white border border-[color:var(--color-ink)]/10 px-2 py-1.5 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:ring-offset-1"
                        aria-label={`${dept.name} automatable hours per week`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked cards */}
          <div className="sm:hidden space-y-4">
            {departments.map((dept, i) => (
              <div
                key={dept.name}
                className="border border-[color:var(--color-sage)]/10 bg-white p-4 rounded-[2px]"
              >
                <p className="font-serif text-sm font-bold text-[color:var(--color-ink)] mb-3">
                  {dept.name}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-mono text-[8px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/60 mb-1">
                      FTEs
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={fmtNumber(dept.ftes)}
                      onChange={(e) => {
                        const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                        if (!isNaN(v)) updateDept(i, 'ftes', v);
                      }}
                      className="w-full font-mono text-sm tabular-nums text-[color:var(--color-ink)] bg-white border border-[color:var(--color-ink)]/10 px-2 py-1.5 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:ring-offset-1"
                      aria-label={`${dept.name} FTEs`}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[8px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/60 mb-1">
                      Cost/FTE
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={fmtNumber(dept.costPerFTE)}
                      onChange={(e) => {
                        const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                        if (!isNaN(v)) updateDept(i, 'costPerFTE', v);
                      }}
                      className="w-full font-mono text-sm tabular-nums text-[color:var(--color-ink)] bg-white border border-[color:var(--color-ink)]/10 px-2 py-1.5 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:ring-offset-1"
                      aria-label={`${dept.name} cost per FTE`}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[8px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/60 mb-1">
                      Hrs/Wk
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={dept.automatableHours}
                      onChange={(e) => {
                        const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                        if (!isNaN(v)) updateDept(i, 'automatableHours', v);
                      }}
                      className="w-full font-mono text-sm tabular-nums text-[color:var(--color-ink)] bg-white border border-[color:var(--color-ink)]/10 px-2 py-1.5 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:ring-offset-1"
                      aria-label={`${dept.name} automatable hours per week`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Section 3: Scenario Selector */}
        {/* ----------------------------------------------------------------- */}
        <div>
          <h3 className="font-serif text-lg font-bold text-[color:var(--color-ink)] mb-4">
            Non-Interest Expense Reduction Scenario
          </h3>
          <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Scenario">
            {(Object.keys(SCENARIO_RATES) as Scenario[]).map((key) => (
              <label
                key={key}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-[2px] cursor-pointer transition-colors ${
                  scenario === key
                    ? 'border-[color:var(--color-sage)] bg-[color:var(--color-sage)]/10'
                    : 'border-[color:var(--color-ink)]/10 bg-white hover:border-[color:var(--color-sage)]/40'
                }`}
              >
                <input
                  type="radio"
                  name="scenario"
                  value={key}
                  checked={scenario === key}
                  onChange={() => setScenario(key)}
                  className="accent-[color:var(--color-sage)]"
                />
                <span className="font-sans text-sm text-[color:var(--color-ink)]">
                  {SCENARIO_LABELS[key]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Section 4: 3-Year Adoption Rates */}
        {/* ----------------------------------------------------------------- */}
        <div>
          <h3 className="font-serif text-lg font-bold text-[color:var(--color-ink)] mb-4">
            3-Year Adoption Rates
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {adoption.map((rate, i) => (
              <NumberInput
                key={i}
                id={`adoption-y${i + 1}`}
                label={`Year ${i + 1}`}
                value={rate}
                onChange={(v) => {
                  setAdoption((prev) => {
                    const next: [number, number, number] = [...prev];
                    next[i] = Math.min(Math.max(v, 0), 100);
                    return next;
                  });
                }}
                suffix="%"
                min={0}
                max={100}
              />
            ))}
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Section 5: Results */}
        {/* ----------------------------------------------------------------- */}
        <div className="border-t border-[color:var(--color-sage)]/15 pt-8 space-y-8">
          <h3 className="font-serif text-lg font-bold text-[color:var(--color-ink)]">
            Projected Results
          </h3>

          {/* Per-department breakdown */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[color:var(--color-ink)]/60 mb-3">
              Annual Savings by Department
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[color:var(--color-sage)]/15">
                    <th className="font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/60 py-2 pr-4">
                      Department
                    </th>
                    <th className="font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/60 py-2 px-2 text-right">
                      Year 1
                    </th>
                    <th className="font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/60 py-2 px-2 text-right">
                      Year 2
                    </th>
                    <th className="font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/60 py-2 pl-2 text-right">
                      Year 3
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept, i) => (
                    <tr
                      key={dept.name}
                      className="border-b border-[color:var(--color-sage)]/8"
                    >
                      <td className="font-serif text-sm text-[color:var(--color-ink)] py-2 pr-4">
                        {dept.name}
                      </td>
                      {calculations.deptSavingsByYear[i].map((val, yi) => (
                        <td
                          key={yi}
                          className="font-mono text-sm tabular-nums text-[color:var(--color-ink)] py-2 px-2 text-right"
                        >
                          {fmtDollars(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-t-2 border-[color:var(--color-sage)]/30">
                    <td className="font-serif text-sm font-bold text-[color:var(--color-ink)] py-2 pr-4">
                      Total
                    </td>
                    {calculations.yearTotals.map((val, yi) => (
                      <td
                        key={yi}
                        className="font-mono text-sm tabular-nums font-bold text-[color:var(--color-ink)] py-2 px-2 text-right"
                      >
                        {fmtDollars(val)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Headline numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="border border-[color:var(--color-sage)]/15 bg-white p-5 rounded-[2px]">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[color:var(--color-ink)]/60 mb-2">
                3-Year Cumulative Savings
              </p>
              <p className="font-mono text-4xl tabular-nums text-[color:var(--color-sage)] leading-none">
                {fmtDollars(calculations.cumulative)}
              </p>
            </div>
            <div className="border border-[color:var(--color-sage)]/15 bg-white p-5 rounded-[2px]">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[color:var(--color-ink)]/60 mb-2">
                Hours Reclaimed / Year
              </p>
              <p className="font-mono text-4xl tabular-nums text-[color:var(--color-sage)] leading-none">
                {fmtNumber(calculations.totalHoursReclaimed)}
              </p>
              <p className="font-mono text-[10px] tabular-nums text-[color:var(--color-ink)]/50 mt-1">
                at full adoption
              </p>
            </div>
            <div className="border border-[color:var(--color-sage)]/15 bg-white p-5 rounded-[2px]">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[color:var(--color-ink)]/60 mb-2">
                Efficiency Ratio Improvement
              </p>
              <p className="font-mono text-4xl tabular-nums text-[color:var(--color-sage)] leading-none">
                {fmtPct(efficiencyRatio - calculations.newEfficiencyRatio)}
              </p>
              <p className="font-mono text-[10px] tabular-nums text-[color:var(--color-ink)]/50 mt-1">
                {fmtPct(efficiencyRatio)} to {fmtPct(calculations.newEfficiencyRatio)}
              </p>
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* Section 6: Visual Output */}
          {/* ----------------------------------------------------------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="border border-[color:var(--color-sage)]/15 bg-white p-5 rounded-[2px]">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[color:var(--color-ink)]/60 mb-4">
                Annual Savings by Year
              </p>
              <SavingsBarChart
                values={calculations.yearTotals}
                labels={['Year 1', 'Year 2', 'Year 3']}
              />
            </div>
            <div className="border border-[color:var(--color-sage)]/15 bg-white p-5 rounded-[2px]">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[color:var(--color-ink)]/60 mb-4">
                Efficiency Ratio Comparison
              </p>
              <EfficiencyComparison
                current={efficiencyRatio}
                projected={calculations.newEfficiencyRatio}
              />
            </div>
          </div>

          {/* Methodology note */}
          <div className="border-t border-[color:var(--color-sage)]/10 pt-4">
            <p className="font-mono text-[9px] text-[color:var(--color-slate)] leading-relaxed">
              Methodology: Annual Savings = FTEs x Automatable Hours/Week x (Cost per FTE / 2,080) x 50 weeks x Adoption Rate.
              Efficiency ratio improvement based on {SCENARIO_LABELS[scenario].toLowerCase()} scenario
              ({fmtPct(SCENARIO_RATES[scenario] * 100, 0)} non-interest expense reduction).
              Hours reclaimed shown at full adoption.
              Source benchmarks: FDIC CEIC data (1992-2025), FDIC Quarterly Banking Profile Q4 2024.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
