// /dashboard/assessments — history of the current user's completed
// assessments (free + in-depth) plus links into each result. Scoped in
// PR #44 and carried forward via #48. Reads from assessment_responses
// and course_enrollments by email-variants + user_id, matching the
// gating pattern used elsewhere via findEnrollmentByEmailOrUserId.

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { emailVariants } from '@/lib/email/canonicalize';

export const metadata: Metadata = {
  title: 'Your assessments | The AI Banking Institute',
  description: 'History of your AI readiness assessments.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface FreeAssessmentRow {
  readonly id: string;
  readonly score: number;
  readonly tier: string | null;
  readonly created_at: string;
}

interface InDepthEnrollmentRow {
  readonly id: string;
  readonly email: string;
  readonly enrolled_at: string;
  readonly stripe_session_id: string | null;
}

export default async function DashboardAssessmentsPage() {
  if (!isSupabaseConfigured()) {
    redirect('/auth/login?next=/dashboard/assessments');
  }

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect('/auth/login?next=/dashboard/assessments');
  }

  const variants = emailVariants(user.email);
  const emailEqList = variants.map((e) => `email.eq.${e}`).join(',');
  const orClause = emailEqList ? `user_id.eq.${user.id},${emailEqList}` : `user_id.eq.${user.id}`;

  const [freeResult, indepthResult] = await Promise.all([
    supabase
      .from('assessment_responses')
      .select('id, score, tier, created_at')
      .or(orClause)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('course_enrollments')
      .select('id, email, enrolled_at, stripe_session_id')
      .or(orClause)
      .eq('product', 'in-depth-assessment')
      .order('enrolled_at', { ascending: false })
      .limit(20),
  ]);

  const free = (freeResult.data ?? []) as FreeAssessmentRow[];
  const indepth = (indepthResult.data ?? []) as InDepthEnrollmentRow[];

  return (
    <main
      className="mockup-scope"
      style={{ maxWidth: 880, margin: '0 auto', padding: '48px 24px 80px' }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--gold-deep)',
          margin: '0 0 12px',
        }}
      >
        Your assessments
      </p>
      <h1
        style={{
          fontSize: 'clamp(36px, 4vw, 52px)',
          fontWeight: 600,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          margin: '0 0 12px',
          color: 'var(--ink)',
        }}
      >
        Assessment history
      </h1>
      <p
        style={{
          fontSize: 17,
          lineHeight: 1.55,
          color: 'var(--slate-600)',
          margin: '0 0 40px',
          maxWidth: '60ch',
        }}
      >
        Every readiness assessment you have taken or purchased, with links
        back into your results.
      </p>

      <section style={{ marginBottom: 40 }}>
        <h2
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--slate-500)',
            borderBottom: '1px solid var(--ink-a10)',
            paddingBottom: 12,
            margin: '0 0 16px',
          }}
        >
          Free readiness checks · {free.length}
        </h2>
        {free.length === 0 ? (
          <p style={{ color: 'var(--slate-600)', fontSize: 14 }}>
            You have not completed the free readiness check yet.{' '}
            <Link
              href="/assessment/start"
              style={{ color: 'var(--gold-deep)', fontWeight: 600 }}
            >
              Take it now →
            </Link>
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {free.map((row) => (
              <li
                key={row.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto auto',
                  alignItems: 'baseline',
                  gap: 16,
                  padding: '14px 0',
                  borderBottom: '1px solid var(--ink-a10)',
                }}
              >
                <span style={{ color: 'var(--ink)', fontWeight: 500 }}>
                  Readiness check
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--slate-500)',
                  }}
                >
                  {new Date(row.created_at).toLocaleDateString()}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--ink)',
                  }}
                >
                  {row.score}
                </span>
                <Link
                  href={`/results/${row.id}`}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--gold-deep)',
                  }}
                >
                  VIEW →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--slate-500)',
            borderBottom: '1px solid var(--ink-a10)',
            paddingBottom: 12,
            margin: '0 0 16px',
          }}
        >
          In-Depth Assessments · {indepth.length}
        </h2>
        {indepth.length === 0 ? (
          <p style={{ color: 'var(--slate-600)', fontSize: 14 }}>
            You have not purchased an In-Depth Assessment.{' '}
            <Link
              href="/assessment/in-depth"
              style={{ color: 'var(--gold-deep)', fontWeight: 600 }}
            >
              Learn more →
            </Link>
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {indepth.map((row) => (
              <li
                key={row.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  alignItems: 'baseline',
                  gap: 16,
                  padding: '14px 0',
                  borderBottom: '1px solid var(--ink-a10)',
                }}
              >
                <span style={{ color: 'var(--ink)', fontWeight: 500 }}>
                  In-Depth Assessment
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--slate-500)',
                  }}
                >
                  {new Date(row.enrolled_at).toLocaleDateString()}
                </span>
                <Link
                  href="/assessment/in-depth/take"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--gold-deep)',
                  }}
                >
                  CONTINUE →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
