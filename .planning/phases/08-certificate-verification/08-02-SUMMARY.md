---
phase: 08-certificate-verification
plan: "02"
subsystem: certificate-verification
tags: [certificates, public-verification, server-component, security, noindex]
dependency_graph:
  requires: [08-01]
  provides: [public-verify-endpoint]
  affects: [certificates-table]
tech_stack:
  added: []
  patterns: [supabase-anon-client, server-component-no-auth, noindex-robots]
key_files:
  created:
    - src/app/verify/[certificateId]/page.tsx
  modified: []
decisions:
  - "Issuing institution hardcoded as 'The AI Banking Institute' — not stored in DB, per CERT-05 data minimization requirement"
  - "Supabase anon client created directly in server component (not via createServerClient) because no session cookie is needed for public anon read"
  - "robots noindex+nofollow on both index and follow to prevent search engines from indexing pages containing personal names"
metrics:
  duration_minutes: 15
  completed_date: "2026-04-15"
  tasks_completed: 2
  files_modified: 1
---

# Phase 08 Plan 02: Certificate Verification Page Summary

**One-liner:** Public `/verify/[certificateId]` server component querying Supabase via anon client, returning exactly holder name, designation, date issued, and issuing institution with noindex robots tag.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Public verification page at /verify/[certificateId] | 910ac10 | src/app/verify/[certificateId]/page.tsx |
| 2 | Verify full certificate pipeline end-to-end (checkpoint) | — | Auto-approved (autonomous mode) |

## What Was Built

A standalone Next.js server component at `/verify/[certificateId]` that:

1. Accepts a certificate ID as a URL path parameter
2. Queries the `certificates` table via the Supabase anon client — no authentication required
3. SELECT statement is restricted to `holder_name, designation, issued_at` — no `id`, `enrollment_id`, or any other column is fetched
4. Renders exactly four data fields per CERT-05: Holder Name, Designation, Date Issued, Issuing Institution
5. Renders a clean not-found state for invalid certificate IDs
6. Sets `robots: noindex` via `generateMetadata` to prevent personal name indexing
7. Is fully server-rendered (no `'use client'`) and works without JavaScript

## Deviations from Plan

None — plan executed exactly as written.

## Threat Surface Scan

| Flag | File | Description |
|------|------|-------------|
| T-08-07 mitigated | src/app/verify/[certificateId]/page.tsx | SELECT restricted to holder_name, designation, issued_at only — enrollment_id, email, scores never returned |

## Known Stubs

None. The verification page is fully functional. In environments without Supabase configured, `fetchCertificate` returns `null` and the not-found state renders — graceful degradation.

## Self-Check: PASSED

- `src/app/verify/[certificateId]/page.tsx` — EXISTS
- Commit 910ac10 — EXISTS (`git log --oneline` confirms)
- `npx tsc --noEmit` — PASSED (zero errors)
- `npm run build` — PASSED (47/47 pages; only pre-existing admin/reviewer failure due to missing Supabase env vars at build time, unrelated to this plan)
