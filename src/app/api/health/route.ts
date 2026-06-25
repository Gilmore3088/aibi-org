// GET /api/health
//
// One-request readiness report for the live site. Aggregates the config status
// of every integration the public features depend on — WITHOUT exposing secret
// values (booleans + non-secret identifiers only) — and rolls it up into a
// per-feature "ready" verdict plus an exact list of missing env vars.
//
// Use it to answer "why isn't <feature> working in production?": open
//   https://www.aibankinginstitute.com/api/health
// and read `features` (what works) and `missing` (what to set in Vercel).
//
// The per-integration endpoints (/api/health/email, /supabase, /stripe) stay
// for deeper checks (e.g. the Supabase schema probe); this is the summary.

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function present(name: string): boolean {
  return !!process.env[name] && process.env[name]!.length > 0;
}
function flagOn(name: string): boolean {
  return process.env[name] === 'true';
}

export async function GET(): Promise<Response> {
  // ── Integration config (secret-safe: booleans + non-secret values only) ──
  const resend = {
    keyPresent: present('RESEND_API_KEY'),
    skip: flagOn('SKIP_RESEND'),
    from: process.env.RESEND_FROM ?? 'hello@aibankinginstitute.com',
  };
  const mailerlite = {
    keyPresent: present('MAILERLITE_API_KEY'),
    assessmentGroup: present('MAILERLITE_GROUP_ID_ASSESSMENT'),
    playbookGroup: present('MAILERLITE_GROUP_ID_PLAYBOOK'),
    skip: flagOn('SKIP_MAILERLITE'),
  };
  const ai = {
    openai: present('OPENAI_API_KEY'),
    anthropic: present('ANTHROPIC_API_KEY'),
    gemini: present('GEMINI_API_KEY'),
  };
  const supabase = {
    url: present('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: present('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: present('SUPABASE_SERVICE_ROLE_KEY'),
    skipProfiles: flagOn('SKIP_SUPABASE_PROFILES'),
  };
  const stripe = { configured: present('STRIPE_SECRET_KEY') };
  const site = {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
  };

  // ── Per-feature roll-up: does this feature actually work right now? ──
  const missing = new Set<string>();
  const note = (cond: boolean, env: string) => {
    if (!cond) missing.add(env);
  };

  // Emailing a captured lead its resource (home help widget, resource gates,
  // assessment results) — needs Resend on and not skipped.
  const emailDelivery = resend.keyPresent && !resend.skip;
  note(resend.keyPresent, 'RESEND_API_KEY');

  // Lead capture into the nurture list (home help widget + resource gates).
  const leadCapture = mailerlite.keyPresent && mailerlite.assessmentGroup && !mailerlite.skip;
  note(mailerlite.keyPresent, 'MAILERLITE_API_KEY');
  note(mailerlite.assessmentGroup, 'MAILERLITE_GROUP_ID_ASSESSMENT');

  // The public /practice demo runs OpenAI gpt-4o-mini and meters spend in
  // Supabase. Without the key the run fails (graceful sample fallback shows).
  const practiceDemo = ai.openai && supabase.url && supabase.anonKey;
  note(ai.openai, 'OPENAI_API_KEY');

  // Assessment results persistence + the Supabase-backed flows.
  const profilesStore = supabase.url && supabase.anonKey && supabase.serviceRoleKey;
  note(supabase.url, 'NEXT_PUBLIC_SUPABASE_URL');
  note(supabase.anonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
  note(supabase.serviceRoleKey, 'SUPABASE_SERVICE_ROLE_KEY');
  note(!!site.siteUrl, 'NEXT_PUBLIC_SITE_URL');

  const features = {
    emailDelivery,
    leadCapture,
    practiceDemo,
    profilesStore,
    payments: stripe.configured,
  };

  // SKIP_* flags that silently disable integrations in production are a footgun.
  const warnings: string[] = [];
  if (site.vercelEnv === 'production') {
    if (resend.skip) warnings.push('SKIP_RESEND=true in production — emails are disabled.');
    if (mailerlite.skip) warnings.push('SKIP_MAILERLITE=true in production — lead capture is disabled.');
    if (supabase.skipProfiles) warnings.push('SKIP_SUPABASE_PROFILES=true in production — results are not persisted.');
  }

  const ok = Object.values(features).every(Boolean) && warnings.length === 0;

  return NextResponse.json({
    ok,
    site,
    features,
    integrations: { resend, mailerlite, ai, supabase, stripe },
    missing: Array.from(missing),
    warnings,
  });
}
