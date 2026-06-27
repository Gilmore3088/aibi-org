# "The Blank Cursor" — AI-generated footage plan

The ad is a **hybrid**: the human/environment beats are real video; the
screen/artifact beats stay as motion graphics (that's correct — they're screen
content). This doc has the exact prompts to generate the human beats and how to
drop them in so they composite automatically.

## Which beats need footage

| Beat id | Time | Needs footage? | What it is |
|---|---|---|---|
| `saying` | 0–4s | **Yes** | Pre-dawn community bank, loan officer at a desk |
| `lines` | 4–8s | **Yes** | Tight close on the blinking cursor / her eyes |
| `twelve` | 8–14s | No (graphics) | The assessment + score ring |
| `hold` | 14–22s | No (graphics) | The three artifacts |
| `chair` | 22–27s | **Yes** | Drafting a credit memo, reads, edits, signs |
| `brand` | 27–30s | No (graphics) | The `[Ai]` mark |

Optionally generate a clip for `twelve`/`hold` too (a hand opening a laptop) and
let the graphics overlay it — but they stand on their own.

## The shot prompts (16:9, no on-screen text, no captions)

Style preamble to prepend to each: *"Cinematic, photoreal, shot on Arri, 35mm,
shallow depth of field, pre-dawn warm cream key light with deep navy shadows,
quiet and intimate, subtle handheld, community bank interior, no text, no logos,
no captions."*

- **saying (4s)** — "A woman loan officer in her 40s sits alone at a wooden desk
  in a small community bank before opening, soft cream light from a window,
  sticky notes and a coffee mug beside a laptop, she looks at a blank document,
  thoughtful, uncertain. Slow push in."
- **lines (4s)** — "Extreme close-up of a laptop screen showing a blank document
  with a single blinking text cursor, then a rack-focus to her reflective eyes.
  Tense, still, quiet."
- **chair (5s)** — "Same loan officer, now calm and in control, reading a
  document on her laptop, making a small edit, then signing a printed page with a
  pen. Warm, confident, steady. Close on the hand signing."

## Generate the clips — two ways

### Option A — OpenMontage (recommended; it's built for this)
Point OpenMontage at these three prompts (cinematic pipeline, Veo/Kling via
fal). It researches, generates, and can hand back finished clips. Save them as
`public/footage/blank-cursor/<beat-id>.mp4`.

### Option B — direct, turnkey (this repo)
```bash
export FAL_KEY=...                     # from fal.ai/dashboard/keys
# optional: export FAL_VIDEO_MODEL=fal-ai/veo3/fast   (default)
npm run shots                          # generates the 3 clips into public/footage/blank-cursor/
```
`scripts/generate-shots.ts` submits each prompt to fal's video queue, polls, and
downloads the result. Runs where the network allows `fal.run` (your machine).

## Drop them in

Once the clips exist, set `footage` on the matching sections in
`src/scripts/blank-cursor.ts`:

```ts
{ id: "saying", /* … */ footage: "footage/blank-cursor/saying.mp4" },
{ id: "lines",  /* … */ footage: "footage/blank-cursor/lines.mp4" },
{ id: "chair",  /* … */ footage: "footage/blank-cursor/chair.mp4" },
```

Then re-render — the cinematic grade, letterbox, grain, and supers stay on top,
and each beat re-times to its narration when voiced:
```bash
bash scripts/make-voiced-video.sh        # voice + render, or:
npm run render-ad                        # render only
```

That's the full hybrid: generated footage for the humans, motion graphics for
the screens, one graded film on top.
