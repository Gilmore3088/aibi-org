// Purchase signals → MailerLite subscriber fields.
//
// The nurture automations' exit conditions ("never pitch what they bought")
// need something on the subscriber to reference. The Stripe webhook calls
// markPurchaseSignal after a successful checkout so the matching date field
// is set:
//   in_depth   → purchased_in_depth    (the $99 In-Depth diagnostic)
//   foundation → foundation_enrolled   (Foundation course, individual or
//                                       institution buyer)
//
// Same conventions as the rest of the MailerLite layer: best-effort,
// non-throwing, suppressed when SKIP_MAILERLITE=true, no-op without an API
// key. A missed signal only means one extra nurture email — never a blocked
// purchase.

const ML_API_BASE = 'https://connect.mailerlite.com/api';

export type PurchaseSignal = 'in_depth' | 'foundation';

const SIGNAL_FIELD: Record<PurchaseSignal, string> = {
  in_depth: 'purchased_in_depth',
  foundation: 'foundation_enrolled',
};

export interface PurchaseSignalResult {
  readonly status: 'marked' | 'skipped' | 'failed';
  readonly reason?: string;
}

export async function markPurchaseSignal(
  email: string,
  signal: PurchaseSignal,
): Promise<PurchaseSignalResult> {
  if (process.env.SKIP_MAILERLITE === 'true') {
    return { status: 'skipped', reason: 'staging-suppression' };
  }
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) {
    return { status: 'skipped', reason: 'no-api-key' };
  }

  try {
    // POST /subscribers upserts by email and merges fields without touching
    // group membership, so a buyer who was never a lead still gets a row.
    const res = await fetch(`${ML_API_BASE}/subscribers`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        fields: { [SIGNAL_FIELD[signal]]: new Date().toISOString().slice(0, 10) },
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => 'unknown');
      console.warn(
        `[mailerlite] purchase signal ${signal} failed: ${res.status} ${detail.slice(0, 200)}`,
      );
      return { status: 'failed', reason: `${res.status}` };
    }
    return { status: 'marked' };
  } catch (err) {
    console.warn(`[mailerlite] purchase signal ${signal} error`, err);
    return { status: 'failed', reason: 'network' };
  }
}
