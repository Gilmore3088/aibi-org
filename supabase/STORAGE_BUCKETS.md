# ADDIE Storage Buckets — operator setup checklist

These are Supabase Storage buckets, not SQL. Create via the Supabase dashboard
(Storage → New bucket) or via the Management API. Per DB Spec §8.

| Bucket | Public? | Purpose | Access pattern |
|---|---|---|---|
| `addie-course-media` | mixed | Video / audio / captions / transcripts | Public read for free-tier paths; signed URLs scoped to active entitlement for paid-tier paths |
| `addie-toolbox-exports` | private | `.md` exports of learner artifacts | Signed URLs scoped to `(select auth.uid()) = user_id` of the owning toolbox_items row |
| `addie-assessment-deliverables` | private | PDF/MD versions of the four assessment deliverables | Signed URLs scoped to the assessment_results owner |

**RLS bucket policies** mirror the table RLS:
- `addie-toolbox-exports`: read where `bucket_id = 'addie-toolbox-exports' AND name LIKE auth.uid() || '/%'` (path-prefix scope to owner)
- `addie-assessment-deliverables`: similar pattern keyed on user_id
- `addie-course-media`: free paths under `free/...` publicly readable; paid paths under `paid/...` require entitlement check via API-layer signed URL minting

**Operator action:** create the three buckets when applying migrations 00037–00049. None of the application code in Wave 1b–1e will write to Storage until M0 media production starts.
