/**
 * PromptShot shared design tokens.
 *
 * Single source of truth that maps to CSS custom properties in theme.css.
 * Import `T` in every component instead of defining a local `const C = {}`.
 *
 * All values are CSS variable references so inline styles automatically
 * pick up changes made in theme.css — no component edits needed.
 */
export const T = {
  /** Deep forest black — page background */
  bg:        "var(--ps-background)",
  /** Card / panel surface */
  surface:   "var(--ps-surface)",
  /** Secondary surface — dividers, nested panels */
  surface2:  "var(--ps-surface-2)",
  /** Primary body text */
  primary:   "var(--ps-text-primary)",
  /** Muted / label text */
  secondary: "var(--ps-text-secondary)",
  /** Mint green accent */
  mint:      "var(--ps-mint)",
  /** Teal — eco / environmental elements ONLY */
  teal:      "var(--ps-teal)",
  /** Amber — scoring / game elements ONLY */
  amber:     "var(--ps-amber)",
  /** Error / destructive */
  red:       "var(--ps-red)",
  /** Standard border */
  border:    "var(--ps-border)",
  /** Subtle divider / nested surface */
  divider:   "var(--ps-border-subtle)",
  /** UI font — Space Grotesk */
  font:      "var(--ps-font-ui)",
  /** Monospace font — JetBrains Mono */
  mono:      "var(--ps-font-mono)",
} as const;

export type DesignTokenKey = keyof typeof T;
