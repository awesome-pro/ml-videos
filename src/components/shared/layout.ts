// Deterministic layout helpers (re-implemented fresh for the primer design).
// Every function is a pure function of its inputs so a given frame always
// renders identically (AGENTS.md rule).

import { AP_MARGINS } from "./theme";

export interface TokenLayout {
  /** Horizontal center of each token card, in 1920-wide canvas coords. */
  centers: number[];
  /** Estimated outer card width of each token card. */
  widths: number[];
  /** Left edge of the whole row (== 960 - totalWidth / 2). */
  startX: number;
  /** Total row width including gaps. */
  totalWidth: number;
  /** Font size actually used (auto-shrunk when the row would overflow). */
  fontSize: number;
  /** Gap between neighbouring cards. */
  gap: number;
}

const TOKEN_PAD_X = 40;
const GLYPH_ADVANCE = 0.6;
const WIDTH_SAFETY = 8;

export function estimateTokenWidth(word: string, fontSize: number): number {
  return Math.ceil(word.length * fontSize * GLYPH_ADVANCE + TOKEN_PAD_X + WIDTH_SAFETY);
}

export function cardHeightFor(fontSize: number): number {
  return Math.ceil(fontSize * 1.18 + 22);
}

export function layoutTokenRow(
  tokens: readonly string[] | string[],
  opts?: { fontSize?: number; gap?: number; maxWidth?: number; centerY?: number }
): TokenLayout {
  const gap = opts?.gap ?? 16;
  const maxWidth = opts?.maxWidth ?? AP_MARGINS.safeWidth;
  let fontSize = opts?.fontSize ?? 30;

  const fit = (fs: number): { widths: number[]; total: number } => {
    const widths = tokens.map((w) => estimateTokenWidth(w, fs));
    const total =
      widths.reduce((a, b) => a + b, 0) + gap * Math.max(0, tokens.length - 1);
    return { widths, total };
  };

  let { widths, total } = fit(fontSize);
  while (total > maxWidth && fontSize > 12) {
    fontSize -= 1;
    ({ widths, total } = fit(fontSize));
  }

  const startX = AP_MARGINS.centerX - total / 2;
  const centers: number[] = [];
  let cursor = startX;
  for (let i = 0; i < tokens.length; i++) {
    centers.push(cursor + widths[i] / 2);
    cursor += widths[i] + gap;
  }

  return { centers, widths, startX, totalWidth: total, fontSize, gap };
}
