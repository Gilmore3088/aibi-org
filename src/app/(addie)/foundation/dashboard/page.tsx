// /dashboard — learner home. Renders progress + Toolbox summary + next-up.
// Auth-soft: anon viewers see the public copy; authed learners see their state.

import Link from 'next/link';
import { cookies, headers as nextHeaders } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import { hasAnyFoundationEntitlement } from '@/lib/addie/entitlements/check';
import { ProgressRing } from '@/components/addie/dashboard/ProgressRing';
import { NextUpCard } from '@/components/addie/dashboard/NextUpCard';
import { ToolboxSummary } from '@/components/addie/dashboard/ToolboxSummary';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';

export const dynamic = 'force-dynamic';

interface DashboardData {
  signedIn: boolean;
  toolboxCount: number;
  unlimited: boolean;
  totalLessons: number;
  completedLessons: number;
  nextUp: { moduleId: string; lessonId: string; title: string; durationMin: number } | null;
}

async function loadData(): Promise<DashboardData> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const empty: DashboardData = {
    signedIn: false,
    toolboxCount: 0,
    unlimited: false,
    totalLessons: 0,
    completedLessons: 0,
    nextUp: null,
  };
  if (!supabaseUrl || !supabaseAnonKey) return empty;
  try {
    const cookieStore = await cookies();
    const supa = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {
          /* no-op */
        },
      },
    });
    const { data } = await supa.auth.getUser();
    const userId = data.user?.id ?? null;
    const svc = getAddieServiceClient();

    const { count: totalLessons } = await svc
      .from('lessons')
      .select('id', { count: 'exact', head: true })
      .eq('published', true);

    const { data: firstLesson } = await svc
      .from('lessons')
      .select('id, module_id, title, duration_min, ordinal')
      .eq('published', true)
      .order('ordinal', { ascending: true })
      .limit(1)
      .maybeSingle();

    const nextUp = firstLesson
      ? {
          moduleId: firstLesson.module_id as string,
          lessonId: firstLesson.id as string,
          title: firstLesson.title as string,
          durationMin: firstLesson.duration_min as number,
        }
      : null;

    if (!userId) {
      return {
        signedIn: false,
        toolboxCount: 0,
        unlimited: false,
        totalLessons: totalLessons ?? 0,
        completedLessons: 0,
        nextUp,
      };
    }

    const unlimited = await hasAnyFoundationEntitlement(userId);
    const { count: toolboxCount } = await svc
      .from('toolbox_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    // L1 completion proxy: distinct lessons the learner viewed.
    const { count: completedLessons } = await svc
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('action', 'lesson_complete');

    return {
      signedIn: true,
      toolboxCount: toolboxCount ?? 0,
      unlimited,
      totalLessons: totalLessons ?? 0,
      completedLessons: completedLessons ?? 0,
      nextUp,
    };
  } catch (err) {
    console.warn('[dashboard] load failed:', err);
    return empty;
  }
}

export default async function DashboardPage() {
  // Touch headers so RSC stays dynamic across deploys without static caching.
  void (await nextHeaders());
  const d = await loadData();
  const progress = d.totalLessons > 0 ? d.completedLessons / d.totalLessons : 0;

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <header className="border-b border-[var(--ledger-rule)] pb-5 mb-8">
        <KickerLabel tone="muted">Dashboard</KickerLabel>
        <h1 className="mt-2 font-serif text-4xl text-[var(--ledger-ink)]">
          {d.signedIn ? 'Where you are' : 'Get started'}
        </h1>
        {!d.signedIn ? (
          <p className="mt-2 text-[var(--ledger-ink-2)]">
            You&apos;re browsing anonymously. Add an email at the gate to keep what you build.
          </p>
        ) : null}
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        {d.nextUp ? (
          <div className="md:col-span-2">
            <NextUpCard
              moduleId={d.nextUp.moduleId}
              lessonId={d.nextUp.lessonId}
              title={d.nextUp.title}
              durationMin={d.nextUp.durationMin}
            />
          </div>
        ) : (
          <div className="md:col-span-2">
            <p className="text-[var(--ledger-muted)]">
              No lessons published yet. Wave 2b will seed them.
            </p>
            <Link href="/foundation" className="mt-3 inline-block">
              <LedgerButton variant="secondary">Open course outline</LedgerButton>
            </Link>
          </div>
        )}
        <div className="grid gap-4 content-start">
          <div className="flex items-center gap-4">
            <ProgressRing value={progress} label="Course" />
            <div>
              <p className="font-serif text-2xl text-[var(--ledger-ink)] tabular-nums">
                {d.completedLessons}
                <span className="text-[var(--ledger-muted)]"> / {d.totalLessons}</span>
              </p>
              <p className="text-sm text-[var(--ledger-muted)]">lessons complete</p>
            </div>
          </div>
          <ToolboxSummary count={d.toolboxCount} unlimited={d.unlimited} />
        </div>
      </div>
    </main>
  );
}
