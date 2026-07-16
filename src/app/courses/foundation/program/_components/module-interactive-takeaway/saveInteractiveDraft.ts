import type { DraftPayload } from './types';

export function saveInteractiveDraft(payload: DraftPayload) {
  try {
    window.localStorage.setItem(`foundation-lab-draft-${payload.moduleId}`, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('foundation-lab-draft-updated', { detail: payload }));
  } catch {
    window.dispatchEvent(new CustomEvent('foundation-lab-draft-updated', { detail: payload }));
  }
}
