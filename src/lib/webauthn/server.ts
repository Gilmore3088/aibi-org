// Server-side WebAuthn wrappers — registration + authentication.
//
// We use @simplewebauthn/server to handle the actual WebAuthn protocol
// (challenge generation, attestation verification, assertion
// verification, counter checks) and Supabase service-role for the
// persistence layer (webauthn_credentials + webauthn_challenges).
//
// Public API: four async functions matching the four API routes.
//   beginRegistration   — issues options for navigator.credentials.create
//   completeRegistration — verifies the attestation, stores the credential
//   beginAuthentication — issues options for navigator.credentials.get
//   completeAuthentication — verifies the assertion, returns the userId
//
// Session issuance (turning the verified assertion into a Supabase
// cookie session) is handled in the API route, not here, because the
// route owns the cookie store.
//
// RP (Relying Party) ID is the site's apex host without scheme. WebAuthn
// requires it to be a registrable domain or registrable-suffix of the
// page's origin. We derive from NEXT_PUBLIC_SITE_URL.

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type GenerateRegistrationOptionsOpts,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/server';
import { createServiceRoleClient } from '@/lib/supabase/client';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aibankinginstitute.com';

/** Apex host of the site (e.g. "aibankinginstitute.com"). WebAuthn binds
 *  credentials to this host; changing it invalidates every passkey. */
function rpID(): string {
  try {
    return new URL(SITE_URL).hostname;
  } catch {
    return 'aibankinginstitute.com';
  }
}

/** Origin used for assertion verification. Preview deploys have to
 *  pass their own origin; the helper accepts an override. */
function expectedOrigin(originOverride?: string): string {
  return originOverride ?? SITE_URL;
}

const RP_NAME = 'The AI Banking Institute';

// ── Registration ───────────────────────────────────────────────────────────

interface BeginRegistrationOpts {
  readonly userId: string;
  readonly userEmail: string;
  readonly displayName?: string;
}

export async function beginRegistration(
  opts: BeginRegistrationOpts,
): Promise<ReturnType<typeof generateRegistrationOptions> extends Promise<infer T> ? T : never> {
  const supabase = createServiceRoleClient();

  // Look up any existing credentials so the browser doesn't offer the
  // user a passkey they already have on this device.
  const { data: existing } = await supabase
    .from('webauthn_credentials')
    .select('credential_id, transports')
    .eq('user_id', opts.userId);

  const excludeCredentials = (existing ?? []).map((row) => ({
    id: row.credential_id as string,
    transports: (row.transports as AuthenticatorTransportFuture[]) ?? [],
  }));

  const optionsForLib: GenerateRegistrationOptionsOpts = {
    rpName: RP_NAME,
    rpID: rpID(),
    userName: opts.userEmail,
    userDisplayName: opts.displayName ?? opts.userEmail,
    // Encode the user id as bytes; some platforms truncate at 64 bytes
    // so keep this short. UUID hex without dashes is 32 chars.
    userID: new TextEncoder().encode(opts.userId.replace(/-/g, '')),
    // 'platform' = device-bound (Touch ID, Windows Hello). 'cross-platform'
    // = roaming (YubiKey). 'undefined' lets the user pick — best UX.
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'preferred',
    },
    attestationType: 'none',
    excludeCredentials,
  };

  const options = await generateRegistrationOptions(optionsForLib);

  await supabase.from('webauthn_challenges').insert({
    user_id: opts.userId,
    challenge: options.challenge,
    challenge_type: 'registration',
  });

  return options;
}

interface CompleteRegistrationOpts {
  readonly userId: string;
  readonly response: RegistrationResponseJSON;
  readonly originOverride?: string;
  readonly deviceLabel?: string;
}

interface CompleteRegistrationResult {
  readonly verified: boolean;
  readonly credentialId?: string;
  readonly error?: string;
}

export async function completeRegistration(
  opts: CompleteRegistrationOpts,
): Promise<CompleteRegistrationResult> {
  const supabase = createServiceRoleClient();

  // Pull the matching pending challenge.
  const challengeRow = await consumeChallenge({
    type: 'registration',
    userId: opts.userId,
  });
  if (!challengeRow) {
    return { verified: false, error: 'No active registration challenge.' };
  }

  let verification: VerifiedRegistrationResponse;
  try {
    verification = await verifyRegistrationResponse({
      response: opts.response,
      expectedChallenge: challengeRow.challenge,
      expectedOrigin: expectedOrigin(opts.originOverride),
      expectedRPID: rpID(),
      requireUserVerification: false,
    });
  } catch (err) {
    return {
      verified: false,
      error: err instanceof Error ? err.message : 'Verification failed.',
    };
  }

  if (!verification.verified || !verification.registrationInfo) {
    return { verified: false, error: 'Attestation not verified.' };
  }

  const info = verification.registrationInfo;
  const credentialIdB64 = info.credential.id;
  const publicKeyB64 = bufferToBase64Url(info.credential.publicKey);
  const counter = info.credential.counter;

  const { error: insertError } = await supabase
    .from('webauthn_credentials')
    .insert({
      user_id: opts.userId,
      credential_id: credentialIdB64,
      public_key: publicKeyB64,
      counter,
      device_label: opts.deviceLabel?.slice(0, 80) ?? null,
      transports: opts.response.response.transports ?? [],
      backup_eligible: info.credentialBackedUp,
      backup_state: info.credentialBackedUp,
    });

  if (insertError) {
    return { verified: false, error: insertError.message };
  }

  return { verified: true, credentialId: credentialIdB64 };
}

