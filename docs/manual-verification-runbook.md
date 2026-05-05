# Manual Verification Runbook — Specs 1–4

Operator-gated acceptance criteria the four-surface program shipped without verifying. Run each section once after the env-var setup weekend; mark pass/fail; file issues for any failure.

**Prereq:** Vercel env vars per `tasks/weekend-env-setup.md` are set (at least Phase 0 + Phase 1). The site is deployed at https://aibankinginstitute.com.

---

## A. Spec 2 — PDF download (PR #41)

### A1. Cron cleanup endpoint authenticates

```bash
# Should return 401 (no bearer):
curl -i https://aibankinginstitute.com/api/assessment/pdf/cron-cleanup

# Should return 401 (wrong bearer):
curl -i -H "Authorization: Bearer wrong" \
  https://aibankinginstitute.com/api/assessment/pdf/cron-cleanup

# Should return 200 (correct bearer):
curl -i -H "Authorization: Bearer $CRON_SECRET" \
  https://aibankinginstitute.com/api/assessment/pdf/cron-cleanup
```

Expected last call: `200 {"status":"ok","deleted":N}` where N is the number of PDFs that were 30+ days old at run time.

PASS / FAIL: ___

### A2. Warm route validates profileId

```bash
# Should return 400 (invalid UUID format):
curl -i -X POST https://aibankinginstitute.com/api/assessment/pdf/warm \
  -H "content-type: application/json" \
  -d '{"profileId":"not-a-uuid"}'

# Should return 404 (UUID format valid but row does not exist):
curl -i -X POST https://aibankinginstitute.com/api/assessment/pdf/warm \
  -H "content-type: application/json" \
  -d '{"profileId":"00000000-0000-0000-0000-000000000000"}'
```

PASS / FAIL: ___

### A3. End-to-end PDF generation

1. Open https://aibankinginstitute.com/assessment in a desktop browser.
2. Complete the assessment with a real test email (e.g. `you+test@yourdomain.com`).
3. Hit the email gate, submit. Confirm you reach the results page.
4. Watch DevTools Network tab — `/api/assessment/pdf/warm` POST should fire on results-page mount.
5. The Download PDF button should transition from "Preparing your brief…" to "Download PDF" within ~10s.
6. Click Download. Expect SignupModal to open (since you're not auth'd).
7. Click "Send my sign-in link". Expect "Check your inbox".
8. Click the magic link in your inbox. Expect to land back on `/results/{your-profileId}`.
9. Click Download again. Expect a PDF file to download named `AI-Readiness-Briefing.pdf`.
10. Open the PDF. Verify all 12 pages render: Cover, Exec Summary, Lensed Implications, Strengths & Gaps, two Gap Detail pages, First Move, Starter Prompt + 7-Day Plan, Future Vision, Next Steps Trio, Governance & Citations, Back Cover.

PASS / FAIL each step: ___

### A4. Spec 2 AC #11 — Mobile responsive at 375px

1. Open Chrome DevTools, toggle Device Toolbar, set to iPhone SE (375 × 667).
2. Navigate to `/assessment`. Complete with a fresh email.
3. On the results screen, verify:
   - No horizontal scroll.
   - All sections render legibly (text size readable, no clipped containers).
   - The Download PDF button is reachable in the layout.
   - The SignupModal (when triggered) fits the viewport without overflow.

PASS / FAIL: ___ Notes: ___

---

## B. Spec 3 — ConvertKit email sequence (PR #42)

### B1. Tagging fires for opted-in capture

1. Pick a tier you want to test (e.g. `building-momentum` — score 33-40).
2. Take the assessment, deliberately answer to land in that tier, opt in to marketing.
3. In CK dashboard → Subscribers → search by your test email → Tags column.
4. Confirm the matching tag is attached: `aibi-assessment-buildingmomentum`.

PASS / FAIL: ___

### B2. Plausible event fires

1. With Plausible dashboard open in another tab, complete an opt-in capture.
2. Watch the live event feed for `convertkit_tag_added` with prop `tier=building-momentum`.

PASS / FAIL: ___

### B3. Opt-out skips tagging

1. Take the assessment again with a fresh email, this time UNCHECK the marketing opt-in.
2. Confirm the user appears in the CK newsletter list (existing flow) but does NOT have a tier tag.
3. Confirm Plausible does NOT log `convertkit_tag_added`.

PASS / FAIL: ___

### B4. Retake re-routes correctly

1. Take the assessment with email `retake@yourdomain.com`, score in `starting-point`, opt in.
2. Confirm tag `aibi-assessment-startingpoint` attached in CK.
3. Take the assessment again with the SAME email, but answer to score in `building-momentum`.
4. Confirm:
   - `aibi-assessment-startingpoint` tag is REMOVED.
   - `aibi-assessment-buildingmomentum` tag is ADDED.

PASS / FAIL: ___

