export const metadata = {
  title: 'AI Use Disclaimer | The AI Banking Institute',
};

export default function AIUseDisclaimerPage() {
  return (
    <main className="px-6 py-14 md:py-20">
      <div className="max-w-3xl mx-auto space-y-8">
        <header>
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            AI Use
          </p>
          <h1 className="font-serif text-5xl text-[color:var(--color-ink)] leading-tight">
            AI Use Disclaimer
          </h1>
        </header>
        <section className="space-y-6 text-sm text-[color:var(--color-ink)]/75 leading-relaxed">
          <p>
            AI outputs can be incomplete, inaccurate, fabricated, biased, or
            inappropriate for regulated banking use. Every output should be
            reviewed by a qualified human before use.
          </p>
          <div className="border-l-2 border-[color:var(--color-terra)] pl-5">
            <h2 className="font-serif text-2xl text-[color:var(--color-ink)] mb-3">
              The SAFE Rule
            </h2>
            <ul className="space-y-2">
              <li>Strip sensitive data before prompting.</li>
              <li>Ask clearly with role, task, format, and constraints.</li>
              <li>Fact-check claims, citations, numbers, and policy language.</li>
              <li>Escalate credit, legal, compliance, PII, and customer-impacting decisions.</li>
            </ul>
          </div>
          <p>
            Do not paste customer PII, account numbers, customer financial
            records, credit decision details, SAR-related information, legal
            conclusions, or highly restricted institution data into public AI
            tools.
          </p>
        </section>
      </div>
    </main>
  );
}
