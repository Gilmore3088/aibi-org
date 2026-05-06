// Homepage ROI section. Wraps ROICalculatorBody with industry context and
// brand framing. The standalone workbook page at
// /for-institutions/samples/efficiency-ratio-workbook reuses the same body
// with different framing.

import { ROICalculatorBody } from './ROICalculatorBody';

export function ROICalculator() {
  return (
    <section
      id="roi-calculator"
      className="px-6 py-14 md:py-20 bg-[color:var(--color-parch)] border-y border-[color:var(--color-ink)]/10"
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
            Estimate the annual value of staff hours AI can give back to your
            institution.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8 md:gap-12">
          <div className="md:col-span-2 space-y-6">
            <div className="border border-[color:var(--color-ink)]/10 bg-[color:var(--color-linen)] p-6">
              <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-3">
                What this models
              </p>
              <ul className="space-y-3 text-sm text-[color:var(--color-ink)]/75 leading-relaxed">
                <li>Staff count</li>
                <li>Loaded employee cost</li>
                <li>Conservative weekly hours saved</li>
              </ul>
            </div>
            <p className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed">
              This is not a promise or a forecast. It is a quick way to frame
              the value of better daily workflows before making a bigger AI
              investment.
            </p>
          </div>

          {/* Right: calculator */}
          <div className="md:col-span-3">
            <ROICalculatorBody
              ctaLabel="Take the Assessment"
              ctaHref="/assessment"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
