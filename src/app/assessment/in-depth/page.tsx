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
import Image from 'next/image';
import { SiteHeader } from '@/components/mockup';
import { AxHero, AxSection, AxWindow } from '@/components/ax';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { PurchaseButton } from './_components/PurchaseButton';

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
  title: 'In-Depth Assessment',
  description:
    'An individual AI readiness report for banking professionals with eight-dimension scoring, per-dimension root-cause analysis, and a role-level action plan.',
};

interface InDepthAssessmentPageProps {
  readonly searchParams?: Promise<{ readonly reason?: string }>;
}

const REPORT_CONTENTS = [
  'Forty-eight questions across eight readiness dimensions',
  'A personal report with per-dimension root-cause analysis',
  'A ninety-day action register keyed to your lowest-scoring dimensions',
] as const;

// Real pages from public/downloads/in-depth-playbook.pdf, rendered by
// scripts/render-pdf-covers.sh.
const PLAYBOOK_PAGES = [
  { src: '/downloads/covers/in-depth-playbook.jpg', alt: 'Your First AI Win — 90-day playbook, cover' },
  { src: '/downloads/covers/in-depth-playbook-p2.jpg', alt: 'Playbook page: the operating principle' },
  { src: '/downloads/covers/in-depth-playbook-p5.jpg', alt: 'Playbook page: pick the path that matches your top dimension' },
  { src: '/downloads/covers/in-depth-playbook-p9.jpg', alt: 'Playbook page: run a measurable pilot in 90 days' },
] as const;

const USE_CASES = [
  {
    kicker: 'Personal baseline',
    title: 'You want more than a quick score.',
    body: 'A normalized score, maturity band, and written explanation of what your answers say about your own AI readiness.',
    ctaLabel: 'Purchase In-Depth →',
    ctaHref: '/assessment/in-depth#purchase',
  },
  {
    kicker: 'Eight dimensions',
    title: 'You need to know what is weak.',
    body: 'Dimension-level gaps turn a generic AI conversation into concrete priorities for your role, your workflows, and your next month of practice.',
    ctaLabel: 'Purchase In-Depth →',
    ctaHref: '/assessment/in-depth#purchase',
  },
  {
    kicker: 'Team assessment',
    title: 'Leaders need a cohort view.',
    body: 'Request the Team Assessment when the institution needs aggregate readiness, department slices, participant completion, and a leadership-ready rollup.',
    ctaLabel: 'Request team assessment →',
    ctaHref: '/assessment/team',
  },
] as const;

export default async function InDepthAssessmentPage(props: InDepthAssessmentPageProps) {
  const searchParams = await props.searchParams;
  const noPurchase = searchParams?.reason === 'no-purchase';
  const signedInEmail = await getSignedInEmail();

  return (
    <div className="mockup-scope ax-page">
      <SiteHeader activePath="/assessment/in-depth" />
      <main>
        <AxHero
          cmd="assessment in-depth --questions 48 --dimensions 8 --price 99"
          title={
            <>
              Know where <span className="ax-gold">you</span> are ready to use AI at work.
            </>
          }
          lede="Get a written personal report, eight-dimension scoring, and a 90-day action register keyed to your role. The 48-question diagnostic is the engine behind the report, not the product."
          actions={
            <>
              <PurchaseButton
                userEmail={signedInEmail ?? undefined}
                label="Purchase In-Depth · $99"
                pendingLabel="Starting checkout…"
                size="hero"
              />
              <a href="#compare" className="ax-link-mono">
                see what&apos;s included →
              </a>
            </>
          }
          aside={
            <div className="ax-pages" aria-label="Pages from the 90-day playbook">
              {PLAYBOOK_PAGES.map((page) => (
                <Image key={page.src} src={page.src} alt={page.alt} width={700} height={906} sizes="(min-width: 1024px) 220px, 45vw" />
              ))}
            </div>
          }
        />

        {noPurchase && (
          <section className="ax-section" style={{ paddingTop: 0 }}>
            <div className="mk-container">
              <div role="status" className="ax-status">
                <p className="ax-k ax-gold">Purchase required</p>
                <p>
                  The forty-eight-question In-Depth Assessment is paid. Purchase a seat below to open it. Already
                  paid? Make sure you are signed in with the same email you used at checkout.
                </p>
              </div>
            </div>
          </section>
        )}

        <AxSection
          light
          id="compare"
          kicker="In-depth assessment"
          title={
            <>
              Your report, eight scores, and a <span className="ax-gold">90-day action register.</span>
            </>
          }
          lede="Use this when one person needs a deeper readout than the free scan: what is strong, what is weak, and what to do next. If leaders need department-level evidence, request a scoped Team Assessment instead."
        >
          <div id="purchase" className="ax-buy">
            <AxWindow title="in-depth-assessment" meta="recommended · for individual professionals">
              <div className="ax-enroll">
                <div>
                  <h3 className="ax-window-h">In-Depth Assessment</h3>
                  <p className="ax-muted ax-para">
                    A written report with eight-dimension scoring, per-dimension root causes, and a ninety-day
                    playbook keyed to your weakest areas.
                  </p>
                  <p className="ax-enroll-price" style={{ marginTop: 24 }}>
                    $99
                  </p>
                  <p className="ax-plan-price" style={{ margin: '0 0 20px' }}>
                    <span>
                      per individual ·{' '}
                      <Link href="/assessment/team" className="ax-link-mono">
                        Need 10+ people? Request Team
                      </Link>
                    </span>
                  </p>
                  <PurchaseButton userEmail={signedInEmail ?? undefined} />
                  <p className="ax-fineprint">Pay once · Report in 20 min · Retake by request within 12 months</p>
                </div>
                <div>
                  <p className="ax-k">What&apos;s in the report</p>
                  <ul className="ax-checklist" style={{ marginTop: 14 }}>
                    {REPORT_CONTENTS.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p style={{ marginTop: 24 }}>
                    <a href="/assessment/take" className="ax-link-mono">
                      Not ready? Take the free 12-question snapshot →
                    </a>
                  </p>
                </div>
              </div>
            </AxWindow>
          </div>
        </AxSection>

        <AxSection id="use-it-when" kicker="Use it when" title="The in-depth assessment answers your next-step questions.">
          <div className="ax-options">
            {USE_CASES.map((c) => (
              <article key={c.title} className="ax-option">
                <div className="ax-option-head">
                  <span className="ax-k ax-gold">{c.kicker}</span>
                  <h3>{c.title}</h3>
                </div>
                <div className="ax-option-body">
                  <p>{c.body}</p>
                </div>
                <div className="ax-option-cta">
                  <Link href={c.ctaHref} className="ax-link-mono">
                    {c.ctaLabel}
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <p className="ax-fineprint" style={{ marginTop: 24, maxWidth: '70ch' }}>
            Need an institutional readout? The Team Assessment is scoped with your sponsor first, then uses a
            shared cohort link and unlocks aggregate reporting after ten completions.{' '}
            <Link href="/assessment/team" className="ax-link-mono">
              View the assisted Team Assessment
            </Link>
            .
          </p>
        </AxSection>
      </main>
    </div>
  );
}
