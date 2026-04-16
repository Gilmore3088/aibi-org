import type { Metadata } from 'next';
import { certifications } from '@content/certifications/v1';
import { ChooseYourPath } from '@/components/sections/ChooseYourPath';
import { SampleQuestion } from '@/components/sections/SampleQuestion';
import { InquiryForm } from './_components/InquiryForm';

export const metadata: Metadata = {
  title: 'Certifications — Practitioner, Specialist, and Leader',
  description:
    'Three credentials from The AI Banking Institute: Practitioner (AiBI-P) for all staff, Specialist (AiBI-S) for department managers, and Leader (AiBI-L) for C-suite and board.',
};

export default function CertificationsPage() {
  return (
    <main>
      {/* Hero */}
      <section className="px-6 pt-14 pb-8 md:pt-20 md:pb-12">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
            Certifications
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-tight">
            Validate the capabilities that matter inside a regulated
            institution.
          </h1>
          <p className="text-lg md:text-xl text-[color:var(--color-ink)]/75 max-w-2xl mx-auto leading-relaxed">
            Tools will change. The ability to deploy AI responsibly, adapt
            workflows, and make judgment calls under compliance pressure will
            not. Credentials from The AI Banking Institute prove your team has
            the capabilities that endure.
          </p>
        </div>
      </section>

      {/* Choose your path: Free vs Certified */}
      <ChooseYourPath />

      {/* Interactive sample question */}
      <SampleQuestion />

      {/* Certification tracks */}
      <section id="certification-tracks" className="px-6 py-14 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-4">
              Three tracks
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight">
              One credential for every level.
            </h2>
            <p className="text-lg text-[color:var(--color-ink)]/75 mt-5 max-w-2xl mx-auto leading-relaxed">
              Whether you are building your own capability or developing your
              team&rsquo;s, certification proves readiness to lead in the AI era.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {certifications.map((cert) => (
              <article
                key={cert.id}
                className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 p-8 flex flex-col"
              >
                <div className="mb-4">
                  <h3
                    className="font-serif text-2xl md:text-3xl leading-tight"
                    style={{ color: cert.accent }}
                  >
                    {cert.fullName}
                  </h3>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="font-serif-sc text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70">
                      {cert.credentialDisplay}
                    </p>
                    <span className="font-mono text-xs text-[color:var(--color-ink)]/70 tabular-nums">
                      {cert.price}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-[color:var(--color-ink)]/80 mb-5 leading-relaxed">
                  <span className="font-medium">For:</span> {cert.audience}
                </p>

                <p className="font-serif-sc text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-slate)] mb-2">
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
                  <p className="font-serif-sc text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-slate)]">
                    Assessment
                  </p>
                  <p className="text-xs text-[color:var(--color-ink)]/70 leading-relaxed">
                    {cert.format}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry form */}
      <section id="inquiry-form" className="px-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <InquiryForm />
        </div>
      </section>

      {/* Enterprise / bulk CTA */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto border border-[color:var(--color-ink)]/10 bg-[color:var(--color-linen)] p-10 md:p-14 text-center">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-ink)]/70 mb-3">
            Team and institutional enrollment
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] mb-4">
            Need team assessments or bulk certification?
          </h2>
          <p className="text-[color:var(--color-ink)]/75 max-w-xl mx-auto mb-6 leading-relaxed">
            We offer institutional pricing for teams of 5 or more, with
            cohort scheduling, group reporting, and a dedicated program lead.
            The AiBI-L Leader certification is available as a 1-day on-site
            workshop for up to 8 executives.
          </p>
          <a
            href="#inquiry-form"
            className="inline-block px-8 py-4 border border-[color:var(--color-terra)] text-[color:var(--color-terra)] font-sans font-medium tracking-wide hover:bg-[color:var(--color-terra)] hover:text-[color:var(--color-linen)] transition-colors"
          >
            Contact us for institutional solutions
          </a>
        </div>
      </section>
    </main>
  );
}
