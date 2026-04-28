import { NextResponse } from 'next/server';
import { verifyReviewer } from '@/lib/auth/reviewerAuth';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

function csvCell(value: unknown): string {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  const reviewer = await verifyReviewer();
  if (!reviewer.isReviewer) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('course_enrollments')
    .select('id, email, product, completed_modules, current_module, enrolled_at, certificates(certificate_id, issued_at)');

  if (error) {
    return NextResponse.json({ error: 'Failed to export learners.' }, { status: 500 });
  }

  const header = [
    'email',
    'product',
    'course_progress',
    'current_module',
    'enrolled_at',
    'certificate_status',
    'certificate_id',
  ];

  const rows = (data ?? []).map((row) => {
    const certificate = Array.isArray(row.certificates) ? row.certificates[0] : null;
    return [
      row.email,
      row.product,
      row.completed_modules?.length ?? 0,
      row.current_module,
      row.enrolled_at,
      certificate ? 'issued' : 'not-issued',
      certificate?.certificate_id ?? '',
    ].map(csvCell).join(',');
  });

  return new NextResponse([header.map(csvCell).join(','), ...rows].join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="aibi-learners.csv"',
    },
  });
}
