// sandboxErrors — translate the SandboxError codes returned by
// /api/sandbox/run and /api/sandbox/ab into learner-friendly copy.
// Matches the codes in sandbox-service/src/handlers/shared.ts.

export interface FriendlyError {
  readonly title: string;
  readonly detail: string;
  readonly tone: 'warning' | 'error' | 'info';
}

export function toFriendlyError(
  status: number,
  code: string | undefined,
  message: string | undefined,
): FriendlyError {
  switch (code) {
    case 'RATE_LIMITED':
      return {
        title: 'Take a breather',
        detail:
          'You have run the sandbox quite a few times in a short window. Wait a minute and try again — the limit resets on a sliding window.',
        tone: 'warning',
      };
    case 'PII_IN_INPUT':
    case 'PII_BLOCKED':
      return {
        title: 'That looks like real data',
        detail:
          'A pattern in what you submitted matches an account number, SSN, or card number. Use a synthetic example or describe the situation in the abstract.',
        tone: 'warning',
      };
    case 'NOT_ENTITLED':
      return {
        title: 'Paid module',
        detail: 'This exercise is part of the paid Foundation Course. Open the gate to see your options.',
        tone: 'info',
      };
    case 'OUTPUT_FLAGGED':
      return {
        title: 'The model wandered off',
        detail:
          'The output gate caught something off-task or off-brand and dropped the response. Adjust the levers and run again.',
        tone: 'warning',
      };
    case 'PROVIDER_ERROR':
      return {
        title: 'Provider hiccup',
        detail:
          'The model provider returned an error. Try switching providers, or run again in a moment.',
        tone: 'error',
      };
    case 'EXERCISE_NOT_FOUND':
      return {
        title: 'Exercise missing',
        detail: 'We cannot find this exercise. Refresh the page; if it persists, the content team has been notified.',
        tone: 'error',
      };
    default:
      if (status === 429) {
        return toFriendlyError(status, 'RATE_LIMITED', message);
      }
      if (status === 413) {
        return toFriendlyError(status, 'PII_BLOCKED', message);
      }
      if (status === 401) {
        return {
          title: 'Sign in to keep running',
          detail: 'Your session expired. Refresh the page to start a new sandbox session.',
          tone: 'info',
        };
      }
      return {
        title: 'Something went wrong',
        detail:
          message ?? `Unexpected status ${status}. Wait a moment and try again.`,
        tone: 'error',
      };
  }
}
