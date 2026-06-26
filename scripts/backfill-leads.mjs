// One-time backfill: reconstruct leads orphaned in MailerLite into the
// unified `leads` table, using Resend logs to recover what each requested +
// whether delivery bounced.
//
// An "orphan" = a MailerLite subscriber with NO Supabase user_profiles row and
// NO existing leads row (i.e. a lead-magnet capture the old code never
// persisted — e.g. wkeels@safefed.org). Synthetic/test/owner addresses are
// skipped.
//
// Dry-run by default. Pass --apply to write.
//   node --env-file=.env.local scripts/backfill-leads.mjs          # dry run
//   node --env-file=.env.local scripts/backfill-leads.mjs --apply  # write

import { createClient } from '@supabase/supabase-js';

const APPLY = process.argv.includes('--apply');
const ML_KEY = process.env.MAILERLITE_API_KEY;
const RESEND_KEY = process.env.RESEND_API_KEY;
const sb = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

// Skip synthetic / internal addresses — we only recover real leads.
const SKIP = [/@aibankinginstitute\.test$/i, /@example\.com$/i, /@examplebank\.com$/i,
  /^jlgilmore2(\+|@)/i, /^james\.gilmore\+/i, /@aibankinginstitute\.com$/i];
const isSkippable = (e) => !e || SKIP.some((re) => re.test(e));

async function mlSubscribers() {
  const out = [];
  let cursor = null;
  for (let i = 0; i < 20; i += 1) {
    const url = new URL('https://connect.mailerlite.com/api/subscribers');
    url.searchParams.set('limit', '100');
    if (cursor) url.searchParams.set('cursor', cursor);
    const res = await fetch(url, { headers: { authorization: `Bearer ${ML_KEY}`, accept: 'application/json' } });
    const json = await res.json();
    out.push(...(json.data || []));
    cursor = json.meta?.next_cursor;
    if (!cursor) break;
  }
  return out;
}

async function resendByEmail() {
  // email -> { artifact, status } from "Your download: X" sends.
  const map = new Map();
  let after = null;
  for (let i = 0; i < 10; i += 1) {
    const url = new URL('https://api.resend.com/emails');
    url.searchParams.set('limit', '100');
    if (after) url.searchParams.set('after', after);
    const res = await fetch(url, { headers: { authorization: `Bearer ${RESEND_KEY}` } });
    if (!res.ok) break;
    const json = await res.json();
    const items = json.data || json.emails || [];
    for (const e of items) {
      const to = Array.isArray(e.to) ? e.to[0] : e.to;
      const m = /^Your download:\s*(.+)$/i.exec(e.subject || '');
      if (to && m && !map.has(to.toLowerCase())) {
        map.set(to.toLowerCase(), { artifact: m[1].trim(), status: e.last_event || e.status || 'unknown' });
      }
    }
    after = items.length ? items[items.length - 1].id : null;
    if (!after || items.length < 100) break;
  }
  return map;
}

async function existingEmails(table) {
  const set = new Set();
  const { data } = await sb.from(table).select('email');
  for (const r of data || []) if (r.email) set.add(r.email.toLowerCase());
  return set;
}

async function main() {
  const [subs, profiles, leads, pcLeads, resend] = await Promise.all([
    mlSubscribers(), existingEmails('user_profiles'), existingEmails('leads'),
    existingEmails('prompt_card_leads'), resendByEmail(),
  ]);
  console.log(`MailerLite subscribers: ${subs.length} · user_profiles: ${profiles.size} · existing leads: ${leads.size}`);

  const rows = [];
  for (const s of subs) {
    const email = (s.email || '').toLowerCase();
    if (isSkippable(email)) continue;
    if (profiles.has(email) || leads.has(email)) continue; // already represented
    const rd = resend.get(email);
    const source = pcLeads.has(email) ? 'prompt-cards' : rd ? 'resource-gate' : 'imported-mailerlite';
    const deliveryStatus = rd ? (/bounce/i.test(rd.status) ? 'bounced' : /deliver/i.test(rd.status) ? 'delivered' : /complain/i.test(rd.status) ? 'complained' : 'sent') : 'unknown';
    rows.push({
      email,
      source,
      requested_artifact: rd?.artifact ?? null,
      role: s.fields?.lead_role ?? null,
      lead_source: s.fields?.lead_source ?? null,
      marketing_opt_in: s.status === 'active',
      delivery_status: deliveryStatus,
      mailerlite_synced: true,
      mailerlite_subscriber_id: s.id,
      metadata: { backfilled: true, ml_subscribed_at: s.subscribed_at ?? null },
      updated_at: new Date().toISOString(),
    });
  }

  console.log(`\nOrphaned real leads to backfill: ${rows.length}`);
  for (const r of rows) console.log(`  ${r.email}  source=${r.source}  artifact=${r.requested_artifact ?? '-'}  delivery=${r.delivery_status}`);

  if (!rows.length) return;
  if (!APPLY) { console.log('\n(dry run — pass --apply to write)'); return; }

  const { error } = await sb.from('leads').upsert(rows, { onConflict: 'email' });
  if (error) { console.error('backfill failed:', error.message); process.exit(1); }
  console.log(`\nAPPLIED: ${rows.length} leads upserted.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
