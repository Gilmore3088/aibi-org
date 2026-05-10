// Learner certificate page — /courses/aibi-p/certificate
// Server component. Authenticates the user, looks up their certificate,
// and renders download + LinkedIn placeholder sections.
// Per CERT-04: learner can download PDF from this page.

import { redirect } from 'next/navigation';
import { getEnrollment } from '../_lib/getEnrollment';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Certificate } from '@/types/course';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

export const metadata = {
  title: 'Your Foundations Certificate | The AI Banking Institute',
  description: 'Download your Foundations Certificate from The AI Banking Institute.',
};

export default async function CertificatePage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="min-h-screen bg-[var(--color-parch)] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-[var(--color-ink)] mb-4">
            Service Unavailable
          </h1>
          <p className="text-[var(--color-slate)]">
            The certificate service is not configured. Please contact support.
          </p>
        </div>
      </main>
    );
  }

  const enrollment = await getEnrollment();
  if (!enrollment) {
    redirect('/courses/aibi-p/purchase');
  }

  const serviceClient = createServiceRoleClient();

  // Look up certificate
  const { data: certData } = await serviceClient
    .from('certificates')
    .select('id, enrollment_id, certificate_id, holder_name, designation, issued_at')
    .eq('enrollment_id', enrollment.id)
    .maybeSingle();

  const certificate = certData as Certificate | null;

  const verificationUrl = certificate
    ? `https://aibankinginstitute.com/verify/${certificate.certificate_id}`
    : null;

  return (
    <main className="min-h-screen bg-[var(--color-linen)] px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Page header */}
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--color-slate)] mb-2 font-sans">
            The AI Banking Institute
          </p>
          <h1
            className="text-4xl font-bold text-[var(--color-ink)] mb-4"
            style={{ fontFamily: 'Cormorant, Cormorant Garamond, Georgia, serif' }}
          >
            {certificate ? 'Your Certificate' : 'Certificate Pending'}
          </h1>
          {certificate && (
            <p className="text-[var(--color-slate)] font-sans text-sm">
              Awarded to{' '}
              <span className="text-[var(--color-ink)] font-semibold">{certificate.holder_name}</span>{' '}
              on {formatDate(certificate.issued_at)}
            </p>
          )}
        </div>

        {certificate ? (
          <>
            {/* Certificate details card */}
            <div
              className="bg-[var(--color-parch)] border border-[color-mix(in srgb, var(--color-terra) 20%, transparent)] rounded-sm p-8 mb-8 relative overflow-hidden"
            >
              {/* Inner ruling border */}
              <div
                className="absolute inset-1 border border-[color-mix(in srgb, var(--color-terra) 10%, transparent)] pointer-events-none"
              />

              <div className="text-center relative z-10">
                <p
                  className="font-serif text-sm italic text-[var(--color-slate)] mb-2"
                  style={{ fontFamily: 'Cormorant, Georgia, serif' }}
                >
                  AI Banking Institute Presents
                </p>
                <p
                  className="text-3xl font-bold text-[var(--color-ink)] uppercase tracking-widest mb-6"
                  style={{ fontFamily: 'Cormorant, Georgia, serif' }}
                >
                  Certificate of Achievement
                </p>

                <div className="w-16 h-px bg-[var(--color-terra)] opacity-40 mx-auto mb-6" />

                <p
                  className="font-serif text-sm italic text-[var(--color-slate)] mb-3"
                  style={{ fontFamily: 'Cormorant, Georgia, serif' }}
                >
                  This honors the distinguished performance of
                </p>
                <p
                  className="text-3xl font-bold text-[var(--color-terra)] mb-4"
                  style={{ fontFamily: 'Cormorant, Georgia, serif' }}
                >
                  {certificate.holder_name}
                </p>
                <p className="text-xs uppercase tracking-widest text-[var(--color-ink)] font-sans mb-2">
                  For completing the specialized curriculum of
                </p>
                <p
                  className="text-xl font-bold text-[var(--color-ink)] uppercase tracking-wide"
                  style={{ fontFamily: 'Cormorant SC, Cormorant, Georgia, serif' }}
                >
                  Foundations Certificate
                </p>
                <p
                  className="text-sm font-bold text-[var(--color-slate)] uppercase tracking-wider mt-1"
                  style={{ fontFamily: 'Cormorant SC, Cormorant, Georgia, serif' }}
                >
                  The AI Banking Institute
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-[color-mix(in srgb, var(--color-terra) 15%, transparent)] grid grid-cols-2 gap-4 text-sm relative z-10">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--color-slate)] font-sans mb-1">
                    Issue Date
                  </p>
                  <p
                    className="text-[var(--color-ink)]"
                    style={{ fontFamily: 'DM Mono, Courier New, monospace', fontSize: '12px' }}
                  >
                    {formatDate(certificate.issued_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--color-slate)] font-sans mb-1">
                    Certificate ID
                  </p>
                  <p
                    className="text-[var(--color-ink)]"
                    style={{ fontFamily: 'DM Mono, Courier New, monospace', fontSize: '10px' }}
                  >
                    {certificate.certificate_id}
                  </p>
                </div>
              </div>

              {verificationUrl && (
                <div className="mt-4 text-center relative z-10">
                  <a
                    href={verificationUrl}
                    className="text-[var(--color-slate)] hover:text-[var(--color-terra)] transition-colors"
                    style={{
                      fontFamily: 'DM Mono, Courier New, monospace',
                      fontSize: '10px',
                    }}
                  >
                    Verify at {verificationUrl}
                  </a>
                </div>
              )}
            </div>

            {/* Next Steps section */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                {/* LinkedIn placeholder card */}
                <div className="bg-white border border-[color-mix(in srgb, var(--color-terra) 10%, transparent)] rounded-sm p-6">
                  <div className="w-8 h-8 bg-[var(--color-terra)] rounded-sm flex items-center justify-center mb-3">
                    <span className="text-white text-xs font-bold font-sans">in</span>
                  </div>
                  <h3 className="font-bold text-[var(--color-ink)] font-sans mb-2 text-sm">
                    Add to LinkedIn
                  </h3>
                  <p className="text-xs text-[var(--color-slate)] font-sans leading-relaxed mb-3">
                    LinkedIn badge integration coming soon. In the meantime, you can reference
                    your credential as:
                  </p>
                  <p
                    className="text-xs text-[var(--color-ink)] bg-[var(--color-parch)] p-3 rounded-sm leading-relaxed"
                    style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
                  >
                    AiBI Foundations &mdash; The AI Banking Institute
                    <br />
                    Verified at aibankinginstitute.com/verify/{certificate.certificate_id}
                  </p>
                </div>

                {/* Download PDF card */}
                <div className="bg-white border border-[color-mix(in srgb, var(--color-terra) 10%, transparent)] rounded-sm p-6">
                  <div className="w-8 h-8 bg-[var(--color-sage)] rounded-sm flex items-center justify-center mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4 text-white"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a.75.75 0 01.75.75v9.69l2.72-2.72a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 111.06-1.06l2.72 2.72V3.75A.75.75 0 0110 3z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M3 14.75a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-[var(--color-ink)] font-sans mb-2 text-sm">
                    Download PDF
                  </h3>
                  <p className="text-xs text-[var(--color-slate)] font-sans leading-relaxed mb-4">
                    High-resolution vector format suitable for institutional framing.
                  </p>
                  <a
                    href={`/api/courses/generate-certificate?enrollmentId=${enrollment.id}`}
                    download={`AiBI Foundations-Certificate-${certificate.certificate_id}.pdf`}
                    className="inline-block w-full text-center bg-[var(--color-terra)] text-white text-xs font-semibold font-sans py-2.5 px-4 rounded-sm hover:bg-[var(--color-terra-light)] transition-colors"
                  >
                    Download Certificate PDF
                  </a>
                </div>
              </div>

              {/* Next steps promotion card */}
              <div className="bg-[var(--color-terra)] text-white rounded-sm p-6 flex flex-col justify-center">
                <p className="text-xs uppercase tracking-widest font-sans mb-2 opacity-80">
                  What&rsquo;s Next
                </p>
                <h3
                  className="text-2xl font-bold mb-4"
                  style={{ fontFamily: 'Cormorant, Georgia, serif' }}
                >
                  Continue Your Journey
                </h3>
                <p className="text-xs leading-relaxed mb-5 opacity-90 font-sans">
                  Your AiBI Foundations credential will open the door to the Specialist
                  track when advanced training launches.
                </p>
                <a
                  href="/coming-soon?interest=specialist"
                  className="inline-block text-center bg-[var(--color-parch)] text-[var(--color-terra)] text-xs font-bold font-sans py-2.5 px-4 rounded-sm hover:bg-white transition-colors"
                >
                  Join Specialist Waitlist
                </a>
              </div>
            </div>
          </>
        ) : (
          /* Certificate not yet issued */
          <div className="text-center bg-[var(--color-parch)] border border-[color-mix(in srgb, var(--color-terra) 15%, transparent)] rounded-sm p-12">
            <div className="w-16 h-16 bg-[color-mix(in srgb, var(--color-terra) 10%, transparent)] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-8 h-8 text-[var(--color-terra)]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2
              className="text-2xl font-bold text-[var(--color-ink)] mb-3"
              style={{ fontFamily: 'Cormorant, Georgia, serif' }}
            >
              Your Certificate Is Being Generated
            </h2>
            <p className="text-[var(--color-slate)] font-sans text-sm mb-6 max-w-md mx-auto">
              Your submission has been reviewed and approved. Your certificate will
              appear here shortly. Please refresh this page in a moment.
            </p>
            <a
              href="/courses/aibi-p/certificate"
              className="inline-block bg-[var(--color-terra)] text-white text-xs font-semibold font-sans py-2.5 px-6 rounded-sm hover:bg-[var(--color-terra-light)] transition-colors"
            >
              Refresh Page
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
