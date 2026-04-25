import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export function POST() {
  return NextResponse.json(
    { error: 'AiBI-S is coming soon. Start with AiBI-P Practitioner.' },
    { status: 404 }
  );
}
