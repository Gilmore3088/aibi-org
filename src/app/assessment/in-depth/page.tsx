// /assessment/in-depth — landing for the paid 48-question In-Depth Assessment.
//
// Sells the $99 In-Depth as the recommended path. The free 12-question scan
// is positioned as the "curious browser" alternative inside a side-by-side
// comparison that doubles as the buying surface — no duplicate pricing
// blocks below.
//
// Pricing per Plans/aibi-launch-spec-v2.md §1b: $99 individual; $79/seat
// at 10+ by email request. Self-serve team checkout is deferred — the
// in-depth checkout route returns 503 for mode='institution' and nudges
// buyers to email hello@aibankinginstitute.com.
//
// In-Depth runs on assessment v4 — 48 questions across 8 strategic
// dimensions, normalized 0-100 score, 5 maturity bands (Unstructured,
// Emerging, Building Momentum, Controlled Scale, Advanced). 10-role
// taxonomy with role-keyed report output. See:
//   - docs/Plans/assessment-architecture-rebuild.md (Phase 2 + 3)
//   - content/assessments/v4/ (canonical content)
// The free funnel uses v3 (12 questions, 12 individual-voice signals).

import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { SiteHeader } from '@/components/mockup';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { BRAND } from '@content/copy';
import { PurchaseButton } from './_components/PurchaseButton';

export const dynamic = 'force-dynamic';

const INTER_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

async function getSignedInEmail(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const cookieStore = await cookies();
    const supabase = ssrCreateServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    });
    const { data } = await supabase.auth.getUser();
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}

export const metadata: Metadata = {
  alternates: { canonical: '/assessment/in-depth' },
  title: 'In-Depth Assessment | The AI Banking Institute',
  description:
    'A 48-question, eight-dimension diagnostic for community banks and credit unions. Individual report plus an anonymized aggregate dashboard for institution leaders.',
};

interface InDepthAssessmentPageProps {
  readonly searchParams?: { readonly reason?: string };
}

const KICKER: React.CSSProperties = {
  fontFamily: INTER_STACK,
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 14px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
};

const KICKER_GOLD_ON_DARK: React.CSSProperties = {
  ...KICKER,
  background: 'var(--gold-a20)',
  color: 'var(--gold-soft)',
};

const KICKER_GOLD_ON_LIGHT: React.CSSProperties = {
  ...KICKER,
  background: 'var(--gold-a10)',
  color: 'var(--gold-deep)',
};

