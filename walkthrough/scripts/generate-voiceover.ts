/**
 * Generate narration for the assessment ad and write a manifest the video reads.
 *   ELEVENLABS_API_KEY=...  npm run voiceover     (or OPENAI_API_KEY)
 *
 * Produces one clip per beat (public/narration/assessment/<id>.mp3), measures
 * each, and writes src/assessment.narration.json. The ad then stretches each
 * footage segment to its spoken line. Run where the network reaches the TTS host.
 */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { NARRATION } from "../src/narration-script";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const audioDir = join(root, "public", "narration", "assessment");
const manifestPath = join(root, "src", "assessment.narration.json");
const TAIL_PAD = 0.45; // seconds of breathing room after each line

// MP3 duration straight from the bytes (ElevenLabs returns CBR MPEG-1 L3 128k).
const BR = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
function mp3Seconds(buf: Buffer): number {
  let i = 0;
  if (buf.length > 10 && buf.toString("latin1", 0, 3) === "ID3") {
    i = 10 + (((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f));
  }
  while (i < buf.length - 4 && !(buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0)) i++;
  const kbps = BR[(buf[i + 2] >> 4) & 0x0f] || 128;
  return ((buf.length - i) * 8) / (kbps * 1000);
}

async function proxy() {
  const p = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (!p) return;
  const { ProxyAgent, setGlobalDispatcher } = await import("undici");
  setGlobalDispatcher(new ProxyAgent(p));
}

async function eleven(text: string): Promise<Buffer> {
  const voice = process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb";
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY as string, "content-type": "application/json" },
    body: JSON.stringify({ text, model_id: process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2", voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}
async function openai(text: string): Promise<Buffer> {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts", voice: process.env.OPENAI_TTS_VOICE || "onyx", input: text, response_format: "mp3" }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const provider = process.env.ELEVENLABS_API_KEY ? "elevenlabs" : process.env.OPENAI_API_KEY ? "openai" : null;
  if (!provider) { console.error("Set ELEVENLABS_API_KEY or OPENAI_API_KEY first."); process.exit(1); }
  console.log(`· provider: ${provider}`);
  await proxy();
  await mkdir(audioDir, { recursive: true });
  const speak = provider === "elevenlabs" ? eleven : openai;

  const sections: Record<string, { seconds: number; audio: string }> = {};
  for (const part of NARRATION) {
    process.stdout.write(`  ${part.id} … `);
    const mp3 = await speak(part.text);
    await writeFile(join(audioDir, `${part.id}.mp3`), mp3);
    const seconds = Number((mp3Seconds(mp3) + TAIL_PAD).toFixed(2));
    sections[part.id] = { seconds, audio: `narration/assessment/${part.id}.mp3` };
    console.log(`${seconds}s`);
  }
  await writeFile(manifestPath, JSON.stringify({ enabled: true, provider, voiceId: process.env.ELEVENLABS_VOICE_ID || process.env.OPENAI_TTS_VOICE || "default", sections }, null, 2) + "\n");
  console.log("\n✓ narration written. Now: npm run render-ad");
}
main().catch((e) => { console.error("\n✗", e.message); process.exit(1); });
