import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { AP_COLORS, AP_FONTS } from "./theme";

export type ScoreGridProps = {
  rows: number;
  cols: number;
  /** 0..1 normalized intensities, indexed [row][col]. */
  values: number[][];
  /** Optional mask: true → rendered as "blocked" (rose). */
  masked?: boolean[][];
  rowLabels?: string[];
  colLabels?: string[];
  x?: number;
  y?: number;
  cell?: number;
  gap?: number;
  color?: string;
  maskColor?: string;
  appearDelay?: number;
  showLabels?: boolean;
  labelColor?: string;
  /** Print the actual numeric value inside each cell (2 decimals by default). */
  showValues?: boolean;
  /** Formatter for the printed value. */
  valueFormat?: (v: number) => string;
};

export const ScoreGrid: React.FC<ScoreGridProps> = ({
  rows,
  cols,
  values,
  masked,
  rowLabels = [],
  colLabels = [],
  x = 0,
  y = 0,
  cell = 62,
  gap = 6,
  color = AP_COLORS.accent,
  maskColor = AP_COLORS.negative,
  appearDelay = 0,
  showLabels = true,
  labelColor = AP_COLORS.textSecondary,
  showValues = false,
  valueFormat,
}) => {
  const frame = useCurrentFrame();

  const cells: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isMasked = masked?.[r]?.[c] ?? false;
      const v = values[r]?.[c] ?? 0;
      const idx = r * cols + c;
      const appear = interpolate(frame - appearDelay - idx * 2, [0, 12], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const cx = x + c * (cell + gap);
      const cy = y + r * (cell + gap);
      const fill = isMasked
        ? maskColor
        : color;
      const bgOpacity = isMasked ? 0.28 : 0.12 + v * 0.64;

      cells.push(
        <div
          key={`${r}-${c}`}
          style={{
            position: "absolute",
            left: cx,
            top: cy,
            width: cell,
            height: cell,
            borderRadius: 9,
            background: fill,
            opacity: bgOpacity * appear,
            border: `1.5px solid ${fill}`,
            boxShadow: isMasked ? "none" : `0 2px 10px rgba(0,0,0,0.25)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${interpolate(appear, [0, 1], [0.82, 1])})`,
            color: showValues ? AP_COLORS.textPrimary : fill,
            fontFamily: AP_FONTS.mono,
            fontSize: Math.max(16, Math.round(cell * 0.34)),
            fontWeight: 700,
            textShadow: showValues ? "0 1px 3px rgba(0,0,0,0.6)" : "none",
          }}
        >
          {isMasked
            ? showValues
              ? "−∞"
              : "✕"
            : showValues
            ? valueFormat
              ? valueFormat(v)
              : v.toFixed(2)
            : null}
        </div>
      );
    }
  }

  const labelNodes: React.ReactNode[] = [];
  if (showLabels) {
    colLabels.forEach((lab, c) => {
      const cx = x + c * (cell + gap) + cell / 2;
      labelNodes.push(
        <div
          key={`cl-${c}`}
          style={{
            position: "absolute",
            left: cx,
            top: y - 46,
            transform: "translateX(-50%)",
            color: labelColor,
            fontFamily: AP_FONTS.sans,
            fontSize: 20,
            fontWeight: 600,
          }}
        >
          {lab}
        </div>
      );
    });
    rowLabels.forEach((lab, r) => {
      const cy = y + r * (cell + gap) + cell / 2;
      labelNodes.push(
        <div
          key={`rl-${r}`}
          style={{
            position: "absolute",
            left: x - 16,
            top: cy,
            transform: "translate(-100%, -50%)",
            color: labelColor,
            fontFamily: AP_FONTS.sans,
            fontSize: 20,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {lab}
        </div>
      );
    });
  }

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, pointerEvents: "none" }}>
      {cells}
      {labelNodes}
    </div>
  );
};
