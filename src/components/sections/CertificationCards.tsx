import Link from 'next/link';
import { certifications } from '@content/certifications/v1';

interface CertificationCardsProps {
  readonly showHeader?: boolean;
  readonly compact?: boolean;
}

export function CertificationCards({
  showHeader = false,
  compact = false,
}: CertificationCardsProps) {
  return (
    <section className="px-6 py-14 md:py-20 bg-[color:var(--color-linen)]">
      <div className="max-w-6xl mx-auto">
        {showHeader && (
          <div className="text-center mb-10">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
              Certifications
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] max-w-2xl mx-auto leading-tight">
              Three credentials. One shared vocabulary.
            </h2>
          </div>
        )}

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
                  <p className="font-serif-sc text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60">
                    {cert.credentialDisplay}
                  </p>
                  <span className="font-mono text-xs text-[color:var(--color-ink)]/60 tabular-nums">
                    {cert.price.split(' ')[0]}
                  </span>
                </div>
              </div>
              <p className="text-sm text-[color:var(--color-ink)]/80 mb-5 leading-relaxed">
                <span className="font-medium">For:</span> {cert.audience}
              </p>

              {!compact && (
                <>
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
                  <div className="border-t border-[color:var(--color-ink)]/10 pt-4 mb-4 space-y-1">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/50">
                      Assessment
                    </p>
                    <p className="text-xs text-[color:var(--color-ink)]/70 leading-relaxed">
                      {cert.format}
                    </p>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>

        {compact && (
          <div className="text-center mt-12">
            <Link
              href="/certifications"
              className="inline-block px-6 py-3 border border-[color:var(--color-terra)] text-[color:var(--color-terra)] font-sans font-medium tracking-wide hover:bg-[color:var(--color-terra)] hover:text-[color:var(--color-linen)] transition-colors"
            >
              See full certification details
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
