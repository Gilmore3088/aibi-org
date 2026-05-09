// One-shot: provision a Supabase auth user + emit a magic link URL.
// Usage:
//   node scripts/provision-magic-link.mjs <email> [nextPath]
// Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from env.

import { createClient } from '@supabase/supabase-js';

const email = process.argv[2];
const nextPath = process.argv[3] ?? '/dashboard';
if (!email) {
  console.error('Usage: node scripts/provision-magic-link.mjs <email> [nextPath]');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const create = await supabase.auth.admin.createUser({ email, email_confirm: true });
if (create.error && !create.error.message.toLowerCase().includes('already')) {
  console.error('createUser failed:', create.error.message);
  process.exit(1);
}
console.log('createUser:', create.error?.message ?? `created id=${create.data?.user?.id}`);

const link = await supabase.auth.admin.generateLink({ type: 'magiclink', email });
const tokenHash = link.data?.properties?.hashed_token;
if (!tokenHash) {
  console.error('no token hash:', link.error?.message);
  process.exit(1);
}

const callbackUrl = new URL('https://www.aibankinginstitute.com/auth/callback');
callbackUrl.searchParams.set('token_hash', tokenHash);
callbackUrl.searchParams.set('type', 'email');
callbackUrl.searchParams.set('next', nextPath);
console.log('MAGIC_LINK:', callbackUrl.toString());
