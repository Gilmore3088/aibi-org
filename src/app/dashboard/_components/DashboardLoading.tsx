'use client';

import { SiteHeader } from '@/components/mockup';
import { dashboardStyles } from './dashboardStyles';

export function DashboardLoading() {
  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/dashboard" cta={{ label: 'Start a Lesson', href: '/courses/foundation/program' }} />
      <style jsx global>{dashboardStyles}</style>
      <main className="mockup-dash">
        <section className="welcome">
          <div className="container">
            <div className="loading-card" role="status" aria-label="Loading dashboard">
              <span className="eyebrow">Dashboard</span>
              <div className="loading-line loading-title" />
              <div className="loading-line loading-copy" />
              <div className="loading-line loading-copy short" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
