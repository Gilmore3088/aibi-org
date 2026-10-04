import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/mockup';
import { AxHero, AxSection } from '@/components/ax';
import { ROICalculatorBody } from '@/components/sections/ROICalculatorBody';
import { BriefingButton } from '@/components/analytics/BriefingButton';

export const metadata: Metadata = {
  alternates: { canonical: '/for-institutions/samples/efficiency-ratio-workbook' },
  title: 'Efficiency Ratio Workbook',
  description:
    'Model your community bank or credit union’s automation ceiling with your own FTE, cost, and hours estimates. The same labor-reallocation math we walk through in an Executive Briefing — free, no email required.',
};

const BRIEFING_HREF =
  'mailto:hello@aibankinginstitute.com?subject=Executive%20Briefing%20%E2%80%94%20Efficiency%20Ratio%20Workbook%20follow-up';

const INPUTS = [
  { label: 'Full-time employees', where: 'Your latest Call Report or HR system. Branch and back office.' },
  { label: 'Loaded cost per FTE', where: 'Salary plus benefits, taxes and overhead. The default is a placeholder; use your CFO’s number.' },
  { label: 'Hours per week, low', where: 'Repeatable, low-judgment work AI could absorb. Start conservative.' },
  { label: 'Hours per week, high', where: 'Your ceiling: the number you would defend to your board.' },
] as const;

const READING = [
  { is: true, title: 'Staff time, in dollars.', body: 'FTE × weekly hours × hourly cost × 50 weeks.' },
  { is: false, title: 'An efficiency-ratio change.', body: 'The ratio moves only when freed hours are redeployed or cut.' },
  { is: false, title: 'Guaranteed.', body: 'It assumes you build and adopt the tools within a year.' },
  { is: true, title: 'Yours.', body: 'Every input is your own number.' },
] as const;

export default function EfficiencyRatioWorkbookPage() {
  return (
    <div className="mockup-scope ax-page">
      <SiteHeader activePath="/for-institutions" />
      <AxHero
        cmd="for-institutions/samples/efficiency-ratio-workbook --free"
        title="The efficiency ratio workbook."
        lede="Four numbers in, one estimate of the staff time AI could free. No email required."
      />

      <main>
        <AxSection light id="calculator" kicker="Calculator" title="Enter your numbers.">
          <ROICalculatorBody ctaLabel="Discuss your number" ctaHref={BRIEFING_HREF} briefingSource="services" />
        </AxSection>

        <AxSection id="inputs" kicker="Where each number comes from" title="Two minutes with your CFO.">
          <dl className="ew-inputs">
            {INPUTS.map((input, i) => (
              <div key={input.label}>
                <dt>
                  <span className="ew-n">{String(i + 1).padStart(2, '0')}</span>
                  {input.label}
                </dt>
                <dd>{input.where}</dd>
              </div>
            ))}
          </dl>
        </AxSection>

        <AxSection light id="reading" kicker="How to read it" title="What the number is, and isn’t.">
          <ul className="ew-read">
            {READING.map((r) => (
              <li key={r.title} className={r.is ? 'is-yes' : 'is-no'}>
                <span className="ew-mark">{r.is ? 'It is' : 'It isn’t'}</span>
                <strong>{r.title}</strong>
                <span>{r.body}</span>
              </li>
            ))}
          </ul>
        </AxSection>
      </main>

      <section className="ax-section ax-light is-paper ax-close">
        <div className="mk-container">
          <h2 className="ax-display">
            Bring your number to an <span className="ax-gold">Executive Briefing.</span>
          </h2>
          <p className="ax-muted">Thirty minutes. We pressure-test your inputs and name the three departments most likely to free the hours.</p>
          <div className="ax-actions" style={{ justifyContent: 'center' }}>
            <BriefingButton href={BRIEFING_HREF} source="services" className="mk-btn mk-btn-gold mk-btn-lg">
              Book an Executive Briefing
            </BriefingButton>
          </div>
          <p className="ax-muted" style={{ marginTop: 16 }}>
            Not ready to talk yet? <Link href="/for-institutions">See team training options</Link> or{' '}
            <Link href="/assessment/take">take the free readiness assessment</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
