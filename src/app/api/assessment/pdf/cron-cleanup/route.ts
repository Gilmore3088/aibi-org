// GET /api/assessment/pdf/cron-cleanup
// Daily Vercel Cron sweeper. Deletes PDFs older than 30 days from
// Storage and clears the user_profiles.pdf_* columns.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md

import { NextResponse } from 'next/server';
import { deleteOldPdfs } from '@/lib/pdf/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const RETENTION_DAYS = 30;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`;
  if (process.env.SKIP_CRON_AUTH !== 'true' && authHeader !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const result = await deleteOldPdfs(RETENTION_DAYS);
    return NextResponse.json({ status: 'ok', ...result }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[pdf/cron-cleanup] failed:', message);
    return NextResponse.json(
      { error: 'cleanup-failed', detail: message },
      { status: 500 },
    );
  }
}
