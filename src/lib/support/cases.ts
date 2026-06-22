import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getSupportInboxEmail } from './admin';
import {
  isSupportCaseCategory,
  isSupportCasePriority,
  isSupportCaseSource,
  isSupportCaseStatus,
  normalizeBuyerEmail,
  toRecord,
  type SupportActorType,
  type SupportCase,
  type SupportCaseCategory,
  type SupportCaseEvent,
  type SupportCasePriority,
  type SupportCaseSource,
  type SupportCaseStatus,
  type SupportCaseWithEvents,
} from './types';

type ServiceClient = ReturnType<typeof createServiceRoleClient>;

const SUPPORT_CASE_SELECT = [
  'id',
  'buyer_email',
  'subject',
  'summary',
  'category',
  'status',
  'priority',
  'source',
  'product',
  'stripe_session_id',
  'enrollment_id',
  'user_id',
  'team_cohort_id',
  'assigned_to_email',
  'dedupe_key',
  'first_response_at',
  'resolved_at',
  'metadata',
  'created_at',
  'updated_at',
].join(', ');

const SUPPORT_EVENT_SELECT = [
  'id',
  'case_id',
  'event_type',
  'actor_type',
  'actor_email',
  'message',
  'metadata',
  'created_at',
].join(', ');

interface SupportCaseRow {
  id: string;
  buyer_email: string;
  subject: string;
  summary: string;
  category: string;
  status: string;
  priority: string;
  source: string;
  product: string | null;
  stripe_session_id: string | null;
  enrollment_id: string | null;
  user_id: string | null;
  team_cohort_id: string | null;
  assigned_to_email: string;
  dedupe_key: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  metadata: unknown;
  created_at: string;
  updated_at: string;
}

interface SupportEventRow {
  id: string;
  case_id: string;
  event_type: string;
  actor_type: string;
  actor_email: string | null;
  message: string;
  metadata: unknown;
  created_at: string;
}

export interface CreateSupportCaseInput {
  readonly buyerEmail: string;
  readonly subject: string;
  readonly summary?: string;
  readonly category?: SupportCaseCategory;
  readonly status?: SupportCaseStatus;
  readonly priority?: SupportCasePriority;
  readonly source?: SupportCaseSource;
  readonly product?: string | null;
  readonly stripeSessionId?: string | null;
  readonly enrollmentId?: string | null;
  readonly userId?: string | null;
  readonly teamCohortId?: string | null;
  readonly assignedToEmail?: string | null;
  readonly dedupeKey?: string | null;
  readonly metadata?: Record<string, unknown>;
  readonly actorType?: SupportActorType;
  readonly actorEmail?: string | null;
}

export interface ListSupportCasesFilters {
  readonly status?: string | null;
  readonly category?: string | null;
  readonly priority?: string | null;
  readonly q?: string | null;
  readonly limit?: number;
}

export interface UpdateSupportCaseInput {
  readonly status?: SupportCaseStatus;
  readonly priority?: SupportCasePriority;
  readonly assignedToEmail?: string;
  readonly subject?: string;
  readonly summary?: string;
  readonly category?: SupportCaseCategory;
  readonly product?: string | null;
  readonly stripeSessionId?: string | null;
  readonly metadata?: Record<string, unknown>;
  readonly actorEmail: string;
  readonly message?: string;
}

export interface AppendSupportEventInput {
  readonly caseId: string;
  readonly eventType: string;
  readonly actorType: SupportActorType;
  readonly actorEmail?: string | null;
  readonly message: string;
  readonly metadata?: Record<string, unknown>;
}

function rowToSupportCase(row: SupportCaseRow): SupportCase {
  return {
    id: row.id,
    buyerEmail: row.buyer_email,
    subject: row.subject,
    summary: row.summary,
    category: isSupportCaseCategory(row.category) ? row.category : 'other',
    status: isSupportCaseStatus(row.status) ? row.status : 'open',
    priority: isSupportCasePriority(row.priority) ? row.priority : 'normal',
    source: isSupportCaseSource(row.source) ? row.source : 'admin',
    product: row.product,
    stripeSessionId: row.stripe_session_id,
    enrollmentId: row.enrollment_id,
    userId: row.user_id,
    teamCohortId: row.team_cohort_id,
    assignedToEmail: row.assigned_to_email,
    dedupeKey: row.dedupe_key,
    firstResponseAt: row.first_response_at,
    resolvedAt: row.resolved_at,
    metadata: toRecord(row.metadata),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToSupportEvent(row: SupportEventRow): SupportCaseEvent {
  const actorType =
    row.actor_type === 'admin' || row.actor_type === 'customer' || row.actor_type === 'system'
      ? row.actor_type
      : 'system';
  return {
    id: row.id,
    caseId: row.case_id,
    eventType: row.event_type,
    actorType,
    actorEmail: row.actor_email,
    message: row.message,
    metadata: toRecord(row.metadata),
    createdAt: row.created_at,
  };
}

function ensureSupportConfigured() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }
}

