// Preview-only auth bypass — lets us click into auth-gated surfaces on a
// Vercel Preview deployment (or local dev) without setting up Supabase.
//
// SAFETY:
//   - Requires PREVIEW_AUTH_BYPASS=true (no-op without it).
//   - Refuses to operate when VERCEL_ENV === 'production' so the env var
//     cannot accidentally unlock the production site even if someone sets
//     it in the wrong Vercel scope.
//
// Enable in Vercel: add PREVIEW_AUTH_BYPASS=true to the *Preview* environment
// scope (NOT Production). Redeploy the preview branch.
//
// Pages that fetch from /api/dashboard/* will still get 401s — the bypass
// only unlocks the route gates so the visual surface renders.

export function isPreviewAuthBypassEnabled(): boolean {
  // Never, ever bypass in production. Hard floor.
  if (process.env.VERCEL_ENV === 'production') return false;

  // Explicit opt-in still works (useful when Supabase IS configured on
  // preview but you want to skip its gate for visual QA).
  if (process.env.PREVIEW_AUTH_BYPASS === 'true') return true;

  // Auto-bypass when Supabase isn't configured. The auth gate would
  // redirect to a login page that itself can't authenticate anyone —
  // leaving the user trapped. Letting them through to the visual page
  // is the only useful behaviour for a non-production deploy.
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  return !supabaseConfigured;
}

// Mock user identity used when bypass is active. Email is intentionally
// recognizable so logs make clear this was a bypass session, not a real
// signed-in user.
export const PREVIEW_BYPASS_USER = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'preview@aibankinginstitute.com',
} as const;
