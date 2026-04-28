export const metadata = {
  title: 'Terms of Use | The AI Banking Institute',
};

export default function TermsPage() {
  return (
    <main className="px-6 py-14 md:py-20">
      <div className="max-w-3xl mx-auto space-y-8">
        <header>
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            Terms
          </p>
          <h1 className="font-serif text-5xl text-[color:var(--color-ink)] leading-tight">
            Terms of Use
          </h1>
        </header>
        <section className="space-y-5 text-sm text-[color:var(--color-ink)]/75 leading-relaxed">
          <p>
            The AI Banking Institute provides educational content, practice
            exercises, prompts, artifacts, assessments, and certification
            workflows for community financial institutions.
          </p>
          <p>
            Course materials are for training and internal capability building.
            They are not legal, compliance, credit, security, accounting, or
            regulatory advice.
          </p>
          <p>
            Learners are responsible for following their institution&apos;s AI,
            data handling, customer privacy, vendor management, and compliance
            policies.
          </p>
          <p>
            Certificates indicate completion of the stated course requirements.
            They do not authorize a learner to make regulated decisions without
            institution oversight.
          </p>
        </section>
      </div>
    </main>
  );
}