export default async function InDepthAssessmentPage({
  searchParams,
}: InDepthAssessmentPageProps) {
  const noPurchase = searchParams?.reason === 'no-purchase';
  const signedInEmail = await getSignedInEmail();

  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/assessment/in-depth" />
      <main style={{ background: 'var(--cream)', fontFamily: INTER_STACK }}>
        {/* HERO — dark navy marquee */}
        <section style={{ padding: '64px 0 80px' }}>
          <div className="mk-container">
            <div
              style={{
                background: 'var(--ink)',
                color: '#fff',
                borderRadius: 32,
                padding: 'clamp(36px, 5vw, 56px) clamp(28px, 4vw, 48px)',
                boxShadow: 'var(--shadow-hero)',
              }}
            >
              <span style={{ ...KICKER_GOLD_ON_DARK, marginBottom: 22 }}>
                In-Depth Assessment · $99 · Board-ready
              </span>
              <h1
                style={{
                  fontFamily: INTER_STACK,
                  fontWeight: 700,
                  fontSize: 'clamp(36px, 4.5vw, 60px)',
                  lineHeight: 1.03,
                  letterSpacing: '-0.028em',
                  margin: '0 0 22px',
                  color: '#fff',
                  maxWidth: '20ch',
                }}
              >
                The{' '}
                <span style={{ color: 'var(--gold)' }}>board-ready</span>{' '}
                diagnostic for your institution.
              </h1>
              <p
                style={{
                  fontFamily: INTER_STACK,
                  fontSize: 18,
                  lineHeight: 1.55,
                  color: 'var(--on-dark-80)',
                  margin: '0 0 32px',
                  maxWidth: '56ch',
                }}
              >
                Forty-eight questions. Twenty minutes. Eight readiness dimensions.
                A written report you can take to your board on Monday.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
                <PurchaseButton
                  userEmail={signedInEmail ?? undefined}
                  label="Purchase In-Depth · $99"
                  pendingLabel="Starting checkout…"
                  size="hero"
                />
                <a
                  href="#compare"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'var(--gold-soft)',
                    fontFamily: INTER_STACK,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    borderBottom: '1px solid var(--gold-a40)',
                    paddingBottom: 2,
                  }}
                >
                  Compare with the free scan →
                </a>
              </div>
            </div>
          </div>
        </section>

        {noPurchase && (
          <section style={{ padding: '0 0 32px' }}>
            <div className="mk-container">
              <div
                role="status"
                style={{
                  maxWidth: 880,
                  margin: '0 auto',
                  background: '#fff',
                  border: '1px solid var(--gold-a40)',
                  borderLeft: '4px solid var(--gold)',
                  padding: '20px 24px',
                  borderRadius: 16,
                  boxShadow: 'var(--shadow-soft)',
                }}
              >
                <span style={{ ...KICKER_GOLD_ON_LIGHT, marginBottom: 10 }}>
                  Purchase required
                </span>
                <p
                  style={{
                    margin: '10px 0 0',
                    fontFamily: INTER_STACK,
                    fontSize: 15,
                    lineHeight: 1.55,
                    color: 'var(--ink)',
                  }}
                >
                  The forty-eight-question In-Depth Assessment is paid. Purchase a
                  seat below to open it. Already paid? Make sure you are signed
                  in with the same email you used at checkout.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* COMPARE + BUY — two product cards, In-Depth recommended */}
        <section id="compare" style={{ padding: '32px 0 64px' }}>
          <div className="mk-container">
            <div style={{ maxWidth: 880, margin: '0 auto 48px' }}>
              <span style={{ ...KICKER_GOLD_ON_LIGHT, marginBottom: 14 }}>
                Two ways in
              </span>
              <h2
                style={{
                  fontFamily: INTER_STACK,
                  fontSize: 'clamp(28px, 3.4vw, 44px)',
                  fontWeight: 700,
                  lineHeight: 1.08,
                  letterSpacing: '-0.02em',
                  color: 'var(--ink)',
                  margin: '14px 0 16px',
                  maxWidth: '22ch',
                }}
              >
                Curious, or{' '}
                <span style={{ color: 'var(--gold-deep)' }}>deciding</span>?
              </h2>
              <p
                style={{
                  fontFamily: INTER_STACK,
                  fontSize: 17,
                  lineHeight: 1.55,
                  color: 'var(--slate-600)',
                  margin: 0,
                  maxWidth: '52ch',
                }}
              >
                The free scan tells you roughly where you stand. The In-Depth
                tells you what to do about it — and gives you a document to hand
                your CEO, your board, or your examiner.
              </p>
            </div>

            <div
              id="purchase"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 24,
                alignItems: 'stretch',
              }}
              className="mk-in-depth-grid"
            >
              {/* FREE — the curious browser */}
              <article
                style={{
                  border: '1px solid var(--ink-a10)',
                  background: '#fff',
                  borderRadius: 24,
                  padding: 'clamp(28px, 3.4vw, 40px)',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'var(--shadow-soft)',
                }}
              >
                <span style={{ ...KICKER_GOLD_ON_LIGHT, marginBottom: 16, alignSelf: 'flex-start' }}>
                  For the curious
                </span>
                <h3
                  style={{
                    fontFamily: INTER_STACK,
                    fontSize: 28,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    letterSpacing: '-0.015em',
                    color: 'var(--ink)',
                    margin: '0 0 10px',
                  }}
                >
                  Free Readiness Scan
                </h3>
                <p
                  style={{
                    fontFamily: INTER_STACK,
                    fontSize: 15,
                    lineHeight: 1.55,
                    color: 'var(--slate-600)',
                    margin: '0 0 24px',
                    maxWidth: '34ch',
                  }}
                >
                  Twelve questions. Three minutes. A score and a tier — enough
                  to know which conversation to start at your bank.
                </p>
                <p
                  style={{
                    fontFamily: INTER_STACK,
                    fontSize: 36,
                    fontWeight: 700,
                    color: 'var(--ink)',
                    lineHeight: 1,
                    margin: '0 0 24px',
                  }}
                >
                  Free
                </p>
                <Link
                  href="/assessment/take"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '14px 22px',
                    borderRadius: 12,
                    border: '1px solid var(--ink)',
                    color: 'var(--ink)',
                    fontFamily: INTER_STACK,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                  }}
                >
                  Take the free scan →
                </Link>
                <p
                  style={{
                    fontFamily: INTER_STACK,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--slate-500)',
                    margin: '14px 0 0',
                  }}
                >
                  No account required
                </p>
              </article>

              {/* IN-DEPTH — recommended, gold-bordered */}
              <article
                style={{
                  position: 'relative',
                  border: '2px solid var(--gold)',
                  background: '#fff',
                  borderRadius: 24,
                  padding: 'clamp(28px, 3.4vw, 40px)',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'var(--shadow-feature)',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: -14,
                    left: 24,
                    background: 'var(--gold)',
                    color: 'var(--ink)',
                    fontFamily: INTER_STACK,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    padding: '4px 12px',
                    borderRadius: 999,
                  }}
                >
                  Recommended
                </span>
                <span style={{ ...KICKER_GOLD_ON_LIGHT, marginBottom: 16, alignSelf: 'flex-start' }}>
                  For decision-makers
                </span>
                <h3
                  style={{
                    fontFamily: INTER_STACK,
                    fontSize: 28,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    letterSpacing: '-0.015em',
                    color: 'var(--ink)',
                    margin: '0 0 10px',
                  }}
                >
                  In-Depth Assessment
                </h3>
                <p
                  style={{
                    fontFamily: INTER_STACK,
                    fontSize: 15,
                    lineHeight: 1.55,
                    color: 'var(--slate-600)',
                    margin: '0 0 24px',
                    maxWidth: '42ch',
                  }}
                >
                  Forty-eight questions across eight dimensions. A written
                  report with peer-band comparison and a ninety-day playbook
                  keyed to your weakest area.
                </p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 24 }}>
                  <p
                    style={{
                      fontFamily: INTER_STACK,
                      fontSize: 52,
                      fontWeight: 700,
                      color: 'var(--ink)',
                      lineHeight: 1,
                      margin: 0,
                    }}
                  >
                    $99
                  </p>
                  <p
                    style={{
                      fontFamily: INTER_STACK,
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      color: 'var(--slate-500)',
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    per individual
                    <br />
                    <span style={{ color: 'var(--slate-500)' }}>
                      $79/seat at 10+ · by request
                    </span>
                  </p>
                </div>

                <PurchaseButton userEmail={signedInEmail ?? undefined} />

                <p
                  style={{
                    fontFamily: INTER_STACK,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--slate-500)',
                    margin: '14px 0 0',
                  }}
                >
                  Pay once · Report in 20 min · One free retake within 12 months
                </p>

                <div
                  style={{
                    marginTop: 32,
                    paddingTop: 24,
                    borderTop: '1px solid var(--ink-a10)',
                  }}
                >
                  <span style={{ ...KICKER_GOLD_ON_LIGHT, marginBottom: 16, display: 'inline-flex' }}>
                    What&apos;s in the report
                  </span>
                  <ul style={{ listStyle: 'none', margin: '14px 0 0', padding: 0, display: 'grid', gap: 12 }}>
                    {[
                      'Forty-eight questions across eight readiness dimensions',
                      'A full individual report with peer-band comparison',
                      'A starting playbook keyed to your lowest-scoring dimensions',
                      'Anonymized aggregate dashboard for institution leaders',
                    ].map((item) => (
                      <li
                        key={item}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '20px 1fr',
                          gap: 10,
                          fontFamily: INTER_STACK,
                          fontSize: 14,
                          lineHeight: 1.5,
                          color: 'var(--ink)',
                        }}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            color: 'var(--gold-deep)',
                            paddingTop: 2,
                            fontWeight: 700,
                          }}
                        >
                          —
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </section>


        {/* THREE WAYS — narrative replacement for the old 8-row comparison
            table. Per 2026-05-28 audit reframe: 'a banking/research brand
            shouldn't read like a SaaS pricing table'. */}
        <section style={{ padding: '64px 0 96px', background: 'var(--cream-2)', borderTop: '1px solid var(--ink-a10)' }}>
          <div className="mk-container">
            <div style={{ maxWidth: 720, margin: '0 auto 36px' }}>
              <span style={{ ...KICKER_GOLD_ON_LIGHT, marginBottom: 14 }}>
                Three ways in
              </span>
              <h2
                style={{
                  fontFamily: INTER_STACK,
                  fontSize: 'clamp(28px, 3.4vw, 44px)',
                  fontWeight: 700,
                  lineHeight: 1.08,
                  letterSpacing: '-0.02em',
                  color: 'var(--ink)',
                  margin: '14px 0 0',
                  maxWidth: '24ch',
                }}
              >
                Different jobs, different reports.
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 20,
                maxWidth: 1100,
                margin: '0 auto',
              }}
              className="mk-three-ways-grid"
            >
              <NarrativeCard
                kicker="Free · 3 min"
                title="Know where to start."
                body="Twelve questions. A score and a tier. Enough to decide which conversation to have next — internal training, a board update, or the In-Depth diagnostic."
                ctaLabel="Take the free scan →"
                ctaHref="/assessment"
              />
              <NarrativeCard
                featured
                kicker=" · Recommended"
                title="Know what to do."
                body="Forty-eight questions across eight dimensions. A written report with peer-band comparison and a ninety-day playbook keyed to your lowest-scoring dimensions."
                ctaLabel="Purchase In-Depth → "
                ctaHref="/assessment/in-depth#purchase"
              />
              <NarrativeCard
                kicker="Team · 10+ seats"
                title="Know where your departments differ."
                body="Anonymized cohort dashboard. Per-dimension medians and p25/p75 bands across your roster. Pair with a coached rollout for institutions running real change."
                ctaLabel="Book Executive Briefing →"
                ctaHref="/for-institutions/advisory"
              />
            </div>

            <p
              style={{
                fontFamily: INTER_STACK,
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--slate-600)',
                margin: '32px auto 0',
                maxWidth: '60ch',
                textAlign: 'center',
              }}
            >
              Per-seat pricing of $79/seat opens at ten or more.{' '}
              <a
                href={`mailto:${BRAND.emails.contact}?subject=In-Depth%20Assessment%20%E2%80%94%2010%2B%20seats`}
                style={{ color: 'var(--gold-deep)', fontWeight: 600, textDecoration: 'underline' }}
              >
                Email the Institute
              </a>{' '}
              to set it up.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

