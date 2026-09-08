// Fresh, professional attention-primer design system.
// Deep blue-black canvas, soft non-neon accents. State is carried by
// border/background color + one neutral shadow; motion is a pure function
// of the frame (see AGENTS.md): never Math.random()/Date.now().

export const AP_COLORS = {
  bg: "#0A0C14",
  bgLift: "#11141F",
  surface: "#151A27",
  surfaceRaised: "#1A2030",
  surfaceBorder: "rgba(255, 255, 255, 0.07)",
  surfaceBorderActive: "rgba(255, 255, 255, 0.22)",

  textPrimary: "#E9EEF7",
  textSecondary: "#9AA6BC",
  textMuted: "#5C6675",

  // Q, K, V semantics
  query: "#6D8BFF", // cool blue — "what am I looking for"
  queryBg: "rgba(109, 139, 255, 0.13)",
  queryBorder: "#5B78E6",

  key: "#3BD8B8", // teal — "when should someone find me relevant"
  keyBg: "rgba(59, 216, 184, 0.12)",
  keyBorder: "#2BBBA0",

  value: "#F6C15B", // warm amber — "what I provide if attended"
  valueBg: "rgba(246, 193, 91, 0.12)",
  valueBorder: "#F0B54A",

  // Accent / functional
  accent: "#9A7BFF", // soft violet — attention arcs / highlight
  accentBg: "rgba(154, 123, 255, 0.14)",
  accentBorder: "#8A6BEA",
  positive: "#3BD8B8",
  negative: "#F2606E", // rose — causal mask / blocked

  gridLine: "rgba(255, 255, 255, 0.06)",
  cardShadow: "0 14px 40px rgba(0, 0, 0, 0.5)",
  cardShadowSoft: "0 8px 24px rgba(0, 0, 0, 0.35)",
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
