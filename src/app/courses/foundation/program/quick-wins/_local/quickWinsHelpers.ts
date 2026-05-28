// Pure helpers + shared types + form constants for QuickWinsClient.

import type { CSSProperties } from 'react';
import {
  QUICK_WIN_TOOLS as TOOLS,
  QUICK_WIN_WEEKLY_RUNS as WEEKLY_RUNS,
} from '../../_lib/quickWinsData';

export interface QuickWin {
  id: string;
  enrollment_id: string;
  description: string;
  tool: string;
  skill_name: string;
  frequency: string;
  time_saved_minutes: number;
  department: string;
  created_at: string;
}

export interface FormState {
  description: string;
  tool: string;
  skillName: string;
  frequency: string;
  timeSavedMinutes: number;
  department: string;
}

export const EMPTY_FORM: FormState = {
  description: '',
  tool: '',
  skillName: '',
  frequency: '',
  timeSavedMinutes: 0,
  department: '',
};

export function minutesToLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  if (minutes === 60) return '1 hr';
  return '2+ hrs';
}

export function toolLabel(value: string): string {
  return TOOLS.find((t) => t.value === value)?.label ?? value;
}

export function quarterlyHours(win: QuickWin): number {
  const runsPerWeek = WEEKLY_RUNS[win.frequency] ?? 1;
  return (runsPerWeek * 13 * win.time_saved_minutes) / 60;
}

export function isFormValid(form: FormState): boolean {
  return (
    form.description.trim().length > 0 &&
    form.tool.length > 0 &&
    form.skillName.trim().length > 0 &&
    form.frequency.length > 0 &&
    form.timeSavedMinutes > 0 &&
    form.department.trim().length > 0
  );
}

export const fieldLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--slate-600)',
  marginBottom: 8,
};

export const inputStyle: CSSProperties = {
  width: '100%',
  background: 'var(--cream)',
  border: '1px solid var(--ink-a10)',
  borderRadius: 12,
  padding: '12px 14px',
  fontSize: 14,
  color: 'var(--ink)',
  outline: 'none',
  fontFamily: 'inherit',
};
