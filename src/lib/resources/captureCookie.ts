import { NextResponse } from 'next/server';
import {
  FREE_RESOURCE_CAPTURE_COOKIE,
  normalizeCaptureEmail,
} from '@/lib/resources/freeResourceCapture';

const FREE_RESOURCE_CAPTURE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;

export function setFreeResourceCaptureCookie(response: NextResponse, email: string): NextResponse {
  const normalizedEmail = normalizeCaptureEmail(email);
  if (!normalizedEmail) return response;

  response.cookies.set(FREE_RESOURCE_CAPTURE_COOKIE, normalizedEmail, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: FREE_RESOURCE_CAPTURE_COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}

export function freeResourceCaptureResponse(
  body: Record<string, unknown>,
  email: string,
  init?: ResponseInit,
): NextResponse {
  return setFreeResourceCaptureCookie(NextResponse.json(body, init), email);
}
