// /account — settings: marketing opt-in, track, data controls links.

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import { TrackPicker, TRACKS } from '@/components/addie/shell/TrackPicker';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import Link from 'next/link';
import { setTrack } from '../foundation/[moduleId]/[lessonId]/actions';
import type { Track } from '@/components/addie/lesson/types';

export const dynamic = 'force-dynamic';

interface AccountData {
  signedIn: boolean;
  email: string | null;
  track: Track | null;
  marketingOptIn: boolean;
}

async function loadAccount(): Promise<AccountData> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const empty: AccountData = { signedIn: false, email: null, track: null, marketingOptIn: false };
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
    if (!data.user) return empty;
    const svc = getAddieServiceClient();
    const { data: profile } = await svc
      .from('learner_profiles')
      .select('email, track, marketing_opt_in')
      .eq('user_id', data.user.id)
      .maybeSingle();
    return {
      signedIn: true,
      email: (profile?.email as string | null) ?? data.user.email ?? null,
      track: (profile?.track as Track | null) ?? null,
      marketingOptIn: Boolean(profile?.marketing_opt_in),
    };
  } catch (err) {
    console.warn('[account] load failed:', err);
    return empty;
  }
}

export default async function AccountPage() {
  const a = await loadAccount();

  if (!a.signedIn) {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
        <h1 className="font-serif text-3xl text-[var(--ledger-ink)]">Account</h1>
        <p className="mt-3 text-[var(--ledger-ink-2)]">
          Sign in to manage your account.{' '}
          <Link href="/auth/login" className="underline underline-offset-4">
            Go to sign in
          </Link>
          .
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <header className="border-b border-[var(--ledger-rule)] pb-5 mb-6">
        <KickerLabel tone="muted">Account</KickerLabel>
        <h1 className="mt-2 font-serif text-3xl text-[var(--ledger-ink)]">Settings</h1>
      </header>

      <section className="mb-8">
        <KickerLabel tone="muted">Email</KickerLabel>
        <p className="mt-1 font-serif text-lg text-[var(--ledger-ink)]">{a.email ?? '—'}</p>
      </section>

      <section className="mb-8">
        <KickerLabel tone="muted">Track</KickerLabel>
        <p className="mt-1 text-sm text-[var(--ledger-muted)] mb-3">
          Branched lessons render the variant for your selected track.
        </p>
        <TrackPicker
          initial={a.track}
          onSelect={async (t) => {
            'use server';
            await setTrack(t);
          }}
        />
        <p className="mt-3 text-sm text-[var(--ledger-muted)]">
          Current:{' '}
          {a.track ? TRACKS.find((t) => t.id === a.track)?.label ?? a.track : 'not set'}
        </p>
      </section>

      <section className="mb-8">
        <KickerLabel tone="muted">Communications</KickerLabel>
        <p className="mt-1 text-sm text-[var(--ledger-muted)]">
          Monthly AI Banking Brief opt-in:{' '}
          <span className="text-[var(--ledger-ink)]">
            {a.marketingOptIn ? 'On' : 'Off'}
          </span>
          . Manage from the unsubscribe link in any email.
        </p>
      </section>

      <section className="mb-8">
        <KickerLabel tone="muted">Your data</KickerLabel>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <LedgerCard className="p-4">
            <h3 className="font-serif text-lg text-[var(--ledger-ink)]">Export</h3>
            <p className="mt-1 text-sm text-[var(--ledger-muted)]">
              Download every artifact you&apos;ve saved and every event we&apos;ve recorded.
            </p>
            <Link
              href="/account/export"
              className="mt-3 inline-block font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-accent)] hover:underline"
            >
              Request export →
            </Link>
          </LedgerCard>
          <LedgerCard className="p-4">
            <h3 className="font-serif text-lg text-[var(--ledger-ink)]">Delete</h3>
            <p className="mt-1 text-sm text-[var(--ledger-muted)]">
              30-day soft-delete. Your account is anonymized immediately; data is purged after 30
              days.
            </p>
            <Link
              href="/account/delete"
              className="mt-3 inline-block font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-weak)] hover:underline"
            >
              Begin deletion →
            </Link>
          </LedgerCard>
        </div>
      </section>
    </main>
  );
}