### B5. Inbox delivery — Gmail

1. Take the assessment with a Gmail test address, opt in. Land in any tier.
2. Wait 1-2 hours.
3. Check Gmail inbox for "Your AI Readiness brief, {firstName}".
4. Confirm:
   - Lands in Inbox (not Promotions, not Spam).
   - Sender is whatever you configured in CK.
   - No formatting issues (broken merge tags, weird line breaks).
   - The `/results/{profileId}` link works when clicked.

PASS / FAIL: ___ Notes (subject as received, sender, folder, render quirks): ___

### B6. Inbox delivery — Outlook

Repeat B5 with an Outlook (outlook.com or O365) test address.

PASS / FAIL: ___ Notes: ___

### B7. Unsubscribe link works

1. In the email from B5, scroll to footer.
2. Click the standard CK unsubscribe link.
3. In CK dashboard, confirm the subscriber is now marked Unsubscribed.
4. Take the assessment again with the same email, opt in. Confirm the tag-add API call is made (Vercel logs) but the user does NOT receive Email #1 — CK suppresses sequences for unsubscribed users.

PASS / FAIL: ___

---

## C. Spec 4 — Return URL (PR #43)

### C1. Owner can view their brief

1. Sign in to https://aibankinginstitute.com/auth/login as the user who took the assessment in A3.
2. Navigate to `/results/{their-profileId}`.
3. Expect the same brief content that rendered immediately after they completed the assessment.

PASS / FAIL: ___

### C2. Source-of-truth — session storage cleared

1. In an authenticated browser, navigate to `/results/{your-profileId}` and confirm it renders.
2. Open DevTools → Application → Storage → clear sessionStorage AND localStorage for the site.
3. Hard reload (Cmd+Shift+R).
4. Expect identical render. The page does NOT depend on session state.

PASS / FAIL: ___

### C3. Non-owner gets 404

1. Sign in as User-A.
2. Identify a User-B's `profileId` (you can use a second test signup, or query Supabase directly).
3. Navigate to `/results/{user-B-profileId}`.
4. Expect the project's 404 page. **NOT** a 401, **NOT** the brief content (which would leak User-B's data), **NOT** a stack trace.

PASS / FAIL: ___

### C4. Unauthenticated visit redirects to signin

1. Open an incognito window (no Supabase Auth cookie).
2. Navigate to `/results/12345678-1234-1234-1234-123456789012` (any UUID format).
3. Expect a redirect to `/auth/login?next=/results/12345678-...`.
4. Sign in as the owner of that profile id (or any user).
5. After signin, expect to land back at `/results/12345678-...`. Then either it renders (if owner) or 404s (if not owner).

PASS / FAIL: ___

### C5. Recompute on view

This is a destructive test — only run on staging.

1. On staging, edit `content/assessments/v2/scoring.ts` to shift the `building-momentum` `min` from 33 to 35.
2. Deploy staging.
3. Navigate to `/results/{a-known-profileId}` whose stored score is exactly 33.
4. Expect the brief to now render with `early-stage` tier (since 33 is now below the new boundary).
5. Revert the staging change.

PASS / FAIL: ___

### C6. Spec 3 email link resolves

1. Find an Email #1 you received during B5.
2. Click the "Open my brief" link.
3. If you're not signed in, expect signin → land back on `/results/{your-profileId}`.
4. If you are signed in, expect the brief immediately.

PASS / FAIL: ___

### C7. Mobile 375px parity

1. DevTools → iPhone SE viewport (375 × 667).
2. Navigate to `/results/{your-profileId}` while signed in.
3. Confirm identical render to A4 (the in-flow results render). No horizontal scroll, no clipping.

PASS / FAIL: ___

### C8. Browser back-button doesn't loop

1. Take the assessment fresh, complete email gate, see results.
2. Click Download PDF, complete magic-link signup, land on `/results/{profileId}`.
3. Hit browser Back.
4. Expect to land on the in-flow `/assessment` results screen — NOT a redirect loop, NOT a fresh assessment, NOT a duplicate row write.

PASS / FAIL: ___

---

## D. Cross-surface integration

### D1. Full happy-path

A new visitor takes the assessment → gates on email → opts in → sees results → downloads PDF (which triggers signup) → completes magic-link → lands on `/results/{id}` → receives Email #1 1-2 hours later → clicks the link in Email #1 → lands back on `/results/{id}` (already signed in).

Score this as a single PASS/FAIL — ALL of the above should work. Any single-step failure fails the whole AC.

PASS / FAIL: ___ Failure step (if any): ___

---

## Reporting outcomes

Track failures in GitHub Issues against the project. Tag with `regression` if a behavior changed unintentionally, `operator-setup` if the failure is config-related, `bug` for code-level defects.

For Plausible/CK/HubSpot data points captured during runs, paste the relevant screenshot or live-event text into the issue.
