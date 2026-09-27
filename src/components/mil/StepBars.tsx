import React from "react";
import { useCurrentFrame } from "remotion";
import { AP_COLORS, AP_WEIGHT, AP_FONTS } from "../shared/theme";
import { enterStyle, ramp, TIMING } from "../math";
import { MIL_PAD } from "./theme";

/**
 * One bar per generation step — the picture the two KV scenes are built on.
 *
 * The columns are positions in the sequence, so column `j` is always position
 * `j + 1` and every bar starts at the same left edge. That alignment is the
 * whole point: bar 2 sits directly under bar 1, so the part of it that is
 * "stuff we already did" is visible as a *region*, not as a claim.
 *
 * `bar problem` and `bar fix` render the same rows with different tones, so the
 * two scenes cut together into a before/after that the eye can diff.
 *
 * Tones:
 *   `new`   — a position computed for the first time (teal).
 *   `again` — a position that was already computed, computed again (rose).
 *   `kept`  — a position already in the cache: read, not recomputed (ghost).
 */

export type BarTone = "new" | "again" | "kept";

const TONE: Record<
  BarTone,
  { text: string; bg: string; border: string; dashed?: boolean }
> = {
  new: {
    text: AP_COLORS.key,
    bg: AP_COLORS.keyBg,
    border: AP_COLORS.keyBorder,
  },
  again: {
    text: MIL_PAD,
    bg: "rgba(255, 163, 171, 0.12)",
    border: "rgba(255, 163, 171, 0.45)",
  },
  kept: {
    text: AP_COLORS.textSecondary,
    bg: "transparent",
    border: "rgba(255, 255, 255, 0.18)",
    dashed: true,
  },
};

export type StepBarCell = {
  text: string;
  tone: BarTone;
  /** Override the frame this cell enters; defaults to `row.at + j * row.step`. */
  at?: number;
};

export type StepBarRow = {
  /** Left-hand label, e.g. "step 2". */
  label: string;
  /** Right-aligned readout: how many positions this step computes. */
  note?: string;
  noteColor?: string;
  cells: StepBarCell[];
  /** Frame the row starts entering. */
  at: number;
  /** Frames between successive cells. `0` (the default) enters them together. */
  step?: number;
};

/**
 * One geometry for both scenes. Deliberately not configurable: the two scenes
 * are meant to be visually identical apart from their tones, and a still of one
 * should diff cleanly against a still of the other.
 */
export const STEP_BAR = {
  posW: 136,
  cellH: 58,
  gap: 8,
  pitch: 78,
  fontSize: 24,
  labelSize: 26,
} as const;

/** Width of `cols` columns, so callers can place braces without guessing. */
export function stepBarsWidth(cols: number): number {
  return cols * STEP_BAR.posW + Math.max(0, cols - 1) * STEP_BAR.gap;
}

export type StepBarsProps = {
  /** Left edge of column 0. */
  x: number;
  /** Vertical centre of row 0. */
  y: number;
  rows: StepBarRow[];
};

export const StepBars: React.FC<StepBarsProps> = ({ x, y, rows }) => {
  const frame = useCurrentFrame();
  const { posW, cellH, gap, pitch, fontSize, labelSize } = STEP_BAR;

  // The notes are readouts of a count, so they sit in one column at the right
  // of the longest bar rather than trailing each row's own end.
  const maxCols = rows.reduce((m, r) => Math.max(m, r.cells.length), 0);
  const noteX = x + stepBarsWidth(maxCols) + 34;

  const nodes: React.ReactNode[] = [];

  rows.forEach((row, i) => {
    const rowY = y + i * pitch;
    const step = row.step ?? 0;
    // The label and the note are anchored with their own transforms, so they
    // compose the entrance by hand rather than spreading `enterStyle` (which
    // would overwrite `transform` and lose the anchoring).
    const rowIn = ramp(frame, row.at, row.at + TIMING.fast);

    nodes.push(
      <div
        key={`label${i}`}
        style={{
          position: "absolute",
          left: x - 28,
          top: rowY,
          transform: `translate(-100%, -50%) translateY(${(1 - rowIn) * 8}px)`,
          opacity: rowIn,
          fontFamily: AP_FONTS.sans,
          fontSize: labelSize,
          fontWeight: AP_WEIGHT.label,
          color: AP_COLORS.textSecondary,
          whiteSpace: "nowrap",
          textShadow: AP_COLORS.textShadow,
        }}
      >
        {row.label}
      </div>
    );

    row.cells.forEach((cell, j) => {
      const tone = TONE[cell.tone];
      const at = cell.at ?? row.at + j * step;
      const appear = ramp(frame, at, at + TIMING.fast);
      nodes.push(
        <div
          key={`c${i}-${j}`}
          style={{
            position: "absolute",
            left: x + j * (posW + gap),
            top: rowY - cellH / 2,
            width: posW,
            height: cellH,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 11,
            background: tone.bg,
            border: `1.5px ${tone.dashed ? "dashed" : "solid"} ${tone.border}`,
            color: tone.text,
            fontFamily: AP_FONTS.sans,
            fontSize,
            fontWeight: AP_WEIGHT.label,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textShadow: AP_COLORS.textShadow,
            userSelect: "none",
            ...enterStyle(appear, { rise: 10, scaleFrom: 0.92 }),
          }}
        >
          {cell.text}
        </div>
      );
    });

    if (row.note) {
      const noteAt = row.at + step * Math.max(0, row.cells.length - 1) + 10;
      const noteIn = ramp(frame, noteAt, noteAt + TIMING.fast);
      nodes.push(
        <div
          key={`note${i}`}
          style={{
            position: "absolute",
            left: noteX,
            top: rowY,
            transform: `translateY(calc(-50% + ${(1 - noteIn) * 8}px))`,
            opacity: noteIn,
            fontFamily: AP_FONTS.mono,
            fontSize: labelSize,
            fontWeight: AP_WEIGHT.label,
            color: row.noteColor ?? AP_COLORS.textSecondary,
            whiteSpace: "nowrap",
            textShadow: AP_COLORS.textShadow,
          }}
        >
          {row.note}
        </div>
      );
    }
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1920,
        height: 1080,
        pointerEvents: "none",
      }}
    >
      {nodes}
    </div>
  );
};
