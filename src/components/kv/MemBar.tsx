import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { AP_COLORS, AP_FONTS } from "../shared/theme";

export type MemBarProps = {
  /** Left edge of the track. */
  x: number;
  /** Top edge of the track. */
  y: number;
  width: number;
  height: number;
  /** 0..1 fill fraction. */
  fill: number;
  color: string;
  appearDelay?: number;
  /** Optional label rendered above the bar. */
  label?: string;
  /** Filled color. Defaults to color softened. */
  fillColor?: string;
};

export const MemBar: React.FC<MemBarProps> = ({
  x,
  y,
  width,
  height,
  fill,
  color,
  appearDelay = 0,
  label,
  fillColor,
}) => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame - appearDelay, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame - appearDelay, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fw = width * Math.max(0, Math.min(1, fill)) * enter;

  return (
    <div style={{ position: "absolute", left: x, top: y, width, opacity }}>
      {label ? (
        <div style={{ marginBottom: 8, color: AP_COLORS.textSecondary, fontSize: 15, fontWeight: 600, fontFamily: AP_FONTS.sans }}>
          {label}
        </div>
      ) : null}
      <div
        style={{
          width,
          height,
          borderRadius: 999,
          background: "rgba(255,255,255,0.05)",
          border: `1px solid ${color}`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: fw,
            height,
            borderRadius: 999,
            background: fillColor ?? `${color}${Math.round(0.5 * 255).toString(16)}`,
            boxShadow: `0 0 16px ${color}55`,
          }}
        />
      </div>
    </div>
  );
};
