import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AP_COLORS, AP_FONTS } from "../shared/theme";

export type KvSlotState = "cached" | "new" | "recompute" | "empty" | "dimmed";

export type KvSlotProps = {
  /** 1-based token index — shown as K_i / V_i and in the index badge. */
  index: number;
  x: number;
  y: number;
  /** Overall slot width (both halves combined). */
  width?: number;
  height?: number;
  state?: KvSlotState;
  appearDelay?: number;
  /** Frames at which this slot flashes as "recomputed" (rose wash) — can repeat. */
  recomputeStarts?: (number | null)[];
  /** Frame at which this slot was freshly added (bright accent pulse). */
  newStart?: number | null;
  /** Suppress the K/V color fill (used in dimmed / empty states). */
  filled?: boolean;
  radius?: number;
};

export const KvSlot: React.FC<KvSlotProps> = ({
  index,
  x,
  y,
  width = 150,
  height = 62,
  state = "cached",
  appearDelay = 0,
  recomputeStarts = [],
  newStart = null,
  filled = true,
  radius = 14,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - appearDelay,
    fps,
    config: { mass: 0.7, damping: 16, stiffness: 110 },
  });
  const scale = interpolate(entrance, [0, 1], [0.86, 1]);
  const opacity = interpolate(frame - appearDelay, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lift = interpolate(entrance, [0, 1], [20, 0]);

  const dimmed = state === "dimmed";
  const empty = state === "empty";

  // Recompute flash: a rose wash + a "↻" tag. Accepts multiple windows so a
  // slot can be "recomputed" again and again (the crux of the naive scene).
  let recomputeGlow = "0 0 0 rgba(0,0,0,0)";
  let recomputeOpacity = 0;
  for (const s of recomputeStarts ?? []) {
    if (s === null || s < 0) continue;
    const phase = frame - s;
    if (phase >= 0) {
      const pulse = 0.5 + 0.5 * Math.sin((phase / 12) * Math.PI * 2);
      const o = interpolate(phase, [0, 30], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      if (o > recomputeOpacity) {
        recomputeOpacity = o;
        recomputeGlow = `0 0 ${Math.round(16 + pulse * 22)}px rgba(242, 96, 110, ${0.28 * o})`;
      }
    }
  }

  // "New" accent pulse to draw the eye to a freshly appended slot.
  let newGlow = "0 0 0 rgba(0,0,0,0)";
  let newOpacity = 0;
  if (newStart !== null && newStart >= 0) {
    const phase = frame - newStart;
    if (phase >= 0) {
      const pulse = 0.5 + 0.5 * Math.sin((phase / 18) * Math.PI * 2);
      newOpacity = interpolate(phase, [0, 40], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      newGlow = `0 0 ${Math.round(14 + pulse * 20)}px rgba(154, 123, 255, ${0.3 * newOpacity})`;
    }
  }

  const borderColor = empty
    ? "rgba(255,255,255,0.18)"
    : dimmed
      ? "rgba(255,255,255,0.08)"
      : state === "recompute"
        ? AP_COLORS.negative
        : AP_COLORS.surfaceBorder;

  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y - height / 2,
        width,
        height,
        transform: `translateY(${lift}px) scale(${scale})`,
        opacity: opacity * (dimmed ? 0.4 : 1),
        zIndex: 4,
      }}
    >
      {/* Rounded, clipped body containing the K/V halves */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          overflow: "hidden",
          background: empty ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.02)",
          border: `${empty ? 1.5 : 1.5}px dashed ${empty ? "rgba(255,255,255,0.18)" : borderColor}`,
          boxShadow: `${AP_COLORS.cardShadowSoft}, ${recomputeGlow}, ${newGlow}`,
          display: "flex",
        }}
      >
        <SlotHalf color={AP_COLORS.key} bg={AP_COLORS.keyBg} label={`K${index}`} filled={filled} />
        <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
        <SlotHalf color={AP_COLORS.value} bg={AP_COLORS.valueBg} label={`V${index}`} filled={filled} />
      </div>

      {/* Recompute tag — floats above the slot so it never covers the K/V labels */}
      {recomputeOpacity > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: -18,
            display: "flex",
            justifyContent: "center",
            opacity: recomputeOpacity,
          }}
        >
          <span
            style={{
              fontFamily: AP_FONTS.sans,
              fontSize: 22,
              fontWeight: 800,
              color: AP_COLORS.negative,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              background: "rgba(20,6,10,0.92)",
              border: `1px solid ${AP_COLORS.negative}`,
              padding: "3px 10px",
              borderRadius: 999,
              whiteSpace: "nowrap",
            }}
          >
            ↻ recompute
          </span>
        </div>
      ) : null}
    </div>
  );
};

const SlotHalf: React.FC<{
  color: string;
  bg: string;
  label: string;
  filled: boolean;
}> = ({ color, bg, label, filled }) => {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: filled ? bg : "transparent",
        borderRight: "transparent",
      }}
    >
      <span style={{ fontFamily: AP_FONTS.mono, fontSize: 26, fontWeight: 700, color, letterSpacing: "0.02em" }}>
        {label}
      </span>
    </div>
  );
};

/** Small label placed above/below a KvSlot. Kept separate for reuse. */
export const KvWordLabel: React.FC<{
  word: string;
  x: number;
  y: number;
  appearDelay?: number;
  color?: string;
  size?: number;
}> = ({ word, x, y, appearDelay = 0, color = AP_COLORS.textSecondary, size = 22 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - appearDelay, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translateX(-50%)",
        color,
        fontSize: size,
        fontWeight: 600,
        opacity,
        fontFamily: AP_FONTS.sans,
        whiteSpace: "nowrap",
      }}
    >
      {word}
    </div>
  );
};
