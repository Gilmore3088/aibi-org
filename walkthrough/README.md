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

## Notes / next steps

- **Fonts:** the live app loads Inter + Newsreader from Google Fonts, which are
  blocked in the capture sandbox, so serif headings fall back. Capturing on a
  machine with network access renders them correctly.
- **Gated pages** (Foundation course, Toolbox, In-Depth): captured with
  `HEADED=1` while logged in.
- **Voiceover:** the captions are the script. Generate narration with ElevenLabs
  (same approach as before) and drop per-section audio into each `<Sequence>`.
