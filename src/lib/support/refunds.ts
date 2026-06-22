export interface RefundEligibilityInput {
  readonly product: string | null;
  readonly purchasedAt: string | null;
  readonly completedModules?: readonly number[];
  readonly certificateCount?: number;
  readonly assessmentSubmitted?: boolean;
  readonly alreadyRefunded?: boolean;
  readonly now?: Date;
}

export interface RefundEligibility {
  readonly eligible: boolean;
  readonly label: 'eligible' | 'ineligible' | 'needs_review' | 'already_refunded';
  readonly ageDays: number | null;
  readonly reasons: readonly string[];
  readonly blockers: readonly string[];
}

const REFUND_WINDOW_DAYS = 7;

function wholeDaysBetween(startIso: string, end: Date): number | null {
  const start = new Date(startIso);
  const time = start.getTime();
  if (Number.isNaN(time)) return null;
  return Math.max(0, Math.floor((end.getTime() - time) / (24 * 60 * 60 * 1000)));
}

export function evaluateRefundEligibility(input: RefundEligibilityInput): RefundEligibility {
  const now = input.now ?? new Date();
  const ageDays = input.purchasedAt ? wholeDaysBetween(input.purchasedAt, now) : null;
  const reasons: string[] = [];
  const blockers: string[] = [];

  if (input.alreadyRefunded) {
    return {
      eligible: false,
      label: 'already_refunded',
      ageDays,
      reasons: ['Refund guard row already exists for this checkout session.'],
      blockers: [],
    };
  }

  if (ageDays === null) {
    reasons.push('Purchase date could not be confirmed from local records.');
  } else if (ageDays <= REFUND_WINDOW_DAYS) {
    reasons.push(`Purchase is within the ${REFUND_WINDOW_DAYS}-day refund window.`);
  } else {
    blockers.push(`Purchase is ${ageDays} days old, outside the ${REFUND_WINDOW_DAYS}-day refund window.`);
  }

  const completedModules = input.completedModules ?? [];
  const certificateCount = input.certificateCount ?? 0;
  const product = input.product ?? 'unknown';

  if (product === 'in-depth-assessment') {
    if (input.assessmentSubmitted) {
      blockers.push('In-Depth assessment/report appears to have been submitted.');
    } else {
      reasons.push('No submitted In-Depth report was found.');
    }
  } else if (product === 'team-assessment') {
    reasons.push('Team Assessment refund requires manual review of participant activity.');
  } else {
    if (completedModules.length >= 2) {
      blockers.push(`${completedModules.length} Foundation modules are completed.`);
    } else {
      reasons.push('Fewer than two Foundation modules are completed.');
    }
    if (certificateCount > 0) {
      blockers.push('A certificate has been issued.');
    } else {
      reasons.push('No issued certificate was found.');
    }
  }

  if (blockers.length > 0) {
    return { eligible: false, label: 'ineligible', ageDays, reasons, blockers };
  }

  if (ageDays === null || product === 'team-assessment') {
    return { eligible: false, label: 'needs_review', ageDays, reasons, blockers };
  }

  return { eligible: true, label: 'eligible', ageDays, reasons, blockers };
}
