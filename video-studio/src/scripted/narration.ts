// Overlays generated voiceover onto a script: when a narration manifest is
// `enabled`, each section's on-screen length becomes the MEASURED length of its
// spoken clip, and the clip is attached. Shared by every script.
import { VideoScript } from "./types";

interface NarrationManifest {
  enabled: boolean;
  sections: Record<string, { seconds: number; audio: string }>;
}

export function applyNarration(
  script: VideoScript,
  manifest: NarrationManifest,
): VideoScript {
  if (!manifest.enabled) return script;
  const map = manifest.sections;
  return {
    ...script,
    sections: script.sections.map((s) =>
      map[s.id]
        ? { ...s, seconds: map[s.id].seconds, audio: map[s.id].audio }
        : s,
    ),
  };
}
