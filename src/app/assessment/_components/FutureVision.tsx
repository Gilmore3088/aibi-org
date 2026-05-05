import { FUTURE_VISION } from '@content/assessments/v2/personalization';

export function FutureVision() {
  return (
    <section className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-8 md:p-10 print-avoid-break">
      <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
        What good looks like
      </p>
      <h3 className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] leading-tight mb-5">
        A Practitioner-Ready Institution.
      </h3>
      <ul className="grid gap-3">
        {FUTURE_VISION.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-[15px] leading-[1.5] text-[color:var(--color-ink)]/85"
          >
            <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-terra)] shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
