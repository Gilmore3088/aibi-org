import { FOOTER_CLOSE } from '@content/assessments/v2/personalization';

export function FooterClose() {
  return (
    <section className="border-t border-[color:var(--color-ink)]/15 pt-10 print-avoid-break">
      <div className="max-w-2xl mx-auto text-center">
        <p className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] leading-tight">
          {FOOTER_CLOSE.headline}
        </p>
        <p className="mt-4 text-[16px] leading-[1.6] text-[color:var(--color-ink)]/75">
          {FOOTER_CLOSE.body}
        </p>
      </div>
    </section>
  );
}
