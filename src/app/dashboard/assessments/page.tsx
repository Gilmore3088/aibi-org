// /dashboard/assessments — list of the signed-in user's completed assessments.
//
// Shows two sources side-by-side:
//   1. Free 12-question readiness — read from user_profiles by email match.
//   2. In-Depth 48-question takes — read from indepth_assessment_takers by
//      user_id (bound at first authed take-page visit; see take/page.tsx).
//
// Auth-required. Empty state surfaces both products as CTAs.

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import {
  createServerClientWithCookies,
  createServiceRoleClient,
  isSupabaseConfigured,
} from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'My Assessments | The AI Banking Institute',
};

interface IndepthRow {
  readonly id: string;
  readonly completed_at: string | null;
  readonly score_total: number | null;
  readonly institution_id: string | null;
}

interface ReadinessRow {
  readonly id: string;
  readonly readiness_score: number | null;
  readonly readiness_tier_label: string | null;
  readonly readiness_at: string | null;
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default async function AssessmentsPage() {
  if (!isSupabaseConfigured()) {
    redirect('/dashboard');
  }

  const supabaseAuth = createServerClientWithCookies(cookies());
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    redirect('/auth/login?next=/dashboard/assessments');
  }

  const supabase = createServiceRoleClient();

  const [indepthRes, readinessRes] = await Promise.all([
    supabase
      .from('indepth_assessment_takers')
      .select('id, completed_at, score_total, institution_id')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false }),
    user.email
      ? supabase
          .from('user_profiles')
          .select('id, readiness_score, readiness_tier_label, readiness_at')
          .eq('email', user.email)
          .order('readiness_at', { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);

  const indepthTakes: IndepthRow[] = (indepthRes.data ?? []) as IndepthRow[];
  const readinessTakes: ReadinessRow[] = (readinessRes.data ?? []) as ReadinessRow[];
  const completedIndepth = indepthTakes.filter((t) => t.completed_at !== null);

  return (
    <main className="min-h-screen bg-[color:var(--color-linen)] px-6 py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            My Assessments
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight">
            What you have completed.
          </h1>
        </header>

        {/* In-Depth */}
        <section className="mb-14" aria-labelledby="indepth-heading">
          <h2
            id="indepth-heading"
            className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 mb-6"
          >
            In-Depth Assessment · 48 questions
          </h2>
          {completedIndepth.length === 0 ? (
            <EmptyCard
              title="You have not taken the In-Depth Assessment yet."
              body="The full diagnostic across all eight readiness dimensions, with a tailored 30-day starter artifact."
              cta="See the In-Depth Assessment"
              href="/assessment/in-depth"
            />
          ) : (
            <ul className="space-y-3">
              {completedIndepth.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-baseline justify-between gap-4 bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-5"
                >
                  <div>
                    <p className="font-serif text-lg text-[color:var(--color-ink)]">
                      In-Depth Assessment
                    </p>
                    <p className="font-mono text-xs text-[color:var(--color-slate)] mt-1">
                      Completed {fmtDate(t.completed_at)}
                      {t.institution_id ? ' · institution invitee' : ' · individual'}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <p className="font-mono text-2xl tabular-nums text-[color:var(--color-terra)]">
                      {t.score_total ?? '—'}
                      <span className="text-xs text-[color:var(--color-slate)] ml-1">/ 192</span>
                    </p>
                    <Link
                      href={`/results/in-depth/${t.id}`}
                      className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] hover:text-[color:var(--color-terra-light)] border-b border-[color:var(--color-terra)] pb-0.5"
                    >
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Free readiness */}
        <section className="mb-14" aria-labelledby="readiness-heading">
          <h2
            id="readiness-heading"
            className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 mb-6"
          >
            Free Readiness Assessment · 12 questions
          </h2>
          {readinessTakes.length === 0 ? (
            <EmptyCard
              title="You have not taken the free readiness assessment."
              body="Three minutes, eight dimensions, an immediate score. A useful warm-up before the In-Depth."
              cta="Take the assessment"
              href="/assessment"
            />
          ) : (
            <ul className="space-y-3">
              {readinessTakes.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-baseline justify-between gap-4 bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-5"
                >
                  <div>
                    <p className="font-serif text-lg text-[color:var(--color-ink)]">
                      {r.readiness_tier_label ?? 'Readiness'}
                    </p>
                    <p className="font-mono text-xs text-[color:var(--color-slate)] mt-1">
                      Completed {fmtDate(r.readiness_at)}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <p className="font-mono text-2xl tabular-nums text-[color:var(--color-terra)]">
                      {r.readiness_score ?? '—'}
                      <span className="text-xs text-[color:var(--color-slate)] ml-1">/ 48</span>
                    </p>
                    <Link
                      href={`/results/${r.id}`}
                      className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] hover:text-[color:var(--color-terra-light)] border-b border-[color:var(--color-terra)] pb-0.5"
                    >
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="font-mono text-xs text-[color:var(--color-slate)] text-center mt-12">
          <Link
            href="/dashboard"
            className="hover:text-[color:var(--color-terra)] transition-colors"
          >
            ← Back to dashboard
          </Link>
        </p>
      </div>
    </main>
  );
}

function EmptyCard({
  title,
  body,
  cta,
  href,
}: {
  title: string;
  body: string;
  cta: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-6 hover:border-[color:var(--color-terra)]/40 transition-colors"
    >
      <h3 className="font-serif text-xl text-[color:var(--color-ink)] leading-tight mb-2">
        {title}
      </h3>
      <p className="text-sm text-[color:var(--color-ink)]/75 leading-relaxed mb-4 max-w-xl">
        {body}
      </p>
      <span className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] border-b border-[color:var(--color-terra)] pb-0.5">
        {cta} →
      </span>
    </Link>
  );
}
