// Fresh, professional attention-primer design system.
// Deep black canvas, soft non-neon accents. State is carried by
// border/background color + one neutral shadow; motion is a pure function
// of the frame (see AGENTS.md): never Math.random()/Date.now().
//
// LEGIBILITY RULES (learned from real renders):
//  - This video is watched on phones, where a 1080p frame is ~530px or less,
//    and it is H.264-encoded. Thin light-on-dark strokes smear into the
//    background and read as "faded grey".
//  - Text colours are therefore as LIGHT as possible while staying
//    distinguishable from each other. A mid-tone accent reads as dim grey on
//    black; every accent below clears 9:1 contrast against `bg`.
//  - Sizes are large by default. `AP_TYPE` floors are minimums, not targets —
//    if copy does not fit, cut words rather than shrink type.

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

  textPrimary: "#F8FAFF", // 20.1:1
  textSecondary: "#D8E0EF", // 15.8:1
  textMuted: "#A6B2C6", // 9.8:1 — de-emphasis only, never for copy to be read

  // Q, K, V semantics — lightened so each clears 9:1 on black.
  query: "#A8BCFF", // 11.3:1 — cool blue, "what am I looking for"
  queryBg: "rgba(168, 188, 255, 0.16)",
  queryBorder: "#93AAFF",

  key: "#6FF0D4", // 15.1:1 — teal, "when should someone find me relevant"
  keyBg: "rgba(111, 240, 212, 0.15)",
  keyBorder: "#54E0C4",

  value: "#FFDFA3", // 16.3:1 — warm amber, "what I provide if attended"
  valueBg: "rgba(255, 223, 163, 0.15)",
  valueBorder: "#F5CE85",

  // Accent / functional
  accent: "#C6B4FF", // 11.4:1 — soft violet, attention arcs / highlight
  accentBg: "rgba(198, 180, 255, 0.17)",
  accentBorder: "#B49EF8",
  positive: "#6FF0D4",
  negative: "#FFA3AB", // 11.1:1 — rose, causal mask / blocked

  gridLine: "rgba(255, 255, 255, 0.12)",

  // Text shadows buy a little edge definition when the frame is scaled down.
  textShadow: "0 1px 3px rgba(0, 0, 0, 0.7)",
  textShadowStrong: "0 2px 10px rgba(0, 0, 0, 0.75)",
  cardShadow: "0 14px 40px rgba(0, 0, 0, 0.5)",
  cardShadowSoft: "0 8px 24px rgba(0, 0, 0, 0.35)",
} as const;

/**
 * The type scale. Sized for phones, not desktops: everything is deliberately
 * large. The `*Min` values are hard floors — nothing in the project may render
 * text smaller than these.
 */
export const AP_TYPE = {
  /** Statement headings on intro/closing cards. */
  display: 96,
  /** Scene titles. */
  title: 76,
  /** Eyebrow label above a title. */
  kicker: 30,
  /** Lead line beneath a title. */
  lead: 40,
  /** Explanatory body copy. */
  body: 32,
  /** Chips, tags, axis labels. */
  label: 26,

  // Hard floors.
  captionMin: 24,
  bodyMin: 30,
  labelMin: 24,
} as const;

/**
 * The weight scale.
 *
 * Nothing loads a webfont (see `AP_FONTS`), so these land on the *system*
 * stack — on macOS that is SF Pro, where 800 resolves to a genuinely Heavy
 * face. Setting almost every element to 700–800 made the frame read as
 * congested: there was no lighter text for the heavy text to register against,
 * so the eye got one undifferentiated slab of ink. Large sizes also carried
 * `-0.03em` tracking on top of that, which closed the counters further.
 *
 * Two passes lighter since: 800 -> 700 -> 600 at the top. At 76px a 600 is
 * already imposing, and the counters stay open when the frame is scaled to a
 * phone. Hierarchy comes from size and colour; weight only separates
 * "structure" from "prose". Use these tokens, never a raw number, so a future
 * change lands in every video at once.
 *
 * The floor is 400: nothing here goes thinner, because light-on-dark strokes
 * are what H.264 smears first (see the legibility notes above).
 */
export const AP_WEIGHT = {
  /** The scene title — still the heaviest thing on screen, now at 600. */
  title: 600,
  /** The eyebrow above a title, and card/panel/badge headings. */
  heading: 500,
  /** Chips, labels, axis labels, ids, numerals — anything that must stay crisp. */
  label: 500,
  /** Body copy, captions and explanatory notes. */
  body: 400,
} as const;

/** Tracking. Bigger type needs less negative tracking, not more. */
export const AP_TRACK = {
  /** 76–96px display lines. */
  display: "-0.012em",
  /** 36–48px headings. */
  heading: "-0.008em",
  /** 24–28px all-caps eyebrows. */
  kicker: "0.28em",
} as const;

export const AP_FONTS = {
  sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, monospace",
} as const;

export const AP_MARGINS = {
  width: 1920,
  height: 1080,
  safeWidth: 1680,
  safeHeight: 860,
  centerX: 960,
  centerY: 540,
  /**
   * Horizontal breathing room at the frame edge. Was 180, which spent a lot of
   * the 1920 on nothing; 112 still keeps copy clear of the overscan while
   * giving scenes ~140px more width to work with.
   */
  inset: 112,
  /**
   * The title band. Raised from 118/132/152 so the header costs less vertical
   * space and every scene gets that room back for its content.
   */
  headerTop: 86,
  /** Title top when a kicker sits above it (kicker glyphs end ~116). */
  titleWithKicker: 126,
  /** Title top when the scene has no kicker. */
  titleTop: 96,
  /**
   * Horizontal padding on the title. Was 140, which wrapped headlines that had
   * room to spare; 72 keeps two lines on screen without crowding the edge.
   */
  titlePad: 72,
} as const;
