// Supabase client stub — wire when SUPABASE_URL + keys are set.
// Do not create new client instances elsewhere; import from here.

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

export function getSupabaseServerClient(): never {
  throw new Error(
    'Supabase is not yet configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local, then replace this stub with a real client.'
  );
}
