import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { AP_COLORS, AP_FONTS } from "./theme";

export type NumberVecProps = {
  /** The numbers to display (each becomes one cell). */
  values: number[];
  /** Fill color for the cells (brightness scales with |value|). */
  color: string;
  /** Top-left anchor in 1920x1080 canvas coords. */
  x: number;
  y: number;
  cellW?: number;
  cellH?: number;
  direction?: "row" | "column";
  gap?: number;
  appearDelay?: number;
  /** Frames between consecutive cells (stagger). */
  stagger?: number;
  /** Formatter for the numeric label inside each cell. */
  format?: (v: number) => string;
  /** Text color inside cells. */
  textColor?: string;
  radius?: number;
  /** Only fill opacity, no border. */
  noBorder?: boolean;
};

// Displays a set of numeric values as colored cells with the actual number
// printed inside — so the "brightness" semantics are paired with a real,
// readable value. Deterministic: a pure function of the frame.
export const NumberVec: React.FC<NumberVecProps> = ({
  values,
  color,
  x,
  y,
  cellW = 40,
  cellH = 30,
  direction = "row",
  gap = 6,
  appearDelay = 0,
  stagger = 3,
  format,
  textColor,
  radius = 6,
  noBorder = false,
}) => {
  const frame = useCurrentFrame();

  const cells: React.ReactNode[] = [];
  values.forEach((v, i) => {
    const t = frame - appearDelay - i * stagger;
    const appear = interpolate(t, [0, 10], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const mag = Math.max(0, Math.min(1, Math.abs(v)));
    const cx = direction === "row" ? x + i * (cellW + gap) : x;
    const cy = direction === "column" ? y + i * (cellH + gap) : y;
    cells.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          width: cellW,
          height: cellH,
          borderRadius: radius,
          background: color,
          opacity: appear * (0.26 + mag * 0.62),
          border: noBorder ? "none" : `1.5px solid ${color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: textColor ?? AP_COLORS.textPrimary,
          fontFamily: AP_FONTS.mono,
          fontSize: Math.max(15, Math.round(cellH * 0.52)),
          fontWeight: 700,
          letterSpacing: "-0.02em",
          textShadow: "0 1px 3px rgba(0,0,0,0.65)",
          transform: `scale(${interpolate(appear, [0, 1], [0.86, 1])})`,
          whiteSpace: "nowrap",
        }}
      >
        {format ? format(v) : v.toFixed(2)}
      </div>
    );
  });

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, pointerEvents: "none" }}>
      {cells}
    </div>
  );
};
