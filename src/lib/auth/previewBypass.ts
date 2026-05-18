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
  if (process.env.VERCEL_ENV === 'production') return false;
  return process.env.PREVIEW_AUTH_BYPASS === 'true';
}

// Mock user identity used when bypass is active. Email is intentionally
// recognizable so logs make clear this was a bypass session, not a real
// signed-in user.
export const PREVIEW_BYPASS_USER = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'preview@aibankinginstitute.com',
} as const;
