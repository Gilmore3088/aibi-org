/**
 * Generate the human-beat footage for "The Blank Cursor" via fal.ai's video
 * queue (Veo / Kling), then download into public/footage/blank-cursor/.
 * Run: `npm run shots`  (needs FAL_KEY; runs where the network allows fal.run)
 *
 * After it finishes, set `footage` on the matching sections in
 * src/scripts/blank-cursor.ts and re-render. See docs/blank-cursor-shots.md.
 *
 * NOTE: untested in this sandbox (fal.run is egress-blocked here). The shape
 * follows fal's documented queue API; if a model slug changed, set FAL_VIDEO_MODEL.
 */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MODEL = process.env.FAL_VIDEO_MODEL || "fal-ai/veo3/fast";
const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "public", "footage", "blank-cursor");

const STYLE =
  "Cinematic, photoreal, shot on Arri, 35mm, shallow depth of field, pre-dawn " +
  "warm cream key light with deep navy shadows, quiet and intimate, subtle " +
  "handheld, community bank interior, no text, no logos, no captions.";

const SHOTS: { id: string; prompt: string }[] = [
  {
    id: "saying",
    prompt:
      "A woman loan officer in her 40s sits alone at a wooden desk in a small " +
      "community bank before opening, soft cream light from a window, sticky " +
      "notes and a coffee mug beside a laptop, she looks at a blank document, " +
      "thoughtful, uncertain. Slow push in.",
  },
  {
    id: "lines",
    prompt:
      "Extreme close-up of a laptop screen showing a blank document with a " +
      "single blinking text cursor, then a rack-focus to her reflective eyes. " +
      "Tense, still, quiet.",
  },
  {
    id: "chair",
    prompt:
      "A loan officer, calm and in control, reading a document on her laptop, " +
      "making a small edit, then signing a printed page with a pen. Warm, " +
      "confident, steady. Close on the hand signing.",
  },
];

async function configureProxy() {
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (!proxy) return;
  const { ProxyAgent, setGlobalDispatcher } = await import("undici");
  setGlobalDispatcher(new ProxyAgent(proxy));
}

const auth = () => ({ Authorization: `Key ${process.env.FAL_KEY}` });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function generate(prompt: string): Promise<string> {
  // 1) submit to the queue
  const submit = await fetch(`https://queue.fal.run/${MODEL}`, {
    method: "POST",
    headers: { ...auth(), "content-type": "application/json" },
    body: JSON.stringify({ prompt: `${STYLE} ${prompt}`, aspect_ratio: "16:9" }),
  });
  if (!submit.ok) throw new Error(`submit ${submit.status}: ${await submit.text()}`);
  const { status_url, response_url } = await submit.json();

  // 2) poll until done
  for (let i = 0; i < 120; i++) {
    await sleep(5000);
    const s = await fetch(status_url, { headers: auth() });
    const j = await s.json();
    if (j.status === "COMPLETED") break;
    if (j.status === "FAILED") throw new Error(`generation failed: ${JSON.stringify(j)}`);
    process.stdout.write(".");
  }

  // 3) fetch the result + the video url
  const res = await fetch(response_url, { headers: auth() });
  const data = await res.json();
  const url = data?.video?.url || data?.video_url || data?.url;
  if (!url) throw new Error(`no video url in result: ${JSON.stringify(data).slice(0, 300)}`);
  return url;
}

async function main() {
  if (!process.env.FAL_KEY) {
    console.error("Set FAL_KEY first (fal.ai/dashboard/keys).");
    process.exit(1);
  }
  console.log(`· model: ${MODEL}`);
  await configureProxy();
  await mkdir(outDir, { recursive: true });

  for (const shot of SHOTS) {
    process.stdout.write(`  ${shot.id} … `);
    const url = await generate(shot.prompt);
    const bytes = Buffer.from(await (await fetch(url)).arrayBuffer());
    await writeFile(join(outDir, `${shot.id}.mp4`), bytes);
    console.log(` ✓ ${(bytes.length / 1e6).toFixed(1)}MB`);
  }
  console.log("\n✓ clips in public/footage/blank-cursor/. Set `footage` in");
  console.log("  src/scripts/blank-cursor.ts, then: npm run render-ad");
}

main().catch((e) => {
  console.error("\n✗ shots failed:", e.message);
  process.exit(1);
});
