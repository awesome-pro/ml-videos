// Fresh, professional attention-primer design system.
// Deep blue-black canvas, soft non-neon accents. State is carried by
// border/background color + one neutral shadow; motion is a pure function
// of the frame (see AGENTS.md): never Math.random()/Date.now().
//
// LEGIBILITY RULES (learned from the first render):
//  - This video gets watched small (a 1080p frame scaled to ~530px) and is
//    H.264-encoded, so thin light-on-dark strokes smear into the background
//    and read as "faded grey". Text is therefore near-white, at weight 600+,
//    with generous luminance separation from the canvas.
//  - Secondary/muted copy must stay genuinely readable, not decorative. The
//    old `textMuted` (#5C6675) was effectively invisible at small sizes.
//  - Borders and fills are strong enough that shapes still read after
//    downscaling and compression.

export const AP_COLORS = {
  // Pure black canvas. Content owns all the luminance in the frame: no glow,
  // no gradient, no colour cast competing with the text.
  bg: "#000000",
  /** Reserved for raised surfaces / subtle panel separation (not the canvas). */
  bgLift: "#0B0E16",
  surface: "#161B29",
  surfaceRaised: "#1D2436",
  surfaceBorder: "rgba(255, 255, 255, 0.12)",
  surfaceBorderActive: "rgba(255, 255, 255, 0.34)",

  textPrimary: "#F8FAFF",
  textSecondary: "#C9D2E4",
  textMuted: "#93A0B5",

  // Q, K, V semantics
  query: "#7E9AFF", // cool blue — "what am I looking for"
  queryBg: "rgba(126, 154, 255, 0.16)",
  queryBorder: "#6D8BF7",

  key: "#48E5C4", // teal — "when should someone find me relevant"
  keyBg: "rgba(72, 229, 196, 0.15)",
  keyBorder: "#39C9AC",

  value: "#FFCF74", // warm amber — "what I provide if attended"
  valueBg: "rgba(255, 207, 116, 0.15)",
  valueBorder: "#F5C05E",

  // Accent / functional
  accent: "#AC90FF", // soft violet — attention arcs / highlight
  accentBg: "rgba(172, 144, 255, 0.17)",
  accentBorder: "#9C7FF5",
  positive: "#48E5C4",
  negative: "#FF7C88", // rose — causal mask / blocked

  gridLine: "rgba(255, 255, 255, 0.10)",

  // Text shadows buy a little edge definition when the frame is scaled down
  // or sits over the background's soft glow.
  textShadow: "0 1px 3px rgba(0, 0, 0, 0.7)",
  textShadowStrong: "0 2px 10px rgba(0, 0, 0, 0.75)",
  cardShadow: "0 14px 40px rgba(0, 0, 0, 0.5)",
  cardShadowSoft: "0 8px 24px rgba(0, 0, 0, 0.35)",
} as const;

/**
 * Minimum body sizes. Anything smaller than this disappears at the size
 * people actually watch at.
 */
export const AP_TYPE = {
  captionMin: 20,
  bodyMin: 24,
  labelMin: 22,
} as const;

export const AP_FONTS = {
  sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, monospace",
} as const;

export const AP_MARGINS = {
  width: 1920,
  height: 1080,
  safeWidth: 1560,
  safeHeight: 780,
  centerX: 960,
  centerY: 540,
  inset: 180,
} as const;
