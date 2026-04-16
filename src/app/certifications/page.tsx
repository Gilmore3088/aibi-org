import type { Metadata } from 'next';
import { certifications } from '@content/certifications/v1';
import { InquiryForm } from './_components/InquiryForm';

export const metadata: Metadata = {
  title: 'Certifications — Practitioner, Specialist, and Leader',
  description:
    'Three credentials from The AI Banking Institute: Practitioner (AiBI-P) for all staff, Specialist (AiBI-S) for department managers, and Leader (AiBI-L) for C-suite and board.',
};

export default function CertificationsPage() {
  return (
    <main>
      <section className="px-6 pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
            Certifications
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-tight">
            Three credentials. One shared vocabulary.
          </h1>
          <p className="text-lg md:text-xl text-[color:var(--color-ink)]/75 max-w-2xl mx-auto leading-relaxed">
            Credentials from The AI Banking Institute give your staff, your
            managers, and your board the same framework for making AI
            decisions &mdash; so your teller, your CFO, and your examiner are
            speaking the same language.
          </p>
          <p className="font-mono text-xs text-[color:var(--color-ink)]/50 pt-2">
            Cohort enrollment is by inquiry only during Phase 1.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {certifications.map((cert) => (
            <article
              key={cert.id}
              className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 p-8 flex flex-col"
            >
              <div className="flex items-baseline justify-between mb-4">
                <h2
                  className="font-serif text-3xl leading-none"
                  style={{ color: cert.accent }}
                >
                  {cert.name}
                </h2>
                <span className="font-mono text-xs text-[color:var(--color-ink)]/60">
                  {cert.price}
                </span>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 mb-4">
                {cert.credentialDisplay}
              </p>
              <p className="text-sm text-[color:var(--color-ink)]/80 mb-5 leading-relaxed">
                <span className="font-medium">For:</span> {cert.audience}
              </p>

              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/50 mb-2">
                What you will learn
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                {cert.learn.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-[color:var(--color-ink)]/80 leading-snug pl-4 relative"
                  >
                    <span
                      className="absolute left-0 top-2 w-2 h-[1px]"
                      style={{ background: cert.accent }}
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="border-t border-[color:var(--color-ink)]/10 pt-4 space-y-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/50">
                  Assessment
                </p>
                <p className="text-xs text-[color:var(--color-ink)]/70 leading-relaxed">
                  {cert.format}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <InquiryForm />
        </div>
      </section>
    </main>
  );
}
