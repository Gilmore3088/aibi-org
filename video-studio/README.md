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

## The three videos

| Composition id | What it is |
|---|---|
| `AssessmentResults` | Data-driven: assessment scores → animated ring + dimension bars. |
| `ScriptedExplainer` | Caption-style script engine (kept as a reference). |
| `AiReadyExplainer` | **Voice-first, visual-first explainer** — the current approach. The narrator explains; the screen shows (bubbles, pillars, an 8-node constellation, a score gauge). Minimal on-screen text. |

Render any of them: `npx remotion render src/index.ts <id> out/<name>.mp4`.

## Add voiceover (the script builder → spoken video)

The `AiReadyExplainer` script (`src/scripts/whats-ai-ready.ts`) has a
`narration` line per section. Generating audio is one command — **but it needs
network access to the TTS provider**, which the Claude Code *web* environment
blocks by policy. Run it where your network is open (your laptop, or a web
environment whose network policy allows `api.elevenlabs.io`):

```bash
export ELEVENLABS_API_KEY=sk_...          # recommended (or OPENAI_API_KEY)
bash scripts/make-voiced-video.sh         # generate narration + render → out/whats-ai-ready.mp4
```

What happens: `generate-voiceover.ts` calls ElevenLabs (or OpenAI) once per
section, writes the clips to `public/narration/`, measures each one, and writes
a manifest. The video then **re-times every scene to its measured narration
length**, so picture and voice stay locked. Until you run it, the video renders
silent. Pick a voice with `ELEVENLABS_VOICE_ID=...`.

## Where this can go next

- More compositions in `src/Root.tsx`: course-module intros, a landing-page
  stat reel, branded social cuts.
- Point the explainer at a new topic: copy `src/scripts/whats-ai-ready.ts`,
  rewrite the narration + visuals, register it in `src/Root.tsx`.
- Add AI-generated content later (image/footage) — that's what OpenMontage
  layers on top of exactly this kind of Remotion project.
