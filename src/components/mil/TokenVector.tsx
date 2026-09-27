import React from "react";
import { useCurrentFrame } from "remotion";
import { AP_COLORS, AP_WEIGHT, AP_FONTS } from "../shared/theme";
import { crossFade, enterStyle, ramp, TIMING } from "../math";
import { MIL_PAD } from "./theme";

/**
 * One row of vocabulary cells, and the thing the code scenes actually operate
 * on. Each cell is one entry of `new_logits`: its index, its token, and the
 * number the current code line has computed for it.
 *
 * The `slot` prop is a *visual* position, not an identity. That distinction is
 * the whole reason this widget can show `torch.sort`: the scene animates each
 * cell's slot and the row visibly re-orders, while every cell keeps its own
 * index in its header — so you can see that the fourth cell on screen is
 * vocabulary entry #3.
 */

export type VectorTone =
  /** Nothing has happened to it yet. */
  | "plain"
  /** Survived the filter. */
  | "keep"
  /** Cut by the filter. */
  | "drop"
  /** Its value is -inf: there is nothing left here. */
  | "dead";

const TONE: Record<VectorTone, { bg: string; border: string; color: string; dashed?: boolean }> = {
  plain: {
    bg: AP_COLORS.surfaceRaised,
    border: AP_COLORS.surfaceBorder,
    color: AP_COLORS.textPrimary,
  },
  keep: { bg: AP_COLORS.keyBg, border: AP_COLORS.keyBorder, color: AP_COLORS.key },
  drop: {
    bg: "rgba(255, 163, 171, 0.10)",
    border: "rgba(255, 163, 171, 0.45)",
    color: MIL_PAD,
  },
  dead: {
    bg: "transparent",
    border: "rgba(255, 255, 255, 0.10)",
    color: AP_COLORS.textMuted,
    dashed: true,
  },
};

/** One printed value, with the frame window it is on screen for. */
export type VectorValue = { text: string; from: number; until: number | null };

export type VectorCell = {
  /** Constant header, e.g. `#3  Paris`. */
  header: string;
  values: VectorValue[];
  tone?: VectorTone;
  /** 1-based rank badge in the corner; omit for none. */
  rank?: number;
  /**
   * 0 -> nothing, 1 -> a ring in the accent colour. Used for the one cell a
   * guard clause pins, so "this one is forced True" has somewhere to land.
   */
  ring?: number;
  /** Visual position — animate this to sort and un-sort the row. */
  slot: number;
  /** Frame the cell arrives. */
  at?: number;
  /** 0..1, multiplied into the entrance — lets a whole row fade out. */
  opacity?: number;
  /** Filled fraction of the bar under the value, 0..1 of the cell's width. */
  bar?: number;
  /**
   * The right-hand end of the bar, as a fraction, drawn in rose: the piece that
   * is about to be taken away. Lets a row show a subtraction on the bar itself
   * rather than only in the numbers.
   */
  barCut?: number;
  barColor?: string;
};

export type TokenVectorProps = {
  cells: VectorCell[];
  x: number;
  y: number;
  cellW?: number;
  cellH?: number;
  gap?: number;
  /** Header and value type sizes. Defaults suit a ~104px cell. */
  headerSize?: number;
  valueSize?: number;
};

/** Total width `TokenVector` occupies for `n` cells. */
export function tokenVectorWidth(n: number, cellW = 184, gap = 12): number {
  return n * cellW + Math.max(0, n - 1) * gap;
}

export const TokenVector: React.FC<TokenVectorProps> = ({
  cells,
  x,
  y,
  cellW = 184,
  cellH = 96,
  gap = 12,
  headerSize = 26,
  valueSize = 34,
}) => {
  const frame = useCurrentFrame();
  // Everything inside a cell is placed as a fraction of its height, so the same
  // widget reads as a compact strip or as the main event without a second set of
  // offsets to keep in step.
  const headerTop = Math.round(cellH * 0.14);
  const valueTop = Math.round(cellH * 0.4);
  // The bar, when there is one, owns the bottom eighth of the cell.
  const valueBottom = Math.round(cellH * 0.24);

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, pointerEvents: "none" }}>
      {cells.map((cell, i) => {
        const tone = TONE[cell.tone ?? "plain"];
        const appear = ramp(frame, cell.at ?? 0, (cell.at ?? 0) + TIMING.fast);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + cell.slot * (cellW + gap),
              top: y,
              width: cellW,
              height: cellH,
              boxSizing: "border-box",
              borderRadius: 14,
              background: tone.bg,
              border: `1.5px ${tone.dashed ? "dashed" : "solid"} ${tone.border}`,
              ...enterStyle(appear * (cell.opacity ?? 1), { rise: 10 }),
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: headerTop,
                width: "100%",
                textAlign: "center",
                fontFamily: AP_FONTS.mono,
                fontSize: headerSize,
                fontWeight: AP_WEIGHT.label,
                color: cell.tone === "keep" || cell.tone === "drop" ? tone.color : AP_COLORS.textSecondary,
                whiteSpace: "nowrap",
              }}
            >
              {cell.header}
            </div>

            {/* Values crossfade rather than cut, so a changing number reads as
                the same cell being recomputed. */}
            <div style={{ position: "absolute", left: 0, top: valueTop, bottom: valueBottom, width: "100%" }}>
              {cell.values.map((v, k) => {
                const f = crossFade(frame, v.from, v.until);
                return (
                  <div
                    key={k}
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: `translateY(${f.dy}px)`,
                      opacity: f.opacity,
                      fontFamily: AP_FONTS.mono,
                      fontSize: valueSize,
                      fontWeight: AP_WEIGHT.heading,
                      color: tone.color,
                      whiteSpace: "nowrap",
                      textShadow: AP_COLORS.textShadow,
                    }}
                  >
                    {v.text}
                  </div>
                );
              })}
            </div>

            {cell.bar !== undefined ? (
              <div
                style={{
                  position: "absolute",
                  left: 12,
                  right: 12,
                  bottom: 9,
                  height: 9,
                  borderRadius: 5,
                  background: "rgba(255, 255, 255, 0.05)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: `${Math.max(0, Math.min(1, cell.bar)) * 100}%`,
                    borderRadius: 5,
                    background: cell.barColor ?? AP_COLORS.accent,
                  }}
                />
                {cell.barCut ? (
                  <div
                    style={{
                      position: "absolute",
                      left: `${Math.max(0, Math.min(1, cell.bar - cell.barCut)) * 100}%`,
                      top: 0,
                      height: "100%",
                      width: `${Math.min(1, cell.barCut) * 100}%`,
                      borderRadius: 5,
                      background: MIL_PAD,
                    }}
                  />
                ) : null}
              </div>
            ) : null}

            {cell.ring ? (
              <div
                style={{
                  position: "absolute",
                  inset: -4,
                  borderRadius: 18,
                  border: `2px solid ${AP_COLORS.accent}`,
                  opacity: cell.ring,
                }}
              />
            ) : null}

            {cell.rank ? (
              <div
                style={{
                  position: "absolute",
                  right: -9,
                  top: -11,
                  minWidth: 26,
                  height: 26,
                  padding: "0 6px",
                  boxSizing: "border-box",
                  borderRadius: 999,
                  background: AP_COLORS.key,
                  color: AP_COLORS.bg,
                  fontFamily: AP_FONTS.mono,
                  fontSize: 19,
                  fontWeight: AP_WEIGHT.heading,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cell.rank}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
