# Launch checklist — The AI Banking Institute

**Created:** 2026-05-11 (overnight session)
**Target launch:** TBD by operator
**Scope:** Every atomic task that needs to ship between now and the
post-conference launch email going out. Each item is sized to take
15min–2hr. Check off as you go.

**Legend:**
- `[ ]` not started
- `[~]` in progress
- `[x]` done
- `(blocked)` waiting on something — note what
- `(deferred)` decided not to do for launch — note why

---

## §1. Infrastructure + env (1–22)

- [ ] 1. Confirm Vercel production project linked to `main` branch, auto-deploy on push
- [ ] 2. Confirm Vercel staging project linked to `staging` branch
- [ ] 3. Verify all production env vars present in Vercel Production scope (run `vercel env ls`)
- [ ] 4. Verify staging has `SKIP_CONVERTKIT=true` (or equivalent for MailerLite) so test traffic doesn't hit marketing email
- [ ] 5. Rotate `SUPABASE_SERVICE_ROLE_KEY` and mark it Sensitive in Vercel (flagged in 2026-05-06 handoff)
- [ ] 6. Rotate `STRIPE_WEBHOOK_SECRET` and mark Sensitive in Vercel
- [ ] 7. Rotate `RESEND_API_KEY` and mark Sensitive in Vercel
- [ ] 8. Rotate `MAILERLITE_API_KEY` and mark Sensitive in Vercel
- [ ] 9. Audit every `process.env.*` reference in code; ensure each name appears in Vercel
- [ ] 10. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are in Production scope
- [ ] 11. Verify DNS A/AAAA records for `aibankinginstitute.com` apex point to Vercel
- [ ] 12. Verify `www.aibankinginstitute.com` CNAME points to Vercel
- [ ] 13. Verify `.org` redirect rule sends traffic to `.com`
- [ ] 14. Confirm SSL certificate active on both apex and www
- [ ] 15. Set apex → www (or www → apex) as canonical; update `NEXT_PUBLIC_SITE_URL`
- [ ] 16. Verify Vercel preview deploys generate working URLs for every PR
- [ ] 17. Enable Vercel password protection on staging (prevents indexing)
- [ ] 18. Add staging robots.txt blocking all crawlers
- [ ] 19. Verify production robots.txt allows crawling
- [ ] 20. Add sitemap.xml routes; verify build emits it
- [ ] 21. Add `dependabot.yml` for security updates on `package.json`
- [ ] 22. Snapshot current production commit + git tag as `pre-launch-baseline`

## §2. Supabase Auth fixes (23–37)

- [ ] 23. Fix Confirm Signup template: change `next=/dashboard` to use `{{ .RedirectTo }}` per 2026-05-10 handoff
- [ ] 24. Fix Magic Link template same fix (`type=magiclink`)
- [ ] 25. Fix Reset Password template same fix (`type=recovery`)
- [ ] 26. Fix Email Change template same fix (`type=email_change`)
- [ ] 27. Verify Site URL in Supabase Auth = `https://www.aibankinginstitute.com`
- [ ] 28. Verify Additional Redirect URLs include `https://aibankinginstitute.com/*`, `https://www.aibankinginstitute.com/*`, `http://localhost:3000/*`, staging URL pattern
- [ ] 29. Verify Custom SMTP config uses verified Resend sender `hello@aibankinginstitute.com` (lowercase exact)
- [ ] 30. Smoke-test signup → confirm email → land on /dashboard
- [ ] 31. Smoke-test signup with `?next=/assessment/in-depth/take` — confirm lands on that page
- [ ] 32. Smoke-test password reset round-trip
- [ ] 33. Smoke-test magic link round-trip
- [ ] 34. Smoke-test email change confirmation round-trip
- [ ] 35. Verify rate limits on Supabase Auth match expected production volume
- [ ] 36. Add Supabase Auth webhook listener for new signups (if needed for downstream)
- [ ] 37. Document the `RedirectTo`-vs-`SiteURL` template pattern in CLAUDE.md so it doesn't regress

## §3. E2E — Auth flows (38–87)

**Tooling decision:** Pick Playwright (recommend) or Cypress before starting. Tests live in `e2e/`.

