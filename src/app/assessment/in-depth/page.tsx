// /assessment/in-depth — landing for the paid 48-question In-Depth Assessment.
//
// Sells the $99 In-Depth as the recommended path. The free 12-question scan
// is positioned as the "curious browser" alternative inside a side-by-side
// comparison that doubles as the buying surface — no duplicate pricing
// blocks below.
//
// Pricing per Plans/aibi-launch-spec-v2.md §1b: $99 individual. Team
// cohorts now live at /assessment/team so this page must stay clearly
// positioned as a one-person diagnostic, not an institutional or board
// report.
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
import { PurchaseButton } from './_components/PurchaseButton';
import { INTER_STACK } from '@/lib/ui/fonts';

export const dynamic = 'force-dynamic';


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
    'An individual AI readiness report for banking professionals with eight-dimension scoring, per-dimension root-cause analysis, and a role-level action plan.',
};

interface InDepthAssessmentPageProps {
  readonly searchParams?: Promise<{ readonly reason?: string }>;
}

const KICKER: React.CSSProperties = {
  fontFamily: INTER_STACK,
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 14px',
  borderRadius: 999,
  fontSize: '0.6875rem',
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

export default async function InDepthAssessmentPage(props: InDepthAssessmentPageProps) {
  const searchParams = await props.searchParams;
  const noPurchase = searchParams?.reason === 'no-purchase';
  const signedInEmail = await getSignedInEmail();

  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/assessment/in-depth" />
      <main style={{ background: 'var(--cream)', fontFamily: INTER_STACK }}>
        {/* HERO — dark navy marquee. Vertical padding is responsive (clamp)
            so the Purchase CTA clears the fold on small phones (iPhone SE
            class, qa-site-walk U7) while desktop keeps its airier spacing. */}
        <section style={{ padding: 'clamp(24px, 6vw, 64px) 0 clamp(48px, 6vw, 80px)' }}>
          <div className="mk-container">
            <div
              style={{
                background: 'var(--ink)',
                color: '#fff',
                borderRadius: 32,
                padding: 'clamp(28px, 5vw, 56px) clamp(28px, 4vw, 48px)',
                boxShadow: 'var(--shadow-hero)',
              }}
            >
              <span style={{ ...KICKER_GOLD_ON_DARK, marginBottom: 22 }}>
                Individual In-Depth Assessment · $99
              </span>
              <h1
                style={{
                  fontFamily: INTER_STACK,
                  fontWeight: 700,
                  fontSize: 'clamp(2.25rem, 4.5vw, 3.75rem)',
                  lineHeight: 1.03,
                  letterSpacing: '-0.028em',
                  margin: '0 0 22px',
                  color: '#fff',
                  maxWidth: '20ch',
                }}
              >
                Know where <span style={{ color: 'var(--gold)' }}>you</span>{' '}
                are ready to use AI at work.
              </h1>
              <p
                style={{
                  fontFamily: INTER_STACK,
                  fontSize: '1.125rem',
                  lineHeight: 1.55,
                  color: 'var(--on-dark-80)',
                  margin: '0 0 32px',
                  maxWidth: '56ch',
                }}
              >
                Get a written personal report, eight-dimension scoring, and a
                90-day action register keyed to your role. The 48-question
                diagnostic is the engine behind the report, not the product.
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
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    borderBottom: '1px solid var(--gold-a40)',
                    paddingBottom: 2,
                  }}
                >
                  See what&apos;s included →
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
                    fontSize: '0.9375rem',
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

        {/* REPORT + BUY — keep the paid diagnostic as the primary product. */}
        <section id="compare" style={{ padding: '32px 0 64px' }}>
          <div className="mk-container">
            <div style={{ maxWidth: 880, margin: '0 auto 48px' }}>
              <span style={{ ...KICKER_GOLD_ON_LIGHT, marginBottom: 14 }}>
                In-depth assessment
              </span>
              <h2
                style={{
                  fontFamily: INTER_STACK,
                  fontSize: 'clamp(1.75rem, 3.4vw, 2.75rem)',
                  fontWeight: 700,
                  lineHeight: 1.08,
                  letterSpacing: '-0.02em',
                  color: 'var(--ink)',
                  margin: '14px 0 16px',
                  maxWidth: '24ch',
                }}
              >
                Your report, eight scores, and{' '}
                <span style={{ color: 'var(--gold-deep)' }}>90-day action register.</span>
              </h2>
              <p
                style={{
                  fontFamily: INTER_STACK,
                  fontSize: '1.0625rem',
                  lineHeight: 1.55,
                  color: 'var(--slate-600)',
                  margin: 0,
                  maxWidth: '52ch',
                }}
              >
                Use this when one person needs a deeper readout than the free
                scan: what is strong, what is weak, and what to do next. If
                leaders need department-level evidence, request a scoped Team
                Assessment instead.
              </p>
            </div>

            <div
              id="purchase"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 24,
                alignItems: 'stretch',
                maxWidth: 780,
                margin: '0 auto',
              }}
              className="mk-in-depth-grid"
            >
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
                    fontSize: '0.6875rem',
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
                  For individual professionals
                </span>
                <h3
                  style={{
                    fontFamily: INTER_STACK,
                    fontSize: '1.75rem',
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
                    fontSize: '0.9375rem',
                    lineHeight: 1.55,
                    color: 'var(--slate-600)',
                    margin: '0 0 24px',
                    maxWidth: '42ch',
                  }}
                >
                  A written report with eight-dimension scoring, per-dimension
                  root causes, and a ninety-day playbook keyed to your weakest
                  areas.
                </p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 24 }}>
                  <p
                    style={{
                      fontFamily: INTER_STACK,
                      fontSize: '3.25rem',
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
                      fontSize: '0.75rem',
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
                      Need 10+ people? Request Team
                    </span>
                  </p>
                </div>

                <PurchaseButton userEmail={signedInEmail ?? undefined} />

                <p
                  style={{
                    fontFamily: INTER_STACK,
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--slate-500)',
                    margin: '14px 0 0',
                  }}
                >
                  Pay once · Report in 20 min · Retake by request within 12 months
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
                      'A personal report with per-dimension root-cause analysis',
                      'Role-level strengths, gaps, and review notes',
                      'A ninety-day action register keyed to your lowest-scoring dimensions',
                    ].map((item) => (
                      <li
                        key={item}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '20px 1fr',
                          gap: 10,
                          fontFamily: INTER_STACK,
                          fontSize: '0.875rem',
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
                <a
                  href="/assessment/take"
                  style={{
                    marginTop: 18,
                    alignSelf: 'flex-start',
                    color: 'var(--gold-deep)',
                    fontFamily: INTER_STACK,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    borderBottom: '1px solid var(--gold-a40)',
                    paddingBottom: 2,
                  }}
                >
                  Not ready? Take the free 12-question snapshot →
                </a>
              </article>
            </div>
          </div>
        </section>


        {/* USE CASES — in-depth page should stay centered on the paid diagnostic. */}
        <section style={{ padding: '64px 0 96px', background: 'var(--cream-2)', borderTop: '1px solid var(--ink-a10)' }}>
          <div className="mk-container">
            <div style={{ maxWidth: 720, margin: '0 auto 36px' }}>
              <span style={{ ...KICKER_GOLD_ON_LIGHT, marginBottom: 14 }}>
                Use it when
              </span>
              <h2
                style={{
                  fontFamily: INTER_STACK,
                  fontSize: 'clamp(1.75rem, 3.4vw, 2.75rem)',
                  fontWeight: 700,
                  lineHeight: 1.08,
                  letterSpacing: '-0.02em',
                  color: 'var(--ink)',
                  margin: '14px 0 0',
                  maxWidth: '24ch',
                }}
              >
                The in-depth assessment answers your next-step questions.
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
                kicker="Personal baseline"
                title="You want more than a quick score."
                body="A normalized score, maturity band, and written explanation of what your answers say about your own AI readiness."
                ctaLabel="Purchase In-Depth →"
                ctaHref="/assessment/in-depth#purchase"
              />
              <NarrativeCard
                featured
                kicker="Eight dimensions"
                title="You need to know what is weak."
                body="Dimension-level gaps turn a generic AI conversation into concrete priorities for your role, your workflows, and your next month of practice."
                ctaLabel="Purchase In-Depth → "
                ctaHref="/assessment/in-depth#purchase"
              />
              <NarrativeCard
                kicker="Team assessment"
                title="Leaders need a cohort view."
                body="Request the Team Assessment when the institution needs aggregate readiness, department slices, participant completion, and a leadership-ready rollup."
                ctaLabel="Request team assessment →"
                ctaHref="/assessment/team"
              />
            </div>

            <p
              style={{
                fontFamily: INTER_STACK,
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: 'var(--slate-600)',
                margin: '32px auto 0',
                maxWidth: '60ch',
                textAlign: 'center',
              }}
            >
              Need an institutional readout? The Team Assessment is scoped
              with your sponsor first, then uses a shared cohort link and
              unlocks aggregate reporting after ten completions.{' '}
              <Link
                href="/assessment/team"
                style={{ color: 'var(--gold-deep)', fontWeight: 600, textDecoration: 'underline' }}
              >
                View the assisted Team Assessment
              </Link>
              .
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
          fontSize: '1.5rem',
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
          fontSize: '0.9375rem',
          lineHeight: 1.55,
          color: 'var(--slate-600)',
          margin: 0,
          flex: 1,
        }}
      >
        {props.body}
      </p>
      <Link
        href={props.ctaHref}
        style={{
          fontFamily: INTER_STACK,
          fontSize: '0.75rem',
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
      </Link>
    </article>
  );
}
