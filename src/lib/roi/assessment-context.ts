export interface RoiInputs {
  readonly fte: number;
  readonly costPerFTE: number;
  readonly loHours: number;
  readonly hiHours: number;
}

export interface RoiAssessmentContext extends RoiInputs {
  readonly mid: number;
  readonly low: number;
  readonly high: number;
  readonly hoursPerYear: number;
  readonly payrollRecaptured: string;
}

const ROI_SOURCE = 'calculator';
const ROI_PARAM_SOURCE = 'roi';
const ROI_PARAM_FTE = 'roi_fte';
const ROI_PARAM_COST = 'roi_cost';
const ROI_PARAM_LO = 'roi_lo';
const ROI_PARAM_HI = 'roi_hi';

const LIMITS = {
  fte: { min: 1, max: 1000 },
  costPerFTE: { min: 10_000, max: 500_000 },
  hours: { min: 0, max: 40 },
} as const;

type SearchLike =
  | URLSearchParams
  | Readonly<{
      readonly [key: string]: string | string[] | undefined;
    }>;

function getSearchValue(search: SearchLike, key: string): string | null {
  if (search instanceof URLSearchParams) return search.get(key);
  const value = search[key];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function toBoundedInteger(value: string | null, min: number, max: number): number | null {
  if (value === null || value.trim() === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export function calculateRoiContext(inputs: RoiInputs): RoiAssessmentContext {
  const fte = Math.min(LIMITS.fte.max, Math.max(LIMITS.fte.min, Math.round(inputs.fte)));
  const costPerFTE = Math.min(
    LIMITS.costPerFTE.max,
    Math.max(LIMITS.costPerFTE.min, Math.round(inputs.costPerFTE)),
  );
  const loHours = Math.min(
    LIMITS.hours.max,
    Math.max(LIMITS.hours.min, Math.round(inputs.loHours)),
  );
  const hiHours = Math.min(
    LIMITS.hours.max,
    Math.max(loHours, Math.round(inputs.hiHours)),
  );

  const hourlyRate = costPerFTE / 2080;
  const midHours = (loHours + hiHours) / 2;
  const totalPayroll = fte * costPerFTE;
  const mid = fte * midHours * hourlyRate * 50;

  return {
    fte,
    costPerFTE,
    loHours,
    hiHours,
    mid,
    low: fte * loHours * hourlyRate * 50,
    high: fte * hiHours * hourlyRate * 50,
    hoursPerYear: Math.round(fte * midHours * 50),
    payrollRecaptured:
      totalPayroll > 0 ? ((mid / totalPayroll) * 100).toFixed(1) : '0.0',
  };
}

export function appendRoiSearchParams(params: URLSearchParams, inputs: RoiInputs): void {
  const context = calculateRoiContext(inputs);
  params.set(ROI_PARAM_SOURCE, ROI_SOURCE);
  params.set(ROI_PARAM_FTE, String(context.fte));
  params.set(ROI_PARAM_COST, String(context.costPerFTE));
  params.set(ROI_PARAM_LO, String(context.loHours));
  params.set(ROI_PARAM_HI, String(context.hiHours));
}

export function buildRoiAssessmentHref(baseHref: string, inputs: RoiInputs): string {
  if (!baseHref.startsWith('/')) return baseHref;

  const url = new URL(baseHref, 'https://www.aibankinginstitute.com');
  appendRoiSearchParams(url.searchParams, inputs);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function parseRoiAssessmentContext(search: SearchLike | null | undefined): RoiAssessmentContext | null {
  if (!search) return null;
  if (getSearchValue(search, ROI_PARAM_SOURCE) !== ROI_SOURCE) return null;

  const fte = toBoundedInteger(
    getSearchValue(search, ROI_PARAM_FTE),
    LIMITS.fte.min,
    LIMITS.fte.max,
  );
  const costPerFTE = toBoundedInteger(
    getSearchValue(search, ROI_PARAM_COST),
    LIMITS.costPerFTE.min,
    LIMITS.costPerFTE.max,
  );
  const loHours = toBoundedInteger(
    getSearchValue(search, ROI_PARAM_LO),
    LIMITS.hours.min,
    LIMITS.hours.max,
  );
  const hiHours = toBoundedInteger(
    getSearchValue(search, ROI_PARAM_HI),
    LIMITS.hours.min,
    LIMITS.hours.max,
  );

  if (fte === null || costPerFTE === null || loHours === null || hiHours === null) {
    return null;
  }

  return calculateRoiContext({ fte, costPerFTE, loHours, hiHours });
}

export function formatRoiCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatRoiNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
