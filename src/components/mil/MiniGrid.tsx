import React from "react";
import { useCurrentFrame } from "remotion";
import { AP_COLORS, AP_TYPE, AP_WEIGHT, AP_FONTS } from "../shared/theme";
import { ramp, TIMING } from "../math";
import { MIL_PAD } from "./theme";

/**
 * A small labelled grid — the workhorse for the padding, attention-mask,
 * position-id and decode-step visuals. Every cell is the same size, so the
 * shapes of "3 rows x 7 columns" are literally visible.
 *
 * Passing `null` for a cell leaves the slot empty (drawn as a faint outline),
 * which is how the pre-padding state is shown.
 */

export type GridTone =
  /** A real token. */
  | "real"
  /** Newly produced token. */
  | "new"
  /** Padding. */
  | "pad"
  /** Mask value 1 / position id. */
  | "one"
  /** Mask value 0. */
  | "zero"
  /** Not there yet. */
  | "ghost";

const TONE: Record<GridTone, { color: string; bg: string; border: string; dashed?: boolean }> = {
  real: {
    color: AP_COLORS.textPrimary,
    bg: AP_COLORS.surfaceRaised,
    border: AP_COLORS.surfaceBorder,
  },
  new: {
    color: AP_COLORS.key,
    bg: AP_COLORS.keyBg,
    border: AP_COLORS.keyBorder,
  },
  one: {
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
  zero: {
    color: MIL_PAD,
    bg: "rgba(255, 163, 171, 0.13)",
    border: "rgba(255, 163, 171, 0.5)",
  },
  ghost: {
    color: AP_COLORS.textMuted,
    bg: "transparent",
    border: "rgba(255, 255, 255, 0.10)",
    dashed: true,
  },
};

export type GridCell = { text: string; tone?: GridTone };

export type MiniGridProps = {
  /** Row-major cells. A `null` cell renders as an empty slot. */
  rows: (GridCell | null)[][];
  /** Top-left of the cell area. */
  x: number;
  y: number;
  cellW?: number;
  cellH?: number;
  gap?: number;
  fontSize?: number;
  rowLabels?: string[];
  colLabels?: string[];
  /** Frame the first cell enters; later cells stagger from it. */
  start?: number;
  /** Frames between cells, column-major so columns fill downward. */
  stagger?: number;
  labelSize?: number;
  /** Translucent band drawn behind one column, with a caption above it. */
  highlightCol?: number;
  highlightAt?: number;
  highlightLabel?: string;
  highlightColor?: string;
};

export const MiniGrid: React.FC<MiniGridProps> = ({
  rows,
  x,
  y,
  cellW = 96,
  cellH = 58,
  gap = 8,
  fontSize = 28,
  rowLabels,
  colLabels,
  start = 0,
  stagger = 3,
  labelSize = AP_TYPE.label,
  highlightCol,
  highlightAt = 0,
  highlightLabel,
  highlightColor = AP_COLORS.accent,
}) => {
  const frame = useCurrentFrame();
  const gridH = rows.length * cellH + Math.max(0, rows.length - 1) * gap;

  const band = highlightCol !== undefined && highlightCol >= 0 ? ramp(frame, highlightAt, highlightAt + TIMING.fast) : 0;

  const nodes: React.ReactNode[] = [];

  if (band > 0) {
    nodes.push(
      <div
        key="band"
        style={{
          position: "absolute",
          left: x + highlightCol! * (cellW + gap) - 7,
          top: y - 7,
          width: cellW + 14,
          height: gridH + 14,
          borderRadius: 16,
          background: highlightColor,
          opacity: 0.16 * band,
          border: `2px solid ${highlightColor}`,
        }}
      />
    );
    if (highlightLabel) {
      nodes.push(
        <div
          key="bandlabel"
          style={{
            position: "absolute",
            left: x + highlightCol! * (cellW + gap) + cellW / 2,
            top: y - 52,
            transform: "translateX(-50%)",
            color: highlightColor,
            fontFamily: AP_FONTS.sans,
            fontSize: labelSize,
            fontWeight: AP_WEIGHT.heading,
            opacity: band,
            whiteSpace: "nowrap",
            textShadow: AP_COLORS.textShadow,
          }}
        >
          {highlightLabel}
        </div>
      );
    }
  }

  rows.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (!cell) return;
      const tone = TONE[cell.tone ?? "real"];
      // Column-major stagger reads as "the batch fills up together".
      const delay = start + c * stagger * rows.length + r * stagger;
      const appear = ramp(frame, delay, delay + TIMING.fast);
      nodes.push(
        <div
          key={`c${r}-${c}`}
          style={{
            position: "absolute",
            left: x + c * (cellW + gap),
            top: y + r * (cellH + gap),
            width: cellW,
            height: cellH,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 11,
            background: tone.bg,
            border: `1.5px ${tone.dashed ? "dashed" : "solid"} ${tone.border}`,
            color: tone.color,
            fontFamily: AP_FONTS.mono,
            fontSize,
            fontWeight: AP_WEIGHT.label,
            opacity: appear,
            transform: `scale(${0.88 + 0.12 * appear})`,
            whiteSpace: "nowrap",
            textShadow: AP_COLORS.textShadow,
            userSelect: "none",
          }}
        >
          {cell.text}
        </div>
      );
    });
  });

  (colLabels ?? []).forEach((label, c) => {
    nodes.push(
      <div
        key={`cl${c}`}
        style={{
          position: "absolute",
          left: x + c * (cellW + gap) + cellW / 2,
          top: y - 44,
          transform: "translateX(-50%)",
          color: AP_COLORS.textSecondary,
          fontFamily: AP_FONTS.mono,
          fontSize: labelSize,
          fontWeight: AP_WEIGHT.label,
        }}
      >
        {label}
      </div>
    );
  });

  (rowLabels ?? []).forEach((label, r) => {
    nodes.push(
      <div
        key={`rl${r}`}
        style={{
          position: "absolute",
          left: x - 22,
          top: y + r * (cellH + gap) + cellH / 2,
          transform: "translate(-100%, -50%)",
          color: AP_COLORS.textSecondary,
          fontFamily: AP_FONTS.sans,
          fontSize: labelSize,
          fontWeight: AP_WEIGHT.label,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    );
  });

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, pointerEvents: "none" }}>
      {nodes}
    </div>
  );
};

export function gridWidth(cols: number, cellW: number, gap: number): number {
  return cols * cellW + Math.max(0, cols - 1) * gap;
}

export function gridHeight(rows: number, cellH: number, gap: number): number {
  return rows * cellH + Math.max(0, rows - 1) * gap;
}
