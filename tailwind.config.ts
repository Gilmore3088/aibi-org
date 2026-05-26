import type { Config } from "tailwindcss";

/**
 * AiBI Tailwind theme — bound to design tokens.
 *
 * Components read brand utility classes (`bg-terra`, `text-ink`, `font-serif`,
 * `rounded-sharp`) instead of arbitrary hex values. Tokens defined in
 * src/styles/tokens.css; intent contract in
 * docs/superpowers/design-system/03-tokens.md.
 *
 * Tailwind defaults that don't map to brand tokens are intentionally NOT
 * extended. `bg-blue-500` won't compile to a styled element. This is
 * enforcement: the token system is the only system.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // content/ MDX files contain narrative copy only — no className
    // attributes. The components they import (EditorialQuote, Marginalia,
    // etc) already get scanned via src/components/**. Including content/
    // here added thousands of MDX lines to the JIT scan with zero new
    // utility classes discovered. Removed 2026-05-17 (E.8.2).
  ],
  theme: {
    extend: {
      colors: {
        // Ledger refresh (2026-05-09) — additive layer alongside legacy
        // Terra/Sage/Cobalt. New work uses these; existing surfaces
        // migrate incrementally. Tokens live in src/styles/tokens-ledger.css.
        // See #197 + DECISIONS.md.
        "ledger-bg":           "var(--ledger-bg)",
        "ledger-paper":        "var(--ledger-paper)",
        "ledger-parch":        "var(--ledger-parch)",
        "ledger-tape":         "var(--ledger-tape)",
        "ledger-ink":          "var(--ledger-ink)",
        "ledger-ink-2":        "var(--ledger-ink-2)",
        "ledger-muted":        "var(--ledger-muted)",
        "ledger-soft":         "var(--ledger-soft)",
        "ledger-accent":       "var(--ledger-accent)",
        "ledger-accent-light": "var(--ledger-accent-light)",
        "ledger-accent-2":     "var(--ledger-accent-2)",
        "ledger-weak":         "var(--ledger-weak)",
        "ledger-rule":         "var(--ledger-rule)",
        "ledger-rule-strong":  "var(--ledger-rule-strong)",

        // 2026-05-26: Pillar palette (terra / sage / cobalt / amber)
        // RETIRED. Source code no longer references these utilities;
        // the aliases below stay as visual no-op fallbacks routed at
        // the mockup palette so any straggler in MDX / imported HTML
        // still renders correctly. Delete this block once external
        // content surfaces are fully migrated.
        terra: "var(--gold)",
        "terra-light": "var(--gold-2)",
        "terra-pale": "var(--cream-2)",
        sage: "var(--ink-2)",
        "sage-pale": "var(--cream-2)",
        cobalt: "var(--ink-2)",
        "cobalt-pale": "var(--cream-2)",
        amber: "var(--gold)",
        "amber-light": "var(--gold-2)",

        // Surfaces
        linen: "var(--color-linen)",
        parch: "var(--color-parch)",
        "parch-dark": "var(--color-parch-dark)",
        ink: "var(--color-ink)",

        // Text
        slate: "var(--color-slate)",
        dust: "var(--color-dust)",
        bone: "var(--color-bone)",
        cream: "var(--color-cream)",

        // Semantic
        error: "var(--color-error)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",

        // Dividers
        hairline: "var(--divider-hairline)",
      },

      fontFamily: {
        serif: ["var(--font-serif)"],
        "serif-sc": ["var(--font-serif-sc)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },

      fontSize: {
        // Token-named display + body sizes (override defaults so brand sizes win)
        "display-xl": ["var(--text-display-xl)", { lineHeight: "var(--leading-tight)", letterSpacing: "var(--tracking-tight)" }],
        "display-lg": ["var(--text-display-lg)", { lineHeight: "var(--leading-tight)", letterSpacing: "var(--tracking-tight)" }],
        "display-md": ["var(--text-display-md)", { lineHeight: "var(--leading-snug)",  letterSpacing: "var(--tracking-tight)" }],
        "display-sm": ["var(--text-display-sm)", { lineHeight: "var(--leading-snug)" }],
        "display-xs": ["var(--text-display-xs)", { lineHeight: "var(--leading-snug)" }],
        "body-lg":    ["var(--text-body-lg)",    { lineHeight: "var(--leading-relaxed)" }],
        "body-md":    ["var(--text-body-md)",    { lineHeight: "var(--leading-normal)" }],
        "body-sm":    ["var(--text-body-sm)",    { lineHeight: "var(--leading-normal)" }],
        "mono-md":    ["var(--text-mono-md)",    { lineHeight: "var(--leading-snug)" }],
        "mono-sm":    ["var(--text-mono-sm)",    { lineHeight: "var(--leading-snug)" }],
        "label-md":   ["var(--text-label-md)",   { lineHeight: "1", letterSpacing: "var(--tracking-widest)" }],
        "label-sm":   ["var(--text-label-sm)",   { lineHeight: "1", letterSpacing: "var(--tracking-widest)" }],
      },

      letterSpacing: {
        tightish: "var(--tracking-tight)",
        wide:     "var(--tracking-wide)",
        wider:    "var(--tracking-wider)",
        widest:   "var(--tracking-widest)",
      },

      lineHeight: {
        tight:    "var(--leading-tight)",
        snug:     "var(--leading-snug)",
        normal:   "var(--leading-normal)",
        relaxed:  "var(--leading-relaxed)",
      },

      spacing: {
        s1:  "var(--space-1)",
        s2:  "var(--space-2)",
        s3:  "var(--space-3)",
        s4:  "var(--space-4)",
        s5:  "var(--space-5)",
        s6:  "var(--space-6)",
        s7:  "var(--space-7)",
        s8:  "var(--space-8)",
        s9:  "var(--space-9)",
        s10: "var(--space-10)",
        s12: "var(--space-12)",
        s16: "var(--space-16)",
      },

      maxWidth: {
        narrow:   "var(--container-narrow)",
        default:  "var(--container-default)",
        wide:     "var(--container-wide)",
      },

      borderRadius: {
        none:     "var(--radius-none)",
        hairline: "var(--radius-hairline)",
        sharp:    "var(--radius-sharp)",
        full:     "var(--radius-circle)",
      },

      borderColor: {
        DEFAULT:  "var(--divider-hairline)",
        hairline: "var(--divider-hairline)",
        strong:   "var(--divider-strong)",
      },

      transitionDuration: {
        fast:    "var(--motion-fast)",
        medium:  "var(--motion-medium)",
        slow:    "var(--motion-slow)",
      },

      transitionTimingFunction: {
        DEFAULT: "var(--ease-default)",
        spring:  "var(--ease-spring)",
      },

      zIndex: {
        base:     "var(--z-base)",
        sticky:   "var(--z-sticky)",
        overlay:  "var(--z-overlay)",
        modal:    "var(--z-modal)",
        skip:     "var(--z-skip)",
      },

      // Shadows are deliberately none.
      boxShadow: {
        none: "none",
      },

      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in":    "fadeIn var(--motion-medium) var(--ease-default) both",
        "fade-in-up": "fadeInUp var(--motion-medium) var(--ease-default) both",
      },
    },
  },
  plugins: [],
};

export default config;
