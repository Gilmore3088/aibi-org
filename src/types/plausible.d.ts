// Plausible analytics — deferred queue pattern per CLAUDE.md.
// Never call window.plausible() directly before this declaration is in scope.

interface PlausibleEventProps {
  readonly [key: string]: string | number | boolean;
}

interface PlausibleFunction {
  (eventName: string, options?: { props?: PlausibleEventProps }): void;
  q?: unknown[];
}

declare global {
  interface Window {
    plausible?: PlausibleFunction;
  }
}

export {};