- [ ] 38. Decide test runner; set up `e2e/playwright.config.ts` (or equivalent)
- [ ] 39. Add test DB seed helper that creates a real auth.users row + course_enrollments row
- [ ] 40. Add test DB cleanup helper that deletes test users by email pattern `+e2e@`
- [ ] 41. Add CI workflow `.github/workflows/e2e.yml` running on PR
- [ ] 42. Test: visit `/auth/login` while logged out — login form renders
- [ ] 43. Test: visit `/auth/login` while logged in — redirects to `/dashboard`
- [ ] 44. Test: visit `/auth/signup` while logged out — signup form renders
- [ ] 45. Test: visit `/auth/signup` while logged in — redirects to `/dashboard`
- [ ] 46. Test: signup with valid email → confirmation email sent → click link → /dashboard
- [ ] 47. Test: signup with invalid email format — surfaces validation error
- [ ] 48. Test: signup with password under min length — error
- [ ] 49. Test: signup with duplicate email — error message (no email leak)
- [ ] 50. Test: signup respects `?next=` redirect after confirmation
- [ ] 51. Test: login with correct credentials → /dashboard
- [ ] 52. Test: login with wrong password — generic "invalid credentials" error
- [ ] 53. Test: login with unknown email — same generic error (no enumeration)
- [ ] 54. Test: login respects `?next=` redirect
- [ ] 55. Test: magic-link request flow → email sent → click → logged in
- [ ] 56. Test: magic-link with expired token shows clear error
- [ ] 57. Test: magic-link respects `?next=` redirect
- [ ] 58. Test: password reset flow → email → new password → can log in
- [ ] 59. Test: password reset link cannot be reused
- [ ] 60. Test: email change flow → confirm in new inbox → email updated
- [ ] 61. Test: logout clears session, redirects to `/`
- [ ] 62. Test: protected route `/dashboard` redirects logged-out users to `/auth/login`
- [ ] 63. Test: protected route `/courses/foundation/program` requires auth + enrollment
- [ ] 64. Test: session persists across page reload
- [ ] 65. Test: session persists across browser tab close/reopen (cookie-based)
- [ ] 66. Test: middleware refreshes session token before expiry
- [ ] 67. Test: session expires after configured TTL
- [ ] 68. Test: visiting `/auth/callback` without token shows error, not crash
- [ ] 69. Test: malformed `?token_hash=` returns clean error
- [ ] 70. Test: rapid signup attempts are rate-limited
- [ ] 71. Test: rapid login attempts are rate-limited
- [ ] 72. Test: rapid magic-link requests are rate-limited
- [ ] 73. Test: failed login does not lock account permanently after threshold
- [ ] 74. Test: `/api/auth/me` returns current user when authenticated
- [ ] 75. Test: `/api/auth/me` returns 401 when not authenticated
- [ ] 76. Test: signup creates a row in `auth.users` AND `user_profiles`
- [ ] 77. Test: signup with marketingOptIn=true subscribes to MailerLite Newsletter group
- [ ] 78. Test: signup with marketingOptIn=false does NOT subscribe
- [ ] 79. Test: deleting auth.users row cascades to dependent tables correctly
- [ ] 80. Test: RLS prevents user A from reading user B's `user_profiles` row
- [ ] 81. Test: RLS prevents user A from reading user B's `course_enrollments`
- [ ] 82. Test: RLS prevents user A from reading user B's `activity_responses`
- [ ] 83. Test: service-role client can read all rows (only used server-side)
- [ ] 84. Test: anon client cannot read service-role-only tables
- [ ] 85. Test: deep-link to `/courses/foundation/program/3` while logged out → `/auth/login?next=/courses/foundation/program/3` → after login lands on the module
- [ ] 86. Test: signup form Enter-key submission works
- [ ] 87. Test: login form Enter-key submission works

## §4. E2E — Free assessment (88–127)

- [ ] 88. Test: visit `/assessment` — first question renders
- [ ] 89. Test: assessment loads under 2s on simulated 3G
- [ ] 90. Test: select an answer on Q1 — Next button enables
- [ ] 91. Test: cannot advance without selecting an answer
- [ ] 92. Test: complete all 12 questions, score appears
- [ ] 93. Test: score band correct for `Starting Point` (lowest range)
- [ ] 94. Test: score band correct for `Early Stage`
- [ ] 95. Test: score band correct for `Building Momentum`
- [ ] 96. Test: score band correct for `Ready to Scale`
- [ ] 97. Test: score + tier visible WITHOUT email capture (per 2026-04-27 decision)
- [ ] 98. Test: dimension breakdown gated behind email gate
- [ ] 99. Test: starter artifact gated behind email gate
- [ ] 100. Test: submitting email reveals dimension breakdown
- [ ] 101. Test: submitting email reveals starter artifact download
- [ ] 102. Test: starter artifact selected matches lowest-scoring dimension
- [ ] 103. Test: refreshing mid-assessment restores answers from sessionStorage
- [ ] 104. Test: closing tab and reopening within 1h restores progress
- [ ] 105. Test: sessionStorage cleared after email capture
- [ ] 106. Test: `/api/capture-email` rejects invalid email format
- [ ] 107. Test: `/api/capture-email` rate-limits >5 requests/hour from same IP
- [ ] 108. Test: `/api/capture-email` writes row to `assessment_responses`
- [ ] 109. Test: `/api/capture-email` subscribes to correct MailerLite tier group
- [ ] 110. Test: tier sequence Day 0 email fires (verify in MailerLite activity log)
- [ ] 111. Test: tier sequence Day 3 email schedules correctly
- [ ] 112. Test: tier sequence Day 7 email schedules correctly
- [ ] 113. Test: server-side persistence writes to `readiness_dimension_columns`
- [ ] 114. Test: completing assessment fires `assessment_complete` analytics event
- [ ] 115. Test: email capture fires `email_captured` analytics event
- [ ] 116. Test: assessment works on iPhone Safari (real device or BrowserStack)
- [ ] 117. Test: assessment works on Android Chrome
- [ ] 118. Test: assessment completes in under 3 minutes on mobile
- [ ] 119. Test: each question shows one-per-view on mobile (<640px)
- [ ] 120. Test: progress indicator updates as questions answered
- [ ] 121. Test: previous-question button preserves answers
- [ ] 122. Test: keyboard-only navigation through entire assessment
- [ ] 123. Test: screen-reader announces each question + options
- [ ] 124. Test: starter artifact downloads as `.md` with expected filename
- [ ] 125. Test: copying starter artifact to clipboard works
- [ ] 126. Test: results page renders a stable owner-bound URL `/results/{id}` (per Spec 4)
- [ ] 127. Test: visiting `/results/{id}` returns the saved result without auth