// NarrativeCard — three-card replacement for the old comparison table.
// Each card is a "job" not a "tier" — leads with what the buyer learns,
// not what they get. Audit 2026-05-28: "the brand is more like an
// education/research institute than a SaaS pricing matrix".
function NarrativeCard(props: {
  readonly kicker: string;
  readonly title: string;
  readonly body: string;
  readonly ctaLabel: string;
  readonly ctaHref: string;
  readonly featured?: boolean;
}) {
  return (
    <article
      style={{
        border: props.featured ? '2px solid var(--gold)' : '1px solid var(--ink-a10)',
        background: '#fff',
        borderRadius: 24,
        padding: 'clamp(28px, 3.4vw, 36px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        boxShadow: props.featured ? '0 24px 50px -20px rgba(0, 0, 0, 0.30)' : 'var(--shadow-soft)',
      }}
    >
      <span style={{ ...KICKER_GOLD_ON_LIGHT }}>{props.kicker}</span>
      <h3
        style={{
          fontFamily: INTER_STACK,
          fontSize: 24,
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: '-0.015em',
          color: 'var(--ink)',
          margin: 0,
        }}
      >
        {props.title}
      </h3>
      <p
        style={{
          fontFamily: INTER_STACK,
          fontSize: 15,
          lineHeight: 1.55,
          color: 'var(--slate-600)',
          margin: 0,
          flex: 1,
        }}
      >
        {props.body}
      </p>
      <a
        href={props.ctaHref}
        style={{
          fontFamily: INTER_STACK,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--ink)',
          textDecoration: 'none',
          borderBottom: '1px solid var(--ink)',
          paddingBottom: 2,
          alignSelf: 'flex-start',
        }}
      >
        {props.ctaLabel}
      </a>
    </article>
  );
}
