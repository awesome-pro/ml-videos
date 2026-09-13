import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { AP_COLORS } from "./theme";

export type FlowArrowProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  appearDelay?: number;
  drawDuration?: number;
  thickness?: number;
};

// Straight animated arrow for pipeline diagrams. Draws in along the line,
// then pops a small arrowhead at the target end.
export const FlowArrow: React.FC<FlowArrowProps> = ({
  x1,
  y1,
  x2,
  y2,
  color = AP_COLORS.textSecondary,
  appearDelay = 0,
  drawDuration = 14,
  thickness = 4,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame - appearDelay, [0, drawDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - (1 - t) * (1 - t),
  });

  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const headSize = 11;
  const bx = x2 - ux * headSize;
  const by = y2 - uy * headSize;

  const opacity = interpolate(frame - appearDelay, [0, drawDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const arrowScale = Math.max(0, Math.min(1, progress * 4));

  return (
    <svg
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
    >
      <line
        x1={x1}
        y1={y1}
        x2={x1 + ux * len * progress}
        y2={y1 + uy * len * progress}
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        opacity={opacity}
      />
      <polygon
        points={`${x2},${y2} ${bx + px * headSize},${by + py * headSize} ${bx - px * headSize},${by - py * headSize}`}
        fill={color}
        opacity={opacity * arrowScale * 0.95}
      />
    </svg>
  );
};
