// defineRoute — a thin wrapper that composes the cross-cutting concerns every
// standard JSON API route repeats: rate-limiting, optional auth, JSON body
// parse + validation, request-IP extraction, and uniform 400/401/429 error
// shapes. The handler body is left with just the business logic.
//
// Scope: this targets the standard, NON-DYNAMIC JSON-request/JSON-response
// shape. Routes with genuinely different shapes keep their own code and do NOT
// use this:
//   - Stripe/Resend webhooks (signature verification is the first step)
//   - cron routes (bearer auth via assertCronAuth)
//   - streaming responses (ReadableStream)
//   - routes that return files/PDFs/redirects/cookies as the primary output
//   - dynamic routes ([id]) that need route params — the wrapper deliberately
//     exposes only `request`, so the exported handler is a single-argument
//     function. That is the signature Next.js 15's build-time route validator
//     accepts unconditionally; adding a params argument re-introduces the
//     second-argument type constraints this wrapper exists to stay clear of.
//
// The error shapes returned here ({ error: string }, statuses 400/401) are the
// same ones the migrated routes returned by hand, so behavior is unchanged.

import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { rateLimitOrFail, getRequestIp } from './rate-limit';
import { getAuthUser } from './auth';

type RateLimitScope = 'ip' | 'user' | 'email';

export interface RouteRateLimit {
  /** Logical route name, used as the rate-limit key prefix. */
  readonly key: string;
  readonly max: number;
  readonly windowSeconds: number;
  /** Defaults to 'ip'. 'user' uses the authenticated user's id. */
  readonly scope?: RateLimitScope;
  /** Override the counted identifier (e.g. a normalized email). */
  readonly identifier?: (request: Request, user: User | null) => string;
}

export interface DefineRouteOptions<Body> {
  readonly rateLimit?: RouteRateLimit;
  /** Require a Supabase session; responds 401 when absent. */
  readonly requireAuth?: boolean;
  /**
   * Type-guard for the JSON body. Providing it makes the wrapper parse the
   * request body (400 on invalid JSON) and validate it (400 when the guard
   * returns false). Omit for routes with no body.
   */
  readonly validate?: (body: unknown) => body is Body;
  /** Custom message for the 401 (defaults to 'Not authenticated.'). */
  readonly unauthorizedMessage?: string;
  /** Custom message for the invalid-body 400 (defaults to 'Invalid payload.'). */
  readonly invalidBodyMessage?: string;
}

export interface RouteContext<Body> {
  readonly request: Request;
  readonly body: Body;
  readonly user: User | null;
  readonly ip: string;
}

export function defineRoute<Body = undefined>(
  options: DefineRouteOptions<Body>,
  handler: (ctx: RouteContext<Body>) => Promise<Response> | Response,
): (request: Request) => Promise<Response> {
  return async (request) => {
    const ip = getRequestIp(request);

    // Auth is resolved first when required, or when the rate limit is
    // user-scoped (it needs the user id as the identifier).
    let user: User | null = null;
    if (options.requireAuth || options.rateLimit?.scope === 'user') {
      user = await getAuthUser();
      if (options.requireAuth && !user) {
        return NextResponse.json(
          { error: options.unauthorizedMessage ?? 'Not authenticated.' },
          { status: 401 },
        );
      }
    }

    if (options.rateLimit) {
      const scope = options.rateLimit.scope ?? 'ip';
      const identifier = options.rateLimit.identifier
        ? options.rateLimit.identifier(request, user)
        : scope === 'user' && user
          ? user.id
          : ip;
      const limited = await rateLimitOrFail({
        key: options.rateLimit.key,
        scope,
        identifier,
        max: options.rateLimit.max,
        windowSeconds: options.rateLimit.windowSeconds,
      });
      if (limited) return limited;
    }

    let body = undefined as Body;
    if (options.validate) {
      let raw: unknown;
      try {
        raw = await request.json();
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
      }
      if (!options.validate(raw)) {
        return NextResponse.json(
          { error: options.invalidBodyMessage ?? 'Invalid payload.' },
          { status: 400 },
        );
      }
      body = raw;
    }

    return handler({ request, body, user, ip });
  };
}
