export const metadata = {
  title: 'Privacy Policy | The AI Banking Institute',
};

export default function PrivacyPage() {
  return (
    <main className="px-6 py-14 md:py-20">
      <div className="max-w-3xl mx-auto space-y-8">
        <header>
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            Privacy
          </p>
          <h1 className="font-serif text-5xl text-[color:var(--color-ink)] leading-tight">
            Privacy Policy
          </h1>
        </header>
        <section className="space-y-5 text-sm text-[color:var(--color-ink)]/75 leading-relaxed">
          <p>
            The AI Banking Institute collects only the information needed to
            operate assessments, courses, payments, learner progress, support,
            and institution reporting.
          </p>
          <p>
            Assessment answers, readiness scores, course activity responses,
            saved prompts, practice completions, and certificate records may be
            stored to provide learner progress and institutional training
            visibility.
          </p>
          <p>
            Learners should not submit customer PII, account numbers, credit
            decisions, SAR information, or other highly restricted banking data
            into course exercises, prompt fields, or practice areas.
          </p>
          <p>
            Payment processing is handled by Stripe. Authentication and course
            data are handled through Supabase. Analytics may be used to improve
            product flow and launch readiness.
          </p>
          <p>
            For privacy or data handling questions, contact support using the
            institution contact path provided by your course sponsor.
          </p>
        </section>
      </div>
    </main>
  );
}
