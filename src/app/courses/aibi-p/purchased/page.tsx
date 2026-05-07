// /courses/aibi-p/purchased
// Stripe Checkout success_url for AiBI-Practitioner.
// Mirrors /assessment/in-depth/purchased: branches on auth state so a buyer
// who hasn't logged in yet sees a clear "log in to start" CTA instead of
// hitting the entitlement gate on /courses/aibi-p with no context.

import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export const metadata: Metadata = {
  title: 'Welcome to AiBI-Practitioner | The AI Banking Institute',
  description:
    'Your AiBI-Practitioner enrollment is confirmed. Sign in to begin Module 1.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const HIGHLIGHTS = [
  '12 self-paced modules built around AI Use Cards',
  'Banking-specific practice reps you keep and reuse',
  'Work-product assessment + the AiBI-Practitioner credential',
  'Lifetime access to course materials',
] as const;

export default async function AiBIPurchasedPage() {
  let signedInEmail: string | null = null;

  if (isSupabaseConfigured()) {
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
    signedInEmail = user?.email ?? null;
  }

  return (
    <main className="px-6 py-14 md:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="font-serif-sc text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-terra)] mb-3">
          Enrollment confirmed
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight text-[color:var(--color-ink)] mb-5">
          Welcome to AiBI-Practitioner.
        </h1>
        <p className="text-base md:text-lg text-[color:var(--color-ink)]/75 leading-relaxed mb-8 max-w-2xl">
          Thanks for your purchase. A receipt is on its way from Stripe, and a
          welcome email with the course link will follow within minutes.
        </p>

        <section className="border border-[color:var(--color-terra)]/20 bg-[color:var(--color-parch)] rounded-[3px] p-6 md:p-8 mb-10">
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
            What you get
          </p>
          <ul className="space-y-3">
            {HIGHLIGHTS.map((line) => (
              <li
                key={line}
                className="flex gap-3 text-sm md:text-base text-[color:var(--color-ink)]/85"
              >
                <span
                  className="mt-2 h-1.5 w-1.5 rounded-sm bg-[color:var(--color-terra)] shrink-0"
                  aria-hidden="true"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-[color:var(--color-ink)]/10 pt-8">
          {signedInEmail ? (
            <>
              <p className="text-sm text-[color:var(--color-ink)]/75 mb-5">
                You&rsquo;re signed in as{' '}
                <span className="font-mono text-[color:var(--color-ink)]">
                  {signedInEmail}
                </span>
                . Module 1 takes about 35 minutes.
              </p>
              <Link
                href="/courses/aibi-p"
                className="inline-block bg-[color:var(--color-terra)] text-[color:var(--color-linen)] px-8 py-3 rounded-sm font-mono text-[10px] uppercase tracking-[0.15em] hover:bg-[color:var(--color-terra-light)] transition-colors"
              >
                Begin Module 1
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-[color:var(--color-ink)]/75 mb-5">
                One last step: sign in with the email you used at checkout to
                bind your enrollment to your account. New here? You can create
                an account in 30 seconds.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/auth/login?next=/courses/aibi-p"
                  className="inline-block bg-[color:var(--color-terra)] text-[color:var(--color-linen)] px-8 py-3 rounded-sm font-mono text-[10px] uppercase tracking-[0.15em] hover:bg-[color:var(--color-terra-light)] transition-colors"
                >
                  Log in to start
                </Link>
                <Link
                  href="/auth/sign-up?next=/courses/aibi-p"
                  className="inline-block border border-[color:var(--color-ink)]/20 text-[color:var(--color-ink)] px-8 py-3 rounded-sm font-mono text-[10px] uppercase tracking-[0.15em] hover:bg-[color:var(--color-parch)] transition-colors"
                >
                  Create my account
                </Link>
              </div>
            </>
          )}
          <p className="text-xs text-[color:var(--color-ink)]/55 mt-6">
            Trouble? Reply to your receipt email or write to{' '}
            <a
              href="mailto:hello@aibankinginstitute.com"
              className="underline hover:text-[color:var(--color-terra)]"
            >
              hello@aibankinginstitute.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
