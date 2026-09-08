import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { AP_COLORS } from "./theme";

// Small shared, deterministic UI pieces used across scenes.

export const LeadLine: React.FC<{
  text: React.ReactNode;
  y: number;
  start: number;
  color?: string;
  size?: number;
}> = ({ text, y, start, color = AP_COLORS.textSecondary, size = 32 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - start, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: y,
        width: 1920,
        textAlign: "center",
        color,
        fontSize: size,
        fontWeight: 500,
        opacity,
        transform: `translateY(${8 - opacity * 8}px)`,
        lineHeight: 1.4,
        padding: "0 140px",
      }}
    >
      {text}
    </div>
  );
};

export const Tag: React.FC<{
  text: string;
  x: number;
  y: number;
  start: number;
  color: string;
  bg?: string;
  size?: number;
}> = ({ text, x, y, start, color, bg, size = 24 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - start, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(opacity, [0, 1], [0.8, 1]);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        padding: "8px 20px",
        borderRadius: 999,
        background: bg ?? `${color}22`,
        border: `1.5px solid ${color}`,
        color,
        fontSize: size,
        fontWeight: 700,
        opacity,
        fontFamily: "inherit",
        boxShadow: AP_COLORS.cardShadowSoft,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};