// ── Authentication ─────────────────────────────────────────────────────────

interface BeginAuthenticationOpts {
  readonly email?: string;
}

export async function beginAuthentication(opts: BeginAuthenticationOpts) {
  const supabase = createServiceRoleClient();

  // Discoverable-credential flow: no email needed up front. The
  // authenticator returns its own credential ID and we look up the user
  // from that. Falls back to email-keyed allowCredentials when email is
  // supplied (older browsers / hardware keys).
  let allowCredentials:
    | { id: string; transports?: AuthenticatorTransportFuture[] }[]
    | undefined;
  let userId: string | null = null;

  if (opts.email) {
    const { data: user } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', opts.email.toLowerCase().trim())
      .maybeSingle();
    if (user) {
      userId = user.id as string;
      const { data: creds } = await supabase
        .from('webauthn_credentials')
        .select('credential_id, transports')
        .eq('user_id', user.id);
      allowCredentials = (creds ?? []).map((row) => ({
        id: row.credential_id as string,
        transports:
          (row.transports as AuthenticatorTransportFuture[]) ?? undefined,
      }));
    }
  }

  const options = await generateAuthenticationOptions({
    rpID: rpID(),
    userVerification: 'preferred',
    ...(allowCredentials && allowCredentials.length > 0
      ? { allowCredentials }
      : {}),
  });

  await supabase.from('webauthn_challenges').insert({
    user_id: userId,
    email: opts.email ?? null,
    challenge: options.challenge,
    challenge_type: 'authentication',
  });

  return options;
}

interface CompleteAuthenticationOpts {
  readonly response: AuthenticationResponseJSON;
  readonly originOverride?: string;
}

interface CompleteAuthenticationResult {
  readonly verified: boolean;
  readonly userId?: string;
  readonly email?: string;
  readonly error?: string;
}

export async function completeAuthentication(
  opts: CompleteAuthenticationOpts,
): Promise<CompleteAuthenticationResult> {
  const supabase = createServiceRoleClient();

  // Find the credential the authenticator just returned.
  const credentialId = opts.response.id;
  const { data: cred } = await supabase
    .from('webauthn_credentials')
    .select('credential_id, public_key, counter, user_id')
    .eq('credential_id', credentialId)
    .maybeSingle();

  if (!cred) {
    return { verified: false, error: 'Unrecognized credential.' };
  }

  // Pull the matching pending challenge.
  const challengeRow = await consumeChallenge({ type: 'authentication' });
  if (!challengeRow) {
    return { verified: false, error: 'No active authentication challenge.' };
  }

  let verification: VerifiedAuthenticationResponse;
  try {
    verification = await verifyAuthenticationResponse({
      response: opts.response,
      expectedChallenge: challengeRow.challenge,
      expectedOrigin: expectedOrigin(opts.originOverride),
      expectedRPID: rpID(),
      credential: {
        id: cred.credential_id as string,
        publicKey: base64UrlToBuffer(cred.public_key as string),
        counter: cred.counter as number,
      },
      requireUserVerification: false,
    });
  } catch (err) {
    return {
      verified: false,
      error: err instanceof Error ? err.message : 'Verification failed.',
    };
  }

  if (!verification.verified) {
    return { verified: false, error: 'Assertion not verified.' };
  }

  // Update the counter + last_used_at; rejecting non-increasing
  // counters is part of WebAuthn's replay-protection contract.
  const newCounter = verification.authenticationInfo.newCounter;
  await supabase
    .from('webauthn_credentials')
    .update({
      counter: newCounter,
      last_used_at: new Date().toISOString(),
    })
    .eq('credential_id', credentialId);

  // Look up the email for the user so the API route can issue a session.
  const { data: authUser } = await supabase.auth.admin.getUserById(
    cred.user_id as string,
  );
  const email = authUser?.user?.email ?? null;

  return {
    verified: true,
    userId: cred.user_id as string,
    email: email ?? undefined,
  };
}

// ── Internal helpers ───────────────────────────────────────────────────────

interface ConsumeChallengeOpts {
  readonly type: 'registration' | 'authentication';
  readonly userId?: string;
}

interface ChallengeRow {
  readonly id: string;
  readonly challenge: string;
}

async function consumeChallenge(
  opts: ConsumeChallengeOpts,
): Promise<ChallengeRow | null> {
  const supabase = createServiceRoleClient();
  let query = supabase
    .from('webauthn_challenges')
    .select('id, challenge, expires_at, consumed_at')
    .eq('challenge_type', opts.type)
    .is('consumed_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1);
  if (opts.userId) query = query.eq('user_id', opts.userId);
  const { data } = await query.maybeSingle();
  if (!data) return null;
  await supabase
    .from('webauthn_challenges')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', data.id);
  return { id: data.id as string, challenge: data.challenge as string };
}

function bufferToBase64Url(buffer: Uint8Array | ArrayBuffer): string {
  const bytes =
    buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return Buffer.from(binary, 'binary')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlToBuffer(b64url: string): Uint8Array<ArrayBuffer> {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
  // Copy into a fresh ArrayBuffer-backed Uint8Array (simplewebauthn's
  // type signature requires Uint8Array<ArrayBuffer>, not the looser
  // ArrayBufferLike that Buffer/Uint8Array often returns).
  const src = Buffer.from(b64 + pad, 'base64');
  const out = new Uint8Array(new ArrayBuffer(src.length));
  out.set(src);
  return out as Uint8Array<ArrayBuffer>;
}