export async function appendSupportCaseEvent(
  input: AppendSupportEventInput,
  client: ServiceClient = createServiceRoleClient(),
): Promise<SupportCaseEvent> {
  const { data, error } = await client
    .from('support_case_events')
    .insert({
      case_id: input.caseId,
      event_type: input.eventType,
      actor_type: input.actorType,
      actor_email: input.actorEmail ?? null,
      message: input.message,
      metadata: input.metadata ?? {},
    })
    .select(SUPPORT_EVENT_SELECT)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to append support case event.');
  }

  if (input.actorType === 'admin') {
    await client
      .from('support_cases')
      .update({ first_response_at: new Date().toISOString() })
      .eq('id', input.caseId)
      .is('first_response_at', null);
  }

  return rowToSupportEvent(data as unknown as SupportEventRow);
}

export async function createSupportCase(
  input: CreateSupportCaseInput,
  client: ServiceClient = createServiceRoleClient(),
): Promise<SupportCase> {
  ensureSupportConfigured();
  const buyerEmail = normalizeBuyerEmail(input.buyerEmail);
  const { data, error } = await client
    .from('support_cases')
    .insert({
      buyer_email: buyerEmail,
      subject: input.subject.slice(0, 240),
      summary: input.summary ?? '',
      category: input.category ?? 'other',
      status: input.status ?? 'new',
      priority: input.priority ?? 'normal',
      source: input.source ?? 'admin',
      product: input.product ?? null,
      stripe_session_id: input.stripeSessionId ?? null,
      enrollment_id: input.enrollmentId ?? null,
      user_id: input.userId ?? null,
      team_cohort_id: input.teamCohortId ?? null,
      assigned_to_email: input.assignedToEmail ?? getSupportInboxEmail(),
      dedupe_key: input.dedupeKey ?? null,
      metadata: input.metadata ?? {},
    })
    .select(SUPPORT_CASE_SELECT)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create support case.');
  }

  const supportCase = rowToSupportCase(data as unknown as SupportCaseRow);
  await appendSupportCaseEvent(
    {
      caseId: supportCase.id,
      eventType: 'case_created',
      actorType: input.actorType ?? 'system',
      actorEmail: input.actorEmail ?? null,
      message: input.summary || input.subject,
      metadata: { source: supportCase.source, ...(input.metadata ?? {}) },
    },
    client,
  ).catch((err) => console.warn('[support] case-created event failed:', err));

  return supportCase;
}

function sanitizeSearch(value: string): string {
  return value.trim().replace(/[%,]/g, '').slice(0, 120);
}

export async function listSupportCases(
  filters: ListSupportCasesFilters = {},
  client: ServiceClient = createServiceRoleClient(),
): Promise<SupportCase[]> {
  ensureSupportConfigured();
  let query = client
    .from('support_cases')
    .select(SUPPORT_CASE_SELECT)
    .order('created_at', { ascending: false })
    .limit(filters.limit ?? 50);

  if (filters.status && filters.status !== 'all' && isSupportCaseStatus(filters.status)) {
    query = query.eq('status', filters.status);
  }
  if (filters.category && filters.category !== 'all' && isSupportCaseCategory(filters.category)) {
    query = query.eq('category', filters.category);
  }
  if (filters.priority && filters.priority !== 'all' && isSupportCasePriority(filters.priority)) {
    query = query.eq('priority', filters.priority);
  }
  if (filters.q) {
    const q = sanitizeSearch(filters.q);
    if (q.length > 0) {
      const like = `%${q}%`;
      query = query.or(`buyer_email.ilike.${like},stripe_session_id.ilike.${like},subject.ilike.${like}`);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as SupportCaseRow[]).map(rowToSupportCase);
}

export async function getSupportCaseWithEvents(
  caseId: string,
  client: ServiceClient = createServiceRoleClient(),
): Promise<SupportCaseWithEvents | null> {
  ensureSupportConfigured();
  const [caseResult, eventsResult] = await Promise.all([
    client.from('support_cases').select(SUPPORT_CASE_SELECT).eq('id', caseId).maybeSingle(),
    client
      .from('support_case_events')
      .select(SUPPORT_EVENT_SELECT)
      .eq('case_id', caseId)
      .order('created_at', { ascending: true }),
  ]);

  if (caseResult.error) throw new Error(caseResult.error.message);
  if (!caseResult.data) return null;
  if (eventsResult.error) throw new Error(eventsResult.error.message);

  return {
    case: rowToSupportCase(caseResult.data as unknown as SupportCaseRow),
    events: ((eventsResult.data ?? []) as unknown as SupportEventRow[]).map(rowToSupportEvent),
  };
}

export async function updateSupportCase(
  caseId: string,
  input: UpdateSupportCaseInput,
  client: ServiceClient = createServiceRoleClient(),
): Promise<SupportCase> {
  ensureSupportConfigured();
  const patch: Record<string, unknown> = {};
  if (input.status) {
    patch.status = input.status;
    patch.resolved_at =
      input.status === 'resolved' || input.status === 'refunded' || input.status === 'closed_no_action'
        ? new Date().toISOString()
        : null;
  }
  if (input.priority) patch.priority = input.priority;
  if (input.assignedToEmail !== undefined) patch.assigned_to_email = input.assignedToEmail.trim();
  if (input.subject !== undefined) patch.subject = input.subject.trim().slice(0, 240);
  if (input.summary !== undefined) patch.summary = input.summary.trim();
  if (input.category !== undefined) patch.category = input.category;
  if (input.product !== undefined) patch.product = input.product;
  if (input.stripeSessionId !== undefined) patch.stripe_session_id = input.stripeSessionId;
  if (input.metadata !== undefined) patch.metadata = input.metadata;

  const { data, error } = await client
    .from('support_cases')
    .update(patch)
    .eq('id', caseId)
    .select(SUPPORT_CASE_SELECT)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to update support case.');
  }

  const updated = rowToSupportCase(data as unknown as SupportCaseRow);
  await appendSupportCaseEvent(
    {
      caseId,
      eventType: input.status ? 'status_changed' : 'case_updated',
      actorType: 'admin',
      actorEmail: input.actorEmail,
      message: input.message ?? (input.status ? `Status changed to ${input.status}.` : 'Case updated.'),
      metadata: { patch },
    },
    client,
  ).catch((err) => console.warn('[support] case update event failed:', err));

  return updated;
}

