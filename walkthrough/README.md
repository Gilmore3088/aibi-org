# aibi Walkthrough — "the site as the film"

A standalone Remotion project that turns the **real** aibi site into a narrated
walkthrough video. It scrolls actual page screenshots (not recreations) in a
browser frame, with narration captions and `[Ai]` bookends.

## How it works

1. **Capture the real pages** (screenshots of the live app):
   ```bash
   # terminal 1, repo root:
   npm run dev
   # terminal 2, here:
   cd walkthrough && npm install
   node scripts/capture-site.mjs            # public marketing pages
   HEADED=1 node scripts/capture-site.mjs   # add auth-gated pages (log in when it opens)
   ```
   Pages land in `public/site/` (gitignored — regenerate any time).

2. **Render the film:**
   ```bash
   npm run studio     # live preview
   npm run render     # → out/site-walkthrough.mp4
   ```

## Editing

- `src/Walkthrough.tsx` → `SECTIONS`: the page, its URL, the **narration line**
  (caption), and seconds. If a page's height changes, update its `cssHeight`
  (the capture script prints each page's height).
- Order, timing, and which pages appear are all just edits to that array.

## The assessment ad (with narration)

`AssessmentAd` is an ad cut from a real recording of taking the free assessment
(3 questions → fill name/email → the real report). To add the voice:

```bash
cd walkthrough && npm install
export ELEVENLABS_API_KEY=sk_...     # or OPENAI_API_KEY
npm run voiceover                    # generates per-beat narration + manifest
npm run render-ad                    # → out/assessment-ad.mp4 (voiced)
```

- The script lives in `src/narration-script.ts` (one line per beat) — edit the
  words there and re-run `voiceover`.
- Voice **drives the timing**: each footage beat stretches to its spoken line.
  Pick a voice with `ELEVENLABS_VOICE_ID=...`.
- Re-record the experience any time with `npm run record` (app running on :3000);
  it refreshes `public/footage/assessment.mp4` + `assessment.cuts.json`.

## Notes / next steps

- **Fonts:** the live app loads Inter + Newsreader from Google Fonts, which are
  blocked in the capture sandbox, so serif headings fall back. Capturing on a
  machine with network access renders them correctly.
- **Gated pages** (Foundation course, Toolbox, In-Depth): captured with
  `HEADED=1` while logged in.
- **Voiceover:** the captions are the script. Generate narration with ElevenLabs
  (same approach as before) and drop per-section audio into each `<Sequence>`.
