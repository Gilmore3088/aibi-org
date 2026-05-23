// Thin wrapper around addie.events INSERTs. Non-blocking by design —
// telemetry must never break a user flow. Errors are logged, not thrown.

import { getAddieServiceClient } from '@/lib/addie/supabase/service';

export interface EmitArgs {
  readonly action: string;
  readonly user_id?: string | null;
  readonly lead_id?: string | null;
  readonly anon_session_id?: string | null;
  readonly object_type?: string | null;
  readonly object_id?: string | null;
  readonly payload?: Record<string, unknown> | null;
}

export async function emit(args: EmitArgs): Promise<void> {
  try {
    const supa = getAddieServiceClient();
    const { error } = await supa.from('events').insert({
      action: args.action,
      user_id: args.user_id ?? null,
      lead_id: args.lead_id ?? null,
      anon_session_id: args.anon_session_id ?? null,
      object_type: args.object_type ?? null,
      object_id: args.object_id ?? null,
      payload: args.payload ?? null,
    });
    if (error) {
      console.warn('[addie/events] insert failed:', error.message);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.warn('[addie/events] emit error:', message);
  }
}
