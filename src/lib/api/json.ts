import { NextResponse } from 'next/server';

/** Standard JSON error response for route handlers. */
export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
