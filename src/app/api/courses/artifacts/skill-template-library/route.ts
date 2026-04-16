// GET /api/courses/artifacts/skill-template-library
//
// Generates the Skill Template Library PDF — Module 6 static artifact.
// Not personalized — same content for all learners.
//
// Security model (T-06-01):
//   - Auth session required — unauthenticated requests return 401.
//   - Enrollment ownership NOT required — the library is a fixed document,
//     but authentication confirms the requester is an active learner.
//
// Output: PDF download of the 6-page Skill Template Library.

import { cookies } from 'next/headers';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import React from 'react';
import type { DocumentProps } from '@react-pdf/renderer';
import { renderToBuffer } from '@react-pdf/renderer';
import { SkillTemplateLibraryDocument } from '@/lib/pdf/SkillTemplateLibraryDocument';

const PDF_FILENAME = 'AiBI-Skill-Template-Library.pdf';

export async function GET(): Promise<Response> {
  // When Supabase is not configured (local dev), serve the PDF without auth check
  if (isSupabaseConfigured()) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const cookieStore = cookies();

    const anonClient = createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    });

    const {
      data: { user },
      error: authError,
    } = await anonClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Not authenticated.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  try {
    const element = React.createElement(
      SkillTemplateLibraryDocument,
      {},
    ) as React.ReactElement<DocumentProps>;

    const buffer = await renderToBuffer(element);
    const body = new Uint8Array(buffer);

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${PDF_FILENAME}"`,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[skill-template-library] PDF generation error:', err);
    return new Response(JSON.stringify({ error: 'PDF generation failed. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