function compactContext(context: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!context) return {};
  const compacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (typeof value === 'string') compacted[key] = value.slice(0, 1000);
    else compacted[key] = value;
  }
  return compacted;
}

function alertCategory(title: string): SupportCaseCategory {
  const lower = title.toLowerCase();
  if (lower.includes('purchase email')) return 'email_failure';
  if (lower.includes('provision')) return 'provisioning_failure';
  if (lower.includes('webhook')) return 'webhook_error';
  if (lower.includes('payment')) return 'failed_payment';
  return 'ops_alert';
}

function alertDedupeKey(title: string, context: Record<string, unknown>): string {
  const explicit = context.dedupeKey;
  if (typeof explicit === 'string' && explicit.trim()) return explicit.trim().slice(0, 240);
  const identifier =
    context.stripeSessionId ??
    context.sessionId ??
    context.paymentIntentId ??
    context.chargeId ??
    context.route ??
    'general';
  return `ops:${title}:${String(identifier)}`.slice(0, 240);
}

export async function createOrUpdateSupportCaseFromAlert(input: {
  readonly title: string;
  readonly message: string;
  readonly severity: 'info' | 'warning' | 'error';
  readonly context?: Record<string, unknown>;
}): Promise<{ ok: true; caseId: string } | { ok: false; skipped: string }> {
  if (!isSupabaseConfigured()) return { ok: false, skipped: 'supabase-not-configured' };

  let client: ServiceClient;
  try {
    client = createServiceRoleClient();
  } catch {
    return { ok: false, skipped: 'service-role-not-configured' };
  }
  const context = compactContext(input.context);
  const dedupeKey = alertDedupeKey(input.title, context);
  const existing = await client
    .from('support_cases')
    .select(SUPPORT_CASE_SELECT)
    .eq('dedupe_key', dedupeKey)
    .maybeSingle();

  if (existing.error) {
    console.warn('[support] alert case lookup failed:', existing.error.message);
    return { ok: false, skipped: 'lookup-failed' };
  }

  const buyerEmail =
    typeof context.email === 'string'
      ? context.email
      : typeof context.buyerEmail === 'string'
        ? context.buyerEmail
        : getSupportInboxEmail();

  if (existing.data) {
    const supportCase = rowToSupportCase(existing.data as unknown as SupportCaseRow);
    if (supportCase.status === 'resolved' || supportCase.status === 'closed_no_action') {
      await client
        .from('support_cases')
        .update({ status: 'open', resolved_at: null, priority: input.severity === 'error' ? 'high' : 'normal' })
        .eq('id', supportCase.id);
    }
    await appendSupportCaseEvent(
      {
        caseId: supportCase.id,
        eventType: 'ops_alert',
        actorType: 'system',
        message: input.message,
        metadata: { severity: input.severity, title: input.title, context },
      },
      client,
    ).catch((err) => console.warn('[support] alert event failed:', err));
    return { ok: true, caseId: supportCase.id };
  }

  try {
    const supportCase = await createSupportCase(
      {
        buyerEmail,
        subject: input.title,
        summary: input.message,
        category: alertCategory(input.title),
        status: input.severity === 'info' ? 'open' : 'new',
        priority: input.severity === 'error' ? 'high' : 'normal',
        source: 'ops_alert',
        product: typeof context.product === 'string' ? context.product : null,
        stripeSessionId:
          typeof context.stripeSessionId === 'string'
            ? context.stripeSessionId
            : typeof context.sessionId === 'string'
              ? context.sessionId
              : null,
        dedupeKey,
        metadata: { severity: input.severity, context },
      },
      client,
    );
    return { ok: true, caseId: supportCase.id };
  } catch (err) {
    console.warn('[support] alert case creation failed:', err);
    return { ok: false, skipped: 'creation-failed' };
  }
}

export function supportCaseStripeDashboardUrl(stripeSessionId: string | null): string | null {
  if (!stripeSessionId) return null;
  return `https://dashboard.stripe.com/search?query=${encodeURIComponent(stripeSessionId)}`;
}
