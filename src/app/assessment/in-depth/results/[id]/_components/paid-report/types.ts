export interface PersonalizationPayload {
  readonly execSummary: string;
  readonly thirtyDayPlan: readonly string[];
  readonly model: string;
  readonly generatedAt: string;
}

export type PersonalizationState =
  | { status: 'loading' }
  | { status: 'ready'; data: PersonalizationPayload }
  | { status: 'error'; message: string }
  | { status: 'disabled' };
