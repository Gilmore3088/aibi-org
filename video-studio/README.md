# aibi Video Studio

A **standalone** Remotion project for making aibi videos with code — no manual
editing, no timeline cutting. It is independent of the Next.js app (its own
`package.json`); nothing here is imported by or deployed with the website.

The first composition, **AssessmentResults**, turns AI-readiness assessment
scores into a 30-second animated explainer.

---

## The mental model (read this first)

A video is just **frames** (this project runs at 30 frames per second). Remotion
renders frame 0, 1, 2, … as React, then stitches them into an MP4.

Every animated thing asks one question — *"what frame am I on?"* — and computes
its own state from that:

```tsx
const frame = useCurrentFrame();              // e.g. 42
const opacity = interpolate(frame, [0, 30], [0, 1]); // fade in over 1 second
```

That's the whole paradigm. No keyframing by hand. Because it's a pure function
of the frame, the preview scrubs instantly and every render is identical.

---

## Quick start

```bash
cd video-studio
npm install

# 1) Live preview in the browser — scrub, edit, hot-reload
npm run studio

# 2) Render the default video to out/assessment-results.mp4
npm run render

# 3) Render with DIFFERENT data (same code, new video) — the superpower
npm run render-props        # uses props.json (a high-scoring "Advanced" bank)
```

---

## The "one template → many videos" idea

`src/data.ts` defines the shape of the data and a default `sampleResult`. Feed a
different `AssessmentResult` in and you get a different personalized video from
the same code. Two ways to do it:

- **Studio:** edit the props in the right-hand panel and watch it update live.
- **CLI:** pass a JSON file: `remotion render src/index.ts AssessmentResults out/x.mp4 --props=./my.json`

This is the seam that lets aibi eventually auto-generate a results video per
user: your app produces the scores JSON → this renders the MP4.

---

## File guide

| File | What it does |
|------|--------------|
| `src/index.ts` | Entry point — registers the root. |
| `src/Root.tsx` | Declares the `AssessmentResults` composition (size, fps, duration, default data). |
| `src/AssessmentResults.tsx` | Lays the 5 scenes on the timeline with `<Sequence>`. Scene durations live here. |
| `src/scenes.tsx` | The 5 scenes (intro, overall ring, dimension bars, highlights, outro). **Read this to learn the animation moves.** |
| `src/ui.tsx` | Shared pieces: navy `Background`, `Wordmark`, `CountUp`. |
| `src/brand.ts` | aibi colors + fonts (mirrored from the app's tokens). |
| `src/data.ts` | The data model, the real 8 dimensions / 5 maturity bands, and the sample. |
| `props.json` | Example alternate data for `npm run render-props`. |

---

## Make your first change

Open `src/scenes.tsx`, find `IntroScene`, and change the title text or
`fontSize`. With `npm run studio` running, it updates instantly. Then change a
score in `src/data.ts` and watch the bars and ring re-animate.

## Where this can go next

- More compositions in `src/Root.tsx`: course-module intros, a landing-page
  stat reel, branded social cuts.
- Add narration: drop an MP3 in `public/` and use Remotion's `<Audio>`.
- Add AI-generated content later (script/voiceover/footage) — that's what
  OpenMontage layers on top of exactly this kind of Remotion project.
