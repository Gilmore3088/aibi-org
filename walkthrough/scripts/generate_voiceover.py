#!/usr/bin/env python3
"""
Generate the assessment-ad narration with ElevenLabs (or OpenAI), and write the
manifest the Remotion video reads. Pure standard library — no pip installs.

USAGE (run from the `walkthrough/` folder):
    export ELEVENLABS_API_KEY=sk_...            # or: export OPENAI_API_KEY=sk-...
    # optional voice override:
    # export ELEVENLABS_VOICE_ID=JBFqnCBsd6RMkjVDRZzb
    python3 scripts/generate_voiceover.py

Then render the voiced ad:
    npm run render-ad        # -> out/assessment-ad.mp4
"""
import json
import os
import sys
import urllib.request
import urllib.error

# ----- the script: one line per beat (edit the words here) -------------------
NARRATION = [
    ("open",      "Most banks know AI matters. Almost none know where they actually stand."),
    ("questions", "So we made it simple. Twelve plain-language questions — about three minutes, no jargon."),
    ("form",      "Add your name and where you bank, and the result is yours."),
    ("report",    "And you get a real report: a score, your biggest gap, and a concrete first move you can make on Monday."),
    ("close",     "The AI Banking Institute. Find your starting point — free."),
]

TAIL_PAD = 0.45  # seconds of breathing room added after each line

# ----- paths (relative to where you run it, i.e. the walkthrough/ folder) -----
ROOT = os.getcwd()
AUDIO_DIR = os.path.join(ROOT, "public", "narration", "assessment")
MANIFEST = os.path.join(ROOT, "src", "assessment.narration.json")

# ----- MP3 duration straight from the bytes (ElevenLabs returns CBR 128k) -----
_BITRATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]


def mp3_seconds(buf: bytes) -> float:
    i = 0
    if len(buf) > 10 and buf[0:3] == b"ID3":
        i = 10 + (((buf[6] & 0x7F) << 21) | ((buf[7] & 0x7F) << 14) |
                  ((buf[8] & 0x7F) << 7) | (buf[9] & 0x7F))
    while i < len(buf) - 4 and not (buf[i] == 0xFF and (buf[i + 1] & 0xE0) == 0xE0):
        i += 1
    kbps = _BITRATES[(buf[i + 2] >> 4) & 0x0F] or 128
    return (len(buf) - i) * 8 / (kbps * 1000)


def _post(url: str, headers: dict, body: dict) -> bytes:
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"),
                                 headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        raise SystemExit(f"\n✗ {url.split('/')[2]} {e.code}: {e.read().decode('utf-8', 'replace')[:300]}")


def tts_elevenlabs(text: str) -> bytes:
    voice = os.environ.get("ELEVENLABS_VOICE_ID", "JBFqnCBsd6RMkjVDRZzb")
    model = os.environ.get("ELEVENLABS_MODEL", "eleven_multilingual_v2")
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128"
    headers = {"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "content-type": "application/json"}
    body = {"text": text, "model_id": model,
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}}
    return _post(url, headers, body)


def tts_openai(text: str) -> bytes:
    url = "https://api.openai.com/v1/audio/speech"
    headers = {"authorization": f"Bearer {os.environ['OPENAI_API_KEY']}", "content-type": "application/json"}
    body = {"model": os.environ.get("OPENAI_TTS_MODEL", "gpt-4o-mini-tts"),
            "voice": os.environ.get("OPENAI_TTS_VOICE", "onyx"),
            "input": text, "response_format": "mp3"}
    return _post(url, headers, body)


def main() -> None:
    if os.environ.get("ELEVENLABS_API_KEY"):
        provider, speak = "elevenlabs", tts_elevenlabs
    elif os.environ.get("OPENAI_API_KEY"):
        provider, speak = "openai", tts_openai
    else:
        raise SystemExit("Set ELEVENLABS_API_KEY (or OPENAI_API_KEY) first.")

    if not os.path.isdir(os.path.join(ROOT, "src")) or not os.path.isdir(os.path.join(ROOT, "public")):
        raise SystemExit("Run this from the walkthrough/ folder (it needs ./src and ./public).")

    print(f"· provider: {provider}")
    os.makedirs(AUDIO_DIR, exist_ok=True)

    sections = {}
    for beat_id, text in NARRATION:
        sys.stdout.write(f"  {beat_id} … "); sys.stdout.flush()
        audio = speak(text)
        with open(os.path.join(AUDIO_DIR, f"{beat_id}.mp3"), "wb") as fh:
            fh.write(audio)
        seconds = round(mp3_seconds(audio) + TAIL_PAD, 2)
        sections[beat_id] = {"seconds": seconds, "audio": f"narration/assessment/{beat_id}.mp3"}
        print(f"{seconds}s")

    manifest = {
        "enabled": True,
        "provider": provider,
        "voiceId": os.environ.get("ELEVENLABS_VOICE_ID", os.environ.get("OPENAI_TTS_VOICE", "default")),
        "sections": sections,
    }
    with open(MANIFEST, "w") as fh:
        fh.write(json.dumps(manifest, indent=2) + "\n")

    print(f"\n✓ wrote {len(sections)} clips + manifest. Now run:  npm run render-ad")


if __name__ == "__main__":
    main()
