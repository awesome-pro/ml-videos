import React from "react";
import { useCurrentFrame } from "remotion";
import { AP_COLORS, AP_TYPE, AP_WEIGHT, AP_FONTS } from "../shared/theme";
import { ramp, TIMING } from "../math";
import { MIL_PAD } from "./theme";

/**
 * A row of token cells with their ids underneath — the single visual
 * vocabulary of this whole video. Tokens are laid out on a **uniform grid**
 * rather than sized to their text, because that is what makes left-padding
 * legible: with a fixed column width, a padded row visibly ends in the same
 * column as every other row.
 *
 * `padCount` draws that many pad cells to the LEFT and pushes the real tokens
 * right, which is exactly what `padding_side="left"` does.
 */

export type TokenTone = "normal" | "special" | "pad" | "new" | "dim";

const TONE: Record<TokenTone, { color: string; bg: string; border: string; dashed?: boolean }> = {
  normal: {
    color: AP_COLORS.textPrimary,
    bg: AP_COLORS.surfaceRaised,
    border: AP_COLORS.surfaceBorder,
  },
  special: {
    color: AP_COLORS.accent,
    bg: AP_COLORS.accentBg,
    border: AP_COLORS.accentBorder,
  },
  new: {
    color: AP_COLORS.key,
    bg: AP_COLORS.keyBg,
    border: AP_COLORS.keyBorder,
  },
  pad: {
    color: MIL_PAD,
    bg: "rgba(255, 163, 171, 0.10)",
    border: "rgba(255, 163, 171, 0.45)",
    dashed: true,
  },
  dim: {
    color: AP_COLORS.textMuted,
    bg: "transparent",
    border: "rgba(255, 255, 255, 0.12)",
  },
};

export type RowToken = { text: string; id?: number; tone?: TokenTone };

export type TokenRowProps = {
  tokens: RowToken[];
  /** Left edge of the first cell. */
  x: number;
  /** Vertical CENTRE of the cells. */
  y: number;
  cellW?: number;
  cellH?: number;
  gap?: number;
  fontSize?: number;
  showIds?: boolean;
  start?: number;
  stagger?: number;
  /** Pad cells drawn to the LEFT of the real tokens. */
  padCount?: number;
  /**
   * Animated version of `padCount`, in fractional cells. Lets the real tokens
   * *slide* right as padding is applied instead of jumping to their new column.
   * Defaults to `padCount`.
   */
  padShift?: number;
  padStart?: number;
  /** Text inside each pad cell. */
  padLabel?: string;
  /** Id printed under each pad cell. */
  padId?: number;
};

export function tokenRowWidth(columns: number, cellW: number, gap: number): number {
  return columns * cellW + Math.max(0, columns - 1) * gap;
}

export const TokenRow: React.FC<TokenRowProps> = ({
  tokens,
  x,
  y,
  cellW = 140,
  cellH = 58,
  gap = 10,
  fontSize = 28,
  showIds = true,
  start = 0,
  stagger = 5,
  padCount = 0,
  padShift,
  padStart = 0,
  padLabel = "pad",
  padId,
}) => {
  const frame = useCurrentFrame();
  const columns = padCount + tokens.length;

  const cells: React.ReactNode[] = [];

  for (let c = 0; c < columns; c++) {
    const token: RowToken | null = c < padCount ? null : tokens[c - padCount];
    const isPad = token === null;
    const tone: TokenTone = token === null ? "pad" : token.tone ?? "normal";
    const style = TONE[tone];

    const delay = isPad ? padStart + c * 3 : start + (c - padCount) * stagger;
    const appear = ramp(frame, delay, delay + TIMING.fast);
    // Real tokens ride the animated shift; pad cells stay in their own column.
    const col = token === null ? c : (padShift ?? padCount) + (c - padCount);
    const left = x + col * (cellW + gap);

    cells.push(
      <div
        key={`c${c}`}
        style={{
          position: "absolute",
          left,
          top: y - cellH / 2,
          width: cellW,
          height: cellH,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 12,
          background: style.bg,
          border: `1.5px ${style.dashed ? "dashed" : "solid"} ${style.border}`,
          color: style.color,
          fontFamily: AP_FONTS.sans,
          fontWeight: AP_WEIGHT.label,
          fontSize,
          letterSpacing: "-0.01em",
          opacity: appear * (tone === "dim" ? 0.55 : 1),
          transform: `translateY(${(1 - appear) * 10}px)`,
          overflow: "hidden",
          whiteSpace: "nowrap",
          textShadow: AP_COLORS.textShadow,
          userSelect: "none",
        }}
      >
        {token === null ? padLabel : token.text}
      </div>
    );

    if (showIds) {
      const id = token === null ? padId : token.id;
      if (id !== undefined) {
        cells.push(
          <div
            key={`i${c}`}
            style={{
              position: "absolute",
              left,
              top: y + cellH / 2 + 8,
              width: cellW,
              textAlign: "center",
              color: isPad ? MIL_PAD : AP_COLORS.textSecondary,
              fontFamily: AP_FONTS.mono,
              fontSize: AP_TYPE.labelMin,
              fontWeight: AP_WEIGHT.label,
              opacity: appear * (tone === "dim" ? 0.55 : 1),
              whiteSpace: "nowrap",
            }}
          >
            {id}
          </div>
        );
      }
    }
  }

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, pointerEvents: "none" }}>
      {cells}
    </div>
  );
};
