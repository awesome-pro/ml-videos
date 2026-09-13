// Tiny deterministic colour helpers for the math kit.
//
// KaTeX gives us plain hex tokens from the theme, but frame-driven emphasis
// needs to *interpolate* between two colours (e.g. dim -> accent) and to make
// translucent glows. Both must be pure functions of their inputs so a frame
// renders identically every time (AGENTS.md).

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

type Rgb = [number, number, number];

function parseHex(value: string): Rgb | null {
  const match = HEX.exec(value.trim());
  if (!match) return null;
  let body = match[1];
  if (body.length === 3) {
    body = body.charAt(0) + body.charAt(0) + body.charAt(1) + body.charAt(1) + body.charAt(2) + body.charAt(2);
  }
  return [
    parseInt(body.slice(0, 2), 16),
    parseInt(body.slice(2, 4), 16),
    parseInt(body.slice(4, 6), 16),
  ];
}

function clampUnit(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/**
 * Linear blend between two hex colours. `t = 0` yields `a`, `t = 1` yields
 * `b`. Non-hex inputs (e.g. `rgba(...)`) fall back to a hard switch so the
 * function never throws inside a render.
 */
export function mixHex(a: string, b: string, t: number): string {
  const from = parseHex(a);
  const to = parseHex(b);
  if (!from || !to) return clampUnit(t) < 0.5 ? a : b;
  const k = clampUnit(t);
  return `rgb(${Math.round(from[0] + (to[0] - from[0]) * k)}, ${Math.round(
    from[1] + (to[1] - from[1]) * k
  )}, ${Math.round(from[2] + (to[2] - from[2]) * k)})`;
}

/** Hex -> `rgba()` with the given alpha. Non-hex input is returned unchanged. */
export function withAlpha(color: string, alpha: number): string {
  const rgb = parseHex(color);
  if (!rgb) return color;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${clampUnit(alpha).toFixed(3)})`;
}
