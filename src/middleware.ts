// Middleware — forwards the request pathname as a custom header so that
// Server Component layouts can read the current URL path without receiving
// it as a prop (which layouts do not receive in Next.js App Router).
//
// Pattern: read x-pathname in layouts to avoid infinite redirect loops
// when checking whether the user is already on an exempt path.

import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  response.headers.set('x-pathname', request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: [
    // Apply to all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
