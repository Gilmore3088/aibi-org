// Shared form helpers for the Foundation course activity components.
// Both ActivityForm.tsx and AcceptableUseCardForm.tsx render
// `Activity.fields` and need the same value-init + required/minLength
// validation pass.

import type { ActivityField } from '@content/courses/foundation-program';

export function getInitialActivityValues(
  fields: readonly ActivityField[],
  existing?: Record<string, string> | null,
): Record<string, string> {
  const initial: Record<string, string> = {};
  for (const field of fields) {
    initial[field.id] = existing?.[field.id] ?? '';
  }
  return initial;
}

export function validateActivityFields(
  fields: readonly ActivityField[],
  values: Record<string, string>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const value = values[field.id] ?? '';
    if (field.required && value.trim().length === 0) {
      errors[field.id] = `${field.label} is required.`;
      continue;
    }
    if (field.minLength && value.length < field.minLength) {
      errors[field.id] =
        `Must be at least ${field.minLength} characters (currently ${value.length}).`;
    }
  }
  return errors;
}