## §5. E2E — In-Depth Assessment (128–167)

- [ ] 128. Test: `/assessment/in-depth` lists product details + Stripe CTA
- [ ] 129. Test: clicking Buy redirects to Stripe Checkout (test mode)
- [ ] 130. Test: completing checkout creates `course_enrollments` row with `product='in-depth-assessment'`
- [ ] 131. Test: webhook signature verification rejects forged events
- [ ] 132. Test: webhook handles `checkout.session.completed`
- [ ] 133. Test: webhook handles `payment_intent.succeeded` (alternate event)
- [ ] 134. Test: webhook is idempotent — same event ID processed twice doesn't double-insert
- [ ] 135. Test: after purchase, magic-link email arrives within 60s
- [ ] 136. Test: magic-link redirects to `/assessment/in-depth/take` (not /dashboard)
- [ ] 137. Test: `/assessment/in-depth/take` requires both auth AND in-depth entitlement
- [ ] 138. Test: 48 questions render in batches matching the spec
- [ ] 139. Test: progress saved server-side every N questions
- [ ] 140. Test: closing browser mid-assessment resumes from same question
- [ ] 141. Test: scoring uses 12–48 tier bands per CLAUDE.md
- [ ] 142. Test: tier `Starting Point` for total 12–20
- [ ] 143. Test: tier `Early Stage` for total 21–29
- [ ] 144. Test: tier `Building Momentum` for total 30–38
- [ ] 145. Test: tier `Ready to Scale` for total 39–48
- [ ] 146. Test: results page shows per-dimension scores
- [ ] 147. Test: results PDF download generates and saves
- [ ] 148. Test: PDF includes named source citations for every statistic
- [ ] 149. Test: institution leader can invite team members via `/api/indepth/invite`
- [ ] 150. Test: invite email includes magic link bound to invited address
- [ ] 151. Test: aggregate report appears when N≥ threshold (per issue #48)
- [ ] 152. Test: leader dashboard `/assessment/in-depth/dashboard` lists team submissions
- [ ] 153. Test: leader cannot see individual responses, only aggregates
- [ ] 154. Test: Champion threshold ≥39 surfaces top 2 emails for outreach
- [ ] 155. Test: assessment_score custom property writes to HubSpot (if HubSpot re-enabled) or skipped if removed
- [ ] 156. Test: AI Starter Toolkit entitlement granted on individual purchase
- [ ] 157. Test: AI Starter Toolkit gated route requires entitlement
- [ ] 158. Test: refund within 7 days revokes entitlement
- [ ] 159. Test: post-refund visit to gated route redirects to purchase
- [ ] 160. Test: 10+ seat institutional purchase grants 10+ entitlements
- [ ] 161. Test: institutional purchase email contains seat-allocation link
- [ ] 162. Test: unused seat can be reallocated by institution leader
- [ ] 163. Test: 48-question content matches `content/assessments/v2/questions.ts`
- [ ] 164. Test: assessment works on mobile (one question per screen)
- [ ] 165. Test: keyboard-only run-through of full 48 questions
- [ ] 166. Test: a11y audit on results page passes axe-core checks
- [ ] 167. Test: rate-limit on `/api/indepth/submit` prevents spam

## §6. E2E — Course purchase + enrollment (168–192)

- [ ] 168. Test: `/courses/foundation/program/purchase` renders with price ($295)
- [ ] 169. Test: institutional pricing ($199 at 10+ seats) renders correctly
- [ ] 170. Test: Stripe Checkout opens with `STRIPE_FOUNDATION_PRICE_ID`
- [ ] 171. Test: institution checkout opens with `STRIPE_FOUNDATION_INSTITUTION_PRICE_ID`
- [ ] 172. Test: checkout success URL lands at `/courses/foundation/program/purchased`
- [ ] 173. Test: checkout cancel URL returns to `/purchase`
- [ ] 174. Test: webhook inserts `course_enrollments` with `product='foundation'`
- [ ] 175. Test: webhook handles both `metadata.product='aibi-p'` (legacy) and `'foundation'` via shim
- [ ] 176. Test: webhook triggers `course-purchase-individual` Resend template
- [ ] 177. Test: webhook triggers `course-purchase-institution` template for 10+
- [ ] 178. Test: webhook subscribes purchaser to MailerLite Foundation group
- [ ] 179. Test: post-purchase magic-link email arrives within 60s
- [ ] 180. Test: enrolled user landing on `/courses/foundation/program` sees overview, not purchase page
- [ ] 181. Test: unenrolled user landing on `/courses/foundation/program/3` redirects to purchase
- [ ] 182. Test: already-enrolled user attempting second purchase sees "already enrolled" page (no double charge)
- [ ] 183. Test: `course_enrollments.user_id` binds on first login
- [ ] 184. Test: anonymous purchase (no account yet) creates row with `user_id=null` and binds on signup
- [ ] 185. Test: `dbReadValues('foundation')` returns all legacy + canonical variants
- [ ] 186. Test: `normalizeProduct('aibi-p')` returns `'foundation'`
- [ ] 187. Test: `normalizeProduct('foundations')` returns `'foundation'` (plural backfill)
- [ ] 188. Test: `normalizeProduct('foundation')` returns `'foundation'`
- [ ] 189. Test: entitlement row created on successful enrollment
- [ ] 190. Test: refund within 7 days revokes entitlement
- [ ] 191. Test: Stripe price changes don't break existing enrollments
- [ ] 192. Test: `/dashboard` shows enrolled courses

## §7. E2E — Course modules + activities (193–252)

- [ ] 193. Test: `/courses/foundation/program` overview renders for enrolled user
- [ ] 194. Test: Resume button links to `current_module`
- [ ] 195. Test: completed modules show check status; current shows accent; locked shows muted
- [ ] 196. Test: clicking locked module is a no-op (or shows tooltip)
- [ ] 197. Test: clicking unlocked module navigates to `/[module]`
- [ ] 198. Test: Module 1 page renders
- [ ] 199. Test: Module 2 page renders
- [ ] 200. Test: Module 3 page renders
- [ ] 201. Test: Module 4 page renders
- [ ] 202. Test: Module 5 page renders
- [ ] 203. Test: Module 6 page renders
- [ ] 204. Test: Module 7 page renders
- [ ] 205. Test: Module 8 page renders
- [ ] 206. Test: Module 9 page renders
- [ ] 207. Test: Module 10 page renders
- [ ] 208. Test: Module 11 page renders
- [ ] 209. Test: Module 12 page renders
- [ ] 210. Test: tab switching Learn → Practice → Apply persists in sessionStorage
- [ ] 211. Test: page refresh restores last-active tab
- [ ] 212. Test: Practice tab renders AI sandbox for modules with `SANDBOX_CONFIGS`
- [ ] 213. Test: Practice tab hidden for modules without sandbox config
- [ ] 214. Test: Apply tab renders activity form
- [ ] 215. Test: M2 Subscription Inventory activity renders specialized component
- [ ] 216. Test: M5 Classification Drill renders with scenarios from m5-drill-scenarios table
- [ ] 217. Test: M5 Acceptable Use Card builder renders
- [ ] 218. Test: M6 Skill Diagnosis renders
- [ ] 219. Test: M7 Skill Builder renders with learner role
- [ ] 220. Test: M8 Iteration Tracker renders
- [ ] 221. Test: M9 activity-less module shows direct "Mark Complete" button
- [ ] 222. Test: free-text activity submission saves to `activity_responses`
- [ ] 223. Test: form activity submission validates required fields
- [ ] 224. Test: minLength validation fires correctly
- [ ] 225. Test: submitted activity shows read-only view on refresh
- [ ] 226. Test: completing all activities in a module enables "Complete Module" CTA
- [ ] 227. Test: "Complete Module" advances `current_module`
- [ ] 228. Test: "Complete Module" adds to `completed_modules` array
- [ ] 229. Test: cannot skip ahead — completing M3 while M2 unfinished fails server-side
- [ ] 230. Test: cannot regress — re-submitting M1 after M2 complete is a no-op
- [ ] 231. Test: M12 completion triggers certificate route eligibility
- [ ] 232. Test: artifact-download activity shows download CTA after submit
- [ ] 233. Test: downloaded artifact .md has expected filename and content
- [ ] 234. Test: generate-module-artifact API returns 401 if not enrolled
- [ ] 235. Test: AI Practice Sandbox honors rate limits per module
- [ ] 236. Test: AI Practice Sandbox rejects PII via input filter
- [ ] 237. Test: AI Practice Sandbox respects user's selected model (Claude/ChatGPT/Gemini)
- [ ] 238. Test: sidebar shows progress dots that match enrollment state
- [ ] 239. Test: mobile drawer opens via hamburger button under 768px
- [ ] 240. Test: mobile drawer closes on backdrop click
- [ ] 241. Test: mobile drawer closes on Esc key
- [ ] 242. Test: mobile drawer closes on link click
- [ ] 243. Test: body scroll locked while mobile drawer open
- [ ] 244. Test: keyboard navigation through all module pages
- [ ] 245. Test: page transitions <300ms on dev server
- [ ] 246. Test: each module's Banking Boundary block renders content from `BANKING_BOUNDARIES` map
- [ ] 247. Test: Learn section "Try this" prompts render when present
- [ ] 248. Test: Markdown rendering escapes HTML correctly (no XSS)
- [ ] 249. Test: deep-link to `?tab=apply` opens Apply tab directly
- [ ] 250. Test: progress save endpoint is idempotent
- [ ] 251. Test: onboarding gate redirects new enrollees to `/onboarding` before any module
- [ ] 252. Test: `/onboarding` collects role + institution + goals

## §8. E2E — Foundation exam + certificate (253–287)

- [ ] 253. Test: `/certifications/exam/foundation` redirects logged-out users to login with next param
- [ ] 254. Test: locked notice shows for learners <12 modules complete
- [ ] 255. Test: locked notice "Resume" button links to `current_module`
- [ ] 256. Test: eligible learner sees intro phase
- [ ] 257. Test: intro lists all 5 topics
- [ ] 258. Test: "Begin Exam" advances to question phase
- [ ] 259. Test: 12 questions drawn (count check)
- [ ] 260. Test: questions distribute across 5 topics roughly evenly
- [ ] 261. Test: progress bar updates as answers are given
- [ ] 262. Test: Previous button disabled on Q1
- [ ] 263. Test: Next button disabled until answer selected
- [ ] 264. Test: Submit button on Q12 disabled until all answered
- [ ] 265. Test: changing answer on previous question updates score
- [ ] 266. Test: submit triggers results phase
- [ ] 267. Test: result shows overall percentage
- [ ] 268. Test: result shows proficiency level matching pct range
- [ ] 269. Test: Foundational tier shows for ≤40%
- [ ] 270. Test: Developing tier for 41–60%
- [ ] 271. Test: Proficient tier for 61–80%
- [ ] 272. Test: Advanced tier for 81%+
- [ ] 273. Test: topic breakdown table shows correct/total per topic
- [ ] 274. Test: recommendation text matches proficiency level
- [ ] 275. Test: Retake button returns to intro phase with fresh draw
- [ ] 276. Test: submit POSTs to `/api/certifications/exam/submit`
- [ ] 277. Test: API returns 401 if not authenticated
- [ ] 278. Test: API returns 403 if not enrolled
- [ ] 279. Test: API validates body shape, rejects malformed
- [ ] 280. Test: API returns success summary on valid submit
- [ ] 281. Test (deferred): exam_results row persists once schema lands
- [ ] 282. Test: passing exam (Proficient or above) shows certificate CTA
- [ ] 283. Test: certificate route `/courses/foundation/program/certificate` generates PDF
- [ ] 284. Test: certificate PDF includes name, date, certificate ID
- [ ] 285. Test: certificate ID is unique per issuance
- [ ] 286. Test: `/verify/[certificateId]` returns public verification page
- [ ] 287. Test: certificate-issued Resend email fires on first issuance only

## §9. E2E — Email/transactional (288–312)

- [ ] 288. Test: signup confirmation email sender = `hello@aibankinginstitute.com`
- [ ] 289. Test: signup confirmation HTML matches Ledger style
- [ ] 290. Test: magic-link email link works
- [ ] 291. Test: password-reset email link works
- [ ] 292. Test: email-change email link works
- [ ] 293. Test: assessment-results-breakdown Resend template renders
- [ ] 294. Test: course-purchase-individual Resend template renders
- [ ] 295. Test: course-purchase-institution Resend template renders
- [ ] 296. Test: certificate-issued Resend template renders
- [ ] 297. Test: inquiry-ack Resend template renders
- [ ] 298. Test: all 5 templates use canonical AiBI-Foundation naming (no Practitioner)
- [ ] 299. Test: all templates contain unsubscribe link (for marketing) or transactional notice
- [ ] 300. Test: MailerLite Newsletter automation Day 0 email fires on opt-in
- [ ] 301. Test: MailerLite Starting Point Day 0 email fires after assessment
- [ ] 302. Test: MailerLite Early Stage Day 0 email fires
- [ ] 303. Test: MailerLite Building Momentum Day 0 email fires
- [ ] 304. Test: MailerLite Ready to Scale Day 0 email fires
- [ ] 305. Test: all 13 emails have sender authenticated in MailerLite dashboard
- [ ] 306. Test: all 5 automations toggled from Draft to Active
- [ ] 307. Test: subject lines + H1 follow project style (no terminal periods on H1)
- [ ] 308. Test: no em-dash spaces, no semicolons (per every-style-editor pass)
- [ ] 309. Test: percentages render as `X%` (not `X percent`) per brand
- [ ] 310. Test: every statistic has citation `(Source, Year)` inline
- [ ] 311. Test: marketingOptIn=false skips MailerLite subscribe
- [ ] 312. Test: marketingOptIn=true creates both `Tier · X` and `AI Readiness Assessment` group memberships

## §10. E2E — Marketing pages (313–342)

- [ ] 313. Test: `/` renders without auth
- [ ] 314. Test: homepage hero, tagline, stats band, 8 sections present (per v1 PRD feedback)
- [ ] 315. Test: ROI calculator client island works
- [ ] 316. Test: ROI calculator handles boundary inputs (0 FTE, very high)
- [ ] 317. Test: `/education` renders without auth
- [ ] 318. Test: `/for-institutions` renders without auth
- [ ] 319. Test: `/certifications` shows inquiry form only (no Stripe CTAs per Phase 1 gate)
- [ ] 320. Test: certification inquiry submission writes to DB + sends ack email
- [ ] 321. Test: `/about` renders (Phase 3)
- [ ] 322. Test: `/resources` renders with newsletter signup
- [ ] 323. Test: `/security` renders with free guide download gate
- [ ] 324. Test: `/terms` renders, link in footer
- [ ] 325. Test: `/privacy` renders, link in footer
- [ ] 326. Test: 404 page renders for unknown route
- [ ] 327. Test: 500 page exists for server errors
- [ ] 328. Test: nav top bar renders on all marketing pages
- [ ] 329. Test: footer renders on all marketing pages
- [ ] 330. Test: Calendly Executive Briefing CTA opens popup correctly
- [ ] 331. Test: Calendly works on iPhone Safari
- [ ] 332. Test: every page passes Lighthouse Performance >85
- [ ] 333. Test: every page passes Lighthouse Accessibility >95
- [ ] 334. Test: every page passes Lighthouse Best Practices >95
- [ ] 335. Test: every page passes Lighthouse SEO >95
- [ ] 336. Test: meta tags (title, description) present on every page
- [ ] 337. Test: Open Graph image renders for share previews
- [ ] 338. Test: Twitter card meta present
- [ ] 339. Test: favicon + apple-touch-icon load
- [ ] 340. Test: structured data (JSON-LD Organization) validates
- [ ] 341. Test: skip-to-content link present and works
- [ ] 342. Test: nav is keyboard-navigable

## §11. Brand/copy audit (343–362)

- [ ] 343. Grep entire codebase for "Practitioner" — confirm only generic prose uses, not the retired brand
- [ ] 344. Grep for "AiBi" (wrong casing) — replace with "AiBI"
- [ ] 345. Grep for "AIBI" all-caps — replace with "AiBI" in product names, "The AI Banking Institute" in prose
- [ ] 346. Grep for "AiBI-P" in user-facing copy — replace with "AiBI-Foundation"
- [ ] 347. Grep for "A-B-C of AI Banking" — confirm fully retired from public copy
- [ ] 348. Grep for "FFIEC-aware" — confirm zero matches (banned phrase)
- [ ] 349. Grep for "AI-powered" — replace with concrete capability
- [ ] 350. Grep for banned words: "supercharge", "unlock", "revolutionize", "leverage", "synergy"
- [ ] 351. Grep for "users" in user-facing copy — replace with "you" where natural
- [ ] 352. Grep for any "58.1%" or "AI-enabled peers" stat — confirm replaced with sourced version
- [ ] 353. Confirm every statistic has named source + year in markup
- [ ] 354. Confirm "The AI Banking Institute" used in prose, "AiBI" reserved for credentials
- [ ] 355. Confirm "AiBI Foundations" (plural) NOT present — should be "AiBI-Foundation" singular
- [ ] 356. Confirm certificate display reads "Foundations Certificate · The AI Banking Institute"
- [ ] 357. Confirm specialist/leader credentials read "AiBI-S" / "AiBI-L · The AI Banking Institute"
- [ ] 358. Confirm tagline "Turning Bankers into Builders" present on homepage hero
- [ ] 359. Audit every email body for the same brand rules
- [ ] 360. Audit every Stripe product name + description
- [ ] 361. Audit Calendly event title + description
- [ ] 362. Audit MailerLite group names + automation names

## §12. Accessibility audit (363–387)

- [ ] 363. Run axe-core on `/` — zero serious/critical issues
- [ ] 364. Run axe on `/assessment`
- [ ] 365. Run axe on `/assessment/in-depth`
- [ ] 366. Run axe on `/courses/foundation/program`
- [ ] 367. Run axe on `/courses/foundation/program/1` (sample module)
- [ ] 368. Run axe on `/certifications/exam/foundation`
- [ ] 369. Run axe on `/auth/login`
- [ ] 370. Run axe on `/auth/signup`
- [ ] 371. Color contrast: all body text vs background ≥4.5:1
- [ ] 372. Color contrast: all UI text (buttons, labels) ≥4.5:1
- [ ] 373. Color contrast: gold accent text on linen passes AA
- [ ] 374. Color contrast: muted text on parch passes AA
- [ ] 375. Focus rings visible on every interactive element
- [ ] 376. Focus order matches visual order on every page
- [ ] 377. All images have meaningful alt text or `alt=""` if decorative
- [ ] 378. All form inputs have associated labels (htmlFor)
- [ ] 379. Required fields marked with both visual + aria-required
- [ ] 380. Error messages associated via aria-describedby
- [ ] 381. Dynamic content updates announce via aria-live
- [ ] 382. Modal/drawer traps focus when open
- [ ] 383. Esc closes modals/drawers
- [ ] 384. Heading hierarchy logical (no h2 inside h4)
- [ ] 385. Landmark regions present (main, nav, footer)
- [ ] 386. Reduced-motion preference respected (no autoplay animations)
- [ ] 387. Test with NVDA (Windows) and VoiceOver (Mac) on key flows

## §13. Performance (388–402)

- [ ] 388. Core Web Vitals: LCP <2.5s on /
- [ ] 389. CWV: FID/INP <200ms on / 
- [ ] 390. CWV: CLS <0.1 on /
- [ ] 391. CWV pass on /assessment
- [ ] 392. CWV pass on /courses/foundation/program/[module]
- [ ] 393. Bundle analyzer run; no unexpected large deps
- [ ] 394. Confirm `'use client'` boundaries minimized — server components by default
- [ ] 395. Images use `next/image` with proper sizes
- [ ] 396. Fonts loaded via `next/font` with display swap
- [ ] 397. No render-blocking inline JS in <head>
- [ ] 398. Critical CSS inlined for above-the-fold
- [ ] 399. JS bundle <250KB gzipped for homepage
- [ ] 400. Lighthouse mobile audit >85 on all key routes
- [ ] 401. Lighthouse desktop audit >90 on all key routes
- [ ] 402. Database query budget: no route >3 DB roundtrips

## §14. SEO (403–417)

- [ ] 403. Unique <title> per page, ≤60 chars
- [ ] 404. Unique <meta description> per page, ≤160 chars
- [ ] 405. Canonical URLs set (avoid www/apex duplication)
- [ ] 406. sitemap.xml lists every public route
- [ ] 407. robots.txt allows public, disallows /api, /dashboard, /auth/callback
- [ ] 408. Open Graph image 1200x630 with brand
- [ ] 409. Schema.org Organization JSON-LD on homepage
- [ ] 410. Schema.org Course JSON-LD on `/courses/foundation`
- [ ] 411. Submit sitemap to Google Search Console
- [ ] 412. Submit sitemap to Bing Webmaster Tools
- [ ] 413. Verify both domains in Search Console
- [ ] 414. Set preferred domain in Search Console
- [ ] 415. 301 redirects from old routes (`/services`, `/foundations`, etc.) verified
- [ ] 416. No mixed-content warnings (all assets https)
- [ ] 417. hreflang not needed (English only) — confirm

## §15. Analytics + observability (418–432)

- [ ] 418. Vercel Analytics installed + verifying data
- [ ] 419. Custom event: `assessment_start` firing
- [ ] 420. Custom event: `assessment_complete` firing with `{tier, score}`
- [ ] 421. Custom event: `email_captured` firing with `{tier}`
- [ ] 422. Custom event: `briefing_booked` firing with `{source}`
- [ ] 423. Custom event: `purchase_initiated` firing
- [ ] 424. Custom event: `purchase_completed` firing
- [ ] 425. Custom event: `module_completed` firing with `{moduleNumber}`
- [ ] 426. Custom event: `exam_completed` firing with `{pct, proficiency}`
- [ ] 427. Custom event: `certificate_issued` firing
- [ ] 428. Sentry or equivalent error tracking installed
- [ ] 429. Slack alert on production 500 spike
- [ ] 430. Stripe Radar configured for fraud detection
- [ ] 431. Supabase dashboard alerts on error rate >2%
- [ ] 432. Vercel deployment notifications to Slack/email

## §16. Security audit (433–452)

- [ ] 433. Run `npx gitleaks detect --source .` — no secrets in repo
- [ ] 434. Verify `.env*` files in `.gitignore`
- [ ] 435. Verify `.superpowers/brainstorm/` in `.gitignore` (regression from 2026-05-06)
- [ ] 436. CSP header set with appropriate directives
- [ ] 437. X-Frame-Options or frame-ancestors set
- [ ] 438. X-Content-Type-Options: nosniff
- [ ] 439. Referrer-Policy set
- [ ] 440. Strict-Transport-Security set with includeSubDomains
- [ ] 441. Audit `/api/*` for missing auth checks
- [ ] 442. Audit `/api/capture-email` rate limiting
- [ ] 443. Audit `/api/webhooks/stripe` signature verification — never process unverified
- [ ] 444. Audit input validation on every API route
- [ ] 445. Audit SQL injection vectors — confirm parameterized queries only
- [ ] 446. Audit XSS vectors — confirm dangerouslySetInnerHTML usage justified
- [ ] 447. Audit CSRF — Next.js POST routes from same-origin only
- [ ] 448. Audit Supabase RLS policies on every table
- [ ] 449. Audit service-role usage — only server-side, never exposed
- [ ] 450. Penetration test login + signup endpoints (or hire firm)
- [ ] 451. Document responsible disclosure policy
- [ ] 452. Set up security.txt at /.well-known/security.txt

## §17. LMS reskin cleanup (453–467)

- [ ] 453. Land PR #51 (Practitioner rename) after eyeball
- [ ] 454. Land PR #52 (overview reskin) after eyeball
- [ ] 455. Land PR #53 (module detail reskin) after eyeball
- [ ] 456. Land PR #54 (activity workspace reskin) after eyeball
- [ ] 457. Land PR #55 (exam page) after eyeball
- [ ] 458. Land PR #56 (mobile drawer) after eyeball
- [ ] 459. PR 4: reskin Toolbox + saved artifacts (`/toolkit`, `/prompt-library`, `/artifacts/[artifactId]`, `/gallery`)
- [ ] 460. PR 5: reskin completion + certificate page
- [ ] 461. PR 6: reskin auxiliary surfaces (`/onboarding`, `/settings`, `/quick-wins`, `/tool-guides`, `/purchase`, `/purchased`, `/submit`, `/post-assessment`)
- [ ] 462. PR 7: remove legacy `_components/` in foundation/program/
- [ ] 463. PR 7: remove legacy CourseSidebar from `program/layout.tsx`
- [ ] 464. PR 7: remove legacy MobileSidebarDrawer
- [ ] 465. PR 7: decide whether to keep `/lms-preview` as design ref or delete
- [ ] 466. Delete legacy Terra `tokens.css` once nothing references it
- [ ] 467. Rename `tokens-ledger.css` to `tokens.css` (final consolidation)

## §18. Bug fixes (468–477)

- [ ] 468. Fix `/api/assessment/pdf/warm` libnss3.so missing on Vercel serverless
- [ ] 469. Investigate +alias test rows in auth.users; clean up if any remain
- [ ] 470. Decide if COMING_SOON env var dead code; remove if so
- [ ] 471. Audit duplicate `00011_` migration files; rename to break collision
- [ ] 472. Cherry-pick PR #44 migrations (00028, 00029, 00030) into git from backup tag
- [ ] 473. Verify no test data in production auth.users
- [ ] 474. Verify no test data in production course_enrollments
- [ ] 475. Verify production Stripe products renamed to canonical AiBI-Foundation
- [ ] 476. Deactivate "myproduct" Stripe test stray (confirmed done; double-check)
- [ ] 477. Fix any pre-existing TypeScript errors surfaced by strict mode

## §19. Mobile + cross-browser testing (478–502)

- [ ] 478. Test on iPhone 14/15 Safari (real device)
- [ ] 479. Test on iPhone SE (smallest screen, real device or BrowserStack)
- [ ] 480. Test on Android Chrome (Pixel or Samsung)
- [ ] 481. Test on iPad Safari
- [ ] 482. Test on macOS Safari latest
- [ ] 483. Test on macOS Chrome latest
- [ ] 484. Test on macOS Firefox latest
- [ ] 485. Test on Windows Edge latest
- [ ] 486. Test on Windows Chrome latest
- [ ] 487. Test on Windows Firefox latest
- [ ] 488. Test home page on all above
- [ ] 489. Test assessment on all above
- [ ] 490. Test course overview on all above
- [ ] 491. Test single module on all above
- [ ] 492. Test login on all above
- [ ] 493. Test signup on all above
- [ ] 494. Test mobile drawer at 360px width
- [ ] 495. Test mobile drawer at 768px boundary (should switch to sidebar)
- [ ] 496. Test orientation change on iOS does not break layouts
- [ ] 497. Test pinch-zoom works (not disabled by viewport meta)
- [ ] 498. Test reduced motion preference on macOS
- [ ] 499. Test high-contrast mode on Windows
- [ ] 500. Test 200% browser zoom on all key flows
- [ ] 501. Test 400% browser zoom passes WCAG reflow
- [ ] 502. Document any browser-specific known issues in CLAUDE.md

## §20. Final pre-launch (503–520)

- [ ] 503. Run full E2E suite against staging — all green
- [ ] 504. Run full E2E suite against production — all green
- [ ] 505. Manual smoke test: assessment on iPhone in under 3 minutes
- [ ] 506. Manual smoke test: purchase Foundation course end-to-end with real $295 charge, then refund
- [ ] 507. Manual smoke test: purchase In-Depth assessment end-to-end with real $99 charge, then refund
- [ ] 508. Verify the string "FFIEC-aware" returns zero matches in deployed HTML
- [ ] 509. Verify the string "Practitioner" only appears in expected places in deployed HTML
- [ ] 510. Verify all statistics on deployed site have visible citations
- [ ] 511. Verify Calendly link works on iPhone Safari (real device)
- [ ] 512. Verify Stripe Checkout works on iPhone Safari (real device)
- [ ] 513. Verify magic-link round-trip on iPhone (real device)
- [ ] 514. Stress test: 100 concurrent assessment submissions — no errors, no rate-limit kicks for legit users
- [ ] 515. Stress test: 50 concurrent webhook events — all processed idempotently
- [ ] 516. Verify backup/restore procedure for Supabase
- [ ] 517. Document on-call rotation + escalation path
- [ ] 518. Draft launch email to post-conference list
- [ ] 519. Schedule launch email send
- [ ] 520. Pop the champagne

---

**Total: 520 items.** Numbering left intentionally sparse so insertions
don't break existing IDs. If a section runs over, add `.5` items
(e.g., `42.5`) rather than renumbering.
