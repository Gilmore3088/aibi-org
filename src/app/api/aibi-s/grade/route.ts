import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export function POST() {
  return NextResponse.json(
    { error: 'AiBI-S is coming soon. Start with AiBI-Practitioner.' },
    { status: 404 }
  );
}
