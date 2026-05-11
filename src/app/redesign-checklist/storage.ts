// localStorage shape + helpers for the QA checklist.
//
// Storage key is versioned so we can migrate or reset without breaking
// existing browsers cleanly. v2 introduced notes + photos; v1 was
// checkboxes only.

export const STORAGE_KEY = 'aibi-redesign-checklist-v2';

export interface Photo {
  readonly id: string;       // unique within an item
  readonly dataUrl: string;  // base64 image
  readonly addedAt: number;  // epoch ms
  readonly name?: string;    // original filename if available
}

export interface ItemState {
  readonly checked?: boolean;
  readonly note?: string;
  readonly photos?: readonly Photo[];
}

export type StoreShape = Record<string, ItemState>;

export function loadStore(): StoreShape {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // One-time migration from v1 (checkboxes only)
      const v1 = window.localStorage.getItem('aibi-redesign-checklist-v1');
      if (v1) {
        const parsed = JSON.parse(v1) as Record<string, boolean>;
        const migrated: StoreShape = {};
        for (const [path, isChecked] of Object.entries(parsed)) {
          if (isChecked) migrated[path] = { checked: true };
        }
        return migrated;
      }
      return {};
    }
    return JSON.parse(raw) as StoreShape;
  } catch {
    return {};
  }
}

export function saveStore(store: StoreShape): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    // Most likely QuotaExceededError — let the caller handle it.
    throw err;
  }
}

export function clearStore(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

// Downscale an image File to a max width via canvas. Returns a base64
// data URL. Keeps screenshots from each chewing up megabytes.
export async function fileToCompressedDataUrl(
  file: File,
  maxWidth = 1600,
  quality = 0.85,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, maxWidth / bitmap.width);
  const w = Math.round(bitmap.width * ratio);
  const h = Math.round(bitmap.height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas-2d-unavailable');
  ctx.drawImage(bitmap, 0, 0, w, h);

  // Always emit JPEG — much smaller than PNG for screenshots.
  return canvas.toDataURL('image/jpeg', quality);
}

export function makePhotoId(): string {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// Sum of dataUrl byte lengths across the store. Approximate but cheap;
// useful for showing the user how much localStorage they've eaten.
export function approximateBytes(store: StoreShape): number {
  let total = 0;
  for (const item of Object.values(store)) {
    if (item.photos) {
      for (const photo of item.photos) total += photo.dataUrl.length;
    }
    if (item.note) total += item.note.length;
  }
  return total;
}
