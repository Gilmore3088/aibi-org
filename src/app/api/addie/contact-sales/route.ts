// POST /api/addie/contact-sales
// B2B sales-assist intake. Validates → rate-limits → persists →
// (best-effort) MailerLite group-add + internal notification email.

import { NextResponse, type NextRequest } from 'next/server';
import { isValidEmail } from '@/lib/addie/supabase/service';
import { enforceEdgeRateLimit } from '@/lib/addie/rateLimit/edge';
import {
  ASSET_SIZES,
  FI_TYPES,
  TIMELINES,
  insertSalesLead,
  notifySalesLeadInternal,
  syncSalesLeadToMailerLite,
  type AssetSize,
  type FiType,
  type SalesLeadInput,
  type Timeline,
} from '@/lib/addie/leads/salesLead';

export const runtime = 'nodejs';

const MAX_TEXT = 200;
const MAX_NOTES = 2000;
const MAX_SEATS = 100000;

interface RawBody {
  fi_name?: unknown;
  fi_type?: unknown;
  asset_size?: unknown;
  seats?: unknown;
  timeline?: unknown;
  contact_name?: unknown;
  email?: unknown;
  phone?: unknown;
  notes?: unknown;
}

type ValidationError = { field: string; message: string };

function validate(raw: RawBody): { ok: true; input: SalesLeadInput } | { ok: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  const fi_name =
    typeof raw.fi_name === 'string' && raw.fi_name.trim().length > 0 && raw.fi_name.length <= MAX_TEXT
      ? raw.fi_name.trim()
      : null;
  if (!fi_name) errors.push({ field: 'fi_name', message: 'Institution name is required.' });

  const fi_type =
    typeof raw.fi_type === 'string' && (FI_TYPES as readonly string[]).includes(raw.fi_type)
      ? (raw.fi_type as FiType)
      : null;
  if (!fi_type) errors.push({ field: 'fi_type', message: 'Pick an institution type.' });

  const asset_size =
    typeof raw.asset_size === 'string' && (ASSET_SIZES as readonly string[]).includes(raw.asset_size)
      ? (raw.asset_size as AssetSize)
      : null;
  if (!asset_size) errors.push({ field: 'asset_size', message: 'Pick an asset-size band.' });

  const seatsRaw = typeof raw.seats === 'number' ? raw.seats : Number(raw.seats);
  const seats =
    Number.isFinite(seatsRaw) && Number.isInteger(seatsRaw) && seatsRaw >= 1 && seatsRaw <= MAX_SEATS
      ? seatsRaw
      : null;
  if (seats === null) errors.push({ field: 'seats', message: 'Enter an estimated seat count (1 or more).' });

  const timeline =
    typeof raw.timeline === 'string' && (TIMELINES as readonly string[]).includes(raw.timeline)
      ? (raw.timeline as Timeline)
      : null;
  if (!timeline) errors.push({ field: 'timeline', message: 'Pick a timeline.' });

  const contact_name =
    typeof raw.contact_name === 'string' &&
    raw.contact_name.trim().length > 0 &&
    raw.contact_name.length <= MAX_TEXT
      ? raw.contact_name.trim()
      : null;
  if (!contact_name) errors.push({ field: 'contact_name', message: 'Your name is required.' });

  const email = typeof raw.email === 'string' && isValidEmail(raw.email) ? raw.email : null;
  if (!email) errors.push({ field: 'email', message: 'A valid work email is required.' });

  const phone =
    raw.phone === undefined || raw.phone === null || raw.phone === ''
      ? null
      : typeof raw.phone === 'string' && raw.phone.length <= MAX_TEXT
        ? raw.phone.trim()
        : null;
  if (raw.phone && phone === null) errors.push({ field: 'phone', message: 'Phone is too long.' });

  const notes =
    raw.notes === undefined || raw.notes === null || raw.notes === ''
      ? null
      : typeof raw.notes === 'string' && raw.notes.length <= MAX_NOTES
        ? raw.notes.trim()
        : null;
  if (raw.notes && notes === null) errors.push({ field: 'notes', message: 'Notes exceed the 2000-character limit.' });

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    input: {
      fi_name: fi_name!,
      fi_type: fi_type!,
      asset_size: asset_size!,
      seats: seats!,
      timeline: timeline!,
      contact_name: contact_name!,
      email: email!,
      phone,
      notes,
      source_route: '/foundation/contact-sales',
    },
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const limited = await enforceEdgeRateLimit(req, {
    bucket: 'addie-contact-sales',
    limit: 5,
    windowSeconds: 60 * 60,
  });
  if (limited) return limited;

  let raw: RawBody;
  try {
    raw = (await req.json()) as RawBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const validated = validate(raw);
  if (!validated.ok) {
    return NextResponse.json({ error: 'validation_failed', issues: validated.errors }, { status: 400 });
  }

  try {
    const result = await insertSalesLead(validated.input);

    // Side effects are best-effort and respect SKIP_* flags. We await
    // them so failures get logged, but errors are swallowed inside.
    await Promise.all([
      syncSalesLeadToMailerLite(validated.input),
      notifySalesLeadInternal(validated.input),
    ]);

    return NextResponse.json({ ok: true, lead_id: result.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[addie/contact-sales] failed:', message);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
