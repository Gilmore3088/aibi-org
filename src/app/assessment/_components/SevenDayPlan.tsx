import { SEVEN_DAY_PLAN } from '@content/assessments/v2/personalization';

export function SevenDayPlan() {
  return (
    <section className="print-avoid-break" aria-labelledby="seven-day-heading">
      <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-2">
        Your 7-Day AI Activation Plan
      </p>
      <h3
        id="seven-day-heading"
        className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] leading-tight mb-6"
      >
        What to do this week.
      </h3>
      <ol className="border-l-2 border-[color:var(--color-terra)]/40 space-y-5 pl-6">
        {SEVEN_DAY_PLAN.map(({ day, action }) => (
          <li key={day} className="relative">
            <span
              aria-hidden
              className="absolute -left-[34px] top-0 inline-flex items-center justify-center h-6 w-6 rounded-full bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-mono text-[11px] tabular-nums font-semibold"
            >
              {day}
            </span>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]/55 mb-1">
              Day {day}
            </p>
            <p className="text-[15px] leading-[1.55] text-[color:var(--color-ink)]/85">
              {action}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
