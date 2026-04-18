// GET /api/courses/generate-acceptable-use-card?enrollmentId=<id>
// POST /api/courses/generate-acceptable-use-card
//
// Generates a personalized Acceptable Use Card PDF for Activity 5.2.
//
// Security model (T-05-10, T-05-11, T-05-12):
//   - T-05-10: Auth session required — unauthenticated requests return 401.
//   - T-05-10: Enrollment ownership verified — enrollment.user_id must match authenticated user.
//   - T-05-12: Ownership check prevents generating PDFs for other users' responses.
//   - T-05-11: User text rendered via @react-pdf/renderer Text components — no HTML injection possible.
//
// GET: re-download from saved activity response (activity_id = '5.2').
// POST: accept fresh response data and generate immediately.
//       Body: { enrollmentId, responses: { roleContext, primaryAiTool, highestRiskScenario, quickWinUseCase } }

import { cookies } from 'next/headers';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import React from 'react';
import type { DocumentProps } from '@react-pdf/renderer';
import { renderToBuffer } from '@react-pdf/renderer';
import { AcceptableUseCardDocument } from '@/lib/pdf/AcceptableUseCardDocument';

const ACTIVITY_5_2 = '5.2';
const PDF_FILENAME = 'AiBI-Acceptable-Use-Card.pdf';

interface ActivityResponseRow {
  response: {
    'role-context'?: string;
    'primary-ai-tool'?: string;
    'highest-risk-scenario'?: string;
    'quick-win-use-case'?: string;
  };
}

interface EnrollmentRow {
  id: string;
  user_id: string;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

async function authenticate(): Promise<
  | { userId: string; error?: never }
  | { userId?: never; error: Response }
> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = cookies();

  const anonClient = createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // no-op in Route Handlers — session kept alive by middleware
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await anonClient.auth.getUser();

  if (authError || !user) {
    return {
      error: new Response(JSON.stringify({ error: 'Not authenticated.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }

  return { userId: user.id };
}

async function verifyEnrollmentOwnership(
  enrollmentId: string,
  userId: string,
): Promise<{ enrollment: EnrollmentRow; error?: never } | { enrollment?: never; error: Response }> {
  const serviceClient = createServiceRoleClient();

  const { data: enrollment, error: lookupError } = await serviceClient
    .from('course_enrollments')
    .select('id, user_id')
    .eq('id', enrollmentId)
    .eq('user_id', userId)
    .single();

  if (lookupError || !enrollment) {
    return {
      error: new Response(
        JSON.stringify({ error: 'Enrollment not found or access denied.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  return { enrollment: enrollment as EnrollmentRow };
}

async function generatePdf(
  roleContext: string,
  primaryAiTool: string,
  highestRiskScenario: string,
  quickWinUseCase: string,
): Promise<Buffer> {
  const generatedDate = formatDate(new Date());

  // Cast required: renderToBuffer expects ReactElement<DocumentProps> but our wrapper
  // component is typed as ReactElement<AcceptableUseCardProps>. The component renders
  // a <Document> root so the cast is safe.
  const element = React.createElement(AcceptableUseCardDocument, {
    roleContext,
    primaryAiTool,
    highestRiskScenario,
    quickWinUseCase,
    generatedDate,
  }) as React.ReactElement<DocumentProps>;

  return renderToBuffer(element);
}

function pdfResponse(buffer: Buffer): Response {
  // Convert Node.js Buffer to Uint8Array for Web API Response compatibility
  const body = new Uint8Array(buffer);
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${PDF_FILENAME}"`,
      'Content-Length': String(buffer.length),
      'Cache-Control': 'no-store',
    },
  });
}

// ---------------------------------------------------------------------------
// GET — re-download from saved activity_response
// ---------------------------------------------------------------------------
export async function GET(request: Request): Promise<Response> {
  if (!isSupabaseConfigured()) {
    return new Response(JSON.stringify({ error: 'Service not configured.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { searchParams } = new URL(request.url);
  const enrollmentId = searchParams.get('enrollmentId');

  if (!enrollmentId || enrollmentId.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'enrollmentId query parameter is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Authenticate
  const authResult = await authenticate();
  if (authResult.error) return authResult.error;
  const { userId } = authResult;

  // Verify ownership
  const ownerResult = await verifyEnrollmentOwnership(enrollmentId, userId);
  if (ownerResult.error) return ownerResult.error;

  // Fetch saved activity response
  const serviceClient = createServiceRoleClient();
  const { data: activityResponse, error: fetchError } = await serviceClient
    .from('activity_responses')
    .select('response')
    .eq('enrollment_id', enrollmentId)
    .eq('activity_id', ACTIVITY_5_2)
    .single();

  if (fetchError || !activityResponse) {
    return new Response(
      JSON.stringify({
        error: 'No Activity 5.2 response found for this enrollment. Complete Activity 5.2 first.',
      }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const row = activityResponse as ActivityResponseRow;
  const {
    'role-context': roleContext = '',
    'primary-ai-tool': primaryAiTool = '',
    'highest-risk-scenario': highestRiskScenario = '',
    'quick-win-use-case': quickWinUseCase = '',
  } = row.response;

  try {
    const buffer = await generatePdf(roleContext, primaryAiTool, highestRiskScenario, quickWinUseCase);
    return pdfResponse(buffer);
  } catch (err) {
    console.error('[generate-acceptable-use-card] PDF generation error (GET):', err);
    return new Response(JSON.stringify({ error: 'PDF generation failed. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ---------------------------------------------------------------------------
// POST — generate from submitted response data
// ---------------------------------------------------------------------------
interface PostBody {
  enrollmentId?: unknown;
  responses?: unknown;
}

export async function POST(request: Request): Promise<Response> {
  if (!isSupabaseConfigured()) {
    return new Response(JSON.stringify({ error: 'Service not configured.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { enrollmentId: rawEnrollmentId, responses: rawResponses } = body;

  if (typeof rawEnrollmentId !== 'string' || rawEnrollmentId.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'enrollmentId is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const enrollmentId = rawEnrollmentId.trim();

  if (
    typeof rawResponses !== 'object' ||
    rawResponses === null ||
    Array.isArray(rawResponses)
  ) {
    return new Response(JSON.stringify({ error: 'responses must be a non-empty object.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const responses = rawResponses as Record<string, unknown>;

  const roleContext =
    typeof responses['roleContext'] === 'string' ? responses['roleContext'] : '';
  const primaryAiTool =
    typeof responses['primaryAiTool'] === 'string' ? responses['primaryAiTool'] : '';
  const highestRiskScenario =
    typeof responses['highestRiskScenario'] === 'string' ? responses['highestRiskScenario'] : '';
  const quickWinUseCase =
    typeof responses['quickWinUseCase'] === 'string' ? responses['quickWinUseCase'] : '';

  if (!roleContext || !primaryAiTool || !highestRiskScenario || !quickWinUseCase) {
    return new Response(
      JSON.stringify({
        error:
          'responses must include roleContext, primaryAiTool, highestRiskScenario, and quickWinUseCase.',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Authenticate
  const authResult = await authenticate();
  if (authResult.error) return authResult.error;
  const { userId } = authResult;

  // Verify ownership
  const ownerResult = await verifyEnrollmentOwnership(enrollmentId, userId);
  if (ownerResult.error) return ownerResult.error;

  try {
    const buffer = await generatePdf(roleContext, primaryAiTool, highestRiskScenario, quickWinUseCase);
    return pdfResponse(buffer);
  } catch (err) {
    console.error('[generate-acceptable-use-card] PDF generation error (POST):', err);
    return new Response(JSON.stringify({ error: 'PDF generation failed. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
