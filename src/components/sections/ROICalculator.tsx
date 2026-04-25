// Homepage ROI section. Wraps ROICalculatorBody with industry context and
// brand framing. The standalone workbook page at
// /for-institutions/samples/efficiency-ratio-workbook reuses the same body
// with different framing.

import { ROICalculatorBody } from './ROICalculatorBody';

export function ROICalculator() {
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
            that AI automation can recapture inside your institution &mdash;
            the labor reallocation math behind every efficiency-ratio
            conversation.
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
          <div className="md:col-span-3">
            <ROICalculatorBody />
          </div>
        </div>
      </div>
    </section>
  );
}
