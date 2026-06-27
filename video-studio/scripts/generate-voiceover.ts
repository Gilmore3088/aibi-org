/**
 * Generate per-section narration audio for a script, then write a manifest the
 * video reads. Run: `npm run voiceover` (needs ELEVENLABS_API_KEY or OPENAI_API_KEY).
 *
 * Why per-section: each clip is dropped inside its own scene's time window, so
 * the spoken audio and the on-screen visuals always line up — and the scene
 * length becomes the *measured* length of the narration, not a guess.
 *
 * Provider: uses ElevenLabs if ELEVENLABS_API_KEY is set, else OpenAI.
 */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { safeAiUseScript } from "../src/scripts/safe-ai-use";
import { whatsAiReadyScript } from "../src/scripts/whats-ai-ready";
import { blankCursorScript } from "../src/scripts/blank-cursor";
import { bankersIntoBuildersScript } from "../src/scripts/bankers-into-builders";
import type { VideoScript } from "../src/scripted/types";

// ── which script + where its files go ──────────────────────────────────────
// Pick with `SCRIPT=safe-ai-use npm run voiceover`; defaults to the current one.
const REGISTRY: Record<string, VideoScript> = {
  "bankers-into-builders": bankersIntoBuildersScript,
  "blank-cursor": blankCursorScript,
  "whats-ai-ready": whatsAiReadyScript,
  "safe-ai-use": safeAiUseScript,
};
const SCRIPT_ID = process.env.SCRIPT || "blank-cursor";
const script: VideoScript = REGISTRY[SCRIPT_ID];
if (!script) {
  console.error(`Unknown SCRIPT "${SCRIPT_ID}". Options: ${Object.keys(REGISTRY).join(", ")}`);
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const audioDir = join(root, "public", "narration", SCRIPT_ID);
const manifestPath = join(root, "src", "scripts", `${SCRIPT_ID}.narration.json`);
const TAIL_PAD_SECONDS = 0.6; // breathing room after each line

// Measure an MP3's length straight from the bytes — no dependency. Reads the
// first MPEG audio frame header for bitrate/sample-rate (ElevenLabs returns CBR
// MPEG-1 Layer III at 128 kbps, so this is exact; for other CBR streams it
// reads the real bitrate; VBR is approximate, which the tail-pad absorbs).
const BITRATES_V1L3 = [
  0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0,
];
function mp3DurationSeconds(buf: Buffer): number {
  let i = 0;
  // skip an ID3v2 tag if present (syncsafe size)
  if (buf.length > 10 && buf.toString("latin1", 0, 3) === "ID3") {
    const size =
      ((buf[6] & 0x7f) << 21) |
      ((buf[7] & 0x7f) << 14) |
      ((buf[8] & 0x7f) << 7) |
      (buf[9] & 0x7f);
    i = 10 + size;
  }
  // find the first frame sync (11 set bits)
  while (i < buf.length - 4) {
    if (buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0) break;
    i++;
  }
  const bitrate = BITRATES_V1L3[(buf[i + 2] >> 4) & 0x0f] || 128; // kbps
  const audioBytes = buf.length - i;
  return audioBytes * 8 / (bitrate * 1000);
}

// ── route through the agent proxy if present (Node fetch needs this) ────────
async function configureProxy() {
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (!proxy) return;
  const { ProxyAgent, setGlobalDispatcher } = await import("undici");
  setGlobalDispatcher(new ProxyAgent(proxy));
  console.log(`· routing TTS through proxy ${proxy}`);
}

// ── providers ───────────────────────────────────────────────────────────────
async function ttsElevenLabs(text: string): Promise<Buffer> {
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb"; // calm narrator
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY as string,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2",
        voice_settings: { stability: 0.45, similarity_boost: 0.75 },
      }),
    },
  );
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

async function ttsOpenAI(text: string): Promise<Buffer> {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
      voice: process.env.OPENAI_TTS_VOICE || "onyx",
      input: text,
      response_format: "mp3",
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

// ── main ────────────────────────────────────────────────────────────────────
async function main() {
  const provider = process.env.ELEVENLABS_API_KEY
    ? "elevenlabs"
    : process.env.OPENAI_API_KEY
      ? "openai"
      : null;
  if (!provider) {
    console.error(
      "No TTS key found. Set ELEVENLABS_API_KEY or OPENAI_API_KEY and re-run `npm run voiceover`.",
    );
    process.exit(1);
  }
  console.log(`· provider: ${provider}`);
  await configureProxy();
  await mkdir(audioDir, { recursive: true });

  const speak = provider === "elevenlabs" ? ttsElevenLabs : ttsOpenAI;
  const sections: Record<string, { seconds: number; audio: string }> = {};

  for (const s of script.sections) {
    process.stdout.write(`  ${s.id} … `);
    const mp3 = await speak(s.narration);
    const file = join(audioDir, `${s.id}.mp3`);
    await writeFile(file, mp3);
    const seconds = Number((mp3DurationSeconds(mp3) + TAIL_PAD_SECONDS).toFixed(2));
    sections[s.id] = { seconds, audio: `narration/${SCRIPT_ID}/${s.id}.mp3` };
    console.log(`${seconds}s`);
  }

  const manifest = {
    enabled: true,
    provider,
    voiceId: process.env.ELEVENLABS_VOICE_ID || process.env.OPENAI_TTS_VOICE || "default",
    sections,
  };
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\n✓ wrote ${Object.keys(sections).length} clips + manifest.`);
  console.log("Now run:  npm run render-explainer");
}

main().catch((e) => {
  console.error("\n✗ voiceover failed:", e.message);
  process.exit(1);
});
