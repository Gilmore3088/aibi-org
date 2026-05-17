# Archive

Files kept for historical reference. Not imported at runtime, not edited in place.

## email-content.ts.archived

Original canonical TypeScript module that held the 13 MailerLite email
drafts (1 newsletter welcome + 4 tier sequences x 3 emails). Archived
2026-05-09 because:

1. The MailerLite API cannot actually populate designed email bodies on
   automation steps — `email_content` is silently dropped. Operators must
   paste HTML into the dashboard editor manually. The TS file's purpose
   (programmatic regeneration) was never reachable.
2. The standalone HTMLs in `docs/mailerlite-emails/` are the live source
   of truth. They are paste-ready, browser-previewable, and served by the
   local index.html with one-click copy buttons.
3. Maintaining two parallel copies of the same email content drifts. The
   TS file fell 11 emails behind during the v3 voice rewrite.

If you ever need the older syllabus-style drafts (e.g. for tone
comparison or to recover a sentence), they live in this archive.
