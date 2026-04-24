import Link from 'next/link';
import { redirect } from 'next/navigation';
import { verifyReviewer } from '@/lib/auth/reviewerAuth';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface EnrollmentRow {
  readonly id: string;
  readonly email: string;
  readonly product: string;
  readonly completed_modules: readonly number[];
  readonly current_module: number;
  readonly enrolled_at: string;
}

interface ProfileRow {
  readonly email: string;
  readonly readiness_score: number | null;
  readonly readiness_tier_label: string | null;
}

interface CertificateRow {
  readonly enrollment_id: string;
}

export const metadata = {
  title: 'Institution Admin | The AI Banking Institute',
};

export default async function AdminPage() {
  const { isReviewer } = await verifyReviewer();
  if (!isReviewer) redirect('/');

  if (!isSupabaseConfigured()) {
    return (
      <main className="px-6 py-14">
        <p className="text-sm text-[color:var(--color-slate)]">
          Admin requires Supabase configuration.
        </p>
      </main>
    );
  }

  const supabase = createServiceRoleClient();
  const [enrollmentsResult, profilesResult, certificatesResult] = await Promise.all([
    supabase
      .from('course_enrollments')
      .select('id, email, product, completed_modules, current_module, enrolled_at')
      .order('enrolled_at', { ascending: false }),
    supabase
      .from('user_profiles')
      .select('email, readiness_score, readiness_tier_label'),
    supabase
      .from('certificates')
      .select('enrollment_id'),
  ]);

  const enrollments = (enrollmentsResult.data ?? []) as EnrollmentRow[];
  const profiles = (profilesResult.data ?? []) as ProfileRow[];
  const certificates = (certificatesResult.data ?? []) as CertificateRow[];
  const readinessScores = profiles
    .map((profile) => profile.readiness_score)
    .filter((score): score is number => typeof score === 'number');
  const averageReadiness = readinessScores.length
    ? Math.round(readinessScores.reduce((sum, score) => sum + score, 0) / readinessScores.length)
    : null;
  const activeUsers = enrollments.filter((row) => row.completed_modules.length > 0).length;
  const completedUsers = enrollments.filter((row) => row.completed_modules.length >= 9).length;

  return (
    <main className="px-6 py-10 md:py-14">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-[color:var(--color-ink)]/10 pb-6">
          <div>
            <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
              Institution Admin MVP
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight">
              Training progress
            </h1>
          </div>
          <div className="flex gap-4">
            <a
              href="/api/admin/institution/export.csv"
              className="px-5 py-2.5 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px]"
            >
              Export CSV
            </a>
            <Link
              href="/admin/reviewer"
              className="px-5 py-2.5 border border-[color:var(--color-ink)]/25 text-[color:var(--color-ink)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px]"
            >
              Reviewer Queue
            </Link>
          </div>
        </header>

        <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <AdminMetric label="Total users" value={String(enrollments.length)} />
          <AdminMetric label="Active users" value={String(activeUsers)} />
          <AdminMetric label="Completed" value={String(completedUsers)} />
          <AdminMetric label="Avg readiness" value={averageReadiness ? `${averageReadiness}/48` : 'N/A'} />
          <AdminMetric label="Certificates" value={String(certificates.length)} />
        </section>

        <section className="overflow-x-auto border border-[color:var(--color-ink)]/10 rounded-[3px]">
          <table className="min-w-full text-sm">
            <thead className="bg-[color:var(--color-parch)]">
              <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Assessment</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Current</th>
                <th className="px-4 py-3">Certificate</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((row) => {
                const profile = profiles.find((item) => item.email === row.email);
                const hasCertificate = certificates.some((cert) => cert.enrollment_id === row.id);
                return (
                  <tr key={row.id} className="border-t border-[color:var(--color-ink)]/10">
                    <td className="px-4 py-3 text-[color:var(--color-ink)]">{row.email}</td>
                    <td className="px-4 py-3 text-[color:var(--color-slate)]">{row.product}</td>
                    <td className="px-4 py-3 text-[color:var(--color-slate)]">
                      {profile?.readiness_tier_label ?? 'Not taken'}
                    </td>
                    <td className="px-4 py-3 font-mono text-[color:var(--color-terra)]">
                      {row.completed_modules.length}/9
                    </td>
                    <td className="px-4 py-3 text-[color:var(--color-slate)]">
                      Module {row.current_module || 1}
                    </td>
                    <td className="px-4 py-3 text-[color:var(--color-slate)]">
                      {hasCertificate ? 'Issued' : 'Not issued'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}

function AdminMetric({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="border border-[color:var(--color-ink)]/10 rounded-[3px] p-5 bg-[color:var(--color-parch)]">
      <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)]">
        {label}
      </p>
      <p className="font-serif text-3xl text-[color:var(--color-ink)] mt-2">
        {value}
      </p>
    </div>
  );
}
