// aibi brand tokens, mirrored from src/styles/tokens-mockup.css in the main app.
// Keeping a copy here (rather than importing) keeps this studio fully standalone.
export const brand = {
  ink: "#071A2F", // primary navy
  ink2: "#0B2745", // lighter navy (gradients, cards)
  gold: "#C8A24A", // primary accent
  goldSoft: "#E6D39B", // on-dark accent text
  goldDeep: "#9A7A2F",
  cream: "#F7F3EA", // light background / on-dark body text
  cream2: "#EFE7D7",
  // Score bands get their own colors so the bars read at a glance.
  red: "#C0563B",
  amber: "#C8A24A",
  green: "#3E8E6E",
} as const;

// Web-safe font stacks so renders never depend on a network font fetch.
// To upgrade later: `npm i @remotion/google-fonts` and load Fraunces + Inter.
export const fonts = {
  // Display serif — matches the app's editorial "font-serif" feel.
  serif: 'Georgia, "Times New Roman", serif',
  // UI sans.
  sans: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
} as const;
