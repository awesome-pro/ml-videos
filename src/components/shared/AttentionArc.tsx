import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { AP_COLORS } from "./theme";

export type AttentionArcProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** 0..1 attention weight — drives stroke width, opacity and arrowhead size. */
  weight: number;
  color?: string;
  /** Frame at which the arc starts to draw in. */
  appearDelay?: number;
  /** Number of frames the draw-in takes. */
  drawDuration?: number;
  /** Optional fixed apex lift; otherwise scaled by span. */
  apexLift?: number;
  /** Show a small arrowhead pointing at the target token. */
  arrowThreshold?: number;
};

export const AttentionArc: React.FC<AttentionArcProps> = ({
  x1,
  y1,
  x2,
  y2,
  weight,
  color = AP_COLORS.accent,
  appearDelay = 0,
  drawDuration = 16,
  apexLift,
  arrowThreshold = 0.04,
}) => {
  const frame = useCurrentFrame();

  // Quadratic bezier bowing upward above the chord.
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const lift = apexLift ?? Math.max(40, Math.min(150, dist * 0.26));
  const cx = mx;
  const cy = my - lift;

  const clampedWeight = Math.max(0, Math.min(1, weight));
  const progress = interpolate(frame - appearDelay, [0, drawDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - (1 - t) * (1 - t), // easeOutQuad
  });

  const opacity = interpolate(frame - appearDelay, [0, drawDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const strokeWidth = 2.2 + clampedWeight * 6.2;
  const dashOffset = 1 - progress;

  // Arrowhead triangle along the end tangent.
  const showArrow = clampedWeight > arrowThreshold;
  const tx = x2 - cx;
  const ty = y2 - cy;
  const tlen = Math.sqrt(tx * tx + ty * ty) || 1;
  const ux = tx / tlen;
  const uy = ty / tlen;
  const size = 7 + clampedWeight * 5;
  const bx = x2 - ux * size;
  const by = y2 - uy * size;
  const px = -uy;
  const py = ux;
  const arrowScale = clamp(progress * 4); // arrowhead pops in near the end

  return (
    <svg
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
    >
      <path
        d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray="1"
        pathLength={1}
        strokeDashoffset={dashOffset}
        opacity={opacity * (0.62 + clampedWeight * 0.38)}
      />
      {showArrow ? (
        <polygon
          points={`${x2},${y2} ${bx + px * size},${by + py * size} ${bx - px * size},${by - py * size}`}
          fill={color}
          opacity={opacity * arrowScale}
        />
      ) : null}
    </svg>
  );
};

function clamp(v: number): number {
  return Math.max(0, Math.min(1, v));
}
