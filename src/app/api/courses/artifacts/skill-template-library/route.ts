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
// Output: static PDF download of the Skill Template Library.

import { cookies } from 'next/headers';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';

const PDF_FILENAME = 'AiBI-Skill-Template-Library.pdf';
const PDF_PATH = join(process.cwd(), 'public', 'downloads', 'aibi-skill-template-library.pdf');

export async function GET(): Promise<Response> {
  // When Supabase is not configured (local dev), serve the PDF without auth check
  if (isSupabaseConfigured()) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const cookieStore = await cookies();

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
    const file = await readFile(PDF_PATH);

    return new Response(new Uint8Array(file), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${PDF_FILENAME}"`,
        'Content-Length': String(file.length),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[skill-template-library] static PDF read failed:', err);
    return new Response(JSON.stringify({ error: 'PDF generation failed. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
